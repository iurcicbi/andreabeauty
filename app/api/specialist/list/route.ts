import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Utente from '@/utils/mongo/schemi/Utente';
import { richiedeRuolo } from '@/utils/middleware/autenticazione';

export async function GET(req: NextRequest) {
  try {
    await richiedeRuolo(req, 'specialist');
    await connessioneMongoDB();

    Utente;

    const specialists = await Specialist.find()
      .populate('utente', 'nome cognome email telefono')
      .sort({ 'created_at': 1 });

    return NextResponse.json({
      successo: true,
      dati: specialists,
    });

  } catch (errore: any) {
    console.error('Error fetching specialist list:', errore);

    if (errore.message.includes('Token') || errore.message.includes('Accesso negato')) {
      return NextResponse.json(
        { successo: false, errore: errore.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { successo: false, errore: 'Error fetching specialist list' },
      { status: 500 }
    );
  }
}
