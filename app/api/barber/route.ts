/**
 * ============================================================================
 * API: GESTIONE BARBER
 * ============================================================================
 * 
 * COSA FA:
 * Recupera la lista dei barber disponibili per le prenotazioni.
 * 
 * FUNZIONALITÀ:
 * - GET: Lista tutti i barber attivi
 * 
 * UTILIZZO:
 * - Nella pagina prenotazione, per mostrare i barber disponibili
 * - Per permettere all'utente di scegliere il barber preferito
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Utente from '@/utils/mongo/schemi/Utente';

/**
 * GET - Lista tutti i barber disponibili
 * 
 * LOGICA:
 * 1. Connette al database
 * 2. Cerca tutti gli utenti con ruolo 'barber' e attivo = true
 * 3. Restituisce solo i campi necessari (nome, cognome)
 * 4. Ordina alfabeticamente per nome
 * 
 * RISPOSTA:
 * {
 *   successo: true,
 *   dati: [
 *     { _id: "...", nome: "Mario", cognome: "Rossi" },
 *     { _id: "...", nome: "Luigi", cognome: "Verdi" }
 *   ]
 * }
 */
export async function GET() {
  try {
    // Connessione al database
    await connessioneMongoDB();
    
    // Recupera tutti i barber attivi
    // .find() cerca documenti che corrispondono ai criteri
    // .select() specifica quali campi includere nella risposta
    // .sort() ordina i risultati alfabeticamente
    const barbers = await Utente.find({ 
      ruolo: 'barber',    // Solo utenti con ruolo barber
      attivo: true        // Solo barber attivi
    })
    .select('nome cognome')  // Restituisce solo nome e cognome (+ _id automatico)
    .sort({ nome: 1, cognome: 1 });  // Ordina: 1 = ascendente, -1 = discendente
    
    // Risposta di successo
    return NextResponse.json({
      successo: true,
      dati: barbers,
    });
    
  } catch (errore) {
    // Log dell'errore per debugging
    console.error('Errore recupero barber:', errore);
    
    // Risposta di errore
    return NextResponse.json(
      { 
        successo: false, 
        errore: 'Errore durante il recupero dei barber' 
      },
      { status: 500 }  // 500 = Internal Server Error
    );
  }
}

