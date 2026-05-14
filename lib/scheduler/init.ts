/**
 * INIZIALIZZAZIONE SCHEDULER
 */

import { startReminderScheduler } from '@/services/reminderScheduler';
import { verifyTwilioConfig } from '@/lib/twilio/client';

let schedulerInitialized = false;

/**
 * Inizializza lo scheduler solo una volta
 */
export function initializeScheduler() {
  if (schedulerInitialized) {
    console.log('⚠️ Scheduler già inizializzato');
    return;
  }

  // Verifica se siamo in ambiente di sviluppo o produzione
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('🔧 Ambiente:', process.env.NODE_ENV);

  // Verifica configurazione Twilio prima di avviare lo scheduler
  const twilioConfigured = verifyTwilioConfig();
  
  if (!twilioConfigured) {
    console.log('⚠️ Configurazione Twilio mancante - scheduler non avviato');
    console.log('💡 Configura le variabili d\'ambiente Twilio per abilitare i promemoria WhatsApp');
    schedulerInitialized = true;
    return;
  }

  // In sviluppo, avvia lo scheduler locale
  if (isDevelopment) {
    console.log('🚀 Avvio scheduler locale per sviluppo');
    try {
      startReminderScheduler();
      console.log('✅ Scheduler avviato con successo');
    } catch (error) {
      console.error('❌ Errore avvio scheduler:', error);
    }
    schedulerInitialized = true;
  }

  // In produzione su Vercel, non avviare lo scheduler (usa Vercel Cron Jobs)
  if (isProduction) {
    console.log('📦 Produzione: scheduler gestito da Vercel Cron Jobs');
    schedulerInitialized = true;
  }
}