/**
 * SCHEMA APPUNTAMENTO
 */

import { Schema, Types, model, models, Model } from 'mongoose';
import { ISettings } from './types';

type TSchemaAppuntamento = {
  utente: {
    nome: string;
    cognome: string;
    telefono: string;
    email?: string;
  };
  specialista: Types.ObjectId;
  specialistOld?: Types.ObjectId;
  servizio: Types.ObjectId;
  data: Date;
  oraInizio: string;
  oraFine: string;
  stato: 'in_attesa' | 'confermato' | 'completato' | 'cancellato' | 'scaduto';
  note?: string;
  // Campi per sistema promemoria WhatsApp
  reminderSent: boolean;
  reminderSentAt?: Date;
  reminderError?: string;
  reminderErrorAt?: Date;
  reminderExpiresAt?: Date;
  cancelledBy?: 'customer' | 'specialist';
  cancelledAt?: Date;
  reviewToken?: string;
  reviewSent: boolean;
  voucherCode?: string;
  // Campi per sistema conferma WhatsApp
  confirmationSent: boolean;
  confirmationSentAt?: Date;
  confirmationResponse?: 'si' | 'no' | null;
  confirmationRespondedAt?: Date;
  sede?: Types.ObjectId;
  postazione?: string;
}

export type TAppuntamento = {
  _id?: Types.ObjectId;
} & TSchemaAppuntamento;

const SchemaMongoose = new Schema<TSchemaAppuntamento, ISettings>({
  utente: {
    nome: { type: String, required: true },
    cognome: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: false }
  },
  specialista: { type: Schema.Types.ObjectId, ref: 'specialists', required: false },
  specialistOld: { type: Schema.Types.ObjectId, ref: 'users', required: false },
  servizio: { type: Schema.Types.ObjectId, ref: 'services', required: true },
  data: { type: Date, required: true },
  oraInizio: { type: String, required: true },
  oraFine: { type: String, required: true },
  stato: { 
    type: String, 
    required: true, 
    default: 'in_attesa',
    enum: ['in_attesa', 'confermato', 'completato', 'cancellato', 'scaduto']
  },
  note: { type: String, required: false, default: '' },
  // Campi sistema promemoria WhatsApp
  reminderSent: { type: Boolean, required: true, default: false },
  reminderSentAt: { type: Date, required: false },
  reminderError: { type: String, required: false },
  reminderErrorAt: { type: Date, required: false },
  reminderExpiresAt: { type: Date, required: false },
  cancelledBy: { 
    type: String, 
    required: false,
    enum: ['customer', 'specialist']
  },
  cancelledAt: { type: Date, required: false },
  reviewToken: { type: String, required: false },
  reviewSent: { type: Boolean, required: true, default: false },
  voucherCode: { type: String, required: false },
  // Campi sistema conferma WhatsApp
  confirmationSent: { type: Boolean, required: true, default: false },
  confirmationSentAt: { type: Date, required: false },
  confirmationResponse: { type: String, required: false, enum: ['si', 'no', null], default: null },
  confirmationRespondedAt: { type: Date, required: false },
  sede: { type: Schema.Types.ObjectId, ref: 'sedi', required: false },
  postazione: { type: String, required: false },
},
{ 
  collection: "appointments", 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
  versionKey: false 
});

if (process.env.NODE_ENV === 'development' && models.appointments) {
  delete models.appointments;
}
const AppuntamentoSchema: Model<TSchemaAppuntamento> = (models.appointments as Model<TSchemaAppuntamento> | undefined) ?? model<TSchemaAppuntamento>('appointments', SchemaMongoose);

export default AppuntamentoSchema;
