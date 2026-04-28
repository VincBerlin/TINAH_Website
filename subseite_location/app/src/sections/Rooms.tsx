import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Rooms section — dark interlude between Location and Experience.
 *
 * 1:1 visuelle Übernahme aus „TINAH Full Site Preview.html" (.rooms).
 * Dunkler Vollbild-Streifen mit Headline links, CTA-Disc rechts.
 * Hintergrund ist ein gradient-basierter Platzhalter (nimmt später
 * das echte Room-Foto auf — siehe BG_IMAGE unten).
 *
 * Inhalt:
 *   - Headline „Rooms designed for stillness." (Stencil + DM-Serif-
 *     Italic-Akzent auf „stillness")
 *   - Subline „Minimal, warm, and quiet—so you can actually rest."
 *   - CTA-Disc „VIEW ROOMS" rechts (springt zu #experience)
 *
 * Layout:
 *   - 100vh hoch wie Hero & Testimonial
 *   - Headline absolut positioniert links (top: 50%)
 *   - Disc absolut rechts (top: 56vh, leicht nach unten versetzt
 *     für asymmetrische Spannung)
 *   - Mobile: Disc rückt unter die Headline.
 *
 * Entrance: opacity-fade entlang useSectionProgress.entrance.
 */

const BG_IMAGE: string | null = null; // später: '/images/room-interior.jpg'

export function Rooms() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  const contentOpacity = entrance - exit * 0.75;

  const handleCTA = () => {
    const el = document.getElementById('experience');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={ref}
      id="rooms"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 30, backgroundColor: '#1A1916' }}
      aria-label="Rooms — quiet five-room retreat on Mawella Beach"
    >
      <h2 className="sr-only">
        Rooms designed for stillness — minimal, warm, and quiet rooms at
        This Is Not A Hotel.
      </h2>

      {/* Background — gradient placeholder, swap for photo when ready. */}
      <div
        className="absolute inset-0"
        style={
          BG_IMAGE
            ? {
                backgroundImage: `url(${BG_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {
                background:
                  'linear-gradient(120deg, #2A2622 0%, #3D3530 50%, #1A1916 100%)',
              }
        }
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(11,11,12,0.6), rgba(11,11,12,0.3) 50%, rgba(11,11,12,0.5))',
          }}
        />
      </div>

      {/* Headline left. */}
      <div
        className="absolute left-[7vw] top-1/2 -translate-y-1/2 z-20 max-w-[480px]"
        style={{ opacity: contentOpacity }}
      >
        <h3
          className="m-0"
          style={{
            color: '#fff',
            fontSize: 'clamp(32px, 4.5vw, 64px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="font-stencil" style={{ letterSpacing: '0.02em' }}>
            Rooms designed
          </span>
          <br />
          <span className="font-stencil" style={{ letterSpacing: '0.02em' }}>
            for{' '}
          </span>
          <span
            className="font-serif-display italic"
            style={{ fontStyle: 'italic' }}
          >
            stillness
          </span>
          <span className="font-stencil" style={{ letterSpacing: '0.02em' }}>
            .
          </span>
        </h3>
        <p
          className="mt-8 max-w-[400px] text-[clamp(11px,0.85vw,13px)] leading-snug"
          style={{ color: '#B7B7B7' }}
        >
          Minimal, warm, and quiet — so you can actually rest.
        </p>
      </div>

      {/* CTA disc right. */}
      <button
        type="button"
        onClick={handleCTA}
        className="absolute right-[8vw] top-[56vh] -translate-y-1/2 z-20 grid place-items-center font-stencil cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          width: 'clamp(170px, 20vw, 260px)',
          height: 'clamp(170px, 20vw, 260px)',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.75)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          fontSize: '13px',
          letterSpacing: '0.22em',
          opacity: contentOpacity,
        }}
        aria-label="View rooms — jump to experience section"
      >
        <span
          aria-hidden
          className="absolute"
          style={{
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#fff',
          }}
        />
        VIEW ROOMS
      </button>
    </section>
  );
}
