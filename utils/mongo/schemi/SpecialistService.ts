import { Schema, Types, model, models, Model } from 'mongoose';
import { ISettings } from './types';

type TSchemaSpecialistService = {
  specialist: Types.ObjectId;
  service: Types.ObjectId;
  attivo?: boolean;
  note?: string;
}

export type TSpecialistService = {
  _id?: Types.ObjectId;
} & TSchemaSpecialistService;

const SchemaMongoose = new Schema<TSchemaSpecialistService, ISettings>({
  specialist: {
    type: Schema.Types.ObjectId,
    ref: 'specialists',
    required: true
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'services',
    required: true
  },
  attivo: {
    type: Boolean,
    required: false,
    default: true
  },
  note: {
    type: String,
    required: false
  },
},
{
  collection: "specialist_services",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

SchemaMongoose.index({ specialist: 1, service: 1 }, { unique: true });
SchemaMongoose.index({ specialist: 1 });
SchemaMongoose.index({ service: 1 });

if (process.env.NODE_ENV === 'development' && models.specialist_services) {
  delete models.specialist_services;
}
const SpecialistServiceSchema: Model<TSchemaSpecialistService> = (models.specialist_services as Model<TSchemaSpecialistService> | undefined) ?? model<TSchemaSpecialistService>('specialist_services', SchemaMongoose);

export default SpecialistServiceSchema;
