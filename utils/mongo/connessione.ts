/**
 * CONNESSIONE MONGODB
 * 
 * Questo file gestisce la connessione al database MongoDB.
 * Utilizza un pattern singleton per evitare connessioni multiple.
 * 
 * LOGICA:
 * 1. Verifica se esiste già una connessione attiva
 * 2. Se non esiste, crea una nuova connessione
 * 3. Memorizza la connessione in cache per riutilizzarla
 * 
 * PERCHÉ QUESTO APPROCCIO?
 * - Next.js in development ricarica i moduli frequentemente
 * - Senza cache, creeremmo troppe connessioni al database
 * - Il pattern singleton garantisce una sola connessione attiva
 */

import mongoose from 'mongoose';

// Pre-registrazione schemi per garantire disponibilità in tutte le route
// Necessario perché Next.js compila ogni route in isolamento
import '@/utils/mongo/schemi/Appuntamento';
import '@/utils/mongo/schemi/Specialist';
import '@/utils/mongo/schemi/Servizio';
import '@/utils/mongo/schemi/Utente';

// Interfaccia per il tipo di cache globale
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Estensione del tipo global per includere la cache mongoose
declare global {
  var mongoose: MongooseCache | undefined;
}

/**
 * Cache globale per la connessione MongoDB
 * Persiste tra i ricaricamenti in development
 */
let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Funzione principale per connettersi a MongoDB
 * 
 * FLUSSO:
 * 1. Controlla se esiste già una connessione attiva → ritorna quella
 * 2. Controlla se c'è una promessa di connessione in corso → aspetta quella
 * 3. Altrimenti crea una nuova connessione
 * 
 * @returns Promise con l'istanza mongoose connessa
 */
async function connessioneMongoDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI || '';
  if (!MONGODB_URI) {
    throw new Error(
      '⚠️ ERRORE: Definisci la variabile MONGODB_URI nel file .env'
    );
  }

  // Se abbiamo già una connessione attiva, riutilizzala
  if (cached.conn) {
    console.log(' Utilizzo connessione MongoDB esistente');
    return cached.conn;
  }

  // Se non c'è una promessa di connessione, creala
  if (!cached.promise) {
    const opzioni = {
      bufferCommands: false, // Disabilita il buffering dei comandi
      maxPoolSize: 10, // Massimo 10 connessioni nel pool
      serverSelectionTimeoutMS: 5000, // Timeout di 5 secondi
      socketTimeoutMS: 45000, // Timeout socket di 45 secondi
    };

    console.log(' Creazione nuova connessione MongoDB...');
    
    // Crea la promessa di connessione
    cached.promise = mongoose.connect(MONGODB_URI, opzioni).then((mongoose) => {
      console.log(' Connessione MongoDB stabilita con successo');
      return mongoose;
    });
  }

  try {
    // Aspetta che la connessione sia completata
    cached.conn = await cached.promise;
  } catch (errore) {
    // In caso di errore, resetta la promessa per permettere un nuovo tentativo
    cached.promise = null;
    console.error(' Errore connessione MongoDB:', errore);
    throw errore;
  }

  return cached.conn;
}

/**
 * Funzione per disconnettersi da MongoDB
 * Utile per test o per chiusura pulita dell'applicazione
 */
export async function disconnessioneMongoDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log(' Disconnessione MongoDB completata');
  }
}

/**
 * Funzione per verificare lo stato della connessione
 * 
 * @returns true se connesso, false altrimenti
 */
export function isConnesso(): boolean {
  return cached.conn !== null && mongoose.connection.readyState === 1;
}

export default connessioneMongoDB;
