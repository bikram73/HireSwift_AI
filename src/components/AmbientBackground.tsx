import React from 'react';

interface AmbientBackgroundProps {
  className?: string;
}

const MICRO_NODES = [
  { left: '8%', top: '82%', size: 3, delay: '0s', duration: '14s', tone: 'bg-[#8B5CF6]/55' },
  { left: '16%', top: '48%', size: 2, delay: '2.4s', duration: '18s', tone: 'bg-[#3B82F6]/50' },
  { left: '24%', top: '76%', size: 4, delay: '1.1s', duration: '16s', tone: 'bg-[#4F46E5]/50' },
  { left: '34%', top: '64%', size: 2, delay: '4.5s', duration: '15s', tone: 'bg-[#A78BFA]/55' },
  { left: '43%', top: '88%', size: 3, delay: '0.8s', duration: '19s', tone: 'bg-[#60A5FA]/45' },
  { left: '54%', top: '72%', size: 2, delay: '3.2s', duration: '13s', tone: 'bg-[#8B5CF6]/50' },
  { left: '63%', top: '54%', size: 3, delay: '5.1s', duration: '17s', tone: 'bg-[#3B82F6]/50' },
  { left: '72%', top: '85%', size: 4, delay: '1.9s', duration: '20s', tone: 'bg-[#4F46E5]/55' },
  { left: '81%', top: '66%', size: 2, delay: '3.9s', duration: '14s', tone: 'bg-[#A78BFA]/50' },
  { left: '89%', top: '79%', size: 3, delay: '0.4s', duration: '16s', tone: 'bg-[#60A5FA]/50' },
  { left: '94%', top: '45%', size: 2, delay: '2.8s', duration: '18s', tone: 'bg-[#8B5CF6]/45' },
  { left: '29%', top: '34%', size: 2, delay: '6.0s', duration: '17s', tone: 'bg-[#60A5FA]/40' },
];

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  className = 'fixed inset-0',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`${className} pointer-events-none overflow-hidden z-0 select-none`}
    >
      {/* Drifting Indigo & Violet Aurora Orbs */}
      <div className="ambient-orb-1 absolute -top-28 -left-20 w-[440px] h-[440px] rounded-full bg-[#4F46E5]/12 blur-[110px]" />
      <div className="ambient-orb-2 absolute top-[32%] -right-24 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/10 blur-[115px]" />
      <div className="ambient-orb-3 absolute -bottom-28 left-[35%] w-[360px] h-[360px] rounded-full bg-[#3B82F6]/10 blur-[110px]" />

      {/* Subtle Scanning Pulse Line */}
      <div className="ambient-scanline absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/35 to-transparent" />

      {/* Tiny Rising Micro-Nodes / Talent Sparks */}
      {MICRO_NODES.map((node, idx) => (
        <span
          key={idx}
          className={`ambient-particle absolute rounded-full ${node.tone} shadow-[0_0_8px_rgba(139,92,246,0.45)]`}
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
