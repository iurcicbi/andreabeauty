/**
 * Script per creare un utente specialist di test
 * 
 * Uso: node scripts/setup-test-data.js
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connessione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautysalon';

async function creaSpecialistTest() {
  try {
    console.log(' Connessione a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(' Connesso a MongoDB');

    // Schema Utente semplificato
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
    const esistente = await Utente.findOne({ email: 'specialist@test.com' });
    
    if (esistente) {
      console.log('  Utente specialist già esistente');
      console.log(' Email: specialist@test.com');
      console.log(' Password: password123');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    console.log(' Hashing password...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // Crea utente specialist
    const specialist = await Utente.create({
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'specialist@test.com',
      password: passwordHash,
      telefono: '1234567890',
      ruolo: 'specialist',
      attivo: true,
    });

    console.log(' Utente specialist creato con successo!');
    console.log('');
    console.log(' Dettagli:');
    console.log('   Nome: Mario Rossi');
    console.log('   Email: specialist@test.com');
    console.log('   Password: password123');
    console.log('   Ruolo: specialist');
    console.log('');
    console.log(' Ora puoi accedere al CMS:');
    console.log('   http://localhost:3000/login');

    await mongoose.disconnect();
    console.log(' Disconnesso da MongoDB');
  } catch (error) {
    console.error(' Errore:', error);
    process.exit(1);
  }
}

creaSpecialistTest();
