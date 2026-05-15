import { NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Utente from '@/utils/mongo/schemi/Utente';

export async function GET() {
  try {
    await connessioneMongoDB();

    const specialists = await Utente.find({
      ruolo: 'specialist',
      attivo: true
    })
    .select('nome cognome')
    .sort({ nome: 1, cognome: 1 });

    return NextResponse.json({
      successo: true,
      dati: specialists,
    });

  } catch (errore) {
    console.error('Error fetching specialists:', errore);

    return NextResponse.json(
      {
        successo: false,
        errore: 'Error fetching specialists'
      },
      { status: 500 }
    );
  }
}
