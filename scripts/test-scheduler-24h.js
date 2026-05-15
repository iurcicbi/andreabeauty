/**
 * TEST SCHEDULER 24H - Crea appuntamento esattamente 24h nel futuro
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

async function testScheduler24h() {
  try {
    console.log('🕐 Test Scheduler 24h - Creazione appuntamento per promemoria automatico');
    
    await mongoose.connect('mongodb://localhost:27017/beautysalon');
    console.log('✅ Connesso al database');

    // Crea appuntamento esattamente 24 ore nel futuro
    const ora24h = new Date();
    ora24h.setTime(ora24h.getTime() + 24 * 60 * 60 * 1000); // +24 ore esatte
    
    console.log('🕐 Ora attuale:', new Date().toISOString());
    console.log('🕐 Appuntamento 24h:', ora24h.toISOString());

    // Elimina eventuali appuntamenti di test precedenti per questo orario
    await Appuntamento.deleteMany({
      'utente.telefono': '+393288625535',
      reminderSent: false
    });

    const appuntamento24h = new Appuntamento({
      utente: {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@email.com',
        telefono: '+393288625535'
      },
      data: ora24h,
      oraInizio: ora24h.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      oraFine: new Date(ora24h.getTime() + 60 * 60 * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      stato: 'confermato',
      reminderSent: false
    });

    await appuntamento24h.save();
    console.log('✅ Appuntamento 24h creato:', {
      id: appuntamento24h._id,
      cliente: `${appuntamento24h.utente.nome} ${appuntamento24h.utente.cognome}`,
      telefono: appuntamento24h.utente.telefono,
      data: appuntamento24h.data,
      ora: appuntamento24h.oraInizio,
      reminderSent: appuntamento24h.reminderSent
    });

    // Verifica che lo scheduler lo trovi
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowStart = new Date(in24Hours.getTime() - 5 * 60 * 1000); // -5 minuti
    const windowEnd = new Date(in24Hours.getTime() + 5 * 60 * 1000);   // +5 minuti

    console.log('\n🔍 Verifica finestra scheduler:');
    console.log('Window Start:', windowStart.toISOString());
    console.log('Appuntamento:', ora24h.toISOString());
    console.log('Window End:', windowEnd.toISOString());

    const appuntamentiTrovati = await Appuntamento.find({
      reminderSent: false,
      stato: 'confermato',
      data: {
        $gte: windowStart,
        $lte: windowEnd
      }
    });

    console.log(`\n📋 Appuntamenti trovati dallo scheduler: ${appuntamentiTrovati.length}`);
    
    if (appuntamentiTrovati.length > 0) {
      console.log('✅ Lo scheduler dovrebbe trovare questo appuntamento nel prossimo ciclo');
      console.log('⏰ Lo scheduler gira ogni minuto automaticamente');
      console.log('📱 Il promemoria verrà inviato automaticamente quando sarà il momento');
    } else {
      console.log('❌ Lo scheduler non trova l\'appuntamento - verifica la logica temporale');
    }

    console.log('\n🎯 ISTRUZIONI:');
    console.log('1. Questo appuntamento è stato creato per essere trovato dallo scheduler automatico');
    console.log('2. Lo scheduler gira ogni minuto e controllerà appuntamenti 24h nel futuro');
    console.log('3. Quando sarà il momento giusto, invierà automaticamente il promemoria');
    console.log('4. Puoi monitorare i log del server per vedere quando accade');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnesso dal database');
  }
}

testScheduler24h();