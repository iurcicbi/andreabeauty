/**
 * ============================================================================
 * API: GESTIONE SINGOLO SERVIZIO
 * ============================================================================
 * 
 * PUT /api/servizi/[id] - Aggiorna servizio
 * DELETE /api/servizi/[id] - Elimina servizio
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Servizio from '@/utils/mongo/schemi/Servizio';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

/**
 * PUT - Aggiorna servizio
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const body = await req.json();
    const { nome, descrizione, durata, prezzo, categoria, attivo } = body;

    const servizio = await Servizio.findById(params.id);

    if (!servizio) {
      return NextResponse.json(
        { successo: false, errore: 'Servizio non trovato' },
        { status: 404 }
      );
    }

    // Aggiorna campi
    if (nome !== undefined) servizio.nome = nome;
    if (descrizione !== undefined) servizio.descrizione = descrizione;
    if (durata !== undefined) servizio.durata = durata;
    if (prezzo !== undefined) servizio.prezzo = prezzo;
    if (categoria !== undefined) servizio.categoria = categoria;
    if (attivo !== undefined) servizio.attivo = attivo;

    await servizio.save();

    return NextResponse.json({
      successo: true,
      messaggio: 'Servizio aggiornato con successo',
      dati: servizio,
    });

  } catch (errore: any) {
    console.error('Errore aggiornamento servizio:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'aggiornamento del servizio' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Elimina servizio
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const servizio = await Servizio.findByIdAndDelete(params.id);

    if (!servizio) {
      return NextResponse.json(
        { successo: false, errore: 'Servizio non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'Servizio eliminato con successo',
    });

  } catch (errore: any) {
    console.error('Errore eliminazione servizio:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'eliminazione del servizio' },
      { status: 500 }
    );
  }
}

