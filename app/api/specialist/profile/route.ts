import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(req: NextRequest) {
  try {
    const utente = await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    Utente;

    let profilo = await Specialist.findOne({ utente: utente.id });

    if (!profilo) {
      profilo = await Specialist.create({
        utente: utente.id,
        biografia: '',
        specializzazioni: [],
        telefono: '',
        attivo: true,
      });
    }

    const includeUtente = req.nextUrl.searchParams.get('includeUtente') === 'true';
    if (includeUtente) {
      await profilo.populate('utente', 'nome cognome email');
    }

    return NextResponse.json({
      successo: true,
      dati: profilo,
    });

  } catch (errore: any) {
    console.error('Error fetching profile:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const utente = await richiedeRuolo(req, 'specialist');
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

    let profilo = await Specialist.findOne({ utente: utente.id });

    if (!profilo) {
      profilo = await Specialist.create({
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
      if (biografia !== undefined) profilo.biografia = biografia;
      if (specializzazioni !== undefined) profilo.specializzazioni = specializzazioni;
      if (telefono !== undefined) profilo.telefono = telefono;
      if (orariSettimanali !== undefined) profilo.orariSettimanali = orariSettimanali;
      if (giorniChiusura !== undefined) profilo.giorniChiusura = giorniChiusura;
      if (impostazioni !== undefined) profilo.impostazioni = impostazioni;

      await profilo.save();
    }

    const includeUtente = req.nextUrl.searchParams.get('includeUtente') === 'true';
    if (includeUtente) {
      await profilo.populate('utente', 'nome cognome email');
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'Profile updated successfully',
      dati: profilo,
    });

  } catch (errore: any) {
    console.error('Error updating profile:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error updating profile' },
      { status: 500 }
    );
  }
}
