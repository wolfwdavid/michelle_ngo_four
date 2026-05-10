---
phase: 02-data-layer
plan: 01
type: execute
wave: 1
depends_on: ["02-00"]
files_modified:
  - src/lib/data/categories.ts
  - src/lib/data/schema.ts
  - src/lib/data/categories.test.ts
  - src/lib/data/schema.test.ts
  - package.json
autonomous: true
requirements:
  - DATA-02
  - DATA-03
  - DATA-04
must_haves:
  truths:
    - "Zod 4.4.3 is installed pinned exact as a dev dependency."
    - "`CATEGORIES` is the single source of truth — exactly the 8 strings from `_prep/04-categories.md`, in the seed-proposal order."
    - "`Category` type is derived from `(typeof CATEGORIES)[number]` — adding a 9th category is a one-line edit."
    - "`categoryToSlug(category)` is a pure function — single rule (lowercase, [^a-z0-9]+ → '-', trim '-')."
    - "`slugToCategory(slug)` round-trips every category and returns `undefined` for unknown slugs."
    - "`VideoSchema` rejects: unknown category, unknown source, missing required field, non-ISO date, empty title, unknown extra field."
    - "`VideoSchema` accepts every record shape required by D-05 and treats D-06 fields (`duration_seconds`, `description`) as optional."
    - "`VideoSchema` applies defaults from D-08 (`featured: false`, `hidden: false`, `tags: []`) — verified by parse-then-inspect."
    - "All `describe.skip` blocks in `schema.test.ts` and `categories.test.ts` have had `.skip` removed and turn GREEN."
  artifacts:
    - path: "src/lib/data/categories.ts"
      provides: "CATEGORIES const + Category type + categoryToSlug + slugToCategory"
      exports: ["CATEGORIES", "Category", "categoryToSlug", "slugToCategory"]
    - path: "src/lib/data/schema.ts"
      provides: "Zod schemas for Video, VideoArray, Category"
      exports: ["CategorySchema", "VideoSchema", "VideoArraySchema", "Video"]
    - path: "package.json"
      provides: "zod@4.4.3 in devDependencies (pinned exact)"
      contains: "\"zod\": \"4.4.3\""
  key_links:
    - from: "src/lib/data/schema.ts"
      to: "src/lib/data/categories.ts"
      via: "import { CATEGORIES } from './categories'"
      pattern: "from\\s+['\"]\\./categories['\"]"
    - from: "src/lib/data/schema.ts"
      to: "zod"
      via: "import { z } from 'zod'"
      pattern: "from\\s+['\"]zod['\"]"
    - from: "src/lib/data/categories.test.ts"
      to: "src/lib/data/categories.ts"
      via: "import { CATEGORIES, categoryToSlug, slugToCategory } from './categories'"
      pattern: "categoryToSlug"
    - from: "src/lib/data/schema.test.ts"
      to: "src/lib/data/schema.ts"
      via: "import { VideoSchema, VideoArraySchema } from './schema'"
      pattern: "VideoSchema"
---

<objective>
Lock the canonical category list and define the Zod schema. This is the type-and-validation foundation Plans 02-02 (videos.json author) and 02-03 (loader + Vite plugin) build on.

Purpose: Implements DATA-02 (per-record field shape), DATA-03 (schema-level rejection of bad data), DATA-04 (closed canonical category list with slug derivation). Single source of truth: `CATEGORIES` array → `Category` type → Zod `z.enum()` → slug helper.

Output:
- `src/lib/data/categories.ts` — `CATEGORIES` const, `Category` type, `categoryToSlug`, `slugToCategory`
- `src/lib/data/schema.ts` — Zod 4 schemas (`CategorySchema`, `VideoSchema`, `VideoArraySchema`)
- `categories.test.ts` and `schema.test.ts` `.skip` removed — both files GREEN
- `zod@4.4.3` pinned exact in `devDependencies`
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
@_prep/04-categories.md

<interfaces>
<!-- Wave 0 (Plan 02-00) created the test files with describe.skip wrappers. -->
<!-- This plan implements the modules those tests reference and removes the .skip wrappers. -->

From src/lib/data/categories.test.ts (RED in Wave 0 — turns GREEN in this plan):
```ts
import { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
// describe.skip('CATEGORIES array', ...) — must contain exactly 8 strings in seed-proposal order
// describe.skip('categoryToSlug', ...) — kebab-case, single-rule
// describe.skip('slugToCategory', ...) — round-trips, undefined on miss
```

From src/lib/data/schema.test.ts (RED in Wave 0 — turns GREEN in this plan):
```ts
import { VideoSchema, VideoArraySchema } from './schema';
import { CATEGORIES } from './categories';
// describe.skip('schema accepts valid records', ...)
// describe.skip('schema rejects bad data', ...)
// describe.skip('VideoArraySchema validates the canonical file', ...)
```

Required test name strings (from 02-VALIDATION.md — DO NOT rename):
- "canonical schema accepts a valid record"
- "optional fields"
- "rejects a missing required field"
- "rejects a non-ISO date"
- "rejects an unknown category"
- "rejects an unknown extra field"
- "accepts all 8 canonical categories"
- "categoryToSlug" (describe block)

From _prep/04-categories.md (canonical taxonomy — seed-proposal order; D-04 display order is computed dynamically at runtime by the loader):
```
PBS American Portrait     | 18
Promos & Trailers         | 12
Branded Content           | 8
Documentary / Short Film  | 5
Reel                      | 4
Personal / Tribute        | 3
Educational / Nonprofit   | 3
Other                     | 3
```

From package.json (pinning convention — Phase 1 STATE):
- All deps EXACT, no caret/tilde.
- New devDependency goes alphabetically into the `devDependencies` block.

From tsconfig.json (Phase 1):
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`
- `slugToCategory(slug)` returns `Category | undefined` because `noUncheckedIndexedAccess` makes `Record<string, Category>[slug]` return `Category | undefined`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Install zod@4.4.3 and create src/lib/data/categories.ts (D-01, D-03, D-04)</name>
  <files>package.json, src/lib/data/categories.ts, src/lib/data/categories.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\package.json (current pinning convention — every dep EXACT, no caret/tilde)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\categories.test.ts (Wave 0 stub — must turn from skipped → green; the test file already encodes the expected `CATEGORIES` array contents in seed-proposal order, the slug map, and slugToCategory behavior)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 156-191 Pattern 1 — exact slug helper implementation)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\_prep\04-categories.md (canonical 8-category list with counts)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-CONTEXT.md (D-01 = exact 8 strings; D-03 = single slug rule; D-04 = display order PBS first, count desc, ties alpha — note D-04 display order is computed DYNAMICALLY by the loader, not encoded in the static array)
  </read_first>
  <behavior>
    Test 1 (already in Wave 0 stub `categories.test.ts`): `CATEGORIES` deep-equals exactly `['PBS American Portrait', 'Promos & Trailers', 'Branded Content', 'Documentary / Short Film', 'Reel', 'Personal / Tribute', 'Educational / Nonprofit', 'Other']` — the seed-proposal order from `_prep/04-categories.md`. NOTE: D-04 display order is computed dynamically by `getCategoriesInDisplayOrder()` in Plan 02-03; this static array is purely the canonical membership list (used by `z.enum`).
    Test 2: `categoryToSlug('PBS American Portrait')` returns `'pbs-american-portrait'`.
    Test 3: `categoryToSlug('Promos & Trailers')` returns `'promos-trailers'` (the `&` collapses).
    Test 4: `categoryToSlug('Documentary / Short Film')` returns `'documentary-short-film'` (slash + spaces collapse to one hyphen).
    Test 5: `slugToCategory('pbs-american-portrait')` returns `'PBS American Portrait'`.
    Test 6: `slugToCategory('does-not-exist')` returns `undefined`.
    Test 7: All 8 slugs are unique (no collisions).
  </behavior>
  <action>
    Step 1 — Install Zod 4.4.3 pinned EXACT:

    ```
    pnpm add -D -E zod@4.4.3
    ```

    Verify `package.json` `devDependencies` contains the literal string `"zod": "4.4.3"` (NOT `^4.4.3`, NOT `~4.4.3`). If pnpm adds carets, hand-edit and re-run `pnpm install`.

    Step 2 — Create `src/lib/data/categories.ts` with EXACTLY this content:

    ```ts
    /**
     * Canonical category taxonomy — single source of truth.
     *
     * Source: _prep/04-categories.md (8 categories, decision rationale)
     * Decisions: D-01 (closed list), D-03 (slug rule), D-04 (display order)
     *
     * IMPORTANT: This is the seed-proposal order from _prep/04-categories.md
     * (the order curators wrote them in). It is NOT the D-04 display order —
     * getCategoriesInDisplayOrder() in the loader (Plan 02-03) re-sorts dynamically
     * per D-04 (count desc, ties alpha) from the validated dataset.
     *
     * Adding a category = one-line edit to this array. Zod's `z.enum()` reads
     * it directly; the `Category` TS type is derived; the slug rule is one function.
     */
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

    /**
     * Auto-derived kebab-case slug. D-03: single rule for all categories.
     *
     * Rule: lowercase → replace any run of non-[a-z0-9] with a single hyphen → trim leading/trailing hyphens.
     *
     * Examples:
     *   'PBS American Portrait'    → 'pbs-american-portrait'
     *   'Promos & Trailers'         → 'promos-trailers'
     *   'Documentary / Short Film' → 'documentary-short-film'
     *   'Educational / Nonprofit'  → 'educational-nonprofit'
     */
    export function categoryToSlug(category: Category): string {
      return category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Build the slug → category lookup once at module load (memoized).
    const SLUG_TO_CATEGORY: Record<string, Category> = Object.fromEntries(
      CATEGORIES.map((c) => [categoryToSlug(c), c]),
    );

    /**
     * Returns the Category for a given slug, or `undefined` if the slug is unknown.
     * Note: return type is `Category | undefined` because of `noUncheckedIndexedAccess`
     * (Phase 1 D-14 / tsconfig.json). Callers must narrow.
     */
    export function slugToCategory(slug: string): Category | undefined {
      return SLUG_TO_CATEGORY[slug];
    }
    ```

    Step 3 — In `src/lib/data/categories.test.ts`, find the THREE `describe.skip(...)` calls and replace each `describe.skip` with `describe`. Also remove the `// @ts-expect-error — module exists after Plan 02-01` comment line above the import (the module now exists, the directive is no longer needed and `noUnusedDirective`-style errors will fire if left).

    Specifically, the file should now start:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { CATEGORIES, categoryToSlug, slugToCategory } from './categories';

    describe('CATEGORIES array', () => {
    ```

    (NOT `describe.skip`, NOT `// @ts-expect-error`.)

    Step 4 — Run `pnpm vitest run src/lib/data/categories.test.ts` and confirm all 5 tests inside the 3 describe blocks pass.

    Step 5 — Run `pnpm check` and confirm zero TS errors.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/data/categories.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` `devDependencies` contains the literal string `"zod": "4.4.3"` (no caret, no tilde).
    - `src/lib/data/categories.ts` exists.
    - `src/lib/data/categories.ts` contains the literal string `export const CATEGORIES = [`.
    - `src/lib/data/categories.ts` lists all 8 strings in seed-proposal order: `'PBS American Portrait'`, `'Promos & Trailers'`, `'Branded Content'`, `'Documentary / Short Film'`, `'Reel'`, `'Personal / Tribute'`, `'Educational / Nonprofit'`, `'Other'` — verifiable by `grep -F "'PBS American Portrait'" src/lib/data/categories.ts` (and similar for each).
    - `src/lib/data/categories.ts` contains the literal string `export type Category = (typeof CATEGORIES)[number];`.
    - `src/lib/data/categories.ts` contains the literal string `export function categoryToSlug(category: Category): string {`.
    - `src/lib/data/categories.ts` contains the literal string `export function slugToCategory(slug: string): Category | undefined {`.
    - `src/lib/data/categories.test.ts` no longer contains the literal string `describe.skip` (count = 0).
    - `src/lib/data/categories.test.ts` no longer contains the literal string `@ts-expect-error`.
    - `pnpm vitest run src/lib/data/categories.test.ts` exits 0.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    Zod 4.4.3 installed pinned exact; `categories.ts` is the single source of truth for the 8 canonical categories + slug derivation; `categories.test.ts` is GREEN.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create src/lib/data/schema.ts (DATA-02, DATA-03, DATA-04 schema-level)</name>
  <files>src/lib/data/schema.ts, src/lib/data/schema.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\categories.ts (created in Task 1 — schema imports `CATEGORIES` from here)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\schema.test.ts (Wave 0 stub — must turn from skipped → green; the test file already encodes the expected accept/reject behavior)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 195-245 Pattern 2 — exact Zod 4 schema with discriminated union, z.iso.date(), z.url(), z.strictObject)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-CONTEXT.md (D-05 required fields, D-06 optional fields, D-07 ISO date, D-08 schema additions)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\_prep\03-videos-seed.json (lines 1-50 — confirms the seed shape: every record has `url`, some omit `duration_seconds`/`description`)
  </read_first>
  <behavior>
    Test 1 (Wave 0 stub `'canonical schema accepts a valid record'`): A record with all D-05 required fields parses successfully.
    Test 2 (`'optional fields ... parse when absent'`): Same record with `duration_seconds` and `description` omitted parses successfully.
    Test 3 (`'accepts all 8 canonical categories'`): Iterating `CATEGORIES` and substituting each into the `category` field — every variation parses.
    Test 4 (`'rejects a missing required field'`): Removing `title` makes `safeParse` return `{ success: false }`.
    Test 5 (`'rejects a non-ISO date'`): `'04/13/2018'` for `published` is rejected.
    Test 6 (`'rejects an unknown category'`): `'PBS American Portraits'` (typo) is rejected — this is the canonical DATA-04 test.
    Test 7 (`'rejects an unknown extra field'`): Adding `evil_extra: true` is rejected (proves `z.strictObject` is used, not `z.object`).
    Test 8 (`'rejects an empty title'`): `title: ''` is rejected (proves `z.string().min(1)`).
    Test 9 (`'rejects an unknown source'`): `source: 'tiktok'` is rejected (proves source enum/discriminator works).
    Test 10 (`'parses an array of valid records'`): `VideoArraySchema.safeParse([validRecord, validRecord])` succeeds.
  </behavior>
  <action>
    Step 1 — Create `src/lib/data/schema.ts` with EXACTLY this content (Zod 4 API per 02-RESEARCH.md):

    ```ts
    /**
     * Zod 4 schema for the Video data layer.
     *
     * Source decisions:
     *   D-01 / D-04: CATEGORIES list lives in ./categories (single source of truth).
     *   D-05: required fields = source, id, title, uploader, thumbnail, embed, category, published.
     *   D-06: optional fields = duration_seconds, description (UI degrades gracefully).
     *   D-07: published is ISO date string YYYY-MM-DD (Zod 4: z.iso.date()).
     *   D-08: schema-forward additions — featured (default false), hidden (default false),
     *         tags (default []), credits (optional object).
     *   D-15: schema violations fail the build (enforced by the Vite plugin in Plan 02-03).
     *
     * Why z.strictObject:
     *   Rejects unknown keys. A typo'd field name (e.g., "titel" instead of "title")
     *   would be silently dropped by z.object() — strictObject fails the build instead.
     *
     * Why z.discriminatedUnion('source', ...):
     *   Future-proofs for source-specific field divergence (e.g., a YouTube-only
     *   playlist_id). Today both branches are identical; the discriminated union
     *   gives narrower types in if (v.source === 'youtube') branches at the call site.
     *
     * Why z.iso.date():
     *   Zod 4 built-in for strict YYYY-MM-DD with zero-padding. Replaces the deprecated
     *   z.string().date() / z.string().regex(/.../) hand-rolling.
     */
    import { z } from 'zod';
    import { CATEGORIES } from './categories';

    export const CategorySchema = z.enum(CATEGORIES);

    const CommonFields = {
      id: z.string().min(1),
      title: z.string().min(1, 'title must not be empty'),
      uploader: z.string().min(1),
      published: z.iso.date(), // strict YYYY-MM-DD per Zod 4 docs
      thumbnail: z.url(),
      embed: z.url(),
      // The seed includes a top-level `url` (the human-friendly watch page URL).
      // It's not load-bearing for the site (we use `embed` for iframes), but we
      // accept it here to round-trip the JSON. Optional so future records can omit it.
      url: z.url().optional(),
      category: CategorySchema,
      description: z.string().optional(),
      duration_seconds: z.number().int().positive().optional(),
      // D-08 schema-forward additions:
      featured: z.boolean().default(false),
      hidden: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      credits: z
        .object({
          director: z.string().optional(),
          producer: z.string().optional(),
          agency: z.string().optional(),
          dop: z.string().optional(),
        })
        .optional(),
    };

    export const VideoSchema = z.discriminatedUnion('source', [
      z.strictObject({ source: z.literal('youtube'), ...CommonFields }),
      z.strictObject({ source: z.literal('vimeo'), ...CommonFields }),
    ]);

    export const VideoArraySchema = z.array(VideoSchema);

    export type Video = z.infer<typeof VideoSchema>;
    ```

    CRITICAL — DO NOT in this file:
    - DO NOT import `videos.json` (that's Plan 02-03's loader). The schema module is pure: Zod schemas + types only. Importing JSON here would create the circular path Plan 02-03 + the Vite plugin avoid (02-RESEARCH Pitfall 1).
    - DO NOT export an instance of parsed data; only export schemas + the inferred type.
    - DO NOT use `z.string().date()` (deprecated in Zod 4) or `z.string().regex(/.../)` (hand-rolling). Use `z.iso.date()`.
    - DO NOT use `z.object()` for the record (would silently accept unknown keys). Use `z.strictObject()`.
    - DO NOT use `z.formatError()` anywhere (deprecated in Zod 4 — Plan 02-03 uses `z.prettifyError()`).

    Step 2 — In `src/lib/data/schema.test.ts`, find the THREE `describe.skip(...)` calls and replace each with `describe(...)`. Remove the two `// @ts-expect-error — module exists after Plan 02-01` comment lines above the imports (both modules now exist).

    The file should now start:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { VideoSchema, VideoArraySchema } from './schema';
    import { CATEGORIES } from './categories';
    ```

    (NO `@ts-expect-error`, NO `describe.skip`.)

    Step 3 — Run `pnpm vitest run src/lib/data/schema.test.ts` and confirm all 10 tests pass.

    Step 4 — Run `pnpm check` and confirm zero TS errors.

    Step 5 — Sanity check the inferred `Video` type. Add a one-shot test (do NOT commit if it's already covered by the `'optional fields'` test):
    `const v: import('./schema').Video = { source: 'vimeo', id: '1', title: 't', uploader: 'u', published: '2020-01-01', thumbnail: 'https://x.y', embed: 'https://x.y', category: 'Reel' };`
    must compile under `pnpm check`. (This is verified by the existing `'canonical schema accepts a valid record'` test — no separate test needed.)
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/data/schema.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/data/schema.ts` exists.
    - `src/lib/data/schema.ts` contains the literal string `import { z } from 'zod';`.
    - `src/lib/data/schema.ts` contains the literal string `import { CATEGORIES } from './categories';`.
    - `src/lib/data/schema.ts` contains the literal string `export const CategorySchema = z.enum(CATEGORIES);`.
    - `src/lib/data/schema.ts` contains the literal string `z.iso.date()` (NOT `z.string().date()`, NOT `z.string().regex`).
    - `src/lib/data/schema.ts` contains the literal string `z.discriminatedUnion('source'`.
    - `src/lib/data/schema.ts` contains the literal string `z.strictObject({ source: z.literal('youtube')`.
    - `src/lib/data/schema.ts` contains the literal string `z.strictObject({ source: z.literal('vimeo')`.
    - `src/lib/data/schema.ts` contains the literal string `featured: z.boolean().default(false)`.
    - `src/lib/data/schema.ts` contains the literal string `hidden: z.boolean().default(false)`.
    - `src/lib/data/schema.ts` contains the literal string `tags: z.array(z.string()).default([])`.
    - `src/lib/data/schema.ts` contains the literal string `export const VideoArraySchema = z.array(VideoSchema);`.
    - `src/lib/data/schema.ts` contains the literal string `export type Video = z.infer<typeof VideoSchema>;`.
    - `src/lib/data/schema.ts` does NOT import from `./videos.json` (Pitfall 1 — schema must be pure). `grep -c "videos.json" src/lib/data/schema.ts` returns 0.
    - `src/lib/data/schema.test.ts` no longer contains `describe.skip` (count = 0).
    - `src/lib/data/schema.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/lib/data/schema.test.ts` exits 0 (all 10 tests pass — confirms DATA-02 acceptance, DATA-03 rejection of bad data, DATA-04 rejection of unknown category).
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    Zod schema is the single validation contract: rejects unknown categories, unknown extra fields, non-ISO dates, missing required fields, empty titles, unknown sources; accepts all 8 canonical categories with optional fields handled per D-06 and defaults applied per D-08; all 10 tests in `schema.test.ts` are GREEN.
  </done>
</task>

</tasks>

<verification>
**After both tasks complete:**

1. `pnpm vitest run src/lib/data/categories.test.ts` exits 0 (all describe blocks no longer skipped, all tests green).
2. `pnpm vitest run src/lib/data/schema.test.ts` exits 0 (all describe blocks no longer skipped, all tests green).
3. `pnpm vitest run src/lib/data/` exits 0 (the `videos.json.test.ts` and `videos.test.ts` blocks remain skipped — that's by design; Plans 02-02 and 02-03 unskip them).
4. `pnpm check` exits 0 (no TypeScript errors).
5. `pnpm build` exits 0 (no Vite plugin yet — `vite.config.ts` unchanged from Plan 02-00).
6. `package.json` contains `"zod": "4.4.3"` (literal, no caret/tilde).
7. `src/lib/data/categories.ts` and `src/lib/data/schema.ts` exist; `videos.ts` and `videos.json` do NOT exist yet (those are 02-02 / 02-03).

**Goal-backward check:**
- Truth: "Single source of truth for categories" → `CATEGORIES` array in `categories.ts`, imported by `schema.ts` ✓
- Truth: "`Category` type derived" → `(typeof CATEGORIES)[number]` ✓
- Truth: "Slug rule lives in one place" → `categoryToSlug` pure function ✓
- Truth: "Schema rejects bad data" → 7 rejection tests pass (empty title, unknown category, unknown source, missing field, non-ISO date, unknown extra field, etc.) ✓
- Truth: "Schema accepts D-08 defaults" → `featured`, `hidden`, `tags` parse with defaults applied ✓
</verification>

<success_criteria>
Plan 02-01 complete when:
- [ ] `zod@4.4.3` pinned exact in `devDependencies`
- [ ] `src/lib/data/categories.ts` exists with `CATEGORIES`, `Category`, `categoryToSlug`, `slugToCategory`
- [ ] `src/lib/data/schema.ts` exists with `CategorySchema`, `VideoSchema`, `VideoArraySchema`, `Video` type
- [ ] All 5 tests in `categories.test.ts` pass
- [ ] All 10 tests in `schema.test.ts` pass
- [ ] `pnpm check` exits 0
- [ ] `pnpm vitest run src/lib/data/` exits 0 (categories + schema green; videos.json + videos still skipped)
- [ ] No JSON imports in `schema.ts` (Pitfall 1)
- [ ] No `z.string().date()` / `z.formatError()` / `z.object()` for the record (Zod 4 deprecated patterns)
</success_criteria>

<output>
After completion, create `.planning/phases/02-data-layer/02-01-SUMMARY.md` documenting:
- The 8 canonical categories committed to source
- The slug derivation rule (one regex, one place)
- The Zod 4 patterns chosen (`z.discriminatedUnion`, `z.strictObject`, `z.iso.date()`, `z.url()`)
- The schema-forward fields (D-08) with their defaults
- Confirmation that `schema.ts` is pure (no JSON import) — preserves Pitfall 1 avoidance for Plan 02-03's Vite plugin
- The two test files that turned from RED (skipped) to GREEN
</output>
</content>
</invoke>