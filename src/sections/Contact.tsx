import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BookingFlow } from '../components/BookingFlow';

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full min-h-screen bg-[#F3F0EA]"
      style={{ zIndex: 90 }}
      aria-label="Kontakt und Buchungsanfrage"
    >
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left column — Booking flow + contact info */}
        <div
          className={`flex-1 py-16 px-[6vw] lg:px-[4vw] flex flex-col justify-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          <BookingFlow />

          {/* Contact details */}
          <div className="mt-12 pt-8 border-t border-[#0B0B0C]/10 max-w-[520px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#3F3F3F] mt-0.5" aria-hidden />
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#3F3F3F] mb-1">
                    E-Mail
                  </span>
                  <a
                    href="mailto:hello@thisisnotahotel.com"
                    className="text-sm text-[#0B0B0C] hover:underline"
                  >
                    hello@thisisnotahotel.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#3F3F3F] mt-0.5" aria-hidden />
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#3F3F3F] mb-1">
                    Telefon
                  </span>
                  <a href="tel:+15550142198" className="text-sm text-[#0B0B0C] hover:underline">
                    +1 (555) 014-2198
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#3F3F3F] mt-0.5" aria-hidden />
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#3F3F3F] mb-1">
                    Adresse
                  </span>
                  <address className="not-italic text-sm text-[#0B0B0C]">
                    12 Coast Road, Calm Bay
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Image */}
        <div
          className={`hidden lg:block lg:w-[45%] relative transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-80 scale-[1.03]'
          }`}
        >
          <img
            src="/images/contact-portrait.jpg"
            alt="Ruhiger Moment — This Is Not A Hotel"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F3F0EA]/20 to-transparent" />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B0B0C] py-8 px-[6vw]">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <span
            className="font-stencil text-[13px] uppercase tracking-[0.22em] text-white"
            aria-label="This Is Not A Hotel"
          >
            THIS IS NOT A HOTEL<sup className="text-[0.8em] align-top ml-[0.2em] tracking-normal">™</sup>
          </span>
          <span className="text-[#B7B7B7] text-xs">© 2026 All rights reserved.</span>
          <nav aria-label="Rechtliches" className="flex gap-6">
            <a href="/privacy" className="text-[#B7B7B7] text-xs hover:text-white transition-colors">
              Datenschutz
            </a>
            <a href="/terms" className="text-[#B7B7B7] text-xs hover:text-white transition-colors">
              AGB
            </a>
            <a href="/imprint" className="text-[#B7B7B7] text-xs hover:text-white transition-colors">
              Impressum
            </a>
          </nav>
        </div>
      </footer>
    </section>
  );
}
