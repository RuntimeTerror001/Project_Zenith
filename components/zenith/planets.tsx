"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { planets, Planet } from '@/data/astronomy';
import { X, Orbit, MapPin, Clock, Gauge, Thermometer, Moon, RotateCw, Wind, CloudSun } from 'lucide-react';
import { cn, formatDistance } from '@/utils/utils';

const planetExtras: Record<string, { temp: string; fact: string; atmosphere: string; composition: string }> = {
  mercury: { temp: '-180 to 430°C', fact: 'A year on Mercury lasts only 88 Earth days', atmosphere: 'Virtually none - exosphere only', composition: 'Iron core (70% metal)' },
  venus: { temp: '465°C', fact: 'Hottest planet despite not being closest to Sun', atmosphere: '96% CO2, clouds of sulfuric acid', composition: 'Silicate rocks, iron core' },
  earth: { temp: '-88 to 58°C', fact: 'Only known world with liquid water and life', atmosphere: '78% N2, 21% O2', composition: 'Iron-nickel core, silicate mantle' },
  mars: { temp: '-125 to 20°C', fact: 'Has the tallest volcano: Olympus Mons (22 km)', atmosphere: '95% CO2, very thin', composition: 'Iron core, basaltic surface' },
  jupiter: { temp: '-108°C', fact: 'The Great Red Spot storm has raged for 350+ years', atmosphere: '90% H2, 10% He', composition: 'Metallic hydrogen core' },
  saturn: { temp: '-139°C', fact: 'Ring system spans 282,000 km but is razor-thin', atmosphere: '96% H2, 3% He', composition: 'Rocky ice core, metallic H2' },
  uranus: { temp: '-197°C', fact: 'Rotates on its side at 97.77° axial tilt', atmosphere: '83% H2, 15% He, 2% CH4', composition: 'Ice giant - water, methane, ammonia' },
  neptune: { temp: '-201°C', fact: 'Winds reach 2,100 km/h — fastest in the solar system', atmosphere: '80% H2, 19% He, 1% CH4', composition: 'Rocky core, icy mantle' },
};

export function PlanetExplorer() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'orbit' | 'grid'>('orbit');

  return (
    <section id="planets" className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-40 pointer-events-none" />

      <div className="relative z-10 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
        >
          <span className="text-2xl">🪐</span>
          <span className="text-sm text-white/60">Solar System</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Explore the <span className="gradient-text">Planets</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg text-white/50 max-w-2xl mx-auto"
        >
          Journey through our cosmic neighborhood. Click any planet to discover its secrets.
        </motion.p>
      </div>

      <div className="relative z-10 flex justify-center items-center max-w-4xl mx-auto" style={{ height: 520 }}>
        {/* Sun with enhanced glow */}
        <motion.div
          className="absolute z-10"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Corona effect */}
          <motion.div
            className="absolute"
            style={{
              width: 100, height: 100,
              left: -50, top: -50,
              background: 'radial-gradient(circle, rgba(255,200,50,0.3) 0%, transparent 70%)',
            }}
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <div
            className="w-20 h-20 rounded-full relative"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fffde7, #ffd700, #ff8f00, #e65100)',
              boxShadow: '0 0 60px rgba(255,200,0,0.8), 0 0 120px rgba(255,160,0,0.5), 0 0 180px rgba(255,100,0,0.3)',
            }}
          >
            {/* Surface texture animation */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background: 'radial-gradient(circle at 60% 40%, rgba(255,255,200,0.4), transparent 40%)',
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>

        {planets.map((planet, index) => {
          const orbitRadius = 70 + index * 52;
          const speedFactor = 0.0006 / (index + 1) * 3;
          const isHovered = hoveredPlanet === planet.id;
          const planetSize = Math.max(12, Math.min(38, planet.radius / 2500));

          return (
            <div key={planet.id} className="absolute" style={{ left: '50%', top: '50%' }}>
              {/* Orbit ring with glow on hover */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: orbitRadius * 2,
                  height: orbitRadius * 2,
                  left: -orbitRadius,
                  top: -orbitRadius,
                  border: `1px solid ${isHovered ? planet.color + '60' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isHovered ? `0 0 20px ${planet.color}30, inset 0 0 20px ${planet.color}15` : 'none',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 300 / (index + 1), repeat: Infinity, ease: 'linear' }}
              />

              {/* Orbiting planet */}
              <motion.div
                className="absolute"
                style={{ width: 0, height: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1 / speedFactor, repeat: Infinity, ease: 'linear' }}
              >
                <motion.button
                  onClick={() => setSelectedPlanet(planet)}
                  onHoverStart={() => setHoveredPlanet(planet.id)}
                  onHoverEnd={() => setHoveredPlanet(null)}
                  whileHover={{ scale: 1.6, zIndex: 50 }}
                  whileTap={{ scale: 1.3 }}
                  className="absolute focus:outline-none"
                  style={{ left: orbitRadius - planetSize / 2, top: -planetSize / 2 }}
                >
                  {/* Planet glow on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          width: planetSize * 2.5,
                          height: planetSize * 2.5,
                          left: -planetSize * 0.75,
                          top: -planetSize * 0.75,
                          background: `radial-gradient(circle, ${planet.color}40, transparent 70%)`,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Planet body with rotation */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1 / speedFactor, repeat: Infinity, ease: 'linear' }}
                    className="relative"
                  >
                    <div
                      className="rounded-full relative"
                      style={{
                        width: planetSize,
                        height: planetSize,
                        background: `radial-gradient(circle at 30% 30%, ${planet.color}ff, ${planet.color}bb, ${planet.color}66)`,
                        boxShadow: `
                          0 0 ${planetSize}px ${planet.color}50,
                          inset -${planetSize * 0.25}px -${planetSize * 0.25}px ${planetSize * 0.4}px ${planet.color}30,
                          inset ${planetSize * 0.1}px ${planetSize * 0.1}px ${planetSize * 0.3}px rgba(255,255,255,0.2)
                        `,
                      }}
                    >
                      {/* Surface bands for gas giants */}
                      {['jupiter', 'saturn'].includes(planet.id) && (
                        <div
                          className="absolute inset-1 rounded-full overflow-hidden"
                          style={{
                            background: `repeating-linear-gradient(
                              0deg,
                              transparent,
                              transparent 2px,
                              ${planet.color}40 2px,
                              ${planet.color}40 4px
                            )`,
                          }}
                        />
                      )}
                      {/* Ring for Saturn */}
                      {planet.id === 'saturn' && (
                        <div
                          className="absolute"
                          style={{
                            width: planetSize * 2,
                            height: planetSize * 0.5,
                            left: -planetSize * 0.5,
                            top: planetSize * 0.35,
                            background: `linear-gradient(90deg, transparent, ${planet.color}60, ${planet.color}90, ${planet.color}60, transparent)`,
                            transform: 'rotateX(70deg)',
                            borderRadius: '50%',
                            boxShadow: `0 0 10px ${planet.color}40`,
                          }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Planet label on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        className="absolute whitespace-nowrap text-xs font-bold pointer-events-none px-3 py-1.5 rounded-lg"
                        style={{
                          top: planetSize + 8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          color: planet.color,
                          background: 'rgba(0,0,0,0.7)',
                          border: `1px solid ${planet.color}50`,
                          boxShadow: `0 0 10px ${planet.color}30`,
                        }}
                      >
                        {planet.name}
                        <span className="ml-1.5 text-white/50">{planet.moons}m</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Planet grid below */}
      <div className="relative z-10 mt-20 max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {planets.map((planet, i) => (
          <motion.button
            key={planet.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelectedPlanet(planet)}
            whileHover={{ y: -6, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-card rounded-xl p-4 text-center group relative overflow-hidden"
          >
            {/* Hover glow */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `radial-gradient(circle, ${planet.color}15, transparent)` }}
            />
            <motion.div
              className="w-10 h-10 rounded-full mx-auto mb-2 relative"
              whileHover={{ rotate: 20 }}
              style={{
                background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}50)`,
                boxShadow: `0 0 15px ${planet.color}40`,
              }}
            >
              {planet.id === 'saturn' && (
                <div
                  className="absolute"
                  style={{
                    width: 20, height: 6,
                    left: -5, top: 14,
                    background: `${planet.color}80`,
                    transform: 'rotateX(70deg)',
                    borderRadius: '50%',
                  }}
                />
              )}
            </motion.div>
            <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors relative z-10">{planet.name}</div>
            <div className="text-xs text-white/30 relative z-10">{planet.moons} moons</div>
          </motion.button>
        ))}
      </div>

      {/* Planet modal */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedPlanet(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl overflow-hidden max-w-lg w-full"
            >
              {/* Header with planet visual */}
              <div className="relative p-8 pb-6" style={{ background: `radial-gradient(ellipse at 80% 20%, ${selectedPlanet.color}20, transparent 60%)` }}>
                <div className="absolute top-0 right-0 w-56 h-56 overflow-hidden rounded-bl-3xl pointer-events-none">
                  {/* Rotating planet in header */}
                  <motion.div
                    className="absolute rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 180, height: 180,
                      right: -30, top: -30,
                      background: `radial-gradient(circle at 35% 30%, ${selectedPlanet.color}dd, ${selectedPlanet.color}66, transparent)`,
                      boxShadow: `0 0 80px ${selectedPlanet.color}60`,
                    }}
                  >
                    {/* Surface detail */}
                    <div
                      className="absolute inset-2 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 40% 25%, rgba(255,255,255,0.2), transparent)`,
                      }}
                    />
                  </motion.div>

                  {/* Saturn ring */}
                  {selectedPlanet.id === 'saturn' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                      className="absolute"
                      style={{
                        width: 160, height: 50,
                        right: 10, top: 60,
                        background: `linear-gradient(90deg, transparent, ${selectedPlanet.color}80, ${selectedPlanet.color}cc, ${selectedPlanet.color}80, transparent)`,
                        transform: 'rotateX(70deg)',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPlanet(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 z-10"
                >
                  <X className="w-5 h-5 text-white/60" />
                </motion.button>

                <div className="flex items-center gap-4 relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-18 h-18 rounded-full flex-shrink-0 relative"
                    style={{
                      width: 72, height: 72,
                      background: `radial-gradient(circle at 30% 25%, ${selectedPlanet.color}ff, ${selectedPlanet.color}99, ${selectedPlanet.color}40)`,
                      boxShadow: `0 0 40px ${selectedPlanet.color}70`,
                    }}
                  >
                    {/* Shine effect */}
                    <div
                      className="absolute inset-1 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.3), transparent 50%)',
                      }}
                    />
                    {/* Ring */}
                    {selectedPlanet.id === 'saturn' && (
                      <div
                        className="absolute"
                        style={{
                          width: 100, height: 30,
                          left: -14, top: 25,
                          background: `linear-gradient(90deg, transparent, ${selectedPlanet.color}90, ${selectedPlanet.color}cc, ${selectedPlanet.color}90, transparent)`,
                          transform: 'rotateX(70deg)',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                  </motion.div>
                  <div>
                    <div className="text-3xl font-black text-white">{selectedPlanet.name}</div>
                    <div className="text-white/50 text-sm">{selectedPlanet.symbol} &bull; {selectedPlanet.moons} moon{selectedPlanet.moons !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 px-6 pb-3">
                {[
                  { icon: MapPin, label: 'From Sun', value: `${selectedPlanet.distanceFromSun.toLocaleString()}M km` },
                  { icon: Orbit, label: 'Orbital Period', value: `${selectedPlanet.orbitalPeriod} Earth days` },
                  { icon: RotateCw, label: 'Day Length', value: `${selectedPlanet.rotationPeriod} Earth days` },
                  { icon: Gauge, label: 'Diameter', value: formatDistance(selectedPlanet.radius) },
                  { icon: Moon, label: 'Moons', value: `${selectedPlanet.moons}` },
                  { icon: Thermometer, label: 'Temperature', value: planetExtras[selectedPlanet.id]?.temp || 'N/A' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
                    className="p-3.5 rounded-xl bg-white/5 flex items-start gap-2.5 transition-all cursor-default"
                  >
                    <stat.icon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-white/40">{stat.label}</div>
                      <div className="text-sm font-bold text-white">{stat.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="px-6 pb-6 space-y-3">
                <div className="p-4 rounded-xl" style={{ background: `${selectedPlanet.color}10`, border: `1px solid ${selectedPlanet.color}25` }}>
                  <p className="text-white/75 text-sm leading-relaxed mb-3">{selectedPlanet.description}</p>
                  {planetExtras[selectedPlanet.id] && (
                    <>
                      <div className="flex items-start gap-2 text-sm mb-2">
                        <Wind className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/50">{planetExtras[selectedPlanet.id].atmosphere}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CloudSun className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/50">{planetExtras[selectedPlanet.id].composition}</span>
                      </div>
                    </>
                  )}
                </div>

                {planetExtras[selectedPlanet.id] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <span className="text-lg">✦</span>
                    <span className="text-white/70 text-sm">{planetExtras[selectedPlanet.id].fact}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
