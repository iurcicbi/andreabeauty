/**
 * ENDPOINT TEST SCHEDULER MANUALE
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    console.log(' Test manuale scheduler avviato');

    const { runDailyReminders } = require('@/lib/cron/reminders');
    await runDailyReminders();

    return NextResponse.json({
      success: true,
      message: 'Scheduler eseguito manualmente con successo',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(' Errore test scheduler:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint test scheduler - usa POST per eseguire',
    usage: 'POST /api/test/scheduler'
  });
}