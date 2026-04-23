import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Location / "An Introduction" section.
 *
 * Layout-Refactor 2026-04-24 (User-Feedback-Pass):
 *   - Kleinschrift (Section-Marker + Body-Absätze) in die gleiche
 *     Typografie wie auf der Startseite überführt:
 *       • Section-Marker nutzt jetzt Allerta Stencil
 *         (font-stencil), identisch zu den "01 / Location"-Labels
 *         im Hero-Drei-Spalten-Block.
 *       • Body-Absätze nutzen jetzt das Standard-Body-Font der Seite
 *         (Inter via body-Default) mit derselben Clamp-Range
 *         (11–13 px) und demselben Grauwert (#1C1B17 für Creme-
 *         Kontrast statt Hero-#B7B7B7 auf Dunkel), damit die
 *         Typografie seitenweit konsistent bleibt.
 *     Die große Editorial-Headline links bleibt im Stencil + Italic-
 *     Serif-Mix aus dem Inspirations-Bild — das ist bewusst
 *     expressive Display-Typografie und nicht "klein".
 *
 *   - Richtungsgebundene Einblendung beim Scrollen:
 *       • Linker Headline-Stack schiebt sich aus ~-6 vw von LINKS
 *         NACH RECHTS ins Bild.
 *       • Mittlerer LOCATION-Button steigt von UNTEN NACH OBEN
 *         (translateY ~+6 vh → 0) ins Bild.
 *       • Rechte Body-Spalte schiebt sich aus ~+6 vw von RECHTS
 *         NACH LINKS ins Bild.
 *     Alle drei Bewegungen werden über dasselbe entrance-Progress
 *     (useSectionProgress) gesteuert, d.h. sie laufen synchron mit
 *     dem Scroll-In der Section.
 *
 *   - Button-Variante zurück auf Default-Grösse (lg), damit er "wie
 *     jeder andere Button" auf der Seite wirkt. Variante bleibt
 *     `glass-on-light`, weil nur diese auf Creme lesbar bleibt —
 *     der Default-Glass-Disc (weiss/weiss) wäre auf #F2EDE4
 *     unsichtbar.
 */
export function Location() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  // Globale Fade-Opazität folgt Scroll-Progress der Section.
  const contentOpacity = entrance - exit * 0.75;

  // entrance geht 0 → 1 beim Einscrollen. Wir invertieren zu
  // "remaining" (1 → 0) und multiplizieren mit einer Distanz.
  // So entsteht die Richtungs-Slide-in-Animation synchron zum Scroll.
  const remaining = 1 - entrance;
  const leftShiftX = `${-remaining * 6}vw`; // links: aus -6vw nach 0 (L→R)
  const rightShiftX = `${remaining * 6}vw`; // rechts: aus +6vw nach 0 (R→L)
  const buttonShiftY = `${remaining * 6}vh`; // mitte: aus +6vh nach 0 (B→T)

  // Leichte Gruppen-Entrance-Opazität — startet bei 0 und füllt sich
  // über den ersten Drittel des entrance-Fortschritts, damit die
  // Slide-Richtungen sichtbar bleiben.
  const groupEntranceOpacity = Math.min(1, entrance * 1.4);

  return (
    <section
      ref={ref}
      id="location"
      className="relative w-screen min-h-screen-safe overflow-hidden"
      style={{ zIndex: 20, backgroundColor: '#F2EDE4' }}
      aria-label="An Introduction — This Is Not A Hotel, Mawella Beach, southern Sri Lanka"
    >
      {/* Creme-Hintergrund — bewusste visuelle Pause. */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#F2EDE4' }}
        aria-hidden
      />

      {/* Screen-Reader-Only semantische Headline. */}
      <h2 className="sr-only">
        An introduction — it&apos;s a house, a long table, a kilometre of empty beach.
      </h2>

      {/*
        Editorial-Container.
        Drei-Spalten-Grid ab md: links Headline (5), mitte Button (2),
        rechts Body (5). Mobile stapelt: Headline → Button → Body.
      */}
      <div
        className="relative z-10 mx-auto max-w-[1300px] px-[6vw] py-[8vh] md:py-[10vh]"
        style={{
          opacity: contentOpacity,
        }}
      >
        {/*
          Grid 4 / 4 / 4 (gleich breite Drittel) statt 5 / 2 / 5.
          Grund (User-Request 2026-04-24):
            - Der Button soll eine echte runde Form behalten. Mit nur
              2 von 12 Spalten für den Button und einem flex-child ohne
              flex-shrink:0 wurde die Disc bei mittleren Viewports
              horizontal zusammengequetscht und wirkte oval.
              Breiterer Mittel-Slot (4/12) + flex-shrink-0 am Button-
              Wrapper garantiert perfekte Kreisform.
            - Linke und rechte Textspalte sollen "nicht so nah am Button"
              sein. Mit md:gap-x-[5vw] entstehen spürbare Luftabstände
              zwischen den drei Blöcken.
        */}
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
            {/* Section-Marker „§ I — AN INTRODUCTION".
                Schriftart auf font-stencil umgestellt, damit sie sich
                1:1 wie die "01 / Location"-Labels auf der Startseite
                liest. Farbton #1C1B17 für Creme-Kontrast. */}
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
                § I — An Introduction
              </span>
            </div>

            {/*
              Headline-Stack (Stencil + Italic-Serif-Mix).
              Bleibt bewusst im expressiven Display-Stil — das ist
              keine "Kleinschrift", sondern das typografische Herz der
              Section.
            */}
            {/*
              Headline-Stack — etwas verkleinert (User-Request
              2026-04-24): clamp von (38–88 px) auf (30–68 px). Die
              Litanei bleibt prominent, drängt den Button-Mittelpunkt
              aber nicht mehr.
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
                It&apos;s a house.
              </span>
              <span className="block whitespace-nowrap">
                <span className="font-stencil" style={{ letterSpacing: '0.02em' }}>
                  A
                </span>{' '}
                <span className="font-serif-display italic" style={{ fontStyle: 'italic' }}>
                  long table.
                </span>
              </span>
              <span className="block">
                <span className="font-stencil" style={{ letterSpacing: '0.02em' }}>
                  A kilometre
                </span>
              </span>
              <span className="block whitespace-nowrap">
                <span className="font-stencil" style={{ letterSpacing: '0.02em' }}>
                  of
                </span>{' '}
                <span className="font-serif-display italic" style={{ fontStyle: 'italic' }}>
                  empty beach.
                </span>
              </span>
            </p>
          </div>

          {/* ============================================================
              Mittlere Spalte — LOCATION CircleCTA
              Slide-in von UNTEN NACH OBEN.
              ============================================================
              Default-Grösse (lg) zurückgeholt, damit der Button "wie
              jeder andere" auf der Seite wirkt. Variante bleibt
              `glass-on-light` für Creme-Lesbarkeit. */}
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
            {/*
              flex-shrink-0 zwingt den Button, seine intrinsisch
              gesetzte Breite (= Höhe) zu behalten. Ohne diesen Schutz
              würde der Flex-Container den Button bei knappem Platz
              horizontal komprimieren und aus dem Kreis ein Oval
              machen — exakt das Symptom, das der User gemeldet hat.
            */}
            <div className="flex-shrink-0">
              <CircleCTA
                text="LOCATION"
                variant="glass-on-light"
                onClick={() => {
                  const element = document.querySelector('#rooms');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>

          {/* ============================================================
              Rechte Spalte — Body-Text
              Slide-in von RECHTS NACH LINKS.
              ============================================================
              Schriftart & Grösse an die Startseiten-Bodytexte
              angeglichen: Inter als Default-Body-Font (gesetzt über
              body-CSS), clamp(11px,0.85vw,13px) analog zu den
              "01 / Location"-Bodys im Hero, leading-snug. Farbe
              #1C1B17 für Creme-Kontrast statt Hero-Grau-auf-Dunkel. */}
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
            <div
              className="max-w-[360px] text-[clamp(11px,0.85vw,13px)] leading-snug"
              style={{ color: '#1C1B17' }}
            >
              <p className="m-0">
                We do not have a concierge. We do not have a lobby. We will
                not ask you to upgrade, unless the upgrade is to a hammock.
              </p>
              <p className="m-0 mt-[1.8em]">
                Mawella is a thin strip of sand on the south coast, roughly
                three hours from Colombo and a world from Mirissa. We have
                nine rooms, two dogs, one cook named Sunil, and an old piano
                nobody can play properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
