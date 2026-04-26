import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Experience / "House Principles" section.
 *
 * Layout-Refactor 2026-04-26:
 *   - Headline-Stack ersetzt durch typografisches LETTER-GRID (Kästchen).
 *     Jeder Großbuchstabe sitzt in einem 1×1-Kasten mit Hairline-Border;
 *     darüber links steht der gleiche Buchstabe in IBM Plex Mono (klein,
 *     lowercase) — das Wechselspiel aus Stencil + Mono erinnert an alte
 *     Schreibmaschinenraster und macht "NO TELEVISIONS / NO LOBBY /
 *     NO LITTLE CHOCOLATES" zu einer eigenständigen visuellen Marke.
 *   - 20 Spalten breites Grid (immer fix), Reihen mit "filled" und
 *     leeren Zellen, dadurch entsteht das absichtsvolle "Lückenmuster".
 *   - Layout-Slots:
 *       • Links 8/12: Marker + Letter-Grid
 *       • Mitte  2/12: leer (Atemraum)
 *       • Rechts 2/12: EXPLORE-Disc-CTA (oben) + Body-Text (darunter)
 *   - Mobile: Grid-Cells werden kleiner über clamp(), 3-Spalten-Layout
 *     stackt zu einer Spalte; Disc-CTA rutscht unter das Letter-Grid.
 *   - Italic-Serif-Akzent ist hier nicht mehr nötig, weil das Grid-
 *     Statement (NO ... NO ... NO ...) eigene Ästhetik trägt.
 */

interface Cell {
  ch?: string;
}

// Letter-Reihe als Array von Cells. Jeder Eintrag mit `ch` ist ein
// gefüllter Kasten, jeder leere ein Spacer. Insgesamt 20 Cells pro Reihe.
const CELL = (ch: string): Cell => ({ ch });
const GAP: Cell = {};

const ROW1: Cell[] = [
  CELL('N'), CELL('O'), GAP,
  CELL('T'), CELL('E'), CELL('L'), CELL('E'), CELL('V'), CELL('I'), CELL('S'), CELL('I'), CELL('O'), CELL('N'),
  GAP, GAP, GAP, GAP, GAP, GAP, GAP,
];
const ROW2: Cell[] = [
  CELL('N'), CELL('O'), GAP,
  CELL('L'), CELL('O'), CELL('B'), CELL('B'), CELL('Y'),
  GAP, GAP, GAP, GAP, GAP, GAP, GAP, GAP, GAP, GAP, GAP, GAP,
];
const ROW3: Cell[] = [
  CELL('N'), CELL('O'), GAP,
  CELL('L'), CELL('I'), CELL('T'), CELL('T'), CELL('L'), CELL('E'), GAP,
  CELL('C'), CELL('H'), CELL('O'), CELL('C'), CELL('O'), CELL('L'), CELL('A'), CELL('T'), CELL('E'), CELL('S'),
];

const INK = '#1C1B17';
const RULE = 'rgba(28, 27, 23, 0.18)';

function LetterCell({ cell }: { cell: Cell }) {
  if (!cell.ch) {
    // Spacer.
    return <div style={{ aspectRatio: '1 / 1' }} />;
  }
  const lower = cell.ch.toLowerCase();
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        border: `1px solid ${RULE}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '8%',
          left: '12%',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.34em',
          color: INK,
          opacity: 0.55,
          lineHeight: 1,
          textTransform: 'lowercase',
        }}
      >
        {lower}
      </span>
      <span
        style={{
          fontFamily: '"Allerta Stencil", sans-serif',
          fontSize: '1em',
          color: INK,
          lineHeight: 1,
          textTransform: 'uppercase',
        }}
      >
        {cell.ch}
      </span>
    </div>
  );
}

export function Experience() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  const contentOpacity = entrance - exit * 0.75;

  const remaining = 1 - entrance;
  const leftShiftX = `${-remaining * 6}vw`;
  const rightShiftX = `${remaining * 6}vw`;

  const groupEntranceOpacity = Math.min(1, entrance * 1.4);

  return (
    <section
      ref={ref}
      id="experience"
      className="relative w-screen min-h-screen-safe overflow-x-clip"
      style={{ zIndex: 40, backgroundColor: '#F2EDE4' }}
      aria-label="House Principles — Rituals at This Is Not A Hotel, Mawella"
    >
      {/* Cream-Hintergrund. */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#F2EDE4' }}
        aria-hidden
      />

      {/* SR-only headline für SEO/Accessibility. */}
      <h2 className="sr-only">
        House Principles — no televisions, no lobby, no little chocolates.
      </h2>

      <div
        className="relative z-10 mx-auto max-w-[1500px] px-[6vw] py-[8vh] md:py-[10vh]"
        style={{ opacity: contentOpacity }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-[5vh] md:gap-x-[3vw] items-center">
          {/* ============================================================
              LINKS — Marker + Letter-Grid (col-span 8)
              ============================================================ */}
          <div
            className="md:col-span-8"
            style={{
              opacity: groupEntranceOpacity,
              transform: `translateX(${leftShiftX})`,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            <div className="flex items-center gap-3 mb-[5vh]">
              <span
                aria-hidden
                className="inline-block h-px w-6"
                style={{ backgroundColor: INK }}
              />
              <span
                className="font-stencil text-[10px] uppercase tracking-[0.28em]"
                style={{ color: INK }}
              >
                § III — House Principles
              </span>
            </div>

            <p className="sr-only">No television. No lobby. No little chocolates.</p>

            {/* 20-col Letter-Grid. fontSize über clamp steuert Zellgrösse. */}
            <div
              role="presentation"
              aria-hidden="true"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(20, minmax(0, 1fr))',
                gap: 0,
                fontSize: 'clamp(13px, 1.85vw, 28px)',
                lineHeight: 1,
                width: '100%',
              }}
            >
              {[...ROW1, ...ROW2, ...ROW3].map((cell, i) => (
                <LetterCell key={i} cell={cell} />
              ))}
            </div>
          </div>

          {/* ============================================================
              RECHTS — EXPLORE Disc + Body (col-span 4)
              ============================================================ */}
          <div
            className="md:col-span-4 flex flex-col items-start md:items-end gap-[4vh]"
            style={{
              opacity: groupEntranceOpacity,
              transform: `translateX(${rightShiftX})`,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            <div className="flex-shrink-0">
              <CircleCTA
                text="EXPLORE"
                variant="glass-on-light"
                onClick={() => {
                  const element = document.querySelector('#rituals');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
            <div className="max-w-[320px] md:text-right" style={{ color: INK }}>
              <p
                className="m-0 font-stencil uppercase"
                style={{
                  fontSize: 'clamp(14px, 1.3vw, 20px)',
                  letterSpacing: '0.06em',
                  lineHeight: 1.2,
                }}
              >
                An experience,
                <br />
                not a booking.
              </p>
              <p
                className="m-0 mt-[2em] text-[clamp(11px,0.85vw,13px)] leading-snug"
                style={{ color: INK }}
              >
                We&apos;ve removed the friction: no front-desk queues, no
                surprise fees — just a calm arrival and a quiet stay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
</content>
</invoke>
<invoke name="str_replace_edit">
<parameter name="path">src/sections/Rituals.tsx