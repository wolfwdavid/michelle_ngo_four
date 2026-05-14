---
phase: 07-polish-production-cutover
plan: 01
subsystem: ui
tags: [contact, deferral, v1.0-launch, post-launch-backlog]

# Dependency graph
requires:
  - phase: 06-press-about-contact
    provides: ContactBlock.svelte single-source-of-truth + 06-HUMAN-UAT.md Test 1 tracking entry
provides:
  - v1.0 launch acceptance for channel-homepage IMDb + LinkedIn URLs (cutover unblocked)
  - Post-v1.0 backlog item for personalized profile URL swap (single-line edit each)
  - Documented user decision (defer-with-fallback, 2026-05-13) in source NOTE + STATE.md + 06-HUMAN-UAT.md
affects: [07-05-production-cutover (now unblocked on this front), post-v1.0-backlog (new entry)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deferral-as-outcome: a decision checkpoint can resolve via 'do nothing + document' when the underlying business need is parked, not solved. The PLAN is complete (deferral IS the outcome) even though the originating UAT item stays deferred."

key-files:
  created:
    - .planning/phases/07-polish-production-cutover/07-01-imdb-linkedin-swap-SUMMARY.md
  modified:
    - src/lib/components/ContactBlock.svelte (NOTE comment block reworded — URL literals UNCHANGED)
    - .planning/phases/06-press-about-contact/06-HUMAN-UAT.md (Test 1 annotated accepted-deferred)
    - .planning/STATE.md (Blockers/Concerns entry rewritten — pre-cutover blocker resolved by deferral)

key-decisions:
  - "User selected defer-with-fallback at Plan 07-01 Task 1 decision checkpoint (2026-05-13): personalized IMDb + LinkedIn profile URLs not materializable in time for the cutover window; channel homepages (https://www.imdb.com/, https://www.linkedin.com/) ship at v1.0 launch as accepted state. Cutover is UNBLOCKED."
  - "Deferral documented in three places to maintain trail: (1) source NOTE block in ContactBlock.svelte for future devs, (2) STATE.md Blockers/Concerns rewritten to reflect 'cutover unblocked + post-v1.0 backlog item', (3) 06-HUMAN-UAT.md Test 1 annotated accepted-deferred (NOT passed) with cross-references."
  - "Plan status terminal state = accepted-deferred, NOT passed. The Plan IS complete at the workflow level (the deferral decision IS its outcome) but the underlying business need (real personalized URLs) remains parked. Marking 'passed' would falsely imply the URL swap shipped — verifier would catch the mismatch against ContactBlock.svelte source."

patterns-established:
  - "Decision checkpoint with three options where one option is 'defer with documented fallback': The defer option must explicitly call out (a) what stays as-is, (b) where the deferral is recorded, (c) what backlog item it produces, and (d) what unblocks (cutover, in this case). Pattern reusable for any pre-launch blocker that turns out to be a soft-gate."
  - "PLAN-complete vs UAT-resolved are distinct outcomes: a PLAN can be 'complete' (all tasks resolved per their type) while the originating UAT item stays 'deferred' (not 'passed'). SUMMARY status field reflects PLAN outcome; 06-HUMAN-UAT.md result field reflects UAT outcome. Don't conflate them."

requirements-completed: []  # FOUND-03 was listed in PLAN frontmatter but is the perf+cutover umbrella requirement owned across plans 07-02..07-05. This plan's deferral does NOT close FOUND-03 — that closes when 07-05 delivers the production build. Leaving as [] to keep traceability honest.

# Metrics
duration: 5 min
completed: 2026-05-14
status: accepted-deferred
---

# Phase 7 Plan 01: IMDb/LinkedIn Swap Summary

**Pre-cutover blocker resolved by user deferral decision: channel-homepage IMDb + LinkedIn URLs accepted at v1.0 launch; personalized URL swap moves to post-v1.0 backlog. Cutover unblocked.**

## Performance

- **Duration:** ~5 min (continuation agent — fresh context after decision checkpoint)
- **Started:** 2026-05-14T11:08:00Z (continuation context)
- **Completed:** 2026-05-14T11:11:00Z
- **Tasks:** 1 of 2 resolved (Task 1 = decision checkpoint resolved as defer-with-fallback; Task 2 NOT executed by design — deferral means the URL edit doesn't happen)
- **Files modified:** 3 (1 source comment-only edit + 2 planning artifacts)

## Accomplishments

- **Decision captured and ratified:** User selected `defer-with-fallback` at Task 1 decision checkpoint (2026-05-13). Channel homepages stay; personalized URLs move to post-v1.0 backlog.
- **Source documentation aligned:** NOTE comment block at the top of `src/lib/components/ContactBlock.svelte` rewritten from "pre-production swap required" to "v1.0 launch acceptance per Phase 7 Plan 07-01 (2026-05-13)" with explicit backlog pointer for the future personalized-URL swap.
- **STATE.md Blockers/Concerns reconciled:** Pre-cutover blocker entry replaced with "v1.0 launch accepted with channel-homepage fallbacks ... Cutover unblocked. Backlog item: ..." — accurately reflects post-decision project state.
- **06-HUMAN-UAT.md Test 1 annotated:** Result changed from `[pending]` to `accepted-v1.0 (deferred — NOT passed)` with full resolution narrative + backlog pointer + cross-references to STATE.md and this SUMMARY. Status field flipped from `partial` to `accepted-deferred`.
- **No regressions:** `pnpm check` (svelte-check, 461 files) exits 0; `pnpm vitest run src/lib/components/ContactBlock.test.ts` exits 0 (8/8 tests pass — domain-contains assertions are still satisfied because URLs are unchanged).
- **Cutover ungated:** Plan 07-05 (production cutover) can now proceed without waiting for the URL swap. D-05 pre-cutover blocker checklist row 1+2 (IMDb + LinkedIn) flips from RED to GREEN-deferred.

## Task Commits

1. **Task 1: Collect Michelle's personalized IMDb + LinkedIn URLs from user (decision checkpoint)** — resolved as `defer-with-fallback` on 2026-05-13. No code commit (decision-only task).
2. **Task 2: Edit IMDB_URL + LINKEDIN_URL literals + remove NOTE comment** — NOT executed by design. The deferral means the URL edit doesn't happen at v1.0 launch. Replaced with comment-only documentation update (NOTE reworded to reflect v1.0 acceptance instead of pre-cutover swap requirement).

**Documentation/annotation atomic commit:** `9ced2e0` (docs(07-01): defer IMDb/LinkedIn personalized URL swap to post-v1.0)

**Plan metadata commit:** _pending — final SUMMARY + STATE + ROADMAP + REQUIREMENTS commit follows this self-check_

## Files Created/Modified

- `src/lib/components/ContactBlock.svelte` — NOTE comment block reworded from "pre-production swap required" to "v1.0 launch acceptance per Phase 7 Plan 07-01 (2026-05-13)"; inline approval-comment on the IMDB_URL line reworded to point at the new NOTE; URL literals UNCHANGED (the deferral means they stay as channel homepages)
- `.planning/phases/06-press-about-contact/06-HUMAN-UAT.md` — Test 1 result flipped from `[pending]` to `accepted-v1.0 (deferred — NOT passed)`; new `resolution:` and `backlog:` fields added; status frontmatter flipped from `partial` to `accepted-deferred`; Summary table updated (deferred: 1)
- `.planning/STATE.md` — Blockers/Concerns entry rewritten to reflect deferral decision; cutover-unblocked status; post-v1.0 backlog item retained
- `.planning/phases/07-polish-production-cutover/07-01-imdb-linkedin-swap-SUMMARY.md` — this file

## Decisions Made

See `key-decisions:` in frontmatter. The pivotal decision is the user's `defer-with-fallback` selection at Task 1 checkpoint, which means the entire mechanical work of Task 2 (URL literal edits) is replaced with documentation-only updates that reflect the deferral.

## Deviations from Plan

None at the workflow level — the plan's Task 1 was a decision checkpoint with `defer-with-fallback` as one of the three documented options, and the user selected it. The plan SUCCESSFULLY routed to that branch.

The execution variance vs the plan's "happy path" (Task 2 swaps the literals) is the documented `defer-with-fallback` outcome, NOT a deviation:

- **Task 2 was NOT executed:** by design — `defer-with-fallback` means the literal swap doesn't happen at v1.0. The plan's `<options>` block in Task 1 explicitly enumerated this as an acceptable outcome.
- **Documentation-only changes shipped instead:** NOTE comment reworded, STATE.md Blockers/Concerns rewritten, 06-HUMAN-UAT.md Test 1 annotated. All three were necessary to keep the trail accurate post-decision (otherwise the codebase would silently disagree with itself).

## Authentication Gates

None.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Follow-ups / Backlog

**Post-v1.0 backlog item (NEW):** Swap `IMDB_URL` + `LINKEDIN_URL` constants in `src/lib/components/ContactBlock.svelte` to personalized profile URLs of the shape:
- IMDb: `https://www.imdb.com/name/nm{NUMERIC_ID}/`
- LinkedIn: `https://www.linkedin.com/in/{HANDLE}/`

**Effort:** Single-line edit per URL. **Test impact:** None — existing assertions are domain-contains checks (`toContain('imdb.com')`, `toContain('linkedin.com')`) and pass automatically as long as the new URLs still contain those substrings. **When materializable:** When Michelle provides the personalized URLs (no current ETA — was the original gating condition).

**Source pointer for the future dev:** the NOTE comment block at the top of `src/lib/components/ContactBlock.svelte` documents this exact backlog item with the URL shapes inline.

## Next Phase Readiness

**Plan 07-02 (production-metadata) ready to start.** Pre-cutover blocker queue:
- D-05 row 1 (IMDb personalized URL): GREEN-deferred (this plan)
- D-05 row 2 (LinkedIn personalized URL): GREEN-deferred (this plan)
- D-05 remaining rows (favicon set, OG/Twitter cards, JSON-LD, sitemap, responsive QA, LCP gate, cutover): owned by Plans 07-02 → 07-05

The cutover (Plan 07-05) is UNBLOCKED on the IMDb/LinkedIn dimension. Producers landing on michellengo.net at v1.0 launch will see channel homepages for IMDb + LinkedIn — accepted as a v1.0 state per user decision.

---
*Phase: 07-polish-production-cutover*
*Completed: 2026-05-14*
*Status: accepted-deferred (PLAN complete; underlying URL swap parked to post-v1.0 backlog)*

## Self-Check: PASSED

- FOUND: `.planning/phases/07-polish-production-cutover/07-01-imdb-linkedin-swap-SUMMARY.md` (this file)
- FOUND: `src/lib/components/ContactBlock.svelte` (NOTE block reworded; URL literals unchanged)
- FOUND: `.planning/phases/06-press-about-contact/06-HUMAN-UAT.md` (Test 1 annotated accepted-deferred)
- FOUND: `.planning/STATE.md` (Blockers/Concerns rewritten + decision recorded + plan advanced 1→2)
- FOUND: commit `9ced2e0` (docs(07-01): defer IMDb/LinkedIn personalized URL swap to post-v1.0)
- VERIFIED: `pnpm check` exits 0 (461 files, 0 errors, 0 warnings)
- VERIFIED: `pnpm vitest run src/lib/components/ContactBlock.test.ts` exits 0 (8/8 tests pass)
