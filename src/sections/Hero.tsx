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
      data-nav-theme="dark"
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
            // Per User-Request (2026-04-23): Hero-Hintergrundvideo
            // erneut getauscht — jetzt auf das Hiru-Video. Quelle:
            // Hiru.mov (HEVC, 1920x1080, 60 fps, ~41 MB). Die Datei
            // wurde zu einem web-sicheren H.264-MP4 transkodiert
            // (720p, 30 fps, CRF 28, faststart) → hiru.mp4 (~11 MB).
            // HEVC läuft auf Chrome/Firefox nicht zuverlässig,
            // MP4/H.264/yuv420p ist überall abspielbar.
            src="/images/hiru.mp4"
            poster="/images/hiru-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disableRemotePlayback
            // Non-standard iOS / WeChat-X5 Attribute — TS-Typen
            // akzeptieren sie inzwischen über das index-signature in
            // der React DOM-Typdef, deshalb keine @ts-expect-error
            // mehr nötig (sonst „Unused directive"-Fehler im
            // Production-Build via `tsc -b`).
            webkit-playsinline="true"
            x5-playsinline="true"
            aria-label="Hiru — This Is Not A Hotel, Mawella Beach, Sri Lanka"
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
            src="/images/hiru-poster.jpg"
            alt="Hiru — This Is Not A Hotel, Mawella Beach, Sri Lanka"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/50 via-[#0B0B0C]/30 to-[#0B0B0C]/70" />
      </div>

      {/* Wortmarke — mittig, minimalistisch.
          Fungiert als einzige <h1> der Seite (SEO).

          Layout-Pass 2026-04-23 (User-Request, Inspirations-Layout):
          H1 rückt nach oben (24vh) und bekommt DIREKT darunter die
          Tagline als zweite Zeile. Dadurch sitzt der PAUSE-NOW-Button
          exakt in der vertikalen Seiten-Mitte, und der neue Drei-
          Spalten-Footer-Block (LOCATION / DISPOSITION / OPEN) passt
          sauber in den unteren Seitendrittel.

          Alle Zeilen teilen sich EINEN <span> für die Wortmarke plus
          ein zweites Paragraph-Element für die Tagline — beide im
          gleichen zentrierten Stack, exakt ausgerichtet. */}
      <h1
        className="absolute left-1/2 top-[24vh] -translate-x-1/2 -translate-y-1/2 z-20 m-0 text-center select-none"
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
        {/* Horizontale Wortmarke — alles nebeneinander auf einer Zeile,
            wie ein klassisches Hotelschild. Early decision (auf explizite
            User-Anfrage): NICHT mehr gestapelt. Die Typo-Skala ist auf
            viewport-breite geeicht (5.4vw), damit die Zeile auf Mobile
            nicht umbricht und auf Desktop nicht zu fett auftritt. */}
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

        {/* Tagline — direkt unter der Wortmarke, nah dran
            (mt-[1.2vh] entspricht dem Inspirations-Abstand).
            Per User-Request (2026-04-23) aus dem unteren linken Rand
            hierher verschoben, damit der Hotelname den ersten Blick
            führt und die Tagline die zweite Leseschicht bildet.

            SEO-Text: direkte, keyword-dichte Zeile, die Google sofort
            lesen kann („Pause Your Stay at Our Hotel on Mawella Beach
            Between Tangalle and Hiriketiya Sri Lanka"). Packt alle
            drei Ortsnamen, das Land und das Keyword „Hotel" in einen
            einzigen natürlichen Satz ohne Bindestriche — die
            hyphenfreie Schreibweise hält Googles Tokenizer auf den
            vollen Begriffen (Mawella Beach, Sri Lanka). */}
        {/*
          2026-04-23 (User-Request): Tagline-Schrift an den Stil der
          übrigen kleinen Fließtexte angeglichen — gleiche Größen-
          Clamp-Range, gleiche Leading, gleiche Farbe wie die Body-
          Texte im Drei-Spalten-Block darunter. Dadurch sitzt die
          Typo-Hierarchie sauber: H1 groß, alle Body-Zeilen klein und
          einheitlich.
        */}
        <p
          className="mt-[1.2vh] text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[640px] mx-auto"
          style={{ fontWeight: 400 }}
        >
          Pause Your Stay at Our Hotel on Mawella Beach Between Tangalle
          and Hiriketiya Sri Lanka.
        </p>
      </h1>

      {/*
        Center Circle CTA — „PAUSE NOW".
        Zwei-Wrapper-Struktur: der äußere übernimmt Positionierung
        und scroll-basierte Bewegung, der innere die Entrance-Animation
        (Aufstieg von unten + Fade). So kollidieren Scroll-Transform
        und Entrance-Transform nicht.

        Layout-Pass 2026-04-23: Button sitzt jetzt in der vertikalen
        Seiten-Mitte (top-[50vh]). Der obere Stack (H1+Tagline) rückte
        nach oben (24vh), der untere 3-Spalten-Block sitzt bei ~88vh —
        der Button ankert die Komposition mittig.
      */}
      <div
        className="absolute left-1/2 top-[54vh] -translate-x-1/2 -translate-y-1/2 z-20"
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
            // 2026-04-27 (User-Korrektur): zurück auf "sm". Der User hat
            // bestätigt, dass die Standardgröße korrekt war — nur die
            // anderen Disc-Buttons (Location-Section, Rooms, Subseite)
            // sollten auf "sm" angeglichen werden, nicht der Hero-CTA.
            size="sm"
            // Delay=0: CircleCTA startet seine interne Scale-Animation
            // sofort beim Mount. Da wir im unsichtbaren Wrapper sitzen,
            // sieht der User davon nichts — der Kreis ist bei
            // Sichtbarkeit bereits voll skaliert und taucht nur
            // geschlossen auf.
            delay={0}
            onClick={() => {
              // Smooth-Scroll zur Buchungs-Sektion ganz unten auf der
              // Startseite. Keine Unterseite mehr — bewusst auf Wunsch
              // des Users: der Besucher bleibt in der Seite, der Ton
              // läuft durch, und die Wortmarke oben verschwindet nur
              // organisch beim Scrollen.
              const book = document.getElementById('book');
              if (book) {
                book.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          />
        </div>
      </div>

      {/*
        Drei-Spalten-Footer-Block — 01 LOCATION / 02 DISPOSITION / 03 OPEN.

        Per User-Request 2026-04-23 (Inspirations-Layout): kompakte
        Hotel-Manifest-Zeile am unteren Bildrand. Drei Mikro-Absätze in
        Stencil-Caps + Body-Text, jeweils nummeriert. Sie bilden die
        dritte Leseschicht der Hero-Seite — nach Wortmarke (1) und
        PAUSE-Button (2) — und tragen zugleich SEO-relevante Keywords:
          • LOCATION: „Mawella Beach, southern Sri Lanka" — primärer
            geographischer Anker.
          • DISPOSITION: das italic-Statement „Less a hotel, more an
            argument against them" — markenprägende Brand-Voice.
          • OPEN: Saison & Reservierungs-Hinweis. Wirkt zusätzlich als
            implizites FAQ-Snippet (Google liebt strukturierte Öffnungs-
            zeiten in der Nähe von Geo-Keywords).

        Visuell:
          - Drei gleich breite Spalten via grid-cols-3 (md+); auf
            kleinen Screens stapeln wir zu einer einzigen Spalte (mobile
            first, sonst überlagern sich Texte mit dem PAUSE-Button).
          - Stencil-Header (01 / LOCATION) tracking-[0.22em] uppercase,
            heller als der Body-Text → klare Hierarchie.
          - Body-Text in #B7B7B7 (gleicher Grauwert wie Tagline) →
            visuell konsistent mit dem H1-Stack darüber.
          - Fade folgt logoVisible — gleiche Choreografie wie alle
            anderen Overlay-Elemente, damit nichts „nachzappelt".
          - Scroll-Translate identisch zum PAUSE-Button (sie verlassen
            die Bühne synchron, wenn der User nach unten scrollt).
      */}
      <div
        className="absolute left-0 right-0 bottom-[6vh] z-20 px-[6vw] pointer-events-none"
        style={{
          transform: `translateY(${-scrollProgress * 18}vh)`,
          opacity: logoVisible ? 1 - scrollProgress * 0.9 : 0,
          transition: 'opacity 2.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-[3vh] gap-x-[4vw] max-w-[1100px] mx-auto">
          {/* 01 — LOCATION
              Color-Update 2026-04-26 (User-Request): Chapter-Header
              auf Brand-Terracotta #B84A1F gewechselt — selbe Akzent-
              Farbe wie „It's a house." (Location-Section), „stillness"
              (Rooms) und das PAUSE im Hero. Damit liest sich die
              Hero-Footer-Zeile als zusammenhängender Brand-Anker
              statt als neutrales Mikrocopy-Cluster. */}
          <div className="text-left">
            <div
              className="font-stencil text-[10px] uppercase tracking-[0.28em] mb-[1vh]"
              style={{ color: '#B84A1F' }}
            >
              01 / Location
            </div>
            <p className="text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[280px]">
              A five-room house on Mawella Beach, southern Sri Lanka. Salt
              water and air, peacocks, palm trees, nothing more.
            </p>
          </div>

          {/* 02 — DISPOSITION (italic Brand-Voice-Statement) */}
          <div className="text-left md:text-center">
            <div
              className="font-stencil text-[10px] uppercase tracking-[0.28em] mb-[1vh]"
              style={{ color: '#B84A1F' }}
            >
              02 / Disposition
            </div>
            <p className="italic text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[280px] md:mx-auto">
              Less a hotel, more an argument against them.
            </p>
          </div>

          {/* 03 — PLAY | PAUSE (Aktivitäten / Brand-Voice-Manifest). */}
          <div className="text-left md:text-right">
            <div
              className="font-stencil text-[10px] uppercase tracking-[0.28em] mb-[1vh]"
              style={{ color: '#B84A1F' }}
            >
              03 / Play&nbsp;|&nbsp;Pause
            </div>
            <p className="text-[#B7B7B7] text-[clamp(11px,0.85vw,13px)] leading-snug max-w-[280px] md:ml-auto">
              Co-work, Yoga, Surf, Run, Leave an angel print on the beach.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
