import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Voucher from '@/utils/mongo/schemi/Voucher';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';

export async function POST(req: NextRequest) {
  try {
    await connessioneMongoDB();

    const body = await req.json();
    const { code, appointmentId } = body;

    if (!code || !appointmentId) {
      return NextResponse.json(
        { successo: false, errore: 'code and appointmentId are required' },
        { status: 400 }
      );
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      return NextResponse.json(
        { successo: false, errore: 'Voucher invalid' },
        { status: 404 }
      );
    }

    if (voucher.status !== 'active') {
      return NextResponse.json(
        { successo: false, errore: 'Voucher deja folosit sau expirat' },
        { status: 400 }
      );
    }

    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      voucher.status = 'expired';
      await voucher.save();
      return NextResponse.json(
        { successo: false, errore: 'Voucherul a expirat' },
        { status: 400 }
      );
    }

    voucher.status = 'used';
    voucher.usedAt = new Date();
    voucher.usedByAppointment = appointmentId;
    await voucher.save();

    return NextResponse.json({
      successo: true,
      messaggio: 'Voucher applied successfully',
      dati: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        service: voucher.service,
        customerName: voucher.customerName,
      },
    });
  } catch (errore: any) {
    console.error('Error using voucher:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}
