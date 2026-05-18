/**
 * SCHEMA UTENTE
 */

import { Schema, Types, model, models } from 'mongoose';
import { ISettings } from './types';

type TSchemaUtente = {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  telefono: string;
  ruolo: string;
  attivo?: boolean;
}

export type TUtente = {
  _id?: Types.ObjectId;
} & TSchemaUtente;

const SchemaMongoose = new Schema<TSchemaUtente, ISettings>({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  telefono: { type: String, required: true },
  ruolo: { type: String, required: false, default: 'utente' },
  attivo: { type: Boolean, required: false, default: true },
},
{ 
  collection: "users", 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
  versionKey: false 
});

if (process.env.NODE_ENV === 'development' && models.users) {
  delete models.users;
}
const UtenteSchema = models.users || model('users', SchemaMongoose);

export default UtenteSchema;
