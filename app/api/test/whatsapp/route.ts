/**
 * ENDPOINT TEST SISTEMA WHATSAPP
 *
 * PROTETTO: richiede Authorization: Bearer CRON_SECRET o token admin JWT
 *
 * GET  /api/test/whatsapp → stato del sistema
 * POST /api/test/whatsapp → invia un messaggio di test
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';

async function checkAuth(request: NextRequest): Promise<NextResponse | null> {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');

  // Allow CRON_SECRET
  if (token === process.env.CRON_SECRET) return null;

  // Allow admin JWT
  try {
    const { default: jwt } = await import('jsonwebtoken');
    const secret = process.env.JWT_SECRET;
    if (secret) {
      const decoded = jwt.verify(token, secret) as { ruolo?: string };
      if (decoded.ruolo === 'admin') return null;
    }
  } catch {}

  return NextResponse.json(
    { success: false, error: 'Autenticazione richiesta (token admin o CRON_SECRET)' },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  const authError = await checkAuth(request);
  if (authError) return authError;

  try {
    const { isWhatsAppReady } = require('@/lib/whatsapp') as {
      isWhatsAppReady: () => boolean;
    };

    const ready = isWhatsAppReady();

    await connessioneMongoDB();
    const totalAppuntamenti = await Appuntamento.countDocuments();
    const appuntamentiConfermati = await Appuntamento.countDocuments({ stato: 'confermato' });
    const reminderDaInviare = await Appuntamento.countDocuments({
      confirmationSent: false,
      stato: { $in: ['in_attesa', 'confermato'] },
    });
    const inAttesaRisposta = await Appuntamento.countDocuments({
      confirmationSent: true,
      confirmationResponse: null,
      stato: { $in: ['in_attesa', 'confermato'] },
    });

    return NextResponse.json({
      success: true,
      whatsapp: {
        ready,
        engine: 'whatsapp-web.js',
        auth: 'LocalAuth (sessione persistente)',
        sessionPath: '.wwebjs_auth/',
      },
      database: {
        totalAppuntamenti,
        appuntamentiConfermati,
        reminderDaInviare,
        inAttesaRisposta,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { phoneNumber, message, type } = body as {
      phoneNumber?: string;
      message?: string;
      type?: 'reminder' | 'text';
    };

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Parametro mancante: phoneNumber' },
        { status: 400 }
      );
    }

    const { sendReminder, sendText, isWhatsAppReady } = require('@/lib/whatsapp') as {
      sendReminder: (
        phone: string,
        name: string,
        time: string,
        date: string,
        service?: string
      ) => Promise<{ success: boolean; messageId?: string; error?: string }>;
      sendText: (
        phone: string,
        text: string
      ) => Promise<{ success: boolean; messageId?: string; error?: string }>;
      isWhatsAppReady: () => boolean;
    };

    if (!isWhatsAppReady()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client WhatsApp non pronto. Avvia il server e scansiona il QR code.',
        },
        { status: 503 }
      );
    }

    let result;

    if (type === 'reminder') {
      result = await sendReminder(
        phoneNumber,
        body.customerName || 'Cliente',
        body.appointmentTime || '10:00',
        body.appointmentDate || new Date().toLocaleDateString('it-IT'),
        body.serviceName
      );
    } else {
      const testo = message || '🔔 Messaggio di test dal sistema WhatsApp';
      result = await sendText(phoneNumber, testo);
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Messaggio inviato con successo' : 'Errore invio messaggio',
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
