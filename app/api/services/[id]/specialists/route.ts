import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import Specialist from '@/utils/mongo/schemi/Specialist';
import Servizio from '@/utils/mongo/schemi/Servizio';
import Utente from '@/utils/mongo/schemi/Utente';

function normalizzaId(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val.toString === 'function') return val.toString();
  return String(val);
}

function haSedeInGiorno(g: any, sedeId: string): boolean {
  if (!g || typeof g !== 'object') return false;
  if (normalizzaId(g.sede) === sedeId) return true;
  if (normalizzaId(g.sedeMattina) === sedeId) return true;
  if (normalizzaId(g.sedePomeriggio) === sedeId) return true;
  return false;
}

function specialistLavoraInSede(orariSettimanali: any, sedeId: string): boolean {
  if (!orariSettimanali || typeof orariSettimanali !== 'object') return false;
  const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  for (const zi of giorni) {
    const g = orariSettimanali[zi];
    if (!g || typeof g !== 'object') continue;
    if (!g.aperto) continue;
    if (haSedeInGiorno(g, sedeId)) return true;
  }
  return false;
}

function getGiorniInSede(orariSettimanali: any, sedeId: string): string[] {
  const nomi: Record<string, string> = {
    lunedi: 'Luni', martedi: 'Marți', mercoledi: 'Miercuri',
    giovedi: 'Joi', venerdi: 'Vineri', sabato: 'Sâmbătă', domenica: 'Duminică',
  };
  const giorni: string[] = [];
  if (!orariSettimanali || typeof orariSettimanali !== 'object') return giorni;
  const chiavi = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
  for (const zi of chiavi) {
    const g = orariSettimanali[zi];
    if (!g || typeof g !== 'object') continue;
    if (!g.aperto) continue;
    if (haSedeInGiorno(g, sedeId)) {
      giorni.push(nomi[zi] || zi);
    }
  }
  return giorni;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connessioneMongoDB();
    void Utente;

    const servizio = await Servizio.findById(params.id);
    if (!servizio) {
      return NextResponse.json(
        { successo: false, errore: 'Service not found' },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const sedeId = searchParams.get('sedeId');

    const specialists = await Specialist.find({
      specializzazioni: params.id,
      attivo: true,
    })
      .populate('utente', 'nome cognome email')
      .populate('specializzazioni', 'nome categoria durata prezzo')
      .lean();

    let formatted = specialists.map((s: any) => ({
      _id: s._id,
      nome: s.utente?.nome || '',
      cognome: s.utente?.cognome || '',
      email: s.utente?.email || '',
      biografia: s.biografia,
      telefono: s.telefono,
      orariSettimanali: s.orariSettimanali,
      giorniChiusura: s.giorniChiusura,
      impostazioni: s.impostazioni,
      servizi: s.specializzazioni || [],
    }));

    if (sedeId) {
      formatted = formatted.filter(s => specialistLavoraInSede(s.orariSettimanali, sedeId));
      formatted = formatted.map(s => ({
        ...s,
        giorniSede: getGiorniInSede(s.orariSettimanali, sedeId),
      }));
    }

    return NextResponse.json({
      successo: true,
      dati: formatted,
    });
  } catch (errore: any) {
    console.error('Error fetching specialists for service:', errore);
    return NextResponse.json(
      { successo: false, errore: errore.message },
      { status: 500 }
    );
  }
}
