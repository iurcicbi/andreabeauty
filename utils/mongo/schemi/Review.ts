import { Schema, Types, model, models, Model } from 'mongoose';

export type TReviewStatus = 'bozza' | 'approvata' | 'nascosta' | 'pending' | 'approved' | 'rejected';
export type TReviewSource = 'Instagram' | 'WhatsApp' | 'Direct' | 'Google' | 'Facebook';

type TSchemaReview = {
  appointment?: Types.ObjectId;
  specialist?: Types.ObjectId;
  service?: Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  usernameInstagram?: string;
  avatar?: string;
  rating: number;
  comment: string;
  reply?: string;
  replyAt?: Date;
  status: TReviewStatus;
  token?: string;

  // New fields
  serviceName?: string;
  source: TReviewSource;
  images: string[];
  verified: boolean;
  featured: boolean;
  reviewDate: Date;
  ordine: number;
}

export type TReview = {
  _id?: Types.ObjectId;
} & TSchemaReview;

const SchemaMongoose = new Schema<TSchemaReview>({
  appointment: {
    type: Schema.Types.ObjectId,
    ref: 'appointments',
    sparse: true,
  },
  specialist: {
    type: Schema.Types.ObjectId,
    ref: 'specialists',
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'services',
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: false },
  usernameInstagram: { type: String, required: false },
  avatar: { type: String, required: false },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reply: { type: String, required: false },
  replyAt: { type: Date, required: false },
  status: {
    type: String,
    required: true,
    default: 'bozza',
    enum: ['bozza', 'approvata', 'nascosta', 'pending', 'approved', 'rejected']
  },
  token: { type: String, required: false, sparse: true },
  serviceName: { type: String, required: false },
  source: {
    type: String,
    required: true,
    default: 'Direct',
    enum: ['Instagram', 'WhatsApp', 'Direct', 'Google', 'Facebook']
  },
  images: [{ type: String }],
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  reviewDate: { type: Date, default: Date.now },
  ordine: { type: Number, default: 0 },
},
{
  collection: "reviews",
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

SchemaMongoose.index({ specialist: 1, status: 1 });
SchemaMongoose.index({ status: 1, created_at: -1 });
SchemaMongoose.index({ featured: 1, status: 1 });
SchemaMongoose.index({ ordine: 1 });

if (process.env.NODE_ENV === 'development' && models.reviews) {
  delete models.reviews;
}
const ReviewSchema: Model<TSchemaReview> = (models.reviews as Model<TSchemaReview> | undefined) ?? model<TSchemaReview>('reviews', SchemaMongoose);

// Drop leftover unique indexes from older schema versions
ReviewSchema.collection?.dropIndex('appointment_1').catch(() => {});
ReviewSchema.collection?.dropIndex('token_1').catch(() => {});

export default ReviewSchema;
