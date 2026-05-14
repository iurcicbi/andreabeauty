/**
 * ============================================================================
 * API: GESTIONE SINGOLO APPUNTAMENTO
 * ============================================================================
 * 
 * GET /api/appuntamenti/[id] - Recupera dettagli appuntamento
 * PUT /api/appuntamenti/[id] - Aggiorna appuntamento completo
 * PATCH /api/appuntamenti/[id] - Aggiorna solo stato appuntamento
 * DELETE /api/appuntamenti/[id] - Cancella appuntamento
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';
import Servizio from '@/utils/mongo/schemi/Servizio';
import Utente from '@/utils/mongo/schemi/Utente';
import Barber from '@/utils/mongo/schemi/Barber';
import { verificaToken } from '@/utils/middleware/autenticazione';
import { calcolaOraFine } from '@/utils/helpers';

/**
 * GET - Recupera dettagli di un appuntamento specifico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const utente = await verificaToken(req);
    await connessioneMongoDB();

    const appuntamento = await Appuntamento.findById(params.id)
      .populate('utente', 'nome cognome email telefono')
      .populate('barber', 'nome cognome')
      .populate('servizio', 'nome durata prezzo categoria');

    if (!appuntamento) {
      return NextResponse.json(
        { successo: false, errore: 'Appuntamento non trovato' },
        { status: 404 }
      );
    }

    // Verifica permessi: solo il barber o l'utente proprietario possono vedere
    if (
      utente.ruolo !== 'barber' &&
      appuntamento.utente._id.toString() !== utente.id
    ) {
      return NextResponse.json(
        { successo: false, errore: 'Non hai i permessi per visualizzare questo appuntamento' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      successo: true,
      dati: appuntamento,
    });

  } catch (errore: any) {
    console.error('Errore recupero appuntamento:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero dell\'appuntamento' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Aggiorna appuntamento completo (servizio, data, ora, stato, note)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const utente = await verificaToken(req);
    await connessioneMongoDB();

    const body = await req.json();
    const { servizioId, data, oraInizio, stato, note } = body;

    // Trova l'appuntamento
    const appuntamento = await Appuntamento.findById(params.id);

    if (!appuntamento) {
      return NextResponse.json(
        { successo: false, errore: 'Appuntamento non trovato' },
        { status: 404 }
      );
    }

    // Verifica permessi: solo il barber può modificare completamente
    if (utente.ruolo !== 'barber') {
      return NextResponse.json(
        { successo: false, errore: 'Non hai i permessi per modificare questo appuntamento' },
        { status: 403 }
      );
    }

    // Variabili per il controllo sovrapposizioni
    let nuovaData = data ? new Date(data) : appuntamento.data;
    let nuovaOraInizio = oraInizio || appuntamento.oraInizio;
    let nuovaOraFine = appuntamento.oraFine;
    let durataServizio = 0;

    // Aggiorna servizio se fornito
    if (servizioId) {
      const servizio = await Servizio.findById(servizioId);
      if (!servizio) {
        return NextResponse.json(
          { successo: false, errore: 'Servizio non trovato' },
          { status: 404 }
        );
      }
      durataServizio = servizio.durata;
      appuntamento.servizio = servizioId;
      
      // Ricalcola ora fine se cambia servizio o ora inizio
      if (oraInizio) {
        appuntamento.oraInizio = oraInizio;
        nuovaOraFine = calcolaOraFine(oraInizio, servizio.durata);
        appuntamento.oraFine = nuovaOraFine;
      } else {
        nuovaOraFine = calcolaOraFine(appuntamento.oraInizio, servizio.durata);
        appuntamento.oraFine = nuovaOraFine;
      }
    } else if (oraInizio) {
      // Se cambia solo ora inizio, ricalcola con servizio esistente
      const servizio = await Servizio.findById(appuntamento.servizio);
      if (servizio) {
        durataServizio = servizio.durata;
        appuntamento.oraInizio = oraInizio;
        nuovaOraFine = calcolaOraFine(oraInizio, servizio.durata);
        appuntamento.oraFine = nuovaOraFine;
      }
    } else {
      // Nessun cambio di orario, usa quello esistente
      const servizio = await Servizio.findById(appuntamento.servizio);
      if (servizio) {
        durataServizio = servizio.durata;
      }
    }

    // Aggiorna data se fornita
    if (data) {
      appuntamento.data = new Date(data);
    }

    // ========================================================================
    // VERIFICA SOVRAPPOSIZIONI (solo se cambiano data o orario)
    // ========================================================================
    if (data || oraInizio || servizioId) {
      const dataInizio = new Date(nuovaData);
      dataInizio.setHours(0, 0, 0, 0);
      
      const dataFineGiorno = new Date(nuovaData);
      dataFineGiorno.setHours(23, 59, 59, 999);

      const sovrapposizioni = await Appuntamento.find({
        _id: { $ne: params.id },  // Escludi l'appuntamento corrente
        barber: appuntamento.barber,
        data: { $gte: dataInizio, $lte: dataFineGiorno },
        stato: { $in: ['confermato', 'in_attesa'] },
        $or: [
          // Nuovo appuntamento inizia durante uno esistente
          { oraInizio: { $lte: nuovaOraInizio }, oraFine: { $gt: nuovaOraInizio } },
          // Nuovo appuntamento finisce durante uno esistente
          { oraInizio: { $lt: nuovaOraFine }, oraFine: { $gte: nuovaOraFine } },
          // Nuovo appuntamento contiene uno esistente
          { oraInizio: { $gte: nuovaOraInizio }, oraFine: { $lte: nuovaOraFine } },
        ],
      });

      if (sovrapposizioni.length > 0) {
        return NextResponse.json(
          { 
            successo: false, 
            errore: 'Orario non disponibile. Esiste già un appuntamento in questo slot.' 
          },
          { status: 409 }
        );
      }
    }

    // Aggiorna stato se fornito
    if (stato) {
      appuntamento.stato = stato;
    }

    // Aggiorna note
    if (note !== undefined) {
      appuntamento.note = note;
    }

    await appuntamento.save();

    // Popola i dati per la risposta
    await appuntamento.populate('utente', 'nome cognome email telefono');
    await appuntamento.populate('barber', 'nome cognome');
    await appuntamento.populate('servizio', 'nome durata prezzo');

    return NextResponse.json({
      successo: true,
      messaggio: 'Appuntamento aggiornato con successo',
      dati: appuntamento,
    });

  } catch (errore: any) {
    console.error('Errore aggiornamento appuntamento:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'aggiornamento dell\'appuntamento' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Aggiorna lo stato di un appuntamento
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const utente = await verificaToken(req);
    await connessioneMongoDB();

    const { stato } = await req.json();

    if (!stato) {
      return NextResponse.json(
        { successo: false, errore: 'Lo stato è obbligatorio' },
        { status: 400 }
      );
    }

    // Trova l'appuntamento
    const appuntamento = await Appuntamento.findById(params.id);

    if (!appuntamento) {
      return NextResponse.json(
        { successo: false, errore: 'Appuntamento non trovato' },
        { status: 404 }
      );
    }

    // Verifica permessi: solo il barber o l'utente proprietario possono modificare
    if (
      utente.ruolo !== 'barber' &&
      appuntamento.utente.toString() !== utente.id
    ) {
      return NextResponse.json(
        { successo: false, errore: 'Non hai i permessi per modificare questo appuntamento' },
        { status: 403 }
      );
    }

    // Aggiorna lo stato
    appuntamento.stato = stato;
    await appuntamento.save();

    // Popola i dati per la risposta
    await appuntamento.populate('utente', 'nome cognome email telefono');
    await appuntamento.populate('barber', 'nome cognome');
    await appuntamento.populate('servizio', 'nome durata prezzo');

    return NextResponse.json(
      {
        successo: true,
        messaggio: 'Appuntamento aggiornato con successo',
        dati: appuntamento,
      },
      { status: 200 }
    );
  } catch (errore: any) {
    console.error('Errore aggiornamento appuntamento:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'aggiornamento dell\'appuntamento' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancella un appuntamento (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const utente = await verificaToken(req);
    await connessioneMongoDB();

    const appuntamento = await Appuntamento.findById(params.id);

    if (!appuntamento) {
      return NextResponse.json(
        { successo: false, errore: 'Appuntamento non trovato' },
        { status: 404 }
      );
    }

    // Verifica permessi
    if (
      utente.ruolo !== 'barber' &&
      appuntamento.utente.toString() !== utente.id
    ) {
      return NextResponse.json(
        { successo: false, errore: 'Non hai i permessi per cancellare questo appuntamento' },
        { status: 403 }
      );
    }

    // Soft delete: imposta stato a cancellato
    appuntamento.stato = 'cancellato';
    await appuntamento.save();

    return NextResponse.json(
      {
        successo: true,
        messaggio: 'Appuntamento cancellato con successo',
      },
      { status: 200 }
    );
  } catch (errore: any) {
    console.error('Errore cancellazione appuntamento:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante la cancellazione dell\'appuntamento' },
      { status: 500 }
    );
  }
}
