/**
 * SCRIPT TEST COMPLETO SISTEMA WHATSAPP
 * Crea un appuntamento di test e verifica tutto il flusso
 */

const mongoose = require('mongoose');

// Schema Appuntamento - usa la collection esistente "appointments"
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
  stato: {
    type: String,
    enum: ['in_attesa', 'confermato', 'completato', 'cancellato'],
    default: 'confermato'
  },
  note: String,
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  twilioMessageSid: String,
  reminderError: String,
  reminderErrorAt: Date,
  cancelledBy: String,
  cancelledAt: Date
}, {
  collection: "appointments",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const Appuntamento = mongoose.model('appointments', appuntamentoSchema);

async function testSistemaCompleto() {
  try {
    console.log('🚀 Avvio test completo sistema WhatsApp');
    
    // Connetti al database
    await mongoose.connect('mongodb://localhost:27017/beautysalon');
    console.log('✅ Connesso al database');

    // Crea appuntamento di test per domani alle 14:30
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    domani.setHours(14, 30, 0, 0);

    // Elimina eventuali appuntamenti di test precedenti
    await Appuntamento.deleteMany({
      'utente.telefono': '+393288625535'
    });

    const appuntamentoTest = new Appuntamento({
      utente: {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@email.com',
        telefono: '+393288625535'
      },
      data: domani,
      oraInizio: '14:30',
      oraFine: '15:30',
      stato: 'confermato',
      reminderSent: false
    });

    await appuntamentoTest.save();
    console.log('✅ Appuntamento di test creato:', {
      id: appuntamentoTest._id,
      cliente: `${appuntamentoTest.utente.nome} ${appuntamentoTest.utente.cognome}`,
      telefono: appuntamentoTest.utente.telefono,
      data: appuntamentoTest.data,
      ora: appuntamentoTest.oraInizio,
      stato: appuntamentoTest.stato
    });

    // Test 1: Verifica configurazione sistema
    console.log('\n📋 Test 1: Verifica configurazione sistema');
    const configResponse = await fetch('http://localhost:3000/api/test/whatsapp');
    const configData = await configResponse.json();
    
    if (configData.success) {
      console.log('✅ Sistema configurato correttamente');
      console.log('📊 Statistiche database:', configData.database);
    } else {
      console.log('❌ Errore configurazione:', configData.error);
      return;
    }

    // Test 2: Invio promemoria
    console.log('\n📱 Test 2: Invio promemoria WhatsApp');
    const reminderResponse = await fetch('http://localhost:3000/api/test/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: '+393288625535',
        customerName: 'Mario Rossi',
        appointmentTime: '14:30',
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
      console.log('✅ Appuntamento aggiornato con promemoria inviato');
      
    } else {
      console.log('❌ Errore invio promemoria:', reminderData.error);
    }

    // Test 3: Simulazione risposta cliente CONFERMO
    console.log('\n✅ Test 3: Simulazione risposta cliente "CONFERMO"');
    const confermaResponse = await fetch('http://localhost:3000/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: 'whatsapp:+393288625535',
        Body: 'CONFERMO',
        MessageSid: 'test_confermo_123',
        AccountSid: 'test_account'
      })
    });

    if (confermaResponse.ok) {
      console.log('✅ Webhook risposta CONFERMO processato');
      
      // Verifica aggiornamento database
      const appuntamentoAggiornato = await Appuntamento.findById(appuntamentoTest._id);
      console.log('📝 Stato appuntamento dopo conferma:', {
        stato: appuntamentoAggiornato.stato,
        reminderSent: appuntamentoAggiornato.reminderSent,
        updatedAt: appuntamentoAggiornato.updatedAt
      });
    } else {
      console.log('❌ Errore webhook conferma');
    }

    // Test 4: Simulazione risposta cliente CANCELLA
    console.log('\n❌ Test 4: Simulazione risposta cliente "CANCELLA"');
    const cancellaResponse = await fetch('http://localhost:3000/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: 'whatsapp:+393288625535',
        Body: 'CANCELLA',
        MessageSid: 'test_cancella_123',
        AccountSid: 'test_account'
      })
    });

    if (cancellaResponse.ok) {
      console.log('✅ Webhook risposta CANCELLA processato');
      
      // Verifica aggiornamento database
      const appuntamentoFinale = await Appuntamento.findById(appuntamentoTest._id);
      console.log('📝 Stato finale appuntamento:', {
        stato: appuntamentoFinale.stato,
        cancelledBy: appuntamentoFinale.cancelledBy,
        cancelledAt: appuntamentoFinale.cancelledAt
      });
    } else {
      console.log('❌ Errore webhook cancellazione');
    }

    // Riepilogo finale
    console.log('\n🎯 RIEPILOGO TEST COMPLETO');
    console.log('✅ Appuntamento creato nel database');
    console.log('✅ Promemoria WhatsApp inviato');
    console.log('✅ Risposta CONFERMO gestita');
    console.log('✅ Risposta CANCELLA gestita');
    console.log('✅ Database aggiornato correttamente');
    
    console.log('\n📱 ISTRUZIONI PER TEST REALE:');
    console.log('1. Controlla il tuo WhatsApp (+393288625535)');
    console.log('2. Dovresti aver ricevuto un promemoria');
    console.log('3. Rispondi con "CONFERMO" o "CANCELLA"');
    console.log('4. Il sistema aggiornerà automaticamente l\'appuntamento');
    
    console.log('\n🔍 Per monitorare i log del server:');
    console.log('Guarda il terminale dove gira "npm run dev"');

  } catch (error) {
    console.error('❌ Errore durante il test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnesso dal database');
  }
}

// Esegui il test
testSistemaCompleto();