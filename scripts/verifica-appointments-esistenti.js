/**
 * VERIFICA APPUNTAMENTI ESISTENTI NELLA COLLECTION APPOINTMENTS
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

async function verificaAppuntamentiEsistenti() {
  try {
    console.log('📋 Verifica tutti gli appuntamenti nella collection "appointments"');
    
    await mongoose.connect('mongodb://localhost:27017/barbershop');
    console.log('✅ Connesso al database');

    // Trova tutti gli appuntamenti
    const tuttiAppuntamenti = await Appuntamento.find({}).sort({ created_at: -1 });

    console.log(`\n📊 Trovati ${tuttiAppuntamenti.length} appuntamenti totali nella collection "appointments":`);
    
    if (tuttiAppuntamenti.length === 0) {
      console.log('❌ Nessun appuntamento trovato nella collection "appointments"');
      console.log('💡 Probabilmente gli appuntamenti sono in un\'altra collection o con schema diverso');
      
      // Verifica altre possibili collection
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('\n📁 Collection disponibili nel database:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      
      return;
    }
    
    tuttiAppuntamenti.forEach((app, index) => {
      console.log(`\n${index + 1}. Appuntamento ID: ${app._id}`);
      console.log(`   Cliente: ${app.utente?.nome || 'N/A'} ${app.utente?.cognome || 'N/A'}`);
      console.log(`   Telefono: ${app.utente?.telefono || 'N/A'}`);
      console.log(`   Email: ${app.utente?.email || 'N/A'}`);
      console.log(`   Data: ${app.data || 'N/A'}`);
      console.log(`   Ora: ${app.oraInizio || 'N/A'} - ${app.oraFine || 'N/A'}`);
      console.log(`   Stato: ${app.stato || 'N/A'}`);
      console.log(`   Note: ${app.note || 'N/A'}`);
      console.log(`   Promemoria inviato: ${app.reminderSent || false}`);
      if (app.reminderSentAt) {
        console.log(`   Promemoria inviato il: ${app.reminderSentAt}`);
      }
      if (app.twilioMessageSid) {
        console.log(`   Twilio Message SID: ${app.twilioMessageSid}`);
      }
      console.log(`   Creato: ${app.created_at || app.createdAt || 'N/A'}`);
      console.log(`   Aggiornato: ${app.updated_at || app.updatedAt || 'N/A'}`);
    });

    // Statistiche
    const stats = {
      totale: tuttiAppuntamenti.length,
      confermati: tuttiAppuntamenti.filter(a => a.stato === 'confermato').length,
      inAttesa: tuttiAppuntamenti.filter(a => a.stato === 'in_attesa').length,
      cancellati: tuttiAppuntamenti.filter(a => a.stato === 'cancellato').length,
      completati: tuttiAppuntamenti.filter(a => a.stato === 'completato').length,
      conTelefono: tuttiAppuntamenti.filter(a => a.utente?.telefono).length,
      promemoriInviati: tuttiAppuntamenti.filter(a => a.reminderSent).length
    };

    console.log('\n📈 STATISTICHE GENERALI:');
    console.log(`   Totale appuntamenti: ${stats.totale}`);
    console.log(`   In attesa: ${stats.inAttesa}`);
    console.log(`   Confermati: ${stats.confermati}`);
    console.log(`   Completati: ${stats.completati}`);
    console.log(`   Cancellati: ${stats.cancellati}`);
    console.log(`   Con numero telefono: ${stats.conTelefono}`);
    console.log(`   Promemoria già inviati: ${stats.promemoriInviati}`);

    // Trova appuntamenti candidati per promemoria
    const appuntamentiConTelefono = tuttiAppuntamenti.filter(a => 
      a.utente?.telefono && 
      a.stato === 'confermato' && 
      !a.reminderSent &&
      new Date(a.data) > new Date()
    );

    console.log(`\n📱 CANDIDATI PER PROMEMORIA WHATSAPP: ${appuntamentiConTelefono.length}`);
    appuntamentiConTelefono.forEach(app => {
      console.log(`   - ${app.utente.nome} ${app.utente.cognome} (${app.utente.telefono}) - ${app.data}`);
    });

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnesso dal database');
  }
}

verificaAppuntamentiEsistenti();