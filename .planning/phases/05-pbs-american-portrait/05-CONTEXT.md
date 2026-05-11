# Phase 5: PBS American Portrait - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship a dedicated `/pbs-american-portrait/` landing page that contextualizes the 18 PBS American Portrait videos as a unified project (distinct from the filter view at `/work/pbs-american-portrait/`), retarget the existing PBS TopNav link to the new landing, and add cross-links from the filter page and from `/watch/[id]` on PBS videos so users can discover the landing from every PBS surface.

In scope:
- New route: `src/routes/pbs-american-portrait/+page.svelte` + `+page.ts` (prerendered, static)
- h1 + subtitle + verbatim PBS blockquote + outbound link + h2 "Stories" + 2/3/4 grid of all 18 PBS videos
- Per-card "See on PBS →" badges that link to each video's PBS collection URL (extracted from description), rendered in the parent `<li>` below the `<VideoCard />`
- TopNav link retarget: PBS category link goes to `/pbs-american-portrait/` (only PBS special-cased)
- TopNav active-state extension: the PBS nav link highlights on BOTH `/pbs-american-portrait/` AND `/work/pbs-american-portrait/`
- Cross-link added on `/work/pbs-american-portrait/` (small inline link above grid, below the count heading) → `/pbs-american-portrait/`
- Cross-link added on `/watch/[id]` (PBS videos only, below the description) → `/pbs-american-portrait/`
- Planner fetches verbatim PBS description copy from pbs.org/american-portrait at plan time + surfaces it in PLAN.md for user approval before execution

Out of scope (other phases):
- Footer + footer-mirrored nav (NAV-02) — Phase 6 (PBS will be included in the mirrored nav via the same retargeted link)
- `/about`, `/press`, `/contact` real content — Phase 6
- Auto-linkify URLs in `/watch/[id]` descriptions globally — Phase 7 polish (Phase 5 only touches the inline `→ About the PBS American Portrait project` link for PBS videos)
- Perf budget < 2s on 4G + production cutover — Phase 7
- Hero image header on `/pbs-american-portrait/` — explicitly rejected (editorial minimal layout won)
- Themed sub-sections by collection (Pride / Veterans / Juneteenth / etc.) — rejected; themes mentioned in prose only
- Schema change for a `pbsOrder` curated-sort field — rejected; reuses Phase 3 D-25 default sort

</domain>

<decisions>
## Implementation Decisions

### URL & Discovery
- **D-01:** **Route is `/pbs-american-portrait/`** (trailing slash per Phase 3 inherited `trailingSlash: 'always'` from `src/routes/+layout.ts`). NOT `/pbs/` (short form rejected — chose explicit project name) and NOT `/projects/pbs-american-portrait/` (no parent /projects route in v1).
- **D-02:** **Retarget the existing PBS TopNav category link** from `/work/pbs-american-portrait/` → `/pbs-american-portrait/`. Special-cased for PBS only; the other 7 category nav links still point to `/work/[slug]/`. Phase 3 D-40 "category nav links go to /work/[slug]" is broken for PBS specifically — this is intentional and reflects PBS's flagship status.
- **D-03:** **TopNav active-state extension:** the PBS category nav link is highlighted on BOTH `/pbs-american-portrait/` AND `/work/pbs-american-portrait/`. Implementation: extend the existing `isActive(slug)` helper in `TopNav.svelte` so it returns true when the current `page.url.pathname` is either `${base}/pbs-american-portrait/` or `${base}/work/pbs-american-portrait/`. Phase 3 D-41 generalizes to: "active when the nav link target OR a known sibling surface of the same category is the current path."
- **D-04:** **Cross-link from `/work/pbs-american-portrait/` → landing:** small inline text link, placed immediately after the existing `<h1>PBS American Portrait (18)</h1>` heading and before the grid. Phase 3 D-08 inline-link style (body color, 1px underline on hover). Text: `→ About the PBS American Portrait project`. Does NOT use a callout/bordered block (visual restraint).
- **D-05:** **Cross-link from `/watch/[id]` → landing (PBS videos only):** small inline text link rendered below the description block (after Phase 3 D-35 item 5). Conditional on `video.category === 'PBS American Portrait'`. Same body-color + underline-on-hover treatment as D-04. Text: `→ About the PBS American Portrait project`.
- **D-06:** **`/work/pbs-american-portrait/` functionally unchanged.** The route still prerenders (entries() emits all 8 category slugs including `pbs-american-portrait`), still renders 18 cards in Phase 3 D-25 order, still uses the same VideoCard. PBS-03 parity preserved. The only delta is the cross-link added per D-04.
- **D-07:** **Footer cross-link deferred to Phase 6.** When Phase 6 ships the footer + mirrored nav (NAV-02), the mirrored category list inherits the D-02 retarget automatically — no Phase-5 work needed.

### Project Context Block
- **D-08:** **`<h1>PBS American Portrait</h1>` in PBS accent color.** Mirrors Phase 3 D-26 "/work/[category] heading uses that category's accent color" — uses `categoryAccent('PBS American Portrait')` helper from `$lib/components/categoryAccent`. PBS accent is `text-cat-pbs-american-portrait` (OKLCH L=0.72 C=0.21 per Phase 3 D-04 flagship bump).
- **D-09:** **Subtitle line `18 stories produced by Michelle Ngo`** placed BETWEEN the h1 and the PBS blockquote. Portfolio-forward — leads with Michelle's role before the project description (since the PBS verbatim copy won't mention her). Small, muted treatment: `text-sm md:text-base tracking-wide text-neutral-400 uppercase` (planner can tune within Phase 3 D-12 type-scale conventions).
- **D-10:** **Verbatim PBS description in a blockquote** with attribution. Treatment: `<blockquote>` element, slightly inset (e.g., `border-l-2 border-neutral-700 pl-4`) or styled per planner; attribution line below in muted xs: "Description from pbs.org/american-portrait". The exact text is fetched at plan time per D-11.
- **D-11:** **Planner fetches `pbs.org/american-portrait/` at plan time** (web fetch as part of research), normalizes the project description (single paragraph), and surfaces the exact paragraph verbatim in PLAN.md for user approval BEFORE execution. The approved text is then embedded inline in `src/routes/pbs-american-portrait/+page.svelte` (no separate strings file — i18n is Out of Scope).
- **D-12:** **One prominent outbound link after the blockquote:** `Visit pbs.org/american-portrait →`. Attributes: `target="_blank" rel="noopener"`. Treatment: same inline-link style as D-04 (body color, underline-on-hover) OR a slightly more prominent button per planner discretion. NOT a brightly-colored CTA (preserves Phase 3 D-02 monochrome chrome).
- **D-13:** **Themes (Pride / Veterans / Juneteenth / Indigenous / Disabilities / Labor / Racial Injustices / Lunar New Year / Christmas / Year in Review / ...) mentioned in prose only.** No chip row, no badge list, no themed sub-sections. The 18 cards' titles ("PBS American Portrait — Pride", "PBS American Portrait — Veterans", ...) communicate the breadth.

### Page Composition
- **D-14:** **Editorial minimal layout** — no hero image, no scroll-aware TopNav. Top-to-bottom DOM order:
  1. `<h1>` project name (PBS accent color)
  2. Subtitle line (D-09)
  3. PBS verbatim blockquote (D-10) + attribution
  4. Outbound link to pbs.org/american-portrait (D-12)
  5. `<h2>Stories</h2>` (D-16)
  6. `<ul>` 2/3/4 responsive grid (D-19)
- **D-15:** **Content container width: `max-w-7xl px-4 sm:px-6 lg:px-8`** (matches Phase 3 D-23 grid container width). Project context block also lives in this container — does NOT use a narrower editorial reading width (e.g., max-w-3xl). User override of the typical editorial-prose convention; rationale: visual cohesion with the grid below trumps line-length ergonomics for a paragraph this short.
- **D-16:** **Heading hierarchy:** `<h1>` project name (Phase 3 D-19 inheritance — exactly one h1 per page) + `<h2>Stories</h2>` above the grid. The h2 anchors the grid as a discrete content section beneath the context block. Does NOT include a count (`Stories (18)`) — the count is implied by the visible grid.
- **D-17:** **TopNav: solid `bg-neutral-950/95 backdrop-blur` from first paint.** Phase 4 D-13 scroll-aware-transparency contract stays scoped to `/` only — Phase 5 does NOT extend it. No new sentinel, no IntersectionObserver change in TopNav.svelte. The TopNav active-state logic IS extended per D-03, but visual styling is untouched.

### Grid & Per-Card Extras
- **D-18:** **Sort: Phase 3 D-25 default — featured-first then `published` date desc.** Reuses the exact comparator from `src/routes/work/[category]/+page.ts`:
  ```ts
  [...getByCategory('PBS American Portrait')].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  });
  ```
  Both PBS featured rows (D-23 PBS×2 from Phase 4) bubble to the top; the other 16 follow newest-first. Consistent with the rest of the site.
- **D-19:** **Grid markup mirrors `/work/[category]/+page.svelte` verbatim** — `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">`. Phase 3 D-21..D-23 carry forward.
- **D-20:** **VideoCard reused verbatim — NO variant, NO new prop.** Phase 3 D-13..D-20 component contract is untouched. Category tag stays visible (Phase 3 D-27 — even though redundant on a page that IS PBS). Eager-load on first 8 cards (Phase 3 D-17 — `eager={i < 8}`).
- **D-21:** **Per-card "See on PBS →" badges, rendered in the parent `<li>` BELOW the VideoCard** (NOT inside VideoCard, NOT via a new prop). The grid `<ul>` iterates:
  ```svelte
  {#each data.videos as video, i (video.id)}
    <li>
      <VideoCard {video} eager={i < 8} />
      {#if pbsCollectionUrl(video.description)}
        <a
          href={pbsCollectionUrl(video.description)}
          target="_blank"
          rel="noopener"
          class="..."
        >
          See on PBS →
        </a>
      {/if}
    </li>
  {/each}
  ```
  Helper `pbsCollectionUrl(description: string): string | null` lives in `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` (or similar — planner picks path). Extracts the first `https://www.pbs.org/american-portrait/collection/...` URL from the description string via regex. Returns `null` when not present. Badge renders only when non-null. The badge appears on `/pbs-american-portrait/` ONLY — NOT on `/work`, NOT on `/work/[category]`, NOT on `/watch` (since VideoCard is unchanged; the wrapping `<li>` markup is local to this route).
- **D-22:** **Card titles stay as-is** — do NOT strip the "PBS American Portrait — " prefix from titles on this page. Rationale: keeps VideoCard rendering identical across all surfaces (D-20 constraint) and avoids a title-transform that would diverge from the source `videos.json`.

### Claude's Discretion
- **Exact subtitle line typography** (font size / tracking / color shade) — within Phase 3 D-12 type-scale + D-02 monochrome constraints
- **Exact blockquote treatment** — bordered-left vs italicized vs muted-background; planner picks something restrained that doesn't shout
- **Exact outbound-link styling** — inline-link (D-04 style) vs subtle button-like treatment; planner picks based on visual weight needed
- **The regex used to extract `pbs.org/american-portrait/collection/...` URLs from descriptions** — recommend `/https?:\/\/(?:www\.)?pbs\.org\/american-portrait\/collection\/[^\s)]+/` with a `.replace(/[).,!?]+$/, '')` trim for trailing punctuation. Planner validates against all 18 PBS descriptions during research/plan.
- **Path of the `pbsCollectionUrl` helper** — `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` (route-local underscore prefix excludes it from SvelteKit route detection) vs `$lib/data/pbsCollectionUrl.ts` (shared lib if Phase 6 or beyond wants to reuse it). Recommend route-local since it's a one-off until proven otherwise.
- **Whether the "Stories" h2 includes count** — D-16 says no; if planner's eye disagrees once it sees the layout, count is a one-word change
- **Exact wording of the cross-link microcopy** ("→ About the PBS American Portrait project" vs "About this project →" vs "Read about the project →") — recommend the explicit-project-name form (D-04, D-05) for scan-clarity but planner can dial
- **Whether the `<blockquote>` carries a per-page accent border-color** (e.g., PBS accent on the left border) — could reinforce the page identity; planner picks, defaulting to neutral border for restraint

### Folded Todos
*None — `gsd-tools todo match-phase 5` returned `todo_count: 0`.*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 5 requirements + success criteria
- `.planning/REQUIREMENTS.md` §PBS American Portrait — PBS-01 (dedicated landing page), PBS-02 (18 videos + project context describing the initiative), PBS-03 (PBS reachable as a regular filterable category from `/work` — already satisfied in Phase 3, must remain so)
- `.planning/ROADMAP.md` §Phase 5: PBS American Portrait — goal, 4 success criteria, 2 seed plans (05-01 author landing copy/context, 05-02 build PBS route with context header + filtered grid; verify category filter parity)

### Project-wide context
- `.planning/PROJECT.md` Key Decisions table — **"PBS American Portrait gets dedicated page + category tag"** (this phase resolves it); audience = hiring producers/agencies (drives portfolio-forward subtitle "18 stories produced by Michelle Ngo" per D-09)
- `.planning/PROJECT.md` Constraints — modern browsers only, static-export-friendly (drives adapter-static prerender + base-path wrapping)
- `.planning/REQUIREMENTS.md` §Out of Scope — i18n (drives inline copy, no strings file per D-11), no analytics (no Plausible tracking on the page)

### Design language
- `_prep/02-references.md` §isotopefilms.com — editorial sectioned grid + status tags + readable footer (Phase 5 uses the editorial-minimal aesthetic over a hero-style header)
- `_prep/02-references.md` §yvonnerusso.com — first-class section treatment for non-grid content (PBS landing borrows the "first-class dedicated page" pattern; same precedent for Phase 6 /press)
- `_prep/04-categories.md` — "PBS American Portrait | 18 | Her flagship — possibly its own *featured* section, not just a category" — Phase 5 closes the "*featured* section" half of this open question; the category-tag half was closed in Phase 3

### Source data + helpers
- `src/lib/data/videos.json` — 18 PBS records (lines ~filter where `category: "PBS American Portrait"`); per-card collection URLs live inside the `description` strings (e.g., `https://www.pbs.org/american-portrait/collection/57/i-began-to-live-my-truth/`)
- `src/lib/data/index.ts` — `getByCategory(category: Category): Video[]`; landing route imports as `import { getByCategory } from '$lib/data'`
- `src/lib/data/categories.ts` — `categoryToSlug('PBS American Portrait') === 'pbs-american-portrait'` (used for D-02 retarget logic + D-03 active-state extension)
- `src/lib/components/VideoCard.svelte` — reused verbatim per D-20 (no changes)
- `src/lib/components/CategoryTag.svelte` — rendered by VideoCard (no changes)
- `src/lib/components/categoryAccent.ts` — `categoryAccent('PBS American Portrait') === 'text-cat-pbs-american-portrait'` (used for D-08 h1 color)
- `src/lib/components/TopNav.svelte` — extended per D-02 (link target) + D-03 (active-state logic). Existing scroll-aware code path (Phase 4 D-13/D-14) is NOT extended — stays scoped to `/`.

### Prior phase context (carry-forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — adapter-static + `prerender = true` (Phase 5 inherits via `src/routes/+layout.ts`); `BASE_PATH` env var (every internal link uses `$app/paths` `base`); `noUncheckedIndexedAccess` (so `getByCategory()` filtering keeps strict types); Phase 1 D-11 noindex robots meta on every route (stays through Phase 6); pnpm@11.0.9 pinned-exact deps
- `.planning/phases/02-data-layer/02-CONTEXT.md` — data contract: `getByCategory(category)` returns `Video[]` (D-09 `$lib/data` surface); `Video` type carries `description: string` (Phase 2 D-08 — description is required, not optional, so per-card PBS URL extraction can run unconditionally on every PBS record)
- `.planning/phases/03-grid-filter-watch/03-CONTEXT.md` — **the entire Phase 3 contract is the foundation Phase 5 sits on**:
  - **VideoCard** (D-13..D-20) — reused verbatim per D-20
  - **Grid layout** (D-21..D-23) — mirrored verbatim per D-19
  - **D-25 featured-first then date-desc sort** — reused verbatim per D-18
  - **D-26 accent-colored heading on category pages** — Phase 5 D-08 inherits the pattern (PBS accent on h1)
  - **D-27 category tag stays on cards on /work/[category]** — Phase 5 inherits (D-20: redundant-but-consistent)
  - **D-30 `/work/[category]` load with slug narrowing + 404** — `/work/pbs-american-portrait/` keeps this exact load path; Phase 5 only adds a cross-link to the existing route
  - **D-35 watch metadata order** — Phase 5 D-05 inserts a new conditional element BELOW item 5 (description) on PBS videos only
  - **D-39 top nav in `+layout.svelte`** — Phase 5 modifies `TopNav.svelte` only; layout stays unchanged
  - **D-40 category nav link target convention** — broken specifically for PBS per Phase 5 D-02 (the only exception)
  - **D-41 active-state via path match** — extended per Phase 5 D-03 to recognize both `/pbs-american-portrait/` AND `/work/pbs-american-portrait/` as "PBS-active" surfaces
  - **D-43 placeholder routes for /about, /press, /contact** — Phase 5 does NOT replace these (Phase 6 territory)
- `.planning/phases/04-reel-led-home/04-CONTEXT.md` — **D-13 scroll-aware-on-`/`-ONLY contract preserved** per Phase 5 D-17; **D-23 PBS×2 featured slice** already bubbles two PBS videos to the top of the Phase 5 grid via D-18 inherited sort

### External web fetch (planner does this)
- `https://www.pbs.org/american-portrait/` — source of the verbatim project description copy (D-11). Planner fetches at plan time, normalizes to a single paragraph, surfaces in PLAN.md for user approval before execution. If the page structure has shifted or the description is no longer easily extractable, planner flags as a checkpoint (user-gated content decision).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`getByCategory('PBS American Portrait')` from `$lib/data`** — returns the 18 PBS records as `Video[]`. Load function calls this + applies Phase 3 D-25 sort.
- **`VideoCard.svelte`** — reused verbatim (D-20). The page passes `eager={i < 8}` (first 8 cards above the fold). No new variant.
- **`categoryAccent('PBS American Portrait')`** — returns `text-cat-pbs-american-portrait` (Tailwind utility class). Applied to the h1 per D-08.
- **`TopNav.svelte`** — extended per D-02 (link href change) + D-03 (active-state predicate change). Existing sticky + scroll-aware-on-`/` machinery stays intact.
- **`base` from `$app/paths`** — every internal link wraps through it. PBS nav link: `${base}/pbs-american-portrait/`. Cross-links from /work/pbs-american-portrait + /watch/[id]: same pattern.
- **Phase 3 `/work/[category]/+page.svelte` markup** — pattern source for the grid composition. Phase 5 mirrors the grid block verbatim but adds the `<li>`-level PBS badge.

### Established Patterns
- **Svelte 5 runes** — `let { data }: { data: PageData } = $props()` in `+page.svelte`; `$derived` for any data transforms (none expected for v1)
- **`adapter-static` + `prerender = true`** — `/pbs-american-portrait/` prerenders at build time. Single static route (no `[param]`), so no `entries()` export needed. Load function runs at module load — featured/date sort happens once during build.
- **`noUncheckedIndexedAccess`** — `getByCategory()` returns `Video[]` (typed safe to iterate without narrowing).
- **`BASE_PATH` env var** — production GitHub Pages serves from `/<repo>/`. Hardcoded `/pbs-american-portrait/` will 404 on production; every internal link goes through `${base}/pbs-american-portrait/`.
- **Pinned-exact deps + pnpm@11** — no new deps expected for Phase 5 (regex is stdlib; no library imports beyond `$lib/data` + `$app/paths`).
- **Vitest workspace (Phase 3)** — node project (data tests) + ui project (component + route tests with jsdom). Phase 5's new route test goes in the ui project; D-21 helper test (URL extraction) goes in node project.
- **Trailing-slash routing** (`src/routes/+layout.ts` `trailingSlash = 'always'`) — `/pbs-american-portrait/` resolves to `build/pbs-american-portrait/index.html`. All internal links MUST include the trailing slash.

### Integration Points
- **`src/routes/pbs-american-portrait/+page.svelte`** (NEW) — h1 + subtitle + blockquote + outbound + h2 "Stories" + grid + per-card PBS badges
- **`src/routes/pbs-american-portrait/+page.ts`** (NEW) — load function: `getByCategory('PBS American Portrait')` + Phase 3 D-25 sort; returns `{ videos }`; no params, no `entries()`, no `error()` call needed
- **`src/routes/pbs-american-portrait/_pbsCollectionUrl.ts`** (NEW, route-local underscore-prefixed) — `pbsCollectionUrl(description: string): string | null` regex extractor for per-card PBS badge URLs
- **`src/routes/pbs-american-portrait/page.test.ts`** (NEW) — route test: renders 18 cards, h1 + accent class, subtitle, blockquote, outbound link, h2, per-card badge rendered when URL extractable (and absent when not, if any PBS row lacks a collection URL)
- **`src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts`** (NEW) — extractor unit tests: 18 real-data extractions, edge cases (trailing punctuation, missing URL, multiple URLs)
- **`src/lib/components/TopNav.svelte`** — modified per D-02 (PBS category link href) + D-03 (active-state predicate covers both PBS surfaces); TopNav.test.ts gains assertions for new href + active-state on `/pbs-american-portrait/`
- **`src/routes/work/[category]/+page.svelte`** — modified per D-04: insert a small inline `→ About the PBS American Portrait project` link conditionally (only when `data.category === 'PBS American Portrait'`); category route's existing tests gain a PBS-only cross-link assertion
- **`src/routes/watch/[id]/+page.svelte`** — modified per D-05: insert a small inline `→ About the PBS American Portrait project` link below the description block, conditional on `data.video.category === 'PBS American Portrait'`; watch route's existing tests gain a PBS-only cross-link assertion (for at least one PBS video) + a negative assertion (link absent on non-PBS video)
- **`scripts/test-prerender-coverage.mjs`** — Phase 3 thresholds (≥1 work + ≥8 work/<slug> + ≥56 watch/<id>) grow by one prerendered route: ≥1 `build/pbs-american-portrait/index.html`. Update the threshold check (or generalize) to keep the script meaningful.
- **GitHub Pages deploy workflow** (Phase 1) — no CI changes needed; the new prerendered HTML file drops into `build/pbs-american-portrait/` automatically.

</code_context>

<specifics>
## Specific Ideas

- **PBS American Portrait is THE flagship.** 18 of 56 videos, biggest single client, only project getting dedicated-page treatment in v1. The retarget of the existing TopNav category link (D-02) reflects this — PBS gets first-class destination status; the other 7 categories stay as filter-only.
- **Portfolio-forward credit ordering.** Subtitle "18 stories produced by Michelle Ngo" sits ABOVE the verbatim PBS blockquote (D-09) because hiring producers cold-skimming need to register her role before the project description. PBS's own copy won't credit her.
- **The PBS collection URLs are already in the data.** Every PBS video's description ends with `See [the/their] full [collection/stories] at https://www.pbs.org/american-portrait/collection/<id>/<slug>/`. Phase 5 surfaces these as per-card badges via regex extraction (D-21) — zero new data authoring.
- **Editorial minimal beats hero-style for this page.** The Phase 4 hero already owns the cinematic-still-with-overlay treatment for `/`. Reusing that pattern on `/pbs-american-portrait/` would dilute the home hero. Editorial minimal lets the page sit between `/work/[category]` (which it shares grid markup with) and `/` (which owns the cinematic moment).
- **The TopNav active-state logic generalizes.** Phase 3 D-41 said "active = path match". Phase 5 D-03 generalizes to "active = path match OR known-sibling-surface match for the same category." Future phases (e.g., a `/projects/` parent for a Phase 8+ second flagship project) could extend this further.
- **Per-card PBS badges are render-only.** No data-shape change. No new field in `videos.json`. The URL extraction is pure-function over the existing `description: string`, deferred to a route-local helper so the lib stays untouched.

</specifics>

<deferred>
## Deferred Ideas

### Considered but rejected for v1
- **Short URL `/pbs/`** — explicit `/pbs-american-portrait/` won. Rationale: explicit project name reads better in URL history + SEO.
- **`/projects/pbs-american-portrait/` under a /projects parent** — rejected. No other projects exist in v1; empty parent.
- **Hero-style image header** — rejected. Would compete with the Phase 4 `/` hero and dilute the cinematic moment. Editorial minimal won.
- **Sectioned editorial by themed collections** (Pride / Veterans / Juneteenth / etc. as sub-h2 groups) — rejected. Each PBS video has one themed collection but no metadata field for it; extracting from titles via regex would add engineering work for marginal benefit. Themes mentioned in prose only per D-13.
- **Themed chips / badge row** — rejected. Implies filterability the page doesn't offer.
- **Two PBS nav links** (existing filter + new landing) — rejected. Visual noise + label ambiguity. Retarget existing link instead (D-02).
- **Redirect `/work/pbs-american-portrait/` to `/pbs-american-portrait/`** — rejected. Breaks PBS-03 literal interpretation; one of eight /work/[category] routes silently behaving differently is a footgun.
- **Schema field `pbsOrder: number` for hand-curated sort** — rejected as overkill for v1. Phase 3 D-25 default sort suffices.
- **Hide category tag on /pbs-american-portrait cards (whole-page is PBS)** — rejected per D-20 (VideoCard stays verbatim). Visual redundancy accepted in exchange for component-contract stability.
- **Strip "PBS American Portrait — " prefix from card titles on this page** — rejected per D-22 (no title transform). Source-of-truth videos.json titles render uniformly across surfaces.
- **Two-paragraph context block (PBS verbatim + Michelle's POV)** — rejected. Requires Michelle to author the second paragraph, blocks shipping. Single PBS blockquote + portfolio subtitle is sufficient.
- **Auto-linkify URLs in /watch/[id] descriptions globally** — deferred to Phase 7 polish. Phase 5 only adds the single inline cross-link per D-05.
- **Above-grid callout block for cross-link** — rejected per D-04. Inline link won (less visual weight on a grid-first page).
- **Extending TopNav scroll-aware transparency to /pbs-american-portrait** — rejected per D-17. Phase 4 D-13 contract preserved.
- **Section heading "Stories (18)" with count** — rejected per D-16. Count implied by visible grid.
- **The h2 "Stories" or a different label** — "Stories" picked (matches PBS American Portrait's own "Americans share their stories" framing).

### Phase 6+ work (deferred)
- **Footer + footer-mirrored nav (NAV-02) including the retargeted PBS link** — Phase 6.
- **`/about`, `/press`, `/contact` real content** — Phase 6.
- **Auto-linkify URLs globally in /watch descriptions** — Phase 7 polish.
- **`<picture>` + AVIF + retina srcset for thumbnails on /pbs-american-portrait/** — Phase 7 perf polish.
- **Schema-level `pbsCollectionUrl` field if extraction becomes brittle** — defer until regex extraction fails on a future PBS data update.

### Out of scope
- **A `/pbs-american-portrait/[collection]/` sub-route per themed collection** — out of scope. The site is portfolio-first, not a PBS browse-by-theme replica.
- **Search or filter within the 18 PBS videos** — out of scope (DISC-01 v2 territory).
- **Per-collection thumbnails or themed gallery on the landing** — out of scope.
- **i18n / translated PBS description** — out of scope per REQUIREMENTS §Out of Scope.

### Reviewed Todos (not folded)
*None — `gsd-tools todo match-phase 5` returned `todo_count: 0`. No deferred review entries.*

</deferred>

---

*Phase: 05-pbs-american-portrait*
*Context gathered: 2026-05-11*
