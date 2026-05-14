/**
 * ============================================================================
 * API: GESTIONE DISPONIBILITÀ BARBER SPECIFICO
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - GET: Recupera disponibilità di un barber specifico
 * - PUT: Aggiorna disponibilità (giorni chiusura) di un barber
 * 
 * UTILIZZO:
 * - Pagina gestione disponibilità team
 * - Aggiunta rapida ferie/malattia per un barber
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Barber from '@/utils/mongo/schemi/Barber';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

/**
 * GET - Recupera disponibilità barber
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const barber = await Barber.findById(params.id)
      .populate('utente', 'nome cognome email');

    if (!barber) {
      return NextResponse.json(
        { successo: false, errore: 'Barber non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      dati: {
        _id: barber._id,
        utente: barber.utente,
        giorniChiusura: barber.giorniChiusura,
        attivo: barber.attivo,
      },
    });

  } catch (errore: any) {
    console.error('Errore recupero disponibilità:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Aggiorna disponibilità barber
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const body = await req.json();
    const { giorniChiusura, attivo } = body;

    const barber = await Barber.findById(params.id);

    if (!barber) {
      return NextResponse.json(
        { successo: false, errore: 'Barber non trovato' },
        { status: 404 }
      );
    }

    // Aggiorna solo i campi forniti
    if (giorniChiusura !== undefined) {
      barber.giorniChiusura = giorniChiusura;
    }
    if (attivo !== undefined) {
      barber.attivo = attivo;
    }

    await barber.save();

    return NextResponse.json({
      successo: true,
      messaggio: 'Disponibilità aggiornata con successo',
      dati: barber,
    });

  } catch (errore: any) {
    console.error('Errore aggiornamento disponibilità:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'aggiornamento' },
      { status: 500 }
    );
  }
}
