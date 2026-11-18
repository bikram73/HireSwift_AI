import React, { useEffect, useRef } from 'react';

interface AmbientBackgroundProps {
  className?: string;
  intensity?: 'hero' | 'workspace';
}

interface ConstellationNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

const NODE_COLORS = ['#818CF8', '#A78BFA', '#38BDF8', '#C4B5FD', '#60A5FA'];

const MICRO_NODES = [
  { left: '6%', top: '86%', size: 3.5, delay: '0s', duration: '11s', tone: 'bg-[#8B5CF6]/80' },
  { left: '12%', top: '52%', size: 3, delay: '1.8s', duration: '14s', tone: 'bg-[#3B82F6]/75' },
  { left: '19%', top: '78%', size: 4, delay: '0.9s', duration: '12s', tone: 'bg-[#4F46E5]/80' },
  { left: '26%', top: '38%', size: 2.5, delay: '3.4s', duration: '15s', tone: 'bg-[#A78BFA]/75' },
  { left: '33%', top: '68%', size: 3, delay: '2.1s', duration: '12s', tone: 'bg-[#60A5FA]/70' },
  { left: '41%', top: '90%', size: 4, delay: '0.5s', duration: '16s', tone: 'bg-[#8B5CF6]/75' },
  { left: '48%', top: '44%', size: 2.5, delay: '4.2s', duration: '13s', tone: 'bg-[#3B82F6]/65' },
  { left: '56%', top: '76%', size: 3.5, delay: '1.4s', duration: '11s', tone: 'bg-[#A78BFA]/80' },
  { left: '64%', top: '58%', size: 4, delay: '3.7s', duration: '14s', tone: 'bg-[#4F46E5]/75' },
  { left: '71%', top: '88%', size: 3, delay: '0.7s', duration: '17s', tone: 'bg-[#60A5FA]/75' },
  { left: '78%', top: '36%', size: 3, delay: '2.9s', duration: '12s', tone: 'bg-[#8B5CF6]/70' },
  { left: '84%', top: '72%', size: 3.5, delay: '1.2s', duration: '15s', tone: 'bg-[#3B82F6]/80' },
  { left: '91%', top: '84%', size: 3, delay: '0.3s', duration: '13s', tone: 'bg-[#A78BFA]/75' },
  { left: '95%', top: '49%', size: 2.5, delay: '2.6s', duration: '14s', tone: 'bg-[#60A5FA]/70' },
  { left: '15%', top: '24%', size: 3, delay: '4.8s', duration: '13s', tone: 'bg-[#8B5CF6]/65' },
  { left: '68%', top: '22%', size: 3, delay: '3.1s', duration: '15s', tone: 'bg-[#3B82F6]/70' },
  { left: '37%', top: '18%', size: 2.5, delay: '5.5s', duration: '12s', tone: 'bg-[#A78BFA]/65' },
  { left: '87%', top: '26%', size: 3.5, delay: '1.7s', duration: '16s', tone: 'bg-[#4F46E5]/70' },
  { left: '22%', top: '56%', size: 3, delay: '2.4s', duration: '13s', tone: 'bg-[#38BDF8]/70' },
  { left: '74%', top: '64%', size: 3.5, delay: '1.1s', duration: '14s', tone: 'bg-[#C4B5FD]/70' },
];

const SPARKLES = [
  { left: '14%', top: '28%', size: 13, delay: '0s', duration: '4.8s' },
  { left: '76%', top: '19%', size: 15, delay: '1.4s', duration: '5.5s' },
  { left: '88%', top: '58%', size: 12, delay: '2.5s', duration: '4.5s' },
  { left: '28%', top: '74%', size: 14, delay: '0.8s', duration: '6.0s' },
  { left: '54%', top: '32%', size: 11, delay: '3.1s', duration: '5.2s' },
  { left: '42%', top: '14%', size: 12, delay: '1.9s', duration: '4.9s' },
  { left: '9%', top: '62%', size: 11, delay: '2.8s', duration: '5.6s' },
];

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

interface CursorSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  className = 'fixed inset-0',
  intensity = 'hero',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
  }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let nodes: ConstellationNode[] = [];
    const trail: TrailPoint[] = [];
    const sparks: CursorSpark[] = [];
    const ripples: ClickRipple[] = [];
    const smoothPtr = { x: 0, y: 0, initialized: false };

    const createNodes = (w: number, h: number): ConstellationNode[] => {
      const isCompact = w < 768;
      const baseCount = isCompact ? 18 : intensity === 'hero' ? 38 : 28;
      const list: ConstellationNode[] = [];
      for (let i = 0; i < baseCount; i++) {
        const angle = (i * 2.39996) % (Math.PI * 2);
        const speed = (isCompact ? 0.25 : 0.38) + (i % 4) * 0.09;
        list.push({
          x: (((i * 73) % 100) / 100) * w,
          y: (((i * 41 + 17) % 100) / 100) * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.4 + (i % 3) * 0.7,
          color: NODE_COLORS[i % NODE_COLORS.length],
          pulsePhase: i * 0.7,
        });
      }
      return list;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width || window.innerWidth));
      height = Math.max(1, Math.round(rect.height || window.innerHeight));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = createNodes(width, height);
    };

    resize();

    const spawnSparks = (x: number, y: number, vx: number, vy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        if (sparks.length >= 34) sparks.shift();
        const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.9 + Math.PI;
        const speed = 0.6 + Math.random() * 1.9;
        sparks.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed + vx * 0.08,
          vy: Math.sin(angle) * speed + vy * 0.08,
          life: 1,
          maxLife: 0.55 + Math.random() * 0.45,
          size: 1.2 + Math.random() * 1.9,
          color: NODE_COLORS[(sparks.length + i) % NODE_COLORS.length],
        });
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        pointerRef.current.active = false;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      const prev = pointerRef.current;
      const dx = prev.active ? nx - prev.x : 0;
      const dy = prev.active ? ny - prev.y : 0;
      pointerRef.current = {
        x: nx,
        y: ny,
        vx: dx,
        vy: dy,
        active: true,
      };
      if (!smoothPtr.initialized) {
        smoothPtr.x = nx;
        smoothPtr.y = ny;
        smoothPtr.initialized = true;
      }
      if (!prefersReducedMotion) {
        trail.push({ x: nx, y: ny, age: 1 });
        if (trail.length > 18) trail.shift();
        const speed = Math.hypot(dx, dy);
        if (speed > 3) {
          spawnSparks(nx, ny, dx, dy, speed > 22 ? 3 : 1);
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (ripples.length >= 6) ripples.shift();
      ripples.push({
        x: cx,
        y: cy,
        radius: 6,
        maxRadius: intensity === 'hero' ? 150 : 120,
        alpha: 0.72,
        color: '#38BDF8',
      });
      ripples.push({
        x: cx,
        y: cy,
        radius: 2,
        maxRadius: intensity === 'hero' ? 96 : 78,
        alpha: 0.55,
        color: '#8B5CF6',
      });

      if (e.pointerType !== 'touch') {
        spawnSparks(cx, cy, 0, 0, 7);
      }

      // Apply gentle radial impulse to nearby constellation nodes
      const blastRadiusSq = 190 * 190;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = n.x - cx;
        const dy = n.y - cy;
        const dSq = dx * dx + dy * dy;
        if (dSq > 1 && dSq < blastRadiusSq) {
          const d = Math.sqrt(dSq);
          const force = (1 - d / 190) * 1.45;
          n.vx = Math.max(-1.8, Math.min(1.8, n.vx + (dx / d) * force));
          n.vy = Math.max(-1.8, Math.min(1.8, n.vy + (dy / d) * force));
        }
      }
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    let frameTick = 0;
    let lastDrawMs = 0;
    const drawFrame = (nowMs = 0) => {
      if (!ctx) return;
      if (!prefersReducedMotion && lastDrawMs && nowMs - lastDrawMs < 28) {
        rafId = window.requestAnimationFrame(drawFrame);
        return;
      }
      lastDrawMs = nowMs;
      frameTick += 0.03;
      ctx.clearRect(0, 0, width, height);

      const maxDist = width < 768 ? 115 : 155;
      const maxDistSq = maxDist * maxDist;
      const halfDistSq = (maxDist * 0.55) * (maxDist * 0.55);
      const lineStrong = intensity === 'hero' ? 0.24 : 0.16;
      const lineFaint = intensity === 'hero' ? 0.11 : 0.07;
      const ptr = pointerRef.current;

      if (ptr.active && smoothPtr.initialized) {
        smoothPtr.x += (ptr.x - smoothPtr.x) * 0.3;
        smoothPtr.y += (ptr.y - smoothPtr.y) * 0.3;
      }

      const activePtrX = smoothPtr.initialized ? smoothPtr.x : ptr.x;
      const activePtrY = smoothPtr.initialized ? smoothPtr.y : ptr.y;
      const ptrRadius = intensity === 'hero' ? 215 : 185;
      const ptrRadiusSq = ptrRadius * ptrRadius;

      // Update positions & magnetic cursor interaction
      if (!prefersReducedMotion) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (ptr.active) {
            const dx = activePtrX - n.x;
            const dy = activePtrY - n.y;
            const dSq = dx * dx + dy * dy;
            if (dSq > 16 && dSq < ptrRadiusSq) {
              const d = Math.sqrt(dSq);
              const pull = (1 - d / ptrRadius) * 0.038;
              // Gentle orbital swirl + subtle attraction toward cursor
              n.vx += (dx / d) * pull - (dy / d) * pull * 0.55;
              n.vy += (dy / d) * pull + (dx / d) * pull * 0.55;
            }
          }
          // Light velocity damping back toward natural cruise speed
          const speed = Math.hypot(n.vx, n.vy);
          if (speed > 0.72) {
            n.vx *= 0.975;
            n.vy *= 0.975;
          }
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -12) n.x = width + 12;
          if (n.x > width + 12) n.x = -12;
          if (n.y < -12) n.y = height + 12;
          if (n.y > height + 12) n.y = -12;
        }
      }

      // Soft multi-stop cursor aura (3 layered translucent circles — zero createRadialGradient for speed & JSDOM safety)
      if (ptr.active && !prefersReducedMotion) {
        const auraAlpha = intensity === 'hero' ? 0.095 : 0.065;
        ctx.beginPath();
        ctx.fillStyle = `rgba(79, 70, 229, ${auraAlpha * 0.55})`;
        ctx.arc(activePtrX, activePtrY, 130, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(139, 92, 246, ${auraAlpha * 0.8})`;
        ctx.arc(activePtrX, activePtrY, 74, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(56, 189, 248, ${auraAlpha})`;
        ctx.arc(activePtrX, activePtrY, 32, 0, Math.PI * 2);
        ctx.fill();
      }

      // Batch constellation lines into 2 draw calls without Path2D for full browser + JSDOM compatibility
      const strongSegs: number[] = [];
      const faintSegs: number[] = [];
      const packets: { x: number; y: number }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const targetSegs = distSq < halfDistSq ? strongSegs : faintSegs;
            targetSegs.push(n.x, n.y, m.x, m.y);
            if (!prefersReducedMotion && (i + j) % 7 === 0) {
              const t = (frameTick * 0.45 + (i + j) * 0.19) % 1;
              packets.push({ x: n.x + (m.x - n.x) * t, y: n.y + (m.y - n.y) * t });
            }
          }
        }
      }

      ctx.lineWidth = 0.85;
      if (faintSegs.length > 0) {
        ctx.beginPath();
        for (let k = 0; k < faintSegs.length; k += 4) {
          ctx.moveTo(faintSegs[k], faintSegs[k + 1]);
          ctx.lineTo(faintSegs[k + 2], faintSegs[k + 3]);
        }
        ctx.strokeStyle = `rgba(139, 92, 246, ${lineFaint})`;
        ctx.stroke();
      }
      if (strongSegs.length > 0) {
        ctx.beginPath();
        for (let k = 0; k < strongSegs.length; k += 4) {
          ctx.moveTo(strongSegs[k], strongSegs[k + 1]);
          ctx.lineTo(strongSegs[k + 2], strongSegs[k + 3]);
        }
        ctx.strokeStyle = `rgba(139, 92, 246, ${lineStrong})`;
        ctx.stroke();
      }

      // Pointer proximity energy web & traveling cursor packets
      const ptrPackets: { x: number; y: number }[] = [];
      if (ptr.active) {
        ctx.beginPath();
        let hasPtrEdge = false;
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const pdx = n.x - activePtrX;
          const pdy = n.y - activePtrY;
          if (pdx * pdx + pdy * pdy < ptrRadiusSq) {
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(activePtrX, activePtrY);
            hasPtrEdge = true;
            if (!prefersReducedMotion) {
              const t = (frameTick * 0.85 + i * 0.27) % 1;
              ptrPackets.push({
                x: n.x + (activePtrX - n.x) * t,
                y: n.y + (activePtrY - n.y) * t,
              });
            }
          }
        }
        if (hasPtrEdge) {
          ctx.lineWidth = 1.15;
          ctx.strokeStyle = intensity === 'hero' ? 'rgba(56, 189, 248, 0.36)' : 'rgba(56, 189, 248, 0.28)';
          ctx.stroke();
        }
      }

      // Cursor movement comet trail ribbon
      if (!prefersReducedMotion && trail.length > 1) {
        for (let i = trail.length - 1; i >= 0; i--) {
          trail[i].age -= 0.055;
          if (trail[i].age <= 0) {
            trail.splice(i, 1);
          }
        }
        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1];
          const p1 = trail[i];
          const progress = i / trail.length;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineWidth = 1 + progress * 2.6;
          ctx.lineCap = 'round';
          ctx.strokeStyle =
            progress > 0.55
              ? `rgba(56, 189, 248, ${(p1.age * progress * 0.42).toFixed(3)})`
              : `rgba(139, 92, 246, ${(p1.age * progress * 0.34).toFixed(3)})`;
          ctx.stroke();
        }
      }

      // Draw traveling data packets (constellation + pointer)
      if (packets.length > 0) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
        for (let p = 0; p < packets.length; p++) {
          ctx.moveTo(packets[p].x + 1.5, packets[p].y);
          ctx.arc(packets[p].x, packets[p].y, 1.5, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      if (ptrPackets.length > 0) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
        for (let p = 0; p < ptrPackets.length; p++) {
          ctx.moveTo(ptrPackets[p].x + 2, ptrPackets[p].y);
          ctx.arc(ptrPackets[p].x, ptrPackets[p].y, 2, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Cursor velocity sparks
      if (!prefersReducedMotion && sparks.length > 0) {
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.94;
          sp.vy *= 0.94;
          sp.life -= 0.045 / sp.maxLife;
          if (sp.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = Math.max(0, sp.life * 0.85);
          ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Click / tap shockwave ripples
      if (!prefersReducedMotion && ripples.length > 0) {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rp = ripples[i];
          rp.radius += (rp.maxRadius - rp.radius) * 0.14 + 1.4;
          rp.alpha *= 0.92;
          if (rp.alpha < 0.03 || rp.radius >= rp.maxRadius) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.strokeStyle = rp.color;
          ctx.globalAlpha = rp.alpha;
          ctx.lineWidth = 1.6;
          ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Draw node halos & cores (brighten & expand gently near cursor)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = 0.72 + Math.sin(frameTick * 1.4 + n.pulsePhase) * 0.28;
        let boost = 1;
        if (ptr.active) {
          const dSq = (n.x - activePtrX) ** 2 + (n.y - activePtrY) ** 2;
          if (dSq < ptrRadiusSq) {
            boost = 1 + (1 - Math.sqrt(dSq) / ptrRadius) * 0.85;
          }
        }
        ctx.beginPath();
        ctx.fillStyle = n.color;
        ctx.globalAlpha = Math.min(1, (intensity === 'hero' ? 0.56 : 0.4) * pulse * boost);
        ctx.arc(n.x, n.y, n.radius * 2.2 * boost, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = '#F8FAFC';
        ctx.globalAlpha = Math.min(1, (intensity === 'hero' ? 0.78 : 0.54) * pulse * boost);
        ctx.arc(n.x, n.y, n.radius * 0.72 * Math.min(1.4, boost), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    drawFrame(0);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [intensity]);

  const isHero = intensity === 'hero';

  return (
    <div
      aria-hidden="true"
      className={`${className} pointer-events-none overflow-hidden z-0 select-none`}
    >
      {/* Interactive Neural Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90"
      />

      {/* Rotating Conic Volumetric Aurora Spotlight (Zero-blur pre-feathered gradient for 60fps compositor speed) */}
      <div
        className={`ambient-beam-spin absolute top-1/2 left-1/2 w-[840px] h-[840px] rounded-full ${
          isHero ? 'opacity-55' : 'opacity-35'
        }`}
        style={{
          background:
            'radial-gradient(circle at center, rgba(79,70,229,0.22) 0%, rgba(139,92,246,0.14) 32%, rgba(56,189,248,0.06) 54%, transparent 72%)',
        }}
      />

      {/* Drifting Pre-Feathered Indigo, Violet & Electric Blue Aurora Orbs */}
      <div
        className="ambient-orb-1 absolute -top-32 -left-28 w-[460px] sm:w-[620px] h-[460px] sm:h-[620px] rounded-full"
        style={{
          background: isHero
            ? 'radial-gradient(circle, rgba(79,70,229,0.28) 0%, rgba(79,70,229,0.1) 42%, transparent 70%)'
            : 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, rgba(79,70,229,0.06) 42%, transparent 70%)',
        }}
      />
      <div
        className="ambient-orb-2 absolute top-[20%] -right-28 w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] rounded-full"
        style={{
          background: isHero
            ? 'radial-gradient(circle, rgba(139,92,246,0.26) 0%, rgba(139,92,246,0.09) 42%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, rgba(139,92,246,0.05) 42%, transparent 70%)',
        }}
      />
      <div
        className="ambient-orb-3 absolute -bottom-32 left-[24%] w-[400px] sm:w-[540px] h-[400px] sm:h-[540px] rounded-full"
        style={{
          background: isHero
            ? 'radial-gradient(circle, rgba(59,130,246,0.24) 0%, rgba(56,189,248,0.08) 42%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(56,189,248,0.04) 42%, transparent 70%)',
        }}
      />

      {/* Diagonal Shimmer Aurora Sweep */}
      <div
        className={`ambient-wave-sweep absolute -inset-x-1/2 top-1/3 h-44 ${
          isHero ? 'opacity-45' : 'opacity-22'
        }`}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(79,70,229,0.16) 35%, rgba(139,92,246,0.22) 55%, rgba(56,189,248,0.14) 75%, transparent 100%)',
        }}
      />

      {/* Counter-Rotating Orbital Tech Rings */}
      <div className="ambient-orbit-cw absolute top-[10%] right-[6%] w-48 h-48 sm:w-72 sm:h-72 rounded-full border border-dashed border-[#8B5CF6]/25">
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#8B5CF6]/80 shadow-[0_0_12px_rgba(139,92,246,0.9)]" />
      </div>
      <div className="ambient-orbit-ccw absolute top-[13%] right-[9%] w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-[#3B82F6]/20">
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#38BDF8]/80 shadow-[0_0_10px_rgba(56,189,248,0.85)]" />
      </div>

      {/* Subtle Neural Talent Network SVG Paths */}
      <svg
        className={`absolute inset-0 w-full h-full ${isHero ? 'opacity-50' : 'opacity-35'}`}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-60 220 C 260 110, 520 340, 860 190 S 1240 280, 1520 140"
          stroke="#4F46E5"
          strokeWidth="1.4"
          strokeOpacity="0.28"
          strokeDasharray="6 10"
          className="ambient-dash-flow"
        />
        <path
          d="M-40 660 C 290 540, 610 740, 960 560 S 1290 650, 1520 510"
          stroke="#8B5CF6"
          strokeWidth="1.4"
          strokeOpacity="0.24"
          strokeDasharray="8 12"
          className="ambient-dash-flow-reverse"
        />
        <path
          d="M180 -40 C 320 260, 210 520, 420 940"
          stroke="#3B82F6"
          strokeWidth="1.1"
          strokeOpacity="0.18"
          strokeDasharray="5 12"
          className="ambient-dash-flow"
        />
        <path
          d="M1160 -40 C 1020 280, 1180 560, 980 940"
          stroke="#8B5CF6"
          strokeWidth="1.1"
          strokeOpacity="0.18"
          strokeDasharray="5 12"
          className="ambient-dash-flow-reverse"
        />
      </svg>

      {/* Concentric Radar Talent Pulse Rings */}
      <div className="absolute top-[18%] right-[12%] w-40 h-40">
        <span className="ambient-radar-ring absolute inset-0 rounded-full border border-[#8B5CF6]/30" />
        <span
          className="ambient-radar-ring absolute inset-0 rounded-full border border-[#3B82F6]/25"
          style={{ animationDelay: '2.6s' }}
        />
      </div>
      <div className="absolute bottom-[16%] left-[10%] w-36 h-36">
        <span
          className="ambient-radar-ring absolute inset-0 rounded-full border border-[#4F46E5]/30"
          style={{ animationDelay: '1.3s' }}
        />
        <span
          className="ambient-radar-ring absolute inset-0 rounded-full border border-[#38BDF8]/20"
          style={{ animationDelay: '3.8s' }}
        />
      </div>

      {/* Subtle Scanning Pulse Lines */}
      <div className="ambient-scanline absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8B5CF6]/55 to-transparent" />
      <div
        className="ambient-scanline absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent"
        style={{ animationDelay: '5.5s' }}
      />

      {/* Twinkling 4-Point AI Micro-Sparkles */}
      {SPARKLES.map((sp, idx) => (
        <svg
          key={`sp-${idx}`}
          viewBox="0 0 24 24"
          fill="none"
          className="ambient-twinkle absolute text-[#C4B5FD]"
          style={{
            left: sp.left,
            top: sp.top,
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            animationDelay: sp.delay,
            animationDuration: sp.duration,
          }}
        >
          <path
            d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
            fill="currentColor"
            fillOpacity="0.7"
          />
        </svg>
      ))}

      {/* Rising Micro-Nodes / Talent Sparks */}
      {MICRO_NODES.map((node, idx) => (
        <span
          key={idx}
          className={`ambient-particle absolute rounded-full ${node.tone} shadow-[0_0_12px_rgba(139,92,246,0.65)]`}
          style={{
            left: node.left,
            top: node.top,
            width: `${node.size}px`,
            height: `${node.size}px`,
            animationDelay: node.delay,
            animationDuration: node.duration,
          }}
        />
      ))}
    </div>
  );
};
