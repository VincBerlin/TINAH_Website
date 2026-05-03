import { useEffect, useRef, useState } from 'react';
import { AmbientSound } from './AmbientSound';

/**
 * Persistenter AmbientSound-Toggle, der auf Top-Level der App lebt.
 *
 * Architektur-Refactor 2026-04-29 (User-Request: „die musik darf nicht
 * unterbrochen werden sobald man die seite wechselt"):
 *
 * Vorher saß der Toggle im TopBar-Component, das nur auf der Startseite
 * gemountet wurde. Beim Routenwechsel auf /location oder /rooms wurde
 * die TopBar (und damit das `<audio>`-Element) komplett unmountet —
 * das laufende Meeresrauschen brach abrupt ab. Beim Zurückwechseln
 * fing es bei 0:00 wieder an.
 *
 * Jetzt wird `<PersistentAmbientSound />` einmalig im App-Root gemountet,
 * VOR allen Conditional-Renders der Routen. Der React Tree behält die
 * Component zwischen Routenwechseln bei → das `<audio>`-Element wird
 * nie unmountet → die Wiedergabe läuft kontinuierlich durch, egal ob
 * der User auf Startseite, /location oder /rooms ist.
 *
 * Die Theme-Probe für die Schrift-/Icon-Farbe läuft lokal, identisch
 * zum Pattern in TopBar.tsx — der Floating-Toggle sitzt fixed top-right
 * und probet die Section direkt unter sich, damit das Icon auch auf
 * cream-Sections lesbar bleibt.
 */

const PROBE_Y = 36;
type NavTheme = 'dark' | 'light';

function detectThemeAtX(x: number): NavTheme {
  if (typeof document === 'undefined') return 'dark';
  const stack = document.elementsFromPoint(x, PROBE_Y);
  for (const el of stack) {
    // Header und unseren eigenen Wrapper überspringen — wir wollen
    // wissen, was inhaltlich UNTER dem Toggle liegt.
    if ((el as HTMLElement).closest('header[role="banner"]')) continue;
    if ((el as HTMLElement).closest('[data-persistent-sound]')) continue;
    const themed = (el as HTMLElement).closest('[data-nav-theme]');
    if (themed) {
      const theme = themed.getAttribute('data-nav-theme');
      if (theme === 'light' || theme === 'dark') return theme;
    }
  }
  return 'dark';
}

export function PersistentAmbientSound() {
  const [theme, setTheme] = useState<NavTheme>('dark');
  const [isMounted, setIsMounted] = useState(false);
  const ticking = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initial fade-in nach Mount, damit der Toggle zusammen mit dem
  // Hero-Content erscheint und nicht abrupt aufpoppt.
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      if (!wrapperRef.current) return;
      const r = wrapperRef.current.getBoundingClientRect();
      const newTheme = detectThemeAtX(r.left + r.width / 2);
      setTheme((prev) => (prev === newTheme ? prev : newTheme));
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    // Initial Sync nach Mount + minimaler Delay, damit Layout steht.
    const initTimer = setTimeout(update, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-persistent-sound
      className={`fixed z-[100] right-4 transition-opacity duration-500 ease-out ${
        isMounted ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        top: 'calc(env(safe-area-inset-top) + 10px)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="flex items-center justify-center h-9 w-9 text-[#D9D9D9] hover:text-white transition-colors">
        <AmbientSound variant={theme} subtle />
      </div>
    </div>
  );
}
