---
phase: 06-press-about-contact
plan: 02
subsystem: about-contact-pages
tags:
  - about
  - contact
  - shared-component
  - prerender-coverage
  - editorial-pages
dependency_graph:
  requires:
    - "src/lib/data (videos / categories — read-only inherited)"
    - "src/routes/+layout.ts (prerender=true + trailingSlash='always')"
    - "Phase 3 D-08 inline-link style (text-white hover:underline underline-offset-2)"
    - "Phase 3 D-43 placeholder routes at /about and /contact (replaced verbatim)"
    - "Phase 5 D-11 verbatim-via-PLAN-checkpoint pattern (bio authorship)"
  provides:
    - "src/lib/components/ContactBlock.svelte — single shared component for /about, /contact, and Footer (Plan 06-03)"
    - "src/routes/about/+page.svelte — h1 + bio + ContactBlock"
    - "src/routes/contact/+page.svelte — h1 + ContactBlock (no form)"
    - "scripts/test-prerender-coverage.mjs — enforces build/about/index.html + build/contact/index.html"
  affects:
    - "Plan 06-03 (Footer) — will import the same ContactBlock for column 1, zero refactor"
    - "Phase 7 cutover — must swap IMDb + LinkedIn href values in ContactBlock.svelte before michellengo.net DNS flip"
tech_stack:
  added: []
  patterns:
    - "Single shared component (zero variants, no props) as single source of truth for cross-page contact info"
    - "Approved-via-PLAN-checkpoint copy embedded verbatim in +page.svelte (no separate strings file; i18n out of scope)"
    - "Prerender coverage script extended in-place rather than refactored (each plan adds checks alongside existing ones)"
key_files:
  created:
    - "src/lib/components/ContactBlock.svelte (82 LOC)"
    - "src/lib/components/ContactBlock.test.ts (102 LOC)"
    - "src/routes/about/page.test.ts (71 LOC)"
    - "src/routes/contact/page.test.ts (59 LOC)"
  modified:
    - "src/routes/about/+page.svelte (42 LOC — replaced placeholder)"
    - "src/routes/contact/+page.svelte (25 LOC — replaced placeholder)"
    - "scripts/test-prerender-coverage.mjs (+19 LOC — added /about + /contact checks)"
decisions:
  - "Used homepage URLs as IMDb + LinkedIn fallback per user direction (2026-05-12) — see Deviations"
  - "Bio copy embedded inline in +page.svelte (no strings file) — i18n is Out of Scope and adding a strings module would introduce an unused abstraction"
  - "ContactBlock has zero props — variants live in the consumer's container, not the component (CONT-02 satisfied by construction)"
metrics:
  duration: "~5m"
  completed: 2026-05-12
  tasks: 2
  files_created: 4
  files_modified: 3
  tests_added: 13
  total_tests: 154
  commits: 2
---

# Phase 6 Plan 02: /about + /contact Pages Summary

Shipped two editorial pages (`/about`, `/contact`) and the shared `<ContactBlock />` component that backs them, replacing the Phase 3 D-43 placeholders verbatim and extending the prerender coverage script to enforce both new HTML outputs.

## What Changed

### Files Created (4)

| File                                          | LOC | Role                                                                                                                        |
| --------------------------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/components/ContactBlock.svelte`      | 82  | Single shared component rendering 5 channel rows in D-36 order (Email → Phone → IMDb → LinkedIn → Vimeo). No props. Reused on /about, /contact, and (Plan 06-03) Footer column 1. |
| `src/lib/components/ContactBlock.test.ts`     | 102 | 8 component tests — channel count, D-36 order, mailto/tel literals, `target="_blank" rel="noopener"` on socials, Phase 3 D-08 inline-link class on every link.                  |
| `src/routes/about/page.test.ts`               | 71  | 4 route tests — exact h1 text, bio ≥80 chars + first-person token regex, `max-w-2xl` container, ContactBlock D-36 channel order.                                                |
| `src/routes/contact/page.test.ts`             | 59  | 5 route tests — exact h1 text, `max-w-2xl` container, ContactBlock D-36 channel order, NO `<form>` element (mailto: is the channel).                                            |

### Files Modified (3)

| File                                       | Change                                                                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/about/+page.svelte`            | Replaced "Coming soon." placeholder with h1 + verbatim ~109-word first-person bio paragraph + `<ContactBlock />` in `max-w-2xl` editorial container.    |
| `src/routes/contact/+page.svelte`          | Replaced "Coming soon." placeholder with h1 + `<ContactBlock />` in `max-w-2xl` container. No intro paragraph, no form.                                  |
| `scripts/test-prerender-coverage.mjs`      | Added two `existsSync(build/<route>/index.html)` checks for `/about` and `/contact`; appended both to FAIL summary and PASS log lines.                  |

### Commits

| Hash      | Subject                                                                       | Tasks |
| --------- | ----------------------------------------------------------------------------- | ----- |
| `bb80907` | `feat(06-02): add ContactBlock shared component + tests`                      | T1    |
| `e69e6b9` | `feat(06-02): build /about + /contact pages + extend prerender coverage`      | T2    |

## Approved Bio Paragraph (Verbatim, for Audit)

> I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands and broadcasters tell stories well — short documentaries, branded films, promos, and trailers. My credits include PBS American Portrait, HBO Max, HBO, ABC News, U2's Sphere residency, Amazon News, and Music Box Films. I love a tight schedule and a thoughtful script. I work hardest when the subject matter is human — real people telling true stories about how they live, what they make, and why it matters. If you have a project that needs a steady hand and a quick turn, get in touch.

**Word count:** 109 (within D-18 punchy ~80–120 target).
**First-person voice (D-17):** "I'm", "I make", "I love", "I work", "my credits".
**Source:** PLAN.md `<approved>...</approved>` block (Phase 5 D-11 pattern). Copy lives inline in `src/routes/about/+page.svelte` between `<!-- BEGIN approved bio -->` / `<!-- END approved bio -->` markers — to revise, update PLAN.md approval and re-paste.

## Final Contact Channel URLs (post-checkpoint)

| Channel  | URL                              | Status                                                                                          |
| -------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Email    | `mailto:mynogo@gmail.com`        | Locked (PROJECT.md)                                                                             |
| Phone    | `tel:+19175661976`               | Locked (PROJECT.md); display `(917) 566-1976`                                                   |
| IMDb     | `https://www.imdb.com/`          | **Fallback — channel homepage.** Must be swapped to personal profile URL before Phase 7 cutover. |
| LinkedIn | `https://www.linkedin.com/`      | **Fallback — channel homepage.** Must be swapped to personal profile URL before Phase 7 cutover. |
| Vimeo    | `https://vimeo.com/user2149742`  | Locked (PROJECT.md seed — real profile shape).                                                  |

## Deviations from Plan

### Rule 1 — IMDb + LinkedIn URLs shipped as channel-homepage fallbacks

**Found during:** Pre-execution checkpoint resolution (2026-05-12 /gsd:execute-phase decision).

**Issue:** PLAN.md checkpoint table (lines 122–134) required the user to supply personalized IMDb + LinkedIn profile URLs before execution. PLAN acceptance criteria literally said "no placeholder strings" (line 366: `grep -n "{{USER_" ContactBlock.svelte` returns ZERO matches). User did not have real profile URLs on hand at execution time and chose to ship with the channel homepages (`https://www.imdb.com/`, `https://www.linkedin.com/`) rather than block the entire phase.

**Fix:** Substituted the two `{{USER_*}}` tokens in the ContactBlock template with the channel-homepage URLs. The component still passes every test in ContactBlock.test.ts (the tests assert `href` contains `imdb.com` / `linkedin.com` and that `target="_blank" rel="noopener"` are present — both true of the homepage URLs).

**Tradeoff:** The URLs are functional (no 404s, link opens in new tab) but they are NOT personalized profile pages. A producer clicking either link lands on the platform homepage rather than Michelle's profile. This is acceptable for an internal staging deploy but MUST be fixed before michellengo.net cutover.

**Files modified:** `src/lib/components/ContactBlock.svelte` lines 36–37 (the `IMDB_URL` and `LINKEDIN_URL` constants).

**Commit:** `bb80907`.

**Rationale:** User explicitly chose this path via /gsd:execute-phase question on 2026-05-12. Documented in STATE.md Blockers/Concerns so `/gsd:progress` surfaces it until resolved.

## Pre-production Swap (Phase 7 / Cutover Prep)

**Before the michellengo.net DNS flip**, edit `src/lib/components/ContactBlock.svelte` and swap the two URL constants at lines 36–37:

```diff
- const IMDB_URL = 'https://www.imdb.com/';
- const LINKEDIN_URL = 'https://www.linkedin.com/';
+ const IMDB_URL = 'https://www.imdb.com/name/nm<REAL-NUMERIC-ID>/';
+ const LINKEDIN_URL = 'https://www.linkedin.com/in/<REAL-HANDLE>/';
```

Single-line change each. No test changes required — the existing ContactBlock test assertions (`href` contains `imdb.com` / `linkedin.com`) still hold for any real profile URL.

After the swap, run `pnpm test -- --project=ui --run src/lib/components/ContactBlock.test.ts` to confirm green; then `pnpm build && node scripts/test-prerender-coverage.mjs` to confirm static output regenerates cleanly.

## Verification Results

| Check                                                                                                           | Result    |
| --------------------------------------------------------------------------------------------------------------- | --------- |
| `pnpm test` (all projects, all files)                                                                            | 154/154 passing |
| `pnpm check` (svelte-check + tsc)                                                                                | 0 errors, 0 warnings |
| `pnpm build`                                                                                                     | Succeeds  |
| `node scripts/test-prerender-coverage.mjs`                                                                       | PASS — all 7 checks green (work + 8x work/<slug> + 56x watch/<id> + pbs-american-portrait + press + about + contact) |
| Single-source-of-truth (CONT-02): `grep -rn "mailto:mynogo@gmail.com" src/routes/`                               | 0 matches (literal lives ONLY in `src/lib/components/ContactBlock.svelte`) |
| No new deps: `git diff --stat package.json pnpm-lock.yaml`                                                       | Empty (no changes) |
| Placeholder removal: `grep "Coming soon" src/routes/about/+page.svelte src/routes/contact/+page.svelte`          | 0 matches in active code (only appears in a test-file code comment explaining the precondition) |
| Token replacement: `grep "{{USER_" src/lib/components/ContactBlock.svelte`                                       | 0 matches |
| Token replacement: `grep "{{APPROVED_BIO_TEXT}}" src/routes/about/+page.svelte`                                  | 0 matches |
| ContactBlock import on both pages: `grep "import ContactBlock" src/routes/`                                      | 2 matches (about + contact) |

## Downstream Contract for Plan 06-03 (Footer)

**Component contract** — Plan 06-03's `<Footer />` consumes `<ContactBlock />` verbatim in column 1:

```svelte
<script lang="ts">
  import ContactBlock from '$lib/components/ContactBlock.svelte';
  // ...
</script>

<footer ...>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
    <div>
      <ContactBlock />
    </div>
    <!-- column 2: mirrored categories -->
    <!-- column 3: secondary nav -->
  </div>
  <!-- bottom strip -->
</footer>
```

**Contract guarantees:**
- ContactBlock has NO props. Footer just renders `<ContactBlock />` — no orientation flag, no variant.
- Channel order is fixed at the component level (Email → Phone → IMDb → LinkedIn → Vimeo). Footer cannot reorder.
- Component is server-renderable (no `$effect`, no browser-only APIs). Prerenders inline inside `build/<route>/index.html` for every route.
- Styling is self-contained (`ul.space-y-2 text-base` + `text-white hover:underline underline-offset-2` per link). Footer's column 1 container only needs to provide width — no per-link styling overrides needed.

**Side effect for Plan 06-03:** Because ContactBlock will prerender inside every page's HTML (via Footer), the email/phone literal will appear on every route's static output. CONT-01 ("footer surfaces email mailto, phone, IMDb, LinkedIn, Vimeo on every page") satisfied at build-artifact level the moment Plan 06-03 wires `<Footer />` into `+layout.svelte`.

## Authentication Gates

None encountered.

## Stub Tracking

The IMDb + LinkedIn channel-homepage URLs are documented and tracked stubs (see Deviations + STATE.md Blockers/Concerns). They render functional links, not empty/null/placeholder strings — the plan's "no placeholder strings" criterion is satisfied at the static-analysis level (no `{{USER_*}}`, no `TBD`), but the underlying intent of the criterion (personalized profile URLs) is partially deferred. Phase 7 cutover prep MUST resolve.

No other stubs.

## Self-Check: PASSED

**Files created (4) — all confirmed present:**
- FOUND: `src/lib/components/ContactBlock.svelte`
- FOUND: `src/lib/components/ContactBlock.test.ts`
- FOUND: `src/routes/about/page.test.ts`
- FOUND: `src/routes/contact/page.test.ts`

**Files modified (3) — all confirmed updated:**
- FOUND: `src/routes/about/+page.svelte` (no "Coming soon", has ContactBlock import, has approved bio)
- FOUND: `src/routes/contact/+page.svelte` (no "Coming soon", has ContactBlock import)
- FOUND: `scripts/test-prerender-coverage.mjs` (has /about and /contact existsSync checks)

**Commits (2) — both confirmed in git log:**
- FOUND: `bb80907` (Task 1: ContactBlock component + tests)
- FOUND: `e69e6b9` (Task 2: /about + /contact pages + prerender coverage)

**Verification commands re-run after both commits:**
- `pnpm test` → 154/154 passing
- `pnpm check` → 0 errors / 0 warnings
- `pnpm build` → succeeds
- `node scripts/test-prerender-coverage.mjs` → PASS

All success criteria from PLAN.md `<success_criteria>` block satisfied.
