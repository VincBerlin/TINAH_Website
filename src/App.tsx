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

/**
 * App-Root.
 *
 * Routing-Strategie: KEIN Routing mehr.
 * Früher existierte eine separate Unterseite `/pause` für die
 * Buchungsanfrage. Auf explizite Userwahl hin ist die Buchungsanfrage
 * jetzt der letzte ABSCHNITT auf derselben Startseite (Contact-Section
 * mit `id="book"`). Das PAUSE-NOW-CTA im Hero scrollt dort hin.
 *
 * Section-Reihenfolge:
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

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Scroll-getriggerter Wechsel der TopBar-Variante.
  // Die Book-Section am Ende hat einen dunklen Hintergrund (wie die
  // anderen Sections), deshalb bleibt die TopBar auf „dark" — kein
  // Switch auf „light" mehr nötig.
  useEffect(() => {
    const handleScroll = () => {
      // Reserviert für zukünftige Sections mit hellem Hintergrund.
      // Aktuell bleibt die Bar durchgehend „dark".
      setTopBarVariant('dark');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
