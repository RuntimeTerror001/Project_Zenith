"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'cmdk';
import { Search, Globe, Satellite, MapPin, Clock, Settings, HelpCircle, Sparkles, X, ArrowRight, Flame } from 'lucide-react';
import { useUIStore, useZenithStore } from '@/stores/zenith';
import { planets, constellations, meteorShowers } from '@/data/astronomy';
import { cn } from '@/lib/utils';

const actions = [
  { id: 'explore-iss', label: 'Track ISS Live', icon: Satellite, category: 'Satellites' },
  { id: 'view-planets', label: 'View Planets', icon: Globe, category: 'Planets' },
  { id: 'view-constellations', label: 'Explore Constellations', icon: Sparkles, category: 'Stars' },
  { id: 'view-meteor-showers', label: 'Meteor Showers', icon: Sparkles, category: 'Events' },
  { id: 'set-location', label: 'Change Location', icon: MapPin, category: 'Settings' },
  { id: 'time-machine', label: 'Open Time Machine', icon: Clock, category: 'Tools' },
  { id: 'settings', label: 'Open Settings', icon: Settings, category: 'Settings' },
  { id: 'help', label: 'Help & Shortcuts', icon: HelpCircle, category: 'Help' },
];

export function CommandPalette() {
  const { isCommandPaletteOpen, toggleCommandPalette, toggleLocationPicker, toggleTimeMachine, toggleSettings } = useUIStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); toggleCommandPalette(); }
      if (e.key === 'Escape' && isCommandPaletteOpen) toggleCommandPalette();
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  const handleAction = useCallback((id: string) => {
    switch (id) {
      case 'set-location': toggleLocationPicker(); break;
      case 'time-machine': toggleTimeMachine(); break;
      case 'settings': toggleSettings(); break;
    }
    toggleCommandPalette();
  }, [toggleCommandPalette, toggleLocationPicker, toggleTimeMachine, toggleSettings]);

  const filteredActions = actions.filter((a) => a.label.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));
  const filteredPlanets = planets.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredMeteors = meteorShowers.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleCommandPalette} />
        <motion.div initial={{ scale: 0.96, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 20 }} transition={{ type: 'spring', duration: 0.3 }} className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-white/40" />
                <Command.Input value={search} onValueChange={setSearch} placeholder="Search celestial objects, actions..." className="flex-1 bg-transparent text-white text-lg placeholder:text-white/30 focus:outline-none" autoFocus />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-xs text-white/50">ESC</kbd>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredActions.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-medium text-white/40">Quick Actions</div>
                  {filteredActions.map((action) => (
                    <Command.Item key={action.id} onSelect={() => handleAction(action.id)} className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center"><action.icon className="w-4 h-4 text-cyan-400" /></div>
                      <div className="flex-1"><div className="text-white font-medium">{action.label}</div><div className="text-xs text-white/40">{action.category}</div></div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                    </Command.Item>
                  ))}
                </div>
              )}
              {filteredPlanets.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-medium text-white/40">Planets</div>
                  {filteredPlanets.map((planet) => (
                    <Command.Item key={planet.id} className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: planet.color }} />
                      <div className="flex-1"><div className="text-white font-medium">{planet.name}</div><div className="text-xs text-white/40">{planet.distanceFromSun} AU from Sun</div></div>
                      <span className="text-2xl">{planet.symbol}</span>
                    </Command.Item>
                  ))}
                </div>
              )}
              {filteredMeteors.length > 0 && search && (
                <div>
                  <div className="px-2 py-1.5 text-xs font-medium text-white/40">Meteor Showers</div>
                  {filteredMeteors.map((meteor) => (
                    <Command.Item key={meteor.id} className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <Flame className="w-5 h-5 text-yellow-400" />
                      <div className="flex-1"><div className="text-white font-medium">{meteor.name}</div><div className="text-xs text-white/40">Peak: {meteor.peakDate} | {meteor.zenithRatePerHour}/hr</div></div>
                    </Command.Item>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10">Ctrl+K</kbd><span className="ml-1">Open</span></span>
              </div>
              <button onClick={toggleCommandPalette} className="flex items-center gap-1 hover:text-white/60 transition-colors"><X className="w-3 h-3" /><span>Close</span></button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
