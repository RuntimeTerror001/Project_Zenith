'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CelestialObject, Location, MusicSettings, ZenithMode } from '@/types/zenith';
import { astronomyService } from '@/services/astronomy';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

interface ZenithState {
  location: Location;
  coordinates: { lat: number; lng: number };
  currentDate: Date;
  timeSpeed: number;
  mode: ZenithMode;
  selectedObject: CelestialObject | null;
  music: MusicSettings;
  soundEnabled: boolean;
  isPlaying: boolean;
  showOrbits: boolean;
  showConstellations: boolean;
  showSatellites: boolean;
  favorites: string[];
  recentSearches: string[];
  navbarIsOpen: boolean;
  navbarIsVisible: boolean;
  activeSection: string;

  // Auth states
  user: UserProfile | null;
  token: string | null;
  notifications: NotificationItem[];

  setLocation: (location: Location | { lat: number; lng: number; name: string; country?: string }) => void;
  setCoordinates: (lat: number, lng: number) => void;
  setDate: (date: Date) => void;
  setTimeSpeed: (speed: number) => void;
  setMode: (mode: ZenithMode) => void;
  setSelectedObject: (object: CelestialObject | null) => void;
  setMusic: (settings: Partial<MusicSettings>) => void;
  togglePlay: () => void;
  toggleOrbits: () => void;
  toggleConstellations: () => void;
  toggleSatellites: () => void;
  toggleSound: () => void;
  
  // Auth actions
  setAuth: (user: UserProfile | null, token: string | null) => void;
  logout: () => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  addNotification: (notification: NotificationItem) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Favorites & Searches actions
  setFavorites: (favorites: string[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  setRecentSearches: (searches: string[]) => void;
  addRecentSearch: (query: string) => void;
  
  setNavbarOpen: (open: boolean) => void;
  setNavbarVisible: (visible: boolean) => void;
  setActiveSection: (section: string) => void;
}

const defaultLocation: Location = { latitude: 40.7128, longitude: -74.006, lat: 40.7128, lng: -74.006, name: 'New York', country: 'USA' };

export const useZenithStore = create<ZenithState>()(persist((set, get) => ({
  location: defaultLocation,
  coordinates: { lat: defaultLocation.latitude, lng: defaultLocation.longitude },
  currentDate: new Date(),
  timeSpeed: 1,
  mode: 'live',
  selectedObject: null,
  music: { enabled: false, volume: 0.5, track: null },
  soundEnabled: false,
  isPlaying: true,
  showOrbits: true,
  showConstellations: true,
  showSatellites: true,
  favorites: [],
  recentSearches: [],
  navbarIsOpen: false,
  navbarIsVisible: true,
  activeSection: 'home',

  // Auth defaults
  user: null,
  token: null,
  notifications: [],

  setLocation: (location) => {
    const latitude = 'latitude' in location ? location.latitude : location.lat;
    const longitude = 'longitude' in location ? location.longitude : location.lng;
    set({ location: { ...location, latitude, longitude, lat: latitude, lng: longitude }, coordinates: { lat: latitude, lng: longitude } });
  },
  setCoordinates: (lat, lng) => set((state) => ({ coordinates: { lat, lng }, location: { ...state.location, latitude: lat, longitude: lng, lat, lng } })),
  setDate: (currentDate) => set({ currentDate }),
  setTimeSpeed: (timeSpeed) => set({ timeSpeed }),
  setMode: (mode) => set({ mode }),
  setSelectedObject: (selectedObject) => set({ selectedObject }),
  setMusic: (settings) => set((state) => ({ music: { ...state.music, ...settings }, soundEnabled: settings.enabled ?? state.soundEnabled })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
  toggleSatellites: () => set((state) => ({ showSatellites: !state.showSatellites })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled, music: { ...state.music, enabled: !state.soundEnabled } })),
  
  // Auth implementations
  setAuth: (user, token) => {
    set({ user, token });
    // Fetch synced data immediately on login
    if (token) {
      void astronomyService.getFavorites().then((list) => {
        set({ favorites: list.map((fav) => fav.objectId) });
      }).catch(() => {});
      void astronomyService.getSearchHistory().then((history) => {
        set({ recentSearches: history.map((item) => item.query) });
      }).catch(() => {});
      void astronomyService.getNotifications().then((list) => {
        set({ notifications: list });
      }).catch(() => {});
    }
  },
  logout: () => set({ user: null, token: null, favorites: [], recentSearches: [], notifications: [] }),
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n)
    }));
    const { token } = get();
    if (token) {
      void astronomyService.markNotificationRead(id).catch(() => {});
    }
  },
  clearNotifications: () => {
    set({ notifications: [] });
    const { token } = get();
    if (token) {
      void astronomyService.clearNotifications().catch(() => {});
    }
  },

  // Favorites & Searches implementations
  setFavorites: (favorites) => set({ favorites }),
  addFavorite: (id) => {
    const { favorites, token } = get();
    if (favorites.includes(id)) return;
    set({ favorites: [...favorites, id] });
    
    if (token) {
      // Infers type from string format or defaults to planet
      let objectType: 'planet' | 'constellation' | 'event' | 'satellite' = 'planet';
      if (id.startsWith('sat_') || !isNaN(Number(id))) objectType = 'satellite';
      else if (id.startsWith('const_') || id.length === 3) objectType = 'constellation';
      else if (id.includes('-')) objectType = 'event';

      void astronomyService.addFavorite(id, objectType).catch(() => {});
    }
  },
  removeFavorite: (id) => {
    const { favorites, token } = get();
    set({ favorites: favorites.filter((f) => f !== id) });
    
    if (token) {
      void astronomyService.removeFavorite(id).catch(() => {});
    }
  },
  setRecentSearches: (recentSearches) => set({ recentSearches }),
  addRecentSearch: (query) => {
    const { recentSearches, token } = get();
    const clean = query.trim();
    if (!clean) return;

    const filtered = [clean, ...recentSearches.filter((item) => item !== clean)].slice(0, 10);
    set({ recentSearches: filtered });
    
    if (token) {
      void astronomyService.addSearch(clean).catch(() => {});
    }
  },

  setNavbarOpen: (navbarIsOpen) => set({ navbarIsOpen }),
  setNavbarVisible: (navbarIsVisible) => set({ navbarIsVisible }),
  setActiveSection: (activeSection) => set({ activeSection }),
}), {
  name: 'project-zenith',
  partialize: ({ location, coordinates, favorites, music, soundEnabled, mode, user, token }) => ({ 
    location, 
    coordinates, 
    favorites, 
    music, 
    soundEnabled, 
    mode,
    user,
    token
  }),
}));

interface UIState {
  isCommandPaletteOpen: boolean;
  isLocationPickerOpen: boolean;
  isTimeMachineOpen: boolean;
  isSettingsOpen: boolean;
  isAuthOpen: boolean;
  isLoading: boolean;
  toggleCommandPalette: () => void;
  toggleLocationPicker: () => void;
  toggleTimeMachine: () => void;
  toggleSettings: () => void;
  toggleAuth: () => void;
  setAuthOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCommandPaletteOpen: false, 
  isLocationPickerOpen: false, 
  isTimeMachineOpen: false, 
  isSettingsOpen: false,
  isAuthOpen: false,
  isLoading: false,
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  toggleLocationPicker: () => set((state) => ({ isLocationPickerOpen: !state.isLocationPickerOpen })),
  toggleTimeMachine: () => set((state) => ({ isTimeMachineOpen: !state.isTimeMachineOpen })),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  toggleAuth: () => set((state) => ({ isAuthOpen: !state.isAuthOpen })),
  setAuthOpen: (isAuthOpen) => set({ isAuthOpen }),
  setLoading: (isLoading) => set({ isLoading }),
}));
