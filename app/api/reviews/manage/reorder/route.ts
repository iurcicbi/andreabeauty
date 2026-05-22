import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Review from '@/utils/mongo/schemi/Review';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function PUT(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const body = await req.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { successo: false, errore: 'orderedIds trebuie să fie un array' },
        { status: 400 }
      );
    }

    const operations = orderedIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { ordine: index } },
      },
    }));

    await Review.bulkWrite(operations);

    return NextResponse.json({
      successo: true,
      messaggio: 'Ordine salvat cu succes',
    });
  } catch (errore: any) {
    console.error('Error reordering reviews:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: errore.message }, { status: 500 });
  }
}
