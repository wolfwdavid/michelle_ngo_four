---
phase: 04-reel-led-home
plan: 04
type: execute
wave: 1
depends_on: ["04-01", "04-02"]
files_modified:
  - src/lib/components/TopNav.svelte
  - src/lib/components/TopNav.test.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "On route '/', TopNav attaches an IntersectionObserver on document.getElementById('hero-sentinel') inside a $effect"
    - "When the sentinel is visible (hero in viewport), TopNav's <header> uses `bg-transparent border-transparent` (transparent over the hero image)"
    - "When the sentinel is NOT visible (scrolled past hero), or on ANY non-'/' route, TopNav's <header> uses the existing `bg-neutral-950/95 backdrop-blur border-white/10` (solid Phase 3 chrome)"
    - "On route change away from '/' OR component unmount, the IntersectionObserver is disconnected (cleanup returned from $effect)"
    - "Phase 3 NAV-01 behavior is preserved verbatim — wordmark, 8 category links in display order, About/Press/Contact secondary links, hamburger, active-state via isActive() — none of it changes"
    - "TopNav scroll-aware tests from Plan 04-01 turn green (describe.skip → describe)"
  artifacts:
    - path: "src/lib/components/TopNav.svelte"
      provides: "Scroll-aware-on-/ TopNav — extends Phase 3 with $effect + IntersectionObserver + $state heroVisible + $derived navClass"
      contains: "IntersectionObserver"
  key_links:
    - from: "src/lib/components/TopNav.svelte"
      to: "src/lib/components/HeroPoster.svelte"
      via: "document.getElementById('hero-sentinel') queried in $effect"
      pattern: "hero-sentinel"
    - from: "src/lib/components/TopNav.svelte $effect"
      to: "page.route.id from $app/state"
      via: "reactive read inside $effect body — re-runs on navigation"
      pattern: "page.route.id"
---

<objective>
Extend the existing `src/lib/components/TopNav.svelte` with **scroll-aware behavior on `/` only** (D-13 / D-14). When the user is on the home route AND the hero is in the viewport, the nav background becomes transparent so the wordmark + category links sit over the gradient-darkened poster image. When they scroll past the hero, or navigate to any other route, the nav reverts to the existing Phase 3 chrome (`bg-neutral-950/95 backdrop-blur border-b border-white/10`).

The mechanism (per 04-RESEARCH.md §Pattern 2 + Example 1):
1. `$effect` runs in the browser, re-runs whenever `page.route.id` changes.
2. Inside, check `page.route.id === '/'`. If not, ensure `heroVisible = false` and return (no observer).
3. If on `/`, `document.getElementById('hero-sentinel')` (placed by HeroPoster, Plan 04-02). Attach an `IntersectionObserver` that flips `heroVisible` based on `entry.isIntersecting`.
4. Return a cleanup function that calls `observer.disconnect()` — runs before re-execution (route change) and on unmount.

The class binding (per Pitfall 4 — Tailwind needs literal class strings):
- `$derived navClass` returns ONE of TWO literal strings (no concat, no dynamic interpolation).
- Both strings hold the same `sticky top-0 z-30 border-b` prefix so layout doesn't shift on transition.

Phase 3 machinery (wordmark, 8 category links, About/Press/Contact, hamburger, isActive() active-state) stays VERBATIM. This plan is a surgical extension, not a rewrite.

Output: 1 modified component file (TopNav.svelte), 1 modified test file (TopNav.test.ts unskipped), all green at `pnpm vitest run src/lib/components/TopNav.test.ts`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/04-reel-led-home/04-CONTEXT.md
@.planning/phases/04-reel-led-home/04-RESEARCH.md
@.planning/phases/04-reel-led-home/04-01-test-infrastructure-SUMMARY.md
@.planning/phases/04-reel-led-home/04-02-hero-poster-component-SUMMARY.md
@src/lib/components/TopNav.svelte
@src/lib/components/TopNav.test.ts

<interfaces>
<!-- The contract TopNav consumes (from HeroPoster, Plan 04-02). -->

HeroPoster.svelte renders this exact sentinel at the hero's bottom edge:
```html
<div id="hero-sentinel" class="absolute bottom-0 left-0 h-px w-full" aria-hidden="true"></div>
```
TopNav queries `document.getElementById('hero-sentinel')` inside the $effect.
If the route is not '/', or if the sentinel doesn't exist (defensive), TopNav stays solid.

Phase 3 TopNav script-level imports (already in place — do NOT remove):
```typescript
import { page } from '$app/state';        // for url.pathname (isActive) AND route.id (Phase 4 NEW)
import { base } from '$app/paths';
import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
import { categoryAccent } from './categoryAccent';
import MobileMenu from './MobileMenu.svelte';
```

The existing Phase 3 <header> class (Phase 4 replaces this fixed class with a $derived binding):
```html
<header class="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10">
```

The two literal navClass branches (Phase 4 — both MUST appear verbatim in source for Tailwind v4's scanner per Pitfall 4):
```
'sticky top-0 z-30 bg-transparent border-b border-transparent'
'sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10'
```

Tests already wired (from Plan 04-01) that will turn green after the implementation:
- `"scroll-aware home"` — TopNav on '/' attaches IntersectionObserver on #hero-sentinel
- `"solid on non-home"` — TopNav on /work, /work/[category], /watch/[id], /about, /press, /contact stays solid (bg-neutral-950) — all 6 D-13 routes are covered as individual it() cases inside the describe block
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Extend TopNav.svelte with $effect + IntersectionObserver scroll-aware behavior</name>
  <files>src/lib/components/TopNav.svelte, src/lib/components/TopNav.test.ts</files>
  <read_first>
    - src/lib/components/TopNav.svelte (FULL FILE — Phase 4 modifies the script + the header opening tag ONLY; rest of the template stays verbatim)
    - src/lib/components/TopNav.test.ts (Plan 04-01 appended `describe.skip` blocks for D-13/D-14 + modified mockPage to add `route` field — this task flips skips to describe)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Architecture Pattern 2 (the full TopNav script delta — verbatim shape)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Code Examples → Example 1 ($effect IntersectionObserver cleanup)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 1 (sentinel timing — start without tick(), guard with `if (!sentinel) return`)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 2 (page.route.id MUST be read inside $effect body, not captured to a top-level const)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 4 (Tailwind needs literal class strings — both navClass branches verbatim)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 9 (use `page.route.id === '/'` NOT `pathname === '/'`)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-13 (transparent on /, solid elsewhere — explicit cross-route lock)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-14 (IntersectionObserver, sentinel, cleanup, encapsulated in TopNav.svelte)
  </read_first>
  <behavior>
    Tests expected to pass (7 tests across 2 new describe blocks in TopNav.test.ts, after `describe.skip` → `describe`):
    - Test 1 (`scroll-aware home`): on route '/', after mount, the TrackingIO stub captures #hero-sentinel as an observed element (observer.observe(sentinel) called with the sentinel div)
    - Test 2 (`scroll-aware home`): on route '/' with sentinel NOT intersecting (default state), the <header> has class containing `bg-neutral-950`
    - Test 3 (`solid on non-home` /work): on route '/work', <header> has `bg-neutral-950` AND does NOT have `bg-transparent`
    - Test 4 (`solid on non-home` /work/[category]): same
    - Test 5 (`solid on non-home` /watch/[id]): same
    - Test 6 (`solid on non-home` /about): same
    - Test 7 (`solid on non-home` /press): same
    - Test 8 (`solid on non-home` /contact): same

    ALL existing Phase 3 TopNav tests stay green (NAV-01 baseline + D-41 active state) — Phase 4 changes are additive to the script and replace ONE class string on the <header> tag.
  </behavior>
  <action>
    Open `src/lib/components/TopNav.svelte`. Apply THREE precise edits — script additions, the `<header>` class binding, and nothing else.

    **Edit 1 — extend the <script> block.** The current Phase 3 script has imports + `categories` const + `mobileOpen` $state + `isActive()` function. After the `let mobileOpen = $state(false);` line and BEFORE the `function isActive(slug: string)` declaration, INSERT:

    ```ts

      // Phase 4 D-13/D-14: scroll-aware transparency, ONLY on route '/'.
      // When the hero is in viewport (sentinel intersecting), nav goes transparent
      // so name + tagline + CTA sit over the gradient-darkened poster. When the
      // user scrolls past the hero OR navigates to any other route, nav reverts
      // to the existing Phase 3 chrome.
      //
      // The sentinel <div id="hero-sentinel"> is rendered by HeroPoster.svelte
      // at the hero's bottom edge. TopNav queries it by id.
      //
      // Reactivity contract (Pitfall 2): page.route.id is read INSIDE the $effect
      // body so $effect re-runs whenever the route id changes. Capturing to a
      // top-level const would break reactivity.
      //
      // Tailwind contract (Pitfall 4): navClass is a $derived ternary of TWO
      // LITERAL strings — both must appear verbatim in source so Tailwind's
      // text-scanner tokenizes every utility class.
      let heroVisible = $state(false);

      $effect(() => {
        // $effect runs ONLY in the browser (Svelte 5 guarantee — no typeof window guard needed).
        const onHomeRoute = page.route.id === '/';
        if (!onHomeRoute) {
          // Any non-/ route: solid nav, no observer. Defensive reset in case the
          // user navigated AWAY from / while observer was still attached.
          heroVisible = false;
          return; // no cleanup — no observer to disconnect
        }

        // On /: find the sentinel HeroPoster rendered. If it doesn't exist yet
        // (mount order timing — Pitfall 1), keep nav solid for this tick. The
        // $effect re-runs on route id change so subsequent /-route mounts retry.
        const sentinel = document.getElementById('hero-sentinel');
        if (!sentinel) {
          heroVisible = false;
          return;
        }

        const observer = new IntersectionObserver(
          ([entry]) => {
            // entry is guaranteed (we observe exactly one element).
            heroVisible = entry?.isIntersecting ?? false;
          },
          { threshold: 0 }
        );
        observer.observe(sentinel);

        return () => {
          observer.disconnect();
        };
      });

      // Both branches are literal strings so Tailwind v4's scanner generates every
      // utility class (Pitfall 4). Common prefix `sticky top-0 z-30 border-b`
      // keeps layout stable across the transition.
      const navClass = $derived(
        heroVisible
          ? 'sticky top-0 z-30 bg-transparent border-b border-transparent'
          : 'sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10'
      );
    ```

    The `import { page } from '$app/state'` import is ALREADY in the file (Phase 3) — do NOT re-import. Same for `base`, `getCategoriesInDisplayOrder`, `categoryToSlug`, `categoryAccent`, `MobileMenu`.

    **Edit 2 — bind the <header> class to navClass.** The current opening tag is:

    ```html
    <header class="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10">
    ```

    REPLACE with:

    ```html
    <header class={navClass}>
    ```

    Do NOT change the closing `</header>` tag. Do NOT change ANYTHING inside the header (nav, ul, links, hamburger, MobileMenu) — all Phase 3 NAV-01 + D-41 machinery stays verbatim.

    **Edit 3 — update the file's top-of-file comment to acknowledge the Phase 4 extension.** The existing comment block lists "Decisions implemented:" with D-09, D-39, D-40, D-41, D-42, D-14 (Phase 3). APPEND a new section at the end of that comment block. The marker string `Phase 4 additions:` MUST appear verbatim — an automated grep verifies it landed:

    ```svelte
      Phase 4 additions:
        D-13 — scroll-aware transparency mode ON `/` ONLY (transparent over hero, solid past it)
        D-14 — IntersectionObserver on #hero-sentinel (rendered by HeroPoster.svelte), wired via $effect with cleanup on route change / unmount
    ```

    No other file modifications. Run `pnpm check` after editing — if svelte-check flags `page.route` access (it shouldn't; Phase 3 already imports `page` from `$app/state`), the issue is likely that `$app/state` types don't yet include `route` in the user's installed kit version. If that surfaces, document in summary; tests will still pass because mockPage in TopNav.test.ts provides `route.id` explicitly.

    **Step B — flip TopNav.test.ts skips to describe.** In `src/lib/components/TopNav.test.ts`, find the two `describe.skip(` blocks Plan 04-01 appended at the end (`'TopNav — D-13 scroll-aware on home'` and `'TopNav — D-13 solid on non-home routes'`) and change `describe.skip(` → `describe(` for both. No other edits needed in the test file — the new mockPage `route` field was added in Plan 04-01 already, and the 6 it() cases covering all D-13 routes (/work, /work/[category], /watch/[id], /about, /press, /contact) are already in place.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/components/TopNav.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/components/TopNav.svelte` contains the literal `IntersectionObserver`
    - TopNav.svelte contains the literal `$effect`
    - TopNav.svelte contains the literal `page.route.id === '/'`
    - TopNav.svelte contains the literal `document.getElementById('hero-sentinel')`
    - TopNav.svelte contains the literal `let heroVisible = $state(false)`
    - TopNav.svelte contains the literal `observer.disconnect()`
    - TopNav.svelte contains BOTH literal class strings: `'sticky top-0 z-30 bg-transparent border-b border-transparent'` AND `'sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10'`
    - TopNav.svelte `<header>` tag uses `class={navClass}` (not a literal class string)
    - **Edit 3 comment landed:** `grep -c "Phase 4 additions:" src/lib/components/TopNav.svelte` >= 1 (enforces the top-of-file comment update from Edit 3 — if executor skipped the comment, this check fails)
    - `grep -c "describe.skip" src/lib/components/TopNav.test.ts` equals 0
    - `pnpm vitest run src/lib/components/TopNav.test.ts -t "scroll-aware home"` exits 0
    - `pnpm vitest run src/lib/components/TopNav.test.ts -t "solid on non-home"` exits 0 (runs all 6 it() cases inside the describe block — /work, /work/[category], /watch/[id], /about, /press, /contact — all green)
    - `pnpm vitest run src/lib/components/TopNav.test.ts` exits 0 (full suite — Phase 3 NAV-01 + D-41 tests still pass)
    - `pnpm test` exits 0
    - `pnpm check` exits 0 (note: if svelte-check flags `page.route.id` due to Kit type defs, address per Phase 3 D-41 deviation note in STATE.md — likely no issue since `route` is part of the documented `$app/state` API; if it surfaces, surface to SUMMARY)
    - `pnpm build` exits 0
  </acceptance_criteria>
  <done>
    TopNav is scroll-aware on `/` only. Phase 3 behavior is preserved (every existing test still green). Plan 04-05 (page composition) can render `<HeroPoster />` knowing the layout's TopNav will go transparent over it and reattach the observer cleanly across navigations.
  </done>
</task>

</tasks>

<verification>
After the task:

1. `pnpm vitest run src/lib/components/TopNav.test.ts` — exits 0 (Phase 3 + Phase 4 suites all green).
2. `pnpm check` — exits 0.
3. `pnpm build` — exits 0 (Tailwind's scanner finds both `bg-transparent border-transparent` and `bg-neutral-950/95 backdrop-blur border-white/10` as literal source occurrences; both class sets ship in the built CSS).
4. Visual sanity (manual, deferred to Plan 04-05 + UAT): runtime check that hero-sentinel intersection actually flips classes. In Vitest, the stubbed IntersectionObserver never fires `isIntersecting=true` automatically (would need a manual `cb([{ isIntersecting: true }])` in a test); the GREEN tests verify the OBSERVE call + the SOLID default state, not the live transition. The live transition is exercised in Plan 04-05's visual UAT (per 04-VALIDATION.md manual-only verifications).
</verification>

<success_criteria>
Plan 04-04 is complete when:

- [ ] TopNav.svelte has a $effect that attaches IntersectionObserver to #hero-sentinel ONLY when page.route.id === '/'
- [ ] TopNav.svelte's <header> uses `class={navClass}` with a $derived ternary of two literal class strings
- [ ] Cleanup function disconnects the observer on route change / unmount
- [ ] TopNav.svelte top-of-file comment block contains the `Phase 4 additions:` marker (grep verified)
- [ ] All Phase 3 NAV-01 tests + Phase 4 D-13/D-14 tests in TopNav.test.ts are GREEN (no skips), including all 6 "solid on non-home" route cases (/work, /work/[category], /watch/[id], /about, /press, /contact)
- [ ] No regression: `pnpm test && pnpm check && pnpm build` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-reel-led-home/04-04-topnav-scroll-aware-SUMMARY.md` per the standard summary template.
</output>
