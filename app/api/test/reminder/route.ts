/**
 * ENDPOINT TEST INVIO PROMEMORIA
 * 
 * Invia il promemoria WhatsApp a un appuntamento specifico
 * bypassando la finestra temporale delle 24h.
 * 
 * Solo per ambiente di sviluppo/test.
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Servizio from '@/utils/mongo/schemi/Servizio';
import { sendWhatsAppReminder } from '@/lib/twilio/client';

export async function GET(request: NextRequest) {
  await connessioneMongoDB();

  // Mostra tutti gli appuntamenti confermati disponibili per il test
  const appuntamenti = await Appuntamento.find({ stato: 'confermato' })
    .populate('servizio', 'nome')
    .sort({ data: 1 })
    .limit(10);

  return NextResponse.json({
    message: 'Appuntamenti confermati disponibili per il test',
    count: appuntamenti.length,
    appuntamenti: appuntamenti.map(a => ({
      _id: a._id,
      cliente: `${a.utente.nome} ${a.utente.cognome}`,
      telefono: a.utente.telefono,
      data: a.data,
      oraInizio: a.oraInizio,
      servizio: (a.servizio as any)?.nome || 'N/A',
      reminderSent: a.reminderSent,
      stato: a.stato
    })),
    usage: 'POST /api/test/reminder con { "appointmentId": "<_id>" } oppure { "telefono": "+39...", "nome": "Mario", "ora": "10:00", "data": "15/05/2026" }'
  });
}

export async function POST(request: NextRequest) {
  try {
    await connessioneMongoDB();

    const body = await request.json();
    const { appointmentId, telefono, nome, ora, data } = body;

    // CASO 1: test diretto con dati custom (senza appuntamento reale)
    if (telefono && nome && ora && data) {
      console.log('📱 Test diretto con dati custom:', { telefono, nome, ora, data });

      const risultato = await sendWhatsAppReminder(telefono, nome, ora, data);

      return NextResponse.json({
        success: risultato.success,
        message: risultato.success
          ? `✅ Promemoria inviato a ${telefono}`
          : `❌ Errore: ${risultato.error}`,
        messageSid: risultato.messageSid,
        error: risultato.error
      });
    }

    // CASO 2: test su appuntamento reale dal DB
    if (!appointmentId) {
      return NextResponse.json({
        success: false,
        error: 'Fornisci "appointmentId" oppure { "telefono", "nome", "ora", "data" }'
      }, { status: 400 });
    }

    const appuntamento = await Appuntamento.findById(appointmentId)
      .populate('servizio', 'nome durata');

    if (!appuntamento) {
      return NextResponse.json({
        success: false,
        error: `Appuntamento ${appointmentId} non trovato`
      }, { status: 404 });
    }

    console.log('📋 Appuntamento trovato:', {
      id: appuntamento._id,
      cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
      telefono: appuntamento.utente.telefono,
      data: appuntamento.data,
      ora: appuntamento.oraInizio,
      reminderSent: appuntamento.reminderSent
    });

    if (!appuntamento.utente.telefono) {
      return NextResponse.json({
        success: false,
        error: 'Numero telefono mancante nell\'appuntamento'
      }, { status: 400 });
    }

    if (!appuntamento.utente.telefono.startsWith('+')) {
      return NextResponse.json({
        success: false,
        error: `Numero telefono non in formato E.164: ${appuntamento.utente.telefono}. Deve iniziare con + (es. +393288625539)`
      }, { status: 400 });
    }

    // Formatta data
    const dataAppuntamento = new Date(appuntamento.data);
    const dataFormattata = dataAppuntamento.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    console.log('📱 Invio promemoria test a:', appuntamento.utente.telefono);

    const risultato = await sendWhatsAppReminder(
      appuntamento.utente.telefono,
      appuntamento.utente.nome,
      appuntamento.oraInizio,
      dataFormattata
    );

    if (risultato.success) {
      // Aggiorna il flag confirmationSent
      await Appuntamento.findByIdAndUpdate(appointmentId, {
        confirmationSent: true,
        confirmationSentAt: new Date(),
        reminderSent: true,
        reminderSentAt: new Date(),
        twilioMessageSid: risultato.messageSid
      });
    }

    return NextResponse.json({
      success: risultato.success,
      message: risultato.success
        ? `✅ Promemoria inviato a ${appuntamento.utente.telefono}`
        : `❌ Errore invio: ${risultato.error}`,
      appuntamento: {
        id: appuntamento._id,
        cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
        telefono: appuntamento.utente.telefono,
        data: dataFormattata,
        ora: appuntamento.oraInizio
      },
      twilio: {
        messageSid: risultato.messageSid,
        error: risultato.error
      }
    });

  } catch (error: any) {
    console.error('❌ Errore test reminder:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
