"use client";

import { useEffect } from 'react';
import { HeroSection } from '@/components/zenith/hero';
import { ISSLiveCard } from '@/components/zenith/iss-tracker';
import { TimeMachine } from '@/components/zenith/time-machine';
import { CommandPalette } from '@/components/zenith/command-palette';
import { LocationPicker } from '@/components/zenith/location-picker';
import { InteractiveGlobe } from '@/components/zenith/globe';
import { AISpaceAssistant } from '@/components/zenith/ai-assistant';
import { CosmicMode } from '@/components/zenith/cosmic-mode';
import { StarfieldBackground, FloatingOrbs, FloatingParticles, Aurora, CursorGlow } from '@/components/effects/starfield';
import { CountUp, FadeInView } from '@/components/zenith/micro-interactions';
import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';
import { Satellite, Star, Telescope, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useZenithStore } from '@/store/zenith-store';
import { AuthModal } from '@/components/layout/auth-modal';
import { useAstronomyStats } from '@/hooks/use-astronomy-queries';
import { getMoonIllumination, getMoonTimes } from '@/utils/astronomy-calc';

const SectionSkeleton = () => <section className="relative px-4 py-32"><div className="skeleton mx-auto h-96 max-w-6xl rounded-3xl" /></section>;
const TimelineJourney = dynamic(() => import('@/components/zenith/timeline').then((module) => module.TimelineJourney), { loading: SectionSkeleton });
const PlanetExplorer = dynamic(() => import('@/components/zenith/planets').then((module) => module.PlanetExplorer), { loading: SectionSkeleton });
const ConstellationViewer = dynamic(() => import('@/components/zenith/constellations').then((module) => module.ConstellationViewer), { loading: SectionSkeleton });
const MeteorShowerCalendar = dynamic(() => import('@/components/zenith/meteors').then((module) => module.MeteorShowerCalendar), { loading: SectionSkeleton });
const APODSection = dynamic(() => import('@/components/zenith/apod').then((module) => module.APODSection), { loading: SectionSkeleton });
const SpaceNews = dynamic(() => import('@/components/zenith/apod').then((module) => module.SpaceNews), { loading: SectionSkeleton });

// Dynamically import SkyView and SkyObjectPanel
const SkyView = dynamic(() => import('@/components/zenith/sky-view').then((module) => module.SkyView), { loading: SectionSkeleton });
const SkyObjectPanel = dynamic(() => import('@/components/zenith/sky-view').then((module) => module.SkyObjectPanel), { ssr: false });
const BackgroundMusicManager = dynamic(() => import('@/components/audio/background-music'), { ssr: false });

export default function Home() {
  const { location, setLocation, currentDate, setDate } = useZenithStore();

  // 1. Initial State parsing from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const latParam = params.get('lat');
    const lngParam = params.get('lng');
    const dateParam = params.get('date');

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setLocation({ lat, lng, name: `Station (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)` });
      }
    }

    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate);
      }
    }
  }, [setLocation, setDate]);

  // 2. Synchronize store state back to URL parameters silently (using replaceState to avoid next.js router overhead)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('lat', location.lat.toFixed(5));
    url.searchParams.set('lng', location.lng.toFixed(5));
    url.searchParams.set('date', currentDate.toISOString());
    window.history.replaceState(null, '', url.toString());
  }, [location.lat, location.lng, currentDate]);

  return (
    <main className="relative min-h-screen">
      <BackgroundMusicManager />
      {/* Background layers */}
      <StarfieldBackground />
      <FloatingOrbs />
      <FloatingParticles />
      <Aurora />
      <CursorGlow />

      {/* Hero */}
      <HeroSection />

      {/* Globe - below hero */}
      <InteractiveGlobe />

      {/* Quick stats with count-up */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FadeInView>
                <ISSLiveCard />
              </FadeInView>
            </div>
            <div className="space-y-6">
              <FadeInView delay={0.1}>
                <QuickStatsCard />
              </FadeInView>
              <FadeInView delay={0.2}>
                <MoonPhaseCard />
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* Cosmic stats banner */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Satellite, label: 'Satellites Tracked', end: 9000, suffix: '+', color: 'cyan' },
              { icon: Star, label: 'Stars Catalogued', end: 117000, suffix: '', color: 'purple' },
              { icon: Telescope, label: 'Constellations', end: 88, suffix: '', color: 'yellow' },
              { icon: Zap, label: 'ISS Speed (km/s)', end: 7.66, suffix: '', decimals: 2, color: 'green' },
            ].map((stat, i) => (
              <FadeInView key={stat.label} delay={i * 0.1}>
                <div className="glass-card card-glow rounded-2xl p-6 text-center">
                  <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-500/20 mb-4`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <div className="text-3xl font-bold gradient-text mb-1">
                    <CountUp end={stat.end} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Journey */}
      <TimelineJourney />

      {/* Planets */}
      <PlanetExplorer />

      {/* Sky Map Section */}
      <SkyView />
      <SkyObjectPanel />

      {/* Constellations */}
      <ConstellationViewer />

      {/* Meteors */}
      <MeteorShowerCalendar />

      {/* APOD */}
      <APODSection />

      {/* Space News */}
      <SpaceNews />

      {/* Footer */}
      <footer className="relative py-24 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-2xl font-bold gradient-text mb-4">
                <Telescope className="w-7 h-7" />
                <span>Project Zenith</span>
              </div>
              <p className="text-white/50 max-w-md mb-6 leading-relaxed">
                Explore the cosmos like never before. Real-time tracking of the ISS, satellites, planets, and celestial events from your browser.
              </p>
              <div className="flex items-center gap-2 text-sm text-white/30">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                All systems operational
              </div>
            </div>
            <FooterColumn title="Explore" links={[
              { label: 'Live Globe', href: '#globe' }, { label: 'Planet Tracker', href: '#planets' },
              { label: 'Constellations', href: '#constellations' }, { label: 'ISS Tracker', href: '#iss' },
              { label: 'Timeline', href: '#timeline' },
            ]} />
            <FooterColumn title="Resources" links={[
              { label: 'NASA APOD', href: '#apod' }, { label: 'Space News', href: '#news' },
              { label: 'Meteor Calendar', href: '#meteors' }, { label: 'Cosmic Mode', href: '#' },
            ]} />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <div className="text-sm text-white/30 mb-4 md:mb-0">Made with passion for the cosmos. Data from NASA, ESA, CelesTrak.</div>
            <div className="text-sm text-white/30">Project Zenith {new Date().getFullYear()} &bull; The Celestial Eye</div>
          </div>
        </div>
      </footer>

      {/* Modals & overlays */}
      <TimeMachine />
      <CommandPalette />
      <LocationPicker />
      <AuthModal />

      {/* Floating UI */}
      <AISpaceAssistant />
      <CosmicMode />

      {/* Keyboard shortcuts hint */}
      <KeyboardShortcutsInfo />
    </main>
  );
}

function QuickStatsCard() {
  const { location, currentDate } = useZenithStore();
  const { data: stats, isLoading } = useAstronomyStats(location.lat, location.lng, currentDate.toISOString());

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-lg font-bold text-white mb-5">Quick Stats</h3>
      <div className="space-y-4">
        <StatRow 
          label="Visible Planets" 
          value={isLoading ? "..." : (stats?.visiblePlanets?.toString() ?? "N/A")} 
          color="purple" 
        />
        <StatRow 
          label="Visible Stars" 
          value={isLoading ? "..." : `~${stats?.visibleStars ?? "N/A"}`} 
          color="cyan" 
        />
        <StatRow 
          label="Satellites Overhead" 
          value={isLoading ? "..." : (stats?.satellitesOverhead?.toString() ?? "N/A")} 
          color="yellow" 
        />
        <StatRow 
          label="Next ISS Pass" 
          value={isLoading ? "..." : (stats?.nextIssPass ?? "N/A")} 
          color="green" 
        />
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    green: 'text-green-400 bg-green-500/20',
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/60">{label}</span>
      <span className={cn('px-3 py-1 rounded-full text-sm font-medium', colorClasses[color])}>{value}</span>
    </div>
  );
}

function getMoonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'New Moon';
  if (phase >= 0.03 && phase < 0.22) return 'Waxing Crescent';
  if (phase >= 0.22 && phase < 0.28) return 'First Quarter';
  if (phase >= 0.28 && phase < 0.47) return 'Waxing Gibbous';
  if (phase >= 0.47 && phase < 0.53) return 'Full Moon';
  if (phase >= 0.53 && phase < 0.72) return 'Waning Gibbous';
  if (phase >= 0.72 && phase < 0.78) return 'Third Quarter';
  return 'Waning Crescent';
}

function MoonPhaseCard() {
  const { location, currentDate } = useZenithStore();
  const moonIllum = getMoonIllumination(currentDate);
  const moonTimes = getMoonTimes(currentDate, location.lat, location.lng);
  
  const phaseName = getMoonPhaseName(moonIllum.phase);
  const illuminationPct = Math.round(moonIllum.fraction * 100);
  
  const formatTime = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const riseStr = formatTime(moonTimes.rise);
  const setStr = formatTime(moonTimes.set);

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-lg font-bold text-white mb-5">Moon Phase</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-100 to-gray-700 shadow-lg" />
          <div className="absolute inset-0 rounded-full overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-gray-300" />
          </div>
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 20px rgba(255,220,100,0.3)' }} />
        </div>
        <div>
          <div className="text-xl font-bold text-white">{phaseName}</div>
          <div className="text-sm text-white/40">{illuminationPct}% Illuminated</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-white/40 mb-1">Rise</div>
          <div className="text-white font-medium text-sm">{riseStr}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-white/40 mb-1">Set</div>
          <div className="text-white font-medium text-sm">{setStr}</div>
        </div>
      </div>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white mb-5 tracking-wide">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors hover:translate-x-1 inline-block transform duration-200">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeyboardShortcutsInfo() {
  return (
    <div className="fixed bottom-4 left-4 z-40 hidden lg:block" style={{ bottom: '5rem' }}>
      <div className="glass px-3 py-2 rounded-lg text-xs text-white/30">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1 text-white/50">Ctrl</kbd>+
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1 text-white/50">K</kbd> for Command Palette
      </div>
    </div>
  );
}
