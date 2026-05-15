import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Review from '@/utils/mongo/schemi/Review';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const body = await req.json();
    const { status, reply } = body;

    const review = await Review.findById(params.id);
    if (!review) {
      return NextResponse.json(
        { successo: false, errore: 'Review not found' },
        { status: 404 }
      );
    }

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      review.status = status;
    }
    if (reply !== undefined) {
      review.reply = reply;
      review.replyAt = new Date();
    }

    await review.save();

    return NextResponse.json({
      successo: true,
      messaggio: 'Review updated successfully',
      dati: review,
    });
  } catch (errore: any) {
    console.error('Error updating review:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: errore.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const review = await Review.findByIdAndDelete(params.id);
    if (!review) {
      return NextResponse.json(
        { successo: false, errore: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'Review deleted successfully',
    });
  } catch (errore: any) {
    console.error('Error deleting review:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: errore.message }, { status: 500 });
  }
}
