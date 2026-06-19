"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationId: number;

    interface Star {
      x: number; y: number; size: number; opacity: number;
      speed: number; twinkleOffset: number; layer: number;
    }
    interface ShootingStar {
      x: number; y: number; length: number; speed: number;
      opacity: number; angle: number; trail: { x: number; y: number }[];
    }

    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let nebulaPhase = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const numStars = Math.floor((canvas.width * canvas.height) / 1500);
      stars = Array.from({ length: numStars }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() < 0.7 ? Math.random() * 1.2 + 0.3 : Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.6 + 0.2,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: Math.random() < 0.3 ? 2 : Math.random() < 0.6 ? 1 : 0,
      }));
    };

    const spawnShootingStar = () => {
      const angle = (Math.PI / 5) + Math.random() * (Math.PI / 4);
      shootingStars.push({
        x: Math.random() * canvas.width * 0.6 + canvas.width * 0.1,
        y: Math.random() * canvas.height * 0.25,
        length: Math.random() * 180 + 80,
        speed: Math.random() * 18 + 12,
        opacity: 1,
        angle,
        trail: [],
      });
    };

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space background with subtle gradient
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      bgGrad.addColorStop(0, '#030810');
      bgGrad.addColorStop(0.5, '#020617');
      bgGrad.addColorStop(1, '#010408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated nebula gradients - subtle and premium
      nebulaPhase += 0.00025;

      // Primary nebula - purple/blue
      const nb1 = ctx.createRadialGradient(
        canvas.width * (0.2 + 0.04 * Math.sin(nebulaPhase)),
        canvas.height * (0.3 + 0.03 * Math.cos(nebulaPhase * 0.7)),
        0,
        canvas.width * 0.3, canvas.height * 0.35, canvas.width * 0.6
      );
      nb1.addColorStop(0, 'rgba(124, 58, 237, 0.08)');
      nb1.addColorStop(0.4, 'rgba(88, 28, 135, 0.04)');
      nb1.addColorStop(1, 'transparent');
      ctx.fillStyle = nb1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Secondary nebula - cyan
      const nb2 = ctx.createRadialGradient(
        canvas.width * (0.78 + 0.03 * Math.cos(nebulaPhase * 0.9)),
        canvas.height * (0.65 + 0.04 * Math.sin(nebulaPhase * 1.1)),
        0,
        canvas.width * 0.75, canvas.height * 0.6, canvas.width * 0.45
      );
      nb2.addColorStop(0, 'rgba(0, 229, 255, 0.05)');
      nb2.addColorStop(0.5, 'rgba(0, 100, 180, 0.025)');
      nb2.addColorStop(1, 'transparent');
      ctx.fillStyle = nb2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tertiary nebula - faint magenta
      const nb3 = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * (0.12 + 0.02 * Math.sin(nebulaPhase * 1.5)),
        0,
        canvas.width * 0.5, canvas.height * 0.1, canvas.width * 0.4
      );
      nb3.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
      nb3.addColorStop(1, 'transparent');
      ctx.fillStyle = nb3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Soft light rays - very subtle
      ctx.save();
      ctx.globalAlpha = 0.015;
      ctx.translate(canvas.width / 2, -canvas.height / 4);
      ctx.rotate(nebulaPhase * 0.3);
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(124, 58, 237, 0.5)' : 'rgba(0, 229, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 3);
      }
      ctx.restore();

      // Twinkling stars - premium effect
      const t = Date.now() * 0.001;

      // Sort by layer for depth
      stars.sort((a, b) => a.layer - b.layer);

      stars.forEach((star) => {
        // More realistic twinkling
        const twinkleSpeed = star.speed * 1.5;
        const twinkle = prefersReducedMotion ? 0.75 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * twinkleSpeed + star.twinkleOffset));
        const a = star.opacity * twinkle;

        // Parallax based on layer
        const parallaxOffset = star.layer * 0.5;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        if (star.size > 1.2) {
          // Brighter stars get a soft glow
          const glowSize = star.size * 4;
          const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
          grd.addColorStop(0, `rgba(220, 240, 255, ${a})`);
          grd.addColorStop(0.2, `rgba(180, 220, 255, ${a * 0.5})`);
          grd.addColorStop(0.5, `rgba(150, 200, 255, ${a * 0.2})`);
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Star core
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.fill();
        } else {
          // Smaller stars - just dots with subtle glow
          const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
          grd.addColorStop(0, `rgba(200, 220, 255, ${a})`);
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.8})`;
          ctx.fill();
        }
      });

      // Spawn shooting stars more frequently - every 8-12 seconds
      if (!prefersReducedMotion && frameCount % 500 === 0 && shootingStars.length < 3) {
        spawnShootingStar();
      }

      // Render shooting stars with premium trails
      shootingStars = shootingStars.filter((ss) => {
        const vx = Math.cos(ss.angle) * ss.speed;
        const vy = Math.sin(ss.angle) * ss.speed;
        ss.x += vx;
        ss.y += vy;

        // Add to trail
        ss.trail.push({ x: ss.x, y: ss.y });
        if (ss.trail.length > 20) ss.trail.shift();

        ss.opacity -= 0.012;

        if (ss.opacity > 0 && ss.x < canvas.width + 200) {
          // Render trail
          ctx.beginPath();
          ctx.moveTo(ss.trail[0]?.x || ss.x, ss.trail[0]?.y || ss.y);
          ss.trail.forEach((point, i) => {
            if (i > 0) ctx.lineTo(point.x, point.y);
          });
          ctx.strokeStyle = `rgba(180, 240, 255, ${ss.opacity * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Main beam
          const grad = ctx.createLinearGradient(
            ss.x, ss.y,
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
          grad.addColorStop(0.1, `rgba(180, 240, 255, ${ss.opacity * 0.8})`);
          grad.addColorStop(0.3, `rgba(0, 229, 255, ${ss.opacity * 0.4})`);
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
          );
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Head glow
          const headGlow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 12);
          headGlow.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
          headGlow.addColorStop(0.3, `rgba(180, 240, 255, ${ss.opacity * 0.6})`);
          headGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 12, 0, Math.PI * 2);
          ctx.fill();

          // Sparkles
          for (let i = 0; i < 3; i++) {
            const sparkleX = ss.x - Math.cos(ss.angle) * (i * 5 + Math.random() * 5);
            const sparkleY = ss.y - Math.sin(ss.angle) * (i * 5 + Math.random() * 5);
            const sparkleAlpha = ss.opacity * (1 - i * 0.3) * Math.random();
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 1 + Math.random(), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 240, 255, ${sparkleAlpha})`;
            ctx.fill();
          }
        }

        return ss.opacity > 0 && ss.x < canvas.width + 200;
      });

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(animate);
      }
    };

    resize();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <motion.canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ y }} />;
}

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      className="cursor-glow"
      style={{
        left: pos.x,
        top: pos.y,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease, left 0.15s ease, top 0.15s ease',
      }}
    />
  );
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animId: number;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string; life: number; maxLife: number;
    }

    let particles: Particle[] = [];
    // Reduced particle count and smaller sizes for premium feel
    const colors = ['rgba(0,229,255,', 'rgba(124,58,237,', 'rgba(147,51,234,', 'rgba(6,182,212,'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = () => {
      // Limit particles to 40 for performance
      if (particles.length < 40) {
        const maxLife = 150 + Math.random() * 150;
        const size = Math.random() * 1.5 + 0.5; // Smaller particles
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.4 + 0.15),
          size,
          opacity: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.05) spawn();

      particles = particles.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        p.opacity = progress < 0.15 ? progress * 6.67 : progress > 0.85 ? (1 - progress) * 6.67 : 0.4;

        const a = Math.min(p.opacity, 1);
        // Smaller glow radius
        const glowRadius = p.size * 3;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grd.addColorStop(0, `${p.color}${a * 0.8})`);
        grd.addColorStop(0.4, `${p.color}${a * 0.3})`);
        grd.addColorStop(1, `${p.color}0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        return p.life < p.maxLife && p.y > -20;
      });

      animId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

export function FloatingOrbs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Reduced opacity for premium subtle effect */}
      <motion.div
        className="orb w-[600px] h-[600px]"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12), transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={shouldReduceMotion ? undefined : { x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb w-[450px] h-[450px]"
        style={{
          background: 'radial-gradient(circle, rgba(0, 229, 255, 0.08), transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={shouldReduceMotion ? undefined : { x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div
        className="orb w-[350px] h-[350px]"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={shouldReduceMotion ? undefined : { x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
      />
    </div>
  );
}

export function Aurora() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute w-full h-full"
        animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 40% at 25% 25%, rgba(124, 58, 237, 0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 35% at 75% 70%, rgba(0, 229, 255, 0.05) 0%, transparent 50%)',
          }}
        />
      </motion.div>
    </div>
  );
}
