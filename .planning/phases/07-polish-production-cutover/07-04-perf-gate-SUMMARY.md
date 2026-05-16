---
phase: 07-polish-production-cutover
plan: 04
subsystem: perf
tags: [lighthouse, lcp, perf-budget, deferral, post-launch-telemetry, v1.0-launch]

# Dependency graph
requires:
  - phase: 04-reel-led-home
    provides: HeroPoster.svelte D-04..D-07 contract (15.4KB WebP + preload + fetchpriority=high + loading=eager) + 04-HUMAN-UAT reel-load smoke test
  - phase: 07-polish-production-cutover
    provides: Plans 07-01/07-02/07-03 established Phase 7 pragmatic-deferral pattern (defer-with-fallback, fast-path acceptance)
provides:
  - v1.0 launch acceptance for FOUND-03 perf budget without synthetic Slow-4G Lighthouse measurement
  - Structured-deferral payload (07-LIGHTHOUSE.json) documenting the deferral rationale, fallback evidence, and post-launch reopen trigger
  - Post-v1.0 backlog item: monitor production LCP via real-user telemetry; reopen FOUND-03 if LCP > 2.0s on /
  - Plan 07-05 (production cutover) unblocked on the perf-gate dimension
affects: [07-05-production-cutover (now unblocked on this front), post-v1.0-backlog (monitor real-user LCP)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Structured-deferral JSON payload: a planning artifact (07-LIGHTHOUSE.json) that documents the deferral instead of containing the measurement. Mirrors Plan 07-01's three-place documentation pattern (source + STATE + UAT) but uses a JSON file at the artifact's expected path so downstream verifier doesn't 404 on the path."
    - "Post-launch real-user metrics > synthetic pre-launch simulation when the production telemetry channel exists (or will exist) and the budget is intact at the source-code level. Phase 4 D-04..D-07 contract preserved -> trust the budget; measure for real once michellengo.net is live."

key-files:
  created:
    - .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json (structured-deferral payload — status: accepted-deferred)
    - .planning/phases/07-polish-production-cutover/07-04-perf-gate-SUMMARY.md
  modified:
    - .planning/STATE.md (FOUND-03 reconciliation + new post-launch monitoring concern)
    - .planning/REQUIREMENTS.md (FOUND-03 status reconciled: Complete -> Accepted-Deferred)
    - .planning/ROADMAP.md (Plan 07-04 marked complete)

key-decisions:
  - "User selected defer-to-post-launch (Option A — fast-path defer) at Plan 07-04 Task 1 decision checkpoint (2026-05-16): skip Lighthouse mobile + Slow-4G synthetic audit for v1.0; trust the existing perf budget (Phase 4 D-04..D-07: 15.4KB WebP hero + preload + fetchpriority=high + loading=eager) and Phase 4 reel-load UAT smoke test. Real perf signal comes from production telemetry post-DNS-swap."
  - "Plan status terminal state = accepted-deferred (NOT passed). The Plan IS complete at the workflow level (the deferral decision IS its outcome) but FOUND-03's literal success criterion ('user sees production build under 2s on 4G') is parked to post-launch real-user measurement, not satisfied by a synthetic-audit pass. Marking 'passed' would falsely imply a 4G LCP measurement happened."
  - "FOUND-03 reconciliation in REQUIREMENTS.md + STATE.md: previously implicitly marked Complete via 07-02 chain progression; corrected to accepted-deferred (passes-by-deferral, not by measurement). Plan 07-05 cutover can still proceed — the deferral itself unblocks it. Post-launch trigger: real-user LCP > 2.0s on / reopens FOUND-03 and applies D-08 escalation."
  - "Source code UNCHANGED. No AVIF asset authored. No <picture> markup added. No mobile portrait crop. No featured-grid eager={true} drop. D-08 escalation is parked; will trigger ONLY if production real-user metrics demand it."

patterns-established:
  - "Pragmatic-deferral chain across a phase: when consecutive plans (07-01 IMDb URLs / 07-02 placeholder assets / 07-03 fast-path QA acceptance / 07-04 perf gate) all reach defer-with-fallback resolutions, the pattern is itself precedent and the next defer is the highest-confidence option. The bar for switching to measure-now is whether the underlying budget is intact at the source level (here: Phase 4 contract); if yes, defer; if no, re-checkpoint."
  - "Verifier-safe deferral artifact shape: when a plan's expected artifact (path: 07-LIGHTHOUSE.json) is committed via deferral instead of measurement, the artifact file MUST still exist at the expected path so downstream verifier doesn't 404. The content shape signals deferral (status field) instead of measurement (audits/results fields). Acceptance criteria in PLAN.md (grep for largest-contentful-paint) become out-of-scope by deferral and are not in scope to satisfy verbatim — the SUMMARY decisions section is the binding contract."

requirements-completed: []  # FOUND-03 was listed in PLAN frontmatter but is NOT closed by this plan. The deferral parks FOUND-03 to post-launch real-user measurement; marking it complete here would conflict with the accepted-deferred status. Leaving as [] for traceability honesty. REQUIREMENTS.md FOUND-03 status reconciled to accepted-deferred separately.

# Metrics
duration: ~10 min
completed: 2026-05-16
status: accepted-deferred
---

# Phase 7 Plan 04: Perf Gate Summary

**Lighthouse mobile + Slow-4G synthetic audit deferred to post-launch real-user telemetry per user decision (2026-05-16). FOUND-03 perf budget intact at source (Phase 4 D-04..D-07: 15.4KB WebP hero + preload + fetchpriority=high + loading=eager); measured signal comes from production after DNS swap.**

## Performance

- **Duration:** ~10 min (continuation agent — fresh context after Task 1 decision checkpoint)
- **Started:** 2026-05-16T14:55:42Z (continuation context)
- **Completed:** 2026-05-16T15:05:00Z (approx)
- **Tasks:** 1 of 4 resolved (Task 1 = decision checkpoint resolved as defer-to-post-launch; Tasks 2-4 no-op-by-deferral)
- **Files modified:** 4 (1 planning artifact created + 3 planning artifacts reconciled — zero source code changes)

## Accomplishments

- **Decision captured and ratified:** User selected `defer-to-post-launch` (Option A — fast-path defer) at Task 1 decision checkpoint (2026-05-16). Synthetic Lighthouse audit deferred; production real-user telemetry will be the measured signal.
- **Phase 4 contract verified intact:** Pre-flight check confirmed HeroPoster.svelte preserves the Phase 4 D-04..D-07 budget verbatim (`<link rel="preload" as="image" href={heroPoster} fetchpriority="high" />` in `<svelte:head>`; `<img loading="eager" fetchpriority="high" />` on the hero element; hero-poster.webp = 15,386 bytes = 15.4 KB). Deferral premise validated — the budget is still defended at the source level.
- **Structured-deferral payload committed:** `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` created with `status: accepted-deferred` + `decision_date: 2026-05-16` + `rationale` + `fallback_evidence` (Phase 4 UAT + hero asset + preload/fetchpriority/eager attestation) + `post_launch_trigger` (reopen FOUND-03 if real-user LCP > 2.0s on /; apply D-08 escalation order). Lives at the path the plan's `must_haves.artifacts` expected, so downstream verifier doesn't 404 — the file shape signals deferral instead of measurement.
- **No source code changes:** Zero edits to `src/lib/components/HeroPoster.svelte`, zero new `src/lib/assets/hero-poster.avif`, zero edits to `src/routes/+page.svelte`. D-08 escalation (a)→(b)→(c) is parked; will trigger only if production real-user metrics demand it.
- **FOUND-03 status reconciled:** Previously implicitly carried as Complete in REQUIREMENTS.md traceability table after the 07-02 chain progression; corrected to `accepted-deferred` (passes-by-deferral, not by measurement) to match the v1.0 launch reality. STATE.md gets a new post-launch monitoring concern entry; the cutover is NOT blocked by the deferral — it's enabled by it.
- **Plan 07-05 (cutover) unblocked on the perf dimension:** D-05 pre-cutover blocker checklist row "Lighthouse-CI LCP gate passing" flips from RED to GREEN-deferred. Cutover can proceed.

## Task Commits

Each task was committed atomically (or marked no-op-by-deferral):

1. **Task 1: Confirm Lighthouse target URL — staging or production-via-resolve? (decision checkpoint)** — resolved as `defer-to-post-launch` (Option A — fast-path defer) at the prior agent's checkpoint; this continuation agent recorded the deferral by creating the structured-deferral 07-LIGHTHOUSE.json. **Commit: `74a8a54`** (docs(07-04): defer Lighthouse perf gate to post-launch telemetry (v1.0 acceptance))
2. **Task 2: Run Lighthouse mobile audit against the 4 target URLs and commit the JSON report(s)** — NO-OP-BY-DEFERRAL. The user explicitly chose not to run the synthetic audit. No `npx lighthouse` invocation. No per-route JSON files. No measurements taken; `07-LIGHTHOUSE.json` `measurements_taken: []`.
3. **Task 3: Branch on Lighthouse / LCP result — pass-and-ship OR escalate per D-08 (decision checkpoint)** — NO-OP-BY-DEFERRAL. No `/` LCP value was measured (Task 2 was no-op'd); no branch decision to make. The D-08 escalation order is parked for post-launch.
4. **Task 4: Apply hero escalation per D-08 step order (CONDITIONAL — skip if Task 3 = pass-ship-as-is)** — NO-OP-BY-DEFERRAL. No measurement -> no escalation triggered. Zero source changes; HeroPoster.svelte, src/lib/assets/, and src/routes/+page.svelte untouched.

**Plan metadata commit:** _pending — final SUMMARY + STATE + ROADMAP + REQUIREMENTS commit follows this self-check_

## Files Created/Modified

- `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` (CREATED) — structured-deferral payload; not a real Lighthouse JSON. Contains: `status: accepted-deferred`, `decision_date: 2026-05-16`, `rationale`, `fallback_evidence` (pointers to Phase 4 UAT + hero asset + preload/fetchpriority/eager attestation), `post_launch_trigger` (reopen FOUND-03 + apply D-08 escalation if real-user LCP > 2.0s on /), `measurements_taken: []` (explicit empty array signals no synthetic audit was performed).
- `.planning/phases/07-polish-production-cutover/07-04-perf-gate-SUMMARY.md` — this file.
- `.planning/STATE.md` — Decisions section gets new entry for the 2026-05-16 perf-gate deferral decision. Blockers/Concerns section gets new entry for post-launch real-user LCP monitoring (NOT a launch blocker — a post-launch follow-up). Current Position advances from Plan 4 -> Plan 5 of 5.
- `.planning/REQUIREMENTS.md` — Traceability table row for FOUND-03 reconciled from `Complete` to `Accepted-Deferred` to match the v1.0 launch reality (passes-by-deferral, not by Lighthouse measurement).
- `.planning/ROADMAP.md` — Plan 07-04 marked complete in the Phase 7 plan list and progress row; status reflects the accepted-deferred outcome.

**Files NOT modified (deliberate — deferral means no source changes):**
- `src/lib/components/HeroPoster.svelte` — untouched. Phase 4 D-04..D-07 contract preserved verbatim (preload + fetchpriority=high + loading=eager).
- `src/lib/assets/hero-poster.webp` — untouched. 15,386 bytes (15.4 KB), unchanged from Phase 4.
- `src/lib/assets/hero-poster.avif` — NOT CREATED. D-08 step (a) escalation parked.
- `src/lib/assets/hero-poster-portrait.{webp,avif}` — NOT CREATED. D-08 step (b) escalation parked.
- `src/routes/+page.svelte` — untouched. Featured-grid `eager={true}` literal preserved (Plan 04-05 D-22). D-08 step (c) escalation parked.
- `package.json` / `pnpm-lock.yaml` — untouched. No `lighthouse` / `@lhci/cli` / `sharp` / new image-processing deps added (D-09 honored by construction — no escalation triggered).

## Decisions Made

See `key-decisions:` in frontmatter. The pivotal decision is the user's `defer-to-post-launch` selection at Task 1 checkpoint:

**Rationale chain:**
1. Phase 7 has established a pragmatic-deferral pattern across consecutive plans (07-01 IMDb personalized URLs / 07-02 placeholder favicon + OG assets / 07-03 fast-path QA acceptance). Plan 07-04 continues the pattern.
2. The Phase 4 perf budget is intact at the source code level (verified: HeroPoster.svelte preserves preload + fetchpriority=high + loading=eager; hero-poster.webp at 15.4 KB). The budget is the substantive defense of FOUND-03 — the Lighthouse audit would have measured whether the budget is sufficient on simulated Slow-4G; with the budget intact, the measurement gates whether ESCALATION is needed, not whether the budget exists.
3. Real-user LCP from production telemetry (Cloudflare Pages analytics or browser-native PerformanceObserver post-launch) provides higher-fidelity signal than synthetic Slow-4G simulation, at zero pre-launch cost.
4. If real-user data ever shows LCP > 2.0s on `/`, FOUND-03 reopens as a post-launch backlog task and D-08 escalation (AVIF → mobile portrait crop → drop eager) is applied then. The escalation order is locked in CONTEXT.md and 07-LIGHTHOUSE.json — no decision-relitigation cost at reopen time.
5. Cycle-time win: Plan 07-04 unblocks Plan 07-05 (cutover) immediately instead of holding for an audit + potential escalation loop pre-launch.

## Deviations from Plan

None at the workflow level — the plan's Task 1 was a decision checkpoint, and the user selected `defer-to-post-launch` (which was Option B = `defer-to-production` in the plan's literal `<options>` enumeration, generalized by the user to `defer-to-post-launch` = skip synthetic measurement entirely). The plan SUCCESSFULLY routed to a defer branch.

The execution variance vs the plan's "happy path" (Tasks 2-4 run Lighthouse + branch + possibly escalate) is the documented deferral outcome, NOT a deviation:

- **Tasks 2-4 NOT executed:** by design — `defer-to-post-launch` means no synthetic measurement is taken, so the branch + escalation tasks are no-op'd in cascade.
- **07-LIGHTHOUSE.json shipped as structured-deferral JSON instead of Lighthouse audit JSON:** documents the deferral at the path the plan's `must_haves.artifacts` expected. The file shape signals deferral (status field, measurements_taken: [], post_launch_trigger) instead of measurement (audits.* fields). PLAN.md verbatim acceptance criteria like `grep -c "largest-contentful-paint"` are out-of-scope by deferral and not satisfied; the SUMMARY decisions section is the binding contract for this plan's resolution.

## Authentication Gates

None.

## Issues Encountered

**Pre-existing state in REQUIREMENTS.md:** the traceability table had FOUND-03 marked as `Complete` (likely implicit progression after 07-02 chain). This was incorrect for the v1.0 launch reality — FOUND-03's literal success criterion ("user sees production build under 2s on 4G") had NOT been measured. Reconciled to `Accepted-Deferred` in this plan's metadata commit. STATE.md decision log + Blockers/Concerns also updated to reflect the actual state (not blocked, but pending real-user verification post-launch).

## User Setup Required

None — no external service configuration required by this plan.

**Post-launch (in scope for v1.0+1 / monitoring):** Set up a real-user LCP telemetry channel for `michellengo.net`. Options (all low-cost, no new JS deps unless Plausible v2 lands):
- Cloudflare Pages Analytics (built-in, no JS), OR
- Browser-native `PerformanceObserver` snippet in `+layout.svelte` reporting to a free endpoint (small JS addition; defer to v2 unless real-user data is needed urgently), OR
- One-off Lighthouse run from the user's machine against `https://michellengo.net/` after DNS propagates.

## Follow-ups / Backlog

**Post-launch backlog item (NEW):**
- **What:** Monitor production real-user LCP on `/` after DNS swap completes. If LCP > 2.0s observed in real-user telemetry, reopen FOUND-03.
- **How to trigger reopen:** Apply D-08 escalation order in sequence — (a) Add AVIF variant via `<picture>` + WebP fallback on `src/lib/components/HeroPoster.svelte`, (b) Add mobile portrait crop (`src/lib/assets/hero-poster-portrait.{webp,avif}` + media-query `<source>` in `<picture>`), (c) Drop `eager={true}` on featured-grid in `src/routes/+page.svelte`. Stop at first step that clears the 2.0s gate.
- **Source pointer:** `.planning/phases/07-polish-production-cutover/07-CONTEXT.md` D-08 has the escalation order locked; `07-LIGHTHOUSE.json` has the `post_launch_trigger` field documenting the reopen condition.
- **Effort estimate:** Step (a) AVIF only = 1–2 hours (author AVIF via `npx sharp` one-shot script + wrap `<img>` in `<picture>` + update tests' selectors). Step (b) portrait crop = +1 hour. Step (c) drop eager = single-character source edit.

**Post-launch backlog item (NEW — telemetry):**
- **What:** Pick a real-user perf telemetry channel for `michellengo.net`. Cloudflare Pages Analytics is the lowest-cost option (zero JS). Plausible (v2 per REQUIREMENTS.md ANLT-01/02) would also surface LCP if its custom-events plugin is wired.
- **Why:** The deferral decision RESTS on having a real-user signal post-launch. Without telemetry, the FOUND-03 reopen trigger has no source of truth.

## Next Phase Readiness

**Plan 07-05 (production-cutover) ready to start.** Pre-cutover D-05 blocker checklist:
- D-05 row 1 (IMDb personalized URL): GREEN-deferred (Plan 07-01)
- D-05 row 2 (LinkedIn personalized URL): GREEN-deferred (Plan 07-01)
- D-05 row 3 (All Phase 7 fix-list items resolved): GREEN (Plan 07-03 fast-path acceptance, 0 punch items)
- D-05 row 4 (Lighthouse-CI LCP gate passing): GREEN-deferred (THIS plan)
- D-05 row 5 (HTTPS cert provisioned on apex): owned by Plan 07-05
- D-05 row 6 (Tested apex URL with hosts-file override OR curl --resolve BEFORE flipping DNS): owned by Plan 07-05

Plan 07-05's remaining work (CNAME, BASE_PATH='' production workflow, GH Pages custom-domain config, curl --resolve pre-verification, noindex-removal + robots.txt open-policy atomic commit, DNS swap at registrar) is fully independent of the perf-gate deferral.

**Post-launch:** validate FOUND-03 LCP gate via production real-user telemetry. If LCP > 2.0s on `/`, reopen and apply D-08 escalation per the procedure documented above + in `07-LIGHTHOUSE.json` `post_launch_trigger`.

---
*Phase: 07-polish-production-cutover*
*Completed: 2026-05-16*
*Status: accepted-deferred (PLAN complete; FOUND-03 measurement parked to post-launch real-user telemetry)*

## Self-Check: PASSED

- FOUND: `.planning/phases/07-polish-production-cutover/07-04-perf-gate-SUMMARY.md` (this file)
- FOUND: `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` (structured-deferral payload — status: accepted-deferred)
- FOUND: commit `74a8a54` (docs(07-04): defer Lighthouse perf gate to post-launch telemetry (v1.0 acceptance))
- VERIFIED: `07-LIGHTHOUSE.json` parses as valid JSON (`node -e "JSON.parse(...)"` exits 0)
- VERIFIED: HeroPoster.svelte Phase 4 D-04..D-07 contract intact — `fetchpriority="high"` present (preload link + img), `loading="eager"` present (img), `rel="preload"` present (svelte:head + as=image)
- VERIFIED: `src/lib/assets/hero-poster.webp` = 15,386 bytes (15.4 KB, unchanged since 2026-05-11)
- VERIFIED: No source code modifications in this plan (zero edits to HeroPoster.svelte, hero-poster.webp, +page.svelte; no hero-poster.avif created)
