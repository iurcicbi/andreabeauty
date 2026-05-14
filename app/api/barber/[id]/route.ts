/**
 * ============================================================================
 * API PUBBLICA: DETTAGLI BARBER SPECIFICO
 * ============================================================================
 * 
 * COSA FA:
 * Recupera i dettagli pubblici di un barber specifico per le prenotazioni.
 * 
 * FUNZIONALITÀ:
 * - GET: Dettagli barber (nome, cognome, chiusure, orari)
 * 
 * UTILIZZO:
 * - Nella pagina prenotazione, per mostrare le chiusure del barber
 * - Per verificare disponibilità e orari
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Barber from '@/utils/mongo/schemi/Barber';
import Utente from '@/utils/mongo/schemi/Utente';

/**
 * GET - Recupera dettagli pubblici di un barber
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();

    console.log('🔍 API /api/barber/[id] - Ricerca barber con utente ID:', params.id);

    // L'ID passato è l'ID dell'utente, non del profilo barber
    const barber = await Barber.findOne({ utente: params.id })
      .populate('utente', 'nome cognome');

    console.log('📦 Barber trovato:', barber ? 'SI' : 'NO');
    
    if (barber) {
      console.log('📦 Giorni chiusura:', barber.giorniChiusura?.length || 0);
    }

    if (!barber) {
      return NextResponse.json(
        { successo: false, errore: 'Barber non trovato' },
        { status: 404 }
      );
    }

    // Verifica se il barber è attivo
    if (!barber.attivo) {
      return NextResponse.json(
        { successo: false, errore: 'Barber non disponibile' },
        { status: 404 }
      );
    }

    // Restituisci solo i dati pubblici necessari
    return NextResponse.json({
      successo: true,
      dati: {
        _id: barber._id,
        nome: (barber.utente as any).nome,
        cognome: (barber.utente as any).cognome,
        biografia: barber.biografia,
        specializzazioni: barber.specializzazioni,
        giorniChiusura: barber.giorniChiusura,
        orariSettimanali: barber.orariSettimanali,
      },
    });

  } catch (errore: any) {
    console.error('❌ Errore recupero barber:', errore);
    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero' },
      { status: 500 }
    );
  }
}
