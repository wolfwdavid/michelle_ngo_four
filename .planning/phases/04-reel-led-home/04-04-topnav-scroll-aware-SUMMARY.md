---
phase: 04-reel-led-home
plan: 04
subsystem: ui
tags: [svelte5, runes, $effect, $derived, intersection-observer, scroll-aware, sveltekit, app-state, tailwind-v4-literals]

# Dependency graph
requires:
  - phase: 03-grid-filter-watch
    provides: TopNav.svelte NAV-01 baseline (wordmark + 8 category links + About/Press/Contact + hamburger + D-41 active state via $app/state); the vi.hoisted mockPage pattern in TopNav.test.ts
  - phase: 04-reel-led-home plan 01
    provides: vitest-setup-ui.ts globalThis.IntersectionObserver stub; TopNav.test.ts new mockPage.route field + 2 describe.skip suites (scroll-aware home + solid on non-home for all 6 D-13 routes)
  - phase: 04-reel-led-home plan 02
    provides: HeroPoster.svelte renders <div id="hero-sentinel" class="absolute bottom-0 left-0 h-px w-full"> — the DOM contract TopNav's $effect queries via document.getElementById('hero-sentinel')
provides:
  - src/lib/components/TopNav.svelte (scroll-aware extension: $state heroVisible + $effect IntersectionObserver + $derived navClass; <header> uses class={navClass} binding)
  - TopNav.test.ts GREEN (16 tests: 8 Phase 3 NAV-01/D-41 + 8 Phase 4 D-13/D-14; zero describe.skip; zero @ts-expect-error)
affects: [04-05-home-page-composition]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scroll-aware-on-/ extension pattern: route-gated $effect ({ page.route.id === '/' ? observe : skip }) + IntersectionObserver on a sentinel id rendered by the boundary-painting component (HeroPoster owns #hero-sentinel; TopNav consumes by id). Cleanup returns from the $effect — runs on route change and unmount. Reference for any future scroll-aware element pairings (e.g., a footer sentinel for a back-to-top button)."
    - "Two-literal-class $derived for Tailwind v4: when a component class is dynamic, the $derived ternary returns ONE of TWO COMPLETE LITERAL STRINGS (no concat, no interpolation). Both strings appear verbatim in source — Tailwind v4's text-scanner tokenizes every utility class without ever evaluating runtime expressions. Common prefix `sticky top-0 z-30 border-b` keeps layout stable across the transition."
    - "flushSync() in Vitest after mount() when asserting on $effect side effects: Svelte 5's $effect runs on a microtask queue AFTER mount() returns synchronously. Tests that assert on $effect-driven state (here: observer.observe was called) must call flushSync() before the assertion or the queue won't have drained yet."

key-files:
  created: []
  modified:
    - "src/lib/components/TopNav.svelte"
    - "src/lib/components/TopNav.test.ts"

key-decisions:
  - "Read page.route.id INSIDE the $effect body (Pitfall 2): hoisting `const onHomeRoute = page.route.id === '/'` to module scope OR to a top-level component const would break reactivity — $effect's dependency tracking only sees reads that happen during effect execution. Inline read inside the effect body is the only correct shape; verified by all 6 non-home route tests passing on route-id change."
  - "Both navClass branches as complete literal strings (Pitfall 4): the transparent and solid branches each include the full `sticky top-0 z-30 border-b` prefix verbatim instead of factoring it out via concatenation. Concatenation would NOT change runtime output but WOULD break Tailwind v4's source scanner: the scanner tokenizes literal source text, never evaluates expressions, so `sticky` appearing only in a runtime string would not generate the utility. Acceptance criteria literal-grep checks (matching both strings byte-for-byte in source) enforce this contract."
  - "$effect runs the browser-only check implicitly (Svelte 5 guarantee, no typeof window guard): $effect callbacks never run during SSR — only after client-side mount + on subsequent reactive re-runs. The plan's literal scaffold drops the typeof window guard for this reason; verified by `pnpm build` (SSR prerender) staying green."
  - "Defensive heroVisible=false on every $effect entry path (non-home route AND missing sentinel): the route-change cleanup will fire before the next $effect run, so the previous-route observer is already disconnected — but resetting heroVisible to false ensures the nav re-renders solid on the new route even if the previous-route final state was transparent. Belt-and-braces."

patterns-established:
  - "Wave 0 → Wave 1 test stub transition for TopNav: 2 describe.skip → describe (no other restructuring); a single import change (`import { flushSync, mount, unmount } from 'svelte'`) and one new line (`flushSync();` after mount()) cover the microtask-flush gap. Matches the pattern Plan 04-02 established for HeroPoster.test.ts (one-rule transition + minimal idiomatic fixup)."
  - "Two-state nav class pattern: dynamic <header class={navClass}> where navClass is $derived from a single boolean (heroVisible). Reusable for any future surface whose visual chrome flips between two states based on viewport intersection (e.g., a transparent-over-section pattern on /about hero if added in Phase 6)."

requirements-completed: []

# Metrics
duration: 5 min
completed: 2026-05-11
---

# Phase 4 Plan 4: TopNav Scroll-Aware Summary

**Scroll-aware TopNav on `/` only: $effect + IntersectionObserver on #hero-sentinel flips navClass between a transparent branch (over the hero) and the existing Phase 3 solid chrome (past the hero AND on every other route). Phase 3 NAV-01 + D-41 behavior preserved verbatim; 8 new D-13/D-14 tests turned green via a one-rule describe.skip → describe flip plus a single flushSync() call after mount().**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-11T21:03:37Z
- **Completed:** 2026-05-11T21:08:13Z
- **Tasks:** 1
- **Files modified:** 2 (0 created, 2 modified)

## Accomplishments

- `src/lib/components/TopNav.svelte` now ships a route-gated `$effect` that attaches an `IntersectionObserver` to `#hero-sentinel` ONLY when `page.route.id === '/'`; the observer flips a `$state` `heroVisible` boolean that drives a `$derived` `navClass` ternary between two literal class strings
- On `/` over the hero: nav renders `sticky top-0 z-30 bg-transparent border-b border-transparent` (transparent over the gradient-darkened poster image)
- On `/` past the hero OR on any other route (`/work`, `/work/[category]`, `/watch/[id]`, `/about`, `/press`, `/contact`): nav reverts to the existing Phase 3 chrome `sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10`
- Cleanup function returned from the `$effect` disconnects the observer on every route change AND on component unmount — no leaked observers across navigations
- All 8 Phase 3 NAV-01 + D-41 tests still pass verbatim; the only `<header>` tag change is replacing the static class string with `class={navClass}`, preserving every behavior from Phase 3
- All 8 Phase 4 D-13/D-14 tests turned GREEN: 2 `scroll-aware home` (observer-attach via TrackingIO + default-solid-bg) + 6 `solid on non-home routes` (one it() per D-13 route)
- Full project gates green: `pnpm test` 96 passed + 3 skipped (was 85+14 in Plan 04-03 baseline — delta is 11 passing because Plan 04-03 also had test flips; 8 of the 11 are this plan's TopNav D-13/D-14 tests), `pnpm check` 0 errors / 0 warnings across 441 files, `pnpm build` clean (7.29s)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend TopNav.svelte with $effect + IntersectionObserver scroll-aware behavior + flip TopNav.test.ts skips** — `16191fc` (feat)

**Plan metadata:** pending (docs commit for SUMMARY + STATE + ROADMAP)

## Files Created/Modified

- `src/lib/components/TopNav.svelte` (modified, +60 lines / −2 lines) — three precise edits per plan: Edit 1 inserted the Phase 4 script block (`let heroVisible = $state(false)` + the route-gated `$effect` with IntersectionObserver attach/cleanup + `const navClass = $derived(...)` two-literal-string ternary) between the existing `let mobileOpen` line and the `function isActive` declaration; Edit 2 replaced the `<header>` opening tag's literal class string with `class={navClass}`; Edit 3 appended a `Phase 4 additions:` section to the top-of-file comment block documenting D-13 + D-14. Phase 3 imports (`page`, `base`, `getCategoriesInDisplayOrder`, `categoryToSlug`, `categoryAccent`, `MobileMenu`), `const categories`, `let mobileOpen`, `isActive()`, and the entire template inside `<header>` untouched
- `src/lib/components/TopNav.test.ts` (modified, +3 lines / −2 lines) — flipped both `describe.skip(` → `describe(` for the D-13 scroll-aware home suite AND the D-13 solid on non-home routes suite; added `flushSync` to the existing `import { mount, unmount } from 'svelte'` import; inserted a single `flushSync();` line after `mount(TopNav, ...)` in the TrackingIO observe-call test (drains the $effect microtask queue before the `expect(observed).toContain(sentinel)` assertion fires). Plan 04-01's `mockPage.route = { id: '/' }` field and the 8 new it() bodies (2 home + 6 non-home routes) untouched

## Decisions Made

- **`page.route.id` read INSIDE `$effect` body, never hoisted to a top-level const** — the plan's `read_first` block flagged Pitfall 2 explicitly: Svelte 5's `$effect` dependency tracking only sees reads that occur during the effect's execution. If `const onHomeRoute = page.route.id === '/'` were hoisted to module scope (or even to a top-level component const), the effect would still run on mount but would NOT re-run when the user navigates to another route — the observer would stay attached and `heroVisible` could be stuck stale. The inline read inside the effect body is the only correct shape, and the 6 "solid on non-home" route tests verify that route-id change properly triggers the effect's reset-and-bail branch.
- **Both navClass branches are complete literal strings, not factored** — Pitfall 4 reference. Could have been `const PREFIX = 'sticky top-0 z-30 border-b'` then `'${PREFIX} bg-transparent border-transparent'`. RUNTIME EQUIVALENT but Tailwind v4 source scanner sees only the literal source text — concatenation hides `sticky` from the scanner so `sticky` would never ship in the CSS bundle. Both branches now appear verbatim in the source, and the plan's acceptance criteria pin both strings as exact literal-grep matches.
- **`flushSync()` after `mount()` in the TrackingIO observe-call test** — see "Deviations from Plan" for the full story. Short version: Svelte 5's `$effect` runs on the microtask queue after `mount()` returns synchronously; the Plan 04-01 stub asserted `expect(observed).toContain(sentinel)` immediately after `mount()`, which races the effect. `flushSync()` (re-exported by `svelte`) drains the microtask queue so the effect — and therefore `observer.observe(sentinel)` — has run before the assertion fires.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan 04-01 stub asserted `expect(observed).toContain(sentinel)` synchronously after `mount(TopNav, ...)` — but Svelte 5's `$effect` runs on a microtask queue AFTER mount() returns, so the observer.observe(sentinel) call had not yet fired when the assertion executed**

- **Found during:** Task 1 verification (`pnpm vitest run src/lib/components/TopNav.test.ts`)
- **Issue:** First test run reported `AssertionError: expected [] to include <div id="hero-sentinel"></div>` for `scroll-aware home: on route "/", TopNav attaches an IntersectionObserver on #hero-sentinel`. The other 7 D-13 tests (default-solid + all 6 non-home routes) passed first time because they assert on `header?.className` (synchronously updated via the template's `class={navClass}` binding seeded from `heroVisible=false`'s initial value). The observe-call test specifically needs the `$effect` to have RUN — its only way to populate `observed[]`. Svelte 5.55.5 schedules `$effect` callbacks on a microtask queue: `mount()` synchronously runs the component's render effect but `$effect` user callbacks defer to a flush.
- **Fix:** Imported `flushSync` from `'svelte'` (which re-exports it from `./internal/client/reactivity/batch.js`) and called `flushSync()` after `mount(TopNav, ...)` in the TrackingIO test body, before the `expect(observed).toContain(sentinel)` assertion. `flushSync` synchronously drains the queue so `observer.observe(sentinel)` has fired.
- **Files modified:** `src/lib/components/TopNav.test.ts` (+2 lines: `flushSync` added to import + `flushSync();` line; comment explaining why)
- **Verification:** `pnpm vitest run src/lib/components/TopNav.test.ts` → 16 passed / 0 failed; `pnpm vitest run src/lib/components/TopNav.test.ts -t "scroll-aware home"` → 2 passed; `pnpm vitest run src/lib/components/TopNav.test.ts -t "solid on non-home"` → 6 passed (all 6 D-13 routes).
- **Committed in:** `16191fc` (Task 1 commit, same commit as the production-code edits)
- **Why this didn't surface in Plan 04-02 (HeroPoster.test.ts):** HeroPoster has no `$effect` — its tests all assert on synchronous template output (`<img>` attrs, `<link rel=preload>`, the sentinel div's id + class). TopNav.test.ts is the first Phase 4 file to exercise `$effect`-driven test side effects, so the microtask-flush gap surfaces here first. Pattern carries forward to any future test that asserts on `$effect` side effects.

---

**Total deviations:** 1 auto-fixed (Plan 04-01 stub bug — pre-Svelte-5-microtask-queue-aware assertion)
**Impact on plan:** Mechanical fix; matches Svelte 5 documented behavior and uses Svelte's own re-exported `flushSync`. Zero scope creep — every other acceptance criterion (literal-grep checks for `IntersectionObserver`, `$effect`, `page.route.id === '/'`, `document.getElementById('hero-sentinel')`, `let heroVisible = $state(false)`, `observer.disconnect()`, both navClass branches, `class={navClass}` on `<header>`, `Phase 4 additions:` comment marker, zero `describe.skip` in test file) passed verbatim on first check.

## Issues Encountered

None beyond the deviation above — every gate passed after the `flushSync` fix (single-iteration fixup).

## Known Stubs

None. All 8 D-13/D-14 test suites that Plan 04-01 left as `describe.skip` are now flipped to live `describe` blocks and all 8 tests pass. The plan's `<verify>` block §4 explicitly defers the live transparent↔solid TRANSITION (when `isIntersecting=true` actually fires in the browser) to Plan 04-05's visual UAT — the GREEN tests verify the OBSERVE call and the SOLID default state, which is what the plan literally pins.

## User Setup Required

None — pure source-code extension; no env vars, no external service, no dashboard work.

## Next Phase Readiness

- **Plan 04-05 (home page composition):** the scroll-aware contract is shipped — Plan 04-05's `src/routes/+page.svelte` renders `<HeroPoster />` at the top, and the layout's `<TopNav />` will see the sentinel mount, attach its observer, and flip transparent on first paint. The browser's live `IntersectionObserver` will then deliver real `isIntersecting` events as the user scrolls past the hero; TopNav reverts to solid via the existing $derived navClass without any further work in Plan 04-05.
- **No coupling regressions:** Phase 3 NAV-01 / D-41 tests all still green — the addition is purely additive at the script level + a one-character template change (`class="literal"` → `class={navClass}`). Any future plan that mounts TopNav in a test just needs `flushSync()` if it asserts on $effect side effects (now documented above).

## Self-Check: PASSED

Verified after writing this SUMMARY:

- File `src/lib/components/TopNav.svelte` exists and contains: literal `IntersectionObserver` (line 77); literal `$effect` (line 58); literal `page.route.id === '/'` (line 60); literal `document.getElementById('hero-sentinel')` (line 71); literal `let heroVisible = $state(false)` (line 56); literal `observer.disconnect()` (line 87); BOTH navClass branches verbatim (lines 96–97: `'sticky top-0 z-30 bg-transparent border-b border-transparent'` AND `'sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10'`); `<header>` tag uses `class={navClass}` (line 116, not a literal class string); `Phase 4 additions:` marker present in top-of-file comment (line 14)
- File `src/lib/components/TopNav.test.ts` modified — zero `describe.skip` occurrences (grep returned 0), `flushSync` imported from `svelte`, `flushSync();` called after `mount()` in the TrackingIO observe-call test
- Task commit present in git log: `16191fc`
- `pnpm vitest run src/lib/components/TopNav.test.ts` exits 0 (16 passed, 0 failed, 0 skipped)
- `pnpm vitest run src/lib/components/TopNav.test.ts -t "scroll-aware home"` exits 0 (2 passed)
- `pnpm vitest run src/lib/components/TopNav.test.ts -t "solid on non-home"` exits 0 (6 passed — all 6 D-13 routes: /work, /work/[category], /watch/[id], /about, /press, /contact)
- `pnpm test` exits 0 (96 passed + 3 skipped = 99 total; delta vs Plan 04-03 baseline of 85+14: 11 newly-passing tests, 8 of which are this plan's D-13/D-14 suite and 3 of which appear to be other unskipped tests landed alongside the test infrastructure work)
- `pnpm check` exits 0 (441 files, 0 errors, 0 warnings)
- `pnpm build` exits 0 (7.29s build time, static prerender stable)

---
*Phase: 04-reel-led-home*
*Completed: 2026-05-11*
