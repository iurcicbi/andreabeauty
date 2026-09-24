/**
 * Script per setup completo del database
 * Crea utente specialist + servizi di esempio
 * 
 * Uso: node scripts/setup-completo.js
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connessione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautysalon';

async function setupCompleto() {
  try {
    console.log(' SETUP COMPLETO DATABASE');
    console.log('\n');
    
    console.log(' Connessione a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(' Connesso a MongoDB\n');

    // ==================== UTENTE SPECIALIST ====================
    console.log(' CREAZIONE UTENTE SPECIALIST');
    console.log('');
    
    const UtenteSchema = new mongoose.Schema({
      nome: String,
      cognome: String,
      email: String,
      password: String,
      telefono: String,
      ruolo: String,
      attivo: Boolean,
    }, { timestamps: true });

    const Utente = mongoose.models.users || mongoose.model('users', UtenteSchema);

    // Verifica se esiste già
    const specialistEsistente = await Utente.findOne({ email: 'specialist@test.com' });
    
    if (specialistEsistente) {
      console.log('  Utente specialist già esistente');
      console.log(' Email: specialist@test.com');
      console.log(' Password: password123\n');
    } else {
      // Hash password
      console.log(' Hashing password...');
      const passwordHash = await bcrypt.hash('password123', 10);

      // Crea utente specialist
      const specialist = await Utente.create({
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'specialist@test.com',
        password: passwordHash,
        telefono: '3331234567',
        ruolo: 'specialist',
        attivo: true,
      });

      console.log(' Utente specialist creato con successo!');
      console.log(' Email: specialist@test.com');
      console.log(' Password: password123\n');
    }

    // ==================== UTENTE NORMALE ====================
    console.log(' CREAZIONE UTENTE NORMALE (per test)');
    console.log('');
    
    const utenteEsistente = await Utente.findOne({ email: 'utente@test.com' });
    
    if (utenteEsistente) {
      console.log('  Utente normale già esistente');
      console.log(' Email: utente@test.com');
      console.log(' Password: password123\n');
    } else {
      const passwordHashUtente = await bcrypt.hash('password123', 10);

      await Utente.create({
        nome: 'Luigi',
        cognome: 'Verdi',
        email: 'utente@test.com',
        password: passwordHashUtente,
        telefono: '3339876543',
        ruolo: 'utente',
        attivo: true,
      });

      console.log(' Utente normale creato con successo!');
      console.log(' Email: utente@test.com');
      console.log(' Password: password123\n');
    }

    // ==================== SERVIZI ====================
    console.log('  CREAZIONE SERVIZI');
    console.log('');
    
    const ServizioSchema = new mongoose.Schema({
      nome: String,
      descrizione: String,
      durata: Number,
      prezzo: Number,
      categoria: String,
      attivo: Boolean,
    }, { timestamps: true });

    const Servizio = mongoose.models.services || mongoose.model('services', ServizioSchema);

    const countServizi = await Servizio.countDocuments();
    
    if (countServizi > 0) {
      console.log(`  Esistono già ${countServizi} servizi nel database\n`);
    } else {
      const servizi = [
        {
          nome: 'Taglio Capelli Classico',
          descrizione: 'Taglio classico con rifinitura e styling professionale',
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
          descrizione: 'Trattamento nutriente e ristrutturante per capelli',
          durata: 40,
          prezzo: 30,
          categoria: 'trattamenti',
          attivo: true,
        },
        {
          nome: 'Colorazione Completa',
          descrizione: 'Colorazione completa con prodotti di alta qualità',
          durata: 60,
          prezzo: 50,
          categoria: 'colorazione',
          attivo: true,
        },
        {
          nome: 'Taglio Bambino',
          descrizione: 'Taglio dedicato ai più piccoli in ambiente accogliente',
          durata: 20,
          prezzo: 15,
          categoria: 'capelli',
          attivo: true,
        },
      ];

      const risultato = await Servizio.insertMany(servizi);
      console.log(` ${risultato.length} servizi creati con successo!\n`);
    }

    // ==================== RIEPILOGO ====================
    console.log('\n');
    console.log(' SETUP COMPLETATO CON SUCCESSO!');
    console.log('\n');

    console.log(' CREDENZIALI ACCESSO:\n');
    
    console.log(' SPECIALIST (Accesso CMS):');
    console.log('   Email:    specialist@test.com');
    console.log('   Password: password123');
    console.log('   URL:      http://localhost:3000/cms\n');

    console.log(' UTENTE NORMALE:');
    console.log('   Email:    utente@test.com');
    console.log('   Password: password123');
    console.log('   URL:      http://localhost:3000/booking\n');

    const totalServizi = await Servizio.countDocuments();
    console.log(`  SERVIZI: ${totalServizi} servizi disponibili`);
    console.log('   URL:      http://localhost:3000/servizi\n');

    console.log('');
    console.log(' PROSSIMI PASSI:\n');
    console.log('1. Avvia il server: npm run dev');
    console.log('2. Apri: http://localhost:3000');
    console.log('3. Accedi al CMS: http://localhost:3000/cms');
    console.log('4. Usa le credenziali sopra per il login');
    console.log('\n');

    await mongoose.disconnect();
    console.log(' Disconnesso da MongoDB');
    
  } catch (error) {
    console.error('\n ERRORE:', error.message);
    console.error('\n SUGGERIMENTI:');
    console.error('   - Verifica che MongoDB sia avviato: mongod');
    console.error('   - Controlla la stringa di connessione in .env');
    console.error('   - Verifica che la porta MongoDB sia corretta (27017)\n');
    process.exit(1);
  }
}

setupCompleto();
