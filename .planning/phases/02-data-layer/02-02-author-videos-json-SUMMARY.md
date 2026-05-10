---
phase: 02-data-layer
plan: 02
subsystem: data
tags: [videos.json, seed, canonical-data, prettierignore, vitest, data-layer]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: SvelteKit 2 + TS strict + Tailwind v4 scaffold, lint-staged + husky pre-commit pipeline (`*.{css,json,md,yaml,yml}` → `prettier --write`)
  - phase: 02-data-layer
    provides: 02-00 Vitest 4.1.5 + videos.json.test.ts stub (1 describe.skip block / 5 it()), 02-01 schema.ts (VideoArraySchema, z.strictObject, z.discriminatedUnion) + categories.ts (CATEGORIES const array)
provides:
  - src/lib/data/videos.json — canonical 56-video data file, byte-identical to _prep/03-videos-seed.json's `.videos` array serialized at indent=2 + trailing newline
  - .prettierignore — `src/lib/data/videos.json` excluded from `prettier --write` (Pitfall 4 mitigation)
  - GREEN tests for DATA-01 (56 videos in repo JSON) and DATA-02 (every record validates against VideoArraySchema)
affects: [02-03-loader-and-vite-plugin, 03-routes-and-grid, 04-hero-and-featured, 05-pbs-landing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'One-shot inline seed extraction: `node -e "..."` literal command on the commit line — no committed scripts, no tsx dep, leaves zero dead code behind. The seed-to-videos.ts in 02-RESEARCH was illustrative; the one-liner is simpler and matches CONTEXT.md "build-time data only, no runtime CMS fetch."'
    - 'JSON authored at indent=2 + trailing newline via `JSON.stringify(out, null, 2) + "\n"` — matches Prettier defaults so if anyone ever removes the .prettierignore entry, the file does not churn.'
    - 'Pitfall 4 mitigation: `.prettierignore` line for `src/lib/data/videos.json` prevents lint-staged from reformatting the JSON on every commit. Pre-commit hook execution confirmed it works — only 2 of 3 staged files ran through `prettier --write` on Task 1 commit (videos.json was skipped).'
    - 'Wave 0 lazy-import pattern preserved: `(await import("./videos.json")).default` inside each `it()` body, NOT static top-level `import videosJson from "./videos.json"`. Per Plan 02-01 SUMMARY decision — converting to static imports would create a two-pattern codebase while videos.test.ts still uses lazy imports.'

key-files:
  created:
    - src/lib/data/videos.json
    - .planning/phases/02-data-layer/deferred-items.md
  modified:
    - .prettierignore
    - src/lib/data/videos.json.test.ts

key-decisions:
  - 'Used the inline `node -e "..."` one-liner from the plan instead of saving + running a `scripts/seed-to-videos.mjs` file. Reason: the file would be committed-and-deleted in the same plan or left as dead code; the one-liner runs once at execution time and leaves no artifact. The PowerShell shell tolerated the inner single quotes inside `node -e "..."` without escaping. Result: zero new files in scripts/, zero new dev deps, byte-identical output to what the script would have produced.'
  - 'Preserved the Wave 0 lazy `await import("./videos.json")` pattern instead of switching to static `import videosJson from "./videos.json"` per the plan text''s "should now start" example. Reason: matches Plan 02-01 SUMMARY''s explicit decision — the lazy-import pattern is the established Wave 0 contract; switching half the test files to static imports while videos.test.ts still needs lazy imports for `./videos` (Plan 02-03''s territory) would create a two-pattern codebase. The plan text''s static-import shape was illustrative; the executor-step instructions only required (a) remove `@ts-expect-error` directives and (b) `describe.skip` → `describe`. Both done.'
  - 'Logged a scope-boundary item to `.planning/phases/02-data-layer/deferred-items.md`: `pnpm prettier --check .` reports a pre-existing style issue in `scripts/test-build-fails.mjs` (Phase 02-00 territory). NOT fixed in this plan — out of scope per the SCOPE BOUNDARY rule. Does not block this plan because lint-staged only runs on staged files; my pre-commit hooks did not touch the script.'

patterns-established:
  - 'Author canonical JSON from a sibling _prep/ seed via inline `node -e "const fs=require(\"node:fs\");const seed=JSON.parse(fs.readFileSync(...));fs.writeFileSync(target, JSON.stringify(seed.<subset>, null, 2) + \"\n\")"`. Reproducible, deterministic, zero new tooling.'
  - 'Adding generated/checked-in data files to `.prettierignore` is the documented mitigation for lint-staged reformat churn when the data file does not match Prettier''s exact JSON output style. Validated end-to-end: pre-commit hook ran on Task 1 commit and reported `*.{css,json,md,yaml,yml} — 2 files` (NOT 3) — videos.json was excluded from prettier --write as expected.'

requirements-completed: [DATA-01, DATA-02]

# Metrics
duration: 5m
completed: 2026-05-10
---

# Phase 02 Plan 02: Author videos.json Summary

**Canonical `src/lib/data/videos.json` authored byte-identically from `_prep/03-videos-seed.json`''s `.videos` array (56 records, JSON.stringify indent=2 + trailing newline), added to `.prettierignore` to block lint-staged reformat churn (Pitfall 4), and `videos.json.test.ts` flipped from `describe.skip` to `describe` — 5 canonical-file integrity tests GREEN: validates against `VideoArraySchema`, exactly 56 videos, unique (source, id) pairs, Producer Reel (vimeo:264677021, category Reel) present, D-04 category counts hold exactly.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-10T22:03:49Z
- **Completed:** 2026-05-10T22:08:48Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 2

## Accomplishments

- **`src/lib/data/videos.json` ships the 56-record canonical data file** — extracted from `_prep/03-videos-seed.json`''s `.videos` array via a single inline `node -e "..."` command (no committed scripts, no tsx dep). Output is byte-identical to `JSON.stringify(seed.videos, null, 2) + "\n"` — 33,660 bytes, starts with `[\n`, ends with `]\n`. All 56 records parse against `VideoArraySchema` (Plan 02-01) with `safeParse().success === true`.
- **D-04 category counts hold exactly** as the planner verified pre-flight: PBS American Portrait 18, Promos & Trailers 12, Branded Content 8, Documentary / Short Film 5, Reel 4, Personal / Tribute 3, Educational / Nonprofit 3, Other 3 — total = 56. No record was edited; the seed was already canonical.
- **Producer Reel (D-09) is present**: `source: 'vimeo', id: '264677021', category: 'Reel'` — Plan 02-03''s `producerReelId` constant has its referent.
- **Zero D-08 fields inlined in any record** (`featured`, `hidden`, `tags`, `credits` all absent from every record). The Zod schema''s `.default(false)` / `.default([])` apply at `.parse()` time per Pitfall 2 — defaults materialize in the loader (Plan 02-03), NOT in the JSON. This keeps the JSON minimal and avoids 56 × 4 = 224 lines of redundant default fields.
- **`.prettierignore` excludes `src/lib/data/videos.json`** — Pitfall 4 mitigation. Confirmed end-to-end: the Task 1 commit''s pre-commit hook reported `*.{css,json,md,yaml,yml} — 2 files` (NOT 3), proving lint-staged''s `prettier --write` skipped videos.json as configured.
- **`videos.json.test.ts` is GREEN** — 1 `describe.skip` → `describe` (one-rule rename), 4 stale `// @ts-expect-error — file exists after Plan 02-02` directives removed. All 5 tests pass: `'canonical videos.json validates'`, `'exactly 56 videos'`, `'unique IDs per source'`, `'contains the producer reel (vimeo:264677021)'`, `'category counts match D-04 (PBS:18, Promos:12, Branded:8, Doc:5, Reel:4, Personal:3, Edu:3, Other:3)'`.
- **`pnpm vitest run src/lib/data/` exits 0** — 3 files passed (20 tests: 5 categories + 10 schema + 5 videos.json), 1 file skipped (videos.test.ts with 12 tests — Plan 02-03''s territory, intentional). `pnpm check` exits 0 (406 files / 0 errors / 0 warnings). `pnpm build` exits 0 (built in 4.28s, adapter-static wrote to build/).

## Task Commits

Each task was committed atomically (sequential single-repo commits, pre-commit hooks `lint-staged` enforced — `prettier --write` for *.{css,json,md,yaml,yml}, `eslint --fix` + `prettier --write` for *.{js,ts,svelte}):

1. **Task 1: Author src/lib/data/videos.json from seed + add to .prettierignore** — `965fe51` (feat)
2. **Task 2: Unskip src/lib/data/videos.json.test.ts — 5 tests GREEN** — `6b82dfa` (test)

## Files Created/Modified

**Created:**
- `src/lib/data/videos.json` — 702-line / 33,660-byte JSON array of 56 video records. Byte-identical to `JSON.stringify(seed.videos, null, 2) + "\n"` (verified). Starts with `[\n`, ends with `]\n`, 2-space indented. Each record has the shape: `source` (`'youtube'` | `'vimeo'`), `id`, `title`, `uploader`, `published` (ISO YYYY-MM-DD), `thumbnail` (URL), `url` (optional URL), `embed` (URL), `category` (one of 8), `duration_seconds` (optional positive int), `description` (optional string). No record contains `featured`, `hidden`, `tags`, or `credits` (D-08 defaults materialize at parse time).
- `.planning/phases/02-data-layer/deferred-items.md` — 20-line scope-boundary log noting `scripts/test-build-fails.mjs` has pre-existing prettier drift (Phase 02-00 territory, NOT this plan''s scope, NOT blocking).

**Modified:**
- `.prettierignore` — added two lines: a section comment (`# Phase 2: data file owns its own format (avoid pre-commit reformat churn on small edits)`) and the path `src/lib/data/videos.json`. All pre-existing entries (.svelte-kit, build, node_modules, pnpm-lock.yaml, package-lock.json, yarn.lock, .planning, _prep) preserved.
- `src/lib/data/videos.json.test.ts` — 1 `describe.skip(...)` → `describe(...)` and 4 `// @ts-expect-error — file exists after Plan 02-02` lines removed. Lazy `await import("./videos.json")` and `await import("./schema")` pattern preserved per Plan 02-01 SUMMARY''s explicit decision. After the edit, the file contains 0 occurrences of `describe.skip` and 0 occurrences of `@ts-expect-error`.

**Untouched (intentional):**
- `src/lib/data/schema.ts` — byte-identical (Plan 02-01''s deliverable; this plan only validates against it).
- `src/lib/data/categories.ts` — byte-identical (Plan 02-01''s deliverable).
- `src/lib/data/videos.test.ts` — byte-identical from Wave 0. Six `describe.skip(...)` blocks (12 inner `it()` tests) remain — Plan 02-03''s territory.
- `tsconfig.json` — byte-identical (Phase 1 RESEARCH Pitfall 3: do not add `include` here). Vite''s default `resolveJsonModule: true` is inherited from SvelteKit''s generated `.svelte-kit/tsconfig.json`, so the JSON import in the test file resolves natively (no `pnpm check` errors).
- `vite.config.ts` — byte-identical. The validation Vite plugin lands in Plan 02-03; this plan is JSON-authoring only.
- `src/lib/index.ts` — byte-identical Phase 1 stub. The `$lib/data` public surface (index.ts re-exports) is Plan 02-03''s deliverable.

## Decisions Made

- **Used the inline `node -e "..."` one-liner instead of a committed `scripts/seed-to-videos.ts`.** Reason: the script would either be committed-and-deleted in the same plan (churn for zero benefit) or left as dead code (pollution). The one-liner runs once at execution time, produces deterministic byte-identical output, and leaves no artifact. PowerShell tolerated the inner single quotes inside `node -e "..."` without escaping issues. Net: zero new files in `scripts/`, zero new dev deps.
- **Preserved the Wave 0 lazy `await import("./videos.json")` pattern instead of switching to static `import videosJson from "./videos.json"`.** The plan text''s Step 1 had a "should now start" example with a static top-level `import videosJson from "./videos.json";`. The actual test file uses lazy `(await import("./videos.json")).default` inside each `it()` body. Per Plan 02-01 SUMMARY''s explicit decision: "Kept Wave 0 lazy `await import()` pattern in unskipped test files instead of converting to static top-level imports... switching half the files to static imports while videos.json.test.ts + videos.test.ts still need lazy imports would create a two-pattern codebase." The plan text''s static-import example was illustrative; the executor-step instructions only mandated (a) remove `@ts-expect-error` directives + (b) `describe.skip` → `describe`. Both completed; pattern consistency preserved.
- **Did NOT add D-08 default fields to any record in the JSON.** Per the plan''s explicit "Do NOT add" instruction and per Pitfall 2 (`z.object().default()` only applies on `.parse()`, not on raw JSON imports). The loader (Plan 02-03) calls `VideoArraySchema.parse(rawVideos)` which materializes defaults at runtime. Inlining `featured: false, hidden: false, tags: []` on all 56 records would have added ~224 lines of zero-information noise and created drift if defaults ever change.
- **Logged a scope-boundary item rather than fixing pre-existing prettier drift in `scripts/test-build-fails.mjs`.** `pnpm prettier --check .` exit code is 1 because of style issues in that file. The file is Phase 02-00''s deliverable, not mine; per the SCOPE BOUNDARY rule, I do NOT auto-fix it. It does NOT block this plan because lint-staged only runs on staged files, and I never staged it. Logged in `deferred-items.md` for the next plan that touches the script (likely Plan 02-03 for the build-pipeline smoke test).

## Deviations from Plan

None. The plan executed exactly as written. The one note worth highlighting:

- The plan''s "should now start" example for the test file post-edit showed a static `import videosJson from "./videos.json";`. My actual file kept the Wave 0 lazy `await import()` pattern. This is NOT a deviation — the plan''s executor-step instructions for Step 1 only required (a) remove `@ts-expect-error` and (b) `describe.skip` → `describe`; the "should now start" block was illustrative shape and the lazy-import pattern was the established contract per Plan 02-01 SUMMARY''s explicit decision. Both literal acceptance criteria for Task 2 (no `describe.skip`, no `@ts-expect-error`) pass. All 5 tests GREEN. The substantive behavior the plan demanded is met; the cosmetic shape diverges from the "should now start" example by preserving Wave 0''s lazy-import contract.

**Total deviations:** 0
**Impact on plan:** None.

## Authentication Gates

None. This plan is purely build-time data authoring + a test unskip. No external services, no API keys, no auth flows.

## User Setup Required

None. Plan 02-02 is fully autonomous. `src/lib/data/videos.json` is now committed and consumed by Plan 02-03''s loader and Vite plugin via local file import.

## Issues Encountered

- **Pre-existing prettier drift in `scripts/test-build-fails.mjs`** (Phase 02-00 territory) caused `pnpm prettier --check .` to exit 1. NOT a Plan 02-02 issue — it''s the script Plan 02-00 committed. Per SCOPE BOUNDARY rule, not auto-fixed. Does not block this plan because `lint-staged` only runs prettier on staged files, and I never staged `scripts/test-build-fails.mjs`. Logged in `.planning/phases/02-data-layer/deferred-items.md` for the next plan that needs that script (Plan 02-03 owns the build-pipeline smoke test that invokes it).

## Downstream Plan Contract (How Plan 02-03 Consumes This)

- **Plan 02-03 (loader + Vite plugin):**
  - Consumes `src/lib/data/videos.json` via `import rawVideos from "./videos.json";` in the new `src/lib/data/videos.ts` loader module. Vite''s first-class JSON import resolves natively.
  - Consumes `VideoArraySchema` from `./schema` in the loader''s `VideoArraySchema.parse(rawVideos)` call (materializes D-08 defaults at runtime).
  - Consumes `VideoArraySchema` from `./schema` in the new `validateVideosPlugin()` Vite plugin''s `buildStart` hook (the canonical DATA-03 build-fails-on-violation enforcement point).
  - Renames the 6 `describe.skip(...)` blocks in `src/lib/data/videos.test.ts` to `describe(...)` and removes the `// @ts-expect-error — module exists after Plan 02-03` directives on `await import("./videos")` lines. After Plan 02-03, the full data-layer suite should have 0 skipped tests.
  - May want to fix the pre-existing prettier drift in `scripts/test-build-fails.mjs` (logged in `deferred-items.md`) as a Rule-1 fix when wiring the `test:smoke` script.

## Next Phase Readiness

- Plan 02-02 complete; **Plan 02-03 unblocked.** The canonical `src/lib/data/videos.json` exists and validates against `VideoArraySchema`, so Plan 02-03''s Vite plugin''s `buildStart` hook will succeed on a clean build (and the corruption smoke test in `scripts/test-build-fails.mjs` will exit non-zero on a deliberately broken record, validating DATA-03 at the build-pipeline level).
- `02-VALIDATION.md` frontmatter: `nyquist_compliant: false` and `wave_0_complete: false` still pending. With Plan 02-02 complete, `wave_0_complete: true` is safe to flip (all 4 Wave 0 stub files now have their `describe.skip` blocks owned: categories.test.ts + schema.test.ts GREEN by Plan 02-01, videos.json.test.ts GREEN by this plan, videos.test.ts still skipped pending Plan 02-03). `nyquist_compliant: true` should flip after Plan 02-03 lands the corruption smoke test.
- No blockers, no outstanding concerns.

## Self-Check: PASSED

**Files verified to exist:**
- `src/lib/data/videos.json` — FOUND (56-record array, 33,660 bytes, starts with `[\n`, ends with `]\n`)
- `.prettierignore` — FOUND (modified — contains literal line `src/lib/data/videos.json`)
- `src/lib/data/videos.json.test.ts` — FOUND (modified — 0 `describe.skip`, 0 `@ts-expect-error`)
- `.planning/phases/02-data-layer/deferred-items.md` — FOUND (new — scope-boundary log)

**Commits verified to exist in `git log`:**
- `965fe51` — FOUND (Task 1: feat(02-02): author canonical src/lib/data/videos.json from seed)
- `6b82dfa` — FOUND (Task 2: test(02-02): unskip videos.json.test.ts — 5 tests GREEN)

**Plan success criteria re-verified:**
- `src/lib/data/videos.json` exists ✓ — `node -e "console.log(JSON.parse(...).length)"` prints `56`
- Byte-identical to seed extraction ✓ — `JSON.stringify(seed.videos, null, 2) + "\n" === fs.readFileSync(target, "utf-8")` is `true`
- VideoArraySchema validates ✓ — `pnpm vitest run -t "canonical videos.json validates"` GREEN
- Producer Reel present ✓ — vimeo:264677021 with category 'Reel' found in array
- D-04 counts ✓ — { PBS: 18, Promos: 12, Branded: 8, Doc: 5, Reel: 4, Personal: 3, Edu: 3, Other: 3 }, total 56
- No D-08 fields inlined ✓ — `for (const r of d) for (const k of [featured,hidden,tags,credits]) if (k in r) FAIL` exited OK
- `.prettierignore` contains the line ✓ — `grep -F "src/lib/data/videos.json" .prettierignore` matches
- `pnpm prettier --check src/lib/data/videos.json` exits 0 ✓ — ignore rule honored
- videos.json.test.ts no longer contains `describe.skip` ✓ — count = 0
- videos.json.test.ts no longer contains `@ts-expect-error` ✓ — count = 0
- `pnpm vitest run src/lib/data/videos.json.test.ts` exits 0 with 5 passing ✓
- `pnpm vitest run src/lib/data/` exits 0 with 20 passing + 12 skipped (videos.test.ts still skipped) ✓
- `pnpm check` exits 0 — 406 files / 0 errors / 0 warnings ✓
- `pnpm build` exits 0 — built in 4.28s, adapter-static wrote to build/ ✓

---

*Phase: 02-data-layer*
*Completed: 2026-05-10*
