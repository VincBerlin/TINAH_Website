# TINAH – Architektur & Umbauplan

> Ziel: Aus dem bestehenden "This is not a hotel"-Template eine produktionsreife,
> SEO-starke Hotel-Buchungsseite machen – mit funktionierender Anfrage/Buchung,
> Bestätigungsmail und konsistentem Branding.

---

## 1. Ist-Analyse (Status Quo)

### 1.1 Technik-Stack (OK)
- React 19 + TypeScript + Vite 7
- Tailwind 3 + shadcn/ui + Radix primitives
- `lucide-react` Icons, `react-day-picker`, `react-hook-form`, `zod` (alle installiert, aber großteils ungenutzt)

### 1.2 Struktur (funktioniert)
```
src/
├── App.tsx                    # Orchestriert Preloader + TopBar + 9 Sections
├── index.css                  # CSS-Variablen, Grain, Animationen
├── config.ts                  # Interfaces definiert, Werte aber alle ""
├── components/
│   ├── Preloader.tsx
│   ├── TopBar.tsx             # 3 Pills (PLAY / PAUSE / LOCATION) – ohne Funktion
│   ├── CircleCTA.tsx
│   └── ScrollToTop.tsx
└── sections/
    ├── Hero.tsx, Location.tsx, Rooms.tsx, Experience.tsx,
    ├── Details.tsx, Dining.tsx, Testimonial.tsx, Journal.tsx,
    └── Contact.tsx            # enthält Form + Footer
```

### 1.3 Kritische Lücken

| Bereich | Problem | Schwere |
|---|---|---|
| **Buchung** | `handleSubmit` ruft nur `alert()` – es wird nichts versendet, gespeichert oder verarbeitet | 🔴 Blocker |
| **Buchungsfelder** | Keine Check-in/Check-out Picker, keine Gästezahl, keine Zimmerwahl, kein Preis | 🔴 Blocker |
| **E-Mail** | Keine Bestätigungs-Mail an Gast, keine Benachrichtigung an Hotel | 🔴 Blocker |
| **SEO** | `<title>` generisch, `description=""`, `keywords=""`, `lang=""`, kein OG/Twitter, kein JSON-LD, kein sitemap, kein robots.txt | 🔴 Blocker |
| **Branding-Drift** | README/info.md = "Wine Estate", Code = "Boutique Hotel", `config.ts` ist komplett leer und NICHT an die Components angebunden | 🟠 Hoch |
| **i18n** | Alles hardcoded Englisch; Projekt-Instruktion ist Deutsch | 🟠 Hoch |
| **A11y** | `<html lang="">`, keine `aria-live` Messages, Form-Labels nicht korrekt per `htmlFor`/`id` verknüpft | 🟠 Hoch |
| **Performance** | Hero-Image nicht vorgeladen, keine `loading="lazy"`, kein `srcset`/WebP, Scroll-Handler ohne `rAF`-Throttle | 🟡 Mittel |
| **Rechtlich** | Kein Impressum, keine Datenschutzerklärung, keine Cookie-/Consent-Lösung, kein AGB | 🔴 Blocker (EU) |
| **Tech-Debt** | `kimi-plugin-inspect-react` in Prod-Build, `dist/` im Repo, keine Tests, `base: './'` + absolute Pfade im Code | 🟡 Mittel |

---

## 2. Ziel-Architektur (Soll)

### 2.1 High-Level-Diagramm

```
┌────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                           │
│                                                                 │
│  React Router (/, /zimmer/:slug, /buchen, /impressum, …)       │
│  │                                                              │
│  ├── Pages (Home, RoomDetail, Booking, Legal)                   │
│  ├── Sections (Hero, Rooms, Dining, …)    ← lesen aus content/  │
│  ├── Booking-Flow (Step 1..4)             ← zod + react-hook-form│
│  └── i18n (de / en)                       ← t() aus /locales    │
│                                                                 │
│  POST /api/booking-request ─────────────────┐                   │
└─────────────────────────────────────────────┼───────────────────┘
                                              │
                                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    Backend-Funktion (Edge/Serverless)           │
│  (Vercel Function / Netlify Function / Cloudflare Worker)       │
│                                                                 │
│   1. Zod-Validation + Rate-Limit + Honeypot-Check               │
│   2. Speichern (Airtable / Supabase / Notion-API)               │
│   3. Transaktionsmail via Resend / Postmark / SendGrid:         │
│      ├── Gast:    HTML-Bestätigung (Brand-konform)              │
│      └── Hotel:   Interne Benachrichtigung                      │
│   4. Antwort 200 / 4xx                                          │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Neuer Ordner-Aufbau

```
app/
├── public/
│   ├── robots.txt                 [NEU]
│   ├── sitemap.xml                [NEU – generiert]
│   ├── favicon.ico, -16, -32, apple-touch-icon.png, site.webmanifest [NEU]
│   └── og/og-default.jpg          [NEU – 1200×630]
│
├── api/                           [NEU]
│   ├── booking-request.ts         # Haupt-Endpoint
│   └── lib/
│       ├── email.ts               # Resend-Client
│       ├── templates/
│       │   ├── guest-confirmation.html.ts
│       │   └── hotel-notification.html.ts
│       └── schema.ts              # Zod BookingRequestSchema
│
├── src/
│   ├── content/                   [NEU – Single-Source-of-Truth]
│   │   ├── brand.ts               # Name, Claim, Farben-Tokens, Fonts
│   │   ├── site.ts                # SEO-Defaults, Kontakt, Adresse, Social
│   │   ├── rooms.ts               # Room[] inkl. Preise, Kapazität, Bilder
│   │   ├── experiences.ts
│   │   ├── dining.ts
│   │   ├── testimonials.ts
│   │   ├── journal.ts
│   │   └── legal.ts               # Impressum, Datenschutz-Texte
│   │
│   ├── locales/                   [NEU]
│   │   ├── de.json
│   │   └── en.json
│   │
│   ├── lib/
│   │   ├── seo.ts                 # <Seo/> Komponente + JSON-LD Builder
│   │   ├── i18n.tsx               # minimaler Provider + t()
│   │   ├── analytics.ts           # Plausible/Umami (cookie-less)
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── use-scroll-progress.ts # rAF-throttled, ersetzt 9× duplizierten Code
│   │   └── use-mobile.ts
│   │
│   ├── components/
│   │   ├── layout/   TopBar, Footer, CookieBanner
│   │   ├── booking/  BookingWidget, DateRangePicker, GuestSelector,
│   │   │            RoomSelector, PriceSummary, BookingForm
│   │   └── ui/       (shadcn)
│   │
│   ├── sections/    Hero, Location, Rooms, Experience, Details,
│   │                Dining, Testimonial, Journal, Contact (→ schlanker)
│   │
│   ├── pages/                     [NEU – React Router]
│   │   ├── Home.tsx
│   │   ├── RoomDetail.tsx
│   │   ├── Booking.tsx            # /buchen – dedizierter Flow
│   │   ├── ThankYou.tsx
│   │   ├── Impressum.tsx
│   │   ├── Datenschutz.tsx
│   │   └── AGB.tsx
│   │
│   └── App.tsx, main.tsx, index.css
│
├── tests/                         [NEU]
│   └── e2e/booking.spec.ts        # Playwright
├── .env.example                   [NEU]
└── vite.config.ts                 # `base: '/'`, inspect-Plugin nur in dev
```

---

## 3. SEO-Plan

### 3.1 `index.html` – Pflicht-Tags
```html
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>TINAH – Boutique-Retreat an der Küste | This Is Not A Hotel</title>
  <meta name="description"
    content="TINAH – ein kleines Rückzugs-Retreat an der Küste. Minimalistisch,
    ruhig, persönlich. Jetzt Aufenthalt anfragen."/>
  <link rel="canonical" href="https://www.tinah.example/" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="de_DE" />
  <meta property="og:title" content="TINAH – Boutique-Retreat an der Küste" />
  <meta property="og:description" content="…" />
  <meta property="og:image" content="https://www.tinah.example/og/og-default.jpg" />
  <meta property="og:url" content="https://www.tinah.example/" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />

  <!-- hreflang -->
  <link rel="alternate" hreflang="de" href="https://www.tinah.example/" />
  <link rel="alternate" hreflang="en" href="https://www.tinah.example/en/" />
  <link rel="alternate" hreflang="x-default" href="https://www.tinah.example/" />

  <!-- Perf -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
  <link rel="preload" as="image" href="/images/hero-pool.jpg" fetchpriority="high" />

  <!-- Favicons (Set) -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
</head>
```

### 3.2 JSON-LD (Hotel-Schema) – in `src/lib/seo.ts`
Generiert und injiziert als `<script type="application/ld+json">`:
```json
{
  "@context":"https://schema.org",
  "@type":"Hotel",
  "name":"TINAH – This Is Not A Hotel",
  "image":["https://.../images/hero-pool.jpg", "..."],
  "@id":"https://www.tinah.example/#hotel",
  "url":"https://www.tinah.example/",
  "telephone":"+49 …",
  "priceRange":"€€€",
  "address":{"@type":"PostalAddress","streetAddress":"Coast Road 12",
             "addressLocality":"…","postalCode":"…","addressCountry":"DE"},
  "geo":{"@type":"GeoCoordinates","latitude":…,"longitude":…},
  "starRating":{"@type":"Rating","ratingValue":"4"},
  "amenityFeature":[{"@type":"LocationFeatureSpecification","name":"Pool","value":true}, …],
  "checkinTime":"15:00","checkoutTime":"11:00"
}
```
Zusätzlich pro Zimmer: `@type: HotelRoom`, pro FAQ: `@type: FAQPage`.

### 3.3 `robots.txt` + `sitemap.xml`
- `robots.txt`: Sitemap-Referenz, `Disallow: /api/`, `Disallow: /thank-you`
- `sitemap.xml`: von `vite-plugin-sitemap` oder Script aus Content-Files generiert

### 3.4 Weitere SEO-Punkte
- Pro Seite: `<h1>` genau einmal, hierarchische `<h2>/<h3>`
- Alle Bilder: aussagekräftige `alt`-Texte + `width`/`height` Attribute
- CWV-Budget: LCP < 2.5 s, CLS < 0.1, INP < 200 ms → konkret: Hero-Image preload, Fonts `display=swap`, Scroll-Handler auf `requestAnimationFrame` throttlen
- Core-Keywords pro Seite (Beispiel DE): "boutique hotel [region]", "stilvoll übernachten [region]", "ruhiges retreat küste"

---

## 4. Buchungs-Flow (Booking)

### 4.1 UX-Flow (4 Steps im Widget, persistent in URL-Query)

```
Step 1: Termine       ?checkin=2026-05-01&checkout=2026-05-04
Step 2: Gäste + Zimmer ?adults=2&children=0&room=ocean-suite
Step 3: Kontaktdaten + Wünsche
Step 4: Prüfen + Absenden  →  POST /api/booking-request
        → /danke?ref=TINAH-2026-000123
```

### 4.2 Datenmodell (`src/content/rooms.ts`)
```ts
export interface Room {
  slug: string;              // "ocean-suite"
  name: { de: string; en: string };
  shortDescription: { de: string; en: string };
  longDescription: { de: string; en: string };
  images: { src: string; alt: { de: string; en: string } }[];
  sizeSqm: number;
  maxGuests: number;
  bedConfig: string;
  basePricePerNight: number; // EUR, inkl. MwSt.
  amenities: string[];       // ["wifi","pool","breakfast"]
}
```

### 4.3 Request-Schema (`api/lib/schema.ts`)
```ts
export const BookingRequestSchema = z.object({
  checkin:  z.string().date(),
  checkout: z.string().date(),
  adults:   z.number().int().min(1).max(6),
  children: z.number().int().min(0).max(4),
  roomSlug: z.string().min(1),
  guest: z.object({
    firstName: z.string().min(2).max(60),
    lastName:  z.string().min(2).max(60),
    email:     z.string().email(),
    phone:     z.string().min(6).max(32).optional(),
    country:   z.string().length(2).optional(),
  }),
  notes:    z.string().max(2000).optional(),
  consent:  z.literal(true),   // DSGVO-Zustimmung Pflicht
  honeypot: z.string().max(0), // Anti-Spam
  locale:   z.enum(["de","en"]).default("de"),
}).refine(d => new Date(d.checkout) > new Date(d.checkin),
  { message: "checkout must be after checkin", path:["checkout"] });
```

### 4.4 API-Endpoint `api/booking-request.ts`
1. `POST` only, JSON
2. Rate-Limit (IP, 5/min) via Upstash oder Cloudflare
3. `schema.safeParse` → 400 bei Fehler
4. Referenznummer generieren: `TINAH-YYYY-XXXXXX`
5. Persistieren (Airtable/Supabase/Notion API)
6. Zwei E-Mails (siehe §5)
7. `200 { reference, message }`

**Wichtig:** Keine echte Online-Zahlung im ersten Wurf – nur **Anfrage-basiert**.
Zahlung/Stripe-Integration ist ein optionaler zweiter Schritt.

### 4.5 Frontend-Komponenten (neu)
- `components/booking/BookingWidget.tsx` – Sticky-Bar + Modal
- `components/booking/DateRangePicker.tsx` (react-day-picker, DE-Locale)
- `components/booking/GuestSelector.tsx` (Erwachsene/Kinder Stepper)
- `components/booking/RoomSelector.tsx` (Liste, Verfügbarkeit „auf Anfrage")
- `components/booking/PriceSummary.tsx` (Nächte × Preis, MwSt-Hinweis)
- `components/booking/BookingForm.tsx` (react-hook-form + zodResolver)
- `pages/ThankYou.tsx` mit Referenznummer + „Check your inbox"

---

## 5. E-Mail-Konzept

### 5.1 Provider-Empfehlung
**Resend** (DX top, React-Email-kompatibel) – Alternativen: Postmark, SendGrid.
ENV: `RESEND_API_KEY`, `MAIL_FROM="TINAH <no-reply@tinah.example>"`,
`MAIL_TO_HOTEL="stay@tinah.example"`.

### 5.2 Gast-Bestätigung (HTML, Brand-konform)
- Betreff (DE): `„Wir haben deine Anfrage erhalten – TINAH-2026-000123"`
- Body-Gerüst:
  - Logo-Header (dunkler Ton, `#0B0B0C`, Akzent `#D4FF90`)
  - Anrede `Hallo {firstName}`
  - Kurz: „Wir melden uns innerhalb von 24 h mit Verfügbarkeit."
  - Zusammenfassung: Zimmer, An-/Abreise, Gäste, Referenz
  - Kontakt-Block (Tel/Mail/Adresse)
  - Footer: Impressum-/Datenschutz-Link, Abmelde-Hinweis (nicht-marketing → optional)
- Plain-Text-Fallback immer mitschicken
- Alt-Texte + max. 600 px breit, Inline-CSS

### 5.3 Hotel-Benachrichtigung
- Betreff: `„[Neue Anfrage] TINAH-2026-000123 – {lastName} – {checkin} → {checkout}"`
- Klartext-Priorität, Reply-To = Gast-E-Mail
- Alle Felder strukturiert; Schnell-Antwort-Link

### 5.4 Technik
- `@react-email/components` für Templates, gerendert zu HTML
- SPF, DKIM, DMARC setzen (Domain-Setup Checkliste siehe §9)
- Opt-in bei „Newsletter" Checkbox separat (kein Double-Dipping)

---

## 6. Branding-Konsistenz

### 6.1 Zentrale Brand-Tokens (`src/content/brand.ts`)
```ts
export const brand = {
  name: "TINAH",
  longName: "This Is Not A Hotel",
  claim: { de: "Ein Rückzug, kein Hotel.", en: "A retreat, not a hotel." },
  colors: {
    bg: "#0B0B0C",
    bgLight: "#F3F0EA",
    accent: "#D4FF90",
    textPrimary: "#F6F6F6",
    textSecondary: "#B7B7B7",
    textDark: "#0B0B0C",
  },
  fonts: {
    heading: "Space Grotesk",
    body:    "Inter",
    mono:    "IBM Plex Mono",
  },
  voice: {
    do:    ["ruhig","präzise","warm","minimal","sinnlich"],
    dont:  ["schreierisch","werblich","übertrieben luxuriös"],
  },
} as const;
```

### 6.2 Aufräum-Arbeiten
- `README.md` und `info.md` ersetzen (aktuell Wine-Estate-Copy, irreführend)
- `config.ts`-Müll (wineShowcase, museumConfig, newsConfig) entfernen – nicht benutzt
- Alle hardcoded Strings in Sections durch `t('…')`- oder `content/…`-Lookups ersetzen
- Einheitliche Bildsprache + Namensschema (`/images/hero-pool.jpg` → `/images/hero/pool.jpg`)
- Tailwind-Theme (`tailwind.config.js`) liest Farben aus `brand.ts` (single source)

### 6.3 Design-System-Regeln (Kurzfassung)
- Primärer H1 immer Space Grotesk, `tracking-[-0.02em]`, `leading-[0.95]`
- CTAs bevorzugt die Circle-CTA oder Pill-Variante; kein gemischter Stil
- Micro-Label immer `font-mono text-[11px] uppercase tracking-[0.14em]`
- Keine Emojis, kein Gold/Wine-Rot (Altlast aus Template)

---

## 7. Accessibility (WCAG 2.1 AA)

1. `<html lang="de">` setzen (aus `site.ts`)
2. Form-Felder: `<label htmlFor="…">` + passende `id`, `aria-invalid`, `aria-describedby` für Fehler
3. `alert()` → `<div role="status" aria-live="polite">` + Toast
4. Focus-Ring sichtbar halten (Tailwind: `focus-visible:outline`)
5. Farbkontrast prüfen: `#B7B7B7` auf `#0B0B0C` → checken (knapp); ggf. `#D0D0D0`
6. Prefers-reduced-motion respektieren: alle Ken-Burns/Scroll-Anim abschaltbar
7. CircleCTA als `<button>`, keyboard-activatable (Enter/Space)
8. Skip-Link `Zum Inhalt springen`

---

## 8. Performance

- Bilder in WebP/AVIF + `<picture>` mit `srcset`, `sizes`, `width`/`height`
- Hero-Image: `fetchpriority="high"` + `<link rel="preload">`
- Unterhalb-Fold: `loading="lazy" decoding="async"`
- Scroll-Handler: alle 9 Sections nutzen den gleichen Code → in `use-scroll-progress.ts` bündeln, via `requestAnimationFrame` throttlen
- Code-Splitting: `React.lazy` für `/buchen` und Legal-Seiten
- Tree-Shake: shadcn-Components nur importieren was genutzt wird
- Font-Subsetting (latin nur), `font-display: swap`
- `kimi-plugin-inspect-react` nur in dev (`process.env.NODE_ENV`)

---

## 9. Rechtliches & Deployment (EU/DACH)

- **Impressum** (`/impressum`) – TMG/DDG-konform (Betreiber, Adresse, Kontakt, USt-ID)
- **Datenschutzerklärung** (`/datenschutz`) – DSGVO Art. 13, inkl. Formular-Verarbeitung, Resend, Hosting, Analytics
- **AGB** (`/agb`) – optional, aber empfohlen
- **Consent-Banner** nur wenn Tracking-Cookies; Empfehlung: Plausible/Umami (cookie-less) → kein Banner nötig
- **Hosting:** Vercel oder Netlify (Static + Functions) oder Cloudflare Pages + Workers
- **Domain-E-Mail-Setup:** SPF, DKIM, DMARC (p=quarantine) für `tinah.example`
- **Backup:** Anfragen in Airtable/Supabase mit Export-Routine

---

## 10. Priorisierte Roadmap

### Phase 0 – Housekeeping (0.5 Tage)
- [ ] `dist/` aus Repo entfernen + `.gitignore` erweitern
- [ ] `base: '/'` in `vite.config.ts`, Inspect-Plugin nur dev
- [ ] `.env.example` anlegen

### Phase 1 – SEO-Basis (1 Tag) 🔴
- [ ] `index.html`: lang/title/description/OG/Twitter/canonical/hreflang
- [ ] `robots.txt` + `sitemap.xml` + Favicon-Set + `og-default.jpg`
- [ ] `<Seo/>` Komponente + JSON-LD (Hotel + HotelRoom + FAQPage)
- [ ] H1-Struktur pro Section prüfen, `alt`-Texte setzen

### Phase 2 – Content-Modell & Branding (1 Tag) 🟠
- [ ] `src/content/*.ts` anlegen, `brand.ts` als Single-Source
- [ ] `config.ts` Altlasten (Wine/Museum) löschen
- [ ] Sections: hardcoded Strings → Content-Imports
- [ ] `README.md` + `info.md` neu schreiben

### Phase 3 – i18n DE/EN (0.5 Tage) 🟠
- [ ] `src/lib/i18n.tsx` mit `t()` + `Locale`-Context
- [ ] `src/locales/de.json`, `en.json` (gepflegt aus `content/`)
- [ ] Routing `/` = DE, `/en/` = EN; hreflang entsprechend

### Phase 4 – Booking-Flow (2–3 Tage) 🔴
- [ ] Routing einführen (`react-router-dom`)
- [ ] `BookingWidget` + 4 Steps + URL-State
- [ ] `/buchen` als eigene Seite, Sticky-Mini-Widget auf Home
- [ ] `react-hook-form` + `zod` Validation mit inline Fehlern
- [ ] `/danke` Seite + Referenznummer

### Phase 5 – Backend + Mail (1–2 Tage) 🔴
- [ ] Vercel-/Netlify-Function `api/booking-request.ts`
- [ ] Rate-Limit + Honeypot + Schema-Validation
- [ ] Persistierung (Airtable oder Supabase)
- [ ] Resend-Integration, beide Templates (Gast + Hotel)
- [ ] Domain-DNS: SPF/DKIM/DMARC

### Phase 6 – Accessibility & Performance (1 Tag) 🟠
- [ ] `use-scroll-progress` Hook extrahieren + `rAF`-Throttle
- [ ] WebP/AVIF-Konvertierung, `srcset`, Preload-Hero
- [ ] Form-A11y (`aria-live`, Labels, Focus)
- [ ] Lighthouse-Score ≥ 95 in allen 4 Kategorien

### Phase 7 – Legal & Launch (0.5 Tage) 🔴
- [ ] `Impressum.tsx`, `Datenschutz.tsx`, optional `AGB.tsx`
- [ ] Footer-Links + Consent-Logik (falls Tracking)
- [ ] Plausible/Umami einbinden

### Phase 8 – QA (1 Tag)
- [ ] Playwright-E2E: `booking.spec.ts` – Happy Path + Fehlerfälle
- [ ] Manueller Cross-Browser-Check (Safari/iOS, Chrome, Firefox)
- [ ] Lighthouse + axe + Screaming Frog SEO-Audit
- [ ] DSGVO-Checkliste

**Gesamtaufwand:** ca. **8–10 Arbeitstage** bis produktionsreif.

---

## 11. Akzeptanzkriterien

- ✅ Lighthouse (Mobile) Performance / Accessibility / Best Practices / SEO jeweils ≥ 95
- ✅ Testanfrage erzeugt in < 2 s Bestätigungsmail (Gast) und interne Mail (Hotel)
- ✅ `view-source` zeigt vollständige Meta-/OG-/JSON-LD-Tags
- ✅ Google Rich-Results-Test bestätigt Hotel-Schema ohne Warnung
- ✅ Keine hardcoded Brand-Strings mehr – alles aus `src/content/`
- ✅ DE und EN vollständig, hreflang korrekt, Umschalter im Footer
- ✅ Impressum, Datenschutz vorhanden und verlinkt
- ✅ Playwright-E2E „Happy-Path Buchung" grün

---

## 12. Offene Entscheidungen (bitte bestätigen)

1. **Provider-Wahl:** Hosting Vercel vs. Netlify vs. Cloudflare Pages?
2. **E-Mail-Provider:** Resend vs. Postmark vs. SendGrid?
3. **Anfragen-Speicher:** Airtable (schnell, kein Setup) vs. Supabase (skaliert) vs. nur E-Mail?
4. **Sprachen:** nur DE, nur EN oder DE + EN?
5. **Zahlung:** Vorerst nur Anfrage (empfohlen) – oder direkt Stripe-Anzahlung?
6. **Domain:** ist `tinah.example` Platzhalter – welche echte Domain?
7. **Analytics:** Plausible/Umami (cookie-less) oder GA4 (Consent nötig)?

Sobald diese Punkte geklärt sind, lässt sich Phase 0 → 8 ohne weitere Blocker umsetzen.

---

## 13. Iteration 2026-04-20 — Umgesetzte Änderungen

Dieser Abschnitt dokumentiert die Änderungen, die im aktuellen Umbauzyklus
bereits live sind. Komplementär zu `AENDERUNGSBEFEHL.md`.

### 13.1 Neu angelegte Dateien

| Datei | Zweck |
| --- | --- |
| `src/hooks/use-section-progress.ts` | Wiederverwendbarer Scroll-Hook für Pinned-Sections; berechnet `entrance`/`exit` in Viewport-Einheiten statt in „ausgescrollten Pixeln". |
| `src/components/BookingFlow.tsx` | Dreistufiger Buchungs-Flow: Anfrage → Prüfung → Bestätigung. URL-Query `?booking=confirmed` springt in Schritt 3. |
| `public/robots.txt` | Crawl-Regeln + Sitemap-Referenz. |
| `public/sitemap.xml` | URLs inkl. `image:image` und `hreflang`-Alternates. |
| `public/site.webmanifest` | PWA-Basis. |
| `AENDERUNGSBEFEHL.md` | Formaler Änderungsauftrag mit Abnahme-Checkliste. |

### 13.2 Überarbeitete Dateien

| Datei | Wesentliche Änderung |
| --- | --- |
| `index.html` | Title/Description/OG/Twitter/Canonical/hreflang, JSON-LD (`Hotel`, `WebSite`, `BreadcrumbList`), Preconnect + Hero-Preload, `<noscript>`-Fallback. |
| `src/index.css` | `Allerta Stencil` Import, `.font-stencil` Utility, `--accent` → `#FFFFFF`, shadcn-HSL-Mapping neutralisiert. |
| `src/components/TopBar.tsx` | Hide-on-scroll-down / show-on-scroll-up via `requestAnimationFrame` + Delta-Schwelle. Markenwortmarke in `font-stencil`. Grün-Hover entfernt. |
| `src/components/CircleCTA.tsx` | Hover-Ring in Weiß, `pointer-events-none` für korrektes Button-Klick-Verhalten. |
| `src/components/Preloader.tsx` | Dot + Loading-Line + Shadow auf Weiß; `h1` → `p` (einziger `h1` gehört dem Hero). |
| `src/sections/Hero.tsx` | Stencil-Akzent auf „not"-Keyword. |
| `src/sections/Location.tsx` | `useSectionProgress` statt eigener Scroll-Logik. |
| `src/sections/Rooms.tsx` | `useSectionProgress`, Slide-Distanz 50 → 22 vw, Stencil-Akzent auf „stillness". |
| `src/sections/Experience.tsx` | `useSectionProgress`, Slide-Distanz reduziert. |
| `src/sections/Details.tsx` | `useSectionProgress`, Stencil-Akzent auf „difference". |
| `src/sections/Dining.tsx` | `useSectionProgress`, Stencil-Akzent auf „simplified". |
| `src/sections/Testimonial.tsx` | `useSectionProgress`, `<blockquote>` semantisch. |
| `src/sections/Contact.tsx` | Altes Formular → `<BookingFlow/>`, Mail/Tel als `<a>`, `<address>` semantisch, Footer-Links neu, Stencil-Wortmarke im Footer. |

### 13.3 Kernentscheidungen in dieser Iteration

- **Akzentfarbe**: `#D4FF90` wurde komplett durch `#FFFFFF` ersetzt. Wer zukünftig
  wieder mit einer Akzentfarbe arbeiten möchte, muss `--accent` und das
  shadcn-HSL-Mapping in `src/index.css` neu setzen und die Kreis-CTA-Styles
  (`CircleCTA.tsx`) sowie den Preloader anpassen.
- **Scroll-Mathematik**: der neue Hook ist absichtlich in Viewport-Einheiten
  parametrisiert (keine Pixel). Dadurch skaliert das Timing korrekt auf Mobil-
  wie Desktop-Höhen. Feintuning passiert über die vier Optionen
  `entranceStart / entranceEnd / exitStart / exitEnd`.
- **Booking-Flow**: der `handleSubmit` ist bewusst ein Mock mit `setTimeout`.
  Das Anbinden an Resend + Persistenz ist Phase 5 in der Roadmap oben.
- **Allerta Stencil**: Einsatz streng kuratiert — Logo, Footer-Wortmarke,
  Preloader-Wortmarke, plus je **ein** Keyword pro Section. Nicht flächig
  einsetzen — die Schrift ist als visuelles Brand-Signal gedacht, nicht als
  Lesetypografie.
