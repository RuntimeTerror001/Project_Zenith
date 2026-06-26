"use client";

import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';
import { useZenithStore } from '@/store/zenith-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';

export const TRACKS: Record<string, string> = {
  'Deep Space': '/audio/deep-space.mp3',
  'Nebula Dreams': '/audio/ambient.mp3',
};

const TRACK_NAMES = ['Deep Space', 'Nebula Dreams'];

const Equalizer = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-end gap-[3px] h-3 w-5">
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="w-[3px] bg-cyan-400 rounded-full"
        animate={isPlaying ? {
          height: [4, 12, 4],
        } : {
          height: 4,
        }}
        transition={{
          duration: 0.6 + i * 0.15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export default function BackgroundMusicManager() {
  const { music, soundEnabled, setMusic, toggleSound } = useZenithStore();
  const activeHowlRef = useRef<Howl | null>(null);
  const currentTrackRef = useRef<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const isPlaying = soundEnabled && music.enabled && !!music.track;

  const togglePlay = () => {
    if (!music.track) {
      setMusic({ track: 'Nebula Dreams', enabled: true });
    } else {
      setMusic({ enabled: !music.enabled });
    }
  };

  const nextTrack = () => {
    const currentIndex = TRACK_NAMES.indexOf(music.track || 'Nebula Dreams');
    const nextIndex = (currentIndex + 1) % TRACK_NAMES.length;
    setMusic({ track: TRACK_NAMES[nextIndex], enabled: true });
  };

  // Unblock autoplay policy on user interaction
  useEffect(() => {
    const unlock = () => {
      const ctx = Howler.ctx;
      
      const playCurrentMusic = () => {
        const howl = activeHowlRef.current;
        if (howl && soundEnabled && music.enabled) {
          if (!howl.playing()) {
            howl.play();
            howl.fade(howl.volume(), music.volume, 1000);
          }
        }
      };

      const removeListeners = () => {
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };

      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            console.log('AudioContext resumed successfully on user interaction.');
            playCurrentMusic();
            removeListeners();
          }).catch((err) => console.warn('Failed to resume AudioContext:', err));
        } else if (ctx.state === 'running') {
          playCurrentMusic();
          removeListeners();
        }
      } else {
        playCurrentMusic();
        removeListeners();
      }
    };

    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [soundEnabled, music.enabled, music.volume]);

  useEffect(() => {
    // Determine whether music should actively play
    // soundEnabled acts as a global master switch (mute/unmute)
    const shouldPlay = soundEnabled && music.enabled && music.track;

    if (!shouldPlay) {
      // Fade out and pause current playing audio
      const howl = activeHowlRef.current;
      if (howl && howl.playing()) {
        howl.fade(howl.volume(), 0, 1000);
        const timeout = setTimeout(() => {
          // Verify we haven't switched tracks or unmounted during fade
          if (activeHowlRef.current === howl) {
            howl.pause();
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
      return;
    }

    const trackUrl = TRACKS[music.track!];
    if (!trackUrl) return;

    // Track changed: Fade out the old track, load and play the new one
    if (currentTrackRef.current !== music.track) {
      const oldHowl = activeHowlRef.current;
      if (oldHowl) {
        oldHowl.fade(oldHowl.volume(), 0, 1000);
        const timeout = setTimeout(() => {
          oldHowl.unload();
        }, 1000);
      }

      const newHowl = new Howl({
        src: [trackUrl],
        html5: true, // Use HTML5 Audio streaming for instant track changes without XHR delay
        loop: true,
        volume: 0, // Start silent for fade-in
      });

      activeHowlRef.current = newHowl;
      currentTrackRef.current = music.track;

      newHowl.play();
      newHowl.fade(0, music.volume, 1500);
    } else {
      // Track is identical: resume play or change volume
      const howl = activeHowlRef.current;
      if (howl) {
        if (!howl.playing()) {
          howl.play();
          howl.fade(0, music.volume, 1500);
        } else {
          // Smooth volume slider transition
          howl.fade(howl.volume(), music.volume, 300);
        }
      }
    }
  }, [soundEnabled, music.enabled, music.track, music.volume]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (activeHowlRef.current) {
        activeHowlRef.current.unload();
      }
    };
  }, []);

  return (
    <div className="fixed z-40 bottom-28 left-4 sm:bottom-8 sm:left-8 lg:bottom-24 lg:left-8 flex flex-col items-start gap-3">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="glass relative overflow-hidden flex items-center shadow-2xl rounded-2xl border border-white/10"
        style={{
          background: 'rgba(10, 10, 35, 0.75)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* Collapsed State: Sleek rounded button showing play status */
            <motion.button
              key="collapsed"
              layoutId="player-body"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-3 p-3 text-white"
              title="Expand Music Player"
              aria-label="Expand Music Player"
            >
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center relative"
                style={{
                  background: isPlaying ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'rgba(255,255,255,0.05)',
                }}
              >
                <Music className="w-4 h-4 text-white" />
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl"
                    style={{ border: '2px solid rgba(124,58,237,0.5)' }}
                  />
                )}
              </div>
              <Equalizer isPlaying={isPlaying} />
            </motion.button>
          ) : (
            /* Expanded State: Full playback controls and details */
            <motion.div
              key="expanded"
              layoutId="player-body"
              className="flex items-center gap-4 px-4 py-3 text-white min-w-[280px]"
            >
              {/* Left track details */}
              <div 
                className="flex-grow min-w-0 cursor-pointer"
                onClick={() => setIsExpanded(false)}
                title="Collapse Music Player"
              >
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Now Playing</div>
                <div className="font-semibold text-xs text-white truncate max-w-[120px]">
                  {music.track || 'Ambient Music'}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current text-purple-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current text-cyan-400 ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextTrack}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Next Track"
                >
                  <SkipForward className="w-3.5 h-3.5 text-white/80" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title={soundEnabled ? "Mute" : "Unmute"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  )}
                </motion.button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 flex-shrink-0 border-l border-white/15 pl-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={music.volume}
                  onChange={(e) => setMusic({ volume: parseFloat(e.target.value) })}
                  className="w-12 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-0"
                  style={{
                    background: `linear-gradient(to right, rgb(34, 211, 238) ${music.volume * 100}%, rgba(255, 255, 255, 0.1) ${music.volume * 100}%)`
                  }}
                  title={`Volume: ${Math.round(music.volume * 100)}%`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
