/**
 * HELPERS - Funzioni di utilità
 * 
 * Raccolta di funzioni riutilizzabili in tutta l'applicazione.
 */

import { format, addMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Formatta una data in formato italiano
 * @param data - Data da formattare
 * @param formato - Formato desiderato (default: 'dd/MM/yyyy')
 */
export function formattaData(data: Date | string, formato: string = 'dd/MM/yyyy'): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return format(dataObj, formato, { locale: it });
}

/**
 * Formatta un'ora da stringa "HH:mm" a formato leggibile
 * @param ora - Ora in formato "HH:mm"
 */
export function formattaOra(ora: string): string {
  return ora;
}

/**
 * Calcola l'ora di fine dato inizio e durata
 * @param oraInizio - Ora di inizio in formato "HH:mm"
 * @param durataMinuti - Durata in minuti
 * @returns Ora di fine in formato "HH:mm"
 */
export function calcolaOraFine(oraInizio: string, durataMinuti: number): string {
  const [ore, minuti] = oraInizio.split(':').map(Number);
  const data = new Date();
  data.setHours(ore, minuti, 0, 0);
  
  const dataFine = addMinutes(data, durataMinuti);
  
  return format(dataFine, 'HH:mm');
}

/**
 * Verifica se un orario è disponibile
 * @param oraInizio - Ora di inizio slot
 * @param oraFine - Ora di fine slot
 * @param oraApertura - Ora apertura negozio
 * @param oraChiusura - Ora chiusura negozio
 */
export function isOrarioDisponibile(
  oraInizio: string,
  oraFine: string,
  oraApertura: string,
  oraChiusura: string
): boolean {
  const [oreInizio, minutiInizio] = oraInizio.split(':').map(Number);
  const [oreFine, minutiFine] = oraFine.split(':').map(Number);
  const [oreApertura, minutiApertura] = oraApertura.split(':').map(Number);
  const [oreChiusura, minutiChiusura] = oraChiusura.split(':').map(Number);

  const minutiTotaliInizio = oreInizio * 60 + minutiInizio;
  const minutiTotaliFine = oreFine * 60 + minutiFine;
  const minutiTotaliApertura = oreApertura * 60 + minutiApertura;
  const minutiTotaliChiusura = oreChiusura * 60 + minutiChiusura;

  return (
    minutiTotaliInizio >= minutiTotaliApertura &&
    minutiTotaliFine <= minutiTotaliChiusura
  );
}

/**
 * Genera slot orari disponibili per una giornata
 * @param oraApertura - Ora apertura in formato "HH:mm"
 * @param oraChiusura - Ora chiusura in formato "HH:mm"
 * @param durataSlot - Durata di ogni slot in minuti
 * @param pausa - Opzionale: pausa pranzo { oraInizio, oraFine }
 */
export function generaSlotOrari(
  oraApertura: string,
  oraChiusura: string,
  durataSlot: number,
  pausa?: { oraInizio: string; oraFine: string }
): string[] {
  const slots: string[] = [];
  
  const [oreApertura, minutiApertura] = oraApertura.split(':').map(Number);
  const [oreChiusura, minutiChiusura] = oraChiusura.split(':').map(Number);
  
  let oraCorrente = new Date();
  oraCorrente.setHours(oreApertura, minutiApertura, 0, 0);
  
  const oraFine = new Date();
  oraFine.setHours(oreChiusura, minutiChiusura, 0, 0);
  
  // Gestione pausa
  let oraPausaInizio: Date | null = null;
  let oraPausaFine: Date | null = null;
  
  if (pausa) {
    const [orePausaI, minutiPausaI] = pausa.oraInizio.split(':').map(Number);
    const [orePausaF, minutiPausaF] = pausa.oraFine.split(':').map(Number);
    
    oraPausaInizio = new Date();
    oraPausaInizio.setHours(orePausaI, minutiPausaI, 0, 0);
    
    oraPausaFine = new Date();
    oraPausaFine.setHours(orePausaF, minutiPausaF, 0, 0);
  }
  
  while (isBefore(oraCorrente, oraFine)) {
    const oraSlotFine = addMinutes(oraCorrente, durataSlot);
    
    // Verifica se lo slot è durante la pausa
    let isDurantePausa = false;
    if (oraPausaInizio && oraPausaFine) {
      isDurantePausa =
        (isAfter(oraCorrente, oraPausaInizio) || oraCorrente.getTime() === oraPausaInizio.getTime()) &&
        isBefore(oraCorrente, oraPausaFine);
    }
    
    // Aggiungi lo slot solo se non è durante la pausa e non supera l'orario di chiusura
    if (!isDurantePausa && (isBefore(oraSlotFine, oraFine) || oraSlotFine.getTime() === oraFine.getTime())) {
      slots.push(format(oraCorrente, 'HH:mm'));
    }
    
    oraCorrente = addMinutes(oraCorrente, durataSlot);
  }
  
  return slots;
}

/**
 * Valida formato email
 */
export function isEmailValida(email: string): boolean {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}

/**
 * Valida formato telefono italiano (10 cifre)
 */
export function isTelefonoValido(telefono: string): boolean {
  const regex = /^[0-9]{10}$/;
  return regex.test(telefono);
}

/**
 * Capitalizza la prima lettera di una stringa
 */
export function capitalizza(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formatta prezzo in euro
 */
export function formattaPrezzo(prezzo: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(prezzo);
}

/**
 * Ottiene il nome del giorno della settimana in italiano
 */
export function getNomeGiorno(data: Date): string {
  const giorni = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'];
  return giorni[data.getDay()];
}

/**
 * Verifica se una data è nel passato
 */
export function isDataPassata(data: Date): boolean {
  const oggi = startOfDay(new Date());
  const dataControllo = startOfDay(data);
  return isBefore(dataControllo, oggi);
}
