import { useEffect, useRef, useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

/**
 * Hintergrund-Ambient-Sound für das Hotel.
 *
 * Konzept:
 *   Der Track läuft permanent im Hintergrund (autoPlay + muted + loop).
 *   Browser-Policy erlaubt stummen Autoplay ohne Gesture, aber der
 *   Ton selbst darf erst nach der ersten User-Interaktion (Klick, Scroll,
 *   Tastendruck, Touch) aktiviert werden — das ist eine harte Regel,
 *   die wir nicht umgehen können.
 *
 * Flow:
 *   1) Audio-Element mountet, browser startet muted-Playback (unhörbar).
 *   2) Sobald der User irgendetwas auf der Seite macht, wird entmutet.
 *   3) Ab da cyclt der Button: Laut → Leise → Aus → Laut.
 *
 * Audio-Datei:
 *   `/sounds/meditation.mp3` — ruhige Meditations-/Ambient-Spur, der
 *   neue offizielle Sound der Seite. Ersetzt die frühere
 *   Wellenrauschen-Variante (mixkit-small-waves) — auf Wunsch des
 *   Inhabers, damit der Klang enger zur „PAUSE NOW"-Idee passt.
 */

type SoundLevel = 'off' | 'soft' | 'full';

interface AmbientSoundProps {
  variant?: 'dark' | 'light';
  src?: string;
  /**
   * Unauffällige Variante: reines Icon ohne Pille/Label.
   * Fügt sich neben Mikro-Text (z. B. „SCROLL TO EXPLORE") in die Leiste
   * ein, ohne optisch zu konkurrieren.
   */
  subtle?: boolean;
}

const TARGET_VOLUME: Record<SoundLevel, number> = {
  off: 0,
  soft: 0.18,
  full: 0.45,
};

// Drei-Stufen-Cycle: Laut → Leise → Aus → Laut.
// Von 'off' springt der nächste Klick direkt wieder auf 'full' — wer
// stumm ist und den Button erneut drückt, will offensichtlich Ton.
const NEXT_LEVEL: Record<SoundLevel, SoundLevel> = {
  off: 'full',
  full: 'soft',
  soft: 'off',
};

const LABEL: Record<SoundLevel, string> = {
  off: 'Ton',
  soft: 'Leise',
  full: 'Laut',
};

const FADE_DURATION_MS = 420;

export function AmbientSound({
  variant = 'dark',
  src = '/sounds/meditation.mp3',
  subtle = false,
}: AmbientSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  // Lautstärke-Stufe des Audio-Elements.
  //
  // Default 'full': das ist der Ziel-Zustand, SOBALD der Browser
  // die User-Geste registriert hat. Bis dahin läuft das Audio muted
  // im Hintergrund — der User hört nichts, aber die Datei puffert.
  const [level, setLevel] = useState<SoundLevel>('full');
  // Hat der Ton schon mindestens einmal tatsächlich gespielt?
  // Wird verwendet, um den allerersten Klick auf den Button nicht als
  // „weiterschalten" sondern als „anmachen" zu interpretieren — sonst
  // würde der User vom Default-Level 'full' versehentlich auf 'soft'
  // springen, ohne je Ton gehört zu haben.
  const hasStartedRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Fade-Helfer: interpoliert die Lautstärke linear zwischen Start und Ziel.
  const fadeTo = (target: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeRef.current !== null) {
      cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    }

    const start = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / FADE_DURATION_MS);
      audio.volume = start + (target - start) * progress;
      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(step);
      } else {
        fadeRef.current = null;
        onDone?.();
      }
    };

    fadeRef.current = requestAnimationFrame(step);
  };

  // Zentraler "Start"-Helfer.
  //
  // Wird sowohl vom Button-onClick als auch vom Window-Gesture-Listener
  // aufgerufen. Nur beim ersten erfolgreichen Aufruf wird das Audio
  // tatsächlich gestartet; spätere Aufrufe sind No-Ops.
  //
  // Gibt true zurück wenn gestartet wurde (oder schon lief),
  // false wenn der Browser play() abgelehnt hat — dann warten wir auf
  // die nächste Geste.
  const tryStart = (): boolean => {
    const audio = audioRef.current;
    if (!audio) return false;

    audio.muted = false;
    audio.volume = TARGET_VOLUME[level];

    // WICHTIG: Safari (macOS & iOS) entmutet ein bereits-spielendes
    // muted-Element NICHT, wenn wir nur `muted = false` setzen — wir
    // müssen in derselben Event-Loop wie die User-Geste erneut `play()`
    // aufrufen, sonst bleibt der Track lautlos. Chrome/Firefox sind
    // toleranter, aber der doppelte play()-Aufruf ist harmlos für alle
    // anderen Browser und kostet nichts.
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        hasStartedRef.current = true;
      }).catch(() => {
        // Autoplay-Block oder anderer Fehler — wir versuchen es bei der
        // nächsten Geste erneut. hasStartedRef bleibt false.
        audio.muted = true;
      });
    } else {
      hasStartedRef.current = true;
    }
    return true;
  };

  // Reagiert auf Level-Änderungen NACHDEM das Audio mindestens einmal
  // erfolgreich gestartet ist. Davor wäre jede Manipulation von
  // muted/volume entweder nutzlos (User hört nichts) oder würde vom
  // Browser abgewiesen.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!hasStartedRef.current) return;

    const target = TARGET_VOLUME[level];

    if (level === 'off') {
      fadeTo(0, () => {
        audio.muted = true;
      });
      return;
    }

    audio.muted = false;
    fadeTo(target);
  }, [level]);

  // Cleanup: laufenden Fade abbrechen.
  useEffect(() => {
    return () => {
      if (fadeRef.current !== null) {
        cancelAnimationFrame(fadeRef.current);
      }
    };
  }, []);

  // Globale Gesten-Erkennung.
  //
  // Wir lauschen NUR auf Events, die vom Browser als „User-Aktivierung"
  // anerkannt werden (HTML-Spec §sticky-activation):
  //   click, pointerup, touchend, keydown, keyup.
  //
  // BEWUSST NICHT gelauscht wird auf scroll, wheel, mousemove oder
  // pointerdown — diese Events feuern zwar, aber der Browser lehnt
  // anschließende audio.play()-Aufrufe mit Ton trotzdem ab. Das würde
  // nur zu silent-failures führen und den User verwirren.
  //
  // Der Listener bleibt aktiv, bis der Ton tatsächlich läuft. Sollte
  // der erste play()-Versuch vom Browser abgelehnt werden, versucht es
  // die nächste Geste erneut.
  useEffect(() => {
    const events: Array<keyof WindowEventMap> = [
      'click',
      'pointerup',
      'touchend',
      'keydown',
      'keyup',
    ];

    const onGesture = () => {
      if (hasStartedRef.current) {
        removeAll();
        return;
      }
      tryStart();
      if (hasStartedRef.current) removeAll();
    };

    const removeAll = () => {
      for (const evt of events) {
        window.removeEventListener(evt, onGesture as EventListener);
      }
    };

    for (const evt of events) {
      window.addEventListener(evt, onGesture as EventListener, {
        passive: true,
      });
    }

    return removeAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Button-Klick.
  //
  // Wichtig: Der allererste Klick darf NICHT das Level cyclen —
  // sonst springt der Default 'full' beim ersten Klick auf 'soft'
  // und der User hört nur halb so laut, obwohl er Ton anmachen wollte.
  //
  // Erster Klick: Ton anmachen (falls noch nicht gestartet).
  // Jeder weitere Klick: Zwischen Laut / Leise / Aus durchschalten.
  const handleClick = () => {
    setHasInteracted(true);

    if (!hasStartedRef.current) {
      tryStart();
      return;
    }
    setLevel((prev) => NEXT_LEVEL[prev]);
  };

  const Icon = level === 'off' ? VolumeX : level === 'soft' ? Volume1 : Volume2;

  const textColor = variant === 'dark' ? 'text-[#B7B7B7]' : 'text-[#3F3F3F]';
  const borderColor = variant === 'dark' ? 'border-white/20' : 'border-black/15';
  const hoverColor =
    variant === 'dark'
      ? 'hover:text-white hover:border-white'
      : 'hover:text-[#0B0B0C] hover:border-[#0B0B0C]';
  const activeDotColor = variant === 'dark' ? 'bg-white' : 'bg-[#0B0B0C]';

  const isActive = level !== 'off' && hasStartedRef.current;

  // „Noch nie gestartet" heißt: der User hat nie bewusst geklickt und
  // der Browser hat auch nicht automatisch entmutet. In dem Fall pulst
  // der Button dezent, um ihn zu finden — ohne aufdringlich zu sein.
  const needsNudge = !hasStartedRef.current && !hasInteracted;

  return (
    <>
      {/*
        Audio-Element — autoPlay + muted + loop.
        Browser erlauben `autoplay` nur, wenn `muted=true`. Darum startet
        der Track stumm im Hintergrund und puffert sofort die komplette
        MP3. Sobald der User scrollt, klickt oder die Tastatur benutzt,
        wird über `tryStart()` umgeschaltet auf hörbar — in dem Moment
        ist der Sound sofort da, ohne Ladezeit.
      */}
      <audio
        ref={audioRef}
        src={src}
        loop
        autoPlay
        muted
        preload="auto"
        aria-hidden
      />

      {subtle ? (
        // Unauffällige Variante: reines Icon, kein Rahmen, kein Label.
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={isActive}
          aria-label={
            level === 'off'
              ? 'Hintergrund-Sound einschalten'
              : 'Hintergrund-Sound umschalten'
          }
          title={
            hasInteracted
              ? LABEL[level]
              : 'Sound einschalten'
          }
          // min-w/h 44px: WCAG 2.5.5 / Apple HIG-Mindest-Tapfläche.
          // Das sichtbare Icon bleibt klein & dezent, die Klickfläche ist
          // aber groß genug für zuverlässige Treffer auf Touch-Geräten.
          className={`
            group relative inline-flex items-center justify-center
            min-w-[44px] min-h-[44px] -m-2 p-2
            transition-all duration-300
            ${textColor} ${hoverColor.replace(/hover:border-[^\s]+/g, '').trim()}
          `}
        >
          <Icon
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isActive ? 'scale-110' : 'scale-100'
            }`}
            aria-hidden
          />
          {isActive && (
            <span
              aria-hidden
              className="absolute -top-1 -right-1 flex h-1.5 w-1.5"
            >
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${activeDotColor}`}
              />
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${activeDotColor}`}
              />
            </span>
          )}
          {/* Dezenter Halo, solange der User den Ton noch nicht aktiviert
              hat — lenkt den Blick ohne laut zu werden. */}
          {needsNudge && (
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-0 -m-1 rounded-full opacity-50 animate-ping ${activeDotColor}`}
              style={{ animationDuration: '2.4s' }}
            />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={isActive}
          aria-label={
            level === 'off'
              ? 'Hintergrund-Sound einschalten'
              : 'Hintergrund-Sound umschalten'
          }
          title={
            hasInteracted
              ? LABEL[level]
              : 'Sound einschalten'
          }
          className={`
            group relative inline-flex items-center gap-2 px-4 py-2
            rounded-full border transition-all duration-300
            ${borderColor} ${textColor} ${hoverColor}
          `}
        >
          <Icon
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isActive ? 'scale-110' : 'scale-100'
            }`}
            aria-hidden
          />
          <span className="font-stencil text-[11px] uppercase tracking-[0.22em]">
            {LABEL[level]}
          </span>

          {isActive && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex h-2 w-2"
            >
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${activeDotColor}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${activeDotColor}`}
              />
            </span>
          )}
        </button>
      )}
    </>
  );
}
