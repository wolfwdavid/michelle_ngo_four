---
phase: 03-grid-filter-watch
plan: 04
type: execute
wave: 3
depends_on: ["03-00", "03-01", "03-02", "03-03"]
files_modified:
  - src/lib/components/TopNav.svelte
  - src/lib/components/MobileMenu.svelte
  - src/lib/components/TopNav.test.ts
  - src/routes/+layout.svelte
  - src/routes/about/+page.svelte
  - src/routes/press/+page.svelte
  - src/routes/contact/+page.svelte
autonomous: true
requirements:
  - NAV-01
must_haves:
  truths:
    - "`TopNav.svelte` renders the wordmark `MICHELLE NGO` linking to `/` (BASE_PATH-safe), 8 category links in `getCategoriesInDisplayOrder()` order (D-40), and About / Press / Contact secondary links at the far right with quieter visual weight (D-40)."
    - "Category links use `${base}/work/${categoryToSlug(category)}` hrefs and have `data-sveltekit-preload-data=\"hover\"` (D-14 carry-forward) for hover prefetch."
    - "On `/work/<slug>`, the matching category link gets the per-category accent class via `categoryAccent(category)` (D-41). On `/work` and `/watch/<id>`, no category link is highlighted (D-41)."
    - "`MobileMenu.svelte` is a full-screen overlay (`bg-black/95`) listing the wordmark, all 8 categories stacked, then About/Press/Contact below a `border-white/10` divider (D-42). Closes via close button or link tap."
    - "TopNav sticks (`position: sticky; top: 0; z-index: 30`) with backdrop-blur and a `border-b border-white/10` divider (D-09)."
    - "`src/routes/+layout.svelte` imports and renders `<TopNav />` so every route inherits it (D-39). The Phase 1 noindex meta + body wrapper stays intact."
    - "Three minimal placeholder routes exist: `/about`, `/press`, `/contact` — each renders a heading + 'Coming soon' line (D-43). Phase 6 replaces content; URLs don't change."
    - "All `describe.skip` blocks in `src/lib/components/TopNav.test.ts` (2) have had `.skip` removed and turn GREEN."
    - "`pnpm build` emits `build/about/index.html`, `build/press/index.html`, `build/contact/index.html` in addition to all the Wave 2 routes."
  artifacts:
    - path: "src/lib/components/TopNav.svelte"
      provides: "Top nav with wordmark + 8 category links (active state via $app/state page) + secondary About/Press/Contact + hamburger trigger"
    - path: "src/lib/components/MobileMenu.svelte"
      provides: "Full-screen overlay menu for <sm breakpoint — bg-black/95, stacked links, close button + onclose callback"
    - path: "src/routes/+layout.svelte"
      provides: "App shell — keeps Phase 1 noindex meta, adds <TopNav /> above {@render children()}"
    - path: "src/routes/about/+page.svelte"
      provides: "Placeholder /about page — 'About — Coming soon' (Phase 6 replaces)"
    - path: "src/routes/press/+page.svelte"
      provides: "Placeholder /press page — Phase 6 replaces"
    - path: "src/routes/contact/+page.svelte"
      provides: "Placeholder /contact page — Phase 6 replaces"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "src/lib/components/TopNav.svelte"
      via: "import TopNav from '$lib/components/TopNav.svelte'"
      pattern: "import TopNav from"
    - from: "src/lib/components/TopNav.svelte"
      to: "$lib/data"
      via: "import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data'"
      pattern: "getCategoriesInDisplayOrder"
    - from: "src/lib/components/TopNav.svelte"
      to: "src/lib/components/categoryAccent.ts"
      via: "import { categoryAccent } from './categoryAccent' for active-state highlighting"
      pattern: "categoryAccent"
    - from: "src/lib/components/TopNav.svelte"
      to: "$app/state"
      via: "import { page } from '$app/state' for reactive pathname → active-link detection (D-41)"
      pattern: "from\\s+['\"]\\$app/state['\"]"
    - from: "src/lib/components/TopNav.svelte"
      to: "src/lib/components/MobileMenu.svelte"
      via: "conditional render: {#if mobileOpen}<MobileMenu onclose={...} />{/if}"
      pattern: "MobileMenu"
---

<objective>
Ship `TopNav.svelte` + `MobileMenu.svelte`, wire them into `src/routes/+layout.svelte` so every route inherits the nav, and add the three minimal `/about`, `/press`, `/contact` placeholder routes so nav links don't 404. Implements NAV-01 and the last 5 success criteria checkbox of Phase 3.

Purpose: Wave 3 of Phase 3. Depends on:
- Plan 03-01 (categoryAccent helper for active-link color, CategoryTag patterns).
- Plan 03-02 (provides `/work/<slug>` routes that the active-state highlighting checks against — without these the active-state test's URL would lead to a 404 page, breaking the layout assertion).
- Plan 03-03 (provides `/watch/<id>` routes — the test for "no category active on /watch" needs that route to exist).
- Plan 03-00 (provides the TopNav.test.ts stub with `$app/state` and `$app/paths` mocks).

Output:
- `src/lib/components/TopNav.svelte` — wordmark + 8 category links + secondary links + hamburger
- `src/lib/components/MobileMenu.svelte` — full-screen overlay (`bg-black/95`)
- `src/lib/components/TopNav.test.ts` — 2 describe.skip → describe; 7 tests pass
- `src/routes/+layout.svelte` — imports TopNav, renders above children
- `src/routes/about/+page.svelte`, `src/routes/press/+page.svelte`, `src/routes/contact/+page.svelte` — 3 minimal placeholders
- `pnpm build` emits the placeholder pages
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
@.planning/phases/03-grid-filter-watch/03-RESEARCH.md
@.planning/phases/03-grid-filter-watch/03-VALIDATION.md

<interfaces>
<!-- Phase 1 carry-forward: noindex meta in +layout.svelte, BASE_PATH wiring, prerender=true in +layout.ts. -->
<!-- Phase 2 carry-forward: getCategoriesInDisplayOrder, categoryToSlug from $lib/data. -->
<!-- Plan 03-01 carry-forward: categoryAccent helper. -->
<!-- Plan 03-02 carry-forward: /work and /work/<slug> routes exist. -->
<!-- Plan 03-03 carry-forward: /watch/<id> routes exist. -->

From src/routes/+layout.svelte (Phase 1 — CURRENT state):
```svelte
<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <title>Michelle Ngo</title>
</svelte:head>

{@render children()}
```
Phase 3 modifies this to add `<TopNav />` BEFORE `{@render children()}`. The noindex meta MUST stay (Phase 1 D-11, Phase 7 owns its removal).

From src/lib/data/index.ts (Phase 2):
- `getCategoriesInDisplayOrder()` returns `readonly Category[]` (8 categories in count-desc-tie-alpha order).
- `categoryToSlug(category)` returns the kebab-case slug ('PBS American Portrait' → 'pbs-american-portrait').

From src/lib/components/categoryAccent.ts (Plan 03-01):
- `categoryAccent(category)` returns the literal `text-cat-*` class string.

From src/lib/components/TopNav.test.ts (Plan 03-00 stub):
- 2 describe.skip blocks:
  - 'TopNav — NAV-01 baseline rendering (D-39, D-40)' (4 tests): wordmark, 8 category links in order, About/Press/Contact present, /work/<slug> hrefs.
  - 'TopNav — active state (D-41)' (3 tests): PBS link gets cat-pbs class on /work/pbs-american-portrait; no category highlighted on /work; no category highlighted on /watch/<id>.
- 7 tests total.
- Test setup mocks `$app/state` with `{ page: mockPage }` where `mockPage.url` is mutable per-test.
- Test setup mocks `$app/paths` with `{ base: '' }`.

03-RESEARCH.md $app/state pattern (lines 762-769):
```ts
// SvelteKit 2.27+ rune-friendly reactive page state
import { page } from '$app/state';
// page.url.pathname is reactive within Svelte components.
```
Important: `page` from `$app/state` is NOT a store — it's a runed object. Direct access (`page.url.pathname`) is reactive inside .svelte files. No `$page.url.pathname` (the legacy store syntax).

03-RESEARCH.md Pattern 8 (lines 569-639) provides the full TopNav shape — copy verbatim, adapt for D-43 (placeholder routes already exist when this plan runs, so the About/Press/Contact links resolve to real pages).

D-40 layout (literal):
- Wordmark `MICHELLE NGO` on the LEFT (clickable → /).
- 8 category links INLINE in `getCategoriesInDisplayOrder()` order (middle/right).
- About / Press / Contact at the FAR RIGHT with quieter visual weight (`text-neutral-500`).
- All-caps tracked sans (matches splash typography).

D-41 active state:
- `page.url.pathname === \`${base}/work/${slug}\`` ⇒ that category's link gets `categoryAccent(category)` class.
- All other category links get `text-neutral-300 hover:text-white`.
- About/Press/Contact never get accent treatment.

D-42 mobile overlay:
- Triggered by hamburger button (visible only `<sm`).
- Full-screen `fixed inset-0 z-50 bg-black/95`.
- Wordmark + 8 stacked category links + divider + About/Press/Contact.
- Close button (top-right) + clicking any link closes the overlay.
- Animation: instant (D-CONTEXT discretion — instant is fine for v1).

D-43 placeholder routes:
- Each is a single `+page.svelte` with `<h1>About</h1>` (or Press/Contact) + a short "Coming soon" line.
- No `+page.ts` needed (inherit `prerender = true` from +layout.ts).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build TopNav.svelte + MobileMenu.svelte, wire into +layout.svelte, unskip TopNav.test.ts</name>
  <files>src/lib/components/TopNav.svelte, src/lib/components/MobileMenu.svelte, src/lib/components/TopNav.test.ts, src/routes/+layout.svelte</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-39 lives in +layout.svelte, D-40 desktop layout exact, D-41 active state, D-42 mobile overlay, D-43 placeholder routes exist)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 569-639 Pattern 8 — exact TopNav + MobileMenu shape; lines 762-769 $app/state reactivity contract)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\TopNav.test.ts (Plan 03-00 stub — 2 describe.skip blocks with 7 tests; mocks $app/state and $app/paths)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\categoryAccent.ts (Plan 03-01 — active-state color source)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\index.ts (Phase 2 — getCategoriesInDisplayOrder, categoryToSlug)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\+layout.svelte (Phase 1 — CURRENT minimal shape; must preserve `import '../app.css'`, noindex meta, and `{@render children()}`)
  </read_first>
  <behavior>
    Baseline (4 tests):
    - Test 1 (`'renders the MICHELLE NGO wordmark linking to /'`): a header > a with textContent containing 'michelle ngo'.
    - Test 2 (`'renders all 8 category links in getCategoriesInDisplayOrder() order'`): the 8 links whose textContent matches a Category exactly are in display order.
    - Test 3 (`'renders About / Press / Contact secondary links'`): textContent of some `<a>` equals 'About', another 'Press', another 'Contact'.
    - Test 4 (`'category links use /work/<slug> hrefs'`): the 'PBS American Portrait' link's href === '/work/pbs-american-portrait' (with mocked base=='').

    Active state (3 tests):
    - Test 5 (`'on /work/pbs-american-portrait, PBS link gets cat-pbs accent class'`): mocked page.url='/work/pbs-american-portrait' → PBS link.className matches /text-cat-pbs/.
    - Test 6 (`'on /work (no filter), no category link is highlighted'`): mocked page.url='/work' → zero category links have a text-cat-* class.
    - Test 7 (`'on /watch/<id>, no category link is highlighted'`): mocked page.url='/watch/264677021' → zero category links have a text-cat-* class.
  </behavior>
  <action>
    Step 1 — Create `src/lib/components/MobileMenu.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 D-42: full-screen mobile overlay menu. Triggered from TopNav's
      hamburger (visible only <sm). Closes via close button or any link tap.

      Animation: instant (no transition) — sidesteps prefers-reduced-motion
      handling per CONTEXT.md Claude's Discretion.
    -->
    <script lang="ts">
      import { base } from '$app/paths';
      import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';

      type Props = {
        /** Called when the user closes the menu (close button or link tap). */
        onclose: () => void;
      };
      let { onclose }: Props = $props();

      const categories = getCategoriesInDisplayOrder();
    </script>

    <div class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
      <div class="flex items-center justify-between px-4 h-14 border-b border-white/10">
        <a
          href={base || '/'}
          onclick={onclose}
          class="text-sm font-bold uppercase tracking-widest"
        >
          Michelle Ngo
        </a>
        <button
          type="button"
          class="p-2 -mr-2"
          aria-label="Close menu"
          onclick={onclose}
        >
          <span class="block w-5 h-px bg-white rotate-45 translate-y-px"></span>
          <span class="block w-5 h-px bg-white -rotate-45 -translate-y-px"></span>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 py-6">
        <ul class="space-y-4 text-base uppercase tracking-wider">
          {#each categories as category (category)}
            <li>
              <a
                href={`${base}/work/${categoryToSlug(category)}`}
                onclick={onclose}
                class="block hover:underline"
              >
                {category}
              </a>
            </li>
          {/each}
        </ul>

        <hr class="my-6 border-white/10" />

        <ul class="space-y-3 text-sm uppercase tracking-wider text-neutral-400">
          <li>
            <a href={`${base}/about`} onclick={onclose} class="block hover:text-white">About</a>
          </li>
          <li>
            <a href={`${base}/press`} onclick={onclose} class="block hover:text-white">Press</a>
          </li>
          <li>
            <a href={`${base}/contact`} onclick={onclose} class="block hover:text-white">Contact</a>
          </li>
        </ul>
      </nav>
    </div>
    ```

    Notes:
    - `fixed inset-0 z-50` puts the overlay above the (sticky z-30) TopNav.
    - `bg-black/95` per D-42.
    - Close button uses two rotated divs forming an `×` — keeps the SVG-free, dependency-free aesthetic.
    - Every link calls `onclose` on click → consumer of MobileMenu sets `mobileOpen = false`.
    - The wordmark also calls onclose — clicking it both navigates AND closes the menu.

    Step 2 — Create `src/lib/components/TopNav.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 NAV-01: top nav — wordmark + 8 categories + About/Press/Contact.
      Sticky at desktop AND mobile (per 03-RESEARCH.md Open Question 4 recommendation:
      single behavior reads as one design intent; backdrop-blur prevents content bleed).

      Decisions implemented:
        D-09 — hairline border-b border-white/10 divider below the nav
        D-39 — lives in +layout.svelte (this component is imported there)
        D-40 — wordmark left, 8 categories inline, About/Press/Contact quieter at far right
        D-41 — active category gets categoryAccent() class; /work and /watch never highlight
        D-42 — hamburger triggers MobileMenu overlay (<sm only)
        D-14 carry-forward — data-sveltekit-preload-data="hover" on category links

      $app/state contract: page.url.pathname is REACTIVE inside .svelte files (SvelteKit 2.27+).
      Active-link detection re-runs whenever the user navigates.
    -->
    <script lang="ts">
      import { page } from '$app/state';
      import { base } from '$app/paths';
      import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
      import { categoryAccent } from './categoryAccent';
      import MobileMenu from './MobileMenu.svelte';

      const categories = getCategoriesInDisplayOrder();
      let mobileOpen = $state(false);

      function isActive(slug: string): boolean {
        return page.url.pathname === `${base}/work/${slug}`;
      }
    </script>

    <header class="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href={base || '/'} class="text-sm font-bold uppercase tracking-widest">Michelle Ngo</a>

        <!-- Desktop links (≥sm) -->
        <ul class="hidden sm:flex items-center gap-4 text-xs uppercase tracking-wider">
          {#each categories as category (category)}
            {@const slug = categoryToSlug(category)}
            <li>
              <a
                href={`${base}/work/${slug}`}
                data-sveltekit-preload-data="hover"
                class={isActive(slug) ? categoryAccent(category) : 'text-neutral-300 hover:text-white'}
              >
                {category}
              </a>
            </li>
          {/each}
          <li class="ml-2 flex gap-3 text-neutral-500">
            <a href={`${base}/about`} class="hover:text-white">About</a>
            <a href={`${base}/press`} class="hover:text-white">Press</a>
            <a href={`${base}/contact`} class="hover:text-white">Contact</a>
          </li>
        </ul>

        <!-- Hamburger (<sm) -->
        <button
          type="button"
          class="sm:hidden p-2 -mr-2"
          aria-label="Open menu"
          onclick={() => (mobileOpen = true)}
        >
          <span class="block w-5 h-0.5 bg-white mb-1"></span>
          <span class="block w-5 h-0.5 bg-white mb-1"></span>
          <span class="block w-5 h-0.5 bg-white"></span>
        </button>
      </nav>
    </header>

    {#if mobileOpen}
      <MobileMenu onclose={() => (mobileOpen = false)} />
    {/if}
    ```

    Notes:
    - `{@const slug = categoryToSlug(category)}` — Svelte's const-in-each lets the link href and the isActive check share one slug computation.
    - `class={isActive(slug) ? categoryAccent(category) : 'text-neutral-300 hover:text-white'}` — single class binding; Tailwind generates both `text-cat-*` (from categoryAccent.ts literals — Pitfall 7) AND `text-neutral-300` (used in source here).
    - `data-sveltekit-preload-data="hover"` on the 8 category links (D-14 carry-forward / 03-RESEARCH.md Open Question recommendation: keep hover for 8 links, prefetch storm risk is minimal).
    - About/Press/Contact use `text-neutral-500` (quieter — D-40) and don't have prefetch hints (lower priority routes).
    - Sticky `top-0 z-30 bg-neutral-950/95 backdrop-blur` works at all breakpoints (mobile included); the MobileMenu overlay (`z-50`) sits above it when open.
    - The wordmark `href={base || '/'}` — when `base` is empty, fall back to `'/'` (otherwise the href would be empty and the link wouldn't render meaningfully).

    Step 3 — Replace `src/routes/+layout.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 1 chrome: app.css import + noindex meta (D-11; stays through Phase 6 per Pitfall 9).
      Phase 3 addition: top nav above every route (D-39).
    -->
    <script lang="ts">
      import '../app.css';
      import TopNav from '$lib/components/TopNav.svelte';
      let { children } = $props();
    </script>

    <svelte:head>
      <meta name="robots" content="noindex, nofollow" />
      <title>Michelle Ngo</title>
    </svelte:head>

    <TopNav />

    {@render children()}
    ```

    Notes:
    - PRESERVE the `import '../app.css';` (Phase 1 must-have).
    - PRESERVE the noindex meta (Phase 1 D-11; Phase 7 owns its removal).
    - PRESERVE the global `<title>Michelle Ngo</title>` — per-route `<svelte:head><title>` calls override this.
    - The TopNav renders BEFORE `{@render children()}` so it appears above page content.

    Step 4 — In `src/lib/components/TopNav.test.ts`:

    a. Remove the line `// @ts-expect-error — component exists after Plan 03-04` directly above the `import TopNav from './TopNav.svelte';` line.

    b. Change BOTH `describe.skip(...)` calls to `describe(...)`:
       - `describe.skip('TopNav — NAV-01 baseline rendering (D-39, D-40)', ...)` → `describe(...)`
       - `describe.skip('TopNav — active state (D-41)', ...)` → `describe(...)`

    The header of the file should now read:

    ```ts
    import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

    const mockPage = { url: new URL('http://localhost/') };
    vi.mock('$app/state', () => ({ page: mockPage }));
    vi.mock('$app/paths', () => ({ base: '' }));

    import { mount, unmount } from 'svelte';
    import TopNav from './TopNav.svelte';
    import { getCategoriesInDisplayOrder } from '$lib/data';
    ```

    Step 5 — Run the test file:
    ```
    pnpm vitest run src/lib/components/TopNav.test.ts
    ```
    Expected: 7 tests pass.

    Step 6 — Run `pnpm check` — expected: exit 0.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/components/TopNav.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/MobileMenu.svelte` exists.
    - MobileMenu contains the literal string `import { base } from '$app/paths';`.
    - MobileMenu contains the literal string `import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';`.
    - MobileMenu contains the literal string `let { onclose }: Props = $props();`.
    - MobileMenu contains the literal string `fixed inset-0 z-50 bg-black/95` (D-42 overlay).
    - MobileMenu contains the literal string `aria-label="Close menu"`.
    - MobileMenu contains the literal string `onclick={onclose}` (every link/button closes on tap).
    - MobileMenu contains the literal string `border-white/10` (D-09 divider between categories and secondary links).
    - File `src/lib/components/TopNav.svelte` exists.
    - TopNav contains the literal string `import { page } from '$app/state';`.
    - TopNav contains the literal string `import { base } from '$app/paths';`.
    - TopNav contains the literal string `import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';`.
    - TopNav contains the literal string `import { categoryAccent } from './categoryAccent';`.
    - TopNav contains the literal string `import MobileMenu from './MobileMenu.svelte';`.
    - TopNav contains the literal string `let mobileOpen = $state(false);`.
    - TopNav contains the literal string `` page.url.pathname === `${base}/work/${slug}` `` (D-41 active check).
    - TopNav contains the literal string `data-sveltekit-preload-data="hover"`.
    - TopNav contains the literal string `sticky top-0 z-30`.
    - TopNav contains the literal string `bg-neutral-950/95 backdrop-blur` AND `border-b border-white/10`.
    - TopNav contains the literal string `{categoryAccent(category)}` (used in the active-state ternary).
    - TopNav contains the literal string `text-neutral-500` (D-40 quieter weight on About/Press/Contact).
    - TopNav contains the literal string `text-neutral-300` (D-40 default weight on inactive category links).
    - TopNav contains the literal string `aria-label="Open menu"`.
    - TopNav contains the literal string `{#if mobileOpen}` AND the literal `<MobileMenu`.
    - `src/routes/+layout.svelte` exists and contains the literal string `import '../app.css';`.
    - `src/routes/+layout.svelte` contains the literal string `import TopNav from '$lib/components/TopNav.svelte';`.
    - `src/routes/+layout.svelte` contains the literal string `<meta name="robots" content="noindex, nofollow" />` (Phase 1 D-11 preserved).
    - `src/routes/+layout.svelte` contains the literal string `<TopNav />` BEFORE the literal `{@render children()}`. Verifiable by running `grep -n "TopNav\\|@render children" src/routes/+layout.svelte` — line numbers must be in that order.
    - `src/lib/components/TopNav.test.ts` no longer contains `describe.skip`.
    - `src/lib/components/TopNav.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/lib/components/TopNav.test.ts` exits 0 with 7 tests passing.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    TopNav.svelte + MobileMenu.svelte exist and implement D-39 through D-42 + D-14 prefetch + D-09 divider. +layout.svelte renders TopNav above children while preserving Phase 1 noindex + app.css imports. All 7 TopNav tests pass.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add /about, /press, /contact placeholder routes (D-43) and run full Phase 3 verification</name>
  <files>src/routes/about/+page.svelte, src/routes/press/+page.svelte, src/routes/contact/+page.svelte</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-43 minimal placeholder routes; D-44 "/" stays as Phase 1 splash)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\+page.svelte (Phase 1 splash — visual reference for the placeholder typography; matches `tracking-widest uppercase` pattern)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\+layout.ts (Phase 1 — `export const prerender = true;` — every placeholder inherits this; no per-route +page.ts needed)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\scripts\test-prerender-coverage.mjs (Plan 03-00 — ensure /work and /watch counts still hold after this plan's build)
  </read_first>
  <action>
    Step 1 — Create `src/routes/about/+page.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 D-43 placeholder. Phase 6 replaces with real bio + headshot + links.
      URL doesn't change. Inherits prerender=true from +layout.ts.
    -->
    <svelte:head>
      <title>Michelle Ngo — About</title>
    </svelte:head>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">About</h1>
      <p class="mt-4 text-sm text-neutral-400">Coming soon.</p>
    </main>
    ```

    Step 2 — Create `src/routes/press/+page.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 D-43 placeholder. Phase 6 replaces with real broadcast credits
      (HBO Max, PBS, Hulu, Amazon, U2 Sphere, Music Box, etc.).
    -->
    <svelte:head>
      <title>Michelle Ngo — Press</title>
    </svelte:head>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Press</h1>
      <p class="mt-4 text-sm text-neutral-400">Coming soon.</p>
    </main>
    ```

    Step 3 — Create `src/routes/contact/+page.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 D-43 placeholder. Phase 6 replaces with real contact block
      (email mailto:, phone, IMDb, LinkedIn, Vimeo) — also footer-mirrored.
    -->
    <svelte:head>
      <title>Michelle Ngo — Contact</title>
    </svelte:head>

    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Contact</h1>
      <p class="mt-4 text-sm text-neutral-400">Coming soon.</p>
    </main>
    ```

    Each route is dependency-free: no `+page.ts`, no `+page.server.ts`, just the .svelte file. They inherit `export const prerender = true` from `src/routes/+layout.ts` (Phase 1).

    Step 4 — Run the full phase verification:

    ```
    pnpm check && pnpm test && pnpm build && pnpm test:prerender
    ```

    Expected: all four exit 0. After build:
    - `build/index.html` (Phase 1 splash + Phase 3 TopNav).
    - `build/about/index.html`, `build/press/index.html`, `build/contact/index.html` (new this plan).
    - `build/work/index.html` (Plan 03-02).
    - 8 `build/work/<slug>/index.html` (Plan 03-02).
    - 56 `build/watch/<id>/index.html` (Plan 03-03).
    - `build/404.html` (adapter-static emits this from +error.svelte, Plan 03-03).

    Total: 1 + 3 + 1 + 8 + 56 + 1 = ~70 prerendered HTML files (plus `_app/` assets).

    `pnpm test:prerender` confirms the /work and /watch counts (1 work index + 8 work/<slug> + 56 watch/<id>) — passes.

    `pnpm test` final count: 32 data + 14 VideoCard + 6 CategoryTag + 7 TopNav + 3 /work + 7 /work/[category] + 9 /watch/[id] = 78 tests passing.
  </action>
  <verify>
    <automated>pnpm test:prerender</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/about/+page.svelte` exists.
    - File contains the literal string `<h1` AND the literal text `About`.
    - File contains the literal text `Coming soon.`.
    - File `src/routes/press/+page.svelte` exists.
    - File contains the literal string `<h1` AND the literal text `Press`.
    - File `src/routes/contact/+page.svelte` exists.
    - File contains the literal string `<h1` AND the literal text `Contact`.
    - No `+page.ts` files exist for about/press/contact (the prerender inherits from +layout.ts).
    - `pnpm check` exits 0.
    - `pnpm test` exits 0 with 78 tests passing total (32 data + 20 components + 7 TopNav + 10 work routes + 9 watch route).
    - `pnpm build` exits 0.
    - After `pnpm build`: `build/about/index.html`, `build/press/index.html`, `build/contact/index.html` all exist.
    - After `pnpm build`: `build/index.html` (Phase 1 splash) still exists and now contains the TopNav HTML (verifiable: `grep -c "Michelle Ngo" build/index.html` returns ≥1).
    - After `pnpm build`: `build/work/index.html` exists.
    - After `pnpm build`: counting `build/work/*/index.html` directories: exactly 8.
    - After `pnpm build`: counting `build/watch/*/index.html` directories: exactly 56.
    - After `pnpm build`: `build/404.html` exists (adapter-static fallback from +error.svelte).
    - `pnpm test:prerender` exits 0.
  </acceptance_criteria>
  <done>
    Three minimal placeholder routes (/about, /press, /contact) exist and emit during build (D-43). The full Phase 3 verification gate passes: `pnpm check && pnpm test && pnpm build && pnpm test:prerender` all exit 0. Phase 3 ROADMAP success criteria 1, 3, 4, 5 are all achievable from the prerendered output; criterion 2 (blur-up smoothness) is the manual-only verification flagged in 03-VALIDATION.md.
  </done>
</task>

</tasks>

<verification>
**After both tasks complete:**

1. `pnpm check` exits 0.
2. `pnpm test` exits 0 — 78 tests passing total.
3. `pnpm build` exits 0.
4. `pnpm test:prerender` exits 0.
5. Build directory contents (verified by directory listing):
   - `build/index.html` (Phase 1 splash, now wrapped by TopNav from layout)
   - `build/about/index.html`, `build/press/index.html`, `build/contact/index.html` (D-43 placeholders)
   - `build/work/index.html`
   - 8 `build/work/<slug>/index.html` (one per category)
   - 56 `build/watch/<id>/index.html` (one per video)
   - `build/404.html` (adapter-static fallback page from +error.svelte)
6. Every prerendered HTML file in `build/` contains the TopNav markup (the wordmark string `Michelle Ngo` appears in every prerendered page).

**Goal-backward check (Phase 3 ROADMAP success criteria — all five):**

1. ✅ "/work displays all 56 videos as cards with thumbnail, title, category tag, and uploader/client; layout is 2-col mobile, 3-col tablet, 4-col desktop" — Plan 03-02 + Plan 03-01.
2. ✅ "Thumbnails render with a low-res placeholder that blurs up to full resolution as they load" — Plan 03-01 D-16 solid-color fade-in (manual-only smoothness check from 03-VALIDATION.md). Automated: VideoCard test asserts `transition-opacity` class + `opacity-0 → loaded` state.
3. ✅ "Clicking any card navigates to /watch/[id], plays the video via its embed URL, and renders a 'More in [Category]' rail of other videos sharing that category" — Plan 03-01 (card click target) + Plan 03-03 (iframe + rail).
4. ✅ "/work/[category] (or /work?category=[slug]) renders only that category's videos and the URL alone reproduces that filtered view on reload or paste" — Plan 03-02 prerenders 8 static HTML files; each is reachable via the URL alone.
5. ✅ "Top text-link nav lists primary categories plus secondary links for About / Press / Contact, and category links route to their filtered views" — Plan 03-04 TopNav.

**Coverage notes:**
- NAV-01 — addressed by TopNav + +layout.svelte wiring.
- All other Phase 3 requirements addressed in earlier plans (this plan inherits their coverage by ensuring the nav doesn't 404 to /about/press/contact, completing the user journey).

**Wave 3 disjointness:**
- This is the only Wave 3 plan; no disjointness check needed.
- It writes to `src/routes/+layout.svelte` which Plans 03-02 and 03-03 did NOT modify (they only read it for context). No conflict.
</verification>

<success_criteria>
Plan 03-04 complete (Phase 3 complete) when:
- [ ] `src/lib/components/TopNav.svelte` ships D-39 through D-42 + D-14 prefetch + D-09 divider
- [ ] `src/lib/components/MobileMenu.svelte` ships D-42 full-screen overlay
- [ ] `src/routes/+layout.svelte` renders <TopNav /> while preserving Phase 1 noindex + app.css
- [ ] `src/routes/about/+page.svelte`, `src/routes/press/+page.svelte`, `src/routes/contact/+page.svelte` ship minimal D-43 placeholders
- [ ] All 7 TopNav tests pass; no describe.skip remains in any Phase 3 test file
- [ ] `pnpm test` exits 0 with 78 tests passing
- [ ] `pnpm check` exits 0
- [ ] `pnpm build` exits 0
- [ ] `pnpm test:prerender` exits 0 (final phase gate)
- [ ] All ~70 prerendered HTML files emit and contain TopNav markup
</success_criteria>

<output>
After completion, create `.planning/phases/03-grid-filter-watch/03-04-SUMMARY.md` documenting:
- The `$app/state` `page` import + the `isActive(slug)` function pattern for D-41 active highlighting — note the SvelteKit 2.27+ rune-friendly contract (no `$page` store)
- The sticky-at-all-breakpoints decision (research Open Question 4 recommendation, supersedes context's discretion note suggesting "sticky-at-desktop only")
- The MobileMenu onclose callback pattern — each link calls onclose before navigating, ensuring the overlay clears on every interaction
- D-43 placeholder route pattern — minimal `+page.svelte` with no `+page.ts` inherits prerender=true from +layout.ts
- The Phase 1 noindex meta + app.css carry-forward preserved in the updated +layout.svelte
- The final Phase 3 build output: ~70 prerendered HTML files (1 / + 3 placeholder + 1 /work + 8 /work/<slug> + 56 /watch/<id> + 1 /404)
- Phase 3 ROADMAP success criteria mapping — which Plan implements which criterion
- The 8 OKLCH category accents now appear consistently across: card tags (Plan 03-01), filtered-view headings (Plan 03-02), watch metadata chips (Plan 03-03), and active nav links (this plan) — Pitfall 7 verified by inspecting the built CSS for all 8 `.text-cat-*` rules
</output>
</content>
