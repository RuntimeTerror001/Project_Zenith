import { Schema, model } from 'mongoose';

export interface ITimelineEvent {
  year: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  image: string;
  facts: string[];
  celestial: string;
  category: 'Historic' | 'Milestone' | 'Present' | 'Upcoming' | 'Future';
  createdAt: Date;
}

const timelineEventSchema = new Schema<ITimelineEvent>({
  year: { type: Number, required: true, unique: true, index: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  facts: { type: [String], default: [] },
  celestial: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Historic', 'Milestone', 'Present', 'Upcoming', 'Future'] 
  },
  createdAt: { type: Date, default: Date.now }
});

export const TimelineEvent = model<ITimelineEvent>('TimelineEvent', timelineEventSchema);
