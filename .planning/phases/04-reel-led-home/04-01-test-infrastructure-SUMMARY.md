---
phase: 04-reel-led-home
plan: 01
subsystem: testing
tags: [vitest, jsdom, IntersectionObserver, sveltekit, svelte5, test-stubs]

# Dependency graph
requires:
  - phase: 03-grid-filter-watch
    provides: Vitest 4 inline projects (data=node, ui=jsdom) in vite.config.ts; TopNav.test.ts mockPage hoisted pattern; lazy-await-import stub idiom; VideoCard.test.ts mount/unmount harness
provides:
  - vitest-setup-ui.ts (globalThis.IntersectionObserver stub for jsdom)
  - vite.config.ts ui project wired with setupFiles ['./vitest-setup-ui.ts']
  - src/lib/components/HeroPoster.test.ts (5 describe.skip suites for HERO-01/02/03 + D-14 sentinel)
  - src/routes/page.test.ts (3 describe.skip suites for HERO-01 + D-22 + D-24 + D-28)
  - src/lib/data/videos.test.ts new describe.skip block (D-23/D-24/D-26 featured slice contract)
  - src/lib/components/TopNav.test.ts new describe.skip blocks (D-13/D-14 scroll-aware on home + solid on non-home for all 6 routes) + mockPage.route field
affects: [04-02-hero-poster-component, 04-03-featured-slice-flips, 04-04-topnav-scroll-aware, 04-05-home-page-composition]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vitest setupFiles per-project: ui project loads vitest-setup-ui.ts before each test for shared jsdom polyfills (IntersectionObserver). Future polyfills (ResizeObserver, matchMedia) append to the same file."
    - "RED-by-describe.skip stub: planner ships every acceptance test as describe.skip in Wave 0 with lazy runtime-concat dynamic imports (loadXxx helper). Wave 1 plans flip .skip and drop the indirection."
    - "TrackingIO subclass override: tests that need to capture IntersectionObserver constructor args wrap the global stub in a TrackingIO inside try/finally — leaks zero state to sibling tests."

key-files:
  created:
    - "vitest-setup-ui.ts"
    - "src/lib/components/HeroPoster.test.ts"
    - "src/routes/page.test.ts"
  modified:
    - "vite.config.ts"
    - "src/lib/components/TopNav.test.ts"
    - "src/lib/data/videos.test.ts"

key-decisions:
  - "Used runtime-concat dynamic specifiers (const spec = './' + 'name') for BOTH HeroPoster.test.ts loadHeroPoster AND page.test.ts loadPage + loadPageData — plan literal text used static-string await import('./+page') for loadPageData which crashed vite:import-analysis and triggered svelte-check 'cannot find module' error. Carry-forward of Phase 3 P00 fix."
  - "Dropped @ts-expect-error directives in all loadXxx helpers — runtime-concat specifiers widen to `any` in TS, so the directive is unused (svelte-check errors on unused @ts-expect-error since Plan 03-00 narrowed strictness)."
  - "Added inline eslint-disable-next-line @typescript-eslint/no-unused-vars on the IntersectionObserverStub constructor (vitest-setup-ui.ts) and the TrackingIO subclass inside TopNav.test.ts — eslint.config.js does not whitelist underscore-prefixed unused params, but the constructor parameter types are needed for type-compat with IntersectionObserverCallback."

patterns-established:
  - "Per-project test setup: each Vitest project can carry its own setupFiles list. UI project owns jsdom polyfills; data project stays vanilla node."
  - "Cross-test global stub override: clone globalThis.IntersectionObserver, override with a TrackingIO subclass that captures observe() args, restore in finally — works because the original stub is a class, not a frozen primitive."

requirements-completed: []

# Metrics
duration: 8 min
completed: 2026-05-11
---

# Phase 4 Plan 1: Test Infrastructure Summary

**Wave 0 test scaffolding: jsdom IntersectionObserver stub + RED-by-describe.skip stubs for every Phase 4 acceptance test (HERO-01/02/03, D-13, D-14, D-22, D-23, D-24, D-26, D-28).**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-11T20:27:39Z
- **Completed:** 2026-05-11T20:35:21Z
- **Tasks:** 3
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- jsdom now ships `globalThis.IntersectionObserver` for the entire ui Vitest project — Wave 1 TopNav scroll-aware tests can `mount(TopNav, …)` without `ReferenceError`
- Every Phase 4 acceptance test from 04-VALIDATION.md `-t` patterns exists as a `describe.skip` stub somewhere: HERO-01 (LCP attrs + preload link), HERO-02 (name + tagline), HERO-03 (PLAY REEL href + prefetch), D-13 (scroll-aware home, solid on all 6 non-home routes), D-14 (sentinel + observer attach), D-22/D-24 (8 featured cards), D-23/D-26 (featured slice quota + producerReelId), D-28 (View All Work link)
- Wave 1 plans (04-02, 04-03, 04-04, 04-05) inherit zero test-infra cost — they only flip `.skip` → `describe` (and drop the lazy `loadXxx()` indirection once production modules ship)
- Full test suite stays green throughout: 79 passed + 20 skipped (99 total). `pnpm check` 0 errors. `pnpm build` clean (6.94s, prerender succeeded).

## Task Commits

Each task was committed atomically:

1. **Task 1: Add IntersectionObserver stub + wire UI test setupFiles** — `b8154ac` (feat)
2. **Task 2: Create HeroPoster.test.ts + page.test.ts stubs (RED-by-skip)** — `821bc2a` (test)
3. **Task 3: Extend TopNav.test.ts and videos.test.ts with Phase 4 stubs** — `72123c3` (test)

**Plan metadata:** pending (docs commit for SUMMARY + STATE + ROADMAP)

## Files Created/Modified

- `vitest-setup-ui.ts` (created) — IntersectionObserverStub class assigned to `globalThis.IntersectionObserver`; loaded once per ui-project test run
- `vite.config.ts` (modified) — added `setupFiles: ['./vitest-setup-ui.ts']` to the ui project's test block (single-line delta inside the existing inline-projects array)
- `src/lib/components/HeroPoster.test.ts` (created) — 5 `describe.skip` suites covering HERO-01 LCP attrs, HERO-01 preload link, HERO-02 name and tagline, HERO-03 PLAY REEL (href + prefetch in one suite, 2 it() bodies), and the D-14 hero-sentinel contract
- `src/routes/page.test.ts` (created) — 3 `describe.skip` suites covering `/+page.svelte` HERO-01 renders hero (h1 + img present after mount), D-22/D-24 8 featured cards, D-28 View All Work link (href + prefetch)
- `src/lib/data/videos.test.ts` (modified) — appended 1 new `describe.skip` block with 3 it() bodies: 8 featured count, includes producerReelId in Reel category, exact quota (2 PBS + 2 Promos + 2 Branded + 1 Doc + 1 Reel; zero from the other 3 categories)
- `src/lib/components/TopNav.test.ts` (modified) — extended mockPage with `route: { id: '/' as string | null }` (forward-compatible; Phase 3 tests untouched); appended 2 new `describe.skip` blocks: scroll-aware home (observer-attach + default-solid-bg via 2 it() bodies) and solid on non-home (6 it() bodies, one per D-13 route: /work, /work/[category], /watch/[id], /about, /press, /contact)

## Decisions Made

- **Runtime-concat dynamic specifiers in BOTH loadPage AND loadPageData** — plan literal text used static-string `await import('./+page')` for `loadPageData`, which Vite's import-analysis statically resolves at parse time (the `/* @vite-ignore */` comment only works for non-literal expressions per Phase 3 P00 STATE.md note). Identical fix applied to both `loadHeroPoster()` and `loadPage()`. Once Plan 04-05 ships `/+page.ts`, the runtime-concat helper drops entirely (replace with top-level static `import { load } from './+page'`).
- **Dropped @ts-expect-error directives in all loadXxx helpers** — runtime-concat specifiers widen to `any`, so there is no TS error to suppress, and svelte-check errors on unused `@ts-expect-error` (this is the same lesson Plan 03-00 learned for the Phase 3 stubs).
- **Inline eslint-disable on stub constructor params** — `eslint.config.js` doesn't whitelist `_`-prefixed unused vars; tried 2 styles (plain `_cb`, then inline disable). Inline disable wins because the param types are load-bearing for `IntersectionObserverCallback` type compatibility.
- **Kept `route` field forward-compatible** — `mockPage.route = { id: '/' as string | null }` covers both Phase 3 (which never reads it) and Phase 4 (TopNav reads `page.route.id`). Phase 3 tests passing unchanged proves backward compatibility.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ESLint unused-vars on IntersectionObserverStub constructor params**

- **Found during:** Task 1 commit (pre-commit hook)
- **Issue:** `husky` pre-commit ran `eslint --fix` on `vitest-setup-ui.ts` and failed with `'_cb' is defined but never used` + `'_opts' is defined but never used`. Plan's literal stub used `_`-prefixed unused params expecting eslint to honor that convention; project's `eslint.config.js` doesn't enable `argsIgnorePattern: '^_'`.
- **Fix:** Collapsed the 4-line constructor signature onto one line and added `// eslint-disable-next-line @typescript-eslint/no-unused-vars` directly above it. Preserves the type signature (load-bearing for `IntersectionObserverCallback` compatibility) and unblocks the pre-commit hook.
- **Files modified:** `vitest-setup-ui.ts`
- **Verification:** `pnpm test` (79 passed), `pnpm check` (0 errors), commit succeeded with the directive in place.
- **Committed in:** `b8154ac` (Task 1 commit)

**2. [Rule 1 - Bug] Static-string `await import('./+page')` broke vite:import-analysis + svelte-check**

- **Found during:** Task 2 verification (`pnpm test src/lib/components/HeroPoster.test.ts src/routes/page.test.ts`)
- **Issue:** Plan literal text used a static specifier inside `loadPageData()` in `src/routes/page.test.ts`: `const { load } = await import('./+page')`. Vite's `vite:import-analysis` statically resolves literal-string dynamic imports at parse time and fails with `Error: Failed to resolve import "./+page"` because the module doesn't exist in Wave 0. `svelte-check` raised the parallel error `Cannot find module './+page' or its corresponding type declarations.` The `/* @vite-ignore */` magic comment only works for non-literal expressions (this is the same pitfall Phase 3 P00 STATE.md documents).
- **Fix:** Switched `loadPageData()` to the runtime-concat pattern used elsewhere in the file: `const spec = './' + '+page'; const mod = await import(/* @vite-ignore */ spec);`. Vite sees the specifier as non-literal and skips resolution; TypeScript widens the result to `any`.
- **Files modified:** `src/routes/page.test.ts`
- **Verification:** `pnpm test src/routes/page.test.ts` returns 2 files / 9 tests skipped (file no longer crashes during transform). `pnpm check` returns 0 errors.
- **Committed in:** `821bc2a` (Task 2 commit)

**3. [Rule 1 - Bug] Unused `@ts-expect-error` directives in lazy-import helpers**

- **Found during:** Task 2 verification (`pnpm check`)
- **Issue:** Plan literal text placed `// @ts-expect-error stub: target module doesn't exist yet` above the `await import(/* @vite-ignore */ spec)` line in both `loadHeroPoster()` and `loadPage()`. With the runtime-concat specifier (Deviation 2), TS widens the dynamic-import result to `any` — there's NO type error to suppress, and `svelte-check` raised `Unused '@ts-expect-error' directive.`
- **Fix:** Removed both `@ts-expect-error` lines and replaced with a clarifying inline comment explaining why no directive is needed.
- **Files modified:** `src/lib/components/HeroPoster.test.ts`, `src/routes/page.test.ts`
- **Verification:** `pnpm check` returns 0 errors, 0 warnings.
- **Committed in:** `821bc2a` (Task 2 commit, same commit as Deviation 2)

---

**Total deviations:** 3 auto-fixed (1 blocking lint, 2 plan-text bugs in the test infrastructure)
**Impact on plan:** All three are mechanical fixes that match documented project conventions (eslint config, Phase 3 P00 runtime-concat pattern, svelte-check unused-directive rule). Zero scope creep — every fix is necessary to honor the plan's own success criteria (`pnpm test && pnpm check` exit 0). The plan's behavioral contract (every test name appears as a literal string + every `describe.skip` block exists) is satisfied verbatim.

## Issues Encountered

None — the deviations above were all encountered as part of the planned tasks' verification gates and resolved before commit.

## Known Stubs

The whole plan is intentional stubs (`describe.skip` blocks awaiting Plans 04-02..04-05). This is documented at the plan level — these stubs exist BY DESIGN to give downstream plans a one-rule transition (`.skip` → `describe`). Each stub references its consuming plan:

- `HeroPoster.test.ts` (5 suites) — consumed by Plan 04-02
- `page.test.ts` (3 suites) — consumed by Plan 04-05
- `videos.test.ts` new block (1 suite, 3 tests) — consumed by Plan 04-03
- `TopNav.test.ts` new blocks (2 suites, 7 tests) — consumed by Plan 04-04

No production-code stubs that would affect end-user behavior.

## User Setup Required

None — Wave 0 is pure test scaffolding; no external services, no env vars, no dashboard configuration.

## Next Phase Readiness

- All four Phase 4 Wave 1 plans (04-02, 04-03, 04-04, 04-05) can execute in parallel or sequentially with zero test-infra invention
- jsdom IntersectionObserver stub means Plan 04-04 can mount TopNav with the scroll-aware `$effect` without ReferenceError
- 04-VALIDATION.md `-t` pattern grep contract is honored end-to-end: every test name in the verification map exists somewhere as a literal string in a `describe.skip` block

## Self-Check: PASSED

Verified after writing this SUMMARY:

- File `vitest-setup-ui.ts` exists at project root
- File `src/lib/components/HeroPoster.test.ts` exists
- File `src/routes/page.test.ts` exists
- Modified `vite.config.ts` (setupFiles line present)
- Modified `src/lib/components/TopNav.test.ts` (mockPage.route + 2 new describe.skip blocks)
- Modified `src/lib/data/videos.test.ts` (Phase 4 featured slice describe.skip block)
- All 3 task commits present in git log: `b8154ac`, `821bc2a`, `72123c3`
- `pnpm test` exits 0 (79 passed + 20 skipped = 99 total)
- `pnpm check` exits 0
- `pnpm build` exits 0

---
*Phase: 04-reel-led-home*
*Completed: 2026-05-11*
