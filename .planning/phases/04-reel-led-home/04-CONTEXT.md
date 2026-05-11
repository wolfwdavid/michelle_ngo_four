# Phase 4: Reel-Led Home - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the Phase 1 wordmark splash at `/` with a full-bleed reel-led hero (name + tone-setting tagline + PLAY REEL CTA) and a curated featured video grid below the fold. The hero medium is a static poster image (not a looping video), and PLAY REEL navigates to the existing `/watch/[id]` route for the Producer's Reel.

In scope:
- New `/` route content: full-bleed hero composition + featured grid + "View All Work →" overflow link
- Hero poster asset checked into the repo (single image, no looping video in v1)
- TopNav scroll-aware behavior **scoped to `/`** (transparent over the hero, solidifies on scroll past it)
- Flipping `featured: true` on 8 chosen rows of `src/lib/data/videos.json`
- Reuse of `VideoCard`, `producerReelId`, `videos`, `TopNav`, `base` from `$app/paths` — no new shared primitives

Out of scope (other phases):
- `/pbs` dedicated PBS American Portrait landing — Phase 5 (PBS as a filterable category already lives at `/work/pbs-american-portrait`)
- `/press`, `/about`, `/contact` real content + footer + footer-mirrored nav (NAV-02) — Phase 6 (placeholder routes exist from Phase 3 D-43)
- Perf budget <2s on 4G + true LQIP placeholder + srcset/`<picture>` + OG metadata + production cutover — Phase 7
- Looping video hero — explicitly deferred (see `<deferred>` below)
- `prefers-reduced-motion` handling — N/A since the hero is static; revisit if Phase 7 swaps to motion

</domain>

<decisions>
## Implementation Decisions

### Hero medium
- **D-01:** **Static hero image + PLAY REEL CTA** (Sam Hendi pattern). No looping video in v1 — perf-conservative for FOUND-03 (<2s on 4G), no `prefers-reduced-motion` complexity, sharper typography over the still.
- **D-02:** **Poster frame grabbed from her Producer's Reel** (Vimeo `264677021`) and checked into the repo as a static asset. Frame selection: a striking still where Michelle is NOT on-camera (her name is over it). Lean toward cinematic depth — e.g., a wide shot from her PBS American Portrait work. Exact frame is Claude's Discretion (planner authors the asset).
- **D-03:** **Asset location: `src/lib/assets/hero-poster.<ext>`** — Vite bundles + fingerprints + cache-busts via content hash. Imported as `import heroPoster from '$lib/assets/hero-poster.jpg'`. Recommended over `static/hero-poster.jpg` (which would serve as-is from `${base}/hero-poster.jpg` without cache-busting).
- **D-04:** **Format: planner picks `.jpg` or `.webp`.** Single asset in v1; no `srcset`, no `<picture>`, no AVIF — Phase 7 polish if FOUND-03 budget demands it. Target compression: under ~150KB if achievable without visible artifacts.
- **D-05:** **Bottom gradient overlay for text legibility:** `bg-gradient-to-t from-black/80 via-black/20 to-transparent` over the image, anchored to the lower band. Keeps the top three-quarters of the image intact (cinematic still feel) and darkens the lower band where text sits. NOT a full uniform dim.
- **D-06:** **Single image for all breakpoints with `object-cover`** + `object-position: center 30%` (or planner-tuned focal point). Mobile crops the same wide asset; a portrait-specific crop is Phase 7 polish if it looks awkward at 9:16. Tailwind utility: `object-cover object-[center_30%]` (arbitrary value syntax).
- **D-07:** **`alt=""` on the hero poster `<img>` (decorative).** The wordmark + tagline carry semantic meaning; the image is a visual anchor, not content. **`loading="eager"`** + **`fetchpriority="high"`** since it's the LCP element. No `decoding="async"` — eager + high priority means we want it blocking.

### Hero composition
- **D-08:** **Name renders as all-caps tracked wordmark at hero scale.** Classes: `text-6xl md:text-8xl lg:text-9xl tracking-widest uppercase font-bold` (or equivalent — planner can tune the exact size scale). Inherits Phase 1 splash typography family; reads as the primary brand mark on the page. Larger than the TopNav wordmark by design.
- **D-09:** **Tagline:** **`Filmmaker & Producer`** — role-first, scannable for a hiring producer landing cold. Stored inline in `/+page.svelte`, not in an i18n strings file (i18n is Out of Scope). One line, no period. Tracked-wide subdued treatment: `text-sm md:text-base tracking-wide text-neutral-300 uppercase` or planner's equivalent.
- **D-10:** **Hero height: full viewport, mobile-safe.** `min-h-dvh` (Tailwind v4 dynamic viewport height) — avoids iOS Safari's URL-bar-induced layout shift. Falls back to `min-h-screen` on browsers without `dvh` support. Featured grid sits **below** the hero (does NOT peek above the fold on desktop — discovery anchor is the scroll cue + the TopNav).
- **D-11:** **Scroll cue at bottom-center of the hero.** Small chevron glyph (down arrow), white at ~60% opacity, no microcopy. Bottom-center, ~40px above the hero's bottom edge. Optional subtle pulse animation is Claude's Discretion (recommend instant / no animation for v1; revisit if user-test reveals producers miss the scroll).
- **D-12:** **Text composition: left-aligned stack at lower-left of the hero.** Order top-to-bottom: NAME → tagline → CTA button. Container: `flex flex-col items-start justify-end pb-16 lg:pb-24 pl-6 sm:pl-10 lg:pl-16`. Sits over the gradient-darkened lower band. On mobile the same stack just shrinks; nothing reflows or recenters.
- **D-13:** **TopNav goes scroll-aware ON `/` ONLY.** While the hero is in view: TopNav background = **transparent**, links + wordmark sit over the gradient-darkened image (white text + per-category accents preserved verbatim). After scrolling past the hero: TopNav background reverts to the existing Phase 3 sticky `bg-neutral-950/95 backdrop-blur`. Every other route (`/work`, `/work/[category]`, `/watch/[id]`, `/about`, `/press`, `/contact`) keeps the solid background — no transparency.
- **D-14:** **TopNav transparency wired via IntersectionObserver on a sentinel below the hero** (preferred over a `scroll` event listener — cleaner teardown, no rAF needed). Sentinel = an empty `<div>` placed at the hero's bottom edge; when it enters the viewport, TopNav flips state. Implementation lives **inside TopNav.svelte** (reads `page.route.id` from `$app/state`; observer only attaches when route is `/`). Encapsulated — `+layout.svelte` does not change.
- **D-15:** **Old `/` splash markup is replaced entirely.** Phase 4 owns the whole `src/routes/+page.svelte` body. The Phase 1 wordmark splash is retired; the new hero takes over.

### PLAY REEL behavior
- **D-16:** **PLAY REEL is a regular anchor link:** `<a href={` + "`${base}/watch/${producerReelId}`" + `}>`. NOT a modal, NOT inline-expand. Honors REQUIREMENTS HERO-03 literally ("opens her producer's reel in the watch view"). Free wins: deep-linkable, gets the Phase 3 "More in Reel" rail for free (3 sibling videos in the Reel category), browser back-button works naturally.
- **D-17:** **`producerReelId` consumed from `$lib/data`** (Phase 2 D-09) — no hardcoded video id in `+page.svelte`. Future-proof: if the reel id ever changes, only `$lib/data/index.ts` updates.
- **D-18:** **CTA visual: outlined button.** 1px white border, transparent fill, label "▷ PLAY REEL" all-caps tracked. Classes (planner can tune): `inline-flex items-center gap-2 border border-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`. Inherits Phase 3 D-07 focus ring.
- **D-19:** **Glyph: leading "▷"** (small play triangle) inline in the label as a unicode character. Pure CSS, no icon system, no SVG component in v1. Planner can swap for a sized inline SVG if "▷" sizing looks wrong against the tracked uppercase letters.
- **D-20:** **Hover prefetch on the CTA:** `data-sveltekit-preload-data="hover"` on the anchor (inherits Phase 3 D-14 card pattern). Hover on `/` preloads `/watch/[reelId]`'s module + load function — instant click-through.

### Featured grid
- **D-21:** **`/` shows the featured slice ONLY**, not the full 56. The full catalog lives at `/work` (already complete from Phase 3). Discovery is preserved through (a) the TopNav (8 category links + About/Press/Contact, always visible), (b) the "View All Work →" link below the grid.
- **D-22:** **Featured slice size: 8 cards.** Two desktop rows of 4 (at `lg`+), three rows of 2 + 1 on tablet (at `sm`+), four rows of 2 on mobile (below `sm`). Matches Phase 3 D-17 eager-load pattern verbatim — **every featured card passes `eager={true}` to VideoCard** since all 8 are above the fold once scrolled to.
- **D-23:** **Featured composition: cross-category sampler.** Quota:
  - `PBS American Portrait` ×2 (flagship — biggest category, gets 2 slots)
  - `Promos & Trailers` ×2 (broadcast credentials — HBO, Hulu, PBS, U2 Sphere)
  - `Branded Content` ×2 (commercial bench — Amazon, Verizon, USPS, Fannie Mae, Target)
  - `Documentary / Short Film` ×1
  - `Reel` ×1 (Producer's Reel slot — same video that's the PLAY REEL target)

  Planner picks the exact 8 in plan-phase using two signals: **(1) date-desc within each category** (newest work first), **(2) client recognizability tiebreaker** (HBO Max / Hulu / Amazon / U2 Sphere / PBS / Verizon / USPS / Fannie Mae > smaller clients). Picks are surfaced in PLAN.md as a table for user review **before flipping `featured: true` bits**.
- **D-24:** **`featured: true` flag flipped on 8 rows of `src/lib/data/videos.json`.** Build-time Zod schema already accepts the field (Phase 2 D-08); no schema or loader changes needed. The flip is content edits only.
- **D-25:** **Grid markup mirrors `/work` literally.** Same `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">`, same `<VideoCard>` component, same `max-w-7xl px-4 sm:px-6 lg:px-8` container, same `{#each ... (video.id)}` keyed iteration. Phase 3 D-21..D-23 carry forward verbatim.
- **D-26:** **Filter logic at module load:** `videos.filter(v => v.featured)` returns the 8 featured. Then Phase 3 D-25 ordering applies (featured first — N/A since all 8 are featured — then `published` date desc). Net result: 8 cards in date-desc order. Logic lives in the page's load function (or inline at top of `+page.svelte` if no other load work needed).
- **D-27:** **NO section heading above the featured grid.** The hero's scroll cue + the grid itself communicate intent. Sam-hendi-faithful. Grid sits directly under the hero with normal `py-8` vertical rhythm.
- **D-28:** **"View All Work →" link below the grid.** Plain text link, all-caps tracked, centered, with trailing right-arrow glyph. Anchors to `${base}/work`. Hover: underline (matches Phase 3 D-08 inline-link pattern). Classes (planner tunes): `block text-center mt-8 text-sm tracking-widest uppercase hover:underline`. Includes `data-sveltekit-preload-data="hover"` for prefetch.

### Claude's Discretion
- **Exact poster frame** from Vimeo 264677021 — planner picks; recommend a wide cinematic still where Michelle isn't on-camera, with depth and dark areas in the lower band so the gradient + text composite cleanly.
- **Image format (jpg vs webp)** and target compression — single asset, ~150KB target if achievable without artifacts.
- **Exact `object-position` value** for mobile cropping — start with `center 30%`; tune in Phase 7.
- **Scroll-cue glyph** — chevron (recommended) vs arrow vs "SCROLL" microcopy. Lean toward a single chevron, no text.
- **Scroll threshold for TopNav transparent→solid transition** — recommend the IntersectionObserver sentinel at the hero's bottom edge (clean cutover). Avoid percentage-based scroll math.
- **Outlined button hover state** — recommend `hover:bg-white hover:text-black`; planner can swap to `hover:bg-white/10` for a quieter treatment if the inversion reads too aggressive.
- **Exact `text-*xl` scale for the wordmark** — recommend `text-6xl md:text-8xl lg:text-9xl` but planner can dial within ±1 step based on the chosen poster's visual weight.
- **"View All Work →" microcopy + arrow glyph** — "→" (unicode) is fine; recommended over an SVG. Microcopy could be "View All 56 Videos →" if the explicit count helps; default to "View All Work →".
- **HeroPoster.svelte vs inline composition** — recommend extracting `HeroPoster.svelte` (or similar) as a child component since it owns the gradient + text composition + CTA + scroll cue. Cleaner testability + the page route stays a thin composition. Naming and exact split are Claude's call.

### Folded Todos
*None — `gsd-tools todo match-phase 4` returned `todo_count: 0`.*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 4 requirements + success criteria
- `.planning/REQUIREMENTS.md` §Hero — HERO-01 (full-bleed hero: looping reel OR hero image + PLAY REEL CTA — Phase 4 picks the image branch per D-01), HERO-02 (name + tone-setting tagline above the fold), HERO-03 (PLAY REEL opens producer's reel in the watch view)
- `.planning/ROADMAP.md` §Phase 4: Reel-Led Home — goal, 4 success criteria, 2 seed plans (04-01 hero component, 04-02 home composition with featured grid)

### Project-wide context
- `.planning/PROJECT.md` Key Decisions table — audience = hiring producers/agencies (drives reel-first hierarchy + role-first "Filmmaker & Producer" tagline), Click-to-filter via routing (drives PLAY REEL → `/watch/[reelId]`, NOT modal)
- `.planning/PROJECT.md` Constraints — modern browsers only, static-export-friendly, **"Reel-led hero must feel instant; thumbnails should blur-up rather than pop-in"** (drives D-01 static-over-video; reused VideoCard already implements blur-up)
- `.planning/REQUIREMENTS.md` §Out of Scope — i18n (drives inline tagline copy, no strings file), hover autoplay (reinforces D-16 navigate-not-modal)

### Design language
- `_prep/02-references.md` §samhendi.com — **"Full-bleed hero image with overlay text ('SENIOR CREATIVE PRODUCER') + 'PLAY REEL' CTA"** is the verbatim primary visual precedent for the Phase 4 hero composition
- `_prep/02-references.md` §"Synthesis: applied to Michelle's portfolio" — "full-bleed motion (looping reel or hero video) + her name + a tagline. PLAY REEL CTA front-and-center" (Phase 4 picks the image branch of "or" per D-01)
- `_prep/05-decisions-needed.md` items **7 (featured flag)** + **11 (hero video)** — Phase 4 closes both. Item 7: `featured: boolean` schema field shipped in Phase 2 D-08/D-10, Phase 4 picks the 8 (D-23). Item 11: hero medium resolved as static image + PLAY REEL CTA (D-01).

### Source data + producer's reel
- `src/lib/data/videos.json` — Phase 4 flips `featured: true` on 8 chosen rows (currently all `false` per Phase 2 D-10). Schema already accepts the field.
- `src/lib/data/index.ts` — `producerReelId` (Vimeo `264677021`) + `videos` array; both consumed by `/+page.svelte`
- `src/lib/data/categories.ts` — used for D-23 cross-category sampler curation (PBS / Promos / Branded / Doc / Reel quotas)
- `src/lib/data/videos.ts` — `videos` and helpers; the home route imports through `$lib/data` (D-17)

### Prior phase context (carry-forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Svelte 5 runes (`$state`, `$props`, `$derived`), Tailwind v4 CSS-first config in `app.css`, adapter-static + `prerender = true` on every route (`/` prerenders fine, no `entries()`), `noindex` meta stays through Phase 6, `BASE_PATH` env var (every internal link uses `$app/paths` `base`), TS strict + `noUncheckedIndexedAccess`, pnpm@11.0.9 pinned-exact deps
- `.planning/phases/02-data-layer/02-CONTEXT.md` — `producerReelId` (D-09); `featured: boolean` schema field (D-08, D-10 — all rows false in v1, Phase 4 flips bits per D-24); reel video stays in the public grid AND the Reel filter (D-11) AND now ALSO the featured slice (D-23 Reel ×1 slot)
- `.planning/phases/03-grid-filter-watch/03-CONTEXT.md` — **VideoCard component contract** (D-10..D-20 carry forward — Phase 4 reuses verbatim with `eager={true}`), **grid layout** (D-21..D-23 + D-25 featured-first ordering), **eager-load on first 8** (D-17 — Phase 4 uses on all 8 featured), **dark mono base theme** (D-01..D-09 carries forward — hero adds bottom gradient + 100dvh, otherwise inherits), **TopNav layout** (D-39..D-43 — Phase 4 extends with scroll-aware transparent-on-`/` mode per D-13/D-14), **hover-prefetch on links** (D-14)

### Existing code (read before writing)
- `src/lib/components/VideoCard.svelte` — Phase 4 reuses verbatim with `eager={true}` on all 8 featured cards. **No new variant, no changes.**
- `src/lib/components/TopNav.svelte` — Phase 4 **extends** with scroll-aware mode on `/` (D-13/D-14). Existing sticky-at-all-breakpoints + active-state-via-`page` machinery stays intact.
- `src/lib/components/MobileMenu.svelte` — no changes; full-screen overlay behavior independent of hero transparency
- `src/lib/components/CategoryTag.svelte` — unchanged; rendered by VideoCard in the featured grid
- `src/routes/+layout.svelte` — no expected changes (TopNav owns the route-aware scroll listener internally per D-14)
- `src/routes/+page.svelte` — **replaced entirely** by Phase 4 hero + featured grid + View-All link
- `src/routes/work/+page.svelte` — **pattern source** for the featured grid markup Phase 4 mirrors (max-w-7xl container, 2/3/4 responsive grid, gap-2/gap-3, keyed each, eager threshold)
- `src/lib/data/index.ts` — single import path for `videos` + `producerReelId`
- `svelte.config.js` — `paths: { base: process.env.BASE_PATH ?? '' }`; every internal link MUST use `import { base } from '$app/paths'`. PLAY REEL CTA + "View All Work →" link MUST wrap through `base`.
- `src/app.css` — Tailwind theme + 8 category accents. **No new theme tokens needed** for Phase 4 unless planner picks an opinionated hero-overlay color token.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`VideoCard.svelte`** — the home featured grid uses it verbatim with `eager={true}` on all 8 cards. No new variant, no new props. The component already wraps `<a href={` + "`${base}/watch/${video.id}`" + `}>`, owns blur-up + hover state + focus ring, and carries `CategoryTag` internally.
- **`producerReelId` from `$lib/data`** — PLAY REEL CTA target. `import { producerReelId } from '$lib/data'`.
- **`videos` array + `featured` field** — Phase 4 filters with `videos.filter(v => v.featured)` after flipping 8 rows in `videos.json`. Filter preserves the `Video[]` type under `noUncheckedIndexedAccess`.
- **`TopNav.svelte`** — extended with scroll-aware-on-`/` behavior per D-13/D-14; NOT rewritten. Phase 3 D-39..D-43 machinery (sticky, wordmark, 8 categories, About/Press/Contact, hamburger, active state) stays intact.
- **`base` from `$app/paths`** — every internal link wraps through it: PLAY REEL → `${base}/watch/${producerReelId}`, "View All Work" → `${base}/work`, VideoCard's internal hrefs (already handled inside the component).
- **Phase 1 splash typography pattern** — `tracking-widest uppercase font-bold` is the inherited wordmark style; Phase 4 scales it up for the hero name.

### Established Patterns
- **Svelte 5 runes** — `/+page.svelte` is a thin composition; new HeroPoster (or inline) component uses `$props`, `$state` (mobile menu pattern from TopNav is the template). TopNav scroll-aware likely uses `$state` + `$effect` or a lifecycle hook to attach/detach the IntersectionObserver.
- **`adapter-static` + `prerender = true`** — `/` prerenders at build time. Featured filter (D-26) runs at module load, NOT at runtime. No `entries()` export needed for a static route. The poster image is bundled by Vite (D-03) and emitted into `build/_app/immutable/assets/`.
- **`noUncheckedIndexedAccess`** — `videos.filter(v => v.featured)` returns `Video[]`; safe to iterate without narrowing.
- **`BASE_PATH` env var** — `<a href={` + "`${base}/watch/${producerReelId}`" + `}>`, `<a href={` + "`${base}/work`" + `}>`. **Hardcoded `/watch/...` or `/work` will 404 on production GitHub Pages.**
- **Hover prefetch** — `data-sveltekit-preload-data="hover"` on PLAY REEL anchor (D-20) and View-All-Work link (D-28). Inherits Phase 3 D-14 pattern.
- **Dark mono chrome** — Phase 3 D-01..D-09 still applies. Hero adds bottom gradient over the poster but surrounding chrome (TopNav, featured grid, View-All link, body bg) remains `bg-neutral-950` / white text / per-category accents only.
- **Pinned-exact deps + pnpm@11** — no new deps expected for Phase 4. If planner adds something (e.g., a vite-imagetools plugin for hero asset optimization), pin exact per Phase 1 convention.

### Integration Points
- **`src/routes/+page.svelte`** — replaced entirely. New structure: `<HeroPoster>` (or inline composition with image + gradient + text + CTA + scroll cue) → `<section class="grid…">` featured grid → `<a href={` + "`${base}/work`" + `}>View All Work →</a>`. No `+page.ts` needed — featured filter at module load + `producerReelId` is a constant.
- **`src/lib/components/HeroPoster.svelte`** (recommended new component) — owns the hero image + gradient overlay + name + tagline + CTA + scroll cue. Keeps `+page.svelte` thin and testable. Alternative: inline in `+page.svelte` if planner prefers fewer components.
- **`src/lib/data/videos.json`** — 8 row edits: flip `"featured": true` on the chosen videos per D-23. Build's Zod validator already accepts the field (Phase 2 D-08); no schema or loader changes.
- **`src/lib/components/TopNav.svelte`** — extend with scroll-aware mode per D-13/D-14. Read `page.route.id` from `$app/state` (already used for active-state); only attach IntersectionObserver when route is `/`. Sentinel placed by HeroPoster (or `+page.svelte`) at the hero's bottom edge; TopNav observes it via `onMount` + cleanup. Encapsulated — `+layout.svelte` does NOT change.
- **`src/routes/+layout.svelte`** — no changes expected. TopNav owns the route-aware behavior internally.
- **Asset import** — `import heroPoster from '$lib/assets/hero-poster.jpg';` then `<img src={heroPoster} alt="" loading="eager" fetchpriority="high" />`. Vite handles fingerprinting + emitting to the build output. Folder `src/lib/assets/` is created in this phase (Phase 1 D-16 minimal-`src/lib/` rule — each phase creates its own folders).
- **GitHub Pages deploy workflow** (Phase 1) — already runs `pnpm install && pnpm build`. Phase 4 adds one new asset + replaces one route + edits `videos.json` rows + extends TopNav; no CI changes needed.

</code_context>

<specifics>
## Specific Ideas

- **Sam Hendi (`samhendi.com`) is the verbatim visual precedent** for the Phase 4 hero — full-bleed image + lower-left text composition + outlined PLAY REEL CTA. Phase 4 implements this pattern, swapped to dark-monochrome.
- **The "Filmmaker & Producer" tagline** is the role-first signal a hiring producer reads at first glance. Resists the temptation to be "clever" — sam-hendi-style portfolios reward clarity over poetry for the hiring audience.
- **Mobile uses `dvh` (dynamic viewport height)**, NOT static `vh` — Tailwind v4 ships `min-h-dvh` which avoids iOS Safari's URL-bar-induced CLS when the user scrolls.
- **The Producer's Reel (Vimeo `264677021`) plays three roles on the home page**:
  1. **Source of the hero poster image** (a striking still grabbed from the reel — D-02)
  2. **PLAY REEL CTA target** (navigates to `/watch/264677021` — D-16)
  3. **One of the 8 featured cards** in the Reel-category slot (D-23 Reel ×1)
  This is intentional — every interaction on the home reinforces the reel.
- **PBS American Portrait remains the flagship** — gets 2 of 8 featured slots (the most of any single category) and continues to be the first TopNav link. The dedicated `/pbs` landing in Phase 5 inherits this featured surfacing pattern naturally.
- **The featured filter happens at module load in `+page.svelte`**, not in the loader (`$lib/data` stays generic — exposing the full 56). Keeps the data surface untouched and the home route owns its curation logic.

</specifics>

<deferred>
## Deferred Ideas

### Considered but rejected for v1
- **Looping background video hero** — rejected for v1 due to perf (FOUND-03 sub-2s on 4G budget) + `prefers-reduced-motion` complexity. Revisit at Phase 7 polish if budget has headroom AND Michelle authors a short (~15–30s) curated muted loop she explicitly wants. Static poster is the v1 ceiling.
- **Hybrid poster→loop swap on idle** — same perf concern as full looping video; adds complexity (preload + reduced-motion handling) for marginal benefit over static.
- **Modal/lightbox PLAY REEL** — violates HERO-03 ("in the watch view") and loses deep-link URL + "More in Reel" rail for free.
- **Inline-expand PLAY REEL** (hero swaps to iframe in place) — most engineering overhead for least benefit; watch route would still need to exist for direct links.
- **6 featured cards** — asymmetric on desktop 4-col (2 in second row looks unfinished).
- **12 featured cards** — less curated; scroll commitment before the "View All Work" link.
- **All 56 videos with featured on top on `/`** — duplicates `/work` exactly; home loses curation.
- **Featured-only with NO "View All Work" link** — hostile to discovery for a portfolio about depth + breadth.
- **Featured grid section heading** ("Featured", "Selected Work", "Featured Work → View All inline") — hero scroll cue + the grid itself communicate intent.
- **Centered hero text composition** — splash-feeling, breaks the editorial cinematic feel; left-aligned won.
- **Bold non-uppercase wordmark on the hero** — breaks consistency with the splash + TopNav wordmark.
- **PBS-heavy featured composition** (4 PBS + 2 Promos + 2 Branded) — narrows the first-impression breadth; cross-category sampler won.
- **Client-name-heavy featured composition** — risks mixing strong + weak work just because a client logo is famous.
- **Solid white PLAY REEL button** — reads as "product CTA" not "film portfolio"; outlined won.
- **Text-link PLAY REEL (no button chrome)** — less discoverable as the primary action.

### Phase 7 polish work (deferred)
- **True LQIP base64 placeholder for the hero poster** — Phase 7 if FOUND-03 budget demands it.
- **`<picture>` with portrait crop for mobile** — Phase 7 if the wide poster looks awkward at 9:16; v1 ships single asset + `object-position` focal tuning.
- **`srcset` for retina hero poster** — Phase 7 perf polish.
- **AVIF format + multiple format fallbacks** — Phase 7 perf polish; v1 ships single `.jpg` or `.webp`.
- **OG / Twitter card preview image** — Phase 7 polish (Phase 1 D-12 already deferred OG metadata; Phase 6 `noindex` is still on).
- **Scroll-cue pulse animation** — defer until producers actually miss the scroll affordance.

### Out of scope
- **Custom hero still authored separately** (behind-the-scenes shot, branded composite, headshot on set) — could be authored later and dropped in; Phase 4 ships with a still from the reel itself.
- **`prefers-reduced-motion` handling** — N/A since the hero is static. Will matter if Phase 7 ever swaps to motion.
- **Light theme variant** — out of scope per Phase 3 D-01 (dark mono is the site default).
- **i18n / translated tagline** — out of scope per REQUIREMENTS §Out of Scope (English-only in v1).

### Reviewed Todos (not folded)
*None — `gsd-tools todo match-phase 4` returned `todo_count: 0`.*

</deferred>

---

*Phase: 04-reel-led-home*
*Context gathered: 2026-05-11*
