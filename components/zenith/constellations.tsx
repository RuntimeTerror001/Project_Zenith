"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { constellations } from '@/data/astronomy';
import { Star, X, Calendar, Compass, Info, Sparkles, Eye, Moon, Sun } from 'lucide-react';
import { cn } from '@/utils/utils';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const constellationMaps: Record<string, { stars: { x: number; y: number; size: number; name?: string; magnitude?: number }[]; lines: [number, number][] }> = {
  orion: {
    stars: [
      { x: 50, y: 12, size: 5, name: 'Betelgeuse', magnitude: 0.42 },
      { x: 72, y: 18, size: 4, name: 'Bellatrix', magnitude: 1.64 },
      { x: 28, y: 22, size: 2.5 },
      { x: 42, y: 48, size: 2.5 },
      { x: 50, y: 50, size: 2.5, name: 'Belt' },
      { x: 58, y: 48, size: 2.5 },
      { x: 38, y: 78, size: 5.5, name: 'Rigel', magnitude: 0.13 },
      { x: 68, y: 82, size: 3.5, name: 'Saiph', magnitude: 2.06 },
    ],
    lines: [[0,1],[0,2],[1,3],[2,4],[3,4],[4,5],[3,6],[5,7],[6,7]],
  },
  'ursa-major': {
    stars: [
      { x: 18, y: 38, size: 3, name: 'Dubhe', magnitude: 1.79 },
      { x: 32, y: 34, size: 3, name: 'Merak', magnitude: 2.37 },
      { x: 48, y: 38, size: 3.5, name: 'Alioth', magnitude: 1.77 },
      { x: 62, y: 44, size: 3.5, name: 'Mizar', magnitude: 2.27 },
      { x: 72, y: 36, size: 2.5 },
      { x: 82, y: 28, size: 3, name: 'Alkaid', magnitude: 1.86 },
      { x: 88, y: 42, size: 2.5 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  scorpius: {
    stars: [
      { x: 50, y: 10, size: 5.5, name: 'Antares', magnitude: 1.06 },
      { x: 44, y: 24, size: 2.5 },
      { x: 38, y: 36, size: 2.5 },
      { x: 42, y: 50, size: 2.5 },
      { x: 48, y: 62, size: 3 },
      { x: 56, y: 74, size: 2.5 },
      { x: 62, y: 84, size: 3, name: 'Shaula', magnitude: 1.62 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  leo: {
    stars: [
      { x: 22, y: 24, size: 2.5 },
      { x: 32, y: 18, size: 2.5 },
      { x: 50, y: 16, size: 5, name: 'Regulus', magnitude: 1.40 },
      { x: 68, y: 28, size: 2.5 },
      { x: 72, y: 48, size: 3 },
      { x: 62, y: 64, size: 2.5, name: 'Denebola', magnitude: 2.14 },
      { x: 38, y: 42, size: 2.5 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,2],[0,6]],
  },
  cygnus: {
    stars: [
      { x: 50, y: 8, size: 5.5, name: 'Deneb', magnitude: 1.25 },
      { x: 50, y: 36, size: 3.5, name: 'Sadr', magnitude: 2.23 },
      { x: 50, y: 62, size: 3, name: 'Gienah', magnitude: 2.48 },
      { x: 50, y: 84, size: 2.5 },
      { x: 20, y: 36, size: 2.5, name: 'Albireo', magnitude: 3.08 },
      { x: 80, y: 36, size: 2.5 },
    ],
    lines: [[0,1],[1,2],[2,3],[4,1],[1,5]],
  },
  cassiopeia: {
    stars: [
      { x: 12, y: 48, size: 4, name: 'Schedar', magnitude: 2.24 },
      { x: 28, y: 28, size: 3.5, name: 'Caph', magnitude: 2.27 },
      { x: 50, y: 48, size: 3, name: 'Ruchbah', magnitude: 2.68 },
      { x: 72, y: 24, size: 3.5, name: 'Segin', magnitude: 3.38 },
      { x: 88, y: 46, size: 3, name: 'Achird', magnitude: 3.44 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
};

const zodiacSigns: Record<string, string> = {
  aries: 'Aries ♈', taurus: 'Taurus ♉', gemini: 'Gemini ♊', leo: 'Leo ♌',
  virgo: 'Virgo ♍', scorpius: 'Scorpius ♏', sagittarius: 'Sagittarius ♐', aquarius: 'Aquarius ♒', pisces: 'Pisces ♓',
};

const mythologyExtended: Record<string, string> = {
  orion: 'Orion was the greatest hunter in Greek mythology. Son of Poseidon, he could walk on water. He boasted he would kill every animal on Earth, so Gaia sent the Scorpion to kill him. Zeus placed both in the sky but opposite sides so they never meet. Look for Orion rising in winter — his belt of three stars is unmistakable.',
  'ursa-major': 'Callisto was a beautiful nymph and hunting companion of Artemis. Zeus fell in love with her and transformed her into a bear to hide her from Hera. Her son Arcas nearly killed her, so Zeus placed them both in the heavens as Ursa Major and Ursa Minor — the Great and Little Bears.',
  scorpius: 'The scorpion sent by Gaia to kill Orion. After killing him, Zeus placed the scorpion in the sky as a reward. This is why Orion sets when Scorpius rises — they eternally chase each other across the sky, forever separated by the celestial sphere.',
  leo: 'The Nemean Lion was a ferocious beast with golden fur that no weapon could pierce. As his first labor, Heracles strangled the lion with his bare hands. Zeus immortalized the lion in the stars, placing its bright heart Regulus at its chest.',
  cygnus: 'Cygnus represents Zeus in the form of a swan. In one myth, Zeus transformed into a swan to seduce Leda, Queen of Sparta. The constellation appears to fly along the Milky Way, its wings spread wide across the summer sky.',
  cassiopeia: 'Cassiopeia was a vain queen who boasted she was more beautiful than the Nereids. Poseidon punished her by placing her in the sky on a throne, condemned to circle the celestial pole — sometimes appearing upside down as a lesson in humility.',
};

const bestViewingInfo: Record<string, { hemisphere: string; difficulty: string; time: string }> = {
  orion: { hemisphere: 'Both (best Northern)', difficulty: 'Easy', time: 'Winter evenings' },
  'ursa-major': { hemisphere: 'Northern', difficulty: 'Easy', time: 'All year (circumpolar)' },
  scorpius: { hemisphere: 'Both (best Southern)', difficulty: 'Moderate', time: 'Summer evenings' },
  leo: { hemisphere: 'Both', difficulty: 'Moderate', time: 'Spring evenings' },
  cygnus: { hemisphere: 'Northern', difficulty: 'Moderate', time: 'Summer-Autumn' },
  cassiopeia: { hemisphere: 'Northern', difficulty: 'Easy', time: 'All year (circumpolar)' },
};

function ConstellationCanvas({ id, isVisible }: { id: string; isVisible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const map = constellationMaps[id];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    let frame = 0;
    let animId: number;

    const render = () => {
      if (!isVisible) {
        cancelAnimationFrame(animId);
        return;
      }
      frame++;
      ctx.clearRect(0, 0, W, H);

      const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H));
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(1, '#040812');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const t = frame * 0.015;
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137.508 + 0.08 * i) % 100) / 100 * W;
        const sy = ((i * 83.1 + 0.05 * i) % 100) / 100 * H;
        const alpha = 0.08 + 0.12 * Math.sin(t + i * 0.6);
        const size = 0.6 + Math.random() * 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
        ctx.fill();
      }

      const lineProgress = Math.min(1, frame / 70);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
      ctx.shadowBlur = 4;

      map.lines.forEach(([a, b], idx) => {
        const lineStart = idx * 0.08;
        const progress = Math.max(0, Math.min(1, (lineProgress - lineStart) * 1.5));

        const sa = map.stars[a];
        const sb = map.stars[b];
        const sx1 = sa.x / 100 * W;
        const sy1 = sa.y / 100 * H;
        const sx2 = sb.x / 100 * W;
        const sy2 = sb.y / 100 * H;

        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx1 + (sx2 - sx1) * progress, sy1 + (sy2 - sy1) * progress);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      map.stars.forEach((star, i) => {
        const revealProgress = Math.min(1, frame / 40);
        const sx = star.x / 100 * W;
        const sy = star.y / 100 * H;
        const twinkle = 0.65 + 0.35 * Math.sin(t * 2 + i * 1.2);
        const alpha = revealProgress * twinkle;
        const r = star.size;

        const outerGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 8);
        outerGlow.addColorStop(0, `rgba(220, 240, 255, ${alpha * 0.5})`);
        outerGlow.addColorStop(0.3, `rgba(180, 220, 255, ${alpha * 0.25})`);
        outerGlow.addColorStop(0.6, `rgba(100, 180, 255, ${alpha * 0.1})`);
        outerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 8, 0, Math.PI * 2);
        ctx.fill();

        const innerGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
        innerGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        innerGlow.addColorStop(0.4, `rgba(200, 230, 255, ${alpha * 0.7})`);
        innerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        if (star.name && frame > 50) {
          ctx.fillStyle = `rgba(150, 220, 255, ${alpha * 0.9})`;
          ctx.font = `${Math.max(10, r * 2.2)}px Inter, sans-serif`;
          const textX = sx + r + 6;
          const textY = sy + 4;
          ctx.fillText(star.name, textX, textY);

          if (star.magnitude) {
            ctx.fillStyle = `rgba(255, 200, 100, ${alpha * 0.6})`;
            ctx.font = `9px Inter, sans-serif`;
            ctx.fillText(`${star.magnitude}m`, textX, textY + 12);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [id, map, isVisible]);

  if (!map) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a1a] rounded-2xl">
        <Star className="w-16 h-16 text-white/10" />
      </div>
    );
  }

  return <canvas ref={canvasRef} width={400} height={280} className="w-full rounded-2xl" style={{ background: '#0a0a1a' }} />;
}

export function ConstellationViewer() {
  const [selectedConstellation, setSelectedConstellation] = useState<typeof constellations[0] | null>(null);

  return (
    <section id="constellations" className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-25" />

      <div className="relative z-10 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
        >
          <Star className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white/60">88 Constellations</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Discover <span className="gradient-text">Ancient Stories</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg text-white/50 max-w-2xl mx-auto"
        >
          Each constellation tells a story from mythology. Explore the tales written in the stars.
        </motion.p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {constellations.map((constellation, index) => (
          <motion.div
            key={constellation.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedConstellation(constellation)}
            className="glass-card rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Animated border glow on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(135deg, rgba(168, 85, 247, 0.15), transparent, rgba(0, 229, 255, 0.15))`,
              }}
            />

            {/* Sparkle effect */}
            <motion.div
              className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-400/60"
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">{constellation.name}</h3>
                  <p className="text-sm text-white/40">{constellation.abbreviation} &bull; {constellation.stars} stars</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <Star className="w-3 h-3 text-purple-400" fill="currentColor" />
                  <span className="text-xs text-purple-300 font-medium">{constellation.stars}</span>
                </div>
              </div>

              <p className="text-sm text-white/50 line-clamp-2 mb-4">{constellation.mythology}</p>

              <div className="flex items-center justify-between text-xs text-white/30">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Best: {months[constellation.bestMonth]}
                </span>
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  {constellation.quadrant}
                </span>
              </div>

              {zodiacSigns[constellation.id] && (
                <motion.div
                  className="mt-3 text-sm text-yellow-400/70 flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {zodiacSigns[constellation.id]}
                </motion.div>
              )}
            </div>

            {/* Hover arrow indicator */}
            <motion.div
              className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: 0, y: 0 }}
              whileHover={{ x: 3, y: -3 }}
            >
              <div className="p-2 rounded-full bg-white/10">
                <Star className="w-3.5 h-3.5 text-white/50" />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedConstellation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedConstellation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl overflow-hidden max-w-xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <motion.h3
                      className="text-2xl font-bold text-white"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {selectedConstellation.name}
                    </motion.h3>
                    <p className="text-white/50 text-sm mt-1">
                      {selectedConstellation.brightestStar} is the brightest star &bull; {selectedConstellation.abbreviation}
                    </p>
                    {zodiacSigns[selectedConstellation.id] && (
                      <div className="mt-2 text-sm text-yellow-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        {zodiacSigns[selectedConstellation.id]}
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedConstellation(null)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </motion.button>
                </div>
              </div>

              {/* Animated star map */}
              <div className="p-5">
                <ConstellationCanvas id={selectedConstellation.id} isVisible={!!selectedConstellation} />
              </div>

              <div className="p-6 space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Star, label: 'Stars', value: selectedConstellation.stars, color: 'purple' },
                    { icon: Calendar, label: 'Best Month', value: months[selectedConstellation.bestMonth], color: 'cyan' },
                    { icon: Compass, label: 'Quadrant', value: selectedConstellation.quadrant, color: 'yellow' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="p-3 rounded-xl bg-white/5 text-center"
                    >
                      <stat.icon className={`w-4 h-4 text-${stat.color}-400 mx-auto mb-1.5`} />
                      <div className="text-xs text-white/40">{stat.label}</div>
                      <div className="text-sm font-bold text-white">{stat.value}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Viewing info */}
                {bestViewingInfo[selectedConstellation.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {[
                      { icon: Eye, label: 'Hemisphere', value: bestViewingInfo[selectedConstellation.id].hemisphere },
                      { icon: Sun, label: 'When', value: bestViewingInfo[selectedConstellation.id].time },
                      { icon: Moon, label: 'Difficulty', value: bestViewingInfo[selectedConstellation.id].difficulty },
                    ].map((item, i) => (
                      <div key={item.label} className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                        <item.icon className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xs text-cyan-300 font-medium">{item.value}</div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Mythology */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/25"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Info className="w-4.5 h-4.5 text-purple-400" />
                    </motion.div>
                    <span className="text-sm font-semibold text-purple-300">Mythology</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {mythologyExtended[selectedConstellation.id] || selectedConstellation.mythology}
                  </p>
                </motion.div>

                {/* Best viewing conditions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-cyan-300">Best Viewing</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Highest in the sky during {months[selectedConstellation.bestMonth]} at midnight from northern hemisphere.
                    Located in quadrant {selectedConstellation.quadrant}. The brightest star {selectedConstellation.brightestStar} makes it easy to identify.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
