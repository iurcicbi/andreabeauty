/**
 * API IMPOSTAZIONI GLOBALI
 * 
 * GET: Recupera tutte le impostazioni
 * PUT: Aggiorna le impostazioni (solo admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import ImpostazioniModel from '@/models/Impostazioni';

// Cast per TypeScript - il modello ha i metodi statici definiti
const Impostazioni = ImpostazioniModel as any;

export async function GET() {
  try {
    await dbConnect();
    const impostazioni = await Impostazioni.getImpostazioni();
    
    return NextResponse.json({
      successo: true,
      dati: impostazioni
    });
  } catch (errore: any) {
    console.error('❌ Errore GET /api/impostazioni:', errore);
    return NextResponse.json(
      { successo: false, errore: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const dati = await request.json();
    
    const impostazioni = await Impostazioni.aggiornaImpostazioni(dati);
    
    return NextResponse.json({
      successo: true,
      dati: impostazioni,
      messaggio: 'Impostazioni aggiornate con successo'
    });
  } catch (errore: any) {
    console.error('❌ Errore PUT /api/impostazioni:', errore);
    return NextResponse.json(
      { successo: false, errore: 'Errore nell\'aggiornamento delle impostazioni' },
      { status: 500 }
    );
  }
}
