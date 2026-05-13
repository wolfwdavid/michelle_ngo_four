---
phase: 07-polish-production-cutover
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/ContactBlock.svelte
autonomous: false
requirements: [FOUND-03]

must_haves:
  truths:
    - "Producer clicking 'IMDb' on /about, /contact, or any footer reaches Michelle's personalized IMDb profile (not the imdb.com homepage)"
    - "Producer clicking 'LinkedIn' on /about, /contact, or any footer reaches Michelle's personalized LinkedIn profile (not the linkedin.com homepage)"
    - "Existing ContactBlock test suite (domain-contains assertions on imdb.com / linkedin.com) still passes after the swap"
    - "STATE.md Blockers/Concerns entry for the URL swap is closed and the NOTE comment in ContactBlock.svelte is removed"
  artifacts:
    - path: "src/lib/components/ContactBlock.svelte"
      provides: "IMDB_URL + LINKEDIN_URL personalized profile literals on lines 36-37"
      contains: "const IMDB_URL = 'https://www.imdb.com/"
  key_links:
    - from: "src/routes/about/+page.svelte (via <ContactBlock />)"
      to: "Michelle's personalized IMDb profile URL"
      via: "IMDB_URL constant in ContactBlock.svelte"
      pattern: "imdb.com/name/|imdb.com/(user|in)/"
    - from: "src/routes/contact/+page.svelte (via <ContactBlock />) AND src/lib/components/Footer.svelte (via <ContactBlock />)"
      to: "Michelle's personalized LinkedIn profile URL"
      via: "LINKEDIN_URL constant in ContactBlock.svelte"
      pattern: "linkedin.com/in/"
---

<objective>
Swap the IMDb + LinkedIn channel-homepage fallbacks in `src/lib/components/ContactBlock.svelte` for Michelle's personalized profile URLs. This is the canonical pre-cutover blocker from `06-HUMAN-UAT.md` Test 1 — ungating the DNS swap in Plan 07-05.

Purpose: D-05 pre-cutover blocker; closes STATE.md Blockers/Concerns entry; CONT-02 mirrored channels become real on every surface (Footer column 1, /about, /contact).
Output: Updated `ContactBlock.svelte` with personalized URLs, `pnpm test ContactBlock` still green, NOTE comment removed.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/07-polish-production-cutover/07-CONTEXT.md
@.planning/phases/06-press-about-contact/06-HUMAN-UAT.md
@src/lib/components/ContactBlock.svelte
@src/lib/components/ContactBlock.test.ts

<interfaces>
<!-- Current ContactBlock.svelte literals (the swap target). Lines 35-38 today: -->

```typescript
// Approved at execute-time on 2026-05-12 — see comment above for swap-before-cutover note.
const IMDB_URL = 'https://www.imdb.com/';
const LINKEDIN_URL = 'https://www.linkedin.com/';
const VIMEO_URL = 'https://vimeo.com/user2149742';
```

<!-- The existing test assertions (ContactBlock.test.ts lines 65, 76) are
     domain-contains checks: -->

```typescript
expect(imdb?.getAttribute('href') ?? '').toContain('imdb.com');
expect(linkedin?.getAttribute('href') ?? '').toContain('linkedin.com');
```

<!-- As long as the new IMDB_URL contains the substring 'imdb.com' and the new
     LINKEDIN_URL contains 'linkedin.com', no test changes are needed. -->
</interfaces>
</context>

<tasks>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 1: Collect Michelle's personalized IMDb + LinkedIn URLs from user</name>
  <read_first>
    - src/lib/components/ContactBlock.svelte (lines 19-38 — the NOTE comment + current literals)
    - .planning/phases/06-press-about-contact/06-HUMAN-UAT.md (Test 1 — the canonical tracker)
    - .planning/STATE.md (Blockers/Concerns section — the swap is the only open blocker)
  </read_first>
  <decision>What are Michelle's personalized IMDb and LinkedIn profile URLs?</decision>
  <context>
    The Phase 6 execute-plan accepted channel-homepage URLs as a fallback because
    the user did not have personalized profile URLs ready. Phase 7 cutover requires
    real personalized URLs before DNS flip per D-05.

    The new URLs MUST contain the literal substrings 'imdb.com' and 'linkedin.com'
    respectively, or the existing ContactBlock.test.ts domain-contains assertions
    will fail (lines 65, 76).

    Expected URL shapes:
      - IMDb: https://www.imdb.com/name/nm{NUMERIC_ID}/    (e.g. https://www.imdb.com/name/nm1234567/)
      - LinkedIn: https://www.linkedin.com/in/{HANDLE}/    (e.g. https://www.linkedin.com/in/michelle-ngo/)
  </context>
  <options>
    <option id="provide-both">
      <name>User pastes both URLs verbatim</name>
      <pros>Single-line edits each; tests pass without modification; resume signal carries the literals directly into Task 2.</pros>
      <cons>None.</cons>
    </option>
    <option id="provide-one-only">
      <name>User provides only one (e.g., IMDb but no LinkedIn account)</name>
      <pros>Honest about reality if one channel doesn't exist.</pros>
      <cons>If LinkedIn URL is omitted entirely, the LinkedIn `<li>` may need to be removed (which is a wider edit — drops a channel from CONT-01's 5-channel contract). Surface this case explicitly to the user.</cons>
    </option>
    <option id="defer-with-fallback">
      <name>Keep the channel homepages and document as a v1.0 launch acceptance</name>
      <pros>Unblocks Plan 07-05 if URLs aren't materializable in time.</pros>
      <cons>Re-opens STATE.md Blockers/Concerns post-launch; violates D-05 pre-cutover blocker checklist.</cons>
    </option>
  </options>
  <resume-signal>
    User pastes:
      IMDB_URL=https://www.imdb.com/name/nm{...}/
      LINKEDIN_URL=https://www.linkedin.com/in/{...}/
    OR selects "provide-one-only" with the available URL, OR selects "defer-with-fallback".
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <decision> prompt + <options> + <context> above to the user. Wait for the <resume-signal> response. Once received, record the user's selection (and any provided literals) in the plan SUMMARY's "User decisions captured" section so downstream tasks can reference them. Do NOT make a guess or proceed without an explicit resume signal — this checkpoint gates subsequent tasks.
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has explicitly selected one of the documented options and any required values are captured. The downstream task can read those values verbatim.</done>
</task>

<task type="auto">
  <name>Task 2: Edit IMDB_URL + LINKEDIN_URL literals in ContactBlock.svelte and remove the NOTE comment</name>
  <files>src/lib/components/ContactBlock.svelte</files>
  <read_first>
    - src/lib/components/ContactBlock.svelte (full file — verify lines 19-29 NOTE block + lines 35-37 const literals are the current state)
    - src/lib/components/ContactBlock.test.ts (lines 57-89 — the IMDb / LinkedIn / Vimeo external link assertions)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-05 pre-cutover blocker checklist)
  </read_first>
  <action>
    Apply three edits to `src/lib/components/ContactBlock.svelte`:

    1. **Replace IMDB_URL (line 36)**: change
       ```typescript
       const IMDB_URL = 'https://www.imdb.com/';
       ```
       to use the URL provided in Task 1 resume-signal, e.g.:
       ```typescript
       const IMDB_URL = '{IMDB_URL_FROM_TASK_1}';
       ```

    2. **Replace LINKEDIN_URL (line 37)**: change
       ```typescript
       const LINKEDIN_URL = 'https://www.linkedin.com/';
       ```
       to use the URL provided in Task 1 resume-signal, e.g.:
       ```typescript
       const LINKEDIN_URL = '{LINKEDIN_URL_FROM_TASK_1}';
       ```

    3. **Remove the swap-before-cutover NOTE comment block** (lines 19-29 in the current file — the block beginning `NOTE — pre-production swap required` and ending `Tracked in STATE.md Blockers/Concerns until resolved.`). The NOTE is no longer relevant once the swap is done. Also remove the inline comment on line 35 (`// Approved at execute-time on 2026-05-12 — see comment above for swap-before-cutover note.`) since it references the now-removed NOTE.

    Do NOT modify VIMEO_URL (line 38) — it is already real (`https://vimeo.com/user2149742`).
    Do NOT modify the `<ul>` markup (lines 41-82) — display text and href bindings are unchanged.
    Do NOT modify ContactBlock.test.ts — assertions are domain-contains checks and pass automatically if the new URLs contain 'imdb.com' / 'linkedin.com'.

    Implements per D-05 (pre-cutover blocker) and closes the STATE.md Blockers/Concerns entry.
  </action>
  <verify>
    <automated>pnpm test ContactBlock</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "https://www.imdb.com/'" src/lib/components/ContactBlock.svelte` returns 0 (the homepage literal is gone)
    - `grep -c "https://www.linkedin.com/'" src/lib/components/ContactBlock.svelte` returns 0 (the homepage literal is gone)
    - `grep -c "imdb.com" src/lib/components/ContactBlock.svelte` returns at least 1 (the new URL still contains the domain — required for test assertion at line 65 of ContactBlock.test.ts)
    - `grep -c "linkedin.com" src/lib/components/ContactBlock.svelte` returns at least 1 (the new URL still contains the domain — required for test assertion at line 76)
    - `grep -c "swap-before-cutover" src/lib/components/ContactBlock.svelte` returns 0 (NOTE block removed)
    - `grep -c "Tracked in STATE.md Blockers" src/lib/components/ContactBlock.svelte` returns 0 (NOTE block removed)
    - `grep -c "vimeo.com/user2149742" src/lib/components/ContactBlock.svelte` returns at least 1 (Vimeo URL unchanged)
    - `pnpm test ContactBlock` exits 0 (all 7 existing ContactBlock test cases pass)
    - `pnpm check` exits 0 (no svelte-check errors introduced by the edit)
  </acceptance_criteria>
  <done>
    ContactBlock.svelte has personalized IMDb + LinkedIn URLs; NOTE comment removed; existing
    test suite passes without modification; STATE.md Blockers/Concerns entry can be closed in
    the plan SUMMARY.
  </done>
</task>

</tasks>

<verification>
- `pnpm test ContactBlock` exits 0
- `pnpm check` exits 0
- Manual: open `src/lib/components/ContactBlock.svelte` and confirm IMDB_URL + LINKEDIN_URL are personalized profile URLs, not channel homepages, and the NOTE block is gone
- `grep -c "https://www.imdb.com/'" src/lib/components/ContactBlock.svelte` returns 0
- `grep -c "https://www.linkedin.com/'" src/lib/components/ContactBlock.svelte` returns 0
</verification>

<success_criteria>
1. ContactBlock.svelte IMDB_URL + LINKEDIN_URL are real personalized profile URLs
2. Existing 7-case ContactBlock.test.ts suite passes without modification
3. NOTE swap-before-cutover comment block is removed from the file
4. STATE.md Blockers/Concerns can be marked resolved in the SUMMARY
5. D-05 pre-cutover blocker checklist row 1+2 (IMDb + LinkedIn swap) flips from RED to GREEN
</success_criteria>

<output>
After completion, create `.planning/phases/07-polish-production-cutover/07-01-SUMMARY.md` capturing:
- The exact IMDb + LinkedIn URLs shipped (for traceability)
- Confirmation that `pnpm test ContactBlock` + `pnpm check` both exit 0
- A note that STATE.md Blockers/Concerns should be updated to mark the swap as resolved
</output>
