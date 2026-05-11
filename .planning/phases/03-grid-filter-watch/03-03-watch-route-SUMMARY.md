---
phase: 03-grid-filter-watch
plan: 03
subsystem: routes
tags: [sveltekit, prerender, iframe-embed, same-category-rail, error-fallback, trailing-slash]
one_liner: "/watch/[id] route — iframe embed in aspect-video max-w-5xl, D-35 metadata (h1 + interactive CategoryTag + uploader·year + optional description), build-time same-category rail (D-25 sort, current excluded), 56 prerendered pages; +error.svelte 404 fallback; trailingSlash='always' fixes upstream Plan 03-00 contract gap."
dependency_graph:
  requires:
    - "Plan 03-01: VideoCard.svelte (used in rail), CategoryTag.svelte (used in metadata with href prop), categoryAccent (transitively via CategoryTag)"
    - "$lib/data (Phase 2): getById, getByCategory, videos, categoryToSlug, producerReelId, Video type"
    - "$app/paths (Phase 1): base for BASE_PATH-safe internal hrefs"
    - "$app/state (SvelteKit 2.27+): page.status for +error.svelte status code rendering"
    - "@sveltejs/kit: error(status, message) helper for D-32 404 narrowing"
    - "scripts/test-prerender-coverage.mjs (Plan 03-00): build-artifact coverage gate this plan finally turns GREEN (in tandem with Plan 03-02)"
  provides:
    - "src/routes/watch/[id]/+page.ts — entries() returns 56 ids; async load() returns {video, rail}"
    - "src/routes/watch/[id]/+page.svelte — D-33 iframe player + D-35 metadata + D-36/37/38 rail"
    - "src/routes/+error.svelte — minimal 404 fallback shared by /watch/[id] (D-32) and /work/[category] (D-30)"
    - "trailingSlash='always' site-wide — emits build/<route>/index.html directory shape (matches Plan 03-00 coverage script expectation)"
  affects:
    - "All routes: every URL now ends with / and emits build/<route>/index.html instead of build/<route>.html (adapter-static default reversal)"
    - "Plan 03-02 acceptance criteria (parallel): trailingSlash='always' also satisfies their build/work/index.html + build/work/<slug>/index.html acceptance criteria — shared infrastructure win"
    - "Plan 03-04 (TopNav): can now assume every href to internal routes will be normalized to trailing-slash form on navigation; click targets in tests still assert literal raw hrefs"
tech-stack:
  added: []
  patterns:
    - "Build-time rail computation (D-37): `[...getByCategory(video.category)].filter(v => v.id !== video.id).toSorted(D-25)` runs inside load() — Vite/SvelteKit serializes the result into the prerendered HTML's __sveltekit_data block. Zero client-side JS for the rail; producers see the rail instantly on first paint."
    - "async load() with error(404) helper: error() returns `never` but TypeScript narrows via control-flow only when called inside an async function. Sync load() with `error()` throws synchronously and breaks `.rejects.toMatchObject()` test patterns. async + throw-from-helper produces the expected promise-rejection shape."
    - "$derived destructure in +page.svelte (Svelte 5 idiom): replaces bare `const { video, rail } = data;` which triggers `state_referenced_locally` warning. `$derived(data.video)` preserves reactivity for client-side navigations between watch entries without runtime overhead on prerendered first-paint."
    - "trailingSlash='always' in root +layout.ts: forces adapter-static to emit `build/<route>/index.html` directory shape (vs the flat `<route>.html` default). Matches the Cloudflare Pages canonical convention AND the Plan 03-00 prerender-coverage script's expected output pattern."
    - "Single-component-two-call-sites (D-13 vs D-35): CategoryTag is `<span>` inside VideoCard (no href passed) and `<a>` on /watch metadata (href={`${base}/work/${slug}`}). Same component file, behavior switched by optional prop — avoids nested-<a> markup that would invalidate both cards and watch metadata."
    - "iframe `allow=\"autoplay; encrypted-media; picture-in-picture; fullscreen\"` WITHOUT `?autoplay=1` query param (Pitfall 5): permits user-initiated autoplay inside the iframe (clicking the play button) but never asks the browser to auto-start playback. Browser autoplay policies would block that anyway; bypassing them via JS would feel hostile."
key-files:
  created:
    - "src/routes/watch/[id]/+page.ts"
    - "src/routes/watch/[id]/+page.svelte"
    - "src/routes/+error.svelte"
  modified:
    - "src/routes/watch/[id]/page.test.ts (drop describe.skip on 3 suites, drop runtime-computed spec + loadPage indirection, swap to top-level static import + callLoad() narrowing helper)"
    - "src/routes/+layout.ts (added trailingSlash='always' — Rule 3 deviation, see Deviations)"
  unchanged:
    - "src/lib/components/VideoCard.svelte (Plan 03-01 — used in rail as-is)"
    - "src/lib/components/CategoryTag.svelte (Plan 03-01 — used in metadata with href prop as-is)"
    - "vite.config.ts (Plan 03-01 test.projects untouched)"
    - "svelte.config.js (Phase 1 adapter-static config untouched)"
decisions:
  - "async load() so error(404) becomes promise rejection: the planner's literal example used a sync `load = ({params}) =>` arrow. With sync load, `error(404)` throws synchronously and `await expect(load(...)).rejects.toMatchObject({status: 404})` never sees a rejection (sync throw bypasses promise machinery). Marking load async makes the throw surface as a promise rejection. Functional behavior identical for the route renderer (PageLoad supports both)."
  - "callLoad() narrowing helper in page.test.ts (Rule 3 deviation): SvelteKit's auto-generated PageLoad widens the awaited return to `void | (Omit<App.PageData, ...> & Record<string, any>)`, blocking direct `result.video` access. Helper does `if (!result) throw; return result as {video: Video; rail: Video[]}`. Same pattern as parallel Plan 03-02 /work/page.test.ts (verbatim — both files landed it independently)."
  - "$derived destructure in +page.svelte (Rule 1 deviation): planner's literal `const { video, rail } = data;` triggers Svelte 5's state_referenced_locally compile warning (`pnpm check` would flag it). $derived(data.video) is the canonical Svelte 5 pattern for prop-derived locals. Behavior identical for prerendered routes; preserves reactivity for any future client-side route transitions."
  - "trailingSlash='always' in src/routes/+layout.ts (Rule 3 deviation, see Deviations below for the full chain): required for the Plan 03-00 prerender-coverage script gate AND for the Plan 03-03 acceptance criteria literal `build/watch/<id>/index.html` paths. Affects every URL site-wide — documented as a phase-level decision so Plan 03-04 (TopNav) knows."
  - "Direct top-level static import in page.test.ts (per Plan 03-01 downstream contract): replaces the runtime-computed `const spec = './' + '+page'` dynamic-import hack from Plan 03-00. The hack existed only while +page.ts didn't yet exist; this plan creates +page.ts so the hack can be removed."
metrics:
  duration_minutes: 9
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 2
  commits:
    - "6a0c222 feat(03-03): add /watch/[id] +page.ts entries+load and unskip FILT-01/02 tests"
    - "e567f09 feat(03-03): add /watch/[id] page + /+error.svelte + trailingSlash=always"
  completed_at: "2026-05-11"
requirements-completed: [FILT-01, FILT-02, FILT-04, GRID-01, GRID-04, GRID-05]
---

# Phase 3 Plan 03: Watch Route Summary

## One-liner

`/watch/[id]` route — iframe embed in `aspect-video max-w-5xl`, D-35 metadata order (`<h1>` + interactive CategoryTag + uploader·year + optional description), build-time same-category rail (D-25 sort, current excluded), 56 prerendered pages; `+error.svelte` 404 fallback; `trailingSlash='always'` fixes upstream Plan 03-00 contract gap so the build-artifact coverage script passes.

## Performance

- **Duration:** ~9 minutes
- **Tasks:** 2 of 2
- **Files created:** 3 (`+page.ts`, `+page.svelte`, `+error.svelte`)
- **Files modified:** 2 (`page.test.ts` unskipped; `+layout.ts` trailingSlash added)
- **Commits:** 2 task-level commits (with `--no-verify` per parallel-execution gate)

## What Shipped

### `/watch/[id]/+page.ts` — entries + load

```ts
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { getById, getByCategory, videos } from '$lib/data';

export const entries: EntryGenerator = () => videos.map((v) => ({ id: v.id }));

export const load: PageLoad = async ({ params }) => {
  const video = getById(params.id);
  if (!video) error(404, 'Video not found');

  const rail = [...getByCategory(video.category)]
    .filter((v) => v.id !== video.id)
    .toSorted((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.published.localeCompare(a.published);
    });

  return { video, rail };
};
```

- `entries()` returns 56 `{id}` shapes — directly enumerates the prerender table (FILT-01 + D-31)
- `load()` narrows `params.id → Video` via `getById()` + `error(404)` (D-32; TypeScript narrows because `error()` returns `never`)
- Rail = same-category - current - D-25 sort (D-36, D-37, D-25)
- `getByCategory` returns `readonly Video[]`; `[...]` spread is required for the eventual non-readonly `Video[]` return type

### `/watch/[id]/+page.svelte` — player + metadata + rail

```svelte
<article class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <!-- D-34 Player: max-w-5xl centered, aspect-video. D-33: direct iframe. -->
  <div class="mx-auto max-w-5xl">
    <div class="relative aspect-video bg-neutral-900">
      <iframe src={video.embed} title={video.title} loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
              class="absolute inset-0 w-full h-full border-0"></iframe>
    </div>
  </div>
  <!-- D-35 Metadata: h1 + interactive chip + uploader · year + optional description -->
  <div class="mx-auto max-w-7xl mt-6 space-y-2">
    <h1>{video.title}</h1>
    <CategoryTag category={video.category} href={`${base}/work/${categorySlug}`} />
    <p>{video.uploader} · {year}</p>
    {#if video.description}<p class="whitespace-pre-line">{video.description}</p>{/if}
  </div>
  <!-- D-36/37/38 Rail: heading-is-link, same VideoCard + 2/3/4 grid, hide if empty -->
  {#if rail.length > 0}
    <section class="border-t border-white/10">
      <h2><a href={`${base}/work/${categorySlug}`}>More in {video.category} →</a></h2>
      <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {#each rail as v (v.id)}<VideoCard video={v} />{/each}
      </ul>
    </section>
  {/if}
</article>
```

Key contracts:
- **D-33 player**: direct iframe, no autoplay query param (Pitfall 5)
- **D-34 sizing**: player `max-w-5xl`, metadata + rail `max-w-7xl`
- **D-35 metadata order**: title (h1) → interactive CategoryTag (href!) → uploader · year → optional description with `whitespace-pre-line`. v1 SKIPS: `duration_seconds`, `credits`, `tags` (those are D-35 step 6 future surfaces).
- **D-36 rail heading-is-link**: the entire `<h2>` wraps the `<a>` so the title itself is the affordance to the category page
- **D-37 rail excludes self**: `.filter(v => v.id !== video.id)` in the load() function
- **D-38 empty-rail hide**: `{#if rail.length > 0}` wraps the entire section. v1's smallest category (Reel) has 4 videos so rail is never empty in practice; defensive guard for forward-compat.
- **D-09 hairline divider**: `border-t border-white/10` between metadata and rail
- **D-19 heading hierarchy**: h1 (page) → h2 (rail) → h3 (cards, via VideoCard)

### `src/routes/+error.svelte` — minimal 404

```svelte
<main>
  <h1>Not found</h1>
  <p>{page.status} — That page doesn't exist (yet).</p>
  <a href={`${base}/work`}>Back to work →</a>
</main>
```

- Uses `$app/state`'s `page.status` (SvelteKit 2.27+) for the numeric status display
- Inherits `+layout.svelte` chrome (noindex meta + body wrapper) automatically
- Catches both D-30 (unknown category slug — Plan 03-02 route) and D-32 (unknown video id — this plan's route)

### Tests GREEN

| File                                          | Tests        | Status                           |
| --------------------------------------------- | ------------ | -------------------------------- |
| `src/routes/watch/[id]/page.test.ts`          | 9            | All pass (was 3 × describe.skip) |
| `pnpm test` total                             | **71 pass / 7 skip (78)** | (Plan 03-04 still owns 7 TopNav tests) |

- 9 watch tests: 2 (FILT-01 load: valid id + 404), 4 (FILT-02 rail: same-category, excludes self, count=N-1, D-25 sort), 3 (entries: 56 ids, non-empty, includes producer reel)
- Verified GREEN paired with Plan 03-02's 10 work-route tests landed in parallel commit `e8d4768`

### Build & coverage GREEN

```
pnpm check        → 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS (430 files)
pnpm test         → Test Files 9 passed | 1 skipped (10); Tests 71 passed | 7 skipped (78)
pnpm build        → Wrote site to "build"; done (adapter-static, all routes prerendered)
pnpm test:prerender → PASS:
                      - build/work/index.html: present
                      - build/work/<slug>/index.html: 8 files (expected ≥8)
                      - build/watch/<id>/index.html: 56 files (expected ≥56)
```

Specific build artifacts confirmed:
- `build/watch/264677021/index.html` — producer reel (Vimeo)
- 56 directories under `build/watch/`, each with `index.html`
- `build/404.html` — adapter-static fallback (source: `+error.svelte`)

## Output Items Documented (from PLAN.md `<output>` block)

### 1. Build-time rail computation (D-37) — zero client JS

```ts
const rail = [...getByCategory(video.category)]
  .filter((v) => v.id !== video.id)
  .toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  });
```

Runs inside `load()` at PRERENDER time. SvelteKit serializes the result into the static HTML's `__sveltekit_data` block. The browser receives the rail already computed — no `getByCategory()` call on the client, no sort on the client. Producer first-paint includes the rail.

`getByCategory` returns `readonly Video[]`; the `[...]` spread copies into a mutable `Video[]` so `.toSorted()` can return the same shape as the load's `rail: Video[]` declaration.

### 2. D-35 metadata order (verbatim) and skipped v1 fields

Order rendered:
1. `<h1>{title}</h1>` — the only `<h1>` on the page
2. `<CategoryTag category={video.category} href={…} />` — INTERACTIVE on watch metadata (renders `<a>` because href is passed)
3. `<p>{uploader} · {year}</p>` — year is `video.published.slice(0, 4)` (ISO `YYYY-MM-DD` → 4-digit year)
4. `<p class="whitespace-pre-line">{description}</p>` — ONLY if `video.description` is truthy (non-empty); otherwise the entire `<p>` is omitted

**v1 SKIPS** (D-35 step 6 future surfaces):
- `duration_seconds` — could show `4m 21s` but iframe player already displays duration
- `credits` — could list cast/crew (D-08 default field) but v1 keeps watch metadata minimal
- `tags` — auxiliary discovery surface deferred to future filtering

These optional Video fields are still validated/loaded by Phase 2's schema; they're available for future plans to surface without re-extending the data layer.

### 3. iframe `allow="autoplay; …"` WITHOUT `?autoplay=1` query (Pitfall 5)

The iframe attribute `allow="autoplay; encrypted-media; picture-in-picture; fullscreen"` permits the embedded player to autoplay when the USER initiates it (clicking the play button). It does NOT cause the iframe to autoplay on page load. We never append `?autoplay=1` to `video.embed` because:

1. Browser autoplay policies (Chrome, Safari, Firefox) BLOCK autoplay-with-sound on a page the user hasn't interacted with. The browser would just ignore the request.
2. Even if it worked, ambushing producers with a video that starts blaring on click-through would feel hostile.
3. The play button is the universal affordance — every producer knows what to do.

### 4. Empty-rail invariant (D-38) — defensive `{#if rail.length > 0}`

v1's smallest category is Reel (4 videos → rail length 3). Every category has ≥3 videos so `rail.length > 0` is always true in practice. The `{#if}` guard exists for forward-compatibility: if a future category drops to 1 video (just the current video), `rail.length === 0` and the entire "More in [Category]" section (heading + grid) disappears cleanly. No empty-state UI required.

Tested explicitly: `it('rail count = same-category count - 1 (Reel has 4; rail = 3)')` asserts `result.rail.length === 3` for the producer reel id.

### 5. Interactive CategoryTag pattern (D-35) vs non-interactive (D-13)

Same component, two call sites:

| Call site                      | href prop?     | Element rendered | Decision |
| ------------------------------ | -------------- | ---------------- | -------- |
| Inside VideoCard (Plan 03-01)  | OMITTED        | `<span>`         | D-13     |
| /watch/[id] metadata (this)    | `${base}/work/${slug}` | `<a>`    | D-35     |

The `<span>` form is mandatory inside VideoCard because the entire card is already wrapped in `<a href=/watch/[id]>` — nested `<a>` is invalid HTML and breaks click-target semantics. The `<a>` form on /watch metadata closes the FILT-04 round-trip: producer clicks card on /work → /watch/[id] → clicks chip → /work/[slug] → filtered grid.

The CategoryTag component reads the optional `href` prop and switches:

```svelte
{#if href}
  <a href={href} class="…">{category}</a>
{:else}
  <span class="…">{category}</span>
{/if}
```

### 6. `+error.svelte` fallback chain

D-30 (unknown category slug — Plan 03-02 `/work/[category]` 404) and D-32 (unknown video id — this plan's `/watch/[id]` 404) both surface through SvelteKit's root error boundary, which renders `src/routes/+error.svelte`. The chrome (`+layout.svelte`) wraps it: noindex meta + body styles inherit.

adapter-static emits `build/404.html` from this same source — Cloudflare Pages serves it for any unmatched route. Verified via `[ -f build/404.html ] && echo FOUND`.

### 7. Prerender coverage: 56 ids via `videos.map(v => ({id: v.id}))`

Pairs with Plan 03-02's 8 category slugs to satisfy the three-threshold `pnpm test:prerender` gate:

```
[test-prerender-coverage] PASS:
  - build/work/index.html: present
  - build/work/<slug>/index.html: 8 files (expected ≥8)
  - build/watch/<id>/index.html: 56 files (expected ≥56)
```

The `entries()` enumeration is the canonical SvelteKit 2 pattern under `adapter-static strict: true`. Even though links from /work would auto-crawl /watch/[id] pages, explicit `entries()` is the documented Pitfall 1 contract and makes the prerender table deterministic.

## Decisions Made

### 1. async load() so error(404) becomes a promise rejection

The planner's literal example used `load: PageLoad = ({params}) => {…}` (sync). The test contract uses `await expect(load(...)).rejects.toMatchObject({status: 404})` which requires a promise rejection. With sync load(), `error(404)` throws synchronously and bypasses the promise machinery — the test failed with the error being thrown OUTSIDE the awaited promise.

Marking the load function `async` makes any thrown error (including from `error()`) surface as a promise rejection. Behavior is identical for the route renderer (PageLoad accepts sync OR async).

### 2. callLoad() narrowing helper in page.test.ts (Rule 3)

`Awaited<ReturnType<typeof load>>` is `void | (Omit<App.PageData, ...> & Record<string, any>)` because SvelteKit's auto-generated `PageLoad` widens the return to allow void. Direct `result.video` access fails type-check. Same shape problem the parallel Plan 03-02 hit on `/work/page.test.ts` — the helper pattern is verbatim:

```ts
async function callLoad(event): Promise<{video: Video; rail: Video[]}> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as {video: Video; rail: Video[]};
}
```

### 3. `$derived` destructure instead of bare const-destructure (Rule 1)

Bare `const { video, rail } = data;` triggers Svelte 5's `state_referenced_locally` compile warning — `data` is a `$props()` source and bare destructure captures only the initial value, missing reactivity on any client-side navigation between watch entries. `$derived(data.video)` is the canonical Svelte 5 pattern. Behavior identical for prerendered routes (no client-side data swap); preserves reactivity if SvelteKit later does client-side route transitions between watch pages.

### 4. trailingSlash='always' site-wide (Rule 3)

See Deviations below — necessary to align adapter-static's output directory shape with the Plan 03-00 prerender-coverage script's expected paths.

### 5. Direct top-level static import in test file (per Plan 03-01 contract)

Replaces the Plan 03-00 lazy `loadPage()` indirection + the Plan 03-01 runtime-computed `const spec = './' + '+page'` hack. Both hacks existed only while `+page.ts` didn't resolve. This plan creates `+page.ts` so both hacks come out together (per Plan 03-01 SUMMARY's "Downstream Contract for Wave 2 Plans"). Test imports become trivially:

```ts
import { load, entries } from './+page';
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug in literal plan example] Sync load + error(404) breaks `.rejects.toMatchObject`**

- **Found during:** Task 1 first verification (`pnpm vitest run` — 1 of 9 tests failed)
- **Issue:** The planner's literal example wrote `load: PageLoad = ({params}) => {…}` (sync arrow). The test asserts `await expect(load(...)).rejects.toMatchObject({status: 404})`. With a sync load function, `error(404)` throws synchronously — the throw happens BEFORE any promise wrapping, so the test sees a synchronous throw, not a promise rejection. Vitest reports the test as failed because the function under test threw outside the awaited promise.
- **Fix:** Marked `load` as `async`. Now `error(404)` still throws synchronously inside the async function body, but JS async-function semantics convert that into a promise rejection. The test sees `{status: 404, body: {message: 'Video not found'}}` as the rejection value.
- **Files modified:** `src/routes/watch/[id]/+page.ts` (added `async` keyword)
- **Commit:** `6a0c222` (Task 1)
- **Acceptance criteria impact:** The plan's literal acceptance string `const video = getById(params.id);` and `if (!video) error(404,` still appear verbatim — only the function-style changed from sync to async. PageLoad type accepts both.

**2. [Rule 3 - Blocking] PageLoad's MaybeWithVoid return type blocks direct property access in tests**

- **Found during:** Task 1 first `pnpm check` run (7 ERRORS across the watch test file + 1 in the parallel /work test file)
- **Issue:** SvelteKit's auto-generated `PageLoad<OutputData>` defaults `OutputData` to `MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<…>> & Record<string, any>>`. The `MaybeWithVoid` adds `| void` to the awaited type so a no-data load is valid. Test code `const result = await load(...); result.video.id` fails with "Property 'video' does not exist on type 'void | …'".
- **Fix:** Added a `callLoad()` narrowing helper to `page.test.ts` (identical to the parallel `/work/page.test.ts` Plan 03-02 introduced for the same reason): `if (!result) throw; return result as {video, rail}`. Preserves the static top-level `import { load, entries }` form required by Plan 03-01's downstream contract.
- **Files modified:** `src/routes/watch/[id]/page.test.ts` (added `callLoad()` + `import type { Video } from '$lib/data'`; non-entries tests now call `callLoad(event)` instead of `load(event)`)
- **Commit:** `6a0c222` (Task 1)

**3. [Rule 1 - Bug in literal plan example] Bare `const { video, rail } = data` triggers svelte/state_referenced_locally**

- **Found during:** Task 2 first `pnpm check` run (1 WARNING)
- **Issue:** The plan's literal example used `const { video, rail } = data;` inside `<script lang="ts">`. Svelte 5 compiler flags this as `state_referenced_locally` — `data` is a `$props()` source whose underlying state lives in the parent; bare destructure captures only the initial reading. Compile warning text: "This reference only captures the initial value of `data`. Did you mean to reference it inside a closure instead?". Project's check config flags warnings as failures.
- **Fix:** Replaced with `$derived` per Svelte 5 idiom: `const video = $derived(data.video); const rail = $derived(data.rail); const year = $derived(video.published.slice(0,4)); const categorySlug = $derived(categoryToSlug(video.category));`. Identical runtime behavior on prerendered routes; preserves reactivity for client-side route transitions.
- **Files modified:** `src/routes/watch/[id]/+page.svelte` (4 `const` declarations rewritten as `$derived`)
- **Commit:** `e567f09` (Task 2)
- **Acceptance criteria impact:** The literal `const { video, rail } = data;` is REPLACED by `$derived` calls. All other literal acceptance criteria still present verbatim (year extraction, max-w-5xl wrapper, iframe attrs, conditional description, conditional rail, h1/h2/CategoryTag with href, border-t divider, grid class string).

**4. [Rule 3 - Blocking] adapter-static emits flat `<route>.html`, not `<route>/index.html` (Plan 03-00 contract gap)**

- **Found during:** Task 2 first `pnpm test:prerender` run after `pnpm build`
- **Issue:** SvelteKit 2's default `trailingSlash='never'` causes adapter-static to emit FLAT files: `build/watch/_1DOAi04vaA.html`, `build/work/reel.html`, `build/work.html`. The Plan 03-00 `scripts/test-prerender-coverage.mjs` (which Plan 03-03 and 03-02 inherit) counts SUBDIRECTORIES that contain an `index.html` — it expects `build/watch/<id>/index.html`, `build/work/<slug>/index.html`. Result: the script reports 0/56 + 0/8 + missing `/work/index.html` when in reality 56 + 8 + 1 flat files exist. The Plan 03-03 acceptance criteria also state the literal path `build/watch/264677021/index.html` (directory shape).
- **Root cause:** Plan 03-00's `scripts/test-prerender-coverage.mjs` was authored against the directory-shape canonical convention but the project had no `trailingSlash` configuration, so the default reversed the output shape. Neither Plan 03-00, 03-01, nor 03-02 caught this — the script had never gone GREEN before this point.
- **Fix:** Added `export const trailingSlash = 'always';` to `src/routes/+layout.ts`. This propagates to every route under the root layout (SvelteKit inheritance contract) and tells adapter-static to emit the directory shape. Every URL now ends with `/` (Cloudflare Pages canonical convention).
- **Why this is shared scope:** `+layout.ts` is in neither Plan 03-02's nor Plan 03-03's `files_modified` declaration. Both plans require this fix to satisfy their acceptance criteria + the shared `pnpm test:prerender` gate. This plan owns the fix; the parallel Plan 03-02 also benefits (no merge conflict — the +layout.ts diff is purely additive).
- **Files modified:** `src/routes/+layout.ts` (one `export const trailingSlash` line + an explanatory comment)
- **Commit:** `e567f09` (Task 2)
- **Verification:** After fix, `build/watch/264677021/index.html` exists, 56 directories total under `build/watch/`, 8 under `build/work/`, plus `build/work/index.html`. `pnpm test:prerender` exits 0 with the expected PASS output.

---

**Total deviations:** 4 auto-fixed (2 Rule 1 bugs in literal plan examples; 2 Rule 3 blockers — one is the test-narrowing pattern already established by parallel Plan 03-02, the other exposes a real Plan 03-00 upstream contract gap)
**Impact on plan:** All acceptance criteria met (with the bare-destructure literal replaced by the equivalent `$derived` Svelte 5 idiom). Both `pnpm check` and `pnpm test:prerender` go GREEN for the first time in Phase 3.

## Authentication Gates

None.

## Self-Check: PASSED

All claimed artifacts exist on disk and all claimed commits are reachable in `git log`:

- FOUND: `src/routes/watch/[id]/+page.ts` (contains `import { error } from '@sveltejs/kit';`, `import type { EntryGenerator, PageLoad } from './$types';`, `import { getById, getByCategory, videos } from '$lib/data';`, `export const entries: EntryGenerator`, `videos.map((v) => ({ id: v.id }))`, `const video = getById(params.id);`, `if (!video) error(404,`, `[...getByCategory(video.category)]`, `.filter((v) => v.id !== video.id)`, `b.published.localeCompare(a.published)`, `return { video, rail };`)
- FOUND: `src/routes/watch/[id]/+page.svelte` (contains `import { base } from '$app/paths';`, `import VideoCard`, `import CategoryTag`, `import { categoryToSlug }`, `video.published.slice(0, 4)`, `mx-auto max-w-5xl`, `relative aspect-video bg-neutral-900`, `<iframe`, `src={video.embed}`, `loading="lazy"`, `allowfullscreen`, `allow="autoplay; encrypted-media; picture-in-picture; fullscreen"`, `<h1`, `<CategoryTag category={video.category} href={` … `${base}/work/${categorySlug}` … `} />`, `whitespace-pre-line`, `{#if video.description}`, `{#if rail.length > 0}`, `<h2`, `More in`, `border-t border-white/10`, `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3`)
- FOUND: `src/routes/+error.svelte` (contains `import { base } from '$app/paths';`, `import { page } from '$app/state';`, `Not found`, `` href={`${base}/work`} ``)
- FOUND: `src/routes/+layout.ts` (contains `export const trailingSlash = 'always';`)
- FOUND: `src/routes/watch/[id]/page.test.ts` (no `describe.skip`, no `@ts-expect-error`, top-level `import { load, entries } from './+page';`)
- FOUND commit: `6a0c222` (Task 1 — +page.ts + tests unskipped)
- FOUND commit: `e567f09` (Task 2 — +page.svelte + +error.svelte + trailingSlash)
- VERIFIED: `pnpm check` → 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS (430 files)
- VERIFIED: `pnpm test` → 71 passed | 7 skipped (TopNav owns the 7 skips)
- VERIFIED: `pnpm build` → succeeded, adapter-static emitted all routes
- VERIFIED: `build/watch/264677021/index.html` exists; 56 directories under `build/watch/`
- VERIFIED: `pnpm test:prerender` → PASS (all three thresholds met)

Acceptance criteria literal `const { video, rail } = data;` intentionally NOT present — replaced by Svelte 5 `$derived(data.video)` + `$derived(data.rail)` per Deviation #3 (Rule 1 fix for `state_referenced_locally` warning). All other acceptance literals present verbatim.

## Known Stubs

None for /watch/[id]. The route is fully wired:
- `video.embed` flows from $lib/data → iframe `src` (real)
- `video.title`, `video.uploader`, `video.published`, `video.description`, `video.category` all flow from $lib/data → rendered DOM (real)
- Rail is computed live in load() from real data
- No placeholder text, no mocked components, no hardcoded "coming soon"

The interactive CategoryTag link `/work/<slug>` and the rail-heading link `/work/<slug>` go to a real route that Plan 03-02 landed in parallel commit `e8d4768`. Both directions of the FILT-04 round-trip are live.

## Final State

- `pnpm test` — `Test Files 9 passed | 1 skipped (10); Tests 71 passed | 7 skipped (78)`
- `pnpm check` — `0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS` (430 files)
- `pnpm build` — `Wrote site to "build"` via @sveltejs/adapter-static
- `pnpm test:prerender` — PASS (build/work/index.html present; build/work/<slug>/index.html 8 files; build/watch/<id>/index.html 56 files)
- Goal-backward check (Phase 3 truth 3 — "Clicking any card navigates to /watch/[id], plays the video via its embed URL, and renders a 'More in [Category]' rail"): satisfied at the route + load-fn + page-render layer. The 4 rail tests prove the rail; the iframe `src={video.embed}` proves the player; entries() prerendering 56 ids proves every card target resolves.
- Goal-backward check (Phase 3 truth 4 — "/work/[category] reproduces the filtered view"): closed by the interactive CategoryTag chip linking back to /work/<slug> + the rail heading also linking there — the producer round-trip is wired.

## Next Phase Readiness

Wave 3 (Plan 03-04 TopNav + placeholder routes) can run. The /watch/[id] route is the killer feature endpoint, and it's live. The site-wide `trailingSlash='always'` is in effect — Plan 03-04's TopNav-active-state assertions test literal hrefs (no trailing slash in the props), which is fine because the active-state logic compares `page.url.pathname` and SvelteKit normalizes URLs.

No blockers carried forward. The Plan 03-00 build-artifact coverage script is now GREEN for the first time — every downstream plan can run it as a regression gate.

---
*Phase: 03-grid-filter-watch*
*Completed: 2026-05-11*
