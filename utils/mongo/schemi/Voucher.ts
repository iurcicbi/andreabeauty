import { Schema, Types, model, models, Model } from 'mongoose';
import { ISettings } from './types';

type TSchemaVoucher = {
  code: string;
  customerName: string;
  customerSurname?: string;
  customerPhone?: string;
  customerEmail?: string;
  type: 'percentage' | 'fixed' | 'free';
  value: number;
  appliesToAll: boolean;
  services: Types.ObjectId[];
  status: 'active' | 'used' | 'expired';
  usedAt?: Date;
  usedByAppointment?: Types.ObjectId;
  expiresAt?: Date;
  notes?: string;
  createdBy?: string;
}

export type TVoucher = {
  _id?: Types.ObjectId;
} & TSchemaVoucher;

const SchemaMongoose = new Schema<TSchemaVoucher, ISettings>({
  code: { type: String, required: true, unique: true, uppercase: true },
  customerName: { type: String, required: true },
  customerSurname: { type: String, required: false },
  customerPhone: { type: String, required: false },
  customerEmail: { type: String, required: false },
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed', 'free']
  },
  value: { type: Number, required: true },
  appliesToAll: { type: Boolean, required: true, default: true },
  services: [{ type: Schema.Types.ObjectId, ref: 'services' }],
  status: {
    type: String,
    required: true,
    default: 'active',
    enum: ['active', 'used', 'expired']
  },
  usedAt: { type: Date, required: false },
  usedByAppointment: { type: Schema.Types.ObjectId, ref: 'appointments', required: false },
  expiresAt: { type: Date, required: false },
  notes: { type: String, required: false },
  createdBy: { type: String, required: false },
},
{
  collection: "vouchers",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

SchemaMongoose.index({ code: 1 });
SchemaMongoose.index({ status: 1 });

if (process.env.NODE_ENV === 'development' && models.vouchers) {
  delete models.vouchers;
}
const VoucherSchema: Model<TSchemaVoucher> = (models.vouchers as Model<TSchemaVoucher> | undefined) ?? model<TSchemaVoucher>('vouchers', SchemaMongoose);

export default VoucherSchema;
