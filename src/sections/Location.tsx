import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';
import { useRoute } from '../hooks/use-route';

/**
 * Location / "An Introduction" section.
 *
 * Layout-Refactor 2026-04-26 (Design-Pass):
 *   Komplettes Re-Layout vom 3-Spalten-Grid (Headline | Button | Body)
 *   auf ein zentriertes, vertikal gestapeltes Editorial-Layout. Vorlage
 *   ist der Design-Screenshot von Claude-Design vom 26.04.
 *
 *   Aufbau (vertikal, alles zentriert):
 *     1. Section-Marker „§ I — AN INTRODUCTION"
 *     2. Headline-Stack:
 *          • „It's a house."  → Terracotta (#B84A1F), Allerta Stencil,
 *            grösste Stufe (Brand-Akzent, Eyecatcher).
 *          • „A long table." → Schwarz, Allerta Stencil, zweitgrösste.
 *          • „A kilometre of empty beach." → Schwarz, Allerta Stencil.
 *     3. CircleCTA „LOCATION" mit dezentem schwarzen Decoration-Dot
 *        auf der 12-Uhr-Position des Disc-Rings.
 *     4. Body-Absatz (neu, lokal-poetisch): „Past the gate in Mawella
 *        …".
 *
 *   Typografie:
 *     - Italic-Serif-Mix wurde entfernt — alle Headlines sind jetzt
 *       reine Stencil-Schrift (Allerta Stencil), so wie auf der
 *       Brand-Definition festgelegt.
 *     - Body bleibt im Inter-Default-Font (Brand-Body), zentriert,
 *       schmal (max-w 640 px).
 *
 *   Animation:
 *     - Headlines erscheinen mit leichtem Slide von OBEN nach UNTEN
 *       (translateY -6vh → 0).
 *     - Button kommt von UNTEN nach OBEN (translateY +6vh → 0).
 *     - Body folgt mit kurzer Verzögerung über translateY +4vh → 0.
 *     Alle drei Bewegungen laufen synchron mit dem entrance-Progress
 *     (useSectionProgress), so dass der Effekt scroll-gebunden bleibt.
 */
export function Location() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  // Navigate-Funktion für die LOCATION-CTA — öffnet die fertige
  // Detail-Subseite `/location` (Mawella-Karte, Anreise-Routen,
  // Editorial-Body). Vorher scrollte der Button zur Rooms-Section,
  // was den Klick faktisch unsichtbar machte.
  const [, navigate] = useRoute();

  // Globale Fade-Opazität folgt Scroll-Progress der Section.
  const contentOpacity = entrance - exit * 0.75;

  // entrance: 0 → 1 beim Einscrollen. Wir invertieren zu „remaining"
  // und multiplizieren mit einer Distanz für die Slide-in-Animationen.
  const remaining = 1 - entrance;
  const headlineShiftY = `${-remaining * 6}vh`; // Headlines: oben → 0
  const buttonShiftY = `${remaining * 6}vh`;    // Button: unten → 0
  const bodyShiftY = `${remaining * 4}vh`;      // Body:   unten → 0

  // Sanfte Gruppen-Opazität — startet bei 0 und füllt sich über den
  // ersten Drittel des entrance-Fortschritts auf.
  const groupEntranceOpacity = Math.min(1, entrance * 1.4);

  return (
    <section
      ref={ref}
      id="location"
      className="relative w-screen min-h-screen-safe overflow-hidden"
      style={{ zIndex: 20, backgroundColor: '#F2EDE4' }}
      aria-label="An Introduction — This Is Not A Hotel, Mawella Beach, southern Sri Lanka"
    >
      {/* Creme-Hintergrund — bewusste visuelle Pause zwischen den
          dunklen Sections. */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#F2EDE4' }}
        aria-hidden
      />

      {/* Screen-Reader-Only semantische Headline (SEO + a11y). */}
      <h2 className="sr-only">
        An introduction — it&apos;s a house, a long table, a kilometre of empty beach.
      </h2>

      {/*
        Editorial-Container — single column, alles zentriert.
        max-w 1100 px hält die Headlines und den Body in einer ruhigen,
        lesbaren Spaltenbreite. py orientiert sich am Hero-Pattern.
      */}
      <div
        className="relative z-10 mx-auto flex flex-col items-center text-center max-w-[1100px] px-[6vw] py-[10vh] md:py-[14vh]"
        style={{ opacity: contentOpacity }}
      >
        {/* ============================================================
            Section-Marker „§ I — AN INTRODUCTION"
            ============================================================
            Bewusst symmetrisch (Linie ↔ Label ↔ Linie), damit er sich
            in das zentrale Layout einfügt statt links zu hängen wie
            zuvor. Schrift: Allerta Stencil (font-stencil), 10 px,
            tracking 0.28em — identisch zu den „01 / Location"-Labels
            im Hero. */}
        <div
          className="flex items-center gap-3 mb-[6vh] md:mb-[8vh]"
          style={{
            opacity: groupEntranceOpacity,
            transition: 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'opacity',
          }}
        >
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
          <span
            aria-hidden
            className="inline-block h-px w-6"
            style={{ backgroundColor: '#1C1B17' }}
          />
        </div>

        {/* ============================================================
            Headline-Stack — vertikal gestapelt, zentriert
            ============================================================
            „It's a house." in Terracotta (#B84A1F) als Brand-Akzent
            und visueller Anker; die nachfolgenden Zeilen schwarz.
            Alle in Allerta Stencil — kein Italic-Serif-Mix mehr. */}
        <div
          className="flex flex-col items-center gap-[2.4vh] md:gap-[3.2vh]"
          style={{
            opacity: groupEntranceOpacity,
            transform: `translateY(${headlineShiftY})`,
            transition:
              'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform, opacity',
          }}
        >
          <p
            className="font-stencil m-0 leading-none"
            style={{
              color: '#B84A1F',
              fontSize: 'clamp(40px, 5.6vw, 76px)',
              letterSpacing: '0.02em',
            }}
          >
            It&apos;s a house.
          </p>
          <p
            className="font-stencil m-0 leading-none"
            style={{
              color: '#1C1B17',
              fontSize: 'clamp(34px, 4.6vw, 64px)',
              letterSpacing: '0.02em',
            }}
          >
            A long table.
          </p>
          <p
            className="font-stencil m-0 leading-none"
            style={{
              color: '#1C1B17',
              fontSize: 'clamp(32px, 4.4vw, 60px)',
              letterSpacing: '0.02em',
            }}
          >
            A kilometre of empty beach.
          </p>
        </div>

        {/* ============================================================
            CircleCTA „LOCATION" mit Decoration-Dot auf 12 Uhr
            ============================================================
            Der Dot ist ein dezent-schwarzer Punkt, der genau auf dem
            oberen Kreis-Rand sitzt (top: 0, translate -50% / -50%).
            Vorlage aus dem Design-Screenshot vom 26.04. — wirkt wie
            ein Compass-Marker, der die Section räumlich orientiert. */}
        <div
          className="relative mt-[8vh] md:mt-[10vh] flex justify-center items-center"
          style={{
            opacity: groupEntranceOpacity,
            transform: `translateY(${buttonShiftY})`,
            transition:
              'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) 100ms, transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 100ms',
            willChange: 'transform, opacity',
          }}
        >
          {/* Decoration-Dot — Compass-Marker auf 12 Uhr.
              z-index 5 hebt ihn knapp über den Disc-Border, ohne den
              CircleCTA-Hover-State zu blockieren (pointer-events:none). */}
          <span
            aria-hidden
            className="absolute"
            style={{
              top: 0,
              left: '50%',
              width: '7px',
              height: '7px',
              borderRadius: '9999px',
              backgroundColor: '#1C1B17',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
          {/* flex-shrink-0 schützt die runde Form gegen horizontale
              Stauchung in engen Flex-Containern. */}
          <div className="flex-shrink-0">
            <CircleCTA
              text="LOCATION"
              variant="glass-on-light"
              onClick={() => {
                // Öffnet die dedizierte Detail-Subseite `/location`
                // (Karte, Anreise-Routen, Editorial-Copy). useRoute
                // setzt den History-State und scrollt den Viewport
                // automatisch nach oben.
                navigate('/location');
              }}
            />
          </div>
        </div>

        {/* ============================================================
            Body-Absatz — neuer Local-Color-Text
            ============================================================
            Inhalt aus Design-Screenshot vom 26.04. Zentriert, schmal
            (max-w 640 px), Inter Default-Body, leading 1.6 für eine
            ruhige Lesbarkeit. */}
        <p
          className="m-0 mt-[8vh] md:mt-[10vh] mx-auto max-w-[640px]"
          style={{
            color: '#1C1B17',
            fontSize: 'clamp(12px, 0.95vw, 14px)',
            lineHeight: 1.6,
            opacity: groupEntranceOpacity,
            transform: `translateY(${bodyShiftY})`,
            transition:
              'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) 200ms, transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 200ms',
            willChange: 'transform, opacity',
          }}
        >
          Past the gate in Mawella, the lane is unpaved. A kilometre of
          soft sand runs under the palms, peacocks at first light,
          monkeys in the trees, the ocean three steps from the door.
          Time enough to slow down, switch off, find your way back to
          yourself.
        </p>
      </div>
    </section>
  );
}
