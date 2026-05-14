/**
 * ENDPOINT TEST SISTEMA WHATSAPP
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppReminder, verifyTwilioConfig, getTwilioAccountInfo } from '@/lib/twilio/client';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';

export async function GET(request: NextRequest) {
  try {
    // Verifica configurazione Twilio
    const configOk = verifyTwilioConfig();
    
    if (!configOk) {
      return NextResponse.json({
        success: false,
        error: 'Configurazione Twilio incompleta',
        config: {
          TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
          TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
          TWILIO_WHATSAPP_FROM: !!process.env.TWILIO_WHATSAPP_FROM,
          TWILIO_CONTENT_SID: !!process.env.TWILIO_CONTENT_SID
        }
      });
    }

    // Ottieni info account Twilio
    const accountInfo = await getTwilioAccountInfo();

    // Connetti al database e conta appuntamenti
    await connessioneMongoDB();
    const totalAppuntamenti = await Appuntamento.countDocuments();
    const appuntamentiConfermati = await Appuntamento.countDocuments({ stato: 'confermato' });
    const promemoriaDaInviare = await Appuntamento.countDocuments({ 
      reminderSent: false, 
      stato: 'confermato' 
    });

    return NextResponse.json({
      success: true,
      message: 'Sistema WhatsApp configurato correttamente',
      twilio: {
        configured: true,
        account: accountInfo
      },
      database: {
        totalAppuntamenti,
        appuntamentiConfermati,
        promemoriaDaInviare
      },
      endpoints: {
        webhook: '/api/webhooks/whatsapp',
        cronTrigger: '/api/cron/reminders',
        testSend: '/api/test/whatsapp (POST con dati test)'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, customerName, appointmentTime, appointmentDate } = body;

    if (!phoneNumber || !customerName || !appointmentTime || !appointmentDate) {
      return NextResponse.json({
        success: false,
        error: 'Parametri mancanti: phoneNumber, customerName, appointmentTime, appointmentDate'
      }, { status: 400 });
    }

    // Test invio promemoria
    const result = await sendWhatsAppReminder(
      phoneNumber,
      customerName,
      appointmentTime,
      appointmentDate
    );

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Promemoria di test inviato' : 'Errore invio promemoria',
      result
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}