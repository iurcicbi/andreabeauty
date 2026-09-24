/**
 * SCHEDULER REMINDER WHATSAPP + LISTENER RISPOSTE
 *
 * Flusso:
 * 1. Ogni giorno alle 08:00 cerca gli appuntamenti di OGGI non ancora notificati
 * 2. Invia un reminder WhatsApp con richiesta SI/NO
 * 3. Ascolta le risposte in tempo reale:
 *    - SI → stato = 'confermato'
 *    - NO → stato = 'cancellato'
 * 4. Ogni ora controlla gli appuntamenti scaduti (nessuna risposta entro scadenza)
 *    → stato = 'scaduto'
 */

const cron = require('node-cron');
const mongoose = require('mongoose');

const {
  initWhatsApp,
  sendReminder,
  sendConfirmation,
  sendText,
  handleIncomingMessages,
  formatPhoneToWhatsApp,
  isWhatsAppReady,
} = require('../whatsapp');

// ─── Connessione MongoDB e modello ─────────────────────────────────────────

async function getAppuntamentoModel() {
  if (mongoose.models.appointments) {
    return mongoose.models.appointments;
  }
  // Registra modelli necessari se non esistono
  if (!mongoose.models.services) {
    const servizioSchema = new mongoose.Schema({
      nome: String,
      durata: Number,
      prezzo: Number,
      categoria: String,
      attivo: Boolean,
    }, { strict: false, collection: 'services' });
    mongoose.model('services', servizioSchema);
  }
  if (!mongoose.models.specialists) {
    const specialistSchema = new mongoose.Schema({
      utente: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    }, { strict: false, collection: 'specialists' });
    mongoose.model('specialists', specialistSchema);
  }

  const appuntamentoSchema = new mongoose.Schema({
    utente: { type: mongoose.Schema.Types.Mixed },
    specialista: { type: mongoose.Schema.Types.ObjectId, ref: 'specialists' },
    servizio: { type: mongoose.Schema.Types.ObjectId, ref: 'services' },
    data: { type: Date },
    oraInizio: { type: String },
    oraFine: { type: String },
    stato: { type: String },
    confirmationSent: { type: Boolean },
    confirmationResponse: { type: String },
  }, { strict: false, collection: 'appointments' });
  return mongoose.model('appointments', appuntamentoSchema);
}

async function getConnessione() {
  return async () => {
    if (mongoose.connection.readyState === 0) {
      const MONGODB_URI = process.env.MONGODB_URI || '';
      await mongoose.connect(MONGODB_URI);
      console.log(' [REMINDERS] MongoDB connesso');
    }
  };
}

// ─── Stato scheduler ─────────────────────────────────────────────────────────

let schedulerRunning = false;
let expiryRunning = false;
let initialized = false;

/** @type {cron.ScheduledTask[]} */
const tasks = [];

// ─── Logica reminder ─────────────────────────────────────────────────────────

/**
 * Invia i reminder per gli appuntamenti di oggi.
 * Viene eseguito ogni giorno alle 08:00.
 */
async function runDailyReminders() {
  if (schedulerRunning) {
    console.log(' Scheduler reminder già in esecuzione, salto questo ciclo');
    return;
  }

  schedulerRunning = true;
  console.log(' [REMINDER] Avvio scheduler giornaliero:', new Date().toISOString());

  try {
    const connessione = await getConnessione();
    await connessione();

    const Appuntamento = await getAppuntamentoModel();

    // Finestra: oggi dalla mezzanotte alle 23:59
    const oggi = new Date();
    const inizioGiorno = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate(), 0, 0, 0);
    const fineGiorno = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate(), 23, 59, 59);

    console.log(' [REMINDER] Ricerca appuntamenti per oggi:', {
      da: inizioGiorno.toISOString(),
      a: fineGiorno.toISOString(),
    });

    // Trova appuntamenti di oggi che:
    // - non hanno ancora ricevuto il reminder
    // - sono in stato in_attesa o confermato
    const appuntamenti = await Appuntamento.find({
      confirmationSent: false,
      stato: { $in: ['in_attesa', 'confermato'] },
      data: { $gte: inizioGiorno, $lte: fineGiorno },
    }).populate('servizio', 'nome');

    console.log(` [REMINDER] Trovati ${appuntamenti.length} appuntamenti da notificare`);

    if (appuntamenti.length === 0) {
      console.log(' [REMINDER] Nessun reminder da inviare oggi');
      return;
    }

    for (const appuntamento of appuntamenti) {
      await processReminderForAppointment(appuntamento, Appuntamento);

      // Rate limiting: 2 secondi tra un messaggio e l'altro
      if (appuntamenti.indexOf(appuntamento) < appuntamenti.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    console.log(' [REMINDER] Scheduler giornaliero completato');
  } catch (err) {
    console.error(' [REMINDER] Errore scheduler:', err.message);
  } finally {
    schedulerRunning = false;
  }
}

/**
 * Processa il reminder per un singolo appuntamento.
 *
 * @param {object} appuntamento - Documento Mongoose
 * @param {object} Appuntamento - Modello Mongoose
 */
async function processReminderForAppointment(appuntamento, Appuntamento) {
  const { nome, cognome, telefono } = appuntamento.utente;
  const nomeCompleto = `${nome} ${cognome}`;

  try {
    console.log(` [REMINDER] Elaborazione: ${nomeCompleto} (${telefono})`);

    if (!telefono) {
      console.warn(` [REMINDER] Numero mancante per appuntamento ${appuntamento._id}, salto`);
      await Appuntamento.findByIdAndUpdate(appuntamento._id, {
        reminderError: 'Numero telefono mancante',
        reminderErrorAt: new Date(),
      });
      return;
    }

    if (!isWhatsAppReady()) {
      console.error(' [REMINDER] Client WhatsApp non pronto, impossibile inviare reminder');
      return;
    }

    // Formatta data
    const dataFormattata = new Date(appuntamento.data).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const nomeServizio = appuntamento.servizio?.nome || null;

    const risultato = await sendReminder(
      telefono,
      nome,
      appuntamento.oraInizio,
      dataFormattata,
      nomeServizio
    );

    if (risultato.success) {
      await Appuntamento.findByIdAndUpdate(appuntamento._id, {
        confirmationSent: true,
        confirmationSentAt: new Date(),
        reminderSent: true,
        reminderSentAt: new Date(),
        // Scadenza risposta: 2 ore prima dell'appuntamento o max 4 ore dal reminder
        reminderExpiresAt: computeExpiryTime(appuntamento),
      });

      console.log(` [REMINDER] Inviato a ${nomeCompleto} (${telefono})`);
    } else {
      await Appuntamento.findByIdAndUpdate(appuntamento._id, {
        reminderError: risultato.error,
        reminderErrorAt: new Date(),
      });

      console.error(` [REMINDER] Errore per ${nomeCompleto}: ${risultato.error}`);
    }
  } catch (err) {
    console.error(` [REMINDER] Eccezione per ${nomeCompleto}:`, err.message);
    try {
      await Appuntamento.findByIdAndUpdate(appuntamento._id, {
        reminderError: err.message,
        reminderErrorAt: new Date(),
      });
    } catch (_) {}
  }
}

/**
 * Calcola il tempo di scadenza per la risposta.
 * Scade 1 ora prima dell'appuntamento, oppure 4 ore dal momento attuale
 * (il minore dei due).
 *
 * @param {object} appuntamento
 * @returns {Date}
 */
function computeExpiryTime(appuntamento) {
  const now = new Date();
  const [ore, minuti] = appuntamento.oraInizio.split(':').map(Number);
  const dataAppuntamento = new Date(appuntamento.data);
  dataAppuntamento.setHours(ore, minuti, 0, 0);

  // 1 ora prima dell'appuntamento
  const unOraPrima = new Date(dataAppuntamento.getTime() - 60 * 60 * 1000);
  // 4 ore dal momento attuale
  const quattrOreDopoOra = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  return unOraPrima < quattrOreDopoOra ? unOraPrima : quattrOreDopoOra;
}

// ─── Gestione risposte in arrivo ─────────────────────────────────────────────

/**
 * Gestisce i messaggi WhatsApp in arrivo (SI/NO dei clienti).
 * Viene registrato come handler nel client WhatsApp.
 *
 * @param {import('whatsapp-web.js').Message} msg
 */
async function onIncomingMessage(msg) {
  const fromNumber = msg.from;
  const body = msg.body?.trim().toUpperCase() || '';

  console.log(` [RISPOSTA] Da: ${fromNumber} | Testo: "${body}"`);

  try {
    const connessione = await getConnessione();
    await connessione();

    const Appuntamento = await getAppuntamentoModel();

    // Ottieni il numero di telefono reale dal contatto WhatsApp
    let telefonoCliente = '';
    try {
      const contact = await msg.getContact();
      telefonoCliente = contact.number || '';
    } catch (_) {}
    if (telefonoCliente) {
      telefonoCliente = telefonoCliente.replace(/[^0-9]/g, '');
      if (!telefonoCliente.startsWith('39') && telefonoCliente.length <= 10) {
        telefonoCliente = '39' + telefonoCliente;
      }
    }

    // Cerca appuntamento: prima per telefono, poi per ultima risposta in attesa
    let filtroTelefono = [];
    if (telefonoCliente) {
      filtroTelefono = [
        { 'utente.telefono': { $regex: telefonoCliente.slice(-9) } },
        { 'utente.telefono': `+${telefonoCliente}` },
        { 'utente.telefono': telefonoCliente },
      ];
    }

    const filtroBase = {
      confirmationSent: true,
      confirmationResponse: null,
      stato: { $in: ['in_attesa', 'confermato'] },
    };

    let appuntamento;
    if (filtroTelefono.length > 0) {
      appuntamento = await Appuntamento.findOne({
        ...filtroBase,
        $or: filtroTelefono,
      })
        .populate('servizio', 'nome')
        .populate({
          path: 'specialista',
          populate: { path: 'utente', select: 'nome cognome telefono' },
        })
        .sort({ data: 1 });
    }

    // Fallback: trova l'appuntamento più recente in attesa di risposta
    if (!appuntamento) {
      appuntamento = await Appuntamento.findOne(filtroBase)
        .populate('servizio', 'nome')
        .populate({
          path: 'specialista',
          populate: { path: 'utente', select: 'nome cognome telefono' },
        })
        .sort({ confirmationSentAt: -1 });
    }

    if (!appuntamento) {
      console.log(`[RISPOSTA] Nessun appuntamento in attesa per ${fromNumber}`);
      return;
    }

    const nomeCliente = `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`;
    telefonoCliente = appuntamento.utente.telefono;

    console.log(` [RISPOSTA] Appuntamento trovato: ${appuntamento._id} — ${nomeCliente}`);

    // Interpreta la risposta
    const isConfirm = ['SI', 'SÌ', 'S', 'DA', 'YES', 'OK', 'CONFERMO', 'CONFERMA', '1'].some(
      (kw) => body.includes(kw)
    );
    const isCancel = ['NO', 'NU', 'N', 'CANCELLA', 'CANCELLO', 'ANNULLA', 'ANNULLO', '0'].some(
      (kw) => body.includes(kw)
    );

    if (isConfirm) {
      await handleConfirmation(appuntamento, nomeCliente, telefonoCliente, Appuntamento);
    } else if (isCancel) {
      await handleCancellation(appuntamento, nomeCliente, telefonoCliente, Appuntamento);
    } else {
      console.log(` [RISPOSTA] Risposta non riconosciuta: "${body}" da ${fromNumber}`);
      // Invia un messaggio di aiuto
      await sendText(
        telefonoCliente,
        `Nu am înțeles răspunsul tău. 😅\n\nTe rog să răspunzi:\n✅ *DA* pentru a confirma\n❌ *NU* pentru a anula`
      );
    }
  } catch (err) {
    console.error(' [RISPOSTA] Errore gestione messaggio in arrivo:', err.message);
  }
}

/**
 * Gestisce la conferma dell'appuntamento.
 */
async function handleConfirmation(appuntamento, nomeCliente, telefonoCliente, Appuntamento) {
  await Appuntamento.findByIdAndUpdate(appuntamento._id, {
    stato: 'confermato',
    confirmationResponse: 'si',
    confirmationRespondedAt: new Date(),
  });

  console.log(` [CONFERMA] Appuntamento ${appuntamento._id} confermato da ${nomeCliente}`);

  // Invia conferma al cliente
  await sendConfirmation(telefonoCliente, 'confirmed', appuntamento.utente.nome);

  // Notifica allo specialist
  await notifySpecialist(appuntamento, 'confirmed', nomeCliente);
}

/**
 * Gestisce la cancellazione dell'appuntamento.
 */
async function handleCancellation(appuntamento, nomeCliente, telefonoCliente, Appuntamento) {
  await Appuntamento.findByIdAndUpdate(appuntamento._id, {
    stato: 'cancellato',
    confirmationResponse: 'no',
    confirmationRespondedAt: new Date(),
    cancelledBy: 'customer',
    cancelledAt: new Date(),
  });

  console.log(` [CANCELLAZIONE] Appuntamento ${appuntamento._id} cancellato da ${nomeCliente}`);

  // Invia conferma cancellazione al cliente
  await sendConfirmation(telefonoCliente, 'cancelled', appuntamento.utente.nome);

  // Notifica allo specialist
  await notifySpecialist(appuntamento, 'cancelled', nomeCliente);
}

/**
 * Invia una notifica WhatsApp allo specialist.
 */
async function notifySpecialist(appuntamento, type, nomeCliente) {
  try {
    const specialist = appuntamento.specialista;
    if (!specialist?.utente?.telefono) {
      console.log('[NOTIFICA] Telefono specialist non disponibile, salto notifica');
      return;
    }

    let telefonoSpecialist = specialist.utente.telefono;
    if (!telefonoSpecialist.startsWith('+')) {
      telefonoSpecialist = '+39' + telefonoSpecialist;
    }

    const dataFormattata = new Date(appuntamento.data).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const ora = appuntamento.oraInizio;
    const servizio = appuntamento.servizio?.nome || 'servizio';

    let testo;
    if (type === 'confirmed') {
      testo =
        `✅ *Conferma appuntamento*\n\n` +
        `Il cliente *${nomeCliente}* ha CONFERMATO la sua presenza.\n\n` +
        `📅 ${dataFormattata}\n⏰ ${ora}\n✂️ ${servizio}`;
    } else {
      testo =
        `❌ *Cancellazione appuntamento*\n\n` +
        `Il cliente *${nomeCliente}* ha CANCELLATO il suo appuntamento.\n\n` +
        `📅 ${dataFormattata}\n⏰ ${ora}\n✂️ ${servizio}\n\n` +
        `Lo slot è ora libero.`;
    }

    const risultato = await sendText(telefonoSpecialist, testo);
    if (risultato.success) {
      console.log(` [NOTIFICA] Specialist notificato: ${telefonoSpecialist}`);
    } else {
      console.error(` [NOTIFICA] Errore notifica specialist: ${risultato.error}`);
    }
  } catch (err) {
    console.error(' [NOTIFICA] Eccezione notifica specialist:', err.message);
  }
}

// ─── Gestione appuntamenti scaduti ───────────────────────────────────────────

/**
 * Marca come 'scaduto' gli appuntamenti che non hanno ricevuto risposta
 * entro il tempo limite.
 * Viene eseguito ogni ora.
 */
async function runExpiryCheck() {
  if (expiryRunning) return;
  expiryRunning = true;

  try {
    const connessione = await getConnessione();
    await connessione();

    const Appuntamento = await getAppuntamentoModel();

    const now = new Date();

    // Trova appuntamenti con reminder inviato, nessuna risposta, e scadenza superata
    const scaduti = await Appuntamento.find({
      confirmationSent: true,
      confirmationResponse: null,
      stato: { $in: ['in_attesa', 'confermato'] },
      reminderExpiresAt: { $lt: now },
    });

    if (scaduti.length === 0) {
      return;
    }

    console.log(` [SCADUTI] Trovati ${scaduti.length} appuntamenti scaduti`);

    for (const app of scaduti) {
      await Appuntamento.findByIdAndUpdate(app._id, {
        stato: 'scaduto',
        confirmationResponse: null,
      });

      console.log(
        `⏰ [SCADUTI] Appuntamento ${app._id} — ${app.utente.nome} ${app.utente.cognome} → scaduto`
      );
    }
  } catch (err) {
    console.error(' [SCADUTI] Errore controllo scaduti:', err.message);
  } finally {
    expiryRunning = false;
  }
}

// ─── Inizializzazione scheduler ──────────────────────────────────────────────

/**
 * Avvia lo scheduler e il listener messaggi.
 * Sicuro da chiamare più volte: se già inizializzato non fa nulla.
 */
async function initReminderScheduler() {
  if (initialized) {
    console.log(' [SCHEDULER] Già inizializzato');
    return;
  }

  initialized = true;
  console.log(' [SCHEDULER] Inizializzazione sistema reminder WhatsApp...');

  // Inizializza WhatsApp
  try {
    await initWhatsApp();
  } catch (err) {
    console.error(' [SCHEDULER] Errore inizializzazione WhatsApp:', err.message);
    initialized = false;
    return;
  }

  // Registra il listener per i messaggi in arrivo
  handleIncomingMessages(onIncomingMessage);

  // ── Cron 1: Reminder giornalieri alle 08:00 ─────────────────────────────────
  const reminderTask = cron.schedule(
    '0 8 * * *',
    async () => {
      console.log(' [CRON] Trigger reminder giornaliero 08:00');
      await runDailyReminders();
    },
    { timezone: 'Europe/Rome' }
  );
  tasks.push(reminderTask);
  console.log(' [SCHEDULER] Cron reminder giornaliero registrato (08:00 Europe/Rome)');

  // ── Cron 2: Controllo scaduti ogni ora ──────────────────────────────────────
  const expiryTask = cron.schedule(
    '0 * * * *',
    async () => {
      await runExpiryCheck();
    },
    { timezone: 'Europe/Rome' }
  );
  tasks.push(expiryTask);
  console.log(' [SCHEDULER] Cron controllo scaduti registrato (ogni ora)');

  console.log(' [SCHEDULER] Sistema reminder WhatsApp attivo!');
}

/**
 * Ferma tutti i task cron.
 */
function stopScheduler() {
  tasks.forEach((t) => {
    t.stop();
    t.destroy();
  });
  tasks.length = 0;
  initialized = false;
  console.log(' [SCHEDULER] Scheduler fermato');
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  initReminderScheduler,
  stopScheduler,
  runDailyReminders,
  runExpiryCheck,
  onIncomingMessage,
};
