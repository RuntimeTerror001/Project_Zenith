"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { meteorShowers } from '@/data/astronomy';
import { useLiveSpaceEvents } from '@/hooks/use-astronomy-queries';
import { Sparkles, Asterisk, Rocket, AlertTriangle, Gauge, MapPin, TrendingUp, Radio, Zap, Globe } from 'lucide-react';
import { cn, formatDate } from '@/utils/utils';

function AnimatedCount({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function SparkleEffect({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.random() * 200 - 50,
            y: Math.random() * 150 - 25,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function MeteorShowerCalendar() {
  const { data: liveEvents } = useLiveSpaceEvents();
  const nearEarthObjects = liveEvents?.nearEarthObjects ?? [];
  const upcomingLaunches = liveEvents?.upcomingLaunches ?? [];
  const auroraKpIndex = liveEvents?.auroraKpIndex ?? { level: 0, probability: 0, description: 'Loading live geomagnetic conditions', forecast: 'Connecting to NOAA space weather data.' };
  const [hoveredShower, setHoveredShower] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'launches' | 'cosmic'>('launches');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <section id="events" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-25" />

      <div className="relative z-10 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-white/60">Celestial Events</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          Meteor <span className="gradient-text">Showers</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg text-white/50 max-w-2xl mx-auto"
        >
          Plan your stargazing sessions with our meteor shower calendar.
        </motion.p>
      </div>

      {/* Meteor shower cards */}
      <div className="relative z-10 max-w-6xl mx-auto mb-12">
        <div className="flex flex-wrap justify-center gap-5">
          {meteorShowers.map((shower, index) => {
            const peakMonth = parseInt(shower.peakDate.split('-')[1]) - 1;
            const isHovered = hoveredShower === shower.id;

            return (
              <motion.div
                key={shower.id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.08, y: -10 }}
                whileTap={{ scale: 1.02 }}
                onHoverStart={() => setHoveredShower(shower.id)}
                onHoverEnd={() => setHoveredShower(null)}
                className="glass-card rounded-2xl p-6 min-w-[220px] cursor-pointer relative overflow-hidden"
                style={{
                  boxShadow: isHovered ? `0 20px 60px rgba(168, 85, 247, 0.2)` : undefined,
                }}
              >
                {/* Gradient overlay on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 transition-opacity"
                  animate={{ opacity: isHovered ? 0.15 : 0 }}
                  style={{
                    background: `radial-gradient(circle at center, rgba(168, 85, 247, 0.4), rgba(0, 229, 255, 0.3), transparent)`,
                  }}
                />

                {/* Sparkle effect */}
                <SparkleEffect active={isHovered} />

                {/* Animated meteor streak on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ x: -50, y: -50, opacity: 0 }}
                      animate={{ x: 250, y: 120, opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute pointer-events-none"
                      style={{ top: 10, left: 10 }}
                    >
                      <div
                        className="w-[80px] h-[2px]"
                        style={{
                          background: 'linear-gradient(to left, rgba(255,255,255,0.9), rgba(255,200,50,0.6), transparent)',
                          transform: 'rotate(35deg)',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <motion.div
                      animate={isHovered ? { rotate: 360, scale: 1.2 } : { rotate: 0 }}
                      transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                    <span className="font-bold text-white">{shower.name}</span>
                  </div>

                  <div className="text-4xl font-bold gradient-text mb-2">
                    <AnimatedCount end={shower.zenithRatePerHour} suffix="/hr" />
                  </div>

                  <div className="text-sm text-white/50 mb-2">
                    Peak: {months[peakMonth]} {parseInt(shower.peakDate.split('-')[2])}
                  </div>

                  <div className="text-xs text-yellow-400/80 mb-4 font-semibold flex items-center gap-1.5 justify-start">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Visibility: {shower.visibility}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      {shower.speed} km/s
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      {shower.constellation}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Secondary sections */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Near Earth Objects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
              }}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Asterisk className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">Near Earth Objects</h3>
              <p className="text-sm text-white/40">Asteroids tracking close to Earth</p>
            </div>
          </div>

          <div className="space-y-3">
            {nearEarthObjects.map((neo, index) => (
              <motion.div
                key={neo.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">{neo.name}</span>
                  {neo.hazardous && (
                    <motion.span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-xs text-red-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Hazardous
                    </motion.span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs text-white/50">
                  <div>
                    <span className="block text-white/30 mb-0.5">Size</span>
                    <span className="text-white font-medium">{neo.diameter} km</span>
                  </div>
                  <div>
                    <span className="block text-white/30 mb-0.5">Speed</span>
                    <span className="text-cyan-400 font-medium">{neo.velocity} km/s</span>
                  </div>
                  <div>
                    <span className="block text-white/30 mb-0.5">Approach</span>
                    <span className="text-purple-400 font-medium">{formatDate(new Date(neo.approachDate))}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Launches & Cosmic Events Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setActiveTab('launches')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1.5",
                    activeTab === 'launches'
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Launch Manifest</span>
                </button>
                <button
                  onClick={() => setActiveTab('cosmic')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1.5",
                    activeTab === 'cosmic'
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Cosmic Events</span>
                </button>
              </div>
              <p className="text-xs text-white/40 hidden sm:block">Space Bulletin</p>
            </div>

            {activeTab === 'launches' ? (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {upcomingLaunches.map((launch, index) => (
                  <motion.div
                    key={launch.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: -5 }}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white group-hover:text-purple-300 transition-colors text-left">{launch.name}</span>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                        launch.status === 'scheduled'
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-white/10 text-white/40"
                      )}>
                        {launch.status}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 mb-2 text-left">{launch.provider} | {launch.rocket}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/30 truncate max-w-[200px] text-left">{launch.location}</span>
                      <span className="text-cyan-400">{formatDate(new Date(launch.launchDate))}</span>
                    </div>
                  </motion.div>
                ))}
                {upcomingLaunches.length === 0 && (
                  <div className="text-center py-12 text-sm text-white/45">No upcoming launches scheduled.</div>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {(liveEvents?.spaceEvents ?? []).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: -5 }}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="font-medium text-white group-hover:text-cyan-300 transition-colors text-left">{event.name}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0",
                        event.type === 'eclipse' && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                        event.type === 'comet' && "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
                        event.type === 'conjunction' && "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      )}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mb-3 leading-relaxed text-left">{event.description}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[10px] text-white/40">
                      <div className="text-left">
                        <span className="block text-white/30 font-medium">Visibility</span>
                        <span className="text-white/60 truncate block">{event.visibility}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-white/30 font-medium">Date</span>
                        <span className="text-cyan-400 font-semibold">{formatDate(new Date(event.date))}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {(liveEvents?.spaceEvents ?? []).length === 0 && (
                  <div className="text-center py-12 text-sm text-white/45">No cosmic events scheduled.</div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Aurora Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              }}
              whileHover={{ scale: 1.1 }}
            >
              <Radio className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">Aurora Forecast</h3>
              <p className="text-sm text-white/40">Geomagnetic activity monitoring</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="p-5 rounded-xl bg-white/5 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className="text-5xl font-bold gradient-text mb-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {auroraKpIndex.level}
              </motion.div>
              <div className="text-xs text-white/40">KP Index</div>
            </motion.div>

            <motion.div
              className="p-5 rounded-xl bg-white/5 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className="text-5xl font-bold text-green-400 mb-2"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {(auroraKpIndex.probability * 100).toFixed(0)}%
              </motion.div>
              <div className="text-xs text-white/40">Probability</div>
            </motion.div>

            <motion.div
              className="p-5 rounded-xl bg-white/5 md:col-span-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <span className="text-sm font-medium text-white">{auroraKpIndex.description}</span>
              </div>
              <p className="text-xs text-white/50">{auroraKpIndex.forecast}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
