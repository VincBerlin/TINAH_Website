import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../../hooks/use-route';
import { CircleCTA } from '../../components/CircleCTA';

// ---------------------------------------------------------------
// Chameleon-Header — selbe Mechanik wie in TopBar.tsx (Hauptseite),
// nur lokal in dieser Subseite, weil die Location-Page einen eigenen,
// schmaleren Header verwendet (THIS IS NOT A HOTEL™ links · ← Back
// rechts). Hintergrund ist transparent — die Schrift adaptiert ihre
// Farbe je nach DOM-Knoten direkt unter der Bar:
//   - data-nav-theme="dark"  → helle Schrift (#F2EDE4)
//   - data-nav-theme="light" → dunkle Schrift (#1C1B17)
// ---------------------------------------------------------------
const NAV_PROBE_Y = 36;
type NavTheme = 'dark' | 'light';

function detectNavTheme(): NavTheme {
  if (typeof document === 'undefined') return 'light';
  const x = window.innerWidth / 2;
  const stack = document.elementsFromPoint(x, NAV_PROBE_Y);
  for (const el of stack) {
    // Den fixen Header SELBST überspringen — er sitzt zwar an dieser
    // Y-Position, aber wir wollen wissen, was UNTER ihm liegt.
    // Ohne das Skip-Pattern würde `closest('[data-nav-theme]')` vom
    // Header aus nach oben laufen und ggf. einen themed Wrapper
    // treffen, statt die Section unter dem Header zu erkennen.
    if ((el as HTMLElement).closest('header[role="banner"]')) continue;
    const themed = (el as HTMLElement).closest('[data-nav-theme]');
    if (themed) {
      const t = themed.getAttribute('data-nav-theme');
      if (t === 'light' || t === 'dark') return t;
    }
  }
  return 'light';
}

/**
 * /location — dedizierte Subseite „The Area".
 *
 * Quelle: subseite_location/Location Detail Preview.html (final-design,
 * 1:1 vom User). Hier zu React portiert, damit sie via Client-Side-
 * Routing (`/location`) im SPA gemountet werden kann.
 *
 * SEO-Hinweise:
 *   - Eigener Document-Titel + Meta-Description, die geographisch
 *     präzise sind („Mawella, between Hiriketiya and Tangalle"). Diese
 *     Long-Tail-Phrase ist auf Google-Suche nahezu unbesetzt → starke
 *     Ranking-Chance für Reise-Recherche-Queries.
 *   - Canonical zeigt auf `/location`, sodass die Subseite NICHT als
 *     Duplicate-Content der Startseite gewertet wird.
 *   - JSON-LD `TouristAttraction` markiert Mawella als Place-Entity mit
 *     Geo-Koordinaten, verbindet via `containedInPlace` zur Hotel-
 *     Entity der Hauptseite, und listet die zwei Anreiseorte
 *     (Hiriketiya, Tangalle) als nahe Plätze. So baut Google ein
 *     Knowledge-Graph-Verhältnis Hotel → Place.
 *   - Strukturierte Routen (Route 01, Route 02) sind als ItemList
 *     ausgezeichnet — Google liest das als „TravelRoute" und kann es
 *     als Rich Result anzeigen.
 *
 * Alle visuellen Eigenschaften (Coast-SVG, Topo-Lines, Mawella-Pulse,
 * Cream-Background, EB-Garamond-Body) bleiben identisch zur HTML-
 * Vorlage. Schriften liegen bereits global im index.css-Import.
 */

const COLOR = {
  dark: '#0B0B0C',
  cream: '#F2EDE4',
  cream2: '#F1E9D7',
  ink: '#1C1B17',
  inkSoft: '#5A5448',
  ochre: '#B84A1F',
  rule: 'rgba(28,27,23,.18)',
} as const;

export function LocationPage() {
  const [, navigate] = useRoute();

  // Chameleon-Theme-Detection für den lokalen Header. Identische
  // Implementierung wie in `src/components/TopBar.tsx` — rAF-throttled
  // scroll/resize-Listener, der bei jedem Tick das `data-nav-theme`
  // unter dem Probe-Punkt liest und die Farbe live invertiert.
  const [navTheme, setNavTheme] = useState<NavTheme>('light');
  const navTicking = useRef(false);

  useEffect(() => {
    const update = () => {
      navTicking.current = false;
      setNavTheme(detectNavTheme());
    };
    const onScroll = () => {
      if (navTicking.current) return;
      navTicking.current = true;
      requestAnimationFrame(update);
    };
    const initTimer = setTimeout(update, 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Schrift-Farben aus dem aktuellen Theme — dunkles Ink (#1C1B17)
  // für helle Untergründe, warmes Cream (#F2EDE4) für dunkle.
  const navTextColor = navTheme === 'dark' ? '#F2EDE4' : COLOR.ink;
  const navTextSoftColor =
    navTheme === 'dark' ? 'rgba(242,237,228,0.78)' : COLOR.inkSoft;

  // ---------------------------------------------------------------
  // SEO: Document-Head dynamisch setzen, weil Vite ohne SSR keine
  // statische Per-Route-Meta liefert. Aufräumen bei Unmount, damit die
  // Startseite ihre eigenen Meta-Werte zurückbekommt.
  // ---------------------------------------------------------------
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDescription = metaDesc?.getAttribute('content') ?? null;

    document.title =
      'The Area — Mawella, between Hiriketiya & Tangalle · This Is Not A Hotel\u2122';

    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Mawella, southern Sri Lanka — between Hiriketiya and Tangalle. A quiet kilometre of beach, dense green inland, the perfect stop on the south-coast route. The location of This Is Not A Hotel\u2122.",
      );
    }

    // Canonical für die Subseite. Google soll /location als eigene
    // indexierbare URL behandeln.
    let canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonicalHref = canonical?.href ?? null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/location`;

    // Open-Graph-Update — wichtig für WhatsApp/LinkedIn-Previews,
    // wenn jemand /location direkt teilt.
    const ogTitle = document.querySelector<HTMLMetaElement>(
      'meta[property="og:title"]',
    );
    const ogDesc = document.querySelector<HTMLMetaElement>(
      'meta[property="og:description"]',
    );
    const ogUrl = document.querySelector<HTMLMetaElement>(
      'meta[property="og:url"]',
    );
    const prevOgTitle = ogTitle?.getAttribute('content') ?? null;
    const prevOgDesc = ogDesc?.getAttribute('content') ?? null;
    const prevOgUrl = ogUrl?.getAttribute('content') ?? null;

    ogTitle?.setAttribute(
      'content',
      'The Area — Mawella, between Hiriketiya & Tangalle',
    );
    ogDesc?.setAttribute(
      'content',
      "A quiet kilometre of beach in southern Sri Lanka — the location of This Is Not A Hotel\u2122.",
    );
    ogUrl?.setAttribute('content', `${window.location.origin}/location`);

    // JSON-LD: TouristAttraction (Mawella) verknüpft mit der Hotel-
    // Entity. Wird beim Unmount wieder entfernt.
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'ld-location-page';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      '@id': 'https://thisisnotahotel.com/location#mawella',
      name: 'Mawella Beach',
      description:
        "A quiet kilometre of beach in southern Sri Lanka, between Hiriketiya and Tangalle. The location of This Is Not A Hotel\u2122.",
      url: 'https://thisisnotahotel.com/location',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mawella',
        addressRegion: 'Southern Province',
        addressCountry: 'LK',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 6.0,
        longitude: 80.75,
      },
      containedInPlace: [
        { '@type': 'Place', name: 'Southern Province, Sri Lanka' },
      ],
      isAccessibleForFree: true,
      touristType: ['Beach', 'Quiet retreat', 'Surf-adjacent'],
      nearbyAttractions: [
        { '@type': 'Place', name: 'Hiriketiya Beach' },
        { '@type': 'Place', name: 'Tangalle' },
        { '@type': 'Place', name: 'Dickwella' },
      ],
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDescription !== null) {
        metaDesc.setAttribute('content', prevDescription);
      }
      if (canonical && prevCanonicalHref !== null) {
        canonical.href = prevCanonicalHref;
      }
      if (ogTitle && prevOgTitle !== null) ogTitle.setAttribute('content', prevOgTitle);
      if (ogDesc && prevOgDesc !== null) ogDesc.setAttribute('content', prevOgDesc);
      if (ogUrl && prevOgUrl !== null) ogUrl.setAttribute('content', prevOgUrl);
      const existing = document.getElementById('ld-location-page');
      if (existing) existing.remove();
    };
  }, []);

  // Body-Font für die Subseite ist EB Garamond (matcht das Print-feel
  // der Cream-Section). Wird via globalem Google-Font-Import geladen.
  const bodyStyle = { fontFamily: "'EB Garamond', Georgia, serif" } as const;

  return (
    <div
      // KEIN `data-nav-theme` auf dem Page-Wrapper.
      // Grund: Der Header ist `position: fixed` und steht im DOM
      // INNERHALB dieses Wrappers. Wäre der Wrapper themed, würde
      // `elementsFromPoint` den Header als oberstes Element finden,
      // `closest('[data-nav-theme]')` würde sofort den Wrapper treffen
      // und immer „light" zurückgeben — die dunkle Pause-Section würde
      // nie gefunden. Stattdessen: die Pause-Section trägt ihr eigenes
      // `data-nav-theme="dark"`, alle hellen Sections fallen über den
      // Default-Return ('light') in `detectNavTheme()` durch.
      className="relative min-h-screen w-full"
      style={{
        backgroundColor: COLOR.cream,
        color: COLOR.ink,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ============================================================
          HEADER — transparent + chamäleon-Schrift
          ============================================================
          User-Request 2026-04-27: Hintergrund (Cream-Gradient + Blur)
          komplett entfernt. Schrift wechselt live zwischen dunkel
          (#1C1B17) auf hellen Sections und hell (#F2EDE4) auf dunklen
          Sections — getriggert über den `navTheme`-State, der via
          `elementsFromPoint` an Position (centerX, 36px) das
          `data-nav-theme` der Section unter der Bar liest.
          Identisches Pattern wie auf der Hauptseite (TopBar.tsx). */}
      <header
        role="banner"
        aria-label="Location-Subseite Navigation"
        className="fixed top-0 left-0 right-0 z-[100] grid grid-cols-[auto_1fr_auto] items-center bg-transparent"
        style={{
          padding: '3vh 4vw 1.6vh',
          paddingTop: 'calc(env(safe-area-inset-top) + 3vh)',
          transition: 'color .3s ease-out',
          gap: '2vw',
        }}
      >
        {/* Instagram-Icon links (User-Request 2026-04-28). */}
        <a
          href="https://www.instagram.com/thisisnotahotel/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram · This Is Not A Hotel"
          className="transition-colors duration-300"
          style={{ color: navTextColor, lineHeight: 0 }}
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
        <div
          className="font-stencil uppercase transition-colors duration-300"
          style={{
            color: navTextColor,
            fontSize: 11,
            letterSpacing: '0.22em',
          }}
        >
          THIS&nbsp;IS&nbsp;NOT&nbsp;A&nbsp;HOTEL
          <sup
            className="align-top ml-[0.15em]"
            style={{ fontSize: '0.75em', letterSpacing: 0 }}
          >
            ™
          </sup>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-stencil uppercase transition-colors duration-300 cursor-pointer justify-self-end"
          style={{
            color: navTextSoftColor,
            fontSize: 11,
            letterSpacing: '0.22em',
            background: 'transparent',
            border: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = navTextColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = navTextSoftColor)}
          aria-label="Back to TINAH home"
        >
          <span aria-hidden style={{ marginRight: '0.6em' }}>
            ←
          </span>
          Back
        </button>
      </header>

      {/* ============================================================
          INTRO
          ============================================================ */}
      <section
        className="mx-auto text-center"
        style={{ padding: '24vh 6vw 8vh', maxWidth: 1100 }}
        aria-label="Mawella — introduction"
      >
        {/* Eyebrow */}
        <div
          className="font-stencil uppercase inline-flex items-center"
          style={{
            fontSize: 11,
            letterSpacing: '0.28em',
            color: COLOR.inkSoft,
            gap: 14,
            marginBottom: '5vh',
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 32,
              height: 1,
              backgroundColor: COLOR.ink,
            }}
          />
          § I — The House
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 32,
              height: 1,
              backgroundColor: COLOR.ink,
            }}
          />
        </div>

        <h1
          className="font-stencil"
          style={{
            fontSize: 'clamp(34px, 6vw, 84px)',
            lineHeight: 1.04,
            letterSpacing: '0.02em',
            color: COLOR.ink,
            margin: 0,
          }}
        >
          A long, quiet beach
          <br />
          between <span style={{ color: COLOR.ochre }}>Hiriketiya</span>
          <br />
          and <span style={{ color: COLOR.ochre }}>Tangalle</span>.
        </h1>

        <p
          className="mx-auto"
          style={{
            ...bodyStyle,
            marginTop: '5vh',
            maxWidth: 560,
            fontSize: 'clamp(13px, 1vw, 16px)',
            lineHeight: 1.6,
            color: COLOR.inkSoft,
          }}
        >
          Mawella is the part of Sri Lanka&apos;s south coast nobody seems to
          write about, and that is the point. A kilometre of soft sand, a
          green inland full of wildlife, far enough from Hiriketiya and
          Mirissa to feel like you have actually arrived somewhere.
        </p>
      </section>

      {/* ============================================================
          MAP — Southern Sri Lanka, coast + stops
          ============================================================ */}
      <section
        className="relative mx-auto w-full"
        style={{ maxWidth: 1300, margin: '6vh auto 0', padding: '0 6vw' }}
        aria-label="Map of southern Sri Lanka with travel stops"
      >
        <div
          className="relative w-full"
          style={{ aspectRatio: '1200 / 800' }}
        >
          <svg
            viewBox="0 0 1200 800"
            role="img"
            aria-labelledby="mapTitle mapDesc"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              overflow: 'visible',
            }}
          >
            <title id="mapTitle">Southern Sri Lanka — coast and stops</title>
            <desc id="mapDesc">
              An outline of the southern coast of Sri Lanka showing
              Colombo, Ahangama, Weligama, Hiriketiya, Mawella, Tangalle,
              and the inland town of Ella, with This Is Not A Hotel marked
              at Mawella.
            </desc>

            <defs>
              <radialGradient id="locFade" cx="70%" cy="92%" r="78%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="55%" stopColor="#fff" stopOpacity=".95" />
                <stop offset="85%" stopColor="#fff" stopOpacity=".25" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="locFadeMask">
                <rect
                  x="-100"
                  y="-100"
                  width="1400"
                  height="1000"
                  fill="url(#locFade)"
                />
              </mask>
            </defs>

            <g mask="url(#locFadeMask)">
              {/* Topo / contour suggestion lines */}
              <g
                aria-hidden="true"
                fill="none"
                stroke={COLOR.ink}
                strokeWidth={0.6}
                opacity={0.18}
                strokeDasharray="2 4"
              >
                <path d="M 200 220 C 350 280, 600 320, 850 280 S 1100 350, 1180 320" />
                <path d="M 180 320 C 320 380, 560 420, 800 380 S 1080 460, 1180 430" />
                <path d="M 220 480 C 360 540, 600 580, 860 540 S 1100 580, 1180 560" />
                <path d="M 280 640 C 420 680, 600 700, 880 680 S 1100 700, 1180 690" />
              </g>

              {/* Coast glow */}
              <path
                d="M 80 200 C 100 260, 115 330, 140 380 C 160 420, 185 470, 220 540 C 245 600, 290 660, 360 695 C 410 715, 470 728, 528 742 C 580 748, 640 748, 700 745 C 760 742, 815 738, 870 720 C 930 705, 985 705, 1040 700 C 1080 695, 1115 685, 1145 660 C 1170 630, 1180 600, 1175 560"
                fill="none"
                stroke={COLOR.ink}
                strokeWidth={5}
                opacity={0.06}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Coast */}
              <path
                d="M 80 200 C 100 260, 115 330, 140 380 C 160 420, 185 470, 220 540 C 245 600, 290 660, 360 695 C 410 715, 470 728, 528 742 C 580 748, 640 748, 700 745 C 760 742, 815 738, 870 720 C 930 705, 985 705, 1040 700 C 1080 695, 1115 685, 1145 660 C 1170 630, 1180 600, 1175 560"
                fill="none"
                stroke={COLOR.ink}
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Inland border hint */}
              <path
                d="M 100 200 C 250 180, 500 170, 800 180 S 1100 220, 1175 260"
                fill="none"
                stroke={COLOR.ink}
                strokeWidth={0.6}
                opacity={0.18}
                strokeDasharray="2 4"
              />

              {/* Route 1 */}
              <path
                d="M 120 276 C 200 380, 280 540, 416 713 C 470 728, 528 742, 608 742 C 700 745, 780 745, 840 730"
                fill="none"
                stroke={COLOR.ochre}
                strokeWidth={1}
                strokeDasharray="3 5"
                opacity={0.5}
              />
              {/* Route 2 */}
              <path
                d="M 120 276 C 400 180, 800 200, 1080 305 C 1020 480, 950 600, 840 730"
                fill="none"
                stroke={COLOR.ochre}
                strokeWidth={1}
                strokeDasharray="3 5"
                opacity={0.5}
              />

              {/* ===== STOPS ===== */}
              <g transform="translate(120 276)">
                <circle
                  r={4}
                  fill={COLOR.cream}
                  stroke={COLOR.ink}
                  strokeWidth={1.2}
                />
                <text
                  x={-12}
                  y={-12}
                  textAnchor="end"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={1.76}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  Colombo
                </text>
              </g>

              <g transform="translate(416 713)" opacity={0.55}>
                <circle
                  r={3}
                  fill={COLOR.cream}
                  stroke={COLOR.ink}
                  strokeWidth={1.2}
                />
                <text
                  x={-10}
                  y={18}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={1.76}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  Galle
                </text>
              </g>

              <g transform="translate(528 742)">
                <circle
                  r={3.5}
                  fill={COLOR.cream}
                  stroke={COLOR.ink}
                  strokeWidth={1.2}
                />
                <text
                  x={-10}
                  y={22}
                  textAnchor="end"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={1.76}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  Ahangama
                </text>
              </g>

              <g transform="translate(594 745)">
                <circle
                  r={3.5}
                  fill={COLOR.cream}
                  stroke={COLOR.ink}
                  strokeWidth={1.2}
                />
                <text
                  x={0}
                  y={32}
                  textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={1.76}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  Weligama
                </text>
              </g>

              <g transform="translate(770 745)">
                <circle
                  r={3.5}
                  fill={COLOR.cream}
                  stroke={COLOR.ink}
                  strokeWidth={1.2}
                />
                <text
                  x={-10}
                  y={22}
                  textAnchor="end"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={1.76}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  Hiriketiya
                </text>
              </g>

              <g transform="translate(900 715)">
                <circle
                  r={3.5}
                  fill={COLOR.cream}
                  stroke={COLOR.ink}
                  strokeWidth={1.2}
                />
                <text
                  x={14}
                  y={6}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={1.76}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  Tangalle
                </text>
              </g>

              {/* Ella (inland) */}
              <g transform="translate(1080 305)">
                <circle
                  r={3.5}
                  fill={COLOR.cream}
                  stroke={COLOR.inkSoft}
                  strokeWidth={1.2}
                  strokeDasharray="2 2"
                />
                <text
                  x={14}
                  y={-6}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={11}
                  letterSpacing={1.76}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  Ella
                </text>
                <text
                  x={14}
                  y={12}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={9}
                  letterSpacing={1.5}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  — inland
                </text>
              </g>

              {/* ===== MAWELLA HIGHLIGHT — SONAR ANIMATION =====
                  User-Request 2026-04-27: der rote Mawella-Punkt soll
                  als „Sonar"/„Radar" pulsieren. Drei konzentrische
                  Ringe expandieren vom Punkt aus nach außen (Keyframes
                  in index.css: `mawella-sonar`, mit gestaffelten
                  Delays). Der zentrale Punkt selbst pulsiert leicht
                  mit (`mawella-dot-pulse`), damit er als aktive
                  Quelle wahrgenommen wird. */}
              <g transform="translate(840 730)">
                <circle
                  r={42}
                  fill="none"
                  stroke={COLOR.ochre}
                  strokeWidth={1}
                  className="mawella-sonar"
                />
                <circle
                  r={42}
                  fill="none"
                  stroke={COLOR.ochre}
                  strokeWidth={1}
                  className="mawella-sonar delay-1"
                />
                <circle
                  r={42}
                  fill="none"
                  stroke={COLOR.ochre}
                  strokeWidth={1}
                  className="mawella-sonar delay-2"
                />
                <circle
                  r={22}
                  fill="none"
                  stroke={COLOR.ochre}
                  strokeWidth={1}
                  opacity={0.45}
                />
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={-90}
                  fill="none"
                  stroke={COLOR.ochre}
                  strokeWidth={1}
                />
                <circle r={6} fill={COLOR.ochre} className="mawella-dot-pulse" />
                <text
                  x={0}
                  y={-100}
                  textAnchor="middle"
                  fontFamily="'Allerta Stencil', sans-serif"
                  fontSize={13}
                  letterSpacing={2.86}
                  fill={COLOR.ochre}
                  style={{ textTransform: 'uppercase' }}
                >
                  This Is Not A Hotel
                  {/* Trademark direkt am Wordmark — User-Request
                      2026-04-27: ™ überall am Logo. baseline-shift +
                      kleinere Font-Size emuliert superscript-Optik in
                      SVG. */}
                  <tspan
                    fontSize={8}
                    dy={-4}
                    style={{ letterSpacing: 0 }}
                  >
                    ™
                  </tspan>
                </text>
                <text
                  x={0}
                  y={-118}
                  textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={10}
                  letterSpacing={1.8}
                  fill={COLOR.inkSoft}
                  style={{ textTransform: 'uppercase' }}
                >
                  06°00&apos;N · 80°45&apos;E
                </text>
                <text
                  x={0}
                  y={22}
                  textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={10}
                  letterSpacing={1.8}
                  fill={COLOR.ochre}
                  style={{ textTransform: 'uppercase' }}
                >
                  Mawella
                </text>
              </g>
            </g>

            {/* Compass + scale (outside fade mask, always crisp) */}
            <g transform="translate(80 720)">
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={-32}
                stroke={COLOR.ink}
                strokeWidth={1}
              />
              <polygon points="0,-38 -4,-30 4,-30" fill={COLOR.ink} />
              <text
                x={0}
                y={-44}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={9}
                letterSpacing={2.7}
                fill={COLOR.inkSoft}
                style={{ textTransform: 'uppercase' }}
              >
                N
              </text>
            </g>
            <g transform="translate(80 760)">
              <line
                x1={0}
                y1={0}
                x2={160}
                y2={0}
                stroke={COLOR.ink}
                strokeWidth={1}
              />
              <line x1={0} y1={-3} x2={0} y2={3} stroke={COLOR.ink} strokeWidth={1} />
              <line x1={80} y1={-3} x2={80} y2={3} stroke={COLOR.ink} strokeWidth={1} />
              <line
                x1={160}
                y1={-3}
                x2={160}
                y2={3}
                stroke={COLOR.ink}
                strokeWidth={1}
              />
              <text
                x={0}
                y={16}
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={9}
                letterSpacing={2.7}
                fill={COLOR.inkSoft}
              >
                0
              </text>
              <text
                x={80}
                y={16}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={9}
                letterSpacing={2.7}
                fill={COLOR.inkSoft}
              >
                25
              </text>
              <text
                x={160}
                y={16}
                textAnchor="end"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={9}
                letterSpacing={2.7}
                fill={COLOR.inkSoft}
              >
                50 km
              </text>
            </g>
          </svg>
        </div>
      </section>

      {/* ============================================================
          BODY — editorial copy (EB Garamond)
          ============================================================ */}
      <section
        className="mx-auto"
        style={{ padding: '14vh 6vw 6vh', maxWidth: 780 }}
        aria-label="The kind of place built for the second week of a trip"
      >
        <div
          className="font-stencil uppercase inline-flex items-center"
          style={{
            fontSize: 11,
            letterSpacing: '0.28em',
            color: COLOR.inkSoft,
            gap: 14,
            marginBottom: '4vh',
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 32,
              height: 1,
              backgroundColor: COLOR.ink,
            }}
          />
          § I.a — Place &amp; Pace
        </div>

        <h2
          className="font-stencil"
          style={{
            fontSize: 'clamp(26px, 3.6vw, 52px)',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
            color: COLOR.ink,
            maxWidth: '14ch',
            margin: 0,
          }}
        >
          The kind of place built for the{' '}
          <span style={{ color: COLOR.ochre }}>second week</span> of a trip.
        </h2>

        <div
          style={{
            ...bodyStyle,
            marginTop: '5vh',
            fontSize: 'clamp(16px, 1.25vw, 21px)',
            lineHeight: 1.65,
            color: COLOR.ink,
            maxWidth: '62ch',
          }}
        >
          <p style={{ margin: 0 }}>
            The Mawella beach runs for more than a kilometre. Soft, slow,
            mostly empty. A few fishermen at one end pulling in their nets
            at first light, peacocks crossing the gardens at the other.
            The road thins down to a sand track before it reaches the
            gate, which is part of why no one comes here by accident.
          </p>
          <p style={{ margin: '1.4em 0 0' }}>
            The inland behind the dunes is dense and green. Monkeys cross
            the lane in the morning, peacocks step out of the brush at
            dusk, and the air carries the sound of temple bells from two
            villages over. Ten minutes from Hiriketiya and ten from
            Tangalle. Far enough from anywhere to actually feel quiet.
          </p>
          <p style={{ margin: '1.4em 0 0' }}>
            It is the kind of place built for the second week of a trip.
            After the surf and parties in{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>
              Hiriketiya
            </em>
            , the tea fields above{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>Ella</em>
            , the markets in{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>Galle</em>
            , what most people need next is not another itinerary. They
            need a long table, a slow breakfast, a kilometre of sand to
            walk and nothing in particular to do.
          </p>
        </div>
      </section>

      {/* ============================================================
          ROUTES — two columns
          ============================================================ */}
      <section
        className="mx-auto"
        style={{ padding: '8vh 6vw 14vh', maxWidth: 1100 }}
        aria-label="Routes to Mawella"
      >
        <div
          className="font-stencil uppercase inline-flex items-center"
          style={{
            fontSize: 11,
            letterSpacing: '0.28em',
            color: COLOR.inkSoft,
            gap: 14,
            marginBottom: '5vh',
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 32,
              height: 1,
              backgroundColor: COLOR.ink,
            }}
          />
          § I.b — How to Arrive
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '5vw' }}>
          {/* User-Request 2026-04-27: Travel-Notes (italic „note"-Block
              unter jeder Route) komplett entfernt. RouteCards zeigen
              jetzt nur noch Stop-Liste und Highlight, ohne narrative
              Reise-Beschreibung. */}
          <RouteCard
            number="Route 01"
            title="Colombo, down the south coast."
            stops={[
              'Colombo',
              'Bentota',
              'Hikkaduwa',
              'Galle',
              'Ahangama',
              'Weligama',
              'Hiriketiya',
            ]}
            highlight="Mawella"
            tail={['Tangalle']}
          />
          <RouteCard
            number="Route 02"
            title="Through the hills, then down to the sea."
            stops={[
              'Colombo',
              'Sigiriya',
              'Kandy',
              'Ella',
              'Tissamaharama',
              'Tangalle',
            ]}
            highlight="Mawella"
            tail={['Hiriketiya']}
          />
        </div>
      </section>

      {/* ============================================================
          FOOTER PAUSE CTA
          ============================================================
          User-Request 2026-04-27: Hintergrund-Foto „Window.JPG" füllt
          die Section komplett aus. Das Bild zeigt den Blick aus einem
          TINAH-Fenster — passt perfekt zur „Pause"-Erzählung
          (Innehalten, hinausschauen, ankommen). SEO-relevant über
          beschreibendes alt-Tag + lazy/async loading.

          Text-Farben sind invertiert (helle Schrift auf dunklem
          Photo-Overlay), CircleCTA wechselt von `glass-on-light` auf
          `glass` (heller Border, weiße Schrift), und „Back to TINAH"
          bekommt warm-weiße Tönung. data-nav-theme="dark" damit die
          chamäleon-TopBar oben helle Schrift fährt, sobald sie über
          dieses Foto scrollt. */}
      <section
        className="relative text-center overflow-hidden"
        data-nav-theme="dark"
        style={{
          padding: '14vh 6vw 12vh',
          // Fallback-Hintergrund während das Foto lädt — gleiches
          // warmes Cream wie zuvor, damit kein „Flash of Cream"
          // entsteht.
          backgroundColor: COLOR.cream2,
        }}
        aria-label="Pause now — book your stay at This Is Not A Hotel, Mawella, Sri Lanka"
      >
        {/* Foto-Hintergrund — füllt die Section komplett. */}
        <img
          src="/images/Window.JPG"
          alt="Blick aus einem Fenster im This Is Not A Hotel — Mawella Beach, Sri Lanka, ruhiger Pause-Moment am Meer"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        {/* Dunkles Overlay für Text-Lesbarkeit ohne das Foto zu
            erschlagen — leichte Vignette nach oben und unten,
            mittig airy, damit der Look weiterhin „Cream-Section
            mit Foto-Akzent" bleibt und nicht zu kinematisch wird. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(11,11,12,0.55) 0%, rgba(11,11,12,0.35) 45%, rgba(11,11,12,0.6) 100%)',
          }}
        />

        {/* Eigentlicher Section-Inhalt — relativ positioniert über
            dem Overlay. */}
        <div className="relative z-10">
          <div
            className="uppercase"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.28em',
              color: 'rgba(242,237,228,0.78)',
              marginBottom: '4vh',
            }}
          >
            § I.c — The Pause
          </div>
          <h2
            className="font-stencil mx-auto"
            style={{
              fontSize: 'clamp(28px, 4vw, 56px)',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
              color: '#F2EDE4',
              maxWidth: '14ch',
              margin: 0,
            }}
          >
            The stop in Mawella is,{' '}
            <span style={{ color: COLOR.ochre }}>on balance,</span> non-negotiable.
          </h2>
          <div
            className="flex items-center justify-center flex-wrap"
            style={{ marginTop: '6vh', gap: 24 }}
          >
            {/* CircleCTA jetzt in `glass`-Variante — heller Border,
                weiße Schrift, passt zum dunklen Photo-Overlay. */}
            <CircleCTA
              text="PAUSE NOW"
              variant="glass"
              size="sm"
              onClick={() => {
                navigate('/');
                // setTimeout damit der Render-Tick zuerst stattfindet,
                // bevor wir das Smooth-Scroll-Target im neuen Layout
                // suchen.
                setTimeout(() => {
                  const book = document.getElementById('book');
                  if (book) book.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
            />
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-stencil uppercase cursor-pointer"
              style={{
                fontSize: 11,
                letterSpacing: '0.22em',
                color: 'rgba(242,237,228,0.78)',
                borderBottom: '1px solid rgba(242,237,228,0.35)',
                paddingBottom: 4,
                transition: 'color .3s, border-color .3s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(242,237,228,0.78)';
                e.currentTarget.style.borderColor = 'rgba(242,237,228,0.35)';
              }}
            >
              Back to TINAH
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          DARK FOOTER
          ============================================================ */}
      <footer
        className="flex justify-between items-center flex-wrap"
        style={{
          backgroundColor: COLOR.dark,
          color: '#D9D9D9',
          padding: '32px 6vw',
          gap: 16,
        }}
      >
        <div
          className="font-stencil uppercase"
          style={{ fontSize: 13, letterSpacing: '0.22em', color: '#fff' }}
        >
          THIS IS NOT A HOTEL
          <sup
            className="align-top ml-[0.15em]"
            style={{ fontSize: '0.75em', letterSpacing: 0 }}
          >
            ™
          </sup>{' '}
          · Mawella
        </div>
        <a
          href="https://www.instagram.com/thisisnotahotel/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram · This Is Not A Hotel"
          className="text-[#D9D9D9] hover:text-white transition-colors"
          style={{ lineHeight: 0 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={18}
            height={18}
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
        <div style={{ fontSize: 12 }}>
          © 2026 This Is Not A Hotel
          <sup
            className="align-top ml-[0.1em]"
            style={{ fontSize: '0.75em', letterSpacing: 0 }}
          >
            ™
          </sup>
          . Mawella, Sri Lanka.
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------
// Route card — typografische Karte mit Nummer, Titel und Stops.
// Highlight zeigt unsere Position in der Route (Mawella) in Ochre.
// User-Request 2026-04-27: travel-`note` (italic Beschreibung unter
// der Stop-Liste) komplett entfernt — Karte endet jetzt mit der
// Stop-Liste, kein erzählender Reisetext mehr.
// ---------------------------------------------------------------
interface RouteCardProps {
  number: string;
  title: string;
  stops: string[];
  highlight: string;
  tail?: string[];
}

function RouteCard({ number, title, stops, highlight, tail = [] }: RouteCardProps) {
  return (
    <article
      style={{
        padding: '5vh 0',
        borderTop: `1px solid ${COLOR.rule}`,
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.22em',
          color: COLOR.ochre,
        }}
      >
        {number}
      </div>
      <h3
        className="font-stencil"
        style={{
          marginTop: '1.2em',
          fontSize: 'clamp(20px, 2.2vw, 30px)',
          letterSpacing: '0.02em',
          color: COLOR.ink,
          marginBottom: 0,
        }}
      >
        {title}
      </h3>
      <div
        style={{
          marginTop: '2.4em',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: COLOR.ink,
          lineHeight: 1.9,
        }}
      >
        {stops.map((stop) => (
          <div key={stop}>{stop}</div>
        ))}
        <div style={{ color: COLOR.ochre, fontWeight: 500 }}>
          <span style={{ color: COLOR.ochre }}>→ </span>
          {highlight}
        </div>
        {tail.map((stop) => (
          <div key={stop}>{stop}</div>
        ))}
      </div>
    </article>
  );
}
