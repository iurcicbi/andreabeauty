/**
 * ENDPOINT CRON PROMEMORIA - TRIGGER MANUALE
 */

import { NextRequest, NextResponse } from 'next/server';
import { runReminderScheduler } from '@/services/reminderScheduler';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Trigger manuale scheduler promemoria');

    // Verifica header di autorizzazione (opzionale per sicurezza)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET;
    
    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      console.log('❌ Autorizzazione fallita per trigger cron');
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    // Esegui lo scheduler
    await runReminderScheduler();

    return NextResponse.json({
      success: true,
      message: 'Scheduler promemoria eseguito con successo',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Errore trigger scheduler:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Endpoint cron promemoria attivo',
    timestamp: new Date().toISOString(),
    method: 'POST per eseguire lo scheduler'
  });
}