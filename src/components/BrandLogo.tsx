import React, { useId } from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-10 h-10' }) => {
  const uid = useId().replace(/:/g, '');
  const bgGradId = `hsBgGrad-${uid}`;
  const sheenGradId = `hsSheen-${uid}`;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="HireSwift AI Logo"
    >
      <defs>
        <linearGradient id={bgGradId} x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="52%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id={sheenGradId} x1="4" y1="4" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Rounded Emblem Base */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill={`url(#${bgGradId})`} />
      <rect x="2.6" y="2.6" width="34.8" height="34.8" rx="9.4" stroke={`url(#${sheenGradId})`} strokeWidth="1.2" />

      {/* Candidate Node + Left "H" Pillar */}
      <circle cx="11.5" cy="11.5" r="2.3" fill="#FFFFFF" />
      <path d="M11.5 16.5V28.5" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />

      {/* Right "H" Pillar */}
      <path d="M27.5 19.5V28.5" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />

      {/* Swift Checkmark / Match Velocity Crossbar */}
      <path
        d="M11.5 22.5L17.5 19.2L21 22.4L27.8 14.5"
        stroke="#E0E7FF"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* AI Precision Sparkle crowning the upward match trajectory */}
      <path
        d="M28.5 7.5L29.6 10.4L32.5 11.5L29.6 12.6L28.5 15.5L27.4 12.6L24.5 11.5L27.4 10.4L28.5 7.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
};
