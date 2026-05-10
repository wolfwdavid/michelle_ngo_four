# Requirements: Michelle Ngo Portfolio

**Defined:** 2026-05-10
**Core Value:** A producer can land on the site, watch the reel, click any video, and immediately see "more like this" — every interaction reinforces the depth and breadth of her video work.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Project builds with SvelteKit 2 + TypeScript (strict) + Tailwind, no runtime errors
- [ ] **FOUND-02**: Project deploys to Cloudflare Pages from main branch on push, with a public staging URL
- [ ] **FOUND-03**: User sees the production build under 2s on a 4G connection (no client-side data fetch on first paint)

### Data

- [ ] **DATA-01**: Site renders 56 videos sourced from `videos.json` checked into the repo
- [ ] **DATA-02**: Each video record exposes source (youtube/vimeo), id, title, uploader, thumbnail URL, embed URL, category, duration, published date, and description
- [ ] **DATA-03**: Video data validates against a TypeScript schema at build time; build fails on schema violations
- [ ] **DATA-04**: Categories are a closed canonical list (no free-text), locked from the user-approved taxonomy in `_prep/04-categories.md`

### Hero

- [ ] **HERO-01**: Home page renders a full-bleed hero (looping reel video or hero image + PLAY REEL CTA)
- [ ] **HERO-02**: Hero shows Michelle's name and a tone-setting tagline above the fold
- [ ] **HERO-03**: PLAY REEL CTA opens her producer's reel in the watch view

### Grid

- [ ] **GRID-01**: User sees a video grid below the hero with thumbnail, title, category tag, and uploader/client
- [ ] **GRID-02**: Grid is responsive — 2-col mobile, 3-col tablet, 4-col desktop (or equivalent breakpoints)
- [ ] **GRID-03**: Thumbnails blur-up from a low-res placeholder to full resolution
- [ ] **GRID-04**: User can click any card to open its video in the watch view
- [ ] **GRID-05**: Card visually reflects category via a consistent type-tag treatment

### Filter & Watch

- [ ] **FILT-01**: Clicking a card navigates to `/watch/[id]` and plays the video
- [ ] **FILT-02**: `/watch/[id]` displays a "more in this category" rail showing other videos sharing the clicked card's category
- [ ] **FILT-03**: User can browse all videos for a category at `/work/[category]`
- [ ] **FILT-04**: Filter state is reflected in the URL so that pasting/reloading the URL shows the same filtered view

### PBS American Portrait

- [ ] **PBS-01**: User can navigate to a dedicated PBS American Portrait landing page
- [ ] **PBS-02**: PBS page displays the 18 PBS videos with project context describing the PBS American Portrait initiative
- [ ] **PBS-03**: PBS is also reachable as a regular filterable category from `/work`

### Press

- [ ] **PRES-01**: User can navigate to a dedicated `/press` page
- [ ] **PRES-02**: Press page surfaces broadcast credits (HBO Max, PBS, Hulu, Amazon, U2 Sphere, Music Box, etc.) with network/publication names

### About

- [ ] **ABT-01**: User can navigate to `/about`
- [ ] **ABT-02**: `/about` shows headshot, bio, IMDb link, LinkedIn link, and contact info

### Contact

- [ ] **CONT-01**: Footer surfaces email (`mailto:` link), phone, IMDb, LinkedIn, and Vimeo
- [ ] **CONT-02**: `/about` mirrors the same contact information

### Navigation

- [ ] **NAV-01**: Top text-link nav lists primary categories + secondary links (About / Press / Contact)
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
| FOUND-01 | TBD | Pending |
| FOUND-02 | TBD | Pending |
| FOUND-03 | TBD | Pending |
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |
| DATA-04 | TBD | Pending |
| HERO-01 | TBD | Pending |
| HERO-02 | TBD | Pending |
| HERO-03 | TBD | Pending |
| GRID-01 | TBD | Pending |
| GRID-02 | TBD | Pending |
| GRID-03 | TBD | Pending |
| GRID-04 | TBD | Pending |
| GRID-05 | TBD | Pending |
| FILT-01 | TBD | Pending |
| FILT-02 | TBD | Pending |
| FILT-03 | TBD | Pending |
| FILT-04 | TBD | Pending |
| PBS-01 | TBD | Pending |
| PBS-02 | TBD | Pending |
| PBS-03 | TBD | Pending |
| PRES-01 | TBD | Pending |
| PRES-02 | TBD | Pending |
| ABT-01 | TBD | Pending |
| ABT-02 | TBD | Pending |
| CONT-01 | TBD | Pending |
| CONT-02 | TBD | Pending |
| NAV-01 | TBD | Pending |
| NAV-02 | TBD | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 0 (filled by roadmapper)
- Unmapped: 30 ⚠️ (will be 0 after roadmap)

---
*Requirements defined: 2026-05-10*
*Last updated: 2026-05-10 after initial definition*
