# Refactor-Clean Report — TINAH Website

**Datum:** 2026-04-30
**Branch:** `main`
**Scope:** Code-Basis-Analyse, Funktionalitäts-Check, Cleanup redundanter Dateien, Konsistenz-Re-Check, Diagnose Railway-Deployment.

---

## 1. Executive Summary

| Metrik | Vorher | Nachher | Δ |
|---|---:|---:|---:|
| `public/` (Asset-Größe) | 278 MB | 23 MB | **−255 MB / −92 %** |
| Größtes JS-Bundle | 260.3 KB | 254.2 KB | −6.1 KB |
| Gesamt-JS | 306.7 KB | 299.5 KB | −7.2 KB |
| Gesamt-CSS | 100.7 KB | 97.5 KB | −3.2 KB |
| Build-Zeit (warm) | ~5 s | 4.6 s | unverändert |
| `npm run test:ci` | grün | **grün** | OK |
| Gelöschte Dateien (tracked) | — | 15 | — |

**Status:** ✅ Lint, TypeScript, Vite-Build und Performance-Guard sind nach dem Cleanup grün. Zwei Commits liegen lokal auf `main`:
1. **`e19cb8b8`** — Cleanup (15 Deletions, Build-Config, CLAUDE.md). Reversibel via `git revert e19cb8b8`.
2. **`c857a7c2`** — Folge-Fix: kaputte SEO-Bildpfade in `index.html` + `sitemap.xml` repariert, redundantes `npm-10_x` aus `nixpacks.toml` entfernt.

**Push nach `origin/main` steht noch aus.**

---

## 2. Diagnose Railway-Deployment-Failure

### 2.1 Wahrscheinlichste Ursache

Die **Asset-Größe in `public/` von 278 MB** war mit hoher Wahrscheinlichkeit der Killer:

* Railway/Nixpacks kopiert `public/` 1:1 in das Build-Image und ein zweites Mal nach `dist/` (Vite-Build).
* Lokal lag `dist/` bei **285 MB** — entspricht Container-Image-Layern, die bei jedem Deploy neu hochgeladen / gepullt werden.
* 7 Hero-Videos in 7 Auflösungen (76 MB + 44 MB + 40 MB + 32 MB + 24 MB + 12 MB + 11 MB) — referenziert wird **nur eines** (`hiru.mp4`, 11 MB).
* Original-Quelldatei (`Hiru.mov`, 40 MB) wurde mit ausgeliefert, obwohl bereits transcoded vorliegt.

**Nach dem Cleanup**: `public/` = 23 MB. Das ist eine 12×-Reduktion und sollte das Push/Push-Limit-Problem von Railway entschärfen.

### 2.2 Sekundäre Auffälligkeiten in Deployment-Configs

`nixpacks.toml` und `railway.json` sind beide in `e19cb8b8` committet. Die Diff zeigt:

* `nixpacks.toml` neu mit `[phases.install]` + `[phases.build]`:
  ```toml
  [phases.setup]
  nixPkgs = ["nodejs_22", "npm-10_x"]
  ```
  → `npm-10_x` ist redundant (npm wird mit `nodejs_22` mitgeliefert). Sollte Nixpacks auf einer älteren Version auf Railway laufen, kann der Token den Setup-Phase brechen. **Nicht zwingender Fix, aber sauberer wäre:** `nixPkgs = ["nodejs_22"]`.
* `railway.json` reduziert auf `startCommand: "npm run start"` — sauber, dies ist Single-Source-of-Truth für das Start-Kommando.
* `vite preview --host 0.0.0.0 --port ${PORT:-4173}` ist Railway-kompatibel.

### 2.3 Empfehlung

1. **Asset-Cleanup committen und neuen Deploy triggern** (siehe §6).
2. Falls weiterhin Fehler: Railway-Logs prüfen — die häufigsten Folgeursachen sind:
   * `npm ci` zu langsam (Nixpacks-Cache leer) → tritt einmalig auf, läuft ab dann gecached.
   * Health-Check-Timeout: `vite preview` braucht ~1–2 s zum Booten — falls Railway den Health-Check zu früh feuert, könnte ein `[deploy] healthcheckTimeout` in `railway.json` helfen.

---

## 3. Cleanup-Aktionen

### 3.1 Tot-Code (3 Code-Dateien, ~70 Zeilen)

| Datei | Begründung |
|---|---|
| `src/sections/Journal.tsx` | Tombstone (`export {}` + Kommentar) — Section bereits aus `App.tsx` entfernt |
| `src/App.css` | Vite-Scaffold-Reste (`.logo`, `#root`, React-Logo-Spin) — nirgends importiert |
| `src/components/ScrollToTop.tsx` | Wine-Estate-Template-Artefakt; einziger Konsument war der ebenfalls tote `scrollToTopConfig` aus `src/config.ts` |

### 3.2 Ungenutzte Media-Assets (12 Dateien, ~254 MB)

Alle Pfade per `Grep` über `src/`, `index.html`, `public/sitemap.xml` und `subseite_location/` validiert — keine Code-Referenz vorhanden.

| Datei | Größe | Kategorie |
|---|---:|---|
| `public/images/hero-motion-720.mp4` | 76 MB | Hero-Variante (nicht referenziert) |
| `public/images/Video_cliff.mov` | 44 MB | Original-Source eines Hero-Schnitts |
| `public/images/Hiru.mov` | 40 MB | Original-Quelldatei zu `hiru.mp4` |
| `public/images/hero-motion-mobile.mp4` | 32 MB | Mobile-Hero-Variante |
| `public/images/hero-video.mp4` | 24 MB | Frühere Hero-Variante |
| `public/images/hero-cliff.mp4` | 12 MB | Frühere Hero-Variante |
| `public/sounds/mixkit-small-waves-harbor-rocks-1208.wav` | 19.6 MB | Vorgänger von `meditation.mp3`, nur in Kommentar erwähnt |
| `public/images/STRAND-drohne.JPEG` | 2.9 MB | Drohnenshot |
| `public/images/Book-your-pause.jpg` | 1.6 MB | Nur in Doc-Kommentar (`Contact.tsx`) erwähnt |
| `public/images/yoga.JPEG` | 1.5 MB | Yoga-Shot |
| `public/images/DSC07645.jpg` | 1.1 MB | Unbeschriftete Quelldatei |
| `public/images/DSC07697.JPG` | 228 KB | Unbeschriftete Quelldatei |

### 3.3 Bewusst NICHT gelöscht (CAUTION-/DANGER-Tier)

Per CLAUDE.md / Architektur-Vorgabe oder als WIP-Stand erhalten:

| Pfad | Begründung |
|---|---|
| `src/components/BookingFlow.tsx` | WIP — Phase 5 (Resend-Backend) im Roadmap |
| `src/pages/PauseNow/**` | `/pause`-Subseite ist noch nicht im Router gewired (`App.tsx` switcht nur auf `/`, `/location`, `/rooms`) — bleibt aber als Phase-5-Vorbereitung |
| `src/components/ui/**` (~40 shadcn-Files) | Bewusst als Primitiv-Bibliothek behalten (siehe CLAUDE.md) |
| `src/config.ts` (inkl. orphaned `scrollToTopConfig`) | Phase 2 ersetzt es gesamthaft durch `src/content/*.ts` |
| `subseite_location/**` | Vom `scripts/perf-guard.mjs` referenziert (`subseite_location/src/sections/Hero.tsx` muss `preload="metadata"` haben) |
| `public/sounds/ambient.mp3` (913 KB) | Code-Default ist `meditation.mp3`, aber AmbientSound-Prop `src` erlaubt Override; README dokumentiert die Datei |
| `kimi-plugin-inspect-react`, `tw-animate-css`, `autoprefixer`, `postcss` | Defensiv geladen / Tailwind-PostCSS-Pipeline (CLAUDE.md verlangt sie zu lassen) |
| `@hookform/resolvers`, `react-hook-form`, `zod`, `date-fns`, `next-themes`, `recharts`, `embla-carousel-react`, `vaul`, `cmdk`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`, alle `@radix-ui/*` | Werden von `src/components/ui/**` benötigt — bei Behalt der UI-Bibliothek auch Deps behalten |

---

## 4. Funktionalitäts-Check

### 4.1 Routing & Page-Composition (manuell verifiziert)

* `useRoute`-Hook (`src/hooks/use-route.ts`): Closed Union `'/' | '/pause' | '/location' | '/rooms'` — unverändert.
* `App.tsx` switcht aktuell nur drei Pfade: `/location`, `/rooms`, `/` (Default). **`/pause` ist nicht verkabelt** — Auffälligkeit, aber per CLAUDE.md beabsichtigt (Booking-Flow ist WIP).
* Subseiten (`LocationPage`, `RoomsPage`) werden korrekt via `lazy()` geladen — bestätigt durch Build (3 separate JS-Chunks: Main + Location + Rooms).

### 4.2 Asset-Referenz-Konsistenz

Nach Cleanup verbleiben **11 Bilder + 2 Audio-Dateien** in `public/`. Alle Pfade aus dem Code sind erfüllt:

| Code-Pfad | Datei | Vorhanden |
|---|---|:---:|
| `/images/hiru.mp4` | `public/images/hiru.mp4` | ✅ |
| `/images/hiru-poster.jpg` | `public/images/hiru-poster.jpg` | ✅ |
| `/images/bett.JPG` | `public/images/bett.JPG` | ✅ |
| `/images/person-am-strand.JPEG` | `public/images/person-am-strand.JPEG` | ✅ |
| `/images/room3.JPG` … `room7.JPG` | alle vorhanden | ✅ |
| `/images/Window.JPG` | `public/images/Window.JPG` | ✅ |
| `/sounds/meditation.mp3` | `public/sounds/meditation.mp3` | ✅ |

**Bekannte Lücken in `index.html` und `public/sitemap.xml` JSON-LD/OG (nicht durch dieses Cleanup verursacht, aber adressiert):**
* `https://thisisnotahotel.com/images/hero-pool.jpg` → repointed auf `hiru-poster.jpg`
* `https://thisisnotahotel.com/images/room-interior.jpg` → repointed auf `bett.JPG`
* `https://thisisnotahotel.com/images/experience-lounge.jpg` → repointed auf `Window.JPG`

In **Commit `c857a7c2`** auf existierende Assets umgelenkt — Social-Shares und Google-Hotel-Karte zeigen jetzt korrekte Bilder statt 404. Marketing kann später echte „pool", „lounge" und „room-interior"-Hero-Photos liefern und die Pfade nochmal tauschen.

### 4.3 Performance-Budget

Performance-Guard (`scripts/perf-guard.mjs`) bestätigt:

```
✅ Größtes JS-Bundle: index-CTvO1RaQ.js 254.2 KB     (Limit 300 KB)
✅ Gesamt-JS: 299.5 KB                                (Limit 360 KB)
✅ Gesamt-CSS: 97.5 KB                                (Limit 120 KB)
✅ Hero-Video (Desktop): 10.70 MB                     (Limit 12 MB)
✅ Hero-Poster: 0.29 MB                               (Limit 0.49 MB)
✅ src/sections/Hero.tsx: preload="metadata" vorhanden
✅ subseite_location/src/sections/Hero.tsx: preload="metadata" vorhanden
```

---

## 5. Konsistenz Re-Check

### 5.1 Statische Analyse vor Cleanup

| Tool | Befund (gesamt) | Davon echte Dead-Code-Items | Davon false positives |
|---|---:|---:|---:|
| `knip` | 77 unused files, 42 unused deps, 4 unused types | 3 Files | 116 (PauseNow + ui/ + subseite + config) |
| `depcheck` | 3 unused deps, 4 unused devDeps | 0 (alle Build-relevant) | 7 |
| `ts-prune` | Lief sauber durch, fand nur Re-Exports aus `src/components/ui/**` (shadcn-Pattern, beabsichtigt) | 0 | alle |

Der Großteil der knip-Befunde sind beabsichtigt orphaned (WIP, Phase-2-Roadmap, Primitiv-Bibliothek). Für die Zukunft empfohlen: **`knip.json`-Konfiguration** mit Entry-Points (`App.tsx`, `pages/PauseNow/index.tsx`) und ignore-Patterns für `subseite_location/`, `src/components/ui/`, `src/config.ts` — dann produziert das Tool ein verwertbares Signal.

### 5.2 Statische Analyse nach Cleanup

* `git status`: sauber — 15 Löschungen + 2 Config-Modifikationen + 1 neue `CLAUDE.md` sind in **Commit `e19cb8b8`** zusammengefasst, `report.md` bleibt untracked.
* `npm run test:ci`: **grün** (lint + tsc + vite + perf-guard).
* `dist/` rebuilt von leerem Cache: 4.6 s → kein Build-Cache-Problem mehr (das anfängliche `ENOTEMPTY`-Failure war eine Race-Condition durch zwei parallele lokale Builds und kein echter Defekt).

### 5.3 Code-Review (post-commit)

`/code-review` über `e19cb8b8` ausgeführt:

| Kategorie | Befund |
|---|---|
| Security (CRITICAL) | ✅ Sauber — keine Secrets, keine Injection-Surface, keine neuen Deps |
| Code Quality (HIGH) | ✅ Sauber — keine `console.log`, keine TODO/FIXME, keine oversized Functions |
| Best Practices (MEDIUM) | ⚠️ LOW: `nixpacks.toml:2` `"npm-10_x"` ist redundant — **gefixt in `c857a7c2`** |
| Deletion-Safety | ✅ Alle 15 Deletions vorab per Grep verifiziert (Zero-Reference) |

**Verdict:** Approved für Push. Keine CRITICAL/HIGH-Issues, der gemeldete LOW-Befund ist im Folge-Commit `c857a7c2` adressiert.

### 5.4 Verbleibende Code-Smells (nicht im Scope dieses Cleanups)

Wurden bewusst nicht angefasst, aber für Folgearbeit dokumentiert:

* **`scrollToTopConfig` / `ScrollToTopConfig`** in `src/config.ts` — orphaned nach Löschung der Komponente, aber `config.ts` als Block ist Phase-2-Arbeit.
* **`/pause`-Route ist im `useRoute`-Typ deklariert, aber nicht in `App.tsx` verkabelt.** Sobald der Booking-Backend (Phase 5) gebaut wird, muss `App.tsx` einen `if (route === '/pause')`-Branch ergänzen.
* **`subseite_location/`** wird von ESLint mit-gelinted (eslint.config.js ignoriert nur `dist`). Falls dort Lint-Fehler auftreten, könnte CI brechen. Aktueller Lauf ist grün — also kein akutes Problem, aber spröde.
* **`info.md` und `README.md` beschreiben weiterhin das Wine-Estate-Template** (inkl. nicht mehr existierendem ScrollToTop). Per CLAUDE.md ist das bekannt; volles README-Update ist eigene Aufgabe.

---

## 6. Empfehlung für Railway-Re-Deploy

1. **Zwei Commits existieren bereits** auf `main`:
   * `e19cb8b8` — Cleanup-Commit (15 Deletions, Build-Config, CLAUDE.md).
   * `c857a7c2` — SEO-Fixes (OG/JSON-LD-Bildpfade) + `nixpacks.toml`-Aufräumung (`npm-10_x` entfernt).
2. **`git push origin main`** ausführen — Railway triggert auf Push automatisch einen neuen Build. Der erste Push nach dem Cleanup sollte deutlich schneller durchlaufen, da ~256 MB weniger gepusht / gepulled werden.
3. **Railway-Build beobachten:** Falls weiterhin Fehler, an welcher Phase Railway konkret abbricht (Setup / Install / Build / Start) mit lokaler Build-Ausgabe vergleichen.
4. **Folge-Action-Items (nicht im Scope dieses Cleanups):**
   * Marketing kann später echte „hero-pool", „room-interior" und „experience-lounge"-Photos liefern; aktuelle Repoints zeigen valide existierende Assets, das ist also ein Polish-Item, kein Bug.
   * `scrollToTopConfig` in `src/config.ts` ist nach Löschung der Komponente orphaned — wird mit Phase-2-Refactor (`src/content/*.ts`) ohnehin gelöscht.
   * `/pause`-Route ist im `useRoute`-Typ deklariert, aber nicht in `App.tsx` verkabelt (verifiziert: nur `/`, `/location`, `/rooms` werden geroutet). Wired-Up gehört zu Phase 5 (Booking-Backend).

---

## 7. Summary-Box

```
Refactor-Clean — TINAH Website (2026-04-30)
──────────────────────────────────────────────────
Gelöscht:    3 Code-Dateien   (~70 LoC)
             6 Hero-Videos    (~228 MB)
             5 ungenutzte JPGs (~7 MB)
             1 ungenutzte WAV (~20 MB)
──────────────────────────────────────────────────
Gespart:     254 MB im Working-Tree
public/:     278 MB → 23 MB  (-92%)
Bundle-JS:   306.7 KB → 299.5 KB
──────────────────────────────────────────────────
test:ci          ✅ grün
perf-guard       ✅ alle Budgets eingehalten
code-review      ✅ keine CRITICAL/HIGH, LOW-Item gefixt
SEO-Bildpfade    ✅ OG/Twitter/JSON-LD/sitemap repointed
Commits          e19cb8b8 (Cleanup) + c857a7c2 (SEO+Nix-Fix)
Push             ⏳ ausstehend → triggert Railway-Redeploy
──────────────────────────────────────────────────
```
