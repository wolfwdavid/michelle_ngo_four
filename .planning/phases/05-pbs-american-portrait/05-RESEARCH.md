# Phase 5: PBS American Portrait — Research

**Researched:** 2026-05-11
**Domain:** SvelteKit 2.59 static route + content-led landing page on top of a locked Phase 3 grid contract
**Confidence:** HIGH

## Summary

Phase 5 is an additive, low-risk phase. Every primitive needed to build `/pbs-american-portrait/` already exists and is locked by Phase 3: `getByCategory`, `VideoCard`, `categoryAccent`, `slugToCategory`, the 2/3/4 grid markup, the D-25 featured-first-then-date-desc sort, `adapter-static`, `trailingSlash = 'always'`, the `$app/paths` `base` prefix, and the `$app/state` reactive page rune. The novel work is small and concentrated in five edits: one new parameterless prerendered route, one route-local URL-extraction helper, a TopNav href + active-state extension, and two single-line cross-link inserts on existing routes.

The genuine open questions live in three places: (1) the exact verbatim PBS copy that goes in the blockquote (D-11 explicitly defers this to a planner-fetch + user approval gate, and the WebFetch + WebSearch results in this research return multiple candidate paragraphs — the planner must surface them all and let the user pick); (2) the regex extractor that turns each PBS video's `description` into a per-card "See on PBS →" badge URL (15 of 18 descriptions have one; 3 do not, so the badge must be conditional); and (3) one Phase 3 carry-forward bug-or-not call in TopNav: `isActive(slug)` uses `endsWith` on the pathname, which means the planner's D-03 extension cannot simply do `endsWith('/pbs-american-portrait')` because that string would also match `/work/pbs-american-portrait` — the path-shape match has to disambiguate. A clean two-branch predicate handles it.

**Primary recommendation:** Author exactly the file set in the §Integration Points table of CONTEXT.md — no more, no less. Mirror `/work/[category]/+page.svelte` verbatim for the grid block, copy the D-25 sort from `/work/[category]/+page.ts` verbatim, and route-local-underscore-prefix the `_pbsCollectionUrl.ts` helper so it stays out of `$lib` until a second caller appears. For the verbatim PBS copy, the planner MUST fetch it at plan time, surface the 3-4 candidate paragraphs from this RESEARCH §State of the Art table in PLAN.md, and gate execution on user pick. Do NOT proceed past planning with placeholder copy.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**URL & Discovery:**
- **D-01:** Route is `/pbs-american-portrait/` (trailing slash). NOT `/pbs/`, NOT `/projects/pbs-american-portrait/`.
- **D-02:** Retarget the existing PBS TopNav category link from `/work/pbs-american-portrait/` → `/pbs-american-portrait/`. Special-cased for PBS only; the other 7 category nav links still point to `/work/[slug]/`.
- **D-03:** TopNav active-state extension: the PBS category nav link is highlighted on BOTH `/pbs-american-portrait/` AND `/work/pbs-american-portrait/`. Extend the existing `isActive(slug)` helper so it returns true when `page.url.pathname` is either path.
- **D-04:** Cross-link from `/work/pbs-american-portrait/` → landing: small inline text link, placed immediately after the existing `<h1>PBS American Portrait (18)</h1>` heading and before the grid. Body color, 1px underline on hover. Text: `→ About the PBS American Portrait project`. NO callout/bordered block.
- **D-05:** Cross-link from `/watch/[id]` → landing (PBS videos only): small inline text link rendered below the description block, conditional on `video.category === 'PBS American Portrait'`. Same body-color + underline-on-hover. Text: `→ About the PBS American Portrait project`.
- **D-06:** `/work/pbs-american-portrait/` functionally unchanged — still prerenders, still renders 18 cards in D-25 order, still uses the same VideoCard. PBS-03 parity preserved. Only delta: the cross-link from D-04.
- **D-07:** Footer cross-link deferred to Phase 6 (NAV-02).

**Project Context Block:**
- **D-08:** `<h1>PBS American Portrait</h1>` in PBS accent color via `categoryAccent('PBS American Portrait')`.
- **D-09:** Subtitle line `18 stories produced by Michelle Ngo` placed BETWEEN the h1 and the PBS blockquote. Small, muted: `text-sm md:text-base tracking-wide text-neutral-400 uppercase` (planner can tune within Phase 3 type-scale).
- **D-10:** Verbatim PBS description in a `<blockquote>` with attribution. Treatment: bordered-left or styled per planner; attribution line below in muted xs: "Description from pbs.org/american-portrait".
- **D-11:** Planner fetches `pbs.org/american-portrait/` at plan time, normalizes the project description (single paragraph), and surfaces the exact paragraph verbatim in PLAN.md for user approval BEFORE execution. The approved text is embedded inline in `+page.svelte` (no separate strings file — i18n is OOS).
- **D-12:** One prominent outbound link after the blockquote: `Visit pbs.org/american-portrait →`. `target="_blank" rel="noopener"`. Inline-link style or slightly more prominent button per planner. NOT a brightly-colored CTA.
- **D-13:** Themes (Pride / Veterans / Juneteenth / etc.) mentioned in prose only. No chip row, no badge list, no themed sub-sections.

**Page Composition:**
- **D-14:** Editorial minimal layout — no hero image, no scroll-aware TopNav. Top-to-bottom DOM order:
  1. `<h1>` project name (PBS accent color)
  2. Subtitle line (D-09)
  3. PBS verbatim blockquote (D-10) + attribution
  4. Outbound link to pbs.org/american-portrait (D-12)
  5. `<h2>Stories</h2>` (D-16)
  6. `<ul>` 2/3/4 responsive grid (D-19)
- **D-15:** Content container width: `max-w-7xl px-4 sm:px-6 lg:px-8` (matches Phase 3 D-23). Project context block also lives in this container — does NOT use a narrower editorial reading width.
- **D-16:** Heading hierarchy: `<h1>` project name + `<h2>Stories</h2>` above the grid. Does NOT include a count (`Stories (18)`).
- **D-17:** TopNav: solid `bg-neutral-950/95 backdrop-blur` from first paint. Phase 4 D-13 scroll-aware-transparency stays scoped to `/` only. TopNav active-state logic IS extended per D-03; visual styling is untouched.

**Grid & Per-Card Extras:**
- **D-18:** Sort = Phase 3 D-25 default — featured-first then `published` date desc. Reuses the exact comparator from `/work/[category]/+page.ts`.
- **D-19:** Grid markup mirrors `/work/[category]/+page.svelte` verbatim: `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">`.
- **D-20:** VideoCard reused verbatim — NO variant, NO new prop. Category tag stays visible. Eager-load on first 8 cards.
- **D-21:** Per-card "See on PBS →" badges, rendered in the parent `<li>` BELOW the VideoCard (NOT inside VideoCard, NOT via a new prop). Helper `pbsCollectionUrl(description)` extracts the first matching URL via regex. Returns `null` when not present. Badge renders only when non-null. Appears on `/pbs-american-portrait/` ONLY.
- **D-22:** Card titles stay as-is — do NOT strip the "PBS American Portrait — " prefix.

### Claude's Discretion

- Exact subtitle line typography (font size / tracking / color shade) — within Phase 3 D-12 type-scale + D-02 monochrome constraints
- Exact blockquote treatment — bordered-left vs italicized vs muted-background
- Exact outbound-link styling — inline-link (D-04 style) vs subtle button-like treatment
- The regex used to extract `pbs.org/american-portrait/collection/...` URLs. Recommend `/https?:\/\/(?:www\.)?pbs\.org\/american-portrait\/collection\/[^\s)]+/` with `.replace(/[).,!?]+$/, '')` trim. Planner validates against all 18 PBS descriptions.
- Path of the `pbsCollectionUrl` helper — recommend `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` (route-local) over `$lib/data/pbsCollectionUrl.ts` (shared)
- Whether the "Stories" h2 includes count — D-16 says no
- Exact cross-link microcopy — recommend "→ About the PBS American Portrait project"
- Whether the `<blockquote>` carries a per-page accent border-color — could reinforce page identity; default to neutral border

### Deferred Ideas (OUT OF SCOPE)

**Considered but rejected for v1:**
- Short URL `/pbs/`
- `/projects/pbs-american-portrait/` parent
- Hero-style image header on `/pbs-american-portrait/`
- Sectioned editorial by themed collections
- Themed chips / badge row
- Two PBS nav links (existing filter + new landing)
- Redirect `/work/pbs-american-portrait/` to `/pbs-american-portrait/`
- Schema field `pbsOrder: number` for hand-curated sort
- Hide category tag on `/pbs-american-portrait` cards
- Strip "PBS American Portrait — " prefix from card titles
- Two-paragraph context block (PBS verbatim + Michelle's POV)
- Auto-linkify URLs in /watch/[id] descriptions globally → Phase 7 polish
- Above-grid callout block for cross-link
- Extending TopNav scroll-aware transparency to `/pbs-american-portrait`
- Section heading "Stories (18)" with count

**Phase 6+ work:**
- Footer + footer-mirrored nav (NAV-02) including the retargeted PBS link → Phase 6
- `/about`, `/press`, `/contact` real content → Phase 6
- Auto-linkify URLs globally in /watch descriptions → Phase 7 polish
- `<picture>` + AVIF + retina srcset for thumbnails → Phase 7 perf polish
- Schema-level `pbsCollectionUrl` field if extraction becomes brittle

**Out of scope:**
- A `/pbs-american-portrait/[collection]/` sub-route per themed collection
- Search or filter within the 18 PBS videos
- Per-collection thumbnails or themed gallery on the landing
- i18n / translated PBS description

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PBS-01 | User can navigate to a dedicated PBS American Portrait landing page | §Architecture Patterns Pattern 1 (parameterless prerendered route); §Code Examples 1 (`+page.ts` / `+page.svelte` skeletons); §Standard Stack (already-installed `adapter-static`, no new deps); §D-02 retarget of TopNav PBS category link makes the page reachable from every route's nav |
| PBS-02 | PBS page displays the 18 PBS videos with project context describing the PBS American Portrait initiative | §Code Examples 2 (`getByCategory('PBS American Portrait')` + D-25 sort returns exactly the 18 records); §State of the Art (4 verbatim PBS copy candidates for the user-approval gate at D-11); §Code Examples 3 (full editorial layout DOM); §D-08..D-13 context-block decisions |
| PBS-03 | PBS is also reachable as a regular filterable category from `/work` | §Architecture Patterns Anti-pattern 1 (do NOT redirect `/work/pbs-american-portrait/`); §Code Examples 4 (D-04 cross-link insert that preserves the route's primary function); §Common Pitfalls Pitfall 2 (TopNav D-02 retarget DOES NOT break PBS-03 — `/work/pbs-american-portrait/` stays prerendered and still appears in `entries()`); existing tests in `src/routes/work/[category]/page.test.ts` continue to pass unmodified for the PBS slug |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @sveltejs/kit | 2.59.1 | App framework + router + prerenderer | Phase 1 locked; Phase 5 adds one parameterless static route under it |
| svelte | 5.55.5 | Component runtime + runes ($state, $derived, $props, $effect) | Phase 1 locked; Svelte 5 runes are the project idiom (see TopNav.svelte) |
| @sveltejs/adapter-static | 3.0.10 | Static HTML output (one `index.html` per prerendered route) | Phase 1 locked; emits `build/pbs-american-portrait/index.html` when `prerender = true` inherits from `+layout.ts` |
| tailwindcss | 4.3.0 | Utility-first styling | Phase 1 locked; v4 scanner reads literal class names — all classes in this phase are literal (no template-string concatenation) |
| @tailwindcss/vite | 4.3.0 | Tailwind v4 Vite plugin | Phase 1 locked; reads `src/app.css` `@theme` block including PBS accent variable |
| typescript | 5.9.3 | Type checking under `strict + noUncheckedIndexedAccess` | Phase 1 locked; `getByCategory('PBS American Portrait')` returns `readonly Video[]` (already typed-safe; no narrowing needed) |
| vitest | 4.1.5 | Test runner with two-project split (data=node, ui=jsdom) | Phase 3 locked; PBS landing route test goes in `ui` project; `_pbsCollectionUrl.test.ts` goes in `ui` project too (route-local file under `src/routes/**`, which only `ui` includes per `vite.config.ts`) |
| zod | 4.4.3 | Schema validation at build + module load | Phase 2 locked; not touched in Phase 5 (description is already required `string` per Phase 2 D-08) |

**Version verification:** Verified `svelte@5.55.5` against `pnpm view svelte version` (returns `5.55.5` — currently in sync). The deps for Phase 5 are zero-new; everything listed above is already installed and pinned-exact in `package.json`.

### Supporting (already installed — zero new deps)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sveltejs/vite-plugin-svelte | 7.1.2 | Svelte compiler hook for Vite | Already wired in `vite.config.ts` — no Phase 5 change |
| svelte-check | 4.4.6 | Type-check `.svelte` + `.ts` against the project's tsconfig | Run via `pnpm check`; gate before merge |
| jsdom | 29.1.1 | DOM environment for `ui` Vitest project | Hosts the `mount(Page, ...)` in the new route test |
| eslint + eslint-plugin-svelte | 9.39.4 / 3.17.1 | Lint pass — includes `svelte/no-navigation-without-resolve` (must be disabled file-level for the new `+page.svelte`, same pattern as VideoCard/TopNav/watch route) | Run via `pnpm lint`; gate before merge |

### Alternatives Considered (and rejected — locked by upstream phases)
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static prerender at build time | `+page.server.ts` with on-demand SSR | Rejected: violates Phase 1 D-05 (static-only output for Cloudflare Pages); no Node runtime at deploy target |
| Route-local `_pbsCollectionUrl.ts` | `$lib/data/pbsCollectionUrl.ts` (shared lib) | Defer to second caller (YAGNI); a one-off regex doesn't belong in `$lib` until proven reusable. Route-local file with underscore prefix is excluded from SvelteKit's route detection (SvelteKit ignores `_*` files in `routes/`). |
| Embed copy inline | Separate `src/lib/data/pbs-copy.ts` or `pbs-copy.md` | Rejected per D-11: i18n is OOS; single-source-of-truth `+page.svelte` keeps PR diff one file |

**Installation:**
None — Phase 5 ships zero new dependencies. The entire phase uses primitives already locked through Phases 1-4.

## Architecture Patterns

### Recommended File Structure
```
src/
├── routes/
│   ├── pbs-american-portrait/                ← NEW directory
│   │   ├── +page.svelte                      ← NEW: landing layout (h1 + subtitle + blockquote + outbound + h2 + grid)
│   │   ├── +page.ts                          ← NEW: load() returns sorted 18 PBS videos
│   │   ├── page.test.ts                      ← NEW: route test (load + render assertions)
│   │   ├── _pbsCollectionUrl.ts              ← NEW: URL-extraction helper (route-local; underscore = ignored by router)
│   │   └── _pbsCollectionUrl.test.ts         ← NEW: 18-record extraction unit tests
│   ├── work/[category]/+page.svelte          ← MODIFIED: insert D-04 cross-link conditionally
│   ├── work/[category]/page.test.ts          ← MODIFIED: gain PBS-only cross-link assertion
│   ├── watch/[id]/+page.svelte               ← MODIFIED: insert D-05 cross-link conditionally
│   └── watch/[id]/page.test.ts               ← MODIFIED: gain PBS-only cross-link assertion + negative on non-PBS
├── lib/components/
│   ├── TopNav.svelte                         ← MODIFIED: D-02 href retarget + D-03 isActive() extension
│   └── TopNav.test.ts                        ← MODIFIED: new PBS link href + active-state on /pbs-american-portrait/
└── scripts/test-prerender-coverage.mjs       ← MODIFIED: add ≥1 build/pbs-american-portrait/index.html assertion
```

### Pattern 1: Parameterless Prerendered Route (Phase 1 + Phase 3 carry-forward)
**What:** A `+page.ts` + `+page.svelte` pair at a flat path. `prerender = true` is inherited from `src/routes/+layout.ts`; `trailingSlash = 'always'` is also inherited there. No `entries()` export is needed because the route has no `[param]`. Build emits exactly `build/pbs-american-portrait/index.html`.

**When to use:** Any flat, static, single-instance route. (Contrast with `/work/[category]/` which DOES need `entries()` because it parameterizes 8 slugs.)

**Example (from `src/routes/+page.ts` — verbatim shape):**
```ts
// Source: src/routes/+page.ts (Phase 4)
import type { PageLoad } from './$types';
import { videos } from '$lib/data';

export const load: PageLoad = () => ({
  videos: videos
    .filter((v) => v.featured)
    .toSorted((a, b) => b.published.localeCompare(a.published)),
});
```

Phase 5 mirrors this exactly, swapping `filter(featured)` for `filter(category === 'PBS American Portrait')` and adding the featured-first sort branch.

### Pattern 2: Spread-Then-Sort over `readonly Video[]`
**What:** `videos` and `getByCategory()` return `readonly Video[]`. `.toSorted()` is non-mutating and returns a fresh array, but it's typed `T[]` (non-readonly), which a page-data consumer can iterate. The verbatim Phase 3 idiom is `[...getByCategory(cat)].toSorted(...)` — the spread is defensive (against any future swap to a mutating `.sort()`).

**When to use:** Whenever loading a sorted slice for a page. Used in `/+page.ts`, `/work/+page.ts`, `/work/[category]/+page.ts`. Phase 5 inherits.

**Example (D-25 comparator, verbatim from `src/routes/work/[category]/+page.ts`):**
```ts
// Source: src/routes/work/[category]/+page.ts (Phase 3 D-25)
const filtered = [...getByCategory(category)].toSorted((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return b.published.localeCompare(a.published);
});
```

### Pattern 3: Base-Path-Safe Internal Links
**What:** Every internal link uses `${base}/path` from `$app/paths`. Phase 1 BASE_PATH wiring means GitHub Pages serves the site at a sub-path in some deploy modes — never hardcode `/pbs-american-portrait/`.

**Example (TopNav.svelte, lines 126):**
```svelte
<a href={`${base}/work/${slug}`} data-sveltekit-preload-data="hover" ...>
```

For Phase 5, the retargeted PBS link becomes `${base}/pbs-american-portrait/` (note trailing slash — required because `trailingSlash = 'always'`).

### Pattern 4: Conditional Cross-Link in an Existing Route
**What:** Add a small inline `{#if video.category === 'PBS American Portrait'} ... {/if}` block to insert a cross-link. Zero state, zero new prop, zero new component.

**Example (D-04 insert in `/work/[category]/+page.svelte` — recommended shape):**
```svelte
<h1 class="text-2xl md:text-3xl ...">
  {data.category} ({data.videos.length})
</h1>
{#if data.category === 'PBS American Portrait'}
  <p class="mb-4 text-sm text-neutral-400">
    <a href={`${base}/pbs-american-portrait/`} class="hover:underline">
      → About the PBS American Portrait project
    </a>
  </p>
{/if}
<ul class="grid grid-cols-2 ...">...</ul>
```

### Pattern 5: TopNav Active-State Two-Branch Predicate (D-03 extension)
**What:** The existing `isActive(slug)` in TopNav.svelte ends with `endsWith(\`/work/${slug}\`)`. Phase 5 D-03 needs PBS active-state to also fire on `/pbs-american-portrait/`. A naive `|| endsWith('/pbs-american-portrait')` works because the existing branch `/work/pbs-american-portrait` is suffix-disjoint from the leading-slash-prefixed `/pbs-american-portrait` pattern (the path begins with `/pbs-...` not `/work/pbs-...`). Recommended shape:

```ts
function isActive(slug: string): boolean {
  const normalized = page.url.pathname.replace(/\/$/, '');
  if (normalized.endsWith(`/work/${slug}`)) return true;
  // Phase 5 D-03: PBS gets a flagship landing surface that also counts as "active"
  if (slug === 'pbs-american-portrait' && normalized.endsWith('/pbs-american-portrait')) {
    return true;
  }
  return false;
}
```

**Why the `slug === 'pbs-american-portrait'` guard:** Without it, `isActive('reel')` on `/pbs-american-portrait/` would still be `false` (different suffix), so the bug surface is only "would a future category slug starting with the same suffix collide". Today no slug does. The guard is a future-proof readability tax.

**Verified against the existing TopNav.test.ts pattern:** all 5 active-state assertions stay green; only the new `/pbs-american-portrait/` URL test fires the D-03 branch.

### Anti-Patterns to Avoid
- **Redirect `/work/pbs-american-portrait/` to `/pbs-american-portrait/`:** Rejected per CONTEXT D-06. Breaks PBS-03's literal interpretation ("reachable as a regular filterable category from /work"), and one of eight `/work/[category]` routes silently behaving differently is a footgun for future maintenance.
- **Strip "PBS American Portrait — " title prefix on this page only:** Rejected per CONTEXT D-22. Would require a per-page title transform in VideoCard or a wrapper — diverges from `videos.json` as source of truth.
- **Build a custom URL extractor that handles every edge case in a paragraph:** A simple regex over the first match suffices for all 15 PBS records that have a URL. The 3 records without one return `null`. Do not over-engineer; the alternative (markdown auto-linkify) is Phase 7's job.
- **Embed the PBS verbatim copy without user approval:** D-11 explicitly says the planner surfaces the candidate paragraph for user pick BEFORE execution. Do not commit placeholder copy.
- **Use Tailwind dynamic class strings like `text-cat-${slug}`:** Phase 3 already locked the static-map idiom in `categoryAccent.ts` to prevent this. The h1 class on the new page comes from the helper, not a literal string concatenation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PBS video filter | Manual `.filter()` in `+page.svelte` | `getByCategory('PBS American Portrait')` from `$lib/data` | Single source of truth; correctly excludes hidden videos (Phase 2 D-14); typed as `readonly Video[]` |
| Featured-first + date-desc sort | Custom comparator | The verbatim D-25 comparator from `/work/[category]/+page.ts` | Phase 3 contract; same shape; produces consistent ordering site-wide |
| Per-category accent color | Inline color class | `categoryAccent('PBS American Portrait')` | Single source of truth (Phase 3 D-04 → `text-cat-pbs`); the static-literal-map idiom is the only thing Tailwind v4's scanner can detect |
| Trailing-slash URL building | Hand-written paths | `${base}/pbs-american-portrait/` (note trailing slash for `trailingSlash = 'always'`) | Matches `+layout.ts` global setting; produces correct prerender output shape |
| `/pbs-american-portrait/` prerender entries | `entries()` export | NOTHING — the route is parameterless | SvelteKit only needs `entries()` for `[param]` routes; a flat route prerenders automatically when `prerender = true` is inherited |
| iframe / video embed on the landing | Embed code | Don't — videos play on `/watch/[id]/` only; the landing only links | Phase 3 D-31..D-33 owns the watch endpoint; cards link there |
| URL parser for collection URLs | URL constructor + path-segment split | One regex match | Per-card description text isn't structured — it's prose with a URL inside. Regex is the right tool for the job. |
| Strings/i18n file | `pbs-copy.ts` constant | Inline literal in `+page.svelte` | i18n is OOS per REQUIREMENTS §Out of Scope; one-file diff > two-file split for v1 |

**Key insight:** Phase 5 is largely a composition phase. Every helper, every component, every pattern is already in the codebase. Building anything new beyond the regex extractor and the route file pair is a sign of scope drift.

## Common Pitfalls

### Pitfall 1: `endsWith` Suffix Collision in `isActive` (D-03 extension)
**What goes wrong:** A future second flagship project at `/some-thing-pbs-american-portrait/` would unexpectedly trigger PBS active-state because of the bare `endsWith('/pbs-american-portrait')`.
**Why it happens:** `endsWith` is path-suffix matching, not path-shape matching. The Phase 3 pattern already lives with this risk for `/work/<slug>`.
**How to avoid:** Use the slug-guarded predicate from §Pattern 5. Future slugs that happen to share a tail won't false-positive because the guard checks the slug parameter, not the URL alone.
**Warning signs:** A new TopNav.test.ts active-state assertion is needed (D-03 calls for it); make sure it tests BOTH paths AND that no OTHER nav link goes accent-colored on `/pbs-american-portrait/`.

### Pitfall 2: TopNav Retarget Looks Like It Breaks PBS-03 (but Doesn't)
**What goes wrong:** A reader looking at the TopNav diff sees the PBS link no longer points to `/work/pbs-american-portrait/` and assumes the route is dead.
**Why it happens:** D-02 retargets the link, but the route stays prerendered because `/work/[category]/+page.ts` `entries()` still emits all 8 slugs unchanged. The user can paste the URL, follow the cross-link from `/watch/[id]/`, or follow the (Phase 6) footer-mirrored nav.
**How to avoid:** Verify `pnpm test:prerender` still passes after the change — `build/work/pbs-american-portrait/index.html` MUST exist. Add a Phase 5 route-test assertion that hits `/work/[category]` with the PBS slug and checks the cross-link is rendered (positive proof PBS-03 still works).
**Warning signs:** `entries()` returning 7 instead of 8 slugs; the `pnpm test:prerender` script failing on the `expected ≥8` line.

### Pitfall 3: Regex Extracts the Wrong URL or Misses Trailing Punctuation
**What goes wrong:** Description "See the full collection at https://www.pbs.org/american-portrait/collection/57/i-began-to-live-my-truth/. Other text." — naïve `\S+` matches `...truth/.` including the trailing period.
**Why it happens:** The natural language usage puts a period after the URL when the URL ends a sentence. Today none of the 18 descriptions actually have trailing punctuation immediately after the URL (verified via audit in §Code Examples 5 — `done` output, no `TRIMMED` lines printed). But the discretion-recommended `.replace(/[).,!?]+$/, '')` trim is a free defense against future copy edits.
**How to avoid:** Use the regex form from CONTEXT.md Claude's Discretion: `/https?:\/\/(?:www\.)?pbs\.org\/american-portrait\/collection\/[^\s)]+/` + `.replace(/[).,!?]+$/, '')`. The `[^\s)]+` (negate space AND closing paren) is the load-bearing character class for inline-parenthesis cases. Test against all 18 descriptions in `_pbsCollectionUrl.test.ts`.
**Warning signs:** A unit test asserts the URL ends in `/` or `[a-z0-9-]+` and fails because a period or comma snuck through.

### Pitfall 4: 3 of 18 PBS Videos Have NO Collection URL (Audit Finding)
**What goes wrong:** The badge-render code crashes or renders an empty `<a>` element on 3 videos because the helper returns `null`.
**Why it happens:** Verified via audit (see §Code Examples 5). The 3 videos without a `pbs.org/american-portrait/collection/...` URL in their description are:
  1. `American Portrait Year in Review 2020` (idx 1)
  2. `PBS American Portrait - Celebrity Message` (idx 13)
  3. `Introducing PBS American Portrait` (idx 16)
**How to avoid:** The CONTEXT.md D-21 markup pattern already guards with `{#if pbsCollectionUrl(video.description)}`. Make sure the unit test for `_pbsCollectionUrl.ts` covers ALL THREE no-URL records explicitly (not just one). Make sure the route test asserts that the page renders exactly 15 badges, not 18 — a positive number check, not a presence check.
**Warning signs:** A test that asserts `badges.length === 18`; a console-error in jsdom about `<a href={null}>`.

### Pitfall 5: Tailwind v4 Scanner Drops the Subtitle Classes if Concatenated
**What goes wrong:** A planner writes `class={`text-sm ${size} text-neutral-${shade}`}` for the subtitle. Tailwind v4's scanner can't tokenize the dynamic part — `text-neutral-400` never appears literally in the source — so the bundled CSS doesn't include it and the subtitle renders unstyled.
**Why it happens:** Phase 3 already burned on this for `categoryAccent` (see `src/lib/components/categoryAccent.ts` comment). Tailwind v4 reads source as text; only literal class names get utilities generated.
**How to avoid:** Write every Tailwind class as a literal string. If conditional styling is needed, use the Phase 4 D-13 two-literal-branches idiom (TopNav.svelte navClass pattern): both branches contain the full class list verbatim.
**Warning signs:** A class that "should be there" doesn't apply at runtime; `grep` for the class in `src/` returns 0 hits (Tailwind found nothing to generate).

### Pitfall 6: `target="_blank"` Without `rel="noopener"` Leaks Window Reference
**What goes wrong:** External link opens with `window.opener` set to the source page, allowing the destination to manipulate `location` of the source.
**Why it happens:** Default behavior of `target="_blank"` until the destination origin explicitly sets `Cross-Origin-Opener-Policy`. Modern browsers (Chrome 88+, Firefox 79+, Safari 12.1+) default `target="_blank"` to behave as `rel="noopener"` implicitly, BUT relying on browser defaults is a brittle pattern.
**How to avoid:** Always pair `target="_blank"` with `rel="noopener"` per D-12. Audit confirms there's no existing `rel="noopener"` pattern in the codebase yet — Phase 5 is the first place it appears (the watch route's iframe doesn't open new windows; CategoryTag links don't escape origin). Set this idiom now: every external link in this phase uses `target="_blank" rel="noopener"`.
**Warning signs:** Linter doesn't flag — eslint-plugin-svelte doesn't enforce this; eslint-plugin-security or similar would. The catch is reviewer attention.

### Pitfall 7: Mistaking `text-cat-pbs-american-portrait` for the Real Class Name
**What goes wrong:** CONTEXT.md D-08 says "PBS accent is `text-cat-pbs-american-portrait`". A planner who copies that literal class string into the h1 will produce un-styled output because no such utility exists in the bundled CSS.
**Why it happens:** Phase 3's `categoryAccent.ts` shortened the PBS slug-form for brevity: the actual class is `text-cat-pbs` (see verified `src/lib/components/categoryAccent.ts` and `src/app.css` `--color-cat-pbs`). The CONTEXT description was using the un-abbreviated slug form for readability.
**How to avoid:** Always go through `categoryAccent('PBS American Portrait')` — never hardcode the class. Phase 3's static-map idiom is the only thing the Tailwind scanner sees.
**Warning signs:** The h1 renders in the default body color; visual inspection shows no PBS accent; `grep` for `text-cat-pbs-american-portrait` returns 0 hits in `src/app.css`.

### Pitfall 8: `endsWith` vs Absolute-Path Match with `base` (Phase 3 carry-forward)
**What goes wrong:** A planner refactors `isActive` to `=== \`${base}/pbs-american-portrait\`` and the test breaks because `base` is a relative path under `adapter-static + paths.relative: true` (verified in TopNav.svelte comment).
**Why it happens:** `adapter-static` renders `base` as a per-page relative string (e.g. `../..`) during SSR. `page.url.pathname` stays absolute.
**How to avoid:** Keep using the `endsWith` pattern with the trailing-slash strip. This is exactly the prior-art idiom from Phase 3 (see TopNav.svelte lines 100-113 with the explicit comment).
**Warning signs:** Active-state test passes in isolation but the production deploy shows the nav link never highlighting; a future maintainer "fixing" the comparison to use `===` breaks all 5 existing active-state tests.

## Runtime State Inventory

Not applicable — Phase 5 is a greenfield phase that creates one new route and modifies existing routes to add cross-links. No data is renamed, no stored data shifts, no service config changes, no OS state changes, no secrets touched, no build artifacts named after a string.

Verified explicitly:
- **Stored data:** None — `videos.json` is unchanged (no schema migration, no new field).
- **Live service config:** None — no external service knows about the route name.
- **OS-registered state:** None — no Task Scheduler, systemd, pm2, etc. references in this repo.
- **Secrets/env vars:** None — `BASE_PATH` env var stays unchanged; no new secrets.
- **Build artifacts:** None — adapter-static regenerates `build/` from scratch; only new artifact is the additional `build/pbs-american-portrait/index.html` (already accounted for in §scripts/test-prerender-coverage.mjs §Integration Points modification).

## Code Examples

Verified patterns from official sources and existing project code.

### Example 1: New `+page.ts` (mirrors `/work/[category]/+page.ts` shape)
```ts
// File: src/routes/pbs-american-portrait/+page.ts
// Source pattern: src/routes/work/[category]/+page.ts (Phase 3 D-25 sort verbatim)
import type { PageLoad } from './$types';
import { getByCategory } from '$lib/data';

export const load: PageLoad = () => ({
  videos: [...getByCategory('PBS American Portrait')].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  }),
});
```

Notes:
- No `async` (no `error()` throw, so no rejection contract — sync `load` is fine here; verified against `/+page.ts` (Phase 4) which is also sync).
- No `entries()` (parameterless route — prerender contract is implicit).
- No `prerender` re-declaration (inherited from `+layout.ts`).
- No `trailingSlash` re-declaration (inherited from `+layout.ts`).
- The category string `'PBS American Portrait'` is `Category`-narrowed at compile time because `getByCategory` accepts only `Category` from the closed taxonomy in `src/lib/data/categories.ts`.

### Example 2: New `_pbsCollectionUrl.ts` (route-local helper)
```ts
// File: src/routes/pbs-american-portrait/_pbsCollectionUrl.ts
// Underscore prefix excludes this file from SvelteKit route detection (verified via
// SvelteKit 2.59.1 default behavior — files starting with `_` in src/routes/* are
// treated as private to the route group).
//
// CONTEXT.md Claude's Discretion: regex form recommended below.

const COLLECTION_URL = /https?:\/\/(?:www\.)?pbs\.org\/american-portrait\/collection\/[^\s)]+/;
const TRAILING_PUNCT = /[).,!?]+$/;

/**
 * Extracts the first pbs.org/american-portrait/collection/... URL from a video's
 * description. Returns null if no match. Trims trailing punctuation (defensive —
 * verified via audit against all 18 PBS descriptions that today's data needs no
 * trimming, but a future copy edit could introduce trailing `.` or `,`).
 */
export function pbsCollectionUrl(description: string): string | null {
  const m = description.match(COLLECTION_URL);
  if (!m) return null;
  return m[0].replace(TRAILING_PUNCT, '');
}
```

### Example 3: New `+page.svelte` (full editorial layout)
```svelte
<!--
  File: src/routes/pbs-american-portrait/+page.svelte

  Phase 5: PBS American Portrait flagship landing page.
  - D-08 h1 in PBS accent color (via categoryAccent helper)
  - D-09 subtitle (portfolio-forward)
  - D-10 verbatim PBS blockquote + attribution
  - D-12 outbound link
  - D-16 <h2>Stories</h2>
  - D-19 2/3/4 grid mirrored from /work/[category]
  - D-21 per-card "See on PBS →" badge

  ESLint: svelte/no-navigation-without-resolve disabled per project convention
  (VideoCard, TopNav, /watch/[id]/+page.svelte all use the same idiom).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccent } from '$lib/components/categoryAccent';
  import { pbsCollectionUrl } from './_pbsCollectionUrl';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Michelle Ngo — PBS American Portrait</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <h1 class="text-3xl md:text-5xl font-bold uppercase tracking-wider {categoryAccent('PBS American Portrait')}">
    PBS American Portrait
  </h1>
  <p class="mt-3 text-sm md:text-base tracking-wide text-neutral-400 uppercase">
    18 stories produced by Michelle Ngo
  </p>

  <blockquote class="mt-6 border-l-2 border-neutral-700 pl-4 text-neutral-200 max-w-3xl">
    <!-- PBS VERBATIM COPY GOES HERE — see §State of the Art for the planner-fetched candidates -->
    {data.pbsBlurb /* OR inline literal, after user picks */}
  </blockquote>
  <p class="mt-2 text-xs text-neutral-500">Description from pbs.org/american-portrait</p>

  <p class="mt-6">
    <a href="https://www.pbs.org/american-portrait/" target="_blank" rel="noopener" class="hover:underline">
      Visit pbs.org/american-portrait →
    </a>
  </p>

  <h2 class="mt-12 text-lg font-medium">Stories</h2>
  <ul class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <li>
        <VideoCard {video} eager={i < 8} />
        {#if pbsCollectionUrl(video.description)}
          <a
            href={pbsCollectionUrl(video.description)}
            target="_blank"
            rel="noopener"
            class="mt-1 inline-block text-xs text-neutral-400 hover:underline"
          >
            See on PBS →
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</section>
```

(The `data.pbsBlurb` shape is a planner-discretion call: either pass it as a `load()` return field or inline the literal directly in the template. Inline is simpler and matches CONTEXT D-11 ("embedded inline"). The `{data.pbsBlurb}` placeholder above is illustrative; the actual implementation embeds the user-approved paragraph as literal text between the `<blockquote>` tags.)

### Example 4: D-04 Cross-Link Insert into `/work/[category]/+page.svelte`
```svelte
<!-- File: src/routes/work/[category]/+page.svelte (MODIFIED) -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <h1 class="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-6 {categoryAccent(data.category)}">
    {data.category} ({data.videos.length})
  </h1>
  {#if data.category === 'PBS American Portrait'}
    <!-- Phase 5 D-04: cross-link to the dedicated landing -->
    <p class="-mt-4 mb-6 text-sm text-neutral-400">
      <a href={`${base}/pbs-american-portrait/`} class="hover:underline">
        → About the PBS American Portrait project
      </a>
    </p>
  {/if}
  <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    ...
  </ul>
</section>
```

Note: this file currently does NOT import `base`. The modification needs to add `import { base } from '$app/paths';` to the existing `<script>` block and add the `/* eslint-disable svelte/no-navigation-without-resolve */` comment (same pattern as `/watch/[id]/+page.svelte`).

### Example 5: 18-Record Audit Output (planner-verified before writing the unit test)
```
PBS count: 18
 1    no                                                                                           |  American Portrait Year in Review 2020
 2   YES    https://www.pbs.org/american-portrait/collection/57/i-began-to-live-my-truth/          |  PBS American Portrait - PRIDE
 3   YES    https://www.pbs.org/american-portrait/collection/113/lunar-new-year-is-a-wonderful-holiday/  |  PBS American Portrait - Lunar New Year
 4   YES    https://www.pbs.org/american-portrait/collection/96/now-is-the-time-for-christmas-cheer/  |  PBS American Portrait - Christmas
 5   YES    https://www.pbs.org/american-portrait/collection/59/juneteenth-is-also-a-day-of-renewal-/  |  PBS American Portrait - Juneteenth 2020
 6   YES    https://www.pbs.org/american-portrait/collection/55/i-want-justice/                    |  PBS American Portrait - Racial Injustice
 7   YES    https://www.pbs.org/american-portrait/collection/75/i-took-a-risk-when-i-decided-to-strike/  |  PBS American Portrait - Labor Unions
 8   YES    https://www.pbs.org/american-portrait/collection/65/lets-focus-on-peoples-abilities-not-their-disabilities/  |  PBS American Portrait - People with Disa
 9   YES    https://www.pbs.org/american-portrait/collection/90/we-were-the-first-people-on-this-continent/  |  PBS American Portrait - Indigenous Peopl
10   YES    https://www.pbs.org/american-portrait/collection/89/as-soon-i-was-in-the-military-i-was-never-alone/  |  PBS American Portrait - Military Veteran
11   YES    https://www.pbs.org/american-portrait/collection/35/they-came-with-very-little-money/  |  PBS American Portrait - Immigration Stor
12   YES    https://www.pbs.org/american-portrait/collection/51/the-main-ingredient-is-love/       |  PBS American Portrait - Food Traditions
13    no                                                                                           |  PBS American Portrait - Celebrity Messag
14   YES    https://www.pbs.org/american-portrait/collection/93/volunteering-is-life-giving/       |  PBS American Portrait - Volunteer Work
15   YES    https://www.pbs.org/american-portrait/collection/64/sometimes-all-you-need-is-music/   |  PBS American Portrait - Music in America
16    no                                                                                           |  Introducing PBS American Portrait
17   YES    https://www.pbs.org/american-portrait/collection/77/coming-from-a-latin-country-the-tradition-i-carry-on/  |  PBS American Portrait - Hispanic Heritag
18   YES    https://www.pbs.org/american-portrait/collection/80/to-me-sports-means-more-than-just-the-game-itself/  |  PBS American Portrait - Sports
---
with URL: 15  without: 3
```

The 3 no-URL records to test against explicitly: ids matching `'American Portrait Year in Review 2020'`, `'PBS American Portrait - Celebrity Message'`, and `'Introducing PBS American Portrait'`.

### Example 6: Post-Sort PBS Order Rendered on the Page (D-18 / D-25 verification)
```
--- POST-SORT ORDER (top 8 = eager) ---
 1 F 2024-10-24 PBS American Portrait - Hispanic Heritage Month       ← featured + newest
 2 F 2024-09-06 Introducing PBS American Portrait                     ← featured (no URL — no badge)
 3   2024-10-24 PBS American Portrait - Sports
 4   2024-09-06 PBS American Portrait - PRIDE
 5   2024-09-06 PBS American Portrait - Lunar New Year
 6   2024-09-06 PBS American Portrait - Christmas
 7   2024-09-06 PBS American Portrait - Juneteenth 2020
 8   2024-09-06 PBS American Portrait - Racial Injustices             ← last eager-load card
--- Remaining 10 (lazy) ---
 9   2024-09-06 PBS American Portrait - Labor Unions
10   2024-09-06 PBS American Portrait - People with Disabilities
11   2024-09-06 PBS American Portrait - Indigenous People
12   2024-09-06 PBS American Portrait - Military Veterans
13   2024-09-06 PBS American Portrait - Immigration Stories
14   2024-09-06 PBS American Portrait - Food Traditions
15   2024-09-06 PBS American Portrait - Celebrity Message             ← no URL — no badge
16   2024-09-06 PBS American Portrait - Volunteer Work
17   2024-09-06 PBS American Portrait - Music in America
18   2021-10-01 American Portrait Year in Review 2020                 ← oldest; no URL — no badge
```

This is the exact rendering order. A route test can pin it via `videos[0].id === '<Hispanic Heritage Month id>'` (regression test for the D-18/D-25 sort contract).

## State of the Art

### Verbatim PBS Copy Candidates (D-11 planner-fetch — surfaced for user pick)

The planner MUST present these to the user in PLAN.md and gate execution on a pick. Each candidate is verbatim from a sourced PBS publication.

| # | Source | Verbatim text | Length | Tone |
|---|--------|---------------|--------|------|
| A | [pbs.org/american-portrait/](https://www.pbs.org/american-portrait/) (hero) | "PBS American Portrait invites America to participate in a national conversation about what it really means to be an American today." | 1 sentence (20 words) | Tagline — short, punchy; reads as a project mission line |
| B | [pbs.org/american-portrait/](https://www.pbs.org/american-portrait/) (extended) | "To answer this question, PBS and its partners collected thousands of photos, videos and text submissions from across America to capture the state and spirit of our nation." | 1 sentence (27 words) | Mechanism — explains what the project did |
| C | [pbs.org/american-portrait/](https://www.pbs.org/american-portrait/) (about) | "Whether it's joy or sorrow, triumph or hardship, family traditions followed for decades or just the chaos of the morning school run, PBS American Portrait put together a picture of life as it's really lived." | 1 sentence (35 words) | Editorial — most evocative; the most "blockquote-worthy" |
| D | [PBS press release (Jan 2020)](https://www.pbs.org/about/about-pbs/blogs/news/pbs-launches-new-national-storytelling-project-pbs-american-portrait-exploring-what-it-really-means-to-be-an-american-today/) (synthesized from press copy) | "PBS American Portrait, a national storytelling project aligned with PBS's 50th anniversary celebration, is the organization's most ambitious multiplatform project in its history. Launched in January 2020, it is an ongoing, evolving initiative that asks people all over the country to submit their stories by responding to thought-provoking prompts." | 2 sentences (~50 words) | Institutional — more context (year, anniversary tie-in), reads as press copy |

**Recommendation for the planner:** Surface all four in PLAN.md as a four-option checkbox list. Recommend C as the editorial default (most blockquote-worthy, complements the "Stories" h2 below it semantically). Recommend A as the fallback if C feels too long. Do NOT propose a synthesized hybrid — D-11 says verbatim.

### Other Findings

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 3 `isActive` returned true only for `/work/<slug>` | Phase 5 D-03 extends to include `/<flagship>/` paths | Phase 5 | One new branch in TopNav.svelte; new test case |
| TopNav PBS category link → `/work/pbs-american-portrait/` | Phase 5 D-02 retargets PBS link → `/pbs-american-portrait/`; other 7 stay | Phase 5 | One literal href change in TopNav.svelte; one test assertion change in TopNav.test.ts |
| `noUncheckedIndexedAccess` (Phase 1) | Still active; `getByCategory` returns `readonly Video[]` (non-optional element) | Phase 1 → ongoing | Spread-then-sort idiom is unchanged; first PBS video may be `undefined` only under destructuring without length check, but the `{#each}` block handles empty case gracefully |

**Deprecated/outdated:**
- The Phase 3 D-40 convention "category nav links go to /work/[slug]" is now broken for the PBS slug specifically. The CONTEXT explicitly documents this as intentional. The other 7 category links keep the convention.
- The Phase 3 D-41 convention "active = exact path match" generalizes to "active = path match OR known-sibling-surface match for the same category." Phase 5 is the precedent.

## Open Questions

1. **Exact PBS verbatim copy paragraph** (D-11 deferred)
   - What we know: 4 verbatim candidates surfaced in §State of the Art table. All are from PBS-controlled URLs.
   - What's unclear: Which one Michelle wants. Editorial preference is C (the "joy or sorrow, triumph or hardship" sentence); brevity preference is A.
   - Recommendation: Planner surfaces all 4 in PLAN.md as a user-approval gate before Wave 1 begins. Default-recommend C with A as second pick.

2. **Whether `pbsCollectionUrl` is route-local or `$lib`**
   - What we know: Only one route uses it today. CONTEXT recommends route-local.
   - What's unclear: If Phase 7 auto-linkify (deferred) ends up using the same regex, we'll want to move it. But Phase 7 may use a more general URL parser.
   - Recommendation: Route-local for v1 (`src/routes/pbs-american-portrait/_pbsCollectionUrl.ts`). Move to `$lib` when a second caller materializes — the refactor is a one-line import path change.

3. **Whether the blockquote carries a PBS accent border-color**
   - What we know: CONTEXT calls this Claude's Discretion; recommends neutral border.
   - What's unclear: Whether the visual weight of the h1 PBS color is enough to make the page identity clear, or if the blockquote should reinforce it.
   - Recommendation: Default to `border-l-2 border-neutral-700` (restraint). If visual review during execution says the page looks insufficiently "PBS-themed", flip the border color to `border-cat-pbs` (one-line change; Tailwind will already have generated the class because `bg-cat-pbs` / `text-cat-pbs` family utilities are scanned). NB: `border-cat-pbs` is NOT currently in any literal source string, so the planner must verify Tailwind v4 generates the border variant from the same `--color-cat-pbs` variable (v4 docs say yes — every `--color-*` variable produces text/bg/ring/border/etc. utilities; verified against `src/app.css` `@theme` comment).

4. **Whether the PBS h2 "Stories" needs an `id` for in-page anchoring**
   - What we know: CONTEXT doesn't mention deep-linking to the grid section.
   - What's unclear: No requirement asks for it; Phase 7 polish might add `#stories` for press-release linking.
   - Recommendation: Defer. The h2 stays anchor-less in v1.

5. **Should the route test pin `videos[0].id` to a literal Vimeo/YouTube id?**
   - What we know: The D-18 sort would pin `Hispanic Heritage Month` to position 0 if we lock against the current data shape.
   - What's unclear: A future video data update that adds a third featured PBS row dated after 2024-10-24 would silently reorder, breaking the test.
   - Recommendation: Pin the count (18) and the category-of-every-card invariant. Pin a STRUCTURAL invariant — e.g., "first card is featured" — not a literal id. Test for sort regression via the existing pattern in `/watch/[id]/page.test.ts` (the "rail is sorted featured-first then published date desc" assertion). This mirrors how Phase 3 tested D-25 elsewhere.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 with two-project split: `data` (node), `ui` (jsdom). Both reuse `vite.config.ts` plugins. |
| Config file | `vite.config.ts` (lines 73-122) — `test.projects` array; `vitest-setup-ui.ts` shim for IntersectionObserver |
| Quick run command (one suite) | `pnpm vitest run -t "<test name>"` — example: `pnpm vitest run -t "/pbs-american-portrait"` |
| Full suite command | `pnpm test` (runs both projects); `pnpm check` (svelte-check); `pnpm lint`; `pnpm build && pnpm test:prerender` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| PBS-01 | `/pbs-american-portrait/` route exists; prerenders | unit (route load) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "load returns 18 videos"` | ❌ Wave 0 |
| PBS-01 | `build/pbs-american-portrait/index.html` is emitted | integration (prerender coverage) | `pnpm build && pnpm test:prerender` (script updated to assert ≥1 such file) | ❌ Wave 0 (script update needed) |
| PBS-01 | TopNav PBS category link points to `/pbs-american-portrait/` | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts -t "PBS link href is /pbs-american-portrait"` | ❌ Wave 0 (new assertion in existing file) |
| PBS-01 | TopNav active-state highlights PBS link on `/pbs-american-portrait/` | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts -t "active on /pbs-american-portrait"` | ❌ Wave 0 |
| PBS-01 | Cross-link from `/watch/[id]/` (PBS only) | unit (route render) | `pnpm vitest run src/routes/watch/[id]/page.test.ts -t "PBS cross-link present"` | ❌ Wave 0 (new assertions in existing file) |
| PBS-02 | Page renders exactly 18 VideoCards | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "renders 18 cards"` | ❌ Wave 0 |
| PBS-02 | Page renders h1 with PBS accent class | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "h1 has text-cat-pbs class"` | ❌ Wave 0 |
| PBS-02 | Page renders subtitle line | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "subtitle text present"` | ❌ Wave 0 |
| PBS-02 | Page renders blockquote with attribution | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "blockquote rendered"` | ❌ Wave 0 |
| PBS-02 | Outbound `pbs.org/american-portrait` link with `target=_blank rel=noopener` | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "outbound link attrs"` | ❌ Wave 0 |
| PBS-02 | `h2 Stories` heading rendered | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "h2 Stories"` | ❌ Wave 0 |
| PBS-02 | Per-card "See on PBS →" badge rendered when URL present | unit (route render + helper integration) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "15 PBS badges rendered"` | ❌ Wave 0 |
| PBS-02 | `pbsCollectionUrl` extracts URL from 15 of 18 descriptions correctly | unit (helper) | `pnpm vitest run src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` | ❌ Wave 0 |
| PBS-02 | `pbsCollectionUrl` returns `null` for the 3 no-URL records | unit (helper) | `pnpm vitest run src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts -t "returns null"` | ❌ Wave 0 |
| PBS-02 | D-18/D-25 sort: first card is featured + newest-dated | unit (route load) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "sort featured-first"` | ❌ Wave 0 |
| PBS-03 | `/work/pbs-american-portrait/` still loads 18 PBS videos | unit (existing test, unchanged) | `pnpm vitest run src/routes/work/[category]/page.test.ts -t "pbs-american-portrait"` | ✅ green pre-Phase-5 |
| PBS-03 | `entries()` still emits 8 slugs including `pbs-american-portrait` | unit (existing test, unchanged) | `pnpm vitest run src/routes/work/[category]/page.test.ts -t "entries"` | ✅ green pre-Phase-5 |
| PBS-03 | `build/work/pbs-american-portrait/index.html` still emitted | integration (prerender coverage, unchanged threshold) | `pnpm build && pnpm test:prerender` | ✅ green pre-Phase-5 |
| PBS-03 | Cross-link from `/work/pbs-american-portrait/` to landing | unit (route render) | `pnpm vitest run src/routes/work/[category]/page.test.ts -t "PBS cross-link"` | ❌ Wave 0 (new assertion) |

### Sampling Rate
- **Per task commit:** `pnpm vitest run -t "<changed file or single suite name>"` (sub-second feedback)
- **Per wave merge:** `pnpm test && pnpm check && pnpm lint && pnpm build && pnpm test:prerender` (full validation)
- **Phase gate:** Full suite green + a manual smoke (open `pnpm preview` and click through the four PBS surfaces: home nav → `/pbs-american-portrait/` → click a card → from `/watch/[id]/` follow the cross-link back → from `/work/pbs-american-portrait/` follow the cross-link)

### Wave 0 Gaps
- [ ] `src/routes/pbs-american-portrait/+page.svelte` — stub with describe.skip suites for all PBS-01 + PBS-02 assertions above (15 stubs)
- [ ] `src/routes/pbs-american-portrait/+page.ts` — stub returning `{ videos: [] }` to satisfy `import { load }` in the stubbed test
- [ ] `src/routes/pbs-american-portrait/page.test.ts` — RED-by-skip test stubs for ~15 assertions across 6 describe blocks (render / blockquote / outbound / subtitle / badges / sort)
- [ ] `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` — stub exporting `pbsCollectionUrl(): null` to satisfy import in the helper test
- [ ] `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` — RED-by-skip stubs (18 extraction assertions: 15 positive + 3 null + 4 edge cases: trailing punctuation, multiple URLs, non-PBS URL ignored, malformed protocol)
- [ ] `src/lib/components/TopNav.test.ts` — extend existing tests with new assertions: (a) PBS link href is `/pbs-american-portrait` (D-02); (b) active on `/pbs-american-portrait/` (D-03); (c) active on `/work/pbs-american-portrait/` STILL works (regression for D-03)
- [ ] `src/routes/watch/[id]/page.test.ts` — new assertion: PBS video shows cross-link; non-PBS video does NOT show cross-link
- [ ] `src/routes/work/[category]/page.test.ts` — new assertion: `/work/pbs-american-portrait/` renders cross-link; non-PBS category does NOT
- [ ] `scripts/test-prerender-coverage.mjs` — update threshold check to include `build/pbs-american-portrait/index.html` (one new `if (!existsSync(...)) failures.push(...)` block + log line)

No new framework install needed (all infrastructure is locked from Phases 1-4).

## Sources

### Primary (HIGH confidence)
- `src/lib/data/categories.ts` — verified `Category` taxonomy and `categoryToSlug` rule
- `src/lib/data/videos.ts` — verified `getByCategory` returns `readonly Video[]`
- `src/lib/data/index.ts` — verified the public `$lib/data` surface
- `src/lib/components/categoryAccent.ts` — verified actual class string is `text-cat-pbs` (not `text-cat-pbs-american-portrait`)
- `src/lib/components/VideoCard.svelte` — verified the component contract is verbatim-reusable
- `src/lib/components/TopNav.svelte` — verified `isActive`, `$effect` scroll-aware machinery, and `endsWith` predicate shape
- `src/routes/work/[category]/+page.ts` — verified D-25 sort comparator + `async` load + `entries()` shape
- `src/routes/work/[category]/+page.svelte` — verified the grid markup to mirror
- `src/routes/watch/[id]/+page.svelte` — verified D-35 metadata order (insertion point for D-05 cross-link)
- `src/routes/+layout.ts` — verified `prerender = true` + `trailingSlash = 'always'` inheritance
- `src/routes/+page.ts` (Phase 4) — verified the sync-load shape for parameterless prerendered routes
- `scripts/test-prerender-coverage.mjs` — verified the threshold-check structure for the planner's modification
- `vite.config.ts` — verified the Vitest two-project setup, plugin order, and category test scopes
- `vitest-setup-ui.ts` — verified the IntersectionObserver stub already exists (no new shim needed)
- `package.json` — verified `svelte@5.55.5` (current per npm) and pinned-exact dep policy
- Direct audit of `src/lib/data/videos.json` — verified 18 PBS records, 15 have collection URLs, 3 do not

### Secondary (MEDIUM confidence — single fetch, official source)
- [PBS American Portrait main site](https://www.pbs.org/american-portrait/) — verbatim copy candidates A, B, C
- [PBS press release: PBS Launches New National Storytelling Project](https://www.pbs.org/about/about-pbs/blogs/news/pbs-launches-new-national-storytelling-project-pbs-american-portrait-exploring-what-it-really-means-to-be-an-american-today/) — verbatim copy candidate D
- [PBS show page: American Portrait](https://www.pbs.org/show/american-portrait/) — additional context (no new copy beyond candidates A-C)

### Tertiary (LOW confidence — best-effort, planner verifies at plan time)
- None — Phase 5's domain is entirely covered by HIGH-confidence sources (the project's own code) and MEDIUM-confidence sources (PBS-controlled URLs). No third-party blog posts, no community-pattern lookups, no stale tutorials.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every dep is already installed and pinned exact; verified `svelte` against npm registry
- Architecture: HIGH — every pattern is a verbatim carry-forward from Phase 3 + Phase 4 with prior-art in this codebase
- Pitfalls: HIGH — every pitfall identified comes from a verified Phase 3/4 RESEARCH or code comment, or from direct audit of the data
- PBS verbatim copy: MEDIUM — 4 candidates surfaced; user picks at plan time (D-11 gate)

**Research date:** 2026-05-11
**Valid until:** 2026-06-10 (30 days; phase is additive over a stable contract — drift risk is low)
