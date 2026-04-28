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

export type Route = '/' | '/pause' | '/location' | '/rooms';

function currentPath(): Route {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname;
  if (path === '/pause' || path.startsWith('/pause/')) return '/pause';
  if (path === '/location' || path.startsWith('/location/')) return '/location';
  if (path === '/rooms' || path.startsWith('/rooms/')) return '/rooms';
  return '/';
}

/**
 * Custom-Event-Name für seiten-interne Routen-Wechsel.
 *
 * Warum: `useRoute` wird in mehreren Komponenten benutzt (TopBar,
 * Location-Section, Hero, App-Root). Jede Instanz hat ihr EIGENES
 * lokales `useState`. Browser-eigene `popstate`-Events feuern NUR bei
 * Back/Forward, nicht bei `pushState`. Deshalb dispatcht `navigate`
 * zusätzlich dieses CustomEvent — alle Hook-Instanzen lauschen darauf
 * und syncen ihren State, sodass z. B. die App-Root den Route-Wechsel
 * mitbekommt, wenn die TopBar `navigate('/location')` aufruft.
 *
 * Bug-Fix 2026-04-26: ohne diesen Event-Bus hat ein Klick auf den
 * LOCATION-Nav-Button die URL zwar via `pushState` geändert, aber das
 * App-Root-Component hat den Wechsel nicht mitbekommen — die
 * Subseite wurde nicht gerendert.
 */
const ROUTE_CHANGE_EVENT = 'tinah:route-change';

export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(currentPath);

  useEffect(() => {
    const sync = () => setRoute(currentPath());
    window.addEventListener('popstate', sync);
    window.addEventListener(ROUTE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(ROUTE_CHANGE_EVENT, sync);
    };
  }, []);

  const navigate = useCallback((next: Route) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === next) return;
    window.history.pushState({}, '', next);
    // Eigene State sofort updaten, damit das aufrufende Component
    // unmittelbar reagieren kann (kein Mikro-Lag durch das Event).
    setRoute(next);
    // Globales Event — alle anderen `useRoute`-Instanzen syncen sich
    // hierdurch. Ohne diese Zeile rendert App.tsx die Subseite NICHT,
    // weil ihr lokaler State nicht mitkriegt, dass die TopBar
    // navigiert hat.
    window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT));
    // Scrollposition resetten — ein Routenwechsel verhält sich wie ein
    // Seitenwechsel, nicht wie ein Anker-Sprung.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return [route, navigate];
}
