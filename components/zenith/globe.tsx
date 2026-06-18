"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Satellite, Globe, Zap, Users, X, Navigation } from 'lucide-react';

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  type: 'city' | 'iss' | 'satellite';
  color: string;
}

const CITIES: GlobePoint[] = [
  { lat: 40.71, lng: -74.0, label: 'New York', type: 'city', color: '#00e5ff' },
  { lat: 51.5, lng: -0.12, label: 'London', type: 'city', color: '#00e5ff' },
  { lat: 48.86, lng: 2.35, label: 'Paris', type: 'city', color: '#00e5ff' },
  { lat: 35.69, lng: 139.69, label: 'Tokyo', type: 'city', color: '#00e5ff' },
  { lat: 28.6, lng: 77.2, label: 'Delhi', type: 'city', color: '#00e5ff' },
  { lat: -23.55, lng: -46.63, label: 'São Paulo', type: 'city', color: '#00e5ff' },
  { lat: 31.23, lng: 121.47, label: 'Shanghai', type: 'city', color: '#00e5ff' },
  { lat: 37.77, lng: -122.42, label: 'San Francisco', type: 'city', color: '#00e5ff' },
  { lat: 55.75, lng: 37.62, label: 'Moscow', type: 'city', color: '#00e5ff' },
  { lat: -33.87, lng: 151.21, label: 'Sydney', type: 'city', color: '#00e5ff' },
];

function latLngToXY(lat: number, lng: number, rotX: number, rotY: number, radius: number, cx: number, cy: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180) + rotY;
  const x3 = Math.sin(phi) * Math.cos(theta);
  const y3raw = Math.cos(phi);
  const z3 = Math.sin(phi) * Math.sin(theta);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y3 = y3raw * cosX - z3 * sinX;
  const z3f = y3raw * sinX + z3 * cosX;
  return {
    x: cx + x3 * radius,
    y: cy - y3 * radius,
    z: z3f,
    visible: z3f > -0.1,
  };
}

export function InteractiveGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotY = useRef(0);
  const rotX = useRef(0.4);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const zoom = useRef(1);
  const animId = useRef(0);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [issLabel, setIssLabel] = useState(false);
  const [stats, setStats] = useState({ lat: 0, lng: 0, alt: 408, speed: 7.66 });
  const [flyToISS, setFlyToISS] = useState(false);
  const flyProgress = useRef(0);

  const issOrbit = useRef(0);
  const issOrbitInc = useRef(51.6 * Math.PI / 180);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const getGlobeParams = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.36;
      const radius = baseRadius * zoom.current;
      return { cx, cy, radius };
    };

    // Draw latitude/longitude grid
    const drawGrid = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.lineWidth = 0.5;

      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lng = -180; lng <= 180; lng += 2) {
          const p = latLngToXY(lat, lng, rotX.current, rotY.current, radius, cx, cy);
          if (!p.visible) { first = true; continue; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          first = false;
        }
        ctx.stroke();
      }

      for (let lng = -180; lng <= 180; lng += 20) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = latLngToXY(lat, lng, rotX.current, rotY.current, radius, cx, cy);
          if (!p.visible) { first = true; continue; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          first = false;
        }
        ctx.stroke();
      }
    };

    // Draw continent outlines (simplified geometric approximation)
    const drawContinents = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
      const continentColor = 'rgba(32, 180, 100, 0.4)';
      ctx.fillStyle = continentColor;
      ctx.strokeStyle = 'rgba(60, 220, 120, 0.5)';
      ctx.lineWidth = 0.6;

      const continents: Array<[number, number][]> = [
        [[15,-117],[22,-110],[25,-97],[29,-95],[30,-89],[32,-80],[35,-75],[42,-70],[47,-53],[60,-64],[70,-90],[72,-100],[70,-130],[55,-130],[50,-125],[44,-124],[37,-122],[32,-117],[20,-110],[15,-92],[15,-117]],
        [[-5,-80],[-5,-35],[-12,-37],[-23,-43],[-32,-52],[-34,-58],[-40,-62],[-50,-68],[-55,-68],[-55,-66],[-45,-66],[-35,-58],[-28,-50],[-22,-41],[-5,-35],[-2,-50],[-5,-80]],
        [[35,0],[42,-9],[44,0],[50,-5],[52,2],[58,5],[58,30],[55,40],[47,40],[40,30],[35,26],[35,0]],
        [[35,-5],[35,36],[10,42],[0,42],[-10,40],[-25,32],[-34,26],[-34,18],[-16,12],[-5,10],[0,8],[5,8],[10,14],[15,40],[20,38],[30,32],[35,28],[35,-5]],
        [[10,100],[20,120],[35,140],[40,130],[50,140],[60,150],[65,140],[65,100],[45,60],[30,48],[20,45],[10,44],[10,100]],
        [[55,30],[55,40],[60,60],[55,80],[60,100],[60,130],[70,140],[72,120],[72,80],[70,60],[70,30],[65,20],[55,30]],
        [[-16,136],[-12,132],[-12,136],[-15,142],[-18,148],[-24,154],[-34,150],[-38,146],[-38,140],[-32,134],[-20,116],[-16,124],[-16,136]],
      ];

      continents.forEach((pts) => {
        ctx.beginPath();
        let first = true;
        pts.forEach(([lat, lng]) => {
          const p = latLngToXY(lat, lng, rotX.current, rotY.current, radius, cx, cy);
          if (!p.visible) { first = true; return; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          first = false;
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    };

    const drawISS = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, t: number) => {
      const issAngle = (issOrbit.current + t * 0.0005) % (Math.PI * 2);
      const inc = issOrbitInc.current;
      const orbitR = radius * 1.14;

      // ISS orbit trail - full orbit line
      ctx.beginPath();
      let first = true;
      let issX = 0, issY = 0, issZ = 0, issVis = false;
      for (let a = 0; a <= Math.PI * 2; a += 0.04) {
        const lx = Math.cos(a);
        const ly = Math.sin(a) * Math.cos(inc);
        const lz = Math.sin(a) * Math.sin(inc);
        const cosRY = Math.cos(rotY.current), sinRY = Math.sin(rotY.current);
        const cosRX = Math.cos(rotX.current), sinRX = Math.sin(rotX.current);
        const rx = lx * cosRY + lz * sinRY;
        const ry0 = -lx * sinRY + lz * cosRY;
        const ry = ry0 * cosRX - ly * sinRX;
        const rz = ry0 * sinRX + ly * cosRX;

        const sx = cx + rx * orbitR;
        const sy = cy - ry * orbitR;

        if (rz < 0.05) { first = true; continue; }
        if (first) { ctx.moveTo(sx, sy); first = false; }
        else ctx.lineTo(sx, sy);

        if (Math.abs(a - issAngle) < 0.08) {
          issX = sx; issY = sy; issZ = rz; issVis = rz > 0.05;
          const lat = Math.asin(Math.sin(a) * Math.sin(inc)) * (180 / Math.PI);
          const lng = ((Math.atan2(Math.cos(a) * Math.sin(inc), Math.cos(a) * Math.cos(inc)) * (180 / Math.PI)) - rotY.current * 180 / Math.PI) % 360;
          setStats({ lat: parseFloat(lat.toFixed(2)), lng: parseFloat(lng.toFixed(2)), alt: 408, speed: 7.66 });
        }
      }

      // Dashed orbit line
      ctx.strokeStyle = 'rgba(255, 200, 0, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ISS dot with enhanced effects
      if (issVis) {
        ctx.save();

        // Outer glow - bloom effect
        const outerGlow = ctx.createRadialGradient(issX, issY, 0, issX, issY, 35);
        outerGlow.addColorStop(0, 'rgba(255, 220, 50, 0.6)');
        outerGlow.addColorStop(0.3, 'rgba(255, 180, 0, 0.25)');
        outerGlow.addColorStop(0.6, 'rgba(255, 150, 0, 0.1)');
        outerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(issX, issY, 35, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        const innerGlow = ctx.createRadialGradient(issX, issY, 0, issX, issY, 18);
        innerGlow.addColorStop(0, 'rgba(255, 230, 100, 1)');
        innerGlow.addColorStop(0.5, 'rgba(255, 200, 50, 0.7)');
        innerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(issX, issY, 18, 0, Math.PI * 2);
        ctx.fill();

        // ISS core
        ctx.beginPath();
        ctx.arc(issX, issY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff8d0';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated pulse rings
        const pulse1 = 0.5 + 0.5 * Math.sin(t * 0.006);
        const pulse2 = 0.5 + 0.5 * Math.sin(t * 0.006 + Math.PI / 3);
        const pulse3 = 0.5 + 0.5 * Math.sin(t * 0.006 + Math.PI / 1.5);

        // Pulse ring 1
        ctx.beginPath();
        ctx.arc(issX, issY, 10 + pulse1 * 14, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 220, 50, ${0.7 - pulse1 * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulse ring 2
        ctx.beginPath();
        ctx.arc(issX, issY, 14 + pulse2 * 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 0, ${0.4 - pulse2 * 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // ISS direction indicator (small arrow moving direction)
        const arrowAngle = issAngle + Math.PI / 2;
        const arrowX = issX + Math.cos(arrowAngle) * 12;
        const arrowY = issY + Math.sin(arrowAngle) * 12;
        ctx.beginPath();
        ctx.arc(arrowX, arrowY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 220, 50, 0.6)';
        ctx.fill();

        // ISS label with glassmorphism
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(issX + 16, issY - 12, 58, 24, 6);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('ISS', issX + 22, issY + 4);
        ctx.restore();
      }
    };

    const drawSatellites = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, t: number) => {
      const sats = [
        { inc: 45, phase: 0.5, color: '#a855f7' },
        { inc: 98, phase: 1.2, color: '#06b6d4' },
        { inc: 63, phase: 2.1, color: '#10b981' },
        { inc: 30, phase: 3.0, color: '#f59e0b' },
        { inc: 75, phase: 4.1, color: '#ef4444' },
      ];

      sats.forEach(({ inc, phase, color }) => {
        const a = (phase + t * 0.00028) % (Math.PI * 2);
        const incRad = inc * Math.PI / 180;
        const orbitR = radius * 1.08;

        // Minimal trail
        ctx.beginPath();
        let first = true;
        for (let da = a - 0.8; da <= a; da += 0.04) {
          const ca = da;
          const lx = Math.cos(ca);
          const ly = Math.sin(ca) * Math.cos(incRad);
          const lz = Math.sin(ca) * Math.sin(incRad);
          const cosRY = Math.cos(rotY.current), sinRY = Math.sin(rotY.current);
          const cosRX = Math.cos(rotX.current), sinRX = Math.sin(rotX.current);
          const rx = lx * cosRY + lz * sinRY;
          const ry0 = -lx * sinRY + lz * cosRY;
          const ry = ry0 * cosRX - ly * sinRX;
          const rz = ry0 * sinRX + ly * cosRX;
          if (rz < 0) { first = true; continue; }
          const sx = cx + rx * orbitR;
          const sy = cy - ry * orbitR;
          if (first) { ctx.moveTo(sx, sy); first = false; }
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = `${color}40`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Satellite dot with glow
        const lx = Math.cos(a);
        const ly = Math.sin(a) * Math.cos(incRad);
        const lz = Math.sin(a) * Math.sin(incRad);
        const cosRY = Math.cos(rotY.current), sinRY = Math.sin(rotY.current);
        const cosRX = Math.cos(rotX.current), sinRX = Math.sin(rotX.current);
        const rx = lx * cosRY + lz * sinRY;
        const ry0 = -lx * sinRY + lz * cosRY;
        const ry = ry0 * cosRX - ly * sinRX;
        const rz = ry0 * sinRX + ly * cosRX;
        if (rz > 0) {
          const sx = cx + rx * orbitR;
          const sy = cy - ry * orbitR;

          // Glow
          const satGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
          satGlow.addColorStop(0, `${color}cc`);
          satGlow.addColorStop(0.4, `${color}40`);
          satGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = satGlow;
          ctx.beginPath();
          ctx.arc(sx, sy, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      });
    };

    const drawCities = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, t: number) => {
      CITIES.forEach((city) => {
        const p = latLngToXY(city.lat, city.lng, rotX.current, rotY.current, radius, cx, cy);
        if (!p.visible) return;

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.004 + city.lat * 0.1);

        // City glow
        const cityGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
        cityGlow.addColorStop(0, `rgba(0, 229, 255, ${0.6 * pulse})`);
        cityGlow.addColorStop(0.5, `rgba(0, 229, 255, ${0.2 * pulse})`);
        cityGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = cityGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.fill();
      });
    };

    let frame = 0;
    const animate = () => {
      frame++;
      const { cx, cy, radius } = getGlobeParams();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Earth sphere - premium gradient
      const earthGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius * 1.2);
      earthGrad.addColorStop(0, '#1f5fa8');
      earthGrad.addColorStop(0.35, '#0d3a7a');
      earthGrad.addColorStop(0.7, '#072a5a');
      earthGrad.addColorStop(1, '#041838');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = earthGrad;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Day-night shading - enhanced
      const dayNight = ctx.createLinearGradient(cx - radius * 0.8, cy, cx + radius * 0.5, cy);
      dayNight.addColorStop(0, 'rgba(255, 230, 180, 0.08)');
      dayNight.addColorStop(0.35, 'rgba(255, 230, 180, 0.03)');
      dayNight.addColorStop(0.65, 'transparent');
      dayNight.addColorStop(1, 'rgba(0, 0, 40, 0.45)');
      ctx.fillStyle = dayNight;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Subtle cloud effect
      const cloudNoise = ctx.createRadialGradient(cx + radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius);
      cloudNoise.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      cloudNoise.addColorStop(1, 'transparent');
      ctx.fillStyle = cloudNoise;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore();

      drawGrid(ctx, cx, cy, radius);
      drawContinents(ctx, cx, cy, radius);
      drawCities(ctx, cx, cy, radius, frame);
      drawSatellites(ctx, cx, cy, radius, frame);
      drawISS(ctx, cx, cy, radius, frame);

      // Enhanced atmosphere glow - multiple layers
      // Inner atmosphere
      const atmoInner = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.08);
      atmoInner.addColorStop(0, 'rgba(30, 100, 200, 0.4)');
      atmoInner.addColorStop(0.4, 'rgba(0, 150, 255, 0.2)');
      atmoInner.addColorStop(0.7, 'rgba(0, 200, 255, 0.08)');
      atmoInner.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
      ctx.fillStyle = atmoInner;
      ctx.fill();

      // Outer atmosphere
      const atmoOuter = ctx.createRadialGradient(cx, cy, radius * 1.0, cx, cy, radius * 1.25);
      atmoOuter.addColorStop(0, 'rgba(0, 150, 255, 0.12)');
      atmoOuter.addColorStop(0.5, 'rgba(0, 200, 255, 0.05)');
      atmoOuter.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = atmoOuter;
      ctx.fill();

      // Bloom glow
      const bloomGrd = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.6);
      bloomGrd.addColorStop(0, 'rgba(20, 80, 180, 0.08)');
      bloomGrd.addColorStop(0.4, 'rgba(0, 140, 255, 0.03)');
      bloomGrd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = bloomGrd;
      ctx.fill();

      // Specular highlight - premium
      const specGrd = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.35, 0, cx - radius * 0.35, cy - radius * 0.35, radius * 0.7);
      specGrd.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      specGrd.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
      specGrd.addColorStop(1, 'transparent');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = specGrd;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.restore();

      // Auto rotate when not dragging
      if (!isDragging.current) {
        rotY.current += 0.0007;
      }

      animId.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse/touch drag
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      rotY.current += dx * 0.004;
      rotX.current = Math.max(-1, Math.min(1, rotX.current - dy * 0.004));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging.current = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom.current = Math.max(0.5, Math.min(2.5, zoom.current - e.deltaY * 0.0008));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Touch support
    let lastTouches: Touch[] = [];
    const onTouchStart = (e: TouchEvent) => {
      isDragging.current = true;
      lastTouches = Array.from(e.touches);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touches = Array.from(e.touches);
      if (touches.length === 1 && lastTouches.length === 1) {
        const dx = touches[0].clientX - lastTouches[0].clientX;
        const dy = touches[0].clientY - lastTouches[0].clientY;
        rotY.current += dx * 0.004;
        rotX.current = Math.max(-1, Math.min(1, rotX.current - dy * 0.004));
      }
      lastTouches = touches;
    };
    const onTouchEnd = () => { isDragging.current = false; };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId.current);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      ro.disconnect();
    };
  }, []);

  return (
    <section id="globe" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 nebula opacity-25 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/60">Live Earth View</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Our <span className="gradient-text">Living Planet</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-white/50 max-w-2xl mx-auto"
          >
            Watch the ISS orbit in real-time. Drag to rotate, scroll to zoom, click for details.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Globe Canvas */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              ref={containerRef}
              className="glass-card rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ height: 520, position: 'relative' }}
            >
              <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
              <div className="absolute bottom-4 left-4 flex items-center gap-4">
                <div className="glass rounded-xl px-3 py-2 text-xs text-white/60 pointer-events-none">
                  Drag to rotate &bull; Scroll to zoom
                </div>
              </div>
              {/* Fly to ISS button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFlyToISS(true)}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl glass text-xs text-cyan-400"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Track ISS</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Stats panel */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card card-glow rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 rounded-xl bg-yellow-500/20"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Satellite className="w-5 h-5 text-yellow-400" />
                </motion.div>
                <div>
                  <div className="font-bold text-white text-sm">ISS Position</div>
                  <div className="text-xs text-white/40">International Space Station</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Latitude</div>
                  <div className="font-bold text-white text-sm">{stats.lat}&deg;</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Longitude</div>
                  <div className="font-bold text-white text-sm">{stats.lng}&deg;</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Altitude</div>
                  <div className="font-bold text-cyan-400 text-sm">{stats.alt} km</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-white/40 mb-1">Speed</div>
                  <div className="font-bold text-green-400 text-sm">{stats.speed} km/s</div>
                </div>
              </div>
            </motion.div>

            {[
              { icon: Globe, color: 'cyan', title: 'Active Satellites', value: '9,000+', sub: 'In Earth orbit' },
              { icon: Zap, color: 'yellow', title: 'Orbital Speed', value: '28,000', sub: 'km/h average' },
              { icon: Users, color: 'green', title: 'ISS Crew', value: '7', sub: 'Astronauts aboard' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="glass-card card-glow rounded-2xl p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-${item.color}-500/20`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white/40">{item.title}</div>
                    <div className="font-bold text-xl gradient-text">{item.value}</div>
                    <div className="text-xs text-white/30">{item.sub}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
