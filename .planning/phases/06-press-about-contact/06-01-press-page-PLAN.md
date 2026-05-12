---
phase: 06-press-about-contact
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/routes/press/_pressCredits.ts
  - src/routes/press/_pressCredits.test.ts
  - src/routes/press/+page.ts
  - src/routes/press/+page.svelte
  - src/routes/press/page.test.ts
  - scripts/test-prerender-coverage.mjs
autonomous: false
requirements:
  - PRES-01
  - PRES-02
must_haves:
  truths:
    - "A user can navigate to /press from the top nav and reach a real page (no 'Coming soon' placeholder)."
    - "The /press page lists Michelle's broadcast credits grouped by network — HBO Max, HBO, PBS, ABC News, U2, Amazon News, Music Box Films, Monument Releasing, Cargo Film & Releasing, AZPM, HBODocs, GrasshalmClips, Lenny Cooke (Movie) — each with one or more credit titles below the network header."
    - "Section ordering follows the prestige order locked in the <checkpoint> below (HBO Max first, single-credit indie/festival labels last)."
    - "Every credit title is a hover-prefetched link to its /watch/[id] route."
    - "A static build emits build/press/index.html and the prerender coverage script's new threshold passes."
  artifacts:
    - path: "src/routes/press/_pressCredits.ts"
      provides: "Pure route-local helper deriving Array<{ network: string; videos: Video[] }> from $lib/data videos (filter uploader !== 'Michelle Ngo', group by uploader, prestige-order)."
      exports: ["getPressCredits"]
    - path: "src/routes/press/_pressCredits.test.ts"
      provides: "Vitest 'data' project unit tests for the press helper — returns 13 records covering all 13 non-Michelle uploaders, ordering matches prestige list."
    - path: "src/routes/press/+page.ts"
      provides: "PageLoad calling getPressCredits() and returning { groups: Array<{ network: string; videos: Video[] }> }."
    - path: "src/routes/press/+page.svelte"
      provides: "h1 + iterated <section>/<h2>/<ul> blocks; each <li> contains a hover-prefetched Phase 3 D-08 inline-link to /watch/[id]."
    - path: "src/routes/press/page.test.ts"
      provides: "Vitest 'ui' project route test — h1 'Press', N sections in prestige order, anchor hrefs match /watch/[id]."
    - path: "scripts/test-prerender-coverage.mjs"
      provides: "Updated coverage script with a new check ≥1 build/press/index.html."
      contains: "build/press/index.html"
  key_links:
    - from: "src/routes/press/_pressCredits.ts"
      to: "$lib/data videos array"
      via: "import { videos } from '$lib/data'"
      pattern: "import.*from.*\\$lib/data"
    - from: "src/routes/press/+page.svelte"
      to: "/watch/[id] route"
      via: "anchor href={`${base}/watch/${video.id}`}"
      pattern: "\\$\\{base\\}/watch/\\$\\{video\\.id\\}"
    - from: "scripts/test-prerender-coverage.mjs"
      to: "build/press/index.html"
      via: "existsSync check"
      pattern: "press.*index\\.html"
---

<objective>
Replace the Phase 3 D-43 placeholder at `/press` with a real broadcast-credits page derived from `videos.json`. Build a pure route-local helper that filters + groups + prestige-orders the 13 non-Michelle uploaders, wire it through a `+page.ts` load, render the page via the locked D-12 composition, and extend the prerender coverage script to assert the new HTML output.

Purpose: Satisfies REQ PRES-01 (reachable dedicated /press) + PRES-02 (broadcast credits with network names). Phase 6 D-08 / D-09 / D-10 / D-12 / D-13 / D-14 / D-15 / D-16.

Output: Press helper + route load + page Svelte + tests + updated prerender coverage script. No new dependencies.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-press-about-contact/06-CONTEXT.md
@src/lib/data/videos.json
@src/lib/data/index.ts
@src/routes/pbs-american-portrait/_pbsCollectionUrl.ts
@src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts
@src/routes/press/+page.svelte
@src/lib/components/TopNav.svelte
@vite.config.ts
@scripts/test-prerender-coverage.mjs

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From src/lib/data/index.ts:
```typescript
export type { Video } from './schema';
export type { Category } from './categories';
export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
export {
  videos,             // readonly Video[] — already filtered: !v.hidden
  producerReelId,
  getById,
  getByCategory,
  getCategoriesInDisplayOrder,
  getCategoriesWithCounts,
} from './videos';
```

From src/lib/data/schema.ts (Video shape — pertinent fields):
```typescript
// Video is a discriminated union on `source` ('youtube' | 'vimeo') with these shared fields:
//   id: string
//   title: string
//   uploader: string       // <-- press derivation key (D-08)
//   category: Category
//   thumbnail: string
//   embed: string
//   duration: string
//   published: string      // ISO date
//   description?: string
//   featured: boolean      // default false
//   hidden: boolean        // default false (already filtered out of `videos`)
//   tags: string[]         // default []
//   credits: ...           // default {}
//   url?: string
```

Phase 5 pattern reference — `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts`:
- Route-local underscore-prefix excludes from SvelteKit route detection.
- Pure function over data; no side effects.
- JSDoc explains rationale; co-located `.test.ts` runs in the `data` (node) vitest project.

Phase 3 inline-link style (Phase 3 D-08) — every credit row uses verbatim:
```svelte
<a
  href={`${base}/watch/${video.id}`}
  data-sveltekit-preload-data="hover"
  class="text-white hover:underline underline-offset-2"
>
  {video.title}
</a>
```
</interfaces>
</context>

<checkpoint>
## Required user approvals BEFORE execution begins

This plan is NOT autonomous. The user must finalize one decision before the executor runs:

### 1. Press section ordering (D-10 prestige order)

The press helper orders networks by hand-tuned prestige for hiring-producer scan signal. Audit of `src/lib/data/videos.json` confirms 13 distinct non-Michelle uploaders, each with exactly 1 credit:

| Rank | Network (uploader string verbatim) | Credit count |
|------|------------------------------------|--------------|
| 1 | HBO Max | 1 |
| 2 | HBO | 1 |
| 3 | PBS | 1 |
| 4 | ABC News | 1 |
| 5 | U2 | 1 |
| 6 | Amazon News | 1 |
| 7 | Music Box Films | 1 |
| 8 | Monument Releasing | 1 |
| 9 | Cargo Film & Releasing | 1 |
| 10 | AZPM | 1 |
| 11 | HBODocs | 1 |
| 12 | GrasshalmClips | 1 |
| 13 | Lenny Cooke (Movie) | 1 |

**Reorder requested?** If yes, edit the `PRESTIGE_ORDER` constant in Task 1's action and update the corresponding test assertion in Task 2. If no changes, type `approved` and the executor will use the ordering above verbatim.

**Notes from Claude's Discretion (D §):**
- ABC News represents the Hulu "Lady Bird Diaries" credit. Relabeling to "Hulu" requires editing `src/lib/data/videos.json` (out of scope for this plan; raise as a follow-up Todo if desired).
- HBO / HBO Max / HBODocs are kept distinct per D-09 (uploader strings are the source of truth). Merging would require relabeling logic and is rejected by D-09; not surfaced here as an option.

<resume-signal>Reply `approved` to lock the ordering above, or paste the desired reorder (e.g., `1. HBO Max, 2. PBS, 3. HBO, ...`) before executor begins.</resume-signal>
</checkpoint>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build press credit helper (filter + group + prestige-order)</name>
  <files>src/routes/press/_pressCredits.ts, src/routes/press/_pressCredits.test.ts</files>
  <read_first>
    - src/lib/data/index.ts (verify `videos` and `Video` type exports)
    - src/lib/data/videos.json (confirm 13 non-Michelle records and their `uploader` strings)
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.ts (Phase 5 D-21 helper-file pattern — JSDoc shape, underscore-prefix rationale)
    - src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts (Phase 5 helper test layout)
    - vite.config.ts (confirm the `data` vitest project glob `src/lib/data/**/*.{test,spec}.{js,ts}` does NOT match `src/routes/**`; this test belongs to the `ui` project glob `src/routes/**/*.{test,spec}.{js,ts}` per the vite.config.ts `projects[1].test.include` — see verify section)
  </read_first>
  <behavior>
    - Test 1: getPressCredits() returns 13 groups (one per distinct non-Michelle uploader).
    - Test 2: Total video count across all groups is 13 (no duplicates, no Michelle Ngo records).
    - Test 3: Every group.network is one of the 13 known uploader strings; no 'Michelle Ngo' leaks through.
    - Test 4: Group ordering matches the locked PRESTIGE_ORDER constant exactly: ['HBO Max', 'HBO', 'PBS', 'ABC News', 'U2', 'Amazon News', 'Music Box Films', 'Monument Releasing', 'Cargo Film & Releasing', 'AZPM', 'HBODocs', 'GrasshalmClips', 'Lenny Cooke (Movie)'].
    - Test 5: Each group has at least 1 video; group.videos is a non-empty array of Video.
    - Test 6: For each group, every video.uploader === group.network (the grouping invariant).
    - Test 7: If the helper encounters an uploader not in PRESTIGE_ORDER (defensive case for future videos.json additions), it appends the group at the end in insertion order — test by mocking is unnecessary; instead, sanity-assert the helper does NOT throw when `videos.filter(...).map(v => v.uploader)` is shadowed (this is a runtime/contract note in JSDoc; skip test).
  </behavior>
  <action>
    Create **src/routes/press/_pressCredits.ts** with this content (verbatim):

    ```typescript
    /**
     * Phase 6 D-09: route-local helper that derives the press credit list
     * from `videos.json`. Returns groups in the locked prestige order (D-10).
     *
     * Underscore prefix excludes this file from SvelteKit route detection
     * (matches Phase 5 `_pbsCollectionUrl.ts` pattern; SvelteKit 2.59.1 ignores
     * `_*` files under src/routes/*).
     *
     * Source: D-08 filter — `videos.filter(v => v.uploader !== 'Michelle Ngo')`
     * returns the 13 non-Michelle records (audit-verified at plan time;
     * each distinct uploader has exactly 1 credit today).
     *
     * Why pure function (not memoized): `videos` is a module-scoped readonly
     * array; calls are cheap and only happen at build time (prerender). No
     * runtime caching needed.
     *
     * Future-proofing: if a future `videos.json` row carries an uploader not
     * in PRESTIGE_ORDER, that group is appended at the end in insertion
     * order (no crash, no silent drop).
     */
    import { videos, type Video } from '$lib/data';

    /** D-10 prestige order. Hand-tuned for hiring-producer scan signal. */
    const PRESTIGE_ORDER = [
      'HBO Max',
      'HBO',
      'PBS',
      'ABC News',
      'U2',
      'Amazon News',
      'Music Box Films',
      'Monument Releasing',
      'Cargo Film & Releasing',
      'AZPM',
      'HBODocs',
      'GrasshalmClips',
      'Lenny Cooke (Movie)',
    ] as const;

    export interface PressGroup {
      network: string;
      videos: Video[];
    }

    export function getPressCredits(): PressGroup[] {
      // D-08 filter: drop Michelle Ngo's own uploads (her credits surface
      // elsewhere on the site; /press is for broadcast partners only).
      const pressVideos = videos.filter((v) => v.uploader !== 'Michelle Ngo');

      // Group by uploader (uploader string verbatim per D-09 — no normalization).
      const byNetwork = new Map<string, Video[]>();
      for (const v of pressVideos) {
        const list = byNetwork.get(v.uploader);
        if (list) {
          list.push(v);
        } else {
          byNetwork.set(v.uploader, [v]);
        }
      }

      // Emit in PRESTIGE_ORDER first, then append any unknown uploaders in
      // insertion order. Defensive future-proofing per JSDoc note above.
      const ordered: PressGroup[] = [];
      const consumed = new Set<string>();
      for (const network of PRESTIGE_ORDER) {
        const list = byNetwork.get(network);
        if (list && list.length > 0) {
          ordered.push({ network, videos: list });
          consumed.add(network);
        }
      }
      for (const [network, list] of byNetwork) {
        if (!consumed.has(network)) {
          ordered.push({ network, videos: list });
        }
      }
      return ordered;
    }
    ```

    Create **src/routes/press/_pressCredits.test.ts** with this content (verbatim):

    ```typescript
    import { describe, expect, it } from 'vitest';
    import { getPressCredits } from './_pressCredits';

    const EXPECTED_PRESTIGE_ORDER = [
      'HBO Max',
      'HBO',
      'PBS',
      'ABC News',
      'U2',
      'Amazon News',
      'Music Box Films',
      'Monument Releasing',
      'Cargo Film & Releasing',
      'AZPM',
      'HBODocs',
      'GrasshalmClips',
      'Lenny Cooke (Movie)',
    ] as const;

    describe('getPressCredits — D-08 filter + D-09 grouping', () => {
      it('returns 13 groups (one per distinct non-Michelle uploader)', () => {
        const groups = getPressCredits();
        expect(groups.length).toBe(13);
      });

      it('total video count across all groups is 13 (no duplicates, no Michelle Ngo)', () => {
        const groups = getPressCredits();
        const totalCount = groups.reduce((acc, g) => acc + g.videos.length, 0);
        expect(totalCount).toBe(13);
        for (const g of groups) {
          for (const v of g.videos) {
            expect(v.uploader).not.toBe('Michelle Ngo');
          }
        }
      });

      it('every group.network matches one of the 13 known uploaders', () => {
        const groups = getPressCredits();
        for (const g of groups) {
          expect(EXPECTED_PRESTIGE_ORDER as readonly string[]).toContain(g.network);
        }
      });

      it('every group has at least one video; group.videos is non-empty', () => {
        const groups = getPressCredits();
        for (const g of groups) {
          expect(g.videos.length).toBeGreaterThan(0);
        }
      });

      it('grouping invariant: every video.uploader matches its group.network', () => {
        const groups = getPressCredits();
        for (const g of groups) {
          for (const v of g.videos) {
            expect(v.uploader).toBe(g.network);
          }
        }
      });
    });

    describe('getPressCredits — D-10 prestige order', () => {
      it('groups emitted in the locked prestige order', () => {
        const groups = getPressCredits();
        const actualOrder = groups.map((g) => g.network);
        expect(actualOrder).toEqual(Array.from(EXPECTED_PRESTIGE_ORDER));
      });
    });
    ```

    **About vitest project membership:** This test file lives under `src/routes/**` so it falls into the `ui` (jsdom) vitest project per `vite.config.ts` line 103-104. That's fine — the helper is pure, no DOM is touched. Do NOT move the test under `src/lib/data/**` (it would no longer be co-located with the helper).
  </action>
  <verify>
    <automated>pnpm test -- --project=ui --run src/routes/press/_pressCredits.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/press/_pressCredits.ts` exists and exports `getPressCredits` (function) and `PressGroup` (interface).
    - `grep -n "uploader !== 'Michelle Ngo'" src/routes/press/_pressCredits.ts` returns 1 match (the D-08 filter literal).
    - `grep -n "PRESTIGE_ORDER" src/routes/press/_pressCredits.ts` returns ≥2 matches (declaration + iteration).
    - `pnpm test -- --project=ui --run src/routes/press/_pressCredits.test.ts` exits 0.
    - `pnpm check` exits 0 (no svelte-check / TypeScript errors introduced).
  </acceptance_criteria>
  <done>The helper exists, the test suite passes, and `getPressCredits()` returns 13 groups in the locked prestige order.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Build /press page (load + render) and update prerender coverage script</name>
  <files>src/routes/press/+page.ts, src/routes/press/+page.svelte, src/routes/press/page.test.ts, scripts/test-prerender-coverage.mjs</files>
  <read_first>
    - src/routes/press/_pressCredits.ts (Task 1 output — verify exports)
    - src/routes/press/+page.svelte (CURRENT placeholder — will be replaced)
    - src/routes/pbs-american-portrait/+page.svelte (Phase 5 reference for h1 + section composition; ignore PBS-specific accents / blockquote)
    - src/routes/pbs-american-portrait/page.test.ts (vitest 'ui' project page-test pattern: vi.mock $app/state, vi.mock $app/paths, callLoad helper)
    - src/routes/work/page.test.ts (callLoad pattern for routes whose load returns plain data shape)
    - scripts/test-prerender-coverage.mjs (CURRENT thresholds — Plan adds the press check)
    - src/lib/components/TopNav.svelte (Phase 3 D-08 inline-link style class string + Phase 3 D-14 hover-prefetch attribute reference)
    - src/routes/+layout.ts (verify `prerender = true` and `trailingSlash = 'always'` — Press inherits both)
  </read_first>
  <behavior>
    - Test 1: /press +page.ts load returns { groups: PressGroup[] } with 13 groups.
    - Test 2: /press +page.svelte renders `<h1>Press</h1>` (exact text, lowercase + matched).
    - Test 3: /press renders 13 `<section>` elements (one per group), each containing an `<h2>` with the network name verbatim.
    - Test 4: Section h2 order matches the prestige order (HBO Max first, Lenny Cooke (Movie) last).
    - Test 5: Each section contains a `<ul>` with `<li>` children equal to that group's video count; total credit anchors === 13.
    - Test 6: Every credit anchor has `href` matching `/watch/{id}` and `data-sveltekit-preload-data="hover"`.
    - Test 7: No section heading carries a count suffix (no `(1)`, `(13)`, etc. — D-16).
    - Test 8: Container element uses `max-w-3xl` (D-14) AND `px-4`, `sm:px-6`, `lg:px-8` classes (assert via className substring match on the wrapping <main> / <section>).
    - Test 9 (prerender script integration — assert script exit code): after `pnpm build`, running `node scripts/test-prerender-coverage.mjs` exits 0 AND the script source contains the literal `build/press/index.html` (grepable).
  </behavior>
  <action>
    **Step 1 — Create src/routes/press/+page.ts** (verbatim):

    ```typescript
    /**
     * Phase 6 PRES-01 / PRES-02: /press load.
     *
     * Calls the route-local helper (D-09) and returns the grouped press credits
     * for +page.svelte to iterate. Prerendered (inherits from src/routes/+layout.ts
     * prerender=true). Build emits build/press/index.html.
     */
    import type { PageLoad } from './$types';
    import { getPressCredits, type PressGroup } from './_pressCredits';

    export const load: PageLoad<{ groups: PressGroup[] }> = () => {
      return { groups: getPressCredits() };
    };
    ```

    **Step 2 — REPLACE src/routes/press/+page.svelte entirely** (Phase 3 D-43 placeholder is overwritten). Verbatim content:

    ```svelte
    <!--
      Phase 6 PRES-01 / PRES-02: /press broadcast credits page.

      Decisions implemented:
        D-08 — credits derived from videos.json (filter uploader !== 'Michelle Ngo')
        D-09 — uploader strings used verbatim as network labels (no normalization)
        D-10 — prestige order locked in _pressCredits.ts PRESTIGE_ORDER
        D-12 — composition: <h1>Press</h1> + <section>/<h2>/<ul> blocks
        D-13 — per-credit row = inline-link to /watch/[id] (title only, no date/role)
        D-14 — container max-w-3xl (editorial reading width, NOT max-w-7xl)
        D-15 — section vertical rhythm space-y-12 md:space-y-16
        D-16 — no count next to section h2

      ESLint: svelte/no-navigation-without-resolve disabled — internal hrefs built
      from `${base}/watch/${id}` (same idiom as VideoCard + TopNav + PBS landing).
    -->
    <script lang="ts">
      /* eslint-disable svelte/no-navigation-without-resolve */
      import type { PageData } from './$types';
      import { base } from '$app/paths';

      let { data }: { data: PageData } = $props();
    </script>

    <svelte:head>
      <title>Michelle Ngo — Press</title>
    </svelte:head>

    <main class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Press</h1>

      <div class="mt-10 md:mt-12 space-y-12 md:space-y-16">
        {#each data.groups as group (group.network)}
          <section>
            <h2 class="text-xl md:text-2xl font-bold uppercase tracking-wider">{group.network}</h2>
            <ul class="mt-4 space-y-2">
              {#each group.videos as video (video.id)}
                <li>
                  <a
                    href={`${base}/watch/${video.id}`}
                    data-sveltekit-preload-data="hover"
                    class="text-white hover:underline underline-offset-2"
                  >
                    {video.title}
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    </main>
    ```

    **Step 3 — Create src/routes/press/page.test.ts** (verbatim — Phase 5 callLoad pattern):

    ```typescript
    import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
    import { load } from './+page';
    import type { PageData } from './$types';

    // Mock $app/state + $app/paths BEFORE Page import (Phase 5 PBS page.test.ts pattern).
    const { mockPagePress } = vi.hoisted(() => ({
      mockPagePress: {
        url: new URL('http://localhost/press/'),
        route: { id: '/press' as string | null },
      },
    }));
    vi.mock('$app/state', () => ({ page: mockPagePress }));
    vi.mock('$app/paths', () => ({ base: '' }));

    import { mount, unmount } from 'svelte';
    import Page from './+page.svelte';

    async function callLoad(): Promise<PageData> {
      const event = {} as Parameters<typeof load>[0];
      const result = await load(event);
      if (!result) throw new Error('load() returned void');
      return result as PageData;
    }

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;
    beforeEach(() => {
      mockPagePress.url = new URL('http://localhost/press/');
      mockPagePress.route = { id: '/press' };
    });
    afterEach(() => {
      if (component) { unmount(component); component = undefined; }
      host?.remove();
    });
    function makeHost(): HTMLElement {
      host = document.createElement('div');
      document.body.appendChild(host);
      return host;
    }

    const EXPECTED_PRESTIGE_ORDER = [
      'HBO Max',
      'HBO',
      'PBS',
      'ABC News',
      'U2',
      'Amazon News',
      'Music Box Films',
      'Monument Releasing',
      'Cargo Film & Releasing',
      'AZPM',
      'HBODocs',
      'GrasshalmClips',
      'Lenny Cooke (Movie)',
    ];

    describe('/press load — PRES-01 / PRES-02', () => {
      it('returns 13 groups in prestige order', async () => {
        const data = await callLoad();
        expect(data.groups.length).toBe(13);
        expect(data.groups.map((g) => g.network)).toEqual(EXPECTED_PRESTIGE_ORDER);
      });
    });

    describe('/press render — D-12, D-13, D-14, D-15, D-16', () => {
      it('renders h1 with exact text "Press" (D-12 step 1)', async () => {
        const data = await callLoad();
        component = mount(Page, { target: makeHost(), props: { data } });
        const h1 = host.querySelector('h1');
        expect(h1?.textContent?.trim()).toBe('Press');
      });

      it('renders 13 <section> elements with h2 labels in prestige order', async () => {
        const data = await callLoad();
        component = mount(Page, { target: makeHost(), props: { data } });
        const sections = Array.from(host.querySelectorAll('section'));
        expect(sections.length).toBe(13);
        const h2Texts = sections.map((s) => s.querySelector('h2')?.textContent?.trim() ?? '');
        expect(h2Texts).toEqual(EXPECTED_PRESTIGE_ORDER);
      });

      it('renders 13 credit anchors total, each pointing to /watch/[id] with hover prefetch (D-13)', async () => {
        const data = await callLoad();
        component = mount(Page, { target: makeHost(), props: { data } });
        const creditLinks = Array.from(host.querySelectorAll('a[href^="/watch/"]'));
        expect(creditLinks.length).toBe(13);
        for (const a of creditLinks) {
          expect(a.getAttribute('data-sveltekit-preload-data')).toBe('hover');
          expect(a.getAttribute('href')).toMatch(/^\/watch\/.+$/);
        }
      });

      it('no section h2 carries a count suffix (D-16)', async () => {
        const data = await callLoad();
        component = mount(Page, { target: makeHost(), props: { data } });
        const h2s = Array.from(host.querySelectorAll('h2'));
        for (const h of h2s) {
          // Verify the heading does NOT end with parenthesized digit count like " (1)" or " (13)".
          expect(h.textContent?.trim() ?? '').not.toMatch(/\(\d+\)\s*$/);
        }
      });

      it('container uses max-w-3xl editorial width (D-14)', async () => {
        const data = await callLoad();
        component = mount(Page, { target: makeHost(), props: { data } });
        const main = host.querySelector('main');
        expect(main?.className).toContain('max-w-3xl');
        expect(main?.className).toContain('px-4');
        expect(main?.className).toContain('sm:px-6');
        expect(main?.className).toContain('lg:px-8');
      });
    });
    ```

    **Step 4 — UPDATE scripts/test-prerender-coverage.mjs** to add a Press check.

    Approach: add a new constant + check block alongside the Phase 5 PBS pattern (which uses a single named constant + a `failures.push(...)` line). Do NOT generalize — keep the existing per-route check structure for readability.

    Insert this block AFTER the existing PBS landing block (which currently ends at line 97 with the trailing `failures.push(...)` for `build/pbs-american-portrait/index.html`) and BEFORE the `if (failures.length > 0)` block at line 99:

    ```javascript
    // Phase 6: /press — broadcast credits landing route.
    // Prerendered (inherits from src/routes/+layout.ts prerender=true).
    // Build emits build/press/index.html when the route exists with real content.
    const pressIndex = join(BUILD, 'press', 'index.html');
    const pressIndexExists = existsSync(pressIndex);
    if (!pressIndexExists) {
      failures.push('Missing build/press/index.html (the broadcast credits landing route).');
    }
    ```

    Then UPDATE the failure summary line (currently line 103) and the PASS log block (currently lines 108-117) so the new `pressIndexExists` value participates in the diagnostic output. Concretely:

    - Failure summary line — append `, build/press/index.html=${pressIndexExists}` to the existing console.error template literal so the FAIL summary shows the press state too:

      ```javascript
      console.error(
        `Found: build/work/index.html=${workIndexExists}, build/work/<slug>/index.html count=${workCategoryDirs}, build/watch/<id>/index.html count=${watchIdDirs}, build/pbs-american-portrait/index.html=${pbsLandingExists}, build/press/index.html=${pressIndexExists}.`,
      );
      ```

    - PASS log — add one more console.log line in the PASS block:

      ```javascript
      console.log(`  - build/press/index.html: present`);
      ```

    **DO NOT** add `/about` or `/contact` checks here — Plan 06-02 owns those.

    **Step 5 — Manual sanity-grep against `videos.json`**: at the top of Task 2 execution, run `node -e "const v=require('./src/lib/data/videos.json'); const u=v.filter(x=>x.uploader!=='Michelle Ngo'); console.log(u.length); console.log(new Set(u.map(x=>x.uploader)).size);"` and confirm output is `13` then `13`. If either count differs, STOP and surface a checkpoint — the prestige order in Task 1 needs revision.
  </action>
  <verify>
    <automated>pnpm test -- --project=ui --run src/routes/press/page.test.ts && pnpm test -- --project=ui --run src/routes/press/_pressCredits.test.ts && pnpm build && node scripts/test-prerender-coverage.mjs</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/press/+page.ts` exists, exports `load: PageLoad<{ groups: PressGroup[] }>`.
    - File `src/routes/press/+page.svelte` no longer contains the substring `Coming soon.` (placeholder removed).
    - `grep -n "max-w-3xl" src/routes/press/+page.svelte` returns ≥1 match (D-14 container).
    - `grep -n "data-sveltekit-preload-data=\"hover\"" src/routes/press/+page.svelte` returns ≥1 match (Phase 3 D-14 prefetch).
    - `grep -n "build/press/index.html" scripts/test-prerender-coverage.mjs` returns ≥2 matches (constant + failure message + PASS log).
    - `pnpm test -- --project=ui --run src/routes/press/page.test.ts` exits 0.
    - `pnpm build` exits 0 AND `build/press/index.html` exists after build.
    - `node scripts/test-prerender-coverage.mjs` exits 0 after build (Phase 5 baseline of ≥1 work + ≥8 work/<slug> + ≥56 watch/<id> + ≥1 pbs-american-portrait + new ≥1 press ALL pass).
    - `pnpm check` exits 0 (no TypeScript / svelte-check errors).
  </acceptance_criteria>
  <done>/press renders the real broadcast credits list under the new container, the test suite passes, the prerender coverage script's new check passes after build, and the placeholder is fully replaced.</done>
</task>

</tasks>

<verification>
**Final phase checks for this plan:**

1. `pnpm test -- --project=ui --run src/routes/press` exits 0 (covers both helper test + page test under the ui project — note: the helper test runs in `ui` project per the glob `src/routes/**/*.{test,spec}.{js,ts}` in vite.config.ts line 103-104, NOT the `data` project).
2. `pnpm check` exits 0.
3. `pnpm build && node scripts/test-prerender-coverage.mjs` exits 0; output includes `build/press/index.html: present`.
4. Visual sanity (delegate to human verify on phase-level): `/press` shows `<h1>Press</h1>`, 13 prestige-ordered sections, each with one or more credit links to `/watch/[id]`.
5. **No new dependencies added**: `git diff --stat package.json pnpm-lock.yaml` shows no changes to those files at plan commit time.

**Atomic commits (executor produces):**
- Commit 1: `feat(06-01): add press credit helper + tests` (Task 1)
- Commit 2: `feat(06-01): build /press page + extend prerender coverage` (Task 2)
</verification>

<success_criteria>
- [ ] `src/routes/press/_pressCredits.ts` exports `getPressCredits()` returning 13 groups in the locked prestige order
- [ ] `src/routes/press/+page.ts` and `+page.svelte` replace the Phase 3 D-43 placeholder with real content
- [ ] /press renders h1 "Press" + 13 `<section>` elements with `<h2>` network labels + `<ul>` credit lists pointing at /watch/[id]
- [ ] Container is `max-w-3xl` (D-14, NOT max-w-7xl)
- [ ] Section ordering matches `<checkpoint>` approval verbatim
- [ ] Every credit anchor uses Phase 3 D-08 inline-link style and `data-sveltekit-preload-data="hover"`
- [ ] No section count suffix (D-16)
- [ ] `scripts/test-prerender-coverage.mjs` enforces ≥1 `build/press/index.html`
- [ ] `pnpm build` succeeds; new prerender coverage script passes
- [ ] No new dependencies
- [ ] PRES-01 + PRES-02 fully satisfied
</success_criteria>

<output>
After completion, create `.planning/phases/06-press-about-contact/06-01-SUMMARY.md` documenting:
- The locked prestige order (post-checkpoint)
- Files created / modified (with LOC counts)
- Deviations from the plan (if any) with rationale
- Downstream contract for Plan 06-03 (Footer): the press route is reachable at `${base}/press/` (trailing slash inherits from layout's `trailingSlash='always'`)
</output>
