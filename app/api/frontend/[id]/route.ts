import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import ImpostazioniFrontend from '@/utils/mongo/schemi/ImpostazioniFrontend';
import { verificaToken } from '@/utils/middleware/autenticazione';

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeBody(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// PUT - Aggiorna impostazioni (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    const impostazioni = await ImpostazioniFrontend.findByIdAndUpdate(
      id,
      { $set: body },
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
    const messaggio = errore.message?.includes('Token')
      ? 'Autenticazione richiesta'
      : 'Errore nell\'aggiornamento delle impostazioni';
    const status = errore.message?.includes('Token') ? 401 : 500;
    console.error('Errore PUT /api/frontend/[id]:', errore);
    return NextResponse.json({ errore: messaggio }, { status });
  }
}
