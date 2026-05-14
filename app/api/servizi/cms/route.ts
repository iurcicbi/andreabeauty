/**
 * API: GESTIONE SERVIZI CMS
 * 
 * GET /api/servizi/cms - Lista TUTTI i servizi (attivi e disattivi) per il CMS
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Servizio from '@/utils/mongo/schemi/Servizio';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

/**
 * GET - Recupera TUTTI i servizi per il CMS
 * Solo per utenti con ruolo 'barber'
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica che l'utente sia un barber
    await richiedeRuolo(req, 'barber');
    
    await connessioneMongoDB();

    // Recupera TUTTI i servizi (attivi e disattivi), ordinati per stato e categoria
    const servizi = await Servizio.find({}).sort({ 
      attivo: -1,  // Prima i servizi attivi
      categoria: 1, 
      nome: 1 
    });

    return NextResponse.json(
      {
        successo: true,
        dati: servizi,
      },
      { status: 200 }
    );
  } catch (errore: any) {
    console.error('Errore recupero servizi CMS:', errore);

    // Gestione errori di autenticazione
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero dei servizi' },
      { status: 500 }
    );
  }
}