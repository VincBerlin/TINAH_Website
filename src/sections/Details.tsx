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

// Inhalts-Update 2026-04-29 (User-Request, Screenshot-Vorlage):
// PLAY-Seite läuft jetzt ebenfalls auf weichen Zeit-Labels statt
// auf harten Uhrzeiten — symmetrisch zur PAUSE-Seite. „Sunrise SURF"
// statt „06:30 SURF" liest sich als rhythmische Anweisung, nicht als
// Stundenplan. PAUSE-Seite mit kleinen Anpassungen: Meditation auf
// „always", Strand-Zeile auf „at the beach".
const PLAY: Activity[] = [
  { time: 'sunrise', label: 'Surf' },
  { time: 'always', label: 'Run' },
  { time: 'all day', label: 'Swim' },
  { time: 'always', label: 'Co-Work' },
];

const PAUSE: Activity[] = [
  { time: 'sunrise', label: 'Yoga' },
  { time: 'always', label: 'Meditation' },
  { time: 'all day', label: 'At the beach' },
  { time: 'always', label: 'Nothing at all' },
];

// Refactor 2026-04-29 (User-Request: „bei play/pause seite keine
// anklickbaren module oder animationen"). Der Mode-State, die
// toggle-Logik (cycleMode/toggleSide), die dim-Animation und der
// pulsierende Center-Button sind komplett raus. Die Section ist jetzt
// rein typografisch — zwei Stencil-Säulen, Hairline dazwischen, fertig.

export function Details() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  // Selbe Fade-Konvention wie Rooms.tsx + Testimonial.tsx, damit die
  // gesamte Landing-Page denselben Scroll-Rhythmus teilt.
  const contentOpacity = Math.max(0.2, entrance - exit * 0.35);

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
        {/* LEFT — PLAY (rein typografisch, keine Interaktion) */}
        <div
          className="text-right"
          style={{
            padding: '0 clamp(40px, 7vw, 120px)',
            opacity: Math.max(0, contentOpacity),
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
              // Schrift-Verkleinerung 2026-04-29 (User-Request: „etwas
              // verkleine play und pause schrift"). Vorher
              // clamp(64px, 10vw, 160px) — das wirkte auf Desktop fast
              // wie ein Plakat-Titel. Jetzt ~80% davon, immer noch
              // dominant aber lässt der „Move · 01" / „Rest · 02"
              // Eyebrow-Zeile mehr Atmen-Raum drüber.
              fontSize: 'clamp(52px, 8vw, 128px)',
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
                className="inline-flex items-baseline"
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

        {/* CENTER — Hairline + statischer Punkt (keine Interaktion,
            keine Animation, User-Request 2026-04-29). Der Punkt sitzt
            mittig auf der Hairline als rein dekorativer Fokus, hat
            kein cursor-pointer und kein onClick mehr. */}
        <div
          className="self-center justify-self-center relative"
          style={{
            width: 1,
            height: '62vh',
            background: INK,
            opacity: 0.18,
          }}
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2"
            style={{
              transform: 'translate(-50%, -50%)',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: INK,
              opacity: 0.55,
            }}
          />
        </div>

        {/* RIGHT — PAUSE (rein typografisch, keine Interaktion) */}
        <div
          className="text-left"
          style={{
            padding: '0 clamp(40px, 7vw, 120px)',
            opacity: Math.max(0, contentOpacity),
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
              // Schrift-Verkleinerung 2026-04-29 (User-Request: „etwas
              // verkleine play und pause schrift"). Vorher
              // clamp(64px, 10vw, 160px) — das wirkte auf Desktop fast
              // wie ein Plakat-Titel. Jetzt ~80% davon, immer noch
              // dominant aber lässt der „Move · 01" / „Rest · 02"
              // Eyebrow-Zeile mehr Atmen-Raum drüber.
              fontSize: 'clamp(52px, 8vw, 128px)',
              lineHeight: 0.9,
              letterSpacing: '0.02em',
              color: INK,
              textTransform: 'uppercase',
            }}
          >
            Pause
          </div>
          {/*
            Layout-Symmetrie 2026-04-29 (User-Request: „verschiebe die
            unterpunkte ebenfalls nach links spiegelnd von play
            unterpunkten").

            Vorher: `flex flex-col` ohne items-Alignment → Items
            stretchten auf cross-axis full-width, mit `row-reverse`
            innen wurden ihre Children dadurch rechts-bündig. Die
            time-Labels „sunrise / always / all day / always"
            endeten alle an einer rechten Achse — symmetrisch zur
            falschen Seite, also doppelt rechts-bündig wie PLAY.

            Jetzt: `items-start` macht die Items LEFT-aligned (kein
            cross-axis stretch mehr). Mit weiterhin `row-reverse`
            innen ist die Inner-Reihenfolge label → time visuell, die
            label-Wörter („YOGA / MEDITATION / AT THE BEACH / NOTHING
            AT ALL") richten sich an einer linken Achse aus, time-
            Labels sitzen rechts daneben. Damit ist die PAUSE-Spalte
            zur PLAY-Spalte (`items-end`) sauber gespiegelt.
          */}
          <div
            className="mt-[5vh] flex flex-col items-start"
            style={{ gap: 14 }}
          >
            {PAUSE.map((a) => (
              <div
                key={a.label}
                className="inline-flex items-baseline"
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

      {/* „Tap the dot · choose your side" Hinweis entfernt
          2026-04-29 (User-Request: keine anklickbaren Module mehr).
          Ohne klickbaren Center-Dot ist der Hinweis bedeutungslos. */}

      {/* Bottom soft fade back into the dark sections that follow. */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B0B0C]/35 to-transparent pointer-events-none" />

      <style>{`
        /* tinah-breathe Keyframes entfernt 2026-04-29 — der zentrale
           Punkt ist jetzt statisch (User-Request: keine Animationen). */
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
