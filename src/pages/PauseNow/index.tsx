import { useEffect } from 'react';
import { PauseNowBooking } from './PauseNowBooking';

/**
 * /pause — dedizierte Buchungs-Unterseite.
 *
 * Wird über Client-Side-Routing in App.tsx gemountet, wenn
 * `location.pathname === '/pause'`. Setzt Document-Titel + Meta-Description
 * dynamisch, damit Suchmaschinen und Social-Crawler (LinkedIn, WhatsApp-
 * Preview, Google) ein sauberes Snippet bekommen — wichtig für SEO, auch
 * wenn die Route client-seitig gerendert wird.
 */
export function PauseNowPage() {
  useEffect(() => {
    const prevTitle = document.title;
    const prevDescription = document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content');

    document.title =
      'Book your pause — This Is Not A Hotel™ · Hiriketiya, Sri Lanka';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Request your stay at This Is Not A Hotel™ — a quiet escape on Sri Lanka's south coast between Hiriketiya and Tangalle. No bookings, no surprises — just a direct request.",
      );
    }

    // Canonical-URL für die Buchungsseite. Google behandelt das als
    // eigene, indexierbare Seite — separat vom Home-Hero.
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const prevCanonical = canonical.href;
    canonical.href = `${window.location.origin}/pause`;

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDescription) {
        metaDesc.setAttribute('content', prevDescription);
      }
      if (canonical && prevCanonical) {
        canonical.href = prevCanonical;
      }
    };
  }, []);

  return <PauseNowBooking />;
}
