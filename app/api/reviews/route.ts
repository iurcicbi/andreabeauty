import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Review from '@/utils/mongo/schemi/Review';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    await connessioneMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const specialistId = searchParams.get('specialistId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filtro: any = { status: 'approved' };
    if (specialistId) filtro.specialist = specialistId;

    const reviews = await Review.find(filtro)
      .populate('specialist', 'utente')
      .populate({
        path: 'specialist',
        populate: { path: 'utente', select: 'nome cognome' }
      })
      .populate('service', 'nome')
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    const formatted = reviews.map((r: any) => ({
      _id: r._id,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      reply: r.reply,
      replyAt: r.replyAt,
      specialistName: r.specialist?.utente
        ? `${r.specialist.utente.nome} ${r.specialist.utente.cognome}`
        : '',
      serviceName: r.service?.nome || '',
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

    const review = await Review.create({
      appointment: appointment._id,
      specialist: appointment.specialista,
      service: appointment.servizio,
      customerName: `${appointment.utente.nome} ${appointment.utente.cognome}`,
      customerEmail: appointment.utente.email,
      rating,
      comment,
      status: 'pending',
      token: crypto.randomBytes(32).toString('hex'),
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
