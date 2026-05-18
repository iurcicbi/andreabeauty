import { Schema, Types, model, models } from 'mongoose';
import { ISettings } from './types';

type TPostazione = {
  nome: string;
  descrizione?: string;
  attivo: boolean;
};

type TSchemaSede = {
  nome: string;
  indirizzo: string;
  citta: string;
  cap?: string;
  provincia?: string;
  telefono?: string;
  coordinate?: {
    lat: number;
    lng: number;
  };
  postazioni: TPostazione[];
  attivo: boolean;
}

export type TSede = {
  _id?: Types.ObjectId;
} & TSchemaSede;

const PostazioneSchema = new Schema({
  nome: { type: String, required: true },
  descrizione: { type: String, required: false },
  attivo: { type: Boolean, required: true, default: true },
}, { _id: false });

const SchemaMongoose = new Schema<TSchemaSede, ISettings>({
  nome: { type: String, required: true },
  indirizzo: { type: String, required: true },
  citta: { type: String, required: true },
  cap: { type: String, required: false },
  provincia: { type: String, required: false },
  telefono: { type: String, required: false },
  coordinate: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
  },
  postazioni: {
    type: [PostazioneSchema],
    required: true,
    default: [],
  },
  attivo: {
    type: Boolean,
    required: true,
    default: true,
  },
}, {
  collection: "sedi",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
});

if (process.env.NODE_ENV === 'development' && models.sedi) {
  delete models.sedi;
}
const Sede = models.sedi || model<TSchemaSede, ISettings>('sedi', SchemaMongoose);

export default Sede;
