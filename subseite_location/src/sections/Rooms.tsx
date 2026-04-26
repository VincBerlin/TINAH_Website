import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Rooms section — dark interlude between Location and Experience.
 *
 * 2026-04-25 update (user request):
 *   - Background was a real photograph (`/images/room-interior.jpg`).
 *     Replaced with a warm brown gradient placeholder so the section
 *     visually matches the preview "TINAH Full Site Preview.html"
 *     while we wait for final room photography.
 *   - Headline typography updated: full `font-stencil` with a
 *     `font-serif-display italic` accent on "stillness" — same
 *     Stencil-meets-Italic pairing the rest of the cream sections
 *     use (Location, Experience).
 *   - CircleCTA on the right is UNTOUCHED — same component, same
 *     copy, same target.
 *   - Structure, motion, scroll-driven entry/exit — UNCHANGED.
 */

export function Rooms() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      id="rooms"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 30, backgroundColor: '#1A1916' }}
      aria-label="Zimmer"
    >
      {/* Background — warm brown gradient.
          Was an <img>; now a layered gradient that keeps the same
          dark/warm character but matches the brand's cream-into-
          ink palette without needing a hero photo. */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${1.12 - entrance * 0.12 + exit * 0.06})`,
          opacity: 0.7 + entrance * 0.3 - exit * 0.65,
          background:
            'linear-gradient(120deg, #2A2622 0%, #3D3530 50%, #1A1916 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C]/60 via-[#0B0B0C]/30 to-[#0B0B0C]/50" />
      </div>

      {/* Left content — slides in MUCH earlier */}
      <div className="absolute left-[7vw] top-1/2 -translate-y-1/2 z-20">
        <div
          style={{
            transform: `translateX(${(1 - entrance) * -18}vw) translateX(${-exit * 12}vw)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          <h2
            className="font-stencil text-white leading-[0.95] max-w-[460px]"
            style={{
              fontSize: 'clamp(32px, 4.5vw, 64px)',
              letterSpacing: '0.02em',
            }}
          >
            Rooms designed<br />for{' '}
            <span
              className="font-serif-display italic"
              style={{ fontStyle: 'italic', letterSpacing: '-0.01em' }}
            >
              stillness
            </span>
            .
          </h2>
        </div>

        <div
          className="mt-8"
          style={{
            transform: `translateY(${(1 - entrance) * 5}vh) translateY(${exit * 6}vh)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          <p className="text-[#B7B7B7] text-base max-w-[400px]">
            Minimal, warm, and quiet—so you can actually rest.
          </p>
        </div>
      </div>

      {/* Right Circle CTA — UNCHANGED. */}
      <div
        className="absolute right-[8vw] top-[56vh] -translate-y-1/2 z-20"
        style={{
          transform: `translateY(-50%) translateX(${(1 - entrance) * 22}vw) translateX(${exit * 20}vw) scale(${0.78 + entrance * 0.22 - exit * 0.15})`,
          opacity: entrance - exit * 0.8,
        }}
      >
        <CircleCTA
          text="VIEW ROOMS"
          onClick={() => {
            const element = document.querySelector('#experience');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
