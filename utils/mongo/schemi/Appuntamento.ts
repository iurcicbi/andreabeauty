/**
 * SCHEMA APPUNTAMENTO
 */

import { Schema, Types, model, models } from 'mongoose';
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
  stato: 'in_attesa' | 'confermato' | 'completato' | 'cancellato';
  note?: string;
  // Campi per sistema promemoria WhatsApp
  reminderSent: boolean;
  reminderSentAt?: Date;
  reminderError?: string;
  reminderErrorAt?: Date;
  twilioMessageSid?: string;
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
    enum: ['in_attesa', 'confermato', 'completato', 'cancellato']
  },
  note: { type: String, required: false, default: '' },
  // Campi sistema promemoria WhatsApp
  reminderSent: { type: Boolean, required: true, default: false },
  reminderSentAt: { type: Date, required: false },
  reminderError: { type: String, required: false },
  reminderErrorAt: { type: Date, required: false },
  twilioMessageSid: { type: String, required: false },
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
},
{ 
  collection: "appointments", 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
  versionKey: false 
});

const AppuntamentoSchema = models.appointments || model('appointments', SchemaMongoose);

export default AppuntamentoSchema;
