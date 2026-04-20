import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

export function Testimonial() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      id="testimonial"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 70 }}
      aria-label="Gäste-Stimmen"
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
          src="/images/testimonial-portrait.jpg"
          alt="Entspannter Gast — This Is Not A Hotel"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/40 via-[#0B0B0C]/30 to-[#0B0B0C]/70" />
      </div>

      {/* Center Circle CTA */}
      <div
        className="absolute left-1/2 top-[56vh] -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          transform: `translate(-50%, -50%) translateY(${(1 - entrance) * 25}vh) translateY(${-exit * 30}vh) scale(${0.78 + entrance * 0.22 - exit * 0.15})`,
          opacity: entrance - exit * 0.8,
        }}
      >
        <CircleCTA
          text="REVIEWS"
          onClick={() => {
            const element = document.querySelector('#journal');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Bottom quote */}
      <blockquote
        className="absolute left-1/2 bottom-[10vh] -translate-x-1/2 z-20 text-center"
        style={{
          transform: `translateX(-50%) translateY(${(1 - entrance) * 5}vh) translateY(${exit * 6}vh)`,
          opacity: entrance - exit * 0.75,
        }}
      >
        <p className="text-white text-lg md:text-xl max-w-[720px] leading-relaxed italic">
          "I slept better here than I have in months. It's quiet, intentional, and completely effortless."
        </p>
      </blockquote>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
