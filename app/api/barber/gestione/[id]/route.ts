/**
 * ============================================================================
 * API: GESTIONE BARBER SPECIFICO
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - GET: Recupera dettagli completi di un barber
 * - PUT: Aggiorna dati barber (utente + profilo + orari + assenze)
 * - DELETE: Elimina barber (soft delete - disattiva)
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Barber from '@/utils/mongo/schemi/Barber';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

/**
 * GET - Recupera dettagli completi barber
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    Utente;

    const barber = await Barber.findById(params.id)
      .populate('utente', 'nome cognome email telefono attivo');

    if (!barber) {
      return NextResponse.json(
        { successo: false, errore: 'Barber non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      dati: barber,
    });

  } catch (errore: any) {
    console.error('Errore recupero barber:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante il recupero' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Aggiorna barber completo
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const body = await req.json();
    const { 
      nome, 
      cognome, 
      email, 
      telefono, 
      biografia, 
      specializzazioni,
      orariSettimanali,
      giorniChiusura,
      impostazioni,
      attivo,
    } = body;

    const barber = await Barber.findById(params.id);

    if (!barber) {
      return NextResponse.json(
        { successo: false, errore: 'Barber non trovato' },
        { status: 404 }
      );
    }

    // Aggiorna dati utente se forniti
    if (nome || cognome || email || telefono !== undefined) {
      const utente = await Utente.findById(barber.utente);
      if (utente) {
        if (nome) utente.nome = nome;
        if (cognome) utente.cognome = cognome;
        if (email) {
          // Verifica se email già esiste (escludendo l'utente corrente)
          const emailEsistente = await Utente.findOne({ 
            email, 
            _id: { $ne: utente._id } 
          });
          if (emailEsistente) {
            return NextResponse.json(
              { successo: false, errore: 'Email già in uso' },
              { status: 400 }
            );
          }
          utente.email = email;
        }
        if (telefono !== undefined) utente.telefono = telefono;
        await utente.save();
      }
    }

    // Aggiorna profilo barber
    if (biografia !== undefined) barber.biografia = biografia;
    if (specializzazioni !== undefined) barber.specializzazioni = specializzazioni;
    if (telefono !== undefined) barber.telefono = telefono;
    if (orariSettimanali !== undefined) barber.orariSettimanali = orariSettimanali;
    if (giorniChiusura !== undefined) {
      console.log('📅 Aggiornamento giorni chiusura');
      console.log('📅 Vecchi giorni chiusura:', barber.giorniChiusura.length);
      console.log('📅 Nuovi giorni chiusura:', giorniChiusura.length);
      barber.giorniChiusura = giorniChiusura;
    }
    if (impostazioni !== undefined) barber.impostazioni = impostazioni;
    if (attivo !== undefined) barber.attivo = attivo;

    await barber.save();
    
    console.log('✅ Barber salvato, giorni chiusura finali:', barber.giorniChiusura.length);
    
    await barber.populate('utente', 'nome cognome email telefono attivo');

    return NextResponse.json({
      successo: true,
      messaggio: 'Barber aggiornato con successo',
      dati: barber,
    });

  } catch (errore: any) {
    console.error('Errore aggiornamento barber:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'aggiornamento' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Disattiva barber (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'barber');
    await connessioneMongoDB();

    const barber = await Barber.findById(params.id);

    if (!barber) {
      return NextResponse.json(
        { successo: false, errore: 'Barber non trovato' },
        { status: 404 }
      );
    }

    // Soft delete - disattiva invece di eliminare
    barber.attivo = false;
    await barber.save();

    // Disattiva anche l'utente
    await Utente.findByIdAndUpdate(barber.utente, { attivo: false });

    return NextResponse.json({
      successo: true,
      messaggio: 'Barber disattivato con successo',
    });

  } catch (errore: any) {
    console.error('Errore eliminazione barber:', errore);
    
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Errore durante l\'eliminazione' },
      { status: 500 }
    );
  }
}
