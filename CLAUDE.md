# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project identity

This is **TINAH — "This Is Not A Hotel"**, a boutique-retreat marketing site near Hiriketiya / Dickwella, Southern Sri Lanka. It is a single-page React app with two lazy-loaded sub-pages.

> **Important — stale docs:** `README.md` and `info.md` still describe the original *Villa Wine Estate* template the project was forked from. They are misleading. The authoritative docs are `ARCHITEKTUR.md` and `AENDERUNGSBEFEHL.md` (both German). Treat the README as historical, not current.

## Common commands

Run from the `app/` directory (the npm project root). Node ≥22.13, npm ≥10.9.

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript project-references build (`tsc -b`) + `vite build` |
| `npm run lint` | ESLint over the repo |
| `npm run preview` / `npm run start` | Serve the built `dist/` (start binds `0.0.0.0:${PORT:-4173}` for Railway) |
| `npm run test:perf` | Performance budget guard (`scripts/perf-guard.mjs`) — runs against `dist/`, so build first |
| `npm run test:ci` | Full gate: lint + build + perf guard. This is what CI runs |

There is **no unit/integration test suite** yet. Playwright E2E is on the roadmap (Phase 8 in `ARCHITEKTUR.md`) but not implemented.

## Stack at a glance

React 19 + TypeScript 5.9, Vite 7, Tailwind 3 with shadcn/ui (Radix primitives), ESLint 9 flat config. Path alias `@/*` → `src/*` is set in both `vite.config.ts` and `tsconfig.app.json` — prefer it over deep relative imports.

## High-level architecture

### Routing — minimal custom router (no react-router)

`src/hooks/use-route.ts` implements a ~80-line History-API router. Routes are a closed union: `'/' | '/pause' | '/location' | '/rooms'`. `App.tsx` switches on the route and lazy-imports the sub-page components from `src/pages/`. **Do not introduce `react-router-dom`** — the file's header comment explicitly justifies the avoidance (~40 kB bloat for a 4-route app).

A custom `tinah:route-change` event syncs all `useRoute` consumers when one component calls `navigate(...)` (browser `popstate` fires only on back/forward, not on `pushState`). Bug fixed 2026-04-26 — keep this event bus when touching the router.

### Page composition

- `/` → home: `Hero → Location → Rooms → Rituals → Details → Testimonial → Contact` (in `App.tsx`). The `Experience` section was removed 2026-04-26; the file is gone — don't re-add it.
- `/location` and `/rooms` are full sub-pages with their own header/back-link. Global `TopBar` is intentionally **not** mounted on sub-pages.
- `/pause` is the booking sub-page (`src/pages/PauseNow/`).

### Scroll choreography

All pinned-section animations use `useSectionProgress` (`src/hooks/use-section-progress.ts`). It returns `entrance` and `exit` values clamped to `[0, 1]`, computed from `rect.top / windowHeight` (viewport units, not pixels — scales correctly across devices). Throttled with `requestAnimationFrame`. Default thresholds are tuned so text arrives before the background image scrolls away. **When adding new pinned sections, use this hook** rather than rolling another scroll listener.

### UI primitives (shadcn/ui)

`src/components/ui/` holds ~40 generated shadcn/ui components (button, dialog, form, sheet, sonner, dropdown-menu, …) wired to Radix and configured by `components.json`. Reuse these rather than rebuilding primitives. Bespoke composite components (TopBar, Preloader, BookingFlow, AmbientSound, CircleCTA) live one level up in `src/components/`.

### Brand & design tokens

- Dark canvas `#0B0B0C`, neutral white accent (`--accent: #FFFFFF`). The previous green `#D4FF90` was removed — don't reintroduce it. `src/index.css` holds the CSS variables and the shadcn HSL mapping.
- `Allerta Stencil` (utility class `.font-stencil`) is a **brand-restricted** font — wordmark in TopBar/Footer/Preloader plus exactly one keyword per section. Do not apply it to running text.
- Body: Inter. Headings: Space Grotesk.

### Booking flow

`src/components/BookingFlow.tsx` and `src/pages/PauseNow/PauseNowBooking.tsx` implement a 3-step state machine: Anfrage → Prüfung → Bestätigt. Step 3 is reachable directly via `?booking=confirmed` (link in the future owner-confirmation email). The `handleSubmit` is currently a `setTimeout` mock — the real backend (Resend + persistence) is Phase 5 in `ARCHITEKTUR.md` and is not built yet.

### Legacy `config.ts`

`src/config.ts` is leftover scaffolding from the wine-estate template (wineShowcaseConfig, museumConfig, …). Most fields are empty strings and **not wired into the current components**. Phase 2 of the roadmap calls for replacing it with `src/content/*.ts`. Until that lands, ignore `config.ts` when wiring new copy — strings live in the section components.

### `subseite_location/`

Sibling project at `app/subseite_location/` contains an older or staging copy of the Location sub-page (HTML previews + duplicated `src/sections/Hero.tsx`). The performance guard (`scripts/perf-guard.mjs:checkHeroPerfHints`) iterates **both** `src/sections/Hero.tsx` and `subseite_location/src/sections/Hero.tsx` and requires `preload="metadata"` on the hero `<video>` in each. Keep the directory in sync if you change hero markup, or update `perf-guard.mjs`.

## Build, performance, and CI

- `vite.config.ts` uses `base: './'` (relative asset paths) so the built bundle works behind Railway's preview server.
- `kimi-plugin-inspect-react` is loaded defensively via `createRequire` and a try/catch. Some npm installs ship without its `dist/` and would otherwise break the build — leave the defensive loader in place.
- Performance budgets enforced by `scripts/perf-guard.mjs` (failing the script fails CI):
  - largest JS chunk ≤ 300 KB
  - total JS ≤ 360 KB
  - total CSS ≤ 120 KB
  - `public/images/hiru.mp4` ≤ 12 MB, `public/images/hiru-poster.jpg` ≤ 500 KB
  - hero `<video>` must declare `preload="metadata"`
- `.github/workflows/ci.yml` runs `npm run test:ci` then a Lighthouse CI pass against `/`, `/location`, `/rooms` (`.lighthouserc.json`) with thresholds: Performance ≥ 0.8, A11y/Best-Practices/SEO ≥ 0.9.

## Deployment (Railway)

- Builder: Nixpacks (`nixpacks.toml`) — installs with `npm ci`, builds with `npm run build`.
- Start: `npm run start` → `vite preview --host 0.0.0.0 --port ${PORT:-4173}` (`railway.json`).
- The repo root for the Railway service is `app/`, not the outer `TINAH_website/` directory.

## SEO surface area

`index.html` is hand-curated with full Open Graph, Twitter, hreflang, geo meta, Hotel/WebSite/BreadcrumbList JSON-LD, hero-image preload, and ambient-audio preload. Treat it as production HTML — when changing brand copy, update the `<title>`, meta description, OG, and JSON-LD blocks together. `public/robots.txt` and `public/sitemap.xml` are real (not placeholders).

## Conventions worth knowing

- All comments and architecture docs in this repo are in German. Match that when editing existing files; new neutral code can be English.
- Don't commit `dist/`. It's git-ignored but historically slipped in.
- Two roadmap phases (`ARCHITEKTUR.md` §13) are partially landed; before adding a feature, search the doc to see whether it's already planned/scoped.
