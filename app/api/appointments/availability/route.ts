/**
 * ============================================================================
 * API: DISPONIBILITÀ SLOT ORARI
 * ============================================================================
 * 
 * Calcola gli slot orari disponibili per uno specialist in una data specifica
 * considerando:
 * - Orari di lavoro dello specialist
 * - Appuntamenti già prenotati
 * - Giorni di chiusura
 * - Pause pranzo
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import connessioneMongoDB from '@/utils/mongo/connessione';
import SpecialistModel from '@/utils/mongo/schemi/Specialist';
import AppuntamentoModel from '@/utils/mongo/schemi/Appuntamento';
import ServizioModel from '@/utils/mongo/schemi/Servizio';
import PrenotazioneTemporaneaModel from '@/utils/mongo/schemi/PrenotazioneTemporanea';
import SedeModel from '@/utils/mongo/schemi/Sede';

// Cast per risolvere problemi di tipo Mongoose
const Specialist = SpecialistModel as any;
const Appuntamento = AppuntamentoModel as any;
const Servizio = ServizioModel as any;
const PrenotazioneTemporanea = PrenotazioneTemporaneaModel as any;
const Sede = SedeModel as any;

export async function GET(req: NextRequest) {
  try {
    await connessioneMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const specialistId = searchParams.get('specialistId');
    const data = searchParams.get('data');
    const durata = parseInt(searchParams.get('durata') || '30');
    const sedeId = searchParams.get('sedeId');

    if (!specialistId || !data) {
      return NextResponse.json(
        { successo: false, errore: 'specialistId and date are required' },
        { status: 400 }
      );
    }

    const specialist = await Specialist.findById(specialistId);
    if (!specialist) {
      return NextResponse.json(
        { successo: false, errore: 'Specialist not found' },
        { status: 404 }
      );
    }

    if (!specialist.attivo) {
      return NextResponse.json({
        successo: true,
        dati: { slot: [] },
      });
    }

    const dataObj = new Date(data);
    const dataStr = dataObj.toISOString().split('T')[0];
    
    console.log('📅 Date requested:', dataStr);
    console.log('🔒 Specialist closed days:', specialist.giorniChiusura);
    
    const chiusura = specialist.giorniChiusura?.find((c: any) => {
      const dataChiusura = typeof c.data === 'string' ? c.data : new Date(c.data).toISOString().split('T')[0];
      return dataChiusura === dataStr;
    });

    if (chiusura) {
      console.log('❌ Closed day:', chiusura.motivo);
      return NextResponse.json({
        successo: true,
        dati: { slot: [] },
      });
    }

    const giorniSettimana = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
    const giornoSettimana = giorniSettimana[dataObj.getDay()];

    console.log('📆 Day of week:', giornoSettimana);

    const orarioGiorno = specialist.orariSettimanali?.[giornoSettimana as keyof typeof specialist.orariSettimanali];

    console.log('⏰ Daily schedule:', orarioGiorno);

    if (!orarioGiorno || !orarioGiorno.aperto) {
      console.log('❌ Specialist does not work this day');
      return NextResponse.json({
        successo: true,
        dati: { slot: [] },
      });
    }

    const dataInizio = new Date(data);
    dataInizio.setHours(0, 0, 0, 0);
    
    const dataFine = new Date(data);
    dataFine.setHours(23, 59, 59, 999);

    const appuntamenti = await Appuntamento.find({
      specialista: specialistId,
      data: { $gte: dataInizio, $lte: dataFine },
      stato: { $ne: 'cancellato' },
    });

    const serviziIds = appuntamenti.map(app => app.servizio).filter(Boolean);
    const servizi = await Servizio.find({ _id: { $in: serviziIds } });
    
    const serviziMap = new Map();
    servizi.forEach(servizio => {
      serviziMap.set(servizio._id.toString(), servizio.durata);
    });

    console.log('📋 Appointments found:', appuntamenti.length);
    console.log('🔧 Services loaded:', servizi.length);

    const ora = new Date();
    const blocchiTemporanei = await PrenotazioneTemporanea.find({
      specialist: specialistId,
      data: { $gte: dataInizio, $lte: dataFine },
      scadenza: { $gt: ora },
    });

    console.log('🔒 Active temporary blocks:', blocchiTemporanei.length);

    let oraInizioSlot = orarioGiorno.oraInizio || '09:00';
    let oraFineSlot = orarioGiorno.oraFine || '18:00';

    if (sedeId) {
      const sedeMatch = (id: any) => id?.toString() === sedeId;
      const tuttoGiorno = sedeMatch(orarioGiorno.sede);
      const soloMattina = !tuttoGiorno && sedeMatch(orarioGiorno.sedeMattina);
      const soloPomeriggio = !tuttoGiorno && !soloMattina && sedeMatch(orarioGiorno.sedePomeriggio);

      if (!tuttoGiorno && !soloMattina && !soloPomeriggio) {
        return NextResponse.json({
          successo: true,
          dati: { slot: [], sediDisponibili: [] },
        });
      }

      if (soloMattina && orarioGiorno.pausa?.oraInizio) {
        oraFineSlot = orarioGiorno.pausa.oraInizio;
      } else if (soloPomeriggio && orarioGiorno.pausa?.oraFine) {
        oraInizioSlot = orarioGiorno.pausa.oraFine;
      }
    }

    const slot = generaSlotOrari(
      oraInizioSlot,
      oraFineSlot,
      orarioGiorno.pausa,
      durata,
      appuntamenti,
      blocchiTemporanei,
      specialist.impostazioni?.durataSlot || 15,
      serviziMap
    );

    console.log('✅ Slot generati:', slot.length);
    console.log('📊 Slot disponibili:', slot.filter(s => s.disponibile).length);

    const sediDisponibili = await calcolaSediDelGiorno(
      orarioGiorno,
      dataObj,
      durata,
      appuntamenti,
    );

    return NextResponse.json({
      successo: true,
      dati: { slot, sediDisponibili },
    });

  } catch (errore: any) {
    console.error('Errore calcolo disponibilità:', errore);
    return NextResponse.json(
      { successo: false, errore: 'Errore durante il calcolo della disponibilità' },
      { status: 500 }
    );
  }
}

/**
 * Calcola le sedi e postazioni disponibili per lo specialista in un dato giorno
 */
async function calcolaSediDelGiorno(
  orarioGiorno: any,
  dataObj: Date,
  durataServizio: number,
  appuntamenti: any[],
): Promise<any[]> {
  const sedi: any[] = [];

  const sediDaCaricare = new Set<string>();
  if (orarioGiorno.sede) sediDaCaricare.add(orarioGiorno.sede.toString());
  if (orarioGiorno.sedeMattina) sediDaCaricare.add(orarioGiorno.sedeMattina.toString());
  if (orarioGiorno.sedePomeriggio) sediDaCaricare.add(orarioGiorno.sedePomeriggio.toString());

  if (sediDaCaricare.size === 0) return [];

  const sediDocs = await Sede.find({ _id: { $in: Array.from(sediDaCaricare) }, attivo: true });

  const buildSedeInfo = (sedeId: string | undefined, postazioneNome: string | undefined, fascia: string) => {
    if (!sedeId) return null;
    const sedeDoc = sediDocs.find(s => s._id.toString() === sedeId.toString());
    if (!sedeDoc) return null;

    const postazioniOccupate = appuntamenti
      .filter((a: any) => a.sede?.toString() === sedeId.toString() && a.postazione)
      .map((a: any) => a.postazione);

    const postazioniDisponibili = (sedeDoc.postazioni || [])
      .filter((p: any) => p.attivo)
      .map((p: any) => ({
        _id: p._id,
        nome: p.nome,
        descrizione: p.descrizione,
        occupato: postazioniOccupate.includes(p.nome),
      }));

    return {
      _id: sedeDoc._id,
      nome: sedeDoc.nome,
      indirizzo: sedeDoc.indirizzo,
      citta: sedeDoc.citta,
      postazioni: postazioniDisponibili,
      postazioneDefault: postazioneNome || null,
      fascia,
    };
  };

  const sedeDefault = buildSedeInfo(orarioGiorno.sede?.toString(), orarioGiorno.postazione, 'intera_giornata');
  const sedeMattina = buildSedeInfo(orarioGiorno.sedeMattina?.toString(), orarioGiorno.postazioneMattina, 'mattina');
  const sedePomeriggio = buildSedeInfo(orarioGiorno.sedePomeriggio?.toString(), orarioGiorno.postazionePomeriggio, 'pomeriggio');

  if (sedeDefault) sedi.push(sedeDefault);
  if (sedeMattina) sedi.push(sedeMattina);
  if (sedePomeriggio) sedi.push(sedePomeriggio);

  return sedi;
}

/**
 * Genera array di slot orari disponibili
 * Considera sia appuntamenti confermati che blocchi temporanei
 */
function generaSlotOrari(
  oraInizio: string,
  oraFine: string,
  pausa: { oraInizio: string; oraFine: string } | undefined,
  durataServizio: number,
  appuntamenti: any[],
  blocchiTemporanei: any[],
  durataSlot: number,
  serviziMap: Map<string, number>
): { ora: string; disponibile: boolean }[] {
  const slot: { ora: string; disponibile: boolean }[] = [];

  console.log('🔧 Generazione slot con parametri:', {
    oraInizio,
    oraFine,
    pausa,
    durataServizio,
    durataSlot,
    appuntamenti: appuntamenti.length,
    blocchiTemporanei: blocchiTemporanei.length,
  });

  // Converti orari in minuti
  const minutiInizio = orarioToMinuti(oraInizio);
  const minutiFine = orarioToMinuti(oraFine);
  const minutiPausaInizio = pausa ? orarioToMinuti(pausa.oraInizio) : null;
  const minutiPausaFine = pausa ? orarioToMinuti(pausa.oraFine) : null;

  console.log('🔧 Minuti:', {
    inizio: minutiInizio,
    fine: minutiFine,
    pausaInizio: minutiPausaInizio,
    pausaFine: minutiPausaFine,
  });

  let slotSaltatiPausa = 0;
  let slotSaltatiDurata = 0;
  let slotSaltatiPausaSovrapposta = 0;

  // Genera slot ogni durataSlot minuti
  for (let minuti = minutiInizio; minuti < minutiFine; minuti += durataSlot) {
    // Salta se è durante la pausa
    if (minutiPausaInizio && minutiPausaFine && minuti >= minutiPausaInizio && minuti < minutiPausaFine) {
      slotSaltatiPausa++;
      continue;
    }

    // Verifica se c'è abbastanza tempo per il servizio prima della fine o della pausa
    const minutiFineSlot = minuti + durataServizio;
    
    // Salta se il servizio finirebbe dopo l'orario di chiusura
    if (minutiFineSlot > minutiFine) {
      slotSaltatiDurata++;
      continue;
    }

    // Salta se il servizio entrerebbe nella pausa
    if (minutiPausaInizio && minutiPausaFine && minuti < minutiPausaInizio && minutiFineSlot > minutiPausaInizio) {
      slotSaltatiPausaSovrapposta++;
      continue;
    }

    const oraSlot = minutiToOrario(minuti);

    // Verifica se lo slot è già occupato da un appuntamento confermato
    const occupatoDaAppuntamento = appuntamenti.some((app: any) => {
      const minutiAppInizio = orarioToMinuti(app.oraInizio);
      // Prendi durata dal servizio usando la mappa
      const durataApp = serviziMap.get(app.servizio?.toString()) || 30;
      const minutiAppFine = minutiAppInizio + durataApp;
      
      // Controlla sovrapposizione
      return (minuti >= minutiAppInizio && minuti < minutiAppFine) ||
             (minutiFineSlot > minutiAppInizio && minutiFineSlot <= minutiAppFine) ||
             (minuti <= minutiAppInizio && minutiFineSlot >= minutiAppFine);
    });

    // Verifica se lo slot è bloccato temporaneamente
    const occupatoDaBlocco = blocchiTemporanei.some((blocco: any) => {
      const minutiBloccoInizio = orarioToMinuti(blocco.oraInizio);
      const minutiBloccoFine = minutiBloccoInizio + blocco.durata;
      
      // Controlla sovrapposizione
      return (minuti >= minutiBloccoInizio && minuti < minutiBloccoFine) ||
             (minutiFineSlot > minutiBloccoInizio && minutiFineSlot <= minutiBloccoFine) ||
             (minuti <= minutiBloccoInizio && minutiFineSlot >= minutiBloccoFine);
    });

    const occupato = occupatoDaAppuntamento || occupatoDaBlocco;

    slot.push({
      ora: oraSlot,
      disponibile: !occupato,
    });
  }

  console.log('🔧 Risultato generazione:', {
    slotGenerati: slot.length,
    slotDisponibili: slot.filter(s => s.disponibile).length,
    slotOccupati: slot.filter(s => !s.disponibile).length,
    slotSaltatiPausa,
    slotSaltatiDurata,
    slotSaltatiPausaSovrapposta,
  });

  return slot;
}

/**
 * Converte orario "HH:mm" in minuti
 */
function orarioToMinuti(orario: string): number {
  const [ore, minuti] = orario.split(':').map(Number);
  return ore * 60 + minuti;
}

/**
 * Converte minuti in orario "HH:mm"
 */
function minutiToOrario(minuti: number): string {
  const ore = Math.floor(minuti / 60);
  const min = minuti % 60;
  return `${ore.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}
