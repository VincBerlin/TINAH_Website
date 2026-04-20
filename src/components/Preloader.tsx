import { useState, useEffect } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

/**
 * Preloader / Entry Gate.
 *
 * Zwei Phasen:
 *   1) „loading" — initiale 1.8s mit Dot-Pulse + Loading-Line. Nichts,
 *      womit der User interagieren kann. Er soll nur ankommen.
 *   2) „ready" — die Einladung erscheint: „PRESS ENTER OR TAP TO ENTER".
 *      Jetzt wartet die Seite auf eine echte User-Geste.
 *
 * Warum eine Entry-Geste?
 *   Browser erlauben Audio mit Ton nur NACH einer User-Aktivierung
 *   (click / touchend / keydown). Statt den User hinter dem Preloader
 *   passiv in die Seite zu werfen und dann separat nach Tonerlaubnis zu
 *   fragen, bündeln wir beides: der Eintritt IST die Geste. Der Ton
 *   startet im selben Moment, in dem die Seite sichtbar wird — genau
 *   wie beim Öffnen einer Tür zum Meer.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  type Phase = 'loading' | 'ready' | 'fading';
  const [phase, setPhase] = useState<Phase>('loading');

  // Nach 1.8s ist die Loading-Line durch — wir schalten auf „ready".
  useEffect(() => {
    const readyTimer = setTimeout(() => setPhase('ready'), 1800);
    return () => clearTimeout(readyTimer);
  }, []);

  // Auf Geste des Users warten, sobald wir in der „ready"-Phase sind.
  useEffect(() => {
    if (phase !== 'ready') return;

    const handleGesture = (event: Event) => {
      // Keydown: nur Enter, Space oder Escape zählen — damit
      // Tastaturnavigation (Tab zum Fokusieren) die Seite nicht
      // versehentlich öffnet.
      if (event.type === 'keydown') {
        const key = (event as KeyboardEvent).key;
        if (key !== 'Enter' && key !== ' ' && key !== 'Escape') return;
      }

      setPhase('fading');
    };

    // Diese Events sind alle in der HTML-Spec als „user activation"
    // gelistet. D.h. der anschließende audio.play()-Aufruf in
    // AmbientSound wird vom Browser akzeptiert.
    // Passive listeners: wir verhindern kein Default-Scrolling, also darf
    // der Browser die Touch-/Scroll-Pipeline parallel laufen lassen → kein
    // Ruckeln auf Mobile beim ersten Tap.
    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('touchend', handleGesture, { passive: true });
    window.addEventListener('keydown', handleGesture);

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchend', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [phase]);

  // Fade out dauert 700ms, dann ist der Preloader weg.
  useEffect(() => {
    if (phase !== 'fading') return;
    const completeTimer = setTimeout(() => onComplete(), 700);
    return () => clearTimeout(completeTimer);
  }, [phase, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0B0B0C] flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
      // Preloader soll selbst klickbar sein — wenn der User irgendwo
      // in die schwarze Fläche klickt, zählt das als Entry-Geste.
      role="button"
      tabIndex={0}
      aria-label="Webseite betreten"
    >
      {/* Logo dot */}
      <div
        className="mb-8"
        style={{
          animation: 'preloader-fade-in 0.8s ease-out forwards',
        }}
      >
        <div
          className="w-4 h-4 rounded-full bg-white"
          style={{
            animation: 'dot-pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Brand Name */}
      <div
        className="text-center"
        style={{
          animation: 'preloader-fade-in 0.8s ease-out 0.2s forwards',
          opacity: 0,
        }}
      >
        <p
          className="font-stencil text-2xl md:text-3xl text-white tracking-[0.12em] mb-2"
          aria-label="This Is Not A Hotel"
        >
          THIS IS NOT A HOTEL<sup className="text-[0.55em] align-top ml-[0.15em] tracking-normal">™</sup>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#B7B7B7]">
          On the Coast
        </p>
      </div>

      {/* Loading Line — läuft in Phase 1. */}
      <div className="mt-10 w-40 h-px bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white"
          style={{
            animation: 'loading-line 1.8s ease-in-out forwards',
          }}
        />
      </div>

      {/*
        Entry-Einladung. Wird erst in der „ready"-Phase sichtbar,
        faded dann sanft ein. Minimalistisch: ein einziger Textzug.
      */}
      <div
        className={`mt-10 flex flex-col items-center transition-opacity duration-700 ${
          phase === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden={phase !== 'ready'}
      >
        <span className="font-stencil text-[11px] uppercase tracking-[0.32em] text-[#B7B7B7]">
          Tap to enter
        </span>
        {/* Kleiner pulsierender Hinweis-Dot darunter als visueller Anker. */}
        <span
          aria-hidden
          className="mt-3 inline-flex h-1.5 w-1.5 relative"
        >
          <span
            className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping"
            style={{ animationDuration: '2.2s' }}
          />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
      </div>

      <style>{`
        @keyframes preloader-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dot-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.35);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 20px 4px rgba(255, 255, 255, 0.22);
          }
        }

        @keyframes loading-line {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
