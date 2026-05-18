/**
 * API IMPOSTAZIONI GLOBALI
 * 
 * GET: Recupera tutte le impostazioni
 * PUT: Aggiorna le impostazioni (solo admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import ImpostazioniModel from '@/models/Impostazioni';
import { verificaToken } from '@/utils/middleware/autenticazione';

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
    console.error('❌ Errore GET /api/settings:', errore);
    return NextResponse.json(
      { successo: false, errore: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const utente = await verificaToken(request);
    if (utente.ruolo !== 'admin') {
      return NextResponse.json(
        { successo: false, errore: 'Accesso negato: solo admin può modificare le impostazioni' },
        { status: 403 }
      );
    }

    await dbConnect();
    const dati = await request.json();
    
    const impostazioni = await Impostazioni.aggiornaImpostazioni(dati);
    
    return NextResponse.json({
      successo: true,
      dati: impostazioni,
      messaggio: 'Impostazioni aggiornate con successo'
    });
  } catch (errore: any) {
    const messaggio = errore.message?.includes('Token')
      ? 'Autenticazione richiesta'
      : 'Errore nell\'aggiornamento delle impostazioni';
    const status = errore.message?.includes('Token') ? 401 : 500;
    console.error('❌ Errore PUT /api/settings:', errore);
    return NextResponse.json(
      { successo: false, errore: messaggio },
      { status }
    );
  }
}
