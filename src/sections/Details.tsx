import { useState } from 'react';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Details section — now "Play & Pause".
 *
 * Per user request (2026-04-22, sixth pass) the separate Play page
 * (surf photograph + PLAY disc) was dismantled. Its idea — the
 * play-pause duality — is folded INTO this section:
 *   - The yoga photograph is removed. The section keeps its cream
 *     background (#F1E9D7) so it remains the single bright pause in
 *     the page's otherwise dark rhythm.
 *   - No H2. The composition is reduced to two words rendered as
 *     two real buttons: "PLAY" on the left, "PAUSE" on the right.
 *   - These are NOT the circular glass discs used elsewhere. They
 *     are pill-shaped buttons that subtly animate on hover (a thin
 *     accent line expands underneath the label and the pair eases
 *     apart from each other) and respond on click (scale down a
 *     touch for tactile feedback).
 *   - PLAY scrolls UP to #experience (the activities section where
 *     surf / cowork / run are already described in the property
 *     copy). PAUSE scrolls DOWN to #book (the booking form). Both
 *     destinations already exist in the page so no other code
 *     needs to change.
 *
 * SEO notes:
 *   - The two button labels carry the Play / Pause keywords. Both
 *     words appear inside real <button> text, so Google tokenises
 *     them as primary interactive elements on the page (higher
 *     semantic weight than inline body copy).
 *   - aria-label on the section and on each button describes the
 *     brand's play-vs-pause choice in natural language, which is
 *     what crawlers index for screen-reader-style snippets.
 */

// easeInOutCubic — reused from the previous pass so the outer
// section-level entrance still feels "modern and calm" rather than
// mapping 1:1 to the scroll wheel.
const ease = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// Shared CSS transition for all scroll-driven inline styles. A small
// interpolation window between scroll ticks is what removes the
// "abgehackt" / stepped feel without making motion lag.
const SMOOTH_TRANSITION =
  'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)';

// Hover/press transition for the two buttons. Slightly faster so
// pointer interactions feel immediate instead of "weighty".
const BUTTON_TRANSITION =
  'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), background-color 220ms ease-out, color 220ms ease-out, box-shadow 220ms ease-out';

/**
 * PillButton — a single PLAY / PAUSE control.
 *
 * Visual language:
 *   - Cream-friendly "glass" style consistent with the rest of the
 *     site: thin dark border, near-transparent fill, dark stencil
 *     text. No heavy chrome, no black rectangles — stays neutral
 *     per the user's earlier "neutral wie jeder andere button"
 *     feedback.
 *   - On hover, the pair subtly eases apart (translate ±10px) and
 *     the hovered button gets a soft fill + slight lift. An accent
 *     underline expands from 0 → 100% width below the label for
 *     visual motion without moving the whole layout.
 *   - On press (active), the hovered button dips down 1px and
 *     shrinks a hair (scale .98) for tactile feedback.
 *
 * Why split into a local component: the two buttons are mirror
 * images of one another with opposite hover translations, so a
 * tiny reusable unit keeps the JSX readable and makes it trivial
 * to add a third play/pause variant later without duplication.
 */
type Direction = 'left' | 'right';

function PillButton({
  label,
  direction,
  ariaLabel,
  onClick,
}: {
  label: string;
  direction: Direction;
  ariaLabel: string;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // On hover the button eases AWAY from its sibling. Left button
  // drifts slightly left, right button slightly right. Creates a
  // quiet "breathing" gesture for the pair.
  const driftPx = direction === 'left' ? -10 : 10;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      className="relative inline-flex items-center justify-center font-stencil uppercase select-none"
      style={{
        // Sizing: generous pill, bigger than the circular CTAs.
        // These two are the ONLY action points on the whole
        // section, so they earn the real estate.
        minWidth: 'clamp(160px, 16vw, 220px)',
        padding: 'clamp(14px, 1.4vw, 18px) clamp(28px, 2.6vw, 38px)',
        borderRadius: '999px',
        border: '1px solid rgba(11, 11, 12, 0.16)',
        backgroundColor: isHovered
          ? 'rgba(11, 11, 12, 0.05)'
          : 'rgba(11, 11, 12, 0.015)',
        color: '#0B0B0C',
        fontSize: 'clamp(14px, 1.1vw, 16px)',
        letterSpacing: '0.22em',
        lineHeight: 1,
        boxShadow: isHovered
          ? '0 8px 24px -14px rgba(11, 11, 12, 0.35)'
          : 'none',
        transform: `translateX(${isHovered ? driftPx : 0}px) translateY(${
          isPressed ? 1 : isHovered ? -2 : 0
        }px) scale(${isPressed ? 0.98 : 1})`,
        transition: BUTTON_TRANSITION,
        cursor: 'pointer',
        willChange: 'transform',
      }}
    >
      <span className="relative inline-block">
        {label}
        {/* Underline-grow accent. Expands on hover from 0 → 100%
            width. Adds movement WITHIN the button so the page feels
            alive even when the button itself drifts only slightly. */}
        <span
          aria-hidden
          className="absolute left-0 -bottom-1 h-px bg-[#0B0B0C]"
          style={{
            width: isHovered ? '100%' : '0%',
            opacity: isHovered ? 0.55 : 0,
            transition:
              'width 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out',
          }}
        />
      </span>
    </button>
  );
}

export function Details() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  // Eased scroll progress drives the section-level entry/exit.
  const e = ease(entrance);
  const x = ease(exit);

  return (
    <section
      ref={ref}
      id="details"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 50, backgroundColor: '#F1E9D7' }}
      aria-label="Play and Pause — choose your stay at This Is Not A Hotel, Mawella, southern Sri Lanka"
    >
      {/* Top fade-in.
          The previous section is dark. A soft dark wash at the very
          top edge of this section dissolves into the cream surface
          instead of cutting straight to it — removes the "abgehackt"
          seam between dark sections above and this bright pause. */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0B0B0C]/35 to-transparent pointer-events-none z-10" />

      {/* Section-level entry/exit shell.
          Applies the same easing pipeline the other sections use so
          the entrance still feels cohesive with Play, Location, etc.
          The cream wash is set here so that entrance scale-ups apply
          to the page rhythm, not just to the (now absent) photo. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#F1E9D7',
          transform: `scale(${1.02 - e * 0.02 + x * 0.02})`,
          opacity: 1 - x * 0.4,
          transition: SMOOTH_TRANSITION,
          willChange: 'transform, opacity',
        }}
      />

      {/* Button pair — centered horizontally and vertically.
          Motion direction:
            - PLAY enters from the LEFT, slides RIGHT into place.
            - PAUSE enters from the RIGHT, slides LEFT into place.
          Distances are gentle (±8vw) and are eased, so the pair
          "meets in the middle" rather than snapping together. */}
      <div className="absolute inset-0 z-20 flex items-center justify-center gap-8 md:gap-14 px-[7vw]">
        <div
          style={{
            transform: `translateX(${(1 - e) * -8}vw) translateX(${-x * 4}vw)`,
            opacity: Math.max(0, e - x * 0.75),
            transition: SMOOTH_TRANSITION,
            willChange: 'transform, opacity',
          }}
        >
          <PillButton
            label="Play"
            direction="left"
            ariaLabel="Play — explore the experiences at This Is Not A Hotel"
            onClick={() => {
              // PLAY lifts the visitor back up to the experiences
              // section where surf / cowork / run / yoga are
              // already described in the property copy.
              const element = document.querySelector('#experience');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        <div
          style={{
            transform: `translateX(${(1 - e) * 8}vw) translateX(${x * 4}vw)`,
            opacity: Math.max(0, e - x * 0.75),
            transition: SMOOTH_TRANSITION,
            willChange: 'transform, opacity',
          }}
        >
          <PillButton
            label="Pause"
            direction="right"
            ariaLabel="Pause — request your stay at This Is Not A Hotel"
            onClick={() => {
              // PAUSE leads down to the booking form — mirrors the
              // Hero's PAUSE NOW disc. Both PAUSE actions on the
              // page converge on the same destination.
              const element = document.querySelector('#book');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Bottom soft fade back into the dark sections that follow.
          Without this gradient the cream-to-dark transition would
          read as a hard seam. */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B0B0C]/35 to-transparent pointer-events-none" />
    </section>
  );
}
