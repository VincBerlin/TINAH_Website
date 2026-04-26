import { useState } from 'react';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Details section — § V "Play / Pause".
 *
 * 1:1 visuelle Übernahme aus „TINAH Full Site Preview.html" (.details).
 * Typografischer Splitscreen: zwei Hälften, getrennt durch eine feine
 * vertikale Hairline mit pulsierendem Mittelpunkt. Die linke Seite
 * (PLAY) ist getaktet — Stencil + IBM Plex Mono mit Uhrzeiten —, die
 * rechte (PAUSE) folgt der gleichen Stencil-Setzung, aber mit weichen
 * Zeitangaben statt harter Uhrzeiten.
 *
 * Interaktion:
 *   - Klick auf den Mittelpunkt togglet die aktive Seite
 *     (both → l → r → both).
 *   - Klick auf eine Hälfte (außerhalb der Activity-Rows) togglet
 *     ebenfalls.
 *   - Inaktive Seite fadet auf 28% Opazität.
 *
 * Layout:
 *   - 1fr · 1px · 1fr Grid, voll-bleed.
 *   - Linke Hälfte rechtsbündig, rechte linksbündig — Symmetrie zur
 *     Mittellinie.
 *   - Mobile: stapelt vertikal, Hairline wird horizontal.
 *
 * Entrance: opacity-fade entlang useSectionProgress.entrance.
 */

const INK = '#1C1B17';
const INK_SOFT = '#5A5448';
const OCHRE = '#B84A1F';

interface Activity {
  time: string;
  label: string;
}

const PLAY: Activity[] = [
  { time: '06:30', label: 'Surf' },
  { time: '08:00', label: 'Run' },
  { time: '11:00', label: 'Swim' },
  { time: '14:00', label: 'Co-Work' },
];

const PAUSE: Activity[] = [
  { time: 'sunrise', label: 'Yoga' },
  { time: 'anytime', label: 'Meditation' },
  { time: 'all day', label: 'On the sand' },
  { time: 'always', label: 'Nothing at all' },
];

type Mode = 'both' | 'l' | 'r';

export function Details() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  const contentOpacity = entrance - exit * 0.75;
  const [mode, setMode] = useState<Mode>('both');

  const cycleMode = () =>
    setMode((m) => (m === 'both' ? 'l' : m === 'l' ? 'r' : 'both'));

  const toggleSide = (side: 'l' | 'r') =>
    setMode((m) => (m === side ? 'both' : side));

  const dimL = mode === 'r';
  const dimR = mode === 'l';

  return (
    <section
      ref={ref}
      id="details"
      className="relative w-screen min-h-screen-safe overflow-hidden"
      style={{ zIndex: 50, backgroundColor: '#F1E9D7' }}
      aria-label="Play or Pause — daily rhythm at This Is Not A Hotel"
    >
      <h2 className="sr-only">Play or Pause — choose your rhythm.</h2>

      <div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 z-10 font-mono"
        style={{
          opacity: contentOpacity,
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: INK_SOFT,
        }}
      >
        § V — Play / Pause
      </div>

      <div
        className="relative grid items-center min-h-screen"
        style={{
          gridTemplateColumns: '1fr 1px 1fr',
          opacity: contentOpacity,
        }}
      >
        {/* LEFT — PLAY */}
        <div
          onClick={() => toggleSide('l')}
          className="text-right cursor-pointer transition-opacity duration-500"
          style={{
            padding: '0 clamp(40px, 7vw, 120px)',
            opacity: dimL ? 0.28 : 1,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: OCHRE,
              marginBottom: 24,
            }}
          >
            Move · 01
          </div>
          <div
            className="font-stencil"
            style={{
              fontSize: 'clamp(64px, 10vw, 160px)',
              lineHeight: 0.9,
              letterSpacing: '0.02em',
              color: INK,
              textTransform: 'uppercase',
            }}
          >
            Play
          </div>
          <div
            className="mt-[5vh] flex flex-col items-end"
            style={{ gap: 14 }}
          >
            {PLAY.map((a) => (
              <div
                key={a.label}
                className="inline-flex items-baseline transition-transform duration-300 hover:-translate-x-1.5"
                style={{ gap: 18 }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.14em',
                    color: INK_SOFT,
                    minWidth: 56,
                  }}
                >
                  {a.time}
                </span>
                <span
                  className="font-stencil"
                  style={{
                    fontSize: 'clamp(18px, 1.7vw, 24px)',
                    letterSpacing: '0.18em',
                    color: INK,
                    textTransform: 'uppercase',
                  }}
                >
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — hairline + breathing dot */}
        <div
          className="self-center justify-self-center relative"
          style={{
            width: 1,
            height: '62vh',
            background: INK,
            opacity: 0.18,
          }}
        >
          <button
            type="button"
            onClick={cycleMode}
            aria-label="Toggle Play / Pause focus"
            className="absolute left-1/2 top-1/2 cursor-pointer"
            style={{
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: INK,
              border: 'none',
              padding: 0,
              animation: 'tinah-breathe 3.6s ease-in-out infinite',
            }}
          />
        </div>

        {/* RIGHT — PAUSE */}
        <div
          onClick={() => toggleSide('r')}
          className="text-left cursor-pointer transition-opacity duration-500"
          style={{
            padding: '0 clamp(40px, 7vw, 120px)',
            opacity: dimR ? 0.28 : 1,
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: INK_SOFT,
              marginBottom: 24,
            }}
          >
            Rest · 02
          </div>
          <div
            className="font-stencil"
            style={{
              fontSize: 'clamp(64px, 10vw, 160px)',
              lineHeight: 0.9,
              letterSpacing: '0.02em',
              color: INK,
              textTransform: 'uppercase',
            }}
          >
            Pause
          </div>
          <div className="mt-[5vh] flex flex-col" style={{ gap: 14 }}>
            {PAUSE.map((a) => (
              <div
                key={a.label}
                className="inline-flex items-baseline transition-transform duration-300 hover:translate-x-1.5"
                style={{ gap: 18, flexDirection: 'row-reverse' }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    color: INK_SOFT,
                  }}
                >
                  {a.time}
                </span>
                <span
                  className="font-stencil"
                  style={{
                    fontSize: 'clamp(18px, 1.7vw, 24px)',
                    letterSpacing: '0.18em',
                    color: INK,
                    textTransform: 'uppercase',
                  }}
                >
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 font-mono"
        style={{
          fontSize: 10,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: INK_SOFT,
          opacity: 0.6,
        }}
      >
        Tap the dot · choose your side
      </div>

      <style>{`
        @keyframes tinah-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50%      { transform: translate(-50%, -50%) scale(1.6); opacity: 0.55; }
        }
        @media (max-width: 760px) {
          #details > div.grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr 1px 1fr !important;
          }
          #details > div.grid > div:nth-child(1),
          #details > div.grid > div:nth-child(3) {
            text-align: center !important;
            padding: 6vh 8vw !important;
          }
        }
      `}</style>
    </section>
  );
}
