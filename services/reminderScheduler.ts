/**
 * SCHEDULER CONFERMA APPUNTAMENTI WHATSAPP
 * 
 * Flusso:
 * 1. X ore prima dell'appuntamento invia WhatsApp al cliente
 *    con richiesta di conferma (SI/NO)
 * 2. Il webhook /api/webhooks/whatsapp gestisce la risposta:
 *    - SI → stato diventa 'confermato'
 *    - NO → stato diventa 'cancellato'
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
  console.log('🔄 Avvio scheduler conferma appuntamenti:', new Date().toISOString());

  try {
    await connessioneMongoDB();

    // Leggi le ore di anticipo dalle impostazioni (default 24h)
    let oreAnticipo = 24;
    try {
      const Impostazioni = (await import('@/models/Impostazioni')).default;
      const impostazioni = await Impostazioni.findOne();
      if (impostazioni?.funzionalita?.oreAnticipo) {
        oreAnticipo = impostazioni.funzionalita.oreAnticipo;
      }
    } catch (e) {
      console.log('⚠️ Impossibile leggere impostazioni, uso default 24h');
    }

    // Calcola la finestra temporale (oreAnticipo ± 5 minuti)
    const now = new Date();
    const targetTime = new Date(now.getTime() + oreAnticipo * 60 * 60 * 1000);
    const windowStart = new Date(targetTime.getTime() - 5 * 60 * 1000);
    const windowEnd = new Date(targetTime.getTime() + 5 * 60 * 1000);

    console.log(`🕐 Finestra temporale (${oreAnticipo}h prima):`, {
      now: now.toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString()
    });

    // Trova appuntamenti che necessitano richiesta di conferma:
    // - non ancora inviata la conferma
    // - stato in_attesa o confermato (non già cancellati/completati)
    // - nella finestra temporale
    const appuntamenti = await Appuntamento.find({
      confirmationSent: false,
      stato: { $in: ['in_attesa', 'confermato'] },
      data: {
        $gte: windowStart,
        $lte: windowEnd
      }
    }).populate('servizio', 'nome');

    console.log(`📋 Trovati ${appuntamenti.length} appuntamenti da confermare`);

    if (appuntamenti.length === 0) {
      console.log('✅ Nessuna richiesta di conferma da inviare');
      return;
    }

    for (const appuntamento of appuntamenti) {
      try {
        console.log('📱 Elaborazione appuntamento:', {
          id: appuntamento._id,
          cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
          telefono: appuntamento.utente.telefono,
          data: appuntamento.data,
          ora: appuntamento.oraInizio
        });

        if (!appuntamento.utente.telefono) {
          console.log('⚠️ Numero telefono mancante, salto appuntamento');
          continue;
        }

        if (!appuntamento.utente.telefono.startsWith('+')) {
          console.log('⚠️ Numero non in formato E.164, salto appuntamento:', appuntamento.utente.telefono);
          continue;
        }

        // Formatta data per il messaggio
        const dataAppuntamento = new Date(appuntamento.data);
        const dataFormattata = dataAppuntamento.toLocaleDateString('it-IT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        // Invia il messaggio usando il template esistente
        // Il template mostra: nome cliente + orario appuntamento
        const risultato = await sendWhatsAppReminder(
          appuntamento.utente.telefono,
          appuntamento.utente.nome,
          appuntamento.oraInizio,
          dataFormattata
        );

        if (risultato.success) {
          await Appuntamento.findByIdAndUpdate(appuntamento._id, {
            confirmationSent: true,
            confirmationSentAt: new Date(),
            twilioMessageSid: risultato.messageSid,
            // Segna anche reminderSent per non inviare di nuovo
            reminderSent: true,
            reminderSentAt: new Date()
          });

          console.log('✅ Richiesta conferma inviata:', {
            id: appuntamento._id,
            messageSid: risultato.messageSid,
            telefono: appuntamento.utente.telefono
          });
        } else {
          await Appuntamento.findByIdAndUpdate(appuntamento._id, {
            reminderError: risultato.error,
            reminderErrorAt: new Date()
          });

          console.error('❌ Errore invio richiesta conferma:', {
            id: appuntamento._id,
            error: risultato.error
          });
        }

        // Rate limiting: 2 secondi tra un messaggio e l'altro
        if (appuntamenti.indexOf(appuntamento) < appuntamenti.length - 1) {
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
    console.error('❌ Errore scheduler:', error);
  } finally {
    schedulerRunning = false;
  }
}

let cronTask: cron.ScheduledTask | null = null;

/**
 * Avvia lo scheduler automatico (ogni minuto)
 */
export function startReminderScheduler(): void {
  console.log('🚀 Avvio scheduler automatico conferma appuntamenti');

  cronTask = cron.schedule('* * * * *', async () => {
    await runReminderScheduler();
  }, {
    timezone: 'Europe/Rome'
  });

  cronTask.start();
  console.log('✅ Scheduler automatico avviato (ogni minuto)');
}

/**
 * Ferma lo scheduler
 */
export function stopReminderScheduler(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask.destroy();
    cronTask = null;
    console.log('🛑 Scheduler fermato');
  }
}
