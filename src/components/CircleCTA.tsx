import { useState, useEffect } from 'react';

type CircleSize = 'xs' | 'sm' | 'md' | 'lg';

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

// Hinweis 2026-04-26 (User-Request „Button unter dem Hotelnamen ist
// zu groß"): Es gibt jetzt einen `xs`-Slot, der signifikant kleiner
// ist als `sm` und unter dem H1-Stack im Hero-Layout den Wortmark in
// den Vordergrund stellt — der CTA stört die Lesbarkeit der Marke
// nicht mehr. Darüber hinaus wurden alle anderen Slots beibehalten,
// damit Location/Rooms/Experience/Details die ursprüngliche Optik
// behalten.
const SIZE_MAP: Record<CircleSize, string> = {
  xs: 'clamp(78px, 9vw, 118px)',
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

  // ===========================================================
  // Hover-Animation 2026-04-26 (User-Request „Buttons sollen sich
  // wieder bewegen wenn man mit dem Cursor draufgeht"):
  //   - Scale wurde von 1.06 auf 1.10 erhöht — der „Pop" auf Hover
  //     ist jetzt sichtbar, ohne kindisch zu wirken.
  //   - translateY von -0.5 auf -6 (Tailwind ≈ -6 px) erhöht —
  //     der Disc hebt sich spürbar vom Untergrund ab.
  //   - Inner-Ring rotiert jetzt 60° statt 35° → mehr Drehung,
  //     erkennbar als organische Mini-Animation.
  //   - Zusätzlich: Idle-„Breathing" über CSS-Keyframe (siehe
  //     index.css, Klasse `cta-breathe`) — ein extrem leichter
  //     Scale-Puls (0.995 ↔ 1.005) im 7-Sekunden-Loop, wenn der
  //     Button NICHT gehovert wird. So wirken die Discs lebendig
  //     statt statisch — auch wenn niemand draufgeht.
  //   - Easing-Dauer auf Hover wurde von 1600 ms auf 700 ms
  //     gesenkt; 1.6 s war für den Hover-Reflex zu träge.
  // ===========================================================
  const hoverTransform =
    isVisible && isHovered ? 'scale(1.10) translateY(-6px)' : '';

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
        will-change-transform
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${isVisible && !isHovered ? 'cta-breathe' : ''}
        ${className}
      `}
      style={{
        width: dimension,
        height: dimension,
        // Inline-Transform NUR auf Hover setzen — sonst übernimmt
        // entweder die `cta-breathe`-Keyframe-Animation (idle, sichtbar)
        // oder gar kein Transform (während des Entrance-Fades, wo nur
        // Opacity animiert wird, damit es keinen Konflikt gibt).
        transform: hoverTransform || undefined,
        transition:
          'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 1600ms cubic-bezier(0.22, 1, 0.36, 1), background 400ms ease, box-shadow 400ms ease',
        ...variantStyle,
      }}
    >
      {/* Inner rotating ring — subtle motion on hover.
          Border-Farbe folgt der Variante: hell auf dunklem
          Background, dunkel auf hellem Background.
          Drehung 2026-04-26 von 35° → 60° verstärkt. */}
      <span
        aria-hidden
        className="absolute inset-[6px] rounded-full border ease-out"
        style={{
          borderColor: isLight ? 'rgba(11,11,12,0.10)' : 'rgba(255,255,255,0.20)',
          transform: isHovered ? 'rotate(60deg)' : 'rotate(0deg)',
          transition: 'transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* Text — Brand-Schrift Allerta Stencil.
          Color wird per Variante gesetzt (white auf dark, brand-dark
          auf light), damit der Disc auf Cream-Backgrounds lesbar
          bleibt. Translate-Y auf Hover von -1px auf -2px erhöht —
          fühlt sich „mit dem Disc verbunden" an. */}
      <span
        className={`
          relative font-stencil text-[13px] md:text-sm uppercase tracking-[0.22em]
          transition-transform duration-500 ease-out
          ${isHovered ? 'translate-y-[-2px]' : 'translate-y-0'}
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
