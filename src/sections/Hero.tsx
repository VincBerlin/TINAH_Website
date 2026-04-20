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
  // Wenn das Video aus irgendeinem Grund nicht abspielbar ist (Codec-
  // Fehler, Netzwerk, User hat „Reduce Motion" aktiv), fallen wir sauber
  // auf das Poster-Bild zurück — das sieht exakt wie vorher aus, nur
  // ohne Bewegung. Kein schwarzer Hero, keine Fehlermeldung.
  const [videoFailed, setVideoFailed] = useState(false);

  // Auto-play entrance animation.
  //
  // Zwei-Akt-Choreografie:
  //   Akt 1 — Bild sofort. Sobald der User „Tap to enter" drückt, ist
  //           das Foto da. Keine Fade-in-Verzögerung, kein schwarzer
  //           Moment. Das Bild darf kurz für sich stehen.
  //   Akt 2 — Nach ~1.2 s, wenn das Bild angekommen ist, blenden ALLE
  //           Overlay-Elemente (Tagline, PAUSE-Kreis, Hotelname)
  //           GEMEINSAM und ruhig ein. Keine Staffelung, kein Drama —
  //           eine einzige sanfte Bewegung in das Bild hinein.
  useEffect(() => {
    if (!isReady) return;

    const t1 = setTimeout(() => setPhase(1), 0);
    // logoVisible triggert ALLES Overlay-Content gleichzeitig.
    const tOverlay = setTimeout(() => setLogoVisible(true), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(tOverlay);
    };
  }, [isReady]);

  // Video-Autoplay-Robustheit.
  //
  // Safari/iOS ist bei Autoplay strikt:
  //   - `muted` MUSS gesetzt sein (haben wir)
  //   - `playsInline` MUSS gesetzt sein (haben wir)
  //   - Trotzdem kann .play() im Low-Power-Mode oder bei alten iOS-
  //     Versionen ein Promise-Reject liefern. Dann versuchen wir's mit
  //     einer User-Geste noch einmal, und falls auch das scheitert,
  //     zeigen wir dauerhaft den Poster-Frame.
  //
  // Außerdem: wenn der User „Reduce Motion" aktiviert hat, pausieren wir
  // das Video und zeigen den Poster — dann bleibt die Seite ruhig.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (prefersReducedMotion.matches) {
      video.pause();
      setVideoFailed(true);
      return;
    }

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Letzter Versuch: beim ersten User-Tap nochmal play() triggern.
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

    // Erst nach readyState ≥ 2 (HAVE_CURRENT_DATA) play() versuchen —
    // sonst kann iOS das Video nie starten lassen.
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, []);

  // Scroll-driven exit animation
  useEffect(() => {
    if (!sectionRef.current) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const exitThreshold = windowHeight * 0.3;
      
      if (scrollY > exitThreshold) {
        setIsExiting(true);
      } else {
        setIsExiting(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollProgress = isExiting ? Math.min((window.scrollY - window.innerHeight * 0.3) / (window.innerHeight * 0.5), 1) : 0;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 10 }}
    >
      {/* Background with Ken Burns.
          Extrem kurzer Fade (200 ms) — fühlt sich an wie „sofort da",
          aber ohne hartes Aufpoppen. Die Ken-Burns-Bewegung läuft
          separat und langsam weiter. */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out ${
          phase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `scale(${1 + scrollProgress * 0.06})`,
        }}
      >
        {/* Hintergrund-Video, vollbildfüllend (`object-cover`), stumm,
            Endlos-Loop, autoPlay. `playsInline` verhindert, dass iOS das
            Video im Fullscreen-Player öffnet. `poster` zeigt den ersten
            Frame als sofortigen Standbild-Fallback, bevor das Video
            angespielt wird — so bleibt der Eintritt „sofort da", auch
            wenn die MP4 noch puffert. Kein `hero-kenburns` mehr: die
            Bewegung steckt jetzt im Video selbst. */}
        {/*
          preload="metadata" (nicht "auto"): mobile Nutzer sparen Daten,
          weil der Browser nicht sofort die komplette MP4 zieht, sondern
          nur genug, um Metadaten & erste Frames anzuspielen. Das Video
          läuft trotzdem sofort, weil autoPlay den Buffer automatisch
          weiter füllt.
          `disableRemotePlayback` verhindert, dass iOS/Safari die
          AirPlay/Cast-Overlay-Steuerung einblendet.
          `x5-playsinline` / `webkit-playsinline` sind alte WebKit-
          Varianten für Safari 10 & WeChat-Browser.
          onError: Wenn etwas schiefgeht (Codec unbekannt, Netzwerk weg),
          blenden wir ausschließlich den Poster ein — kein Bruch.
        */}
        {!videoFailed && (
          <video
            ref={videoRef}
            src="/images/hero-motion.mp4"
            poster="/images/hero-motion-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disableRemotePlayback
            // @ts-expect-error — non-standard iOS attributes, trotzdem nützlich
            webkit-playsinline="true"
            // @ts-expect-error — WeChat / Tencent X5 browser
            x5-playsinline="true"
            aria-label="Küstenlandschaft — This Is Not A Hotel"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setVideoFailed(true)}
          />
        )}
        {/* Poster-Fallback: immer im DOM, aber nur sichtbar, wenn das
            Video weg ist. So bleibt die Bildkomposition garantiert
            erhalten — auch auf alten Browsern ohne HEVC/H.264-Support,
            iOS Low-Power-Mode oder mit Reduce-Motion-Einstellung. */}
        {videoFailed && (
          <img
            src="/images/hero-motion-poster.jpg"
            alt="Küstenlandschaft — This Is Not A Hotel"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/50 via-[#0B0B0C]/30 to-[#0B0B0C]/70" />
      </div>

      {/* Content — nur noch der ruhige Tagline-Absatz unten links.
          Fadet SYNCHRON mit Hotelname + PAUSE-Kreis ein (via logoVisible).
          Reine Opacity-Animation, keine Bewegung — ruhig, nicht
          dramatisch. */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end pb-[10vh] px-[6vw]">
        <div
          className="max-w-[420px]"
          style={{
            transform: `translateX(${-scrollProgress * 10}vw)`,
            opacity: logoVisible ? 1 - scrollProgress * 0.75 : 0,
            transition: 'opacity 2.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <p className="text-[#B7B7B7] text-base leading-relaxed">
            A small retreat built for stillness—where check-in feels like exhaling.
            No queues, no noise, just space.
          </p>
        </div>
      </div>

      {/* Wortmarke — mittig, minimalistisch, direkt über dem PAUSE-NOW-Kreis.
          Fungiert als einzige <h1> der Seite (SEO).

          Alle vier Zeilen teilen sich EINEN <span>, damit `line-height` exakt
          den vertikalen Rhythmus bestimmt. Kein flex-gap — so sitzen die
          Zeilen perfekt synchron untereinander und sind typografisch auf
          einem Raster ausgerichtet. */}
      <h1
        className="absolute left-1/2 top-[38vh] -translate-x-1/2 -translate-y-1/2 z-20 m-0 text-center select-none"
        aria-label="This Is Not A Hotel"
        style={{
          transform: `translate(-50%, -50%) translateY(${-scrollProgress * 25}vh)`,
          opacity: logoVisible ? 1 - scrollProgress * 0.9 : 0,
          // Ruhiger Fade, identische Dauer & Kurve wie Tagline und
          // CircleCTA (2.4 s / cubic-bezier 0.22, 1, 0.36, 1). Alle
          // Overlay-Elemente erscheinen damit synchron — eine einzige
          // ruhige Bewegung, nicht mehrere gestaffelte.
          transition: 'opacity 2.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <span
          className="
            font-stencil text-white
            text-[clamp(22px,3.6vw,40px)]
            leading-[1.22]
            tracking-[0.18em]
            block
            text-center
            uppercase
            [font-feature-settings:'liga'_off,'clig'_off]
          "
          style={{ wordSpacing: '0.08em' }}
        >
          THIS<br />
          IS&nbsp;NOT<br />
          A<br />
          HOTEL<sup className="text-[0.42em] align-top ml-[0.12em] tracking-normal">™</sup>
        </span>
      </h1>

      {/*
        Center Circle CTA — „PAUSE NOW".
        Zwei-Wrapper-Struktur: der äußere übernimmt Positionierung
        und scroll-basierte Bewegung, der innere die Entrance-Animation
        (Aufstieg von unten + Fade). So kollidieren Scroll-Transform
        und Entrance-Transform nicht.
      */}
      <div
        className="absolute left-1/2 top-[68vh] -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          transform: `translate(-50%, -50%) translateY(${-scrollProgress * 35}vh) scale(${1 - scrollProgress * 0.15})`,
          opacity: 1 - scrollProgress * 0.8,
        }}
      >
        {/*
          Innerer Entrance-Wrapper.
          PAUSE NOW steigt beim Einblenden aus ~14 vh weiter unten
          sanft nach oben und trifft gleichzeitig mit dem Hotelnamen
          (der von oben ruhig einblendet) in der Bildmitte aufeinander.
          Identische Dauer (2.4 s) & Kurve wie Hotelname und Tagline
          → alle drei bewegen sich synchron.
        */}
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
            // Delay=0: CircleCTA startet seine interne Scale-Animation
            // sofort beim Mount. Da wir im unsichtbaren Wrapper sitzen,
            // sieht der User davon nichts — der Kreis ist bei
            // Sichtbarkeit bereits voll skaliert und taucht nur
            // geschlossen auf.
            delay={0}
            onClick={() => {
              const element = document.querySelector('#location');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
