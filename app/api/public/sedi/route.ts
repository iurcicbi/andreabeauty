import { NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Sede from '@/utils/mongo/schemi/Sede';

export async function GET() {
  try {
    await connessioneMongoDB();

    const sedi = await Sede.find({ attivo: true }).sort({ nome: 1 });

    return NextResponse.json({
      successo: true,
      dati: sedi,
    });
  } catch (errore: any) {
    console.error('Error fetching public sedi:', errore);
    return NextResponse.json({ successo: false, errore: 'Error fetching locations' }, { status: 500 });
  }
}
