---
phase: 03-grid-filter-watch
plan: 05
type: execute
wave: 1
depends_on: ["03-04"]
files_modified:
  - src/lib/components/TopNav.svelte
  - src/lib/components/TopNav.test.ts
autonomous: true
gap_closure: true
requirements:
  - NAV-01
must_haves:
  truths:
    - "On a prerendered `build/work/<slug>/index.html` page, the TopNav category link matching `<slug>` carries that category's per-category accent class (e.g. `text-cat-pbs` on `build/work/pbs-american-portrait/index.html`) — D-41 active-state highlight paints in production form."
    - "On `/work/<slug>/` (with trailing slash, the production URL shape under `trailingSlash='always'`), `isActive(slug)` returns `true` so the active branch of the class ternary is reached."
    - "On `/work` (no slug), `/watch/<id>/`, `/about/`, `/press/`, `/contact/`, and `/`, NO category link is highlighted (no `text-cat-*` class on category `<a>` elements) — D-41 negative path preserved."
    - "Vitest unit tests assert BOTH the no-trailing-slash shape (legacy) AND the trailing-slash shape (production) so the regression cannot reappear."
  artifacts:
    - path: "src/lib/components/TopNav.svelte"
      provides: "TopNav with trailing-slash-tolerant `isActive(slug)` — pathname is normalized (trailing `/` stripped) before the literal comparison so the active branch fires under SvelteKit's `trailingSlash='always'` normalization"
    - path: "src/lib/components/TopNav.test.ts"
      provides: "TopNav unit tests covering both pathname shapes — adds a trailing-slash test (e.g. `new URL('http://localhost/work/pbs-american-portrait/')`) alongside the existing no-trailing-slash test so production behavior is locked in regression"
  key_links:
    - from: "src/lib/components/TopNav.svelte"
      to: "$app/state"
      via: "page.url.pathname normalized via .replace(/\\/$/, '') before comparison to `${base}/work/${slug}`"
      pattern: "page\\.url\\.pathname\\.replace\\(/\\\\/\\$/, ''\\)"
    - from: "src/lib/components/TopNav.test.ts"
      to: "src/lib/components/TopNav.svelte"
      via: "trailing-slash test mocks `mockPage.url = new URL('http://localhost/work/pbs-american-portrait/')` and asserts `text-cat-pbs` class on PBS link"
      pattern: "new URL\\('http://localhost/work/pbs-american-portrait/'\\)"
---

<objective>
Fix the single Phase 3 defect documented in `.planning/phases/03-grid-filter-watch/03-VERIFICATION.md`: the TopNav D-41 active-state highlight does not paint on prerendered HTML because `isActive(slug)` does a literal-string comparison that the site-wide `trailingSlash='always'` setting (Plan 03-03) makes unreachable.

The fix is one line of normalization in `src/lib/components/TopNav.svelte` plus a matching trailing-slash unit test in `src/lib/components/TopNav.test.ts` so the regression can't reappear. After this plan, every prerendered `build/work/<slug>/index.html` carries the per-category accent class on the matching TopNav link.

**Decision provenance:**
- **D-41 (CONTEXT.md):** "Active category nav link uses that category's accent color … On `/work/[category]`, the matching nav link is highlighted." This plan delivers the production behavior D-41 specifies.
- **03-VERIFICATION.md gap (status: gaps_found, score 4/5):** "isActive(slug) does literal-string comparison `page.url.pathname === \`${base}/work/${slug}\`` but trailingSlash='always' (set in src/routes/+layout.ts by Plan 03-03) normalizes the pathname to `/work/<slug>/` (with trailing slash). The comparison is `/work/pbs-american-portrait/` vs `/work/pbs-american-portrait` — always false."
- **03-04 SUMMARY Decision #3:** Executor self-flagged: "isActive(slug) compares page.url.pathname === `${base}/work/${slug}` (no trailing slash) — passes tests because mocked base='' makes shapes match; production behavior under trailingSlash='always' needs Phase 4 manual verify (page.url.pathname may carry the slash). Defensive fix is a strip-trailing-slash helper if visual fails." Verification confirmed the defensive fix is required, not optional.

Purpose: Close Phase 3 NAV-01 at the production-behavior level (currently structural-pass / behavioral-fail per 03-VERIFICATION.md). All other Phase 3 truths, artifacts, key links, and requirement IDs are already satisfied; this is a single-defect closure.

Output:
- `src/lib/components/TopNav.svelte` — `isActive(slug)` normalizes `page.url.pathname` (strip trailing `/`) before the literal comparison.
- `src/lib/components/TopNav.test.ts` — adds a trailing-slash test asserting the active class on the production-shape URL; preserves the existing no-trailing-slash test so both shapes are exercised.
- `pnpm test` still 78+ tests passing (existing 78 + at least 1 new trailing-slash test).
- `pnpm build` produces `build/work/pbs-american-portrait/index.html` containing the literal class string `text-cat-pbs` on the PBS TopNav link (the active branch is now reached).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-grid-filter-watch/03-CONTEXT.md
@.planning/phases/03-grid-filter-watch/03-VERIFICATION.md
@.planning/phases/03-grid-filter-watch/03-04-top-nav-and-placeholder-routes-SUMMARY.md

<interfaces>
<!-- The bug is in 1 file (TopNav.svelte) and 1 test file (TopNav.test.ts). -->
<!-- The trigger (trailingSlash='always') lives in src/routes/+layout.ts and stays. -->

CURRENT BUGGY SHAPE — `src/lib/components/TopNav.svelte` line 34-36:

```ts
function isActive(slug: string): boolean {
  return page.url.pathname === `${base}/work/${slug}`;
}
```

Under `trailingSlash='always'` (src/routes/+layout.ts line 10), SvelteKit normalizes
`page.url.pathname` to end with `/`. So on `/work/pbs-american-portrait/`:
- `page.url.pathname` is `/work/pbs-american-portrait/`
- `${base}/work/${slug}` is `/work/pbs-american-portrait` (no trailing slash; base mocked to '')
- `===` returns `false` → active branch never fires → link renders `text-neutral-300 hover:text-white` instead of `text-cat-pbs`.

REQUIRED FIX SHAPE — `src/lib/components/TopNav.svelte` line 34-36:

```ts
function isActive(slug: string): boolean {
  return page.url.pathname.replace(/\/$/, '') === `${base}/work/${slug}`;
}
```

The `.replace(/\/$/, '')` strips a single trailing `/` if present. Why this form (not `+ '/'` on the literal):
- The comparison literal `${base}/work/${slug}` is already used as an `href` value elsewhere in the same template; keeping it canonical (no trailing slash) avoids a second source of truth.
- The normalization is purely on the input (the runtime pathname), not the constant — easier to reason about.
- Both `/work/pbs-american-portrait` and `/work/pbs-american-portrait/` normalize to `/work/pbs-american-portrait` and match the literal, so the legacy test (no trailing slash) AND the new test (trailing slash) both pass without rewriting the literal.

CURRENT TEST FILE STRUCTURE — `src/lib/components/TopNav.test.ts`:

The active-state describe block (lines 78-107) has 3 tests:
1. `'on /work/pbs-american-portrait, PBS link gets cat-pbs accent class'` — mocks `new URL('http://localhost/work/pbs-american-portrait')` (NO trailing slash; line 80).
2. `'on /work (no filter), no category link is highlighted'` — mocks `new URL('http://localhost/work')`.
3. `'on /watch/<id>, no category link is highlighted (D-41)'` — mocks `new URL('http://localhost/watch/264677021')`.

The blind spot: test 1 asserts the active class but uses a no-trailing-slash URL, which is not the production shape under `trailingSlash='always'`. The test passes today because the comparison literal also has no trailing slash → both sides of `===` match → active branch fires → assertion succeeds. But it does not exercise the production URL shape, so the real bug (in production) is invisible to this suite.

REQUIRED NEW TEST — append a 4th test inside the existing `describe('TopNav — active state (D-41)', …)` block, AFTER the existing test 1, with this exact shape (only the URL string differs from test 1):

```ts
it('on /work/pbs-american-portrait/ (trailing slash, production shape under trailingSlash=always), PBS link still gets cat-pbs accent class', () => {
  // src/routes/+layout.ts sets `trailingSlash = 'always'` (Plan 03-03), so the
  // production URL on a /work/<slug>/ prerendered page carries a trailing slash.
  // isActive(slug) MUST normalize pathname before comparison or the active
  // branch is unreachable. Regression test for 03-VERIFICATION.md gap.
  mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
  component = mount(TopNav, { target: makeHost(), props: {} });
  const pbsLink = Array.from(host.querySelectorAll('a')).find(
    (a) => a.textContent?.trim() === 'PBS American Portrait'
  );
  expect(pbsLink?.className).toMatch(/text-cat-pbs/);
});
```

Reuses every fixture/mock already in the file (`mockPage`, `makeHost`, `mount`, `unmount`, `host`, `component`, `beforeEach`, `afterEach`). No new imports. No new helpers. The trailing slash on `'http://localhost/work/pbs-american-portrait/'` is the ONLY thing that differs from the legacy test 1.

WHY KEEP THE LEGACY TEST: the existing no-trailing-slash test 1 still has value — it asserts the comparison works under direct-navigation conditions (e.g., a paste of `/work/pbs-american-portrait` without trailing slash, which SvelteKit's router would redirect to the trailing-slash form, but during the brief pre-redirect render the pathname has no slash). Both shapes must resolve to the same active state.

OUT OF SCOPE FOR THIS PLAN (per gap_closure_scope):
- Visual blur-up smoothness, OKLCH AA contrast, hover-prefetch network behavior, iframe playback, responsive grid sweep — those are HUMAN-only checks documented in 03-VERIFICATION.md. They are NOT regressions of the TopNav fix.
- Manual `pnpm preview` spot-check that the active-link visual paints in browser — flagged by 03-VERIFICATION.md `human_verification` item "Active-link visual in production after the trailing-slash fix" — note in this plan but DO NOT block the executor on it (the automated grep on the prerendered HTML in Task 2 acceptance proves the class is in the SSR output, which is sufficient automated proof; the human eye-check is a follow-up).
- All other Phase 3 work: already verified PASS per 03-VERIFICATION.md. Do not touch /work, /work/[category], /watch/[id], +layout.ts, +layout.svelte, MobileMenu, VideoCard, CategoryTag, categoryAccent, app.css, +error.svelte, or any +page.ts.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add trailing-slash regression test in TopNav.test.ts (RED)</name>
  <files>src/lib/components/TopNav.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-VERIFICATION.md (the gap shape: literal pathname comparison fails under trailingSlash='always'; the test mocks blind spot)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\TopNav.test.ts (the file being modified — preserve all existing tests verbatim; only ADD a 4th test inside the existing `describe('TopNav — active state (D-41)', …)` block)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\+layout.ts (line 10 — `export const trailingSlash = 'always';` is the production setting that triggers the gap; comment explains why)
  </read_first>
  <behavior>
    A new 4th test inside `describe('TopNav — active state (D-41)', …)`:

    - Mocks `mockPage.url = new URL('http://localhost/work/pbs-american-portrait/')` (NOTE the trailing slash — this is the production URL shape under `trailingSlash='always'`).
    - Mounts TopNav.
    - Finds the link whose textContent is exactly `'PBS American Portrait'`.
    - Asserts that link's `className` matches `/text-cat-pbs/`.

    This test MUST FAIL before Task 2's source fix is applied (the literal comparison `page.url.pathname === '/work/pbs-american-portrait'` is `false` against the trailing-slash pathname `/work/pbs-american-portrait/`). After Task 2, this test passes alongside all 7 existing TopNav tests.

    The legacy no-trailing-slash test 1 (`'on /work/pbs-american-portrait, PBS link gets cat-pbs accent class'`) MUST continue to pass after both Task 1 and Task 2 — both URL shapes resolve to the active state.
  </behavior>
  <action>
    Step 1 — Edit `src/lib/components/TopNav.test.ts`. After the existing test 1 inside `describe('TopNav — active state (D-41)', …)` (the test that ends at line 86 with `expect(pbsLink?.className).toMatch(/text-cat-pbs/);` followed by `});`), insert this new test verbatim:

    ```ts
      it('on /work/pbs-american-portrait/ (trailing slash, production shape under trailingSlash=always), PBS link still gets cat-pbs accent class', () => {
        // src/routes/+layout.ts sets `trailingSlash = 'always'` (Plan 03-03), so the
        // production URL on a /work/<slug>/ prerendered page carries a trailing slash.
        // isActive(slug) MUST normalize pathname before comparison or the active
        // branch is unreachable. Regression test for 03-VERIFICATION.md gap.
        mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const pbsLink = Array.from(host.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'PBS American Portrait'
        );
        expect(pbsLink?.className).toMatch(/text-cat-pbs/);
      });
    ```

    Indentation: 2 spaces inside the `it(...)` body, matching the existing tests in the same describe block. The test goes BETWEEN the existing test 1 (PBS no-trailing-slash) and the existing test 2 (`'on /work (no filter), no category link is highlighted'`).

    Step 2 — Run the test in isolation to confirm RED:

    ```
    pnpm vitest run src/lib/components/TopNav.test.ts
    ```

    Expected: 7 tests pass, 1 test FAILS (the new trailing-slash test) with an assertion error like:
    ```
    AssertionError: expected 'text-neutral-300 hover:text-white' to match /text-cat-pbs/
    ```

    This RED state confirms the test correctly exercises the production gap. Task 2 fixes the source and turns this test GREEN.

    Step 3 — DO NOT commit yet. Task 2 ships the source fix in the same logical change-set; commit happens after both tasks pass together (single git commit covers Task 1 + Task 2 — Task 2's `<action>` includes the commit step).
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/components/TopNav.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/TopNav.test.ts` contains the literal string `new URL('http://localhost/work/pbs-american-portrait/')` (note trailing slash). Verifiable: `grep -F "new URL('http://localhost/work/pbs-american-portrait/')" src/lib/components/TopNav.test.ts` exits 0.
    - File `src/lib/components/TopNav.test.ts` contains the literal string `trailing slash, production shape under trailingSlash=always` (the new test name fragment). Verifiable: `grep -F "trailing slash, production shape under trailingSlash=always" src/lib/components/TopNav.test.ts` exits 0.
    - The existing test name `'on /work/pbs-american-portrait, PBS link gets cat-pbs accent class'` still appears in the file (the legacy no-trailing-slash test was not removed). Verifiable: `grep -F "on /work/pbs-american-portrait, PBS link gets cat-pbs accent class" src/lib/components/TopNav.test.ts` exits 0.
    - The existing 3 active-state tests + 4 baseline tests are unchanged (count: 8 `it(` calls in the file). Verifiable: `grep -c "it(" src/lib/components/TopNav.test.ts` returns `8`.
    - `pnpm vitest run src/lib/components/TopNav.test.ts` shows 7 passing + 1 failing test BEFORE Task 2 runs. The failing test name in the output is the literal `'on /work/pbs-american-portrait/ (trailing slash, production shape under trailingSlash=always), PBS link still gets cat-pbs accent class'`. (Task 2's verify step then re-runs and shows 8/8 GREEN.)
  </acceptance_criteria>
  <done>
    The 4th active-state test exists in `src/lib/components/TopNav.test.ts` and demonstrably FAILS against the unfixed source — confirming the test correctly exercises the production gap documented in 03-VERIFICATION.md. The test will turn GREEN after Task 2 ships the source fix.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Normalize pathname in TopNav.svelte isActive() (GREEN) + run all Phase 3 gates</name>
  <files>src/lib/components/TopNav.svelte</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-VERIFICATION.md (the gap and its missing fixes — both fixes are in this plan; missing item 1 = this task, missing item 2 = Task 1)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\TopNav.svelte (the file being modified — only the body of the `isActive` function changes; everything else preserved verbatim)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\+layout.ts (line 10 — `export const trailingSlash = 'always';` — the production setting that requires this normalization; do NOT modify this file)
  </read_first>
  <behavior>
    The `isActive(slug)` function in TopNav.svelte must:
    - Return `true` when `page.url.pathname` equals `` `${base}/work/${slug}` `` exactly (legacy / direct-navigation shape — already covered by existing test 1).
    - ALSO return `true` when `page.url.pathname` equals `` `${base}/work/${slug}/` `` (with one trailing slash — production shape under `trailingSlash='always'`; covered by Task 1's new regression test).
    - Continue to return `false` on `/work` (no slug), `/watch/<id>/`, `/about/`, `/press/`, `/contact/`, `/` — the existing 2 negative-path tests (test 2 + test 3 in the active-state describe block) still pass.

    The implementation is a one-line change inside the function body: strip a single trailing `/` from `page.url.pathname` before the `===` comparison.
  </behavior>
  <action>
    Step 1 — Edit `src/lib/components/TopNav.svelte`. Locate the `isActive` function (currently lines 34-36):

    ```ts
      function isActive(slug: string): boolean {
        return page.url.pathname === `${base}/work/${slug}`;
      }
    ```

    Replace it with EXACTLY:

    ```ts
      function isActive(slug: string): boolean {
        // Normalize trailing slash before comparison: src/routes/+layout.ts sets
        // `trailingSlash = 'always'` (Plan 03-03), so production page.url.pathname
        // is `/work/<slug>/` while the comparison literal is `/work/<slug>`.
        // Without this strip, the active branch is unreachable in production
        // (03-VERIFICATION.md gap — confirmed on prerendered build/work/<slug>/index.html).
        return page.url.pathname.replace(/\/$/, '') === `${base}/work/${slug}`;
      }
    ```

    The change is exactly one substantive line: `page.url.pathname` → `page.url.pathname.replace(/\/$/, '')`. The 4-line comment documents the why for future readers (links the fix to 03-VERIFICATION.md and Plan 03-03's `trailingSlash` setting).

    Do NOT change anything else in the file:
    - Preserve the `eslint-disable svelte/no-navigation-without-resolve` comment block (lines 17-22) and the `/* eslint-disable svelte/no-navigation-without-resolve */` directive (line 24).
    - Preserve all 5 imports (lines 25-29).
    - Preserve `const categories = …` (line 31) and `let mobileOpen = $state(false);` (line 32).
    - Preserve the entire `<header>...</header>` markup (lines 39-76) verbatim — the class binding `class={isActive(slug) ? categoryAccent(category) : 'text-neutral-300 hover:text-white'}` already uses `isActive(slug)`, so the active branch becomes reachable in production once `isActive` is fixed without touching the markup.
    - Preserve the `{#if mobileOpen}<MobileMenu …/>{/if}` block (lines 78-80).

    Step 2 — Re-run the TopNav suite and confirm all 8 tests pass:

    ```
    pnpm vitest run src/lib/components/TopNav.test.ts
    ```

    Expected output line:
    ```
    Test Files  1 passed (1)
         Tests  8 passed (8)
    ```

    Both the legacy no-trailing-slash test 1 AND the new trailing-slash test (added in Task 1) now pass — the regex `replace(/\/$/, '')` is idempotent on inputs without a trailing slash, so the legacy shape `/work/pbs-american-portrait` → `/work/pbs-american-portrait` still equals the literal.

    Step 3 — Run the full Phase 3 verification gates (the same set 03-VERIFICATION.md ran):

    ```
    pnpm check && pnpm test && pnpm build && pnpm test:prerender
    ```

    Expected: all four exit 0. After build, the prerendered HTML for `/work/<slug>/` pages now carries the active class on the matching TopNav category link. Specifically, `build/work/pbs-american-portrait/index.html` must contain the literal class string `text-cat-pbs` somewhere on the PBS TopNav link (the active branch of the ternary now fires during prerender). Total tests: 79 (was 78; +1 from Task 1's new regression test).

    Step 4 — Verify the prerendered output literally:

    ```
    grep -F "text-cat-pbs" build/work/pbs-american-portrait/index.html
    ```

    Expected: at least 2 matches — one from the page heading (`<h1 class="text-cat-pbs">PBS American Portrait (18)</h1>` per Plan 03-02 D-26) AND one from the TopNav link (the new active-state paint, this plan). Before this plan, only 1 match (the heading). After this plan, ≥2 matches.

    Spot-check a second category to prove the fix is general (not PBS-specific):

    ```
    grep -F "text-cat-promos" build/work/promos-and-trailers/index.html
    ```

    Expected: ≥2 matches (heading + TopNav active link).

    Step 5 — Commit. Use a single commit covering both tasks (the test + the fix are one logical change):

    ```
    git add src/lib/components/TopNav.svelte src/lib/components/TopNav.test.ts
    git commit -m "fix(03-05): normalize pathname in TopNav isActive() for trailingSlash=always

    Closes the 03-VERIFICATION.md gap. The literal page.url.pathname === \`\${base}/work/\${slug}\`
    comparison was unreachable in production because src/routes/+layout.ts sets
    trailingSlash='always' (Plan 03-03), normalizing the runtime pathname to
    /work/<slug>/ while the comparison literal stays at /work/<slug>.

    Strip a single trailing slash before comparison; idempotent on inputs without
    one, so both URL shapes (direct-paste no-slash + normalized with-slash) now
    resolve to the active branch.

    Add a trailing-slash regression test alongside the legacy no-trailing-slash
    test so the production URL shape is locked in. Tests now go 7 → 8 in
    TopNav.test.ts; phase total 78 → 79.

    Verified: build/work/pbs-american-portrait/index.html now contains text-cat-pbs
    on the PBS TopNav link in addition to the existing heading paint."
    ```

    Manual `pnpm preview` spot-check (the `human_verification` item from 03-VERIFICATION.md "Active-link visual in production after the trailing-slash fix") is a follow-up the user can run on their own; it does NOT block this plan. The grep-on-prerendered-HTML check in Step 4 is automated proof that the active class is in the SSR output.
  </action>
  <verify>
    <automated>pnpm test && pnpm build && grep -F "text-cat-pbs" build/work/pbs-american-portrait/index.html</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/TopNav.svelte` contains the literal string `page.url.pathname.replace(/\/$/, '')`. Verifiable: `grep -F "page.url.pathname.replace(/\\/\$/, '')" src/lib/components/TopNav.svelte` exits 0.
    - File `src/lib/components/TopNav.svelte` no longer contains the unfixed shape `page.url.pathname === \`${base}/work/${slug}\`` on its own line. Verifiable: `grep -E "^\s*return\s+page\.url\.pathname\s*===\s*\\\`\\\$\{base\}/work/\\\$\{slug\}\\\`" src/lib/components/TopNav.svelte` exits 1 (no match — the unfixed line is gone).
    - File `src/lib/components/TopNav.svelte` still contains `function isActive(slug: string): boolean {` (function signature preserved). Verifiable: `grep -F "function isActive(slug: string): boolean {" src/lib/components/TopNav.svelte` exits 0.
    - File `src/lib/components/TopNav.svelte` still contains `import { page } from '$app/state';` (no import disturbed). Verifiable: `grep -F "import { page } from '\$app/state';" src/lib/components/TopNav.svelte` exits 0.
    - File `src/lib/components/TopNav.svelte` still contains `class={isActive(slug) ? categoryAccent(category) : 'text-neutral-300 hover:text-white'}` (the consuming class binding is unchanged). Verifiable: `grep -F "class={isActive(slug) ? categoryAccent(category) : 'text-neutral-300 hover:text-white'}" src/lib/components/TopNav.svelte` exits 0.
    - `pnpm vitest run src/lib/components/TopNav.test.ts` exits 0 with 8 passing tests (was 7 in Plan 03-04; +1 from Task 1).
    - `pnpm test` exits 0 with 79 tests passing (was 78 in Plan 03-04; +1 from Task 1's new regression test).
    - `pnpm check` exits 0.
    - `pnpm lint` exits 0.
    - `pnpm build` exits 0.
    - `pnpm test:prerender` exits 0 (the trailingSlash setting and prerender directory shape are unchanged; the count thresholds 1 work index + 8 work/<slug> + 56 watch/<id> still hold).
    - `grep -F "text-cat-pbs" build/work/pbs-american-portrait/index.html` exits 0 with at least 2 matches (heading + TopNav active link). Verifiable: `[ "$(grep -c 'text-cat-pbs' build/work/pbs-american-portrait/index.html)" -ge 2 ]`.
    - `grep -F "text-cat-promos" build/work/promos-and-trailers/index.html` exits 0 (active fix generalizes beyond PBS).
    - A second-category spot-check, e.g. `grep -F "text-cat-reel" build/work/reel/index.html`, also exits 0 with ≥2 matches.
    - On a non-`/work/<slug>/` page like `build/index.html` or `build/about/index.html`, NO category active class appears on TopNav category links (negative path preserved). Verifiable: `grep -F "text-cat-pbs" build/index.html` exits 1 (no match).
    - A single git commit was created covering both `src/lib/components/TopNav.svelte` and `src/lib/components/TopNav.test.ts`. Verifiable: `git log -1 --stat` shows both files in the latest commit, the message starts with `fix(03-05):`.
  </acceptance_criteria>
  <done>
    `isActive(slug)` normalizes `page.url.pathname` before the literal comparison so the active branch fires under SvelteKit's `trailingSlash='always'` normalization. The 03-VERIFICATION.md gap is closed: prerendered `build/work/<slug>/index.html` files now carry the per-category accent class on the matching TopNav link, confirming D-41 paints in production form. All 79 tests pass; phase verification gates (`pnpm check`, `pnpm test`, `pnpm build`, `pnpm test:prerender`) all exit 0. Single commit shipped.
  </done>
</task>

</tasks>

<verification>
**After both tasks complete (single commit covering both files):**

1. `pnpm check` exits 0 (svelte-check clean).
2. `pnpm test` exits 0 with 79 tests passing (was 78; +1 from the new trailing-slash regression test).
3. `pnpm lint` exits 0 (eslint clean).
4. `pnpm build` exits 0 (still emits ~70 prerendered HTML files; counts unchanged).
5. `pnpm test:prerender` exits 0 (1 work index + 8 work/<slug> + 56 watch/<id> — counts unchanged).
6. `grep -F "text-cat-pbs" build/work/pbs-american-portrait/index.html` shows ≥2 matches (heading + TopNav active link). **This is the goal-backward proof that the gap is closed: the active class now paints on the prerendered output, not just under mocked unit tests.**
7. Negative-path spot-check: `grep -F "text-cat-pbs" build/index.html` exits 1 (no match — the splash page does not falsely highlight a category link).
8. Cross-category spot-check: at least one other category accent is also visible on its own slug page (e.g., `text-cat-promos` in `build/work/promos-and-trailers/index.html`) — confirms the fix generalizes, not just PBS.
9. Cross-phase regression: Phase 1 splash still renders; Phase 2 data-layer 32 tests still pass (covered by the global `pnpm test` run); the `trailingSlash='always'` setting in `src/routes/+layout.ts` is untouched (Plan 03-03 contract preserved).

**Goal-backward check (gap closure):**

The single failed Phase 3 truth from 03-VERIFICATION.md was:
> "On /work/<slug>, the matching category link in TopNav gets the per-category accent class via categoryAccent(category) (D-41)" — status: failed.

After this plan:
- ✅ Production-shape URL `/work/pbs-american-portrait/` triggers the active branch (verified by grep on prerendered HTML).
- ✅ Legacy-shape URL `/work/pbs-american-portrait` (no trailing slash) also triggers the active branch (verified by the existing legacy test).
- ✅ Negative paths (`/work`, `/watch/<id>/`, `/`, `/about/`, etc.) do NOT trigger any category active state (verified by the existing 2 negative-path tests + the negative grep on `build/index.html`).
- ✅ The regression cannot reappear silently: the new trailing-slash test asserts the production shape, so any future `isActive()` rewrite that drops normalization will fail in CI.

**Coverage:**
- NAV-01 — the structural piece was already satisfied by Plan 03-04; this plan closes the behavioral gap (D-41 active-state highlight in production form). 03-VERIFICATION.md status will move from `gaps_found` to `verified` after re-verification.

**Wave 1 disjointness:**
- This is the only Wave 1 plan in this gap-closure run; no disjointness check needed.
- Files touched (`src/lib/components/TopNav.svelte`, `src/lib/components/TopNav.test.ts`) are exclusive to Plan 03-04's `files_modified` set; no conflict with any other Phase 3 plan.

**Out of scope (per gap_closure_scope) — NOT verified by this plan:**
- Visual blur-up smoothness, OKLCH AA contrast values, hover-prefetch network behavior, cross-origin iframe playback, responsive grid breakpoint sweep — all flagged as `human_verification` in 03-VERIFICATION.md. They were already documented as manual checks before this plan.
- Manual `pnpm preview` browser eye-check of the active link painting (the matching `human_verification` item to this fix) — is a follow-up the user can run; the automated grep on prerendered HTML is sufficient automated proof for plan completion.
</verification>

<success_criteria>
Plan 03-05 complete (Phase 3 gap closed) when:
- [ ] `src/lib/components/TopNav.svelte` `isActive(slug)` normalizes `page.url.pathname` (strip trailing `/`) before the literal comparison; preserves the existing function signature and the consuming class binding
- [ ] `src/lib/components/TopNav.test.ts` contains a new test asserting the active class on the trailing-slash production URL `/work/pbs-american-portrait/`; preserves the existing 7 tests
- [ ] `pnpm test` exits 0 with 79 tests passing (78 → 79)
- [ ] `pnpm check` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm build` exits 0
- [ ] `pnpm test:prerender` exits 0
- [ ] `grep -F "text-cat-pbs" build/work/pbs-american-portrait/index.html` returns ≥2 matches (heading from Plan 03-02 + new TopNav active link from this plan)
- [ ] At least one other category accent class appears on its own slug page (e.g., `text-cat-promos` in `build/work/promos-and-trailers/index.html`)
- [ ] No category accent class appears on non-/work/<slug>/ pages (negative path preserved)
- [ ] Single git commit `fix(03-05): normalize pathname in TopNav isActive() for trailingSlash=always` covers both files
- [ ] 03-VERIFICATION.md gap is structurally closeable (a re-verification run would move the failed truth to verified — the verifier owns the actual status flip)
</success_criteria>

<output>
After completion, create `.planning/phases/03-grid-filter-watch/03-05-topnav-active-state-fix-SUMMARY.md` documenting:
- The exact one-line fix in `isActive(slug)` (`page.url.pathname.replace(/\/$/, '')`) and why this form (input normalization, not literal mutation) — single source of truth for the comparison literal stays canonical at `/work/<slug>` (matches the href value used elsewhere in the same template)
- The new trailing-slash regression test alongside the legacy no-trailing-slash test — both shapes now exercised; the regression cannot reappear silently
- The grep-on-prerendered-HTML proof: `grep -c "text-cat-pbs" build/work/pbs-american-portrait/index.html` returned 1 before this plan (heading only) and ≥2 after (heading + TopNav active link)
- The decision provenance chain: D-41 (CONTEXT.md) → 03-04 SUMMARY Decision #3 forward-note → 03-VERIFICATION.md confirmed-real gap → this plan's closure
- Cross-phase impact: zero — only TopNav.svelte and TopNav.test.ts changed; +layout.ts (`trailingSlash='always'` from Plan 03-03) is untouched, all other Phase 3 artifacts/key links/requirement IDs remain satisfied as 03-VERIFICATION.md attested
- Test count: 78 → 79 (one new trailing-slash test in `describe('TopNav — active state (D-41)', …)`)
- Forward note: 03-VERIFICATION.md should be re-run (or its status field updated) to move the gap from `failed` to `verified`. Phase 3 will then be fully verified end-to-end at both structural and behavioral levels.
</output>
