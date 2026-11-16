import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hireswiftLogoGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="55%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#hireswiftLogoGrad)" />
      <path
        d="M14 14.5C14 12.567 15.567 11 17.5 11C19.433 11 21 12.567 21 14.5C21 16.433 19.433 18 17.5 18C15.567 18 14 16.433 14 14.5Z"
        stroke="white"
        strokeWidth="2.2"
      />
      <path
        d="M19 25.5C19 23.567 20.567 22 22.5 22C24.433 22 26 23.567 26 25.5C26 27.433 24.433 29 22.5 29C20.567 29 19 27.433 19 25.5Z"
        stroke="white"
        strokeWidth="2.2"
      />
      <path d="M19.8 17.2L20.5 22.6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M27.5 11.5L28.5 14L31 15L28.5 16L27.5 18.5L26.5 16L24 15L26.5 14L27.5 11.5Z" fill="#E2DFFF" />
    </svg>
  );
};
