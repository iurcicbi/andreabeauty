import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Voucher from '@/utils/mongo/schemi/Voucher';
import Servizio from '@/utils/mongo/schemi/Servizio';

export async function POST(req: NextRequest) {
  try {
    await connessioneMongoDB();

    const body = await req.json();
    const { code, serviceId } = body;

    if (!code) {
      return NextResponse.json(
        { successo: false, errore: 'Cod voucher required' },
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

    if (!voucher.appliesToAll && serviceId && voucher.services.length > 0) {
      if (!voucher.services.some(s => s.toString() === serviceId)) {
        return NextResponse.json(
          { successo: false, errore: 'Acest voucher nu este valabil pentru acest serviciu' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      successo: true,
      dati: {
        _id: voucher._id,
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        appliesToAll: voucher.appliesToAll,
        services: voucher.services,
        customerName: voucher.customerName,
        customerSurname: voucher.customerSurname,
      },
    });
  } catch (errore: any) {
    console.error('Error validating voucher:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}
