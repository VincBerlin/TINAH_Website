import { useState, useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Hero } from './sections/Hero';
import { Location } from './sections/Location';
import { Rooms } from './sections/Rooms';
import { Experience } from './sections/Experience';
import { Details } from './sections/Details';
import { Dining } from './sections/Dining';
import { Testimonial } from './sections/Testimonial';
import { Contact } from './sections/Contact';
import { Preloader } from './components/Preloader';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [topBarVariant, setTopBarVariant] = useState<'dark' | 'light'>('dark');

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Handle scroll for top bar variant (dark/light based on section)
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      
      // Change variant based on section (contact section is light)
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const contactRect = contactSection.getBoundingClientRect();
        if (contactRect.top < windowHeight * 0.5) {
          setTopBarVariant('light');
        } else {
          setTopBarVariant('dark');
        }
      }
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

      {/* Sichtbarkeit der TopBar-Inhalte könnte noch per isLoading gegated
          werden — aktuell nicht nötig, da der Preloader ohnehin darüber liegt. */}

      <div className={`min-h-screen bg-[#0B0B0C] ${isLoading ? 'overflow-hidden max-h-screen' : ''}`}>
        <main>
          <Hero isReady={!isLoading} />
          <Location />
          <Rooms />
          <Experience />
          <Details />
          <Dining />
          <Testimonial />
          <Contact />
        </main>
      </div>
    </>
  );
}

export default App;
