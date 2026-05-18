import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import ImpostazioniFrontend from '@/utils/mongo/schemi/ImpostazioniFrontend';
import { verificaToken } from '@/utils/middleware/autenticazione';

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    // Skip MongoDB operator keys
    if (key.startsWith('$')) continue;
    // Recursively sanitize nested objects/arrays
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeBody(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// GET - Ottieni impostazioni frontend
export async function GET() {
  try {
    await connessioneMongoDB();
    
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

// POST - Crea nuove impostazioni (solo admin)
export async function POST(request: NextRequest) {
  try {
    const utente = await verificaToken(request);
    if (utente.ruolo !== 'admin') {
      return NextResponse.json(
        { errore: 'Accesso negato' },
        { status: 403 }
      );
    }

    await connessioneMongoDB();
    
    const body = sanitizeBody(await request.json());
    
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
    const messaggio = errore.message?.includes('Token')
      ? 'Autenticazione richiesta'
      : 'Errore nella creazione delle impostazioni';
    const status = errore.message?.includes('Token') ? 401 : 500;
    console.error('Errore POST /api/frontend:', errore);
    return NextResponse.json({ errore: messaggio }, { status });
  }
}
