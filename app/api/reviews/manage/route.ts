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

    let filtro: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filtro.status = status;
    }

    const reviews = await Review.find(filtro)
      .populate({
        path: 'specialist',
        populate: { path: 'utente', select: 'nome cognome' }
      })
      .populate('service', 'nome')
      .sort({ created_at: -1 })
      .lean();

    const formatted = reviews.map((r: any) => ({
      _id: r._id,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      rating: r.rating,
      comment: r.comment,
      reply: r.reply,
      replyAt: r.replyAt,
      status: r.status,
      specialistName: r.specialist?.utente
        ? `${r.specialist.utente.nome} ${r.specialist.utente.cognome}`
        : '',
      serviceName: r.service?.nome || '',
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
