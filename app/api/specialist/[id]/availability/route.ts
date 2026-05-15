import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const specialist = await Specialist.findById(params.id)
      .populate('utente', 'nome cognome email');

    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      dati: {
        _id: specialist._id,
        utente: specialist.utente,
        giorniChiusura: specialist.giorniChiusura,
        attivo: specialist.attivo,
      },
    });

  } catch (errore: any) {
    console.error('Error fetching availability:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error fetching availability' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const body = await req.json();
    const { giorniChiusura, attivo } = body;

    const specialist = await Specialist.findById(params.id);

    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    if (giorniChiusura !== undefined) {
      specialist.giorniChiusura = giorniChiusura;
    }
    if (attivo !== undefined) {
      specialist.attivo = attivo;
    }

    await specialist.save();

    return NextResponse.json({
      successo: true,
      messaggio: 'Availability updated successfully',
      dati: specialist,
    });

  } catch (errore: any) {
    console.error('Error updating availability:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error updating availability' },
      { status: 500 }
    );
  }
}
