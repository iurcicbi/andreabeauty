/**
 * ============================================================================
 * API: GESTIONE COMPLETA BARBER
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - POST: Crea nuovo barber (utente + profilo)
 * - GET: Lista tutti i barber con dettagli completi
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Barber from '@/utils/mongo/schemi/Barber';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';
import bcrypt from 'bcryptjs';

/**
 * GET - Lista tutti i barber con dettagli completi
 */
export async function GET(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    // Assicura che lo schema Utente sia registrato
    Utente;

    const barbers = await Barber.find()
      .populate('utente', 'nome cognome email telefono ruolo attivo')
      .sort({ 'created_at': 1 });

    return NextResponse.json({
      successo: true,
      dati: barbers,
    });

  } catch (errore: any) {
    console.error('Errore recupero barber:', errore);
    
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
 * POST - Crea nuovo barber (utente + profilo)
 */
export async function POST(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const body = await req.json();
    const { nome, cognome, email, password, telefono, biografia, specializzazioni } = body;

    // Validazione campi obbligatori
    if (!nome || !cognome || !email || !password || !telefono) {
      return NextResponse.json(
        { successo: false, errore: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    // Verifica se email già esiste
    const utenteEsistente = await Utente.findOne({ email });
    if (utenteEsistente) {
      return NextResponse.json(
        { successo: false, errore: 'Email già registrata' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crea utente
    const nuovoUtente = await Utente.create({
      nome,
      cognome,
      email,
      password: passwordHash,
      telefono,
      ruolo: 'barber',
      attivo: true,
    });

    // Crea profilo barber con orari di default
    const nuovoBarber = await Barber.create({
      utente: nuovoUtente._id,
      biografia: biografia || '',
      specializzazioni: specializzazioni || [],
      telefono,
      attivo: true,
      // Gli orari settimanali e impostazioni vengono creati con i valori di default dello schema
    });

    // Popola i dati utente
    await nuovoBarber.populate('utente', 'nome cognome email telefono');

    return NextResponse.json({
      successo: true,
      messaggio: 'Barber creato con successo',
      dati: nuovoBarber,
    }, { status: 201 });

  } catch (errore: any) {
    console.error('Errore creazione barber:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante la creazione' },
      { status: 500 }
    );
  }
}
