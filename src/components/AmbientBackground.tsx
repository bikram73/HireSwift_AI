import React from 'react';

interface AmbientBackgroundProps {
  className?: string;
}

const MICRO_NODES = [
  { left: '6%', top: '86%', size: 3, delay: '0s', duration: '13s', tone: 'bg-[#8B5CF6]/70' },
  { left: '12%', top: '52%', size: 2.5, delay: '1.8s', duration: '16s', tone: 'bg-[#3B82F6]/65' },
  { left: '19%', top: '78%', size: 4, delay: '0.9s', duration: '15s', tone: 'bg-[#4F46E5]/70' },
  { left: '26%', top: '38%', size: 2.5, delay: '3.4s', duration: '17s', tone: 'bg-[#A78BFA]/65' },
  { left: '33%', top: '68%', size: 3, delay: '2.1s', duration: '14s', tone: 'bg-[#60A5FA]/60' },
  { left: '41%', top: '90%', size: 3.5, delay: '0.5s', duration: '18s', tone: 'bg-[#8B5CF6]/65' },
  { left: '48%', top: '44%', size: 2, delay: '4.2s', duration: '15s', tone: 'bg-[#3B82F6]/55' },
  { left: '56%', top: '76%', size: 3, delay: '1.4s', duration: '13s', tone: 'bg-[#A78BFA]/70' },
  { left: '64%', top: '58%', size: 4, delay: '3.7s', duration: '16s', tone: 'bg-[#4F46E5]/65' },
  { left: '71%', top: '88%', size: 3, delay: '0.7s', duration: '19s', tone: 'bg-[#60A5FA]/65' },
  { left: '78%', top: '36%', size: 2.5, delay: '2.9s', duration: '14s', tone: 'bg-[#8B5CF6]/60' },
  { left: '84%', top: '72%', size: 3.5, delay: '1.2s', duration: '17s', tone: 'bg-[#3B82F6]/70' },
  { left: '91%', top: '84%', size: 3, delay: '0.3s', duration: '15s', tone: 'bg-[#A78BFA]/65' },
  { left: '95%', top: '49%', size: 2.5, delay: '2.6s', duration: '16s', tone: 'bg-[#60A5FA]/60' },
  { left: '15%', top: '24%', size: 2.5, delay: '4.8s', duration: '15s', tone: 'bg-[#8B5CF6]/55' },
  { left: '68%', top: '22%', size: 3, delay: '3.1s', duration: '17s', tone: 'bg-[#3B82F6]/60' },
  { left: '37%', top: '18%', size: 2, delay: '5.5s', duration: '14s', tone: 'bg-[#A78BFA]/55' },
  { left: '87%', top: '26%', size: 3, delay: '1.7s', duration: '18s', tone: 'bg-[#4F46E5]/60' },
];

const SPARKLES = [
  { left: '14%', top: '28%', size: 12, delay: '0s', duration: '5.5s' },
  { left: '76%', top: '19%', size: 14, delay: '1.6s', duration: '6.2s' },
  { left: '88%', top: '58%', size: 11, delay: '2.8s', duration: '5.0s' },
  { left: '28%', top: '74%', size: 13, delay: '0.9s', duration: '6.8s' },
  { left: '54%', top: '32%', size: 10, delay: '3.5s', duration: '5.8s' },
];

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  className = 'fixed inset-0',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`${className} pointer-events-none overflow-hidden z-0 select-none`}
    >
      {/* Drifting Indigo, Violet & Electric Blue Aurora Orbs */}
      <div className="ambient-orb-1 absolute -top-28 -left-24 w-[480px] h-[480px] rounded-full bg-[#4F46E5]/16 blur-[110px]" />
      <div className="ambient-orb-2 absolute top-[28%] -right-24 w-[440px] h-[440px] rounded-full bg-[#8B5CF6]/14 blur-[115px]" />
      <div className="ambient-orb-3 absolute -bottom-28 left-[32%] w-[420px] h-[420px] rounded-full bg-[#3B82F6]/14 blur-[115px]" />

      {/* Subtle Neural Talent Network SVG Paths */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M-60 220 C 260 110, 520 340, 860 190 S 1240 280, 1520 140"
          stroke="#4F46E5"
          strokeWidth="1.2"
          strokeOpacity="0.22"
          strokeDasharray="6 10"
          className="ambient-dash-flow"
        />
        <path
          d="M-40 660 C 290 540, 610 740, 960 560 S 1290 650, 1520 510"
          stroke="#8B5CF6"
          strokeWidth="1.2"
          strokeOpacity="0.2"
          strokeDasharray="8 12"
          className="ambient-dash-flow-reverse"
        />
        <path
          d="M180 -40 C 320 260, 210 520, 420 940"
          stroke="#3B82F6"
          strokeWidth="1"
          strokeOpacity="0.14"
          strokeDasharray="5 12"
          className="ambient-dash-flow"
        />
        <path
          d="M1160 -40 C 1020 280, 1180 560, 980 940"
          stroke="#8B5CF6"
          strokeWidth="1"
          strokeOpacity="0.14"
          strokeDasharray="5 12"
          className="ambient-dash-flow-reverse"
        />
      </svg>

      {/* Concentric Radar Talent Pulse Rings */}
      <div className="absolute top-[18%] right-[12%] w-40 h-40">
        <span className="ambient-radar-ring absolute inset-0 rounded-full border border-[#8B5CF6]/25" />
        <span
          className="ambient-radar-ring absolute inset-0 rounded-full border border-[#3B82F6]/20"
          style={{ animationDelay: '3s' }}
        />
      </div>
      <div className="absolute bottom-[16%] left-[10%] w-32 h-32">
        <span
          className="ambient-radar-ring absolute inset-0 rounded-full border border-[#4F46E5]/25"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Subtle Scanning Pulse Lines */}
      <div className="ambient-scanline absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#8B5CF6]/45 to-transparent" />
      <div
        className="ambient-scanline absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent"
        style={{ animationDelay: '7.5s' }}
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
            fillOpacity="0.55"
          />
        </svg>
      ))}

      {/* Rising Micro-Nodes / Talent Sparks */}
      {MICRO_NODES.map((node, idx) => (
        <span
          key={idx}
          className={`ambient-particle absolute rounded-full ${node.tone} shadow-[0_0_10px_rgba(139,92,246,0.55)]`}
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
