"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Globe, Satellite, Star } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';

const heroStats = [
  { value: '9,000+', label: 'Active Satellites', icon: Satellite },
  { value: '117,000', label: 'Stars Mapped', icon: Star },
  { value: '88', label: 'Constellations', icon: Sparkles },
  { value: 'Real-time', label: 'ISS Tracking', icon: Globe },
];

const typedPhrases = [
  'ISS Tracking',
  'Planet Discovery',
  'Constellations',
  'Meteor Showers',
  'Space Events',
  'Time Travel',
  'Globe Visualization',
];

export function HeroSection() {
  const [typedText, setTypedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [shootingStar, setShootingStar] = useState<{ x: number; y: number; angle: number } | null>(null);

  const mainText = 'Discover What Lies Above You';

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.9]);
  const y = useTransform(scrollY, [0, 500], [0, 100]);

  // Mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const mxSpring = useSpring(mx, { stiffness: 50, damping: 20 });
  const mySpring = useSpring(my, { stiffness: 50, damping: 20 });

  const heroRef = useRef<HTMLElement>(null);

  // Mouse movement for parallax and cursor glow
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mx.set((e.clientX - cx) / rect.width);
      my.set((e.clientY - cy) / rect.height);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my]);

  const parallaxX = useTransform(mxSpring, [-0.5, 0.5], [-30, 30]);
  const parallaxY = useTransform(mySpring, [-0.5, 0.5], [-30, 30]);
  const parallaxX2 = useTransform(mxSpring, [-0.5, 0.5], [-50, 50]);
  const parallaxY2 = useTransform(mySpring, [-0.5, 0.5], [-50, 50]);
  const parallaxX3 = useTransform(mxSpring, [-0.5, 0.5], [-15, 15]);
  const parallaxY3 = useTransform(mySpring, [-0.5, 0.5], [-15, 15]);

  // Shooting stars - every 8-12 seconds
  useEffect(() => {
    const spawnShootingStar = () => {
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 30 + 5;
      const angle = (Math.PI / 6) + Math.random() * (Math.PI / 6);
      setShootingStar({ x, y, angle });

      setTimeout(() => setShootingStar(null), 1500);
    };

    const interval = setInterval(spawnShootingStar, 8000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect cycling through phrases
  useEffect(() => {
    const phrase = typedPhrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && typedText === phrase) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && typedText === '') {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % typedPhrases.length);
    } else {
      timeout = setTimeout(() => {
        setTypedText((prev) =>
          isDeleting ? phrase.slice(0, prev.length - 1) : phrase.slice(0, prev.length + 1)
        );
      }, isDeleting ? 50 : 110);
    }

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex]);

  // Cursor blink
  useEffect(() => {
    const timer = setInterval(() => setShowCursor((s) => !s), 530);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Navbar />

      {/* Floating nebula gradients */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ x: parallaxX, y: parallaxY }}
      >
        <div className="w-[600px] h-[600px] rounded-full opacity-30" style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
          marginLeft: '-300px',
          marginTop: '-300px',
        }} />
      </motion.div>

      <motion.div
        className="absolute pointer-events-none"
        style={{ x: parallaxX2, y: parallaxY2 }}
      >
        <div className="w-[500px] h-[500px] rounded-full opacity-25" style={{
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.35) 0%, transparent 70%)',
          filter: 'blur(60px)',
          marginLeft: '150px',
          marginTop: '50px',
        }} />
      </motion.div>

      <motion.div
        className="absolute pointer-events-none"
        style={{ x: parallaxX3, y: parallaxY3 }}
      >
        <div className="w-[400px] h-[400px] rounded-full opacity-20" style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
          filter: 'blur(50px)',
          marginRight: '-200px',
          marginTop: '100px',
        }} />
      </motion.div>

      {/* Shooting star animation */}
      <AnimatePresence>
        {shootingStar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none"
            style={{
              left: `${shootingStar.x}%`,
              top: `${shootingStar.y}%`,
            }}
          >
            <motion.div
              initial={{ x: 0, y: 0 }}
              animate={{
                x: Math.cos(shootingStar.angle) * 400,
                y: Math.sin(shootingStar.angle) * 400,
              }}
              transition={{ duration: 1.2, ease: 'linear' }}
              className="relative"
            >
              {/* Tail */}
              <div
                className="absolute w-[150px] h-[2px] origin-right"
                style={{
                  background: 'linear-gradient(to left, rgba(180, 240, 255, 0.9), rgba(0, 229, 255, 0.3), transparent)',
                  transform: `rotate(${shootingStar.angle}rad)`,
                  transformOrigin: 'right center',
                  right: 0,
                }}
              />
              {/* Head glow */}
              <motion.div
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(180, 240, 255, 0.8) 50%, transparent 100%)',
                  boxShadow: '0 0 10px rgba(180, 240, 255, 0.8), 0 0 20px rgba(0, 229, 255, 0.6)',
                }}
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ opacity, scale, y }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-sm text-white/80">Live Space Data</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
        >
          <span className="block gradient-text">{mainText}</span>
        </motion.h1>

        {/* Cycling typewriter phrases */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 h-12 flex items-center justify-center"
        >
          <span className="text-white/90">{typedText}</span>
          <span
            className="inline-block w-1 h-8 md:h-10 bg-cyan-400 ml-2"
            style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Explore the cosmos in real-time. Track the ISS, view satellites, discover planets, and journey through time to witness celestial events.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            className="btn-primary px-8 py-4 rounded-xl flex items-center gap-2 text-white group font-semibold relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Explore Sky</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </motion.button>

          <motion.button
            className="px-8 py-4 rounded-xl flex items-center gap-2 font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              color: '#00e5ff',
            }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 8px 32px rgba(0, 229, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" />
            <span>Watch Live</span>
          </motion.button>

          <motion.button
            className="px-8 py-4 rounded-xl flex items-center gap-2 font-semibold"
            style={{
              background: 'transparent',
              border: '1px solid rgba(124, 58, 237, 0.5)',
              color: '#a78bfa',
            }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)', background: 'rgba(124, 58, 237, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Sparkles className="w-5 h-5" />
            <span>Timeline Journey</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6"
        >
          {heroStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass-card rounded-2xl p-4 md:p-6 cursor-pointer group"
              style={{
                transition: 'all 0.3s ease',
              }}
            >
              <div className="flex items-center justify-center mb-2">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                </motion.div>
              </div>
              <div className="text-xl md:text-3xl font-bold gradient-text group-hover:scale-105 transition-transform">{stat.value}</div>
              <div className="text-xs md:text-sm text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/40">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
