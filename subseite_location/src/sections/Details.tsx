import { useSectionProgress } from '../hooks/use-section-progress';

/**
 * Details section — § V "Play / Pause".
 *
 * Two halves of the section, separated by a thin vertical hairline
 * with a breathing center dot. The split makes the brand's
 * play-vs-pause duality the entire visual idea.
 *
 *   - LEFT  · PLAY  — Stencil + IBM Plex Mono with hard times:
 *       06:30 SURF · 08:00 RUN · 11:00 SWIM · 14:00 CO-WORK
 *   - RIGHT · PAUSE — same Stencil setting, soft time labels:
 *       sunrise YOGA · anytime MEDITATION · all day ON THE SAND ·
 *       always NOTHING AT ALL
 *
 * Interaction (2026-04-26 — simplified per user request):
 *   - ONLY the big words "PLAY" and "PAUSE" are clickable. They
 *     navigate to /play and /pause subpages (to be built).
 *   - Activities + the center dot are NOT interactive. The whole
 *     side panels are no longer click-toggle dim. Less is more.
 *
 * Layout fix (2026-04-26):
 *   - Right (PAUSE) flex column gets `items-start` so the rows
 *     don't stretch to full width and float around the middle of
 *     the column. Now they hug the hairline — mirror of the PLAY
 *     side, which uses `items-end` for the same hairline-hugging
 *     behaviour on the right edge.
 *
 * Layout:
 *   - 1fr · 1px · 1fr grid, full-bleed. Left half right-aligned,
 *     right half left-aligned — symmetry around the hairline.
 *   - Mobile (≤760px): stacks vertically, hairline becomes a
 *     horizontal rule, each half becomes center-aligned.
 *
 * SEO:
 *   - The two side labels carry the Play / Pause keywords as real
 *     text nodes, now wrapped in <a> tags pointing at /play and
 *     /pause — semantic internal-link anchors instead of buttons.
 */

const INK = '#1C1B17';
const INK_SOFT = '#5A5448';
const OCHRE = '#B84A1F';

interface Activity {
  time: string;
  label: string;
}

const PLAY: Activity[] = [
  { time: '06:30', label: 'Surf' },
  { time: '08:00', label: 'Run' },
  { time: '11:00', label: 'Swim' },
  { time: '14:00', label: 'Co-Work' },
];

const PAUSE: Activity[] = [
  { time: 'sunrise', label: 'Yoga' },
  { time: 'anytime', label: 'Meditation' },
  { time: 'all day', label: 'On the sand' },
  { time: 'always', label: 'Nothing at all' },
];

export function Details() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  const contentOpacity = entrance - exit * 0.75;

  return (
    <section
      ref={ref}
      id="details"
      className="relative w-screen min-h-screen-safe overflow-hidden"
      style={{ zIndex: 50, backgroundColor: '#F1E9D7' }}
      aria-label="Play or Pause — daily rhythm at This Is Not A Hotel, Mawella, southern Sri Lanka"
    >
      <h2 className="sr-only">Play or Pause — choose your rhythm.</h2>

      {/* Top fade-in from the previous (also cream) section. */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0B0B0C]/15 to-transparent pointer-events-none z-10" />

      <div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 z-10 font-mono"
        style={{
          opacity: contentOpacity,
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: INK_SOFT,
        }}
      >
        § V — Play / Pause
      </div>

      <div
        className="relative grid items-center min-h-screen-safe"
        style={{
          gridTemplateColumns: '1fr 1px 1fr',
          opacity: contentOpacity,
        }}
      >
        {/* LEFT — PLAY */}
        <div
          className="text-right"
          style={{ padding: '0 clamp(40px, 7vw, 120px)' }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: OCHRE,
              marginBottom: 24,
            }}
          >
            Move · 01
          </div>
          <a
            href="/play"
            aria-label="Play — explore the daily Move offering at This Is Not A Hotel"
            className="font-stencil tinah-side-link inline-block no-underline"
            style={{
              fontSize: 'clamp(64px, 10vw, 160px)',
              lineHeight: 0.9,
              letterSpacing: '0.02em',
              color: INK,
              textTransform: 'uppercase',
            }}
          >
            Play
          </a>
          <div
            className="mt-[5vh] flex flex-col items-end"
            style={{ gap: 14 }}
          >
            {PLAY.map((a) => (
              <div
                key={a.label}
                className="inline-flex items-baseline"
                style={{ gap: 18 }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    letterSpacing: '0.14em',
                    color: INK_SOFT,
                    minWidth: 56,
                  }}
                >
                  {a.time}
                </span>
                <span
                  className="font-stencil"
                  style={{
                    fontSize: 'clamp(18px, 1.7vw, 24px)',
                    letterSpacing: '0.18em',
                    color: INK,
                    textTransform: 'uppercase',
                  }}
                >
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — hairline + breathing dot (decorative, no longer interactive) */}
        <div
          className="self-center justify-self-center relative"
          aria-hidden="true"
          style={{
            width: 1,
            height: '62vh',
            background: INK,
            opacity: 0.18,
          }}
        >
          <span
            className="absolute left-1/2 top-1/2"
            style={{
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: INK,
              animation: 'tinah-breathe 3.6s ease-in-out infinite',
              display: 'block',
            }}
          />
        </div>

        {/* RIGHT — PAUSE */}
        <div
          className="text-left"
          style={{ padding: '0 clamp(40px, 7vw, 120px)' }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: INK_SOFT,
              marginBottom: 24,
            }}
          >
            Rest · 02
          </div>
          <a
            href="/pause"
            aria-label="Pause — explore the daily Rest offering at This Is Not A Hotel"
            className="font-stencil tinah-side-link inline-block no-underline"
            style={{
              fontSize: 'clamp(64px, 10vw, 160px)',
              lineHeight: 0.9,
              letterSpacing: '0.02em',
              color: INK,
              textTransform: 'uppercase',
            }}
          >
            Pause
          </a>
          {/* items-start keeps rows hugging the hairline (left edge of right column) — mirror of PLAY's items-end. */}
          <div
            className="mt-[5vh] flex flex-col items-start"
            style={{ gap: 14 }}
          >
            {PAUSE.map((a) => (
              <div
                key={a.label}
                className="inline-flex items-baseline"
                style={{ gap: 18 }}
              >
                <span
                  className="font-stencil"
                  style={{
                    fontSize: 'clamp(18px, 1.7vw, 24px)',
                    letterSpacing: '0.18em',
                    color: INK,
                    textTransform: 'uppercase',
                  }}
                >
                  {a.label}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    color: INK_SOFT,
                  }}
                >
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom soft fade back into the dark sections that follow. */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B0B0C]/35 to-transparent pointer-events-none" />

      <style>{`
        @keyframes tinah-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50%      { transform: translate(-50%, -50%) scale(1.6); opacity: 0.55; }
        }
        .tinah-side-link {
          position: relative;
          transition: opacity 320ms ease, transform 320ms ease;
        }
        .tinah-side-link:hover {
          opacity: 0.78;
        }
        .tinah-side-link::after {
          content: '';
          position: absolute;
          left: 6%;
          right: 6%;
          bottom: 0.06em;
          height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
          opacity: 0.4;
        }
        .tinah-side-link:hover::after {
          transform: scaleX(1);
        }
        @media (max-width: 760px) {
          #details > div.grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr 1px 1fr !important;
          }
          #details > div.grid > div:nth-child(1),
          #details > div.grid > div:nth-child(3) {
            text-align: center !important;
            padding: 6vh 8vw !important;
          }
          #details > div.grid > div:nth-child(1) > div:last-child,
          #details > div.grid > div:nth-child(3) > div:last-child {
            align-items: center !important;
          }
        }
      `}</style>
    </section>
  );
}
