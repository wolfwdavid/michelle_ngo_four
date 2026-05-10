---
phase: 02-data-layer
plan: 01
subsystem: data
tags: [zod, schema, typescript, validation, categories, data-layer]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: SvelteKit 2 + TS strict (noUncheckedIndexedAccess, noImplicitOverride) + Tailwind v4 scaffold, exact-pinning dev convention, lint-staged + husky pre-commit pipeline
  - phase: 02-data-layer
    provides: 02-00 Vitest 4.1.5 + describe.skip stub files (categories.test.ts, schema.test.ts) with lazy-import contract
provides:
  - zod@4.4.3 pinned exact as devDependency (alphabetically last in package.json)
  - src/lib/data/categories.ts — single source of truth for the 8 canonical categories (D-01) in seed-proposal order, `Category` type derived via (typeof CATEGORIES)[number], `categoryToSlug` + `slugToCategory` pure functions (D-03 single-rule kebab-case)
  - src/lib/data/schema.ts — Zod 4 schemas (CategorySchema, VideoSchema, VideoArraySchema), `Video` type via z.infer, schema-forward D-08 fields (featured/hidden/tags/credits) with defaults
  - GREEN tests for schema-level DATA-02 (per-record field shape), DATA-03 (schema-level rejection), DATA-04 (closed canonical category list)
affects: [02-02-author-videos-json, 02-03-loader-and-vite-plugin, 03-routes-and-grid, 04-hero-and-featured, 05-pbs-landing]

# Tech tracking
tech-stack:
  added: [zod@4.4.3]
  patterns:
    - 'Single-source-of-truth category list: `CATEGORIES` as const array in categories.ts → `z.enum(CATEGORIES)` reads it directly → `Category` type derived → slug rule pure function. Adding a 9th category = one-line edit.'
    - 'Zod 4 idiom: z.discriminatedUnion on a literal source field with z.strictObject branches; z.iso.date() for strict YYYY-MM-DD (replaces deprecated z.string().date()); z.url() for thumbnail+embed; .default() applies on .parse() (loader-time) not on raw JSON import.'
    - 'Pitfall 1 avoidance: schema.ts is pure (Zod schemas + types only, NO JSON imports). Loader (Plan 02-03) consumes both schema + JSON; Vite plugin (Plan 02-03) imports schema.ts only. Decouples module-evaluation order from validation-vs-parse cycle.'
    - 'Wave 0 → green rename contract: lazy `await import()` inside it() bodies + `describe.skip` wrapper + `// @ts-expect-error` directives. Downstream plans rename `describe.skip` → `describe` and remove stale `@ts-expect-error` directives once the imports resolve (TypeScript flags them as "Unused directive" — the natural signal).'

key-files:
  created:
    - src/lib/data/categories.ts
    - src/lib/data/schema.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - src/lib/data/categories.test.ts
    - src/lib/data/schema.test.ts
    - src/lib/data/videos.json.test.ts

key-decisions:
  - 'Used z.discriminatedUnion(source, [...]) with two identical z.strictObject branches (youtube + vimeo) instead of a single z.strictObject with z.enum([youtube, vimeo]) on source. Reason: future-proofs for per-source field divergence (e.g., a YouTube-only playlist_id) without a schema refactor; gives narrower types at call sites that branch on v.source. Documented in schema.ts header.'
  - 'CATEGORIES array stored in seed-proposal order (PBS, Promos, Branded, Doc/Short, Reel, Personal, Educational, Other) NOT D-04 display order. D-04 display order (count desc, ties alpha) is computed dynamically by getCategoriesInDisplayOrder() in Plan 02-03 loader. Header comment in categories.ts disambiguates the two orders so a future contributor does not "fix" the static array to match display order.'
  - 'Kept lazy `await import()` pattern from Wave 0 instead of converting to static top-level imports. Reason: only `describe.skip` blocks in videos.json.test.ts / videos.test.ts still reference not-yet-existing modules; switching categories.test.ts + schema.test.ts to static imports would have created an inconsistent two-pattern codebase. The lazy-import pattern is the documented Wave 0 contract; the rename is one-rule (describe.skip → describe, drop @ts-expect-error).'
  - 'Accepted top-level `url` field as `z.url().optional()` on every record. The seed (_prep/03-videos-seed.json) includes a `url` (human-friendly watch page URL) on every row. Stripping it would force the canonical videos.json to diverge from the seed; rejecting it would force Plan 02-02 to strip from every row before authoring. Accepting it lossless keeps Plan 02-02 trivial and gives `/watch/[id]` a future hook for non-iframe outbound links.'

patterns-established:
  - 'Single source of truth for closed enum: const array `as const` → derived TS type via (typeof X)[number] → Zod schema via z.enum(X) → slug helper as pure function. One file, one rule, one rename to add an entry.'
  - 'Zod 4 strict-record contract: z.strictObject (NOT z.object) so a typo in a JSON field name fails the build instead of silently dropping. Pairs with z.discriminatedUnion + z.literal for the variant discriminator.'
  - 'Test stubs honor the Wave 0 rename contract: each "downstream rename" is structurally identical (describe.skip → describe; remove "module exists after Plan 02-XX" directives the moment the module exists). Future plans can do the same rename mechanically.'

requirements-completed: [DATA-02, DATA-03, DATA-04]

# Metrics
duration: 7m
completed: 2026-05-10
---

# Phase 02 Plan 01: Types & Schema Summary

**zod@4.4.3 pinned exact + the 8 canonical categories committed to source as a single `CATEGORIES as const` array + a Zod 4 strict schema (discriminated union on source, z.iso.date for published, z.strictObject branches, D-08 schema-forward defaults) — 15 schema-level tests GREEN, schema.ts is pure (no JSON import), Pitfall 1 avoidance preserved for Plan 02-03's Vite plugin.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-10T21:52:02Z
- **Completed:** 2026-05-10T21:59:29Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 5

## Accomplishments

- **zod@4.4.3 installed with `-D -E`** (pinned exact, no caret/tilde, alphabetically last in devDependencies) — preserves Phase 1 STATE's "every load-bearing dep pinned exact" rule
- **`src/lib/data/categories.ts` ships the canonical 8-category taxonomy in seed-proposal order** as a `const [...] as const` array → `Category` type derived → `categoryToSlug` (one regex: lowercase + `[^a-z0-9]+ → '-'` + trim hyphens) + `slugToCategory` (memoized reverse-lookup returning `Category | undefined` for `noUncheckedIndexedAccess` compliance). Single source of truth for D-01 / D-03; D-04 display order stays a runtime computation in Plan 02-03's loader.
- **`src/lib/data/schema.ts` ships the Zod 4 schema** — `CategorySchema = z.enum(CATEGORIES)`, `VideoSchema = z.discriminatedUnion('source', [z.strictObject(youtube), z.strictObject(vimeo)])`, `VideoArraySchema = z.array(VideoSchema)`, `Video = z.infer<typeof VideoSchema>` — required fields per D-05 (id, title min(1), uploader, thumbnail+embed as z.url(), category as CategorySchema, published as z.iso.date()), optional per D-06 (duration_seconds, description, top-level url), schema-forward per D-08 (featured/hidden default false, tags default [], credits optional). Pure module — no JSON import (preserves Plan 02-03 Pitfall 1 avoidance).
- **15 schema-level tests GREEN** — 5 in categories.test.ts (CATEGORIES contents, categoryToSlug derivations, slug uniqueness, slugToCategory round-trip + undefined-on-miss) + 10 in schema.test.ts (accepts valid record, optional fields, all 8 categories; rejects missing field, non-ISO date, unknown category, unknown extra field, empty title, unknown source; VideoArraySchema validates array). DATA-02 / DATA-03 / DATA-04 acceptance proven.
- **`pnpm vitest run src/lib/data/` exits 0** (2 files / 15 tests green + 2 files / 17 tests skipped — exactly per plan contract; Plan 02-02 unskips videos.json.test.ts, Plan 02-03 unskips videos.test.ts)
- **`pnpm check` exits 0** (405 files / 0 errors / 0 warnings) and **`pnpm build` exits 0** ("✓ built in 4.39s") — full plan-level verification chain green

## Task Commits

Each task was committed atomically (sequential single-repo commits, pre-commit hooks `lint-staged` enforced — `eslint --fix` + `prettier --write`):

1. **Task 1: Install zod@4.4.3 and create src/lib/data/categories.ts (D-01, D-03, D-04)** — `886bc98` (chore)
2. **Task 2: Create src/lib/data/schema.ts (DATA-02, DATA-03, DATA-04 schema-level)** — `6143e18` (feat, includes Rule-3 fix to videos.json.test.ts)

## Files Created/Modified

**Created:**
- `src/lib/data/categories.ts` — `CATEGORIES` as const (8 strings, seed-proposal order), `Category` type, `categoryToSlug` pure function (single-rule kebab-case), `SLUG_TO_CATEGORY` memoized reverse-lookup, `slugToCategory` returning `Category | undefined`. 57 lines incl. JSDoc.
- `src/lib/data/schema.ts` — `CategorySchema = z.enum(CATEGORIES)`, `CommonFields` shared record shape (D-05 required + D-06 optional + D-08 schema-forward), `VideoSchema = z.discriminatedUnion('source', [youtube, vimeo])` with z.strictObject branches, `VideoArraySchema = z.array(VideoSchema)`, `Video = z.infer<typeof VideoSchema>`. Pure module — `import { z } from 'zod'; import { CATEGORIES } from './categories';` only. 66 lines incl. JSDoc.

**Modified:**
- `package.json` — added `"zod": "4.4.3"` (alphabetically last) to devDependencies. All other entries byte-identical.
- `pnpm-lock.yaml` — regenerated with zod@4.4.3 entry.
- `src/lib/data/categories.test.ts` — removed 3 `describe.skip` → `describe` (rename) + removed 5 `// @ts-expect-error — module exists after Plan 02-01` directives (now-resolving imports). 5 tests GREEN. Lazy `await import('./categories')` pattern preserved per Wave 0 contract.
- `src/lib/data/schema.test.ts` — removed 3 `describe.skip` → `describe` (rename) + removed 12 `// @ts-expect-error — module exists after Plan 02-01` directives. 10 tests GREEN. Lazy `await import('./schema')` + `await import('./categories')` pattern preserved per Wave 0 contract.
- `src/lib/data/videos.json.test.ts` — removed 4 `// @ts-expect-error — module exists after Plan 02-01` directives on `await import('./schema')` lines (Rule-3 deviation, see below). The single `describe.skip` wrapper remains — Plan 02-02 unskips when videos.json lands. The 4 `// @ts-expect-error — file exists after Plan 02-02` directives on `await import('./videos.json')` lines remain.

**Untouched (intentional):**
- `tsconfig.json` — byte-identical (164 bytes, sha256 `0cc31cc55bf4cc4fe114e2144ee57a420ac535bf11162d880a3f18abb7e1f445`). Phase 1 RESEARCH Pitfall 3 forbids adding `include` here; SvelteKit-generated tsconfig already covers `src/**/*.ts`.
- `vite.config.ts` — byte-identical. The validation Vite plugin lands in Plan 02-03; Plan 02-01 is type-and-schema only (Pitfall 1: vite.config.ts importing schema.ts is fine; schema.ts must never import videos.json).
- `src/lib/index.ts` — byte-identical Phase 1 stub. The `$lib/data` public surface (index.ts re-exports) is Plan 02-03's deliverable.
- `src/lib/data/videos.test.ts` — byte-identical from Wave 0. Six `describe.skip` blocks remain; the `// @ts-expect-error — module exists after Plan 02-03` directives all reference `./videos` which still does not exist. Plan 02-03's territory.

## Decisions Made

- **Used `z.discriminatedUnion('source', [youtube, vimeo])` instead of a single `z.strictObject` with `source: z.enum([youtube, vimeo])`.** Documented in schema.ts header (lines 17-20). Cost: one extra `z.strictObject(...)` wrapper. Benefit: narrower types at call sites (`if (v.source === 'youtube') { /* v is YouTubeVideo */ }`) and a refactor-free extension point if a per-source field appears (YouTube-only `playlist_id`, Vimeo-only `password_required`, etc.). Both branches are identical today so the type narrowing is currently no-op — this is intentional future-proofing.
- **Kept the seed-proposal order for the `CATEGORIES` array (PBS, Promos, Branded, Doc, Reel, Personal, Educational, Other), NOT the D-04 display order.** D-04 display order (count desc, ties alpha) is computed dynamically by `getCategoriesInDisplayOrder()` in Plan 02-03's loader from the validated dataset. Pre-sorting the static array would (a) create a second source of truth that drifts the moment counts change and (b) couple the type definition to runtime semantics. The header comment on lines 5-12 of categories.ts explicitly disambiguates the two orders for future contributors.
- **Kept the Wave 0 lazy `await import()` pattern instead of converting to static top-level imports.** The plan text in some spots mentions `import { CATEGORIES, categoryToSlug, slugToCategory } from './categories'` as a static top-level import. The actual Wave 0 stub uses lazy `await import('./categories')` inside `it()` bodies. Switching half the test files to static imports while videos.json.test.ts / videos.test.ts still need lazy imports would create a two-pattern codebase. The Wave 0 SUMMARY's downstream contract is explicit: "The lazy `await import('./schema')` and `await import('./categories')` calls remain unchanged — they will resolve correctly once the modules exist. The `// @ts-expect-error` directives become legitimately stale at that point and must be removed." That's exactly what this plan did.
- **Accepted top-level `url` as `z.url().optional()` on every record.** _prep/03-videos-seed.json includes a `url` (human-friendly watch page URL like `https://vimeo.com/264677021`) on every row. Rejecting it would force Plan 02-02 to strip `url` from all 56 rows before authoring videos.json; that's busy-work that loses information. Accepting it lossless keeps Plan 02-02 a near-byte-level copy and gives `/watch/[id]` (Phase 3) a future hook for "open on YouTube/Vimeo" outbound links. The schema's `z.strictObject` still rejects any field NOT in the allowed set, so this isn't a loophole — `url` is explicitly part of the allowed shape.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed 4 stale `@ts-expect-error` directives in videos.json.test.ts referencing `await import('./schema')`**

- **Found during:** Task 2 (Create schema.ts) — surfaced by `pnpm check` immediately after schema.ts was written but before the Task 2 commit.
- **Issue:** Wave 0 had marked `await import('./schema')` lines in videos.json.test.ts with `// @ts-expect-error — module exists after Plan 02-01` because `./schema` did not exist at Wave 0. The moment Task 2 created schema.ts, those imports started resolving, and svelte-check reported 4 × `"Unused '@ts-expect-error' directive."` errors (lines 8, 27, 37, 49). Plan-level success criterion `pnpm check exits 0` was blocked.
- **Why this is Rule 3, not Rule 4:** Directly caused by Task 2's deliverable (creating schema.ts). The fix is mechanical — drop the now-stale directive — and zero-risk: the directive's only effect was to suppress a TS error that no longer exists. The `// @ts-expect-error — file exists after Plan 02-02` directives on `./videos.json` lines remain untouched (videos.json still does not exist; those directives are still doing real work). The `describe.skip` wrapper on the suite also remains — Plan 02-02 owns that rename when it authors videos.json. Scope boundary preserved: only directives covering the schema import (the thing my task made exist) were removed.
- **Fix:** Edited the 4 occurrences of `// @ts-expect-error — module exists after Plan 02-01\n    const { VideoArraySchema } = await import('./schema');` → `const { VideoArraySchema } = await import('./schema');` (one Edit tool call per occurrence). 4 lines removed.
- **Files modified:** src/lib/data/videos.json.test.ts
- **Verification:** `pnpm check` → 405 files / 0 errors / 0 warnings (was: 1 file with 4 errors). `pnpm vitest run src/lib/data/videos.json.test.ts` → 5 tests skipped (intentional — describe.skip wrapper preserved per the plan's critical constraint that videos.json.test.ts blocks remain skipped until Plan 02-02).
- **Committed in:** 6143e18 (Task 2 commit, alongside schema.ts + schema.test.ts)

---

**Total deviations:** 1 auto-fixed (Rule 3 - Blocking)
**Impact on plan:** Zero scope creep. The fix was exactly what the Wave 0 SUMMARY's downstream contract told this plan to do — remove `@ts-expect-error` directives the moment their imports resolve. The only thing the plan text did not pre-flag was that Task 2's schema.ts creation would also retroactively make a sibling test file's directives stale; the fix is one-rule (drop the directive) and the file's intentional `describe.skip` state is preserved for Plan 02-02.

## Issues Encountered

- **Prettier reformatted a trailing comma** in `categories.ts` line 47-49: `Object.fromEntries(\n  CATEGORIES.map((c) => [categoryToSlug(c), c]),\n);` → `Object.fromEntries(\n  CATEGORIES.map((c) => [categoryToSlug(c), c])\n);`. Cosmetic only — Prettier preferred no trailing comma when the call wraps to multiple lines but the inner argument is a single expression. All literal acceptance-criteria substrings preserved (the plan only specified the function signature literals, not the punctuation style of `Object.fromEntries(...)`).

## User Setup Required

None — Plan 02-01 is purely type-and-validation scaffolding. No environment variables, no external service config, no auth steps, no manual data entry. Plan 02-02 will author videos.json (still no external services); Plan 02-03 will wire the Vite validation plugin (still no external services).

## Downstream Plan Contract (How Plans 02-02 / 02-03 Consume This)

- **Plan 02-02 (Author canonical videos.json):**
  - Consumes `VideoArraySchema` from `src/lib/data/schema.ts` to validate the authored JSON before committing.
  - Consumes `CATEGORIES` from `src/lib/data/categories.ts` if it wants to assert a category mention in an authoring tool.
  - Renames `describe.skip(...)` → `describe(...)` in `src/lib/data/videos.json.test.ts` (single wrapper) and removes the 4 remaining `// @ts-expect-error — file exists after Plan 02-02` directives on `await import('./videos.json')` lines. After Plan 02-02, `pnpm vitest run src/lib/data/videos.json.test.ts` should turn 5 tests GREEN (canonical videos.json validates, exactly 56 videos, unique IDs per source, contains the producer reel vimeo:264677021, category counts match D-04 PBS:18/Promos:12/Branded:8/Doc:5/Reel:4/Personal:3/Edu:3/Other:3).
- **Plan 02-03 (Loader + Vite plugin):**
  - Consumes everything from this plan: imports `VideoArraySchema` from `./schema` (in the Vite plugin's `buildStart`), imports `{ Video, VideoArraySchema }` + `{ CATEGORIES, Category, categoryToSlug }` from `./schema` + `./categories` (in the loader `videos.ts`).
  - Creates `src/lib/data/videos.ts` exporting `videos`, `allVideos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`.
  - Creates `src/lib/data/index.ts` re-exporting the public `$lib/data` surface.
  - Adds the `validateVideosPlugin()` to `vite.config.ts` BEFORE `tailwindcss()` (still preserve the locked `tailwindcss() before sveltekit()` order — the new plugin slots in earlier, e.g., `[validateVideosPlugin(), tailwindcss(), sveltekit()]`).
  - Renames the 6 `describe.skip(...)` → `describe(...)` in `src/lib/data/videos.test.ts` and removes the `// @ts-expect-error — module exists after Plan 02-03` directives on `await import('./videos')` lines.

## Next Phase Readiness

- Plan 02-01 complete; **Plans 02-02 and 02-03 unblocked.** Every downstream plan's `<read_first>` reference to `src/lib/data/categories.ts` or `src/lib/data/schema.ts` now resolves to a real file. Every `<automated>` verify command in 02-VALIDATION.md Per-Task Verification Map for rows 02-01 now resolves to a GREEN test.
- `nyquist_compliant: false` and `wave_0_complete: false` still pending in 02-VALIDATION.md frontmatter. With Plan 02-01 complete, `wave_0_complete: true` is safe to flip (all four Wave 0 stub files exist and the two that should be GREEN are GREEN). `nyquist_compliant: true` should flip after 02-03 lands (the corruption smoke test needs videos.json to exist).
- No blockers, no outstanding concerns.

## Self-Check: PASSED

**Files verified to exist:**
- `src/lib/data/categories.ts` — FOUND
- `src/lib/data/schema.ts` — FOUND
- `src/lib/data/categories.test.ts` — FOUND (modified — describe.skip→describe rename complete)
- `src/lib/data/schema.test.ts` — FOUND (modified — describe.skip→describe rename complete)
- `src/lib/data/videos.json.test.ts` — FOUND (modified — 4 stale @ts-expect-error directives removed; describe.skip wrapper intentionally preserved for Plan 02-02)

**Commits verified to exist in `git log`:**
- `886bc98` — FOUND (Task 1: install zod@4.4.3 + categories.ts + categories.test.ts unskip)
- `6143e18` — FOUND (Task 2: schema.ts + schema.test.ts unskip + Rule-3 fix to videos.json.test.ts)

**Plan success criteria re-verified:**
- `package.json` contains literal `"zod": "4.4.3"` (no caret/tilde) — verified by `node -e "console.log(require('./package.json').devDependencies.zod)"` → `4.4.3`
- `pnpm vitest run src/lib/data/categories.test.ts` → 5 tests passed, exit 0
- `pnpm vitest run src/lib/data/schema.test.ts` → 10 tests passed, exit 0
- `pnpm vitest run src/lib/data/` → 2 files passed (15 tests) + 2 files skipped (17 tests), exit 0
- `pnpm check` → 405 files / 0 errors / 0 warnings, exit 0
- `pnpm build` → "✓ built in 4.39s" + "Using @sveltejs/adapter-static / Wrote site to build / ✔ done", exit 0
- `src/lib/data/categories.ts` literal-substring grep: `export const CATEGORIES = [`, all 8 category strings in seed-proposal order, `export type Category = (typeof CATEGORIES)[number];`, `export function categoryToSlug(category: Category): string {`, `export function slugToCategory(slug: string): Category | undefined {` — all FOUND
- `src/lib/data/schema.ts` literal-substring grep: `import { z } from 'zod';`, `import { CATEGORIES } from './categories';`, `export const CategorySchema = z.enum(CATEGORIES);`, `z.iso.date()`, `z.discriminatedUnion('source'`, `z.strictObject({ source: z.literal('youtube')`, `z.strictObject({ source: z.literal('vimeo')`, `featured: z.boolean().default(false)`, `hidden: z.boolean().default(false)`, `tags: z.array(z.string()).default([])`, `export const VideoArraySchema = z.array(VideoSchema);`, `export type Video = z.infer<typeof VideoSchema>;` — all FOUND
- `src/lib/data/schema.ts` does NOT import from `./videos.json` (Pitfall 1) — grep for `videos.json` → 0 matches, confirmed
- describe.skip count: categories.test.ts = 0, schema.test.ts = 0, videos.json.test.ts = 1 (intentional, Plan 02-02), videos.test.ts = 6 (intentional, Plan 02-03)
- @ts-expect-error count: categories.test.ts = 0, schema.test.ts = 0

---

*Phase: 02-data-layer*
*Completed: 2026-05-10*
