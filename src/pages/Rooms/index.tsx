import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../../hooks/use-route';
import { CircleCTA } from '../../components/CircleCTA';

// ---------------------------------------------------------------
// Chameleon-Header — identisches Pattern wie auf /location und in
// der globalen TopBar.tsx. Lokal dupliziert, weil /rooms eine eigene
// Subseite mit eigenem schmaleren Header (THIS IS NOT A HOTEL™
// links, ← Back rechts) hat. Probe-Punkt sitzt bei Y = 36 px,
// läuft den Element-Stack hoch, überspringt den Header selbst,
// liest das erste data-nav-theme darunter.
// ---------------------------------------------------------------
const NAV_PROBE_Y = 36;
type NavTheme = 'dark' | 'light';

function detectNavTheme(): NavTheme {
  if (typeof document === 'undefined') return 'light';
  const x = window.innerWidth / 2;
  const stack = document.elementsFromPoint(x, NAV_PROBE_Y);
  for (const el of stack) {
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
 * /rooms — dedizierte Subseite „The Rooms".
 *
 * Iteration 2026-04-28 (User-Request „minimalistischer, verkürzt"):
 *   Vorher: fünf einzeln benannte Zimmer mit eigenen Editorial-Cards
 *   („The Long Window", „The Sand Door", …). User-Feedback: Gäste
 *   sollen NICHT verschiedene Zimmer wählen, sondern die Atmosphäre
 *   spüren. Die Seite ist jetzt eine ruhige Foto-Galerie mit einer
 *   einzigen Aussage: Balance, Ruhe, Wohlempfinden.
 *
 * Aufbau:
 *   1. Transparenter Chameleon-Header (Wordmark + Back).
 *   2. Cream-Intro: § II — The Rooms · Stencil-Headline · kurzer Lead.
 *   3. Foto-Galerie aus den fünf Bildern (room3.JPG bis room7.JPG)
 *      in einer asymmetrischen, atmenden Editorial-Komposition.
 *   4. Closing-Statement (eine Zeile EB Garamond).
 *   5. Pause-CTA-Section (dunkles Window.JPG, Reserve-Disc).
 *   6. Dunkler Footer mit Instagram-Link.
 *
 * SEO:
 *   - Eigener Document-Title und Meta-Description fokussiert auf
 *     Long-Tail „minimalist beach hotel rooms Sri Lanka",
 *     „balance wellbeing Mawella beach", „quiet retreat rooms".
 *   - Canonical zeigt auf /rooms.
 *   - JSON-LD HotelRoom als Aggregat (eine Entität, nicht fünf
 *     einzelne Zimmer-IDs), passend zum „atmospheric, not catalogue"
 *     Ansatz.
 *   - Alle img-Tags mit beschreibendem alt-Text für den Google
 *     Image Index.
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

const INSTAGRAM_URL = 'https://www.instagram.com/thisisnotahotelsl/';

interface GalleryImage {
  src: string;
  alt: string;
  /** Tailwind aspect ratio class for variety in the editorial flow. */
  aspect: string;
}

const GALLERY: GalleryImage[] = [
  {
    src: '/images/room3.JPG',
    alt: 'Helles Schlafzimmer im This Is Not A Hotel mit Blick zur Mawella-Küste, weißes Bett, warme Holztöne, Sri Lanka',
    aspect: '4 / 5',
  },
  {
    src: '/images/room4.JPG',
    alt: 'Ruhiges Hotelzimmer im This Is Not A Hotel, leinene Vorhänge, Zugang zum Strand, südliche Küste Sri Lankas',
    aspect: '4 / 5',
  },
  {
    src: '/images/room5.JPG',
    alt: 'Garten-Schlafzimmer im This Is Not A Hotel mit tropischem Grün, kühle Wände, minimalistisches Bett, Mawella',
    aspect: '4 / 5',
  },
  {
    src: '/images/room6.jpg',
    alt: 'Lichtdurchflutetes Zimmer im This Is Not A Hotel mit Garten- und Pool-Blick, Naturmaterialien, südliches Sri Lanka',
    aspect: '4 / 5',
  },
  {
    src: '/images/room7.JPG',
    alt: 'Schlafzimmer im This Is Not A Hotel mit Spätnachmittagslicht, ruhige Atmosphäre, Mawella Beach, Sri Lanka',
    aspect: '4 / 5',
  },
];

export function RoomsPage() {
  const [, navigate] = useRoute();

  // Chameleon-Theme-State für den lokalen Header.
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

  const navTextColor = navTheme === 'dark' ? '#F2EDE4' : COLOR.ink;
  const navTextSoftColor =
    navTheme === 'dark' ? 'rgba(242,237,228,0.78)' : COLOR.inkSoft;

  // SEO Document Head
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const prevDescription = metaDesc?.getAttribute('content') ?? null;

    document.title =
      'The Rooms · Quiet rooms on Mawella Beach · This Is Not A Hotel™';

    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Quiet rooms on Mawella Beach in southern Sri Lanka. Linen, warm timber, the sound of the surf. Designed for balance and a slower kind of wellbeing. The rooms of This Is Not A Hotel™.',
      );
    }

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonicalHref = canonical?.href ?? null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/rooms`;

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

    ogTitle?.setAttribute('content', 'The Rooms · Mawella Beach, Sri Lanka');
    ogDesc?.setAttribute(
      'content',
      'Quiet, light, designed for balance. The rooms of This Is Not A Hotel™ on Mawella Beach.',
    );
    ogUrl?.setAttribute('content', `${window.location.origin}/rooms`);

    // JSON-LD: Aggregierte Hotel-Entity mit images und touristType,
    // statt fünf separate Zimmer-IDs (User-Wunsch: keine
    // „Catalog"-Optik).
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'ld-rooms-page';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      '@id': 'https://thisisnotahotel.com/rooms#hotel',
      name: 'This Is Not A Hotel™',
      description:
        'Quiet rooms on Mawella Beach in southern Sri Lanka, designed for balance and wellbeing.',
      url: 'https://thisisnotahotel.com/rooms',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mawella',
        addressRegion: 'Southern Province',
        addressCountry: 'LK',
      },
      image: GALLERY.map((g) => `https://thisisnotahotel.com${g.src}`),
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Beach access' },
        { '@type': 'LocationFeatureSpecification', name: 'Garden' },
        { '@type': 'LocationFeatureSpecification', name: 'Yoga' },
        { '@type': 'LocationFeatureSpecification', name: 'Quiet retreat' },
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
      const existing = document.getElementById('ld-rooms-page');
      if (existing) existing.remove();
    };
  }, []);

  const bodyStyle = { fontFamily: "'EB Garamond', Georgia, serif" } as const;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        backgroundColor: COLOR.cream,
        color: COLOR.ink,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ============================================================
          HEADER — transparent + chameleon
          ============================================================ */}
      <header
        role="banner"
        aria-label="Rooms-Subseite Navigation"
        className="fixed top-0 left-0 right-0 z-[100] grid grid-cols-[auto_1fr_auto] items-center bg-transparent"
        style={{
          padding: '3vh 4vw 1.6vh',
          paddingTop: 'calc(env(safe-area-inset-top) + 3vh)',
          transition: 'color .3s ease-out',
          gap: '2vw',
        }}
      >
        {/* Instagram-Icon links — User-Request 2026-04-28: Instagram in
            der Oberleiste, links neben dem Hotel-Namen. */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram · This Is Not A Hotel"
          className="transition-colors duration-300"
          style={{ color: navTextColor, lineHeight: 0 }}
        >
          <InstagramIcon />
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
          INTRO — § II — The Rooms
          ============================================================ */}
      <section
        className="mx-auto text-center"
        style={{ padding: '24vh 6vw 6vh', maxWidth: 980 }}
        aria-label="The Rooms — introduction"
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
          § II — The Rooms
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
            fontSize: 'clamp(34px, 6vw, 80px)',
            lineHeight: 1.04,
            letterSpacing: '0.02em',
            color: COLOR.ink,
            margin: 0,
          }}
        >
          Built for{' '}
          <span style={{ color: COLOR.ochre }}>balance</span>.
          <br />
          Built for{' '}
          <span style={{ color: COLOR.ochre }}>rest</span>.
        </h1>

        <p
          className="mx-auto"
          style={{
            ...bodyStyle,
            marginTop: '4.5vh',
            maxWidth: 600,
            fontSize: 'clamp(15px, 1.1vw, 19px)',
            lineHeight: 1.65,
            color: COLOR.ink,
          }}
        >
          Linen, warm timber, stone underfoot. Light that arrives slowly and
          stays. The rooms are quiet on purpose, so the days can be too. You
          come for sleep, for an unhurried morning, for the kind of wellbeing
          you cannot schedule into an itinerary. We hold the room. The
          ocean does the rest.
        </p>
      </section>

      {/* ============================================================
          GALLERY — fünf Fotos in atmender Editorial-Komposition
          ============================================================
          Layout-Idee: erstes Foto vollbreit (Hero-Bild), dann zwei
          Fotos nebeneinander, dann ein Foto vollbreit, dann das
          letzte Foto vollbreit. Ergibt einen ruhigen 1-2-1-1-Rhythmus,
          der die Augen führt ohne Catalogue-Optik. */}
      <section
        className="mx-auto"
        style={{ padding: '4vh 6vw 8vh', maxWidth: 1200 }}
        aria-label="Photo gallery — quiet rooms at This Is Not A Hotel"
      >
        {/* Foto 1 — vollbreit */}
        <GalleryFigure image={GALLERY[0]} aspect="3 / 2" />

        {/* Fotos 2 + 3 — Side by Side */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 'clamp(20px, 3vw, 40px)', marginTop: 'clamp(20px, 3vw, 40px)' }}
        >
          <GalleryFigure image={GALLERY[1]} aspect="4 / 5" />
          <GalleryFigure image={GALLERY[2]} aspect="4 / 5" />
        </div>

        {/* Foto 4 — vollbreit */}
        <div style={{ marginTop: 'clamp(20px, 3vw, 40px)' }}>
          <GalleryFigure image={GALLERY[3]} aspect="3 / 2" />
        </div>

        {/* Foto 5 — vollbreit */}
        <div style={{ marginTop: 'clamp(20px, 3vw, 40px)' }}>
          <GalleryFigure image={GALLERY[4]} aspect="3 / 2" />
        </div>
      </section>

      {/* ============================================================
          CLOSING STATEMENT — eine Zeile
          ============================================================ */}
      <section
        className="mx-auto text-center"
        style={{ padding: '8vh 6vw 12vh', maxWidth: 700 }}
        aria-label="Closing note"
      >
        <p
          style={{
            ...bodyStyle,
            fontSize: 'clamp(18px, 1.6vw, 26px)',
            lineHeight: 1.5,
            color: COLOR.ink,
            margin: 0,
          }}
        >
          One house. A handful of rooms. Each one a quiet way of saying:{' '}
          <em style={{ fontStyle: 'italic', color: COLOR.ochre }}>
            stay a while
          </em>
          .
        </p>
      </section>

      {/* ============================================================
          PAUSE CTA — dunkles Window.JPG-Foto-Overlay
          ============================================================ */}
      <section
        className="relative text-center overflow-hidden"
        data-nav-theme="dark"
        style={{
          padding: '14vh 6vw 12vh',
          backgroundColor: COLOR.dark,
        }}
        aria-label="Reserve a stay at This Is Not A Hotel, Mawella, Sri Lanka"
      >
        <img
          src="/images/Window.JPG"
          alt="Blick aus einem Fenster im This Is Not A Hotel, Einladung zur Reservierung auf Mawella Beach, Sri Lanka"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(11,11,12,0.65) 0%, rgba(11,11,12,0.45) 45%, rgba(11,11,12,0.7) 100%)',
          }}
        />

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
            § II.a — Reserve
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
            Pick a week.{' '}
            <span style={{ color: COLOR.ochre }}>Pause.</span>
          </h2>
          <div
            className="flex items-center justify-center flex-wrap"
            style={{ marginTop: '6vh', gap: 24 }}
          >
            <CircleCTA
              text="RESERVE"
              variant="glass"
              size="sm"
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  const book = document.getElementById('book');
                  if (book)
                    book.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          DARK FOOTER — Wordmark + Instagram + Copyright
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
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram · This Is Not A Hotel"
          className="text-[#D9D9D9] hover:text-white transition-colors"
          style={{ lineHeight: 0 }}
        >
          <InstagramIcon />
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
// GalleryFigure — dezente Foto-Karte mit aspect-ratio Container,
// Cream-Schatten, lazy + async loading. Aspect-Ratio steuert die
// Höhe für eine ruhige editorial Sequenz.
// ---------------------------------------------------------------
function GalleryFigure({
  image,
  aspect,
}: {
  image: GalleryImage;
  aspect: string;
}) {
  return (
    <figure
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: aspect,
        boxShadow: '0 30px 60px -30px rgba(28,27,23,.25)',
        margin: 0,
      }}
    >
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center' }}
      />
    </figure>
  );
}

// ---------------------------------------------------------------
// InstagramIcon — Inline-SVG, currentColor-aware. Klein gehalten
// (16 px) damit es typografisch zu den 11-px-Stencil-Labels passt.
// ---------------------------------------------------------------
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
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
  );
}
