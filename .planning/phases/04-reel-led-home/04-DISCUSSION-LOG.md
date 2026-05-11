# Phase 4: Reel-Led Home - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 04-reel-led-home
**Areas discussed:** Hero medium, Hero composition, PLAY REEL behavior, Featured grid

---

## Area-selection prompt

| Option | Description | Selected |
|--------|-------------|----------|
| Hero medium | Looping reel video vs static hero image vs hybrid poster→loop | ✓ |
| Hero composition | Name treatment, tagline, layout, height, TopNav behavior over hero | ✓ |
| PLAY REEL behavior | Navigate to /watch vs modal vs inline-expand; CTA style + position | ✓ |
| Featured grid | Curation count, composition, "View All" affordance, heading | ✓ |

**User's choice:** All four areas.

---

## Hero medium

### Q1: What fills the full-bleed hero on /?

| Option | Description | Selected |
|--------|-------------|----------|
| Looping reel video (background) | Muted, looping video plays as the hero background. Heaviest perf cost; need a short edited loop (~15-30s). | |
| Static hero image + PLAY REEL CTA (Recommended) | Sam Hendi pattern verbatim. Cheapest perf, sharpest typography, leans into mono-chrome system. Matches FOUND-03 (<2s on 4G). | ✓ |
| Hybrid: poster on load → swap to loop | Static poster renders instantly, then muted .mp4 loop fades in. Best-of-both for perf-conscious motion, but adds complexity. | |

**User's choice:** Static hero image + PLAY REEL CTA
**Notes:** Captured as D-01. Sam-hendi-faithful, perf-conservative for FOUND-03, no `prefers-reduced-motion` complexity.

### Q2: Where does the hero image come from?

| Option | Description | Selected |
|--------|-------------|----------|
| Poster frame from the reel itself (Recommended) | Grab a striking frame from Vimeo 264677021; check into repo as a static asset. | ✓ |
| Vimeo's official poster URL | Use Vimeo's auto-generated poster. Zero authoring, but bound to Vimeo's CDN. | |
| Custom still authored separately | Arbitrary still that may not be from the reel (BTS shot, headshot, composite). Most editorial flexibility. | |

**User's choice:** Poster frame from the reel itself
**Notes:** Captured as D-02 + D-03 (`src/lib/assets/hero-poster.<ext>`, Vite-bundled). Frame selection deferred to planner with guidance: prefer a wide cinematic still where Michelle isn't on-camera.

### Q3: How is the image treated to keep the hero text legible?

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom gradient (black-to-transparent) + text in lower band (Recommended) | Sam-hendi-faithful. Dark gradient anchored bottom; image intact in top ¾. | ✓ |
| Full image dim (uniform ~40% black overlay) | Predictable contrast; image reads as 'darkened photo'. | |
| Vignette + corner placement | Radial dark gradient from corners; text in one corner. More editorial. | |

**User's choice:** Bottom gradient + text in lower band
**Notes:** Captured as D-05. `bg-gradient-to-t from-black/80 via-black/20 to-transparent`.

### Q4: On mobile (<640px), does the hero image change?

| Option | Description | Selected |
|--------|-------------|----------|
| Same image, object-cover, focal-point tuned (Recommended) | One asset for all breakpoints; `object-position` keeps subject in frame. | ✓ |
| Two assets: desktop wide + mobile portrait crop | More editorial control on mobile via `<picture>` element. | |
| Same image, but mobile height shorter | One asset; less aggressive cropping on mobile. | |

**User's choice:** Same image, object-cover, focal-point tuned
**Notes:** Captured as D-06. `object-position: center 30%` as starting value; planner can tune. Portrait crop deferred to Phase 7 if needed.

---

## Hero composition

### Q1: How does Michelle's name render over the hero?

| Option | Description | Selected |
|--------|-------------|----------|
| Same all-caps tracked wordmark, much larger (Recommended) | Hero scale: text-6xl md:text-8xl lg:text-9xl. Anchors the brand. | ✓ |
| Same all-caps wordmark, slightly bigger than TopNav | Quieter; risks home feeling under-branded. | |
| Bold weight (non-uppercase) | Sentence-case display weight; breaks consistency with splash + TopNav. | |

**User's choice:** Same all-caps tracked wordmark, much larger
**Notes:** Captured as D-08. Inherits Phase 1 splash typography family; larger than the TopNav wordmark by design.

### Q2: What's the actual tagline copy under the wordmark?

| Option | Description | Selected |
|--------|-------------|----------|
| Role-first: 'Filmmaker & Producer' | Tight, descriptive, scannable for a hiring producer. Sibling to sam hendi's 'SENIOR CREATIVE PRODUCER'. | ✓ |
| Capability-first: 'Producing stories across broadcast, branded, and independent film' | Longer; names what she does. Wraps to two lines on mobile. | |
| Inherit current self-positioning: 'Multi-layered Creative' | What her current WordPress site uses; vague for hiring producers. | |
| Leave blank — wordmark + PLAY REEL CTA only | Sam-hendi-strict. Violates HERO-02 explicit tagline requirement. | |

**User's choice:** Role-first: 'Filmmaker & Producer'
**Notes:** Captured as D-09. Stored inline in `/+page.svelte`, not in i18n strings file.

### Q3: How tall is the hero on desktop?

| Option | Description | Selected |
|--------|-------------|----------|
| Full viewport height (100vh) with scroll cue (Recommended) | Sam-hendi-faithful, cinematic. Mobile uses dvh for iOS URL-bar safety. | ✓ |
| ~80vh, featured grid peeks above the fold | Reduces 'is there more?' ambiguity at the cost of cinematic feel. | |
| Fixed pixel height (e.g., 720px) | Predictable across browsers; looks cropped on tall desktops. | |

**User's choice:** Full viewport height (100vh) with scroll cue
**Notes:** Captured as D-10 + D-11. `min-h-dvh` on Tailwind v4; chevron scroll cue at bottom-center, no microcopy.

### Q4: How does the sticky TopNav behave over the full-bleed hero?

| Option | Description | Selected |
|--------|-------------|----------|
| Transparent over hero, solidifies on scroll (Recommended) | Transparent while hero in view; reverts to bg-neutral-950/95 backdrop-blur after. Most cinematic. | ✓ |
| Solid background everywhere (no change) | Keep Phase 3 sticky bg-neutral-950/95 exactly as-is. Solid bar over cinematic hero is the wrong vibe. | |
| Hide TopNav entirely until scroll | Most immersive; discoverability + accessibility cost; slides in past hero. | |

**User's choice:** Transparent over hero, solidifies on scroll
**Notes:** Captured as D-13 + D-14. Scoped to `/` only — every other route keeps the solid background. Implementation via IntersectionObserver on a sentinel below the hero, inside TopNav.svelte (encapsulated; +layout.svelte does not change).

---

## PLAY REEL behavior

### Q1: What happens when a producer clicks PLAY REEL?

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to /watch/264677021 (Recommended) | Honors HERO-03 literally; deep-linkable; "More in Reel" rail for free; browser back works. | ✓ |
| Modal/lightbox over the home | Iframe overlay; no deep-link URL; breaks back-button; duplicates watch page wiring. Violates HERO-03 phrasing. | |
| Inline expand — hero swaps to player in place | Hero fades, iframe replaces. No URL change; no rail; breaks on scroll. | |

**User's choice:** Navigate to /watch/264677021
**Notes:** Captured as D-16 + D-17. `producerReelId` from `$lib/data` (no hardcoded id).

### Q2: What does the PLAY REEL CTA look like?

| Option | Description | Selected |
|--------|-------------|----------|
| Outlined button: bordered, transparent fill, '▷ PLAY REEL' (Recommended) | Sam-hendi-faithful. 1px white border, transparent fill. | ✓ |
| Solid white button with black text | Stronger visual punch; reads as 'product CTA' not 'film portfolio'. | |
| Text link with play glyph, no chrome | Cleanest typography; less discoverable as primary action. | |

**User's choice:** Outlined button: '▷ PLAY REEL'
**Notes:** Captured as D-18 + D-19. Hover state: fill white with black text. Glyph: leading unicode "▷"; planner can swap to inline SVG if sizing fails.

### Q3: Where does the CTA sit relative to name + tagline in the lower band?

| Option | Description | Selected |
|--------|-------------|----------|
| Left-aligned stack: NAME / tagline / CTA (Recommended) | All three at lower-left, left-aligned; matches sam hendi's text block. | ✓ |
| Centered stack: name / tagline / CTA, all center-aligned | Symmetric, splash-page-feeling. Loses cinematic editorial feel. | |
| Split: name + tagline top-left, CTA bottom-right | Magazine-spread; CTA far from brand; risks reading as lesser element. | |

**User's choice:** Left-aligned stack
**Notes:** Captured as D-12. `flex flex-col items-start justify-end pb-16 lg:pb-24 pl-6 sm:pl-10 lg:pl-16`. On mobile the same stack shrinks; nothing reflows.

---

## Featured grid

### Q1: How much of the catalog renders below the hero on /?

| Option | Description | Selected |
|--------|-------------|----------|
| Featured slice only + 'View All Work →' link to /work (Recommended) | ~6-9 featured cards + overflow link; tightest curation; clearest 'highlight reel'. | ✓ |
| All 56 videos with featured on top | Home + /work become near-identical; loses curation. | |
| Featured slice only, no overflow link | Tight; hostile to discovery for a depth+breadth portfolio. | |

**User's choice:** Featured slice only + "View All Work →" link
**Notes:** Captured as D-21 + D-28. Discovery preserved via TopNav (8 category links always visible) + View-All link.

### Q2: How many featured cards in the home slice?

| Option | Description | Selected |
|--------|-------------|----------|
| 8 — two desktop rows of 4 / four mobile rows of 2 (Recommended) | Matches Phase 3 D-17 eager-load pattern verbatim. Big enough for range, small for curation. | ✓ |
| 6 — tighter slice, asymmetric on desktop | 2 in second row looks unfinished at 4-col. | |
| 12 — three desktop rows | More breadth; scrolling commitment + harder to curate. | |

**User's choice:** 8 cards
**Notes:** Captured as D-22. Every featured card passes `eager={true}` to VideoCard.

### Q3: Which 8 videos get `featured: true`?

| Option | Description | Selected |
|--------|-------------|----------|
| Cross-category sampler: PBS ×2 + Promos ×2 + Branded ×2 + Doc ×1 + Reel ×1 (Recommended) | Shows breadth across strongest commercial categories. Planner picks exact 8 by date-desc + client recognizability. | ✓ |
| PBS-heavy: PBS ×4 + Promos ×2 + Branded ×2 | Leads with flagship; narrows first-impression breadth. | |
| Client-name heavy: pick by brand recognition | Optimizes for logo recognition; risks mixing strong + weak work. | |
| Claude picks: discretion based on metadata | Defer curation entirely to planning/implementation. | |

**User's choice:** Cross-category sampler
**Notes:** Captured as D-23. Planner surfaces the exact 8 in PLAN.md as a table for user review BEFORE flipping `featured: true` bits.

### Q4: Does the featured grid have a section heading?

| Option | Description | Selected |
|--------|-------------|----------|
| No heading — grid sits directly under the hero (Recommended) | Sam-hendi pattern; hero + scroll cue does the work. | ✓ |
| Quiet section heading: 'Featured' or 'Selected Work' | Signals 'curated subset' explicitly. Slight repetition. | |
| Heading with inline link: 'Featured Work → View All' | Combines section label + overflow link at top of grid. | |

**User's choice:** No heading
**Notes:** Captured as D-27. Grid sits directly under the hero with normal `py-8` vertical rhythm.

---

## Claude's Discretion

Items deliberately left to the planner:
- Exact poster frame from Vimeo 264677021 (planner picks; guidance: wide cinematic still, Michelle off-camera, lower band depth)
- Image format (jpg vs webp), compression target (~150KB)
- Exact `object-position` value for mobile cropping
- Scroll-cue glyph (chevron vs arrow vs microcopy)
- Outlined-button hover state intensity
- Exact `text-*xl` scale for the hero wordmark
- "View All Work →" microcopy + arrow glyph
- HeroPoster.svelte extraction vs inline composition

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section. Highlights:
- Looping background video hero (Phase 7 revisit if perf budget allows)
- Hybrid poster→loop swap (same perf concern)
- Modal/inline-expand PLAY REEL (violates HERO-03)
- 6 / 12 featured cards (visual rhythm / curation tradeoffs)
- Section heading variants on featured grid
- All-56-on-home (duplicates /work)
- PBS-heavy / client-name-heavy curation
- Centered hero text / non-uppercase wordmark
- Solid / text-link PLAY REEL chrome
- LQIP placeholder, `<picture>` portrait crop, srcset, AVIF, OG metadata (all Phase 7)
- Scroll-cue pulse animation
- Custom hero still authored separately
- `prefers-reduced-motion` handling (N/A while static)
- Light theme variant
- i18n / translated tagline
