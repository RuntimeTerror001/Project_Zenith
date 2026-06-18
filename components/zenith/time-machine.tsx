"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, History } from 'lucide-react';
import { useZenithStore, useUIStore } from '@/stores/zenith';
import { cn, formatDate, celestialEvents } from '@/lib/utils';

export function TimeMachine() {
  const { isTimeMachineOpen, toggleTimeMachine } = useUIStore();
  const { currentDate, setDate, timeSpeed, setTimeSpeed, isPlaying, togglePlay } = useZenithStore();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || timeSpeed === 0) return;
    const interval = setInterval(() => setDate(new Date(currentDate.getTime() + 1000 * timeSpeed)), 100);
    return () => clearInterval(interval);
  }, [isPlaying, timeSpeed, currentDate, setDate]);

  const handleSliderChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const now = new Date();
    const yearMs = 365.25 * 24 * 60 * 60 * 1000;
    const offsetMs = (percent - 0.5) * 100 * yearMs;
    setDate(new Date(now.getTime() + offsetMs));
  };

  const speeds = [{ label: '1x', value: 1 }, { label: '10x', value: 10 }, { label: '100x', value: 100 }, { label: '1K', value: 1000 }, { label: '10K', value: 10000 }];

  return (
    <AnimatePresence>
      {isTimeMachineOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={toggleTimeMachine}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="glass-card rounded-3xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"><History className="w-6 h-6 text-white" /></div>
                <div><h2 className="text-2xl font-bold text-white">Time Machine</h2><p className="text-white/50 text-sm">Travel through cosmic history</p></div>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={toggleTimeMachine} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><X className="w-5 h-5 text-white/60" /></motion.button>
            </div>

            <div className="text-center mb-8">
              <motion.div key={currentDate.toISOString()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl md:text-5xl font-bold gradient-text mb-2">{formatDate(currentDate)}</motion.div>
              <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="text-xl text-white/40 font-mono">{currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</motion.div>
            </div>

            <div ref={sliderRef} className="relative h-16 mb-8 cursor-pointer group" onClick={handleSliderChange}>
              <div className="absolute inset-0 rounded-xl overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-cyan-500/20" /></div>
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-white/10 rounded-full" />
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between text-xs text-white/30"><span>1924</span><span className="text-cyan-400">Now</span><span>2124</span></div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTimeSpeed(-Math.abs(timeSpeed))} className="p-3 rounded-xl bg-white/5 hover:bg-white/10"><SkipBack className="w-5 h-5 text-white/60" /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={togglePlay} className={cn("p-4 rounded-2xl", isPlaying ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-white/10 hover:bg-white/20")}>{isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}</motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTimeSpeed(Math.abs(timeSpeed))} className="p-3 rounded-xl bg-white/5 hover:bg-white/10"><SkipForward className="w-5 h-5 text-white/60" /></motion.button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-8">
              {speeds.map((speed) => (
                <motion.button key={speed.value} onClick={() => setTimeSpeed(Math.sign(timeSpeed) * speed.value)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", Math.abs(timeSpeed) === speed.value ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white" : "bg-white/5 text-white/60 hover:bg-white/10")}>{speed.label}</motion.button>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/60">Jump to Historical Events</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {celestialEvents.map((event) => (
                  <motion.button key={event.name} onClick={() => { setDate(new Date(event.date)); setSelectedPreset(event.name); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={cn("p-4 rounded-xl text-left transition-all", selectedPreset === event.name ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30" : "bg-white/5 hover:bg-white/10 border border-transparent")}>
                    <div className="font-medium text-white text-sm">{event.name}</div>
                    <div className="text-xs text-white/40">{event.date}</div>
                    <div className="text-xs text-white/50 mt-1">{event.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
