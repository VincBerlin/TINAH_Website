import { useState } from 'react';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Details section — § IV "Play / Pause".
 * Section-Renumbering 2026-04-28: § V → § IV (siehe Rituals.tsx).
 *
 * Replaces the previous two-pill version with a typographic
 * splitscreen (1:1 from the preview "TINAH Full Site Preview.html"
 * → .details). Two halves of the section, separated by a thin
 * vertical hairline with a breathing center dot. The split makes
 * the brand's play-vs-pause duality the entire visual idea —
 * instead of two buttons floating in space.
 *
 *   - LEFT  · PLAY  — Stencil + IBM Plex Mono with hard times:
 *       06:30 SURF · 08:00 RUN · 11:00 SWIM · 14:00 CO-WORK
 *   - RIGHT · PAUSE — same Stencil setting (no italic, per user
 *     2026-04-25), with soft time labels:
 *       sunrise YOGA · anytime MEDITATION · all day ON THE SAND ·
 *       always NOTHING AT ALL
 *
 * Interaction:
 *   - Click the breathing center dot → toggles which side is
 *     "active" (both → l → r → both). Inactive side fades to 28%.
 *   - Click an entire half (outside an activity row) → toggles
 *     focus to that half.
 *
 * Layout:
 *   - 1fr · 1px · 1fr grid, full-bleed. Left half right-aligned,
 *     right half left-aligned — symmetry around the hairline.
 *   - Mobile (≤760px): stacks vertically, hairline becomes a
 *     horizontal rule, each half becomes center-aligned.
 *
 * SEO:
 *   - The two side labels carry the Play / Pause keywords as real
 *     text nodes. Each activity (surf/run/swim/co-work, yoga/
 *     meditation/sand/nothing) is a discrete uppercase term —
 *     Google tokenises them as separate concepts on the page.
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
  // Selbe Fade-Konvention wie Rooms.tsx + Testimonial.tsx, damit die
  // gesamte Landing-Page denselben Scroll-Rhythmus teilt
  // (User-Request 2026-04-26: „passe die dynamik auf jeder section
  // auf der landing page gleichmäßig an").
  // Exit-Fade abgemildert (User-Request 2026-04-28: „kein Text darf
  // verschwinden beim Scrollen"). Vorher: 0.75 — Text war beim
  // Verlassen praktisch komplett weg, bevor die nächste Section da
  // war. Jetzt: 0.35 mit Floor 0.2 → Text bleibt lesbar bis zur
  // Section-Grenze.
  const contentOpacity = Math.max(0.2, entrance - exit * 0.35);
  // Entrance-Slide + Exit-Drift für die zwei Hälften.
  // PLAY (links) kommt von links rein, driftet beim Verlassen weiter
  // nach links; PAUSE (rechts) spiegelverkehrt. Identisches Pattern
  // wie Rooms (`translateX(-exit * 12vw)` für die Headline).
  const remaining = 1 - entrance;
  const playShiftX = `${-remaining * 14 - exit * 10}vw`;
  const pauseShiftX = `${remaining * 14 + exit * 10}vw`;
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
      data-nav-theme="light"
      className="relative w-screen min-h-screen-safe overflow-hidden"
      style={{ zIndex: 50, backgroundColor: '#F1E9D7' }}
      aria-label="Play or Pause — daily rhythm at This Is Not A Hotel, Mawella, southern Sri Lanka"
    >
      <h2 className="sr-only">Play or Pause — choose your rhythm.</h2>

      {/* Top fade-in from the previous (also cream) section.
          Kept identical to the previous Details.tsx so the seam
          between Rituals and Details still reads smooth. */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0B0B0C]/15 to-transparent pointer-events-none z-10" />

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
        § IV — Play / Pause
      </div>

      <div
        className="relative grid items-center min-h-screen-safe"
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
            // dim-state und entrance-Opazität multipliziert: bleibt
            // dim-Logik erhalten und folgt zusätzlich dem Scroll-Fade
            // der Section.
            opacity: (dimL ? 0.28 : 1) * Math.max(0, contentOpacity),
            transform: `translateX(${playShiftX})`,
            willChange: 'transform, opacity',
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
            // dim-state und entrance-Opazität multipliziert: bleibt
            // dim-Logik erhalten und folgt zusätzlich dem Scroll-Fade
            // der Section.
            opacity: (dimR ? 0.28 : 1) * Math.max(0, contentOpacity),
            transform: `translateX(${pauseShiftX})`,
            willChange: 'transform, opacity',
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

      {/* Bottom soft fade back into the dark sections that follow. */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B0B0C]/35 to-transparent pointer-events-none" />

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
          #details > div.grid > div:nth-child(1) > div:last-child {
            align-items: center !important;
          }
        }
      `}</style>
    </section>
  );
}
