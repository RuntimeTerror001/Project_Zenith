import { Schema, model, Types } from 'mongoose';

export interface ISettings {
  userId: Types.ObjectId;
  soundEnabled: boolean;
  musicVolume: number;
  showOrbits: boolean;
  showConstellations: boolean;
  showSatellites: boolean;
  locationName: string;
  latitude: number;
  longitude: number;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  soundEnabled: { type: Boolean, default: false },
  musicVolume: { type: Number, default: 0.5 },
  showOrbits: { type: Boolean, default: true },
  showConstellations: { type: Boolean, default: true },
  showSatellites: { type: Boolean, default: true },
  locationName: { type: String, default: 'New York' },
  latitude: { type: Number, default: 40.7128 },
  longitude: { type: Number, default: -74.006 },
  updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Settings = model<ISettings>('Settings', settingsSchema);
