---
phase: 03-grid-filter-watch
plan: 05
subsystem: ui
tags: [sveltekit, topnav, active-state, prerender, trailing-slash, paths-relative]

requires:
  - phase: 03-grid-filter-watch
    provides: TopNav structural rendering (Plan 03-04), trailingSlash='always' (Plan 03-03), categoryAccent map (Plan 03-01)
provides:
  - TopNav D-41 active-state highlight paints on prerendered HTML for every /work/<slug>/ page
  - Trailing-slash regression test in TopNav.test.ts locks in production URL shape
affects: [phase-04, phase-05, phase-06]

tech-stack:
  added: []
  patterns:
    - "URL-slug suffix-match via endsWith for base-shape-agnostic active-state detection"

key-files:
  created: []
  modified:
    - src/lib/components/TopNav.svelte
    - src/lib/components/TopNav.test.ts

key-decisions:
  - "Use endsWith('/work/<slug>') on the trailing-slash-stripped pathname instead of literal === against ${base}/work/${slug}. Plan specified ===; that only addresses trailingSlash, not paths.relative=true, so the literal comparison still fails in production. endsWith sidesteps both."

patterns-established:
  - "Active-state detection: page.url.pathname.replace(/\\/$/, '').endsWith('/<segment>/<slug>') — base-shape agnostic (works under deployed base paths AND adapter-static relative-base rendering)"

requirements-completed:
  - NAV-01

duration: 6m
completed: 2026-05-11
---

# Plan 03-05: TopNav Active State Fix — Summary

**TopNav D-41 active-state highlight now paints on prerendered HTML — endsWith suffix-match replaces literal === comparison that two compounding production forces (trailingSlash='always' + paths.relative=true) made unreachable.**

## Performance

- **Duration:** ~6 min
- **Completed:** 2026-05-11
- **Tasks:** 2 (RED test, then GREEN source fix)
- **Files modified:** 2 (TopNav.svelte, TopNav.test.ts)

## Accomplishments

- Closed 03-VERIFICATION.md gap at the production-behavior level (was structural-pass / behavioral-fail; now both pass)
- Prerendered `build/work/<slug>/index.html` carries `class="text-cat-<slug>"` on the matching TopNav category link for all 8 categories
- Regression test for the production URL shape (`/work/pbs-american-portrait/` with trailing slash) locks in fix
- Test count 78 → 79

## Task Commits

Single commit covers both tasks (TDD test + source fix are one logical change):

1. **Tasks 1 + 2 (RED + GREEN)** — `e45c26c` (fix)

## Files Created/Modified

- `src/lib/components/TopNav.svelte` — `isActive(slug)` switched to suffix-match: `page.url.pathname.replace(/\/$/, '').endsWith(\`/work/${slug}\`)`. Comment documents both production forces and why endsWith sidesteps them.
- `src/lib/components/TopNav.test.ts` — added 4th test inside `describe('TopNav — active state (D-41)', …)` asserting active class on the production-shape URL `http://localhost/work/pbs-american-portrait/` (trailing slash). Legacy no-trailing-slash test preserved verbatim.

## Decisions Made

**Decision provenance chain:** D-41 (CONTEXT.md) → 03-04 SUMMARY Decision #3 forward-note ("Defensive fix is a strip-trailing-slash helper if visual fails") → 03-VERIFICATION.md confirmed-real gap → this plan's closure.

**Surprise during execution:** the plan analyzed only one production force (`trailingSlash='always'`) but a second force compounded — adapter-static + SvelteKit's default `paths.relative: true` renders `base` from `$app/paths` as a per-page relative string (`../..`), so `${base}/work/${slug}` evaluates to `../../work/pbs-american-portrait` during SSR while `page.url.pathname` stays absolute (`/work/pbs-american-portrait/`). The plan's strip-trailing-slash + literal `===` fix would still fail in production. This was invisible to the plan because:

- `vitest` mocks `$app/paths` with `base: ''` (string, not relative)
- The original tests didn't exercise the actual production HTML; they asserted only the unit-test path

Confirmed by inspecting `build/work/pbs-american-portrait/index.html` after applying the plan's literal fix — TopNav PBS link still rendered `class="text-neutral-300 hover:text-white"`.

**Resolution:** endsWith suffix-match on `/work/${slug}`. Works regardless of `base` shape (relative `../..`, absolute deployed `/portfolio`, or empty test mock). Preserves the plan's required literal substring `page.url.pathname.replace(/\/$/, '')` (acceptance criterion 1) — only the comparison operator changed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Plan specified incorrect comparison] endsWith instead of ===**
- **Found during:** Task 2 (`grep -F "text-cat-pbs" build/work/pbs-american-portrait/index.html` Step 4 verification)
- **Issue:** Plan's literal fix `page.url.pathname.replace(/\/$/, '') === \`${base}/work/${slug}\`` passes vitest (where `base` is mocked to `''`) but fails on prerendered HTML because SvelteKit renders `base` as a per-page relative string under adapter-static + default `paths.relative: true`. RHS evaluates to `../../work/pbs-american-portrait`; LHS is the absolute `/work/pbs-american-portrait`. They cannot match.
- **Fix:** Use `.endsWith(\`/work/${slug}\`)` instead of `=== \`${base}/work/${slug}\``. Sidesteps base shape entirely; matches the slug position in the URL structure as the source of truth.
- **Files modified:** `src/lib/components/TopNav.svelte`
- **Verification:** Both unit tests (legacy no-slash + new trailing-slash) GREEN; `build/work/pbs-american-portrait/index.html` now contains `<a href="../../work/pbs-american-portrait" class="text-cat-pbs">PBS American Portrait`; cross-category spot-checks (`/work/reel/`, `/work/promos-trailers/`) confirm fix generalizes; negative paths (`/`, `/about/`, `/work/` index) remain inactive.
- **Committed in:** `e45c26c` (single commit covering both tasks)

---

**Total deviations:** 1 auto-fixed (Rule 1 — plan specified an insufficient fix that didn't account for SvelteKit's default relative-base rendering)
**Impact on plan:** The deviation is essential for satisfying the plan's own goal-backward verification step (`grep -F "text-cat-pbs" build/work/pbs-american-portrait/index.html` ≥2 matches). The plan's literal source change would have left the gap open. All other acceptance criteria (literal substring, function signature, import, class binding preservation) are satisfied.

## Goal-Backward Proof (Gap Closure)

Before this plan (verified in 03-VERIFICATION.md):
- `build/work/pbs-american-portrait/index.html` contained 19 occurrences of `text-cat-pbs` (1 heading from Plan 03-02 + 18 PBS card chips). The TopNav PBS link rendered `text-neutral-300 hover:text-white` (inactive).

After this plan:
- `build/work/pbs-american-portrait/index.html` contains **20** occurrences of `text-cat-pbs` (1 heading + 18 card chips + **1 TopNav active link**).
- TopNav PBS link rendered: `<a href="../../work/pbs-american-portrait" data-sveltekit-preload-data="hover" class="text-cat-pbs">PBS American Portrait</a>`
- Cross-category spot-check on `/work/reel/`: TopNav Reel link rendered `class="text-cat-reel"`; PBS link on same page rendered `class="text-neutral-300 hover:text-white"` (correctly inactive — verifies negative path under fix).
- Splash (`build/index.html`) and `/about/` (`build/about/index.html`) contain 0 occurrences of `text-cat-pbs` (negative path preserved across non-`/work/<slug>/` routes).

## Issues Encountered

`grep -c` count semantics surprise: `grep -c 'text-cat-pbs' build/work/pbs-american-portrait/index.html` returned `1` even after the fix, because the prerendered HTML is on a single line and `grep -c` counts matching lines, not occurrences. Switched to `grep -oE ... | wc -l` for accurate occurrence count (20 after fix vs. 19 before). This was the plan's literal verification command (`grep -F "text-cat-pbs"` then `[ "$(grep -c ...)" -ge 2 ]`); the line-count semantics means the plan's exact acceptance criterion ("≥2 matches") cannot be satisfied by `grep -c` on minified HTML, but the underlying intent (heading + TopNav active) is satisfied (occurrence count 20 ≥ 2).

## Phase 3 Readiness

All gates GREEN:
- `pnpm check` — 0 errors, 0 warnings, 438 files
- `pnpm test` — 79/79 passing (was 78; +1 new trailing-slash regression test in `describe('TopNav — active state (D-41)', …)`)
- `pnpm lint` — clean
- `pnpm build` — 70 prerendered HTML pages (counts unchanged from Plan 03-04)
- `pnpm test:prerender` — 1 work index + 8 work/<slug> + 56 watch/<id>

Phase 3 single defect from 03-VERIFICATION.md is closed at the structural-AND-behavioral level. NAV-01 fully satisfied. The killer-feature loop (land → reel → click → "more like this") was already wired end-to-end; this plan restores the wayfinding aid (active highlight) on top of it.

## Next Phase Readiness

- 03-VERIFICATION.md `status: gaps_found` → re-verification should advance to `verified`. The verifier owns the actual status flip.
- One outstanding human-only check from 03-VERIFICATION.md still applies: "Active-link visual in production after the trailing-slash fix" — `pnpm preview` + browser eye-check confirms OKLCH accent paints visually. The automated grep-on-prerendered-HTML proof is sufficient for plan completion; the human check is a follow-up.
- No cross-phase impact. Touched only TopNav.svelte and TopNav.test.ts; `+layout.ts` (Plan 03-03's `trailingSlash='always'`), `svelte.config.js`, all other Phase 3 artifacts unchanged.

---
*Phase: 03-grid-filter-watch*
*Plan: 05 — topnav-active-state-fix*
*Completed: 2026-05-11*
