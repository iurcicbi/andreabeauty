/**
 * ============================================================================
 * API: GESTIONE APPUNTAMENTI
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - GET: Lista appuntamenti (filtrati per utente/specialist)
 * - POST: Crea nuovo appuntamento con validazioni complete
 * 
 * VALIDAZIONI AUTOMATICHE:
 * 1. Verifica che il servizio esista
 * 2. Calcola automaticamente ora fine in base alla durata
 * 3. Controlla sovrapposizioni con altri appuntamenti
 * 4. Verifica che la data sia nel futuro
 * 5. Salva automaticamente il cliente se non esiste
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';
import Servizio from '@/utils/mongo/schemi/Servizio';
import Utente from '@/utils/mongo/schemi/Utente';
import Specialist from '@/utils/mongo/schemi/Specialist';
import { verificaToken } from '@/utils/middleware/autenticazione';
import { calcolaOraFine } from '@/utils/helpers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Voucher from '@/utils/mongo/schemi/Voucher';
import Sede from '@/utils/mongo/schemi/Sede';

/**
 * GET - Recupera appuntamenti
 * 
 * LOGICA:
     * - Se l'utente è 'specialist': mostra tutti i suoi appuntamenti
 * - Se l'utente è 'utente': mostra solo i suoi appuntamenti
 * 
 * FILTRI DISPONIBILI:
 * - stato: filtra per stato (confermato, in_attesa, completato, cancellato)
 * - data: filtra per data specifica
 * - dal/al: filtra per range di date
 */
export async function GET(req: NextRequest) {
  try {
    const utente = await verificaToken(req);
    await connessioneMongoDB();

    // Costruisci il filtro in base al ruolo
    let filtro: any = {};

    console.log('📋 Token decoded - id:', utente.id, '| ruolo:', utente.ruolo, '| email:', utente.email);
    
    if (utente.ruolo === 'admin') {
      // Admin vede tutti gli appuntamenti senza filtri
      console.log('📋 Admin: loading all appointments');
    } else if (utente.ruolo === 'specialist' || utente.ruolo === 'barber') {
      let specialistId = utente.id;
      try {
        let specialist = await Specialist.findOne({ utente: utente.id });
        if (!specialist) {
          specialist = await Specialist.create({
            utente: utente.id,
            biografia: '',
            specializzazioni: [],
            telefono: '',
            attivo: true,
          });
          console.log('📋 Auto-created specialist profile:', specialist._id);
        }
        specialistId = specialist._id.toString();
      } catch (e) {
        console.log('📋 Error finding/creating specialist:', e);
      }
      filtro['$or'] = [
        { specialista: specialistId },
        { specialista: utente.id },
        { specialistOld: utente.id },
      ];
      console.log('📋 Appointment filter:', JSON.stringify(filtro));
    } else {
      // Per gli utenti normali, filtra per telefono (dato che ora utente è embedded)
      const utenteCompleto = await Utente.findById(utente.id);
      if (utenteCompleto) {
        filtro['utente.telefono'] = utenteCompleto.telefono;
      }
    }

    // Parametri query opzionali
    const { searchParams } = new URL(req.url);
    const stato = searchParams.get('stato');
    const data = searchParams.get('data');
    const dal = searchParams.get('dal');
    const al = searchParams.get('al');

    // Filtro per stato
    if (stato) {
      filtro.stato = stato;
    }

    // Filtro per data specifica
    if (data) {
      const dataInizio = new Date(data);
      dataInizio.setHours(0, 0, 0, 0);
      
      const dataFine = new Date(data);
      dataFine.setHours(23, 59, 59, 999);
      
      filtro.data = { $gte: dataInizio, $lte: dataFine };
    }

    // Filtro per range di date
    if (dal && al) {
      const dataInizio = new Date(dal);
      dataInizio.setHours(0, 0, 0, 0);
      
      const dataFine = new Date(al);
      dataFine.setHours(23, 59, 59, 999);
      
      filtro.data = { $gte: dataInizio, $lte: dataFine };
    }

    // Recupera appuntamenti con populate (join)
    void Sede;
    const appuntamenti = await Appuntamento.find(filtro)
      .populate({
        path: 'specialista',
        populate: { path: 'utente', select: 'nome cognome' }
      })
      .populate('servizio', 'nome durata prezzo categoria')
      .populate('sede', 'nome citta')
      .sort({ data: 1, oraInizio: 1 });

    const voucherCodes = [...new Set(appuntamenti.filter(a => a.voucherCode).map(a => a.voucherCode))] as string[];
    const vouchers = voucherCodes.length > 0
      ? await Voucher.find({ code: { $in: voucherCodes } }).lean()
      : [];
    const voucherMap = new Map(vouchers.map(v => [v.code, v]));

    const result = appuntamenti.map(a => {
      const obj: any = a.toObject();
      const v = a.voucherCode ? voucherMap.get(a.voucherCode) : null;
      if (v) {
        obj.voucher = { type: v.type, value: v.value };
        if (v.type === 'free') {
          obj.prezzoFinale = 0;
        } else if (v.type === 'fixed') {
          obj.prezzoFinale = Math.max(0, (a as any).servizio?.prezzo || 0) - v.value;
        } else if (v.type === 'percentage') {
          obj.prezzoFinale = Math.round((a as any).servizio?.prezzo * (100 - v.value) / 100 * 100) / 100;
        }
      }
      return obj;
    });

    console.log('📋 Appointments found:', result.length, 'with filter:', JSON.stringify(filtro));

    return NextResponse.json({
      successo: true,
      dati: result,
      totale: appuntamenti.length,
    });

  } catch (errore: any) {
    console.error('Errore recupero appuntamenti:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero degli appuntamenti' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crea un nuovo appuntamento
 * 
 * FLUSSO COMPLETO:
 * 1. Verifica autenticazione
 * 2. Gestisce cliente (esistente o nuovo)
 * 3. Verifica servizio
 * 4. Calcola ora fine automaticamente
 * 5. Controlla sovrapposizioni
 * 6. Crea appuntamento
 * 
 * GESTIONE CLIENTE AUTOMATICA:
 * - Se clienteId fornito: usa quello
 * - Se dati cliente forniti: crea nuovo cliente
 * - Se utente loggato: usa l'utente corrente
 * 
 * SUPPORTO SPECIALISTA:
 * - Accetta specialistaId (nuovo sistema) o barberId (retrocompatibilità)
 */
export async function POST(req: NextRequest) {
  try {
    const utenteLoggato = await verificaToken(req);
    await connessioneMongoDB();

    const body = await req.json();
    const { 
      barberId,          // Retrocompatibilità
      specialistaId,     // Nuovo sistema beauty salon
      servizioId, 
      data, 
      oraInizio, 
      note,
      // Dati cliente (opzionali)
      clienteId,
      clienteNome,
      clienteCognome,
      clienteEmail,
      clienteTelefono,
      voucherCode,
      sedeId,
      postazione,
    } = body;

    // ========================================================================
    // VALIDAZIONE BASE
    // ========================================================================
    const professionistaId = specialistaId || barberId;
    
    if (!professionistaId || !servizioId || !data || !oraInizio) {
      return NextResponse.json(
        { successo: false, errore: 'ID specialista, servizioId, data e oraInizio sono obbligatori' },
        { status: 400 }
      );
    }

    // ========================================================================
    // GESTIONE CLIENTE
    // ========================================================================
    let idCliente;
    let datiClientePerAppuntamento;

    console.log('🔍 Dati cliente ricevuti:', { clienteNome, clienteCognome, clienteTelefono, clienteEmail });

    if (clienteId) {
      // Caso 1: Cliente esistente selezionato
      idCliente = clienteId;
    } else if (clienteNome && clienteCognome && clienteTelefono) {
      // Caso 2: Nuovo cliente da creare o aggiornare
      
      // Verifica se esiste già per telefono
      let clienteEsistente = await Utente.findOne({ telefono: clienteTelefono });
      
      if (clienteEsistente) {
        console.log('📞 Cliente esistente trovato:', clienteEsistente.nome, clienteEsistente.cognome);
        
        // Aggiorna i dati del cliente esistente con quelli forniti
        clienteEsistente.nome = clienteNome;
        clienteEsistente.cognome = clienteCognome;
        if (clienteEmail) {
          clienteEsistente.email = clienteEmail;
        }
        await clienteEsistente.save();
        
        idCliente = clienteEsistente._id;
        
        // Usa i dati aggiornati per l'appuntamento
        datiClientePerAppuntamento = {
          nome: clienteNome,
          cognome: clienteCognome,
          telefono: clienteTelefono,
          email: clienteEmail || clienteEsistente.email
        };
      } else {
        console.log('👤 Creazione nuovo cliente');
        
        // Crea nuovo cliente
        const passwordTemp = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordTemp, salt);

        const nuovoCliente = await Utente.create({
          nome: clienteNome,
          cognome: clienteCognome,
          email: clienteEmail || `${clienteTelefono}@temp.com`,
          password: passwordHash,
          telefono: clienteTelefono,
          ruolo: 'utente',
          attivo: true,
        });

        idCliente = nuovoCliente._id;
        
        // Usa i dati del nuovo cliente per l'appuntamento
        datiClientePerAppuntamento = {
          nome: clienteNome,
          cognome: clienteCognome,
          telefono: clienteTelefono,
          email: clienteEmail || `${clienteTelefono}@temp.com`
        };
      }
    } else {
      // Caso 3: Utente loggato prenota per sé
      idCliente = utenteLoggato.id;
    }

    // ========================================================================
    // VERIFICA SERVIZIO
    // ========================================================================
    const servizio = await Servizio.findById(servizioId);
    
    if (!servizio) {
      return NextResponse.json(
        { successo: false, errore: 'Servizio non trovato' },
        { status: 404 }
      );
    }

    // ========================================================================
    // VERIFICA ASSOCIAZIONE SPECIALISTA-SERVIZIO (solo se specialistaId)
    // ========================================================================
    if (specialistaId) {
      const Specialist = (await import('@/utils/mongo/schemi/Specialist')).default;
      
      const specialista = await Specialist.findById(specialistaId);
      
      if (!specialista) {
        return NextResponse.json(
          { successo: false, errore: 'Specialista non trovato' },
          { status: 404 }
        );
      }
      
      // Verifica che il servizio sia nelle specializzazioni dello specialista
      const hasServizio = specialista.specializzazioni.some(
        (s: any) => s.toString() === servizioId
      );
      
      if (!hasServizio) {
        return NextResponse.json(
          { successo: false, errore: 'Lo specialista selezionato non può eseguire questo servizio' },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // CALCOLA ORA FINE AUTOMATICAMENTE
    // ========================================================================
    const oraFine = calcolaOraFine(oraInizio, servizio.durata);

    // ========================================================================
    // VERIFICA DATA NEL FUTURO
    // ========================================================================
    const dataAppuntamento = new Date(data);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    
    if (dataAppuntamento < oggi) {
      return NextResponse.json(
        { successo: false, errore: 'Non puoi prenotare un appuntamento nel passato' },
        { status: 400 }
      );
    }

    // ========================================================================
    // VERIFICA SOVRAPPOSIZIONI
    // ========================================================================
    const dataInizio = new Date(data);
    dataInizio.setHours(0, 0, 0, 0);
    
    const dataFineGiorno = new Date(data);
    dataFineGiorno.setHours(23, 59, 59, 999);

    // Costruisci filtro per sovrapposizioni (supporta specialista o barber legacy)
    const filtroSovrapposizioni: any = {
      data: { $gte: dataInizio, $lte: dataFineGiorno },
      stato: { $in: ['confermato', 'in_attesa'] },
      $or: [
        // Nuovo appuntamento inizia durante uno esistente
        { oraInizio: { $lte: oraInizio }, oraFine: { $gt: oraInizio } },
        // Nuovo appuntamento finisce durante uno esistente
        { oraInizio: { $lt: oraFine }, oraFine: { $gte: oraFine } },
        // Nuovo appuntamento contiene uno esistente
        { oraInizio: { $gte: oraInizio }, oraFine: { $lte: oraFine } },
      ],
    };

    // Aggiungi filtro per professionista (specialista)
    if (specialistaId) {
      filtroSovrapposizioni.specialista = specialistaId;
    } else {
      filtroSovrapposizioni.barber = barberId;
    }

    const sovrapposizioni = await Appuntamento.find(filtroSovrapposizioni);

    if (sovrapposizioni.length > 0) {
      return NextResponse.json(
        { successo: false, errore: 'Orario non disponibile. Scegli un altro slot.' },
        { status: 409 }
      );
    }

    // ========================================================================
    // CREA APPUNTAMENTO
    // ========================================================================
    
    // Se abbiamo già i dati del cliente preparati, usali, altrimenti recuperali dal database
    let datiCliente;
    if (datiClientePerAppuntamento) {
      datiCliente = datiClientePerAppuntamento;
      console.log('✅ Usando dati cliente preparati:', datiCliente);
    } else {
      // Recupera i dati del cliente dal database
      const cliente = await Utente.findById(idCliente);
      if (!cliente) {
        return NextResponse.json(
          { successo: false, errore: 'Cliente non trovato' },
          { status: 404 }
        );
      }
      datiCliente = {
        nome: cliente.nome,
        cognome: cliente.cognome,
        telefono: cliente.telefono,
        email: cliente.email
      };
      console.log('📋 Dati cliente dal database:', datiCliente);
    }

    // Prepara dati appuntamento
    const datiAppuntamento: any = {
      utente: datiCliente,
      servizio: servizioId,
      data: dataAppuntamento,
      oraInizio,
      oraFine,
      note: note || '',
      stato: (utenteLoggato.ruolo === 'specialist' || utenteLoggato.ruolo === 'barber') ? 'confermato' : 'in_attesa',
      // Campi sistema promemoria WhatsApp
      reminderSent: false,
      reviewToken: crypto.randomBytes(24).toString('hex'),
      reviewSent: false,
      voucherCode: voucherCode || undefined,
      sede: sedeId || undefined,
      postazione: postazione || undefined,
    };

    // Aggiungi campo specialista
    if (specialistaId) {
      datiAppuntamento.specialista = specialistaId;
    } else {
      datiAppuntamento.barber = barberId;
    }

    const nuovoAppuntamento = await Appuntamento.create(datiAppuntamento);

    // ========================================================================
    // GESTIONE VOUCHER
    // ========================================================================
    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
      if (voucher && voucher.status === 'active') {
        if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
          voucher.status = 'expired';
          await voucher.save();
        } else if (!voucher.appliesToAll && voucher.services.length > 0) {
          if (voucher.services.some(s => s.toString() === servizioId)) {
            voucher.status = 'used';
            voucher.usedAt = new Date();
            voucher.usedByAppointment = nuovoAppuntamento._id;
            await voucher.save();
          }
        } else {
          voucher.status = 'used';
          voucher.usedAt = new Date();
          voucher.usedByAppointment = nuovoAppuntamento._id;
          await voucher.save();
        }
      }
    }

    // Popola i dati per la risposta
    if (specialistaId) {
      const Specialist = (await import('@/utils/mongo/schemi/Specialist')).default;
      await nuovoAppuntamento.populate({
        path: 'specialista',
        populate: { path: 'utente', select: 'nome cognome' }
      });
    } else if (barberId) {
      await nuovoAppuntamento.populate('specialistOld', 'nome cognome');
    }
    await nuovoAppuntamento.populate('servizio', 'nome durata prezzo');

    return NextResponse.json({
      successo: true,
      messaggio: 'Appuntamento creato con successo',
      dati: nuovoAppuntamento,
    }, { status: 201 });

  } catch (errore: any) {
    console.error('Errore creazione appuntamento:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante la creazione dell\'appuntamento' },
      { status: 500 }
    );
  }
}
