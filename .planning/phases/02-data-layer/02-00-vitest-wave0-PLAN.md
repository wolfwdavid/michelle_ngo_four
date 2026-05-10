---
phase: 02-data-layer
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - vite.config.ts
  - src/lib/data/schema.test.ts
  - src/lib/data/categories.test.ts
  - src/lib/data/videos.json.test.ts
  - src/lib/data/videos.test.ts
  - scripts/test-build-fails.mjs
  - tsconfig.json
autonomous: true
requirements: []
must_haves:
  truths:
    - "Vitest 4.1.5 is installed as a dev dependency, pinned exact (no caret/tilde)."
    - "`pnpm vitest --version` exits 0 and prints `4.x`."
    - "All four test stub files exist under `src/lib/data/` with TypeScript-valid imports (even though the modules they import don't exist yet — tests use `// @ts-expect-error` or skip blocks until Wave 1)."
    - "`scripts/test-build-fails.mjs` exists and is executable via `node scripts/test-build-fails.mjs`."
    - "Wave 0 tests are RED (skipped or expected-to-fail) — they go GREEN as Waves 1–3 land."
  artifacts:
    - path: "src/lib/data/schema.test.ts"
      provides: "Schema acceptance + rejection test stubs (DATA-02, DATA-03, DATA-04)"
    - path: "src/lib/data/categories.test.ts"
      provides: "categoryToSlug + CATEGORIES test stubs (DATA-04, D-03)"
    - path: "src/lib/data/videos.json.test.ts"
      provides: "Canonical file integrity stubs (DATA-01, DATA-02)"
    - path: "src/lib/data/videos.test.ts"
      provides: "Loader behavior stubs (DATA-01, D-04, D-09, D-14)"
    - path: "scripts/test-build-fails.mjs"
      provides: "Build-pipeline smoke test for DATA-03"
    - path: "vite.config.ts"
      provides: "Vitest `test` block under `defineConfig`"
  key_links:
    - from: "vite.config.ts"
      to: "vitest"
      via: "test block in defineConfig — `test: { include: ['src/**/*.{test,spec}.{js,ts}'] }`"
      pattern: "test:\\s*\\{"
    - from: "package.json"
      to: "vitest@4.1.5"
      via: "devDependencies (pinned exact)"
      pattern: "\"vitest\":\\s*\"4\\."
---

<objective>
Install Vitest 4.1.5 (pinned exact, dev-only) and scaffold the four test stub files + the build-fail smoke script that downstream waves will fill in. This unblocks the `<automated>` verify commands referenced in plans 02-01 / 02-02 / 02-03 (per `02-VALIDATION.md` Per-Task Verification Map).

Purpose: Wave 0 of `02-VALIDATION.md`. Without this plan, no downstream plan has a runnable `<automated>` command — every plan would be deferred-to-Wave-0. This plan IS that Wave 0.

Output:
- `vitest@4.1.5` + `@vitest/coverage-v8@4.1.5` in `devDependencies` (pinned exact)
- `vite.config.ts` extended with a Vitest `test` block
- Four test stub files (RED state until Waves 1–3 land their implementations)
- `scripts/test-build-fails.mjs` (build-pipeline smoke test for DATA-03)
- `pnpm vitest run` runs cleanly (zero failures, may have skipped tests)
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
<!-- Existing toolchain (current state on disk before this plan runs). -->
<!-- Executor must preserve these signatures and only ADD the test block. -->

From vite.config.ts (current — DO NOT remove plugins):
```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
});
```

From package.json (current pinning convention from Phase 1 STATE):
- All deps pinned EXACT (no `^`, no `~`) — see `"svelte": "5.55.5"`, `"vite": "8.0.7"`, etc.
- `packageManager: "pnpm@11.0.9"` — locked.
- `engines.node: ">=22"` — locked.

From tsconfig.json (current):
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```
NEVER add `include` to this file (Phase 1 RESEARCH Pitfall 3).

From src/lib/index.ts (current):
```ts
// place files you want to import through the `$lib` alias in this folder.
export {};
```
Leave this stub alone in Wave 0. The public `$lib/data` surface lands in Plan 02-03.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Vitest 4.1.5 pinned exact and add Vitest test block to vite.config.ts</name>
  <files>package.json, vite.config.ts, tsconfig.json</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\package.json (current dep pinning convention — every dep is EXACT, no caret/tilde — Phase 1 STATE locked this)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\vite.config.ts (only 7 lines — must preserve `tailwindcss()` BEFORE `sveltekit()` per Phase 1 RESEARCH Pattern 1)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\tsconfig.json (must NOT add `include` field — Phase 1 RESEARCH Pitfall 3)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 89-125 Standard Stack — confirms `vitest@4.1.5` + `-D -E` install)
  </read_first>
  <action>
    Step 1 — Install Vitest pinned exact (DO NOT use `pnpm dlx sv add vitest` — it pulls jsdom/playwright which we don't need; we want a minimal node-environment test runner only):

    ```
    pnpm add -D -E vitest@4.1.5 @vitest/coverage-v8@4.1.5
    ```

    Verify the resulting `package.json` `devDependencies` block contains EXACTLY (no caret, no tilde):
    - `"vitest": "4.1.5"`
    - `"@vitest/coverage-v8": "4.1.5"`

    If pnpm adds carets, hand-edit `package.json` to strip them, then run `pnpm install --frozen-lockfile=false` to regenerate the lockfile. Phase 1 STATE locks "every load-bearing dep pinned exact (no caret/tilde)". This rule applies to vitest.

    Step 2 — Add Vitest scripts to `package.json` `scripts` block (insert immediately after the existing `"check:watch"` line):

    ```json
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "test:data": "vitest run src/lib/data/",
    ```

    The `--passWithNoTests` flag on the `test` script removes the Vitest-version-dependent ambiguity around what happens when zero tests are collected (relevant in Wave 0 because every test stub starts with `describe.skip`). Without it, some Vitest 4.x configurations exit non-zero on "no tests found" — and any future refactor that temporarily removes test files would surface a confusing CI failure.

    Do NOT touch the existing `dev`, `build`, `preview`, `check`, `check:watch`, `lint`, `format`, `prepare` scripts.

    Step 3 — Extend `vite.config.ts` with a Vitest `test` block. Replace the entire file contents with:

    ```ts
    /// <reference types="vitest/config" />
    import { sveltekit } from '@sveltejs/kit/vite';
    import { defineConfig } from 'vite';
    import tailwindcss from '@tailwindcss/vite';

    export default defineConfig({
      plugins: [tailwindcss(), sveltekit()],
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

    Notes on this config:
    - `environment: 'node'` — schema/loader tests run in plain Node, no jsdom needed (we're not testing components).
    - `globals: false` — explicit imports (`import { describe, it, expect } from 'vitest'`) keep tests grep-able and avoid polluting the type space.
    - `include` pattern keeps `*.test.ts` and `*.spec.ts` files anywhere under `src/`. Plan 02-03 will add the future Vite plugin; the `test` block stays where it is.
    - The triple-slash reference adds Vitest's `test` types to the `defineConfig` call. Without it, TypeScript flags `test` as an unknown property.

    Step 4 — DO NOT touch `tsconfig.json`. The existing config (`extends: "./.svelte-kit/tsconfig.json"` + 3 strict flags) already covers `src/**/*.test.ts` because SvelteKit's generated config includes everything under `src/`. Adding `include` here would break `$types` resolution (Phase 1 RESEARCH Pitfall 3).

    Step 5 — Sanity check: `pnpm vitest --version` must print `4.1.5` (or `vitest/4.1.5`). If it prints anything else, the wrong version was installed; redo Step 1.
  </action>
  <verify>
    <automated>pnpm vitest --version</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` `devDependencies` contains the literal string `"vitest": "4.1.5"` (NOT `^4.1.5`, NOT `~4.1.5`).
    - `package.json` `devDependencies` contains the literal string `"@vitest/coverage-v8": "4.1.5"`.
    - `package.json` `scripts` contains the literal lines `"test": "vitest run --passWithNoTests"`, `"test:watch": "vitest"`, `"test:data": "vitest run src/lib/data/"`.
    - `grep "vitest run --passWithNoTests" package.json` returns exactly 1 match (the `test` script line).
    - `vite.config.ts` contains the literal string `/// <reference types="vitest/config" />` on line 1.
    - `vite.config.ts` contains the literal string `test: {` and `environment: 'node'`.
    - `vite.config.ts` still has `tailwindcss()` BEFORE `sveltekit()` in the plugins array (preserve order).
    - `tsconfig.json` is BYTE-IDENTICAL to its pre-task state (no edits — this is a pass-through criterion).
    - `pnpm vitest --version` exits 0.
    - `pnpm vitest run --passWithNoTests` exits 0 (it will run zero tests because the stub files don't exist yet — that's fine; the explicit flag matches the script in package.json).
  </acceptance_criteria>
  <done>
    Vitest 4.1.5 is installed pinned exact, `vite.config.ts` has the test block, `pnpm vitest --version` prints 4.1.5, and `pnpm vitest run --passWithNoTests` exits 0.
  </done>
</task>

<task type="auto">
  <name>Task 2: Scaffold the four test stub files with placeholder describe/it blocks (RED state)</name>
  <files>src/lib/data/schema.test.ts, src/lib/data/categories.test.ts, src/lib/data/videos.json.test.ts, src/lib/data/videos.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-VALIDATION.md (Per-Task Verification Map — every test name below must match a row in that table verbatim)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 472-549 Code Examples — schema test patterns; lines 539-549 loader smoke test)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-CONTEXT.md (D-01 through D-15 — every test references a decision)
  </read_first>
  <action>
    Create FOUR test files. Each file uses `describe.skip()` (skipping the whole block) so `pnpm vitest run` exits 0 in Wave 0 even though the modules under test don't exist yet. Plans 02-01 / 02-02 / 02-03 will:
    1. Implement the module being tested (categories.ts, schema.ts, videos.json, videos.ts).
    2. Remove the `.skip` from the matching describe block.
    3. Verify the test goes GREEN.

    The test names below MUST match `02-VALIDATION.md` Per-Task Verification Map verbatim — downstream plans use `pnpm vitest run -t "<name>"` exactly as written there.

    File 1 — `src/lib/data/schema.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    // NOTE: imports below intentionally reference modules that don't exist yet in Wave 0.
    // Plan 02-01 creates ./schema.ts and ./categories.ts. The describe.skip wrapper
    // keeps `pnpm vitest run` green in Wave 0; Plan 02-01 removes `.skip` to turn these RED→GREEN.
    // @ts-expect-error — module exists after Plan 02-01
    import { VideoSchema, VideoArraySchema } from './schema';
    // @ts-expect-error — module exists after Plan 02-01
    import { CATEGORIES } from './categories';

    const validRecord = {
      source: 'vimeo',
      id: '264677021',
      title: 'Producer Reel',
      uploader: 'Michelle Ngo',
      published: '2018-04-13',
      thumbnail: 'https://example.com/t.jpg',
      embed: 'https://player.vimeo.com/video/264677021',
      category: 'Reel',
    } as const;

    describe.skip('schema accepts valid records', () => {
      it('canonical schema accepts a valid record', () => {
        expect(VideoSchema.safeParse(validRecord).success).toBe(true);
      });

      it('optional fields (duration_seconds, description) parse when absent', () => {
        const result = VideoSchema.safeParse(validRecord);
        expect(result.success).toBe(true);
      });

      it('accepts all 8 canonical categories', () => {
        for (const cat of CATEGORIES) {
          const r = VideoSchema.safeParse({ ...validRecord, category: cat });
          expect(r.success, `category ${cat} should parse`).toBe(true);
        }
      });
    });

    describe.skip('schema rejects bad data', () => {
      it('rejects a missing required field', () => {
        const { title: _omit, ...bad } = validRecord;
        expect(VideoSchema.safeParse(bad).success).toBe(false);
      });

      it('rejects a non-ISO date', () => {
        expect(VideoSchema.safeParse({ ...validRecord, published: '04/13/2018' }).success).toBe(false);
      });

      it('rejects an unknown category', () => {
        expect(
          VideoSchema.safeParse({ ...validRecord, category: 'PBS American Portraits' }).success,
        ).toBe(false);
      });

      it('rejects an unknown extra field', () => {
        expect(VideoSchema.safeParse({ ...validRecord, evil_extra: true }).success).toBe(false);
      });

      it('rejects an empty title', () => {
        expect(VideoSchema.safeParse({ ...validRecord, title: '' }).success).toBe(false);
      });

      it('rejects an unknown source', () => {
        expect(VideoSchema.safeParse({ ...validRecord, source: 'tiktok' }).success).toBe(false);
      });
    });

    describe.skip('VideoArraySchema validates the canonical file', () => {
      it('parses an array of valid records', () => {
        const result = VideoArraySchema.safeParse([validRecord, validRecord]);
        expect(result.success).toBe(true);
      });
    });
    ```

    File 2 — `src/lib/data/categories.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    // @ts-expect-error — module exists after Plan 02-01
    import { CATEGORIES, categoryToSlug, slugToCategory } from './categories';

    describe.skip('CATEGORIES array', () => {
      it('contains exactly 8 entries from _prep/04-categories.md', () => {
        expect(CATEGORIES).toEqual([
          'PBS American Portrait',
          'Promos & Trailers',
          'Branded Content',
          'Documentary / Short Film',
          'Reel',
          'Personal / Tribute',
          'Educational / Nonprofit',
          'Other',
        ]);
      });
    });

    describe.skip('categoryToSlug', () => {
      it('derives kebab-case slugs single-rule (D-03)', () => {
        expect(categoryToSlug('PBS American Portrait')).toBe('pbs-american-portrait');
        expect(categoryToSlug('Promos & Trailers')).toBe('promos-trailers');
        expect(categoryToSlug('Branded Content')).toBe('branded-content');
        expect(categoryToSlug('Documentary / Short Film')).toBe('documentary-short-film');
        expect(categoryToSlug('Reel')).toBe('reel');
        expect(categoryToSlug('Personal / Tribute')).toBe('personal-tribute');
        expect(categoryToSlug('Educational / Nonprofit')).toBe('educational-nonprofit');
        expect(categoryToSlug('Other')).toBe('other');
      });

      it('produces unique slugs for all 8 categories (no collisions)', () => {
        const slugs = CATEGORIES.map((c: (typeof CATEGORIES)[number]) => categoryToSlug(c));
        expect(new Set(slugs).size).toBe(slugs.length);
      });
    });

    describe.skip('slugToCategory', () => {
      it('round-trips every category', () => {
        for (const cat of CATEGORIES) {
          expect(slugToCategory(categoryToSlug(cat))).toBe(cat);
        }
      });

      it('returns undefined for an unknown slug', () => {
        expect(slugToCategory('does-not-exist')).toBeUndefined();
      });
    });
    ```

    File 3 — `src/lib/data/videos.json.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    // @ts-expect-error — module exists after Plan 02-01
    import { VideoArraySchema } from './schema';
    // @ts-expect-error — file exists after Plan 02-02
    import videosJson from './videos.json';

    describe.skip('canonical videos.json', () => {
      it('canonical videos.json validates', () => {
        const result = VideoArraySchema.safeParse(videosJson);
        if (!result.success) {
          console.error(result.error);
        }
        expect(result.success).toBe(true);
      });

      it('exactly 56 videos', () => {
        expect(Array.isArray(videosJson)).toBe(true);
        expect((videosJson as unknown[]).length).toBe(56);
      });

      it('unique IDs per source', () => {
        const parsed = VideoArraySchema.parse(videosJson);
        const keys = parsed.map((v: { source: string; id: string }) => `${v.source}:${v.id}`);
        expect(new Set(keys).size).toBe(keys.length);
      });

      it('contains the producer reel (vimeo:264677021)', () => {
        const parsed = VideoArraySchema.parse(videosJson);
        const reel = parsed.find(
          (v: { source: string; id: string }) => v.source === 'vimeo' && v.id === '264677021',
        );
        expect(reel).toBeDefined();
      });

      it('category counts match D-04 (PBS:18, Promos:12, Branded:8, Doc:5, Reel:4, Personal:3, Edu:3, Other:3)', () => {
        const parsed = VideoArraySchema.parse(videosJson);
        const counts: Record<string, number> = {};
        for (const v of parsed as Array<{ category: string }>) {
          counts[v.category] = (counts[v.category] ?? 0) + 1;
        }
        expect(counts['PBS American Portrait']).toBe(18);
        expect(counts['Promos & Trailers']).toBe(12);
        expect(counts['Branded Content']).toBe(8);
        expect(counts['Documentary / Short Film']).toBe(5);
        expect(counts['Reel']).toBe(4);
        expect(counts['Personal / Tribute']).toBe(3);
        expect(counts['Educational / Nonprofit']).toBe(3);
        expect(counts['Other']).toBe(3);
      });
    });
    ```

    File 4 — `src/lib/data/videos.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    // @ts-expect-error — module exists after Plan 02-03
    import {
      videos,
      producerReelId,
      getById,
      getByCategory,
      getCategoriesInDisplayOrder,
      getCategoriesWithCounts,
    } from './videos';

    describe.skip('loader: videos array', () => {
      it('videos array length is 56 (no hidden in v1 per D-12)', () => {
        expect(videos.length).toBe(56);
      });

      it('hidden videos filtered (D-14) — none in v1, but loader path exists', () => {
        // D-12: zero hidden in v1; D-14: loader filters hidden=true.
        // Smoke test: every video in the public array has hidden===false after parse.
        for (const v of videos) {
          expect(v.hidden).toBe(false);
        }
      });
    });

    describe.skip('loader: producerReelId (D-09)', () => {
      it('producerReelId is the literal "264677021"', () => {
        expect(producerReelId).toBe('264677021');
      });

      it('producerReelId resolves to a real video in the public array (D-11)', () => {
        const reel = videos.find((v) => v.source === 'vimeo' && v.id === producerReelId);
        expect(reel).toBeDefined();
        expect(reel?.category).toBe('Reel');
      });
    });

    describe.skip('loader: getById', () => {
      it('returns the matching video', () => {
        const v = getById('264677021');
        expect(v).toBeDefined();
        expect(v?.title.toLowerCase()).toContain('reel');
      });

      it('returns undefined for an unknown id (noUncheckedIndexedAccess narrowing)', () => {
        expect(getById('does-not-exist')).toBeUndefined();
      });
    });

    describe.skip('loader: getByCategory', () => {
      it('returns all 18 PBS videos', () => {
        expect(getByCategory('PBS American Portrait').length).toBe(18);
      });

      it('returns empty array for a category with zero matches (none in v1, smoke check on Reel=4)', () => {
        expect(getByCategory('Reel').length).toBe(4);
      });
    });

    describe.skip('loader: display order (D-04)', () => {
      it('display order: first category is PBS American Portrait (18 videos, count desc)', () => {
        expect(getCategoriesInDisplayOrder()[0]).toBe('PBS American Portrait');
      });

      it('display order: ties broken alphabetically (Educational / Nonprofit, Other, Personal / Tribute all =3)', () => {
        const order = getCategoriesInDisplayOrder();
        const threeWayTie = order.filter(
          (c) => c === 'Educational / Nonprofit' || c === 'Other' || c === 'Personal / Tribute',
        );
        expect(threeWayTie).toEqual(['Educational / Nonprofit', 'Other', 'Personal / Tribute']);
      });

      it('display order: full sequence per D-04', () => {
        expect(getCategoriesInDisplayOrder()).toEqual([
          'PBS American Portrait',
          'Promos & Trailers',
          'Branded Content',
          'Documentary / Short Film',
          'Reel',
          'Educational / Nonprofit',
          'Other',
          'Personal / Tribute',
        ]);
      });
    });

    describe.skip('loader: getCategoriesWithCounts', () => {
      it('returns category + slug + count for all 8', () => {
        const arr = getCategoriesWithCounts();
        expect(arr.length).toBe(8);
        const pbs = arr.find((c) => c.category === 'PBS American Portrait');
        expect(pbs?.slug).toBe('pbs-american-portrait');
        expect(pbs?.count).toBe(18);
      });
    });
    ```

    NOTES on the `.skip` strategy:
    - Every `describe.skip(...)` keeps the suite GREEN in Wave 0.
    - Plan 02-01 removes `.skip` from `schema.test.ts` (after creating `schema.ts`) and from `categories.test.ts` (after creating `categories.ts`).
    - Plan 02-02 removes `.skip` from the `'canonical videos.json'` describe block in `videos.json.test.ts` (after authoring `videos.json`).
    - Plan 02-03 removes `.skip` from every `describe.skip` in `videos.test.ts` (after creating `videos.ts`).
    - Each downstream plan's acceptance criteria includes "the matching describe.skip block has had `.skip` removed".

    Do NOT add any other test files in this task. Do NOT remove any `.skip` in this task — Wave 0 is RED-by-design.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/data/</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/data/schema.test.ts` exists.
    - File `src/lib/data/categories.test.ts` exists.
    - File `src/lib/data/videos.json.test.ts` exists.
    - File `src/lib/data/videos.test.ts` exists.
    - `grep -c "describe.skip" src/lib/data/schema.test.ts` returns 3 (three describe blocks in schema.test.ts).
    - `grep -c "describe.skip" src/lib/data/categories.test.ts` returns 3.
    - `grep -c "describe.skip" src/lib/data/videos.json.test.ts` returns 1.
    - `grep -c "describe.skip" src/lib/data/videos.test.ts` returns 6.
    - Each test file contains `import { describe, expect, it } from 'vitest';` on or near line 1.
    - `pnpm vitest run src/lib/data/` exits 0 (all describe blocks skipped → 0 tests run, 0 failures).
    - The literal test name `'rejects an unknown category'` appears in `schema.test.ts` (matches `02-VALIDATION.md` row).
    - The literal test name `'categoryToSlug'` describe block appears in `categories.test.ts`.
    - The literal test name `'exactly 56 videos'` appears in `videos.json.test.ts`.
    - The literal test name `'producerReelId resolves'` (within an `it()`) appears in `videos.test.ts`.
    - The literal test name `'display order'` (within an `it()` or describe block) appears in `videos.test.ts`.
    - The literal test name `'hidden videos filtered'` (within an `it()`) appears in `videos.test.ts`.
  </acceptance_criteria>
  <done>
    Four test stub files exist; each is RED-by-design (describe.skip), schema/loader/json tests are scaffolded with the exact test names referenced in `02-VALIDATION.md`; `pnpm vitest run src/lib/data/` exits 0.
  </done>
</task>

<task type="auto">
  <name>Task 3: Create scripts/test-build-fails.mjs (DATA-03 build-pipeline smoke test)</name>
  <files>scripts/test-build-fails.mjs</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-VALIDATION.md (the row "Plan 02-03 / DATA-03 / `pnpm build` exits non-zero when videos.json is corrupted" — this script is the implementation of that row)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 247-289 Pattern 3 — Vite plugin's `this.error()` is what makes `pnpm build` exit non-zero)
  </read_first>
  <action>
    Create `scripts/test-build-fails.mjs`. This is a Node ES-module script (no TypeScript, no extra dep — `tsx` is intentionally avoided). It is invoked manually after Plan 02-03 lands the Vite plugin; in Wave 0 it exists but cannot pass yet (the Vite plugin and `videos.json` don't exist). That's fine — the script is dependency-free and doesn't need to RUN in Wave 0; it just needs to EXIST so Plan 02-03's `<automated>` verify command can reference it.

    Full file contents:

    ```js
    #!/usr/bin/env node
    /**
     * Build-pipeline smoke test for DATA-03.
     *
     * Proves: `pnpm build` exits non-zero when `src/lib/data/videos.json` is corrupted
     * (the Vite plugin's `buildStart` hook calls `this.error()` on schema violation).
     *
     * Flow:
     *   1. Snapshot the current videos.json to a temp backup.
     *   2. Write a deliberately-corrupted videos.json (unknown category).
     *   3. Run `pnpm build` and capture the exit code.
     *   4. Restore the original videos.json from the backup (always — even on script crash).
     *   5. Exit 0 iff the build exited non-zero. Exit 1 if the build PASSED (that's the bug we're catching).
     *
     * Usage: node scripts/test-build-fails.mjs
     */
    import { spawnSync } from 'node:child_process';
    import { copyFileSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
    import { resolve, dirname } from 'node:path';
    import { fileURLToPath } from 'node:url';

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const REPO_ROOT = resolve(__dirname, '..');
    const VIDEOS_JSON = resolve(REPO_ROOT, 'src/lib/data/videos.json');
    const BACKUP = resolve(REPO_ROOT, 'src/lib/data/videos.json.smoke-backup');

    if (!existsSync(VIDEOS_JSON)) {
      console.error(
        `[test-build-fails] FATAL: ${VIDEOS_JSON} does not exist yet. ` +
          `This script can only run after Plan 02-02 authors videos.json AND Plan 02-03 wires the Vite plugin.`,
      );
      process.exit(2); // distinct from 1 (build-passed-bug) and 0 (success)
    }

    // Snapshot — restore on every exit path.
    copyFileSync(VIDEOS_JSON, BACKUP);
    const restore = () => {
      if (existsSync(BACKUP)) {
        copyFileSync(BACKUP, VIDEOS_JSON);
        unlinkSync(BACKUP);
      }
    };
    process.on('exit', restore);
    process.on('SIGINT', () => {
      restore();
      process.exit(130);
    });
    process.on('uncaughtException', (e) => {
      restore();
      console.error(e);
      process.exit(2);
    });

    try {
      // Corrupt: take row 0, change its category to a definitely-not-canonical value.
      const original = JSON.parse(readFileSync(VIDEOS_JSON, 'utf-8'));
      if (!Array.isArray(original) || original.length === 0) {
        console.error('[test-build-fails] FATAL: videos.json is not a non-empty array.');
        process.exit(2);
      }
      const corrupted = JSON.parse(JSON.stringify(original));
      corrupted[0].category = 'Gibberish — Not A Real Category';
      writeFileSync(VIDEOS_JSON, JSON.stringify(corrupted, null, 2) + '\n');

      console.log('[test-build-fails] Corrupted videos.json[0].category. Running pnpm build...');
      const build = spawnSync('pnpm', ['build'], {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        shell: true, // Windows-friendly: pnpm.cmd resolution
      });

      const exitCode = build.status ?? 1;
      console.log(`[test-build-fails] pnpm build exited with code ${exitCode}.`);

      if (exitCode === 0) {
        console.error(
          '[test-build-fails] FAIL: pnpm build PASSED on corrupted videos.json. ' +
            'The Vite validation plugin is not wired correctly — DATA-03 is not enforced at the build pipeline.',
        );
        process.exit(1);
      }

      console.log(
        '[test-build-fails] PASS: pnpm build correctly rejected corrupted videos.json (DATA-03 enforced).',
      );
      process.exit(0);
    } finally {
      // restore() also fires from 'exit' handler — belt-and-braces in case process.exit short-circuits.
      restore();
    }
    ```

    DO NOT make this script executable via `chmod +x` (the repo runs on Windows; the shebang is informational only — invoke via `node scripts/test-build-fails.mjs`).

    DO NOT add a "test:smoke" script to package.json in this plan — Plan 02-03 will add it after wiring the Vite plugin.
  </action>
  <verify>
    <automated>node -e "import('node:fs').then(fs=>{if(!fs.existsSync('scripts/test-build-fails.mjs'))process.exit(1)})"</automated>
  </verify>
  <acceptance_criteria>
    - File `scripts/test-build-fails.mjs` exists.
    - File contains the literal string `import { spawnSync } from 'node:child_process';`.
    - File contains the literal string `corrupted[0].category = 'Gibberish — Not A Real Category';`.
    - File contains the literal string `process.exit(0)` (success on non-zero build exit).
    - File contains the literal string `process.exit(1)` (failure on zero build exit — the bug we're catching).
    - File contains a restore-on-exit handler: grep matches `process.on('exit', restore)`.
    - File DOES NOT have a `tsx` import (script must run on plain Node).
    - The script does NOT need to execute successfully in Wave 0 — Plan 02-03 owns its first successful run.
  </acceptance_criteria>
  <done>
    `scripts/test-build-fails.mjs` exists, has the corrupt→build→restore flow, exits 0 only when `pnpm build` exits non-zero, and is dependency-free pure Node.
  </done>
</task>

</tasks>

<verification>
**After all 3 tasks complete:**

1. `pnpm vitest --version` exits 0, prints `4.1.5` (or `vitest/4.1.5`).
2. `pnpm vitest run --passWithNoTests` exits 0 (zero failures, all tests skipped — RED-by-design).
3. `pnpm vitest run src/lib/data/` exits 0.
4. `ls src/lib/data/` shows: `categories.test.ts`, `schema.test.ts`, `videos.json.test.ts`, `videos.test.ts` (4 files).
5. `ls scripts/` shows: `test-build-fails.mjs`.
6. `pnpm check` still exits 0 (no TS errors — `@ts-expect-error` annotations cover the missing-module imports).
7. `pnpm build` still exits 0 (Wave 0 doesn't add a Vite plugin yet; build pipeline unchanged).
8. `package.json` `vitest` and `@vitest/coverage-v8` both pinned exact (no caret/tilde).

**Goal-backward check:**
- Truth: "Vitest is installed" → `pnpm vitest --version` exits 0 ✓
- Truth: "Test stubs exist" → 4 test files exist with describe.skip blocks ✓
- Truth: "Build smoke script exists" → `scripts/test-build-fails.mjs` exists ✓
- Truth: "All Wave 0 tests are RED-by-design" → describe.skip on every block, `vitest run` exits 0 with 0 failures ✓
</verification>

<success_criteria>
Wave 0 complete when:
- [ ] Vitest 4.1.5 installed pinned exact in `devDependencies`
- [ ] `vite.config.ts` extended with the `test` block (preserving plugin order)
- [ ] Four test stub files exist with the exact `it()` test names referenced in `02-VALIDATION.md`
- [ ] `scripts/test-build-fails.mjs` exists and is dependency-free
- [ ] `pnpm vitest run` exits 0
- [ ] `pnpm check` still exits 0
- [ ] `pnpm build` still exits 0
- [ ] `02-VALIDATION.md` Wave 0 Requirements section can be checked off (planner updates `nyquist_compliant: true` in 02-VALIDATION.md frontmatter as a follow-up after this plan + 02-01 + 02-02 + 02-03 all land)
</success_criteria>

<output>
After completion, create `.planning/phases/02-data-layer/02-00-SUMMARY.md` documenting:
- Vitest version installed + pinning convention preserved
- Test stub files created and the test names they expose to downstream plans
- The describe.skip → describe rename pattern downstream plans must follow
- Why we did NOT use `pnpm dlx sv add vitest` (avoids jsdom/playwright bloat for a node-environment-only test surface)
</output>
</content>
</invoke>