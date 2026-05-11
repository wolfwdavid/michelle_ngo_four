---
phase: 04-reel-led-home
plan: 01
type: execute
wave: 0
depends_on: []
files_modified:
  - vite.config.ts
  - vitest-setup-ui.ts
  - src/lib/components/HeroPoster.test.ts
  - src/lib/components/TopNav.test.ts
  - src/routes/page.test.ts
  - src/lib/data/videos.test.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Vitest UI project has a setup file that stubs globalThis.IntersectionObserver before any test mounts a Svelte component"
    - "HeroPoster.test.ts exists with describe.skip blocks covering HERO-01, HERO-02, HERO-03 (renders hero, LCP attrs, preload link, name + tagline, PLAY REEL href, PLAY REEL prefetch)"
    - "page.test.ts (for /+page.svelte) exists with describe.skip blocks covering HERO-01 + D-22 + D-24 + D-28 (renders hero composition, 8 featured cards, View-All link)"
    - "videos.test.ts has new describe.skip blocks covering D-23 + D-24 + D-26 (featured count = 8, includes producerReelId, quota matches PBS x2 / Promos x2 / Branded x2 / Doc x1 / Reel x1)"
    - "TopNav.test.ts has new describe.skip blocks covering D-13 + D-14 (scroll-aware on /, solid on non-home routes, IntersectionObserver attach/detach)"
    - "`pnpm test` exits 0 with the new stubs in place (describe.skip prevents red)"
    - "`pnpm check` exits 0 (no TS errors from the new stub files)"
  artifacts:
    - path: "vitest-setup-ui.ts"
      provides: "globalThis.IntersectionObserver stub for jsdom"
      contains: "IntersectionObserver"
    - path: "src/lib/components/HeroPoster.test.ts"
      provides: "RED-by-skip test stubs for HeroPoster"
      contains: "describe.skip"
    - path: "src/routes/page.test.ts"
      provides: "RED-by-skip test stubs for /+page.svelte composition"
      contains: "describe.skip"
  key_links:
    - from: "vite.config.ts"
      to: "vitest-setup-ui.ts"
      via: "test.projects[ui].test.setupFiles"
      pattern: "setupFiles.*vitest-setup-ui"
    - from: "src/lib/components/TopNav.test.ts"
      to: "vitest-setup-ui.ts"
      via: "globalThis.IntersectionObserver available at mount time"
      pattern: "IntersectionObserver"
---

<objective>
Wave 0: lay down the test scaffolding that subsequent Phase 4 plans turn green. Add a jsdom `IntersectionObserver` stub (required by TopNav scroll-aware tests — Pitfall 3 from 04-RESEARCH), create RED-by-`describe.skip` test files for HeroPoster, the `/` route, and extend the existing TopNav + videos test files with new skipped suites. Every Phase 4 acceptance test exists as a skipped stub here so Plans 02/03/04/05 only have to flip `describe.skip` → `describe` (one-rule rename) to satisfy their acceptance criteria.

Purpose: protect downstream plans from "test infra invention" cost — they should focus on production code, not Vitest configuration. This plan mirrors the Phase 2 P00 / Phase 3 P00 carry-forward pattern (lazy `await import()` so missing modules don't break Wave 0 loading).

Output: 5 files written/modified, all green-or-skipped at `pnpm test`, no TS errors at `pnpm check`.
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
@.planning/phases/04-reel-led-home/04-VALIDATION.md
@vite.config.ts
@src/lib/components/TopNav.test.ts
@src/lib/data/videos.test.ts
@src/routes/work/page.test.ts
@src/lib/components/VideoCard.test.ts

<interfaces>
<!-- Key interfaces the executor needs. From the existing codebase. -->

From src/lib/data/index.ts:
```typescript
export type { Video } from './schema';
export type { Category } from './categories';
export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
export {
  videos,
  producerReelId,
  getById,
  getByCategory,
  getCategoriesInDisplayOrder,
  getCategoriesWithCounts,
} from './videos';
```

From src/lib/data/categories.ts (CATEGORIES array — exact strings the quota test must match):
```typescript
export const CATEGORIES = [
  'PBS American Portrait',
  'Promos & Trailers',
  'Branded Content',
  'Documentary / Short Film',
  'Reel',
  'Personal / Tribute',
  'Educational / Nonprofit',
  'Other',
] as const;
```

From src/lib/data/schema.ts (Video shape — featured field already accepted):
```typescript
featured: z.boolean().default(false),
```

Phase 3 vite.config.ts `test.projects` shape (existing — Wave 0 ADDS `setupFiles` to the ui project, does NOT restructure):
```typescript
test: {
  projects: [
    { /* data project — node env */ },
    { /* ui project — jsdom env, resolve.conditions: ['browser'] */ },
  ]
}
```

producerReelId = `'264677021'` (Vimeo) — both PLAY REEL target and the Reel-quota featured slot.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add IntersectionObserver stub + wire UI test setupFiles</name>
  <files>vitest-setup-ui.ts, vite.config.ts</files>
  <read_first>
    - vite.config.ts (read in full — Wave 0 ADDS `setupFiles` to the existing ui project, does NOT restructure the projects array)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 3 (jsdom doesn't have IntersectionObserver — recommends shared setup file pattern B)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md §canonical_refs (TopNav.svelte extension via IntersectionObserver in D-14)
  </read_first>
  <action>
    Create `vitest-setup-ui.ts` at the project root with this exact content:

    ```ts
    // Vitest UI project setup — jsdom doesn't ship IntersectionObserver.
    // Phase 4 TopNav (per D-13/D-14) attaches an IntersectionObserver inside a $effect
    // that runs as soon as <TopNav /> mounts on the `/` route. Without this stub the
    // `mount(TopNav, ...)` call in TopNav.test.ts crashes with
    // `ReferenceError: IntersectionObserver is not defined`.
    //
    // Source: 04-RESEARCH.md §Common Pitfalls Pitfall 3 (Pattern B — shared setup file).
    // Future phases that mount components observing scroll positions inherit this stub.
    import { vi } from 'vitest';

    class IntersectionObserverStub {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];
      constructor(
        _cb: IntersectionObserverCallback,
        _opts?: IntersectionObserverInit
      ) {}
    }

    globalThis.IntersectionObserver =
      IntersectionObserverStub as unknown as typeof IntersectionObserver;
    ```

    Then edit `vite.config.ts` to add `setupFiles: ['./vitest-setup-ui.ts']` to the ui project's `test` block. The ui project block currently has:

    ```ts
    test: {
      name: 'ui',
      include: [
        'src/lib/components/**/*.{test,spec}.{js,ts}',
        'src/routes/**/*.{test,spec}.{js,ts}',
      ],
      environment: 'jsdom',
      globals: false,
    },
    ```

    Add the setupFiles line so it reads:

    ```ts
    test: {
      name: 'ui',
      include: [
        'src/lib/components/**/*.{test,spec}.{js,ts}',
        'src/routes/**/*.{test,spec}.{js,ts}',
      ],
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./vitest-setup-ui.ts'],
    },
    ```

    Do NOT touch the data project (node env). Do NOT touch the root `test` block (coverage config).
  </action>
  <verify>
    <automated>pnpm test</automated>
  </verify>
  <acceptance_criteria>
    - `vitest-setup-ui.ts` exists at the project root
    - `vitest-setup-ui.ts` contains the literal string `globalThis.IntersectionObserver`
    - `grep -c "setupFiles" vite.config.ts` >= 1
    - `vite.config.ts` ui project block contains the literal `'./vitest-setup-ui.ts'`
    - `pnpm test` exits 0 (existing tests stay green, no new tests yet)
    - `pnpm check` exits 0 (no TS errors)
  </acceptance_criteria>
  <done>
    The IntersectionObserver stub is loaded before every ui-project test. Phase 3 component + route tests still pass. Wave 1 plans can now mount components that use IntersectionObserver inside `$effect` without crashing the test runner.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create HeroPoster.test.ts + page.test.ts stubs (RED-by-skip)</name>
  <files>src/lib/components/HeroPoster.test.ts, src/routes/page.test.ts</files>
  <read_first>
    - src/lib/components/VideoCard.test.ts (mount/unmount + makeHost pattern — Phase 4 mirrors this verbatim)
    - src/routes/work/page.test.ts (callLoad narrow helper pattern — page.test.ts uses the same shape for `/+page.ts` if a +page.ts ships)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Validation Architecture → Phase Requirements → Test Map (table of test names mapped to Vitest `-t` patterns)
    - .planning/phases/04-reel-led-home/04-VALIDATION.md §Per-Task Verification Map (verbatim test names)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-01..D-12, D-16..D-20 (hero composition decisions)
    - src/lib/components/TopNav.test.ts (vi.hoisted + vi.mock pattern for $app/state + $app/paths — page.test.ts uses the same shape)
  </read_first>
  <action>
    Create `src/lib/components/HeroPoster.test.ts` with the following suite (all `describe.skip` — Wave 1 Plan 04-02 flips to `describe` after creating HeroPoster.svelte). Test bodies use lazy `await import('./HeroPoster.svelte')` so the file loads cleanly in Wave 0 even though HeroPoster.svelte doesn't exist yet (Phase 2/3 carry-forward pattern; see State.md note about runtime-computed dynamic specifier).

    ```ts
    import { afterEach, describe, expect, it, vi } from 'vitest';
    import { mount, unmount } from 'svelte';

    // Mock $app/paths so href assertions are deterministic regardless of BASE_PATH.
    vi.mock('$app/paths', () => ({ base: '' }));

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;

    afterEach(() => {
      if (component) {
        unmount(component);
        component = undefined;
      }
      host?.remove();
    });

    function makeHost(): HTMLElement {
      host = document.createElement('div');
      document.body.appendChild(host);
      return host;
    }

    async function loadHeroPoster() {
      // Lazy dynamic import — file doesn't exist in Wave 0; flipped to static
      // import once Plan 04-02 creates HeroPoster.svelte.
      const spec = './' + 'HeroPoster.svelte';
      // @ts-expect-error stub: target module doesn't exist yet
      const mod = await import(/* @vite-ignore */ spec);
      return mod.default;
    }

    describe.skip('HeroPoster — HERO-01 LCP attrs', () => {
      it('LCP attrs: <img> has loading="eager" and fetchpriority="high"', async () => {
        const HeroPoster = await loadHeroPoster();
        component = mount(HeroPoster, { target: makeHost(), props: {} });
        const img = host.querySelector('img');
        expect(img?.getAttribute('loading')).toBe('eager');
        expect(img?.getAttribute('fetchpriority')).toBe('high');
      });
    });

    describe.skip('HeroPoster — HERO-01 preload link', () => {
      it('preload link: <svelte:head> emits <link rel="preload" as="image"> for hero asset', async () => {
        const HeroPoster = await loadHeroPoster();
        component = mount(HeroPoster, { target: makeHost(), props: {} });
        // <svelte:head> appends to document.head, not the host.
        const link = document.head.querySelector('link[rel="preload"][as="image"]');
        expect(link).not.toBeNull();
        expect(link?.getAttribute('fetchpriority')).toBe('high');
      });
    });

    describe.skip('HeroPoster — HERO-02 name and tagline', () => {
      it('name and tagline: renders <h1>Michelle Ngo</h1> and a <p> containing "Filmmaker & Producer"', async () => {
        const HeroPoster = await loadHeroPoster();
        component = mount(HeroPoster, { target: makeHost(), props: {} });
        const h1 = host.querySelector('h1');
        expect(h1?.textContent?.trim().toLowerCase()).toBe('michelle ngo');
        const text = host.textContent ?? '';
        expect(text).toMatch(/filmmaker\s*&\s*producer/i);
      });
    });

    describe.skip('HeroPoster — HERO-03 PLAY REEL', () => {
      it('PLAY REEL href: anchor points to /watch/264677021 (producerReelId)', async () => {
        const HeroPoster = await loadHeroPoster();
        component = mount(HeroPoster, { target: makeHost(), props: {} });
        const playReel = Array.from(host.querySelectorAll('a')).find((a) =>
          /play\s*reel/i.test(a.textContent ?? '')
        );
        expect(playReel).toBeDefined();
        expect(playReel?.getAttribute('href')).toMatch(/\/watch\/264677021$/);
      });

      it('PLAY REEL prefetch: anchor has data-sveltekit-preload-data="hover"', async () => {
        const HeroPoster = await loadHeroPoster();
        component = mount(HeroPoster, { target: makeHost(), props: {} });
        const playReel = Array.from(host.querySelectorAll('a')).find((a) =>
          /play\s*reel/i.test(a.textContent ?? '')
        );
        expect(playReel?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
      });
    });

    describe.skip('HeroPoster — sentinel for TopNav IntersectionObserver (D-14)', () => {
      it('renders a div with id="hero-sentinel" inside the hero section', async () => {
        const HeroPoster = await loadHeroPoster();
        component = mount(HeroPoster, { target: makeHost(), props: {} });
        const sentinel = host.querySelector('#hero-sentinel');
        expect(sentinel).not.toBeNull();
      });
    });
    ```

    Create `src/routes/page.test.ts` with these suites (mirrors `src/routes/work/page.test.ts` callLoad helper; mounts `/+page.svelte` to assert composition). All `describe.skip` — Plan 04-05 flips them once `/+page.svelte` is replaced.

    ```ts
    import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
    import { mount, unmount } from 'svelte';

    // Mock $app/paths so href assertions stay deterministic.
    vi.mock('$app/paths', () => ({ base: '' }));

    // Mock $app/state's page rune so the page renders deterministically; TopNav
    // is NOT mounted by +page.svelte (lives in +layout.svelte), but defensive
    // for any future hook.
    const { mockPage } = vi.hoisted(() => ({
      mockPage: { url: new URL('http://localhost/'), route: { id: '/' } },
    }));
    vi.mock('$app/state', () => ({ page: mockPage }));

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;

    beforeEach(() => {
      mockPage.url = new URL('http://localhost/');
      mockPage.route = { id: '/' };
    });

    afterEach(() => {
      if (component) {
        unmount(component);
        component = undefined;
      }
      host?.remove();
    });

    function makeHost(): HTMLElement {
      host = document.createElement('div');
      document.body.appendChild(host);
      return host;
    }

    async function loadPage() {
      const spec = './' + '+page.svelte';
      // @ts-expect-error stub: replacement +page.svelte not yet shipped
      const mod = await import(/* @vite-ignore */ spec);
      return mod.default;
    }

    async function loadPageData() {
      // Loads the featured slice that the page expects to receive. If +page.ts
      // doesn't exist yet (Wave 0), this throws — describe.skip prevents that.
      const { load } = await import('./+page');
      const result = await (load as () => Promise<{ videos: unknown[] }>)();
      return result;
    }

    describe.skip('/+page.svelte — HERO-01 renders hero', () => {
      it('renders hero: composes <HeroPoster /> (h1 + img both present)', async () => {
        const Page = await loadPage();
        const data = await loadPageData();
        component = mount(Page, { target: makeHost(), props: { data } });
        // HeroPoster contributes the h1 + the hero <img>.
        expect(host.querySelector('h1')).not.toBeNull();
        expect(host.querySelector('img')).not.toBeNull();
      });
    });

    describe.skip('/+page.svelte — D-22 / D-24 8 featured cards', () => {
      it('8 featured cards: renders exactly 8 VideoCard <li> entries below the hero', async () => {
        const Page = await loadPage();
        const data = await loadPageData();
        component = mount(Page, { target: makeHost(), props: { data } });
        // VideoCard renders <li><a>...</a></li>. The featured grid has 8 cards.
        // The hero's PLAY REEL is an <a> but not inside a <li>.
        const liAnchors = host.querySelectorAll('ul > li > a');
        expect(liAnchors.length).toBe(8);
      });
    });

    describe.skip('/+page.svelte — D-28 View All Work link', () => {
      it('View All Work link: anchor ends with /work and has hover prefetch', async () => {
        const Page = await loadPage();
        const data = await loadPageData();
        component = mount(Page, { target: makeHost(), props: { data } });
        const viewAll = Array.from(host.querySelectorAll('a')).find((a) =>
          /view\s+all\s+work/i.test(a.textContent ?? '')
        );
        expect(viewAll).toBeDefined();
        expect(viewAll?.getAttribute('href')).toMatch(/\/work\/?$/);
        expect(viewAll?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
      });
    });
    ```
  </action>
  <verify>
    <automated>pnpm test src/lib/components/HeroPoster.test.ts src/routes/page.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/components/HeroPoster.test.ts` exists
    - `src/routes/page.test.ts` exists
    - `grep -c "describe.skip" src/lib/components/HeroPoster.test.ts` >= 5
    - `grep -c "describe.skip" src/routes/page.test.ts` >= 3
    - HeroPoster.test.ts contains the literal string `"PLAY REEL href"` (Vitest -t pattern from VALIDATION.md)
    - HeroPoster.test.ts contains the literal string `"PLAY REEL prefetch"`
    - HeroPoster.test.ts contains the literal string `"name and tagline"`
    - HeroPoster.test.ts contains the literal string `"LCP attrs"`
    - HeroPoster.test.ts contains the literal string `"preload link"`
    - page.test.ts contains the literal string `"8 featured cards"`
    - page.test.ts contains the literal string `"View All Work link"`
    - page.test.ts contains the literal string `"renders hero"`
    - `pnpm test src/lib/components/HeroPoster.test.ts src/routes/page.test.ts` exits 0 (all skipped, none red)
    - `pnpm check` exits 0
  </acceptance_criteria>
  <done>
    Both new test files exist with `describe.skip` blocks for every HERO-01 / HERO-02 / HERO-03 / D-22 / D-24 / D-28 behavior. Vitest reports them as skipped, not red. Plan 04-02 (HeroPoster) and Plan 04-05 (page composition) only need to flip `describe.skip` → `describe` and remove the `@ts-expect-error` comments + `loadXxx()` helper indirection once the production modules ship.
  </done>
</task>

<task type="auto">
  <name>Task 3: Extend TopNav.test.ts and videos.test.ts with Phase 4 stubs</name>
  <files>src/lib/components/TopNav.test.ts, src/lib/data/videos.test.ts</files>
  <read_first>
    - src/lib/components/TopNav.test.ts (existing — read in full; Phase 4 APPENDS new `describe.skip` blocks at the end, does NOT modify existing Phase 3 tests)
    - src/lib/data/videos.test.ts (existing — read in full; Phase 4 APPENDS new `describe.skip` blocks at the end)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Featured Slice Curation (D-23 deliverable) — exact 8 video IDs the quota test asserts
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Code Examples → Example 1 ($effect IntersectionObserver cleanup) — informs what TopNav scroll-aware test must observe
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 8 (featured includes producerReelId, Reel category)
    - .planning/phases/04-reel-led-home/04-VALIDATION.md §Per-Task Verification Map — verbatim test names (`"8 featured"`, `"featured includes reel"`, `"featured quota"`, `"scroll-aware home"`, `"solid on non-home"`)
    - src/lib/data/categories.ts (exact Category strings for the quota test)
  </read_first>
  <action>
    Append the following `describe.skip` block to the END of `src/lib/data/videos.test.ts` (do NOT modify existing tests):

    ```ts

    // ---------------------------------------------------------------------------
    // Phase 4 D-23 / D-24 / D-26: featured slice curation contract.
    // RED-by-skip in Wave 0; Plan 04-03 turns these green AFTER flipping `featured: true`
    // on the 8 chosen rows in videos.json.
    // ---------------------------------------------------------------------------
    describe.skip('Phase 4 featured slice — D-23 / D-24 / D-26', () => {
      it('8 featured: exactly 8 videos have featured===true after flips', async () => {
        const { videos } = await import('./videos');
        const featured = videos.filter((v) => v.featured);
        expect(featured.length).toBe(8);
      });

      it('featured includes reel: producerReelId appears in the featured slice (D-23 Reel x1, Pitfall 8)', async () => {
        const { videos, producerReelId } = await import('./videos');
        const featured = videos.filter((v) => v.featured);
        const reel = featured.find((v) => v.id === producerReelId);
        expect(reel).toBeDefined();
        expect(reel?.category).toBe('Reel');
      });

      it('featured quota: 2 PBS, 2 Promos, 2 Branded, 1 Doc, 1 Reel (D-23)', async () => {
        const { videos } = await import('./videos');
        const featured = videos.filter((v) => v.featured);
        const counts = new Map<string, number>();
        for (const v of featured) {
          counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
        }
        expect(counts.get('PBS American Portrait')).toBe(2);
        expect(counts.get('Promos & Trailers')).toBe(2);
        expect(counts.get('Branded Content')).toBe(2);
        expect(counts.get('Documentary / Short Film')).toBe(1);
        expect(counts.get('Reel')).toBe(1);
        // No featured cards from the other three categories (Personal / Educational / Other).
        expect(counts.get('Personal / Tribute')).toBeUndefined();
        expect(counts.get('Educational / Nonprofit')).toBeUndefined();
        expect(counts.get('Other')).toBeUndefined();
      });
    });
    ```

    Append the following `describe.skip` block to the END of `src/lib/components/TopNav.test.ts` (do NOT modify existing tests). The existing file already imports `mount`, `unmount`, `mockPage`, `vi`, etc. — reuse them. Add a `route` field to `mockPage` (the existing file only mocks `url`; Phase 4 also needs `route.id`).

    First, MODIFY the existing `vi.hoisted` block at the top of the file (around lines 11-13) to add the `route` field — change FROM:

    ```ts
    const { mockPage } = vi.hoisted(() => ({
      mockPage: { url: new URL('http://localhost/') },
    }));
    ```

    TO:

    ```ts
    const { mockPage } = vi.hoisted(() => ({
      mockPage: {
        url: new URL('http://localhost/'),
        route: { id: '/' as string | null },
      },
    }));
    ```

    Then MODIFY the existing `beforeEach` (around lines 26-28) — change FROM:

    ```ts
    beforeEach(() => {
      mockPage.url = new URL('http://localhost/');
    });
    ```

    TO:

    ```ts
    beforeEach(() => {
      mockPage.url = new URL('http://localhost/');
      mockPage.route = { id: '/' };
    });
    ```

    THEN append the following at the END of the file:

    ```ts

    // ---------------------------------------------------------------------------
    // Phase 4 D-13 / D-14: scroll-aware TopNav on `/` only.
    // RED-by-skip in Wave 0; Plan 04-04 turns these green after extending TopNav with
    // the IntersectionObserver $effect.
    // ---------------------------------------------------------------------------

    function makeSentinel(): HTMLElement {
      // HeroPoster renders <div id="hero-sentinel"> inside the hero section.
      // Tests construct the sentinel inline to simulate HeroPoster having mounted.
      const sentinel = document.createElement('div');
      sentinel.id = 'hero-sentinel';
      document.body.appendChild(sentinel);
      return sentinel;
    }

    describe.skip('TopNav — D-13 scroll-aware on home', () => {
      it('scroll-aware home: on route "/", TopNav attaches an IntersectionObserver on #hero-sentinel', () => {
        mockPage.route = { id: '/' };
        mockPage.url = new URL('http://localhost/');
        const sentinel = makeSentinel();
        // Spy on the global stub so we can verify observe() was called with the sentinel.
        // vitest-setup-ui.ts wires a global stub class — its observe() is a vi.fn().
        // Pattern: capture the constructor call args via the stub class.
        const observed: Element[] = [];
        const originalIO = globalThis.IntersectionObserver;
        class TrackingIO {
          observe = (el: Element) => observed.push(el);
          disconnect = vi.fn();
          unobserve = vi.fn();
          takeRecords = () => [];
          root = null;
          rootMargin = '';
          thresholds = [];
          constructor(_cb: IntersectionObserverCallback) {}
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        globalThis.IntersectionObserver = TrackingIO as any;
        try {
          component = mount(TopNav, { target: makeHost(), props: {} });
          expect(observed).toContain(sentinel);
        } finally {
          globalThis.IntersectionObserver = originalIO;
          sentinel.remove();
        }
      });

      it('scroll-aware home: TopNav <header> has bg-neutral-950 class by default (sentinel not intersecting)', () => {
        mockPage.route = { id: '/' };
        mockPage.url = new URL('http://localhost/');
        makeSentinel();
        component = mount(TopNav, { target: makeHost(), props: {} });
        // Default: heroVisible=false → solid bg.
        const header = host.querySelector('header');
        expect(header?.className).toMatch(/bg-neutral-950/);
      });
    });

    describe.skip('TopNav — D-13 solid on non-home routes', () => {
      it('solid on non-home: on /work, TopNav <header> renders bg-neutral-950 (no transparent class)', () => {
        mockPage.route = { id: '/work' };
        mockPage.url = new URL('http://localhost/work/');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const header = host.querySelector('header');
        expect(header?.className).toMatch(/bg-neutral-950/);
        expect(header?.className).not.toMatch(/bg-transparent/);
      });

      it('solid on non-home: on /work/[category], TopNav stays solid', () => {
        mockPage.route = { id: '/work/[category]' };
        mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const header = host.querySelector('header');
        expect(header?.className).toMatch(/bg-neutral-950/);
        expect(header?.className).not.toMatch(/bg-transparent/);
      });

      it('solid on non-home: on /watch/[id], TopNav stays solid', () => {
        mockPage.route = { id: '/watch/[id]' };
        mockPage.url = new URL('http://localhost/watch/264677021/');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const header = host.querySelector('header');
        expect(header?.className).toMatch(/bg-neutral-950/);
        expect(header?.className).not.toMatch(/bg-transparent/);
      });

      it('solid on non-home: on /about, TopNav stays solid', () => {
        mockPage.route = { id: '/about' };
        mockPage.url = new URL('http://localhost/about/');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const header = host.querySelector('header');
        expect(header?.className).toMatch(/bg-neutral-950/);
        expect(header?.className).not.toMatch(/bg-transparent/);
      });

      it('solid on non-home: on /press, TopNav stays solid', () => {
        mockPage.route = { id: '/press' };
        mockPage.url = new URL('http://localhost/press/');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const header = host.querySelector('header');
        expect(header?.className).toMatch(/bg-neutral-950/);
        expect(header?.className).not.toMatch(/bg-transparent/);
      });

      it('solid on non-home: on /contact, TopNav stays solid', () => {
        mockPage.route = { id: '/contact' };
        mockPage.url = new URL('http://localhost/contact/');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const header = host.querySelector('header');
        expect(header?.className).toMatch(/bg-neutral-950/);
        expect(header?.className).not.toMatch(/bg-transparent/);
      });
    });
    ```

    Why the `route` field on mockPage: Phase 4 TopNav reads `page.route.id` from `$app/state` (per 04-RESEARCH.md Pitfall 9 — `route.id` is the SvelteKit route shape, stable under `trailingSlash: 'always'`). Phase 3 tests only need `url`; adding `route` is forward-compatible and the existing Phase 3 tests (which never read `mockPage.route`) keep passing.
  </action>
  <verify>
    <automated>pnpm test src/lib/data/videos.test.ts src/lib/components/TopNav.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "describe.skip" src/lib/data/videos.test.ts` >= 1
    - `grep -c "describe.skip" src/lib/components/TopNav.test.ts` >= 2
    - videos.test.ts contains the literal `"8 featured"` (Vitest -t pattern)
    - videos.test.ts contains the literal `"featured includes reel"`
    - videos.test.ts contains the literal `"featured quota"`
    - TopNav.test.ts contains the literal `"scroll-aware home"`
    - TopNav.test.ts contains the literal `"solid on non-home"`
    - TopNav.test.ts mockPage object contains a `route` field (search for the literal string `route: {`)
    - TopNav.test.ts "solid on non-home" describe block covers all 6 D-13 routes — verify by `grep -c "solid on non-home: on /" src/lib/components/TopNav.test.ts` >= 6 (one it() per /work, /work/[category], /watch/[id], /about, /press, /contact)
    - `pnpm test src/lib/data/videos.test.ts src/lib/components/TopNav.test.ts` exits 0 (all new suites skipped, Phase 3 suites stay green)
    - `pnpm check` exits 0
    - `pnpm test` (full suite) exits 0
    - `pnpm build` exits 0 (no production code changed in this wave — sanity check)
  </acceptance_criteria>
  <done>
    All Phase 4 acceptance test suites exist as `describe.skip` stubs. Phase 3 tests stay green. Wave 1 plans (04-02, 04-03, 04-04) only need to flip `.skip` → `describe` to satisfy their acceptance criteria — no test infra invention.
  </done>
</task>

</tasks>

<verification>
After all three tasks:

1. `pnpm test` — exits 0, both projects (data + ui) report skipped suites for Phase 4 tests, no red.
2. `pnpm check` — exits 0, no TS errors from the new stub files.
3. `pnpm build` — still exits 0 (no production source changed; Zod plugin sees same videos.json).
4. New file `vitest-setup-ui.ts` exists at project root and is referenced from `vite.config.ts` ui project's `setupFiles`.
5. The test file inventory now matches 04-VALIDATION.md §Per-Task Verification Map exactly — every Phase 4 Vitest `-t` pattern has a matching `describe.skip` block somewhere.
</verification>

<success_criteria>
Phase 4 Wave 0 is complete when:

- [ ] `vitest-setup-ui.ts` ships and stubs `globalThis.IntersectionObserver`
- [ ] `vite.config.ts` ui project's `setupFiles` includes `'./vitest-setup-ui.ts'`
- [ ] `src/lib/components/HeroPoster.test.ts` exists with 5+ `describe.skip` blocks
- [ ] `src/routes/page.test.ts` exists with 3+ `describe.skip` blocks
- [ ] `src/lib/data/videos.test.ts` has 1 new `describe.skip` block (3 tests inside)
- [ ] `src/lib/components/TopNav.test.ts` has 2+ new `describe.skip` blocks (7 tests inside — 2 scroll-aware-on-home + 6 solid-on-non-home covering all D-13 routes) + updated mockPage with `route` field
- [ ] Every test name from 04-VALIDATION.md `-t` patterns appears as a literal string in one of the test files
- [ ] `pnpm test && pnpm check && pnpm build` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-reel-led-home/04-01-test-infrastructure-SUMMARY.md` per the standard summary template.
</output>
