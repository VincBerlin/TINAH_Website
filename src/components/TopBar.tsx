import { useState, useEffect, useRef } from 'react';
import { AmbientSound } from './AmbientSound';

interface TopBarProps {
  variant?: 'dark' | 'light';
  rightLabel?: string;
}

/**
 * Sticky top navigation.
 *
 * Behavior:
 * - Fades in after initial load.
 * - HIDES while the user scrolls DOWN (so long-form content is never covered).
 * - SHOWS when the user scrolls UP.
 * - Always visible at the very top of the page (scrollY < 80).
 * - Applies a translucent backdrop once the page has been scrolled past the hero band.
 */
export function TopBar({ variant = 'dark', rightLabel = 'SCROLL TO EXPLORE' }: TopBarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Initial fade-in
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll direction detection with rAF throttling
  useEffect(() => {
    const SHOW_AT_TOP_PX = 80;
    const DIRECTION_DELTA = 6; // ignore micro-jitters
    const BACKDROP_AFTER_PX = 120;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        setHasScrolled(currentY > BACKDROP_AFTER_PX);

        if (currentY <= SHOW_AT_TOP_PX) {
          setIsHidden(false);
        } else if (delta > DIRECTION_DELTA) {
          // scrolling DOWN → hide
          setIsHidden(true);
        } else if (delta < -DIRECTION_DELTA) {
          // scrolling UP → show
          setIsHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = variant === 'dark' ? 'text-[#B7B7B7]' : 'text-[#3F3F3F]';
  const borderColor = variant === 'dark' ? 'border-white/20' : 'border-black/15';
  const hoverColor =
    variant === 'dark'
      ? 'hover:text-white hover:border-white'
      : 'hover:text-[#0B0B0C] hover:border-[#0B0B0C]';

  // Kein schwarzer Balken im gescrollten Zustand — Navigation bleibt
  // durchgehend transparent, damit sie sich in das Hero/Content-Bild einfügt.
  const bgClass = 'bg-transparent';
  // hasScrolled wird aktuell nicht als Trigger genutzt, aber für spätere
  // Anpassungen (z. B. Text-Kontrast-Verstärkung) weiter getrackt.
  void hasScrolled;

  // Combine: hidden on scroll-down, mount fade-in, visible otherwise
  const visibilityClasses = !isMounted
    ? 'opacity-0 -translate-y-3'
    : isHidden
      ? 'opacity-0 -translate-y-full pointer-events-none'
      : 'opacity-100 translate-y-0';

  return (
    <header
      role="banner"
      aria-label="Hauptnavigation"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out will-change-transform ${bgClass} ${visibilityClasses}`}
      // Notch-/Dynamic-Island-Safe-Area: ziehe Safe-Insets als Padding
      // oben und seitlich rein, damit die Nav-Zeile auf iPhones nie
      // unter die Kamera rutscht und im Landscape-Mode nicht vom
      // Rand abgeschnitten wird.
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Micro Labels Row */}
      <div className="px-[4vw] pt-[3vh] flex justify-between items-center">
        <span
          className={`font-stencil text-[12px] uppercase tracking-[0.22em] ${textColor}`}
          aria-label="This Is Not A Hotel"
        >
          THIS IS NOT A HOTEL<sup className="text-[0.85em] align-top ml-[0.2em] tracking-normal">™</sup>
        </span>
        {/* Rechts: „SCROLL TO EXPLORE"-Mikro-Zeile + dezenter Sound-Toggle
            direkt daneben. Der Sound-Button ist klein, randlos und in
            derselben Farbfamilie wie das Label — so fügt er sich ein,
            ohne optisch zu konkurrieren. Meeresrauschen & sanftes
            Vogelgezwitscher passen zur Brand-Idee: Ruhe, Balance, Natur
            am Meer. */}
        <div className="flex items-center gap-3">
          <span className={`font-stencil text-[11px] uppercase tracking-[0.22em] ${textColor}`}>
            {rightLabel}
          </span>
          <span
            aria-hidden
            className={`h-3 w-px ${variant === 'dark' ? 'bg-white/20' : 'bg-black/15'}`}
          />
          <AmbientSound variant={variant} subtle />
        </div>
      </div>

      {/* Navigation Pills Row */}
      <nav aria-label="Primär" className="px-[4vw] pt-4 pb-4">
        {/* Drei-Spalten-Grid statt flex-justify-between:
            garantiert, dass der mittlere PAUSE-Button EXAKT auf der
            horizontalen Mittelachse liegt — unabhängig von den
            unterschiedlichen Textbreiten von PLAY (4) und LOCATION (8). */}
        <div className="grid grid-cols-3 items-center h-11">
          <button
            type="button"
            className={`justify-self-start px-5 py-2 text-xs font-stencil uppercase tracking-[0.22em] transition-all duration-300 rounded-full border ${borderColor} ${textColor} ${hoverColor}`}
          >
            PLAY
          </button>

          <button
            type="button"
            className={`justify-self-center px-5 py-2 text-xs font-stencil uppercase tracking-[0.22em] transition-all duration-300 rounded-full border ${borderColor} ${textColor} ${hoverColor}`}
          >
            PAUSE
          </button>

          <button
            type="button"
            className={`justify-self-end px-5 py-2 text-xs font-stencil uppercase tracking-[0.22em] transition-all duration-300 rounded-full border ${borderColor} ${textColor} ${hoverColor}`}
            onClick={() => {
              const el = document.getElementById('location');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            LOCATION
          </button>
        </div>

        {/* Trennlinie entfernt — Leiste soll visuell „nicht da" sein. */}
      </nav>
    </header>
  );
}
