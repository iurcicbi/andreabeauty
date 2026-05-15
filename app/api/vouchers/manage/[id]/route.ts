import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Voucher from '@/utils/mongo/schemi/Voucher';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const body = await req.json();
    const update: any = {};

    if (body.customerName) update.customerName = body.customerName;
    if (body.customerPhone !== undefined) update.customerPhone = body.customerPhone;
    if (body.customerEmail !== undefined) update.customerEmail = body.customerEmail;
    if (body.type) update.type = body.type;
    if (body.value !== undefined) update.value = body.value;
    if (body.service !== undefined) update.service = body.service || null;
    if (body.status) update.status = body.status;
    if (body.notes !== undefined) update.notes = body.notes;
    if (body.expiresAt !== undefined) update.expiresAt = body.expiresAt || null;

    const voucher = await Voucher.findByIdAndUpdate(params.id, update, { new: true });
    if (!voucher) {
      return NextResponse.json(
        { successo: false, errore: 'Voucher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'Voucher updated successfully',
      dati: voucher,
    });
  } catch (errore: any) {
    console.error('Error updating voucher:', errore);
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

    const voucher = await Voucher.findByIdAndDelete(params.id);
    if (!voucher) {
      return NextResponse.json(
        { successo: false, errore: 'Voucher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'Voucher deleted successfully',
    });
  } catch (errore: any) {
    console.error('Error deleting voucher:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: errore.message }, { status: 500 });
  }
}
