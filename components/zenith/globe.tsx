"use client";

import { motion } from 'framer-motion';
import { Satellite, Globe, Zap, Users, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useIssPosition } from '@/hooks/use-astronomy-queries';

// Dynamically load the CesiumGlobe to avoid SSR issues
const CesiumGlobe = dynamic(() => import('./cesium-globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/40 text-white/30 border border-white/10 rounded-3xl" style={{ minHeight: '520px' }}>
      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
      <span>Loading Live 3D Globe...</span>
    </div>
  ),
});

export function InteractiveGlobe() {
  const { data: issData } = useIssPosition();

  // Telemetry mappings
  const latVal = issData?.latitude !== undefined ? issData.latitude.toFixed(2) : '0.00';
  const lngVal = issData?.longitude !== undefined ? issData.longitude.toFixed(2) : '0.00';
  const altVal = issData?.altitude !== undefined ? Math.round(issData.altitude) : 408;
  // velocity is in km/h, convert to km/s
  const speedVal = issData?.velocity !== undefined ? (issData.velocity / 3600).toFixed(2) : '7.66';
  const crewCount = issData?.crew?.length !== undefined ? issData.crew.length : 7;

  return (
    <section id="globe" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-25 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/60">Live Earth View</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Our <span className="gradient-text">Living Planet</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-white/50 max-w-2xl mx-auto"
          >
            Watch the ISS orbit in real-time. Drag to rotate, scroll to zoom, click for details.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Globe Canvas Container */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-card rounded-3xl overflow-hidden"
              style={{ minHeight: '520px', position: 'relative' }}
            >
              <CesiumGlobe />
            </motion.div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card card-glow rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 rounded-xl bg-yellow-500/20"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Satellite className="w-5 h-5 text-yellow-400" />
                </motion.div>
                <div>
                  <div className="font-bold text-white text-sm">ISS Position</div>
                  <div className="text-xs text-white/40">International Space Station</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Latitude</div>
                  <div className="font-bold text-white text-sm">{latVal}&deg;</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Longitude</div>
                  <div className="font-bold text-white text-sm">{lngVal}&deg;</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Altitude</div>
                  <div className="font-bold text-cyan-400 text-sm">{altVal} km</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Speed</div>
                  <div className="font-bold text-green-400 text-sm">{speedVal} km/s</div>
                </div>
              </div>
            </motion.div>

            {[
              { icon: Globe, color: 'cyan', title: 'Active Satellites', value: '9,000+', sub: 'In Earth orbit' },
              { icon: Zap, color: 'yellow', title: 'Orbital Speed', value: '28,000', sub: 'km/h average' },
              { icon: Users, color: 'green', title: 'ISS Crew', value: String(crewCount), sub: 'Astronauts aboard' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card card-glow rounded-2xl p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-${item.color}-500/20`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/40">{item.title}</div>
                    <div className="font-bold text-xl gradient-text">{item.value}</div>
                    <div className="text-xs text-white/30">{item.sub}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
