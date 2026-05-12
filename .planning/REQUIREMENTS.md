# Requirements: Michelle Ngo Portfolio

**Defined:** 2026-05-10
**Core Value:** A producer can land on the site, watch the reel, click any video, and immediately see "more like this" — every interaction reinforces the depth and breadth of her video work.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Project builds with SvelteKit 2 + TypeScript (strict) + Tailwind, no runtime errors
- [x] **FOUND-02**: Project deploys to GitHub Pages from main branch on push, with a public staging URL (D-05 overridden 2026-05-10 — see DEPLOY-NOTES.md)
- [ ] **FOUND-03**: User sees the production build under 2s on a 4G connection (no client-side data fetch on first paint)

### Data

- [x] **DATA-01**: Site renders 56 videos sourced from `videos.json` checked into the repo
- [x] **DATA-02**: Each video record exposes source (youtube/vimeo), id, title, uploader, thumbnail URL, embed URL, category, duration, published date, and description
- [x] **DATA-03**: Video data validates against a TypeScript schema at build time; build fails on schema violations
- [x] **DATA-04**: Categories are a closed canonical list (no free-text), locked from the user-approved taxonomy in `_prep/04-categories.md`

### Hero

- [x] **HERO-01**: Home page renders a full-bleed hero (looping reel video or hero image + PLAY REEL CTA)
- [x] **HERO-02**: Hero shows Michelle's name and a tone-setting tagline above the fold
- [x] **HERO-03**: PLAY REEL CTA opens her producer's reel in the watch view

### Grid

- [x] **GRID-01**: User sees a video grid below the hero with thumbnail, title, category tag, and uploader/client
- [x] **GRID-02**: Grid is responsive — 2-col mobile, 3-col tablet, 4-col desktop (or equivalent breakpoints)
- [x] **GRID-03**: Thumbnails blur-up from a low-res placeholder to full resolution
- [x] **GRID-04**: User can click any card to open its video in the watch view
- [x] **GRID-05**: Card visually reflects category via a consistent type-tag treatment

### Filter & Watch

- [x] **FILT-01**: Clicking a card navigates to `/watch/[id]` and plays the video
- [x] **FILT-02**: `/watch/[id]` displays a "more in this category" rail showing other videos sharing the clicked card's category
- [x] **FILT-03**: User can browse all videos for a category at `/work/[category]`
- [x] **FILT-04**: Filter state is reflected in the URL so that pasting/reloading the URL shows the same filtered view

### PBS American Portrait

- [x] **PBS-01**: User can navigate to a dedicated PBS American Portrait landing page
- [x] **PBS-02**: PBS page displays the 18 PBS videos with project context describing the PBS American Portrait initiative
- [x] **PBS-03**: PBS is also reachable as a regular filterable category from `/work`

### Press

- [x] **PRES-01**: User can navigate to a dedicated `/press` page
- [x] **PRES-02**: Press page surfaces broadcast credits (HBO Max, PBS, Hulu, Amazon, U2 Sphere, Music Box, etc.) with network/publication names

### About

- [ ] **ABT-01**: User can navigate to `/about`
- [ ] **ABT-02**: `/about` shows headshot, bio, IMDb link, LinkedIn link, and contact info

### Contact

- [ ] **CONT-01**: Footer surfaces email (`mailto:` link), phone, IMDb, LinkedIn, and Vimeo
- [ ] **CONT-02**: `/about` mirrors the same contact information

### Navigation

- [x] **NAV-01**: Top text-link nav lists primary categories + secondary links (About / Press / Contact)
- [ ] **NAV-02**: Footer mirrors the top nav for accessibility and discoverability

## v2 Requirements

Deferred. Tracked but not in v1 roadmap.

### Analytics & Observability

- **ANLT-01**: Plausible (or equivalent privacy-friendly) analytics integrated
- **ANLT-02**: Per-video click-through tracked

### Contact

- **CONT2-01**: Contact form on `/contact` (instead of `mailto:`)

### Editorial

- **EDIT-01**: CMS-backed editing (Sanity/Airtable) so Michelle can publish without PR
- **EDIT-02**: Per-video markdown pages for SEO depth
- **EDIT-03**: Newsletter capture / mailing list

### Discovery

- **DISC-01**: Search across videos by title/description
- **DISC-02**: Filter by year or client

## Out of Scope

| Feature | Reason |
|---------|--------|
| CMS integration | 56 items is small; PR-based JSON edits acceptable. Revisit if posting cadence changes. |
| Hover-autoplay previews | Bandwidth + accessibility cost. User explicitly framed UX as YouTube-like (click to play). |
| i18n | Current site is English-only; no demonstrated multilingual audience. |
| Migrating UX Design / Publishing / Copywriting pages | They predate the video focus and don't fit the grid model. |
| Newsletter / mailing list | No demonstrated need; defer to v2. |
| Real-time uploading / authoring UI | Michelle edits via PR for v1. |
| Contact form | `mailto:` link is sufficient and avoids spam-handling. |
| Analytics | Defer to v2; not core to launch. |
| Mobile native app | Web-first, responsive. |

## Traceability

Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 7 | Pending |
| DATA-01 | Phase 2 | Complete |
| DATA-02 | Phase 2 | Complete |
| DATA-03 | Phase 2 | Complete |
| DATA-04 | Phase 2 | Complete |
| HERO-01 | Phase 4 | Complete |
| HERO-02 | Phase 4 | Complete |
| HERO-03 | Phase 4 | Complete |
| GRID-01 | Phase 3 | Complete |
| GRID-02 | Phase 3 | Complete |
| GRID-03 | Phase 3 | Complete |
| GRID-04 | Phase 3 | Complete |
| GRID-05 | Phase 3 | Complete |
| FILT-01 | Phase 3 | Complete |
| FILT-02 | Phase 3 | Complete |
| FILT-03 | Phase 3 | Complete |
| FILT-04 | Phase 3 | Complete |
| PBS-01 | Phase 5 | Complete |
| PBS-02 | Phase 5 | Complete |
| PBS-03 | Phase 5 | Complete |
| PRES-01 | Phase 6 | Complete |
| PRES-02 | Phase 6 | Complete |
| ABT-01 | Phase 6 | Pending |
| ABT-02 | Phase 6 | Pending |
| CONT-01 | Phase 6 | Pending |
| CONT-02 | Phase 6 | Pending |
| NAV-01 | Phase 3 | Complete |
| NAV-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30 ✓
- Unmapped: 0 ✓

**Phase totals:**
- Phase 1 (Foundation): 2 requirements — FOUND-01, FOUND-02
- Phase 2 (Data Layer): 4 requirements — DATA-01, DATA-02, DATA-03, DATA-04
- Phase 3 (Grid, Filter & Watch): 10 requirements — GRID-01..05, FILT-01..04, NAV-01
- Phase 4 (Reel-Led Home): 3 requirements — HERO-01, HERO-02, HERO-03
- Phase 5 (PBS American Portrait): 3 requirements — PBS-01, PBS-02, PBS-03
- Phase 6 (Press, About & Contact): 7 requirements — PRES-01, PRES-02, ABT-01, ABT-02, CONT-01, CONT-02, NAV-02
- Phase 7 (Polish & Production Cutover): 1 requirement — FOUND-03

---
*Requirements defined: 2026-05-10*
*Last updated: 2026-05-10 after roadmap creation (traceability mapped)*
