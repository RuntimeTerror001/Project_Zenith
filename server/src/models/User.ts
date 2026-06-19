import { Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = model<IUser>('User', userSchema);
