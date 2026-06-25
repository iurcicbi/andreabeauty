/**
 * WHATSAPP STANDALONE - Solo WhatsApp + Reminder (senza web server)
 *
 * Usa: node scripts/whatsapp-standalone.js
 * Connette a MongoDB su VPS, avvia WhatsApp, reminder cron, e resta in esecuzione.
 */

const path = require('path');

// Carica .env dalla root del progetto (MA sovrascrivi MONGODB_URI con IP VPS)
const envPath = path.join(__dirname, '..', '.env');
try { require('dotenv').config({ path: envPath }); } catch (_) {}
process.env.MONGODB_URI = 'mongodb://13.140.171.204:27017/beauty';

// Forza WhatsApp enabled
process.env.WHATSAPP_ENABLED = 'true';

const mongoose = require('mongoose');
const { initReminderScheduler } = require('../lib/cron/reminders');

async function main() {
  console.log('🚀 WHATSAPP STANDALONE');
  console.log('======================\n');

  console.log(`📦 MongoDB URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
  console.log(`📦 Pairing Phone: ${process.env.WHATSAPP_PAIRING_PHONE || 'N/A'}`);

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connesso con successo\n');
  } catch (err) {
    console.error('❌ Errore connessione MongoDB:', err.message);
    process.exit(1);
  }

  try {
    await initReminderScheduler();
    console.log('\n✅ Sistema reminder WhatsApp avviato!');
    console.log('📱 Scansiona il QR code o usa pairing code per collegare WhatsApp.\n');
  } catch (err) {
    console.error('❌ Errore avvio reminder:', err.message);
  }

  // Tieni il processo vivo
  process.on('SIGINT', async () => {
    console.log('\n⚠️ Arresto in corso...');
    await mongoose.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n⚠️ Arresto in corso...');
    await mongoose.disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('❌ Errore fatale:', err);
  process.exit(1);
});
