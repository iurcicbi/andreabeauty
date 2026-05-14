/**
 * SCHEMA SERVIZIO
 */

import { Schema, Types, model, models } from 'mongoose';
import { ISettings } from './types';

type TSchemaServizio = {
  nome: string;
  descrizione: string;
  durata: number;
  prezzo: number;
  categoria: string;
  attivo?: boolean;
  immagine?: string;
}

export type TServizio = {
  _id?: Types.ObjectId;
} & TSchemaServizio;

const SchemaMongoose = new Schema<TSchemaServizio, ISettings>({
  nome: { type: String, required: true },
  descrizione: { type: String, required: true },
  durata: { type: Number, required: true },
  prezzo: { type: Number, required: true },
  categoria: { type: String, required: true },
  attivo: { type: Boolean, required: false, default: true },
  immagine: { type: String, required: false, default: null },
},
{ 
  collection: "services", 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
  versionKey: false 
});

const ServizioSchema = models.services || model('services', SchemaMongoose);

export default ServizioSchema;
