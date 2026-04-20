import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

export function Details() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      id="details"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 50 }}
      aria-label="Hotel-Details"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${1.14 - entrance * 0.14 + exit * 0.06})`,
          opacity: 0.7 + entrance * 0.3 - exit * 0.65,
        }}
      >
        <img
          src="/images/detail-material.jpg"
          alt="Natürliche Materialien und Texturen — This Is Not A Hotel"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C]/70 via-[#0B0B0C]/30 to-[#0B0B0C]/40" />
      </div>

      {/* Center Circle CTA */}
      <div
        className="absolute left-1/2 top-[56vh] -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          transform: `translate(-50%, -50%) translateY(${(1 - entrance) * 25}vh) translateY(${-exit * 28}vh) scale(${0.78 + entrance * 0.22 - exit * 0.15})`,
          opacity: entrance - exit * 0.8,
        }}
      >
        <CircleCTA
          text="GALLERY"
          onClick={() => {
            const element = document.querySelector('#dining');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Bottom content — sliding captions enter earlier */}
      <div className="absolute bottom-[12vh] left-0 right-0 px-[7vw] z-20 flex justify-between items-end">
        <div
          style={{
            transform: `translateX(${(1 - entrance) * -22}vw) translateX(${-exit * 10}vw)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          <h2 className="font-heading text-[clamp(28px,4vw,56px)] text-white leading-[0.95] tracking-[-0.02em] max-w-[560px]">
            Details that<br />make the <span className="font-stencil">difference</span>.
          </h2>
        </div>

        <div
          style={{
            transform: `translateX(${(1 - entrance) * 18}vw) translateX(${exit * 10}vw)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          <p className="text-[#B7B7B7] text-base max-w-[420px]">
            Natural materials, soft light, and textures you'll want to touch.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
