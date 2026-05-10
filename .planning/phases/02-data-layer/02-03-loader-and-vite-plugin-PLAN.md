---
phase: 02-data-layer
plan: 03
type: execute
wave: 3
depends_on: ["02-01", "02-02"]
files_modified:
  - src/lib/data/videos.ts
  - src/lib/data/index.ts
  - src/lib/data/videos.test.ts
  - vite.config.ts
  - package.json
autonomous: true
requirements:
  - DATA-01
  - DATA-03
  - DATA-04
must_haves:
  truths:
    - "`$lib/data` exposes a typed `videos: readonly Video[]` array of length 56 (no hidden filtered out in v1, but the filter path runs)."
    - "`$lib/data` exposes the literal constant `producerReelId = '264677021'` (D-09) and it resolves to a real video in the public array (D-11)."
    - "`getById(id)` returns `Video | undefined` (noUncheckedIndexedAccess narrowing — Phase 1 D-14)."
    - "`getByCategory(category)` returns the correct count for each category — PBS=18, Reel=4, etc."
    - "`getCategoriesInDisplayOrder()` returns the exact D-04 sequence: [PBS, Promos, Branded, Doc, Reel, Educational, Other, Personal] (count desc, ties alpha)."
    - "`getCategoriesWithCounts()` returns 8 entries with `category`, `slug`, `count` populated."
    - "Hidden videos (D-14) are excluded from `videos` and from category counts — no inflation of category chips."
    - "`vite.config.ts` registers a `validate-videos` plugin that runs `VideoArraySchema.parse()` in `buildStart` and calls `this.error(z.prettifyError(...))` on failure."
    - "`pnpm build` exits 0 on the canonical (clean) `videos.json`."
    - "`scripts/test-build-fails.mjs` exits 0 (which means the corrupt → build → restore loop confirms `pnpm build` exits non-zero on a corrupted record — DATA-03 enforced at the build pipeline)."
    - "All `describe.skip` blocks in `videos.test.ts` have had `.skip` removed and turn GREEN."
  artifacts:
    - path: "src/lib/data/videos.ts"
      provides: "Typed loader: imports videos.json, parses through VideoArraySchema, exports videos + helpers"
      exports: ["videos", "allVideos", "producerReelId", "getById", "getByCategory", "getCategoriesInDisplayOrder", "getCategoriesWithCounts"]
    - path: "src/lib/data/index.ts"
      provides: "Public $lib/data surface — re-exports types and helpers from categories.ts, schema.ts, videos.ts"
      exports: ["Video", "Category", "CATEGORIES", "categoryToSlug", "slugToCategory", "videos", "producerReelId", "getById", "getByCategory", "getCategoriesInDisplayOrder", "getCategoriesWithCounts"]
    - path: "vite.config.ts"
      provides: "Inline validateVideosPlugin() registered before sveltekit() — buildStart hook fails build on schema violation"
      contains: "function validateVideosPlugin"
    - path: "package.json"
      provides: "test:build-fails npm script wiring the smoke test"
      contains: "\"test:build-fails\": \"node scripts/test-build-fails.mjs\""
  key_links:
    - from: "src/lib/data/videos.ts"
      to: "src/lib/data/videos.json"
      via: "import rawVideos from './videos.json'"
      pattern: "from\\s+['\"]\\./videos\\.json['\"]"
    - from: "src/lib/data/videos.ts"
      to: "src/lib/data/schema.ts"
      via: "VideoArraySchema.parse(rawVideos)"
      pattern: "VideoArraySchema"
    - from: "src/lib/data/index.ts"
      to: "src/lib/data/videos.ts"
      via: "re-export public loader surface"
      pattern: "from\\s+['\"]\\./videos['\"]"
    - from: "vite.config.ts"
      to: "src/lib/data/schema.ts"
      via: "import { VideoArraySchema } from './src/lib/data/schema'"
      pattern: "VideoArraySchema"
    - from: "vite.config.ts"
      to: "src/lib/data/videos.json"
      via: "readFileSync(resolve(__dirname, 'src/lib/data/videos.json'))"
      pattern: "videos\\.json"
---

<objective>
Wire the typed loader, the public `$lib/data` surface, and the Vite plugin that fails `pnpm build` on schema violation. This closes Phase 2 — every later phase consumes `import { videos, producerReelId, getByCategory, ... } from '$lib/data'`.

Purpose: Implements DATA-01 (loader exposes typed array, no runtime fetch), DATA-03 (build pipeline fails on schema violation — the canonical proof for the success criterion), DATA-04 (loader honors the closed category list end-to-end via the slug helpers). Also lands the cross-cutting decisions: D-04 (display order), D-09 (producerReelId), D-11 (reel stays in public array), D-14 (hidden filtering).

Output:
- `src/lib/data/videos.ts` — loader: import JSON, parse, expose `videos` + helpers
- `src/lib/data/index.ts` — replaces the Phase 1 stub; re-exports the public surface
- `vite.config.ts` — adds inline `validateVideosPlugin()` registered before `sveltekit()`
- `package.json` — adds `"test:build-fails"` script
- `videos.test.ts` — `.skip` removed across 6 describe blocks, all GREEN
- `pnpm build` exits 0 on clean data, exits non-zero on corrupted data (proven by `scripts/test-build-fails.mjs`)
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-data-layer/02-CONTEXT.md
@.planning/phases/02-data-layer/02-RESEARCH.md
@.planning/phases/02-data-layer/02-VALIDATION.md

<interfaces>
<!-- Plan 02-01 created categories.ts + schema.ts. -->
<!-- Plan 02-02 created videos.json (56 records, validates against schema). -->
<!-- Plan 02-00 created videos.test.ts with 6 describe.skip blocks AND scripts/test-build-fails.mjs. -->

From src/lib/data/categories.ts (Plan 02-01):
```ts
export const CATEGORIES: readonly [...8 strings...] as const;
export type Category = (typeof CATEGORIES)[number];
export function categoryToSlug(category: Category): string;
export function slugToCategory(slug: string): Category | undefined;
```

From src/lib/data/schema.ts (Plan 02-01):
```ts
export const CategorySchema = z.enum(CATEGORIES);
export const VideoSchema = z.discriminatedUnion('source', [...]);
export const VideoArraySchema = z.array(VideoSchema);
export type Video = z.infer<typeof VideoSchema>;
```
After parse, every Video has: `source, id, title, uploader, published, thumbnail, embed, category, featured (bool), hidden (bool), tags (string[])` plus optional `url, description, duration_seconds, credits`.

From src/lib/data/videos.json (Plan 02-02):
- Top-level JSON array, 56 records.
- Imported via Vite's first-class JSON support: `import rawVideos from './videos.json'` returns the parsed object/array (not a string).

From src/lib/data/videos.test.ts (Plan 02-00 stub):
- 6 describe.skip blocks:
  - 'loader: videos array' (2 tests: length=56, hidden filtered)
  - 'loader: producerReelId (D-09)' (2 tests: literal value, resolves to a video)
  - 'loader: getById' (2 tests: hit, miss)
  - 'loader: getByCategory' (2 tests: PBS=18, Reel=4)
  - 'loader: display order (D-04)' (3 tests: PBS first, ties alpha, full sequence)
  - 'loader: getCategoriesWithCounts' (1 test: 8 entries)

From scripts/test-build-fails.mjs (Plan 02-00):
- Exists, dependency-free Node ESM.
- Corrupts videos.json[0].category, runs `pnpm build`, restores file, exits 0 only if build exited non-zero.

From src/lib/index.ts (Phase 1 stub — currently `export {};`):
- Stays minimal. Plan 02-03 puts the data exports under `src/lib/data/index.ts` (importable as `$lib/data`), not `src/lib/index.ts`.
- The path `$lib/data` resolves to `src/lib/data/index.ts` via SvelteKit's auto-generated `$lib` alias (no manual config).

From vite.config.ts (current — Plan 02-00 added the test block):
```ts
/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: { ...vitest config... },
});
```
Plan 02-03 inserts `validateVideosPlugin()` BEFORE `sveltekit()` (ordering: tailwind, validate-videos, sveltekit). The plugin is defined inline in this file (no separate file) — keeps the surface area minimal.

From svelte.config.js (Phase 1 — DO NOT touch):
- adapter-static with `strict: true`.
- `prerender = true` already set in `src/routes/+layout.ts`.

Phase 1 STATE pinning convention (carry-forward):
- All deps EXACT (no caret/tilde). No new deps in this plan — Vite is already installed (8.0.7), Zod is installed by Plan 02-01 (4.4.3).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create src/lib/data/videos.ts (typed loader with all helpers)</name>
  <files>src/lib/data/videos.ts, src/lib/data/index.ts, src/lib/data/videos.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\schema.ts (Plan 02-01 — VideoArraySchema is what the loader calls; Video type is what it exports)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\categories.ts (Plan 02-01 — CATEGORIES + categoryToSlug imported by getCategoriesWithCounts)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\videos.json (Plan 02-02 — the JSON the loader imports)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\videos.test.ts (Wave 0 stub — has 6 describe.skip blocks; this task removes .skip and removes @ts-expect-error)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 292-376 Pattern 4 — exact loader implementation with display-order memoization and hidden filtering)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-CONTEXT.md (D-04 display order, D-09 producerReelId, D-11 reel in public array, D-14 hidden filtering)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\index.ts (current Phase 1 stub — leave it alone; the public surface goes in src/lib/data/index.ts which is `$lib/data`)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\tsconfig.json (Phase 1 — `noUncheckedIndexedAccess: true` — `getById` MUST return `Video | undefined`)
  </read_first>
  <behavior>
    Test 1 (`'videos array length is 56'`): `videos.length === 56` (no hidden in v1, so no filtering happens).
    Test 2 (`'hidden videos filtered (D-14)'`): every video in the public `videos` array has `v.hidden === false` (the D-08 default, materialized by the loader's `.parse()` call — proves Pitfall 2 is avoided).
    Test 3 (`'producerReelId is the literal "264677021"'`): `producerReelId === '264677021'`.
    Test 4 (`'producerReelId resolves to a real video'`): `videos.find(v => v.source === 'vimeo' && v.id === producerReelId)` is defined and has `category === 'Reel'` (D-11).
    Test 5 (`'getById returns the matching video'`): `getById('264677021')?.title.toLowerCase().includes('reel')`.
    Test 6 (`'getById returns undefined for unknown id'`): `getById('does-not-exist') === undefined` (proves the type is `Video | undefined`).
    Test 7 (`'getByCategory PBS = 18'`): `getByCategory('PBS American Portrait').length === 18`.
    Test 8 (`'getByCategory Reel = 4'`): `getByCategory('Reel').length === 4`.
    Test 9 (`'display order: PBS first'`): `getCategoriesInDisplayOrder()[0] === 'PBS American Portrait'`.
    Test 10 (`'display order: ties broken alphabetically'`): the three tied-at-3 categories appear as `['Educational / Nonprofit', 'Other', 'Personal / Tribute']`.
    Test 11 (`'display order: full sequence per D-04'`): full array equals `['PBS American Portrait', 'Promos & Trailers', 'Branded Content', 'Documentary / Short Film', 'Reel', 'Educational / Nonprofit', 'Other', 'Personal / Tribute']`.
    Test 12 (`'getCategoriesWithCounts returns 8 entries'`): 8-element array, the PBS entry has `slug: 'pbs-american-portrait', count: 18`.
  </behavior>
  <action>
    Step 1 — Create `src/lib/data/videos.ts` with EXACTLY this content:

    ```ts
    /**
     * Typed loader for the video data layer — the public $lib/data surface.
     *
     * Why parse here even though the Vite plugin already validated:
     *   1. Zod's .default() values (D-08: featured, hidden, tags) only apply during
     *      a parse() call. A raw JSON import has them undefined. We need them
     *      materialized so consumers can read v.featured / v.hidden / v.tags safely
     *      (Pitfall 2 in 02-RESEARCH.md).
     *   2. Belt-and-suspenders: if someone bypasses the Vite plugin (e.g., direct
     *      vitest import), the loader still validates.
     *
     * Why this is build-time-only on a prerendered site:
     *   adapter-static prerenders every route. Routes import from $lib/data.
     *   Zod runs once at build time per route, never ships to client.
     *   (Phase 1 RESEARCH confirms zero runtime fetch / minimal client bundle.)
     *
     * noUncheckedIndexedAccess (Phase 1 D-14):
     *   getById returns `Video | undefined`. Every Phase 3+ caller MUST narrow
     *   (e.g., `if (!video) return error(404, 'not found')`).
     *
     * Cross-cutting decisions implemented here:
     *   D-04 — getCategoriesInDisplayOrder() returns count-desc, ties-alpha.
     *   D-09 — producerReelId is the literal '264677021' (Vimeo).
     *   D-11 — the reel video stays in the public `videos` array (not stripped).
     *   D-14 — hidden videos filtered from `videos`; full set available via `allVideos`
     *          (NOT re-exported from $lib/data in v1; reserved for future tooling).
     */
    import rawVideos from './videos.json';
    import { VideoArraySchema, type Video } from './schema';
    import { CATEGORIES, type Category, categoryToSlug } from './categories';

    // Parse once at module load. The Vite plugin validates separately at buildStart
    // (vite.config.ts) — this parse here applies the Zod defaults from D-08.
    const _parsed: readonly Video[] = VideoArraySchema.parse(rawVideos);

    /** Full public dataset (D-14: hidden videos filtered out). */
    export const videos: readonly Video[] = _parsed.filter((v) => !v.hidden);

    /**
     * All videos, INCLUDING hidden. Reserved for future internal tooling
     * (sitemap, admin views). NOT re-exported from src/lib/data/index.ts in v1.
     * Defer adding a `getAllVideosIncludingHidden()` helper until a caller exists.
     */
    export const allVideos: readonly Video[] = _parsed;

    /**
     * D-09: Producer's reel video ID (Vimeo). Phase 4's PLAY REEL CTA reads this
     * directly. D-11 confirms this video also stays in the public `videos` array
     * (and in the 'Reel' category filter).
     */
    export const producerReelId = '264677021' as const;

    /**
     * Returns the matching video by id (across both sources), or undefined.
     * Note: return type is `Video | undefined` because of noUncheckedIndexedAccess
     * — Phase 3+ callers must narrow with `if (!video)` before accessing fields.
     */
    export function getById(id: string): Video | undefined {
      return videos.find((v) => v.id === id);
    }

    /**
     * Returns all public videos in the given category. Hidden videos are already
     * excluded (D-14) because they're filtered out of `videos` upstream.
     */
    export function getByCategory(category: Category): readonly Video[] {
      return videos.filter((v) => v.category === category);
    }

    /**
     * D-04: Categories in display order (count descending, ties broken alphabetically).
     * Computed once at module load from the validated public dataset (so hidden videos
     * don't inflate counts, per D-14).
     */
    const _categoriesInDisplayOrder: readonly Category[] = (() => {
      const counts = new Map<Category, number>();
      for (const c of CATEGORIES) counts.set(c, 0);
      for (const v of videos) counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
      return [...CATEGORIES].sort((a, b) => {
        const diff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
        return diff !== 0 ? diff : a.localeCompare(b);
      });
    })();

    export function getCategoriesInDisplayOrder(): readonly Category[] {
      return _categoriesInDisplayOrder;
    }

    /**
     * Returns each category in display order with its slug and live video count.
     * Phase 3 nav consumes this to render the category chips with counts.
     */
    export function getCategoriesWithCounts(): ReadonlyArray<{
      category: Category;
      slug: string;
      count: number;
    }> {
      return _categoriesInDisplayOrder.map((category) => ({
        category,
        slug: categoryToSlug(category),
        count: videos.filter((v) => v.category === category).length,
      }));
    }
    ```

    Step 2 — Create `src/lib/data/index.ts` (this is the `$lib/data` public surface) with EXACTLY this content:

    ```ts
    /**
     * Public surface for the data layer — `import { ... } from '$lib/data'`.
     *
     * Re-exports types (from schema.ts and categories.ts) and the typed loader
     * (from videos.ts). Every Phase 3+ route imports from here, NOT directly
     * from videos.ts/schema.ts/categories.ts (single import path = single point
     * to refactor if the internal structure changes).
     */
    export type { Video } from './schema';
    export type { Category } from './categories';
    export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
    export {
      videos,
      producerReelId,
      getById,
      getByCategory,
      getCategoriesInDisplayOrder,
      getCategoriesWithCounts,
    } from './videos';
    ```

    Do NOT export `allVideos` from this file (D-14: future tooling only; no caller in v1).
    Do NOT export `VideoSchema` or `VideoArraySchema` from this file (the schema is build-time only; routes consume parsed data, not schemas).
    Do NOT modify `src/lib/index.ts` — it stays at the Phase 1 stub `export {};`. Routes use `$lib/data`, not `$lib`.

    Step 3 — In `src/lib/data/videos.test.ts`:

    a. Remove the line `// @ts-expect-error — module exists after Plan 02-03` directly above the `import { ... } from './videos';` import block. The directive will fire "unused" if left.

    b. Find ALL SIX `describe.skip(...)` calls and replace each with `describe(...)`. Specifically:
       - `describe.skip('loader: videos array', ...)` → `describe('loader: videos array', ...)`
       - `describe.skip('loader: producerReelId (D-09)', ...)` → `describe(...)`
       - `describe.skip('loader: getById', ...)` → `describe(...)`
       - `describe.skip('loader: getByCategory', ...)` → `describe(...)`
       - `describe.skip('loader: display order (D-04)', ...)` → `describe(...)`
       - `describe.skip('loader: getCategoriesWithCounts', ...)` → `describe(...)`

    The file should now start:

    ```ts
    import { describe, expect, it } from 'vitest';
    import {
      videos,
      producerReelId,
      getById,
      getByCategory,
      getCategoriesInDisplayOrder,
      getCategoriesWithCounts,
    } from './videos';

    describe('loader: videos array', () => {
    ```

    Step 4 — Run the loader test file:
    ```
    pnpm vitest run src/lib/data/videos.test.ts
    ```
    Expected: 12 tests pass (the count from the behavior block above).

    Step 5 — Run the full data-layer suite:
    ```
    pnpm vitest run src/lib/data/
    ```
    Expected: 32 passing total (10 schema + 5 categories + 5 videos.json + 12 videos), 0 skipped.

    Step 6 — Run `pnpm check`. Expected: 0 TS errors. The `_parsed.filter((v) => !v.hidden)` line produces `readonly Video[]` plainly — `.filter()` returns the same element type; no narrowing is involved.

    (Aliased re-import `$lib/data` is exercised by vitest at runtime — `videos.test.ts` imports from `./videos`, which is re-exported via `index.ts`. No additional alias-smoke step needed; if explicit alias proof is ever desired in the future, add a tiny TS smoke file `src/lib/data/__alias_smoke__.ts` containing `import { videos } from '$lib/data'; export const _smoke = videos.length;` covered by `pnpm check`. Optional — not required by this plan.)
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/data/videos.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/data/videos.ts` exists.
    - File contains the literal string `import rawVideos from './videos.json';`.
    - File contains the literal string `import { VideoArraySchema, type Video } from './schema';`.
    - File contains the literal string `const _parsed: readonly Video[] = VideoArraySchema.parse(rawVideos);`.
    - File contains the literal string `export const videos: readonly Video[] = _parsed.filter((v) => !v.hidden);`.
    - File contains the literal string `export const producerReelId = '264677021' as const;`.
    - File contains the literal string `export function getById(id: string): Video | undefined {`.
    - File contains the literal string `export function getByCategory(category: Category): readonly Video[] {`.
    - File contains the literal string `export function getCategoriesInDisplayOrder(): readonly Category[] {`.
    - File contains the literal string `export function getCategoriesWithCounts(): ReadonlyArray<{`.
    - File contains the literal string `a.localeCompare(b)` (D-04 alphabetical tie-break).
    - File `src/lib/data/index.ts` exists.
    - File contains the literal string `export type { Video } from './schema';`.
    - File contains the literal string `export type { Category } from './categories';`.
    - File contains the literal string `export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';`.
    - File contains the literal string `export {` followed by `videos,` AND `producerReelId,` AND `getById,` AND `getByCategory,` AND `getCategoriesInDisplayOrder,` AND `getCategoriesWithCounts,` AND `} from './videos';`.
    - File does NOT export `allVideos` or `VideoSchema` or `VideoArraySchema` (verifiable: `grep -E "allVideos|VideoSchema|VideoArraySchema" src/lib/data/index.ts` returns 0 matches).
    - `src/lib/index.ts` is BYTE-IDENTICAL to its pre-task state (the Phase 1 stub `export {};` — DO NOT modify).
    - `src/lib/data/videos.test.ts` no longer contains `describe.skip` (count = 0).
    - `src/lib/data/videos.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/lib/data/videos.test.ts` exits 0 with all 12 tests passing.
    - `pnpm vitest run src/lib/data/` exits 0 with 32 passing, 0 skipped.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    The typed loader exposes `videos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts` from `$lib/data`. All 12 loader tests pass. Cross-cutting decisions D-04 / D-09 / D-11 / D-14 are all implemented and verified.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire validateVideosPlugin in vite.config.ts (DATA-03 build-pipeline enforcement)</name>
  <files>vite.config.ts, package.json</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\vite.config.ts (current — Plan 02-00 added the test block; Plan 02-03 inserts the plugin BEFORE sveltekit())
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\schema.ts (Plan 02-01 — VideoArraySchema is what the plugin imports)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 247-289 Pattern 3 — exact validateVideosPlugin implementation; lines 426-435 Pitfall 1 — schema must stay pure; the plugin reads JSON via readFileSync, NOT through the schema module)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-VALIDATION.md (the row "Plan 02-03 / DATA-03 / pnpm build exits non-zero when videos.json is corrupted" — `node scripts/test-build-fails.mjs` is the canonical proof)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\package.json (current scripts block — append `"test:build-fails"` after `"test:data"`)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\scripts\test-build-fails.mjs (Plan 02-00 — already exists; this task wires it via `pnpm test:build-fails`)
  </read_first>
  <action>
    Step 1 — Replace the entire contents of `vite.config.ts` with EXACTLY this:

    ```ts
    /// <reference types="vitest/config" />
    import { sveltekit } from '@sveltejs/kit/vite';
    import { defineConfig, type Plugin } from 'vite';
    import tailwindcss from '@tailwindcss/vite';
    import { z } from 'zod';
    import { readFileSync } from 'node:fs';
    import { resolve, dirname } from 'node:path';
    import { fileURLToPath } from 'node:url';
    import { VideoArraySchema } from './src/lib/data/schema';

    const __dirname = dirname(fileURLToPath(import.meta.url));

    /**
     * DATA-03: Fail `pnpm build` (and `pnpm dev` server start) on a schema violation
     * in src/lib/data/videos.json. Runs in `buildStart`, the canonical Rollup-compatible
     * lifecycle hook for fail-fast pre-bundle validation.
     *
     * Why a Vite plugin (not +layout.ts load throwing during prerender):
     *   - Plugin runs BEFORE any module evaluation → faster failure, cleaner stack.
     *   - this.error() prints directly to the terminal (no SvelteKit prerender wrapper).
     *   - Single non-zero exit code is guaranteed by the Rollup contract.
     *
     * Why z.prettifyError (not z.formatError):
     *   - Zod 4 deprecated z.formatError; prettifyError gives "✖ ... · at [3].category"
     *     output that points at the bad row by index — exactly what DATA-03's
     *     "readable error pointing at the bad row" criterion requires.
     *
     * Why we ALSO check (source, id) uniqueness here:
     *   - Cross-row constraint can't live in a per-record Zod schema. The schema in
     *     videos.json.test.ts asserts the same thing in vitest, but the plugin
     *     enforces it at build time too (defense in depth).
     */
    function validateVideosPlugin(): Plugin {
      return {
        name: 'validate-videos',
        buildStart() {
          const path = resolve(__dirname, 'src/lib/data/videos.json');
          let raw: unknown;
          try {
            raw = JSON.parse(readFileSync(path, 'utf-8'));
          } catch (e) {
            this.error(`videos.json is not valid JSON: ${(e as Error).message}`);
            return; // unreachable — this.error throws
          }

          const result = VideoArraySchema.safeParse(raw);
          if (!result.success) {
            const pretty = z.prettifyError(result.error);
            this.error(`videos.json failed schema validation:\n${pretty}`);
            return; // unreachable
          }

          // Cross-row constraint: (source, id) must be unique across all records.
          const seen = new Set<string>();
          for (const v of result.data) {
            const key = `${v.source}:${v.id}`;
            if (seen.has(key)) {
              this.error(`videos.json: duplicate (source, id) pair: ${key}`);
              return; // unreachable
            }
            seen.add(key);
          }
        },
      };
    }

    export default defineConfig({
      // Plugin order matters: tailwindcss before sveltekit (Phase 1 Pattern 1);
      // validateVideosPlugin can sit anywhere before sveltekit but we put it
      // immediately before sveltekit() so the validation failure aborts the
      // build BEFORE Svelte starts compiling routes that import the data.
      plugins: [tailwindcss(), validateVideosPlugin(), sveltekit()],
      test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
        environment: 'node',
        globals: false,
        coverage: {
          provider: 'v8',
          reporter: ['text', 'html'],
          include: ['src/lib/data/**/*.ts'],
          exclude: ['src/lib/data/**/*.test.ts'],
        },
      },
    });
    ```

    NOTES on this file:
    - Plugin order is tailwind → validate-videos → sveltekit. Phase 1 Pattern 1 mandates `tailwindcss()` BEFORE `sveltekit()`; we keep that and slot validate-videos between them.
    - The `import { VideoArraySchema } from './src/lib/data/schema';` works because Vite uses Vite-Node to evaluate `vite.config.ts` and natively handles TS imports. NO transpile step needed.
    - The plugin reads `videos.json` via `readFileSync` — NOT via an import from the schema module. This preserves Pitfall 1 (schema.ts stays pure: zero JSON imports).
    - Vitest's `defineConfig` accepts the `test` block thanks to the `/// <reference types="vitest/config" />` triple-slash. Plan 02-00 already added it.

    Step 2 — Add the `test:build-fails` script to `package.json` `scripts` block (insert immediately after the existing `"test:data"` line):

    ```json
    "test:build-fails": "node scripts/test-build-fails.mjs",
    ```

    Do NOT touch any other script.

    Step 3 — Confirm clean build still works:
    ```
    pnpm build
    ```
    Expected: exit 0. The plugin's `buildStart` runs, validates the canonical 56-record file, finds nothing wrong, and the build completes. Build output goes to `build/` (Phase 1 adapter-static config).

    Step 4 — Confirm DATA-03 enforcement at the build pipeline:
    ```
    pnpm test:build-fails
    ```
    Expected: exit 0. The script:
      1. Backs up `videos.json` to `videos.json.smoke-backup`.
      2. Corrupts `videos.json[0].category` to `'Gibberish — Not A Real Category'`.
      3. Runs `pnpm build`, which now fails because the plugin throws via `this.error()`.
      4. Restores `videos.json` from the backup.
      5. Exits 0 because the corrupted-build's exit code was non-zero (which is the desired behavior — DATA-03 enforced).

    Verify the file actually got restored: `node -e "console.log(JSON.parse(require('node:fs').readFileSync('src/lib/data/videos.json','utf-8')).length)"` should print `56`.

    Step 5 — Run the full vitest suite + check + build to confirm no regressions:
    ```
    pnpm vitest run && pnpm check && pnpm build
    ```
    Expected: all three exit 0.
  </action>
  <verify>
    <automated>pnpm test:build-fails</automated>
  </verify>
  <acceptance_criteria>
    - `vite.config.ts` contains the literal string `function validateVideosPlugin(): Plugin {`.
    - `vite.config.ts` contains the literal string `name: 'validate-videos'`.
    - `vite.config.ts` contains the literal string `buildStart() {`.
    - `vite.config.ts` contains the literal string `import { VideoArraySchema } from './src/lib/data/schema';`.
    - `vite.config.ts` contains the literal string `z.prettifyError(result.error)`.
    - `vite.config.ts` contains the literal string `this.error(`.
    - `vite.config.ts` contains the literal string `duplicate (source, id) pair` (cross-row uniqueness check).
    - `vite.config.ts` plugin order: `tailwindcss()` appears BEFORE `validateVideosPlugin()` which appears BEFORE `sveltekit()` in the plugins array. Verifiable: `grep -n "tailwindcss\\|validateVideosPlugin\\|sveltekit" vite.config.ts` returns line numbers in that order.
    - `package.json` `scripts` contains the literal line `"test:build-fails": "node scripts/test-build-fails.mjs"`.
    - `pnpm build` exits 0 (canonical videos.json validates).
    - `pnpm test:build-fails` exits 0 (proves: build exits non-zero on corrupted JSON, then file is restored).
    - After `pnpm test:build-fails` runs, `JSON.parse(readFileSync('src/lib/data/videos.json')).length === 56` (file restored).
    - `pnpm vitest run` exits 0 with 32 passing tests.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    The Vite plugin enforces DATA-03 at the build pipeline: `pnpm build` exits 0 on clean data and exits non-zero on schema violations (proven by `pnpm test:build-fails` exiting 0). All 32 vitest tests still pass. Plugin lives inline in `vite.config.ts`; schema module stays pure (Pitfall 1 preserved).
  </done>
</task>

</tasks>

<verification>
**After both tasks complete:**

1. `pnpm vitest run src/lib/data/` exits 0 with 32 passing tests (10 schema + 5 categories + 5 videos.json + 12 videos), 0 skipped.
2. `pnpm check` exits 0.
3. `pnpm build` exits 0 (canonical data validates; static output written to `build/`).
4. `pnpm test:build-fails` exits 0 (corrupt → build-fails → restore loop confirms DATA-03 at the build pipeline).
5. After step 4, `JSON.parse(readFileSync('src/lib/data/videos.json')).length === 56` (file restored — no on-disk side effects).
6. From any route file, `import { videos, producerReelId, getCategoriesWithCounts } from '$lib/data';` type-checks under `pnpm check`.
7. `src/lib/data/` directory contains: `categories.ts`, `categories.test.ts`, `index.ts`, `schema.ts`, `schema.test.ts`, `videos.json`, `videos.json.test.ts`, `videos.test.ts`, `videos.ts` (9 files).
8. `src/lib/index.ts` unchanged (still the Phase 1 stub `export {};`).

**Goal-backward check (against Phase 2 ROADMAP success criteria):**
- Truth 1 ("`videos.json` lives in repo with all 56 videos + required fields"): Plan 02-02 ✓; verified again here by `pnpm vitest run src/lib/data/videos.json.test.ts` running green ✓
- Truth 2 ("Schema validates at build time; intentionally breaking a record fails the build"): `pnpm test:build-fails` exits 0 ✓
- Truth 3 ("Categories accepted by the schema are the closed canonical list"): Plan 02-01 schema test `'rejects an unknown category'` green ✓
- Truth 4 ("Typed loader exposes the validated video array to all routes with no runtime fetch"): `import { videos } from '$lib/data'` type-checks; Zod runs at build time only on a prerendered site (Phase 1 RESEARCH confirms zero client bundle) ✓

**Goal-backward check (cross-cutting decisions):**
- D-03 (slug rule): `categoryToSlug` is a pure function in `categories.ts`; `categories.test.ts` covers all 8 mappings ✓
- D-04 (display order): `getCategoriesInDisplayOrder()` returns the exact 8-element D-04 sequence; `videos.test.ts` test `'display order: full sequence per D-04'` verifies it ✓
- D-09 (producerReelId): exported as the literal `'264677021'`; `videos.test.ts` test `'producerReelId is the literal "264677021"'` verifies it ✓
- D-14 (hidden filtering): `videos = _parsed.filter(v => !v.hidden)`; `videos.test.ts` test `'hidden videos filtered (D-14)'` verifies it ✓
</verification>

<success_criteria>
Plan 02-03 complete (and Phase 2 complete) when:
- [ ] `src/lib/data/videos.ts` exists with all 5 helpers + 2 constants exported
- [ ] `src/lib/data/index.ts` exists with the public `$lib/data` surface
- [ ] `src/lib/data/videos.test.ts` has all 6 describe blocks unskipped, 12/12 passing
- [ ] `vite.config.ts` registers `validateVideosPlugin()` between `tailwindcss()` and `sveltekit()`
- [ ] `package.json` exposes `pnpm test:build-fails`
- [ ] `pnpm build` exits 0 on the canonical data
- [ ] `pnpm test:build-fails` exits 0 (DATA-03 enforced at the build pipeline)
- [ ] `pnpm vitest run` exits 0 with 32 passing tests
- [ ] `pnpm check` exits 0
- [ ] `src/lib/index.ts` unchanged from Phase 1 stub
- [ ] After all checks: `videos.json` is on disk in its original 56-record state (no smoke-test residue)
</success_criteria>

<output>
After completion, create `.planning/phases/02-data-layer/02-03-SUMMARY.md` documenting:
- The loader's public surface (`videos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`) — this is the contract every Phase 3+ plan consumes from `$lib/data`
- Why `allVideos` and Zod schemas are NOT re-exported from `$lib/data` (D-14 future-only; schemas are build-time only)
- The Vite plugin's `buildStart` + `this.error()` + `z.prettifyError()` pipeline that fails `pnpm build` on schema violation
- The `pnpm test:build-fails` smoke test as the canonical DATA-03 build-pipeline proof
- Pitfall 1 preservation: schema.ts has zero JSON imports; the plugin reads JSON directly via readFileSync
- Pitfall 2 preservation: loader calls `.parse()` so D-08 defaults (featured/hidden/tags) are materialized in the runtime types
- Pitfall 3 (noUncheckedIndexedAccess) note for Phase 3+: `getById` returns `Video | undefined`, callers MUST narrow
- The four cross-cutting decisions implemented (D-04, D-09, D-11, D-14) and the test names that prove each
</output>
</content>
</invoke>