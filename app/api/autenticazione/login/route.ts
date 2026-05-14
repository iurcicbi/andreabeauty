/**
 * ============================================================================
 * API: LOGIN UTENTE
 * ============================================================================
 * 
 * COSA FA:
 * Questa API gestisce il login degli utenti (sia normali che barber).
 * Verifica le credenziali e restituisce un token JWT per l'autenticazione.
 * 
 * ENDPOINT: POST /api/autenticazione/login
 * 
 * FLUSSO COMPLETO:
 * 1. Riceve email e password dal frontend
 * 2. Si connette al database MongoDB
 * 3. Cerca l'utente per email
 * 4. Verifica che la password sia corretta (usando bcrypt)
 * 5. Genera un token JWT (JSON Web Token)
 * 6. Restituisce utente e token al frontend
 * 
 * COSA SUCCEDE DOPO:
 * - Il frontend salva il token in localStorage
 * - Ogni richiesta successiva includerà questo token
 * - Il server può identificare l'utente dal token
 * 
 * SICUREZZA:
 * - Password mai salvate in chiaro (solo hash)
 * - Token JWT firmato (non può essere falsificato)
 * - Token scade dopo 7 giorni
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Utente from '@/utils/mongo/schemi/Utente';
import { generaToken } from '@/utils/middleware/autenticazione';
import bcrypt from 'bcryptjs';

/**
 * FUNZIONE POST
 * 
 * Next.js chiama automaticamente questa funzione quando riceve
 * una richiesta POST a /api/autenticazione/login
 * 
 * @param req - Oggetto richiesta HTTP (contiene email e password)
 * @returns Risposta JSON con utente e token (se successo) o errore
 */
export async function POST(req: NextRequest) {
  try {
    // ========================================================================
    // STEP 1: CONNESSIONE AL DATABASE
    // ========================================================================
    // Prima di fare qualsiasi operazione, dobbiamo connetterci a MongoDB
    // Questa funzione usa il pattern singleton (una sola connessione condivisa)
    await connessioneMongoDB();

    // ========================================================================
    // STEP 2: ESTRAZIONE DATI DALLA RICHIESTA
    // ========================================================================
    // req.json() legge il body della richiesta HTTP e lo converte in oggetto JavaScript
    // Il frontend ha inviato: { email: "...", password: "..." }
    const { email, password } = await req.json();
    
    // PERCHÉ await?
    // req.json() è asincrono (legge dati dalla rete)
    // await aspetta che i dati siano completamente ricevuti

    // ========================================================================
    // STEP 3: VALIDAZIONE BASE
    // ========================================================================
    // Controlliamo che email e password siano presenti
    // Se mancano, restituiamo errore 400 (Bad Request)
    if (!email || !password) {
      return NextResponse.json(
        { 
          successo: false, 
          errore: 'Email e password sono obbligatori' 
        },
        { status: 400 }  // 400 = Bad Request (dati mancanti o invalidi)
      );
    }

    // ========================================================================
    // STEP 4: RICERCA UTENTE NEL DATABASE
    // ========================================================================
    // Mongoose.findOne() cerca UN documento che corrisponde ai criteri
    const utente = await Utente.findOne({ 
      email: email.toLowerCase(),  // Convertiamo in minuscolo per confronto case-insensitive
      attivo: true                 // Solo utenti con account attivo
    });
    
    // COSA RESTITUISCE findOne()?
    // - Se trova l'utente: oggetto con tutti i dati
    // - Se non trova: null

    // Se l'utente non esiste
    if (!utente) {
      return NextResponse.json(
        { 
          successo: false, 
          errore: 'Credenziali non valide'  // Messaggio generico per sicurezza
        },
        { status: 401 }  // 401 = Unauthorized (non autenticato)
      );
    }

    // ========================================================================
    // STEP 5: VERIFICA PASSWORD
    // ========================================================================
    // bcrypt.compare() confronta la password in chiaro con l'hash salvato
    // 
    // COME FUNZIONA:
    // 1. Prende la password inserita dall'utente (es: "password123")
    // 2. La hasha con lo stesso algoritmo usato per salvare
    // 3. Confronta i due hash
    // 4. Restituisce true se corrispondono, false altrimenti
    //
    // PERCHÉ USARE bcrypt?
    // - Le password non sono mai salvate in chiaro nel database
    // - Se qualcuno ruba il database, non può leggere le password
    // - L'hash è irreversibile (non puoi tornare alla password originale)
    const passwordCorretta = await bcrypt.compare(password, utente.password);

    // Se la password è sbagliata
    if (!passwordCorretta) {
      return NextResponse.json(
        { 
          successo: false, 
          errore: 'Credenziali non valide' 
        },
        { status: 401 }
      );
    }

    // ========================================================================
    // STEP 6: GENERAZIONE TOKEN JWT
    // ========================================================================
    // JWT (JSON Web Token) è come un "biglietto" che prova l'identità dell'utente
    // 
    // STRUTTURA JWT:
    // header.payload.signature
    // 
    // PAYLOAD (dati che includiamo):
    // - id: identificativo univoco dell'utente
    // - email: email dell'utente
    // - ruolo: 'utente' o 'barber' (determina i permessi)
    //
    // FIRMA:
    // Il server firma il token con una chiave segreta (JWT_SECRET)
    // Questo garantisce che il token non possa essere falsificato
    const token = generaToken({
      id: utente._id.toString(),  // Convertiamo ObjectId in stringa
      email: utente.email,
      ruolo: utente.ruolo,
    });

    // ========================================================================
    // STEP 7: RISPOSTA DI SUCCESSO
    // ========================================================================
    // Restituiamo i dati dell'utente (SENZA la password!) e il token
    return NextResponse.json(
      {
        successo: true,
        messaggio: 'Login effettuato con successo',
        dati: {
          utente: {
            id: utente._id,
            nome: utente.nome,
            cognome: utente.cognome,
            email: utente.email,
            telefono: utente.telefono,
            ruolo: utente.ruolo,
          },
          token,  // Il frontend salverà questo token in localStorage
        },
      },
      { status: 200 }  // 200 = OK (tutto è andato bene)
    );

  } catch (errore) {
    // ========================================================================
    // GESTIONE ERRORI
    // ========================================================================
    // Se qualcosa va storto (es: database non raggiungibile),
    // catturiamo l'errore e restituiamo una risposta di errore
    console.error('Errore login:', errore);
    
    return NextResponse.json(
      { 
        successo: false, 
        errore: 'Errore durante il login' 
      },
      { status: 500 }  // 500 = Internal Server Error
    );
  }
}

/**
 * ============================================================================
 * RIEPILOGO FLUSSO:
 * ============================================================================
 * 
 * 1. Frontend invia POST con { email, password }
 * 2. Server riceve richiesta
 * 3. Connessione a MongoDB
 * 4. Cerca utente per email
 * 5. Verifica password con bcrypt
 * 6. Genera token JWT
 * 7. Restituisce { utente, token }
 * 8. Frontend salva token in localStorage
 * 9. Tutte le richieste successive includeranno questo token
 * 
 * ============================================================================
 * HTTP STATUS CODES USATI:
 * ============================================================================
 * 
 * 200 - OK: Login riuscito
 * 400 - Bad Request: Dati mancanti (email o password vuoti)
 * 401 - Unauthorized: Credenziali sbagliate
 * 500 - Internal Server Error: Errore del server
 * 
 * ============================================================================
 */
