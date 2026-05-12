---
phase: 05-pbs-american-portrait
plan: 01
subsystem: testing
tags: [vitest, svelte5, sveltekit, tdd, wave-0, pbs, scaffolding]

# Dependency graph
requires:
  - phase: 03-grid-filter-watch
    provides: vitest workspace (ui project, jsdom env), mount()/flushSync() pattern, callLoad() narrow helper, scripts/test-prerender-coverage.mjs threshold script, /work/[category] + /watch/[id] route shape
  - phase: 04-reel-led-home
    provides: PageData-narrowed callLoad pattern, vi.hoisted + mockPage pattern, trailingSlash='always' inherited from src/routes/+layout.ts
provides:
  - User-approved verbatim PBS copy (Candidate C, editorial, ~50 words, 2 sentences) captured under <approved_pbs_copy> in 05-01-PLAN.md
  - Stub /pbs-american-portrait/ route (+page.ts returning empty Video[], +page.svelte rendering mount-safe minimal markup)
  - Stub pbsCollectionUrl helper (underscore-prefixed, returns null — real regex extraction lands in 05-02 Task 3)
  - 9 new RED-by-skip describe.skip blocks across 5 new + 3 modified test files
  - scripts/test-prerender-coverage.mjs extended to assert build/pbs-american-portrait/index.html present
  - Build artifact build/pbs-american-portrait/index.html prerenders cleanly from the stub
affects: [05-02 (flips .skip to describe, swaps stub bodies for real implementations)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave 0 scaffolding pattern carried forward from Phase 2 + Phase 3 + Phase 4: production stubs return type-correct empty values so describe.skip test bodies type-check under svelte-check without runtime execution"
    - "PageData-narrowed callLoad helper (extends Phase 4 Plan 04-05 pattern) — required whenever a test BOTH calls load() AND mounts the Page (mount needs strict Category enum)"
    - "vi.hoisted + vi.mock pattern with file-distinct mockPage* identifiers (mockPageW, mockPageWk) to avoid worker-scope collision across route test files"
    - "Underscore-prefixed helpers in route directories (_pbsCollectionUrl.ts) — SvelteKit route analyzer ignores _* files so helper + its test colocate beside +page.ts without breaking route detection"

key-files:
  created:
    - src/routes/pbs-american-portrait/+page.ts (stub load, Video[] return type)
    - src/routes/pbs-american-portrait/+page.svelte (stub component, mount-safe markup)
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.ts (stub helper, returns null)
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts (3 describe.skip suites — 15 positive / 3 null / 5 edge)
    - src/routes/pbs-american-portrait/page.test.ts (3 describe.skip suites — load/render/badges)
    - .planning/phases/05-pbs-american-portrait/05-01-SUMMARY.md (this file)
  modified:
    - .planning/phases/05-pbs-american-portrait/05-01-PLAN.md (insert <approved>...</approved> with verbatim Candidate C; entity-escape doc-comment example tags so Task 1 verify regex matches the real <approved> element)
    - src/lib/components/TopNav.test.ts (append 'Phase 5 PBS retarget + active-state extension' describe.skip with 5 assertions)
    - src/routes/watch/[id]/page.test.ts (hoist mount/Page/vi.mock imports to TOP of file; append 'Phase 5 D-05 PBS cross-link' describe.skip with 2 assertions)
    - src/routes/work/[category]/page.test.ts (hoist mount/Page/vi.mock imports to TOP of file; widen callLoad return to PageData; append 'Phase 5 D-04 PBS cross-link' describe.skip with 2 assertions)
    - scripts/test-prerender-coverage.mjs (add build/pbs-american-portrait/index.html threshold check — failures.push + success log line + FAIL diagnostic extension)

key-decisions:
  - "Selected Candidate C (Editorial, ~50 words, 2 sentences) at Task 1 checkpoint — most blockquote-worthy, complements the <h2>Stories</h2> heading semantically"
  - "Type +page.ts stub videos as Video[] (not the planner-literal never[]) so test bodies iterating result.videos[i].published type-check under svelte-check even when describe.skip prevents runtime execution"
  - "Coalesce v.description ?? '' in helper-test stubs since Video.description is z.string().optional() per Phase 2 schema D-06 — the helper signature takes string, so the coalesce keeps the GREEN flip a one-rule rename (.skip -> describe) without separate plumbing changes"
  - "Widen work/[category]/page.test.ts callLoad return from {category:string,videos:Video[]} to PageData — required so the new D-04 mount tests can pass data to mount(Page,{props:{data}}) without prop-type mismatch (mount needs the strict Category enum literal). Existing tests still pass because Category is assignable to string."
  - "Entity-escape <approved>...</approved> example tags inside the planner instruction comment so the Task 1 verify regex (non-greedy first-match) captures the REAL approved element, not the placeholder example. Without this, the regex captured '...' (3 chars) and failed the length-bounded check."

patterns-established:
  - "Production stubs MUST match the future-GREEN return shape at the TYPE level (Video[] vs never[]). svelte-check runs over every file including describe.skip bodies — broken types in stubs propagate to pnpm check failures even though tests never run."
  - "Whenever a Phase X test BOTH calls load() AND mounts Page, callLoad MUST return PageData (from './$types'), not a hand-narrowed subset. Hand-narrowed widens strict enum types (Category) to string and breaks mount prop matching."
  - "vi.hoisted mockPage IDENTIFIERS MUST be unique across vitest worker scope (mockPage in TopNav, mockPageW in watch/[id], mockPageWk in work/[category], mockPage in pbs-american-portrait/page.test). Same vi.hoisted name across files compiles fine but creates cross-suite mutation risk if Vitest pools files in the same worker."

requirements-completed: [PBS-02]

# Metrics
duration: 9min
completed: 2026-05-12
---

# Phase 5 Plan 05-01: PBS American Portrait — Verbatim Copy Lock + Wave 0 Scaffold Summary

**User-approved verbatim PBS copy (Candidate C editorial) captured inline + 9 RED-by-skip describe.skip blocks committed across 5 new and 3 modified test files; build/pbs-american-portrait/index.html prerenders cleanly from the stub route.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-05-12T19:21:18Z
- **Completed:** 2026-05-12T19:31:15Z
- **Tasks:** 3 (1 user-gated decision + 2 atomic implementation)
- **Files created:** 6 (5 production+test stubs + this SUMMARY)
- **Files modified:** 5 (PLAN.md + 3 existing test files + prerender script)

## Accomplishments

- **User locked Candidate C verbatim** — 301-char editorial paragraph ("Whether it's joy or sorrow, triumph or hardship, family traditions...") inserted as `<approved>...</approved>` under `<approved_pbs_copy>` in 05-01-PLAN.md. Plan 05-02 Task 2 reads it verbatim and embeds it inline in +page.svelte.
- **Wave 0 test contract fully captured as RED-by-skip stubs** — 9 new describe.skip blocks across 5 new + 3 modified test files. Plan 05-02 flips `.skip` → `describe` one-rule per file and turns each one GREEN.
- **/pbs-american-portrait/ route stub prerenders** — `build/pbs-american-portrait/index.html` exists after `pnpm build`; scripts/test-prerender-coverage.mjs extended check passes.
- **Zero behavior change for existing surface** — `pnpm test` exit 0 (99 passed, 27 skipped — was 18 before this plan), `pnpm check` exit 0, `pnpm lint` exit 0, `pnpm build` exit 0, `pnpm test:prerender` exit 0.

## Task Commits

Each task was committed atomically with `--no-verify` (parallel-execution wave discipline):

1. **Task 1: User locks verbatim PBS copy** — `5186062` (docs)
   - Insert `<approved>...</approved>` element under `<approved_pbs_copy>` in 05-01-PLAN.md
   - Entity-escape doc-comment example tags so Task 1 verify regex matches real element (Rule 1)

2. **Task 2: Scaffold PBS route stubs + Wave 0 test scaffolding** — `e2b8a24` (feat)
   - 5 new files: +page.ts, +page.svelte, _pbsCollectionUrl.ts, _pbsCollectionUrl.test.ts, page.test.ts
   - All test stubs RED-by-skip; production stubs export the symbols tests import

3. **Task 3: Extend existing test files + extend prerender script** — `5bf1933` (test)
   - 3 modified test files (TopNav, watch/[id], work/[category]) + scripts/test-prerender-coverage.mjs

## New Test Stub Inventory (for Plan 05-02 GREEN flip)

| File | Existing describe blocks | NEW describe.skip blocks (this plan) | Total assertions in new blocks |
| ---- | ------------------------ | ------------------------------------ | ------------------------------ |
| `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` | 0 | 3 (15-positive / 3-null / 5-edge) | 8 |
| `src/routes/pbs-american-portrait/page.test.ts` | 0 | 3 (load / render / badges) | 8 |
| `src/lib/components/TopNav.test.ts` | 4 (unchanged) | 1 ('Phase 5 PBS retarget + active-state extension') | 5 |
| `src/routes/watch/[id]/page.test.ts` | 3 (unchanged) | 1 ('Phase 5 D-05 PBS cross-link') | 2 |
| `src/routes/work/[category]/page.test.ts` | 2 (unchanged) | 1 ('Phase 5 D-04 PBS cross-link') | 2 |
| **TOTAL** | — | **9 new describe.skip blocks** | **25 new assertions** |

## Files Created/Modified

**Created:**
- `src/routes/pbs-american-portrait/+page.ts` (19 lines) — stub `load: PageLoad = () => ({ videos: [] as Video[], pbsBlurb: '' })`
- `src/routes/pbs-american-portrait/+page.svelte` (15 lines) — minimal `<section><p>...</p></section>` so mount() doesn't crash
- `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` (12 lines) — `export function pbsCollectionUrl(description: string): string | null { return null; }`
- `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` (69 lines) — 3 describe.skip suites
- `src/routes/pbs-american-portrait/page.test.ts` (128 lines) — 3 describe.skip suites with PageData-narrowed callLoad helper
- `.planning/phases/05-pbs-american-portrait/05-01-SUMMARY.md` — this file

**Modified:**
- `.planning/phases/05-pbs-american-portrait/05-01-PLAN.md` — Candidate C inserted inside `<approved>...</approved>`; doc-comment example tags entity-escaped (Rule 1 fix)
- `src/lib/components/TopNav.test.ts` — +58 lines (5 new assertions in 1 describe.skip block)
- `src/routes/watch/[id]/page.test.ts` — +59 lines (2 new assertions in 1 describe.skip block; mount/Page/vi imports hoisted to top)
- `src/routes/work/[category]/page.test.ts` — +69 -11 lines (2 new assertions in 1 describe.skip block; mount/Page/vi imports hoisted to top; callLoad return widened to PageData)
- `scripts/test-prerender-coverage.mjs` — +15 lines (PBS landing index.html threshold)

## Approved PBS Copy (Candidate C — first 100 chars)

> Whether it's joy or sorrow, triumph or hardship, family traditions followed for decades or just the c...

Full paragraph (301 chars verbatim) lives inside `<approved>...</approved>` in 05-01-PLAN.md and is referenced by Plan 05-02 Task 2.

## Decisions Made

- **Candidate C (Editorial) selected** by user at Task 1 checkpoint. Planner-recommended default; reads as a blockquote, complements the `<h2>Stories</h2>` heading semantically, lands the editorial-minimal aesthetic.
- **Type stubs match future-GREEN shape**, not narrowest-possible (Video[] over never[], PageData over hand-narrowed subset) — svelte-check still validates describe.skip bodies, so stub types must let them type-check.
- **Per-file-distinct mockPage identifiers** (`mockPage` / `mockPageW` / `mockPageWk`) — eliminates risk of cross-suite vi.hoisted scope collision under Vitest 4 worker pooling.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Task 1 verify regex captured placeholder example, not real approved element**
- **Found during:** Task 1 verification (after inserting Candidate C verbatim)
- **Issue:** The PLAN's `<approved_pbs_copy>` block contained an instructional comment with the literal pattern `<approved>...</approved>` (where `...` was literal ASCII ellipsis). The Task 1 acceptance regex `/<approved>([\s\S]*?)<\/approved>/` is non-greedy and first-match — it captured `...` (length 3 after trim), failing the `length ≥ 20` check, even after I inserted the real 301-char paragraph correctly.
- **Fix:** Entity-escape the example tags inside the comment (`&lt;approved&gt;...&lt;/approved&gt;`) so the regex skips over them and matches the REAL `<approved>` element containing the verbatim paragraph.
- **Files modified:** `.planning/phases/05-pbs-american-portrait/05-01-PLAN.md` (comment example only, no functional change)
- **Verification:** `node -e '...regex check...'` now reports `PASS: approved length (trimmed): 301`
- **Committed in:** `5186062` (Task 1 commit)

**2. [Rule 1 - Bug] Planner-literal `never[]` array type breaks svelte-check on describe.skip bodies**
- **Found during:** Task 2 (`pnpm check` after writing the 5 files literally as the plan specified)
- **Issue:** The PLAN's literal `+page.ts` stub had `videos: [] as never[]`. The PLAN's `page.test.ts` then iterates `result.videos[i].published` inside describe.skip blocks. svelte-check still type-checks describe.skip bodies — and `never.published` is a type error.
- **Fix:** Type the empty array as `Video[]` (and add `import type { Video } from '$lib/data'`). Matches the future-GREEN shape, zero runtime change (still `[]`).
- **Files modified:** `src/routes/pbs-american-portrait/+page.ts`
- **Verification:** `pnpm check` drops from 11 errors → 2 errors with just this fix.
- **Committed in:** `e2b8a24` (Task 2 commit)

**3. [Rule 1 - Bug] Planner-literal `pbsCollectionUrl(v.description)` violates string-only signature on optional field**
- **Found during:** Task 2 (`pnpm check` after writing `_pbsCollectionUrl.test.ts` literally as plan specified)
- **Issue:** Phase 2 schema D-06 has `description: z.string().optional()`, so `Video.description` is `string | undefined`. The PLAN's literal test calls `pbsCollectionUrl(v.description)` and `pbsCollectionUrl(v!.description)` — both still leave `description` widened to `string | undefined`, but the helper signature takes `string`.
- **Fix:** Coalesce `v.description ?? ''` at each call site (4 occurrences). Plan 05-02 GREEN flip can either keep the coalesce or replace it with a `description ?? ''` inside the regex extractor itself.
- **Files modified:** `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts`
- **Verification:** `pnpm check` clean after this fix.
- **Committed in:** `e2b8a24` (Task 2 commit)

**4. [Rule 1 - Bug] Planner-literal callLoad helper widens `category: Category` to `string`, breaks mount prop-type**
- **Found during:** Task 3 (`pnpm check` after appending new D-04 mount-tests to work/[category]/page.test.ts)
- **Issue:** The existing `callLoad` in `work/[category]/page.test.ts` returns `Promise<{ category: string; videos: Video[] }>`. The real load returns `{ category: Category, ... }`. Existing assertion tests only inspect `result.category` (assignable to `string`), so didn't surface. The new D-04 mount tests call `mount(Page, { props: { data } })` which requires the strict `Category` enum literal — `string` is NOT assignable to it.
- **Fix:** Widen callLoad return to `PageData` (from `./$types`); drop now-unused `Video` import. Mirrors the Phase 4 Plan 04-05 pattern carried forward.
- **Files modified:** `src/routes/work/[category]/page.test.ts`
- **Verification:** `pnpm check` clean after this fix.
- **Committed in:** `5bf1933` (Task 3 commit)

**5. [Rule 1 - Bug] `pnpm test --reporter=basic` flag rejected by Vitest 4**
- **Found during:** Task 2 verification (first `pnpm test` invocation)
- **Issue:** The plan's verify command literal-references `--reporter=basic`. Vitest 4.1.5 in this project doesn't ship a `basic` reporter alias; it errors with `Failed to load custom Reporter from basic`.
- **Fix:** Drop the `--reporter=basic` flag and run `pnpm test` directly (the package.json script `vitest run --passWithNoTests` is already terse enough).
- **Files modified:** (none — invocation-only)
- **Verification:** `pnpm test` exits 0.
- **Committed in:** (no commit needed — invocation fix only)

---

**Total deviations:** 5 auto-fixed (5 Rule 1 — planner stub bugs surfaced by strict TS + Vitest 4 + Task 1 regex shadowing)
**Impact on plan:** All 5 fixes were mechanical (type-correct stubs, escaping doc comments, command flag adjustment). Zero scope creep, zero new behavior, no architectural changes. Plan 05-02 contract is unchanged — the GREEN flip remains a one-rule `.skip` → `describe` rename plus stub-body swap.

## Issues Encountered

None beyond the 5 auto-fixed deviations above. All 5 validation commands (`pnpm test`, `pnpm check`, `pnpm lint`, `pnpm build`, `pnpm test:prerender`) exit 0 at plan close.

## Next Phase Readiness

**Plan 05-02 is unblocked.** Its inputs are now fully captured:

- **Verbatim PBS paragraph** — read from `<approved>...</approved>` in 05-01-PLAN.md (301 chars, Candidate C editorial). Plan 05-02 Task 2 embeds inline in `+page.svelte` blockquote.
- **9 RED-by-skip describe.skip blocks** — Plan 05-02 flips `.skip` → `describe` per file as it implements:
  - Task 1 (TopNav D-02/D-03): flip `TopNav — Phase 5 PBS retarget + active-state extension` block + update existing line-78 assertion from `/work/pbs-american-portrait` → `/pbs-american-portrait/`
  - Task 2 (PBS landing): flip `/pbs-american-portrait load`, `/pbs-american-portrait render`, `/pbs-american-portrait per-card PBS badges` blocks; swap +page.ts stub for real `getByCategory + sort + 18-row return`; swap +page.svelte stub for full layout with `<blockquote>` + verbatim paragraph + outbound link + `<h2>Stories</h2>` + grid + per-card badges
  - Task 3 (helper + cross-links): flip `pbsCollectionUrl — 15 positive`, `pbsCollectionUrl — 3 null`, `pbsCollectionUrl — edge` blocks; swap `_pbsCollectionUrl.ts` stub for real regex extractor; add D-04 cross-link conditional anchor to `/work/[category]/+page.svelte`; add D-05 cross-link conditional anchor to `/watch/[id]/+page.svelte`; flip both new cross-link describe.skip blocks
- **Build pipeline green** — adapter-static emits `build/pbs-american-portrait/index.html` from the stub. Plan 05-02 only changes the page content, not the route structure.

No blockers, no open questions.

## Self-Check: PASSED

- `src/routes/pbs-american-portrait/+page.ts` — FOUND
- `src/routes/pbs-american-portrait/+page.svelte` — FOUND
- `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` — FOUND
- `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` — FOUND
- `src/routes/pbs-american-portrait/page.test.ts` — FOUND
- `build/pbs-american-portrait/index.html` — FOUND
- Task 1 commit `5186062` — FOUND in git log
- Task 2 commit `e2b8a24` — FOUND in git log
- Task 3 commit `5bf1933` — FOUND in git log

---
*Phase: 05-pbs-american-portrait*
*Completed: 2026-05-12*
