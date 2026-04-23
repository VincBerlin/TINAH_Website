import { useCallback, useEffect, useState } from 'react';

/**
 * Minimaler Client-Side-Router.
 *
 * Warum kein react-router?
 *   - Wir brauchen genau zwei Routen: `/` (Homepage) und `/pause` (Booking-
 *     Subpage). Ein externes Router-Package (react-router-dom ≈ 40 kB)
 *     wäre für diesen Funktionsumfang klare Overkill-Bloat.
 *   - Der History-API-basierte Ansatz unten ist ~20 Zeilen, hat keine
 *     Dependencies und funktioniert identisch in allen relevanten
 *     Browsern (Chrome, Safari, iOS Safari, Firefox, Edge).
 *
 * SEO-Hinweis:
 *   pushState-URLs (`/pause`) sind für Google perfekt indexierbar — der
 *   Crawler rendert die Seite aus, sieht die serverseitig ausgelieferte
 *   index.html und die dynamisch gerenderten h1/h2-Tags. Einzige Pflicht:
 *   der Hosting-Provider muss 404s auf index.html umleiten (Vercel,
 *   Netlify, Cloudflare Pages machen das automatisch über eine
 *   `_redirects`- oder `vercel.json`-Config — siehe public/_redirects).
 */

export type Route = '/' | '/pause';

function currentPath(): Route {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname;
  return path === '/pause' || path.startsWith('/pause/') ? '/pause' : '/';
}

export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(currentPath);

  useEffect(() => {
    const onPopState = () => setRoute(currentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: Route) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === next) return;
    window.history.pushState({}, '', next);
    setRoute(next);
    // Scrollposition resetten — ein Routenwechsel verhält sich wie ein
    // Seitenwechsel, nicht wie ein Anker-Sprung.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return [route, navigate];
}
