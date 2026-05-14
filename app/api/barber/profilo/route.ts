/**
 * ============================================================================
 * API: GESTIONE PROFILO BARBER
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - GET: Recupera profilo barber completo
 * - PUT: Aggiorna profilo barber
 * - POST: Crea profilo barber (se non esiste)
 * 
 * DATI GESTITI:
 * - Biografia e specializzazioni
 * - Telefono
 * - Orari settimanali
 * - Giorni di chiusura
 * - Impostazioni prenotazioni
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Barber from '@/utils/mongo/schemi/Barber';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

/**
 * GET - Recupera profilo barber
 */
export async function GET(req: NextRequest) {
  try {
    const utente = await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    // Assicura che lo schema Utente sia registrato
    Utente;

    // Cerca profilo barber per ID utente
    let profilo = await Barber.findOne({ utente: utente.id });

    // Se non esiste, crea profilo con valori di default
    if (!profilo) {
      profilo = await Barber.create({
        utente: utente.id,
        biografia: '',
        specializzazioni: [],
        telefono: '',
        attivo: true,
      });
    }

    // Populate solo se necessario (per pagina profilo)
    const includeUtente = req.nextUrl.searchParams.get('includeUtente') === 'true';
    if (includeUtente) {
      await profilo.populate('utente', 'nome cognome email');
    }

    return NextResponse.json({
      successo: true,
      dati: profilo,
    });

  } catch (errore: any) {
    console.error('Errore recupero profilo:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero del profilo' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Aggiorna profilo barber
 */
export async function PUT(req: NextRequest) {
  try {
    const utente = await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const body = await req.json();
    const { 
      biografia, 
      specializzazioni, 
      telefono,
      orariSettimanali,
      giorniChiusura,
      impostazioni,
    } = body;

    // Cerca profilo esistente
    let profilo = await Barber.findOne({ utente: utente.id });

    if (!profilo) {
      // Crea nuovo profilo se non esiste
      profilo = await Barber.create({
        utente: utente.id,
        biografia: biografia || '',
        specializzazioni: specializzazioni || [],
        telefono: telefono || '',
        orariSettimanali: orariSettimanali || undefined,
        giorniChiusura: giorniChiusura || [],
        impostazioni: impostazioni || undefined,
        attivo: true,
      });
    } else {
      // Aggiorna profilo esistente
      if (biografia !== undefined) profilo.biografia = biografia;
      if (specializzazioni !== undefined) profilo.specializzazioni = specializzazioni;
      if (telefono !== undefined) profilo.telefono = telefono;
      if (orariSettimanali !== undefined) profilo.orariSettimanali = orariSettimanali;
      if (giorniChiusura !== undefined) profilo.giorniChiusura = giorniChiusura;
      if (impostazioni !== undefined) profilo.impostazioni = impostazioni;

      await profilo.save();
    }

    // Populate solo se richiesto
    const includeUtente = req.nextUrl.searchParams.get('includeUtente') === 'true';
    if (includeUtente) {
      await profilo.populate('utente', 'nome cognome email');
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'Profilo aggiornato con successo',
      dati: profilo,
    });

  } catch (errore: any) {
    console.error('Errore aggiornamento profilo:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'aggiornamento del profilo' },
      { status: 500 }
    );
  }
}

