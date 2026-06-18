"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Telescope, MapPin, Clock, Menu, X, Command, Globe, Sparkles, Rocket, Star, Moon, Sun, Settings, Volume2, VolumeX, Home, Search } from 'lucide-react';
import { useZenithStore, useUIStore } from '@/stores/zenith';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '#home', icon: Home },
  { name: 'Globe', href: '#globe', icon: Globe },
  { name: 'Timeline', href: '#timeline', icon: Clock },
  { name: 'Planets', href: '#planets', icon: Sparkles },
  { name: 'Stars', href: '#constellations', icon: Star },
  { name: 'Events', href: '#events', icon: Rocket },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { soundEnabled, toggleSound } = useZenithStore();
  const { toggleCommandPalette, toggleLocationPicker, toggleTimeMachine } = useUIStore();
  const navRef = useRef<HTMLDivElement>(null);

  // Magnetic hover effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (scrollDelta > 15 && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      } else if (scrollDelta < -10) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard shortcut for toggle
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <motion.div
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -150 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          // Collapsed pill state
          <motion.div
            key="pill"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Background glow */}
            <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-purple-500/30 to-cyan-500/30" />

            <motion.button
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-3 px-5 py-3 rounded-full"
              style={{
                background: 'rgba(10, 10, 30, 0.9)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Telescope className="w-5 h-5 text-cyan-400" />
              </motion.div>
              <span className="font-bold text-white">Zenith</span>

              <div className="w-px h-5 bg-white/20 mx-1" />

              <Menu className="w-4 h-4 text-white/60" />
            </motion.button>
          </motion.div>
        ) : (
          // Expanded navbar state
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Expanded background glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -inset-4 rounded-3xl"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
              }}
            />

            <motion.div
              className="relative px-6 py-4 rounded-2xl"
              style={{
                background: 'rgba(10, 10, 35, 0.95)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-6">
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Telescope className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                  <span className="font-bold text-white text-lg">Zenith</span>
                </motion.div>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-1">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.a
                        key={item.name}
                        href={item.href}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + index * 0.05 }}
                        onClick={() => setIsOpen(false)}
                        className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                        <span>{item.name}</span>
                      </motion.a>
                    );
                  })}
                </div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 ml-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLocationPicker}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    title="Location"
                  >
                    <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTimeMachine}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    title="Time Machine"
                  >
                    <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleCommandPalette}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    title="Command Palette"
                  >
                    <Command className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSound}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    title="Toggle Sound"
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-white/40" />
                    )}
                  </motion.button>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
