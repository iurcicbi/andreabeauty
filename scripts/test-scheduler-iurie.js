/**
 * TEST SCHEDULER PER APPUNTAMENTO IURIE
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

async function testSchedulerIurie() {
  try {
    console.log('⏰ Test Scheduler per appuntamento Iurie');
    
    await mongoose.connect('mongodb://localhost:27017/barbershop');
    console.log('✅ Connesso al database');

    // Trova l'appuntamento di Iurie
    const appuntamentoIurie = await Appuntamento.findOne({
      'utente.nome': 'Iurie',
      'utente.cognome': 'Nichita',
      'utente.telefono': '+393288625535'
    });

    if (!appuntamentoIurie) {
      console.log('❌ Appuntamento di Iurie non trovato');
      return;
    }

    console.log('📅 Appuntamento Iurie trovato:', {
      id: appuntamentoIurie._id,
      cliente: `${appuntamentoIurie.utente.nome} ${appuntamentoIurie.utente.cognome}`,
      telefono: appuntamentoIurie.utente.telefono,
      data: appuntamentoIurie.data,
      ora: appuntamentoIurie.oraInizio,
      stato: appuntamentoIurie.stato,
      reminderSent: appuntamentoIurie.reminderSent
    });

    // Simula la logica dello scheduler
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const windowStart = new Date(in24Hours.getTime() - 5 * 60 * 1000); // -5 minuti
    const windowEnd = new Date(in24Hours.getTime() + 5 * 60 * 1000);   // +5 minuti

    console.log('\n🕐 Analisi finestra temporale scheduler:');
    console.log('Ora attuale:', now.toISOString());
    console.log('24h nel futuro:', in24Hours.toISOString());
    console.log('Finestra inizio:', windowStart.toISOString());
    console.log('Finestra fine:', windowEnd.toISOString());
    console.log('Appuntamento Iurie:', appuntamentoIurie.data.toISOString());

    // Verifica se l'appuntamento è nella finestra
    const dataAppuntamento = new Date(appuntamentoIurie.data);
    const nellaFinestra = dataAppuntamento >= windowStart && dataAppuntamento <= windowEnd;

    console.log('\n📊 Verifica criteri scheduler:');
    console.log('✓ reminderSent:', appuntamentoIurie.reminderSent === false ? '✅ false (OK)' : '❌ true (NON OK)');
    console.log('✓ stato:', appuntamentoIurie.stato === 'confermato' ? '✅ confermato (OK)' : `❌ ${appuntamentoIurie.stato} (NON OK)`);
    console.log('✓ telefono formato:', appuntamentoIurie.utente.telefono.startsWith('+') ? '✅ E.164 (OK)' : '❌ formato non valido');
    console.log('✓ nella finestra 24h:', nellaFinestra ? '✅ SI (OK)' : '❌ NO (NON OK)');

    // Cerca tutti gli appuntamenti che lo scheduler troverebbe
    const appuntamentiScheduler = await Appuntamento.find({
      reminderSent: false,
      stato: 'confermato',
      data: {
        $gte: windowStart,
        $lte: windowEnd
      }
    });

    console.log(`\n📋 Appuntamenti che lo scheduler troverebbe: ${appuntamentiScheduler.length}`);
    appuntamentiScheduler.forEach((app, index) => {
      console.log(`${index + 1}. ${app.utente.nome} ${app.utente.cognome} (${app.utente.telefono}) - ${app.data}`);
    });

    // Verifica se Iurie è tra questi
    const iurieNellaLista = appuntamentiScheduler.some(app => 
      app.utente.nome === 'Iurie' && app.utente.cognome === 'Nichita'
    );

    console.log('\n🎯 RISULTATO:');
    if (iurieNellaLista) {
      console.log('✅ L\'appuntamento di Iurie SARÀ processato dallo scheduler');
      console.log('📱 Il promemoria verrà inviato automaticamente quando sarà il momento giusto');
    } else {
      console.log('❌ L\'appuntamento di Iurie NON sarà processato dallo scheduler');
      console.log('🔍 Verifica i criteri sopra per capire perché');
    }

    // Calcola quando dovrebbe essere inviato il promemoria
    const dataAppuntamentoIurie = new Date(appuntamentoIurie.data);
    const oraPromemoria = new Date(dataAppuntamentoIurie.getTime() - 24 * 60 * 60 * 1000);
    
    console.log('\n⏰ TIMING PROMEMORIA:');
    console.log('Appuntamento:', dataAppuntamentoIurie.toLocaleString('it-IT'));
    console.log('Promemoria dovrebbe essere inviato:', oraPromemoria.toLocaleString('it-IT'));
    
    const minutiMancanti = Math.round((oraPromemoria.getTime() - now.getTime()) / (1000 * 60));
    if (minutiMancanti > 0) {
      console.log(`⏳ Mancano ${minutiMancanti} minuti al momento dell'invio`);
    } else {
      console.log(`⚠️ Il momento dell'invio è già passato di ${Math.abs(minutiMancanti)} minuti`);
    }

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnesso dal database');
  }
}

testSchedulerIurie();