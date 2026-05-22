import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Review from '@/utils/mongo/schemi/Review';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const serviceId = searchParams.get('serviceId');
    const rating = searchParams.get('rating');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let filtro: any = {};

    if (status) {
      const stati = status.split(',');
      filtro.status = { $in: stati };
    }
    if (serviceId) {
      filtro.service = serviceId;
    }
    if (rating) {
      filtro.rating = parseInt(rating);
    }
    if (source) {
      filtro.source = source;
    }
    if (featured === 'true') {
      filtro.featured = true;
    }
    if (search) {
      filtro.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { usernameInstagram: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const reviews = await Review.find(filtro)
      .populate({
        path: 'specialist',
        populate: { path: 'utente', select: 'nome cognome' }
      })
      .populate('service', 'nome')
      .sort({ ordine: 1, created_at: -1 })
      .lean();

    const formatted = reviews.map((r: any) => ({
      _id: r._id,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      usernameInstagram: r.usernameInstagram,
      avatar: r.avatar,
      rating: r.rating,
      comment: r.comment,
      reply: r.reply,
      replyAt: r.replyAt,
      status: r.status,
      serviceName: r.service?.nome || r.serviceName || '',
      serviceId: r.service?._id || '',
      specialistName: r.specialist?.utente
        ? `${r.specialist.utente.nome} ${r.specialist.utente.cognome}`
        : '',
      source: r.source || 'Direct',
      images: r.images || [],
      verified: r.verified || false,
      featured: r.featured || false,
      reviewDate: r.reviewDate,
      ordine: r.ordine || 0,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ successo: true, dati: formatted });
  } catch (errore: any) {
    console.error('Error fetching reviews:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: errore.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const body = await req.json();
    const {
      customerName,
      customerEmail,
      usernameInstagram,
      avatar,
      rating,
      comment,
      serviceId,
      serviceName,
      source,
      images,
      verified,
      featured,
      status,
      reviewDate,
    } = body;

    if (!customerName || !rating || !comment) {
      return NextResponse.json(
        { successo: false, errore: 'Numele clientului, ratingul și comentariul sunt obligatorii' },
        { status: 400 }
      );
    }

    const lastReview = await Review.findOne().sort({ ordine: -1 }).lean();
    const prossimoOrdine = (lastReview?.ordine ?? 0) + 1;

    const review = await Review.create({
      customerName,
      customerEmail: customerEmail || '',
      usernameInstagram: usernameInstagram || '',
      avatar: avatar || '',
      rating,
      comment,
      service: serviceId || undefined,
      serviceName: serviceName || '',
      source: source || 'Direct',
      images: images || [],
      verified: verified || false,
      featured: featured || false,
      status: status || 'bozza',
      reviewDate: reviewDate ? new Date(reviewDate) : new Date(),
      ordine: prossimoOrdine,
    });

    return NextResponse.json({
      successo: true,
      messaggio: 'Recenzie creată cu succes',
      dati: review,
    }, { status: 201 });
  } catch (errore: any) {
    console.error('Error creating review:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: errore.message }, { status: 500 });
  }
}
