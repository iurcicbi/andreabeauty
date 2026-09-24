/**
 * ============================================================================
 * SCRIPT MIGRAZIONE: Da Barber a Specialisti
 * ============================================================================
 * 
 * Questo script migra i dati esistenti dal vecchio sistema al nuovo
 * sistema beauty salon con relazioni many-to-many.
 * 
 * COSA FA:
 * 1. Copia tutti i barber (legacy) come specialisti
 * 2. Crea associazioni specialista-servizio (tutti con tutti per retrocompatibilità)
 * 3. Aggiorna appuntamenti esistenti con campo specialista
 * 
 * COME ESEGUIRE:
 * node scripts/migra-specialisti.js
 * 
 * PREREQUISITI:
 * - Database MongoDB accessibile
 * - Variabili ambiente configurate (.env)
 * - Backup del database effettuato
 * ============================================================================
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importa schemi
const Barber = require('../utils/mongo/schemi/Barber').default;
const Specialista = require('../utils/mongo/schemi/Specialista').default;
const SpecialistaServizio = require('../utils/mongo/schemi/SpecialistaServizio').default;
const Servizio = require('../utils/mongo/schemi/Servizio').default;
const Appuntamento = require('../utils/mongo/schemi/Appuntamento').default;

// Connessione MongoDB
async function connetti() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI non trovato nelle variabili ambiente');
    }
    
    await mongoose.connect(mongoUri);
    console.log(' Connesso a MongoDB');
  } catch (error) {
    console.error(' Errore connessione MongoDB:', error);
    throw error;
  }
}

// Funzione principale di migrazione
async function migraDati() {
  try {
    console.log('\n INIZIO MIGRAZIONE DA BARBER A SPECIALISTI\n');
    console.log('=' .repeat(60));
    
    // ========================================================================
    // STEP 1: Migra Barber → Specialisti
    // ========================================================================
    console.log('\n STEP 1: Migrazione Barber  Specialisti');
    console.log('-'.repeat(60));
    
    const barbers = await Barber.find({}).populate('utente', 'nome cognome');
    console.log(`Trovati ${barbers.length} barber (legacy) da migrare`);
    
    if (barbers.length === 0) {
      console.log('  Nessun barber (legacy) trovato. Migrazione non necessaria.');
      return;
    }
    
    const mappaBarberSpecialista = new Map();
    let specialistiCreati = 0;
    let specialistiEsistenti = 0;
    
    for (const barber of barbers) {
      // Verifica se lo specialista esiste già
      const specialistaEsistente = await Specialista.findOne({ utente: barber.utente });
      
      if (specialistaEsistente) {
        console.log(`  Specialista già esistente per utente ${barber.utente} - skip`);
        mappaBarberSpecialista.set(barber._id.toString(), specialistaEsistente._id);
        specialistiEsistenti++;
        continue;
      }
      
      // Crea nuovo specialista
      const specialista = await Specialista.create({
        utente: barber.utente,
        biografia: barber.biografia || '',
        descrizioneCompetenze: Array.isArray(barber.specializzazioni) 
          ? barber.specializzazioni.join(', ') 
          : '',
        telefono: barber.telefono,
        orariSettimanali: barber.orariSettimanali,
        giorniChiusura: barber.giorniChiusura || [],
        impostazioni: barber.impostazioni || {
          anticipoMinimo: 2,
          durataSlot: 15,
          maxAppuntamentiGiorno: 0,
        },
        attivo: barber.attivo !== false,
      });
      
      mappaBarberSpecialista.set(barber._id.toString(), specialista._id);
      specialistiCreati++;
      
      const nomeUtente = barber.utente?.nome || 'N/A';
      const cognomeUtente = barber.utente?.cognome || 'N/A';
      console.log(` Creato specialista: ${nomeUtente} ${cognomeUtente} (${specialista._id})`);
    }
    
    console.log(`\n Riepilogo Step 1:`);
    console.log(`   - Specialisti creati: ${specialistiCreati}`);
    console.log(`   - Specialisti già esistenti: ${specialistiEsistenti}`);
    console.log(`   - Totale mappati: ${mappaBarberSpecialista.size}`);
    
    // ========================================================================
    // STEP 2: Crea Associazioni Specialista-Servizio
    // ========================================================================
    console.log('\n STEP 2: Creazione Associazioni Specialista-Servizio');
    console.log('-'.repeat(60));
    
    const servizi = await Servizio.find({ attivo: true });
    console.log(`Trovati ${servizi.length} servizi attivi`);
    
    if (servizi.length === 0) {
      console.log('  Nessun servizio attivo trovato. Skip associazioni.');
    } else {
      let associazioniCreate = 0;
      let associazioniEsistenti = 0;
      
      for (const [barberId, specialistaId] of mappaBarberSpecialista) {
        for (const servizio of servizi) {
          // Verifica se l'associazione esiste già
          const associazioneEsistente = await SpecialistaServizio.findOne({
            specialista: specialistaId,
            servizio: servizio._id,
          });
          
          if (associazioneEsistente) {
            associazioniEsistenti++;
            continue;
          }
          
          // Crea nuova associazione
          await SpecialistaServizio.create({
            specialista: specialistaId,
            servizio: servizio._id,
            attivo: true,
            note: 'Migrazione automatica',
          });
          
          associazioniCreate++;
        }
        
        console.log(` Associati ${servizi.length} servizi allo specialista ${specialistaId}`);
      }
      
      console.log(`\n Riepilogo Step 2:`);
      console.log(`   - Associazioni create: ${associazioniCreate}`);
      console.log(`   - Associazioni già esistenti: ${associazioniEsistenti}`);
    }
    
    // ========================================================================
    // STEP 3: Aggiorna Appuntamenti
    // ========================================================================
    console.log('\n STEP 3: Aggiornamento Appuntamenti');
    console.log('-'.repeat(60));
    
    const appuntamenti = await Appuntamento.find({ 
      barber: { $exists: true },
      specialista: { $exists: false }
    });
    console.log(`Trovati ${appuntamenti.length} appuntamenti da aggiornare`);
    
    let appuntamentiAggiornati = 0;
    let appuntamentiNonAggiornati = 0;
    
    for (const app of appuntamenti) {
      const specialistaId = mappaBarberSpecialista.get(app.barber.toString());
      
      if (specialistaId) {
        await Appuntamento.updateOne(
          { _id: app._id },
          { $set: { specialista: specialistaId } }
        );
        appuntamentiAggiornati++;
      } else {
        console.log(`  Barber ${app.barber} non trovato nella mappa - appuntamento ${app._id} non aggiornato`);
        appuntamentiNonAggiornati++;
      }
    }
    
    console.log(`\n Riepilogo Step 3:`);
    console.log(`   - Appuntamenti aggiornati: ${appuntamentiAggiornati}`);
    console.log(`   - Appuntamenti non aggiornati: ${appuntamentiNonAggiornati}`);
    
    // ========================================================================
    // RIEPILOGO FINALE
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log(' MIGRAZIONE COMPLETATA CON SUCCESSO!');
    console.log('='.repeat(60));
    console.log(`
📊 RIEPILOGO COMPLETO:
   
   Specialisti:
   - Creati: ${specialistiCreati}
   - Già esistenti: ${specialistiEsistenti}
   - Totale: ${mappaBarberSpecialista.size}
   
   Associazioni Specialista-Servizio:
   - Servizi attivi: ${servizi.length}
   - Associazioni per specialista: ${servizi.length}
   
   Appuntamenti:
   - Aggiornati: ${appuntamentiAggiornati}
   - Non aggiornati: ${appuntamentiNonAggiornati}

✅ Il sistema è ora pronto per il nuovo flusso Beauty Salon!

📝 PROSSIMI PASSI:
   1. Verifica i dati nel database
   2. Testa le nuove API /api/specialisti
   3. Personalizza le associazioni servizi-specialisti nel CMS
   4. Aggiorna il frontend di prenotazione
   5. Testa il flusso completo di prenotazione
    `);
    
  } catch (error) {
    console.error('\n ERRORE DURANTE LA MIGRAZIONE:', error);
    console.error('\nStack trace:', error.stack);
    throw error;
  }
}

// Funzione per verificare lo stato prima della migrazione
async function verificaStato() {
  console.log('\n VERIFICA STATO ATTUALE');
  console.log('='.repeat(60));
  
  const barberCount = await Barber.countDocuments();
  const specialistaCount = await Specialista.countDocuments();
  const servizioCount = await Servizio.countDocuments({ attivo: true });
  const associazioneCount = await SpecialistaServizio.countDocuments();
  const appuntamentoCount = await Appuntamento.countDocuments();
  const appuntamentiConBarber = await Appuntamento.countDocuments({ barber: { $exists: true } });
  const appuntamentiConSpecialista = await Appuntamento.countDocuments({ specialista: { $exists: true } });
  
  console.log(`
📊 Stato Database:
   - Barber: ${barberCount}
   - Specialisti: ${specialistaCount}
   - Servizi attivi: ${servizioCount}
   - Associazioni specialista-servizio: ${associazioneCount}
   - Appuntamenti totali: ${appuntamentoCount}
   - Appuntamenti con barber: ${appuntamentiConBarber}
   - Appuntamenti con specialista: ${appuntamentiConSpecialista}
  `);
  
  if (specialistaCount > 0 || associazioneCount > 0) {
    console.log('  ATTENZIONE: Esistono già specialisti o associazioni nel database.');
    console.log('   La migrazione salterà i record esistenti.');
  }
  
  return {
    barberCount,
    specialistaCount,
    servizioCount,
    associazioneCount,
  };
}

// Funzione per conferma utente
async function chiediConferma() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question('\n❓ Vuoi procedere con la migrazione? (si/no): ', (risposta) => {
      readline.close();
      resolve(risposta.toLowerCase() === 'si' || risposta.toLowerCase() === 's');
    });
  });
}

// Esecuzione principale
async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('  SCRIPT MIGRAZIONE: BARBER  SPECIALISTI (BEAUTY SALON)');
    console.log('='.repeat(60));
    
    // Connetti al database
    await connetti();
    
    // Verifica stato
    await verificaStato();
    
    // Chiedi conferma (solo se non in modalità automatica)
    if (process.env.AUTO_MIGRATE !== 'true') {
      const conferma = await chiediConferma();
      if (!conferma) {
        console.log('\n Migrazione annullata dall\'utente.');
        process.exit(0);
      }
    }
    
    // Esegui migrazione
    await migraDati();
    
    // Disconnetti
    await mongoose.disconnect();
    console.log('\n Disconnesso da MongoDB');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n Errore fatale:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Avvia script
main();
