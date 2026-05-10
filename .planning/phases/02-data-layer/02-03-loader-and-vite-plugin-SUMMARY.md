---
phase: 02-data-layer
plan: 03
subsystem: data
tags: [loader, vite-plugin, schema-validation, build-pipeline, data-layer, phase-2-closer]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: SvelteKit 2 + TS strict (noUncheckedIndexedAccess, noImplicitOverride) + Tailwind v4, lint-staged + husky pre-commit pipeline, exact-pinning convention
  - phase: 02-data-layer
    provides: 02-00 Vitest 4.1.5 + 4 test stub files + scripts/test-build-fails.mjs, 02-01 zod@4.4.3 + src/lib/data/{categories.ts, schema.ts}, 02-02 src/lib/data/videos.json (56 records, schema-validated)
provides:
  - src/lib/data/videos.ts — typed loader: imports videos.json, parses through VideoArraySchema (materializes D-08 defaults), filters hidden (D-14), exports videos + allVideos + producerReelId + 4 helpers
  - src/lib/data/index.ts — public $lib/data surface (re-exports Video, Category, CATEGORIES, slug helpers, loader; intentionally NOT allVideos/Zod schemas)
  - vite.config.ts — inline validateVideosPlugin() between tailwindcss() and sveltekit(); buildStart hook fails build on schema violation with z.prettifyError pointing at bad row, plus cross-row (source, id) uniqueness defense-in-depth
  - package.json — test:build-fails npm script wiring node scripts/test-build-fails.mjs (DATA-03 build-pipeline proof)
  - GREEN tests for DATA-01 (loader exposes typed array, no runtime fetch), DATA-03 (build pipeline fails on schema violation — both schema-level via vitest and build-pipeline-level via test:build-fails), DATA-04 (loader honors closed taxonomy end-to-end via slug helpers)
affects: [03-routes-and-grid, 04-hero-and-featured, 05-pbs-landing, 06-press-about-contact, 07-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Loader pattern: import rawVideos from "./videos.json"; VideoArraySchema.parse() at module load to materialize Zod defaults (D-08); export filtered public array. Routes consume $lib/data only, never $lib/data/videos.json directly (Pitfall 2 avoidance).'
    - 'Vite plugin pattern: inline function returning Plugin in vite.config.ts (no separate plugin file); buildStart hook + this.error() = Rollup-canonical fail-the-build call. Vite-Node natively transpiles the TS import of ./src/lib/data/schema so no tsx/ts-node dep.'
    - 'Pitfall 1 preservation: schema.ts has ZERO JSON imports (verified — only imports zod + ./categories). Loader imports JSON + schema; plugin reads JSON via readFileSync + imports schema. Validation lives in two places (plugin = build-time enforcement, loader = runtime-defaults materialization) without coupling schema.ts to the data file.'
    - 'Error formatting: z.prettifyError (Zod 4) gives "✖ Invalid option: expected one of [...] · at [0].category" pointing at bad-row index — exactly the DATA-03 readable-error criterion. z.formatError is deprecated; we use prettifyError.'
    - 'Cross-row constraint enforced in plugin (not schema): (source, id) uniqueness can''t live in a per-record Zod schema. videos.json.test.ts already asserts it; the plugin re-checks at build time for defense-in-depth.'

key-files:
  created:
    - src/lib/data/videos.ts
    - src/lib/data/index.ts
    - .planning/phases/02-data-layer/02-03-loader-and-vite-plugin-SUMMARY.md
  modified:
    - src/lib/data/videos.test.ts
    - vite.config.ts
    - package.json
    - scripts/test-build-fails.mjs
    - .planning/phases/02-data-layer/deferred-items.md
    - .planning/STATE.md
    - .planning/ROADMAP.md

key-decisions:
  - 'Followed PLAN.md frontmatter literal "test:build-fails" script name instead of the casual "test:smoke" reference in the orchestrator brief and Plan 02-00 SUMMARY downstream-contract prose. PLAN.md is the binding contract (frontmatter must_haves.artifacts and acceptance_criteria both spell out "test:build-fails": "node scripts/test-build-fails.mjs"); the prose references are illustrative shape, not the contract. This keeps the JSON name matching the script filename (test-build-fails.mjs).'
  - 'Did NOT add an explicit src/lib/data/__alias_smoke__.ts file even though the plan offered it as optional. The aliased $lib/data resolution is exercised at runtime by videos.test.ts (imports from ./videos, which is the relative cousin of $lib/data) and at type-check time by pnpm check (svelte-check resolves $lib paths via the generated .svelte-kit/tsconfig). Adding a synthetic smoke file would be zero-information noise.'
  - 'Cleared deferred-items.md scope-boundary entry by autoformatting scripts/test-build-fails.mjs (pnpm prettier --write) and folding the cosmetic trailing-comma changes into the Task 2 commit. The script''s smoke test continues to PASS after the format. With the entry cleared, the deferred-items.md file is empty/removable; deleted in the final docs commit.'
  - 'Widened one type annotation in videos.test.ts: line 72 `const order: string[]` → `const order: readonly string[]` so it accepts `readonly Category[]` returned by getCategoriesInDisplayOrder(). Wave 0 stub used `string[]` as a defensive any-replacement when the module was unresolved; once the loader''s real return type (readonly Category[]) resolves, mutable `string[]` rejects it. Rule 3 fix — directly caused by this plan''s loader-typing landing.'

patterns-established:
  - 'Validate-twice contract: build-time Vite plugin (DATA-03 enforcement, fails build before any bundling) + load-time loader .parse() call (materializes D-08 defaults so runtime types match parsed shape, NOT raw-JSON shape). Schema module stays pure (no JSON import) so both consumers (plugin via readFileSync, loader via Vite JSON import) stay decoupled.'
  - 'Public $lib/data surface re-exports the loader helpers; routes never import the raw JSON or the Zod schemas. Single import path = single point to refactor when internal structure changes. allVideos and VideoSchema/VideoArraySchema intentionally NOT re-exported (D-14 future-only / build-time-only).'
  - 'Rule 1 + deferred-items pattern: pre-existing formatting drift logged by a prior plan in deferred-items.md can be auto-fixed by the next plan that touches the file (one-liner pnpm prettier --write) and folded into that plan''s task commit. The deferred-items.md entry is then cleared in the plan''s final docs commit.'

requirements-completed: [DATA-01, DATA-03, DATA-04]

# Metrics
duration: 7m
completed: 2026-05-10
---

# Phase 02 Plan 03: Loader & Vite Plugin Summary

**Phase 2 closes here. The typed loader at `src/lib/data/videos.ts` parses `videos.json` through `VideoArraySchema` (materializing D-08 defaults), filters hidden (D-14), and exports `videos`, `producerReelId='264677021'` (D-09), `getById`, `getByCategory`, `getCategoriesInDisplayOrder` (D-04 count-desc-ties-alpha), `getCategoriesWithCounts`. `src/lib/data/index.ts` is the public `$lib/data` surface. `vite.config.ts` registers an inline `validateVideosPlugin()` between `tailwindcss()` and `sveltekit()` whose `buildStart` hook calls `VideoArraySchema.safeParse` + `z.prettifyError` + `this.error()` — `pnpm build` exits non-zero on schema violation (DATA-03 enforced at the build pipeline, proven by `pnpm test:build-fails` exiting 0). 32/32 data-layer tests GREEN (10 schema + 5 categories + 5 videos.json + 12 loader), 0 skipped, `pnpm check` 0 errors.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-10T22:12:25Z
- **Completed:** 2026-05-10T22:19:28Z
- **Tasks:** 2
- **Files created:** 2 (+ 1 SUMMARY)
- **Files modified:** 6 (videos.test.ts, vite.config.ts, package.json, test-build-fails.mjs, deferred-items.md, STATE.md, ROADMAP.md)

## Accomplishments

- **`src/lib/data/videos.ts` ships the typed loader** — imports `./videos.json` via Vite's native JSON support, parses through `VideoArraySchema.parse()` to materialize Zod defaults (D-08: `featured: false`, `hidden: false`, `tags: []`), filters hidden videos out of the public array (D-14), and exports the public surface: `videos: readonly Video[]` (length 56 in v1 since D-12 says zero hidden), `allVideos: readonly Video[]` (full set including hidden, kept for future tooling), `producerReelId = '264677021' as const` (D-09, with D-11 confirming the reel stays in the public array under category `'Reel'`), `getById(id: string): Video | undefined` (noUncheckedIndexedAccess-compliant return type — every Phase 3+ caller MUST narrow), `getByCategory(category: Category): readonly Video[]`, `getCategoriesInDisplayOrder(): readonly Category[]` (D-04: memoized count-desc, ties broken via `localeCompare`), `getCategoriesWithCounts()` (8-entry array of `{category, slug, count}` for nav chips).
- **`src/lib/data/index.ts` is the public `$lib/data` surface** — re-exports `Video` and `Category` types, `CATEGORIES`/`categoryToSlug`/`slugToCategory` from `./categories`, and the 6-name loader surface (`videos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`) from `./videos`. Intentionally does NOT re-export `allVideos` (D-14: future internal tooling only) or `VideoSchema`/`VideoArraySchema` (build-time only — routes consume parsed data, not schemas). Verified with `grep -E "allVideos|VideoSchema|VideoArraySchema" src/lib/data/index.ts` → 0 matches.
- **`vite.config.ts` registers `validateVideosPlugin()` between `tailwindcss()` and `sveltekit()`** — locked plugin order preserved (tailwind first, sveltekit last, validate-videos slotted in immediately before sveltekit per the plan's "abort the build BEFORE Svelte starts compiling routes that import the data" rationale). The plugin's `buildStart` hook: (1) `JSON.parse(readFileSync('src/lib/data/videos.json', 'utf-8'))` — Pitfall 1 preserved, the plugin reads JSON directly, NOT through the schema module; (2) `VideoArraySchema.safeParse(raw)` — schema-level validation; (3) `this.error('videos.json failed schema validation:\\n' + z.prettifyError(result.error))` on failure — Rollup-canonical fail-the-build call with `"✖ Invalid option: expected one of [...] · at [N].field"` formatting pointing at the bad row by index; (4) cross-row `(source, id)` uniqueness check — defense-in-depth on top of `videos.json.test.ts`'s vitest assertion of the same invariant.
- **`package.json` exposes `pnpm test:build-fails`** — wires `node scripts/test-build-fails.mjs` as the canonical DATA-03 build-pipeline proof. Inserted immediately after `test:data` in the scripts block; all other scripts byte-identical.
- **`videos.test.ts` is GREEN** — all 6 `describe.skip(...)` blocks unskipped (12 inner `it()` tests now active); all 12 stale `// @ts-expect-error — module exists after Plan 02-03` directives removed; one type annotation widened from `string[]` to `readonly string[]` so it accepts the loader's `readonly Category[]` return type (Rule 3 fix, see Deviations below). All 12 tests GREEN: videos array length=56, hidden filtered, producerReelId=='264677021', producerReelId resolves to a Reel-category video, getById hit/miss, getByCategory PBS=18 and Reel=4, display order PBS-first/ties-alpha/full-sequence, getCategoriesWithCounts returns 8 entries with `{category:'PBS American Portrait', slug:'pbs-american-portrait', count:18}`.
- **`pnpm vitest run src/lib/data/` exits 0** — 4 files passed (32 tests: 5 categories + 10 schema + 5 videos.json + 12 loader), 0 skipped (final-state confirmation of Wave 0's "every describe.skip resolves by end of Phase 2"). `pnpm vitest run` (full suite) exits 0 with the same 32. `pnpm check` exits 0 (408 files, 0 errors, 0 warnings). `pnpm build` exits 0 (built in ~4s, adapter-static wrote to `build/`).
- **`pnpm test:build-fails` exits 0 — DATA-03 enforced at the build pipeline** — the smoke script corrupted `videos.json[0].category` to `'Gibberish — Not A Real Category'`, ran `pnpm build`, which exited with code 1 because the plugin's `this.error()` fired with: `RolldownError: videos.json failed schema validation: ✖ Invalid option: expected one of "PBS American Portrait"|...|"Other" → at [0].category`. The script then restored `videos.json` from its `.smoke-backup` copy and exited 0. Post-smoke verification: `JSON.parse(readFileSync('src/lib/data/videos.json')).length === 56` and `git status` shows zero residue.
- **Phase 2 success criteria all proven:** (1) `videos.json` ships in repo with 56 videos — Plan 02-02 + this plan re-verifies; (2) Schema validates at build time + breaking a record fails the build — `pnpm test:build-fails` GREEN; (3) Categories accepted by the schema are the closed canonical list — `categories.test.ts` + `schema.test.ts -t "accepts all 8 canonical categories"` + `schema.test.ts -t "rejects an unknown category"` all GREEN; (4) Typed loader exposes the validated array to routes with no runtime fetch — `import { videos } from '$lib/data'` type-checks under `pnpm check`, and on `adapter-static` Zod runs once at build time and never ships to client.

## Task Commits

Each task was committed atomically (sequential single-repo commits, pre-commit hooks `lint-staged` enforced — `eslint --fix` + `prettier --write` for `*.{js,ts,svelte}`; `prettier --write` for `*.{css,json,md,yaml,yml}`):

1. **Task 1: Create typed loader + $lib/data public surface + unskip videos.test.ts (12 GREEN)** — `21e67de` (feat)
2. **Task 2: Wire validateVideosPlugin in vite.config.ts + test:build-fails script + Rule-1 prettier fix to test-build-fails.mjs** — `d78f640` (feat)

## Files Created/Modified

**Created:**

- `src/lib/data/videos.ts` — 99-line typed loader. Imports `./videos.json` (Vite native JSON), `VideoArraySchema` + `Video` from `./schema`, `CATEGORIES` + `Category` + `categoryToSlug` from `./categories`. Module body: `const _parsed = VideoArraySchema.parse(rawVideos)` → `export const videos = _parsed.filter(v => !v.hidden)` → `export const allVideos = _parsed` → `export const producerReelId = '264677021' as const` → `export function getById/getByCategory/getCategoriesInDisplayOrder/getCategoriesWithCounts`. Display order is computed in an IIFE at module-load (memoized via `_categoriesInDisplayOrder` const). All exports are `readonly` where appropriate; `getById` returns `Video | undefined` for `noUncheckedIndexedAccess` compliance.
- `src/lib/data/index.ts` — 18-line public `$lib/data` re-export surface. Three `export type` lines (`Video`, `Category`), one `export { CATEGORIES, categoryToSlug, slugToCategory } from './categories'`, one multi-line `export { videos, producerReelId, getById, getByCategory, getCategoriesInDisplayOrder, getCategoriesWithCounts } from './videos'`.
- `.planning/phases/02-data-layer/02-03-loader-and-vite-plugin-SUMMARY.md` — this file.

**Modified:**

- `src/lib/data/videos.test.ts` — 6 `describe.skip(...)` → `describe(...)`; 12 stale `// @ts-expect-error — module exists after Plan 02-03` directives removed; one type annotation widened from `const order: string[]` to `const order: readonly string[]` (Rule 3 fix — accepts the loader's `readonly Category[]` return type now that the import resolves). After the edit: 0 `describe.skip`, 0 `@ts-expect-error`, 12 active tests, all GREEN.
- `vite.config.ts` — replaced wholesale. Adds: 8 new top imports (Plugin type, z, readFileSync, resolve+dirname, fileURLToPath, VideoArraySchema), `__dirname` derivation, inline `validateVideosPlugin()` function (~30 lines with JSDoc), plugin slotted into the plugins array between `tailwindcss()` and `sveltekit()`. Test block unchanged.
- `package.json` — added single line `"test:build-fails": "node scripts/test-build-fails.mjs",` between `test:data` and `lint`. All other scripts byte-identical. devDependencies byte-identical (no new deps in this plan).
- `scripts/test-build-fails.mjs` — `pnpm prettier --write` removed 3 trailing commas from multi-arg `console.{error,log}` calls (Prettier preferred no-trailing-comma when the argument is a single template-string expression). Functionally a no-op; smoke test still passes. Folded into Task 2 commit per orchestrator brief direction.
- `.planning/phases/02-data-layer/deferred-items.md` — the scope-boundary entry (`scripts/test-build-fails.mjs` prettier drift, owner phase 02-00) was cleared by the Rule-1 fix in Task 2. File emptied / removed.

**Untouched (intentional):**

- `src/lib/index.ts` — byte-identical Phase 1 stub (`export {};`). Routes use `$lib/data` (resolves to `src/lib/data/index.ts`), not `$lib` directly. Verified via `git diff src/lib/index.ts` returning empty.
- `tsconfig.json` — byte-identical (164 bytes). Phase 1 RESEARCH Pitfall 3 forbids adding `include`; SvelteKit-generated tsconfig already covers `src/**/*.ts`. Verified via `git diff tsconfig.json` returning empty.
- `svelte.config.js` — byte-identical. `adapter-static` + `prerender = true` config still in place.
- `src/lib/data/schema.ts`, `src/lib/data/categories.ts` — byte-identical (Plan 02-01 deliverables; consumed but not modified by this plan).
- `src/lib/data/videos.json` — byte-identical 56-record canonical file (Plan 02-02 deliverable; consumed and round-trip-verified by the smoke test).
- `src/lib/data/schema.test.ts`, `src/lib/data/categories.test.ts`, `src/lib/data/videos.json.test.ts` — byte-identical (Plans 02-01 / 02-02 deliverables, already GREEN).
- `.prettierignore` — byte-identical (Plan 02-02 added `src/lib/data/videos.json` entry).
- `.planning/PROJECT.md` — byte-identical (no new constraint or scope-change discovered).

## Decisions Made

- **Followed PLAN.md's literal `test:build-fails` script name instead of the orchestrator brief's casual `test:smoke` reference.** PLAN.md frontmatter `must_haves.artifacts` explicitly spells out `"test:build-fails": "node scripts/test-build-fails.mjs"` and the Task 2 `acceptance_criteria` re-states the same literal. The orchestrator brief and Plan 02-00 SUMMARY's downstream-contract prose used `test:smoke` loosely; that's narrative shape, not the binding contract. Using `test:build-fails` keeps the script name matching the underlying file (`test-build-fails.mjs`) — semantically tighter coupling.
- **Did NOT add an explicit `src/lib/data/__alias_smoke__.ts` even though the plan offered it as optional.** The `$lib/data` alias resolves at runtime via vitest (`videos.test.ts` imports from `./videos`, which is re-exported via `index.ts`) and at type-check time via svelte-check (SvelteKit's generated `.svelte-kit/tsconfig.json` defines the `$lib` path map). An additional synthetic smoke file would be zero-information noise. If a future plan ever needs explicit `$lib/data` alias proof under `pnpm check`, it can be added then.
- **Cleared deferred-items.md scope-boundary entry by auto-fixing the prettier drift in `scripts/test-build-fails.mjs`.** Per the orchestrator brief's explicit direction. Ran `pnpm prettier --write scripts/test-build-fails.mjs` → 3 trailing-comma removals. Functionally a no-op (`pnpm test:build-fails` still exits 0 PASS). Folded the formatting change into the Task 2 commit alongside the Vite plugin wiring. The deferred-items.md file is now empty of items; the file itself is deleted in the final docs commit.
- **Widened type annotation in videos.test.ts line 72: `string[]` → `readonly string[]`.** Wave 0 stub had used `string[]` as a defensive any-replacement when `./videos` was unresolved (an unresolved import returned `any`, which assigned cleanly to `string[]`). Once Task 1 created `./videos` with a properly typed `getCategoriesInDisplayOrder(): readonly Category[]` return, mutable `string[]` rejected the readonly array. `readonly string[]` is a strict supertype of `readonly Category[]` (every Category is a string, readonly arrays of subtype are assignable to readonly arrays of supertype), so this is the minimum-impact fix. Documented as Rule 3 deviation below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Widened type annotation in videos.test.ts line 72: `const order: string[]` → `const order: readonly string[]`**

- **Found during:** Task 1 verification — running `pnpm check` after creating `src/lib/data/videos.ts` and unskipping the tests.
- **Issue:** Wave 0 stub used `const order: string[] = getCategoriesInDisplayOrder();` as a defensive type annotation when `./videos` did not exist (the import resolved to `any`, which assigned cleanly to `string[]`). Task 1 created `./videos` with `getCategoriesInDisplayOrder(): readonly Category[]`. svelte-check then reported: `"The type 'readonly (\"PBS American Portrait\" | ...)[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'."` 1 error blocked the plan-level success criterion `pnpm check exits 0`.
- **Why this is Rule 3, not Rule 4:** Directly caused by Task 1's deliverable (the loader's correctly-typed `readonly Category[]` return). The fix is mechanical (add the `readonly` modifier) and zero-risk: the test code doesn't mutate `order`, only `.filter()`s it (which is fine on a readonly array). Scope boundary preserved: only the one line that broke because of Task 1's typing was widened.
- **Fix:** `const order: string[]` → `const order: readonly string[]` (one Edit tool call). `readonly string[]` is a strict supertype of `readonly Category[]`, so the assignment works.
- **Files modified:** `src/lib/data/videos.test.ts`
- **Verification:** `pnpm check` → 408 files / 0 errors / 0 warnings, exits 0. `pnpm vitest run src/lib/data/` → 32/32 GREEN.
- **Committed in:** `21e67de` (Task 1 commit, alongside the unskip rename).

---

**2. [Rule 1 - Bug / pre-existing] Auto-formatted `scripts/test-build-fails.mjs` to clear deferred-items.md prettier drift**

- **Found during:** Task 2 wiring — the orchestrator brief explicitly flagged this as expected: "If you stage that file (e.g., to enable test:smoke), pre-commit hooks will autoformat it via lint-staged. This is expected and OK — fold the autoformat into your commit."
- **Issue:** Phase 02-00 left `scripts/test-build-fails.mjs` with 3 cosmetic trailing commas that Prettier doesn't prefer for multi-arg `console.{error,log}` calls when the wrapped argument is a single template-string expression. Logged in `.planning/phases/02-data-layer/deferred-items.md` by Plan 02-02 (which couldn't fix it because it never staged the file).
- **Why this is Rule 1 (bug-fix), not scope creep:** Plan 02-03 is the plan that "owns" the smoke test (it wires the npm script). The orchestrator brief explicitly directs me to clear the deferred entry. The fix is one shell call (`pnpm prettier --write`) and functionally a no-op.
- **Fix:** `pnpm prettier --write scripts/test-build-fails.mjs` → 3 trailing commas removed from `console.error/log` calls. Pre-commit hook (lint-staged) confirmed clean. Smoke test still PASSes after the format (`pnpm test:build-fails` exits 0).
- **Files modified:** `scripts/test-build-fails.mjs`, `.planning/phases/02-data-layer/deferred-items.md` (cleared in final docs commit).
- **Verification:** `pnpm prettier --check scripts/test-build-fails.mjs` exits 0; `pnpm test:build-fails` exits 0 (smoke harness still works).
- **Committed in:** `d78f640` (Task 2 commit, folded alongside the Vite plugin + script wiring).

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 pre-existing format-only)
**Impact on plan:** Zero scope creep. Deviation #1 was directly caused by Task 1's loader landing (a downstream type-tightening), and Deviation #2 was explicitly directed by the orchestrator brief. Both fixes were single-line / single-command and folded into their respective task commits.

## Authentication Gates

None. This plan is purely build-time data-layer wiring. No external services, no API keys, no auth flows.

## User Setup Required

None. Plan 02-03 is fully autonomous. The `$lib/data` surface is now consumable by every Phase 3+ route via standard SvelteKit imports.

## Issues Encountered

- **One blocking type error after Task 1 landed** (deviation #1 above) — resolved by widening one annotation. Took ~1 minute from svelte-check report to fix-and-reverify.
- **None during Task 2** — the Vite plugin wiring was uneventful. `pnpm build` passed on first try; `pnpm test:build-fails` passed on first try.

## Cross-Cutting Decisions Implemented + Test Names

- **D-04 (display order: count desc, ties alpha)** — `getCategoriesInDisplayOrder()` returns the exact 8-element sequence: `['PBS American Portrait', 'Promos & Trailers', 'Branded Content', 'Documentary / Short Film', 'Reel', 'Educational / Nonprofit', 'Other', 'Personal / Tribute']`. Verified by `videos.test.ts -t "display order: full sequence per D-04"` GREEN.
- **D-09 (producerReelId = '264677021')** — exported as `as const` literal. Verified by `videos.test.ts -t "producerReelId is the literal \"264677021\""` GREEN.
- **D-11 (reel stays in public array)** — `videos.find(v => v.source === 'vimeo' && v.id === producerReelId)` resolves to a video with `category === 'Reel'`. Verified by `videos.test.ts -t "producerReelId resolves to a real video in the public array (D-11)"` GREEN.
- **D-14 (hidden videos filtered)** — `videos = _parsed.filter(v => !v.hidden)`. Verified by `videos.test.ts -t "hidden videos filtered (D-14)"` GREEN.
- **D-15 (schema violations fail the build)** — Vite plugin's `buildStart` + `this.error()`. Verified by `pnpm test:build-fails` exiting 0 (which proves `pnpm build` exits non-zero on corrupted data and the file is restored).

## Pitfall Preservation

- **Pitfall 1 (schema.ts must stay pure / no JSON import)** — Preserved. `src/lib/data/schema.ts` has zero JSON imports (verified by `grep videos.json src/lib/data/schema.ts` → 0 matches). The Vite plugin reads JSON via `readFileSync` directly, NOT through the schema module. The loader (`videos.ts`) imports both JSON and schema, but that's the loader's job, not the schema's.
- **Pitfall 2 (Zod defaults only apply on parse, not on raw JSON import)** — Preserved. The loader calls `VideoArraySchema.parse(rawVideos)` so `featured`/`hidden`/`tags` are guaranteed-present in the runtime types. Consumers reading `video.featured` get `false` (the default), not `undefined`. Verified by `videos.test.ts -t "hidden videos filtered (D-14)"` which asserts `v.hidden === false` on every public video (defaults materialized).
- **Pitfall 3 (noUncheckedIndexedAccess + .find()) — note for Phase 3+ callers** — `getById(id: string): Video | undefined` is the explicit return type. Every Phase 3+ caller (route load functions, `/watch/[id]` page, category rails) MUST narrow with `if (!video) return error(404)` before accessing fields. The loader's JSDoc states this explicitly; the test `'returns undefined for an unknown id (noUncheckedIndexedAccess narrowing)'` enforces the contract.
- **Pitfall 4 (videos.json prettier churn)** — Already mitigated by Plan 02-02's `.prettierignore` entry; this plan didn't touch the JSON, so nothing to verify.
- **Pitfall 6 (dev server doesn't re-validate on JSON edit)** — Mitigated by the loader's `VideoArraySchema.parse()` at module load. The Vite plugin's `buildStart` only fires once at server start, but the loader re-runs on every module re-evaluation (which Vite triggers when the JSON changes via HMR). Dev-time feedback is acceptable; CI/production are fully covered by the build-pipeline plugin.

## Downstream Plan Contract (How Phase 3+ Consumes This)

- **Phase 3 routes (`/work`, `/work/[category]`, `/watch/[id]`):** Import `videos`, `getById`, `getByCategory`, `getCategoriesWithCounts` from `$lib/data`. For `entries` exports (prerender enumeration under `adapter-static` strict mode), iterate `videos` to enumerate IDs and `getCategoriesWithCounts()` to enumerate slugs. Every `getById(params.id)` call MUST narrow with `if (!video) error(404, 'not found')` before accessing fields — Phase 1 D-14 / `noUncheckedIndexedAccess` enforced.
- **Phase 4 reel-led home:** Import `producerReelId` from `$lib/data`. PLAY REEL CTA navigates to `/watch/{producerReelId}`. The reel video also appears in the regular `Reel` category filter on `/work` (D-11 verified).
- **Phase 5 PBS landing:** Import `getByCategory` and call `getByCategory('PBS American Portrait')` → 18 videos. Standard card grid renders.
- **Schemas / `allVideos` access:** NOT exposed via `$lib/data` in v1. If a future phase needs them, it adds the re-export to `src/lib/data/index.ts` then.

## Next Phase Readiness

- **Plan 02-03 complete; Phase 2 complete.** All 4 plans of Phase 2 are now GREEN (`02-00` Wave 0 infra + `02-01` schema + `02-02` JSON + `02-03` loader + plugin). All 4 requirements DATA-01 / DATA-02 / DATA-03 / DATA-04 are covered by automated tests (32/32 GREEN) AND, for DATA-03, by the build-pipeline smoke test.
- **Phase 2 success criteria all proven:** (1) `videos.json` with 56 videos ✓; (2) schema validates at build time + breaks fail the build ✓; (3) closed canonical category list ✓; (4) typed loader exposes the validated array with no runtime fetch ✓.
- **`02-VALIDATION.md` frontmatter flags should now flip to `nyquist_compliant: true` and `wave_0_complete: true`** — every `❌ W0` row in the verification map is now GREEN. (Flip is the planner / `/gsd:verify-work` agent's responsibility, not the executor's.)
- **Phase 3 unblocked.** The `$lib/data` contract every Phase 3+ plan relies on is now real:
  - `import { videos, producerReelId, getById, getByCategory, getCategoriesInDisplayOrder, getCategoriesWithCounts, type Video, type Category, CATEGORIES, categoryToSlug, slugToCategory } from '$lib/data'`
- No blockers, no outstanding concerns.

## Self-Check: PASSED

**Files verified to exist:**

- `src/lib/data/videos.ts` — FOUND (99 lines, contains all 11 required literal substrings per Task 1 acceptance criteria)
- `src/lib/data/index.ts` — FOUND (18 lines, contains 6 required literal substrings; 0 matches for `allVideos|VideoSchema|VideoArraySchema`)
- `src/lib/data/videos.test.ts` — FOUND (modified — 0 `describe.skip`, 0 `@ts-expect-error`)
- `vite.config.ts` — FOUND (modified — contains all 7 required literal substrings; plugin order tailwindcss → validateVideosPlugin → sveltekit verified)
- `package.json` — FOUND (modified — contains literal line `"test:build-fails": "node scripts/test-build-fails.mjs",`)
- `scripts/test-build-fails.mjs` — FOUND (modified — prettier-clean now, smoke test still passes)
- `.planning/phases/02-data-layer/02-03-loader-and-vite-plugin-SUMMARY.md` — FOUND (this file)

**Commits verified to exist in `git log`:**

- `21e67de` — FOUND (Task 1: feat(02-03): create typed loader + $lib/data public surface)
- `d78f640` — FOUND (Task 2: feat(02-03): wire validate-videos Vite plugin + test:build-fails)

**Plan success criteria re-verified:**

- `src/lib/data/videos.ts` exists with all 5 helpers + 2 constants exported ✓
- `src/lib/data/index.ts` exists with the public `$lib/data` surface ✓
- `src/lib/data/videos.test.ts` has all 6 describe blocks unskipped, 12/12 passing ✓
- `vite.config.ts` registers `validateVideosPlugin()` between `tailwindcss()` and `sveltekit()` ✓ (verified by inspecting the plugins array)
- `package.json` exposes `pnpm test:build-fails` ✓ (literal line present)
- `pnpm build` exits 0 on the canonical data ✓ (built in 4.28s)
- `pnpm test:build-fails` exits 0 ✓ (DATA-03 enforced — build correctly rejected corrupted JSON, file restored)
- `pnpm vitest run` exits 0 with 32 passing tests ✓ (10 schema + 5 categories + 5 videos.json + 12 loader)
- `pnpm check` exits 0 ✓ (408 files, 0 errors, 0 warnings)
- `src/lib/index.ts` unchanged from Phase 1 stub ✓ (`git diff src/lib/index.ts` empty)
- After all checks: `videos.json` is on disk in its original 56-record state ✓ (no smoke-test residue; `git status` clean for that path)
- `tsconfig.json` byte-identical ✓ (`git diff tsconfig.json` empty)

---

*Phase: 02-data-layer*
*Plan 03 of 4 — Phase 2 closes here*
*Completed: 2026-05-10*
