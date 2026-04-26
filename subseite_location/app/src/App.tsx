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
 * Routing: KEIN Routing. Eine Seite, alle Sektionen vertikal.
 * Sektion-Reihenfolge:
 *   Hero → Location → Rooms → Experience → Rituals → Details (Play/Pause)
 *   → Testimonial → Contact (Book).
 *
 * Rituals (§ IV — The Day, Roughly) wurde 1:1 aus der Inspirations-
 * Datei tinh/index.html übernommen und sitzt zwischen Experience
 * (House Principles) und Details (Play | Pause). Beide Nachbarn sind
 * Creme-Sektionen (#F2EDE4 / #F1E9D7), wodurch die Cream-Pause der
 * Seite zu einem zusammenhängenden Block wächst, ohne harte
 * Hell/Dunkel-Wechsel mittendrin.
 */

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [topBarVariant, setTopBarVariant] = useState<'dark' | 'light'>('dark');

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setTopBarVariant('dark');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      <div className="grain-overlay" />

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
