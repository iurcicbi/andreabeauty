#!/usr/bin/env node

/**
 * SCRIPT TEST SISTEMA WHATSAPP
 * 
 * Uso:
 * node scripts/test-whatsapp.js
 * node scripts/test-whatsapp.js --send +393331234567 "Mario Rossi"
 * node scripts/test-whatsapp.js --webhook +393331234567 "CONFERMO"
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Colori per output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type']?.includes('application/json') 
            ? JSON.parse(body) 
            : body;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testConfiguration() {
  log('blue', '🔍 Test configurazione sistema...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test/whatsapp`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 200 && response.data.success) {
      log('green', '✅ Sistema configurato correttamente');
      console.log('📊 Info sistema:', JSON.stringify(response.data, null, 2));
    } else {
      log('red', '❌ Errore configurazione sistema');
      console.log('Risposta:', response.data);
    }
  } catch (error) {
    log('red', `❌ Errore connessione: ${error.message}`);
  }
}

async function testSendReminder(phoneNumber, customerName) {
  log('blue', `📱 Test invio promemoria a ${phoneNumber}...`);
  
  const testData = {
    phoneNumber,
    customerName,
    appointmentTime: '14:30',
    appointmentDate: 'lunedì 23 dicembre 2024'
  };

  try {
    const response = await makeRequest(`${BASE_URL}/api/test/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(testData));

    if (response.status === 200 && response.data.success) {
      log('green', '✅ Promemoria inviato con successo');
      console.log('📱 Message SID:', response.data.result.messageSid);
    } else {
      log('red', '❌ Errore invio promemoria');
      console.log('Errore:', response.data.error || response.data);
    }
  } catch (error) {
    log('red', `❌ Errore invio: ${error.message}`);
  }
}

async function testWebhook(phoneNumber, message) {
  log('blue', `🔗 Test webhook con messaggio: "${message}"...`);
  
  const formData = new URLSearchParams({
    From: `whatsapp:${phoneNumber}`,
    To: 'whatsapp:+14155238886',
    Body: message,
    MessageSid: `test_${Date.now()}`,
    AccountSid: 'test_account'
  }).toString();

  try {
    const response = await makeRequest(`${BASE_URL}/api/webhooks/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, formData);

    if (response.status === 200) {
      log('green', '✅ Webhook risponde correttamente');
      console.log('📤 Risposta XML:', response.data);
    } else {
      log('red', '❌ Errore webhook');
      console.log('Status:', response.status);
      console.log('Risposta:', response.data);
    }
  } catch (error) {
    log('red', `❌ Errore webhook: ${error.message}`);
  }
}

async function testScheduler() {
  log('blue', '⏰ Test scheduler promemoria...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/cron/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 200 && response.data.success) {
      log('green', '✅ Scheduler eseguito con successo');
      console.log('⏰ Timestamp:', response.data.timestamp);
    } else {
      log('red', '❌ Errore scheduler');
      console.log('Errore:', response.data.error || response.data);
    }
  } catch (error) {
    log('red', `❌ Errore scheduler: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  log('yellow', '🚀 Test Sistema WhatsApp Promemoria');
  log('yellow', '=====================================');
  
  if (args.length === 0) {
    // Test completo
    await testConfiguration();
    console.log('');
    await testScheduler();
    
  } else if (args[0] === '--send' && args[1] && args[2]) {
    // Test invio promemoria
    await testSendReminder(args[1], args[2]);
    
  } else if (args[0] === '--webhook' && args[1] && args[2]) {
    // Test webhook
    await testWebhook(args[1], args[2]);
    
  } else if (args[0] === '--config') {
    // Solo test configurazione
    await testConfiguration();
    
  } else if (args[0] === '--scheduler') {
    // Solo test scheduler
    await testScheduler();
    
  } else {
    // Help
    console.log('');
    log('yellow', 'Uso:');
    console.log('  node scripts/test-whatsapp.js                    # Test completo');
    console.log('  node scripts/test-whatsapp.js --config           # Test configurazione');
    console.log('  node scripts/test-whatsapp.js --scheduler        # Test scheduler');
    console.log('  node scripts/test-whatsapp.js --send +39123 "Mario"  # Test invio');
    console.log('  node scripts/test-whatsapp.js --webhook +39123 "CONFERMO"  # Test webhook');
    console.log('');
    log('yellow', 'Variabili d\'ambiente:');
    console.log('  TEST_URL=https://abc123.ngrok.io  # URL per test (default: http://localhost:3000)');
  }
}

main().catch(error => {
  log('red', `❌ Errore generale: ${error.message}`);
  process.exit(1);
});