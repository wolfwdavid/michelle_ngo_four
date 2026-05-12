---
phase: 05-pbs-american-portrait
plan: 02
subsystem: routes
tags: [sveltekit, svelte5, tailwind4, pbs, flagship-landing, cross-links, wave-1, vitest]

# Dependency graph
requires:
  - phase: 03-grid-filter-watch
    provides: VideoCard component (verbatim reuse), /work/[category] grid markup pattern, /watch/[id] metadata block, categoryAccent('PBS American Portrait')==='text-cat-pbs', trailingSlash='always' from +layout.ts, scripts/test-prerender-coverage.mjs threshold script
  - phase: 04-reel-led-home
    provides: PageData-narrowed callLoad pattern, vi.hoisted mockPage pattern (per-file distinct identifiers), sync PageLoad shape from /+page.ts
  - plan: 05-01
    provides: Wave 0 scaffolding — 9 RED-by-skip describe.skip suites across 5 test files, production stubs (+page.ts/+page.svelte/_pbsCollectionUrl.ts), <approved>...</approved> verbatim Candidate C PBS paragraph, scripts/test-prerender-coverage.mjs PBS landing threshold check
provides:
  - /pbs-american-portrait/ flagship landing route — D-08 h1 in text-cat-pbs, D-09 subtitle, D-10 verbatim PBS blockquote + attribution, D-12 outbound link with target=_blank rel=noopener, D-16 h2 Stories, D-19 2/3/4 grid of 18 PBS cards in D-18 featured-first/date-desc order, D-21 per-card "See on PBS →" badges on 15/18 cards (3 audit-verified records omit)
  - TopNav PBS link retargeted to /pbs-american-portrait/ (D-02) — special-cased ternary; other 7 categories unchanged
  - TopNav isActive() extended (D-03) — highlights cat-pbs accent on BOTH /pbs-american-portrait/ AND /work/pbs-american-portrait/ via slug-guarded suffix-match
  - D-04 cross-link on /work/pbs-american-portrait/ — inline `→ About the PBS American Portrait project` after h1, gated on data.category === 'PBS American Portrait'
  - D-05 cross-link on /watch/[id] for PBS-category videos — inline `→ About the PBS American Portrait project` below description, gated on video.category === 'PBS American Portrait'
  - All 9 Phase 5 describe.skip blocks flipped to describe (one-rule rename) — 25 new assertions all GREEN
  - Two prerender artifacts: build/pbs-american-portrait/index.html (PBS-01) + build/work/pbs-american-portrait/index.html (PBS-03 parity preserved)
affects: [Phase 6 (Press first-class section consumes the same PBS landing pattern for HBO Max/Hulu/Amazon credits)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional cross-link via {#if data.category === 'PBS American Portrait'} — gated single-link pattern transferable to any future flagship category landing (Phase 6 Press references this approach)"
    - "TopNav ternary href + isActive() extension — slug-guarded suffix-match is the clean way to add a flagship surface without breaking the existing /work/<slug> active-state contract"
    - "Coalesce v.description ?? '' at helper call sites — carries Plan 05-01 SUMMARY auto-fix #3 forward into +page.svelte (Video.description is z.string().optional() per Phase 2 schema D-06)"
    - "Two-literal-string class concat preserved (text-cat-pbs from categoryAccent('PBS American Portrait')) — Tailwind v4 scanner reads source text; computed class names would be elided"

key-files:
  created:
    - .planning/phases/05-pbs-american-portrait/05-02-SUMMARY.md (this file)
  modified:
    - src/lib/components/TopNav.svelte (+11 lines — special-cased PBS href ternary + extended isActive() with slug-guarded /pbs-american-portrait/ suffix-match)
    - src/lib/components/TopNav.test.ts (+5/-3 lines — updated line-78 PBS href assertion + locked /work/reel for non-PBS regression; flipped Phase 5 describe.skip → describe)
    - src/routes/pbs-american-portrait/+page.ts (+6/-6 lines — replaced empty Video[] stub with real getByCategory + D-18 sort; dropped pbsBlurb)
    - src/routes/pbs-american-portrait/+page.svelte (+71/-9 lines — full editorial layout: h1/subtitle/blockquote/attribution/outbound/h2/grid + per-card badges; verbatim Candidate C inline)
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.ts (+9/-5 lines — replaced null-returning stub with COLLECTION_URL + TRAILING_PUNCT regex pair)
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts (3 describe.skip → describe)
    - src/routes/pbs-american-portrait/page.test.ts (3 describe.skip → describe)
    - src/routes/work/[category]/+page.svelte (+10 lines — base import + ESLint disable; conditional D-04 cross-link block after h1 before grid)
    - src/routes/work/[category]/page.test.ts (1 describe.skip → describe)
    - src/routes/watch/[id]/+page.svelte (+8 lines — conditional D-05 cross-link block inside metadata div after description before rail close; base import already present)
    - src/routes/watch/[id]/page.test.ts (1 describe.skip → describe)

key-decisions:
  - "Coalesce video.description ?? '' at +page.svelte helper call sites (mirrors Plan 05-01 SUMMARY auto-fix #3 for _pbsCollectionUrl.test.ts) — Video.description is z.string().optional() per Phase 2 schema D-06; pbsCollectionUrl signature takes string; coalesce at call site keeps helper untouched and consistent across test + production code"
  - "TopNav href ternary in {@const} block — keeps Tailwind v4 scanner happy (no class concat) and follows the Phase 4 D-13 navClass two-literals pattern verbatim; rendered href is fully static per branch"
  - "Slug-guarded /pbs-american-portrait/ suffix-match in isActive() — explicit slug === 'pbs-american-portrait' check before endsWith prevents future categories with similar suffix from false-positive highlighting"
  - "Verbatim Candidate C inserted as plain text between <blockquote>...</blockquote> (no curly-brace interpolation) — Svelte template literals interpret braces; this is static markup; the apostrophe characters in 'it's' need no escaping"

patterns-established:
  - "Cross-link conditional pattern: {#if data.category === 'X'} / {#if video.category === 'X'} guards inline anchor that points to flagship landing — reusable for any future per-category landing surface (Phase 6 Press)"
  - "TopNav flagship-landing pattern: ternary href + slug-guarded suffix-match in isActive() adds a flagship surface without touching the existing /work/<slug> contract; minimal blast radius (~11 lines), 5 new test assertions lock the behavior"

requirements-completed: [PBS-01, PBS-02, PBS-03]

# Metrics
duration: 5min
completed: 2026-05-12
---

# Phase 5 Plan 05-02: PBS American Portrait Flagship Landing Summary

**Built /pbs-american-portrait/ flagship landing page (h1+subtitle+verbatim PBS blockquote+outbound+18-card grid with 15 "See on PBS →" badges), retargeted TopNav PBS link with active-state highlighting on both flagship and /work/<slug> surfaces, and wired D-04+D-05 cross-links — completing PBS-01, PBS-02, PBS-03 by flipping all 9 Plan 05-01 describe.skip suites GREEN.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-12T19:35:59Z
- **Completed:** 2026-05-12T19:40:59Z
- **Tasks:** 3 (atomic implementation; autonomous, no checkpoints)
- **Files modified:** 11 (1 component + 5 route files + 1 SUMMARY)
- **Files created:** 1 (this SUMMARY)

## Accomplishments

- **PBS landing page shipped** — `/pbs-american-portrait/` renders the full Phase 5 editorial composition: D-08 h1 with `text-cat-pbs` accent, D-09 subtitle "18 stories produced by Michelle Ngo", D-10 verbatim Candidate C blockquote (301 chars) + attribution, D-12 outbound link to pbs.org/american-portrait, D-16 h2 "Stories", D-19 2/3/4 grid of 18 PBS cards in D-18 featured-first/date-desc order.
- **15/18 per-card "See on PBS →" badges** rendered via D-21 conditional; 3 audit-verified records (Year in Review 2020, Celebrity Message, Introducing PBS) correctly omit the badge.
- **TopNav D-02 retarget** — PBS category link special-cased to `/pbs-american-portrait/` (with trailing slash); other 7 categories unchanged at `/work/<slug>`.
- **TopNav D-03 active-state extension** — slug-guarded suffix-match in `isActive()` highlights `text-cat-pbs` on BOTH `/pbs-american-portrait/` AND `/work/pbs-american-portrait/`. Regression-locked: existing surface preserved, other 7 categories never highlight on the flagship route.
- **D-04 cross-link wired** — `/work/pbs-american-portrait/` renders inline `→ About the PBS American Portrait project` between h1 and grid; non-PBS categories don't (negative test green).
- **D-05 cross-link wired** — `/watch/[id]` for PBS-category videos renders the same inline cross-link below description; non-PBS videos don't (negative test green).
- **All 9 Plan 05-01 describe.skip suites flipped to describe** (one-rule rename per file) — 25 new assertions GREEN. Combined with existing tests: 126 tests passed (0 skipped, was 99 passed + 27 skipped at end of Plan 05-01).
- **Full validation green** — `pnpm test` 126/126, `pnpm check` 0/0, `pnpm lint` clean, `pnpm build` clean, `pnpm test:prerender` clean.
- **Both prerender artifacts present** — `build/pbs-american-portrait/index.html` (PBS-01) + `build/work/pbs-american-portrait/index.html` (PBS-03 parity preserved).

## Task Commits

Each task committed atomically with `--no-verify` (parallel-execution wave discipline):

1. **Task 1 — TopNav D-02 retarget + D-03 active-state extension:** `ad1b822` (feat)
   - `src/lib/components/TopNav.svelte`: ternary href + slug-guarded suffix-match in isActive()
   - `src/lib/components/TopNav.test.ts`: updated line-78 assertion + flipped Phase 5 describe.skip

2. **Task 2 — PBS landing page + helper + tests:** `1462e0a` (feat)
   - Replaced `_pbsCollectionUrl.ts` stub with real regex extractor
   - Replaced `+page.ts` stub with `getByCategory + toSorted` (D-18)
   - Replaced `+page.svelte` stub with full editorial layout + verbatim Candidate C
   - Flipped 6 describe.skip → describe (3 helper + 3 page suites)

3. **Task 3 — D-04 + D-05 cross-links:** `fc8f05e` (feat)
   - `/work/[category]/+page.svelte`: base import + conditional D-04 cross-link
   - `/watch/[id]/+page.svelte`: conditional D-05 cross-link inside metadata div
   - Flipped 2 describe.skip → describe (1 D-04 + 1 D-05)

## Verbatim PBS Copy Embedded

**Candidate C (Editorial, ~50 words, 2 sentences)** — exactly as locked in 05-01-PLAN.md `<approved>...</approved>` block, trimmed and embedded as plain text between `<blockquote>` and `</blockquote>` in `src/routes/pbs-american-portrait/+page.svelte`:

> Whether it's joy or sorrow, triumph or hardship, family traditions followed for decades or just the chaos of the morning school run, PBS American Portrait put together a picture of life as it's really lived. The show gives a glimpse into American life, and a chance for everyday Americans to be heard.

Confirmed byte-for-byte match against the `<approved>` source via the documented extraction protocol (STEP 0 script in Plan 05-02 Task 2). No quotation marks added, no edits, no paraphrasing.

## Validation Results

| Command | Exit | Notes |
| ------- | ---- | ----- |
| `pnpm test` | 0 | 126 tests passed across 14 files (0 skipped) — up from 99/27 after Plan 05-01 |
| `pnpm check` | 0 | 450 files, 0 errors, 0 warnings |
| `pnpm lint` | 0 | Clean |
| `pnpm build` | 0 | adapter-static, 70+ prerendered pages |
| `pnpm test:prerender` | 0 | All 4 threshold checks pass (work/, work/<slug>/x8, watch/<id>/x56, pbs-american-portrait/) |

**Skipped count: 0** (every describe.skip from Plan 05-01 is now describe + GREEN).

## Decisions Made

- **Coalesce `video.description ?? ''`** at `+page.svelte` helper call sites — carries Plan 05-01 SUMMARY auto-fix #3 pattern forward (Video.description is `z.string().optional()`); two call sites in `{#if}` + `href` need coalescing. Keeps the helper signature pure (`string`), matches the test file's already-coalesced approach.
- **Verbatim Candidate C inserted as plain text between `<blockquote>` tags** — apostrophes in "it's" pass through Svelte's text rendering safely; no need for HTML entities. Single paragraph with one space between two sentences (verbatim from `<approved>`).
- **TopNav ternary href via `{@const href = ...}`** — pre-computes the URL in the Svelte template scope before the `<a>` element; cleaner than inline ternary inside the `href` attribute, follows the same two-literal-strings discipline the navClass $derived uses (Plan 04-04 D-13 pattern).
- **Slug-guarded `endsWith('/pbs-american-portrait')` check** — explicit `slug === 'pbs-american-portrait'` guard before the endsWith ensures future categories whose slug ends in "-american-portrait" (unlikely but defensible) cannot false-positive into the flagship surface.

## Deviations from Plan

**None.** Plan 05-02 executed exactly as written. The plan's instructions were complete and self-consistent — the 5 documented auto-fixes from Plan 05-01 SUMMARY (Video[] over never[], description coalesce, PageData callLoad, etc.) had already been applied to the Wave 0 scaffolding, so the GREEN flip in Plan 05-02 was a one-rule rename + stub-body swap with zero additional fixups.

## Issues Encountered

None. All 3 tasks executed in a single pass with no test failures, no type errors, no lint warnings, no build issues, no prerender misses.

## Manual Smoke Checklist

The plan's smoke checklist is a `pnpm preview` operator step deferred to a human reviewer. Automated coverage already locks every assertion in the smoke list at the unit-test + build-artifact level:

| Smoke step | Automated proof |
| ---------- | --------------- |
| Click PBS in TopNav from `/` → URL is `/pbs-american-portrait/` | TopNav.test.ts D-02: `expect(pbsLink?.getAttribute('href')).toBe('/pbs-american-portrait/')` |
| h1 in cat-pbs color | page.test.ts: `expect(h1?.className).toMatch(/text-cat-pbs/)` |
| Subtitle visible | page.test.ts: `expect(subtitleP).toBeDefined()` (matches verbatim "18 stories produced by Michelle Ngo") |
| Blockquote present | page.test.ts: `expect((bq?.textContent?.trim().length ?? 0)).toBeGreaterThanOrEqual(20)` |
| Outbound opens in new tab | page.test.ts: `expect(outbound?.getAttribute('target')).toBe('_blank')` + `rel === 'noopener'` |
| h2 "Stories" + 18-card grid | page.test.ts: h2 textContent === 'Stories' + 18 anchors with href^="/watch/" |
| ≥15 "See on PBS →" badges | page.test.ts D-21: `expect(badges.length).toBe(15)` |
| TopNav PBS highlighted on `/pbs-american-portrait/` | TopNav.test.ts D-03: `expect(pbsLink?.className).toMatch(/text-cat-pbs/)` |
| TopNav PBS STILL highlighted on `/work/pbs-american-portrait/` | TopNav.test.ts D-03 regression: same assertion on /work/pbs-american-portrait/ URL |
| Cross-link on `/work/pbs-american-portrait/` | work/[category]/page.test.ts D-04: `expect(crossLink).not.toBeNull()` |
| Cross-link absent on non-PBS /work/<slug> | D-04 negative: `expect(crossLink).toBeNull()` on /work/reel |
| Cross-link on `/watch/[PBS-id]` | watch/[id]/page.test.ts D-05: `expect(crossLink).not.toBeNull()` |
| Cross-link absent on `/watch/[non-PBS-id]` | D-05 negative: `expect(crossLink).toBeNull()` on producerReelId |
| Cross-link returns to `/pbs-american-portrait/` | Both cross-link href asserts equal `/pbs-american-portrait/` (the round-trip target) |

Operator visual checks deferred to live `pnpm preview` (gradient legibility, mobile breakpoint sweep, scroll behavior on iOS Safari) — same residual visual-only scope as Phase 4 04-HUMAN-UAT.md.

## Requirements Completed

- **PBS-01** (PBS American Portrait flagship landing page) — `/pbs-american-portrait/` route exists, prerenders cleanly, reachable from TopNav D-02 link, h1+subtitle+blockquote+outbound+h2+18-card grid all asserted at structural+behavioral level.
- **PBS-02** (18 PBS cards on landing page) — D-18 sort applied (featured-first then date-desc), all 18 PBS videos render with VideoCard, 15 carry "See on PBS →" badges with correct collection URLs.
- **PBS-03** (Filter parity preserved + cross-links) — `/work/pbs-american-portrait/` still prerenders, still shows 18 cards, now carries D-04 cross-link above grid; `/watch/[id]` for PBS-category videos carries D-05 cross-link below description.

## Self-Check: PASSED

- `src/routes/pbs-american-portrait/+page.svelte` — FOUND (replaced stub with full layout)
- `src/routes/pbs-american-portrait/+page.ts` — FOUND (replaced stub with real load)
- `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` — FOUND (replaced stub with real regex)
- `src/lib/components/TopNav.svelte` — FOUND (ternary href + extended isActive)
- `src/routes/work/[category]/+page.svelte` — FOUND (D-04 cross-link added)
- `src/routes/watch/[id]/+page.svelte` — FOUND (D-05 cross-link added)
- `build/pbs-american-portrait/index.html` — FOUND (PBS-01 prerender artifact)
- `build/work/pbs-american-portrait/index.html` — FOUND (PBS-03 parity preserved)
- Task 1 commit `ad1b822` — FOUND in git log
- Task 2 commit `1462e0a` — FOUND in git log
- Task 3 commit `fc8f05e` — FOUND in git log
- Verbatim approved paragraph first 40 chars "Whether it's joy or sorrow, triumph or h" — FOUND in src/routes/pbs-american-portrait/+page.svelte
- `describe.skip` in any Phase 5 test file — 0 matches across TopNav.test.ts, pbs-american-portrait/page.test.ts, pbs-american-portrait/_pbsCollectionUrl.test.ts, work/[category]/page.test.ts, watch/[id]/page.test.ts

---
*Phase: 05-pbs-american-portrait*
*Completed: 2026-05-12*
