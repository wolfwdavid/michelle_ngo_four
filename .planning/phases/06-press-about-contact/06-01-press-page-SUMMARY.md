---
phase: 06-press-about-contact
plan: 01
subsystem: press-route
tags: [press, route, helper, prerender, tdd]
dependency_graph:
  requires:
    - $lib/data (videos array, Video type from Phase 2)
    - src/routes/+layout.ts (prerender=true + trailingSlash='always' from Phase 3)
    - $app/paths base (Phase 1 BASE_PATH wrapping)
  provides:
    - src/routes/press/_pressCredits.ts (getPressCredits, PressGroup)
    - src/routes/press/+page.ts (PageLoad returning { groups })
    - src/routes/press/+page.svelte (real broadcast-credits page)
    - build/press/index.html (prerendered)
  affects:
    - scripts/test-prerender-coverage.mjs (now requires build/press/index.html)
    - Phase 6 Plan 06-03 Footer (consumes /press route URL contract)
tech_stack:
  added: []
  patterns:
    - "route-local underscore-prefixed pure helper (Phase 5 _pbsCollectionUrl.ts shape)"
    - "PageData-narrowed callLoad() in route tests (Phase 4 D-05 pattern)"
    - "vi.hoisted() $app/state + $app/paths mocking before Page import"
    - "TDD RED then GREEN with separate commits"
key_files:
  created:
    - src/routes/press/_pressCredits.ts
    - src/routes/press/_pressCredits.test.ts
    - src/routes/press/+page.ts
    - src/routes/press/page.test.ts
  modified:
    - src/routes/press/+page.svelte
    - scripts/test-prerender-coverage.mjs
decisions:
  - "Locked prestige order (D-10) verbatim from PLAN.md checkpoint: HBO Max → HBO → PBS → ABC News → U2 → Amazon News → Music Box Films → Monument Releasing → Cargo Film & Releasing → AZPM → HBODocs → GrasshalmClips → Lenny Cooke (Movie)"
  - "Helper test lives under src/routes/** so it belongs to the vitest 'ui' (jsdom) project per vite.config.ts include glob — the helper is pure so DOM isolation is harmless; keeps test co-located with helper per Phase 5 D-21 pattern"
  - "PRESTIGE_ORDER iteration + defensive insertion-order fallback for unknown uploaders: if a future videos.json row carries a new uploader, the helper appends it at end (no crash, no silent drop)"
metrics:
  duration: "5m"
  completed: "2026-05-12T21:43:00Z"
  tasks: 2
  files_created: 4
  files_modified: 2
  loc_added: 325
  tests_added: 11
  total_tests_passing: 138
---

# Phase 6 Plan 01: Press Page Summary

Replaced the Phase 3 D-43 `/press` placeholder with a real broadcast-credits page derived from videos.json — pure route-local helper (filter + group + prestige-order), thin +page.ts load, D-12 page composition, and an extended prerender coverage script.

## Locked Prestige Order (Post-Checkpoint)

The plan's checkpoint asked for user approval on the section ordering. The plan committed at `3761cf0` carried the recommended order verbatim, which the executor used:

| Rank | Network (uploader verbatim)     | Credits |
| ---- | ------------------------------- | ------- |
| 1    | HBO Max                         | 1       |
| 2    | HBO                             | 1       |
| 3    | PBS                             | 1       |
| 4    | ABC News                        | 1       |
| 5    | U2                              | 1       |
| 6    | Amazon News                     | 1       |
| 7    | Music Box Films                 | 1       |
| 8    | Monument Releasing              | 1       |
| 9    | Cargo Film & Releasing          | 1       |
| 10   | AZPM                            | 1       |
| 11   | HBODocs                         | 1       |
| 12   | GrasshalmClips                  | 1       |
| 13   | Lenny Cooke (Movie)             | 1       |

Audit confirmed at execution time: `videos.filter(v => v.uploader !== 'Michelle Ngo')` returns exactly 13 records across 13 distinct uploaders — every group has exactly 1 credit today.

## Files

### Created

| File                                         | LOC | Purpose                                                              |
| -------------------------------------------- | --- | -------------------------------------------------------------------- |
| `src/routes/press/_pressCredits.ts`          | 78  | Pure helper: filter !Michelle, group by uploader, prestige-order     |
| `src/routes/press/_pressCredits.test.ts`     | 67  | Unit tests: 6 cases covering grouping, ordering, invariants          |
| `src/routes/press/+page.ts`                  | 13  | PageLoad calling getPressCredits() → `{ groups }`                    |
| `src/routes/press/page.test.ts`              | 115 | Route test: load + render assertions (h1, sections, anchors, D-14)   |

### Modified

| File                                       | Change                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/routes/press/+page.svelte`            | Replaced Phase 3 D-43 "Coming soon." placeholder with real iteration markup     |
| `scripts/test-prerender-coverage.mjs`     | Added build/press/index.html check + PASS log line + FAIL summary inclusion     |

## Commits

| Hash      | Type    | Summary                                                          |
| --------- | ------- | ---------------------------------------------------------------- |
| `8f764f2` | test    | Add failing test for press credit helper (Task 1 RED)            |
| `16fbe14` | feat    | Implement press credit helper (Task 1 GREEN)                     |
| `addbd80` | test    | Add failing route test for /press page (Task 2 RED)              |
| `7a7d103` | feat    | Build /press page + extend prerender coverage (Task 2 GREEN)     |

## Verification Results

- `pnpm test -- --project=ui --run src/routes/press` → **16 files, 138 tests, 0 failed**
- `pnpm check` → **0 errors, 0 warnings** (455 files)
- `pnpm build` → **succeeds**; emits `build/press/index.html`
- `node scripts/test-prerender-coverage.mjs` → **PASS** (1 work + 8 work/slug + 56 watch/id + pbs-american-portrait + press)
- `git diff --stat package.json pnpm-lock.yaml` → **no changes** (no new deps)

## Deviations from Plan

None — plan executed exactly as written. The checkpoint approval was the prestige order locked in PLAN.md, and the planner's recommended ordering was carried verbatim into both the helper and its tests.

## Downstream Contract for Plan 06-03 (Footer)

- The `/press` route is reachable at `${base}/press/` (trailing slash inherits from layout's `trailingSlash='always'`)
- Build emits `build/press/index.html` — prerender coverage script now enforces this
- Footer column 3 secondary nav can wire `${base}/press/` with hover prefetch and Phase 3 D-08 inline-link style verbatim
- No TopNav changes; Phase 5 D-17 scroll-aware-on-`/`-only contract is preserved

## Self-Check: PASSED

**Files verified:**
- `src/routes/press/_pressCredits.ts` — FOUND
- `src/routes/press/_pressCredits.test.ts` — FOUND
- `src/routes/press/+page.ts` — FOUND
- `src/routes/press/+page.svelte` — FOUND (replaced placeholder)
- `src/routes/press/page.test.ts` — FOUND
- `scripts/test-prerender-coverage.mjs` — FOUND (modified)
- `build/press/index.html` — FOUND (prerendered)

**Commits verified:**
- `8f764f2` — FOUND
- `16fbe14` — FOUND
- `addbd80` — FOUND
- `7a7d103` — FOUND
