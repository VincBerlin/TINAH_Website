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

  // -----------------------------------------------------------------
  // Scroll-Animation — Rooms-/Reviews-Geschwindigkeit, KEIN Farbverlauf
  // -----------------------------------------------------------------
  // User-Request 2026-04-26: „kein farbverlauf der texte. überschrift
  // kommt von oben. location button kommt mit dem text darunter von
  // unten nach oben mit der gleichen dynamik und geschwindigkeit wie
  // bei der section von rooms und reviews."
  //
  // Distances entsprechen exakt dem Rooms-Pattern (Headline: 18vw
  // entrance, 12vw exit-drift; Right-CTA: 22vw entrance, 20vw exit-
  // drift). Hier vertikal als vh übernommen, damit sich die Bewegung
  // gleich anfühlt:
  //   - Headlines kommen von oben (-18vh → 0 → -12vh exit-drift)
  //   - Button + Body kommen gemeinsam von unten (+22vh → 0)
  //
  // 2026-04-27 (User-Bug-Fix): Exit-Drift am BUTTON und BODY entfernt
  // („der unten darf beim runterscrollen nicht hinter der nächsten
  //  section verschwinden"). Der frühere Exit-Term `+ exit * 20`
  // schob LOCATION-Disc und Body-Absatz beim Scroll-Out um bis zu
  // 20vh nach unten — innerhalb der `overflow-hidden`-Section wurden
  // sie dadurch vorzeitig abgeschnitten, was visuell wie „Verschwinden
  // hinter Rooms" aussah. Beide bleiben jetzt während Exit an ihrer
  // natürlichen Position; nur die Headlines drift en weiterhin nach
  // oben (gleicher Richtung wie der Scroll), das ist unkritisch, weil
  // die Section-Oberkante mitscrollt.
  //
  // OPACITY ist absichtlich konstant 1 — User-Request „kein
  // farbverlauf der texte". Die Texte fade-en nicht ein/aus während
  // der Scroll-Animation.
  const remaining = 1 - entrance;
  const headlineShiftY = `${-(remaining * 18) - exit * 12}vh`;
  const buttonShiftY = `${remaining * 22}vh`;
  const bodyShiftY = `${remaining * 22}vh`;

  return (
    <section
      ref={ref}
      id="location"
      data-nav-theme="light"
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
      >
        {/* ============================================================
            Section-Marker „§ I — The House"
            ============================================================
            Wieder eingeführt 2026-04-28 (User-Request): einheitliches
            Eyebrow-Pattern über alle Site-Sections (§ I — § VI). Mikro-
            Label, IBM-Plex-Mono-Optik, ruhig links bei den anderen
            Eyebrows angesiedelt. */}
        <div
          className="font-stencil uppercase inline-flex items-center mb-[5vh] md:mb-[6vh]"
          style={{
            fontSize: 11,
            letterSpacing: '0.28em',
            color: '#5A5448',
            gap: 14,
          }}
        >
          <span
            aria-hidden
            className="inline-block h-px w-8"
            style={{ backgroundColor: '#1C1B17' }}
          />
          § I — The House
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
            opacity: 1,
            transform: `translateY(${headlineShiftY})`,
            willChange: 'transform',
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
            CircleCTA „LOCATION"
            ============================================================
            Der schwarze Compass-Decoration-Dot auf 12 Uhr wurde am
            2026-04-26 auf User-Request entfernt — der CircleCTA steht
            jetzt clean auf der Cream-Fläche, ohne zusätzlichen
            Marker-Punkt am oberen Kreisrand. */}
        <div
          className="relative mt-[8vh] md:mt-[10vh] flex justify-center items-center"
          style={{
            opacity: 1,
            transform: `translateY(${buttonShiftY})`,
            willChange: 'transform',
          }}
        >
          {/* flex-shrink-0 schützt die runde Form gegen horizontale
              Stauchung in engen Flex-Containern. */}
          <div className="flex-shrink-0">
            <CircleCTA
              text="LOCATION"
              variant="glass-on-light"
              // Größe identisch zum Hero-PAUSE-NOW-Button: bewusst
              // klein gehalten, damit der Hotelname und die Section-
              // Hierarchie im Vordergrund bleiben (User-Request
              // 2026-04-27).
              size="sm"
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
            opacity: 1,
            transform: `translateY(${bodyShiftY})`,
            willChange: 'transform',
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
