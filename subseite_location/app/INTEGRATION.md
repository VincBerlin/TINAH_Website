# TINAH — Section Integration Patch (Rooms · Rituals · Details)

Drei React-Sektionen sind im Projekt vorbereitet und müssen 1:1 in
deinen lokalen `app/`-Ordner übernommen werden. Alle folgen dem
Pattern der bestehenden Sektionen (`useSectionProgress`-Hook,
`font-stencil`/`font-mono`/`font-serif-display`/`font-serif-body`-
Klassen, sr-only Headings, ARIA-Labels).

---

## 1) NEU: `app/src/sections/Rooms.tsx`

Datei aus diesem Projekt 1:1 übernehmen:
→ `app/src/sections/Rooms.tsx`

- Dunkler Vollbild-Streifen (`#1A1916`), 100 vh, zwischen `Location`
  und `Experience`.
- Headline links: „Rooms designed for **stillness**." — Stencil +
  DM-Serif-Italic-Akzent.
- CTA-Disc rechts „VIEW ROOMS" → springt zu `#experience`.
- Hintergrund ist aktuell ein Gradient-Platzhalter. Sobald das
  Foto bereitliegt: in `Rooms.tsx` oben einfach
  `const BG_IMAGE = '/images/room-interior.jpg';` setzen.

---

## 2) NEU: `app/src/sections/Rituals.tsx`

Datei aus diesem Projekt 1:1 übernehmen:
→ `app/src/sections/Rituals.tsx`

- Cream-Background `#F2EDE4`, sticky Linksspalte
  („§ IV — The Day, Roughly" + Display-Headline + Intro).
- Rechts 7 Rituale (01–07) mit Nummer · Titel · italic Body ·
  Uhrzeit. Hairlines zwischen den Reihen.
- Linksspalte bleibt beim Runterscrollen oben kleben, bis das
  letzte Ritual passiert ist.

---

## 3) ERSETZEN: `app/src/sections/Details.tsx`

Bestehende Datei vollständig durch diese ersetzen:
→ `app/src/sections/Details.tsx`

- Typografischer Splitscreen statt der zwei Pills.
- Linke Hälfte **PLAY** (Stencil) mit Uhrzeiten in IBM Plex Mono:
  - `06:30 SURF`
  - `08:00 RUN`
  - `11:00 SWIM`
  - `14:00 CO-WORK`
- Rechte Hälfte **PAUSE** (Stencil, gleiche Setzung) mit weichen
  Zeitangaben:
  - `sunrise YOGA`
  - `anytime MEDITATION`
  - `all day ON THE SAND`
  - `always NOTHING AT ALL`
- Vertikale Hairline in der Mitte mit pulsierendem schwarzem
  Mittelpunkt — Klick togglet die aktive Seite (`both → l → r →
  both`). Klick auf eine Hälfte togglet ebenfalls. Inaktive Seite
  fadet auf 28% Opazität.
- Mobile: stapelt vertikal, Hairline wird horizontal.

---

## 4) GEÄNDERT: `app/src/App.tsx`

Datei aus diesem Projekt übernehmen:
→ `app/src/App.tsx`

Reihenfolge der Sektionen:

```tsx
<Hero isReady={!isLoading} />
<Location />
<Rooms />        {/* dark interlude */}
<Experience />
<Rituals />      {/* cream block — sticky intro */}
<Details />      {/* cream block — Play / Pause split */}
<Testimonial />
<Contact />
```

Importe sind bereits korrekt gesetzt.

---

## 5) GEÄNDERT: `app/src/components/TopBar.tsx`

Im RITUALS-Button den `onClick`-Handler von `#experience` auf
`#rituals` umstellen:

```tsx
// VORHER
onClick={() => {
  const el = document.getElementById('experience');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}}

// NACHHER
onClick={() => {
  const el = document.getElementById('rituals');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}}
```

---

## Reihenfolge zum Übernehmen

1. `Rooms.tsx` neu anlegen
2. `Rituals.tsx` neu anlegen
3. `Details.tsx` ersetzen
4. `App.tsx` updaten (oder Importe + JSX-Reihenfolge angleichen)
5. `TopBar.tsx`-Patch anwenden

Danach `npm run dev` — Reihenfolge ist:
Hero → Location → Rooms → Experience → Rituals → Details
→ Testimonial → Contact.
