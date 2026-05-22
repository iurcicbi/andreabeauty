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
    const review = await Review.findById(params.id);
    if (!review) {
      return NextResponse.json(
        { successo: false, errore: 'Review not found' },
        { status: 404 }
      );
    }

    const fields = [
      'customerName', 'customerEmail', 'usernameInstagram', 'avatar',
      'rating', 'comment', 'reply', 'status',
      'serviceName', 'source', 'images', 'verified', 'featured',
      'reviewDate',
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        (review as any)[field] = body[field];
      }
    }

    if (body.serviceId) {
      review.service = body.serviceId;
    }

    if (body.reply !== undefined) {
      review.reply = body.reply;
      review.replyAt = new Date();
    }

    if (body.ordine !== undefined) {
      review.ordine = body.ordine;
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
