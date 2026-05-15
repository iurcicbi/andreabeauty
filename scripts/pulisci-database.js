/**
 * Script per pulire il database e rimuovere le vecchie collections
 * 
 * Uso: node scripts/pulisci-database.js
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautysalon';

async function pulisciDatabase() {
  try {
    console.log('🔄 Connessione a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connesso a MongoDB\n');

    const db = mongoose.connection.db;

    // Lista tutte le collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections trovate:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Elimina le vecchie collections
    const vecchieCollections = ['utentes', 'servizios', 'appuntamentos'];
    
    for (const collectionName of vecchieCollections) {
      const exists = collections.find(c => c.name === collectionName);
      if (exists) {
        await db.dropCollection(collectionName);
        console.log(`🗑️  Eliminata collection: ${collectionName}`);
      }
    }

    console.log('\n✅ Database pulito!');
    console.log('\n🚀 Ora esegui: npm run setup');

    await mongoose.disconnect();
    console.log('🔌 Disconnesso da MongoDB');
  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

pulisciDatabase();
