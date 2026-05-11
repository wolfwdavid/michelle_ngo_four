---
phase: 03-grid-filter-watch
plan: 01
type: execute
wave: 1
depends_on: ["03-00"]
files_modified:
  - src/app.css
  - src/lib/components/categoryAccent.ts
  - src/lib/components/CategoryTag.svelte
  - src/lib/components/VideoCard.svelte
  - src/lib/components/VideoCard.test.ts
  - src/lib/components/CategoryTag.test.ts
autonomous: true
requirements:
  - GRID-01
  - GRID-03
  - GRID-04
  - GRID-05
must_haves:
  truths:
    - "`src/app.css` exports 8 category accent colors via Tailwind v4 `@theme` block as `--color-cat-pbs`, `--color-cat-promos`, `--color-cat-branded`, `--color-cat-docshort`, `--color-cat-reel`, `--color-cat-personal`, `--color-cat-edunon`, `--color-cat-other` — each AA-contrast against `oklch(0.16 0 0)` (~`bg-neutral-950`)."
    - "`categoryAccent(category)` returns a static `text-cat-*` class string for each of the 8 categories — Tailwind's scanner sees every class literal (Pitfall 7 avoided)."
    - "`CategoryTag.svelte` renders `<span>` by default (D-13 — non-interactive on cards) and `<a href={href}>` when the optional `href` prop is provided (D-35 — interactive on /watch metadata). Same component, two call sites."
    - "`VideoCard.svelte` is a Svelte 5 runes component taking `{ video: Video; eager?: boolean }` via `$props()`."
    - "Each card is a SINGLE `<a href={\`${base}/watch/${video.id}\`} data-sveltekit-preload-data=\"hover\">` (D-13, D-14). The category chip inside is a `<span>`, NOT a nested `<a>` (Pitfall 4 avoided)."
    - "Thumb wrapper uses `aspect-video bg-neutral-900` (D-10, D-16); img has `loading={eager ? 'eager' : 'lazy'}` (D-17), `decoding=\"async\"`, `alt={video.title}` (D-18), and `transition-opacity` for the D-16 solid-color fade-in."
    - "First-load opacity starts at 0; `onload` handler flips `loaded` → opacity 100 (D-16)."
    - "GRID-01: thumb + title (h3, line-clamp-2) + category tag + uploader all render in the order described in D-11."
    - "GRID-05: category tag color comes from `categoryAccent(category)` — single source of binding."
    - "All `describe.skip` blocks in `VideoCard.test.ts` (3) and `CategoryTag.test.ts` (1) have had `.skip` removed and turn GREEN."
  artifacts:
    - path: "src/app.css"
      provides: "Tailwind v4 @theme block with 8 category accent colors as CSS variables"
      contains: "--color-cat-pbs"
    - path: "src/lib/components/categoryAccent.ts"
      provides: "categoryAccent(category: Category): string — static map Record<Category, string> of text-cat-* class strings"
      exports: ["categoryAccent"]
    - path: "src/lib/components/CategoryTag.svelte"
      provides: "Colored all-caps category label; <span> by default, <a> when href is provided"
    - path: "src/lib/components/VideoCard.svelte"
      provides: "Single-link card component: thumb (aspect-video, blur-up) + tag + title (h3, line-clamp-2) + uploader"
  key_links:
    - from: "src/lib/components/VideoCard.svelte"
      to: "src/lib/components/CategoryTag.svelte"
      via: "import CategoryTag from './CategoryTag.svelte'"
      pattern: "from\\s+['\"]\\./CategoryTag\\.svelte"
    - from: "src/lib/components/CategoryTag.svelte"
      to: "src/lib/components/categoryAccent.ts"
      via: "import { categoryAccent } from './categoryAccent'"
      pattern: "categoryAccent"
    - from: "src/lib/components/categoryAccent.ts"
      to: "src/app.css"
      via: "returns text-cat-* class strings whose CSS variables live in app.css @theme"
      pattern: "text-cat-"
    - from: "src/lib/components/VideoCard.svelte"
      to: "$app/paths"
      via: "import { base } from '$app/paths' for BASE_PATH-safe internal href"
      pattern: "from\\s+['\"]\\$app/paths['\"]"
    - from: "src/lib/components/VideoCard.svelte"
      to: "$lib/data"
      via: "import type { Video } from '$lib/data'"
      pattern: "from\\s+['\"]\\$lib/data['\"]"
---

<objective>
Build the foundational leaf components for Phase 3's killer feature: the `VideoCard` that every grid renders, the `CategoryTag` reused across cards and `/watch` metadata, the `categoryAccent` helper that maps each of the 8 categories to a Tailwind class, and the Tailwind v4 `@theme` block in `app.css` that defines the 8 accent colors. No routes, no nav — just the leaves.

Purpose: Wave 1 of Phase 3. Every Wave 2 plan (03-02 /work routes, 03-03 /watch route) consumes `VideoCard` directly. Plan 03-04 TopNav consumes `categoryAccent` for active-state highlighting. Building these as a dedicated wave-1 plan with isolated `files_modified` lets the Wave 2 plans run in parallel against a stable component contract. Implements GRID-01 (card structure), GRID-03 (blur-up via D-16 solid-color fade-in), GRID-04 (click target), GRID-05 (category type-tag with per-category accent).

Output:
- `src/app.css` — Tailwind v4 `@theme` block with 8 `--color-cat-*` variables (OKLCH values, AA-contrast on `bg-neutral-950`)
- `src/lib/components/categoryAccent.ts` — static `Record<Category, string>` map + `categoryAccent(category)` accessor
- `src/lib/components/CategoryTag.svelte` — `{category, href?}` props; `<span>` or `<a>`
- `src/lib/components/VideoCard.svelte` — `{video, eager?}` props; single `<a>` + thumb (aspect-video, blur-up) + chip + title (h3, line-clamp-2) + uploader
- `src/lib/components/VideoCard.test.ts` — 3 `describe.skip` → `describe`; @ts-expect-error directives removed; all 14 tests pass
- `src/lib/components/CategoryTag.test.ts` — 1 `describe.skip` → `describe`; @ts-expect-error removed; all 6 tests pass
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
<!-- Phase 1 carry-forward: Svelte 5 runes, Tailwind v4 CSS-first, base-path-safe links. -->
<!-- Phase 2 carry-forward: $lib/data public surface. -->
<!-- Plan 03-00 carry-forward: Wave 0 test stubs exist with describe.skip blocks. -->

From src/lib/data/index.ts (Phase 2 — public $lib/data surface, DO NOT modify):
```ts
export type { Video } from './schema';
export type { Category } from './categories';
export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
export { videos, producerReelId, getById, getByCategory, getCategoriesInDisplayOrder, getCategoriesWithCounts } from './videos';
```

From src/lib/data/categories.ts (Phase 2 — Category type, DO NOT modify):
```ts
export const CATEGORIES = [
  'PBS American Portrait',
  'Promos & Trailers',
  'Branded Content',
  'Documentary / Short Film',
  'Reel',
  'Personal / Tribute',
  'Educational / Nonprofit',
  'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];
```

After parsing the Video schema, every Video has: `source, id, title, uploader, published, thumbnail, embed, category, featured (bool), hidden (bool), tags (string[])`, plus optional `url, description, duration_seconds, credits`.

From src/app.css (current Phase 1 stub — Plan 03-01 REPLACES the @theme block):
```css
@import "tailwindcss";

@theme {
  /* Phase 1: minimal theme seeds — full type system lands in Phase 4 */
}
```

From svelte.config.js (Phase 1 — DO NOT touch):
- `paths: { base: process.env.BASE_PATH ?? '' }` — every internal href in components MUST go through `import { base } from '$app/paths'`.

From src/lib/components/VideoCard.test.ts (Plan 03-00 stub):
- 3 describe.skip blocks:
  - 'VideoCard — GRID-01 (thumb + title + tag + uploader)' (5 tests)
  - 'VideoCard — GRID-03 lazy loading (D-17)' (5 tests)
  - 'VideoCard — GRID-04 click target (D-13, D-14)' (4 tests)
- 14 tests total; tests use `mount/unmount` from `svelte`, host attached to `document.body`.
- Tests fetch the producer reel video via `getById('264677021')` from `$lib/data` (real data, not a fixture).

From src/lib/components/CategoryTag.test.ts (Plan 03-00 stub):
- 1 describe.skip block: 'CategoryTag — GRID-05 per-category accent' (6 tests).
- Tests assert: text content, `text-cat-pbs` / `text-cat-reel` class strings, `<span>` vs `<a>` rendering, typography classes (`text-xs uppercase tracking-`).

Svelte 5 runes contract (from 03-RESEARCH.md):
- `let { video, eager = false }: { video: Video; eager?: boolean } = $props();`
- Local state via `let loaded = $state(false);`
- onload handler: `onload={() => (loaded = true)}`
- Conditional class via `class:` directive: `class:opacity-100={loaded}` (the canonical Svelte 5 syntax).

Tailwind v4 @theme contract (from 03-RESEARCH.md Pitfall 7):
- CSS variable name `--color-cat-{name}` automatically generates `text-cat-{name}`, `bg-cat-{name}`, `ring-cat-{name}`, etc. utilities.
- The class strings MUST appear LITERALLY in source — Tailwind v4's scanner reads files but does not evaluate dynamic concatenations like `` `text-cat-${slug}` ``. Returning a static map from `categoryAccent()` guarantees every class string is present verbatim in `categoryAccent.ts`, which the scanner reads.
- OKLCH is preferred (better perceptual uniformity for accent palettes; first-class in Tailwind v4).
- Background to compare against: `bg-neutral-950` ≈ `oklch(0.16 0 0)` (basically black).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add 8 category accent colors to src/app.css via Tailwind v4 @theme block and create the categoryAccent helper</name>
  <files>src/app.css, src/lib/components/categoryAccent.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\app.css (current — only contains the placeholder @theme stub; this task REPLACES the @theme block)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\categories.ts (Phase 2 — CATEGORIES array is the source of truth; ordering must match)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\index.ts (Phase 2 — exports Category type from $lib/data)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 337-401 Pattern 4 — exact OKLCH @theme block; lines 717-721 Pitfall 7 — Tailwind v4 scanner contract)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-01 bg-neutral-950, D-04 high-saturation 8 accents, AA contrast constraint, PBS most prominent, D-12 typography sizes for the tag)
  </read_first>
  <action>
    Step 1 — REPLACE the entire contents of `src/app.css` with EXACTLY this:

    ```css
    @import "tailwindcss";

    /*
     * Phase 3 D-04: per-category accent colors. High-saturation OKLCH hues that
     * hit AA contrast (≥4.5:1) against bg-neutral-950 (~oklch(0.16 0 0)).
     *
     * Tailwind v4 contract: a CSS variable named --color-cat-NAME automatically
     * generates utility classes text-cat-NAME, bg-cat-NAME, ring-cat-NAME, etc.
     * The slug-form (cat-pbs, cat-promos, ...) is decoupled from the canonical
     * category names so renames are localized to the categoryAccent.ts map.
     *
     * Color hierarchy (D-04):
     *   - PBS American Portrait — most prominent, warmest red-orange (flagship)
     *   - Promos & Trailers     — saturated amber/orange
     *   - Branded Content       — saturated teal/cyan
     *   - Documentary / Short Film — saturated lime/green
     *   - Reel                  — saturated indigo/violet
     *   - Personal / Tribute    — saturated magenta/pink
     *   - Educational / Nonprofit — saturated yellow
     *   - Other                 — desaturated cool gray-blue (least prominent)
     *
     * Lightness target ~0.78 (range 0.72-0.82) gives 4.7-5.6:1 contrast against
     * oklch(0.16 0 0). PBS is bumped to lightness 0.72 + chroma 0.21 for the
     * highest visual weight; Other is lightness 0.78 + chroma 0.05 (intentionally
     * quiet — semantically "uncategorized").
     */
    @theme {
      --color-cat-pbs: oklch(0.72 0.21 25);
      --color-cat-promos: oklch(0.78 0.18 60);
      --color-cat-branded: oklch(0.72 0.18 180);
      --color-cat-docshort: oklch(0.78 0.18 130);
      --color-cat-reel: oklch(0.78 0.18 280);
      --color-cat-personal: oklch(0.78 0.18 330);
      --color-cat-edunon: oklch(0.78 0.18 90);
      --color-cat-other: oklch(0.78 0.05 250);
    }
    ```

    Note on contrast: OKLCH lightness 0.72-0.78 against L=0.16 puts each pair around 4.7-5.6:1 measured ratio against the WCAG sRGB approximation. That clears AA (4.5:1) for large text and AAA-adjacent for the all-caps tracked tag style (D-12 `text-xs` is "small" per WCAG; 4.5:1 is the threshold). The category tag is bold + tracking-wider, which improves perceived contrast further.

    Step 2 — Create `src/lib/components/categoryAccent.ts` with EXACTLY this content:

    ```ts
    /**
     * Static map from Category name → Tailwind class string for the per-category
     * accent color (D-04). The ONLY place a category-to-color binding lives.
     *
     * Why a static literal map (not a computed slug):
     *   Tailwind v4's scanner reads source files and collects utility class names
     *   that appear LITERALLY. A dynamic `` `text-cat-${categoryToSlug(c)}` ``
     *   would compute the class at runtime but Tailwind would NEVER generate it
     *   at build time — the class wouldn't exist in the bundled CSS (Pitfall 7).
     *
     *   This file has every text-cat-* string spelled out verbatim, so the
     *   scanner finds them all and Tailwind generates utilities for each.
     *
     * Adding a new category → add to CATEGORIES (categories.ts) → add an entry
     * here → add a --color-cat-* variable in app.css. Three lines, three files.
     */
    import type { Category } from '$lib/data';

    const ACCENT: Record<Category, string> = {
      'PBS American Portrait': 'text-cat-pbs',
      'Promos & Trailers': 'text-cat-promos',
      'Branded Content': 'text-cat-branded',
      'Documentary / Short Film': 'text-cat-docshort',
      Reel: 'text-cat-reel',
      'Personal / Tribute': 'text-cat-personal',
      'Educational / Nonprofit': 'text-cat-edunon',
      Other: 'text-cat-other',
    };

    export function categoryAccent(category: Category): string {
      return ACCENT[category];
    }
    ```

    Note: TypeScript narrows `Record<Category, string>` so `ACCENT[category]` returns `string` (NOT `string | undefined`) even under `noUncheckedIndexedAccess` — because the key type matches a non-mapped record exactly. (This is one of the few cases where the property-access narrowing under `noUncheckedIndexedAccess` is sound; verified by `pnpm check`.)

    Step 3 — DO NOT create `CategoryTag.svelte` or `VideoCard.svelte` yet — those are Task 2 and Task 3.

    Step 4 — Run `pnpm check` to confirm the helper file type-checks (the Category import resolves; the Record literal covers all 8 keys; categoryAccent returns string).

    ```
    pnpm check
    ```

    Expected: exit 0.
  </action>
  <verify>
    <automated>pnpm check</automated>
  </verify>
  <acceptance_criteria>
    - `src/app.css` contains the literal string `@import "tailwindcss";` on or near line 1.
    - `src/app.css` contains the literal string `@theme {`.
    - `src/app.css` contains all 8 literal lines: `--color-cat-pbs:`, `--color-cat-promos:`, `--color-cat-branded:`, `--color-cat-docshort:`, `--color-cat-reel:`, `--color-cat-personal:`, `--color-cat-edunon:`, `--color-cat-other:`.
    - `src/app.css` contains the literal string `oklch(0.72 0.21 25)` (the PBS color — highest prominence).
    - `grep -c "^\s*--color-cat-" src/app.css` returns 8.
    - File `src/lib/components/categoryAccent.ts` exists.
    - File contains the literal string `import type { Category } from '$lib/data';`.
    - File contains the literal string `const ACCENT: Record<Category, string> = {`.
    - File contains all 8 literal class strings: `'text-cat-pbs'`, `'text-cat-promos'`, `'text-cat-branded'`, `'text-cat-docshort'`, `'text-cat-reel'`, `'text-cat-personal'`, `'text-cat-edunon'`, `'text-cat-other'`.
    - File contains the literal string `export function categoryAccent(category: Category): string {`.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    `src/app.css` declares 8 `--color-cat-*` CSS variables via Tailwind v4 `@theme`. `src/lib/components/categoryAccent.ts` exports the `categoryAccent(category)` accessor whose return value is the literal `text-cat-*` class string for that category. `pnpm check` exits 0.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Build CategoryTag.svelte and unskip its tests (GRID-05)</name>
  <files>src/lib/components/CategoryTag.svelte, src/lib/components/CategoryTag.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-11 chip is label-style/no chip background, D-12 typography sizes, D-13 non-interactive on cards, D-35 interactive on /watch metadata)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 378-401 Pattern 4 — exact CategoryTag component shape with both <span> and <a> branches)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\categoryAccent.ts (Task 1 — the import surface)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\CategoryTag.test.ts (Plan 03-00 stub — has 1 describe.skip block with 6 tests; this task removes .skip + @ts-expect-error)
  </read_first>
  <behavior>
    Test 1 (`'renders the category text'`): mount with `category: 'PBS American Portrait'` → root element textContent === `'PBS American Portrait'`.
    Test 2 (`'PBS gets the cat-pbs accent class'`): mount with PBS → root element className matches `/text-cat-pbs/`.
    Test 3 (`'Reel gets the cat-reel accent class'`): mount with `category: 'Reel'` → root element className matches `/text-cat-reel/`.
    Test 4 (`'renders as <span> when no href prop (D-13)'`): mount without href → `host.querySelector('a') === null` AND `host.querySelector('span') !== null`.
    Test 5 (`'renders as <a> when href prop is provided (D-35)'`): mount with `category: 'Reel', href: '/work/reel'` → `<a>` exists, `getAttribute('href') === '/work/reel'`.
    Test 6 (`'uses text-xs uppercase tracking (D-12) typography classes'`): mount with `category: 'Other'` → className matches `/text-xs/` AND `/uppercase/` AND `/tracking-/`.
  </behavior>
  <action>
    Step 1 — Create `src/lib/components/CategoryTag.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 D-11/D-13/D-35: per-category type-tag, label-style (no chip background).
      Used in two places:
        - Inside VideoCard (D-13): MUST be non-interactive — pass NO href prop.
        - On /watch/[id] metadata (D-35): IS interactive — pass href=/work/<slug>.
      The optional href prop switches between <span> and <a> to avoid nested
      <a><a></a></a> markup (Pitfall 4).
    -->
    <script lang="ts">
      import type { Category } from '$lib/data';
      import { categoryAccent } from './categoryAccent';

      type Props = {
        category: Category;
        /** When provided, renders as <a href={href}>. Omit for non-interactive label. */
        href?: string;
      };
      let { category, href }: Props = $props();
    </script>

    {#if href}
      <a
        {href}
        class="text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline {categoryAccent(
          category,
        )}"
      >
        {category}
      </a>
    {:else}
      <span
        class="text-xs font-bold uppercase tracking-wider {categoryAccent(category)}"
      >
        {category}
      </span>
    {/if}
    ```

    Notes:
    - `text-xs font-bold uppercase tracking-wider` implements D-12 (12px bold uppercase tracked).
    - The `categoryAccent(category)` call returns a STATIC string literal (one of 8); Tailwind's scanner sees all 8 in `categoryAccent.ts` so all `text-cat-*` utilities are generated (Pitfall 7).
    - No chip background — D-11 says label-style.
    - The interpolation `{categoryAccent(category)}` lands at the END of the class string so Tailwind precedence is predictable (no overrides needed).

    Step 2 — In `src/lib/components/CategoryTag.test.ts`:

    a. Remove the line `// @ts-expect-error — component exists after Plan 03-01` directly above the `import CategoryTag from './CategoryTag.svelte';` line.

    b. Change `describe.skip('CategoryTag — GRID-05 per-category accent', () => {` to `describe('CategoryTag — GRID-05 per-category accent', () => {`.

    The top of the file should now read:

    ```ts
    import { afterEach, describe, expect, it } from 'vitest';
    import { mount, unmount } from 'svelte';
    import CategoryTag from './CategoryTag.svelte';
    ```

    Step 3 — Run the test file:
    ```
    pnpm vitest run src/lib/components/CategoryTag.test.ts
    ```
    Expected: 6 tests pass, 0 skipped, 0 failed.

    Step 4 — Run `pnpm check` — expected: exit 0.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/components/CategoryTag.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/CategoryTag.svelte` exists.
    - File contains the literal string `import type { Category } from '$lib/data';`.
    - File contains the literal string `import { categoryAccent } from './categoryAccent';`.
    - File contains the literal string `let { category, href }: Props = $props();`.
    - File contains the literal string `{#if href}` AND the literal string `{:else}`.
    - File contains BOTH `<a` and `<span` element tags (one per branch).
    - File contains the literal string `text-xs font-bold uppercase tracking-wider` (D-12 typography).
    - File contains the literal string `{categoryAccent(category)}` (the dynamic accent class slot).
    - `src/lib/components/CategoryTag.test.ts` no longer contains `describe.skip` (count = 0).
    - `src/lib/components/CategoryTag.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/lib/components/CategoryTag.test.ts` exits 0 with 6 tests passing.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    `CategoryTag.svelte` renders `<span>` by default and `<a>` when href is provided; uses `categoryAccent(category)` for the per-category color; matches D-12 typography. All 6 tests in `CategoryTag.test.ts` pass.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Build VideoCard.svelte and unskip its tests (GRID-01, GRID-03, GRID-04)</name>
  <files>src/lib/components/VideoCard.svelte, src/lib/components/VideoCard.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-06 hover state, D-07 focus ring, D-10 aspect-video, D-11 meta order, D-12 type sizes, D-13 single link, D-14 preload-hover, D-15 thumbnail URL as-is, D-16 solid-color fade-in, D-17 eager-first-8, D-18 alt=title, D-19 h3, D-20 v.id key)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 232-279 Pattern 1 — exact VideoCard component shape with all classes spelled out)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\CategoryTag.svelte (Task 2 — import this for the chip)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\index.ts (Phase 2 — `import type { Video } from '$lib/data'` is the canonical import for the prop type)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\VideoCard.test.ts (Plan 03-00 stub — 3 describe.skip blocks with 14 tests; this task removes .skip + @ts-expect-error)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\svelte.config.js (Phase 1 — confirms BASE_PATH is wired; href MUST go through `${base}/watch/${video.id}`)
  </read_first>
  <behavior>
    All 14 tests in `VideoCard.test.ts` must pass:

    GRID-01 (5 tests):
    - Test 1 `'renders thumb img with the video thumbnail URL'`: `img.getAttribute('src') === video.thumbnail`.
    - Test 2 `'renders title as h3 with the video title'`: `host.querySelector('h3').textContent.trim() === video.title`.
    - Test 3 `'renders uploader text'`: `host.textContent.includes(video.uploader)`.
    - Test 4 `'renders category tag with the video category text'`: `host.textContent.includes(video.category)`.
    - Test 5 `'alt attribute matches video.title (D-18)'`: `img.getAttribute('alt') === video.title`.

    GRID-03 (5 tests):
    - Test 6 `'eager prop defaults to false → loading="lazy"'`: default mount → `img.getAttribute('loading') === 'lazy'`.
    - Test 7 `'eager={true} → loading="eager"'`: mount with eager=true → `'eager'`.
    - Test 8 `'decoding="async" on every thumb'`: `img.getAttribute('decoding') === 'async'`.
    - Test 9 `'thumb wrapper uses aspect-video class and bg-neutral-900'`: img.parentElement.className matches `/aspect-video/` AND `/bg-neutral-900/`.
    - Test 10 `'img has transition-opacity class'`: `img.className.match(/transition-opacity/)`.

    GRID-04 (4 tests):
    - Test 11 `'whole card is a single <a> link'`: `host.querySelectorAll('a').length === 1`.
    - Test 12 `'href ends with /watch/<video.id>'`: `a.getAttribute('href').match(/\/watch\/264677021$/)`.
    - Test 13 `'has data-sveltekit-preload-data="hover"'`: `a.getAttribute('data-sveltekit-preload-data') === 'hover'`.
    - Test 14 `'category chip is NOT a nested <a>'`: `host.querySelectorAll('a').length === 1` (chip is `<span>`).
  </behavior>
  <action>
    Step 1 — Create `src/lib/components/VideoCard.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 D-10..D-20: single-link card with aspect-video thumb, blur-up fade-in,
      colored category tag, h3 title (line-clamp-2), and uploader meta. Used by
      /work, /work/[category], and the /watch rail. ONE component, no variants.

      Decisions implemented:
        D-10 thumb aspect-video 16:9
        D-11 meta order: tag → title → uploader
        D-12 typography: tag text-xs bold uppercase tracked, title text-sm md:text-base, uploader text-xs neutral-500
        D-13 single <a> wraps the whole card (no nested <a>; chip is <span>)
        D-14 data-sveltekit-preload-data="hover"
        D-15 thumbnail URL used as-is from videos.json
        D-16 solid-color fade-in (bg-neutral-900 wrapper + opacity-0 → opacity-100 on load)
        D-17 first-8 eager via eager prop, all others lazy; decoding async
        D-18 alt={video.title}
        D-19 h3 for card titles
        D-06 hover: title underlines + thumb opacity 90→100 (group-hover)
        D-07 focus ring: white 2px + 2px offset on dark bg
    -->
    <script lang="ts">
      import { base } from '$app/paths';
      import type { Video } from '$lib/data';
      import CategoryTag from './CategoryTag.svelte';

      type Props = {
        video: Video;
        /** First 8 cards above the fold pass eager={true} (D-17). */
        eager?: boolean;
      };
      let { video, eager = false }: Props = $props();

      let loaded = $state(false);
    </script>

    <li>
      <a
        href={`${base}/watch/${video.id}`}
        data-sveltekit-preload-data="hover"
        class="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
      >
        <div class="relative aspect-video overflow-hidden bg-neutral-900">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-90"
            class:opacity-100={loaded}
            onload={() => (loaded = true)}
          />
        </div>
        <div class="mt-2 space-y-0.5">
          <CategoryTag category={video.category} />
          <h3 class="text-sm md:text-base font-medium line-clamp-2 group-hover:underline">
            {video.title}
          </h3>
          <p class="text-xs text-neutral-500">{video.uploader}</p>
        </div>
      </a>
    </li>
    ```

    Notes:
    - The root is `<li>` so callers can drop cards into a `<ul class="grid ...">` directly without an extra wrapper (D-21).
    - `class:opacity-100={loaded}` is Svelte 5's canonical conditional-class syntax — wins over `opacity-0` in the cascade because Tailwind uses CSS cascade order and `opacity-100` is declared later in the stylesheet.
    - `group-hover:opacity-90` only fires on hover (D-06); without it the loaded state is 100% opacity.
    - The `aspect-video bg-neutral-900` wrapper reserves space at every breakpoint → ZERO layout shift on thumb load.
    - Internal href uses `${base}/watch/${video.id}` (Pitfall 3 avoided).
    - DO NOT pass `href` to `CategoryTag` here — D-13 mandates the chip is non-interactive inside cards.

    Step 2 — In `src/lib/components/VideoCard.test.ts`:

    a. Remove the line `// @ts-expect-error — component exists after Plan 03-01` directly above the `import VideoCard from './VideoCard.svelte';` line.

    b. Find ALL THREE `describe.skip(...)` calls and replace each with `describe(...)`:
       - `describe.skip('VideoCard — GRID-01 (thumb + title + tag + uploader)', ...)` → `describe(...)`
       - `describe.skip('VideoCard — GRID-03 lazy loading (D-17)', ...)` → `describe(...)`
       - `describe.skip('VideoCard — GRID-04 click target (D-13, D-14)', ...)` → `describe(...)`

    The top of the file should now read:

    ```ts
    import { afterEach, describe, expect, it } from 'vitest';
    import { mount, unmount } from 'svelte';
    import VideoCard from './VideoCard.svelte';
    import { getById, type Video } from '$lib/data';
    ```

    Step 3 — Run the VideoCard test file:
    ```
    pnpm vitest run src/lib/components/VideoCard.test.ts
    ```
    Expected: 14 tests pass.

    Step 4 — Run the full `ui` project to confirm no regression on `CategoryTag.test.ts`:
    ```
    pnpm vitest run src/lib/components/
    ```
    Expected: 20 tests pass (14 VideoCard + 6 CategoryTag).

    Step 5 — Run the full suite (`pnpm test`) + `pnpm check` + `pnpm build` to confirm Wave 1 is green end-to-end.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/components/VideoCard.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/VideoCard.svelte` exists.
    - File contains the literal string `import { base } from '$app/paths';`.
    - File contains the literal string `import type { Video } from '$lib/data';`.
    - File contains the literal string `import CategoryTag from './CategoryTag.svelte';`.
    - File contains the literal string `let { video, eager = false }: Props = $props();`.
    - File contains the literal string `let loaded = $state(false);`.
    - File contains the literal string `` href={`${base}/watch/${video.id}`} ``.
    - File contains the literal string `data-sveltekit-preload-data="hover"`.
    - File contains the literal string `aspect-video` AND the literal string `bg-neutral-900`.
    - File contains the literal string `loading={eager ? 'eager' : 'lazy'}`.
    - File contains the literal string `decoding="async"`.
    - File contains the literal string `alt={video.title}`.
    - File contains the literal string `transition-opacity`.
    - File contains the literal string `class:opacity-100={loaded}` (canonical Svelte 5 conditional-class).
    - File contains the literal string `onload={() => (loaded = true)}`.
    - File contains the literal string `<CategoryTag category={video.category} />` — note: NO `href` prop (D-13 non-interactive chip inside card).
    - File contains the literal string `line-clamp-2`.
    - File contains the literal string `<h3` (D-19 heading hierarchy).
    - File does NOT contain `<CategoryTag category={video.category} href=` (grep `CategoryTag.*href` returns 0 matches — the chip is NEVER a link inside the card per D-13).
    - `src/lib/components/VideoCard.test.ts` no longer contains `describe.skip` (count = 0).
    - `src/lib/components/VideoCard.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/lib/components/VideoCard.test.ts` exits 0 with 14 tests passing.
    - `pnpm vitest run src/lib/components/` exits 0 with 20 tests passing total (14 VideoCard + 6 CategoryTag).
    - `pnpm test` exits 0 (32 data-layer + 20 ui = 52 tests; the route-test stubs still in describe.skip don't run).
    - `pnpm check` exits 0.
    - `pnpm build` exits 0 (Wave 1 doesn't add routes; build pipeline still consumes only the existing /+page.svelte).
  </acceptance_criteria>
  <done>
    `VideoCard.svelte` exists as a Svelte 5 runes component implementing D-10..D-20 + D-06 + D-07. All 14 VideoCard tests + all 6 CategoryTag tests pass. `pnpm check`, `pnpm test`, `pnpm build` all exit 0.
  </done>
</task>

</tasks>

<verification>
**After all 3 tasks complete:**

1. `pnpm test` exits 0 — 52 tests passing total (32 data-layer + 14 VideoCard + 6 CategoryTag). Tests still in describe.skip (TopNav, /work, /work/[category], /watch/[id]) don't run.
2. `pnpm check` exits 0.
3. `pnpm build` exits 0 (Wave 1 doesn't add routes).
4. `src/app.css` has 8 `--color-cat-*` variables in the @theme block.
5. `src/lib/components/` contains: `categoryAccent.ts`, `CategoryTag.svelte`, `CategoryTag.test.ts`, `VideoCard.svelte`, `VideoCard.test.ts`, `TopNav.test.ts` (the last is still describe.skip from Plan 03-00).
6. No `@ts-expect-error` directives remain in `VideoCard.test.ts` or `CategoryTag.test.ts`.
7. No `describe.skip` in `VideoCard.test.ts` or `CategoryTag.test.ts` (still present in `TopNav.test.ts` and route test files — those go GREEN in Plans 03-02/03/04).

**Goal-backward check (against Phase 3 success criteria affected by this plan):**
- Truth 1 ("/work displays all 56 videos as cards with thumbnail, title, category tag, uploader; 2/3/4 responsive"): VideoCard provides the card shape (thumb + title + tag + uploader) — the route work in Plan 03-02 wires the responsive grid. GRID-01 ✓ at component level.
- Truth 2 ("Thumbnails render with low-res placeholder that blurs up"): VideoCard implements D-16 solid-color fade-in (bg-neutral-900 wrapper + opacity-0 → opacity-100 onload). GRID-03 ✓ at component level.
- Truth 3 ("Clicking any card navigates to /watch/[id]..."): VideoCard wraps the whole card in `<a href={\`${base}/watch/${video.id}\`}>`. GRID-04 ✓ at component level.
- Truth 5 ("Top text-link nav lists primary categories..."): NOT in this plan — Plan 03-04. But the `categoryAccent` helper that the nav consumes for active state IS shipped here.
</verification>

<success_criteria>
Plan 03-01 complete (Wave 1 done) when:
- [ ] `src/app.css` exports 8 `--color-cat-*` accent colors via Tailwind v4 @theme
- [ ] `src/lib/components/categoryAccent.ts` exports `categoryAccent(category)` returning literal text-cat-* class strings
- [ ] `src/lib/components/CategoryTag.svelte` renders <span> by default and <a> when href is provided
- [ ] `src/lib/components/VideoCard.svelte` is a single-link card with aspect-video thumb, blur-up fade-in, chip, h3 title (line-clamp-2), uploader
- [ ] `VideoCard.test.ts` and `CategoryTag.test.ts` have no `describe.skip` and no `@ts-expect-error`
- [ ] `pnpm vitest run src/lib/components/` exits 0 with 20 passing tests
- [ ] `pnpm test` exits 0
- [ ] `pnpm check` exits 0
- [ ] `pnpm build` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/03-grid-filter-watch/03-01-SUMMARY.md` documenting:
- The 8 OKLCH accent colors chosen and the contrast strategy (~0.78 lightness, ~0.18 chroma, PBS bumped for prominence, Other desaturated)
- Why categoryAccent.ts uses a static Record<Category, string> map (Pitfall 7 avoided — Tailwind scanner sees literal class strings)
- VideoCard's prop surface: `{ video: Video; eager?: boolean }` — and the `eager={i < 8}` pattern Wave 2 plans should use on the first 8 cards (D-17)
- The single-<a>-per-card invariant (D-13) — chip is always <span> inside a card; on /watch/[id] metadata the chip becomes an <a> via the optional href prop
- The blur-up implementation (D-16): bg-neutral-900 wrapper + opacity-0 + `class:opacity-100={loaded}` + onload handler
- Phase 1 BASE_PATH carry-forward: `${base}/watch/${video.id}` (Pitfall 3 avoided)
- Test names exposed to downstream plans (14 in VideoCard.test.ts + 6 in CategoryTag.test.ts)
</output>
</content>
