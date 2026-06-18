"use client";

import { HeroSection } from '@/components/zenith/hero';
import { ISSLiveCard } from '@/components/zenith/iss-tracker';
import { TimeMachine } from '@/components/zenith/time-machine';
import { CommandPalette } from '@/components/zenith/command-palette';
import { LocationPicker } from '@/components/zenith/location-picker';
import { PlanetExplorer } from '@/components/zenith/planets';
import { ConstellationViewer } from '@/components/zenith/constellations';
import { MeteorShowerCalendar } from '@/components/zenith/meteors';
import { APODSection, SpaceNews } from '@/components/zenith/apod';
import { InteractiveGlobe } from '@/components/zenith/globe';
import { TimelineJourney } from '@/components/zenith/timeline';
import { AISpaceAssistant } from '@/components/zenith/ai-assistant';
import { CosmicMode } from '@/components/zenith/cosmic-mode';
import { StarfieldBackground, FloatingOrbs, FloatingParticles, Aurora, CursorGlow } from '@/components/effects/starfield';
import { CountUp, FadeInView } from '@/components/zenith/micro-interactions';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Satellite, Star, Telescope, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen">
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
            <div className="text-sm text-white/30">Project Zenith 2024 &bull; The Celestial Eye</div>
          </div>
        </div>
      </footer>

      {/* Modals & overlays */}
      <TimeMachine />
      <CommandPalette />
      <LocationPicker />

      {/* Floating UI */}
      <AISpaceAssistant />
      <CosmicMode />

      {/* Keyboard shortcuts hint */}
      <KeyboardShortcutsInfo />
    </main>
  );
}

function QuickStatsCard() {
  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-lg font-bold text-white mb-5">Quick Stats</h3>
      <div className="space-y-4">
        <StatRow label="Visible Planets" value="4" color="purple" />
        <StatRow label="Visible Stars" value="~2000" color="cyan" />
        <StatRow label="Satellites Overhead" value="12" color="yellow" />
        <StatRow label="Next ISS Pass" value="2h 15m" color="green" />
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

function MoonPhaseCard() {
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
          <div className="text-xl font-bold text-white">First Quarter</div>
          <div className="text-sm text-white/40">51% Illuminated</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-white/40 mb-1">Rise</div>
          <div className="text-white font-medium text-sm">12:32 PM</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-white/40 mb-1">Set</div>
          <div className="text-white font-medium text-sm">1:15 AM</div>
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
