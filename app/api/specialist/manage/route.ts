import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Utente from '@/utils/mongo/schemi/Utente';
import Servizio from '@/utils/mongo/schemi/Servizio';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    // Forza la registrazione degli schemi in Mongoose prima del populate
    void Utente;
    void Servizio;

    const specialists = await Specialist.find()
      .populate('utente', 'nome cognome email telefono ruolo attivo')
      .populate('specializzazioni', 'nome categoria durata prezzo')
      .sort({ 'created_at': 1 });

    return NextResponse.json({
      successo: true,
      dati: specialists,
    });

  } catch (errore: any) {
    console.error('Error fetching specialists:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error fetching specialists' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const body = await req.json();
    const { nome, cognome, email, password, telefono, biografia, specializzazioni } = body;

    if (!nome || !cognome || !email || !password || !telefono) {
      return NextResponse.json(
        { successo: false, errore: 'All fields are required' },
        { status: 400 }
      );
    }

    const utenteEsistente = await Utente.findOne({ email });
    if (utenteEsistente) {
      return NextResponse.json(
        { successo: false, errore: 'Email already registered' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuovoUtente = await Utente.create({
      nome,
      cognome,
      email,
      password: passwordHash,
      telefono,
      ruolo: 'specialist',
      attivo: true,
    });

    const nuovoSpecialist = await Specialist.create({
      utente: nuovoUtente._id,
      biografia: biografia || '',
      specializzazioni: specializzazioni || [],
      telefono,
      attivo: true,
    });

    await nuovoSpecialist.populate('utente', 'nome cognome email telefono');
    await nuovoSpecialist.populate('specializzazioni', 'nome categoria durata prezzo');

    return NextResponse.json({
      successo: true,
      messaggio: 'Specialist created successfully',
      dati: nuovoSpecialist,
    }, { status: 201 });

  } catch (errore: any) {
    console.error('Error creating specialist:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error creating specialist' },
      { status: 500 }
    );
  }
}
