"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { mockAPOD } from '@/data/astronomy';
import { Calendar, User, ExternalLink, ZoomIn, Globe, Rocket, Telescope, Eye } from 'lucide-react';
import { useRef, useState } from 'react';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1200';

export function APODSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.15, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section ref={containerRef} id="apod" className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-25 pointer-events-none" />

      <motion.div style={{ opacity }} className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass mb-4"
          >
            <span className="text-lg font-bold text-white">NASA</span>
            <div className="w-px h-5 bg-white/20" />
            <span className="text-sm text-white/60">Astronomy Picture of the Day</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {mockAPOD.title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-6 text-sm text-white/40"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              {mockAPOD.date}
            </span>
            {mockAPOD.copyright && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                {mockAPOD.copyright}
              </span>
            )}
          </motion.div>
        </div>

        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative rounded-3xl overflow-hidden cursor-zoom-in group"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Parallax image container */}
          <div className="relative aspect-video overflow-hidden rounded-3xl">
            <motion.img
              src={imgError ? FALLBACK_IMAGE : mockAPOD.url}
              alt={mockAPOD.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              style={{ scale: imgScale, y: parallaxY }}
              loading="lazy"
            />

            {/* Glass gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: isHovered ? '100%' : '-100%' }}
              transition={{ duration: 0.8, ease: 'linear' }}
            />

            {/* Hover zoom icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="p-6 rounded-full glass-strong"
                whileHover={{ scale: 1.1 }}
              >
                <ZoomIn className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Corner glow effect on hover */}
            <motion.div
              className="absolute -top-20 -left-20 w-40 h-40 rounded-full"
              animate={{
                opacity: isHovered ? 0.4 : 0,
                scale: isHovered ? 1.5 : 1,
              }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.5), transparent)',
                filter: 'blur(20px)',
              }}
            />

            {/* Bottom info overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div className="max-w-2xl">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 0 : 1, y: isHovered ? 10 : 0 }}
                    className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-3"
                  >
                    {mockAPOD.explanation}
                  </motion.p>
                </div>
                <motion.a
                  href={mockAPOD.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl glass group-hover:shadow-lg group"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-sm font-medium">View HD</span>
                  <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Explanation below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 max-w-3xl mx-auto text-center"
        >
          <p className="text-lg text-white/60 leading-relaxed">{mockAPOD.explanation}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

const newsArticles = [
  {
    title: "NASA's Artemis Program Advances Human Moon Exploration",
    source: 'NASA',
    date: '2024-06-15',
    category: 'Exploration',
    color: '#00e5ff',
    image: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?auto=compress&cs=tinysrgb&w=600',
    excerpt: 'Artemis III will land the first woman and next man on the Moon near the lunar south pole.',
  },
  {
    title: 'SpaceX Starlink Reaches 5000 Satellites Milestone',
    source: 'SpaceNews',
    date: '2024-06-14',
    category: 'Satellites',
    color: '#7c3aed',
    image: 'https://images.pexels.com/photos/586687/pexels-photo-586687.jpeg?auto=compress&cs=tinysrgb&w=600',
    excerpt: 'The mega-constellation continues to expand global internet coverage across underserved regions.',
  },
  {
    title: 'James Webb Telescope Captures New Pillars of Creation Image',
    source: 'ESA',
    date: '2024-06-13',
    category: 'Observation',
    color: '#f59e0b',
    image: 'https://images.pexels.com/photos/816608/pexels-photo-816608.jpeg?auto=compress&cs=tinysrgb&w=600',
    excerpt: "Webb's infrared vision reveals never-before-seen protostars embedded in the stellar nursery.",
  },
  {
    title: 'Martian Dust Devils Captured by Perseverance Rover',
    source: 'JPL',
    date: '2024-06-12',
    category: 'Mars',
    color: '#ef4444',
    image: 'https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=600',
    excerpt: 'Towering dust vortices reaching over 100 meters tall spotted in Jezero Crater.',
  },
  {
    title: 'New Exoplanet Found in Habitable Zone of Nearby Star',
    source: 'Nature',
    date: '2024-06-11',
    category: 'Exoplanets',
    color: '#10b981',
    image: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=600',
    excerpt: 'Kepler-452b analogue discovered just 40 light-years away with conditions similar to early Earth.',
  },
  {
    title: 'Solar Flare Triggers Spectacular Aurora Display',
    source: 'NOAA',
    date: '2024-06-10',
    category: 'Solar',
    color: '#a855f7',
    image: 'https://images.pexels.com/photos/1819650/pexels-photo-1819650.jpeg?auto=compress&cs=tinysrgb&w=600',
    excerpt: 'X2.3 class solar flare produces visible auroras as far south as Texas and Spain.',
  },
];

const categoryIcons: Record<string, typeof Globe> = {
  Exploration: Rocket,
  Satellites: Globe,
  Observation: Telescope,
  Mars: Rocket,
  Exoplanets: Globe,
  Solar: Globe,
};

export function SpaceNews() {
  return (
    <section id="news" className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
          >
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/60">Latest Updates</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Space <span className="gradient-text">News</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {newsArticles.map((item, index) => {
            const Icon = categoryIcons[item.category] || Globe;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  boxShadow: `0 25px 60px ${item.color}25`,
                }}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer relative"
              >
                {/* Hover border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}15, transparent 50%, ${item.color}10)`,
                  }}
                />

                {/* Thumbnail with parallax effect */}
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Color tint overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${item.color}20, transparent)` }}
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <motion.span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                      style={{
                        background: `${item.color}30`,
                        color: item.color,
                        border: `1px solid ${item.color}50`,
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.category}
                    </motion.span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 rounded-full text-xs glass font-medium text-white/70">
                      {item.source}
                    </span>
                  </div>

                  {/* Eye icon on hover */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <motion.div
                      className="p-3 rounded-full glass-strong"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Eye className="w-5 h-5 text-white/80" />
                    </motion.div>
                  </motion.div>
                </div>

                <div className="p-5 relative z-10">
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2 leading-relaxed">{item.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <motion.span
                      className="group-hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium"
                      whileHover={{ x: 3 }}
                    >
                      Read more
                      <ExternalLink className="w-3.5 h-3.5" />
                    </motion.span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
