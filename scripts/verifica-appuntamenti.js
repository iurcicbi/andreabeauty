/**
 * VERIFICA STATO APPUNTAMENTI
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
  cancelledAt: Date,
  created_at: Date,
  updated_at: Date
}, {
  collection: "appointments",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

const Appuntamento = mongoose.model('appointments', appuntamentoSchema);

async function verificaAppuntamenti() {
  try {
    console.log(' Verifica stato appuntamenti nel database');
    
    await mongoose.connect('mongodb://localhost:27017/beautysalon');
    console.log(' Connesso al database');

    // Trova tutti gli appuntamenti per il numero di test
    const appuntamenti = await Appuntamento.find({
      'utente.telefono': '+393288625535'
    }).sort({ createdAt: -1 });

    console.log(`\n Trovati ${appuntamenti.length} appuntamenti per +393288625535:`);
    
    appuntamenti.forEach((app, index) => {
      console.log(`\n${index + 1}. Appuntamento ID: ${app._id}`);
      console.log(`   Cliente: ${app.utente.nome} ${app.utente.cognome}`);
      console.log(`   Telefono: ${app.utente.telefono}`);
      console.log(`   Data: ${app.data}`);
      console.log(`   Ora: ${app.oraInizio}`);
      console.log(`   Stato: ${app.stato}`);
      console.log(`   Promemoria inviato: ${app.reminderSent}`);
      if (app.reminderSentAt) {
        console.log(`   Promemoria inviato il: ${app.reminderSentAt}`);
      }
      if (app.twilioMessageSid) {
        console.log(`   Twilio Message SID: ${app.twilioMessageSid}`);
      }
      if (app.cancelledBy) {
        console.log(`   Cancellato da: ${app.cancelledBy}`);
        console.log(`   Cancellato il: ${app.cancelledAt}`);
      }
      console.log(`   Creato: ${app.createdAt}`);
      console.log(`   Aggiornato: ${app.updatedAt}`);
    });

    // Statistiche generali
    const stats = {
      totale: appuntamenti.length,
      confermati: appuntamenti.filter(a => a.stato === 'confermato').length,
      cancellati: appuntamenti.filter(a => a.stato === 'cancellato').length,
      promemoriInviati: appuntamenti.filter(a => a.reminderSent).length,
      promemoriDaInviare: appuntamenti.filter(a => !a.reminderSent && a.stato === 'confermato').length
    };

    console.log('\n STATISTICHE:');
    console.log(`   Totale appuntamenti: ${stats.totale}`);
    console.log(`   Confermati: ${stats.confermati}`);
    console.log(`   Cancellati: ${stats.cancellati}`);
    console.log(`   Promemoria inviati: ${stats.promemoriInviati}`);
    console.log(`   Promemoria da inviare: ${stats.promemoriDaInviare}`);

    // Verifica appuntamenti nelle prossime 24h
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowStart = new Date(in24Hours.getTime() - 5 * 60 * 1000);
    const windowEnd = new Date(in24Hours.getTime() + 5 * 60 * 1000);

    const appuntamenti24h = await Appuntamento.find({
      reminderSent: false,
      stato: 'confermato',
      data: {
        $gte: windowStart,
        $lte: windowEnd
      }
    });

    console.log('\n SCHEDULER 24H:');
    console.log(`   Finestra temporale: ${windowStart.toISOString()} - ${windowEnd.toISOString()}`);
    console.log(`   Appuntamenti da processare: ${appuntamenti24h.length}`);
    
    if (appuntamenti24h.length > 0) {
      console.log('    Lo scheduler invierà promemoria per:');
      appuntamenti24h.forEach(app => {
        console.log(`   - ${app.utente.nome} ${app.utente.cognome} (${app.utente.telefono}) - ${app.data}`);
      });
    }

  } catch (error) {
    console.error(' Errore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n Disconnesso dal database');
  }
}

verificaAppuntamenti();