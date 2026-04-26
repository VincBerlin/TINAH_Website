import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Rituals section — § IV "The Day, Roughly".
 *
 * 1:1 inhaltliche & typografische Übernahme aus der Inspirations-
 * Datei (tinh/index.html → .rituals). Visuell an die übrigen Creme-
 * Sektionen (Location, Experience) angeglichen:
 *   - Hintergrund #F2EDE4 (Cream-Pause der Seite)
 *   - Allerta Stencil für H3 + Section-Marker
 *   - EB Garamond Italic für die Beschreibungstexte
 *   - JetBrains-Mono-Look (font-mono, IBM Plex Mono in unserem Stack)
 *     für Nummern + Uhrzeiten in Ochre #B84A1F
 *
 * Layout:
 *   - 12-Spalten-Grid wie im Original
 *     • Links (col 1–4, sticky): Eyebrow + Display-Headline + Intro-
 *       Absatz. Bleibt beim Scrollen stehen, während die Rituale
 *       rechts vorbeiwandern.
 *     • Rechts (col 6–12): 7 Ritual-Reihen, jede mit Nummer-Slot,
 *       Mittelblock (Titel + italic Beschreibung), rechtsbündige
 *       Uhrzeit. Hairline-Trenner zwischen den Reihen.
 *   - Mobile: linke Spalte verliert sticky, beide Spalten stapeln.
 *
 * Entrance:
 *   - Linke Spalte slide-in von links, rechte Spalte slide-in von
 *     rechts — synchron zu useSectionProgress.entrance, identisches
 *     Easing wie Location/Experience.
 */

interface Ritual {
  n: string;
  title: string;
  body: string;
  time: string;
}

const RITUALS: Ritual[] = [
  {
    n: '01',
    title: 'Sunrise on the sand.',
    body:
      'The dogs wake you before the sun does. Good coffee appears without being asked for.',
    time: '06:12',
  },
  {
    n: '02',
    title: 'Breakfast, long.',
    body:
      'Curd and kithul honey, egg hoppers, papaya, pol roti, whatever the garden gave up that morning.',
    time: '08:30',
  },
  {
    n: '03',
    title: 'Swim, nap, repeat.',
    body:
      'The sea is calm until two. After that the current takes over. Read the flag on the post.',
    time: '11:00',
  },
  {
    n: '04',
    title: 'Curry, at the long table.',
    body:
      'Five curries and a rice. Served late, eaten slower. Seconds expected, thirds tolerated.',
    time: '13:30',
  },
  {
    n: '05',
    title: 'A walk to the headland.',
    body:
      'Forty minutes out, forty minutes back. There is a temple. There is a goat. That is all.',
    time: '17:00',
  },
  {
    n: '06',
    title: 'Arrack sour on the verandah.',
    body:
      "Made badly, on purpose. The recipe is on a chalkboard in the kitchen if you'd like to help.",
    time: '19:00',
  },
  {
    n: '07',
    title: 'Dinner, candles, arguments.',
    body:
      "Seafood if the boats came in. Jackfruit if they didn't. Always both, if you ask Sunil nicely.",
    time: '20:45',
  },
];

const INK = '#1C1B17';
const INK_SOFT = '#5A5448';
const OCHRE = '#B84A1F';
const RULE = 'rgba(28, 27, 23, 0.18)';

export function Rituals() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  const contentOpacity = entrance - exit * 0.75;
  const remaining = 1 - entrance;
  const groupEntranceOpacity = Math.min(1, entrance * 1.4);

  return (
    <section
      ref={ref}
      id="rituals"
      className="relative w-screen min-h-screen-safe overflow-hidden"
      style={{ zIndex: 45, backgroundColor: '#F2EDE4' }}
      aria-label="Rituals — A day, loosely shaped at This Is Not A Hotel, Mawella"
    >
      <h2 className="sr-only">
        A day, loosely shaped — daily rituals at This Is Not A Hotel, Mawella Beach.
      </h2>

      <div
        className="relative z-10 mx-auto max-w-[1400px] px-[6vw] py-[12vh] md:py-[14vh]"
        style={{ opacity: contentOpacity }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-[6vh] md:gap-x-[3vw]">
          {/* LEFT — sticky intro column. */}
          <div
            className="md:col-span-4 md:sticky md:top-[14vh] md:self-start"
            style={{
              opacity: groupEntranceOpacity,
              transform: `translateX(${-remaining * 6}vw)`,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            <div className="flex items-center gap-3 mb-[3vh]">
              <span
                aria-hidden
                className="inline-block h-px w-6"
                style={{ backgroundColor: INK }}
              />
              <span
                className="font-stencil text-[10px] uppercase tracking-[0.28em]"
                style={{ color: INK }}
              >
                § IV — The Day, Roughly
              </span>
            </div>

            <p
              className="m-0 select-text"
              style={{
                color: INK,
                fontSize: 'clamp(30px, 4.6vw, 68px)',
                lineHeight: 1.0,
                letterSpacing: '-0.005em',
                maxWidth: '10ch',
              }}
            >
              <span className="font-stencil" style={{ letterSpacing: '0.02em' }}>
                A day,
              </span>{' '}
              <span
                className="font-serif-display italic"
                style={{ fontStyle: 'italic' }}
              >
                loosely shaped.
              </span>
            </p>

            <p
              className="mt-[3vh] text-[clamp(13px,1vw,16px)] leading-snug max-w-[32ch]"
              style={{ color: INK_SOFT }}
            >
              Nothing is scheduled. Everything just tends to happen. Join in,
              or don&apos;t — the house runs on its own time.
            </p>
          </div>

          {/* RIGHT — list of rituals. */}
          <div
            className="md:col-start-6 md:col-span-7 flex flex-col"
            style={{
              opacity: groupEntranceOpacity,
              transform: `translateX(${remaining * 6}vw)`,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            {RITUALS.map((r, i) => (
              <article
                key={r.n}
                className="grid items-baseline py-[2.2vh] md:py-[2.8vh]"
                style={{
                  gridTemplateColumns: '52px 1fr auto',
                  columnGap: '24px',
                  borderTop: `1px solid ${RULE}`,
                  borderBottom:
                    i === RITUALS.length - 1
                      ? `1px solid ${RULE}`
                      : 'none',
                }}
              >
                <span
                  className="font-mono text-[12px] uppercase"
                  style={{ color: OCHRE, letterSpacing: '0.1em' }}
                >
                  {r.n}
                </span>
                <div>
                  <h3
                    className="font-stencil m-0"
                    style={{
                      fontSize: 'clamp(20px, 2.2vw, 30px)',
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      lineHeight: 1.15,
                      color: INK,
                    }}
                  >
                    {r.title}
                  </h3>
                  <p
                    className="font-serif-body italic m-0"
                    style={{
                      marginTop: 6,
                      fontSize: 'clamp(13px, 1vw, 16px)',
                      lineHeight: 1.5,
                      color: INK_SOFT,
                      maxWidth: '44ch',
                    }}
                  >
                    {r.body}
                  </p>
                </div>
                <span
                  className="font-mono text-[11px] uppercase justify-self-end"
                  style={{ color: INK_SOFT, letterSpacing: '0.1em' }}
                >
                  {r.time}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
