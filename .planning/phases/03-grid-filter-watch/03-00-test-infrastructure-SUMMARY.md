---
phase: 03-grid-filter-watch
plan: 00
subsystem: test-infrastructure
tags: [vitest, jsdom, test-stubs, prerender-coverage, wave-0]
one_liner: "Two-project Vitest workspace (node for data, jsdom for ui), 6 RED-by-design describe.skip stubs, and a build-artifact coverage check — Wave 0 scaffolding for Phase 3 grid/filter/watch."
dependency_graph:
  requires:
    - "$lib/data (Phase 2): getById, getByCategory, videos, producerReelId, getCategoriesInDisplayOrder, CATEGORIES, categoryToSlug, slugToCategory"
    - "vite.config.ts (Phase 2): the existing `test:` block extended by both workspace projects (node env preserved)"
    - "@sveltejs/adapter-static + paths.base (Phase 1)"
  provides:
    - "vitest.workspace.ts: two-project split (data=node, ui=jsdom) — every downstream Phase 3 component/route test runs against this"
    - "jsdom@29.1.1 in devDependencies (pinned exact) — required by every test that calls mount(VideoCard, …)"
    - "6 test stub files (describe.skip) — Plans 03-01..03-04 unskip each suite they fulfill"
    - "scripts/test-prerender-coverage.mjs + pnpm test:prerender — build-artifact coverage check that complements adapter-static strict"
    - "lazy `await import()` + `// @ts-expect-error` pattern documented for downstream plans"
  affects:
    - "package.json scripts: added test:prerender (after test:build-fails)"
    - "03-VALIDATION.md Per-Task Verification Map: 6 row-paths updated from `+page.test.ts` → `page.test.ts` (SvelteKit reserves `+*.ts`)"
tech-stack:
  added:
    - jsdom@29.1.1 (devDependency, pinned exact)
  patterns:
    - "Vitest workspace split: vitest.workspace.ts at repo root with two projects, each extending vite.config.ts so SvelteKit Vite plugins load. data project narrows include to src/lib/data/**; ui project narrows include to src/lib/components/** + src/routes/** AND overrides environment to jsdom."
    - "RED-by-design stubs: every new test wrapped in describe.skip so pnpm test exits 0 in Wave 0. Downstream plans 03-01..03-04 rename `.skip` → no-skip as they land implementations."
    - "Lazy-import pattern for cross-module imports that don't resolve yet (carry-forward from Phase 2 Wave 0): top-level `import X from './X.svelte'` would crash module loading before the suite suppression kicks in; instead each test body calls `const X = await loadX()` where `loadX` is an `async function` returning `(await import('./X.svelte')).default` with a leading `// @ts-expect-error` directive. Downstream plans drop the indirection + the directive."
    - "vi.mock pattern for $app/state and $app/paths in TopNav.test.ts (declared at module top via `vi.mock(...)`; mutable `mockPage.url` reassigned per-test to drive active-state branches)."
    - "Build-artifact coverage script: pure node:fs counting of build/work/index.html (1), build/work/<slug>/index.html (>=8), build/watch/<id>/index.html (>=56). Dependency-free Node ESM matching the style of scripts/test-build-fails.mjs from Phase 2."
key-files:
  created:
    - vitest.workspace.ts
    - src/lib/components/VideoCard.test.ts
    - src/lib/components/CategoryTag.test.ts
    - src/lib/components/TopNav.test.ts
    - src/routes/work/page.test.ts
    - src/routes/work/[category]/page.test.ts
    - src/routes/watch/[id]/page.test.ts
    - scripts/test-prerender-coverage.mjs
  modified:
    - package.json (added jsdom devDep + test:prerender script)
    - pnpm-lock.yaml (jsdom resolution)
    - .planning/phases/03-grid-filter-watch/03-VALIDATION.md (path renames + footnote on the `+` rename)
  unchanged:
    - vite.config.ts (intentional — the workspace extends it)
    - tsconfig.json (intentional — generated svelte-kit tsconfig includes everything under src/)
    - src/lib/index.ts (intentional)
decisions:
  - "Chose Vitest workspace split (option b) over a single global jsdom swap (option a). Why: Phase 2 ships 32 data-layer tests in node env; switching them to jsdom adds DOM bootstrap cost for zero gain. The workspace keeps the data project fast and isolates jsdom to the routes/components that actually need it."
  - "Both workspace projects `extends: './vite.config.ts'`. Why: SvelteKit Vite plugins (tailwindcss, validateVideosPlugin, sveltekit) MUST be loaded so $lib/* aliases resolve and Svelte component files compile. The ui project then OVERRIDES environment to 'jsdom'. The data project inherits 'node' from vite.config.ts's test block."
  - "Removed the planner's literal `/// <reference types=\"vitest/config\" />` triple-slash directive from vitest.workspace.ts. Why: ESLint rule @typescript-eslint/triple-slash-reference blocked the pre-commit hook. The `import { defineWorkspace } from 'vitest/config'` brings the type augmentation along anyway. Zero functional impact."
  - "Renamed route test files: `src/routes/.../+page.test.ts` → `src/routes/.../page.test.ts` (3 files). Why: @sveltejs/kit 2.59.1's route analyzer (create_manifest_data/index.js:518) throws `Files prefixed with + are reserved (saw <file>)` for any `+*.ts` file in src/routes/ that doesn't match one of `+page.{js,ts,svelte,server.{js,ts}}`, `+layout.{...}`, `+server.{js,ts}`, `+error.svelte`. Test files with `+` prefix break `svelte-kit sync` AND `pnpm check` AND `pnpm build`. Unprefixed `page.test.ts` is silently ignored by SvelteKit's route walker (line 233: skipped) and freely consumed by Vitest's `include: ['src/routes/**/*.{test,spec}.{js,ts}']` glob. 03-VALIDATION.md per-task verification map was updated to match the new paths."
  - "Kept lazy `await import()` pattern from Phase 2 Wave 0 (the planner's example code used top-level static imports, which crash vitest's module loader before describe.skip can suppress the suite — same trap Phase 2 02-00 hit and resolved). Each lazy import sits behind a `// @ts-expect-error — module exists after Plan 03-NN` directive. Downstream plans drop both the indirection AND the directive when they land the target module."
  - "scripts/test-prerender-coverage.mjs counts canonical adapter-static output shapes: subdirs with index.html. Thresholds are >=1 for /work, >=8 for /work/<slug>, >=56 for /watch/<id> (one per video). Exit 0/1/2 distinguishes pass/fail/no-build. Plans 03-02 and 03-03 own the first GREEN run; this plan just lands the runnable script."
metrics:
  duration_minutes: 14
  tasks_completed: 3
  tasks_total: 3
  files_created: 8
  files_modified: 3
  commits:
    - "125ab8c chore(03-00): install jsdom and split vitest into data/ui workspace projects"
    - "395c1be test(03-00): scaffold 6 RED-by-design describe.skip stubs for grid/filter/watch"
    - "b23baa4 feat(03-00): add test-prerender-coverage.mjs build-artifact coverage check"
  completed_at: "2026-05-11"
---

# Phase 3 Plan 00: Test Infrastructure Summary

## One-liner

Two-project Vitest workspace (node for data, jsdom for ui), 6 RED-by-design `describe.skip` stubs, and a build-artifact coverage check — Wave 0 scaffolding so every downstream Phase 3 plan (03-01..03-04) has a runnable automated verification command.

## What Shipped

### jsdom installation

- `jsdom@29.1.1` resolved from `pnpm view jsdom version` at execution time.
- Installed with `pnpm add -D -E jsdom@29.1.1` (the `-E` flag pins exact — no caret/tilde — matching the project's exact-pin convention from Phase 1 STATE).
- `package.json` `devDependencies.jsdom` now reads literal `"jsdom": "29.1.1"` (matches `\d+\.\d+\.\d+` regex).

### Vitest workspace

`vitest.workspace.ts` at repo root defines two projects:

```
data — extends vite.config.ts (node env). include: src/lib/data/**/*.{test,spec}.{js,ts}
ui   — extends vite.config.ts but overrides environment: 'jsdom'.
       include: src/lib/components/** + src/routes/**/*.{test,spec}.{js,ts}
```

Both projects `extends: './vite.config.ts'` so SvelteKit Vite plugins (`tailwindcss`, `validateVideosPlugin`, `sveltekit`) load — required for `$lib/*` alias resolution and Svelte component imports.

### 6 test stub files (RED-by-design)

Every suite wrapped in `describe.skip` so `pnpm test` exits 0 in Wave 0. Plans 03-01..03-04 remove `.skip` as they land implementations.

| File | Suites (describe.skip) | Downstream Plan | Test names (literal — cross-reference 03-VALIDATION.md Per-Task Verification Map) |
|------|------------------------|-----------------|-----------------------------------------------------------------------------------|
| `src/lib/components/VideoCard.test.ts` | 3 | 03-01 | `VideoCard — GRID-01 (thumb + title + tag + uploader)`, `VideoCard — GRID-03 lazy loading (D-17)`, `VideoCard — GRID-04 click target (D-13, D-14)` |
| `src/lib/components/CategoryTag.test.ts` | 1 | 03-01 | `CategoryTag — GRID-05 per-category accent` |
| `src/lib/components/TopNav.test.ts` | 2 | 03-04 | `TopNav — NAV-01 baseline rendering (D-39, D-40)`, `TopNav — active state (D-41)` |
| `src/routes/work/page.test.ts` | 1 | 03-02 | `/work +page.ts load — GRID-02 + D-24 + D-25` |
| `src/routes/work/[category]/page.test.ts` | 2 | 03-02 | `/work/[category] +page.ts load — FILT-03 (D-29, D-30)`, `/work/[category] +page.ts entries — FILT-03 prerender enumeration` |
| `src/routes/watch/[id]/page.test.ts` | 3 | 03-03 | `/watch/[id] +page.ts load — FILT-01 (D-31, D-32, D-33)`, `/watch/[id] +page.ts load — FILT-02 rail (D-36, D-37, D-38)`, `/watch/[id] +page.ts entries — FILT-01 prerender enumeration` |

Literal test-name fragments referenced by `pnpm vitest run … -t "<fragment>"` commands in 03-VALIDATION.md are present in `describe.skip` lines and can be cross-grepped: `"lazy loading"`, `"click target"`, `"entries"` (in both `/work/[category]` and `/watch/[id]`), `"rail"` (in `/watch/[id]`), `"active"` (in `TopNav`).

Total: 12 describe.skip blocks containing 46 `it()` cases that vitest reports as `skipped`.

### Build-artifact coverage script

`scripts/test-prerender-coverage.mjs` — dependency-free Node ESM. Counts canonical adapter-static prerender output:

| Path pattern | Threshold | Purpose |
|---|---|---|
| `build/work/index.html` | >=1 (must exist) | Unfiltered /work route prerendered |
| `build/work/<slug>/index.html` | >=8 | One per category (Plan 03-02 owns) |
| `build/watch/<id>/index.html` | >=56 | One per video (Plan 03-03 owns) |

Exit codes: `0` pass, `1` fail (counts below threshold), `2` no `build/` directory.

Wired in package.json as `pnpm test:prerender`. In Wave 0 the script exits 1 (the routes don't exist yet); plans 03-02 + 03-03 own the first GREEN run. The plan's verification only requires "exists + invocable without crashing" — confirmed.

### Why this complements `adapter-static strict: true`

`strict: true` fails the build if any route imported by another route is NOT prerenderable. But if `entries()` returns ZERO entries for `/watch/[id]`, the build SUCCEEDS with zero `/watch/<id>/index.html` files — `strict` doesn't catch an empty enumeration. The coverage script catches that gap explicitly.

## Downstream Contract for Plans 03-01..03-04

When a downstream plan lands a target module (e.g., `VideoCard.svelte` in 03-01):

1. **Drop `describe.skip` → `describe`** in the corresponding test file (one rename per suite).
2. **Drop the lazy-import indirection.** Replace:
   ```ts
   async function loadVideoCard() {
     // @ts-expect-error — component exists after Plan 03-01
     const mod = await import('./VideoCard.svelte');
     return mod.default;
   }
   ```
   with:
   ```ts
   import VideoCard from './VideoCard.svelte';
   ```
   and replace every `const VideoCard = await loadVideoCard();` in test bodies with no-op (the static import is now in scope).
3. **Run `pnpm vitest run <file>`** — must turn GREEN before the downstream plan commits.

## Decisions Made

See frontmatter `decisions` block for the full list. Highlights:

1. **Workspace split (option b) chosen over global jsdom (option a).** Phase 2 ships 32 fast node-env tests; switching them to jsdom would add ~150ms per file for zero gain. The workspace isolates jsdom to where it's needed.
2. **Triple-slash directive removed from `vitest.workspace.ts`** — ESLint blocked it; the `import { defineWorkspace }` brings the same type augmentation.
3. **Route test files renamed `+page.test.ts` → `page.test.ts`.** SvelteKit's route analyzer hard-errors on `+*.ts` files that aren't recognized route shapes. Unprefixed names are silently ignored by the router and freely consumed by Vitest. 03-VALIDATION.md updated to match.
4. **Lazy `await import()` pattern preserved from Phase 2 Wave 0.** The planner's literal example used top-level static imports of not-yet-existing modules; that pattern crashes vitest's module loader before `describe.skip` can suppress the suite. Phase 2's lazy-import pattern is the established workaround.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug in literal plan example] Triple-slash directive blocked by ESLint**
- **Found during:** Task 1 commit (pre-commit hook)
- **Issue:** `/// <reference types="vitest/config" />` in `vitest.workspace.ts` violates `@typescript-eslint/triple-slash-reference`.
- **Fix:** Removed the triple-slash line. The remaining `import { defineWorkspace } from 'vitest/config'` brings the type augmentation along, so vitest still has typed config support.
- **Files modified:** `vitest.workspace.ts`
- **Commit:** `125ab8c` (Task 1)

**2. [Rule 3 - Blocking issue] SvelteKit route analyzer refuses `+page.test.ts` filenames**
- **Found during:** Task 2 verification (`pnpm test` warning + `pnpm check` hard error)
- **Issue:** `@sveltejs/kit` 2.59.1 throws `Files prefixed with + are reserved (saw src/routes/.../+page.test.ts)` because the `+` prefix is reserved for recognized SvelteKit route filenames (`+page.{ts,svelte,server.ts}`, `+layout.{...}`, `+server.{ts}`, `+error.svelte`). `+page.test.ts` matches none of those, so the analyzer hard-errors during `svelte-kit sync`. This breaks `pnpm check` and (transitively) `pnpm build`.
- **Fix:** Renamed the 3 route test files to drop the `+`:
  - `src/routes/work/+page.test.ts` → `src/routes/work/page.test.ts`
  - `src/routes/work/[category]/+page.test.ts` → `src/routes/work/[category]/page.test.ts`
  - `src/routes/watch/[id]/+page.test.ts` → `src/routes/watch/[id]/page.test.ts`
  Unprefixed names are silently ignored by SvelteKit's route walker (line 233 of `create_manifest_data/index.js`: `if (!file.name.startsWith('+')) continue;`) and freely consumed by Vitest's `include: ['src/routes/**/*.{test,spec}.{js,ts}']` glob.
- **Companion fix:** Updated `.planning/phases/03-grid-filter-watch/03-VALIDATION.md` Per-Task Verification Map rows for tasks 3-02-01, 3-02-02, 3-02-03, 3-03-01, 3-03-02, 3-03-03 to use the new paths. Added an inline footnote in the Wave 0 Requirements section documenting the rename + reason so downstream planners don't reintroduce the `+`.
- **Files modified:** 3 route test files renamed; 03-VALIDATION.md (table cells + Wave 0 requirements footnote)
- **Commit:** `395c1be` (Task 2)

**3. [Rule 1 - Bug in literal plan example] Top-level static imports of not-yet-existing modules crash vitest loader**
- **Found during:** Task 2 first verification (after writing the planner's literal example code)
- **Issue:** The plan's example test files used top-level static imports like `import VideoCard from './VideoCard.svelte'` with a `// @ts-expect-error` directive over them. The directive suppresses the TypeScript error but does NOT prevent vitest from trying to resolve the import at module load — which fails because the module doesn't exist yet (Plan 03-01 creates it). Result: 6 test files crashed with `Cannot find module ...` during the Task 2 verification run.
- **Fix:** Converted every cross-module import to a lazy `async function loadX() { /* @ts-expect-error */ const mod = await import('./X.svelte'); return mod.default; }` pattern, with each test body now `const X = await loadX(); component = mount(X, ...);`. Since `describe.skip` suppresses the entire suite, `loadX()` is never called and the missing module never resolves. This pattern is the exact workaround established in Phase 2 Wave 0 (Plan 02-00 SUMMARY logged it as a decision in STATE.md). Same pattern applied to the route stubs (`async function loadPage() { /* ... */ return await import('./+page'); }`).
- **Downstream effect:** When 03-01..03-04 land the target modules, they remove BOTH `.skip` AND the lazy-import indirection — replacing each `loadX()` async function with a direct top-level static import (and dropping the `@ts-expect-error`).
- **Files modified:** All 6 test stub files.
- **Commit:** `395c1be` (Task 2)

## Authentication Gates

None.

## Self-Check: PASSED

All claimed artifacts exist on disk and all claimed commits are reachable in `git log`:

- FOUND: `vitest.workspace.ts`
- FOUND: `src/lib/components/VideoCard.test.ts`
- FOUND: `src/lib/components/CategoryTag.test.ts`
- FOUND: `src/lib/components/TopNav.test.ts`
- FOUND: `src/routes/work/page.test.ts`
- FOUND: `src/routes/work/[category]/page.test.ts`
- FOUND: `src/routes/watch/[id]/page.test.ts`
- FOUND: `scripts/test-prerender-coverage.mjs`
- FOUND: `.planning/phases/03-grid-filter-watch/03-00-test-infrastructure-SUMMARY.md`
- FOUND commit: `125ab8c` (chore: install jsdom + workspace)
- FOUND commit: `395c1be` (test: 6 RED-by-design stubs)
- FOUND commit: `b23baa4` (feat: prerender-coverage script)

## Final State

- `pnpm test` — `Test Files 4 passed | 6 skipped (10); Tests 32 passed | 46 skipped (78)`
- `pnpm check` — `0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`
- `pnpm build` — `Wrote site to "build"; done`
- `pnpm test:prerender` — exits 1 with FAIL listing (expected: routes don't exist yet — Plans 03-02 + 03-03 own first GREEN run)
- `vite.config.ts`, `tsconfig.json`, `src/lib/index.ts` — byte-identical (zero diff vs pre-plan state)

Wave 0 RED-by-design contract satisfied: every downstream Phase 3 plan now has a runnable `<automated>` command pointing at a `describe.skip` block it owns.
