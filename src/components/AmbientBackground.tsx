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

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  className = 'fixed inset-0',
  intensity = 'hero',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
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

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    let frameTick = 0;
    let lastDrawMs = 0;
    const drawFrame = (nowMs = 0) => {
      if (!ctx) return;
      if (!prefersReducedMotion && lastDrawMs && nowMs - lastDrawMs < 30) {
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

      // Update positions first
      if (!prefersReducedMotion) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -12) n.x = width + 12;
          if (n.x > width + 12) n.x = -12;
          if (n.y < -12) n.y = height + 12;
          if (n.y > height + 12) n.y = -12;
        }
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

      // Pointer proximity edges batched in 1 draw call
      if (ptr.active) {
        ctx.beginPath();
        let hasPtrEdge = false;
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const pdx = n.x - ptr.x;
          const pdy = n.y - ptr.y;
          if (pdx * pdx + pdy * pdy < 175 * 175) {
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(ptr.x, ptr.y);
            hasPtrEdge = true;
          }
        }
        if (hasPtrEdge) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
          ctx.stroke();
        }
      }

      // Draw traveling data packets in a single path
      if (packets.length > 0) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
        for (let p = 0; p < packets.length; p++) {
          ctx.moveTo(packets[p].x + 1.5, packets[p].y);
          ctx.arc(packets[p].x, packets[p].y, 1.5, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      // Draw node halos & cores
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = 0.72 + Math.sin(frameTick * 1.4 + n.pulsePhase) * 0.28;
        ctx.beginPath();
        ctx.fillStyle = n.color;
        ctx.globalAlpha = (intensity === 'hero' ? 0.56 : 0.4) * pulse;
        ctx.arc(n.x, n.y, n.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = '#F8FAFC';
        ctx.globalAlpha = (intensity === 'hero' ? 0.78 : 0.54) * pulse;
        ctx.arc(n.x, n.y, n.radius * 0.72, 0, Math.PI * 2);
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
