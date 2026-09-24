/**
 * ENDPOINT TEST INVIO REMINDER
 *
 * PROTETTO: richiede Authorization: Bearer CRON_SECRET o token admin JWT
 *
 * GET  /api/test/reminder → lista appuntamenti disponibili per il test
 * POST /api/test/reminder → invia reminder a un appuntamento specifico
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';

async function checkAuth(request: NextRequest): Promise<NextResponse | null> {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (token === process.env.CRON_SECRET) return null;
  try {
    const { default: jwt } = await import('jsonwebtoken');
    const secret = process.env.JWT_SECRET;
    if (secret) {
      const decoded = jwt.verify(token, secret) as { ruolo?: string };
      if (decoded.ruolo === 'admin') return null;
    }
  } catch {}
  return NextResponse.json({ success: false, error: 'Autenticazione richiesta' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const authError = await checkAuth(request);
  if (authError) return authError;

  await connessioneMongoDB();

  const appuntamenti = await Appuntamento.find({
    stato: { $in: ['in_attesa', 'confermato'] },
  })
    .populate('servizio', 'nome')
    .sort({ data: 1 })
    .limit(10);

  return NextResponse.json({
    message: 'Appuntamenti disponibili per il test reminder',
    count: appuntamenti.length,
    appuntamenti: appuntamenti.map((a) => ({
      _id: a._id,
      cliente: `${a.utente.nome} ${a.utente.cognome}`,
      telefono: a.utente.telefono,
      data: a.data,
      oraInizio: a.oraInizio,
      servizio: (a.servizio as any)?.nome || 'N/A',
      confirmationSent: a.confirmationSent,
      confirmationResponse: a.confirmationResponse,
      stato: a.stato,
    })),
    usage:
      'POST /api/test/reminder con { "appointmentId": "<_id>" } oppure { "telefono": "+39...", "nome": "Mario", "ora": "10:00", "data": "15/05/2026" }',
  });
}

export async function POST(request: NextRequest) {
  const authError = await checkAuth(request);
  if (authError) return authError;

  try {
    await connessioneMongoDB();

    const body = await request.json();
    const { appointmentId, telefono, nome, ora, data } = body as {
      appointmentId?: string;
      telefono?: string;
      nome?: string;
      ora?: string;
      data?: string;
    };

    const { initWhatsApp, handleIncomingMessages, sendReminder: sendReminderFn, isWhatsAppReady } = require('@/lib/whatsapp');

    if (!isWhatsAppReady()) {
      console.log(' Inizializzazione client WhatsApp...');
      try {
        const result = await initWhatsApp();
        if (!result.ready) {
          return NextResponse.json(
            {
              success: false,
              error: 'Scannează codul QR afișat în terminalul serverului, apoi reîncearcă.',
            },
            { status: 503 }
          );
        }
      } catch (initErr) {
        return NextResponse.json(
          {
            success: false,
            error: `Eroare inițializare WhatsApp: ${initErr.message}`,
          },
          { status: 503 }
        );
      }
    }

    // Register the incoming message handler (SI/NO processing)
    try {
      const { onIncomingMessage } = require('@/lib/cron/reminders');
      handleIncomingMessages(onIncomingMessage);
      console.log(' Handler messaggi in arrivo (SI/NO) registrato');
    } catch (_) {
      console.log(' Handler messaggi in arrivo non registrato (non criticale)');
    }

    // ── CASO 1: test diretto con dati custom ────────────────────────────────
    if (telefono && nome && ora && data) {
      console.log(' Test diretto con dati custom:', { telefono, nome, ora, data });

      const risultato = await sendReminderFn(telefono, nome, ora, data);

      return NextResponse.json({
        success: risultato.success,
        message: risultato.success
          ? `✅ Reminder inviato a ${telefono}`
          : `❌ Errore: ${risultato.error}`,
        messageId: risultato.messageId,
        error: risultato.error,
      });
    }

    // ── CASO 2: test su appuntamento reale dal DB ────────────────────────────
    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fornisci "appointmentId" oppure { "telefono", "nome", "ora", "data" }',
        },
        { status: 400 }
      );
    }

    const appuntamento = await Appuntamento.findById(appointmentId).populate('servizio', 'nome');

    if (!appuntamento) {
      return NextResponse.json(
        { success: false, error: `Appuntamento ${appointmentId} non trovato` },
        { status: 404 }
      );
    }

    if (!appuntamento.utente.telefono) {
      return NextResponse.json(
        { success: false, error: 'Numero telefono mancante nell\'appuntamento' },
        { status: 400 }
      );
    }

    const dataFormattata = new Date(appuntamento.data).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const nomeServizio = (appuntamento.servizio as any)?.nome || undefined;

    const risultato = await sendReminderFn(
      appuntamento.utente.telefono,
      appuntamento.utente.nome,
      appuntamento.oraInizio,
      dataFormattata,
      nomeServizio
    );

    if (risultato.success) {
      await Appuntamento.findByIdAndUpdate(appointmentId, {
        confirmationSent: true,
        confirmationSentAt: new Date(),
        reminderSent: true,
        reminderSentAt: new Date(),
      });
    }

    return NextResponse.json({
      success: risultato.success,
      message: risultato.success
        ? `✅ Reminder inviato a ${appuntamento.utente.telefono}`
        : `❌ Errore invio: ${risultato.error}`,
      appuntamento: {
        id: appuntamento._id,
        cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
        telefono: appuntamento.utente.telefono,
        data: dataFormattata,
        ora: appuntamento.oraInizio,
      },
      whatsapp: {
        messageId: risultato.messageId,
        error: risultato.error,
      },
    });
  } catch (error: any) {
    console.error(' Errore test reminder:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
