/**
 * ============================================================================
 * SCHEMA BARBER - Profilo Completo del Barber
 * ============================================================================
 * 
 * COSA CONTIENE:
 * - Informazioni personali (biografia, specializzazioni)
 * - Orari di lavoro settimanali (per ogni giorno)
 * - Giorni di chiusura (ferie, festività)
 * - Impostazioni prenotazioni (anticipo minimo, pausa pranzo)
 * 
 * ORARI SETTIMANALI:
 * Per ogni giorno della settimana si può definire:
 * - Se è aperto o chiuso
 * - Orario apertura e chiusura
 * - Pausa pranzo (opzionale)
 * 
 * ESEMPIO:
 * lunedi: {
 *   aperto: true,
 *   oraInizio: "09:00",
 *   oraFine: "18:00",
 *   pausa: { oraInizio: "13:00", oraFine: "14:00" }
 * }
 * ============================================================================
 */

import { Schema, Types, model, models } from 'mongoose';
import { ISettings } from './types';

// Tipo per un singolo giorno lavorativo
type TGiornoLavorativo = {
  aperto: boolean;
  oraInizio?: string;  // Formato "HH:mm"
  oraFine?: string;    // Formato "HH:mm"
  pausa?: {
    oraInizio: string;
    oraFine: string;
  };
};

// Tipo per un giorno di chiusura
type TGiornoChiusura = {
  data: Date;
  motivo: string;  // Es: "Ferie", "Festività", "Malattia"
  tuttoIlGiorno: boolean;
  oraInizio?: string;  // Se chiusura parziale
  oraFine?: string;    // Se chiusura parziale
};

type TSchemaBarber = {
  utente: Types.ObjectId;
  biografia?: string;
  specializzazioni: string[];
  telefono?: string;
  
  // Orari settimanali
  orariSettimanali: {
    lunedi: TGiornoLavorativo;
    martedi: TGiornoLavorativo;
    mercoledi: TGiornoLavorativo;
    giovedi: TGiornoLavorativo;
    venerdi: TGiornoLavorativo;
    sabato: TGiornoLavorativo;
    domenica: TGiornoLavorativo;
  };
  
  // Giorni di chiusura speciali
  giorniChiusura: TGiornoChiusura[];
  
  // Impostazioni prenotazioni
  impostazioni: {
    anticipoMinimo: number;  // Ore di anticipo minimo per prenotare
    durataSlot: number;      // Durata minima slot in minuti (default: 15)
    maxAppuntamentiGiorno: number;  // Massimo appuntamenti al giorno (0 = illimitato)
  };
  
  attivo?: boolean;
}

export type TBarber = {
  _id?: Types.ObjectId;
} & TSchemaBarber;

// Schema per giorno lavorativo
const GiornoLavorativoSchema = new Schema({
  aperto: { type: Boolean, required: true, default: false },
  oraInizio: { type: String, required: false },
  oraFine: { type: String, required: false },
  pausa: {
    type: {
      oraInizio: { type: String, required: true },
      oraFine: { type: String, required: true },
    },
    required: false,
  },
}, { _id: false });

// Schema per giorno di chiusura
const GiornoChiusuraSchema = new Schema({
  data: { type: Date, required: true },
  motivo: { type: String, required: true },
  tuttoIlGiorno: { type: Boolean, required: true, default: true },
  oraInizio: { type: String, required: false },
  oraFine: { type: String, required: false },
}, { _id: false });

// Schema principale
const SchemaMongoose = new Schema<TSchemaBarber, ISettings>({
  utente: { 
    type: Schema.Types.ObjectId, 
    ref: 'users', 
    required: true, 
    unique: true 
  },
  biografia: { 
    type: String, 
    required: false, 
    default: '' 
  },
  specializzazioni: { 
    type: [String], 
    required: false, 
    default: [] 
  },
  telefono: { 
    type: String, 
    required: false 
  },
  
  // Orari settimanali con valori di default
  orariSettimanali: {
    type: {
      lunedi: { type: GiornoLavorativoSchema, required: true },
      martedi: { type: GiornoLavorativoSchema, required: true },
      mercoledi: { type: GiornoLavorativoSchema, required: true },
      giovedi: { type: GiornoLavorativoSchema, required: true },
      venerdi: { type: GiornoLavorativoSchema, required: true },
      sabato: { type: GiornoLavorativoSchema, required: true },
      domenica: { type: GiornoLavorativoSchema, required: true },
    },
    required: true,
    default: {
      // Orari di default: Lun-Ven 9-18, Sab 9-13, Dom chiuso
      lunedi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      martedi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      mercoledi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      giovedi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      venerdi: { aperto: true, oraInizio: '09:00', oraFine: '18:00', pausa: { oraInizio: '13:00', oraFine: '14:00' } },
      sabato: { aperto: true, oraInizio: '09:00', oraFine: '13:00' },
      domenica: { aperto: false },
    },
  },
  
  giorniChiusura: {
    type: [GiornoChiusuraSchema],
    required: false,
    default: [],
  },
  
  impostazioni: {
    type: {
      anticipoMinimo: { type: Number, required: true, default: 2 },  // 2 ore
      durataSlot: { type: Number, required: true, default: 15 },     // 15 minuti
      maxAppuntamentiGiorno: { type: Number, required: true, default: 0 },  // Illimitato
    },
    required: true,
    default: {
      anticipoMinimo: 2,
      durataSlot: 15,
      maxAppuntamentiGiorno: 0,
    },
  },
  
  attivo: { 
    type: Boolean, 
    required: false, 
    default: true 
  },
},
{ 
  collection: "barbers", 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
  versionKey: false 
});

const BarberSchema = models.barbers || model('barbers', SchemaMongoose);

export default BarberSchema;

