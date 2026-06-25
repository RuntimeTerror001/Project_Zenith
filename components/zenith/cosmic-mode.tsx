"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useZenithStore } from '@/store/zenith-store';
import { useIssPosition, useAstronomyStats } from '@/hooks/use-astronomy-queries';
import { formatDistance, formatSpeed } from '@/utils/utils';

function CosmicCanvas({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let animId: number;
    let rotY = 0;
    const rotX = 0.4;
    let frame = 0;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.3;

    interface Star { x: number; y: number; size: number; twinkle: number; }
    const stars: Star[] = Array.from({ length: 300 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      size: Math.random() * 2 + 0.3, twinkle: Math.random() * Math.PI * 2,
    }));

    interface ShootStar { x: number; y: number; vx: number; vy: number; length: number; opacity: number; }
    let shootStars: ShootStar[] = [];

    const latLngToScreen = (lat: number, lng: number) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180 + rotY;
      const x3 = Math.sin(phi) * Math.cos(theta);
      const y3raw = Math.cos(phi);
      const z3 = Math.sin(phi) * Math.sin(theta);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y3 = y3raw * cosX - z3 * sinX;
      const z3f = y3raw * sinX + z3 * cosX;
      return { x: cx + x3 * radius, y: cy - y3 * radius, visible: z3f > 0 };
    };

    const continents: Array<[number, number][]> = [
      [[15,-117],[22,-110],[25,-97],[29,-95],[30,-89],[32,-80],[35,-75],[42,-70],[47,-53],[60,-64],[70,-90],[72,-100],[70,-130],[55,-130],[50,-125],[44,-124],[37,-122],[32,-117],[20,-110],[15,-92],[15,-117]],
      [[-5,-80],[-5,-35],[-12,-37],[-23,-43],[-32,-52],[-34,-58],[-40,-62],[-50,-68],[-55,-68],[-55,-66],[-45,-66],[-35,-58],[-28,-50],[-22,-41],[-5,-35],[-2,-50],[-5,-80]],
      [[35,0],[42,-9],[44,0],[50,-5],[52,2],[58,5],[58,30],[55,40],[47,40],[40,30],[35,26],[35,0]],
      [[35,-5],[35,36],[10,42],[0,42],[-10,40],[-25,32],[-34,26],[-34,18],[-16,12],[-5,10],[0,8],[5,8],[10,14],[15,40],[20,38],[30,32],[35,28],[35,-5]],
      [[10,100],[20,120],[35,140],[40,130],[50,140],[60,150],[65,140],[65,100],[45,60],[30,48],[20,45],[10,44],[10,100]],
    ];

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const nb = ctx.createRadialGradient(cx * 0.4, cy * 0.5, 0, cx, cy, radius * 2.5);
      nb.addColorStop(0, 'rgba(124,58,237,0.1)');
      nb.addColorStop(0.5, 'rgba(0,100,200,0.05)');
      nb.addColorStop(1, 'transparent');
      ctx.fillStyle = nb;
      ctx.fillRect(0, 0, width, height);

      const t = frame * 0.01;
      stars.forEach((s) => {
        const alpha = prefersReducedMotion ? 0.6 : 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t + s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${alpha})`;
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        if (frame % 120 === 0 && shootStars.length < 3) {
          const angle = 0.5 + Math.random() * 0.3;
          shootStars.push({ x: Math.random() * width * 0.7, y: Math.random() * cy * 0.5, vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12, length: 100, opacity: 1 });
        }
        shootStars = shootStars.filter((ss) => {
          ss.x += ss.vx; ss.y += ss.vy; ss.opacity -= 0.018;
          if (ss.opacity > 0) {
            const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx / ss.length * 100, ss.y - ss.vy / ss.length * 100);
            grad.addColorStop(0, `rgba(180,240,255,${ss.opacity})`);
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          return ss.opacity > 0;
        });
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      const earthGrd = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
      earthGrd.addColorStop(0, '#1a5aa0');
      earthGrd.addColorStop(0.5, '#0e2a5a');
      earthGrd.addColorStop(1, '#04101f');
      ctx.fillStyle = earthGrd;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.restore();

      ctx.fillStyle = 'rgba(32,160,80,0.4)';
      ctx.strokeStyle = 'rgba(60,200,100,0.5)';
      ctx.lineWidth = 0.6;
      continents.forEach((pts) => {
        ctx.beginPath();
        let first = true;
        pts.forEach(([lat, lng]) => {
          const p = latLngToScreen(lat, lng);
          if (!p.visible) { first = true; return; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          first = false;
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      const auroraAlpha = prefersReducedMotion ? 0.15 : 0.15 + 0.1 * Math.sin(frame * 0.02);
      const northPole = latLngToScreen(90, 0);
      if (northPole.visible) {
        const ag = ctx.createRadialGradient(northPole.x, northPole.y, 0, northPole.x, northPole.y, 80);
        ag.addColorStop(0, `rgba(0,255,128,${auroraAlpha})`);
        ag.addColorStop(0.5, `rgba(0,200,255,${auroraAlpha * 0.5})`);
        ag.addColorStop(1, 'transparent');
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(northPole.x, northPole.y, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      const atmoGrd = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.2);
      atmoGrd.addColorStop(0, 'rgba(0,100,200,0.3)');
      atmoGrd.addColorStop(0.4, 'rgba(0,150,255,0.12)');
      atmoGrd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = atmoGrd;
      ctx.fill();

      const bloomGrd = ctx.createRadialGradient(cx, cy, radius, cx, cy, radius * 1.8);
      bloomGrd.addColorStop(0, 'rgba(20,80,180,0.1)');
      bloomGrd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = bloomGrd;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      let first = true;
      const inc = 51.6 * Math.PI / 180;
      const issAngle = frame * 0.004;
      const orbitR = radius * 1.12;
      for (let a = 0; a < Math.PI * 2; a += 0.06) {
        const lx = Math.cos(a);
        const ly = Math.sin(a) * Math.cos(inc);
        const lz = Math.sin(a) * Math.sin(inc);
        const rx = lx * Math.cos(rotY) + lz * Math.sin(rotY);
        const ry0 = -lx * Math.sin(rotY) + lz * Math.cos(rotY);
        const ry = ry0 * Math.cos(rotX) - ly * Math.sin(rotX);
        const rz = ry0 * Math.sin(rotX) + ly * Math.cos(rotX);
        if (rz < 0) { first = true; continue; }
        const sx = cx + rx * orbitR;
        const sy = cy - ry * orbitR;
        first ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        first = false;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const issLx = Math.cos(issAngle);
      const issLy = Math.sin(issAngle) * Math.cos(inc);
      const issLz = Math.sin(issAngle) * Math.sin(inc);
      const issRx = issLx * Math.cos(rotY) + issLz * Math.sin(rotY);
      const issRy0 = -issLx * Math.sin(rotY) + issLz * Math.cos(rotY);
      const issRy = issRy0 * Math.cos(rotX) - issLy * Math.sin(rotX);
      const issRz = issRy0 * Math.sin(rotX) + issLy * Math.cos(rotX);
      if (issRz > 0) {
        const isx = cx + issRx * orbitR;
        const isy = cy - issRy * orbitR;
        const pg = ctx.createRadialGradient(isx, isy, 0, isx, isy, 18);
        pg.addColorStop(0, 'rgba(255,220,50,0.9)');
        pg.addColorStop(1, 'transparent');
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(isx, isy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(isx, isy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        frame++;
        rotY += 0.003;
        animId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [width, height]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

export function CosmicMode() {
  const { mode, setMode, soundEnabled, toggleSound, music, location, currentDate } = useZenithStore();
  const isActive = mode === 'cosmic';
  const setIsActive = (active: boolean) => setMode(active ? 'cosmic' : 'live');

  const { data: issData } = useIssPosition();
  const { data: stats } = useAstronomyStats(location.lat, location.lng, currentDate.toISOString());

  const issAltitude = issData?.altitude ? formatDistance(issData.altitude) : '408.00 km';
  const issSpeed = issData?.velocity ? formatSpeed(issData.velocity / 3600) : '7.66 km/s';
  const activeSats = stats?.totalSatellites ? `${stats.totalSatellites.toLocaleString()}+` : '9,000+';

  const statsList = [
    { label: 'ISS Altitude', value: issAltitude },
    { label: 'Orbital Speed', value: issSpeed },
    { label: 'Active Sats', value: activeSats },
  ];
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (isActive) {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    }
  }, [isActive]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('live');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMode]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsActive(true)}
        className="fixed bottom-8 left-8 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl glass text-sm font-medium text-white/70 hover:text-white transition-colors hidden lg:flex"
        style={{ border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 20px rgba(124,58,237,0.15)' }}
      >
        <Maximize className="w-4 h-4 text-purple-400" />
        Cosmic Mode
      </motion.button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            {size.w > 0 && <CosmicCanvas width={size.w} height={size.h} />}

            {/* Controls overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
            >
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleSound} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-white/50" />}
                </motion.button>
                <span className="text-white/50 text-sm">
                  {soundEnabled ? (music.track || 'Ambient Music') : 'Ambient Music (Muted)'}
                </span>
                <div className="w-px h-5 bg-white/20" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsActive(false)} className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/60">Exit</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
            >
              <div className="text-white/30 text-xs tracking-widest uppercase mb-1">Project Zenith</div>
              <div className="text-white/60 text-sm">Cosmic Mode &bull; Press Esc to exit</div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute top-8 right-8 space-y-2"
            >
              {statsList.map((s) => (
                <div key={s.label} className="px-4 py-2 rounded-xl text-right" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs text-white/30">{s.label}</div>
                  <div className="text-sm font-bold text-cyan-400">{s.value}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
