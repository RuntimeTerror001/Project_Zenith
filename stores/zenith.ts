"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Location {
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

interface ZenithState {
  location: Location;
  currentDate: Date;
  timeSpeed: number;
  selectedObject: CelestialObject | null;
  isPlaying: boolean;
  showOrbits: boolean;
  showConstellations: boolean;
  showSatellites: boolean;
  soundEnabled: boolean;
  favorites: string[];
  recentSearches: string[];

  setLocation: (location: Location) => void;
  setDate: (date: Date) => void;
  setTimeSpeed: (speed: number) => void;
  setSelectedObject: (object: CelestialObject | null) => void;
  togglePlay: () => void;
  toggleOrbits: () => void;
  toggleConstellations: () => void;
  toggleSatellites: () => void;
  toggleSound: () => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  addRecentSearch: (query: string) => void;
}

export const useZenithStore = create<ZenithState>()(
  persist(
    (set) => ({
      location: { lat: 40.7128, lng: -74.006, name: 'New York', country: 'USA' },
      currentDate: new Date(),
      timeSpeed: 1,
      selectedObject: null,
      isPlaying: true,
      showOrbits: true,
      showConstellations: true,
      showSatellites: true,
      soundEnabled: false,
      favorites: [],
      recentSearches: [],

      setLocation: (location) => set({ location }),
      setDate: (date) => set({ currentDate: date }),
      setTimeSpeed: (speed) => set({ timeSpeed: speed }),
      setSelectedObject: (object) => set({ selectedObject: object }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
      toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
      toggleSatellites: () => set((state) => ({ showSatellites: !state.showSatellites })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      addFavorite: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
      removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter((f) => f !== id) })),
      addRecentSearch: (query) => set((state) => ({ recentSearches: [query, ...state.recentSearches.slice(0, 9)] })),
    }),
    { name: 'zenith-storage', partialize: (state) => ({ location: state.location, favorites: state.favorites, soundEnabled: state.soundEnabled }) }
  )
);

interface UIState {
  isCommandPaletteOpen: boolean;
  isLocationPickerOpen: boolean;
  isTimeMachineOpen: boolean;
  isSettingsOpen: boolean;
  isLoading: boolean;
  toggleCommandPalette: () => void;
  toggleLocationPicker: () => void;
  toggleTimeMachine: () => void;
  toggleSettings: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCommandPaletteOpen: false,
  isLocationPickerOpen: false,
  isTimeMachineOpen: false,
  isSettingsOpen: false,
  isLoading: false,
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleLocationPicker: () => set((state) => ({ isLocationPickerOpen: !state.isLocationPickerOpen })),
  toggleTimeMachine: () => set((state) => ({ isTimeMachineOpen: !state.isTimeMachineOpen })),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setLoading: (loading) => set({ isLoading: loading }),
}));

interface ISSState {
  position: { lat: number; lng: number } | null;
  altitude: number;
  velocity: number;
  visibility: string;
  crewCount: number;
  isLoading: boolean;
  setPosition: (position: { lat: number; lng: number }) => void;
  setAltitude: (altitude: number) => void;
  setVelocity: (velocity: number) => void;
  setVisibility: (visibility: string) => void;
  setCrewCount: (count: number) => void;
}

export const useISSStore = create<ISSState>()((set) => ({
  position: null,
  altitude: 408,
  velocity: 7.66,
  visibility: 'daylight',
  crewCount: 6,
  isLoading: true,
  setPosition: (position) => set({ position }),
  setAltitude: (altitude) => set({ altitude }),
  setVelocity: (velocity) => set({ velocity }),
  setVisibility: (visibility) => set({ visibility }),
  setCrewCount: (count) => set({ crewCount: count }),
}));
