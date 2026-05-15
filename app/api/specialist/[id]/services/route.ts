import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import SpecialistService from '@/utils/mongo/schemi/SpecialistService';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Servizio from '@/utils/mongo/schemi/Servizio';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();

    const associazioni = await SpecialistService.find({
      specialist: params.id,
    })
      .populate('service')
      .lean();

    const services = associazioni
      .map((a: any) => ({
        ...a.service,
        associazioneId: a._id,
        attivo: a.attivo,
        note: a.note,
      }))
      .filter((s: any) => s._id);

    return NextResponse.json({
      successo: true,
      dati: services,
    });
  } catch (errore: any) {
    console.error('Error fetching specialist services:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();

    const body = await req.json();
    const { serviceId, note } = body;

    if (!serviceId) {
      return NextResponse.json(
        { successo: false, errore: 'serviceId is required' },
        { status: 400 }
      );
    }

    const specialist = await Specialist.findById(params.id);
    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    const service = await Servizio.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { successo: false, errore: 'Service not found' },
        { status: 404 }
      );
    }

    const existingAssociation = await SpecialistService.findOne({
      specialist: params.id,
      service: serviceId,
    });

    if (existingAssociation) {
      return NextResponse.json(
        { successo: false, errore: 'Association already exists' },
        { status: 400 }
      );
    }

    const nuovaAssociazione = await SpecialistService.create({
      specialist: params.id,
      service: serviceId,
      attivo: true,
      note: note || '',
    });

    return NextResponse.json({
      successo: true,
      dati: nuovaAssociazione,
    });
  } catch (errore: any) {
    console.error('Error creating association:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json(
        { successo: false, errore: 'serviceId is required' },
        { status: 400 }
      );
    }

    const risultato = await SpecialistService.findOneAndDelete({
      specialist: params.id,
      service: serviceId,
    });

    if (!risultato) {
      return NextResponse.json(
        { successo: false, errore: 'Association not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'Association removed successfully',
    });
  } catch (errore: any) {
    console.error('Error deleting association:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}
