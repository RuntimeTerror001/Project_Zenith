import { Schema, model, Types } from 'mongoose';

export interface INotification {
  userId: Types.ObjectId;
  message: string;
  isRead: boolean;
  type: string; // e.g., 'system' | 'telemetry' | 'aurora'
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false, index: true },
  type: { type: String, default: 'system' },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
