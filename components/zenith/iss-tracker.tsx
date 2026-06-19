"use client";

import { motion } from 'framer-motion';
import { Satellite, Users, Gauge, MapPin, Radio } from 'lucide-react';
import { cn, formatSpeed, formatDistance } from '@/utils/utils';
import { useIssPosition } from '@/hooks/use-astronomy-queries';

export function ISSLiveCard() {
  const { data, isPending, isError, refetch } = useIssPosition();
  if (isPending) return <div className="glass-card h-[440px] animate-pulse rounded-3xl" role="status" aria-label="Loading live ISS position" />;
  if (isError) return <div className="glass-card flex h-[440px] flex-col items-center justify-center rounded-3xl p-6 text-center"><p className="text-white/60">Live ISS signal is temporarily unavailable.</p><button className="btn-primary mt-4" onClick={() => void refetch()}>Reconnect</button></div>;
  const { altitude, visibility } = data;
  const velocity = data.velocity / 3600;
  const currentPos = { lat: data.latitude, lng: data.longitude };

  const statItems = [
    { icon: Gauge, label: 'Speed', value: formatSpeed(velocity), color: 'text-cyan-400' },
    { icon: MapPin, label: 'Altitude', value: formatDistance(altitude), color: 'text-purple-400' },
    { icon: Users, label: 'Crew', value: 'Live manifest', color: 'text-green-400' },
    { icon: Radio, label: 'Visibility', value: visibility === 'daylight' ? 'Daylight' : 'Night', color: visibility === 'daylight' ? 'text-yellow-400' : 'text-blue-400' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Satellite className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white">International Space Station</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-green-400">Live Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-40 bg-gradient-to-b from-transparent to-black/20 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
          <path d="M0,80 Q50,40 100,80 T200,80 T300,80 T400,80" fill="none" stroke="rgba(124,58,237,0.5)" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
        <motion.div animate={{ x: ['0%', '100%', '0%'] }} transition={{ duration: 92.68, repeat: Infinity, ease: 'linear' }} className="absolute top-1/2 left-0 transform -translate-y-1/2">
          <motion.div animate={{ boxShadow: ['0 0 20px rgba(0, 229, 255, 0.8)', '0 0 40px rgba(0, 229, 255, 0.4)', '0 0 20px rgba(0, 229, 255, 0.8)'] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-4 h-4 rounded-full bg-cyan-400" />
        </motion.div>
      </div>

      <div className="p-4 bg-black/20">
        <div className="flex items-center justify-between text-sm font-mono">
          <div className="flex items-center gap-2"><span className="text-white/40">LAT:</span><span className="text-cyan-400">{currentPos.lat.toFixed(4)}°</span></div>
          <div className="flex items-center gap-2"><span className="text-white/40">LNG:</span><span className="text-purple-400">{currentPos.lng.toFixed(4)}°</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6">
        {statItems.map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-1"><item.icon className={cn("w-4 h-4", item.color)} /><span className="text-xs text-white/50">{item.label}</span></div>
            <span className={cn("text-lg font-bold", item.color)}>{item.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
