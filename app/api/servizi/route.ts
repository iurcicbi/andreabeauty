/**
 * API: GESTIONE SERVIZI
 * 
 * GET /api/servizi - Lista tutti i servizi attivi
 * POST /api/servizi - Crea un nuovo servizio (solo barber)
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Servizio from '@/utils/mongo/schemi/Servizio';
import { verificaToken, richiedeRuolo } from '@/utils/middleware/autenticazione';

/**
 * GET - Recupera tutti i servizi attivi
 * Accessibile a tutti (anche non autenticati)
 */
export async function GET(req: NextRequest) {
  try {
    await connessioneMongoDB();

    // Recupera solo servizi attivi, ordinati per categoria
    const servizi = await Servizio.find({ attivo: true }).sort({ categoria: 1, nome: 1 });

    return NextResponse.json(
      {
        successo: true,
        dati: servizi,
      },
      { status: 200 }
    );
  } catch (errore) {
    console.error('Errore recupero servizi:', errore);
    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero dei servizi' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crea un nuovo servizio
 * Solo per utenti con ruolo 'barber'
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica che l'utente sia un barber
    await richiedeRuolo(req, 'barber');
    
    await connessioneMongoDB();

    const { nome, descrizione, durata, prezzo, categoria, immagine } = await req.json();

    // Validazione
    if (!nome || !descrizione || !durata || prezzo === undefined || !categoria) {
      return NextResponse.json(
        { successo: false, errore: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      );
    }

    // Crea il servizio
    const nuovoServizio = await Servizio.create({
      nome,
      descrizione,
      durata,
      prezzo,
      categoria,
      immagine,
    });

    return NextResponse.json(
      {
        successo: true,
        messaggio: 'Servizio creato con successo',
        dati: nuovoServizio,
      },
      { status: 201 }
    );
  } catch (errore: any) {
    console.error('Errore creazione servizio:', errore);

    // Gestione errori di autenticazione
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    // Gestione errori di validazione
    if (errore.name === 'ValidationError') {
      const messaggi = Object.values(errore.errors).map((err: any) => err.message);
      return NextResponse.json(
        { successo: false, errore: messaggi.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante la creazione del servizio' },
      { status: 500 }
    );
  }
}
