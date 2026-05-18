import { Schema, Types, model, models } from 'mongoose';
import { ISettings } from './types';

type TGiornoLavorativo = {
  aperto: boolean;
  oraInizio?: string;
  oraFine?: string;
  pausa?: {
    oraInizio: string;
    oraFine: string;
  };
  sede?: Types.ObjectId;
  postazione?: string;
  sedeMattina?: Types.ObjectId;
  postazioneMattina?: string;
  sedePomeriggio?: Types.ObjectId;
  postazionePomeriggio?: string;
};

type TGiornoChiusura = {
  data: Date;
  motivo: string;
  tuttoIlGiorno: boolean;
  oraInizio?: string;
  oraFine?: string;
};

type TSchemaSpecialist = {
  utente: Types.ObjectId;
  biografia?: string;
  specializzazioni: Types.ObjectId[];
  telefono?: string;

  orariSettimanali: {
    lunedi: TGiornoLavorativo;
    martedi: TGiornoLavorativo;
    mercoledi: TGiornoLavorativo;
    giovedi: TGiornoLavorativo;
    venerdi: TGiornoLavorativo;
    sabato: TGiornoLavorativo;
    domenica: TGiornoLavorativo;
  };

  giorniChiusura: TGiornoChiusura[];

  impostazioni: {
    anticipoMinimo: number;
    durataSlot: number;
    maxAppuntamentiGiorno: number;
  };

  attivo?: boolean;
}

export type TSpecialist = {
  _id?: Types.ObjectId;
} & TSchemaSpecialist;

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
  sede: { type: Schema.Types.ObjectId, ref: 'sedi', required: false },
  postazione: { type: String, required: false },
  sedeMattina: { type: Schema.Types.ObjectId, ref: 'sedi', required: false },
  postazioneMattina: { type: String, required: false },
  sedePomeriggio: { type: Schema.Types.ObjectId, ref: 'sedi', required: false },
  postazionePomeriggio: { type: String, required: false },
}, { _id: false });

const GiornoChiusuraSchema = new Schema({
  data: { type: Date, required: true },
  motivo: { type: String, required: true },
  tuttoIlGiorno: { type: Boolean, required: true, default: true },
  oraInizio: { type: String, required: false },
  oraFine: { type: String, required: false },
}, { _id: false });

const SchemaMongoose = new Schema<TSchemaSpecialist, ISettings>({
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
    type: [Schema.Types.ObjectId],
    ref: 'services',
    required: false,
    default: []
  },
  telefono: {
    type: String,
    required: false
  },

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
      anticipoMinimo: { type: Number, required: true, default: 2 },
      durataSlot: { type: Number, required: true, default: 15 },
      maxAppuntamentiGiorno: { type: Number, required: true, default: 0 },
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
  collection: "specialists",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

if (process.env.NODE_ENV === 'development' && models.specialists) {
  delete models.specialists;
}
const SpecialistSchema = models.specialists || model('specialists', SchemaMongoose);

export default SpecialistSchema;
