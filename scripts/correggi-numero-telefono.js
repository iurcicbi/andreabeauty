/**
 * CORREGGI FORMATO NUMERO TELEFONO PER WHATSAPP
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

async function correggiNumeroTelefono() {
  try {
    console.log(' Correzione formato numero telefono per WhatsApp');
    
    await mongoose.connect('mongodb://localhost:27017/beautysalon');
    console.log(' Connesso al database');

    // Trova l'appuntamento di Iurie
    const appuntamento = await Appuntamento.findOne({
      'utente.nome': 'Iurie',
      'utente.cognome': 'Nichita',
      'utente.telefono': '3288625535'
    });

    if (!appuntamento) {
      console.log(' Appuntamento di Iurie non trovato');
      return;
    }

    console.log(' Appuntamento trovato:', {
      id: appuntamento._id,
      cliente: `${appuntamento.utente.nome} ${appuntamento.utente.cognome}`,
      telefonoVecchio: appuntamento.utente.telefono,
      data: appuntamento.data,
      ora: appuntamento.oraInizio
    });

    // Aggiorna il numero in formato internazionale
    const numeroCorretto = '+39' + appuntamento.utente.telefono;
    
    await Appuntamento.findByIdAndUpdate(appuntamento._id, {
      'utente.telefono': numeroCorretto
    });

    console.log(' Numero telefono aggiornato:', {
      vecchio: '3288625535',
      nuovo: numeroCorretto
    });

    // Verifica l'aggiornamento
    const appuntamentoAggiornato = await Appuntamento.findById(appuntamento._id);
    console.log(' Verifica aggiornamento:', {
      id: appuntamentoAggiornato._id,
      cliente: `${appuntamentoAggiornato.utente.nome} ${appuntamentoAggiornato.utente.cognome}`,
      telefono: appuntamentoAggiornato.utente.telefono,
      stato: appuntamentoAggiornato.stato,
      reminderSent: appuntamentoAggiornato.reminderSent
    });

    console.log('\n NUMERO CORRETTO!');
    console.log(' Il sistema WhatsApp ora può trovare questo appuntamento');
    console.log(' Pronto per test promemoria');

  } catch (error) {
    console.error(' Errore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n Disconnesso dal database');
  }
}

correggiNumeroTelefono();