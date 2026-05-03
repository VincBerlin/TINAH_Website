import { Star } from 'lucide-react';
import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Reviews section.
 *
 * Per user request (2026-04-21):
 *   - No CTA button anymore — the section shows REAL reviews instead of
 *     linking out to a journal.
 *   - Three short Google reviews are laid out as glass cards over the
 *     new background photo (`/images/person-am-strand.JPEG` — guests on
 *     the beach, from the "Personen am Strand" asset set).
 *   - 5-star rating visualised per card, Google-style.
 *
 * Layout:
 *   - Full-bleed photo background with strong vertical darkening for
 *     white-text legibility on the top half and bottom third.
 *   - Eyebrow + heading pinned near the top of the viewport.
 *   - Three glass cards in a single row on desktop; they stack on
 *     mobile. Cards stay within the viewport (h-screen-safe) so the
 *     section is exactly one page tall, consistent with Experience,
 *     Details, Rooms, and the Book section below.
 */

interface Review {
  author: string;
  rating: number;
  body: string;
}

// Verbatim Google Maps reviews supplied by the owner.
const REVIEWS: Review[] = [
  {
    author: 'Helen K.',
    rating: 5,
    body: 'Lovely place to stay! Peaceful and quiet. Lovely light, fresh and clean room with lovely spaces to also relax and work. Food was amazing and such lovely friendly, welcoming staff. Highly recommend.',
  },
  {
    author: 'Laura H.',
    rating: 5,
    body: 'Staying at ThisIsNotaHotel was such a lovely experience! A beautiful, peaceful spot to escape the Hiriketiya buzz and enjoy an authentic visit to southern Sri Lanka. AND just a few steps from some of the most stunning, secluded beaches.',
  },
  {
    author: 'Vincent S.',
    rating: 5,
    body: 'It was the perfect stay for us. The service and the staff was amazing! The food was very delicious. The area is very quiet and very close to most of the beautiful beaches of southern Sri Lanka.',
  },
];

export function Testimonial() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      id="testimonial"
      data-nav-theme="dark"
      className="relative w-screen h-screen-safe overflow-hidden bg-[#0B0B0C] text-white"
      style={{ zIndex: 70 }}
      aria-label="Gäste-Stimmen"
      // SEO: connect this DOM section to the Hotel entity declared in
      // the JSON-LD block in index.html. `itemref` semantics via the
      // hash anchor makes the review block easy to cite from external
      // pages, and Google treats the #testimonial fragment as a
      // discrete page for indexing purposes (see sitemap.xml).
      data-schema-hotel="https://thisisnotahotel.com/#hotel"
    >
      {/* Background photo — guests on the beach, authentic brand image. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          transform: `scale(${1.08 - entrance * 0.08 + exit * 0.04})`,
          opacity: 0.6 + entrance * 0.4 - exit * 0.65,
        }}
      >
        <img
          src="/images/person-am-strand.JPEG"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 55%' }}
          loading="lazy"
          decoding="async"
        />
        {/* Base veil — softens image enough for white text to breathe. */}
        <div className="absolute inset-0 bg-[#0B0B0C]/45" />
        {/* Vertical gradient — darker at top (for the heading band) and
            at bottom (under the review cards). Middle stays airy. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/85 via-[#0B0B0C]/20 to-[#0B0B0C]/80" />
      </div>

      {/* Eyebrow + Heading — slides down from top as the section enters. */}
      <div
        className="absolute left-1/2 top-[18vh] -translate-x-1/2 z-20 w-full px-[6vw] text-center"
        style={{
          // Heading travels from above the viewport down to its resting
          // position — matches the "top" arrival of the middle card so
          // the whole top stack lands together.
          transform: `translateX(-50%) translateY(${(1 - entrance) * -18}vh) translateY(${exit * 6}vh)`,
          opacity: Math.max(0.2, entrance - exit * 0.35),
        }}
      >
        {/* Eyebrow „§ V — Words from Guests" über dem Google-Reviews-
            Subtitle. Einheitliches Section-Pattern (User-Request
            2026-04-28). */}
        <div
          className="font-stencil uppercase inline-flex items-center justify-center mb-3"
          style={{
            fontSize: 11,
            letterSpacing: '0.28em',
            color: '#D9D9D9',
            gap: 14,
          }}
        >
          <span
            aria-hidden
            className="inline-block h-px w-8"
            style={{ backgroundColor: 'rgba(217,217,217,0.6)' }}
          />
          § V — Words from Guests
        </div>
        <span className="block font-mono text-[11px] uppercase tracking-[0.28em] text-[#D9D9D9]">
          Google · Reviews
        </span>
        {/* Heading — bewusst kleiner als in den anderen Sections.
            Reason: das Hintergrundfoto zeigt einen Gast am Strand,
            und die Headline sass vorher so gross da, dass sie die
            Person ueberlagert hat. `clamp(20px, 2.4vw, 30px)` haelt
            den Stencil-Charakter, laesst der Person aber Platz. */}
        <h2 className="mt-2 font-stencil uppercase text-white text-[clamp(20px,2.4vw,30px)] leading-[1.05] tracking-[0.08em]">
          Words from our guests.
        </h2>
      </div>

      {/* Three review cards — horizontal row on desktop, stacked on mobile.
          Each card arrives from a different direction (left / top / right)
          and they all land together in the centre as `entrance` → 1. */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 w-full px-[6vw]"
        style={{
          top: '58vh',
          transform: `translate(-50%, -50%) translateY(${-exit * 8}vh)`,
          opacity: Math.max(0.25, 1 - exit * 0.4),
        }}
      >
        <ul
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-[1200px] mx-auto items-stretch"
          aria-label="Guest reviews from Google"
        >
          {REVIEWS.map((review, i) => (
            <ReviewCard
              key={review.author}
              review={review}
              entrance={entrance}
              direction={i === 0 ? 'left' : i === 1 ? 'top' : 'right'}
            />
          ))}
        </ul>
      </div>

      {/* Bottom blend — hands off cleanly to the dark Book section. */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none"
      />
    </section>
  );
}

/**
 * Single review card.
 *
 * Neutral transparent glass (same visual language as the Book form and
 * QR card) keeps the page cohesive. Stars use lucide's `Star` with a
 * warm fill so they read as "Google gold" without looking like a toy.
 *
 * Entrance animation:
 *   `direction` controls where the card flies in from — 'left' comes
 *   from the left edge, 'right' from the right edge, 'top' drops from
 *   above. All three converge on the centre together because they all
 *   key off the same `entrance` progress value (0→1).
 *
 * Author pinning:
 *   Card is a flex column; the author paragraph uses `mt-auto` so no
 *   matter how long each quote is, the names align on the same
 *   horizontal baseline across all three cards.
 */
function ReviewCard({
  review,
  entrance,
  direction,
}: {
  review: Review;
  entrance: number;
  direction: 'left' | 'top' | 'right';
}) {
  // Distance the card still has to travel. 1 = fully off-screen at
  // start, 0 = settled in place.
  const remaining = 1 - entrance;

  let tx = 0;
  let ty = 0;
  if (direction === 'left') tx = remaining * -40; // from left (vw)
  if (direction === 'right') tx = remaining * 40; // from right (vw)
  if (direction === 'top') ty = remaining * -30; // from above (vh)

  return (
    <li
      className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-4 md:p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)] flex flex-col h-full"
      style={{
        transform: `translate(${tx}vw, ${ty}vh)`,
        opacity: entrance,
        // Soft settle — easing feel without a keyframe.
        willChange: 'transform, opacity',
      }}
    >
      {/* Star rating */}
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${review.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < review.rating
                ? 'fill-[#FBBC04] text-[#FBBC04]'
                : 'text-white/30'
            }`}
            aria-hidden
          />
        ))}
      </div>

      {/* Quote body */}
      <p className="mt-3 text-[13px] md:text-[14px] leading-relaxed text-white/90">
        {review.body}
      </p>

      {/* Author — pinned to the bottom of the card so names line up
          horizontally across all three cards regardless of quote length. */}
      <p className="mt-auto pt-4 font-stencil uppercase text-[11px] tracking-[0.22em] text-[#D9D9D9]">
        {review.author}
      </p>
    </li>
  );
}
