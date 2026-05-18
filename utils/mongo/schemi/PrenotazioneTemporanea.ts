/**
 * ============================================================================
 * SCHEMA PRENOTAZIONE TEMPORANEA
 * ============================================================================
 * 
 * SCOPO:
 * Bloccare temporaneamente uno slot orario mentre l'utente completa
 * il processo di prenotazione, prevenendo doppie prenotazioni.
 * 
 * FUNZIONAMENTO:
 * 1. Quando l'utente seleziona un orario, viene creato un blocco temporaneo
 * 2. Il blocco dura 10 minuti (configurabile)
 * 3. Se l'utente completa la prenotazione, il blocco viene rimosso
 * 4. Se l'utente abbandona, il blocco scade automaticamente
 * 5. Un job di cleanup rimuove i blocchi scaduti
 * 
 * ESEMPIO:
 * - Utente A seleziona slot 14:00 → Blocco creato (scade alle 14:10)
 * - Utente B cerca disponibilità → Slot 14:00 risulta occupato
 * - Utente A completa prenotazione → Blocco rimosso, appuntamento creato
 * - Utente A abbandona → Dopo 10 min il blocco scade, slot torna disponibile
 * ============================================================================
 */

import { Schema, Types, model, models } from 'mongoose';
import { ISettings } from './types';

type TSchemaPrenotazioneTemporanea = {
  specialist: Types.ObjectId;
  data: Date;
  oraInizio: string;
  durata: number;
  sessionId: string;  // Identificativo univoco della sessione utente
  scadenza: Date;     // Timestamp di scadenza del blocco
}

export type TPrenotazioneTemporanea = {
  _id?: Types.ObjectId;
} & TSchemaPrenotazioneTemporanea;

const SchemaMongoose = new Schema<TSchemaPrenotazioneTemporanea, ISettings>({
  specialist: { 
    type: Schema.Types.ObjectId, 
    ref: 'specialists', 
    required: true
  },
  data: { 
    type: Date, 
    required: true,
    index: true  // Indice per query veloci
  },
  oraInizio: { 
    type: String, 
    required: true 
  },
  durata: { 
    type: Number, 
    required: true 
  },
  sessionId: { 
    type: String, 
    required: true,
    index: true  // Indice per trovare blocchi di una sessione
  },
  scadenza: { 
    type: Date, 
    required: true,
    index: true  // Indice per cleanup automatico
  },
},
{ 
  collection: "temporary_bookings", 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
  versionKey: false 
});

// Indice composto per query di disponibilità
SchemaMongoose.index({ specialist: 1, data: 1, scadenza: 1 });

// TTL Index: MongoDB rimuove automaticamente i documenti scaduti
SchemaMongoose.index({ scadenza: 1 }, { expireAfterSeconds: 0 });

if (process.env.NODE_ENV === 'development' && models.temporary_bookings) {
  delete models.temporary_bookings;
}
const PrenotazioneTemporaneaSchema = models.temporary_bookings || model('temporary_bookings', SchemaMongoose);

export default PrenotazioneTemporaneaSchema;
