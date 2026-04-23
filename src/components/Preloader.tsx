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

  // „Tap to enter" erscheint genau dann, wenn die Welle rechts
  // angekommen ist. Die Reveal-Animation der Welle dauert 2.0s
  // (0.2s Fade-in + 1.8s Sweep nach rechts). Danach laeuft die
  // Sinus-Schwingung als Dauerloop permanent weiter.
  useEffect(() => {
    const readyTimer = setTimeout(() => setPhase('ready'), 2000);
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
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#B7B7B7]">
          Play&nbsp;<span className="text-white/40">|</span>&nbsp;Pause
        </p>
      </div>

      {/*
        Loading-Line: Welle bewegt sich kontinuierlich nach rechts
        UND schiebt sich von links nach rechts ins Bild.

        Per User-Request 2026-04-23: die Welle soll sich bewegen
        wie zuvor (kontinuierliche Sinus-Schwingung, die nach
        rechts laeuft), aber sie soll von links nach rechts rein-
        kommen — also nicht sofort voll da sein, sondern sich wie
        ein Progress-Bar von links heranreichen.

        Zwei-Ebenen-Aufbau:
          1) INNEN — der Path selbst. Ein langer Sinus-Pfad
             (x = -120 bis x = 360, 4 volle Perioden) shiftet per
             translateX endlos um +120 px. 120 px = eine volle
             Periode, also sieht das Muster nach jedem Loop
             identisch aus → nahtlose Wanderung nach rechts.
          2) AUSSEN — ein Container mit clip-path inset von
             rechts. Der Clip wandert von 100% (nichts sichtbar)
             auf 0% (komplett sichtbar). Das sieht aus, als
             schoebe sich die Welle von links nach rechts ins
             Bild. Nach vollstaendigem Reveal kurzer Halt, dann
             Fade-out und Reset — der naechste Cycle beginnt
             wieder von links.

        Dadurch entstehen beide Effekte gleichzeitig:
        Wellenbewegung nach rechts + progressive Enthuellung von
        links nach rechts.

        Reduced-Motion: statisch, voll sichtbar.
      */}
      <div className="mt-10 w-[260px] overflow-hidden" aria-hidden>
        <div className="preloader-wave-reveal">
          <svg
            viewBox="0 0 240 40"
            width="260"
            height="40"
            className="block"
            preserveAspectRatio="none"
            role="presentation"
          >
            <path
              d="M -120 20
                 C -105 8, -75 8, -60 20
                 C -45 32, -15 32, 0 20
                 C 15 8, 45 8, 60 20
                 C 75 32, 105 32, 120 20
                 C 135 8, 165 8, 180 20
                 C 195 32, 225 32, 240 20
                 C 255 8, 285 8, 300 20
                 C 315 32, 345 32, 360 20"
              fill="none"
              stroke="#B84A1F"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="preloader-wave"
            />
          </svg>
        </div>
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

        /*
          Innere Ebene — die Welle wandert nahtlos nach rechts.
          Der Path ist 480 px lang (4 volle Perioden); pro Loop
          shiftet er um exakt 120 px = EINE volle Periode. Weil
          Sinus nach einer Periode identisch aussieht, gibt es
          keinen sichtbaren Bruch am Loop-Ende. 6s linear =
          gleichmaessige Geschwindigkeit.
        */
        .preloader-wave {
          animation: wave-travel 6s linear infinite;
          will-change: transform;
        }

        @keyframes wave-travel {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(120px);
          }
        }

        /*
          Aeussere Ebene — einmaliger Progress-Bar-Reveal.
          clip-path inset(0 X% 0 0) schneidet den Reveal-Container
          von rechts an. X wandert EINMAL von 100% (nichts sichtbar)
          auf 0% (alles sichtbar) — die Welle schiebt sich von
          links nach rechts ins Bild. Am Ende bleibt die Welle
          voll sichtbar stehen (forwards), damit die darunter
          liegende Sinus-Schwingung anschliessend dauerhaft
          durchlaeuft, ohne nochmal von links zu starten.
        */
        .preloader-wave-reveal {
          clip-path: inset(0 100% 0 0);
          opacity: 0;
          animation: wave-reveal 2s ease-out forwards;
          will-change: clip-path, opacity;
        }

        @keyframes wave-reveal {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
          }
          10% {
            clip-path: inset(0 100% 0 0);
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .preloader-wave,
          .preloader-wave-reveal {
            animation: none;
            clip-path: none;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
