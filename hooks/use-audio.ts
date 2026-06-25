import { useState, useEffect, useCallback, useRef } from 'react';
import { useZenithStore } from '@/store/zenith-store';

let hoverHowl: any = null;
let clickHowl: any = null;

const playHoverSoundFile = () => {
  if (typeof window === 'undefined') return;
  try {
    if (!hoverHowl) {
      const { Howl } = require('howler');
      hoverHowl = new Howl({
        src: ['/audio/hover.mp3'],
        volume: 0.25,
        onloaderror: () => {
          playTone([600], 'sine', 0.05, 0.012);
        },
        onplayerror: () => {
          playTone([600], 'sine', 0.05, 0.012);
        }
      });
    }
    hoverHowl.play();
  } catch {
    playTone([600], 'sine', 0.05, 0.012);
  }
};

const playClickSoundFile = () => {
  if (typeof window === 'undefined') return;
  try {
    if (!clickHowl) {
      const { Howl } = require('howler');
      clickHowl = new Howl({
        src: ['/audio/click.mp3'],
        volume: 0.35,
        onloaderror: () => {
          playTone([1000], 'sine', 0.04, 0.04);
        },
        onplayerror: () => {
          playTone([1000], 'sine', 0.04, 0.04);
        }
      });
    }
    clickHowl.play();
  } catch {
    playTone([1000], 'sine', 0.04, 0.04);
  }
};

export function useAudio() {
  const { soundEnabled, toggleSound } = useZenithStore();
  const isMuted = !soundEnabled;
  const setIsMuted = useCallback((muted: boolean) => {
    if (muted === soundEnabled) {
      toggleSound();
    }
  }, [soundEnabled, toggleSound]);

  const playHover = useCallback(() => {
    if (!soundEnabled) return;
    playHoverSoundFile();
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    playClickSoundFile();
  }, [soundEnabled]);

  const playSuccess = useCallback(() => {
    if (!soundEnabled) return;
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 987.77];
      notes.forEach((freq, idx) => {
        const time = ctx.currentTime + idx * 0.06;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.04, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.5);
      });
      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 1000);
    } catch {
      // Fail silently
    }
  }, [soundEnabled]);

  return {
    isMuted,
    setIsMuted,
    playHover,
    playClick,
    playSuccess,
    toggleSound
  };
}

export function useIntersectionObserver({ threshold, rootMargin, root }: IntersectionObserverInit = {}) {
  const [ref, setRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold, rootMargin, root }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, root]);

  return { ref: useCallback((el: Element | null) => setRef(el), [setRef]), isIntersecting };
}

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useScrollLock() {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
}

export function useTocHighlight({
  siteUrl,
  tocSelector,
  contentSelector,
  scrollRef
}: {
  siteUrl?: string;
  tocSelector: string;
  contentSelector: string;
  scrollRef?: React.RefObject<HTMLElement | null>;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const tocElements = document.querySelectorAll(tocSelector);
    const contentElements = document.querySelectorAll(contentSelector);
    const ids: string[] = [];

    contentElements.forEach((el) => {
      const heading = el.querySelector('[id]');
      if (heading?.id) ids.push(heading.id);
    });

    const handleScroll = () => {
      let current = ids[0];
      let minDistance = Infinity;

      ids.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100);

        if (distance < minDistance) {
          minDistance = distance;
          current = id;
        }
      });

      setActiveId(current || null);
    };

    const scrollEl = scrollRef?.current || window;
    scrollEl.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [tocSelector, contentSelector, scrollRef, siteUrl]);

  return activeId;
}

export function useIsFirstRender() {
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return isFirstRender.current;
}

export const playTone = (freqs: number[], type: OscillatorType, duration: number, volume: number) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const dest = ctx.destination;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    gainNode.connect(dest);
    
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      if (type === 'sine' && freqs.length === 1) {
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + duration);
      }
      
      osc.connect(gainNode);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    });
    
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, duration * 1000 + 100);
  } catch (error) {
    // Fail silently
  }
};

export function GlobalAudioFeedback() {
  const { soundEnabled } = useZenithStore();

  useEffect(() => {
    if (!soundEnabled || typeof window === 'undefined') return;

    let lastHoveredElement: HTMLElement | null = null;

    const playHoverSound = () => {
      playHoverSoundFile();
    };

    const playClickSound = () => {
      playClickSoundFile();
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('button, a, [role="button"], input[type="range"], [data-interactive]');
      if (target && target !== lastHoveredElement) {
        lastHoveredElement = target as HTMLElement;
        playHoverSound();
      } else if (!target) {
        lastHoveredElement = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('button, a, [role="button"], input[type="range"], [data-interactive]');
      if (target) {
        playClickSound();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('click', handleClick);
    };
  }, [soundEnabled]);

  return null;
}
