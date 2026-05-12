# Michelle Ngo Portfolio

## What This Is

A portfolio website for **Michelle Ngo**, filmmaker and multidisciplinary creative. The site replaces the current WordPress.com landing at michellengo.net with a SvelteKit-based experience built around 56 deduped videos pulled from her YouTube playlist + Vimeo account. Primary audience is hiring producers and agencies evaluating her for video production work; the site leads with a reel and surfaces press credits prominently.

## Core Value

A producer can land on the site, watch the reel, click any video, and immediately see "more like this" — every interaction reinforces the depth and breadth of her video work.

## Requirements

### Validated

- [x] **Buildable foundation** — SvelteKit 2 + TS strict + Tailwind v4 scaffold, lint/format/build green (Validated in Phase 1: Foundation)
- [x] **Static deploy target with staging URL on push** — GitHub Pages auto-deploy via `.github/workflows/deploy.yml`, live at https://wolfwdavid.github.io/michelle_ngo_four/ (Validated in Phase 1: Foundation; D-05 Cloudflare Pages overridden — see Key Decisions)
- [x] **Single video data source: `videos.json` checked into the repo, edited via PR** — 56 videos in `src/lib/data/videos.json`, validated by Zod schema at build time via Vite plugin; closed 8-category taxonomy from `_prep/04-categories.md` is the source of truth; typed loader exposes `$lib/data` surface for all routes (Validated in Phase 2: Data Layer — DATA-01..04)
- [x] **YouTube-style video grid with thumbnail, title, category tag, and uploader/client name** — `/work` renders 56 VideoCards with D-16 blur-up state, D-13 non-interactive CategoryTag chip, OKLCH per-category accent (Validated in Phase 3: Grid, Filter & Watch — GRID-01, GRID-03, GRID-05)
- [x] **Click-to-filter mechanic: clicking a card opens a player view AND filters the surrounding grid to that card's category** — VideoCard wraps content in `<a href="/watch/[id]">` with D-14 hover-prefetch; `/watch/[id]` plays iframe + renders "More in [Category]" rail of siblings; interactive CategoryTag chip on `/watch` round-trips back to `/work/[category]` (Validated in Phase 3 — GRID-04, FILT-01, FILT-02)
- [x] **Deep-linkable URLs reflecting filter state** — URL IS the state: 8 prerendered `/work/<slug>/index.html` standalone files (no client-side filter); pasting/reloading reproduces the filtered view (Validated in Phase 3 — FILT-03, FILT-04; pattern is `/work/[category]` not query-param `?category=` — D-08 routing decision)
- [x] **Responsive grid (2-col mobile / 3-col tablet / 4-col desktop)** — `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` literal on /work + /work/[category] + /watch rail (Validated in Phase 3 — GRID-02; visual breakpoint sweep is human-only check per 03-VERIFICATION.md)
- [x] **Reel-first home page with full-bleed hero (hero image + PLAY REEL CTA)** — `/` renders `<HeroPoster />` (15.4KB content-hashed WebP from Vimeo reel 264677021, gradient overlay, `<h1>Michelle Ngo</h1>` + "Filmmaker & Producer" tagline, PLAY REEL → `/watch/264677021`) above an 8-card featured grid (D-23 quota: PBS×2 + Promos×2 + Branded×2 + Doc×1 + Reel×1, published-desc) and a "View All Work →" overflow link. TopNav goes scroll-aware on `/` only (transparent over hero, solid past sentinel). Phase 1 splash retired. Validated in Phase 4: Reel-Led Home — HERO-01, HERO-02, HERO-03; 3 visual checks pending in 04-HUMAN-UAT.md
- [x] **Dedicated PBS American Portrait page surfacing the 18 PBS videos with project context** — `/pbs-american-portrait/` renders h1 (cat-pbs accent) + subtitle + verbatim PBS blockquote (Candidate C, locked in 05-01) + outbound link to pbs.org + h2 "Stories" + responsive 18-card grid in featured-first/date-desc order; 15 cards carry a "See on PBS →" badge to the per-video collection URL (3 lack a URL). TopNav PBS link retargets here with D-03 active-state on both `/pbs-american-portrait/` AND `/work/pbs-american-portrait/`; D-04 cross-link from `/work/pbs-american-portrait/` and D-05 cross-link from PBS-category `/watch/[id]` reinforce discovery. Filter parity preserved. Validated in Phase 5: PBS American Portrait — PBS-01, PBS-02, PBS-03

### Active

- [ ] First-class Press page surfacing HBO Max, PBS, Hulu, Amazon, U2 Sphere, and other broadcast credits
- [ ] About page with bio, headshot, contact info, IMDb + LinkedIn links
- [ ] Contact surface (email + phone + socials in footer; About page mirrors it)

### Out of Scope

- CMS integration (Sanity/Airtable) — 56 items is small enough that JSON-in-repo is simpler; revisit if she starts adding videos weekly
- Hover-autoplay previews — bandwidth + accessibility cost, and the user explicitly framed the UX as YouTube-like (click-to-play)
- Real-time video uploading / authoring UI — she edits via PR for v1
- Newsletter capture / mailing list — no demonstrated need
- Analytics — defer to v2 (Plausible if added)
- Contact form — `mailto:` link is sufficient
- i18n — current site is English-only
- Migrating non-video disciplines (UX Design, Publishing, Copywriting from current site) — they predate the video focus and don't fit the grid model

## Context

**Existing site (michellengo.net):**
- WordPress.com, footer reads "Powered by WordPress.com"
- Top nav: Home, Advertising, Film-TV, UX Design, Social & Transmedia, Publishing, About + sub-pages (Broadcast & Digital Producing, Copywriting)
- Self-positioning: "Multi-layered Creative"
- No video filtering, no reel-first hero, no press section, generic mobile theme
- Contact: `mynogo [at] gmail.com`, (917) 566-1976, IMDb + LinkedIn

**Reference design language** (from `_prep/02-references.md`):
- isotopefilms.com — editorial sectioned grid, status tags, light high-contrast palette
- yvonnerusso.com — press as first-class section, footer-mirrored nav
- samhendi.com — full-bleed hero with PLAY REEL CTA, type-tag-on-card, monochromatic palette letting thumbnails carry color

**Video corpus** (from `_prep/03-videos-seed.json`):
- 56 videos, 14 from YouTube playlist `PLhEPAS8...crMhZ`, 43 from Vimeo user `user2149742`, deduped
- 18 are PBS American Portrait (her flagship)
- 12 promos/trailers (HBO, Hulu, PBS, U2 Sphere, Music Box)
- 8 branded content (Amazon, Verizon, USPS, Fannie Mae, Target, Itochu, Porter Novelli & Axe)
- Smaller buckets: Documentary/Short Film, Reel, Personal/Tribute, Educational/Nonprofit
- Each entry has source (vimeo/youtube), id, title, uploader, published date, thumbnail URL, embed URL, proposed category, duration, description

## Constraints

- **Tech stack**: SvelteKit + TypeScript + Tailwind — locked in kickoff. Specific Tailwind/Svelte versions TBD in plan-phase
- **Data**: `videos.json` checked into the repo; build-time data only, no runtime CMS fetch
- **Hosting**: Static-export-friendly (Cloudflare Pages or Vercel); no Node server runtime required
- **Domain**: michellengo.net stays on WordPress.com until cutover; build against staging URL (`michelle-ngo.pages.dev` or equivalent)
- **Compatibility**: Modern browsers only — no IE/legacy support obligations
- **Performance**: Reel-led hero must feel instant; thumbnails should blur-up rather than pop-in

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SvelteKit + TS + Tailwind | Locked in kickoff prompt; aligns with 2026 filmmaker portfolios that need motion + static performance | ✓ Validated in Phase 1 — SvelteKit 2.59 + Svelte 5.55 + TS 5.9 strict + Tailwind v4.3 builds clean |
| **D-05 override: GitHub Pages instead of Cloudflare Pages** | User directive at execution time; pipeline-in-repo (workflow file) was preferred over dashboard-managed Git integration | ✓ Validated in Phase 1 — auto-deploy proven on push to main; carries `BASE_PATH=/<repo>` until Phase 7 cutover |
| `videos.json` in repo as source of truth | 56 items is small; PR-based edits acceptable; eliminates CMS hosting + runtime fetch | ✓ Validated in Phase 2 — `src/lib/data/videos.json` (56 records) + Zod schema + Vite build-fail plugin; `import { videos, ... } from '$lib/data'` is the single read path |
| Click-to-filter via routing (not modal) | Deep-linkable, SEO-friendly, matches YouTube-style mental model the user described | ✓ Validated in Phase 3 — `/work/[category]` slug routes (8 prerendered) + `/watch/[id]` |
| Hero = static WebP image, not looping reel video | Bandwidth + initial-paint cost of an autoplay loop vs the LCP win of a 15KB preloaded image; PLAY REEL CTA delivers the reel one click away (HERO-03) | ✓ Validated in Phase 4 — hero-poster.webp content-hashed + `<link rel="preload">` + dedup'd `<img src>` |
| Home featured slice = 8 cross-category sampler (PBS×2/Promos×2/Branded×2/Doc×1/Reel×1) | Telegraphs catalog breadth above the fold to a hiring producer; producer's reel doubles as the Reel slot (Pitfall 8) so PLAY REEL CTA + featured Reel card target the same video | ✓ Validated in Phase 4 — D-23/D-24/D-26 tests green |
| TopNav scroll-aware on `/` only (D-13/D-14) | Transparent over the hero lets the wordmark sit on the poster image; solid on every other route preserves Phase 3 chrome and active-state highlight | ✓ Validated in Phase 4 — IntersectionObserver on #hero-sentinel; 6 non-home routes solid-from-first-paint in unit tests; live transition pending in 04-HUMAN-UAT.md |
| PBS American Portrait gets dedicated page + category tag | 18 of 56 videos and her flagship — warrants both a project landing AND filter inclusion | ✓ Validated in Phase 5 — `/pbs-american-portrait/` flagship landing (verbatim PBS copy + 18-card grid + 15 per-card "See on PBS →" badges) coexists with `/work/pbs-american-portrait/` filter route; TopNav D-02/D-03 active-state covers both surfaces; D-04 + D-05 cross-links reinforce |
| Press as first-class section | HBO Max, PBS, Hulu, U2 Sphere, Amazon credits are commercial differentiators for the hiring-producer audience | — Pending |
| Click-only video preview (no hover autoplay) | Bandwidth + accessibility; user framed as "like YouTube" which is click-to-play | — Pending |
| Audience: hiring producers/agencies first | Drives reel-first hierarchy, press emphasis, type-tag-on-card scanability | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

## Current State

- **Phase 1 (Foundation): Complete** — buildable SvelteKit scaffold + auto-deploying GitHub Pages staging URL at https://wolfwdavid.github.io/michelle_ngo_four/
- **Phase 2 (Data Layer): Complete** — typed videos.json (56 records) + Zod schema + Vite plugin that fails `pnpm build` on schema violation + `$lib/data` public surface (`videos`, `producerReelId`, `getById`, `getByCategory`, category helpers); DATA-01..04 satisfied
- **Phase 3 (Grid, Filter & Watch): Complete** — killer-feature loop wired end-to-end: `/work` (56-card grid) → click → `/watch/[id]/` (iframe + "More in [Category]" rail) → click sibling or category chip → `/work/[category]/` (8 prerendered slug pages with active TopNav highlight). TopNav D-41 active-state painted on prerendered HTML via `endsWith` suffix-match (Plan 03-05 gap closure). 79 unit tests across 10 files; 70 prerendered HTML pages; GRID-01..05 + FILT-01..04 + NAV-01 verified at structural-AND-behavioral level
- **Phase 4 (Reel-Led Home): Complete** — reel-led home shipped: `<HeroPoster />` (full-bleed WebP hero + gradient + name/tagline/PLAY REEL CTA) above an 8-card featured grid (cross-category sampler in published-desc order) above a "View All Work →" link. TopNav extended with route-gated `$effect` + IntersectionObserver on `#hero-sentinel` for scroll-aware behavior on `/` only. Phase 1 splash retired. 99 unit tests across 12 files (all green, 0 skipped); `build/index.html` prerenders cleanly. HERO-01/02/03 satisfied at the prerendered-HTML level. 3 visual checks (gradient legibility / mobile dvh on iOS Safari / live scroll transition) tracked in 04-HUMAN-UAT.md
- **Phase 5 (PBS American Portrait): Complete** — flagship landing `/pbs-american-portrait/` shipped with verbatim PBS blockquote (Candidate C, user-locked in 05-01), 18-card grid in featured-first/date-desc order, 15 per-card "See on PBS →" badges to per-video collection URLs (3 lack a URL by design — IDs 620232398, 1007061884, 1007027015). TopNav PBS link retargets here with D-03 active-state on both `/pbs-american-portrait/` AND `/work/pbs-american-portrait/`. D-04 cross-link added to `/work/pbs-american-portrait/`; D-05 cross-link added to PBS-category `/watch/[id]` (negative cases verified). Filter route parity preserved. 126/126 unit tests passing (0 skipped); both PBS routes prerender. PBS-01, PBS-02, PBS-03 all verified at prerendered-HTML level by gsd-verifier (4/4 success criteria, 11/11 plan truths, 11/11 artifacts, 5/5 key-links, 3/3 requirements)
- Next: Phase 6 (Press, About & Contact)

---
*Last updated: 2026-05-12 after Phase 5 completion*
