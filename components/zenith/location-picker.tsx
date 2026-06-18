"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, Search, Star } from 'lucide-react';
import { useUIStore, useZenithStore } from '@/stores/zenith';

const popularLocations = [
  { name: 'New York', lat: 40.7128, lng: -74.006, country: 'USA' },
  { name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, country: 'India' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
  { name: 'Berlin', lat: 52.52, lng: 13.405, country: 'Germany' },
];

export function LocationPicker() {
  const { isLocationPickerOpen, toggleLocationPicker } = useUIStore();
  const { location, setLocation } = useZenithStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleLocationSelect = useCallback((loc: typeof popularLocations[0]) => {
    setLocation({ lat: loc.lat, lng: loc.lng, name: loc.name, country: loc.country });
    toggleLocationPicker();
  }, [setLocation, toggleLocationPicker]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude, name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` });
        setIsLocating(false);
        toggleLocationPicker();
      },
      () => setIsLocating(false)
    );
  }, [setLocation, toggleLocationPicker]);

  const filteredLocations = popularLocations.filter((loc) => loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.country.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isLocationPickerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={toggleLocationPicker}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="glass-card rounded-3xl overflow-hidden max-w-lg w-full mx-4">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
                <div><h2 className="text-xl font-bold text-white">Location</h2><p className="text-sm text-white/40">Set your observation point</p></div>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={toggleLocationPicker} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><X className="w-5 h-5 text-white/60" /></motion.button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search city..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50" autoFocus />
            </div>
          </div>
          <div className="p-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={getCurrentLocation} disabled={isLocating} className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-medium">{isLocating ? 'Locating...' : 'Use Current Location'}</span>
            </motion.button>
          </div>
          <div className="p-4 pt-0">
            <h3 className="text-sm text-white/40 mb-3 flex items-center gap-2"><Star className="w-4 h-4" />Popular Cities</h3>
            <div className="max-h-80 overflow-y-auto space-y-2 hide-scrollbar">
              {filteredLocations.map((loc, index) => (
                <motion.button key={loc.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleLocationSelect(loc)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg">{loc.country.slice(0, 2)}</div>
                  <div className="text-left"><div className="font-medium text-white">{loc.name}</div><div className="text-xs text-white/40">{loc.country}</div></div>
                  <div className="ml-auto text-xs text-white/30 font-mono">{loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°</div>
                  <MapPin className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-white/40 mb-1">Current Location</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" /><span className="font-medium text-white">{location.name}</span>{location.country && <span className="text-white/40">({location.country})</span>}</div>
              <div className="text-xs text-white/30 font-mono mt-1">{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
