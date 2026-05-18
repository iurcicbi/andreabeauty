#!/usr/bin/env node

/**
 * CLEANUP WHATSAPP PROCESSES
 * 
 * Script per terminare tutti i processi WhatsApp/Chrome in esecuzione
 * e pulire i file di lock prima di avviare un nuovo script.
 * 
 * Uso: node scripts/cleanup-whatsapp.js
 */

const { execSync } = require('child_process');

async function cleanupAll() {
  console.log('🧹 PULIZIA COMPLETA PROCESSI WHATSAPP');
  console.log('=====================================\n');

  try {
    console.log('🔍 Ricerca processi attivi...');
    
    // Mostra processi Chrome/WhatsApp attivi
    try {
      const processes = execSync('ps aux | grep -E "(chrome|whatsapp|puppeteer)" | grep -v grep', { encoding: 'utf8' });
      if (processes.trim()) {
        console.log('📋 Processi trovati:');
        console.log(processes);
      } else {
        console.log('✅ Nessun processo Chrome/WhatsApp attivo');
      }
    } catch (err) {
      console.log('✅ Nessun processo Chrome/WhatsApp attivo');
    }

    console.log('\n🔥 Terminazione forzata processi...');
    
    // Termina TUTTI i processi Chrome/puppeteer con forza
    const commands = [
      'pkill -9 -f "Google Chrome for Testing" 2>/dev/null || true',
      'pkill -9 -f "whatsapp" 2>/dev/null || true', 
      'pkill -9 -f "puppeteer" 2>/dev/null || true',
      'pkill -9 -f "chrome" 2>/dev/null || true',
      'pkill -9 -f "Chromium" 2>/dev/null || true',
      'pkill -9 -f "node.*whatsapp" 2>/dev/null || true',
      'ps aux | grep -i chrome | grep -v grep | awk \'{print $2}\' | xargs kill -9 2>/dev/null || true'
    ];

    commands.forEach(cmd => {
      try {
        execSync(cmd, { stdio: 'ignore' });
      } catch (err) {
        // Ignora errori (normale se non ci sono processi)
      }
    });

    console.log('✅ Processi terminati');

    console.log('\n🗂️  Pulizia file di lock...');
    
    // Rimuovi file di lock e sessioni temporanee
    const cleanupCommands = [
      'rm -rf .wwebjs_auth/session*/SingletonLock 2>/dev/null || true',
      'rm -rf .wwebjs_auth/session*/lockfile 2>/dev/null || true', 
      'rm -rf .wwebjs_auth/session*/DevToolsActivePort 2>/dev/null || true',
      'rm -rf .wwebjs_test/session*/SingletonLock 2>/dev/null || true',
      'rm -rf .wwebjs_test/session*/lockfile 2>/dev/null || true',
      'rm -rf .wwebjs_test/session*/DevToolsActivePort 2>/dev/null || true'
    ];

    cleanupCommands.forEach(cmd => {
      try {
        execSync(cmd, { stdio: 'ignore' });
      } catch (err) {
        // Ignora errori
      }
    });

    console.log('✅ File di lock rimossi');

    console.log('\n⏳ Attesa stabilizzazione sistema...');
    
    // Attesa per essere sicuri che tutto sia pulito
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🎉 PULIZIA COMPLETATA!');
    console.log('✅ Ora puoi avviare lo script WhatsApp senza conflitti');
    console.log('\nComandi disponibili:');
    console.log('  npm run reminders        # Script principale reminder');
    console.log('  npm run test:reminder    # Test singolo appuntamento');

  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error.message);
    process.exit(1);
  }
}

// Funzione async per gestire setTimeout
async function main() {
  await cleanupAll();
}

main().catch(err => {
  console.error('❌ Errore fatale:', err.message);
  process.exit(1);
});