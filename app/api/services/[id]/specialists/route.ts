import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Servizio from '@/utils/mongo/schemi/Servizio';
import '@/utils/mongo/schemi/Utente';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();

    const servizio = await Servizio.findById(params.id);
    if (!servizio) {
      return NextResponse.json(
        { successo: false, errore: 'Service not found' },
        { status: 404 }
      );
    }

    const specialists = await Specialist.find({
      specializzazioni: params.id,
      attivo: true,
    })
      .populate('utente', 'nome cognome email')
      .populate('specializzazioni', 'nome categoria durata prezzo')
      .lean();

    const formatted = specialists.map((s: any) => ({
      _id: s._id,
      nome: s.utente?.nome || '',
      cognome: s.utente?.cognome || '',
      email: s.utente?.email || '',
      biografia: s.biografia,
      telefono: s.telefono,
      orariSettimanali: s.orariSettimanali,
      giorniChiusura: s.giorniChiusura,
      impostazioni: s.impostazioni,
      servizi: s.specializzazioni || [],
    }));

    return NextResponse.json({
      successo: true,
      dati: formatted,
    });
  } catch (errore: any) {
    console.error('Error fetching specialists for service:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}
