import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Experience / "House Principles" section.
 *
 * Layout-Refactor 2026-04-24 (User-Request):
 *   - Hintergrund von Dunkel-Foto auf Creme (#F2EDE4) umgestellt,
 *     um die gleiche editoriale Sprache wie die Location-Section zu
 *     sprechen (vgl. Inspirations-Bild § III — HOUSE PRINCIPLES).
 *   - Drei-Spalten-Grid 4/4/4 analog zu Location:
 *       • Links: Section-Marker „§ III — House Principles" + grosser
 *         Stencil/Italic-Serif-Headline-Stack:
 *             NO TELEVISIONS.
 *             NO LOBBY.
 *             no turn-down service, no       (italic Serif, terracotta)
 *             LITTLE CHOCOLATES.
 *       • Mitte: runder EXPLORE-Button (bleibt wie vom User gewünscht,
 *         jetzt in `glass-on-light` für Creme-Lesbarkeit).
 *       • Rechts: Bodytext „An experience, not a booking." +
 *         Kurz-Absatz, angepasst an Creme-Kontrast.
 *   - Richtungsgebundene Einblendung beim Scrollen (synchron zu
 *     useSectionProgress.entrance):
 *       • Linker Headline-Stack slide-in von links (−6 vw → 0)
 *       • Mittiger Button slide-in von unten (+6 vh → 0)
 *       • Rechte Body-Spalte slide-in von rechts (+6 vw → 0)
 *   - Höhe bleibt `h-screen-safe` → identisch zu anderen Sektionen.
 *   - Italic-Serif-Akzent in warmem Terracotta (#A84A2C) wie im
 *     Inspirations-Bild, um den Mix Stencil × Serif-Italic optisch zu
 *     erden.
 */
export function Experience() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  const contentOpacity = entrance - exit * 0.75;

  const remaining = 1 - entrance;
  const leftShiftX = `${-remaining * 6}vw`;
  const rightShiftX = `${remaining * 6}vw`;
  const buttonShiftY = `${remaining * 6}vh`;

  const groupEntranceOpacity = Math.min(1, entrance * 1.4);

  return (
    <section
      ref={ref}
      id="experience"
      className="relative w-screen min-h-screen-safe overflow-hidden"
      style={{ zIndex: 40, backgroundColor: '#F2EDE4' }}
      aria-label="House Principles — Rituals at This Is Not A Hotel, Mawella"
    >
      {/* Creme-Hintergrund — bewusste visuelle Pause. */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#F2EDE4' }}
        aria-hidden
      />

      {/* Screen-Reader-Only semantische Headline für SEO/Accessibility. */}
      <h2 className="sr-only">
        House Principles — no televisions, no lobby, no turn-down service, no little chocolates.
      </h2>

      {/*
        Editorial-Container — gleicher Aufbau wie Location:
        3 × 4 = 12 Spalten, 5vw horizontaler Gap, vertikal zentriert.
      */}
      <div
        className="relative z-10 mx-auto max-w-[1300px] px-[6vw] py-[8vh] md:py-[10vh]"
        style={{ opacity: contentOpacity }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-[5vh] md:gap-x-[5vw] items-center">
          {/* ============================================================
              Linke Spalte — Section-Marker + Headline-Stack
              Slide-in von LINKS NACH RECHTS.
              ============================================================ */}
          <div
            className="md:col-span-4"
            style={{
              opacity: groupEntranceOpacity,
              transform: `translateX(${leftShiftX})`,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            {/* Section-Marker „§ III — HOUSE PRINCIPLES".
                Identisch typographiert zum § I-Marker auf der
                Location-Seite — Allerta Stencil, 10 px, 0.28em
                tracking, Creme-Ink #1C1B17. */}
            <div className="flex items-center gap-3 mb-[4vh]">
              <span
                aria-hidden
                className="inline-block h-px w-6"
                style={{ backgroundColor: '#1C1B17' }}
              />
              <span
                className="font-stencil text-[10px] uppercase tracking-[0.28em]"
                style={{ color: '#1C1B17' }}
              >
                § III — House Principles
              </span>
            </div>

            {/*
              Headline-Stack (Stencil + Italic-Serif-Mix).
              „NO TELEVISIONS. / NO LOBBY." → Stencil
              „no turn-down service, no" → Italic-Serif, Terracotta
              „LITTLE CHOCOLATES." → Stencil
              Clamp-Range identisch zu Location (30–68 px) damit beide
              Sektionen in identischer Tonalität atmen.
            */}
            <p
              className="m-0 select-text"
              style={{
                color: '#1C1B17',
                fontSize: 'clamp(30px, 4.6vw, 68px)',
                lineHeight: 1.0,
                letterSpacing: '-0.005em',
              }}
            >
              <span className="font-stencil block" style={{ letterSpacing: '0.02em' }}>
                No televisions.
              </span>
              <span className="font-stencil block" style={{ letterSpacing: '0.02em' }}>
                No lobby.
              </span>
              <span className="block">
                <span
                  className="font-serif-display italic"
                  style={{ fontStyle: 'italic', color: '#A84A2C' }}
                >
                  no turn-down service, no
                </span>
              </span>
              <span className="font-stencil block" style={{ letterSpacing: '0.02em' }}>
                Little chocolates.
              </span>
            </p>
          </div>

          {/* ============================================================
              Mittlere Spalte — EXPLORE CircleCTA
              Slide-in von UNTEN NACH OBEN.
              ============================================================ */}
          <div
            className="md:col-span-4 flex justify-center items-center"
            style={{
              opacity: groupEntranceOpacity,
              transform: `translateY(${buttonShiftY})`,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            {/* flex-shrink-0 garantiert Kreisform (siehe Location). */}
            <div className="flex-shrink-0">
              <CircleCTA
                text="EXPLORE"
                variant="glass-on-light"
                onClick={() => {
                  const element = document.querySelector('#details');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>

          {/* ============================================================
              Rechte Spalte — „An experience, not a booking." + Body
              Slide-in von RECHTS NACH LINKS.
              ============================================================ */}
          <div
            className="md:col-span-4"
            style={{
              opacity: groupEntranceOpacity,
              transform: `translateX(${rightShiftX})`,
              transition:
                'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform, opacity',
            }}
          >
            <div className="max-w-[360px]" style={{ color: '#1C1B17' }}>
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
                style={{ color: '#1C1B17' }}
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
