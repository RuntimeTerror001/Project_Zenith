export type ZenithMode = 'live' | 'time-machine' | 'cosmic';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  lat: number;
  lng: number;
  name: string;
  country?: string;
}

export interface CelestialObject {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'satellite' | 'constellation' | 'iss' | 'moon';
  altitude: number;
  azimuth: number;
  magnitude?: number;
  distance?: number;
  visible: boolean;
}

export interface MusicSettings {
  enabled: boolean;
  volume: number;
  track: string | null;
}

export interface IssPosition extends Coordinates {
  altitude: number;
  velocity: number;
  visibility: 'daylight' | 'eclipsed';
  timestamp: number;
  crew?: string[];
}

export interface Apod {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  copyright?: string;
  mediaType: 'image' | 'video';
}

export interface SpaceNewsArticle {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  url: string;
  newsSite: string;
  publishedAt: string;
}

export interface SpaceEvent {
  id: string;
  name: string;
  type: 'eclipse' | 'comet' | 'conjunction';
  date: string;
  description: string;
  visibility: string;
  details: string;
}

export interface LiveSpaceEvents {
  nearEarthObjects: Array<{ id: string; name: string; diameter: number; velocity: number; missDistance: number; approachDate: string; hazardous: boolean }>;
  upcomingLaunches: Array<{ id: string; name: string; provider: string; rocket: string; location: string; launchDate: string; status: 'scheduled' | 'ongoing' | 'completed' }>;
  auroraKpIndex: { level: number; probability: number; description: string; forecast: string };
  spaceEvents: SpaceEvent[];
}
