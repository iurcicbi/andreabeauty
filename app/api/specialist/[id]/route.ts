import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import '@/utils/mongo/schemi/Servizio';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();

    console.log('🔍 API /api/specialist/[id] - Searching specialist by ID:', params.id);

    const specialist = await Specialist.findById(params.id)
      .populate('utente', 'nome cognome')
      .populate('specializzazioni', 'nome categoria durata prezzo descrizione immagine');

    console.log('📦 Specialist found:', specialist ? 'YES' : 'NO');

    if (specialist) {
      console.log('📦 Closed days:', specialist.giorniChiusura?.length || 0);
    }

    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    if (!specialist.attivo) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      dati: {
        _id: specialist._id,
        nome: (specialist.utente as any).nome,
        cognome: (specialist.utente as any).cognome,
        biografia: specialist.biografia,
        specializzazioni: specialist.specializzazioni,
        giorniChiusura: specialist.giorniChiusura,
        orariSettimanali: specialist.orariSettimanali,
      },
    });

  } catch (errore: any) {
    console.error('❌ Error fetching specialist:', errore);
    return NextResponse.json(
      { successo: false, errore: 'Error fetching specialist' },
      { status: 500 }
    );
  }
}
