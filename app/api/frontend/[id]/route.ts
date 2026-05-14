import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import ImpostazioniFrontend from '@/utils/mongo/schemi/ImpostazioniFrontend';

// PUT - Aggiorna impostazioni
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();
    
    const body = await request.json();
    const { id } = params;

    const impostazioni = await ImpostazioniFrontend.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!impostazioni) {
      return NextResponse.json(
        { errore: 'Impostazioni non trovate' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      messaggio: 'Impostazioni aggiornate con successo',
      dati: impostazioni,
    });
  } catch (errore: any) {
    console.error('Errore PUT /api/frontend/[id]:', errore);
    return NextResponse.json(
      { errore: 'Errore nell\'aggiornamento delle impostazioni' },
      { status: 500 }
    );
  }
}
