import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';

export function Location() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();

  return (
    <section
      ref={ref}
      id="location"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 20 }}
      aria-label="Lage und Umgebung"
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: `scale(${1.1 - entrance * 0.1 + exit * 0.05})`,
          opacity: 0.6 + entrance * 0.4 - exit * 0.65,
        }}
      >
        <img
          src="/images/location-coast.jpg"
          alt="Küstenlandschaft rund um This Is Not A Hotel"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/40 via-[#0B0B0C]/20 to-[#0B0B0C]/60" />
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
          text="LOCATION"
          onClick={() => {
            const element = document.querySelector('#rooms');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      {/* Bottom caption */}
      <div
        className="absolute left-1/2 bottom-[10vh] -translate-x-1/2 z-20 text-center"
        style={{
          transform: `translateX(-50%) translateY(${(1 - entrance) * 6}vh) translateY(${exit * 6}vh)`,
          opacity: entrance - exit * 0.75,
        }}
      >
        <p className="text-[#B7B7B7] text-base max-w-[680px]">
          Ten minutes from the old town, miles away from the everyday.
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
