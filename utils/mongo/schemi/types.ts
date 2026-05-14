/**
 * TYPES per Mongoose
 */

export interface ISettings {
  collection?: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  versionKey?: boolean;
}
