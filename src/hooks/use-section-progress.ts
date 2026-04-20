import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-driven progress tracker for pinned fullscreen sections.
 *
 * Returns two values, each clamped to [0, 1]:
 *   - `entrance`: fades IN early — reaches 1 while the section is still
 *                 comfortably in view (so text arrives before the image exits).
 *   - `exit`:     fades OUT when the section is clearly leaving.
 *
 * Internally, progress is computed from the section's `rect.top` measured
 * in viewport-height units:
 *
 *   rect.top / windowHeight  |  meaning
 *   -------------------------+--------------------------------------------
 *   1.0                      |  section just touches the bottom of viewport
 *   0.0                      |  section is pinned to the top
 *  -1.0                      |  section has fully scrolled out the top
 *
 * Defaults (overridable):
 *   entranceStart = 0.70  → entrance begins when section is ~30 % visible
 *   entranceEnd   = 0.00  → entrance finishes exactly when section top reaches
 *                           the viewport top (= image is centered on screen)
 *   exitStart     = -0.35 → exit begins clearly after the image has held center
 *   exitEnd       = -0.90
 */
export interface SectionProgressOptions {
  entranceStart?: number;
  entranceEnd?: number;
  exitStart?: number;
  exitEnd?: number;
}

export function useSectionProgress<T extends HTMLElement = HTMLElement>(
  options: SectionProgressOptions = {}
) {
  const {
    entranceStart = 0.70,
    entranceEnd = 0.00,
    exitStart = -0.35,
    exitEnd = -0.90,
  } = options;

  const ref = useRef<T | null>(null);
  const [entrance, setEntrance] = useState(0);
  const [exit, setExit] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let rafId = 0;
    let pending = false;

    const compute = () => {
      pending = false;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const topVH = rect.top / vh;

      // Entrance: 0 at entranceStart, 1 at entranceEnd (both decreasing)
      const entRange = entranceStart - entranceEnd;
      const entRaw = entRange === 0 ? 1 : (entranceStart - topVH) / entRange;
      const entClamped = Math.max(0, Math.min(1, entRaw));

      // Exit: 0 at exitStart, 1 at exitEnd (both decreasing further negative)
      const exRange = exitStart - exitEnd;
      const exRaw = exRange === 0 ? 0 : (exitStart - topVH) / exRange;
      const exClamped = Math.max(0, Math.min(1, exRaw));

      setEntrance(entClamped);
      setExit(exClamped);
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [entranceStart, entranceEnd, exitStart, exitEnd]);

  return { ref, entrance, exit };
}
