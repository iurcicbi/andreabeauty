import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Utente from '@/utils/mongo/schemi/Utente';
import Servizio from '@/utils/mongo/schemi/Servizio';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    // Forza la registrazione degli schemi in Mongoose prima del populate
    void Utente;
    void Servizio;

    const specialist = await Specialist.findById(params.id)
      .populate('utente', 'nome cognome email telefono attivo')
      .populate('specializzazioni', 'nome categoria durata prezzo descrizione immagine');

    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      successo: true,
      dati: specialist,
    });

  } catch (errore: any) {
    console.error('Error fetching specialist:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error fetching specialist' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
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

    const specialist = await Specialist.findById(params.id);

    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    if (nome || cognome || email || telefono !== undefined) {
      const utente = await Utente.findById(specialist.utente);
      if (utente) {
        if (nome) utente.nome = nome;
        if (cognome) utente.cognome = cognome;
        if (email) {
          const emailEsistente = await Utente.findOne({
            email,
            _id: { $ne: utente._id }
          });
          if (emailEsistente) {
            return NextResponse.json(
              { successo: false, errore: 'Email already in use' },
              { status: 400 }
            );
          }
          utente.email = email;
        }
        if (telefono !== undefined) utente.telefono = telefono;
        await utente.save();
      }
    }

    if (biografia !== undefined) specialist.biografia = biografia;
    if (specializzazioni !== undefined) specialist.specializzazioni = specializzazioni;
    if (telefono !== undefined) specialist.telefono = telefono;
    if (orariSettimanali !== undefined) specialist.orariSettimanali = orariSettimanali;
    if (giorniChiusura !== undefined) {
      console.log('📅 Updating closed days');
      console.log('📅 Old closed days:', specialist.giorniChiusura.length);
      console.log('📅 New closed days:', giorniChiusura.length);
      specialist.giorniChiusura = giorniChiusura;
    }
    if (impostazioni !== undefined) specialist.impostazioni = impostazioni;
    if (attivo !== undefined) specialist.attivo = attivo;

    await specialist.save();

    console.log('✅ Specialist saved, final closed days:', specialist.giorniChiusura.length);

    await specialist.populate('utente', 'nome cognome email telefono attivo');
    await specialist.populate('specializzazioni', 'nome categoria durata prezzo descrizione immagine');

    return NextResponse.json({
      successo: true,
      messaggio: 'Specialist updated successfully',
      dati: specialist,
    });

  } catch (errore: any) {
    console.error('Error updating specialist:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error updating specialist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const specialist = await Specialist.findById(params.id);

    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    specialist.attivo = false;
    await specialist.save();

    await Utente.findByIdAndUpdate(specialist.utente, { attivo: false });

    return NextResponse.json({
      successo: true,
      messaggio: 'Specialist deactivated successfully',
    });

  } catch (errore: any) {
    console.error('Error deactivating specialist:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error deactivating specialist' },
      { status: 500 }
    );
  }
}
