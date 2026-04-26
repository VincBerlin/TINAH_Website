import { useState, useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Hero } from './sections/Hero';
import { Location } from './sections/Location';
import { Rooms } from './sections/Rooms';
import { Experience } from './sections/Experience';
import { Rituals } from './sections/Rituals';
import { Details } from './sections/Details';
import { Testimonial } from './sections/Testimonial';
import { Contact } from './sections/Contact';
import { Preloader } from './components/Preloader';
import { LocationPage } from './pages/Location';
import { useRoute } from './hooks/use-route';

/**
 * App-Root.
 *
 * Routing-Strategie:
 *   - `/`           → Startseite (Hero → Location → Rooms → … → Contact)
 *   - `/location`   → Subseite „The Area" (Mawella, Karte, Anreise-Routen).
 *
 * Die Subseite ist als eigene React-Komponente in
 * `src/pages/Location/index.tsx` implementiert. Sie wird über den
 * minimalen `useRoute`-Hook geroutet — kein react-router, weil die App
 * nur diese eine Subseite und die Startseite hat.
 *
 * SEO-Hinweis:
 *   Der `/location`-Pfad ist eine eigene URL mit eigenem Document-
 *   Title, Meta-Description, Canonical und JSON-LD `TouristAttraction`.
 *   Google indiziert sie separat von der Startseite, weil sie ein
 *   eigenes Long-Tail-Keyword bedient („Mawella beach Hiriketiya
 *   Tangalle"). Sitemap.xml referenziert sie explizit.
 *
 * Section-Reihenfolge der Startseite:
 *   Hero → Location → Rooms → Experience → Rituals → Details (Play/
 *   Pause) → Testimonial → Contact (Book).
 *
 * Rituals (§ IV — The Day, Roughly) sitzt zwischen Experience
 * (House Principles) und Details (Play | Pause). Beide Nachbarn
 * sind Cream-Sektionen (#F2EDE4 / #F1E9D7), wodurch die Cream-
 * Pause der Seite zu einem zusammenhängenden Block wächst, ohne
 * harte Hell/Dunkel-Wechsel mittendrin.
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
        <LocationPage />
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
          <Experience />
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
