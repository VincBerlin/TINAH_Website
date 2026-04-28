import { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Hero } from './sections/Hero';
import { Location } from './sections/Location';
import { Rooms } from './sections/Rooms';
// Experience-Section (House-Principles-Letter-Grid + EXPLORE-CTA) wurde
// am 2026-04-26 auf User-Request komplett aus der Landing-Page entfernt.
// Die Datei `src/sections/Experience.tsx` ist gelöscht; in der
// Section-Reihenfolge folgt Rooms direkt auf Rituals.
import { Rituals } from './sections/Rituals';
import { Details } from './sections/Details';
import { Testimonial } from './sections/Testimonial';
import { Contact } from './sections/Contact';
import { Preloader } from './components/Preloader';
import { useRoute } from './hooks/use-route';

const LocationPage = lazy(() => import('./pages/Location').then((m) => ({ default: m.LocationPage })));
const RoomsPage = lazy(() => import('./pages/Rooms').then((m) => ({ default: m.RoomsPage })));

/**
 * App-Root.
 *
 * Routing-Strategie:
 *   - `/`           → Startseite (Hero → Location → Rooms → … → Contact)
 *   - `/location`   → Subseite „The Area" (Mawella, Karte, Anreise-Routen).
 *   - `/rooms`      → Subseite „The Rooms" (5 Zimmer-Editorial,
 *                     room3–room7, alternierende Cream/Cream2-Sections).
 *
 * Die Subseiten sind als eigene React-Komponenten in
 * `src/pages/Location/index.tsx` und `src/pages/Rooms/index.tsx`
 * implementiert. Geroutet über den minimalen `useRoute`-Hook — kein
 * react-router, weil die App auf zwei Subseiten + Startseite skaliert.
 *
 * SEO-Hinweis:
 *   Der `/location`-Pfad ist eine eigene URL mit eigenem Document-
 *   Title, Meta-Description, Canonical und JSON-LD `TouristAttraction`.
 *   Google indiziert sie separat von der Startseite, weil sie ein
 *   eigenes Long-Tail-Keyword bedient („Mawella beach Hiriketiya
 *   Tangalle"). Sitemap.xml referenziert sie explizit.
 *
 * Section-Reihenfolge der Startseite (2026-04-26, nach Entfernung
 * der Experience-Section):
 *   Hero → Location → Rooms → Rituals → Details (Play/Pause) →
 *   Testimonial → Contact (Book).
 *
 * Rituals (§ IV — The Day, Roughly) sitzt jetzt direkt zwischen
 * Rooms und Details (Play | Pause). Beide Cream-Nachbarn der
 * Cream-Pause sind weiterhin im selben Farb-Cluster (#F2EDE4 /
 * #F1E9D7), die Pause-Mitte der Seite bleibt ein zusammenhängender
 * Hell-Block ohne harten Wechsel.
 */

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [topBarVariant, setTopBarVariant] = useState<'dark' | 'light'>('dark');
  const [route] = useRoute();

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Scroll-getriggerter Wechsel der TopBar-Variante.
  // Auf der Startseite bleibt die Bar dauerhaft „dark"; auf der
  // Location-Subseite verwenden wir „light" (Cream-Background braucht
  // dunkle Schrift), aber: die LocationPage hat ihre EIGENE Header-
  // Leiste mit Back-Link, deshalb blenden wir die globale TopBar dort
  // komplett aus (Mount im Conditional-Render unten).
  useEffect(() => {
    const handleScroll = () => {
      setTopBarVariant('dark');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================================
  // Subseite /location — eigener Render-Pfad
  // ------------------------------------------------------------
  // Wenn der User direkt auf /location landet (oder per Link/Navigate
  // dorthin geht), zeigen wir NUR die LocationPage. Kein Preloader,
  // kein TopBar, keine Hero-Sections. Die LocationPage hat ihren
  // eigenen Cream-Header mit „← Back"-Link, der wieder auf `/`
  // navigiert. Der Sound-Toggle bleibt erreichbar, indem die TopBar
  // hier bewusst NICHT gemountet wird — auf der Subseite soll die
  // Lese-Atmosphäre nicht durch ein Audio-UI gebrochen werden.
  // ============================================================
  if (route === '/location') {
    return (
      <>
        <div className="grain-overlay" />
        <Suspense fallback={null}><LocationPage /></Suspense>
      </>
    );
  }

  // ============================================================
  // Subseite /rooms — eigener Render-Pfad
  // ------------------------------------------------------------
  // Identische Routing-Strategie wie /location: kein Preloader,
  // keine globale TopBar, eigene Header-Bar mit „← Back"-Link in
  // der RoomsPage. Wir mounten den Grain-Overlay weiter, damit
  // die filmische Foto-Optik der Cream-Subseite erhalten bleibt.
  // ============================================================
  if (route === '/rooms') {
    return (
      <>
        <div className="grain-overlay" />
        <Suspense fallback={null}><RoomsPage /></Suspense>
      </>
    );
  }

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/*
        TopBar wird bereits WÄHREND des Preloaders gemountet.
        Visuell bleibt sie bis zum Preloader-Ende verdeckt (Preloader hat
        z-[9999], TopBar z-[100]), aber:
        - das <audio>-Element im AmbientSound-Child mountet sofort,
        - der Browser kann die Datei während der 2,6 s Preloader-Zeit laden,
        - Meeresrauschen ist bereits zu hören, wenn der Preloader wegblendet.
        Ohne dieses Vor-Mounten würde der Sound erst 2,6 s nach Seitenstart
        anfangen zu laden.
      */}
      <TopBar variant={topBarVariant} />

      <div
        className={`min-h-screen bg-[#0B0B0C] ${
          isLoading ? 'overflow-hidden max-h-screen' : ''
        }`}
      >
        <main>
          <Hero isReady={!isLoading} />
          <Location />
          <Rooms />
          <Rituals />
          <Details />
          <Testimonial />
          <Contact />
        </main>
      </div>
    </>
  );
}

export default App;
