---
phase: 04-reel-led-home
plan: 03
subsystem: data
tags: [videos-json, featured-flag, zod, vitest, curation, d-23, d-24, d-26]

# Dependency graph
requires:
  - phase: 02-data-layer
    provides: src/lib/data/videos.json (56 records) + Zod schema accepting featured:boolean.default(false) (D-08) + Vite validateVideosPlugin (D-15 re-validates on every build)
  - phase: 04-reel-led-home (plan 04-01)
    provides: src/lib/data/videos.test.ts Phase 4 featured slice describe.skip block (3 it() bodies asserting 8 featured, includes producerReelId in Reel, exact category quota)
provides:
  - src/lib/data/videos.json with exactly 8 rows carrying "featured": true (cross-category sampler per D-23)
  - videos.filter(v => v.featured) returns the curated 8 for /+page.ts (plan 04-05) to render below the hero
  - src/lib/data/videos.test.ts Phase 4 featured slice suite ACTIVE (no skips remaining) — CI now locks the quota + reel-inclusion contract
affects: [04-05-home-page-composition]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Featured flag placed inline after \"category\" in each curated row (consistent diff-friendly position; no \"featured\": false on the other 48 rows per Phase 2 D-08 contract — loader materializes defaults at runtime)"
    - "Single curated source of truth: 04-RESEARCH.md §Featured Slice Curation is the canonical 8-pick table; PLAN surfaces it verbatim at a human-verify gate; downstream tests assert the resulting shape (count + quota + reel-id)"

key-files:
  created: []
  modified:
    - "src/lib/data/videos.json (8 rows gained \"featured\": true)"
    - "src/lib/data/videos.test.ts (describe.skip -> describe on Phase 4 featured slice block)"

key-decisions:
  - "Placed \"featured\": true after \"category\" in every flipped row (not at object tail) — keeps the curation flag adjacent to its semantic neighbor (category) and groups all D-23 quota-bearing fields together for visual review"
  - "Did NOT inline \"featured\": false on the unflipped 48 rows — Phase 2 D-08 contract is binding; Zod default materializes at parse time, and the alternative would add 96+ lines of zero-info JSON noise + drift risk"

patterns-established:
  - "Curation human-gate + verbatim flip: Task 1 surfaces the RESEARCH curation table; user approves; Task 2 mechanically flips JSON + unskips the test that locks the shape. Pattern usable for any future single-source curation (PBS context picks, press credits ordering, etc.)"

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-05-11
---

# Phase 4 Plan 3: Featured Slice Flips Summary

**8 curated `videos.json` rows now carry `"featured": true` (2 PBS / 2 Promos / 2 Branded / 1 Doc / 1 Reel — Pitfall 8 reel-id included) and the videos.test.ts Phase 4 featured-slice suite is active in CI.**

## Performance

- **Duration:** 3 min (executor wall time on continuation; ~10 min including the prior human-verify checkpoint cycle)
- **Started:** 2026-05-11T20:57:38Z
- **Completed:** 2026-05-11T21:00:44Z
- **Tasks:** 2 (Task 1 user-gated curation flip + Task 2 test unskip)
- **Files modified:** 2 (`src/lib/data/videos.json`, `src/lib/data/videos.test.ts`)

## Accomplishments

- Exactly 8 rows in `src/lib/data/videos.json` now carry `"featured": true`; zero rows carry `"featured": false` (Phase 2 D-08 contract preserved)
- The 8 picks honor D-23 quota verbatim: PBS x2 (1023002503, 1007027015), Promos & Trailers x2 (fvCB4gg7yS0 HBO Max, T7VG52035Z4 U2 Sphere), Branded Content x2 (770860055 Amazon, 244851084 Verizon/Xbox), Documentary / Short Film x1 (264509512), Reel x1 (264677021 = producerReelId — Pitfall 8 lock)
- `src/lib/data/videos.test.ts` Phase 4 featured slice suite (D-23 / D-24 / D-26) flipped from `describe.skip` to `describe`; 3 tests now GREEN in CI lock the contract (`8 featured`, `featured includes reel`, `featured quota`)
- Zod plugin re-validates the edited JSON on every `pnpm build` (D-24 — build green); `pnpm test` 88 passed | 11 skipped (zero failures); `pnpm check` 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: User-gated curation review + flip "featured": true on 8 rows** — `335f2fb` (feat)
2. **Task 2: Flip describe.skip -> describe on videos.test.ts Phase 4 featured slice block** — `78e1028` (test)

**Plan metadata:** pending (docs commit for SUMMARY + STATE + ROADMAP)

_Note: Task 1 in the plan was a `checkpoint:human-verify` gate (surface the curated 8-pick table for approval — no file edits). User approved all 8 picks as listed in 04-RESEARCH.md §Featured Slice Curation. The continuation agent then executed the mechanical JSON flip as the deliverable of Task 1, followed by the test-unskip as Task 2._

## Files Created/Modified

- `src/lib/data/videos.json` (modified) — added `"featured": true` after `"category"` on the 8 approved rows:
  - line 51: 244851084 (Verizon Fios - Xbox / Branded Content)
  - line 102: 770860055 (Asians at Amazon Food Talks / Branded Content)
  - line 155: 264509512 (Animal Art - Fly by Night / Documentary / Short Film)
  - line 453: 1007027015 (Introducing PBS American Portrait / PBS American Portrait)
  - line 467: 1023002503 (PBS American Portrait - Hispanic Heritage Month / PBS American Portrait)
  - line 621: T7VG52035Z4 (U2:UV Achtung Baby Live At Sphere Trailer / Promos & Trailers)
  - line 644: fvCB4gg7yS0 (Billy Joel HBO Max Trailer / Promos & Trailers)
  - line 693: 264677021 (Michelle Ngo Producer's Reel / Reel — Pitfall 8 reel-id)
- `src/lib/data/videos.test.ts` (modified) — one-character delta: `describe.skip(` -> `describe(` on line 113's Phase 4 featured slice block; 3 it() bodies unchanged

## Decisions Made

- **`"featured": true` placed inline after `"category"`** — diff-friendly position keeps the curation flag adjacent to its semantic neighbor (the same row's category determines whether it satisfies a D-23 slot). Tail-of-object placement would visually separate two load-bearing fields and obscure the quota reading during human review of the JSON.
- **Zero `"featured": false` entries on the other 48 rows** — Phase 2 D-08 contract (see STATE.md Phase 2 decisions): `featured: z.boolean().default(false)` materializes at `.parse()` time in the loader; inlining defaults would add ~96 lines of zero-info JSON noise + drift risk if the default ever changed. Plan acceptance criterion `grep -c '"featured": false' == 0` enforces this contract directly.

## Deviations from Plan

None - plan executed exactly as written.

(Task 1's pre-edit verification of the 8 ids against `videos.json` shape was performed by the prior executor before surfacing the table; all 8 ids matched their asserted source + category + published date, so the continuation agent flipped the bits unchanged. No swaps, no redo cycle.)

## Issues Encountered

None. The 8 Edit calls applied cleanly; `pnpm build` validated the edited JSON via the Zod plugin; `pnpm test` and `pnpm check` both exited 0 on first run after the test unskip.

## Known Stubs

None remaining from this plan. The Phase 4 featured slice describe.skip block was the last skip in `videos.test.ts` (verified: `grep -c "describe.skip" src/lib/data/videos.test.ts` returns 0).

Plans 04-04 (TopNav scroll-aware) and 04-05 (home page composition) still have their respective describe.skip stubs in `TopNav.test.ts` and `page.test.ts` per Plan 04-01's contract — those are intentional and consumed by the next two plans in the wave.

## User Setup Required

None — pure data + test edits; no env vars, no external services, no dashboard configuration.

## Next Phase Readiness

- **Plan 04-05 unblocked on the data side:** `videos.filter(v => v.featured).length === 8` is now true; the new home page's `+page.ts` can call this filter unchanged and receive the curated 8
- **Pitfall 8 contract locked in CI:** if a future plan accidentally flips an extra row to `featured: true`, or removes the reel id from the slice, the `featured includes reel` + `8 featured` tests will fail loudly
- **D-25 published-desc sort still owned by Plan 04-05's `+page.ts`** — this plan only flips bits; it does not assert order. The display-order test for the home grid lives in `page.test.ts` (consumed by Plan 04-05)

## Self-Check: PASSED

Verified after writing this SUMMARY:

- File `src/lib/data/videos.json` modified — 8 `"featured": true` entries confirmed via grep (count = 8); 0 `"featured": false` entries confirmed
- File `src/lib/data/videos.test.ts` modified — `describe.skip` count = 0 in the file
- Task 1 commit `335f2fb` present in `git log --oneline` (feat: flip featured=true on 8 curated videos.json rows)
- Task 2 commit `78e1028` present in `git log --oneline` (test: flip Phase 4 featured slice suite from skip to active)
- `pnpm test` exits 0 (88 passed | 11 skipped)
- `pnpm check` exits 0 (0 errors / 0 warnings)
- `pnpm build` exits 0 (Zod plugin re-validates edited JSON cleanly)
- `pnpm vitest run src/lib/data/videos.test.ts -t "8 featured"` — 1 passed
- `pnpm vitest run src/lib/data/videos.test.ts -t "featured includes reel"` — 1 passed
- `pnpm vitest run src/lib/data/videos.test.ts -t "featured quota"` — 1 passed

---
*Phase: 04-reel-led-home*
*Completed: 2026-05-11*
