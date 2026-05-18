import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Sede from '@/utils/mongo/schemi/Sede';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const sedi = await Sede.find().sort({ nome: 1 });

    return NextResponse.json({
      successo: true,
      dati: sedi,
    });
  } catch (errore: any) {
    console.error('Error fetching sedi:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error fetching sedi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const body = await req.json();
    const { nome, indirizzo, citta, cap, provincia, telefono, coordinate, postazioni } = body;

    if (!nome || !indirizzo || !citta) {
      return NextResponse.json(
        { successo: false, errore: 'Name, address and city are required' },
        { status: 400 }
      );
    }

    const nuovaSede = await Sede.create({
      nome,
      indirizzo,
      citta,
      cap,
      provincia,
      telefono,
      coordinate,
      postazioni: postazioni || [],
      attivo: true,
    });

    return NextResponse.json({
      successo: true,
      messaggio: 'Sede created successfully',
      dati: nuovaSede,
    }, { status: 201 });
  } catch (errore: any) {
    console.error('Error creating sede:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error creating sede' }, { status: 500 });
  }
}
