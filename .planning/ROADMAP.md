# Roadmap: Michelle Ngo Portfolio

## Overview

A SvelteKit portfolio for filmmaker Michelle Ngo, built greenfield from an empty repo. The journey: scaffold the framework and deploy pipeline, lock the video data layer, build the killer click-to-filter grid + watch experience, drop a reel-led home page on top, give PBS American Portrait its own dedicated landing, surface press/about/contact, then polish and ship to production. Every phase delivers a vertical slice a hiring producer could observe.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - SvelteKit + TS + Tailwind scaffold deployed to Cloudflare Pages on push to main
- [x] **Phase 2: Data Layer** - `videos.json` source-of-truth with type-safe build-time validation against the locked taxonomy (completed 2026-05-10)
- [ ] **Phase 3: Grid, Filter & Watch** - YouTube-style grid with click-to-filter, deep-linkable URLs, and `/watch/[id]` with same-category rail
- [ ] **Phase 4: Reel-Led Home** - Full-bleed hero with name, tagline, and PLAY REEL CTA over the featured grid
- [ ] **Phase 5: PBS American Portrait** - Dedicated landing page surfacing the 18 PBS videos with project context
- [ ] **Phase 6: Press, About & Contact** - First-class `/press` credits page, `/about` bio surface, footer-mirrored contact
- [ ] **Phase 7: Polish & Production Cutover** - Responsive QA, blur-up tuning, perf budget under 2s on 4G, production launch

## Phase Details

### Phase 1: Foundation
**Goal**: A producer can visit a public staging URL and see a deployed SvelteKit app that builds cleanly and redeploys on every push.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02
**Success Criteria** (what must be TRUE):
  1. Running `pnpm build` produces a clean static build with TypeScript strict mode and no runtime errors
  2. Tailwind utility classes render correctly in a smoke-test route (e.g., `/`)
  3. Pushing to `main` triggers a Cloudflare Pages deploy and the site is reachable at a public `*.pages.dev` URL
  4. The staging URL serves the smoke-test route over HTTPS within seconds of build completion
**Plans**: 2 plans

Plans:
- [x] 01-01-scaffold-PLAN.md — Scaffold SvelteKit 2 + Svelte 5 + TypeScript (strict + noUncheckedIndexedAccess + noImplicitOverride) + Tailwind v4 (Vite plugin) + ESLint flat config + Prettier + husky/lint-staged pre-commit hook + branded splash placeholder at `/` (Wave 1, addresses FOUND-01)
- [x] 01-02-cloudflare-pages-PLAN.md — Configure Cloudflare Pages deploy from `main` with `@sveltejs/adapter-static`, set `NODE_VERSION=22` + `PNPM_VERSION` env vars, verify end-to-end auto-deploy on the `*.pages.dev` URL (Wave 2, depends on 01-01, addresses FOUND-02)

### Phase 2: Data Layer
**Goal**: Every video record on the site is loaded from a single repo-checked `videos.json` validated against a TypeScript schema, with categories drawn from the locked taxonomy.
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. `videos.json` lives in the repo and contains all 56 videos with source, id, title, uploader, thumbnail URL, embed URL, category, duration, published date, and description
  2. A TypeScript schema validates `videos.json` at build time; intentionally breaking a record (e.g., unknown category, missing field) fails the build
  3. Categories accepted by the schema are the closed canonical list from `_prep/04-categories.md` — free-text categories are rejected
  4. A typed loader exposes the validated video array to all routes with no runtime fetch
**Plans**: 4 plans

Plans:
- [x] 02-00-vitest-wave0-PLAN.md — Install Vitest 4.1.5 + scaffold 4 test stub files (RED) + scripts/test-build-fails.mjs (Wave 0, no requirement IDs)
- [x] 02-01-types-schema-PLAN.md — Install zod@4.4.3, create src/lib/data/categories.ts (CATEGORIES + slug helpers) + src/lib/data/schema.ts (Zod 4 discriminated union) (Wave 1, addresses DATA-02, DATA-03, DATA-04)
- [x] 02-02-author-videos-json-PLAN.md — Author src/lib/data/videos.json from _prep seed + add to .prettierignore (Wave 2, depends on 02-01, addresses DATA-01, DATA-02)
- [x] 02-03-loader-and-vite-plugin-PLAN.md — Wire src/lib/data/videos.ts loader + src/lib/data/index.ts ($lib/data surface) + validateVideosPlugin in vite.config.ts (Wave 3, depends on 02-01 + 02-02, addresses DATA-01, DATA-03, DATA-04)

### Phase 3: Grid, Filter & Watch
**Goal**: A producer can browse videos in a YouTube-style grid, click any card to play it, and immediately see "more in this category" — the killer feature, end to end.
**Depends on**: Phase 2
**Requirements**: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, FILT-01, FILT-02, FILT-03, FILT-04, NAV-01
**Success Criteria** (what must be TRUE):
  1. `/work` displays all 56 videos as cards with thumbnail, title, category tag, and uploader/client; layout is 2-col on mobile, 3-col on tablet, 4-col on desktop
  2. Thumbnails render with a low-res placeholder that blurs up to full resolution as they load
  3. Clicking any card navigates to `/watch/[id]`, plays the video via its embed URL, and renders a "More in [Category]" rail of other videos sharing that category
  4. `/work/[category]` (or `/work?category=[slug]`) renders only that category's videos and the URL alone reproduces that filtered view on reload or paste
  5. Top text-link nav lists primary categories plus secondary links for About / Press / Contact, and category links route to their filtered views
**Plans**: 5 plans

Plans:
- [x] 03-00-test-infrastructure-PLAN.md — Install jsdom, split Vitest into node + jsdom workspace, scaffold 6 RED-by-design test stubs + scripts/test-prerender-coverage.mjs (Wave 0, no requirement IDs)
- [x] 03-01-video-card-and-category-tag-PLAN.md — Build VideoCard.svelte (single-link card, aspect-video, blur-up fade-in, h3 line-clamp-2 title, uploader) + CategoryTag.svelte (span/a) + categoryAccent helper + 8 OKLCH accent colors in app.css @theme (Wave 1, depends on 03-00, addresses GRID-01, GRID-03, GRID-04, GRID-05)
- [x] 03-02-work-routes-PLAN.md — Build /work (unfiltered grid of all 56, D-25 sort, max-w-7xl + 2/3/4 responsive) and /work/[category] (entries enumerates 8 slugs, slug→Category narrowing + 404, accent-colored heading Category-count) (Wave 2, depends on 03-00 + 03-01, addresses GRID-01, GRID-02, GRID-04, GRID-05, FILT-03, FILT-04)
- [x] 03-03-watch-route-PLAN.md — Build /watch/[id] (entries enumerates 56 ids, iframe embed in aspect-video max-w-5xl, D-35 metadata order, FILT-02 same-category rail with D-36/37/38 semantics) + src/routes/+error.svelte minimal 404 (Wave 2 parallel with 03-02, depends on 03-00 + 03-01, addresses FILT-01, FILT-02, FILT-04, GRID-01, GRID-04, GRID-05)
- [x] 03-04-top-nav-and-placeholder-routes-PLAN.md — Build TopNav.svelte (wordmark + 8 category links + About/Press/Contact + hamburger, sticky, D-41 active state via app/state) + MobileMenu.svelte (full-screen bg-black/95 overlay) + wire into src/routes/+layout.svelte + minimal /about /press /contact placeholders (Wave 3, depends on 03-00 + 03-01 + 03-02 + 03-03, addresses NAV-01)

### Phase 4: Reel-Led Home
**Goal**: A producer landing on `/` sees a full-bleed reel hero with Michelle's name, a tone-setting tagline, and a PLAY REEL CTA — and a featured video grid sits below the fold.
**Depends on**: Phase 3
**Requirements**: HERO-01, HERO-02, HERO-03
**Success Criteria** (what must be TRUE):
  1. `/` renders a full-bleed hero (looping reel video or hero image with reel CTA) above the fold on desktop and mobile
  2. Michelle's name and a tone-setting tagline render legibly over the hero on every breakpoint
  3. Clicking PLAY REEL navigates to her producer's reel inside the watch view and plays it
  4. A featured video grid renders below the hero using the Phase 3 card component
**Plans**: 5 plans

Plans:
- [x] 04-01-test-infrastructure-PLAN.md — Add IntersectionObserver jsdom stub (vitest-setup-ui.ts) + wire into vite.config.ts ui project setupFiles; create RED-by-skip test stubs for HeroPoster.test.ts (5 suites: LCP attrs / preload link / name and tagline / PLAY REEL href / PLAY REEL prefetch + sentinel) and page.test.ts (3 suites: renders hero / 8 featured cards / View All Work link); extend videos.test.ts with featured-slice suite (D-23/24/26) and TopNav.test.ts with scroll-aware suites (D-13/14) (Wave 0, no requirement IDs)
- [x] 04-02-hero-poster-component-PLAN.md — User-gated frame pick from Vimeo 264677021 + create src/lib/assets/hero-poster.{jpg|webp} + build src/lib/components/HeroPoster.svelte (verbatim 04-RESEARCH Pattern 1: img + gradient + h1 + tagline + ▷ PLAY REEL CTA + scroll cue + #hero-sentinel) with <link rel="preload"> in <svelte:head>; flip HeroPoster.test.ts to GREEN (Wave 1, depends on 04-01, addresses HERO-01, HERO-02, HERO-03)
- [x] 04-03-featured-slice-flips-PLAN.md — User-gated review of the curated 8-video table (D-23 quota: 2 PBS / 2 Promos / 2 Branded / 1 Doc / 1 Reel; Pitfall 8 reel-inclusion lock) + flip `"featured": true` on the 8 approved rows of src/lib/data/videos.json; flip videos.test.ts featured suite to GREEN (Wave 1, depends on 04-01, addresses D-23/D-24/D-26 — feeds HERO-01 featured grid)
- [x] 04-04-topnav-scroll-aware-PLAN.md — Extend src/lib/components/TopNav.svelte with $effect + IntersectionObserver on #hero-sentinel (transparent over hero on `/`, solid on every other route) + $derived navClass with two literal class strings (Pitfall 4); flip TopNav.test.ts scroll-aware + non-home suites to GREEN (Wave 1, depends on 04-01 + 04-02 sentinel contract, addresses D-13/D-14 — feeds HERO-01 hero presentation)
- [x] 04-05-home-page-composition-PLAN.md — Create src/routes/+page.ts (featured filter + published desc sort, mirrors /work/+page.ts) + REPLACE src/routes/+page.svelte entirely (D-15 retire Phase 1 splash): <HeroPoster /> + featured grid (8 cards eager={true}, verbatim /work markup) + "View All Work →" overflow link (D-28); flip page.test.ts to GREEN; verify pnpm test:prerender (Wave 2, depends on 04-02 + 04-03 + 04-04, addresses HERO-01, HERO-02, HERO-03)

### Phase 5: PBS American Portrait
**Goal**: A producer can land on a dedicated PBS American Portrait page, read the project context, and browse all 18 PBS videos — while PBS also remains a regular filterable category from `/work`.
**Depends on**: Phases 2, 3
**Requirements**: PBS-01, PBS-02, PBS-03
**Success Criteria** (what must be TRUE):
  1. Navigating to a PBS landing route (e.g., `/pbs` or `/work/pbs-american-portrait`) loads a dedicated page that is linked from the home/nav
  2. The PBS page displays all 18 PBS American Portrait videos using the standard card grid
  3. The PBS page surfaces project context describing the PBS American Portrait initiative above the grid
  4. PBS American Portrait remains reachable as a regular filterable category from `/work` and produces the same 18 videos via the standard filter URL
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Wave 0 scaffolding: surface verbatim PBS copy candidates for user pick (D-11 gate) + create RED-by-skip test stubs for the PBS landing route, helper, TopNav extension, and cross-links + extend prerender coverage script (Wave 1, addresses PBS-02)
- [x] 05-02-PLAN.md — Build /pbs-american-portrait/ landing (load + full layout + 15 per-card badges) + retarget TopNav PBS link with D-03 active-state extension + wire D-04 (/work/pbs-american-portrait/) and D-05 (/watch/[id] PBS-only) cross-links; flip all Wave 0 stubs to GREEN (Wave 2, depends on 05-01, addresses PBS-01, PBS-02, PBS-03)

### Phase 6: Press, About & Contact
**Goal**: A producer can find Michelle's broadcast credits, bio, and contact channels through dedicated pages and a footer-mirrored nav — every page reinforces commercial credibility.
**Depends on**: Phase 1 (routing) — independent of Phases 3-5
**Requirements**: PRES-01, PRES-02, ABT-01, ABT-02, CONT-01, CONT-02, NAV-02
**Success Criteria** (what must be TRUE):
  1. `/press` is reachable from the top nav and surfaces broadcast credits (HBO Max, PBS, Hulu, Amazon, U2 Sphere, Music Box, etc.) with network/publication names
  2. `/about` is reachable from the top nav and shows headshot, bio, IMDb link, LinkedIn link, and contact info
  3. The footer surfaces email (`mailto:`), phone, IMDb, LinkedIn, and Vimeo on every page
  4. The footer mirrors the top nav (categories + secondary links) for accessibility and discoverability
  5. The contact information on `/about` matches the footer (single source of truth)
**Plans**: 3 plans

Plans:
- [x] 06-01-press-page-PLAN.md — Build /press credits page + route-local press helper + tests + prerender threshold update (Wave 1, addresses PRES-01, PRES-02)
- [x] 06-02-about-contact-pages-PLAN.md — Build /about (bio approval gate) + /contact pages + shared <ContactBlock /> component + tests + prerender threshold updates (Wave 1, addresses ABT-01, ABT-02, CONT-01, CONT-02)
- [x] 06-03-footer-layout-PLAN.md — Build site-wide <Footer /> component + wire into +layout.svelte + tests (Wave 2, depends on 06-02, addresses CONT-01, NAV-02)

### Phase 7: Polish & Production Cutover
**Goal**: A producer on a 4G connection lands on the production site and sees the hero in under 2 seconds — every interaction feels fast, every breakpoint looks intentional, and the site is live on its production URL.
**Depends on**: Phases 1-6
**Requirements**: FOUND-03
**Success Criteria** (what must be TRUE):
  1. Production build first paint completes in under 2s on a simulated 4G connection (Lighthouse mobile or WebPageTest)
  2. No layout shift on thumbnail load — blur-up placeholders hold their final dimensions
  3. Every route renders correctly on mobile (≤640px), tablet (~768px), and desktop (≥1280px) without horizontal scroll or broken type
  4. Production deploy is reachable on its final hosting URL with HTTPS, and the staging branch continues to deploy independently
**Plans**: 5 plans

Plans:
- [ ] 07-01-imdb-linkedin-swap-PLAN.md — Pre-cutover blocker: swap channel-homepage IMDb + LinkedIn URLs in `src/lib/components/ContactBlock.svelte` for Michelle's personalized profile URLs; closes 06-HUMAN-UAT Test 1 + STATE.md Blockers/Concerns entry (Wave 1, addresses FOUND-03 — D-05 pre-cutover blocker row)
- [ ] 07-02-production-metadata-PLAN.md — Sitewide favicon set (D-11) + OG/Twitter card meta (D-12) + per-page <title> + <meta description> (D-13/D-14) + Person JSON-LD on /about + VideoObject JSON-LD on every /watch/[id] (D-15) + src/routes/sitemap.xml/+server.ts endpoint (D-17) + extended scripts/test-prerender-coverage.mjs assertions (Wave 2, depends on 07-01, addresses FOUND-03)
- [ ] 07-03-responsive-qa-matrix-PLAN.md — D-18 21-cell QA matrix (7 routes × 3 breakpoints) walked in Chrome DevTools + iOS Safari spot-check (D-19); produces .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md with numbered punch list (D-20); every item resolved (fix or accept) before cutover (Wave 3, depends on 07-02, addresses FOUND-03 — D-05 fix-list-resolved row)
- [ ] 07-04-perf-gate-PLAN.md — Lighthouse-CI mobile audit with Slow-4G throttle against /, /work, /watch/[reel], /pbs landing; commit 07-LIGHTHOUSE.json (D-07); IF / LCP ≥ 2.0s apply D-08 hero escalation in order (a) AVIF via <picture>, (b) mobile portrait crop, (c) drop featured-grid eager (Wave 3, depends on 07-02, addresses FOUND-03 — D-05 LCP-gate row)
- [ ] 07-05-production-cutover-PLAN.md — Create static/CNAME (D-01) + .github/workflows/deploy-production.yml with BASE_PATH='' (D-02) + GH Pages custom-domain config via UI (Task 3 human) + curl --resolve apex pre-verification (D-03) + ATOMIC noindex-removal + robots.txt open-policy commit (D-16) + production workflow trigger + final apex re-verification + user-driven DNS swap at registrar (Wave 4, depends on 07-01 + 07-02 + 07-03 + 07-04, addresses FOUND-03 — closes all D-05 rows + DNS launch event)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planned | - |
| 2. Data Layer | 4/4 | Complete   | 2026-05-10 |
| 3. Grid, Filter & Watch | 0/5 | Planned | - |
| 4. Reel-Led Home | 0/5 | Planned | - |
| 5. PBS American Portrait | 0/2 | Planned | - |
| 6. Press, About & Contact | 0/3 | Not started | - |
| 7. Polish & Production Cutover | 0/5 | Planned | - |

---
*Roadmap created: 2026-05-10*
*Phase 1 plans created: 2026-05-10*
*Coverage: 30/30 v1 requirements mapped — no orphans, no duplicates*
*Phase 3 plans created: 2026-05-11*
*Phase 4 plans created: 2026-05-11*
*Phase 5 plans created: 2026-05-11*
*Phase 7 plans created: 2026-05-13*
