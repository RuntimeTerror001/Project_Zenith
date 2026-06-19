"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { X, Rocket, Telescope, Moon, Globe, Star, Sun } from 'lucide-react';
import Image from 'next/image';

const timelineEvents = [
  {
    year: 1969,
    title: 'Apollo 11',
    subtitle: 'First Moon Landing',
    icon: Moon,
    color: '#f4d59e',
    description: 'On July 20, 1969, astronauts Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon, marking a monumental achievement in human history.',
    image: 'https://images-assets.nasa.gov/image/as11-40-5875/as11-40-5875~orig.jpg',
    facts: ['612 kg of Moon rocks collected', '3 crew: Armstrong, Aldrin, Collins', '8 days total mission duration'],
    celestial: 'Moon at closest approach (perigee) — 356,500 km',
    category: 'Historic',
  },
  {
    year: 1977,
    title: 'Voyager 1',
    subtitle: 'Interstellar Messenger',
    icon: Globe,
    color: '#a5c7f7',
    description: 'Launched to explore the outer Solar System, Voyager 1 became the first human-made object to enter interstellar space, carrying the Golden Record message to potential alien civilizations.',
    image: 'https://images-assets.nasa.gov/image/PIA17049/PIA17049~orig.jpg',
    facts: ['Carries the Golden Record message', 'First spacecraft in interstellar space', 'Furthest human-made object from Earth'],
    celestial: 'Heliosphere boundary crossed at 121 AU from the Sun',
    category: 'Historic',
  },
  {
    year: 1990,
    title: 'Hubble Telescope',
    subtitle: 'Eyes of Humanity',
    icon: Telescope,
    color: '#6b93d6',
    description: 'The Hubble Space Telescope launched into low Earth orbit and has since transformed our understanding of the universe, capturing deep-field images of billions of galaxies.',
    image: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001591/GSFC_20171208_Archive_e001591~orig.jpg',
    facts: ['1.3 million observations made', '600 km orbit altitude', '13.7 billion ly deepest view'],
    celestial: 'Orbiting at 547 km — crossing your sky every 97 minutes',
    category: 'Milestone',
  },
  {
    year: 2021,
    title: 'James Webb Telescope (JWST)',
    subtitle: 'Infrared Space Observatory',
    icon: Telescope,
    color: '#ffdd00',
    description: 'Launched to succeed Hubble, the James Webb Space Telescope uses infrared sensors to peer through cosmic dust to view the first stars and galaxies formed in the universe.',
    image: 'https://images-assets.nasa.gov/image/GSFC_20220712_JWST_001/GSFC_20220712_JWST_001~orig.jpg',
    facts: ['6.5m gold-coated primary mirror', 'Orbits at Sun-Earth Lagrange Point 2 (L2)', 'Infrared sensors view first stars & galaxies'],
    celestial: '1.5 million km from Earth — cooler than -223°C to detect faint heat',
    category: 'Milestone',
  },
  {
    year: 2023,
    title: 'Chandrayaan-3',
    subtitle: 'India on the Moon',
    icon: Rocket,
    color: '#ff9933',
    description: "India's Chandrayaan-3 successfully soft-landed near the Moon's south pole on August 23, 2023, making India the first nation to land in this resource-rich polar region.",
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Chandrayaan-3_Integrated_Module_in_clean-room_01.webp',
    facts: ['Moon south pole first landing', 'Vikram lander + Pragyan rover', '14 Earth days mission life'],
    celestial: 'Moon south pole — permanently shadowed craters hide ancient ice',
    category: 'Historic',
  },
  {
    year: 2028,
    title: 'Artemis & Beyond',
    subtitle: 'Multiplanetary Future',
    icon: Star,
    color: '#00e5ff',
    description: "NASA's Artemis program plans to establish a sustainable human presence on the Moon as a stepping stone for future crewed exploration of Mars.",
    image: 'https://images-assets.nasa.gov/image/NHQ202211160021/NHQ202211160021~orig.jpg',
    facts: ['Land first woman and person of color on Moon', 'Lunar Gateway space station foundation', 'Preparing for human exploration of Mars'],
    celestial: 'Establishing deep space gateway and Martian transit trajectory',
    category: 'Future',
  },
];

const categoryColors: Record<string, string> = {
  Historic: 'bg-purple-500/20 text-purple-300',
  Milestone: 'bg-blue-500/20 text-blue-300',
  Present: 'bg-cyan-500/20 text-cyan-300',
  Upcoming: 'bg-yellow-500/20 text-yellow-300',
  Future: 'bg-green-500/20 text-green-300',
};

export function TimelineJourney() {
  const [selectedEvent, setSelectedEvent] = useState<typeof timelineEvents[0] | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [lineProgress, setLineProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (v) => {
      setLineProgress(v);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  return (
    <section id="timeline" ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/60">Space History</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Journey Through <span className="gradient-text">Time</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            From Apollo to the future — explore humanity&apos;s greatest cosmic milestones.
          </p>
        </motion.div>
      </div>

      {/* Timeline track */}
      <div className="relative px-4 md:px-8" ref={trackRef}>
        {/* Animated central line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden lg:block">
          {/* Background line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent rounded-full" />
          {/* Animated progress line */}
          <motion.div
            className="absolute left-0 right-0 bg-gradient-to-b from-purple-500 via-cyan-400 to-transparent rounded-full"
            style={{ height: `${Math.min(100, Math.max(0, lineProgress * 150 - 25))}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          {/* Glowing head */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 229, 255, 1), rgba(124, 58, 237, 0.5))',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.6), 0 0 40px rgba(124, 58, 237, 0.3)',
              top: `${Math.min(100, Math.max(0, lineProgress * 150 - 25))}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto space-y-12 lg:space-y-0">
          {timelineEvents.map((event, index) => {
            const isLeft = index % 2 === 0;
            const Icon = event.icon;

            return (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: isLeft ? -80 : 80, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  delay: 0.15,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className={`relative flex lg:items-center lg:gap-8 mb-8 lg:mb-0 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Card */}
                <div className={`flex-1 ${isLeft ? 'lg:text-right' : 'lg:text-left'}`}>
                  <motion.div
                    whileHover={{
                      scale: 1.03,
                      y: -6,
                      boxShadow: `0 20px 60px ${event.color}20`,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedEvent(event)}
                    className="glass-card rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
                    style={{ borderColor: `${event.color}15` }}
                  >
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                      style={{
                        background: `radial-gradient(ellipse at ${isLeft ? 'right' : 'left'} center, ${event.color}15, transparent 60%)`,
                      }}
                    />

                    <div className={`flex items-start gap-4 relative z-10 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative overflow-hidden rounded-xl flex-shrink-0"
                        style={{ width: 88, height: 88 }}
                      >
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          sizes="88px"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${event.color}50, transparent)` }} />
                        {/* Shimmer overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      </motion.div>
                      <div className={`flex-1 ${isLeft ? 'lg:text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isLeft ? 'lg:justify-end' : ''}`}>
                          <motion.span
                            className="text-3xl font-bold"
                            style={{ color: event.color }}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                          >
                            {event.year}
                          </motion.span>
                          <span className={`text-xs px-2.5 py-1 rounded-full ${categoryColors[event.category]}`}>
                            {event.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-0.5">{event.title}</h3>
                        <p className="text-sm text-white/50 mb-2">{event.subtitle}</p>
                        <p className="text-sm text-white/40 line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                    <div className={`mt-4 text-xs text-cyan-400/70 flex items-center gap-1.5 ${isLeft ? 'lg:justify-end' : ''} relative z-10`}>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Star className="w-3 h-3" fill="currentColor" />
                      </motion.div>
                      <span>{event.celestial}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Center dot with animated glow */}
                <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 w-16">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.2 }}
                    className="relative"
                  >
                    {/* Outer glow */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${event.color}40, transparent 70%)`,
                        transform: 'scale(2)',
                      }}
                      animate={{ scale: [2, 2.3, 2], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    {/* Icon container */}
                    <div
                      className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10"
                      style={{
                        backgroundColor: `${event.color}20`,
                        border: `2px solid ${event.color}60`,
                        boxShadow: `0 0 25px ${event.color}50`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: event.color }} />
                    </div>
                  </motion.div>
                </div>

                <div className="flex-1 hidden lg:block" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-3xl overflow-hidden max-w-xl w-full"
            >
              {/* Image header with parallax-like effect */}
              <motion.div
                className="relative h-56 overflow-hidden"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Image
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 576px"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                {/* Animated shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <div className="absolute bottom-5 left-6 right-6">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span
                      className="text-4xl font-black"
                      style={{ color: selectedEvent.color }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {selectedEvent.year}
                    </motion.span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${categoryColors[selectedEvent.category]}`}>
                      {selectedEvent.category}
                    </span>
                  </div>
                  <motion.h3
                    className="text-2xl font-bold text-white"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {selectedEvent.title}
                  </motion.h3>
                  <motion.p
                    className="text-white/60"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {selectedEvent.subtitle}
                  </motion.p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white/80" />
                </motion.button>
              </motion.div>

              <div className="p-6 space-y-4">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-white/75 leading-relaxed"
                >
                  {selectedEvent.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-2xl"
                  style={{ background: `${selectedEvent.color}10`, border: `1px solid ${selectedEvent.color}25` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4" fill={selectedEvent.color} style={{ color: selectedEvent.color }} />
                    </motion.div>
                    <span className="text-sm font-medium" style={{ color: selectedEvent.color }}>Celestial Conditions</span>
                  </div>
                  <p className="text-white/60 text-sm">{selectedEvent.celestial}</p>
                </motion.div>

                <div>
                  <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Key Facts</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedEvent.facts.map((fact, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.08 }}
                        className="flex items-center gap-2.5 text-sm text-white/75"
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: selectedEvent.color }}
                          whileHover={{ scale: 1.5 }}
                        />
                        {fact}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
