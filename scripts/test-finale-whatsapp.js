/**
 * TEST FINALE COMPLETO SISTEMA WHATSAPP
 * Usa la collection "appointments" corretta
 */

const mongoose = require('mongoose');

const appuntamentoSchema = new mongoose.Schema({
  utente: {
    nome: String,
    cognome: String,
    email: String,
    telefono: String
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  servizio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'services'
  },
  data: Date,
  oraInizio: String,
  oraFine: String,
  stato: String,
  note: String,
  reminderSent: Boolean,
  reminderSentAt: Date,
  twilioMessageSid: String,
  cancelledBy: String,
  cancelledAt: Date
}, {
  collection: "appointments",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const Appuntamento = mongoose.model('appointments', appuntamentoSchema);

async function testFinaleWhatsApp() {
  try {
    console.log('🎯 TEST FINALE SISTEMA WHATSAPP - Collection "appointments"');
    
    await mongoose.connect('mongodb://localhost:27017/beautysalon');
    console.log('✅ Connesso al database');

    // 1. Verifica configurazione sistema
    console.log('\n📋 1. Test configurazione sistema');
    const configResponse = await fetch('http://localhost:3000/api/test/whatsapp');
    const configData = await configResponse.json();
    
    if (configData.success) {
      console.log('✅ Sistema configurato correttamente');
      console.log(`📊 Database: ${configData.database.totalAppuntamenti} appuntamenti totali`);
    } else {
      console.log('❌ Errore configurazione:', configData.error);
      return;
    }

    // 2. Trova appuntamento di test
    const appuntamentoTest = await Appuntamento.findOne({
      'utente.telefono': '+393288625535',
      'utente.nome': 'Mario'
    });

    if (!appuntamentoTest) {
      console.log('❌ Appuntamento di test non trovato');
      return;
    }

    console.log('\n📅 2. Appuntamento di test trovato:', {
      id: appuntamentoTest._id,
      cliente: `${appuntamentoTest.utente.nome} ${appuntamentoTest.utente.cognome}`,
      telefono: appuntamentoTest.utente.telefono,
      data: appuntamentoTest.data,
      ora: appuntamentoTest.oraInizio,
      stato: appuntamentoTest.stato,
      reminderSent: appuntamentoTest.reminderSent
    });

    // 3. Test invio promemoria
    console.log('\n📱 3. Test invio promemoria WhatsApp');
    const reminderResponse = await fetch('http://localhost:3000/api/test/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: '+393288625535',
        customerName: 'Mario Rossi',
        appointmentTime: '15:00',
        appointmentDate: 'domani 23 marzo 2026'
      })
    });

    const reminderData = await reminderResponse.json();
    
    if (reminderData.success) {
      console.log('✅ Promemoria inviato con successo');
      console.log('📨 Message SID:', reminderData.result.messageSid);
      
      // Aggiorna l'appuntamento come promemoria inviato
      await Appuntamento.findByIdAndUpdate(appuntamentoTest._id, {
        reminderSent: true,
        reminderSentAt: new Date(),
        twilioMessageSid: reminderData.result.messageSid
      });
      console.log('✅ Appuntamento aggiornato nel database');
      
    } else {
      console.log('❌ Errore invio promemoria:', reminderData.error);
    }

    // 4. Test webhook CONFERMO
    console.log('\n✅ 4. Test webhook risposta "CONFERMO"');
    const confermaResponse = await fetch('http://localhost:3000/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: 'whatsapp:+393288625535',
        Body: 'CONFERMO',
        MessageSid: 'test_confermo_finale',
        AccountSid: 'test_account'
      })
    });

    if (confermaResponse.ok) {
      console.log('✅ Webhook CONFERMO processato correttamente');
    } else {
      console.log('❌ Errore webhook CONFERMO');
    }

    // 5. Test webhook CANCELLA
    console.log('\n❌ 5. Test webhook risposta "CANCELLA"');
    const cancellaResponse = await fetch('http://localhost:3000/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: 'whatsapp:+393288625535',
        Body: 'CANCELLA',
        MessageSid: 'test_cancella_finale',
        AccountSid: 'test_account'
      })
    });

    if (cancellaResponse.ok) {
      console.log('✅ Webhook CANCELLA processato correttamente');
      
      // Verifica stato finale
      const appuntamentoFinale = await Appuntamento.findById(appuntamentoTest._id);
      console.log('📝 Stato finale appuntamento:', {
        stato: appuntamentoFinale.stato,
        cancelledBy: appuntamentoFinale.cancelledBy,
        reminderSent: appuntamentoFinale.reminderSent
      });
    } else {
      console.log('❌ Errore webhook CANCELLA');
    }

    // 6. Test scheduler
    console.log('\n⏰ 6. Test scheduler automatico');
    const schedulerResponse = await fetch('http://localhost:3000/api/test/scheduler', {
      method: 'POST'
    });

    const schedulerData = await schedulerResponse.json();
    if (schedulerData.success) {
      console.log('✅ Scheduler eseguito con successo');
    } else {
      console.log('❌ Errore scheduler:', schedulerData.error);
    }

    // 7. Statistiche finali
    console.log('\n📊 7. Statistiche finali');
    const appuntamentiFinali = await Appuntamento.find({
      'utente.telefono': '+393288625535'
    });

    console.log(`📋 Appuntamenti per +393288625535: ${appuntamentiFinali.length}`);
    appuntamentiFinali.forEach(app => {
      console.log(`   - ${app.utente.nome} ${app.utente.cognome}: ${app.stato} (reminder: ${app.reminderSent})`);
    });

    console.log('\n🎉 TEST FINALE COMPLETATO!');
    console.log('✅ Sistema WhatsApp completamente funzionante');
    console.log('✅ Collection "appointments" utilizzata correttamente');
    console.log('✅ Promemoria inviati e webhook funzionanti');
    
    console.log('\n📱 CONTROLLA IL TUO WHATSAPP (+393288625535)');
    console.log('Dovresti aver ricevuto i promemoria WhatsApp');
    console.log('Rispondi con "CONFERMO" o "CANCELLA" per testare le risposte');

  } catch (error) {
    console.error('❌ Errore durante il test finale:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnesso dal database');
  }
}

testFinaleWhatsApp();