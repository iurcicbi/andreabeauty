/**
 * WEBHOOK WHATSAPP - TRIGGER MANUALE MESSAGGI IN ARRIVO
 *
 * Nota: con whatsapp-web.js i messaggi in arrivo vengono gestiti
 * direttamente dal listener in lib/cron/reminders.js (evento 'message').
 *
 * Questo endpoint è mantenuto per:
 * - Compatibilità con eventuali integrazioni esterne
 * - Trigger manuale per test
 * - Health check del sistema
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Sistema WhatsApp attivo (whatsapp-web.js)',
    info: 'I messaggi in arrivo vengono gestiti in tempo reale dal listener interno.',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verifica autorizzazione
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET;

    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { from, message } = body as { from?: string; message?: string };

    if (!from || !message) {
      return NextResponse.json(
        { error: 'Parametri mancanti: from, message' },
        { status: 400 }
      );
    }

    // Simula un messaggio in arrivo per test
    const { onIncomingMessage } = require('@/lib/cron/reminders') as {
      onIncomingMessage: (msg: { from: string; body: string }) => Promise<void>;
    };

    await onIncomingMessage({ from, body: message });

    return NextResponse.json({
      success: true,
      message: 'Messaggio processato',
      from,
      body: message,
    });
  } catch (error: any) {
    console.error('❌ Errore webhook WhatsApp:', error);
    return NextResponse.json(
      { error: 'Errore interno', message: error.message },
      { status: 500 }
    );
  }
}
