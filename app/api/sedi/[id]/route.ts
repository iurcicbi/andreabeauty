import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Sede from '@/utils/mongo/schemi/Sede';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const sede = await Sede.findById(params.id);

    if (!sede) {
      return NextResponse.json(
        { successo: false, errore: 'Sede not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      dati: sede,
    });
  } catch (errore: any) {
    console.error('Error fetching sede:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error fetching sede' }, { status: 500 });
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
    const { nome, indirizzo, citta, cap, provincia, telefono, coordinate, postazioni, attivo } = body;

    const sede = await Sede.findById(params.id);
    if (!sede) {
      return NextResponse.json(
        { successo: false, errore: 'Sede not found' },
        { status: 404 }
      );
    }

    if (nome !== undefined) sede.nome = nome;
    if (indirizzo !== undefined) sede.indirizzo = indirizzo;
    if (citta !== undefined) sede.citta = citta;
    if (cap !== undefined) sede.cap = cap;
    if (provincia !== undefined) sede.provincia = provincia;
    if (telefono !== undefined) sede.telefono = telefono;
    if (coordinate !== undefined) sede.coordinate = coordinate;
    if (postazioni !== undefined) sede.postazioni = postazioni;
    if (attivo !== undefined) sede.attivo = attivo;

    await sede.save();

    return NextResponse.json({
      successo: true,
      messaggio: 'Sede updated successfully',
      dati: sede,
    });
  } catch (errore: any) {
    console.error('Error updating sede:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error updating sede' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const sede = await Sede.findById(params.id);
    if (!sede) {
      return NextResponse.json(
        { successo: false, errore: 'Sede not found' },
        { status: 404 }
      );
    }

    sede.attivo = false;
    await sede.save();

    return NextResponse.json({
      successo: true,
      messaggio: 'Sede deactivated successfully',
    });
  } catch (errore: any) {
    console.error('Error deactivating sede:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error deactivating sede' }, { status: 500 });
  }
}
