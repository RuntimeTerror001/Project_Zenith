"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Search, Star, Clock, AlertCircle } from 'lucide-react';
import { useUIStore, useZenithStore } from '@/store/zenith-store';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 border border-white/10">
      Loading Live Map...
    </div>
  ),
});

const popularLocations = [
  { name: 'New York', lat: 40.7128, lng: -74.006, country: 'USA' },
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, country: 'India' },
];

export function LocationPicker() {
  const { isLocationPickerOpen, toggleLocationPicker } = useUIStore();
  const { location, setLocation } = useZenithStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentLocations, setRecentLocations] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load recent locations from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zenith-recent-locations');
      if (stored) {
        try {
          setRecentLocations(JSON.parse(stored));
        } catch {
          // ignore parsing error
        }
      }
    }
  }, [isLocationPickerOpen]);

  const saveRecentLocation = useCallback((loc: { name: string; lat: number; lng: number; country?: string }) => {
    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (item) =>
          item.name.toLowerCase() !== loc.name.toLowerCase() &&
          Math.abs(item.lat - loc.lat) > 0.01 &&
          Math.abs(item.lng - loc.lng) > 0.01
      );
      const updated = [loc, ...filtered].slice(0, 5);
      localStorage.setItem('zenith-recent-locations', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleLocationSelect = useCallback(
    (loc: { name: string; lat: number; lng: number; country?: string }) => {
      setLocation({ lat: loc.lat, lng: loc.lng, name: loc.name, country: loc.country });
      saveRecentLocation(loc);
      toggleLocationPicker();
    },
    [setLocation, saveRecentLocation, toggleLocationPicker]
  );

  // Geocode address via Nominatim
  const performGeocoding = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      if (!response.ok) throw new Error('Nominatim geocoder error');
      const data = await response.json();
      if (data && data.length > 0) {
        setSearchResults(
          data.map((item: any) => {
            const displayNameParts = item.display_name.split(', ');
            const name = displayNameParts[0] || 'Unknown';
            const country = displayNameParts[displayNameParts.length - 1] || 'Unknown';
            return {
              name,
              country,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              displayName: item.display_name,
            };
          })
        );
      } else {
        setSearchError('No cities found matching your search.');
        setSearchResults([]);
      }
    } catch {
      setSearchError('Geocoding service unavailable.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Reverse geocode latitude and longitude to get city name
  const performReverseGeocoding = useCallback(async (lat: number, lng: number): Promise<{ name: string; country?: string }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        const name = address.city || address.town || address.village || address.suburb || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        const country = address.country;
        return { name, country };
      }
    } catch {
      // ignore geocoding errors, fallback to coordinates name
    }
    return { name: `${lat.toFixed(2)}, ${lng.toFixed(2)}` };
  }, []);

  const handleMapCoordinateChange = useCallback(
    async (lat: number, lng: number) => {
      const { name, country } = await performReverseGeocoding(lat, lng);
      setLocation({ lat, lng, name, country });
      saveRecentLocation({ name, lat, lng, country });
    },
    [setLocation, performReverseGeocoding, saveRecentLocation]
  );

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const { name, country } = await performReverseGeocoding(latitude, longitude);
        setLocation({ lat: latitude, lng: longitude, name, country });
        saveRecentLocation({ name, lat: latitude, lng: longitude, country });
        setIsLocating(false);
        toggleLocationPicker();
      },
      () => setIsLocating(false)
    );
  }, [setLocation, performReverseGeocoding, saveRecentLocation, toggleLocationPicker]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performGeocoding(searchQuery);
  };

  if (!isLocationPickerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={toggleLocationPicker}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card rounded-3xl overflow-hidden max-w-xl w-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Observation Location</h2>
                  <p className="text-sm text-white/40">Select coordinates on the map or search</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleLocationPicker}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <X className="w-5 h-5 text-white/60" />
              </motion.button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city (e.g. Rome, Berlin)..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 rounded-xl font-medium text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.2)',
                }}
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>
          </div>

          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 hide-scrollbar">
            {/* Search Results Dropdown */}
            {searchError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Search Results</div>
                {searchResults.map((item) => (
                  <button
                    key={item.displayName}
                    onClick={() => {
                      handleLocationSelect(item);
                      setSearchResults([]);
                    }}
                    className="w-full text-left flex items-center justify-between p-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    <div>
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-white/40">, {item.country}</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">
                      {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Interactive Map */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Drag Pin or Click Map</div>
              <LeafletMap lat={location.lat} lng={location.lng} onChange={handleMapCoordinateChange} />
            </div>

            {/* Current Coordinates Bar */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="col-span-2 flex items-center justify-center gap-3 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
              >
                <Navigation className={isLocating ? 'animate-spin w-4 h-4 text-cyan-400' : 'w-4 h-4 text-cyan-400'} />
                <span className="text-white text-sm font-medium">{isLocating ? 'Locating...' : 'My Live GPS Location'}</span>
              </button>
            </div>

            {/* Recent & Popular columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Searches */}
              {recentLocations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Places
                  </h3>
                  <div className="space-y-1.5">
                    {recentLocations.map((loc) => (
                      <button
                        key={`${loc.name}-${loc.lat}`}
                        onClick={() => handleLocationSelect(loc)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs"
                      >
                        <span className="font-medium text-white/80">{loc.name}</span>
                        <span className="font-mono text-white/30">
                          {loc.lat.toFixed(1)}°, {loc.lng.toFixed(1)}°
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Cities */}
              <div>
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" /> Popular Cities
                </h3>
                <div className="space-y-1.5">
                  {popularLocations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => handleLocationSelect(loc)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs"
                    >
                      <span className="font-medium text-white/80">{loc.name}</span>
                      <span className="font-mono text-white/30">
                        {loc.lat.toFixed(1)}°, {loc.lng.toFixed(1)}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Active Location Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/20">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-purple-400 mb-1">Active Station</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-sm">{location.name}</span>
                {location.country && <span className="text-white/40 text-xs">({location.country})</span>}
              </div>
              <div className="text-xs text-white/30 font-mono mt-1">
                LAT: {location.lat.toFixed(5)}° &bull; LNG: {location.lng.toFixed(5)}°
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

