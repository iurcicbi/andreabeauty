import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';
import bcrypt from 'bcryptjs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const user = await Utente.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json({ successo: false, errore: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ successo: true, dati: user });

  } catch (errore: any) {
    console.error('Error fetching user:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error fetching user' }, { status: 500 });
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
    const { nome, cognome, email, telefono, ruolo, attivo, password } = body;

    const user = await Utente.findById(params.id);
    if (!user) {
      return NextResponse.json({ successo: false, errore: 'User not found' }, { status: 404 });
    }

    if (nome !== undefined) user.nome = nome;
    if (cognome !== undefined) user.cognome = cognome;
    if (telefono !== undefined) user.telefono = telefono;
    if (attivo !== undefined) user.attivo = attivo;

    if (email !== undefined && email !== user.email) {
      const emailEsistente = await Utente.findOne({ email, _id: { $ne: user._id } });
      if (emailEsistente) {
        return NextResponse.json({ successo: false, errore: 'Email already in use' }, { status: 400 });
      }
      user.email = email;
    }

    if (ruolo !== undefined) {
      const ruoliValidi = ['utente', 'specialist', 'admin'];
      if (!ruoliValidi.includes(ruolo)) {
        return NextResponse.json({ successo: false, errore: 'Invalid role' }, { status: 400 });
      }
      user.ruolo = ruolo;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const userSafe = user.toObject();
    delete (userSafe as any).password;

    return NextResponse.json({
      successo: true,
      messaggio: 'User updated successfully',
      dati: userSafe,
    });

  } catch (errore: any) {
    console.error('Error updating user:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const user = await Utente.findByIdAndUpdate(params.id, { attivo: false }, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ successo: false, errore: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      successo: true,
      messaggio: 'User deactivated successfully',
      dati: user,
    });

  } catch (errore: any) {
    console.error('Error deactivating user:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error deactivating user' }, { status: 500 });
  }
}
