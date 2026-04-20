import { useState, useEffect } from 'react';

type CircleSize = 'sm' | 'md' | 'lg';

interface CircleCTAProps {
  text: string;
  onClick?: () => void;
  className?: string;
  delay?: number;
  size?: CircleSize;
}

const SIZE_MAP: Record<CircleSize, string> = {
  sm: 'clamp(110px, 13vw, 170px)',
  md: 'clamp(140px, 16vw, 210px)',
  lg: 'clamp(170px, 20vw, 260px)',
};

export function CircleCTA({
  text,
  onClick,
  className = '',
  delay = 0,
  size = 'lg',
}: CircleCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => {
      clearTimeout(visibilityTimer);
    };
  }, [delay]);

  const dimension = SIZE_MAP[size];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label={text}
      className={`
        group relative flex items-center justify-center rounded-full cursor-pointer
        transition-all duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.94]'}
        ${isVisible && isHovered ? 'scale-[1.06] -translate-y-0.5' : ''}
        ${className}
      `}
      style={{
        width: dimension,
        height: dimension,
        border: '1px solid rgba(255, 255, 255, 0.75)',
        background: isHovered
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(255, 255, 255, 0.06)',
        boxShadow: isHovered
          ? '0 0 0 1px rgba(255,255,255,0.35), 0 12px 40px -12px rgba(255,255,255,0.25)'
          : 'none',
      }}
    >
      {/* Inner rotating ring — subtle motion on hover */}
      <span
        aria-hidden
        className="absolute inset-[6px] rounded-full border border-white/20 transition-transform duration-[1400ms] ease-out"
        style={{
          transform: isHovered ? 'rotate(35deg)' : 'rotate(0deg)',
        }}
      />

      {/* Text — Brand-Schrift Allerta Stencil */}
      <span
        className={`
          relative font-stencil text-[13px] md:text-sm uppercase tracking-[0.22em] text-white
          transition-transform duration-500 ease-out
          ${isHovered ? 'translate-y-[-1px]' : 'translate-y-0'}
        `}
      >
        {text}
      </span>

      {/* Hover ring highlight */}
      <span
        aria-hidden
        className={`
          absolute inset-0 rounded-full pointer-events-none
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          border: '1px solid #FFFFFF',
        }}
      />
    </button>
  );
}
