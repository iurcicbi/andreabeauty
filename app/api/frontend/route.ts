import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import ImpostazioniFrontend from '@/utils/mongo/schemi/ImpostazioniFrontend';

// GET - Ottieni impostazioni frontend
export async function GET() {
  try {
    await connessioneMongoDB();
    
    // Cerca le impostazioni (dovrebbe essercene solo una)
    const impostazioni = await ImpostazioniFrontend.findOne();
    
    if (!impostazioni) {
      return NextResponse.json(
        { errore: 'Nessuna impostazione trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dati: impostazioni });
  } catch (errore: any) {
    console.error('Errore GET /api/frontend:', errore);
    return NextResponse.json(
      { errore: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
}

// POST - Crea nuove impostazioni
export async function POST(request: NextRequest) {
  try {
    await connessioneMongoDB();
    
    const body = await request.json();
    
    // Verifica che non esistano già impostazioni
    const esistente = await ImpostazioniFrontend.findOne();
    if (esistente) {
      return NextResponse.json(
        { errore: 'Impostazioni già esistenti, usa PUT per modificare' },
        { status: 400 }
      );
    }

    const impostazioni = await ImpostazioniFrontend.create(body);

    return NextResponse.json(
      { messaggio: 'Impostazioni create con successo', dati: impostazioni },
      { status: 201 }
    );
  } catch (errore: any) {
    console.error('Errore POST /api/frontend:', errore);
    return NextResponse.json(
      { errore: 'Errore nella creazione delle impostazioni' },
      { status: 500 }
    );
  }
}
