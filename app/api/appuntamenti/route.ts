/**
 * ============================================================================
 * API: GESTIONE APPUNTAMENTI
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - GET: Lista appuntamenti (filtrati per utente/barber)
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
import { verificaToken } from '@/utils/middleware/autenticazione';
import { calcolaOraFine } from '@/utils/helpers';
import bcrypt from 'bcryptjs';

/**
 * GET - Recupera appuntamenti
 * 
 * LOGICA:
 * - Se l'utente è 'barber': mostra tutti i suoi appuntamenti
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
    
    if (utente.ruolo === 'barber') {
      filtro.barber = utente.id;
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
    const appuntamenti = await Appuntamento.find(filtro)
      .populate('barber', 'nome cognome')
      .populate('servizio', 'nome durata prezzo categoria')
      .sort({ data: 1, oraInizio: 1 });  // Ordina per data e ora

    return NextResponse.json({
      successo: true,
      dati: appuntamenti,
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
 */
export async function POST(req: NextRequest) {
  try {
    const utenteLoggato = await verificaToken(req);
    await connessioneMongoDB();

    const body = await req.json();
    const { 
      barberId, 
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
    } = body;

    // ========================================================================
    // VALIDAZIONE BASE
    // ========================================================================
    if (!barberId || !servizioId || !data || !oraInizio) {
      return NextResponse.json(
        { successo: false, errore: 'barberId, servizioId, data e oraInizio sono obbligatori' },
        { status: 400 }
      );
    }

    // ========================================================================
    // GESTIONE CLIENTE
    // ========================================================================
    let idCliente;

    if (clienteId) {
      // Caso 1: Cliente esistente selezionato
      idCliente = clienteId;
    } else if (clienteNome && clienteCognome && clienteTelefono) {
      // Caso 2: Nuovo cliente da creare
      
      // Verifica se esiste già per telefono
      let clienteEsistente = await Utente.findOne({ telefono: clienteTelefono });
      
      if (clienteEsistente) {
        idCliente = clienteEsistente._id;
      } else {
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

    const sovrapposizioni = await Appuntamento.find({
      barber: barberId,
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
    });

    if (sovrapposizioni.length > 0) {
      return NextResponse.json(
        { successo: false, errore: 'Orario non disponibile. Scegli un altro slot.' },
        { status: 409 }
      );
    }

    // ========================================================================
    // CREA APPUNTAMENTO
    // ========================================================================
    
    // Recupera i dati del cliente per salvarli embedded
    const cliente = await Utente.findById(idCliente);
    if (!cliente) {
      return NextResponse.json(
        { successo: false, errore: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    const nuovoAppuntamento = await Appuntamento.create({
      utente: {
        nome: cliente.nome,
        cognome: cliente.cognome,
        telefono: cliente.telefono,
        email: cliente.email
      },
      barber: barberId,
      servizio: servizioId,
      data: dataAppuntamento,
      oraInizio,
      oraFine,
      note: note || '',
      stato: utenteLoggato.ruolo === 'barber' ? 'confermato' : 'in_attesa',
      // Campi sistema promemoria WhatsApp
      reminderSent: false
    });

    // Popola i dati per la risposta
    await nuovoAppuntamento.populate('barber', 'nome cognome');
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
