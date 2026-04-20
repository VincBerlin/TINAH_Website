import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

export function Dining() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      id="dining"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 60 }}
      aria-label="Frühstück und Küche"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${1.1 - entrance * 0.1 + exit * 0.05})`,
          opacity: 0.6 + entrance * 0.4 - exit * 0.65,
        }}
      >
        <img
          src="/images/dining-table.jpg"
          alt="Elegant gedeckter Frühstückstisch — This Is Not A Hotel"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C]/60 via-[#0B0B0C]/30 to-[#0B0B0C]/50" />
      </div>

      {/* Left content — slides in earlier */}
      <div className="absolute left-[7vw] top-1/2 -translate-y-1/2 z-20">
        <div
          style={{
            transform: `translateX(${(1 - entrance) * -18}vw) translateX(${-exit * 12}vw)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          <h2 className="font-heading text-[clamp(32px,4.5vw,64px)] text-white leading-[0.95] tracking-[-0.02em] max-w-[500px]">
            Dining,<br /><span className="font-stencil">simplified</span>.
          </h2>
        </div>

        <div
          className="mt-8"
          style={{
            transform: `translateY(${(1 - entrance) * 6}vh) translateY(${exit * 6}vh)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          <p className="text-[#B7B7B7] text-base max-w-[400px]">
            Breakfast delivered to your door. Local flavors, no complicated menus.
          </p>
        </div>
      </div>

      {/* Right Circle CTA */}
      <div
        className="absolute right-[8vw] top-[56vh] -translate-y-1/2 z-20"
        style={{
          transform: `translateY(-50%) translateX(${(1 - entrance) * 22}vw) translateX(${exit * 20}vw) scale(${0.78 + entrance * 0.22 - exit * 0.15})`,
          opacity: entrance - exit * 0.8,
        }}
      >
        <CircleCTA
          text="DINING"
          onClick={() => {
            const element = document.querySelector('#testimonial');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
