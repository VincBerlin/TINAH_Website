# Änderungsbefehl — TINAH Website

**Version:** 1.0
**Datum:** 2026-04-20
**Auftraggeber:** Hotelbesitzer (Brand: *This Is Not A Hotel*)
**Umsetzung:** Frontend + SEO

---

## 1. Ziel des Änderungsbefehls

Fünf Kernprobleme der aktuellen Website werden in einem Durchgang behoben,
begleitet durch eine umfassende SEO-Basisoptimierung für Google-Ranking
und Sichtbarkeit in der lokalen Suche.

---

## 2. Umzusetzende Änderungen

### 2.1 Brand-Typografie — Allerta Stencil

| Element | Vorher | Nachher |
| --- | --- | --- |
| Logo-Wortmarke *(TopBar, Footer, Preloader)* | Space Grotesk | **Allerta Stencil** |
| Schlüsselbegriffe in Überschriften *(z. B. „not", „stillness", „simplified", „difference")* | Space Grotesk | **Allerta Stencil** (inline, sparsam) |
| Fließtext / Body | Inter | Inter *(unverändert)* |

**Regel:** Allerta Stencil ist **markengebunden**. Nicht flächig einsetzen,
sondern als Akzentschrift in Logo und vereinzelten Schlagwörtern.

**Technisch:** Google Font-Import in `src/index.css`, neue Utility-Klasse
`font-stencil`, Preconnect in `index.html` für Performance.

---

### 2.2 TopBar — Auto-Hide beim Scrollen

**Problem:** Die obere Leiste scrollt mit, verdeckt beim Runterscrollen Texte.

**Lösung:** Klassischer *hide-on-scroll-down* / *show-on-scroll-up*-Pattern:

1. Oben auf der Seite (`scrollY < 80 px`): immer sichtbar.
2. Nutzer scrollt **nach unten** mit Delta > 6 px → Leiste **gleitet nach oben raus**.
3. Nutzer scrollt **nach oben** mit Delta > 6 px → Leiste **kommt sofort wieder rein**.
4. Hintergrund erhält zusätzlich einen Backdrop-Blur, sobald die Seite
   mehr als 120 px gescrollt wurde.

**Technisch:** `requestAnimationFrame`-gedrosselter Scroll-Listener in
`src/components/TopBar.tsx`. `translate-y-full` + `opacity-0` +
`pointer-events-none` beim Hide-Zustand.

---

### 2.3 Text-Animationen — deutlich früher auslösen

**Problem:** Überschriften und Absätze slidend von links/rechts kommen zu
spät rein — das Hintergrundbild ist bereits am Hinausscrollen, Text ist
unleserlich.

**Lösung:** Neuer Hook `useSectionProgress` in `src/hooks/use-section-progress.ts`.
Mathematik in *Viewport-Höhen* statt in *Scroll-Pixeln relativ zur Section-Oberkante*:

| Trigger | Vorher (Alt) | Nachher (Neu) |
| --- | --- | --- |
| **entrance** = 0 → 1 | Section muss 0 → 33 % herausgescrollt sein | Section 15 % sichtbar → 75 % sichtbar |
| **exit** = 0 → 1 | Section 50 % → 100 % herausgescrollt | Section 20 % → 80 % oberhalb |
| Slide-Distanz | 40–50 vw | 18–22 vw *(Text ist schneller am Ziel)* |

**Betroffene Sektionen:** Location, Rooms, Experience, Details, Dining, Testimonial.

---

### 2.4 Grüne Akzentfarbe → Neutrales Weiß

**Problem:** Auf *Request-a-stay-Button* und den animierten CircleCTA-Kreisen
erscheint ein grünlich-limetter Akzent (`#D4FF90`). Wirkt deplatziert.

**Lösung:** Komplette Ersetzung der Akzentfarbe in Design-Tokens auf
neutrales Weiß (`#FFFFFF`). Hover-States, Pulse-Schatten und der Punkt
oben im Kreis werden weiß.

**Betroffene Dateien:**
- `src/index.css` — CSS-Variablen `--accent`, `--ring` + HSL-Mapping
- `src/components/CircleCTA.tsx` — Hover-Ring & Inner-Fill
- `src/components/Preloader.tsx` — Dot-Pulse + Lade-Linie
- `src/sections/Contact.tsx` — Submit-Button-Textfarbe

---

### 2.5 Buchungs-Flow — dreistufig

**Problem:** Bisher nur ein simples Formular mit Alert-Bestätigung.

**Lösung:** Endlicher Zustandsautomat mit drei sichtbaren Schritten:

```
[ Schritt 1: Anfrage ]  ──▶  [ Schritt 2: Prüfung ]  ──▶  [ Schritt 3: Bestätigt ]
  Kunde sendet Datum       System quittiert als        Bestätigung via
  + Kontaktdaten            „Anfrage, wartet auf         E-Mail-Link oder
                             Besitzer-Freigabe"           UI-Screen
```

**Komponente:** `src/components/BookingFlow.tsx`

- Schritt-Indikator oben (3 Kreise mit Icons)
- Schritt 1 = Formular (Name, E-Mail, Anreise, Abreise, Personen, Nachricht)
- Schritt 2 = „Anfrage eingegangen" + Kartenansicht mit Datum + nächstem Schritt
- Schritt 3 = „Ihre Buchung steht" — wird ausgelöst durch `?booking=confirmed`
  in der URL (Bestätigungs-Link aus der Owner-Mail)

**Produktions-TODO:** der `setTimeout` im `handleSubmit` ist Mock — durch
einen echten Endpoint ersetzen (z. B. Formspree, Resend, eigener
Next-Level-Endpoint mit Zod-Validierung).

---

### 2.6 SEO-Basisoptimierung

**Ziel:** Bessere Auffindbarkeit auf Google, insbesondere für die
Keywords *boutique hotel*, *coastal retreat*, *quiet hotel*, *small hotel*,
*design hotel*.

**Geliefert:**

- `index.html`:
  - `<title>`, Meta-Description, Keywords, Author, Robots
  - Open Graph (FB, LinkedIn, WhatsApp)
  - Twitter Card `summary_large_image`
  - Canonical + hreflang (`en`, `de`, `x-default`)
  - JSON-LD: `Hotel`, `WebSite`, `BreadcrumbList`
  - Font-Preconnect + Hero-Image-Preload (`fetchpriority="high"`)
  - `<noscript>`-Fallback für Bots
- `public/robots.txt` — mit Sitemap-Referenz
- `public/sitemap.xml` — inkl. `image:image`-Einträgen und `hreflang`-Alternates
- `public/site.webmanifest` — PWA-fähig
- Semantische HTML-Landmarks (`<header>`, `<nav>`, `<main>`, `<section aria-label>`,
  `<address>`, `<blockquote>`)
- Exakt ein `<h1>` pro Seite (Preloader zu `<p>` degradiert)
- `loading="lazy"` + beschreibende `alt`-Texte (deutschsprachig) auf allen
  Hintergrundbildern unterhalb des Folds

---

## 3. Abnahme-Checkliste

- [ ] TopBar verschwindet beim Runterscrollen, erscheint beim Hochscrollen
- [ ] Logo + Schlüsselbegriffe erscheinen in Allerta Stencil
- [ ] Kein Grünton mehr auf Buttons und Kreisen
- [ ] Texte links/rechts rutschen früh genug ins Bild
- [ ] Buchungs-Anfrage zeigt 3 Schritte (Anfrage → Prüfung → Bestätigt)
- [ ] `index.html` enthält Title + Description + OG + JSON-LD
- [ ] `robots.txt` + `sitemap.xml` unter `public/` vorhanden
- [ ] Keine TypeScript-Fehler (`npm run build`)
- [ ] Lighthouse SEO ≥ 95, Best Practices ≥ 90
