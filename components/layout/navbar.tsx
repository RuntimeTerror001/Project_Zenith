"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Telescope, MapPin, Clock, Menu, X, Command, Globe, Sparkles, Rocket, Star, Volume2, VolumeX, Home, Play, Pause, Music, User } from 'lucide-react';
import { useZenithStore, useUIStore } from '@/store/zenith-store';
import { cn } from '@/utils/utils';

const navItems = [
  { name: 'Home', href: '#home', icon: Home },
  { name: 'Globe', href: '#globe', icon: Globe },
  { name: 'Timeline', href: '#timeline', icon: Clock },
  { name: 'Planets', href: '#planets', icon: Sparkles },
  { name: 'Stars', href: '#constellations', icon: Star },
  { name: 'Events', href: '#events', icon: Rocket },
];

export function Navbar() {
  const {
    soundEnabled,
    toggleSound,
    music,
    setMusic,
    navbarIsOpen: isOpen,
    navbarIsVisible: isVisible,
    activeSection,
    setNavbarOpen: setIsOpen,
    setNavbarVisible: setIsVisible,
    setActiveSection,
    user,
    notifications
  } = useZenithStore();

  const { toggleCommandPalette, toggleLocationPicker, toggleTimeMachine, toggleAuth } = useUIStore();
  const navRef = useRef<HTMLDivElement>(null);
  const [isSoundPopoverOpen, setIsSoundPopoverOpen] = useState(false);
  const [showMobileMusic, setShowMobileMusic] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (scrollDelta > 15 && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      } else if (scrollDelta < -10) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsOpen, setIsVisible]);

  useEffect(() => {
    const sections = navItems
      .map(({ href }) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: '-30% 0px -55%', threshold: [0.1, 0.25, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [setActiveSection]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setIsOpen]);

  return (
    <>
      <motion.div
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -150 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        aria-label="Primary navigation"
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="pill"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-purple-500/30 to-cyan-500/30" />

              <motion.button
                onClick={() => setIsOpen(true)}
                aria-expanded={isOpen}
                aria-controls="zenith-navigation"
                aria-label="Open navigation"
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
            <motion.div
              key="expanded"
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden md:block"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -inset-4 rounded-3xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
                }}
              />

              <motion.div
                id="zenith-navigation"
                className="relative px-6 py-4 rounded-2xl max-w-[calc(100vw-2rem)]"
                style={{
                  background: 'rgba(10, 10, 35, 0.95)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center gap-6">
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

                  <div className="flex items-center gap-1">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.href.slice(1);
                      return (
                        <motion.a
                          key={item.name}
                          href={item.href}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + index * 0.05 }}
                          onClick={() => setIsOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors group",
                            isActive ? "text-white" : "text-white/70 hover:text-white"
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNavBackground"
                              className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <Icon className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                          <span>{item.name}</span>
                        </motion.a>
                      );
                    })}
                  </div>

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
                      aria-label="Choose location"
                    >
                      <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleTimeMachine}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      title="Time Machine"
                      aria-label="Open time machine"
                    >
                      <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleCommandPalette}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      title="Command Palette"
                      aria-label="Open command palette"
                    >
                      <Command className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleAuth}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group relative"
                      title="User Profile"
                      aria-label="Open profile modal"
                    >
                      <User className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                      {user && notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse border border-[#0a0a23]" />
                      )}
                    </motion.button>

                    <div
                      className="relative"
                      onMouseEnter={() => setIsSoundPopoverOpen(true)}
                      onMouseLeave={() => setIsSoundPopoverOpen(false)}
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleSound}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                        title="Toggle Sound & Music"
                        aria-label={soundEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
                      >
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-white/40" />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {isSoundPopoverOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-3 w-80 p-4 rounded-2xl z-50 text-left"
                            style={{
                              background: 'rgba(10, 10, 35, 0.96)',
                              backdropFilter: 'blur(40px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.15)',
                            }}
                          >
                            <SoundControls />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(false)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      title="Close"
                      aria-label="Close navigation"
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          >
            <motion.div
              key="mobile-drawer-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] p-6 flex flex-col justify-between"
              style={{
                background: 'rgba(10, 10, 35, 0.98)',
                backdropFilter: 'blur(40px)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6), inset 1px 0 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
                  <div className="flex items-center gap-2">
                    <Telescope className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white text-lg">Zenith</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2 mb-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.href.slice(1);
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors group",
                          isActive ? "text-white" : "text-white/70 hover:text-white"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeMobileNavBackground"
                            className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "text-white/60 group-hover:text-cyan-400")} />
                        <span>{item.name}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-white/10 pt-6 relative">
                <AnimatePresence>
                  {showMobileMusic && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full left-0 right-0 mb-4 p-4 rounded-2xl z-50 text-left"
                      style={{
                        background: 'rgba(10, 10, 35, 0.98)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 -20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 58, 237, 0.15)',
                      }}
                    >
                      <SoundControls onClose={() => setShowMobileMusic(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-5 gap-1.5">
                   <button
                     onClick={() => {
                       setIsOpen(false);
                       toggleLocationPicker();
                     }}
                     className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-1 text-[9px] text-white/60"
                   >
                     <MapPin className="w-4 h-4 text-cyan-400" />
                     <span>Location</span>
                   </button>

                   <button
                     onClick={() => {
                       setIsOpen(false);
                       toggleTimeMachine();
                     }}
                     className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-1 text-[9px] text-white/60"
                   >
                     <Clock className="w-4 h-4 text-purple-400" />
                     <span>Time</span>
                   </button>

                   <button
                     onClick={() => {
                       setIsOpen(false);
                       toggleCommandPalette();
                     }}
                     className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-1 text-[9px] text-white/60"
                   >
                     <Command className="w-4 h-4 text-white/60" />
                     <span>Search</span>
                   </button>

                   <button
                     onClick={() => {
                       setIsOpen(false);
                       toggleAuth();
                     }}
                     className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-1 text-[9px] text-white/60 relative"
                   >
                     <User className="w-4 h-4 text-purple-400" />
                     <span>Profile</span>
                     {user && notifications.filter(n => !n.isRead).length > 0 && (
                       <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                     )}
                   </button>

                   <button
                     onClick={() => setShowMobileMusic(!showMobileMusic)}
                     className={cn(
                       "flex flex-col items-center justify-center p-2 rounded-xl transition-colors gap-1 text-[9px]",
                       showMobileMusic || soundEnabled ? "bg-white/10 text-white font-medium" : "bg-white/5 text-white/60"
                     )}
                   >
                     {soundEnabled ? (
                       <Volume2 className="w-4 h-4 text-cyan-400" />
                     ) : (
                       <VolumeX className="w-4 h-4 text-white/40" />
                     )}
                     <span>Sound</span>
                   </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SoundControls({ onClose }: { onClose?: () => void }) {
  const { music, soundEnabled, setMusic, toggleSound } = useZenithStore();

  const isPlaying = soundEnabled && music.enabled && !!music.track;

  const handlePlayPause = () => {
    if (!music.track) {
      setMusic({ track: 'Deep Space', enabled: true });
    } else {
      setMusic({ enabled: !music.enabled });
    }
  };

  const handleTrackSelect = (trackName: string) => {
    setMusic({ track: trackName, enabled: true });
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Music className={cn("w-4 h-4 text-cyan-400", isPlaying && "animate-pulse")} />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Ambient Music</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[10px] text-white/50 hover:text-white/80 px-2 py-0.5 rounded bg-white/5"
          >
            Close
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {['Deep Space', 'Nebula Dreams'].map((trackName) => {
          const isActive = music.track === trackName;
          return (
            <button
              key={trackName}
              onClick={() => handleTrackSelect(trackName)}
              className={cn(
                "relative p-2.5 rounded-xl text-left text-xs transition-all duration-300 border overflow-hidden group",
                isActive 
                  ? "bg-cyan-500/10 border-cyan-500/50 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]" 
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse" />
              )}
              <div className="font-medium relative z-10">{trackName}</div>
              <div className="text-[9px] text-white/40 mt-0.5 relative z-10 truncate">
                {isActive && isPlaying ? "Active" : "Select"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-300",
              isPlaying 
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]" 
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Theme</span>
              </>
            )}
          </button>

          <button
            onClick={toggleSound}
            className={cn(
              "p-2 rounded-xl border transition-all duration-300",
              soundEnabled
                ? "bg-white/10 border-white/20 text-cyan-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-white/50">
            <span>Volume</span>
            <span>{Math.round(music.volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <VolumeX className="w-3.5 h-3.5 text-white/30" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={music.volume}
              onChange={(e) => setMusic({ volume: parseFloat(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-0"
              style={{
                background: `linear-gradient(to right, rgb(34, 211, 238) ${music.volume * 100}%, rgba(255, 255, 255, 0.1) ${music.volume * 100}%)`
              }}
            />
            <Volume2 className="w-3.5 h-3.5 text-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
