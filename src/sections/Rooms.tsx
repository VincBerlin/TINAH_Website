import { CircleCTA } from '../components/CircleCTA';
import { useSectionProgress } from '../hooks/use-section-progress';
import { useRoute } from '../hooks/use-route';

/**
 * Rooms section — dark interlude between Location and Experience.
 *
 * 2026-04-27 update (User-Request):
 *   - Hintergrund jetzt das echte Bett-Foto aus `/public/images/bett.JPG`.
 *     Vorher war hier ein warmer brauner Gradient-Placeholder. Das Bild
 *     wird `cover` über die volle Section gerendert (object-fit Optik),
 *     mit derselben scroll-getriggerten Scale + Opacity-Animation wie
 *     vorher der Gradient — entrance pulled scale 1.12 → 1.0, exit
 *     pulled wieder auf 1.06 zurück.
 *   - Über dem Foto liegt weiterhin ein dunkler Glas-Overlay
 *     (linker und rechter Rand stärker, Mitte transparenter), damit
 *     die weiße Stencil-Headline links und der Glass-CircleCTA rechts
 *     auf jedem Pixel des Fotos lesbar bleiben.
 *   - Headline-Typo, CircleCTA und Scroll-Motion-Logik unverändert.
 *
 * SEO-Hinweis:
 *   `<img>`-Element mit konkretem `alt`-Text statt CSS-`background-image`
 *   gewählt, damit Google das Bild beim Bilderindex erfassen kann
 *   (CSS-Backgrounds werden bei Image-Search nicht gecrawlt). `loading
 *   = "lazy"` verhindert dabei einen LCP-Hit, da Rooms erst nach Hero
 *   und Location in den Viewport scrollt.
 */

const BG_IMAGE = '/images/bett.JPG';

export function Rooms() {
  const { ref, entrance, exit } = useSectionProgress<HTMLElement>();
  // Routing für den VIEW-ROOMS-CTA: navigiert auf die dedizierte
  // /rooms-Subseite (5 Zimmer, jeweils eigene Foto-Story). Ersetzt
  // den alten ScrollIntoView auf #experience (Section gelöscht).
  const [, navigate] = useRoute();

  return (
    <section
      ref={ref}
      id="rooms"
      data-nav-theme="dark"
      className="relative w-screen h-screen-safe overflow-hidden"
      style={{ zIndex: 30, backgroundColor: '#1A1916' }}
      aria-label="Zimmer"
    >
      {/* Background — Bett-Foto.
          Statt CSS-`background-image` ein echtes `<img>` mit alt-Text:
          besserer SEO-Index (Google Images), bessere a11y
          (Screen-Reader liest „Bett im Zimmer..."), gleicher visueller
          Effekt durch `object-cover` und absolutes Stretching auf die
          ganze Section. Scale + Opacity stammen weiter aus
          useSectionProgress, damit das Bild beim Eintreten leicht
          „atmet" und beim Austreten ruhig zurückzoomt. */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${1.12 - entrance * 0.12 + exit * 0.06})`,
          opacity: 0.85 + entrance * 0.15 - exit * 0.65,
        }}
      >
        <img
          src={BG_IMAGE}
          alt="Schlafzimmer im This Is Not A Hotel — minimalistisches Bett, warm und ruhig, fünf Zimmer auf Mawella Beach, Sri Lanka"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        {/* Dunkles Glas-Overlay — links/rechts stärker, Mitte
            transparenter, damit Stencil-Headline (links) und
            CircleCTA (rechts) lesbar bleiben, das Foto in der Mitte
            aber atmen darf. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C]/65 via-[#0B0B0C]/20 to-[#0B0B0C]/55" />
      </div>

      {/* Left content — slides in MUCH earlier */}
      <div className="absolute left-[7vw] top-1/2 -translate-y-1/2 z-20">
        <div
          style={{
            transform: `translateX(${(1 - entrance) * -18}vw) translateX(${-exit * 12}vw)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          {/*
            Brand-Voice 2026-04-26 (User-Request): Headline rein in
            Allerta Stencil. Der frühere Italic-Serif-Akzent auf
            „stillness" wurde entfernt, weil Allerta Stencil laut
            Brand-Guideline die einzige Headline-Schrift ist. Der
            visuelle Akzent kommt jetzt aus der Terracotta-Farbe
            (#B84A1F) auf demselben Wort — gleicher rhythmischer Effekt,
            aber innerhalb des Brand-Type-Systems.
          */}
          <h2
            className="font-stencil text-white leading-[0.95] max-w-[460px]"
            style={{
              fontSize: 'clamp(32px, 4.5vw, 64px)',
              letterSpacing: '0.02em',
            }}
          >
            Rooms designed<br />for{' '}
            <span style={{ color: '#B84A1F' }}>stillness</span>.
          </h2>
        </div>

        <div
          className="mt-8"
          style={{
            transform: `translateY(${(1 - entrance) * 5}vh) translateY(${exit * 6}vh)`,
            opacity: entrance - exit * 0.75,
          }}
        >
          <p className="text-[#B7B7B7] text-base max-w-[400px]">
            Minimal, warm, and quiet—so you can actually rest.
          </p>
        </div>
      </div>

      {/* Right Circle CTA — UNCHANGED. */}
      <div
        className="absolute right-[8vw] top-[56vh] -translate-y-1/2 z-20"
        style={{
          transform: `translateY(-50%) translateX(${(1 - entrance) * 22}vw) translateX(${exit * 20}vw) scale(${0.78 + entrance * 0.22 - exit * 0.15})`,
          opacity: entrance - exit * 0.8,
        }}
      >
        <CircleCTA
          text="VIEW ROOMS"
          // Größe identisch zum Hero-PAUSE-NOW-Button — der Disc dient
          // hier nur als sekundärer Section-Anker, nicht als Haupt-Eye-
          // catcher. (User-Request 2026-04-27)
          size="sm"
          onClick={() => navigate('/rooms')}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0B0C] to-transparent pointer-events-none" />
    </section>
  );
}
