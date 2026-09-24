/**
 * Script per creare servizi di test
 * 
 * Uso: node scripts/crea-servizi-test.js
 */

const mongoose = require('mongoose');

// Connessione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautysalon';

async function creaServiziTest() {
  try {
    console.log(' Connessione a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(' Connesso a MongoDB');

    // Schema Servizio semplificato
    const ServizioSchema = new mongoose.Schema({
      nome: String,
      descrizione: String,
      durata: Number,
      prezzo: Number,
      categoria: String,
      attivo: Boolean,
    }, { timestamps: true });

    const Servizio = mongoose.models.services || mongoose.model('services', ServizioSchema);

    // Servizi di esempio
    const servizi = [
      {
        nome: 'Taglio Capelli Classico',
        descrizione: 'Taglio classico con rifinitura e styling',
        durata: 30,
        prezzo: 25,
        categoria: 'capelli',
        attivo: true,
      },
      {
        nome: 'Taglio + Barba',
        descrizione: 'Taglio capelli completo + rasatura e rifinitura barba',
        durata: 45,
        prezzo: 35,
        categoria: 'capelli',
        attivo: true,
      },
      {
        nome: 'Barba',
        descrizione: 'Rasatura e rifinitura barba con prodotti professionali',
        durata: 20,
        prezzo: 15,
        categoria: 'barba',
        attivo: true,
      },
      {
        nome: 'Trattamento Capelli',
        descrizione: 'Trattamento nutriente e ristrutturante',
        durata: 40,
        prezzo: 30,
        categoria: 'trattamenti',
        attivo: true,
      },
      {
        nome: 'Colorazione',
        descrizione: 'Colorazione completa con prodotti di qualità',
        durata: 60,
        prezzo: 50,
        categoria: 'colorazione',
        attivo: true,
      },
    ];

    // Verifica se esistono già servizi
    const count = await Servizio.countDocuments();
    
    if (count > 0) {
      console.log(`  Esistono già ${count} servizi nel database`);
      console.log('Vuoi eliminarli e ricrearli? (Ctrl+C per annullare)');
      
      // Aspetta 3 secondi
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await Servizio.deleteMany({});
      console.log('  Servizi esistenti eliminati');
    }

    // Crea i servizi
    console.log(' Creazione servizi...');
    const risultato = await Servizio.insertMany(servizi);

    console.log(` ${risultato.length} servizi creati con successo!`);
    console.log('');
    console.log(' Servizi creati:');
    risultato.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.nome} - €${s.prezzo} (${s.durata} min)`);
    });
    console.log('');
    console.log(' Visualizza i servizi su:');
    console.log('   http://localhost:3000/servizi');

    await mongoose.disconnect();
    console.log(' Disconnesso da MongoDB');
  } catch (error) {
    console.error(' Errore:', error);
    process.exit(1);
  }
}

creaServiziTest();
