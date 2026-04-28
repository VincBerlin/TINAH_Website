import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Rituals section — § IV "The Day, Roughly".
 *
 * Sits between Experience (House Principles) and Details (Play /
 * Pause). Both neighbours are cream sections, so this extends the
 * page's single bright pause without a hard light/dark switch.
 *
 * Layout (matches the preview "TINAH Full Site Preview.html"):
 *   - 12-col grid
 *     • Left col 1–4 (sticky on desktop): eyebrow marker, display
 *       headline ("A day, loosely shaped."), intro paragraph.
 *     • Right col 6–12: 7 ritual rows. Each row = number slot,
 *       title (Stencil) + italic body, right-aligned time stamp.
 *     • Hairlines between rows.
 *   - Mobile: left column loses sticky, columns stack.
 *
 * Typography:
 *   - Allerta Stencil — H3 + section marker
 *   - DM Serif Display italic — display-headline accent
 *   - EB Garamond italic — ritual body copy
 *   - IBM Plex Mono (font-mono) — numbers + times in ochre / ink-soft
 *
 * Entrance: slide-in from left/right, opacity-faded with the rest
 * of the section via useSectionProgress.entrance.
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
  const { ref } = useSectionProgress<HTMLElement>();

  // -----------------------------------------------------------------
  // Fahrstuhl-Pattern für die linke Headline (Native CSS Sticky)
  // -----------------------------------------------------------------
  // User-Request 2026-04-27 Iteration 3:
  //   „beim scrollen fackelt der text … erstelle es mehr fließend".
  //
  // Vorherige JS-Versionen (setState-basiert UND direct-DOM-write)
  // liefen alle im Main-Thread und konnten daher nie 1:1 mit dem
  // Compositor-Scroll synchron sein → spürbares Hängen / Flackern.
  //
  // Korrekte Lösung: `position: sticky` auf der linken Spalte. Das
  // läuft komplett auf dem Compositor-Thread, frame-perfect synchron
  // mit dem Browser-Scroll, ohne irgendeinen JS-Eingriff.
  //
  // Vorbedingung dafür war ein Fix in `index.css`: body hatte
  // `overflow-x: hidden`, was den body laut CSS-Spec implizit zu
  // einem Scroll-Container macht — alle Sticky-Elemente fanden
  // dann body als Scroll-Anker statt html. Geändert auf
  // `overflow-x: clip` (kein Scroll-Container), seitdem funktioniert
  // sticky korrekt.
  //
  // Funktionsweise:
  //   • Linke Spalte mit `md:sticky md:top-[14vh]`.
  //   • Bei Default-Grid-Stretch (kein self-start) füllt die Zelle
  //     die volle Row-Höhe (= Höhe der rechten Spalte mit allen
  //     Ritualen). Sticky-Range = ganze Section.
  //   • Browser kümmert sich um alles: klebt am 14vh-Linie, fährt
  //     mit dem Scroll mit, stoppt am Section-Ende.
  //
  //   Mobile (< md): kein sticky-Modifier → Spalten stacken normal.

  return (
    <section
      ref={ref}
      id="rituals"
      data-nav-theme="light"
      className="relative w-screen min-h-screen-safe overflow-x-clip"
      style={{ zIndex: 45, backgroundColor: '#F2EDE4' }}
      aria-label="Rituals — A day, loosely shaped at This Is Not A Hotel, Mawella"
    >
      <h2 className="sr-only">
        A day, loosely shaped — daily rituals at This Is Not A Hotel, Mawella Beach.
      </h2>

      <div
        className="relative z-10 mx-auto max-w-[1400px] px-[6vw] py-[12vh] md:py-[14vh]"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-[6vh] md:gap-x-[3vw]">
          {/* LEFT — Native CSS Sticky.
              `md:sticky md:top-[14vh]` auf der Spalte selbst, kein
              JS, kein Transform. Browser macht alles auf dem
              Compositor-Thread → frame-perfect synchron mit Scroll. */}
          <div className="md:col-span-4 md:sticky md:top-[14vh] md:self-start">
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

            {/*
              Brand-Voice 2026-04-26 (User-Request): Headline komplett
              in Allerta Stencil. Der Italic-Serif-Akzent auf
              „loosely shaped." wurde entfernt — Allerta Stencil ist
              laut Brand-Guideline die einzige Headline-Schrift. Der
              visuelle Akzent kommt jetzt aus der Ochre/Terracotta-
              Farbe (#B84A1F) auf der zweiten Zeile.
            */}
            <p
              className="m-0 select-text font-stencil"
              style={{
                color: INK,
                fontSize: 'clamp(30px, 4.6vw, 68px)',
                lineHeight: 1.0,
                letterSpacing: '0.02em',
                maxWidth: '10ch',
              }}
            >
              A day,{' '}
              <span style={{ color: OCHRE }}>loosely shaped.</span>
            </p>

            <p
              className="mt-[3vh] text-[clamp(13px,1vw,16px)] leading-snug max-w-[32ch]"
              style={{ color: INK_SOFT }}
            >
              Nothing is scheduled. Everything just tends to happen. Join in,
              or don&apos;t — the house runs on its own time.
            </p>
          </div>

          {/* RIGHT — Ritual-Liste, komplett starr.
              User-Request 2026-04-27: „der rechte text bleibt. kein
              farbverlauf, keine bewegung. starr." Keine Transform,
              keine Opacity-Animation, keine Transition — die Liste
              steht still, während die linke Sticky-Spalte mit dem
              Scroll mitläuft. */}
          <div
            className="md:col-start-6 md:col-span-7 flex flex-col"
          >
            {RITUALS.map((r, i) => (
              <article
                key={r.n}
                className="grid items-baseline py-[4.5vh]"
                style={{
                  gridTemplateColumns: '52px 1fr auto',
                  columnGap: '24px',
                  borderTop: `1px solid ${RULE}`,
                  borderBottom:
                    i === RITUALS.length - 1
                      ? `1px solid ${RULE}`
                      : 'none',
                  minHeight: '18vh',
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
