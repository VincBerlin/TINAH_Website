import { useEffect, useRef, useState } from 'react';
import { useRoute } from '../../hooks/use-route';
import { CircleCTA } from '../../components/CircleCTA';

// ---------------------------------------------------------------
// Chameleon-Header — identisches Pattern wie auf /location und in
// der globalen TopBar.tsx (siehe dort für die Erklärung). Lokal
// dupliziert, weil /rooms eine eigene Subseite mit eigenem
// schmaleren Header (THIS IS NOT A HOTEL™ links · ← Back rechts)
// hat. Probe-Punkt sitzt bei Y = 36 px, läuft den Element-Stack
// hoch, überspringt den Header selbst, liest das erste
// `data-nav-theme` darunter.
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
 * Designsprache identisch zur Homepage und zur /location-Subseite:
 *   - Cream-Background (#F2EDE4) als Hauptbühne, Cream2 (#F1E9D7)
 *     als alternierende Section-Farbe für visuelle Pause-Punkte
 *     zwischen den Zimmer-Karten.
 *   - Allerta Stencil für Überschriften (Brand-Guideline), IBM Plex
 *     Mono für Eyebrows / Mikrolabels, EB Garamond für Body-Copy.
 *   - Chameleon-Header (dunkle Schrift auf hell, helle Schrift auf
 *     dunkel) — selbe Mechanik wie /location.
 *   - Trademark ™ überall am Wordmark THIS IS NOT A HOTEL.
 *
 * Inhaltlicher Aufbau:
 *   1. Transparenter Header (Wordmark · ← Back).
 *   2. Cream-Intro-Section: § III — The Rooms · Stencil-Headline ·
 *      EB-Garamond-Lead.
 *   3. Fünf alternierende Room-Cards (foto-rechts / foto-links / …).
 *      Jede Karte: Foto (lazy, mit beschreibendem alt für SEO +
 *      Google-Image-Index), römische Nummerierung, Stencil-Name,
 *      Ochre-Eyebrow mit Material-/Layout-Details, EB-Garamond-
 *      Mikronarrativ, Mono-Fußzeile mit „bed · view · capacity".
 *   4. Editorial-Closer (1-spaltige EB-Garamond-Reflection).
 *   5. Pause-CTA-Section (dunkles Photo-Overlay, weiße Schrift,
 *      „Reserve a Room"-Disc + „Back to TINAH"-Link).
 *   6. Dunkler Footer.
 *
 * Foto-Inventar (nur die im Repo vorhandenen Bilder werden benutzt):
 *   - room3.JPG → I.   The Long Window.
 *   - room4.JPG → II.  The Sand Door.
 *   - room5.JPG → III. The Quiet Side.
 *   - room6.jpg → IV.  The Garden.   (Datei-Extension lowercase!)
 *   - room7.JPG → V.   The Hour.
 *
 * SEO-Hinweise:
 *   - Eigener Document-Title + Meta-Description fokussiert auf
 *     Long-Tail-Keywords „minimalist hotel room Sri Lanka",
 *     „quiet beach hotel Mawella", „boutique-style retreat
 *     southern coast Sri Lanka". (Brand-Guideline: das Wort
 *     „boutique stay" darf NICHT erscheinen.)
 *   - Canonical zeigt auf /rooms.
 *   - JSON-LD `HotelRoom`-Array verknüpft jedes Zimmer mit der
 *     Hotel-Entity der Hauptseite. Google bekommt damit ein
 *     vollständiges Inventar-Modell und kann Rooms in Hotel-
 *     Knowledge-Panels rendern.
 *   - Alle Foto-`<img>`-Tags mit lazy/async + ausführlichem
 *     deutsch-englischem alt-Text → Google Image Search greift,
 *     Screen-Reader bekommen brauchbare Beschreibung.
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

interface RoomData {
  id: string;
  number: string; // I, II, III, IV, V
  index: string; // ROOM 01 / ROOM 02 …
  name: string;
  /** Image src (relative to /public). */
  image: string;
  /** Beschreibender alt-Text für SEO und a11y. */
  alt: string;
  /** Eyebrow oberhalb des Namens — Materialwelt / Lage. */
  detail: string;
  /** Zwei kurze Absätze EB-Garamond-Body. */
  copy: [string, string];
  /** Mono-Footnote: Bett · Aussicht · Kapazität. */
  facts: { bed: string; view: string; capacity: string };
  /** SEO-Schlagwort für JSON-LD `roomType`. */
  roomType: string;
  /** Numeric occupancy für Schema.org. */
  occupancy: number;
}

const ROOMS: RoomData[] = [
  {
    id: 'long-window',
    number: 'I',
    index: 'Room 01',
    name: 'The Long Window.',
    image: '/images/room3.JPG',
    alt:
      'Helles Schlafzimmer im This Is Not A Hotel — langes Fenster zur Mawella-Küste, weißes Bett, warme Holztöne, ruhige Morgenstimmung in Sri Lanka',
    detail: 'Sea-facing · ground floor · linen + warm timber',
    copy: [
      'A long, low window runs the width of the room. By six in the morning the sea is already in it; by eleven the light has moved on, and the room is its own quiet again.',
      'Built around a single white bed, a stone floor, and the kind of silence that only old beach houses keep — a few steps from the sand, far enough back to forget the road.',
    ],
    facts: { bed: '1 king', view: 'Sea-facing', capacity: '2 guests' },
    roomType: 'Sea-facing minimalist hotel room',
    occupancy: 2,
  },
  {
    id: 'sand-door',
    number: 'II',
    index: 'Room 02',
    name: 'The Sand Door.',
    image: '/images/room4.JPG',
    alt:
      'Ruhiges Hotelzimmer im This Is Not A Hotel — direkter Zugang zum Strand, helle Wände, leinene Vorhänge, südliche Küste Sri Lankas',
    detail: 'Beach-level · private terrace · soft daylight',
    copy: [
      'A room you can leave barefoot. The terrace door opens onto the dune; ten paces of warm sand and you are at the water. There is nothing in between but the sound of it.',
      'Inside: linen, a slow ceiling fan, a small writing table that nobody is asking you to use. The kind of space that lets a morning take its time.',
    ],
    facts: { bed: '1 queen', view: 'Beach access', capacity: '2 guests' },
    roomType: 'Beach-access hotel room with private terrace',
    occupancy: 2,
  },
  {
    id: 'quiet-side',
    number: 'III',
    index: 'Room 03',
    name: 'The Quiet Side.',
    image: '/images/room5.JPG',
    alt:
      'Garten-Schlafzimmer im This Is Not A Hotel — Blick auf tropisches Grün, kühle Wände, minimalistisches Bett, Mawella, Sri Lanka',
    detail: 'Garden-facing · cool side of the house · all-day shade',
    copy: [
      'On the cool side of the house, away from the sea wind. The garden is at the door — palms, a small papaya tree, the morning crossing of peacocks somewhere out of frame.',
      'Built for the deep nap, the long read, the kind of afternoon where nothing happens on purpose. The walls hold the temperature; the air carries no urgency.',
    ],
    facts: { bed: '1 queen', view: 'Garden', capacity: '2 guests' },
    roomType: 'Garden-facing quiet hotel room',
    occupancy: 2,
  },
  {
    id: 'garden',
    number: 'IV',
    index: 'Room 04',
    name: 'The Garden.',
    image: '/images/room6.jpg',
    alt:
      'Lichtdurchflutetes Zimmer im This Is Not A Hotel — Garten- und Pool-Blick, Naturmaterialien, warme Holztöne, südliches Sri Lanka',
    detail: 'Garden + pool · lateral light · two-window corner',
    copy: [
      'A corner room. Two windows — one on the garden, one on the path that leads down to the pool. The light arrives from two sides at once; in the late afternoon it lays itself across the floor in long, easy stripes.',
      'A favourite of guests who travel with someone and need a little more room to be quiet in. Big enough for two suitcases and an unplanned coffee at three.',
    ],
    facts: { bed: '1 king', view: 'Garden + pool', capacity: '2 guests' },
    roomType: 'Corner hotel room with garden and pool view',
    occupancy: 2,
  },
  {
    id: 'hour',
    number: 'V',
    index: 'Room 05',
    name: 'The Hour.',
    image: '/images/room7.JPG',
    alt:
      'Schlafzimmer im This Is Not A Hotel mit Spätnachmittagslicht — minimalistisches Design, EB-Garamond-Schreibtisch, ruhige Atmosphäre, Mawella Beach',
    detail: 'West-facing · evening light · the room people don\u2019t leave',
    copy: [
      'The west-facing room. From around five o\u2019clock the walls turn the colour of warm paper, and the whole room slows down with the day. The kind of light you stop talking in.',
      'A bed, a chair, a single shelf of books somebody left and somebody else added to. People who book this room tend to extend; we have, by now, stopped being surprised.',
    ],
    facts: { bed: '1 king', view: 'West-facing', capacity: '2 guests' },
    roomType: 'West-facing evening-light hotel room',
    occupancy: 2,
  },
];

export function RoomsPage() {
  const [, navigate] = useRoute();

  // Chameleon-Theme-State für den lokalen Header — selbe Logik
  // wie in /location/index.tsx und TopBar.tsx.
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

  // ---------------------------------------------------------------
  // SEO — Document-Head dynamisch setzen, beim Unmount aufräumen.
  // Identisches Pattern wie in /location/index.tsx.
  // ---------------------------------------------------------------
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const prevDescription = metaDesc?.getAttribute('content') ?? null;

    document.title =
      'The Rooms — Five quiet rooms on Mawella Beach · This Is Not A Hotel\u2122';

    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Five rooms on Mawella Beach, southern Sri Lanka. Minimal, warm and quiet — sea-facing, garden-facing, west-facing. Linen, timber and the sound of the surf. The rooms of This Is Not A Hotel\u2122.',
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

    ogTitle?.setAttribute(
      'content',
      'The Rooms — Five quiet rooms on Mawella Beach',
    );
    ogDesc?.setAttribute(
      'content',
      'Sea-facing, garden-facing, west-facing — five rooms in southern Sri Lanka, designed for stillness. This Is Not A Hotel\u2122.',
    );
    ogUrl?.setAttribute('content', `${window.location.origin}/rooms`);

    // JSON-LD: ItemList of HotelRoom — eines pro Zimmer, jedes
    // verlinkt auf die Hotel-Entity der Hauptseite. Google
    // versteht damit Anzahl, Typen und Belegung der Zimmer.
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'ld-rooms-page';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': 'https://thisisnotahotel.com/rooms#list',
      name: 'The Rooms — This Is Not A Hotel\u2122',
      numberOfItems: ROOMS.length,
      itemListElement: ROOMS.map((room, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'HotelRoom',
          '@id': `https://thisisnotahotel.com/rooms#${room.id}`,
          name: room.name.replace(/\.$/, ''),
          description: room.copy[0],
          url: `https://thisisnotahotel.com/rooms#${room.id}`,
          image: `https://thisisnotahotel.com${room.image}`,
          occupancy: {
            '@type': 'QuantitativeValue',
            maxValue: room.occupancy,
            unitCode: 'C62',
          },
          bed: {
            '@type': 'BedDetails',
            typeOfBed: room.facts.bed,
            numberOfBeds: 1,
          },
          containedInPlace: {
            '@type': 'Hotel',
            '@id': 'https://thisisnotahotel.com/#hotel',
            name: 'This Is Not A Hotel\u2122',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Mawella',
              addressRegion: 'Southern Province',
              addressCountry: 'LK',
            },
          },
        },
      })),
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
          HEADER — transparent + chamäleon
          ============================================================ */}
      <header
        role="banner"
        aria-label="Rooms-Subseite Navigation"
        className="fixed top-0 left-0 right-0 z-[100] grid grid-cols-[1fr_auto] items-center bg-transparent"
        style={{
          padding: '3vh 4vw 1.6vh',
          paddingTop: 'calc(env(safe-area-inset-top) + 3vh)',
          transition: 'color .3s ease-out',
        }}
      >
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
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-stencil uppercase transition-colors duration-300 cursor-pointer"
            style={{
              color: navTextSoftColor,
              fontSize: 11,
              letterSpacing: '0.22em',
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
        </div>
      </header>

      {/* ============================================================
          INTRO
          ============================================================ */}
      <section
        className="mx-auto text-center"
        style={{ padding: '24vh 6vw 8vh', maxWidth: 1100 }}
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
          § III — The Rooms
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
          Five rooms,
          <br />
          designed for{' '}
          <span style={{ color: COLOR.ochre }}>stillness</span>.
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
          Linen, warm timber, stone underfoot. Each room faces something
          different — the sea, the garden, the late light — and is built
          for the same thing: an unhurried day on the southern coast of
          Sri Lanka.
        </p>
      </section>

      {/* ============================================================
          ROOMS — five alternating cards
          ============================================================
          Alternierendes 2-Spalten-Layout (Foto links / Foto rechts).
          Auf Mobile fällt es auf eine einzige Spalte zurück, das Foto
          liegt dort immer oberhalb des Texts. Jede zweite Karte
          bekommt Cream2 als sanften Section-Wechsel; das schafft
          Rhythmus, ohne harte Trennlinien zu zeichnen. */}
      <div aria-label="The five rooms">
        {ROOMS.map((room, i) => (
          <RoomCard key={room.id} room={room} reverse={i % 2 === 1} bg={i % 2 === 0 ? COLOR.cream : COLOR.cream2} />
        ))}
      </div>

      {/* ============================================================
          EDITORIAL CLOSER
          ============================================================ */}
      <section
        className="mx-auto"
        style={{ padding: '14vh 6vw 6vh', maxWidth: 780 }}
        aria-label="On choosing a room"
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
          § III.a — A note on choosing
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
          There is no{' '}
          <span style={{ color: COLOR.ochre }}>wrong room</span>.
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
            People ask, often, which one to take. The honest answer is
            that the rooms are quieter than the choice between them. They
            share the same linen, the same morning, the same kilometre
            of sand. What changes is the angle: which window the day
            comes in through.
          </p>
          <p style={{ margin: '1.4em 0 0' }}>
            If you wake early, take{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>The Long Window</em>{' '}
            or{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>The Sand Door</em>.
            If you sleep in,{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>The Quiet Side</em>.
            If you came to read until evening,{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>The Hour</em>.
            If you came together,{' '}
            <em style={{ fontStyle: 'italic', color: COLOR.inkSoft }}>The Garden</em>.
          </p>
          <p style={{ margin: '1.4em 0 0' }}>
            Tell us when you write — we will not over-engineer it. We
            will pick the one that suits the trip you describe.
          </p>
        </div>
      </section>

      {/* ============================================================
          PAUSE CTA — dunkles Foto-Overlay (Window.JPG, gespiegelt zur
          Location-Subseite, damit der Wiedererkennungs-Effekt der
          „Pause"-Erzählung zwischen den Subseiten gewahrt bleibt).
          data-nav-theme="dark" → Header oben fährt helle Schrift.
          ============================================================ */}
      <section
        className="relative text-center overflow-hidden"
        data-nav-theme="dark"
        style={{
          padding: '14vh 6vw 12vh',
          backgroundColor: COLOR.dark,
        }}
        aria-label="Reserve a room — book your stay at This Is Not A Hotel, Mawella, Sri Lanka"
      >
        <img
          src="/images/Window.JPG"
          alt="Blick aus einem Fenster im This Is Not A Hotel — Einladung, ein Zimmer auf Mawella Beach, Sri Lanka, zu reservieren"
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
            § III.b — Reserve
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
            Pick a room.{' '}
            <span style={{ color: COLOR.ochre }}>Pick a week.</span>
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
// RoomCard — alternierendes 2-Spalten-Layout (Foto / Text).
// `reverse` flippt die Reihenfolge auf md+; auf Mobile bleibt das
// Foto immer oben (semantisch korrekt: Bild zuerst, Beschreibung
// dazu).
// ---------------------------------------------------------------
interface RoomCardProps {
  room: RoomData;
  reverse: boolean;
  bg: string;
}

function RoomCard({ room, reverse, bg }: RoomCardProps) {
  const bodyStyle = { fontFamily: "'EB Garamond', Georgia, serif" } as const;
  return (
    <article
      id={room.id}
      className="relative"
      style={{ backgroundColor: bg }}
      aria-labelledby={`room-title-${room.id}`}
    >
      {/* Top-Hairline — feiner Cream-Tone-Trenner zwischen Karten,
          identisch zum RouteCard-Pattern auf /location. */}
      <div
        aria-hidden
        style={{
          height: 1,
          width: '100%',
          backgroundColor: COLOR.rule,
        }}
      />
      <div
        className={`mx-auto grid grid-cols-1 md:grid-cols-2 items-center ${
          reverse ? 'md:[&>*:first-child]:order-2' : ''
        }`}
        style={{
          maxWidth: 1300,
          padding: '10vh 6vw',
          gap: 'clamp(32px, 5vw, 80px)',
        }}
      >
        {/* Foto-Spalte */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: '4 / 5',
            // Sanfter Cream-Schatten, der das Foto in die
            // Cream-Bühne integriert — kein harter Rahmen, sondern
            // ein leicht „in die Seite gelegtes" Print-Gefühl.
            boxShadow: '0 30px 60px -30px rgba(28,27,23,.25)',
          }}
        >
          <img
            src={room.image}
            alt={room.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
        </div>

        {/* Text-Spalte */}
        <div>
          {/* Eyebrow: ROOM 0X · materials/location */}
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.22em',
              color: COLOR.ochre,
              textTransform: 'uppercase',
            }}
          >
            {room.index}
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 22,
                height: 1,
                margin: '0 14px 4px',
                verticalAlign: 'middle',
                backgroundColor: COLOR.ochre,
                opacity: 0.55,
              }}
            />
            {room.detail}
          </div>

          {/* Roman numeral + name */}
          <h2
            id={`room-title-${room.id}`}
            className="font-stencil"
            style={{
              marginTop: '2vh',
              fontSize: 'clamp(28px, 4vw, 56px)',
              lineHeight: 1.04,
              letterSpacing: '0.02em',
              color: COLOR.ink,
            }}
          >
            <span style={{ color: COLOR.ochre, marginRight: '0.6em' }}>
              {room.number}.
            </span>
            {room.name}
          </h2>

          {/* Body — two short paragraphs. */}
          <div
            style={{
              ...bodyStyle,
              marginTop: '3vh',
              fontSize: 'clamp(15px, 1.1vw, 19px)',
              lineHeight: 1.65,
              color: COLOR.ink,
              maxWidth: '52ch',
            }}
          >
            <p style={{ margin: 0 }}>{room.copy[0]}</p>
            <p style={{ margin: '1.2em 0 0' }}>{room.copy[1]}</p>
          </div>

          {/* Mono facts row — bed · view · capacity. */}
          <dl
            style={{
              marginTop: '4vh',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, auto))',
              gap: 'clamp(20px, 3vw, 48px)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: COLOR.inkSoft,
            }}
          >
            <FactCell label="Bed" value={room.facts.bed} />
            <FactCell label="View" value={room.facts.view} />
            <FactCell label="Capacity" value={room.facts.capacity} />
          </dl>
        </div>
      </div>
    </article>
  );
}

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        style={{
          color: COLOR.inkSoft,
          opacity: 0.6,
          marginBottom: 6,
        }}
      >
        {label}
      </dt>
      <dd style={{ color: COLOR.ink, margin: 0 }}>{value}</dd>
    </div>
  );
}
