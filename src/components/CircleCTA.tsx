import { useState, useEffect } from 'react';

type CircleSize = 'sm' | 'md' | 'lg';

// `glass` is the default look (transparent white, subtle border) for
//   sections sitting on dark photographic / brand-dark backgrounds.
// `solid-dark` is a fully opaque dark disc with white border — kept
//   for situations where the disc has to read as a standalone mark
//   over a busy bright photograph.
// `glass-on-light` mirrors `glass` for sections that sit on a light
//   (cream / off-white) background. Text and border become dark so
//   the disc remains legible without losing the airy translucent
//   feel. Used by the Details section after its background was
//   replaced with a flat cream colour.
type CircleVariant = 'glass' | 'solid-dark' | 'glass-on-light';

interface CircleCTAProps {
  text: string;
  onClick?: () => void;
  className?: string;
  delay?: number;
  size?: CircleSize;
  variant?: CircleVariant;
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
  variant = 'glass',
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

  // Variant-spezifisches Styling.
  //   `solid-dark` rendert einen voll gefüllten, fast-schwarzen Disc.
  //   `glass-on-light` ist der Cream-Kontrast: dunkler Border, kaum
  //     sichtbarer Hintergrund, der auf Hover leicht abdunkelt.
  //   `glass` (Default) bleibt der durchscheinende weisse Disc für alle
  //     dunklen Sections.
  // `isLight` wird zusätzlich von Text- und Inner-Ring-Klassen unten
  // gelesen, damit Schrift und Ring auf hellen Backgrounds dunkel
  // werden statt unsichtbar weiss zu bleiben.
  const isLight = variant === 'glass-on-light';

  const variantStyle =
    variant === 'solid-dark'
      ? {
          border: '1px solid rgba(255, 255, 255, 0.85)',
          background: isHovered ? '#161617' : '#0B0B0C',
          boxShadow: isHovered
            ? '0 0 0 1px rgba(255,255,255,0.45), 0 18px 50px -18px rgba(0,0,0,0.75)'
            : '0 10px 36px -14px rgba(0,0,0,0.65)',
        }
      : isLight
      ? {
          // Border ist bewusst sehr leise (≈12 % schwarz). Auf User-
          // Wunsch soll der Disc auf Cream genauso "neutral" und
          // ätherisch wirken wie der weisse Glass-Disc auf den dunklen
          // Sections — kein dicker schwarzer Ring, nur ein Hauch.
          border: '1px solid rgba(11, 11, 12, 0.14)',
          background: isHovered
            ? 'rgba(11, 11, 12, 0.04)'
            : 'rgba(11, 11, 12, 0.015)',
          boxShadow: isHovered
            ? '0 0 0 1px rgba(11,11,12,0.10), 0 14px 40px -18px rgba(11,11,12,0.18)'
            : 'none',
        }
      : {
          border: '1px solid rgba(255, 255, 255, 0.75)',
          background: isHovered
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(255, 255, 255, 0.06)',
          boxShadow: isHovered
            ? '0 0 0 1px rgba(255,255,255,0.35), 0 12px 40px -12px rgba(255,255,255,0.25)'
            : 'none',
        };

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
        ...variantStyle,
      }}
    >
      {/* Inner rotating ring — subtle motion on hover.
          Border-Farbe folgt der Variante: hell auf dunklem
          Background, dunkel auf hellem Background. */}
      <span
        aria-hidden
        className="absolute inset-[6px] rounded-full border transition-transform duration-[1400ms] ease-out"
        style={{
          borderColor: isLight ? 'rgba(11,11,12,0.10)' : 'rgba(255,255,255,0.20)',
          transform: isHovered ? 'rotate(35deg)' : 'rotate(0deg)',
        }}
      />

      {/* Text — Brand-Schrift Allerta Stencil.
          Color wird per Variante gesetzt (white auf dark, brand-dark
          auf light), damit der Disc auf Cream-Backgrounds lesbar
          bleibt. */}
      <span
        className={`
          relative font-stencil text-[13px] md:text-sm uppercase tracking-[0.22em]
          transition-transform duration-500 ease-out
          ${isHovered ? 'translate-y-[-1px]' : 'translate-y-0'}
        `}
        style={{ color: isLight ? '#0B0B0C' : '#FFFFFF' }}
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
          border: `1px solid ${isLight ? 'rgba(11,11,12,0.35)' : '#FFFFFF'}`,
        }}
      />
    </button>
  );
}
