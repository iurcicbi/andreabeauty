/**
 * Script per creare un utente barber di test
 * 
 * Uso: node scripts/crea-barber-test.js
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connessione MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barbershop';

async function creaBarberTest() {
  try {
    console.log('🔄 Connessione a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connesso a MongoDB');

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
    const esistente = await Utente.findOne({ email: 'barber@test.com' });
    
    if (esistente) {
      console.log('⚠️  Utente barber già esistente');
      console.log('📧 Email: barber@test.com');
      console.log('🔑 Password: password123');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // Crea utente barber
    const barber = await Utente.create({
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'barber@test.com',
      password: passwordHash,
      telefono: '1234567890',
      ruolo: 'barber',
      attivo: true,
    });

    console.log('✅ Utente barber creato con successo!');
    console.log('');
    console.log('📋 Dettagli:');
    console.log('   Nome: Mario Rossi');
    console.log('   Email: barber@test.com');
    console.log('   Password: password123');
    console.log('   Ruolo: barber');
    console.log('');
    console.log('🚀 Ora puoi accedere al CMS:');
    console.log('   http://localhost:3000/login');

    await mongoose.disconnect();
    console.log('🔌 Disconnesso da MongoDB');
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  }
}

creaBarberTest();
