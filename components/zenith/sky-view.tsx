"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star as StarIcon, Globe, ChevronRight, X, Eye, Clock, Compass, Loader2 } from 'lucide-react';
import { planets as planetData, brightestStars as staticBrightestStars } from '@/data/astronomy';
import { useZenithStore } from '@/store/zenith-store';
import { cn } from '@/utils/utils';
import { raDecToAzEl, getPlanetHorizontalPosition } from '@/utils/astronomy';
import type { CelestialObject } from '@/types/zenith';

interface StarRecord {
  ra: number;
  dec: number;
  mag: number;
}

interface ConstellationLine {
  id: string;
  name: string;
  lines: [number, number][][];
}

export function SkyView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { location, currentDate, selectedObject, setSelectedObject } = useZenithStore();

  const [stars, setStars] = useState<StarRecord[]>([]);
  const [constellations, setConstellations] = useState<ConstellationLine[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'planets' | 'stars' | 'constellations'>('all');
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch stars binary and constellations geojson
  useEffect(() => {
    async function loadAstronomicalData() {
      try {
        const [starsRes, constellationsRes] = await Promise.all([
          fetch('/api/stars'),
          fetch('/api/constellations'),
        ]);

        const contentType = starsRes.headers.get('Content-Type') || '';
        if (starsRes.ok && contentType.includes('octet-stream')) {
          const buffer = await starsRes.arrayBuffer();
          const view = new DataView(buffer);
          const numStars = Math.floor(buffer.byteLength / 6);
          const parsedStars: StarRecord[] = [];

          for (let i = 0; i < numStars; i++) {
            const offset = i * 6;
            if (offset + 5 < buffer.byteLength) {
              const ra = (view.getUint16(offset, true) * 360) / 65535;
              const dec = (view.getUint16(offset + 2, true) * 180) / 65535 - 90;
              const mag = view.getInt16(offset + 4, true) / 100;

              // Render stars down to magnitude 6.5 (human naked-eye visibility limit in ideal dark sky)
              if (mag < 6.5) {
                parsedStars.push({ ra, dec, mag });
              }
            }
          }
          setStars(parsedStars);
        }

        if (constellationsRes.ok) {
          const constData = await constellationsRes.json();
          setConstellations(constData);
        }
      } catch (err) {
        console.error("Failed to load sky catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAstronomicalData();
  }, []);

  // Azimuthal Equidistant Projection helper centered around Zenith (Observer's straight up)
  const getScreenCoords = (azimuth: number, elevation: number, width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.42;

    // Zenith is at the center (elevation = 90), Horizon is at boundary (elevation = 0)
    const r = maxRadius * (1 - elevation / 90);
    
    // Azimuth: 0 is North (up), 90 is East (right), 180 is South (down), 270 is West (left)
    const angleRad = (azimuth - 90) * Math.PI / 180;
    
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
      r,
    };
  };

  // Compute live horizontal positions for planets
  const visiblePlanets = useMemo(() => {
    return planetData
      .filter((p) => p.id !== 'earth') // We are on earth
      .map((p) => {
        const pos = getPlanetHorizontalPosition(p.id, currentDate, location.lat, location.lng);
        return {
          ...p,
          azimuth: pos.azimuth,
          elevation: pos.elevation,
          distance: pos.distance,
          visible: pos.visible,
        };
      });
  }, [currentDate, location]);

  // Compute live horizontal positions for top brightest stars
  const visibleBrightestStars = useMemo(() => {
    return staticBrightestStars.map((s) => {
      const pos = raDecToAzEl(s.ra, s.dec, location.lat, location.lng, currentDate);
      return {
        ...s,
        azimuth: pos.azimuth,
        elevation: pos.elevation,
        visible: pos.elevation > 0,
      };
    });
  }, [currentDate, location]);

  // Redraw Canvas (stars, constellations, grid)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loading) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.42;

    // Draw sky dome circle
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 15, 30, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw grid rings (Elevation 30° and 60°)
    [30, 60].forEach((el) => {
      const r = maxRadius * (1 - el / 90);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    });

    // Draw radial azimuth grid lines (every 30 degrees)
    ctx.setLineDash([2, 8]);
    for (let az = 0; az < 360; az += 30) {
      const angle = (az - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxRadius * Math.cos(angle), cy + maxRadius * Math.sin(angle));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 1. Draw Constellation lines (if enabled)
    if (viewMode === 'all' || viewMode === 'constellations') {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.22)'; // Glowing purple
      ctx.lineWidth = 0.8;
      constellations.forEach((c) => {
        c.lines.forEach((line) => {
          ctx.beginPath();
          let drawing = false;

          line.forEach(([ra, dec]) => {
            const pos = raDecToAzEl(ra, dec, location.lat, location.lng, currentDate);
            if (pos.elevation > 0) {
              const coords = getScreenCoords(pos.azimuth, pos.elevation, dimensions.width, dimensions.height);
              if (!drawing) {
                ctx.moveTo(coords.x, coords.y);
                drawing = true;
              } else {
                ctx.lineTo(coords.x, coords.y);
              }
            } else {
              drawing = false; // Lift pen if below horizon
            }
          });
          ctx.stroke();
        });
      });
    }

    // 2. Draw Stars (if enabled)
    if (viewMode === 'all' || viewMode === 'stars') {
      stars.forEach((star) => {
        const pos = raDecToAzEl(star.ra, star.dec, location.lat, location.lng, currentDate);
        if (pos.elevation > 0) {
          const coords = getScreenCoords(pos.azimuth, pos.elevation, dimensions.width, dimensions.height);
          
          // Size based on magnitude: brighter star = bigger dot
          const size = Math.max(0.6, (6.5 - star.mag) * 0.7);
          const alpha = Math.max(0.1, (6.5 - star.mag) / 6.5);

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
          ctx.fillRect(coords.x - size / 2, coords.y - size / 2, size, size);
        }
      });
    }

    // 3. Highlight brightest stars with subtle circles
    if (viewMode === 'all' || viewMode === 'stars') {
      visibleBrightestStars.forEach((star) => {
        if (star.visible) {
          const coords = getScreenCoords(star.azimuth, star.elevation, dimensions.width, dimensions.height);
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = star.color || '#fff';
          ctx.fill();
          
          // Outer glow ring
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 8, 0, Math.PI * 2);
          ctx.strokeStyle = `${star.color}30` || 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    }

    // 4. Draw Planets
    if (viewMode === 'all' || viewMode === 'planets') {
      visiblePlanets.forEach((p) => {
        if (p.visible) {
          const coords = getScreenCoords(p.azimuth, p.elevation, dimensions.width, dimensions.height);
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 11, 0, Math.PI * 2);
          ctx.strokeStyle = `${p.color}40`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    }

  }, [loading, stars, constellations, dimensions, viewMode, currentDate, location, visiblePlanets, visibleBrightestStars]);

  // Click handler for selectable targets
  const handleObjectSelect = (name: string, type: 'planet' | 'star', alt: number, az: number, mag?: number, dist?: number) => {
    setSelectedObject({
      id: `${type}-${name.toLowerCase()}`,
      name,
      type,
      altitude: alt,
      azimuth: az,
      magnitude: mag,
      distance: dist,
      visible: true,
    });
  };

  return (
    <section id="sky" ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#080c1d] to-[#12051c]" />

      {/* Loading HUD */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-3" />
          <span className="text-white/60 text-sm font-medium">Downloading & Parsing HYG Star Database...</span>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 block"
      />

      {/* Interactive HUD Overlays (Planets and Brightest Stars buttons) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Planets */}
        {(viewMode === 'all' || viewMode === 'planets') &&
          visiblePlanets.map((p) => {
            if (!p.visible) return null;
            const coords = getScreenCoords(p.azimuth, p.elevation, dimensions.width, dimensions.height);
            return (
              <button
                key={p.id}
                onClick={() => handleObjectSelect(p.name, 'planet', p.elevation, p.azimuth, undefined, p.distance)}
                className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 p-4 flex flex-col items-center group cursor-pointer"
                style={{ left: coords.x, top: coords.y }}
              >
                <div className="w-4 h-4 rounded-full flex items-center justify-center transition-all group-hover:scale-150" />
                <span className="text-[10px] text-white/70 font-semibold mt-1 px-1.5 py-0.5 rounded bg-black/45 backdrop-blur-sm border border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                  {p.name} {p.symbol}
                </span>
              </button>
            );
          })}

        {/* Brightest Stars */}
        {(viewMode === 'all' || viewMode === 'stars') &&
          visibleBrightestStars.map((s) => {
            if (!s.visible) return null;
            const coords = getScreenCoords(s.azimuth, s.elevation, dimensions.width, dimensions.height);
            return (
              <button
                key={s.id}
                onClick={() => handleObjectSelect(s.name, 'star', s.elevation, s.azimuth, s.magnitude)}
                className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 p-4 flex flex-col items-center group cursor-pointer"
                style={{ left: coords.x, top: coords.y }}
              >
                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all group-hover:scale-150" />
                <span className="text-[9px] text-white/50 font-medium mt-1 px-1.5 py-0.5 rounded bg-black/45 backdrop-blur-sm border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                  {s.name}
                </span>
              </button>
            );
          })}
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
        <div className="relative w-24 h-24 bg-black/45 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center">
          <div className="absolute top-1 text-[10px] text-cyan-400 font-bold">N</div>
          <div className="absolute bottom-1 text-[10px] text-white/40">S</div>
          <div className="absolute left-1.5 text-[10px] text-white/40">W</div>
          <div className="absolute right-1.5 text-[10px] text-white/40">E</div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="w-0.5 h-12 bg-gradient-to-t from-transparent to-cyan-400 rounded-full"
          />
        </div>
      </div>

      {/* Sky Info Panel */}
      <div className="absolute bottom-8 right-8 z-10">
        <div className="glass-card rounded-2xl p-4 space-y-2 border border-white/5 text-[11px] font-mono">
          <div className="text-[9px] uppercase tracking-wider font-semibold text-cyan-400 mb-1">Observation Hub</div>
          <div className="flex items-center gap-2 text-white/60">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Station: {location.name}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Lat: {location.lat.toFixed(2)}° &bull; Lng: {location.lng.toFixed(2)}°</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Compass className="w-3.5 h-3.5 text-green-400" />
            <span>Visible Stars: ~{stars.filter((s) => raDecToAzEl(s.ra, s.dec, location.lat, location.lng, currentDate).elevation > 0).length}</span>
          </div>
        </div>
      </div>

      {/* Object Detail Card */}
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
              className="glass-card border border-cyan-500/30 rounded-2xl p-5 flex items-center gap-5 backdrop-blur-lg shadow-2xl"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-white/5 border border-white/10"
                style={{
                  boxShadow: `0 0 20px rgba(6, 182, 212, 0.15)`
                }}
              >
                🌌
              </div>
              <div className="font-mono text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded font-semibold">{selectedObject.type}</span>
                </div>
                <h3 className="text-base font-bold font-sans text-white mb-1">{selectedObject.name}</h3>
                <div className="grid grid-cols-2 gap-x-4 text-white/60">
                  <div>Azimuth: <span className="text-white font-semibold">{selectedObject.azimuth.toFixed(1)}°</span></div>
                  <div>Elevation: <span className="text-white font-semibold">{selectedObject.altitude.toFixed(1)}°</span></div>
                  {selectedObject.magnitude !== undefined && (
                    <div className="col-span-2">Magnitude: <span className="text-white font-semibold">{selectedObject.magnitude.toFixed(2)}</span></div>
                  )}
                  {selectedObject.distance !== undefined && (
                    <div className="col-span-2">Distance: <span className="text-white font-semibold">{selectedObject.distance.toFixed(3)} AU</span></div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedObject(null)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 cursor-pointer text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Side object list panel displaying actual visible items
export function SkyObjectPanel() {
  const [activeTab, setActiveTab] = useState<'visible' | 'rising' | 'setting'>('visible');
  const { location, currentDate, setSelectedObject } = useZenithStore();

  const visiblePlanetsList = useMemo(() => {
    return planetData
      .filter((p) => p.id !== 'earth')
      .map((p) => {
        const pos = getPlanetHorizontalPosition(p.id, currentDate, location.lat, location.lng);
        return {
          ...p,
          azimuth: pos.azimuth,
          elevation: pos.elevation,
          distance: pos.distance,
          visible: pos.visible,
        };
      });
  }, [currentDate, location]);

  const visibleBrightStarsList = useMemo(() => {
    return staticBrightestStars.map((s) => {
      const pos = raDecToAzEl(s.ra, s.dec, location.lat, location.lng, currentDate);
      return {
        ...s,
        azimuth: pos.azimuth,
        elevation: pos.elevation,
        visible: pos.elevation > 0,
      };
    });
  }, [currentDate, location]);

  // Separate list into tabs based on elevation
  const filteredTabObjects = useMemo(() => {
    const all = [...visiblePlanetsList.map(p => ({...p, type: 'planet' as const})), ...visibleBrightStarsList.map(s => ({...s, type: 'star' as const}))];
    
    if (activeTab === 'visible') {
      return all.filter(o => o.visible);
    } else if (activeTab === 'rising') {
      // Objects below horizon but close to horizon (within 45 degrees below)
      return all.filter(o => !o.visible && o.elevation > -45 && o.elevation <= 0);
    } else {
      // Deeply below horizon
      return all.filter(o => o.elevation <= -45);
    }
  }, [activeTab, visiblePlanetsList, visibleBrightStarsList]);

  const handleListClick = (name: string, type: 'planet' | 'star', alt: number, az: number, mag?: number, dist?: number) => {
    setSelectedObject({
      id: `${type}-${name.toLowerCase()}`,
      name,
      type,
      altitude: alt,
      azimuth: az,
      magnitude: mag,
      distance: dist,
      visible: true,
    });
  };

  return (
    <div className="fixed right-0 top-[50%] -translate-y-1/2 z-40 glass-card rounded-l-2xl p-4 w-72 max-h-[70vh] overflow-hidden border-y border-l border-white/10 shadow-2xl flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <StarIcon className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-semibold text-white">Live Celestial Guide</span>
      </div>

      <div className="flex gap-1 mb-3">
        {(['visible', 'rising', 'setting'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-1 px-2 rounded-lg text-[10px] font-semibold tracking-wide transition-colors capitalize",
              activeTab === tab
                ? "bg-purple-500/25 border border-purple-500/35 text-purple-300"
                : "bg-white/5 border border-transparent text-white/40 hover:text-white/60"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-1 overflow-y-auto flex-1 pr-1 hover-scrollbar font-mono text-[11px]">
        {filteredTabObjects.length === 0 ? (
          <div className="text-center text-white/30 py-6 text-xs italic">No bodies in this category.</div>
        ) : (
          filteredTabObjects.map((obj, i) => (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleListClick(obj.name, obj.type, obj.elevation, obj.azimuth, (obj as any).magnitude, (obj as any).distance)}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer group border border-transparent hover:border-white/5 transition-all"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: obj.color || '#fff' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold font-sans truncate">{obj.name}</div>
                <div className="text-[9px] text-white/40">
                  {obj.elevation > 0 ? `Alt: ${obj.elevation.toFixed(1)}°` : `Below: ${Math.abs(obj.elevation).toFixed(1)}°`}
                </div>
              </div>
              <div className="text-[10px] text-cyan-400 font-semibold">{obj.elevation > 0 ? 'Visible' : 'Hidden'}</div>
              <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/40 transition-colors" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
