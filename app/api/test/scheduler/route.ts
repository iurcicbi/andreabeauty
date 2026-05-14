/**
 * ENDPOINT TEST SCHEDULER MANUALE
 */

import { NextRequest, NextResponse } from 'next/server';
import { runReminderScheduler } from '@/services/reminderScheduler';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Test manuale scheduler avviato');
    
    await runReminderScheduler();
    
    return NextResponse.json({
      success: true,
      message: 'Scheduler eseguito manualmente con successo',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Errore test scheduler:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Endpoint test scheduler - usa POST per eseguire',
    usage: 'POST /api/test/scheduler'
  });
}