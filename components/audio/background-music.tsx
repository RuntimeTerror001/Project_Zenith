"use client";

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useZenithStore } from '@/store/zenith-store';

export const TRACKS: Record<string, string> = {
  'Deep Space': 'https://assets.mixkit.co/music/preview/mixkit-deep-space-ambient-964.mp3',
  'Nebula Dreams': 'https://assets.mixkit.co/music/preview/mixkit-ambient-pulse-1100.mp3',
  'Ambient Synth': 'https://assets.mixkit.co/music/preview/mixkit-slow-trail-1217.mp3',
  'Cosmic Piano': 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-1082.mp3',
};

export default function BackgroundMusicManager() {
  const { music, soundEnabled } = useZenithStore();
  const activeHowlRef = useRef<Howl | null>(null);
  const currentTrackRef = useRef<string | null>(null);

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
        html5: true, // Ignore CORS, stream larger files
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

  return null;
}
