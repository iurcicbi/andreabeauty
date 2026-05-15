/**
 * CORREGGI ORARIO APPUNTAMENTO IURIE
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

async function correggiOrarioAppuntamento() {
  try {
    console.log('🕐 Correzione orario appuntamento Iurie');
    
    await mongoose.connect('mongodb://localhost:27017/beautysalon');
    console.log('✅ Connesso al database');

    // Trova l'appuntamento di Iurie
    const appuntamento = await Appuntamento.findOne({
      'utente.nome': 'Iurie',
      'utente.cognome': 'Nichita',
      'utente.telefono': '+393288625535'
    });

    if (!appuntamento) {
      console.log('❌ Appuntamento di Iurie non trovato');
      return;
    }

    console.log('📅 Appuntamento attuale:', {
      id: appuntamento._id,
      cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
      dataVecchia: appuntamento.data,
      oraInizio: appuntamento.oraInizio,
      oraFine: appuntamento.oraFine
    });

    // Crea la data corretta: domani alle 19:47
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    domani.setHours(19, 47, 0, 0); // 19:47:00

    console.log('🔄 Aggiornamento a:', {
      dataNuova: domani,
      oraInizio: '19:47',
      oraFine: '19:50'
    });

    // Aggiorna l'appuntamento
    await Appuntamento.findByIdAndUpdate(appuntamento._id, {
      data: domani,
      oraInizio: '19:47',
      oraFine: '19:50'
    });

    console.log('✅ Appuntamento aggiornato con successo');

    // Verifica l'aggiornamento
    const appuntamentoAggiornato = await Appuntamento.findById(appuntamento._id);
    console.log('📋 Verifica aggiornamento:', {
      id: appuntamentoAggiornato._id,
      cliente: `${appuntamentoAggiornato.utente.nome} ${appuntamentoAggiornato.utente.cognome}`,
      data: appuntamentoAggiornato.data,
      oraInizio: appuntamentoAggiornato.oraInizio,
      oraFine: appuntamentoAggiornato.oraFine,
      stato: appuntamentoAggiornato.stato,
      reminderSent: appuntamentoAggiornato.reminderSent
    });

    // Verifica se ora è nella finestra scheduler
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowStart = new Date(in24Hours.getTime() - 5 * 60 * 1000);
    const windowEnd = new Date(in24Hours.getTime() + 5 * 60 * 1000);

    const nellaFinestra = appuntamentoAggiornato.data >= windowStart && appuntamentoAggiornato.data <= windowEnd;

    console.log('\n⏰ VERIFICA SCHEDULER:');
    console.log('Finestra scheduler:', windowStart.toISOString(), '-', windowEnd.toISOString());
    console.log('Appuntamento:', appuntamentoAggiornato.data.toISOString());
    console.log('Nella finestra 24h:', nellaFinestra ? '✅ SI' : '❌ NO');

    if (nellaFinestra) {
      console.log('\n🎉 PERFETTO!');
      console.log('✅ L\'appuntamento ora sarà processato dallo scheduler');
      console.log('📱 Il promemoria verrà inviato automaticamente');
    } else {
      const minutiMancanti = Math.round((windowStart.getTime() - now.getTime()) / (1000 * 60));
      console.log(`\n⏳ L'appuntamento entrerà nella finestra scheduler tra ${minutiMancanti} minuti`);
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnesso dal database');
  }
}

correggiOrarioAppuntamento();