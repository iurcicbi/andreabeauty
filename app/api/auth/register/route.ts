/**
 * API: REGISTRAZIONE UTENTE
 * 
 * Endpoint: POST /api/auth/register
 * 
 * FLUSSO:
 * 1. Riceve i dati dell'utente (nome, cognome, email, password, telefono)
 * 2. Valida i dati
 * 3. Verifica che l'email non sia già registrata
 * 4. Crea l'utente nel database (la password viene hashata automaticamente)
 * 5. Genera un token JWT
 * 6. Restituisce utente e token
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Utente from '@/utils/mongo/schemi/Utente';
import { generaToken } from '@/utils/middleware/autenticazione';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // 1. Connetti al database
    await connessioneMongoDB();

    // 2. Estrai i dati dal body della richiesta
    const { nome, cognome, email, password, telefono, ruolo } = await req.json();

    // 3. Validazione base
    if (!nome || !cognome || !email || !password || !telefono) {
      return NextResponse.json(
        { successo: false, errore: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    // 4. Verifica se l'email è già registrata
    const utenteEsistente = await Utente.findOne({ email: email.toLowerCase() });
    
    if (utenteEsistente) {
      return NextResponse.json(
        { successo: false, errore: 'Email già registrata' },
        { status: 409 }
      );
    }

    // 5. Hash della password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Crea il nuovo utente
    const nuovoUtente = await Utente.create({
      nome,
      cognome,
      email: email.toLowerCase(),
      password: passwordHash,
      telefono,
      ruolo: ruolo || 'utente', // Default: utente
    });

    // 7. Genera token JWT
    const token = generaToken({
      id: nuovoUtente._id.toString(),
      email: nuovoUtente.email,
      ruolo: nuovoUtente.ruolo,
    });

    // 8. Restituisci risposta (senza password)
    return NextResponse.json(
      {
        successo: true,
        messaggio: 'Registrazione completata con successo',
        dati: {
          utente: {
            id: nuovoUtente._id,
            nome: nuovoUtente.nome,
            cognome: nuovoUtente.cognome,
            email: nuovoUtente.email,
            telefono: nuovoUtente.telefono,
            ruolo: nuovoUtente.ruolo,
          },
          token,
        },
      },
      { status: 201 }
    );
  } catch (errore: any) {
    console.error('Errore registrazione:', errore);

    // Gestione errori di validazione Mongoose
    if (errore.name === 'ValidationError') {
      const messaggi = Object.values(errore.errors).map((err: any) => err.message);
      return NextResponse.json(
        { successo: false, errore: messaggi.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante la registrazione' },
      { status: 500 }
    );
  }
}
