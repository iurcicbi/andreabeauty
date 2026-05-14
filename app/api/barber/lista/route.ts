/**
 * ============================================================================
 * API: LISTA BARBER
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - GET: Recupera lista di tutti i barber con i loro profili
 * 
 * UTILIZZO:
 * - Pagina gestione disponibilità (per admin/responsabile)
 * - Visualizzazione team
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Barber from '@/utils/mongo/schemi/Barber';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

/**
 * GET - Recupera lista di tutti i barber
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica autenticazione (solo barber possono vedere la lista)
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    // Assicura che lo schema Utente sia registrato
    Utente;

    // Recupera tutti i barber con i dati utente
    const barbers = await Barber.find()
      .populate('utente', 'nome cognome email telefono')
      .sort({ 'created_at': 1 }); // Ordina per data creazione

    return NextResponse.json({
      successo: true,
      dati: barbers,
    });

  } catch (errore: any) {
    console.error('Errore recupero lista barber:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero della lista barber' },
      { status: 500 }
    );
  }
}
