import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Voucher from '@/utils/mongo/schemi/Voucher';
import Servizio from '@/utils/mongo/schemi/Servizio';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';
import crypto from 'crypto';

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');

    let filtro: any = {};
    if (status && ['active', 'used', 'expired'].includes(status)) {
      filtro.status = status;
    }

    const vouchers = await Voucher.find(filtro)
      .populate('services', 'nome categoria durata prezzo')
      .populate('usedByAppointment', 'data oraInizio')
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ successo: true, dati: vouchers });
  } catch (errore: any) {
    console.error('Error fetching vouchers:', errore);
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
    const { code, customerName, customerSurname, customerPhone, customerEmail, type, value, appliesToAll, services, expiresAt, notes } = body;

    if (!customerName || !type || value === undefined) {
      return NextResponse.json(
        { successo: false, errore: 'customerName, type and value are required' },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed', 'free'].includes(type)) {
      return NextResponse.json(
        { successo: false, errore: 'Invalid voucher type' },
        { status: 400 }
      );
    }

    if (type === 'percentage' && (value < 1 || value > 100)) {
      return NextResponse.json(
        { successo: false, errore: 'Percentage must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (type === 'fixed' && value < 0) {
      return NextResponse.json(
        { successo: false, errore: 'Fixed value must be positive' },
        { status: 400 }
      );
    }

    const finalCode = code ? code.toUpperCase() : generateCode();

    const existing = await Voucher.findOne({ code: finalCode });
    if (existing) {
      return NextResponse.json(
        { successo: false, errore: 'Voucher code already exists' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.create({
      code: finalCode,
      customerName,
      customerSurname,
      customerPhone,
      customerEmail,
      type,
      value,
      appliesToAll: appliesToAll !== false,
      services: services || [],
      status: 'active',
      expiresAt: expiresAt || undefined,
      notes: notes || '',
    });

    return NextResponse.json({
      successo: true,
      messaggio: 'Voucher created successfully',
      dati: voucher,
    }, { status: 201 });
  } catch (errore: any) {
    console.error('Error creating voucher:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: errore.message }, { status: 500 });
  }
}
