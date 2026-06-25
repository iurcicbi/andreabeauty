/**
 * WHATSAPP SERVICE - whatsapp-web.js
 *
 * Gestisce la connessione WhatsApp con sessione persistente (LocalAuth),
 * l'invio di messaggi e la ricezione delle risposte dei clienti.
 *
 * Flusso:
 * 1. Al primo avvio mostra QR code nel terminale
 * 2. Dopo il login la sessione viene salvata in .wwebjs_auth/
 * 3. I riavvii successivi non richiedono nuovo QR
 */

// Intercetta require('puppeteer') per usare puppeteer-extra con stealth plugin
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(StealthPlugin());
const Module = require('module');
const origRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'puppeteer') return puppeteerExtra;
  return origRequire.apply(this, arguments);
};

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ─── Stato del client (su global per condivisione con webpack/Next.js) ───────

function getClientRef() { return global.__whatsappClient; }
function setClientRef(v) { global.__whatsappClient = v; }

function getIsReady() { return global.__whatsappReady === true; }
function setIsReady(v) { global.__whatsappReady = v; }

function getIsInitializing() { return global.__whatsappInitializing === true; }
function setIsInitializing(v) { global.__whatsappInitializing = v; }

// Callback per i messaggi in arrivo (impostato da handleIncomingMessages)
/** @type {((msg: import('whatsapp-web.js').Message) => Promise<void>)|null} */
let messageHandler = null;

// ─── Inizializzazione ────────────────────────────────────────────────────────

/**
 * Inizializza il client WhatsApp con sessione persistente.
 * Sicuro da chiamare più volte: se già inizializzato non fa nulla.
 */
async function initWhatsApp() {
  if (getIsReady()) {
    console.log('✅ WhatsApp già connesso e pronto');
    return getClientRef();
  }

  if (getIsInitializing()) {
    console.log('⏳ WhatsApp già in fase di inizializzazione...');
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (getIsReady()) {
          clearInterval(check);
          resolve(getClientRef());
        }
      }, 500);
    });
  }

  setIsInitializing(true);
  console.log('🚀 Inizializzazione client WhatsApp...');

  const pairingPhone = process.env.WHATSAPP_PAIRING_PHONE || '';

  const proxyUrl = process.env.WHATSAPP_PROXY_URL || '';
  const proxyAuth = proxyUrl ? (() => {
    const u = new URL(proxyUrl);
    return u.username ? { username: u.username, password: u.password } : undefined;
  })() : undefined;

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: '.wwebjs_auth',
      clientId: 'session',
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--disable-extensions',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=ChromeWhatsNewUI',
        ...(proxyUrl ? [`--proxy-server=${new URL(proxyUrl).protocol}//${new URL(proxyUrl).host}`] : []),
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      defaultViewport: { width: 1920, height: 1080 },
    },
    ...(proxyAuth ? { proxyAuthentication: proxyAuth } : {}),
  });

  setClientRef(client);

  // Promise that resolves when client is ready or QR is needed
  const readyPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout inizializzazione WhatsApp (120s)'));
    }, 120_000);

    // ── Event: QR code ──────────────────────────────────────────────────────
    client.on('qr', (qr) => {
      console.log('\n📱 ===== QR EVENT FIRED =====');
      console.log('🔍 QR raw (primi 80 char):', qr.substring(0, 80));
      try {
        qrcode.generate(qr, { small: true });
      } catch (qrErr) {
        console.log('QR raw (full):', qr);
      }
      console.log('📱 Apri WhatsApp → Dispositivi collegati → Collega un dispositivo');
      console.log('📱 ================================================\n');
      clearTimeout(timeout);
      resolve({ ready: false, needsQR: true });
    });

    // ── Event: Autenticato ──────────────────────────────────────────────────
    client.on('authenticated', () => {
      console.log('🔐 WhatsApp autenticato con successo');
    });

    // ── Event: Pronto ───────────────────────────────────────────────────────
    client.on('ready', () => {
      setIsReady(true);
      setIsInitializing(false);
      console.log('✅ WhatsApp pronto e connesso!');
      const c = getClientRef();
      console.log(`📞 Numero connesso: ${c?.info?.wid?.user || 'N/A'}`);
      clearTimeout(timeout);
      resolve({ ready: true });
    });

    // ── Event: Errore autenticazione ────────────────────────────────────────
    client.on('auth_failure', (msg) => {
      setIsReady(false);
      setIsInitializing(false);
      clearTimeout(timeout);
      reject(new Error(`Autenticazione WhatsApp fallita: ${msg}`));
    });

    // ── Event: Disconnesso ──────────────────────────────────────────────────
    client.on('disconnected', (reason) => {
      setIsReady(false);
      setIsInitializing(false);
      console.warn(`⚠️ WhatsApp disconnesso: ${reason}`);
      console.log('🔄 Tentativo di riconnessione tra 10 secondi...');
      setTimeout(() => {
        setClientRef(null);
        initWhatsApp().catch((err) =>
          console.error('❌ Errore riconnessione WhatsApp:', err.message)
        );
      }, 10_000);
    });
  });

  // ── Event: Messaggio in arrivo ──────────────────────────────────────────
  client.on('message', async (msg) => {
    // Ignora messaggi di gruppo
    if (msg.from.endsWith('@g.us')) return;

    console.log(`📨 Messaggio ricevuto da ${msg.from}: "${msg.body}"`);

    if (messageHandler) {
      try {
        await messageHandler(msg);
      } catch (err) {
        console.error('❌ Errore nel message handler:', err.message);
      }
    }
  });

  try {
    await client.initialize();
    const result = await readyPromise;

    // Dopo aver mostrato il QR, prova pairing code (non bloccante)
    if (result.needsQR && pairingPhone) {
      setTimeout(async () => {
        try {
          const code = await client.requestPairingCode(pairingPhone);
          console.log(`\n🔢 ===== PAIRING CODE =====`);
          console.log(`📞 Inviato a: ${pairingPhone}`);
          console.log(`🔢 Codice: ${code}`);
          console.log(`📱 Apri WhatsApp su telefono → Impostazioni → Dispositivi collegati`);
          console.log(`🔢 Inserisci il codice: ${code}`);
          console.log(`🔢 =========================\n`);
        } catch (err) {
          console.error('❌ Errore pairing code:', err.message?.substring(0, 80));
        }
      }, 1000);
    }

    return result;
  } catch (err) {
    setIsInitializing(false);
    console.error('❌ Errore inizializzazione WhatsApp:', err.message);
    throw err;
  }
}

// ─── Utility numeri ──────────────────────────────────────────────────────────

/**
 * Converte un numero di telefono nel formato WhatsApp ID.
 *
 * Esempi:
 *   +39 333 1234567  →  393331234567@c.us
 *   0039333123456    →  39333123456@c.us
 *   3331234567       →  393331234567@c.us  (aggiunge prefisso IT di default)
 *
 * @param {string} phone - Numero in qualsiasi formato
 * @param {string} [defaultCountryCode='39'] - Prefisso paese di default
 * @returns {string} WhatsApp chat ID
 */
function formatPhoneToWhatsApp(phone, defaultCountryCode = '39') {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Numero di telefono non valido o mancante');
  }

  // Rimuovi tutto tranne le cifre e il +
  let cleaned = phone.replace(/[\s\-().]/g, '');

  // Rimuovi il prefisso 00 internazionale
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  }

  // Rimuovi il + iniziale
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Se il numero non inizia con un prefisso paese noto, aggiungi quello di default
  const knownPrefixes = ['1', '7', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
  
  const hasCountryCode = knownPrefixes.some(prefix => cleaned.startsWith(prefix));
  
  if (!hasCountryCode) {
    cleaned = defaultCountryCode + cleaned;
  }

  // Validazione: deve essere solo cifre, lunghezza ragionevole
  if (!/^\d{7,15}$/.test(cleaned)) {
    throw new Error(`Numero telefono non valido dopo la formattazione: ${cleaned}`);
  }

  return `${cleaned}@c.us`;
}

/**
 * Verifica se un numero è registrato su WhatsApp.
 *
 * @param {string} phone - Numero di telefono
 * @returns {Promise<boolean>}
 */
async function isRegisteredOnWhatsApp(phone) {
  try {
    const client = getClient();
    const chatId = formatPhoneToWhatsApp(phone);
    const isRegistered = await client.isRegisteredUser(chatId);
    return isRegistered;
  } catch (err) {
    console.error(`❌ Errore verifica registrazione WhatsApp per ${phone}:`, err.message);
    return false;
  }
}

// ─── Invio messaggi ──────────────────────────────────────────────────────────

/**
 * Invia un reminder WhatsApp al cliente chiedendo conferma appuntamento.
 *
 * @param {string} toPhone - Numero destinatario
 * @param {string} customerName - Nome del cliente
 * @param {string} appointmentTime - Orario (es. "10:30")
 * @param {string} appointmentDate - Data formattata (es. "lunedì 15 maggio 2026")
 * @param {string} [serviceName] - Nome del servizio (opzionale)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendReminder(toPhone, customerName, appointmentTime, appointmentDate, serviceName) {
  try {
    const client = getClient();
    const chatId = formatPhoneToWhatsApp(toPhone);

    // Verifica registrazione WhatsApp
    const registered = await client.isRegisteredUser(chatId);
    if (!registered) {
      const errMsg = `Numero ${toPhone} non registrato su WhatsApp`;
      console.warn(`⚠️ ${errMsg}`);
      return { success: false, error: errMsg };
    }

    const servizioTesto = serviceName ? `\n✂️ Servizio: *${serviceName}*` : '';

    const testo =
      `Bună *${customerName}*! 👋\n\n` +
      `Îți reamintim programarea ta de *astăzi*:\n\n` +
      `📅 Data: *${appointmentDate}*\n` +
      `⏰ Ora: *${appointmentTime}*` +
      `${servizioTesto}\n\n` +
      `Poți veni? Răspunde:\n` +
      `✅ *DA* pentru a confirma\n` +
      `❌ *NU* pentru a anula\n\n` +
      `_Mulțumim și o zi frumoasă!_ 🙏`;

    const msg = await client.sendMessage(chatId, testo);

    console.log(`✅ Reminder inviato a ${toPhone} (${chatId}) — ID: ${msg.id._serialized}`);
    return { success: true, messageId: msg.id._serialized };

  } catch (err) {
    const errMsg = buildErrorMessage(err, toPhone);
    console.error(`❌ Errore invio reminder a ${toPhone}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Invia un messaggio di conferma/cancellazione al cliente.
 *
 * @param {string} toPhone - Numero destinatario
 * @param {'confirmed'|'cancelled'} type - Tipo di risposta
 * @param {string} customerName - Nome del cliente
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendConfirmation(toPhone, type, customerName) {
  try {
    const client = getClient();
    const chatId = formatPhoneToWhatsApp(toPhone);

    let testo;
    if (type === 'confirmed') {
      testo =
        `✅ Perfect *${customerName}*!\n\n` +
        `Programarea ta a fost *confirmată*.\n` +
        `Te așteptăm! 😊`;
    } else {
      testo =
        `❌ Am înțeles *${customerName}*.\n\n` +
        `Programarea ta a fost *anulată*.\n` +
        `Poți face o nouă programare oricând dorești. 👋`;
    }

    const msg = await client.sendMessage(chatId, testo);

    console.log(`✅ Conferma (${type}) inviata a ${toPhone} — ID: ${msg.id._serialized}`);
    return { success: true, messageId: msg.id._serialized };

  } catch (err) {
    const errMsg = buildErrorMessage(err, toPhone);
    console.error(`❌ Errore invio conferma a ${toPhone}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Invia un messaggio WhatsApp libero (testo semplice).
 *
 * @param {string} toPhone - Numero destinatario
 * @param {string} text - Testo del messaggio
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendText(toPhone, text) {
  try {
    const client = getClient();
    const chatId = formatPhoneToWhatsApp(toPhone);

    const msg = await client.sendMessage(chatId, text);

    console.log(`✅ Messaggio inviato a ${toPhone} — ID: ${msg.id._serialized}`);
    return { success: true, messageId: msg.id._serialized };

  } catch (err) {
    const errMsg = buildErrorMessage(err, toPhone);
    console.error(`❌ Errore invio messaggio a ${toPhone}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

// ─── Gestione messaggi in arrivo ─────────────────────────────────────────────

/**
 * Registra il handler per i messaggi in arrivo.
 * Viene chiamato da reminders.js per gestire SI/NO dei clienti.
 *
 * @param {(msg: import('whatsapp-web.js').Message) => Promise<void>} handler
 */
function handleIncomingMessages(handler) {
  messageHandler = handler;
  console.log('👂 Handler messaggi in arrivo registrato');
}

// ─── Helpers interni ─────────────────────────────────────────────────────────

/**
 * Restituisce il client se pronto, altrimenti lancia un errore.
 * @returns {Client}
 */
function getClient() {
  const client = getClientRef();
  if (!client || !getIsReady()) {
    throw new Error('Client WhatsApp non pronto. Avvia il server e scansiona il QR code.');
  }
  return client;
}

/**
 * Costruisce un messaggio di errore leggibile.
 * @param {Error} err
 * @param {string} phone
 * @returns {string}
 */
function buildErrorMessage(err, phone) {
  if (err.message?.includes('not ready')) {
    return 'Client WhatsApp non pronto — sessione disconnessa';
  }
  if (err.message?.includes('not registered')) {
    return `Numero ${phone} non registrato su WhatsApp`;
  }
  if (err.message?.includes('invalid')) {
    return `Numero ${phone} non valido`;
  }
  return err.message || 'Errore sconosciuto';
}

/**
 * Verifica se il client è connesso e pronto.
 * @returns {boolean}
 */
function isWhatsAppReady() {
  return getIsReady() && getClientRef() !== null;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  initWhatsApp,
  sendReminder,
  sendConfirmation,
  sendText,
  handleIncomingMessages,
  formatPhoneToWhatsApp,
  isRegisteredOnWhatsApp,
  isWhatsAppReady,
};
