import { useEffect, useRef, useState } from 'react';
import { CircleCTA } from '../components/CircleCTA';

interface HeroProps {
  isReady: boolean;
}

export function Hero({ isReady }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [videoFailed, setVideoFailed] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!isReady) return;
    const t1 = setTimeout(() => setPhase(1), 0);
    const tOverlay = setTimeout(() => setLogoVisible(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(tOverlay);
    };
  }, [isReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      video.pause();
      return;
    }
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          const retry = () => {
            video.play().catch(() => setVideoFailed(true));
            window.removeEventListener('touchend', retry);
            window.removeEventListener('click', retry);
          };
          window.addEventListener('touchend', retry, { once: true, passive: true });
          window.addEventListener('click', retry, { once: true });
        });
      }
    };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('loadeddata', tryPlay, { once: true });
    return () => video.removeEventListener('loadeddata', tryPlay);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const exitThreshold = windowHeight * 0.3;
      setIsExiting(scrollY > exitThreshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollProgress = isExiting
    ? Math.min((window.scrollY - window.innerHeight * 0.3) / (window.innerHeight * 0.5), 1)
    : 0;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out ${
          phase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transform: `scale(${1 + scrollProgress * 0.06})` }}
      >
        {!videoFailed && (
          <video
            ref={videoRef}
            src="/images/hiru.mp4"
            poster="/images/hiru-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disableRemotePlayback
            webkit-playsinline="true"
            x5-playsinline="true"
            aria-label="Hiru — This Is Not A Hotel, Mawella Beach, Sri Lanka"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoFailed(true)}
          />
        )}
        {videoFailed && (
          <img
            src="/images/hiru-poster.jpg"
            alt="Hiru — This Is Not A Hotel, Mawella Beach, Sri Lanka"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/50 via-[#0B0B0C]/30 to-[#0B0B0C]/70" />
      </div>

      <h1
        className="absolute left-1/2 top-[24vh] -translate-x-1/2 -translate-y-1/2 z-20 m-0 text-center select-none"
        aria-label="This Is Not A Hotel"
        style={{
          transform: `translate(-50%, -50%) translateY(${-scrollProgress * 25}vh)`,
          opacity: logoVisible ? 1 - scrollProgress * 0.9 : 0,
          transition: 'opacity 2.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <span
          className="
            font-stencil text-white
            text-[clamp(18px,5.4vw,64px)]
            leading-[1.1]
            tracking-[0.16em]
            whitespace-nowrap
            text-center
            uppercase
            [font-feature-settings:'liga'_off,'clig'_off]
          "
          style={{ wordSpacing: '0.08em' }}
        >
          THIS&nbsp;IS&nbsp;NOT&nbsp;A&nbsp;HOTEL<sup className="text-[0.42em] align-top ml-[0.12em] tracking-normal">™</sup>
        </span>

        {/*
          Tagline-Schrift exakt an die 01/Location-Body-Texte im
          Drei-Spalten-Footer angeglichen (User-Request 2026-04-26):
          - font-sans (Body-Default, Inter) explizit gesetzt, damit sie
            NICHT vom umschließenden <h1> eine Display-Serif erbt.
          - font-normal + not-italic überschreiben jeden Browser-h1-
            Default für Gewicht und Stil.
          - Clamp-Range, Leading und Farbe identisch zu den Footer-
            Bodys: text-[clamp(11px,0.85vw,13px)] leading-snug,
            color #B7B7B7. Damit liest die Tagline 1:1 wie die
            LOCATION-Body-Zeile weiter unten.
        */}
        <p
          className="mt-[1.2vh] font-sans font-normal not-italic text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[640px] mx-auto"
        >
          Pause Your Stay at Our Hotel on Mawella Beach Between Tangalle
          and Hiriketiya Sri Lanka.
        </p>
      </h1>

      <div
        className="absolute left-1/2 top-[54vh] -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          transform: `translate(-50%, -50%) translateY(${-scrollProgress * 35}vh) scale(${1 - scrollProgress * 0.15})`,
          opacity: 1 - scrollProgress * 0.8,
        }}
      >
        <div
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'translateY(0)' : 'translateY(14vh)',
            transition:
              'opacity 2.4s cubic-bezier(0.22, 1, 0.36, 1), transform 2.4s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform, opacity',
          }}
        >
          <CircleCTA
            text="PAUSE NOW"
            size="sm"
            delay={0}
            onClick={() => {
              const book = document.getElementById('book');
              if (book) book.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </div>
      </div>

      <div
        className="absolute left-0 right-0 bottom-[6vh] z-20 px-[6vw] pointer-events-none"
        style={{
          transform: `translateY(${-scrollProgress * 18}vh)`,
          opacity: logoVisible ? 1 - scrollProgress * 0.9 : 0,
          transition: 'opacity 2.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-[3vh] gap-x-[4vw] max-w-[1100px] mx-auto">
          <div className="text-left">
            <div className="font-stencil text-[10px] uppercase tracking-[0.28em] text-[#D9D9D9] mb-[1vh]">
              01 / Location
            </div>
            <p className="text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[280px]">
              A five-room house on Mawella Beach, southern Sri Lanka. Salt
              water and air, peacocks, palm trees, nothing more.
            </p>
          </div>

          <div className="text-left md:text-center">
            <div className="font-stencil text-[10px] uppercase tracking-[0.28em] text-[#D9D9D9] mb-[1vh]">
              02 / Disposition
            </div>
            <p className="italic text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[280px] md:mx-auto">
              Less a hotel, more an argument against them.
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="font-stencil text-[10px] uppercase tracking-[0.28em] text-[#D9D9D9] mb-[1vh]">
              03 / Play&nbsp;|&nbsp;Pause
            </div>
            <p className="text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[280px] md:ml-auto">
              Co-work, Yoga, Surf, Run, Leave an angel print on the beach.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
