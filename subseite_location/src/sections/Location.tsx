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
        Layout-Refactor 2026-04-26 (User-Request „alles in der Mitte“):
        Die alte 3-Spalten-Choreografie (links Headline, mitte Button,
        rechts Body) ist ersetzt durch einen zentrierten vertikalen
        Stack. Reihenfolge:
          1) Section-Marker  § I — An Introduction      (zentriert)
          2) Headline-Stack  It's a house. … empty beach.  (zentriert)
          3) CircleCTA       LOCATION                       (zentriert)
          4) Body            Past the gate in Mawella, …   (zentriert)
        Alle Blöcke fade-und-slide gemeinsam aus translateY(+24px) zu 0
        — eine einzige ruhige Bewegung, statt drei richtungs-getrennter.
      */}
      <div
        className="relative z-10 mx-auto max-w-[820px] px-[6vw] py-[12vh] md:py-[16vh] flex flex-col items-center text-center"
        style={{
          opacity: contentOpacity,
        }}
      >
        {/* Gemeinsamer Entrance-Wrapper: alle Kinder gleiten synchron
            aus +24px nach 0 und blenden gemeinsam ein. */}
        <div
          className="flex flex-col items-center text-center w-full"
          style={{
            opacity: groupEntranceOpacity,
            transform: `translateY(${remaining * 24}px)`,
            transition:
              'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform, opacity',
          }}
        >
          {/* 1) Headline-Stack — zentriert. Erstes Wort „It's a house.“
              in Brand-Ochre (#B84A1F) als visueller Anker. Marker-Zeile
              darüber komplett entfernt (User-Request 2026-04-26). */}
          <p
            className="m-0 select-text font-stencil"
            style={{
              color: '#1C1B17',
              fontSize: 'clamp(22px, 3.4vw, 48px)',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
            }}
          >
            <span className="block mb-[0.55em]" style={{ color: '#B84A1F' }}>
              It&apos;s a house.
            </span>
            <span className="block mb-[0.55em]">A long table.</span>
            <span className="block">A kilometre of empty beach.</span>
          </p>

          {/* 3) LOCATION CircleCTA — zentriert, mit großzügigem Atem
              ober/unter (clamp aus 6vh bis 9vh, je nach Viewport). */}
          <div
            className="flex-shrink-0"
            style={{ marginTop: 'clamp(48px, 7vh, 96px)' }}
          >
            <CircleCTA
              text="LOCATION"
              variant="glass-on-light"
              onClick={() => {
                const element = document.querySelector('#rooms');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          {/* 4) Body-Copy — schmal gehalten (max-w 520px), zentriert,
              gleiche Typo-Specs wie zuvor. */}
          <div
            className="max-w-[520px] text-[clamp(12px,0.95vw,14px)] leading-relaxed"
            style={{ color: '#1C1B17', marginTop: 'clamp(40px, 6vh, 80px)' }}
          >
            <p className="m-0">
              Past the gate in Mawella, the lane is unpaved. A kilometre
              of soft sand runs under the palms — peacocks at first
              light, monkeys in the trees, the ocean three steps from
              the door. Time enough to slow down, switch off, find
              your way back to yourself.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
