/**
 * SCHEMA IMPOSTAZIONI FRONTEND
 */

import { Schema, Types, model, models, Model } from 'mongoose';
import { ISettings } from './types';

type TSchemaImpostazioniFrontend = {
  logo?: string;
  nomeAzienda: string;
  tagline?: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  paese?: string;
  coordinate?: {
    lat: number;
    lng: number;
  };
  linkPrivacyPolicy?: string;
  linkCookiePolicy?: string;
  linkTerminiCondizioni?: string;
  linkFacebook?: string;
  linkInstagram?: string;
  linkWhatsapp?: string;
  orariApertura?: {
    lunedi?: string;
    martedi?: string;
    mercoledi?: string;
    giovedi?: string;
    venerdi?: string;
    sabato?: string;
    domenica?: string;
  };
}

export type TImpostazioniFrontend = {
  _id?: Types.ObjectId;
} & TSchemaImpostazioniFrontend;

const SchemaMongoose = new Schema<TSchemaImpostazioniFrontend, ISettings>({
  logo: { type: String, required: false },
  nomeAzienda: { type: String, required: true },
  tagline: { type: String, required: false },
  email: { type: String, required: false },
  telefono: { type: String, required: false },
  indirizzo: { type: String, required: false },
  citta: { type: String, required: false },
  cap: { type: String, required: false },
  provincia: { type: String, required: false },
  paese: { type: String, required: false, default: 'Italia' },
  coordinate: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  linkPrivacyPolicy: { type: String, required: false },
  linkCookiePolicy: { type: String, required: false },
  linkTerminiCondizioni: { type: String, required: false },
  linkFacebook: { type: String, required: false },
  linkInstagram: { type: String, required: false },
  linkWhatsapp: { type: String, required: false },
  orariApertura: {
    lunedi: { type: String, required: false },
    martedi: { type: String, required: false },
    mercoledi: { type: String, required: false },
    giovedi: { type: String, required: false },
    venerdi: { type: String, required: false },
    sabato: { type: String, required: false },
    domenica: { type: String, required: false },
  },
}, {
  timestamps: true,
});

if (process.env.NODE_ENV === 'development' && models.ImpostazioniFrontend) {
  delete models.ImpostazioniFrontend;
}
const ImpostazioniFrontend: Model<TSchemaImpostazioniFrontend> = (models.ImpostazioniFrontend as Model<TSchemaImpostazioniFrontend> | undefined) ?? model<TSchemaImpostazioniFrontend>('ImpostazioniFrontend', SchemaMongoose);

export default ImpostazioniFrontend;
