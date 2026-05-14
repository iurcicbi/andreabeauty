/**
 * SCHEDULER PROMEMORIA WHATSAPP
 */

import * as cron from 'node-cron';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Appuntamento from '@/utils/mongo/schemi/Appuntamento';
import { sendWhatsAppReminder } from '@/lib/twilio/client';

let schedulerRunning = false;

/**
 * Logica principale dello scheduler
 */
export async function runReminderScheduler(): Promise<void> {
  if (schedulerRunning) {
    console.log('⏳ Scheduler già in esecuzione, salto questo ciclo');
    return;
  }

  schedulerRunning = true;
  console.log('🔄 Avvio scheduler promemoria WhatsApp:', new Date().toISOString());

  try {
    await connessioneMongoDB();

    // Calcola la finestra temporale (24h ± 5 minuti)
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowStart = new Date(in24Hours.getTime() - 5 * 60 * 1000); // -5 minuti
    const windowEnd = new Date(in24Hours.getTime() + 5 * 60 * 1000);   // +5 minuti

    console.log('🕐 Finestra temporale promemoria:', {
      now: now.toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString()
    });

    // Trova appuntamenti che necessitano promemoria
    const appuntamenti = await Appuntamento.find({
      reminderSent: false,
      stato: 'confermato',
      data: {
        $gte: windowStart,
        $lte: windowEnd
      }
    }).populate('barber servizio');

    console.log(`📋 Trovati ${appuntamenti.length} appuntamenti per promemoria`);

    if (appuntamenti.length === 0) {
      console.log('✅ Nessun promemoria da inviare');
      return;
    }

    // Invia promemoria con rate limiting
    for (const appuntamento of appuntamenti) {
      try {
        console.log('📱 Elaborazione appuntamento:', {
          id: appuntamento._id,
          cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
          telefono: appuntamento.utente.telefono,
          data: appuntamento.data,
          ora: appuntamento.oraInizio
        });

        // Validazione dati necessari
        if (!appuntamento.utente.telefono) {
          console.log('⚠️ Numero telefono mancante, salto appuntamento');
          continue;
        }

        if (!appuntamento.utente.telefono.startsWith('+')) {
          console.log('⚠️ Numero telefono non in formato E.164, salto appuntamento');
          continue;
        }

        // Formatta data e ora per il messaggio
        const dataAppuntamento = new Date(appuntamento.data);
        const dataFormattata = dataAppuntamento.toLocaleDateString('it-IT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        // Invia promemoria WhatsApp
        const risultato = await sendWhatsAppReminder(
          appuntamento.utente.telefono,
          appuntamento.utente.nome,
          appuntamento.oraInizio,
          dataFormattata
        );

        if (risultato.success) {
          // Aggiorna appuntamento come promemoria inviato
          await Appuntamento.findByIdAndUpdate(appuntamento._id, {
            reminderSent: true,
            reminderSentAt: new Date(),
            twilioMessageSid: risultato.messageSid
          });

          console.log('✅ Promemoria inviato e appuntamento aggiornato:', {
            id: appuntamento._id,
            messageSid: risultato.messageSid
          });
        } else {
          console.error('❌ Errore invio promemoria:', {
            id: appuntamento._id,
            error: risultato.error
          });

          // Opzionale: marcare come errore per evitare retry infiniti
          await Appuntamento.findByIdAndUpdate(appuntamento._id, {
            reminderError: risultato.error,
            reminderErrorAt: new Date()
          });
        }

        // Rate limiting: attendi 2 secondi tra un messaggio e l'altro
        if (appuntamenti.indexOf(appuntamento) < appuntamenti.length - 1) {
          console.log('⏳ Attesa 2 secondi per rate limiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error: any) {
        console.error('❌ Errore elaborazione appuntamento:', {
          id: appuntamento._id,
          error: error.message
        });
      }
    }

    console.log('✅ Scheduler completato con successo');

  } catch (error: any) {
    console.error('❌ Errore scheduler promemoria:', error);
  } finally {
    schedulerRunning = false;
  }
}

let cronTask: cron.ScheduledTask | null = null;

/**
 * Avvia lo scheduler automatico (ogni minuto)
 */
export function startReminderScheduler(): void {
  console.log('🚀 Avvio scheduler automatico promemoria WhatsApp');

  // Esegui ogni minuto
  cronTask = cron.schedule('* * * * *', async () => {
    await runReminderScheduler();
  }, {
    timezone: 'Europe/Rome'
  });

  cronTask.start();
  console.log('✅ Scheduler automatico avviato (ogni minuto)');
}

/**
 * Ferma lo scheduler (per cleanup)
 */
export function stopReminderScheduler(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask.destroy();
    cronTask = null;
    console.log('🛑 Scheduler fermato');
  }
}