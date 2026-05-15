/**
 * CREA APPUNTAMENTO DI TEST PER WHATSAPP NELLA COLLECTION APPOINTMENTS
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

async function creaAppuntamentoTestWhatsApp() {
  try {
    console.log('📱 Creazione appuntamento di test per WhatsApp nella collection "appointments"');
    
    await mongoose.connect('mongodb://localhost:27017/beautysalon');
    console.log('✅ Connesso al database');

    // Elimina eventuali appuntamenti di test precedenti
    await Appuntamento.deleteMany({
      'utente.telefono': '+393288625535'
    });
    console.log('🗑️ Eliminati eventuali appuntamenti di test precedenti');

    // Crea appuntamento per domani alle 15:00
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    domani.setHours(15, 0, 0, 0);

    const nuovoAppuntamento = new Appuntamento({
      utente: {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@email.com',
        telefono: '+393288625535'
      },
      // Usa ObjectId esistenti dal database (prendi il primo specialist e servizio disponibili)
      barber: new mongoose.Types.ObjectId('699009e2eb7a0f177a4c4349'), // ID di esempio
      servizio: new mongoose.Types.ObjectId('699009e2eb7a0f177a4c434d'), // ID di esempio
      data: domani,
      oraInizio: '15:00',
      oraFine: '16:00',
      stato: 'confermato',
      note: 'Appuntamento di test per sistema WhatsApp',
      reminderSent: false
    });

    await nuovoAppuntamento.save();
    console.log('✅ Appuntamento di test creato:', {
      id: nuovoAppuntamento._id,
      cliente: `${nuovoAppuntamento.utente.nome} ${nuovoAppuntamento.utente.cognome}`,
      telefono: nuovoAppuntamento.utente.telefono,
      data: nuovoAppuntamento.data,
      ora: `${nuovoAppuntamento.oraInizio} - ${nuovoAppuntamento.oraFine}`,
      stato: nuovoAppuntamento.stato
    });

    // Crea anche un appuntamento per test scheduler (24h nel futuro)
    const ora24h = new Date();
    ora24h.setTime(ora24h.getTime() + 24 * 60 * 60 * 1000); // +24 ore esatte

    const appuntamento24h = new Appuntamento({
      utente: {
        nome: 'Luigi',
        cognome: 'Verdi',
        email: 'luigi.verdi@email.com',
        telefono: '+393288625535'
      },
      barber: new mongoose.Types.ObjectId('699009e2eb7a0f177a4c4349'),
      servizio: new mongoose.Types.ObjectId('699009e2eb7a0f177a4c434d'),
      data: ora24h,
      oraInizio: ora24h.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      oraFine: new Date(ora24h.getTime() + 60 * 60 * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      stato: 'confermato',
      note: 'Appuntamento per test scheduler automatico 24h',
      reminderSent: false
    });

    await appuntamento24h.save();
    console.log('✅ Appuntamento 24h per scheduler creato:', {
      id: appuntamento24h._id,
      cliente: `${appuntamento24h.utente.nome} ${appuntamento24h.utente.cognome}`,
      telefono: appuntamento24h.utente.telefono,
      data: appuntamento24h.data,
      ora: `${appuntamento24h.oraInizio} - ${appuntamento24h.oraFine}`,
      stato: appuntamento24h.stato
    });

    console.log('\n🎯 APPUNTAMENTI DI TEST CREATI:');
    console.log('1. Appuntamento domani 15:00 - per test manuale');
    console.log('2. Appuntamento 24h - per test scheduler automatico');
    console.log('\n📱 Ora puoi testare:');
    console.log('- Invio promemoria manuale');
    console.log('- Risposte WhatsApp (CONFERMO/CANCELLA)');
    console.log('- Scheduler automatico');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnesso dal database');
  }
}

creaAppuntamentoTestWhatsApp();