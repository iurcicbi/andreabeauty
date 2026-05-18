/**
 * ENDPOINT CRON REMINDER WHATSAPP
 *
 * Trigger manuale per inviare i reminder del giorno.
 * Utile per ambienti serverless (Vercel Cron Jobs) o test manuali.
 *
 * POST /api/cron/reminders          → esegue i reminder del giorno
 * POST /api/cron/reminders?check=expiry → controlla appuntamenti scaduti
 * GET  /api/cron/reminders          → stato del sistema
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verifica autorizzazione
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET;

    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      console.log('❌ Autorizzazione fallita per trigger cron');
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const check = searchParams.get('check');

    // Import dinamico per compatibilità Next.js App Router
    const { runDailyReminders, runExpiryCheck } = require('@/lib/cron/reminders') as {
      runDailyReminders: () => Promise<void>;
      runExpiryCheck: () => Promise<void>;
    };

    if (check === 'expiry') {
      console.log('🔄 Trigger manuale controllo scaduti');
      await runExpiryCheck();
      return NextResponse.json({
        success: true,
        message: 'Controllo scaduti eseguito',
        timestamp: new Date().toISOString(),
      });
    }

    console.log('🔄 Trigger manuale reminder giornalieri');
    await runDailyReminders();

    return NextResponse.json({
      success: true,
      message: 'Reminder giornalieri eseguiti',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Errore trigger cron:', error);
    return NextResponse.json(
      { error: 'Errore interno del server', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { isWhatsAppReady } = require('@/lib/whatsapp') as {
      isWhatsAppReady: () => boolean;
    };

    return NextResponse.json({
      message: 'Endpoint cron reminder WhatsApp attivo',
      whatsappReady: isWhatsAppReady(),
      timestamp: new Date().toISOString(),
      endpoints: {
        reminders: 'POST /api/cron/reminders',
        expiryCheck: 'POST /api/cron/reminders?check=expiry',
        status: 'GET /api/cron/reminders',
      },
    });
  } catch {
    return NextResponse.json({
      message: 'Endpoint cron reminder WhatsApp attivo',
      whatsappReady: false,
      timestamp: new Date().toISOString(),
    });
  }
}
