import { useState, useEffect, useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { useZenithStore } from '@/stores/zenith';

export function useAudio() {
  const [isMuted, setIsMuted] = useState(true);
  const [ambientMusic, setAmbientMusic] = useState<Howl | null>(null);
  const { soundEnabled, toggleSound } = useZenithStore();

  useEffect(() => {
    // Initialize ambient music (would need actual audio file)
    // For now, just track volume state
    return () => {
      ambientMusic?.unload();
    };
  }, []);

  const playHover = useCallback(() => {
    if (!soundEnabled || isMuted) return;
    // Play hover sound
    new Howl({
      src: ['/audio/hover.mp3'],
      volume: 0.1,
      rate: 1 + Math.random() * 0.1
    }).play();
  }, [soundEnabled, isMuted]);

  const playClick = useCallback(() => {
    if (!soundEnabled || isMuted) return;
    new Howl({
      src: ['/audio/click.mp3'],
      volume: 0.15
    }).play();
  }, [soundEnabled, isMuted]);

  const playSuccess = useCallback(() => {
    if (!soundEnabled || isMuted) return;
    new Howl({
      src: ['/audio/success.mp3'],
      volume: 0.2
    }).play();
  }, [soundEnabled, isMuted]);

  return {
    isMuted,
    setIsMuted,
    playHover,
    playClick,
    playSuccess,
    toggleSound
  };
}

export function useIntersectionObserver(options: IntersectionObserverInit) {
  const [ref, setRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options.threshold, options.rootMargin]);

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
