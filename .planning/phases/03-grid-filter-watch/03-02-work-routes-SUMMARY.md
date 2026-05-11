---
phase: 03-grid-filter-watch
plan: 02
subsystem: routes
tags: [sveltekit, adapter-static, prerender, entries-generator, work-route, category-filter, d-25-sort, trailing-slash, page-load]
one_liner: "Wave 2 /work routes — unfiltered grid of all 56 D-25-sorted videos + 8 prerendered /work/[category] pages with slug-to-Category narrowing and 404; 10 route tests green; build/work/{index,8x<slug>/index}.html emit."
dependency_graph:
  requires:
    - "$lib/data (Phase 2): videos, CATEGORIES, categoryToSlug, slugToCategory, getByCategory, Video type"
    - "$lib/components/VideoCard.svelte (Plan 03-01): root <li>, props {video, eager?}"
    - "$lib/components/categoryAccent (Plan 03-01): categoryAccent(c) → 'text-cat-*' literal"
    - "src/routes/+layout.ts (Phase 1): prerender = true (inherited); Plan 03-03 also added trailingSlash = 'always' here in parallel"
    - "src/routes/work/page.test.ts (Plan 03-00): 1 describe.skip GRID-02 stub"
    - "src/routes/work/[category]/page.test.ts (Plan 03-00): 2 describe.skip FILT-03 stubs"
  provides:
    - "src/routes/work/+page.ts: load() returns [...videos].toSorted by D-25 (featured-first then b.published.localeCompare(a.published) date-desc) as a NEW array (does NOT mutate the readonly $lib/data export)"
    - "src/routes/work/+page.svelte: max-w-7xl container (D-23); grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 (D-21, D-22, D-05); first 8 cards eager (D-17); no <h1> page heading (D-26); keyed each on video.id (D-20)"
    - "src/routes/work/[category]/+page.ts: entries() returns 8 entries CATEGORIES.map(c => ({ category: categoryToSlug(c) })); load() (ASYNC) narrows slugToCategory + error(404) on miss + filtered videos sorted by D-25"
    - "src/routes/work/[category]/+page.svelte: D-26 heading {category} ({count}) in categoryAccent(category) color above same 2/3/4 grid; same VideoCard, no variant (D-27)"
    - "After pnpm build: build/work/index.html + 8x build/work/<slug>/index.html (directory shape via trailingSlash='always' on +layout.ts)"
  affects:
    - "Plan 03-04 (TopNav): nav links to /work/<slug> URLs that now exist as prerendered routes"
    - "Phase 5 (PBS landing): /work/pbs-american-portrait/ already prerenders here; PBS landing will either redirect to that URL or be a Phase-5-owned distinct route"
    - "Cloudflare Pages deploy convention: trailing-slash URLs are now canonical (each /work/<slug>/ has its own index.html)"
tech-stack:
  added: []
  patterns:
    - "Per-route load() sort via .toSorted() over a spread copy: [...videos].toSorted((a, b) => featured-first then b.published.localeCompare(a.published)). Spread first because $lib/data's videos is readonly Video[]; .toSorted() returns a NEW array (never mutates the shared export). Same key copied verbatim into /work/[category]'s load."
    - "EntryGenerator from './$types' enumerated from a single source-of-truth array: export const entries: EntryGenerator = () => CATEGORIES.map(c => ({ category: categoryToSlug(c) })). Required under adapter-static strict:true to make the dynamic [category] segment prerenderable (research Pitfall 1). The 8-entry count is the same 8 CATEGORIES tuple from Phase 2 — adding a category is one line in CATEGORIES, then everything downstream (entries, accent map, color variable) follows."
    - "slugToCategory narrow + error(404) pattern for unknown path-params (D-30): the @sveltejs/kit error() helper has return type `never`, so the if-guard narrows `category` from Category | undefined → Category. Phase 1's noUncheckedIndexedAccess compliance preserved without a non-null bang."
    - "Async load function so the sync `error(404)` throw becomes an awaited promise-rejection that .rejects.toMatchObject({ status: 404 }) can catch (the upstream Plan 03-00 test contract). Sync load would bubble the throw before `await expect(load(...))` resolution — test runner crashes instead of asserting. Functionally identical at runtime (SvelteKit awaits load() either way)."
    - "callLoad() narrow helper in route tests to defeat SvelteKit PageLoad generic widening: `const result = await load(event)` types `result` as `void | (... & Record<string, any>)` which blocks property access; the narrow `if (!result) throw …; return result as { videos: Video[] }` preserves runtime shape under the now-static `import { load }` form. Plan 03-01's downstream contract is to drop the loadXxx() lazy-import indirection — this narrow is the route-test equivalent."
key-files:
  created:
    - src/routes/work/+page.ts
    - src/routes/work/+page.svelte
    - src/routes/work/[category]/+page.ts
    - src/routes/work/[category]/+page.svelte
  modified:
    - src/routes/work/page.test.ts (dropped describe.skip + loadPage() lazy-import indirection; added callLoad() narrow helper; static `import { load } from './+page'`)
    - src/routes/work/[category]/page.test.ts (dropped 2x describe.skip + loadPage() indirection; same callLoad() narrow; static `import { load, entries } from './+page'`)
  unchanged:
    - src/routes/+layout.ts (Plan 03-03 added `trailingSlash = 'always'` here in parallel — NOT this plan's modification)
    - src/lib/components/VideoCard.svelte (Plan 03-01 — consumed verbatim, no variant per D-27)
    - src/lib/components/categoryAccent.ts (Plan 03-01 — heading color comes from here)
    - svelte.config.js (Phase 1 — adapter-static strict:true preserved)
key-decisions:
  - "Made /work/[category] load ASYNC instead of the plan's literal sync signature. Why: upstream Plan 03-00 test asserts the 404 path via `await expect(load(...)).rejects.toMatchObject({ status: 404 })`. A sync load() throwing error(404) would crash the test runner before `await expect(...)` could wrap the throw in a rejection. Async makes the throw an awaited rejection — zero runtime difference (SvelteKit awaits load() either way), but the test contract holds. Rule 1 deviation."
  - "Added callLoad() narrow helper in BOTH route test files. Why: Plan 03-01's downstream contract (drop loadXxx() lazy-import + drop @ts-expect-error) clashes with SvelteKit's PageLoad generic. When `load` is imported with its real type, `await load(event)` widens to `void | (Omit<PageData, ...> & Record<string, any>)` — the union with `void` blocks `.videos`/`.category` access even though the runtime value has the property. The narrow asserts non-void and casts to the real shape. Preserves the static-import contract."
  - "Did NOT add `trailingSlash = 'always'` to /work or /work/[category] +page.ts files. Why: Plan 03-03 added it globally to src/routes/+layout.ts in parallel (inherited by every route). Adding per-route would be redundant. Plan 03-02 explicitly says +layout.ts is owned by Phase 1 / DO NOT touch — the parallel agent's addition is technically a Plan 03-03 deviation, but it's the right place for the setting (one source of truth for the whole site)."
  - "Kept the sort key inline in both load() bodies (NOT extracted to a shared sortByD25 helper). Why: only two call sites; lifting it now would scatter the literal across 3 files (helper + 2 imports) for no DRY win. Phase 4 / 5 may grow more sort needs; defer extraction until there's a third caller (Rule of Three)."
patterns-established:
  - "EntryGenerator pattern: const entries: EntryGenerator = () => SINGLE_SOURCE_OF_TRUTH.map(toEntryObject). CATEGORIES is the source; categoryToSlug(c) is the entry shape. The same shape will be repeated in /watch/[id] with `videos.map(v => ({ id: v.id }))` (Plan 03-03)."
  - "Path-param narrow pattern: pull params.X via slugToX/idToX (Phase 2 narrowing helpers); guard with `if (!narrowed) error(404, '...')` BEFORE downstream use. The error() helper's `never` return type carries narrowing through without non-null bangs."
  - "Per-route test narrow pattern for SvelteKit PageLoad: async callLoad(event): Promise<RealShape> { const r = await load(event); if (!r) throw new Error(...); return r as RealShape }. Use for any route test that calls load directly via static import."
requirements-completed: [GRID-01, GRID-02, GRID-04, GRID-05, FILT-03, FILT-04]
metrics:
  duration_minutes: 6
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 2
  commits:
    - "e8d4768 feat(03-02): add /work route — unfiltered grid + D-25-sorted load"
    - "aebe145 feat(03-02): add /work/[category] route — entries() + slug-narrowed load + filtered grid"
  completed_at: "2026-05-11"
---

# Phase 3 Plan 02: Work Routes Summary

**Wave 2 /work routes — unfiltered grid of all 56 D-25-sorted videos + 8 prerendered /work/[category] pages with slug-to-Category narrowing and 404; 10 route tests green; `build/work/{index,8x<slug>/index}.html` emit.**

## Performance

- **Duration:** ~6 min (executor-only; parallel with Plan 03-03)
- **Started:** 2026-05-11T02:57:26Z
- **Completed:** 2026-05-11T03:03:26Z
- **Tasks:** 2 of 2
- **Files created:** 4 (`/work/+page.{ts,svelte}`, `/work/[category]/+page.{ts,svelte}`)
- **Files modified:** 2 (both test stubs unskipped + static-import + narrow helper)
- **Commits:** 2 task-level commits (no separate RED/GREEN — both tasks executed against pre-existing Plan 03-00 RED stubs)

## Accomplishments

- `/work` route shipped: load returns all 56 videos sorted featured-first then published-date-desc as a NEW array; page renders 56 VideoCards in `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3` inside an `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` container with NO heading and first-8 eager-loaded.
- `/work/[category]` route shipped: `entries()` enumerates exactly 8 category slugs from `CATEGORIES.map(c => ({ category: categoryToSlug(c) }))`; `load()` narrows the slug via `slugToCategory` and throws `error(404)` on unknown slugs; the filtered grid is rendered under a `<h1>` with `categoryAccent(data.category)` text color and "{category} ({count})" label per D-26.
- 10 route tests green (3 /work + 7 /work/[category]) — all upstream Plan 03-00 `describe.skip` blocks removed; both test files migrated to static `import { load }` form with the `callLoad()` narrow helper.
- `pnpm build` emits `build/work/index.html` + 8x `build/work/<slug>/index.html` (directory shape via Plan 03-03's parallel `trailingSlash='always'` addition to `+layout.ts`). `scripts/test-prerender-coverage.mjs` reports PASS at 8 (the threshold) for /work/<slug>.

## Task Commits

Each task was committed atomically with `--no-verify` (parallel execution — orchestrator validates hooks once after both agents finish):

1. **Task 1: Build /work route (+page.ts load + +page.svelte unfiltered grid + unskip GRID-02 + D-24 + D-25 tests)** — `e8d4768` (feat)
2. **Task 2: Build /work/[category] route (+page.ts entries + load + +page.svelte filtered grid + unskip FILT-03 load + entries tests)** — `aebe145` (feat)

_Plan metadata commit (this SUMMARY + STATE/ROADMAP updates) follows separately._

## Files Created/Modified

### Created (4)

- `src/routes/work/+page.ts` — `load()` returns `{ videos: [...videos].toSorted((a, b) => a.featured ? -1 : 1 if differ, else b.published.localeCompare(a.published)) }`. Sync (the upstream /work test doesn't probe rejection behavior). PageLoad-typed.
- `src/routes/work/+page.svelte` — `<svelte:head><title>` + `<section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8>` wrapping `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">` of `<VideoCard {video} eager={i < 8} />` over a keyed each on `video.id`. No `<h1>`.
- `src/routes/work/[category]/+page.ts` — `export const entries: EntryGenerator = () => CATEGORIES.map(c => ({ category: categoryToSlug(c) }))` + ASYNC `load({ params })` narrowing via `slugToCategory(params.category)`, `if (!category) error(404, 'Category not found')`, then `[...getByCategory(category)].toSorted((a, b) => same D-25 key)` returning `{ category, videos: filtered }`.
- `src/routes/work/[category]/+page.svelte` — `<svelte:head><title>Michelle Ngo — {data.category}</title>` + `<h1 class="... {categoryAccent(data.category)}">{data.category} ({data.videos.length})</h1>` above the same 2/3/4 grid (same VideoCard, eager={i < 8}, keyed by video.id).

### Modified (2)

- `src/routes/work/page.test.ts` — dropped `describe.skip` on the 1 GRID-02 + D-24 + D-25 block; replaced runtime-computed dynamic-import (`const spec = './' + '+page'`) with static top-level `import { load } from './+page'`; added small `callLoad()` narrow helper to handle SvelteKit PageLoad's `void | ...` widening; 3 tests pass.
- `src/routes/work/[category]/page.test.ts` — dropped `describe.skip` on BOTH the FILT-03 load (4 tests) AND the FILT-03 entries (3 tests) blocks; replaced runtime-computed dynamic-import with static `import { load, entries } from './+page'`; same `callLoad()` narrow helper; 7 tests pass.

## Decisions Made

### 1. Async load on /work/[category] (Rule 1)

The plan's literal code makes `load` a sync arrow function. The upstream Plan 03-00 test asserts the 404 path via:

```ts
await expect(
  load({ params: { category: 'does-not-exist' } } as Parameters<typeof load>[0])
).rejects.toMatchObject({ status: 404 });
```

This requires `load(event)` to RETURN a Promise that rejects. A sync `load` that throws `error(404)` instead bubbles the exception synchronously BEFORE `await expect(...)` can wrap it — the test runner crashes with an unhandled exception instead of asserting. Async makes the throw an awaited rejection. Zero runtime difference for the happy path (SvelteKit awaits load() either way). Documented as Rule 1 in `+page.ts`.

### 2. callLoad() narrow helper in route tests

Plan 03-01's downstream contract says drop the `loadXxx()` lazy-import indirection AND the `@ts-expect-error` directive when the target module lands. Static `import { load } from './+page'` does that — but TypeScript then sees PageLoad's generic return type, which widens to `void | (Omit<PageData, ...> & Record<string, any>)`. The `void` union blocks `.videos`/`.category` access even though `Record<string, any>` would normally allow it. Adding a small `callLoad(event): Promise<{ videos: Video[] }>` helper with `if (!result) throw …; return result as ...` discards the void branch and preserves the runtime shape. The same pattern is in /watch/[id]/page.test.ts (Plan 03-03 in parallel).

### 3. trailingSlash global, not per-route

Plan 03-03 added `export const trailingSlash = 'always'` to `src/routes/+layout.ts` in parallel — the right place for the setting (one source of truth for the whole site, inherited by all routes). Adding it again per-route on /work and /work/[category] would be redundant + harder to maintain. The /work files contain no `trailingSlash` export — they inherit from the layout. The build produces the canonical directory-shape output: `build/work/index.html` + `build/work/<slug>/index.html`.

### 4. Sort key inline (NOT extracted)

The D-25 sort key (`if (a.featured !== b.featured) return a.featured ? -1 : 1; return b.published.localeCompare(a.published)`) appears VERBATIM in both `/work/+page.ts` and `/work/[category]/+page.ts`. Rule of Three: only two call sites; lifting to a shared helper now would replace one inlined block with one helper-import-call per file (no DRY win), AND create a third file to keep in sync. Defer extraction until Phase 4/5 grows a third caller.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug in literal plan vs upstream test contract] Sync `load` crashed the 404 test**

- **Found during:** Task 2 first verification run (`pnpm vitest run src/routes/work/[category]/page.test.ts`)
- **Issue:** Plan's literal code at line 365 of 03-02-work-routes-PLAN.md: `export const load: PageLoad = ({ params }) => { ... if (!category) error(404, ...); ... };`. Sync function. The upstream Plan 03-00 test (`src/routes/work/[category]/page.test.ts` line 38) asserts: `await expect(load({...})).rejects.toMatchObject({ status: 404 })`. `.rejects` requires `load(...)` to RETURN a rejected promise. A sync `load` that throws bubbles synchronously before `await expect` can wrap it — vitest reports the throw as an unhandled exception. 6/7 tests pass; the 404 test fails.
- **Fix:** Changed `load` signature from `({ params }) => { ... }` to `async ({ params }) => { ... }`. Body is byte-identical. SvelteKit `PageLoad` accepts either form (it always awaits the return). Inline comment in `+page.ts` documents the reasoning.
- **Files modified:** `src/routes/work/[category]/+page.ts` (added `async` keyword + 6-line explanatory comment)
- **Verification:** All 7 tests pass; `pnpm check` clean; `pnpm build` emits the 8 category index.html files.
- **Committed in:** `aebe145` (Task 2 commit)

**2. [Rule 3 - Blocking] Static `import { load }` exposes PageLoad's `void | ...` generic widening**

- **Found during:** Task 1 first verification run (`pnpm check` after writing the planner's literal test code)
- **Issue:** Plan 03-01's downstream contract says replace `loadPage()` lazy-import indirection with static `import { load } from './+page'`. The lazy form returned `any` (untyped — the dynamic-import specifier defeated TS resolution) so `result.videos` was unchecked. The static form types `load` correctly — and then `await load(event)` types `result` as `void | (Omit<PageData, RequiredKeys<T>> & Partial<Pick<PageData, never>> & Record<string, any>)`. The `void` union member blocks `.videos`/`.category` access even though `Record<string, any>` would otherwise allow it. `pnpm check` reports 3 errors in `/work/page.test.ts` (Property 'videos' does not exist on type 'void | ...') + 6 errors in /watch/[id]/page.test.ts (parallel Plan 03-03 hit the same issue).
- **Fix:** Added a small `callLoad(event): Promise<{ videos: Video[] }>` narrow helper to `src/routes/work/page.test.ts` AND `src/routes/work/[category]/page.test.ts`. The helper calls `await load(event)`, throws on `void`, then `as`-casts to the real runtime shape. Test bodies now call `await callLoad(event)` instead of `await load(event)`. The static `import { load }` form is preserved; the narrow is a 7-line addition per test file.
- **Files modified:** `src/routes/work/page.test.ts`, `src/routes/work/[category]/page.test.ts` (the parallel Plan 03-03 applied the same fix to `src/routes/watch/[id]/page.test.ts`)
- **Verification:** `pnpm check` clean (0 errors, 0 warnings). All 10 route tests still pass.
- **Committed in:** `e8d4768` (Task 1 — for /work/page.test.ts) and `aebe145` (Task 2 — for /work/[category]/page.test.ts)
- **Downstream contract update:** Future SvelteKit route tests that statically import `load` should follow this `callLoad()` narrow pattern to handle PageLoad's `void | ...` widening. This is Plan 03-02's addition to the Plan 03-01 downstream contract.

**3. [Rule 3 - Blocking, fixed by parallel agent] `build/work.html` flat shape instead of `build/work/index.html` directory shape**

- **Found during:** Task 1 first `pnpm build` verification
- **Issue:** Plan acceptance criteria require `build/work/index.html` + `build/work/<slug>/index.html` (directory shape). Default `adapter-static` config emits `build/work.html` + `build/work/<slug>.html` (flat-file shape) because `trailingSlash` is unset (`never` default). The Plan 03-00 `scripts/test-prerender-coverage.mjs` counts subdirs-with-index.html — the flat shape fails the count.
- **Fix attempted (later reverted):** Initially added `export const trailingSlash = 'always'` to both `src/routes/work/+page.ts` and `src/routes/work/[category]/+page.ts`. Worked but was redundant once Plan 03-03 (in parallel) added the same setting to `src/routes/+layout.ts` globally. Reverted the per-route additions and inherited the layout's setting.
- **Files modified by THIS plan:** None (the fix lives in `src/routes/+layout.ts` which Plan 03-03 owns this Wave 2).
- **Verification:** `pnpm build` emits 8x `build/work/<slug>/index.html` + `build/work/index.html`. `node scripts/test-prerender-coverage.mjs` reports PASS at the >=8 threshold.
- **Committed in:** Plan 03-03's `e567f09` (the layout change). My route files do NOT export `trailingSlash` (inherited).

---

**Total deviations:** 3 auto-fixed (1 Rule 1 — async-load contract; 2 Rule 3 — type-narrow + build-shape blockers)
**Impact on plan:** All three fixes were necessary for plan acceptance criteria. The async-load and narrow-helper are real Plan 03-00 ⇄ Plan 03-01 ⇄ Plan 03-02 contract gaps; documenting them here unblocks any future SvelteKit route-test author. The trailingSlash fix was handled by the parallel agent — zero net change in my plan's `files_modified` from the original spec.

## Issues Encountered

- **`/watch/[id]` build errors during Task 1 verification** — Plan 03-03 had added `+page.ts` with `entries()` but not yet `+page.svelte`. `pnpm build` failed during /watch prerender. NOT my plan's bug — the per-task `pnpm vitest run src/routes/work/page.test.ts` passed cleanly, and the orchestrator validates `pnpm build` once after both parallel agents finish. Confirmed clean build after both agents committed.

## Authentication Gates

None.

## Known Stubs

None. Both routes render real `$lib/data` content from the start: `/work` shows 56 videos, `/work/[category]` shows the filtered subset (PBS has 18, Reel has 4, etc.). No placeholder text, no mocked data, no "coming soon".

## Self-Check: PASSED

All claimed artifacts exist on disk and all claimed commits are reachable in `git log`:

- FOUND: `src/routes/work/+page.ts` (contains `import type { PageLoad } from './$types';`, `import { videos } from '$lib/data';`, `[...videos].toSorted(`, `b.published.localeCompare(a.published)`)
- FOUND: `src/routes/work/+page.svelte` (contains `import VideoCard from '$lib/components/VideoCard.svelte';`, `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`, `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3`, `eager={i < 8}`, no `<h1`)
- FOUND: `src/routes/work/[category]/+page.ts` (contains `import { error } from '@sveltejs/kit';`, `import type { EntryGenerator, PageLoad } from './$types';`, `CATEGORIES.map((c) => ({ category: categoryToSlug(c) }))`, `const category = slugToCategory(params.category);`, `if (!category) error(404,`)
- FOUND: `src/routes/work/[category]/+page.svelte` (contains `import { categoryAccent } from '$lib/components/categoryAccent';`, `{data.category} ({data.videos.length})`, `{categoryAccent(data.category)}` in heading class)
- FOUND: `src/routes/work/page.test.ts` (no `describe.skip`, no `@ts-expect-error`)
- FOUND: `src/routes/work/[category]/page.test.ts` (no `describe.skip`, no `@ts-expect-error`)
- FOUND commit: `e8d4768` (Task 1 — /work route)
- FOUND commit: `aebe145` (Task 2 — /work/[category] route)

`pnpm vitest run src/routes/work/page.test.ts` → 3/3 pass. `pnpm vitest run "src/routes/work/[category]/page.test.ts"` → 7/7 pass. `pnpm test` → 71 passed | 7 skipped (78 total). `pnpm check` → 0 errors. `pnpm build` → wrote site, emits `build/work/index.html` + 8x `build/work/<slug>/index.html`. `node scripts/test-prerender-coverage.mjs` → PASS at the >=8 threshold.

## Final State

- `pnpm test` — `Test Files 9 passed | 1 skipped (10); Tests 71 passed | 7 skipped (78)` (only TopNav.test.ts remains skipped for Plan 03-04)
- `pnpm check` — `0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS` (430 files)
- `pnpm build` — `Wrote site to "build"` via @sveltejs/adapter-static
- `node scripts/test-prerender-coverage.mjs` — PASS (1 /work/index.html + 8 /work/<slug>/index.html + 56 /watch/<id>/index.html — the last two thanks to Plan 03-03's parallel work)

## Next Phase Readiness

Wave 2 of Phase 3 is complete (paired with Plan 03-03 /watch route). Wave 3 — Plan 03-04 (TopNav + placeholder routes) — can run now. TopNav will:

- Link to `${base}/work/` (the unfiltered grid this plan ships)
- Link to `${base}/work/${categoryToSlug(c)}/` for each of the 8 categories (the prerendered files this plan ships)
- Use `categoryAccent(c)` for active-state highlighting when `page.url.pathname === \`${base}/work/${slug}/\``
- Note the trailing slash on active-state matching — `trailingSlash='always'` makes `/work/pbs-american-portrait/` the canonical URL (the un-slashed form redirects)

No blockers carried forward. The async-load + callLoad() narrow patterns are now established for Plan 03-04's TopNav.test.ts (which uses `mount(TopNav, ...)` and doesn't hit PageLoad — but the patterns are documented here for future route tests).

---
*Phase: 03-grid-filter-watch*
*Completed: 2026-05-11*
