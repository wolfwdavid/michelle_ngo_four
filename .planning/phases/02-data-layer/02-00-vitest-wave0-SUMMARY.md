---
phase: 02-data-layer
plan: 00
subsystem: testing
tags: [vitest, vite, typescript, test-stubs, build-validation]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: SvelteKit 2 + TS strict + Tailwind v4 scaffold, vite.config.ts, exact-pinning convention
provides:
  - Vitest 4.1.5 dev-only runner installed pinned exact (no caret/tilde)
  - vite.config.ts test block (node env, globals:false, v8 coverage scoped to src/lib/data/**)
  - Four test stub files (RED-by-design via describe.skip) with the exact it() names referenced in 02-VALIDATION.md
  - scripts/test-build-fails.mjs build-pipeline smoke harness for DATA-03 (existence-only in Wave 0)
  - test/test:watch/test:data scripts in package.json
affects: [02-01-schema-categories, 02-02-videos-json, 02-03-loader-plugin]

# Tech tracking
tech-stack:
  added: [vitest@4.1.5, '@vitest/coverage-v8@4.1.5']
  patterns:
    - 'Lazy import pattern in test stubs: dynamic await import() inside it() bodies suppressed by // @ts-expect-error so files load cleanly before downstream modules exist'
    - 'describe.skip wrapper convention: downstream waves remove `.skip` (one-rule rename) to flip RED→GREEN'
    - 'Vitest test block lives in vite.config.ts (single config file, no separate vitest.config.ts) with /// <reference types="vitest/config" />'

key-files:
  created:
    - src/lib/data/schema.test.ts
    - src/lib/data/categories.test.ts
    - src/lib/data/videos.json.test.ts
    - src/lib/data/videos.test.ts
    - scripts/test-build-fails.mjs
  modified:
    - package.json
    - pnpm-lock.yaml
    - vite.config.ts

key-decisions:
  - 'Skipped pnpm dlx sv add vitest in favor of pnpm add -D -E vitest@4.1.5 @vitest/coverage-v8@4.1.5: avoids jsdom + playwright bloat we do not need (schema/loader tests run in node, not a browser env)'
  - 'environment: node + globals: false in vitest test block: explicit imports keep tests grep-able; node env matches the prerendered build-time data surface'
  - 'Lazy await import() inside each it() body (with // @ts-expect-error) instead of top-level imports: lets Wave 0 vitest run exit 0 cleanly while preserving the exact downstream test names downstream plans will execute via vitest run -t "<name>"'
  - 'tsconfig.json left byte-identical (164 bytes, sha256 0cc31cc55bf4cc4f...): per Phase 1 RESEARCH Pitfall 3, adding include there breaks $types resolution; SvelteKit-generated tsconfig already covers src/**/*.test.ts'

patterns-established:
  - 'RED-by-design test stubs: describe.skip + lazy dynamic imports + // @ts-expect-error means tests collect (and downstream `vitest run -t` resolves) but never execute until the module under test exists'
  - 'Vitest 4.x exit-zero contract for empty/skipped suites: --passWithNoTests flag baked into the test script removes the "no tests collected" failure mode'

requirements-completed: []

# Metrics
duration: 14m
completed: 2026-05-10
---

# Phase 02 Plan 00: Vitest Wave 0 Summary

**Vitest 4.1.5 + @vitest/coverage-v8 4.1.5 installed pinned exact, vite.config.ts extended with a node-env test block, and four RED-by-design test stub files (32 tests across 8 describe.skip blocks) scaffolded with the exact it() names downstream plans 02-01/02-02/02-03 will execute via `pnpm vitest run -t "<name>"`.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-05-10T21:32:42Z
- **Completed:** 2026-05-10T21:46:56Z
- **Tasks:** 3 (+ 1 follow-up Rule-3 fix commit)
- **Files created:** 5
- **Files modified:** 3

## Accomplishments

- Vitest 4.1.5 + @vitest/coverage-v8 4.1.5 installed with `-D -E` (pinned exact, no caret/tilde) — preserves Phase 1 STATE's "every load-bearing dep pinned exact" rule
- `vite.config.ts` extended with a Vitest `test` block (`environment: 'node'`, `globals: false`, v8 coverage scoped to `src/lib/data/**`) while preserving the load-bearing `tailwindcss()` BEFORE `sveltekit()` plugin order (Phase 1 RESEARCH Pattern 1)
- Four test stub files (32 tests / 8 `describe.skip` blocks) match `02-VALIDATION.md` Per-Task Verification Map verbatim — every downstream `pnpm vitest run -t "<name>"` command resolves unchanged
- `scripts/test-build-fails.mjs` ships dependency-free (no `tsx`, no extra dep) — corrupts `videos.json[0].category`, runs `pnpm build`, restores from snapshot on every exit path (incl. SIGINT and uncaught)
- `pnpm vitest run --passWithNoTests`, `pnpm vitest run src/lib/data/`, `pnpm check`, and `pnpm build` all exit 0 — full Wave 0 verification chain green

## Task Commits

Each task was committed atomically (sequential single-repo commits, pre-commit hooks enforced):

1. **Task 1: Install Vitest 4.1.5 pinned exact and add Vitest test block to vite.config.ts** — `e9a2af5` (chore)
2. **Task 2: Scaffold the four test stub files with placeholder describe/it blocks (RED state)** — `b2339e1` (test)
3. **Task 3: Create scripts/test-build-fails.mjs (DATA-03 build-pipeline smoke test)** — `e92ed42` (chore)
4. **Follow-up: Rule-3 deviation fix (svelte-check failures from dynamic imports)** — `948b308` (fix)

## Files Created/Modified

**Created:**
- `src/lib/data/schema.test.ts` — 3 `describe.skip` blocks: schema-accepts / schema-rejects / VideoArraySchema; 12 `it()` cases including `'rejects an unknown category'`, `'accepts all 8 canonical categories'`, `'rejects a missing required field'`, `'rejects a non-ISO date'`
- `src/lib/data/categories.test.ts` — 3 `describe.skip` blocks: CATEGORIES array / `categoryToSlug` / `slugToCategory`; 5 `it()` cases including `'derives kebab-case slugs single-rule (D-03)'`, `'round-trips every category'`
- `src/lib/data/videos.json.test.ts` — 1 `describe.skip` block: canonical file integrity; 5 `it()` cases including `'exactly 56 videos'`, `'unique IDs per source'`, category-counts assertion
- `src/lib/data/videos.test.ts` — 6 `describe.skip` blocks: videos array / producerReelId / getById / getByCategory / display order / getCategoriesWithCounts; 10 `it()` cases including `'producerReelId resolves'`, `'hidden videos filtered'`, full D-04 display-order sequence
- `scripts/test-build-fails.mjs` — 90-line Node ESM smoke harness: snapshot → corrupt → spawnSync `pnpm build` (Windows-compatible `shell: true`) → restore on every exit path

**Modified:**
- `package.json` — added `vitest@4.1.5` + `@vitest/coverage-v8@4.1.5` to devDependencies; added 3 scripts (`test`, `test:watch`, `test:data`); preserved all existing dev/build/check/lint/format/prepare scripts byte-identical
- `pnpm-lock.yaml` — regenerated with new vitest dep tree
- `vite.config.ts` — added `/// <reference types="vitest/config" />` line 1, added `test: { include, environment: 'node', globals: false, coverage: {...} }` block; plugin order `[tailwindcss(), sveltekit()]` preserved

**Untouched (intentional):**
- `tsconfig.json` — byte-identical pre-task and post-task (164 bytes, sha256 `0cc31cc55bf4cc4fe114e2144ee57a420ac535bf11162d880a3f18abb7e1f445`). Phase 1 RESEARCH Pitfall 3 forbids adding `include` here.
- `src/lib/index.ts` — left as Phase 1 stub (`export {};`); the `$lib/data` public surface is Plan 02-03's deliverable.

## Decisions Made

- **Did not use `pnpm dlx sv add vitest`** — that command pulls jsdom + playwright into devDependencies, which we do not need for node-environment schema/loader tests. Manual `pnpm add -D -E vitest@4.1.5 @vitest/coverage-v8@4.1.5` keeps the dep tree minimal and matches Phase 1's exact-pinning convention.
- **Test stub files use `describe.skip` + lazy `await import(...)` inside each `it()` body** — instead of top-level static imports of unwritten modules. This was forced by Vitest's module-load semantics (file-load resolves all top-level imports regardless of `.skip`). The chosen pattern lets `pnpm vitest run` exit 0 in Wave 0 while preserving the literal `it()` names downstream plans reference verbatim.
- **`environment: 'node'`, `globals: false`** in vite.config.ts test block — `'node'` matches the build-time data surface (zero browser APIs in `src/lib/data/`); `globals: false` keeps tests grep-able via explicit `import { describe, expect, it } from 'vitest'` and avoids polluting the type space.
- **Coverage scope limited to `src/lib/data/**/*.ts`** (excluding test files) — coverage signal stays meaningful for the schema/loader code Phase 2 is producing; future phases can broaden as their suites grow.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Top-level static imports of unwritten modules made `pnpm vitest run` fail at file-load**

- **Found during:** Task 2 (Scaffold test stub files)
- **Issue:** Plan-specified test files used top-level `import { ... } from './schema'` etc. with `// @ts-expect-error` directives. Vitest resolves all top-level imports at file-load time before `describe.skip` is even evaluated, so the suite failed with "Cannot find module './schema'" — `pnpm vitest run src/lib/data/` exited non-zero, violating the plan's explicit acceptance criterion.
- **Fix:** Moved every import inside its `it()` body as `await import('./schema')` etc. Each dynamic import is preceded by a `// @ts-expect-error` directive. Because Vitest does NOT execute the body of a skipped `it()`, the dynamic imports never run in Wave 0 → vitest exits 0 with 32 tests skipped.
- **Files modified:** `src/lib/data/schema.test.ts`, `src/lib/data/categories.test.ts`, `src/lib/data/videos.json.test.ts`, `src/lib/data/videos.test.ts`
- **Verification:** `pnpm vitest run src/lib/data/` → 4 files / 32 tests skipped, exits 0
- **Committed in:** `b2339e1` (Task 2 commit)

**2. [Rule 1 - Bug] `_omit` ESLint unused-var error blocked Task 2 commit**

- **Found during:** Task 2 commit attempt (pre-commit hook)
- **Issue:** Plan-specified pattern `const { title: _omit, ...bad } = validRecord` triggered `@typescript-eslint/no-unused-vars` because the project's ESLint config does not whitelist underscore-prefixed unused vars. Rather than expand ESLint config (out-of-scope per SCOPE BOUNDARY), restructured the test pattern.
- **Fix:** Replaced destructure-and-discard with `const bad: Record<string, unknown> = { ...validRecord }; delete bad.title;` — same semantic intent (bad record missing required `title`), no unused variable.
- **Files modified:** `src/lib/data/schema.test.ts`
- **Verification:** `pnpm eslint src/lib/data/schema.test.ts` exits 0
- **Committed in:** `b2339e1` (Task 2 commit, after fix)

**3. [Rule 3 - Blocking] svelte-check 40-error failure from unresolved dynamic imports**

- **Found during:** Plan-level verification (`pnpm check` after all 3 tasks committed)
- **Issue:** Even with `await import(...)` instead of static `import`, svelte-check's static analysis reports "Cannot find module './schema'" on every dynamic-import line plus 3 implicit-`any` errors on callback parameters that lost their type via the unresolved import. 40 errors blocked the plan success criterion `pnpm check exits 0`.
- **Fix:** Added a `// @ts-expect-error — module exists after Plan 02-XX` directive on each line containing an `await import('./schema'|'./categories'|'./videos'|'./videos.json')` call. Annotated 3 callback parameters explicitly (`videos.find`, `order.filter`, `arr.find`) with structural types so they no longer infer `any` from the unresolved-module shape.
- **Files modified:** `src/lib/data/schema.test.ts`, `src/lib/data/categories.test.ts`, `src/lib/data/videos.json.test.ts`, `src/lib/data/videos.test.ts`
- **Verification:** `pnpm check` → 323 files, 0 errors, 0 warnings, exits 0
- **Committed in:** `948b308` (separate fix commit — discovered after Task 3 already committed)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All three were forced by the static-analysis-vs-runtime-resolution mismatch when scaffolding test files for not-yet-existing modules. Net effect on the plan's contract is zero — the same `it()` names are present, the same `describe.skip` counts (3, 3, 1, 6) are present, and downstream plans use the same `vitest run -t "<name>"` commands without modification. No scope creep — every fix was directly required by an explicit plan-level success criterion (`pnpm vitest run` and `pnpm check` both exit 0).

## Issues Encountered

- **Vitest 4.x file-load behavior** — top-level imports of unwritten modules fail file-collection even when the only consumer is `describe.skip`. Documented as Deviation #1 above; the workaround (lazy dynamic imports inside `it()` bodies) is now the established pattern for any future "test scaffolding ahead of implementation" work in this repo.
- **Prettier reformatted multiline parameter annotations** during pre-commit — collapsed `videos.find((v: { source: string; id: string }) => ...)` from a 3-line break-over to a single-line form because line length stayed within the 100-col print width. Cosmetic only; all literal acceptance-criteria substrings preserved.

## User Setup Required

None — Wave 0 is purely a dev-tooling install. No environment variables, no external service config, no auth steps.

## Downstream Plan Contract (How Plans 02-01/02-02/02-03 Consume This)

This plan establishes the **describe.skip → describe rename pattern** downstream plans must follow:

- **Plan 02-01** (schema + categories): create `src/lib/data/schema.ts` and `src/lib/data/categories.ts`, then in `schema.test.ts` and `categories.test.ts` rename every `describe.skip(...)` to `describe(...)` (one-rule edit). The lazy `await import('./schema')` and `await import('./categories')` calls remain unchanged — they will resolve correctly once the modules exist. The `// @ts-expect-error` directives become legitimately stale at that point and must be removed (TypeScript will flag them as "unused expect-error" once the imports resolve, which is the natural signal). `pnpm vitest run src/lib/data/schema.test.ts` should turn 12 tests GREEN; `pnpm vitest run src/lib/data/categories.test.ts` should turn 5 tests GREEN.
- **Plan 02-02** (canonical `videos.json`): author `src/lib/data/videos.json` from `_prep/03-videos-seed.json`, then in `videos.json.test.ts` rename the single `describe.skip(...)` to `describe(...)`. Remove the `// @ts-expect-error` on `await import('./videos.json')` lines. `pnpm vitest run src/lib/data/videos.json.test.ts` should turn 5 tests GREEN.
- **Plan 02-03** (loader + Vite plugin): create `src/lib/data/videos.ts` exporting `videos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`. Rename all 6 `describe.skip(...)` in `videos.test.ts` to `describe(...)`. Remove the `// @ts-expect-error` on `await import('./videos')` lines. Plan 02-03 also wires the Vite validation plugin and adds a `test:smoke` script that invokes `node scripts/test-build-fails.mjs`. The smoke script first runs successfully under Plan 02-03.

## Next Phase Readiness

- Wave 0 complete; **Plans 02-01, 02-02, 02-03 unblocked**. Every `<automated>` verify command in `02-VALIDATION.md` Per-Task Verification Map now resolves to a real test file with a real `it()` whose name matches verbatim.
- `02-VALIDATION.md` frontmatter still has `nyquist_compliant: false` and `wave_0_complete: false`. Planner should flip `wave_0_complete: true` as a follow-up; `nyquist_compliant: true` should flip after 02-01 + 02-02 + 02-03 land.
- No blockers. No outstanding concerns for downstream waves.

## Self-Check: PASSED

**Files verified to exist:**
- `src/lib/data/schema.test.ts` — FOUND
- `src/lib/data/categories.test.ts` — FOUND
- `src/lib/data/videos.json.test.ts` — FOUND
- `src/lib/data/videos.test.ts` — FOUND
- `scripts/test-build-fails.mjs` — FOUND

**Commits verified to exist in `git log --all`:**
- `e9a2af5` — FOUND (Task 1: vitest install + vite.config.ts test block)
- `b2339e1` — FOUND (Task 2: four test stub files)
- `e92ed42` — FOUND (Task 3: scripts/test-build-fails.mjs)
- `948b308` — FOUND (Rule-3 deviation fix)

**Plan success criteria re-verified:**
- `pnpm vitest --version` → `vitest/4.1.5` (exit 0)
- `pnpm vitest run --passWithNoTests` → 4 files / 32 tests skipped, exit 0
- `pnpm vitest run src/lib/data/` → 4 files / 32 tests skipped, exit 0
- `pnpm check` → 323 files / 0 errors / 0 warnings, exit 0
- `pnpm build` → built successfully, exit 0
- `tsconfig.json` byte-identical (164 bytes, sha256 `0cc31cc55bf4cc4fe114e2144ee57a420ac535bf11162d880a3f18abb7e1f445`)
- describe.skip grep counts: schema=3, categories=3, videos.json=1, videos=6
- All literal `it()` names from `02-VALIDATION.md` present in their respective test files

---

*Phase: 02-data-layer*
*Completed: 2026-05-10*
