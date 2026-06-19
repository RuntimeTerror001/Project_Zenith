import { Schema, model, Types } from 'mongoose';

export interface IFavorite {
  userId: Types.ObjectId;
  objectId: string;
  objectType: 'planet' | 'constellation' | 'event' | 'satellite';
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  objectId: { type: String, required: true },
  objectType: { 
    type: String, 
    required: true, 
    enum: ['planet', 'constellation', 'event', 'satellite'] 
  },
  createdAt: { type: Date, default: Date.now }
});

// Enforce unique favorites per user to prevent duplicate records
favoriteSchema.index({ userId: 1, objectId: 1, objectType: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema);
