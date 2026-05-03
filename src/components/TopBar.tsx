import { useState, useEffect, useRef } from 'react';
import { AmbientSound } from './AmbientSound';
import { useRoute } from '../hooks/use-route';

interface TopBarProps {
  variant?: 'dark' | 'light';
}

/**
 * Sticky top navigation.
 *
 * Behavior (User-Request 2026-04-27 — Chameleon-Refactor):
 *   • Bar bleibt PERMANENT sichtbar beim Scrollen (`position: fixed`).
 *   • Hintergrund ist KOMPLETT TRANSPARENT — kein Glas, kein Blur,
 *     kein dunkler Streifen. Die Schrift „liegt" direkt auf dem
 *     Content darunter.
 *   • Damit die Schrift auf jedem Untergrund lesbar bleibt, wechselt
 *     die Textfarbe automatisch:
 *       - dunkle Section unter der Bar  → helle Schrift (#F2EDE4)
 *       - helle Section unter der Bar   → dunkle Schrift (#1C1B17)
 *   • Detection-Mechanik: jede Section trägt `data-nav-theme="dark"`
 *     oder `data-nav-theme="light"`. Beim Scroll probet die TopBar
 *     den DOM-Knoten an Position (viewportCenter, 30 px) via
 *     `document.elementsFromPoint`, läuft die Eltern hoch, liest das
 *     erste vorhandene `data-nav-theme`-Attribut. Kein zentrales
 *     Mapping nötig — neue Sections funktionieren automatisch.
 */
// Probe-Punkt: vertikal so weit unten, dass er innerhalb der TopBar-
// Mitte liegt (Bar ist ~50–60 px hoch + Safe-Area). 36 px ist ein
// stabiler Mittelwert — auch auf Geräten mit Notch noch innerhalb
// der Bar.
const PROBE_Y = 36;

type NavTheme = 'dark' | 'light';

/**
 * Probet das Theme unter einem konkreten X-Punkt der TopBar.
 *
 * Refactor 2026-04-29 (User-Bug-Report): vorher gab es nur EINEN
 * Probe in der Viewport-Mitte. Wenn der Hintergrund unter der Bar
 * horizontal gemischt war (links Cream-Section, rechts Dark-Section
 * z. B. an einem Section-Übergang), bekam die ganze Bar EINE Schrift-
 * Farbe — und in einer der beiden Hälften wurde die Schrift
 * unlesbar.
 *
 * Jetzt probet jedes TopBar-Element seine LOKALE X-Position
 * (Element-Mitte aus getBoundingClientRect) und kriegt dort sein
 * eigenes Theme. Ergebnis: Wordmark, Coordinates, Nav-Buttons und
 * Ambient-Sound-Toggle haben unabhängige Schrift-Farben, je nachdem
 * was direkt unter ihnen liegt.
 */
function detectThemeAtX(x: number): NavTheme {
  if (typeof document === 'undefined') return 'dark';
  const stack = document.elementsFromPoint(x, PROBE_Y);
  for (const el of stack) {
    // Header selbst überspringen — der TopBar liegt zwar an dieser
    // Y-Position, aber wir wollen wissen, was UNTER ihm liegt.
    if ((el as HTMLElement).closest('header[role="banner"]')) continue;
    const themed = (el as HTMLElement).closest('[data-nav-theme]');
    if (themed) {
      const theme = themed.getAttribute('data-nav-theme');
      if (theme === 'light' || theme === 'dark') return theme;
    }
  }
  return 'dark';
}

/** Mitte (X) eines Elements aus seiner Bounding-Box. */
function midX(el: Element | null): number {
  if (!el || typeof window === 'undefined') {
    return typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  }
  const r = el.getBoundingClientRect();
  return r.left + r.width / 2;
}

/** Tailwind-Klassen für eine gegebene Theme-Variante. */
function colorsFor(theme: NavTheme) {
  return {
    text: theme === 'light' ? 'text-[#1C1B17]' : 'text-[#F2EDE4]',
    hover: theme === 'light' ? 'hover:text-[#0B0B0C]' : 'hover:text-white',
  };
}

export function TopBar({ variant: _variant = 'dark' }: TopBarProps) {
  // _variant aus der App-Prop wird im Chameleon-Modus nicht mehr
  // benötigt (das Theme wird live aus dem DOM abgeleitet), bleibt
  // aber im Interface für Abwärtskompatibilität bestehen.
  void _variant;

  const [isMounted, setIsMounted] = useState(false);

  // Pro-Element Themes (Refactor 2026-04-29, erweitert).
  //   wordmarkLeft  : Theme unter Instagram-Icon + „THIS IS NOT A "
  //   wordmarkRight : Theme unter „HOTEL™"
  //   coords        : Theme unter dem Mawella-Koordinaten-Label
  //   nav           : Theme unter der rechten Nav-Spalte und dem
  //                   Floating-AmbientSound-Toggle
  //
  // Wordmark-Split 2026-04-29 (User-Bug-Report): das Wordmark „THIS
  // IS NOT A HOTEL" ist breit genug, dass es horizontal über zwei
  // Theme-Bereiche reichen kann (z. B. cream-Section endet bei 70 %
  // Viewport-Breite, dark-Section beginnt rechts davon — die letzten
  // Buchstaben „HOTEL" landen auf dark, vorderer Teil auf cream).
  // Mit einer einzigen Wordmark-Probe in der Mitte kriegen alle
  // Buchstaben dieselbe Farbe — eine Hälfte wird unlesbar. Lösung:
  // zwei separat gemessene Spans.
  const [themes, setThemes] = useState<{
    wordmarkLeft: NavTheme;
    wordmarkRight: NavTheme;
    coords: NavTheme;
    nav: NavTheme;
  }>({
    wordmarkLeft: 'dark',
    wordmarkRight: 'dark',
    coords: 'dark',
    nav: 'dark',
  });

  // Routing für die LOCATION-Nav: per pushState auf die Subseite
  // navigieren, statt nur einen Anker auf der Startseite anzuspringen.
  const [, navigate] = useRoute();

  const ticking = useRef(false);

  // Refs an die vier Haupt-Element-Cluster der TopBar — wir lesen
  // ihre tatsächliche Bounding-Box-Mitte zur Laufzeit aus, damit
  // das Probing exakt unter dem jeweiligen Element sitzt.
  const wordmarkLeftRef = useRef<HTMLSpanElement>(null);
  const wordmarkRightRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Initial fade-in
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll/Resize-Tracking — drei Probes pro Frame (links/mitte/rechts)
  // statt einem in der Viewport-Mitte. rAF-Throttle hält den Aufwand
  // minimal; setThemes bail-out auf identischen Object-Inhalt
  // (shallow-equal über die drei Theme-Werte) wäre möglich, aber React
  // skipt das Re-Render bereits wenn alle drei Werte gleich bleiben.
  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const next = {
        wordmarkLeft: detectThemeAtX(midX(wordmarkLeftRef.current)),
        wordmarkRight: detectThemeAtX(midX(wordmarkRightRef.current)),
        coords: detectThemeAtX(midX(coordsRef.current)),
        nav: detectThemeAtX(midX(navRef.current)),
      };
      // Manuelles Bail-Out: nur State-Update wenn sich tatsächlich
      // etwas geändert hat. Spart Re-Renders bei statischem Scroll.
      setThemes((prev) =>
        prev.wordmarkLeft === next.wordmarkLeft &&
        prev.wordmarkRight === next.wordmarkRight &&
        prev.coords === next.coords &&
        prev.nav === next.nav
          ? prev
          : next,
      );
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    // Initial Sync nach Mount (Layout muss stehen).
    const initTimer = setTimeout(update, 0);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Pro Element die passenden Tailwind-Color-Klassen ableiten.
  const wmL = colorsFor(themes.wordmarkLeft);
  const wmR = colorsFor(themes.wordmarkRight);
  const co = colorsFor(themes.coords);
  const nv = colorsFor(themes.nav);
  const navItemClass = `font-stencil text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${nv.text} ${nv.hover}`;

  // Hintergrund DURCHGEHEND TRANSPARENT — User-Request 2026-04-27.
  const bgClass = 'bg-transparent';

  // Bar bleibt jetzt PERMANENT sichtbar (User-Request 2026-04-27:
  // „die oberste leiste soll immer mitgehen beim scrollen"). Nur der
  // initiale Mount-Fade bleibt — danach kein Auto-Hide mehr.
  const visibilityClasses = !isMounted
    ? 'opacity-0 -translate-y-3'
    : 'opacity-100 translate-y-0';

  return (
    <>
    <header
      role="banner"
      aria-label="Hauptnavigation"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out will-change-transform ${bgClass} ${visibilityClasses}`}
      // Notch-/Dynamic-Island-Safe-Area: ziehe Safe-Insets als Padding
      // oben und seitlich rein, damit die Nav-Zeile auf iPhones nie
      // unter die Kamera rutscht und im Landscape-Mode nicht vom
      // Rand abgeschnitten wird.
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/*
        Single Micro-Bar Row (per User-Request 2026-04-23 — refactor
        nach Inspirations-Layout):

          [LINKS]                [MITTE]              [RECHTS]
          EST. MMXXV    ·         TINAH · MAWELLA      ROOMS  RITUALS  BOOK
          MAWELLA 06°04'N

        Drei-Spalten-Grid statt der alten Zwei-Zeilen-Konstruktion:
          - Linke Spalte: zwei Mikro-Labels nebeneinander
            (Gründungsjahr römisch + GPS-Koordinaten) — sie zitieren
            klassisches Hotel-Branding ("Est. 2025") und verankern den
            Ort gleichzeitig per Koordinate für SEO.
          - Mittlere Spalte: Wortmarke "TINAH · MAWELLA". Mittiger
            Brand-Anker, ersetzt das alte rechts-bündige
            "SCROLL TO EXPLORE"-Label und das links-bündige "THIS IS
            NOT A HOTEL™".
          - Rechte Spalte: drei Nav-Items als reine Stencil-Texte
            (keine Pills mehr) — ROOMS, RITUALS, BOOK. Klick scrollt
            zur jeweiligen Sektion. PLAY, PAUSE und LOCATION sind
            entfernt (User-Request 2026-04-23).

        Die zweite Pills-Zeile darunter ist komplett gestrichen.
      */}
      {/*
        Layout-Refactor 2026-04-23:
          - "TINAH · MAWELLA" Mittel-Spalte entfernt (User-Request).
          - "EST. MMXXV" durch den Hotel-Namen ersetzt (Hotel-Name
            soll im Vordergrund stehen, nicht das Gründungsjahr).
          - Rechtes Nav-Item "BOOK" → "PAUSE".
          Das verbleibende Mawella-GPS-Label bleibt — es trägt SEO
          und bewahrt das Hotel-Brand-Manifest-Detail.
      */}
      <div className="px-[4vw] pt-[3vh] pb-4 grid grid-cols-3 items-center">
        {/* Linke Spalte — Instagram + Hotel-Name + Koordinaten.
            Instagram-Icon sitzt links neben dem Wordmark
            (User-Request 2026-04-28). Refactor 2026-04-29: Wordmark
            ist in zwei separat gemessene Spans aufgeteilt
            (`wordmarkLeftRef` für „THIS IS NOT A " und
            `wordmarkRightRef` für „HOTEL™") — jeder Span kriegt eine
            eigene Theme-Probe an seiner Mitte, damit beide Hälften
            auch über einem horizontalen cream/dark-Übergang lesbar
            bleiben. Coordinates-Label hat eigenen `coordsRef`. */}
        <div className="justify-self-start flex items-center gap-[1.6vw]">
          {/*
            Instagram-Icon + Wordmark — Wordmark ist in ZWEI Spans
            aufgeteilt damit „THIS IS NOT A " und „HOTEL™" jeweils
            ihre eigene Theme-Probe an ihrer eigenen Mitte kriegen.
            Das löst den Bug, bei dem das Wort über zwei verschiedene
            Theme-Bereiche reichte und eine Hälfte unlesbar war.
            Beide Spans sitzen ohne Gap zueinander (gap nur am äußeren
            Container), wirken also wie ein einziger Schriftzug.

            Outer `aria-label` auf dem Wrapper-Span sorgt dafür, dass
            Screen-Reader weiterhin „This Is Not A Hotel" als ein
            zusammenhängendes Wort lesen.
          */}
          <div className="flex items-center gap-[1.6vw]">
            <a
              href="https://www.instagram.com/thisisnotahotelsl/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram · This Is Not A Hotel"
              className={`${wmL.text} ${wmL.hover} transition-colors duration-300`}
              style={{ lineHeight: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <span
              className="font-stencil text-[11px] uppercase tracking-[0.22em]"
              aria-label="This Is Not A Hotel"
            >
              <span
                ref={wordmarkLeftRef}
                className={`transition-colors duration-300 ${wmL.text}`}
              >
                THIS&nbsp;IS&nbsp;NOT&nbsp;A&nbsp;
              </span>
              <span
                ref={wordmarkRightRef}
                className={`transition-colors duration-300 ${wmR.text}`}
              >
                HOTEL<sup className="text-[0.75em] align-top ml-[0.15em] tracking-normal">™</sup>
              </span>
            </span>
          </div>
          <span
            ref={coordsRef}
            className={`font-stencil text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 ${co.text}`}
            aria-label="Mawella, latitude 06 degrees north, longitude 80 degrees 45 minutes east"
          >
            MAWELLA 06°00&apos;N&nbsp;·&nbsp;80°45&apos;E
          </span>
        </div>

        {/* Mittlere Spalte — bewusst leer. */}
        <span aria-hidden className="justify-self-center" />

        {/* Rechte Spalte — Navigation.
            LOCATION (neu, 2026-04-26): springt auf die dedizierte
            Subseite `/location` (Mawella-Karte, Anreise-Routen,
            Editorial-Body). Sitzt VOR ROOMS, weil die geographische
            Verortung im Sales-Funnel der erste Trust-Anker ist
            („wo bist du eigentlich?"). */}
        <nav
          ref={navRef}
          aria-label="Primär"
          className="justify-self-end flex items-center gap-[2.4vw]"
        >
          <button
            type="button"
            className={navItemClass}
            onClick={() => navigate('/location')}
          >
            LOCATION
          </button>
          <button
            type="button"
            className={navItemClass}
            onClick={() => navigate('/rooms')}
          >
            ROOMS
          </button>
          <button
            type="button"
            className={navItemClass}
            onClick={() => {
              // RITUALS scrollt zur eigenen § IV — The Day, Roughly
              // Sektion (zwischen Experience und Details).
              const el = document.getElementById('rituals');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            RITUALS
          </button>
          <button
            type="button"
            className={navItemClass}
            onClick={() => {
              const el = document.getElementById('book');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            PAUSE
          </button>
        </nav>
      </div>
    </header>

    {/*
      Compact Home button — ENTFERNT 2026-04-27 (User-Request:
      „die oberste leiste soll immer mitgehen beim scrollen").
      Da die volle TopBar jetzt permanent sichtbar bleibt, ist der
      separate Home-Button redundant. Funktion „zurück zur Startseite"
      ist über die Wortmarke „THIS IS NOT A HOTEL™" links in der
      Bar weiterhin (implizit) erreichbar — sie sitzt am scrollY=0
      Anker. Falls explizit gewünscht, kann sie auch auf-click
      verkabelt werden.
    */}

    {/*
      Floating Ambient-Sound-Toggle — IMMER sichtbar.
      Anders als die TopBar oder der Home-Button: dieser Button
      bleibt beim Scrollen permanent oben rechts verankert, damit der
      User jederzeit zwischen Laut / Leise / Aus umschalten kann.

      Positionierung:
      - fixed top-right, Safe-Area-aware (Notch, Landscape).
      - Dezent dunkles Glas mit Border, damit das Icon auf jedem
        Hintergrund (Meerbild, Palmenbild, Testimonial, Footer)
        einen eigenen optischen Halt hat.
      - z-[100] gleich wie TopBar, damit er niemals überdeckt wird.
    */}
    <div
      className={`fixed z-[100] right-4 transition-opacity duration-500 ease-out ${
        isMounted ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        top: 'calc(env(safe-area-inset-top) + 10px)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Wrapper-Kreis (Glas-Disc + Border + Backdrop-Blur) ENTFERNT
          2026-04-29 (User-Request): nur das Lautsprecher-Icon stehen
          lassen, kein runder Hintergrund mehr.
          flex items-center justify-center bleibt, damit das Icon-SVG
          mittig in seiner Klick-Fläche sitzt. h-9 w-9 als Touch-
          Target-Mindestmaß (Apple HIG fordert ≥ 36 px), aber
          vollständig transparent. */}
      <div className="flex items-center justify-center h-9 w-9 text-[#D9D9D9] hover:text-white transition-colors">
        <AmbientSound variant={themes.nav} subtle />
      </div>
    </div>
    </>
  );
}
