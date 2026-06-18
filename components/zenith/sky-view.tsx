"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Globe, Satellite, Moon, ChevronRight, X, Eye, Clock, Compass } from 'lucide-react';
import { planets, brightestStars, constellations } from '@/data/astronomy';
import { useZenithStore } from '@/stores/zenith';
import { cn } from '@/lib/utils';

interface SkyObject {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'constellation' | 'satellite' | 'moon';
  x: number;
  y: number;
  size: number;
  color: string;
  magnitude?: number;
  visible: boolean;
}

export function SkyView() {
  const [objects, setObjects] = useState<SkyObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<SkyObject | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'planets' | 'stars' | 'constellations'>('all');
  const canvasRef = useRef<HTMLDivElement>(null);
  const { location, currentDate } = useZenithStore();

  useEffect(() => {
    const generateSky = () => {
      const skyObjects: SkyObject[] = [];
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Add stars
      brightestStars.forEach((star, i) => {
        // Calculate position based on RA and Dec
        const ra1 = star.ra;
        const dec = star.dec;
        const x = (ra1 / 360) * width;
        const y = height / 2 - (dec / 90) * (height / 2);

        skyObjects.push({
          id: `star-${star.id}`,
          name: star.name,
          type: 'star',
          x: Math.abs(x % width),
          y: Math.max(50, Math.min(height - 50, y + height / 2)),
          size: Math.max(2, (5 - star.magnitude) * 2),
          color: star.color,
          magnitude: star.magnitude,
          visible: true
        });
      });

      // Add planets
      planets.forEach((planet, i) => {
        const angle = ((i + currentDate.getHours()) / 24) * Math.PI * 2;
        const radius = 150 + i * 30;
        const x = width / 2 + Math.cos(angle) * (radius + Math.random() * 100);
        const y = height / 3 + Math.sin(angle) * (radius * 0.5 + Math.random() * 50);

        skyObjects.push({
          id: `planet-${planet.id}`,
          name: planet.name,
          type: 'planet',
          x: x % width,
          y: Math.max(50, Math.min(height - 100, y)),
          size: Math.max(8, planet.radius / 2000),
          color: planet.color,
          visible: true
        });
      });

      // Add random background stars
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5 + 0.5;
        const opacity = Math.random() * 0.8 + 0.2;

        skyObjects.push({
          id: `bg-star-${i}`,
          name: '',
          type: 'star',
          x,
          y,
          size,
          color: `rgba(255, 255, 255, ${opacity})`,
          visible: true
        });
      }

      setObjects(skyObjects);
    };

    generateSky();
    const timer = setInterval(generateSky, 60000);
    return () => clearInterval(timer);
  }, [location, currentDate]);

  const filteredObjects = objects.filter((obj) => {
    if (viewMode === 'all') return true;
    if (viewMode === 'planets') return obj.type === 'planet';
    if (viewMode === 'stars') return obj.type === 'star';
    if (viewMode === 'constellations') return obj.type === 'constellation';
    return true;
  });

  return (
    <section id="sky" className="relative h-screen overflow-hidden">
      {/* Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0a0f1a] to-[#1a0a20]" />

      {/* Star Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0"
      >
        {filteredObjects.map((obj) => (
          <SkyObjectComponent
            key={obj.id}
            object={obj}
            onClick={() => setSelectedObject(obj)}
          />
        ))}

        {/* Constellation Lines */}
        {viewMode === 'all' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Sample constellation line */}
            <line
              x1="30%"
              y1="20%"
              x2="35%"
              y2="30%"
              stroke="rgba(124, 58, 237, 0.3)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          </svg>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {(['all', 'planets', 'stars', 'constellations'] as const).map((mode) => (
          <motion.button
            key={mode}
            onClick={() => setViewMode(mode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors",
              viewMode === mode
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                : "glass text-white/60 hover:text-white"
            )}
          >
            {mode}
          </motion.button>
        ))}
      </div>

      {/* Compass */}
      <div className="absolute bottom-8 left-8 z-10">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs text-cyan-400 font-bold">N</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-xs text-white/40">S</div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-xs text-white/40">W</div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-xs text-white/40">E</div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-gradient-to-t from-transparent to-cyan-400 rounded-full"
          />
        </div>
      </div>

      {/* Sky Info Panel */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Visibility: Excellent</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Sunset at 8:32 PM</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Compass className="w-4 h-4 text-green-400" />
            <span>Seeing: Good</span>
          </div>
        </div>
      </div>

      {/* Object Detail Modal */}
      <AnimatePresence>
        {selectedObject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="glass-card rounded-2xl p-6 flex items-center gap-6"
            >
              <div
                className="w-16 h-16 rounded-full"
                style={{
                  backgroundColor: selectedObject.color,
                  boxShadow: `0 0 30px ${selectedObject.color}60`
                }}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase text-white/40">{selectedObject.type}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedObject.name}</h3>
                {selectedObject.magnitude !== undefined && (
                  <p className="text-sm text-white/50">Magnitude: {selectedObject.magnitude}</p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  <ChevronRight className="w-5 h-5 text-cyan-400" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedObject(null)}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  <X className="w-5 h-5 text-white/60" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SkyObjectComponent({
  object,
  onClick
}: {
  object: SkyObject;
  onClick: () => void;
}) {
  const isInteractable = object.name !== '';

  return (
    <motion.button
      style={{
        left: object.x,
        top: object.y,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isInteractable ? { scale: 1.5 } : undefined}
      onClick={isInteractable ? onClick : undefined}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
        isInteractable && "cursor-pointer"
      )}
    >
      <motion.div
        animate={{
          scale: [1, object.type === 'planet' ? 1.1 : 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: object.type === 'planet' ? 3 : 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: object.size,
            height: object.size,
            backgroundColor: object.color,
            boxShadow: object.type === 'planet'
              ? `0 0 ${object.size * 2}px ${object.color}80`
              : `0 0 ${object.size}px ${object.color}`,
          }}
        />
      </motion.div>

      {/* Label for known stars/planets */}
      {isInteractable && object.type === 'planet' && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap">
          {object.name}
        </span>
      )}
    </motion.button>
  );
}

// Sky Object Panel (Right Sidebar)
export function SkyObjectPanel() {
  const [activeTab, setActiveTab] = useState<'visible' | 'rising' | 'setting'>('visible');

  return (
    <div className="fixed right-0 top-[50%] -translate-y-1/2 z-40 glass-card rounded-l-2xl p-4 w-72 max-h-[70vh] overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-white">Visible Objects</span>
      </div>

      <div className="flex gap-1 mb-4">
        {(['visible', 'rising', 'setting'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors",
              activeTab === tab
                ? "bg-purple-500/30 text-purple-300"
                : "bg-white/5 text-white/40 hover:text-white/60"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[400px] hide-scrollbar">
        {planets.slice(0, 4).map((planet, i) => (
          <motion.div
            key={planet.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer group"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: planet.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{planet.name}</div>
              <div className="text-xs text-white/30">{planet.distanceFromSun} AU</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
          </motion.div>
        ))}

        {brightestStars.slice(0, 4).map((star, i) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (i + 4) * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer group"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: star.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{star.name}</div>
              <div className="text-xs text-white/30">{star.constellation}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
