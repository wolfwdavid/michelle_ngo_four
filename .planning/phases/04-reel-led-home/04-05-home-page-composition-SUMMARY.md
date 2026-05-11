---
phase: 04-reel-led-home
plan: 05
subsystem: ui
tags: [sveltekit, svelte5, page-load, lcp-composition, video-card, featured-slice, prerender, page-data]

# Dependency graph
requires:
  - phase: 02-data-layer
    provides: $lib/data videos export + Video shape (id, featured, published, etc.); .toSorted compare contract
  - phase: 03-grid-filter-watch
    provides: /work/+page.ts featured-first + published-desc load pattern; /work/+page.svelte grid markup (max-w-7xl + grid-cols-2/3/4 + gap-2/3); VideoCard component with `eager` prop; +layout.ts trailingSlash='always' + prerender=true; /work/page.test.ts callLoad narrowing pattern
  - phase: 04-reel-led-home plan 01
    provides: src/routes/page.test.ts 3 describe.skip suites (HERO-01 renders hero, D-22/D-24 8 featured cards, D-28 View All Work link) + lazy loadPage()/loadPageData() helpers — this plan flips skips and replaces helpers with static imports
  - phase: 04-reel-led-home plan 02
    provides: <HeroPoster /> propless component (h1 + img + PLAY REEL + #hero-sentinel) — imported and rendered at top of /+page.svelte
  - phase: 04-reel-led-home plan 03
    provides: 8 rows in videos.json with featured===true — the slice this loader filters to
  - phase: 04-reel-led-home plan 04
    provides: scroll-aware <TopNav /> live on / via #hero-sentinel — observable end-to-end once the page mounts
provides:
  - src/routes/+page.ts (featured-slice loader: videos.filter(v=>v.featured).toSorted(published desc))
  - src/routes/+page.svelte (HeroPoster + 8 VideoCard grid with eager={true} + View All Work overflow link; Phase 1 splash retired entirely per D-15)
  - src/routes/page.test.ts GREEN (3 describe blocks, all passing; zero describe.skip; static imports replace lazy helpers; callLoad helper narrowed via PageData)
  - prerendered build/index.html with hero asset reference, 8 featured-card anchors, PLAY REEL anchor (264677021), View All Work anchor — HERO-01/02/03 observable end-to-end
affects: [05-press-about-contact, 07-polish-perf-uat]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "PageData-narrowed callLoad helper for tests that mount the Page component: import { load } from './+page' returns SvelteKit's widened Partial<...>&Record<string,any> shape; mount(Page, { props: { data } }) needs strict PageData (videos required, fully typed). Helper narrows `result as PageData` via `import type { PageData } from './$types'`. Carries the Phase 3 /work/page.test.ts callLoad pattern forward to the Phase 4 page.test.ts mount-the-page case."
    - "Featured-slice loader pattern (mirrors /work/+page.ts): videos.filter(v => v.featured).toSorted((a,b) => b.published.localeCompare(a.published)) — readonly source array never mutated; .toSorted returns a new array. Featured-first comparator from /work collapses to a single published-desc sort when EVERY row in the slice is featured (all 8 in the Phase 4 case)."

key-files:
  created:
    - "src/routes/+page.ts"
  modified:
    - "src/routes/+page.svelte"
    - "src/routes/page.test.ts"

key-decisions:
  - "callLoad() helper returns Promise<PageData> (not Promise<{videos:unknown[]}>): plan literal cast was structurally correct only at the load-result type level, but its product fed into mount(Page, {props:{data}}) — Page's data prop is fully-typed PageData (videos: Video[]). Cast as PageData makes the mount call type-check. Same shape as /work/page.test.ts callLoad (Phase 3 03-02 carry-forward) plus a stricter return type to satisfy the mount-the-page constraint."
  - "<title>Michelle Ngo — Filmmaker &amp; Producer</title> in +page.svelte <svelte:head> overrides the +layout.svelte default title for the home route only: signals the role to search/social sharing without forcing every other route to carry a duplicate Filmmaker & Producer suffix. Matches the /work +page.svelte pattern (`Michelle Ngo — Work`)."
  - "eager={true} as literal boolean attribute on every VideoCard, NOT i<8 — Phase 3 /work uses i<8 to keep the first row of 56 eager. Phase 4 home has exactly 8 cards; i<8 is always true but explicit `true` says 'all 8 of these are intentionally above the fold' in source. Plan acceptance criteria pin this literal."

patterns-established:
  - "Home composition layering: <HeroPoster /> renders fullbleed at top → <section> grid below → <a> overflow link at bottom of section. No outer <main>, no section heading on the grid (D-27 sam-hendi-faithful — the hero IS the heading)."
  - "Loader-mirror-with-filter: when a new route consumes a subset of an existing route's data, mirror the existing loader's shape (so consuming markup stays identical) and insert one filter step. /work returns all-56; / returns featured-only. Same prop name (data.videos), same iteration markup, different data shape only at the count + ordering level."

requirements-completed: ["HERO-01", "HERO-02", "HERO-03"]

# Metrics
duration: 6 min
completed: 2026-05-11
---

# Phase 4 Plan 5: Home Page Composition Summary

**Reel-led home is live: `/` ships HeroPoster + 8-card featured grid (eager={true}) + View All Work overflow link, all prerendered in `build/index.html`; Phase 1 splash retired entirely; page.test.ts 3 stubs flipped GREEN — Phase 4 implementation-complete (HERO-01/02/03 observable end-to-end).**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-11T21:12:19Z
- **Completed:** 2026-05-11T21:18:26Z
- **Tasks:** 1 (autonomous, single-task plan)
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- `src/routes/+page.ts` (NEW) — featured-slice loader mirrors /work/+page.ts pattern with one filter step inserted: `videos.filter(v => v.featured).toSorted((a,b) => b.published.localeCompare(a.published))`. Inherits prerender=true from +layout.ts. Returns the 8 featured videos sorted newest-first.
- `src/routes/+page.svelte` (REPLACED ENTIRELY — D-15) — Phase 1 splash retired; new composition: `<svelte:head>` page title override + `<HeroPoster />` at top + 8-card featured grid in `<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">` with verbatim `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">` from /work (D-25), every `<VideoCard {video} eager={true} />` (D-22 — all 8 above-the-fold once scrolled to), and `<a href={`${base}/work`} data-sveltekit-preload-data="hover" class="block text-center mt-8 text-sm tracking-widest uppercase hover:underline">View All Work →</a>` overflow link (D-28).
- `src/routes/page.test.ts` (FLIPPED GREEN) — 3 `describe.skip` → `describe` (zero skips remain in this file); lazy `loadPage()` + `loadPageData()` helpers deleted; static `import Page from './+page.svelte'` + `import { load } from './+page'` + `import type { PageData } from './$types'` added at top; introduced `callLoad()` helper returning `Promise<PageData>` so `mount(Page, { props: { data } })` type-checks against the component's strict `data` prop.
- Full project gates green: `pnpm test` → 99 passed + 0 skipped (was 96+3 in Plan 04-04 — delta is 3 passing from this plan's stub flips); `pnpm check` → 0 errors / 0 warnings across 443 files; `pnpm build` → 6.61s; `pnpm test:prerender` → PASS (work/index.html present, 8 work/<slug>/index.html, 56 watch/<id>/index.html).
- `build/index.html` (prerendered home) verified to contain: `hero-poster.DGi2El4g.webp` (content-hashed asset URL, 2 occurrences = `<link rel=preload>` + `<img src>` — Plan 04-02 Note resolved: the asset NOW hashes + emits to `build/_app/immutable/assets/` because Plan 04-05 wired `<HeroPoster />` into the bundle); `./watch/264677021` PLAY REEL anchor (HERO-03); 8 `./watch/<id>` anchors inside the `<ul>` (D-22/D-24); `View All Work →` anchor with `data-sveltekit-preload-data="hover"` pointing at `./work` (D-28).

## Task Commits

Each task was committed atomically:

1. **Task 1: Create +page.ts (featured loader) + replace +page.svelte (hero + grid + View All) + flip page.test.ts to green** — `f935370` (feat)

**Plan metadata:** pending (docs commit for SUMMARY + STATE + ROADMAP + REQUIREMENTS)

## Files Created/Modified

- `src/routes/+page.ts` (created, 19 lines) — featured-slice loader for the home route. Imports `videos` from `$lib/data`, exports `load: PageLoad` returning `{ videos: videos.filter((v) => v.featured).toSorted((a, b) => b.published.localeCompare(a.published)) }`. No `prerender = true` (inherits from `+layout.ts`).
- `src/routes/+page.svelte` (modified, 6 → 46 lines) — Phase 1 splash (`<main>`+`<h1>Michelle Ngo</h1>`+`<p>Filmmaker. Site coming soon.</p>`) replaced ENTIRELY per D-15. New composition: `/* eslint-disable svelte/no-navigation-without-resolve */` (matches HeroPoster, VideoCard, CategoryTag); imports `PageData` type, `base` from `$app/paths`, `HeroPoster`, `VideoCard`; `let { data }: { data: PageData } = $props()`; `<svelte:head>` page title override; `<HeroPoster />` render; `<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">` with `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">` iterating `data.videos` keyed by `video.id` and emitting `<VideoCard {video} eager={true} />` per item; closing `<a href={`${base}/work`} data-sveltekit-preload-data="hover" class="block text-center mt-8 text-sm tracking-widest uppercase hover:underline">View All Work →</a>`.
- `src/routes/page.test.ts` (modified, 93 → 86 lines) — flipped 3 `describe.skip` → `describe`; deleted the 18-line lazy `loadPage()` + `loadPageData()` block; added top-level static `import Page from './+page.svelte'`, `import { load } from './+page'`, `import type { PageData } from './$types'`; added `callLoad()` helper (8 lines) returning `Promise<PageData>` via `result as PageData`; each test body now calls `const data = await callLoad();` then `mount(Page, { target: makeHost(), props: { data } });`. The 3 test assertions (h1+img present, exactly 8 `<ul>>li>a` anchors, View All anchor with `/work` href + hover prefetch) unchanged.

## Decisions Made

- **`callLoad()` returns `Promise<PageData>` (not `Promise<{ videos: unknown[] }>`)** — see Deviations §1. Plan literal cast was correct at the load-result level but mismatched the mount-the-page constraint that `/work/page.test.ts` doesn't have (that file calls `load(event)` and asserts on its return; it never mounts the page). The `PageData`-typed helper makes `mount(Page, { props: { data } })` type-check against the component's declared `data: PageData` prop without any cast at the mount site.
- **`<svelte:head><title>Michelle Ngo — Filmmaker &amp; Producer</title></svelte:head>` in the page (not the layout)** — overrides the layout's default `<title>Michelle Ngo</title>` for the home route only; signals role + skill to OG/Twitter sharing for the public-facing landing page. Mirrors `/work/+page.svelte`'s `<title>Michelle Ngo — Work</title>` per-route override pattern.
- **`eager={true}` literal boolean (not `i < 8`)** — Phase 3 /work uses `eager={i < 8}` because /work renders 56 cards (only first 8 above the fold). Phase 4 home renders 8 cards total; `i < 8` is always true here but the explicit `true` documents intent ("all 8 of these are intentionally above the fold") in source. Plan acceptance criterion pinned this literal.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan literal `(load as () => Promise<{ videos: unknown[] }>)()` typed `data` as `{ videos: unknown[] }`, which fails `mount(Page, { props: { data } })` strict-prop type check — Page's `data` prop is fully-typed PageData (videos: Video[]), not unknown[]**

- **Found during:** Task 1 verification (`pnpm check`)
- **Issue:** Three identical errors at page.test.ts lines 43/53/64 (the three `mount(Page, ...)` calls): `Type '{ videos: unknown[]; }' is not assignable to type '{ videos: ({ id: string; title: string; uploader: string; ... 7 more ...; credits?: { ...; } | undefined; } | { ...; })[]; }'. Types of property 'videos' are incompatible. Type 'unknown[]' is not assignable to type '...'`. The plan's literal cast was structurally correct only at the load-result type level (any test that just asserts on `data.videos.length` would have compiled), but its downstream consumer was `mount(Page, { props: { data } })` which requires `data: PageData` strictly (Page's `let { data }: { data: PageData } = $props()` widens nothing). Why this didn't surface in Phase 3's /work/page.test.ts: that file calls `load(event)` and asserts on the *return value*; it never mounts the page, so the strict prop-shape constraint never engages. Phase 4's page.test.ts is the first route test in the codebase that BOTH (a) calls `load` AND (b) mounts the page — so the mismatch surfaces here for the first time.
- **Fix:** Replaced the inline cast with a small `callLoad()` helper that returns `Promise<PageData>`. Imported `PageData` from `./$types`. Helper does `const result = await load(event); if (!result) throw ...; return result as PageData;`. Each test body now calls `const data = await callLoad();`. Identical idiom to Phase 3's `/work/page.test.ts callLoad` (carry-forward), just with a stricter return type to satisfy the mount-the-page constraint.
- **Files modified:** `src/routes/page.test.ts` (+13 lines: import PageData + 7-line callLoad helper + comment block; −1 line: removed inline cast at 3 sites, replaced by `await callLoad()`; net +13 lines but cleaner with helper extraction)
- **Verification:** `pnpm check` → 0 errors / 0 warnings (was 3 errors / 0 warnings); `pnpm vitest run src/routes/page.test.ts` → 3 passed; `pnpm test` → 99 passed (delta +3 over Plan 04-04's 96).
- **Committed in:** `f935370` (Task 1 commit, same commit as the production-code edits)

---

**Total deviations:** 1 auto-fixed (Rule 1 - plan literal cast incompatible with mount-the-page prop typing)
**Impact on plan:** Mechanical fix that lifts a pattern (`callLoad` narrowing helper) already established in Phase 3's `/work/page.test.ts`. Zero scope creep — every other acceptance criterion (literal-grep checks for `<HeroPoster`, `eager={true}`, the verbatim /work grid classes, `View All Work →`, `data-sveltekit-preload-data="hover"`, the D-28 View All classes, the absence of `Site coming soon` and `<h2>Featured`, `import Page from './+page.svelte'`, `import { load } from './+page'`, zero `describe.skip`) passed first run; the 3 page.test.ts targeted `-t` tests + the full `pnpm test` suite + `pnpm build` + `pnpm test:prerender` all green on first run after the fix.

## Issues Encountered

None beyond the deviation above — every other gate passed first try (initial `pnpm vitest run src/routes/page.test.ts` was green even before the `pnpm check` fix because at runtime the cast is erased — only the type-check pass surfaces the issue).

## Known Stubs

None. The 3 page.test.ts test suites that Plan 04-01 left as `describe.skip` are now flipped to live `describe` blocks and all 3 tests pass. With this plan landing, ALL Phase 4 Wave 0 stubs are converted to live tests:

- Plan 04-01 HeroPoster.test.ts stubs → flipped GREEN in Plan 04-02
- Plan 04-01 videos.test.ts Phase 4 featured suite → flipped GREEN in Plan 04-03
- Plan 04-01 TopNav.test.ts Phase 4 D-13/D-14 suites → flipped GREEN in Plan 04-04
- Plan 04-01 page.test.ts stubs → flipped GREEN in this plan (04-05)

The full project has zero `describe.skip` references in any test file as of this commit (verified via `git grep "describe.skip" -- '*.test.ts'` returning empty).

No production-code stubs. No hardcoded empty defaults flowing to the UI (`data.videos` is the live 8-row featured slice; the View All link points at the live `/work` route; the hero asset is content-hashed and emitted to `build/_app/immutable/assets/`).

## User Setup Required

None — pure source-code composition; no env vars, no external service, no dashboard work.

## Next Phase Readiness

- **Phase 4 implementation-complete.** All 3 phase requirements (HERO-01 full-bleed hero, HERO-02 name + tagline above the fold, HERO-03 PLAY REEL → /watch/264677021) are observable end-to-end in the prerendered `build/index.html`. The next orchestrator step is `/gsd:verify-work` (verifier-pass on Phase 4) followed by UAT (manual cross-route sweep + visual gradient/legibility + mobile dvh check per 04-VALIDATION.md `manual-only` verifications block).
- **UAT readiness contract:** the four cross-route + visual checks deferred per `<verification>` block 6 of the plan all have programmable preconditions met:
  - hero fills viewport on `/` (`<HeroPoster>` uses `min-h-dvh` — Phase 2)
  - TopNav flips transparent → solid via the scroll-aware `$effect` only on `/` (Plan 04-04 GREEN)
  - PLAY REEL anchor's href is base-path-safe `./watch/264677021` (verified in build/index.html)
  - View All Work anchor's href is base-path-safe `./work` (verified in build/index.html)
- **No coupling regressions:** all 99 tests across data + ui + route layers green; svelte-check 0 errors / 0 warnings across 443 files. The `/work` route, the 8 `/work/[category]` routes, and all 56 `/watch/[id]` routes prerender to their existing thresholds (1 + 8 + 56 = 65 directory-form HTML files).
- **Next phase (05-press-about-contact):** unblocked. The /press, /about, /contact placeholder routes (Phase 3 D-43) inherit the now-solid-on-non-home TopNav and an empty page body waiting for real content. No data-loader changes needed at this layer.

## Self-Check: PASSED

Verified after writing this SUMMARY:

- File `src/routes/+page.ts` exists (19 lines; contains literal `videos.filter((v) => v.featured)`, `.toSorted(`, `b.published.localeCompare(a.published)`, `import type { PageLoad } from './$types'`, `import { videos } from '$lib/data'`)
- File `src/routes/+page.svelte` exists (modified; contains literal `<HeroPoster`, `import HeroPoster from '$lib/components/HeroPoster.svelte'`, `import VideoCard from '$lib/components/VideoCard.svelte'`, `eager={true}`, `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3`, `max-w-7xl px-4 sm:px-6 lg:px-8 py-8`, `View All Work →`, `data-sveltekit-preload-data="hover"`, `block text-center mt-8 text-sm tracking-widest uppercase hover:underline`; does NOT contain `Site coming soon` or `<h2>Featured`)
- File `src/routes/page.test.ts` modified (contains literal `import Page from './+page.svelte'`, `import { load } from './+page'`, `import type { PageData } from './$types'`, `callLoad`; zero `describe.skip` occurrences)
- Task commit present in `git log --oneline`: `f935370`
- `pnpm vitest run src/routes/page.test.ts` exits 0 (3 passed, 0 failed, 0 skipped)
- `pnpm test` exits 0 (99 passed, 0 skipped — was 96+3 in Plan 04-04; the 3 newly-flipped page.test.ts tests are the delta)
- `pnpm check` exits 0 (443 files, 0 errors, 0 warnings)
- `pnpm build` exits 0 (6.61s build time)
- `pnpm test:prerender` exits 0 (build/work/index.html present; 8 build/work/<slug>/index.html; 56 build/watch/<id>/index.html)
- `build/index.html` exists and contains: `hero-poster.DGi2El4g.webp` (content-hashed asset URL, 2 occurrences = preload `<link>` + hero `<img>`), `./watch/264677021` PLAY REEL anchor (1 occurrence), `./watch/` 9 occurrences total (1 PLAY REEL + 8 featured cards), `View All Work` text (1 occurrence) — all HERO-01/02/03 evidence captured in the prerendered HTML

---
*Phase: 04-reel-led-home*
*Completed: 2026-05-11*
