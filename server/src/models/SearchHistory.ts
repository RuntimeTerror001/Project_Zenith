import { Schema, model, Types } from 'mongoose';

export interface ISearchHistory {
  userId: Types.ObjectId;
  query: string;
  createdAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  query: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index for sorting history by date per user
searchHistorySchema.index({ userId: 1, createdAt: -1 });

export const SearchHistory = model<ISearchHistory>('SearchHistory', searchHistorySchema);
