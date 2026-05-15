import { Schema, Types, model, models } from 'mongoose';
import { ISettings } from './types';

type TSchemaReview = {
  appointment: Types.ObjectId;
  specialist: Types.ObjectId;
  service: Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  reply?: string;
  replyAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  token: string;
}

export type TReview = {
  _id?: Types.ObjectId;
} & TSchemaReview;

const SchemaMongoose = new Schema<TSchemaReview, ISettings>({
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'appointments',
    required: true,
    unique: true
  },
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
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: false },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reply: { type: String, required: false },
  replyAt: { type: Date, required: false },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
},
{
  collection: "reviews",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

SchemaMongoose.index({ specialist: 1, status: 1 });
SchemaMongoose.index({ status: 1, created_at: -1 });

const ReviewSchema = models.reviews || model('reviews', SchemaMongoose);

export default ReviewSchema;
