/**
 * ============================================================================
 * API: GESTIONE CLIENTI
 * ============================================================================
 * 
 * COSA FA:
 * Gestisce la lista dei clienti per il barber.
 * Quando un utente prenota, viene automaticamente salvato come cliente.
 * 
 * FUNZIONALITÀ:
 * - GET: Lista tutti i clienti (per select/autocomplete)
 * - POST: Crea un nuovo cliente manualmente
 * 
 * UTILIZZO:
 * - Nel form appuntamenti, mostra select con clienti esistenti
 * - Se cliente non esiste, permette di crearlo al volo
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';
import bcrypt from 'bcryptjs';

/**
 * GET - Lista tutti i clienti
 * Solo per barber
 */
export async function GET(req: NextRequest) {
  try {
    // Verifica che sia un barber
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    // Recupera tutti gli utenti con ruolo 'utente'
    // Ordina per nome per facilitare la ricerca
    const clienti = await Utente.find({ 
      ruolo: 'utente',
      attivo: true 
    })
    .select('nome cognome email telefono')  // Solo campi necessari
    .sort({ nome: 1, cognome: 1 });  // Ordine alfabetico

    return NextResponse.json({
      successo: true,
      dati: clienti,
    });
  } catch (errore: any) {
    console.error('Errore recupero clienti:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero dei clienti' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crea un nuovo cliente
 * Solo per barber
 * Utile quando si vuole aggiungere un cliente che non ha mai prenotato online
 */
export async function POST(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const { nome, cognome, email, telefono } = await req.json();

    // Validazione
    if (!nome || !cognome || !telefono) {
      return NextResponse.json(
        { successo: false, errore: 'Nome, cognome e telefono sono obbligatori' },
        { status: 400 }
      );
    }

    // Verifica se email già esiste (se fornita)
    if (email) {
      const esistente = await Utente.findOne({ email: email.toLowerCase() });
      if (esistente) {
        return NextResponse.json(
          { successo: false, errore: 'Email già registrata' },
          { status: 409 }
        );
      }
    }

    // Crea password temporanea (il cliente può cambiarla dopo)
    const passwordTemp = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordTemp, salt);

    // Crea il cliente
    const nuovoCliente = await Utente.create({
      nome,
      cognome,
      email: email ? email.toLowerCase() : `${telefono}@temp.com`,  // Email temporanea se non fornita
      password: passwordHash,
      telefono,
      ruolo: 'utente',
      attivo: true,
    });

    return NextResponse.json({
      successo: true,
      messaggio: 'Cliente creato con successo',
      dati: {
        id: nuovoCliente._id,
        nome: nuovoCliente.nome,
        cognome: nuovoCliente.cognome,
        email: nuovoCliente.email,
        telefono: nuovoCliente.telefono,
      },
    }, { status: 201 });

  } catch (errore: any) {
    console.error('Errore creazione cliente:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante la creazione del cliente' },
      { status: 500 }
    );
  }
}
