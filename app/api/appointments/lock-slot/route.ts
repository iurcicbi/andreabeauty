/**
 * ============================================================================
 * API: BLOCCO TEMPORANEO SLOT
 * ============================================================================
 * 
 * Gestisce il blocco temporaneo degli slot orari durante il processo
 * di prenotazione per prevenire doppie prenotazioni.
 * 
 * ENDPOINTS:
 * - POST: Blocca uno slot per 10 minuti
 * - DELETE: Rilascia un blocco (quando utente completa o abbandona)
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import PrenotazioneTemporanea from '@/utils/mongo/schemi/PrenotazioneTemporanea';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';
import { verificaToken } from '@/utils/middleware/autenticazione';

const DURATA_BLOCCO_MINUTI = 10;

/**
 * POST - Blocca uno slot temporaneamente
 * 
 * Body: {
 *   specialistId: string,
 *   data: string (YYYY-MM-DD),
 *   oraInizio: string (HH:mm),
 *   durata: number (minuti),
 *   sessionId: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    await verificaToken(req);
    await connessioneMongoDB();

    const body = await req.json();
    const { barberId: specialistId, data, oraInizio, durata, sessionId } = body;

    if (!specialistId || !data || !oraInizio || !durata || !sessionId) {
      return NextResponse.json(
        { successo: false, errore: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    // Verifica che lo slot non sia già prenotato definitivamente
    const dataInizio = new Date(data);
    dataInizio.setHours(0, 0, 0, 0);
    
    const dataFine = new Date(data);
    dataFine.setHours(23, 59, 59, 999);

    const appuntamentoEsistente = await Appuntamento.findOne({
      barber: specialistId,
      data: { $gte: dataInizio, $lte: dataFine },
      oraInizio: oraInizio,
      stato: { $ne: 'cancellato' },
    });

    if (appuntamentoEsistente) {
      return NextResponse.json(
        { successo: false, errore: 'Slot già prenotato' },
        { status: 409 }
      );
    }

    // Verifica che lo slot non sia già bloccato da un'altra sessione
    const ora = new Date();
    const bloccoEsistente = await PrenotazioneTemporanea.findOne({
      barber: specialistId,
      data: new Date(data),
      oraInizio: oraInizio,
      sessionId: { $ne: sessionId },  // Diverso dalla sessione corrente
      scadenza: { $gt: ora },  // Non ancora scaduto
    });

    if (bloccoEsistente) {
      return NextResponse.json(
        { successo: false, errore: 'Slot temporaneamente occupato da un altro utente' },
        { status: 409 }
      );
    }

    // Rimuovi eventuali blocchi precedenti della stessa sessione
    await PrenotazioneTemporanea.deleteMany({ sessionId });

    // Crea nuovo blocco
    const scadenza = new Date();
    scadenza.setMinutes(scadenza.getMinutes() + DURATA_BLOCCO_MINUTI);

    const blocco = await PrenotazioneTemporanea.create({
      barber: specialistId,
      data: new Date(data),
      oraInizio,
      durata,
      sessionId,
      scadenza,
    });

    return NextResponse.json({
      successo: true,
      messaggio: 'Slot bloccato temporaneamente',
      dati: {
        bloccoId: blocco._id,
        scadenza: scadenza,
        durataMinuti: DURATA_BLOCCO_MINUTI,
      },
    });

  } catch (errore: any) {
    console.error('Errore blocco slot:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il blocco dello slot' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Rilascia un blocco temporaneo
 * 
 * Query: ?sessionId=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    await verificaToken(req);
    await connessioneMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { successo: false, errore: 'sessionId è obbligatorio' },
        { status: 400 }
      );
    }

    // Rimuovi tutti i blocchi della sessione
    const risultato = await PrenotazioneTemporanea.deleteMany({ sessionId });

    return NextResponse.json({
      successo: true,
      messaggio: 'Blocchi rilasciati',
      dati: {
        bloccRimossi: risultato.deletedCount,
      },
    });

  } catch (errore: any) {
    console.error('Errore rilascio blocco:', errore);
    
    if (errore.message.includes('Token')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il rilascio del blocco' },
      { status: 500 }
    );
  }
}
