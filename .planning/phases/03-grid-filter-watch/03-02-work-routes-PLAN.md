---
phase: 03-grid-filter-watch
plan: 02
type: execute
wave: 2
depends_on: ["03-00", "03-01"]
files_modified:
  - src/routes/work/+page.ts
  - src/routes/work/+page.svelte
  - src/routes/work/+page.test.ts
  - src/routes/work/[category]/+page.ts
  - src/routes/work/[category]/+page.svelte
  - src/routes/work/[category]/+page.test.ts
autonomous: true
requirements:
  - GRID-01
  - GRID-02
  - GRID-04
  - GRID-05
  - FILT-03
  - FILT-04
must_haves:
  truths:
    - "/work renders all 56 videos as VideoCards inside a responsive `<ul class=\"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3\">` (D-21, D-22)."
    - "/work page has NO heading (D-26 — nav implies 'this is work'), wrapped in `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` container (D-23)."
    - "/work +page.ts `load()` returns videos sorted featured-first then `published` date desc (D-25), as a NEW array — does NOT mutate the shared `videos` export."
    - "/work passes `eager={i < 8}` on the first 8 cards (D-17), all other cards default to lazy."
    - "/work/[category] +page.ts exports `entries: EntryGenerator` returning all 8 category slugs derived from CATEGORIES — prerender enumerates 8 HTML files."
    - "/work/[category] `load()` narrows `params.category` via `slugToCategory(...)`; throws `error(404, 'Category not found')` on unknown slug (D-30)."
    - "/work/[category] returns videos filtered by category, sorted by D-25, plus the resolved `category` value."
    - "/work/[category] page renders the heading `<h1 class=\"... ${categoryAccent(category)}\">${category} (${count})</h1>` in the category's accent color (D-26) above the same responsive grid."
    - "Same `VideoCard` component is used by both routes (no variant — D-27)."
    - "All `describe.skip` blocks in `src/routes/work/+page.test.ts` (1) and `src/routes/work/[category]/+page.test.ts` (2) have had `.skip` removed and turn GREEN."
    - "`pnpm build` emits `build/work/index.html` + 8 `build/work/<slug>/index.html` files."
  artifacts:
    - path: "src/routes/work/+page.ts"
      provides: "Load function: returns sorted videos array (featured first, then date desc)"
      exports: ["load"]
    - path: "src/routes/work/+page.svelte"
      provides: "Unfiltered /work grid — all 56 videos, no page heading, max-w-7xl container"
    - path: "src/routes/work/[category]/+page.ts"
      provides: "entries() returns 8 category slugs; load() narrows slug → Category → filtered videos"
      exports: ["entries", "load"]
    - path: "src/routes/work/[category]/+page.svelte"
      provides: "Filtered /work/[category] grid — heading in accent color + 2/3/4 grid (D-26, D-27)"
  key_links:
    - from: "src/routes/work/+page.svelte"
      to: "src/lib/components/VideoCard.svelte"
      via: "import VideoCard from '$lib/components/VideoCard.svelte'"
      pattern: "import VideoCard from"
    - from: "src/routes/work/[category]/+page.svelte"
      to: "src/lib/components/VideoCard.svelte"
      via: "import VideoCard from '$lib/components/VideoCard.svelte'"
      pattern: "import VideoCard from"
    - from: "src/routes/work/[category]/+page.svelte"
      to: "src/lib/components/categoryAccent.ts"
      via: "import { categoryAccent } from '$lib/components/categoryAccent'"
      pattern: "categoryAccent"
    - from: "src/routes/work/+page.ts"
      to: "$lib/data"
      via: "import { videos } from '$lib/data'"
      pattern: "from\\s+['\"]\\$lib/data['\"]"
    - from: "src/routes/work/[category]/+page.ts"
      to: "$lib/data"
      via: "import { CATEGORIES, categoryToSlug, slugToCategory, getByCategory } from '$lib/data'"
      pattern: "slugToCategory"
    - from: "src/routes/work/[category]/+page.ts"
      to: "@sveltejs/kit"
      via: "import { error } from '@sveltejs/kit'"
      pattern: "error\\(404"
---

<objective>
Build `/work` and `/work/[category]` routes — the unfiltered grid of all 56 videos and the 8 prerendered category-filtered views. Both use the same `VideoCard` component (Plan 03-01) and the same responsive grid container.

Purpose: Wave 2 of Phase 3. Implements GRID-01/02/04/05 (grid + click-through + per-category accent) at the route level and FILT-03/04 (URL-based filter state, deep-linkable). Pairs with Plan 03-03 (watch route) — both run in Wave 2 in parallel because their `files_modified` sets are disjoint.

Output:
- `src/routes/work/+page.ts` — load returns sorted videos array
- `src/routes/work/+page.svelte` — unfiltered grid, no heading
- `src/routes/work/[category]/+page.ts` — `entries()` for 8 slugs + load with `slugToCategory` narrowing
- `src/routes/work/[category]/+page.svelte` — heading in accent color + same responsive grid
- `src/routes/work/+page.test.ts` — 1 describe.skip → describe; 3 tests pass
- `src/routes/work/[category]/+page.test.ts` — 2 describe.skip → describe; 7 tests pass
- `pnpm build` emits `build/work/index.html` + 8 `build/work/<slug>/index.html` files
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-grid-filter-watch/03-CONTEXT.md
@.planning/phases/03-grid-filter-watch/03-RESEARCH.md
@.planning/phases/03-grid-filter-watch/03-VALIDATION.md

<interfaces>
<!-- Phase 1 carry-forward: adapter-static strict, prerender = true in +layout.ts, BASE_PATH wiring. -->
<!-- Phase 2 carry-forward: $lib/data public surface. -->
<!-- Plan 03-01 carry-forward: VideoCard, CategoryTag, categoryAccent helper, app.css colors. -->

From src/lib/data/index.ts (Phase 2):
```ts
export type { Video } from './schema';
export type { Category } from './categories';
export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
export {
  videos,            // readonly Video[] — length 56 in v1
  producerReelId,
  getById,           // (id: string) => Video | undefined
  getByCategory,     // (category: Category) => readonly Video[]
  getCategoriesInDisplayOrder,
  getCategoriesWithCounts,
} from './videos';
```
The `videos` array is `readonly Video[]` — `.toSorted()` returns a NEW array (TypeScript blocks `.sort()` on readonly). After parsing, every Video has `featured: boolean` (D-10 v1 default false), `published: string` (ISO `YYYY-MM-DD`).

From src/lib/components/VideoCard.svelte (Plan 03-01):
```ts
type Props = { video: Video; eager?: boolean };
```
Root element is `<li>` (drops into `<ul class="grid …">` directly).

From src/lib/components/categoryAccent.ts (Plan 03-01):
```ts
export function categoryAccent(category: Category): string;  // returns 'text-cat-pbs' etc.
```

From src/routes/+layout.ts (Phase 1 — DO NOT touch):
```ts
export const prerender = true;
```
Inherited by every route. /work is a static route (prerenders by inheritance). /work/[category] is dynamic — needs explicit `entries()` for `strict: true` (03-RESEARCH.md Pitfall 1).

From svelte.config.js (Phase 1 — DO NOT touch):
- `adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', precompress: false, strict: true })`.

From src/routes/work/+page.test.ts (Plan 03-00 stub):
- 1 describe.skip block: '/work +page.ts load — GRID-02 + D-24 + D-25' (3 tests).
- Tests assert: result.videos.length === 56; featured-first then date-desc ordering; result.videos is a NEW array.

From src/routes/work/[category]/+page.test.ts (Plan 03-00 stub):
- 2 describe.skip blocks:
  - '/work/[category] +page.ts load — FILT-03 (D-29, D-30)' (4 tests: valid slug, all-same-category, unknown-slug-404, sort order)
  - '/work/[category] +page.ts entries — FILT-03 prerender enumeration' (3 tests: 8 entries, slug shape, contains pbs+reel)
- 7 tests total.

The exact slugs the tests reference: `pbs-american-portrait`, `reel`, `does-not-exist`. Verified against `categoryToSlug()`:
- `'PBS American Portrait'` → `pbs-american-portrait`
- `'Reel'` → `reel`

SvelteKit 2 EntryGenerator + PageLoad types (from 03-RESEARCH.md):
```ts
import type { EntryGenerator, PageLoad } from './$types';
// EntryGenerator: () => Array<Record<string, string>> | Promise<Array<...>>
// PageLoad: (event: { params, fetch, url, ... }) => Promise<Data> | Data
```
The route's $types file is regenerated by `svelte-kit sync` (which runs as part of `pnpm check` and `pnpm build`).

Pitfall 2 (noUncheckedIndexedAccess) carry-forward:
- `slugToCategory(slug)` returns `Category | undefined` — MUST narrow with `if (!category) error(404, 'Category not found')` before `getByCategory(category)`.
- The `error()` helper from `@sveltejs/kit` has return type `never`, so narrowing is sound.

Sort key (D-25) — copied verbatim from 03-RESEARCH.md Pattern 5:
```ts
.toSorted((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return b.published.localeCompare(a.published);
})
```
Featured (true) sorts before non-featured (false). Within each group, `b.published.localeCompare(a.published)` puts newer dates first (descending). ISO `YYYY-MM-DD` strings are lexicographically sortable.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build /work route (+page.ts load + +page.svelte unfiltered grid)</name>
  <files>src/routes/work/+page.ts, src/routes/work/+page.svelte, src/routes/work/+page.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-21 single flat grid, D-22 Tailwind default breakpoints 2/3/4 at sm/lg, D-23 max-w-7xl container with px-4 sm:px-6 lg:px-8, D-24 /work shows all 56, D-25 sort rule, D-26 NO heading on /work, D-17 first-8 eager)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 287-313 Pattern 2 responsive grid; lines 552-565 Pattern 7 /work load fn — exact code)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\work\+page.test.ts (Plan 03-00 stub — has 1 describe.skip with 3 tests; remove .skip + @ts-expect-error)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\VideoCard.svelte (Plan 03-01 — root is <li>, accepts {video, eager?})
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\index.ts (Phase 2 — videos export; `.toSorted` returns new array, doesn't mutate)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\+layout.ts (Phase 1 — `export const prerender = true;` already set; do NOT touch)
  </read_first>
  <behavior>
    Test 1 (`'returns all 56 videos (D-24)'`): `load({})` resolves to `{ videos }` where `videos.length === 56`.
    Test 2 (`'sort order: featured first, then published date descending (D-25)'`): all featured-true videos appear before all featured-false; within non-featured the `published` strings are lexicographically descending (newer first).
    Test 3 (`'result.videos is a NEW array (does NOT mutate the shared videos export)'`): `result.videos !== (await import('$lib/data')).videos` (different reference; sort produced a new array).
  </behavior>
  <action>
    Step 1 — Create `src/routes/work/+page.ts` with EXACTLY this content:

    ```ts
    /**
     * /work load — D-24 (all 56 videos) + D-25 (featured-first, then published date desc).
     *
     * The sort is computed in the load function so the prerendered HTML for /work
     * contains the videos in their final display order. Zero client-side JS for ordering.
     *
     * `videos` from $lib/data is `readonly Video[]`; `.toSorted()` returns a NEW
     * (non-readonly) array — required for the page's iteration order. We never
     * mutate the shared export.
     */
    import type { PageLoad } from './$types';
    import { videos } from '$lib/data';

    export const load: PageLoad = () => ({
      videos: [...videos].toSorted((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.published.localeCompare(a.published);
      }),
    });
    ```

    Notes:
    - `[...videos]` first because `videos` is `readonly Video[]`; `.toSorted()` is supported on readonly arrays as of ES2023 but the type narrowing through SvelteKit's PageLoad return is cleaner with a fresh mutable copy. (Either pattern works; spread-first is the more conservative choice.)
    - Featured comparison: `a.featured ? -1 : 1` puts featured BEFORE non-featured in the sorted array.
    - `b.published.localeCompare(a.published)` for descending — note the `b, a` argument order.

    Step 2 — Create `src/routes/work/+page.svelte` with EXACTLY this content:

    ```svelte
    <!--
      /work — unfiltered grid of all 56 videos (D-24). No page heading (D-26).
      Layout: single flat CSS grid (D-21), 2/3/4 responsive (D-22) at Tailwind
      default breakpoints (sm=640, lg=1024), tight YouTube-density gaps (D-05),
      max-w-7xl content container (D-23).

      Cards: <VideoCard> from Plan 03-01. First 8 are eager (D-17); rest lazy.
    -->
    <script lang="ts">
      import type { PageData } from './$types';
      import VideoCard from '$lib/components/VideoCard.svelte';

      let { data }: { data: PageData } = $props();
    </script>

    <svelte:head>
      <title>Michelle Ngo — Work</title>
    </svelte:head>

    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {#each data.videos as video, i (video.id)}
          <VideoCard {video} eager={i < 8} />
        {/each}
      </ul>
    </section>
    ```

    Notes:
    - `(video.id)` keyed each (D-20) — `video.id` is unique within v1.
    - `eager={i < 8}` — first 8 cards (2 rows × 4 cols on desktop, 4 rows × 2 cols on mobile) get `loading="eager"` (D-17).
    - `<svelte:head><title>` sets the per-route page title.
    - NO `<h1>` page heading (D-26).

    Step 3 — In `src/routes/work/+page.test.ts`:

    a. Remove the line `// @ts-expect-error — module exists after Plan 03-02` directly above the `import { load } from './+page';` line.

    b. Change `describe.skip('/work +page.ts load — GRID-02 + D-24 + D-25', () => {` to `describe('/work +page.ts load — GRID-02 + D-24 + D-25', () => {`.

    The top of the file should now read:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { load } from './+page';
    ```

    Step 4 — Run the test file:
    ```
    pnpm vitest run src/routes/work/+page.test.ts
    ```
    Expected: 3 tests pass.

    Step 5 — Run `pnpm check` — expected: exit 0.

    Step 6 — Run `pnpm build` — expected: exit 0, and `build/work/index.html` exists.
  </action>
  <verify>
    <automated>pnpm vitest run src/routes/work/+page.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/work/+page.ts` exists.
    - File contains the literal string `import type { PageLoad } from './$types';`.
    - File contains the literal string `import { videos } from '$lib/data';`.
    - File contains the literal string `export const load: PageLoad = () => ({`.
    - File contains the literal string `[...videos].toSorted(`.
    - File contains the literal string `b.published.localeCompare(a.published)` (descending date sort).
    - File `src/routes/work/+page.svelte` exists.
    - File contains the literal string `import VideoCard from '$lib/components/VideoCard.svelte';`.
    - File contains the literal string `let { data }: { data: PageData } = $props();`.
    - File contains the literal string `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` (D-23 container).
    - File contains the literal string `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3` (D-21, D-22, D-05).
    - File contains the literal string `eager={i < 8}` (D-17).
    - File contains the literal string `{#each data.videos as video, i (video.id)}` (D-20).
    - File does NOT contain `<h1` (D-26 — no page heading on /work). Verifiable: `grep -c "<h1" src/routes/work/+page.svelte` returns 0.
    - `src/routes/work/+page.test.ts` no longer contains `describe.skip`.
    - `src/routes/work/+page.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/routes/work/+page.test.ts` exits 0 with 3 tests passing.
    - `pnpm check` exits 0.
    - `pnpm build` exits 0.
    - After `pnpm build`, file `build/work/index.html` exists.
  </acceptance_criteria>
  <done>
    /work route ships: load returns sorted videos (D-25), page renders 56 cards in 2/3/4 responsive grid (D-21, D-22), max-w-7xl container (D-23), no heading (D-26), first 8 eager (D-17). All 3 load tests pass. `pnpm build` emits `build/work/index.html`.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Build /work/[category] route (+page.ts entries + load + +page.svelte filtered grid)</name>
  <files>src/routes/work/[category]/+page.ts, src/routes/work/[category]/+page.svelte, src/routes/work/[category]/+page.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-26 heading "Category (count)" in accent color, D-27 cards keep their tags on filtered view, D-29 path-param /work/[category], D-30 slug→category narrowing + 404)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 499-550 Pattern 6 — exact entries + load + page.svelte; lines 681-686 Pitfall 1 entries() is mandatory; lines 687-691 Pitfall 2 narrowing)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\work\[category]\+page.test.ts (Plan 03-00 stub — 2 describe.skip blocks with 7 tests)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\index.ts (Phase 2 surface: CATEGORIES, categoryToSlug, slugToCategory, getByCategory)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\categoryAccent.ts (Plan 03-01 — heading color comes from here)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\scripts\test-prerender-coverage.mjs (Plan 03-00 — this task's `pnpm build` should make /work/<slug>/index.html count = 8)
  </read_first>
  <behavior>
    Load (4 tests):
    - Test 1 (`'valid slug returns the matching category and its videos'`): load({params:{category:'pbs-american-portrait'}}) → {category: 'PBS American Portrait', videos.length: 18}.
    - Test 2 (`'all returned videos have category === result.category'`): for 'reel' slug, every video in result.videos has category 'Reel'.
    - Test 3 (`'unknown slug throws 404 (D-30)'`): load with category 'does-not-exist' rejects with status 404.
    - Test 4 (`'videos sorted featured-first then published date desc (D-25)'`): within non-featured, dates descending.

    Entries (3 tests):
    - Test 5 (`'returns exactly 8 entries (one per category)'`): `entries().length === 8`.
    - Test 6 (`'each entry has a non-empty category slug'`): every entry.category matches /^[a-z0-9-]+$/.
    - Test 7 (`'entries include "pbs-american-portrait" and "reel"'`): the slug list contains both.
  </behavior>
  <action>
    Step 1 — Create `src/routes/work/[category]/+page.ts` with EXACTLY this content:

    ```ts
    /**
     * /work/[category] — D-29 path-param filter, D-30 narrowed load.
     *
     * entries(): mandatory under adapter-static strict: true (03-RESEARCH.md Pitfall 1).
     *   Returns one entry per category, derived from the CATEGORIES single source of
     *   truth. Prerenders exactly 8 HTML files (build/work/<slug>/index.html).
     *
     * load(): D-30 — narrows params.category via slugToCategory(). On unknown slug
     *   throws error(404). The `error()` helper from @sveltejs/kit returns `never`
     *   so TypeScript narrows `category` from `Category | undefined` → `Category`
     *   (Phase 1 D-14 / noUncheckedIndexedAccess).
     *
     * Sort: D-25 — featured-first, then published date desc.
     */
    import { error } from '@sveltejs/kit';
    import type { EntryGenerator, PageLoad } from './$types';
    import { CATEGORIES, categoryToSlug, slugToCategory, getByCategory } from '$lib/data';

    export const entries: EntryGenerator = () =>
      CATEGORIES.map((c) => ({ category: categoryToSlug(c) }));

    export const load: PageLoad = ({ params }) => {
      const category = slugToCategory(params.category);
      if (!category) error(404, 'Category not found');

      const filtered = [...getByCategory(category)].toSorted((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.published.localeCompare(a.published);
      });

      return { category, videos: filtered };
    };
    ```

    Notes:
    - `entries` is the EntryGenerator type from `./$types` — SvelteKit emits this from the route filename. It returns `Array<{ category: string }>`.
    - `error(404, 'Category not found')` — the helper THROWS; after this line TS narrows `category` to `Category` (the helper's return type is `never`).
    - `[...getByCategory(category)]` because `getByCategory` returns `readonly Video[]`; `.toSorted()` needs a non-readonly type for the return.

    Step 2 — Create `src/routes/work/[category]/+page.svelte` with EXACTLY this content:

    ```svelte
    <!--
      /work/[category] — D-26 heading "Category (count)" in accent color above the
      same 2/3/4 grid as /work (D-21, D-22). Same VideoCard, no variant (D-27).
    -->
    <script lang="ts">
      import type { PageData } from './$types';
      import VideoCard from '$lib/components/VideoCard.svelte';
      import { categoryAccent } from '$lib/components/categoryAccent';

      let { data }: { data: PageData } = $props();
    </script>

    <svelte:head>
      <title>Michelle Ngo — {data.category}</title>
    </svelte:head>

    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1
        class="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-6 {categoryAccent(
          data.category,
        )}"
      >
        {data.category} ({data.videos.length})
      </h1>
      <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {#each data.videos as video, i (video.id)}
          <VideoCard {video} eager={i < 8} />
        {/each}
      </ul>
    </section>
    ```

    Notes:
    - Heading is `<h1>` (D-19 — page title). Uppercase tracking matches the splash typography pattern from Phase 1.
    - `{categoryAccent(data.category)}` interpolates the same text-cat-* class string used by the chip on cards — consistent color across heading and chips (D-04 single binding source).
    - Count `({data.videos.length})` matches D-26 wording.
    - `eager={i < 8}` — first 8 cards eager (D-17), same as /work.

    Step 3 — In `src/routes/work/[category]/+page.test.ts`:

    a. Remove the line `// @ts-expect-error — module exists after Plan 03-02` directly above the `import { load, entries } from './+page';` line.

    b. Change BOTH `describe.skip(...)` calls to `describe(...)`:
       - `describe.skip('/work/[category] +page.ts load — FILT-03 (D-29, D-30)', ...)` → `describe(...)`
       - `describe.skip('/work/[category] +page.ts entries — FILT-03 prerender enumeration', ...)` → `describe(...)`

    The top of the file should now read:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { load, entries } from './+page';
    ```

    Step 4 — Run the test file:
    ```
    pnpm vitest run src/routes/work/[category]/+page.test.ts
    ```
    Expected: 7 tests pass.

    Step 5 — Run `pnpm check`, `pnpm test`, `pnpm build` to confirm no regression and prerender coverage:
    ```
    pnpm check && pnpm test && pnpm build
    ```
    Expected: all three exit 0. After build, `build/work/index.html` AND `build/work/pbs-american-portrait/index.html` AND `build/work/reel/index.html` (and the other 6 category slug dirs) all exist.

    Step 6 — Sanity-check prerender coverage for /work (the /watch routes don't exist yet in this plan; the script will still report MISSING for those — that's expected):
    ```
    node scripts/test-prerender-coverage.mjs
    ```
    Expected: exit 1 (because /watch hasn't been built — Plan 03-03 owns that). Output should report `build/work/<slug>/index.html count: 8`. Verify the count is exactly 8.
  </action>
  <verify>
    <automated>pnpm vitest run src/routes/work/[category]/+page.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/work/[category]/+page.ts` exists.
    - File contains the literal string `import { error } from '@sveltejs/kit';`.
    - File contains the literal string `import type { EntryGenerator, PageLoad } from './$types';`.
    - File contains the literal string `import { CATEGORIES, categoryToSlug, slugToCategory, getByCategory } from '$lib/data';`.
    - File contains the literal string `export const entries: EntryGenerator = () =>`.
    - File contains the literal string `CATEGORIES.map((c) => ({ category: categoryToSlug(c) }))`.
    - File contains the literal string `export const load: PageLoad = ({ params }) => {`.
    - File contains the literal string `const category = slugToCategory(params.category);`.
    - File contains the literal string `if (!category) error(404,`.
    - File contains the literal string `b.published.localeCompare(a.published)` (descending date sort).
    - File `src/routes/work/[category]/+page.svelte` exists.
    - File contains the literal string `import VideoCard from '$lib/components/VideoCard.svelte';`.
    - File contains the literal string `import { categoryAccent } from '$lib/components/categoryAccent';`.
    - File contains the literal string `{data.category} ({data.videos.length})` (D-26 heading format).
    - File contains the literal string `<h1` (D-19 + D-26 heading present on filtered view).
    - File contains the literal string `{categoryAccent(data.category)}` in the heading class binding (D-26 accent color).
    - File contains the literal string `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3`.
    - File contains the literal string `eager={i < 8}` (D-17).
    - `src/routes/work/[category]/+page.test.ts` no longer contains `describe.skip`.
    - `src/routes/work/[category]/+page.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/routes/work/[category]/+page.test.ts` exits 0 with 7 tests passing.
    - `pnpm test` exits 0 (data 32 + ui VideoCard 14 + CategoryTag 6 + /work 3 + /work/[category] 7 = 62 tests; TopNav 5 + /watch/[id] 10 still skipped).
    - `pnpm check` exits 0.
    - `pnpm build` exits 0.
    - After `pnpm build`: `build/work/index.html` exists; `build/work/pbs-american-portrait/index.html` exists; `build/work/reel/index.html` exists.
    - After `pnpm build`: counting directories under `build/work/` that contain an `index.html`, the count is exactly 8 (one per category slug from CATEGORIES). Verifiable by running `node scripts/test-prerender-coverage.mjs` and inspecting the reported `build/work/<slug>/index.html count:` line — must read `8 files`.
  </acceptance_criteria>
  <done>
    /work/[category] route ships: entries returns 8 slugs, load narrows slug→Category and 404s on unknown, page renders heading in accent color + 2/3/4 grid. All 7 tests pass. `pnpm build` emits 8 `build/work/<slug>/index.html` files. /work/index.html still emits from Task 1.
  </done>
</task>

</tasks>

<verification>
**After both tasks complete:**

1. `pnpm test` exits 0 — 62 tests passing (32 data + 20 components + 10 work routes). TopNav and /watch/[id] stubs still in describe.skip.
2. `pnpm check` exits 0.
3. `pnpm build` exits 0.
4. `ls build/work/` shows: `index.html` (for /work) + 8 subdirectories (one per category), each containing an `index.html`.
5. Specifically: `build/work/pbs-american-portrait/index.html`, `build/work/promos-trailers/index.html`, `build/work/branded-content/index.html`, `build/work/documentary-short-film/index.html`, `build/work/reel/index.html`, `build/work/personal-tribute/index.html`, `build/work/educational-nonprofit/index.html`, `build/work/other/index.html` all exist.
6. `node scripts/test-prerender-coverage.mjs` reports the /work/<slug> count as 8 (the /watch coverage will still be 0 — Plan 03-03 closes that gap).

**Goal-backward check (Phase 3 success criteria 1, 4):**
- Truth 1 ("/work displays all 56 videos as cards with thumbnail, title, category tag, uploader; 2/3/4 responsive"): /work renders 56 VideoCards (each card has thumb + title + tag + uploader from Plan 03-01) in `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` — GRID-01/02/05 ✓
- Truth 4 ("/work/[category] renders only that category's videos and the URL alone reproduces that filtered view on reload or paste"): each /work/<slug>/index.html prerenders just that category's videos — the URL IS the state, no client filter needed — FILT-03/04 ✓ at route level (verified by 8 prerendered HTML files + load tests).

**Coverage notes:**
- GRID-01 — addressed via VideoCard (Plan 03-01) wired in this plan.
- GRID-02 — addressed by the responsive grid classes here.
- GRID-04 — addressed via VideoCard's `<a>` (Plan 03-01) rendered here.
- GRID-05 — addressed via VideoCard's chip (Plan 03-01) AND the /work/[category] heading's accent color (this plan, D-26).
- FILT-03 — addressed by /work/[category] route + entries() + load.
- FILT-04 — addressed by path-param URL = state design + prerender (each filter is a real HTML file).
</verification>

<success_criteria>
Plan 03-02 complete when:
- [ ] `src/routes/work/+page.ts` exists with load returning D-25-sorted videos
- [ ] `src/routes/work/+page.svelte` exists with 2/3/4 grid, no heading, max-w-7xl container, first-8 eager
- [ ] `src/routes/work/[category]/+page.ts` exists with `entries()` (8 slugs) + load (404 on unknown)
- [ ] `src/routes/work/[category]/+page.svelte` exists with D-26 heading in categoryAccent color + same grid
- [ ] All 10 route tests pass (3 in /work + 7 in /work/[category])
- [ ] `pnpm test` exits 0
- [ ] `pnpm check` exits 0
- [ ] `pnpm build` exits 0
- [ ] `build/work/index.html` + 8× `build/work/<slug>/index.html` all exist
</success_criteria>

<output>
After completion, create `.planning/phases/03-grid-filter-watch/03-02-SUMMARY.md` documenting:
- The D-25 sort key (featured-first, then published date desc via `b.published.localeCompare(a.published)`) and its placement in BOTH /work and /work/[category] load functions
- Why `entries()` is mandatory under `adapter-static strict: true` (Pitfall 1) — even though SvelteKit's auto-crawler would discover /work/<slug> URLs from the (eventual) nav links
- The slugToCategory narrowing pattern + error(404) — the `error()` helper's `never` return type narrows `Category | undefined` → `Category` for downstream code
- The shared responsive grid pattern (`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3`) used by both routes — same `VideoCard`, no variant (D-27)
- Eager-loading the first 8 cards (D-17) and the per-row math (2 rows × 4 cols on desktop = 8; 4 rows × 2 cols on mobile = 8)
- The 8 prerendered category slugs and which Phase 5 PBS landing page (deferred) will share this URL space
</output>
</content>
