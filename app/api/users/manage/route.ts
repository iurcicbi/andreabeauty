import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    const { searchParams } = new URL(req.url);
    const ruolo = searchParams.get('ruolo');

    const filtro: any = { attivo: true };
    if (ruolo) filtro.ruolo = ruolo;

    const users = await Utente.find(filtro)
      .select('-password')
      .sort({ cognome: 1, nome: 1 });

    return NextResponse.json({
      successo: true,
      dati: users,
    });

  } catch (errore: any) {
    console.error('Error fetching users:', errore);
    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json({ successo: false, errore: errore.message }, { status: 401 });
    }
    return NextResponse.json({ successo: false, errore: 'Error fetching users' }, { status: 500 });
  }
}
