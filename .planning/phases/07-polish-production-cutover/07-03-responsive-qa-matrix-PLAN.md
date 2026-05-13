---
phase: 07-polish-production-cutover
plan: 03
type: execute
wave: 3
depends_on: ["07-02"]
files_modified:
  - .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md
autonomous: false
requirements: [FOUND-03]

must_haves:
  truths:
    - "Every public route renders without horizontal scroll at mobile (≤640px), tablet (~768px), and desktop (≥1280px)"
    - "Every public route has tap targets ≥ 44px on mobile (D-19 iOS accessibility floor)"
    - "Every public route has legible type (no overflowing characters, no wrapped headings into illegible widths) at all three breakpoints"
    - "Every public route has zero CLS visible during thumbnail load (blur-up placeholders hold final dimensions per D-10 implicit bound)"
    - "Numbered punch list captures EVERY visual imperfection found in the single audit pass — no entry is too small"
    - "All numbered punch-list items are either (a) fixed and verified, or (b) explicitly accepted as ship-with deviations with rationale recorded in the matrix doc"
  artifacts:
    - path: ".planning/phases/07-polish-production-cutover/07-QA-MATRIX.md"
      provides: "21-cell QA matrix (7 routes × 3 breakpoints) with pass/fix decision per cell + numbered punch list + fix-or-accept resolution per item"
      min_lines: 100
      contains: "21-cell"
  key_links:
    - from: "Each cell in 07-QA-MATRIX.md (pass or fix entry)"
      to: "Either a 'ship-as-is' confirmation OR a punch-list item with file:line + fix description"
      via: "Numbered cross-reference"
      pattern: "Punch list|punch-list"
    - from: "Each punch-list item with status 'fixed'"
      to: "Git commit hash + the file(s) modified"
      via: "Fix log section"
      pattern: "fixed|fix:"
---

<objective>
Execute the D-18 21-cell responsive QA matrix (7 routes × 3 breakpoints) using D-19 methodology (Chrome DevTools mobile emulation primary + real iOS spot-check), produce a numbered punch list per D-20, and either fix every listed item OR explicitly accept it as a ship-with deviation with rationale. The matrix doc is the contract for "Phase 7 fix-list resolved" in D-05's pre-cutover blocker checklist.

Purpose: D-18 (21-cell matrix) + D-19 (Chrome DevTools + real iOS spot-check) + D-20 (single-pass audit → numbered punch list → fix-all-or-ship). Closes the third bullet in D-05.
Output: `07-QA-MATRIX.md` document with 21 pass/fix cells, numbered punch list, fix-or-accept resolution per item.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/07-polish-production-cutover/07-CONTEXT.md
@.planning/phases/04-reel-led-home/04-HUMAN-UAT.md
@.planning/phases/06-press-about-contact/06-HUMAN-UAT.md

<interfaces>
<!-- The 7 routes in the audit matrix (D-18): -->
<!--   1. /                        (hero + featured grid)                                            -->
<!--   2. /work                    (56-card grid)                                                    -->
<!--   3. /work/pbs-american-portrait/  (canonical /work/[category] sample — 18 cards)               -->
<!--   4. /watch/264677021         (canonical /watch/[id] sample — Producer's Reel)                  -->
<!--   5. /pbs-american-portrait/  (flagship landing — 18 cards + blockquote)                        -->
<!--   6. /press                   (vertical credit list — 13 sections)                              -->
<!--   7. /about + /contact        (combined — same layout pattern)                                  -->

<!-- The 3 breakpoints (D-18 + D-22 from Phase 3): -->
<!--   - Mobile     ≤640px  (Chrome DevTools iPhone 14 Pro 393×852 emulation)                        -->
<!--   - Tablet     ~768px  (Chrome DevTools iPad Mini 768×1024 emulation)                           -->
<!--   - Desktop   ≥1280px  (Chrome DevTools at 1440×900 — or actual desktop window)                 -->

<!-- The 6 check categories per cell (D-20 fix bar): -->
<!--   F  Functional bugs (404s on internal nav, broken images, missing content)                     -->
<!--   S  Horizontal scroll                                                                          -->
<!--   T  Type legibility (line-clamp working, no overflow, no over-wide measure)                    -->
<!--   I  Image quality (blur-up timing, aspect-ratio held, no pop-in)                               -->
<!--   X  Tap targets ≥ 44px on mobile (D-19)                                                        -->
<!--   C  CLS during load (no layout shift on thumbnail render)                                      -->

<!-- D-20 fix bar: pixel-polish-everything bounded by single-pass audit. -->
<!--   ONE audit pass → fix all listed items → ship.                                                 -->
<!--   No iterative audit-fix-audit loop (avoids polish-paralysis).                                  -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold 07-QA-MATRIX.md with the 21-cell template + punch-list section</name>
  <files>.planning/phases/07-polish-production-cutover/07-QA-MATRIX.md</files>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-18 matrix definition, D-19 methodology, D-20 fix bar)
    - .planning/phases/04-reel-led-home/04-HUMAN-UAT.md (precedent for human-driven matrix docs in this project — same structural pattern)
    - .planning/phases/06-press-about-contact/06-HUMAN-UAT.md (recent precedent)
  </read_first>
  <action>
    Create `.planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` with the following EXACT scaffold. Each cell is initialized to `pending` so the human walkthrough in Task 2 can fill them in.

    ```markdown
    ---
    status: pending
    phase: 07-polish-production-cutover
    plan: 07-03
    started: "{ISO-TIMESTAMP-AT-TASK-1-EXECUTION}"
    updated: "{ISO-TIMESTAMP-AT-TASK-1-EXECUTION}"
    ---

    # Phase 7 Plan 03 — Responsive QA Matrix

    **D-18:** 21 cells = 7 routes × 3 breakpoints
    **D-19:** Methodology = Chrome DevTools mobile emulation primary + real-iOS spot-check at the end
    **D-20:** Single audit pass → numbered punch list → fix all OR explicitly accept

    ## Methodology

    1. Open Chrome DevTools, set responsive emulation
    2. For each of the 21 cells: walk the route, check the 6 categories (F/S/T/I/X/C), record findings
    3. Real-iOS pass at the end: `/`, `/work`, `/watch/264677021`, `/pbs-american-portrait/` on actual iPhone Safari
    4. Compile punch list, fix all items in one pass, re-verify the changed cells only

    ## Per-Cell Check Categories

    - **F** — Functional bug (404, broken nav, missing image, content not rendered)
    - **S** — Horizontal scroll (page overflows viewport width)
    - **T** — Type legibility (line-clamp, no overflow, no broken word wrap, readable measure)
    - **I** — Image quality (blur-up timing, aspect-ratio held, no pop-in, thumbnails crisp)
    - **X** — Tap targets ≥ 44px (mobile only — D-19 iOS accessibility floor)
    - **C** — CLS during load (no layout shift on thumbnail / iframe / image render)

    ## 21-Cell Matrix

    | # | Route | Breakpoint | F | S | T | I | X | C | Status | Punch-list refs |
    |---|-------|------------|---|---|---|---|---|---|--------|-----------------|
    | 1 | `/` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
    | 2 | `/` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
    | 3 | `/` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
    | 4 | `/work` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
    | 5 | `/work` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
    | 6 | `/work` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
    | 7 | `/work/pbs-american-portrait/` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
    | 8 | `/work/pbs-american-portrait/` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
    | 9 | `/work/pbs-american-portrait/` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
    | 10 | `/watch/264677021` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
    | 11 | `/watch/264677021` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
    | 12 | `/watch/264677021` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
    | 13 | `/pbs-american-portrait/` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
    | 14 | `/pbs-american-portrait/` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
    | 15 | `/pbs-american-portrait/` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
    | 16 | `/press` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
    | 17 | `/press` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
    | 18 | `/press` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
    | 19 | `/about` + `/contact` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
    | 20 | `/about` + `/contact` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
    | 21 | `/about` + `/contact` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |

    **Cell value legend:** `?` pending • `✓` pass • `✗` fail (creates punch-list entry) • `n/a` not applicable

    ## Real-iOS Spot-Check (D-19)

    After Chrome DevTools sweep, run actual iPhone Safari pass on:

    | # | Route | iOS Safari result | Issues |
    |---|-------|-------------------|--------|
    | iOS-1 | `/` | pending | — |
    | iOS-2 | `/work` | pending | — |
    | iOS-3 | `/watch/264677021` | pending | — |
    | iOS-4 | `/pbs-american-portrait/` | pending | — |

    ## Punch List

    *Numbered list of every visible imperfection from the single audit pass (D-20). Each entry: file:line OR component, problem description, fix plan.*

    *(Filled in during Task 2)*

    ## Fix Log

    *Per-item resolution: fixed (with commit hash) OR explicitly accepted as ship-with deviation (with rationale).*

    *(Filled in during Task 3)*

    ## Outcome

    *Final state: ALL items fixed OR explicitly accepted. Matrix doc is committed; D-05 pre-cutover blocker checklist row "All Phase 7 fix-list items resolved" can be marked GREEN.*

    *(Filled in at end of Task 3)*
    ```

    The file scaffold is intentionally human-driven. Task 2 is a CHECKPOINT that the user walks; Task 3 is execution against the punch list produced by Task 2.

    Use the staging URL `https://wolfwdavid.github.io/michelle_ngo_four/` for the audit (production URL not yet served from custom domain — Plan 07-05).
    OR: run `pnpm preview` after `pnpm build` for local audit if staging is stale.
  </action>
  <verify>
    <automated>test -f .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md && grep -c "21-Cell Matrix" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md && grep -c "Punch List" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md</automated>
  </verify>
  <acceptance_criteria>
    - `.planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` exists
    - `grep -c "21-Cell Matrix" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` returns at least 1
    - `grep -c "Punch List" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` returns at least 1
    - `grep -c "Real-iOS Spot-Check" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` returns at least 1
    - `grep -c "^| [0-9]" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` returns exactly 21 (one row per cell) — verify by counting numbered table rows
    - File contains the literal string `pending` at least 21 times (initial state for each cell)
  </acceptance_criteria>
  <done>
    07-QA-MATRIX.md exists with the 21-cell template + iOS spot-check rows + Punch List + Fix Log + Outcome sections, all initialized to pending.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Human-driven 21-cell audit walkthrough + iOS spot-check + punch-list compilation</name>
  <what-built>
    The Chrome DevTools + iOS audit infrastructure is in place:
      - `pnpm build` produces a clean static build of all 71 prerendered routes
      - `pnpm preview` serves the build locally for inspection
      - Staging URL https://wolfwdavid.github.io/michelle_ngo_four/ is live
      - 07-QA-MATRIX.md scaffold exists with 21 pending cells
  </what-built>
  <how-to-verify>
    **Step 1 — Local build sanity:**
      ```
      pnpm build
      pnpm preview
      ```
      Visit http://localhost:4173/ and confirm all 7 routes load.

    **Step 2 — Chrome DevTools mobile emulation (21 cells):**
      Open DevTools → Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M).
      For each of the 21 cells in 07-QA-MATRIX.md:
        a. Set viewport per the row's breakpoint (393×852 mobile, 768×1024 tablet, 1440×900 desktop)
        b. Navigate to the row's route
        c. Check each of F/S/T/I/X/C categories:
           - F (functional): click every internal link, confirm no 404, every image loads
           - S (scroll): drag the horizontal scrollbar — should not appear
           - T (type): visually scan headings + body, look for overflow/wrap issues
           - I (images): refresh and watch blur-up; cards should not pop-in or shift
           - X (tap targets ≥44px, mobile only): hover over every button/link, check it's at least 44×44px (DevTools "Computed" tab shows clientWidth/clientHeight)
           - C (CLS): hard refresh, watch for layout shifts during load
        d. Mark each category cell ✓ pass / ✗ fail / n/a; update Status column
        e. For any ✗: write a punch-list entry under "## Punch List" with: number, route, breakpoint, category, file:line OR component, problem, fix plan

    **Step 3 — Real iOS Safari spot-check (4 rows):**
      Open the staging URL on an actual iPhone (any iOS Safari).
      Walk: `/`, `/work`, `/watch/264677021`, `/pbs-american-portrait/`.
      Note any issues NOT visible in Chrome DevTools — `100dvh` URL-bar handling, momentum scroll, tap-target hit zones, blur-up timing differences. Add to Punch List with `iOS-only` tag.

    **Step 4 — Commit the filled-in matrix:**
      ```
      git add .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md
      git commit -m "docs(07): record 21-cell QA matrix + punch list"
      ```

    **Step 5 — Return the punch-list count:**
      Tell the assistant: "Audit complete. Punch list has N items." (Where N is the count of numbered punch-list entries.)
  </how-to-verify>
  <resume-signal>
    User reports: "Audit complete. Punch list has N items." (with N = numbered entry count, 0 acceptable if everything passes).
    The matrix doc is committed.
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <what-built> + <how-to-verify> blocks to the user as numbered verification steps. Wait for the <resume-signal>. Once the user reports back (pass/fail with specific findings), record the outcome in the plan SUMMARY draft. If FAIL is reported with specific issues, surface them so the orchestrator can route to a fix task; if PASS is reported, proceed to the next task.
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has walked the verification steps and reported the outcome with any specific findings.</done>
</task>

<task type="auto">
  <name>Task 3: Resolve every punch-list item — fix in code OR explicitly accept with rationale</name>
  <files>
    .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md
    {ZERO-OR-MORE source files referenced in punch-list entries — exact files depend on Task 2 findings}
  </files>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md (post-Task-2 — read the punch list verbatim)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-20 fix bar — "ONE audit pass → fix all listed items → ship"; D-09 no new JS deps)
    - Whatever source files are referenced in each punch-list item
  </read_first>
  <action>
    For EACH numbered item in the "## Punch List" section of 07-QA-MATRIX.md, take ONE of two actions:

    **Path A — Fix it:**
      1. Open the file(s) referenced in the punch-list entry
      2. Apply the smallest correct fix per the entry's fix plan
      3. Re-verify by running `pnpm build && pnpm preview` and re-checking ONLY the previously-failing cells (not a full 21-cell re-audit — D-20 single-pass rule)
      4. Update the cell(s) in the matrix from ✗ to ✓
      5. Add a "## Fix Log" entry: `N. {fix description} — {file:line} — commit {hash if applicable}`

    **Path B — Accept as ship-with deviation:**
      1. Add a "## Fix Log" entry: `N. ACCEPTED — {rationale: why this is acceptable for v1.0 launch despite being visible in the audit; e.g., "tablet-only minor type wrap at 768px; affects ≤1% audience; v1.1 fix"}`
      2. Leave the cell ✗ in the matrix; status column reads "accepted"

    **Constraints:**
      - D-09: NO new JS runtime deps. If a punch-list item suggests adding a library (icon library, animation library, font loader), reject and choose Path B with rationale OR implement via system primitives.
      - D-20 single-pass rule: do NOT re-walk all 21 cells after fixing. Only re-verify the cells the fix touched.
      - Every item resolved (Path A or Path B). Zero items left in "pending" state.

    **Final state:** Update the "## Outcome" section of 07-QA-MATRIX.md with a one-line summary like:
      ```
      All 14 punch-list items resolved: 11 fixed, 3 accepted-as-ship-with.
      D-05 pre-cutover blocker checklist row "All Phase 7 fix-list items resolved" can be marked GREEN.
      ```
      OR (if no items found):
      ```
      Zero punch-list items found in the audit. Site ships as-is.
      D-05 pre-cutover blocker checklist row "All Phase 7 fix-list items resolved" already GREEN.
      ```

    Update the matrix's frontmatter `status: pending` → `status: complete` and `updated:` to current ISO timestamp.
  </action>
  <verify>
    <automated>grep -c "pending" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "^status: pending" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` returns 0 (frontmatter status is no longer pending)
    - `grep -c "^status: complete" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` returns 1
    - `grep -c "## Outcome" .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` returns at least 1
    - The "## Outcome" section has at least one non-empty line of summary text
    - Every punch-list item has a corresponding entry in "## Fix Log" (count match — `grep -c "^[0-9]\+\\. " .planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` in Punch List section equals count in Fix Log section)
    - `pnpm build` exits 0 after any code fixes
    - `pnpm test` exits 0 after any code fixes (regression-free)
    - `pnpm check` exits 0 after any code fixes
    - No new entries appear in `package.json` `dependencies` or `devDependencies` (D-09)
  </acceptance_criteria>
  <done>
    Every punch-list item is resolved (fixed or accepted). Matrix doc status = complete.
    D-05 pre-cutover blocker checklist row "All Phase 7 fix-list items resolved" is GREEN.
  </done>
</task>

</tasks>

<verification>
- `.planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` exists with status: complete
- Every numbered punch-list item has a corresponding Fix Log entry (Path A fix or Path B accept)
- `pnpm build` + `pnpm test` + `pnpm check` all exit 0 after any code edits
- No new deps in package.json (D-09)
- Manual: open the matrix doc and verify Outcome section has a summary line
</verification>

<success_criteria>
1. 07-QA-MATRIX.md scaffold created with 21 cells + iOS spot-check rows + Punch List + Fix Log sections
2. Human-driven audit walkthrough completed — every cell filled in (✓/✗/n/a)
3. iOS spot-check rows filled in (4 routes on actual iPhone)
4. Numbered punch list compiled with file:line or component references
5. Every punch-list item resolved: Path A (fixed in code) OR Path B (accepted with rationale)
6. Matrix doc frontmatter status flipped from pending to complete
7. D-05 pre-cutover blocker checklist row "All Phase 7 fix-list items resolved" can flip to GREEN
8. D-09 honored — no new JS deps introduced by any fix
</success_criteria>

<output>
After completion, create `.planning/phases/07-polish-production-cutover/07-03-SUMMARY.md` capturing:
- Total cells: 21 + iOS-4 = 25 audit points
- Punch-list item count + resolution breakdown (N fixed / M accepted)
- List of source files touched during fixes (if any)
- Confirmation that pnpm build/test/check all exit 0 after fixes
- Pointer to 07-QA-MATRIX.md as the canonical record
</output>
</content>
</invoke>