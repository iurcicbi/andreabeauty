import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Review from '@/utils/mongo/schemi/Review';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    await connessioneMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const specialistId = searchParams.get('specialistId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const featured = searchParams.get('featured');
    const serviceId = searchParams.get('serviceId');

    let filtro: any = {
      status: { $in: ['approvata', 'approved'] }
    };

    if (specialistId) filtro.specialist = specialistId;
    if (featured === 'true') filtro.featured = true;
    if (serviceId) filtro.service = serviceId;

    const reviews = await Review.find(filtro)
      .populate('service', 'nome')
      .sort({ featured: -1, ordine: 1, created_at: -1 })
      .limit(limit)
      .lean();

    const formatted = reviews.map((r: any) => ({
      _id: r._id,
      nomeCliente: r.customerName,
      usernameInstagram: r.usernameInstagram,
      avatar: r.avatar,
      valutazione: r.rating,
      descrizione: r.comment,
      servizio: r.service?.nome || r.serviceName || '',
      servizioId: r.service?._id || '',
      reply: r.reply,
      replyAt: r.replyAt,
      source: r.source || 'Direct',
      images: r.images || [],
      verified: r.verified || false,
      featured: r.featured || false,
      reviewDate: r.reviewDate,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ successo: true, dati: formatted });
  } catch (errore: any) {
    console.error('Error fetching reviews:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connessioneMongoDB();

    const body = await req.json();
    const { token, rating, comment } = body;

    if (!token || !rating || !comment) {
      return NextResponse.json(
        { successo: false, errore: 'Token, rating and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { successo: false, errore: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const { default: Appuntamento } = await import('@/utils/mongo/schemi/Appuntamento');
    const appointment = await Appuntamento.findOne({ reviewToken: token });
    if (!appointment) {
      return NextResponse.json(
        { successo: false, errore: 'Invalid or expired review link' },
        { status: 404 }
      );
    }

    const existingReview = await Review.findOne({ appointment: appointment._id });
    if (existingReview) {
      return NextResponse.json(
        { successo: false, errore: 'You have already submitted a review for this appointment' },
        { status: 400 }
      );
    }

    const lastReview = await Review.findOne().sort({ ordine: -1 }).lean();
    const prossimoOrdine = (lastReview?.ordine ?? 0) + 1;

    const review = await Review.create({
      appointment: appointment._id,
      specialist: appointment.specialista,
      service: appointment.servizio,
      customerName: `${appointment.utente.nome} ${appointment.utente.cognome}`,
      customerEmail: appointment.utente.email,
      rating,
      comment,
      status: 'bozza',
      token: crypto.randomBytes(32).toString('hex'),
      source: 'Direct',
      images: [],
      verified: false,
      featured: false,
      reviewDate: new Date(),
      ordine: prossimoOrdine,
    });

    return NextResponse.json({
      successo: true,
      messaggio: 'Review submitted successfully!',
      dati: { _id: review._id },
    }, { status: 201 });
  } catch (errore: any) {
    console.error('Error submitting review:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}
