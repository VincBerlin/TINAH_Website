import { useState, useEffect, useRef } from 'react';
import { Home } from 'lucide-react';
import { AmbientSound } from './AmbientSound';

interface TopBarProps {
  variant?: 'dark' | 'light';
}

/**
 * Sticky top navigation.
 *
 * Behavior (per user request 2026-04-21):
 *   • Full TopBar is visible ONLY when the user is at the very top of
 *     the page (scrollY ≤ 80). This is the Hero view.
 *   • As soon as the user scrolls away from the top, the full bar is
 *     GONE — it does NOT re-appear on scroll-up.
 *   • Instead, a small, unobtrusive Home button appears at the top
 *     when the user is scrolling UP past the hero. Clicking it jumps
 *     back to the very first page (scroll to top, smooth).
 *   • When the user scrolls DOWN, even the Home button hides, so
 *     content is never covered.
 *
 * Rationale:
 *   The full TopBar is a "landing" element — it sets the tone in the
 *   Hero. Once the visitor is exploring deeper sections, we don't want
 *   to reintroduce a heavy nav strip every time they scroll up. A
 *   single tiny Home affordance is enough to return to the entry.
 */
export function TopBar({ variant = 'dark' }: TopBarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [showHomeButton, setShowHomeButton] = useState(false);
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
          // At the very top → full bar shown, Home button hidden
          setIsAtTop(true);
          setShowHomeButton(false);
        } else {
          setIsAtTop(false);
          if (delta > DIRECTION_DELTA) {
            // scrolling DOWN → hide Home button
            setShowHomeButton(false);
          } else if (delta < -DIRECTION_DELTA) {
            // scrolling UP → show the small Home button (not the full bar)
            setShowHomeButton(true);
          }
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const textColor = variant === 'dark' ? 'text-[#B7B7B7]' : 'text-[#3F3F3F]';

  // Kein schwarzer Balken im gescrollten Zustand — Navigation bleibt
  // durchgehend transparent, damit sie sich in das Hero/Content-Bild einfügt.
  const bgClass = 'bg-transparent';
  // hasScrolled wird aktuell nicht als Trigger genutzt, aber für spätere
  // Anpassungen (z. B. Text-Kontrast-Verstärkung) weiter getrackt.
  void hasScrolled;

  // The full TopBar is now only visible at the very top of the page.
  // Once the user scrolls past the hero, the bar fades up and out and
  // never returns — a compact Home button (rendered further below)
  // takes over.
  const visibilityClasses = !isMounted
    ? 'opacity-0 -translate-y-3'
    : isAtTop
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 -translate-y-full pointer-events-none';

  return (
    <>
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
      {/*
        Single Micro-Bar Row (per User-Request 2026-04-23 — refactor
        nach Inspirations-Layout):

          [LINKS]                [MITTE]              [RECHTS]
          EST. MMXXV    ·         TINAH · MAWELLA      ROOMS  RITUALS  BOOK
          MAWELLA 06°04'N

        Drei-Spalten-Grid statt der alten Zwei-Zeilen-Konstruktion:
          - Linke Spalte: zwei Mikro-Labels nebeneinander
            (Gründungsjahr römisch + GPS-Koordinaten) — sie zitieren
            klassisches Hotel-Branding ("Est. 2025") und verankern den
            Ort gleichzeitig per Koordinate für SEO.
          - Mittlere Spalte: Wortmarke "TINAH · MAWELLA". Mittiger
            Brand-Anker, ersetzt das alte rechts-bündige
            "SCROLL TO EXPLORE"-Label und das links-bündige "THIS IS
            NOT A HOTEL™".
          - Rechte Spalte: drei Nav-Items als reine Stencil-Texte
            (keine Pills mehr) — ROOMS, RITUALS, BOOK. Klick scrollt
            zur jeweiligen Sektion. PLAY, PAUSE und LOCATION sind
            entfernt (User-Request 2026-04-23).

        Die zweite Pills-Zeile darunter ist komplett gestrichen.
      */}
      {/*
        Layout-Refactor 2026-04-23:
          - "TINAH · MAWELLA" Mittel-Spalte entfernt (User-Request).
          - "EST. MMXXV" durch den Hotel-Namen ersetzt (Hotel-Name
            soll im Vordergrund stehen, nicht das Gründungsjahr).
          - Rechtes Nav-Item "BOOK" → "PAUSE".
          Das verbleibende Mawella-GPS-Label bleibt — es trägt SEO
          und bewahrt das Hotel-Brand-Manifest-Detail.
      */}
      <div className="px-[4vw] pt-[3vh] pb-4 grid grid-cols-3 items-center">
        {/* Linke Spalte — Hotel-Name + Koordinaten. */}
        <div className="justify-self-start flex items-center gap-[2vw]">
          <span
            className={`font-stencil text-[11px] uppercase tracking-[0.22em] ${textColor}`}
            aria-label="This Is Not A Hotel"
          >
            THIS&nbsp;IS&nbsp;NOT&nbsp;A&nbsp;HOTEL<sup className="text-[0.75em] align-top ml-[0.15em] tracking-normal">™</sup>
          </span>
          <span
            className={`font-stencil text-[11px] uppercase tracking-[0.22em] ${textColor}`}
            aria-label="Mawella, latitude 06 degrees 04 minutes north"
          >
            MAWELLA 06°04&apos;N
          </span>
        </div>

        {/* Mittlere Spalte — bewusst leer. */}
        <span aria-hidden className="justify-self-center" />

        {/* Rechte Spalte — Navigation. */}
        <nav
          aria-label="Primär"
          className="justify-self-end flex items-center gap-[2.4vw]"
        >
          <button
            type="button"
            className={`font-stencil text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${textColor} ${
              variant === 'dark' ? 'hover:text-white' : 'hover:text-[#0B0B0C]'
            }`}
            onClick={() => {
              const el = document.getElementById('rooms');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            ROOMS
          </button>
          <button
            type="button"
            className={`font-stencil text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${textColor} ${
              variant === 'dark' ? 'hover:text-white' : 'hover:text-[#0B0B0C]'
            }`}
            onClick={() => {
              // "Rituals" entspricht inhaltlich der Experience-Sektion
              // (Yoga, Meditation, Aktivitäten). Wir scrollen daher zu
              // #experience — einzig möglicher passender Anker.
              const el = document.getElementById('experience');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            RITUALS
          </button>
          <button
            type="button"
            className={`font-stencil text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${textColor} ${
              variant === 'dark' ? 'hover:text-white' : 'hover:text-[#0B0B0C]'
            }`}
            onClick={() => {
              const el = document.getElementById('book');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            PAUSE
          </button>
        </nav>
      </div>
    </header>

    {/*
      Compact Home button — replaces the full TopBar everywhere
      except the very top of the page.
      - Hidden at the top of the page (the full bar is there instead).
      - Hidden while scrolling DOWN (no visual noise over content).
      - Appears as soon as the user scrolls UP past the hero.
      - Click → smooth scroll to the very top (Hero).

      Visually: tiny circular pill, dark glass, center-top, safe-area
      aware. Deliberately low-contrast so it stays out of the way.
    */}
    <button
      type="button"
      onClick={handleHomeClick}
      aria-label="Zurück zur Startseite"
      className={`
        fixed z-[100] left-1/2 -translate-x-1/2
        h-9 w-9 rounded-full
        flex items-center justify-center
        border border-white/20 bg-[#0B0B0C]/55 backdrop-blur-md
        text-[#D9D9D9] hover:text-white hover:border-white/70
        transition-all duration-500 ease-out will-change-transform
        ${
          isMounted && showHomeButton
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        }
      `}
      style={{
        top: 'calc(env(safe-area-inset-top) + 14px)',
      }}
    >
      <Home className="w-4 h-4" aria-hidden />
    </button>

    {/*
      Floating Ambient-Sound-Toggle — IMMER sichtbar.
      Anders als die TopBar oder der Home-Button: dieser Button
      bleibt beim Scrollen permanent oben rechts verankert, damit der
      User jederzeit zwischen Laut / Leise / Aus umschalten kann.

      Positionierung:
      - fixed top-right, Safe-Area-aware (Notch, Landscape).
      - Dezent dunkles Glas mit Border, damit das Icon auf jedem
        Hintergrund (Meerbild, Palmenbild, Testimonial, Footer)
        einen eigenen optischen Halt hat.
      - z-[100] gleich wie TopBar, damit er niemals überdeckt wird.
    */}
    <div
      className={`fixed z-[100] right-4 transition-opacity duration-500 ease-out ${
        isMounted ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        top: 'calc(env(safe-area-inset-top) + 10px)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="flex items-center justify-center rounded-full border border-white/20 bg-[#0B0B0C]/55 backdrop-blur-md h-9 w-9 text-[#D9D9D9] hover:text-white hover:border-white/70 transition-colors">
        <AmbientSound variant={variant} subtle />
      </div>
    </div>
    </>
  );
}
