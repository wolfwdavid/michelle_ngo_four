---
phase: 04-reel-led-home
plan: 05
type: execute
wave: 2
depends_on: ["04-02", "04-03", "04-04"]
files_modified:
  - src/routes/+page.ts
  - src/routes/+page.svelte
  - src/routes/page.test.ts
autonomous: true
requirements: ["HERO-01", "HERO-02", "HERO-03"]
must_haves:
  truths:
    - "`/` route shows the new Phase 4 hero composition (HeroPoster) above the fold, replacing the Phase 1 splash entirely (D-15)"
    - "Below the hero, an 8-card featured grid renders using the verbatim Phase 3 markup (max-w-7xl container, grid-cols-2 sm:grid-cols-3 lg:grid-cols-4, gap-2 sm:gap-3, keyed each)"
    - "Every featured card passes eager={true} to VideoCard (D-22 — all 8 above the fold once scrolled to)"
    - "Below the grid, a `View All Work →` link points to `${base}/work` with data-sveltekit-preload-data=\"hover\" (D-28)"
    - "+page.ts load function returns the 8 featured videos sorted by published date desc (D-26 module-load filter + D-25 ordering)"
    - "HERO-01 (full-bleed hero), HERO-02 (name + tagline above the fold), HERO-03 (PLAY REEL → /watch/264677021) all observable on a prerendered build/index.html"
    - "All page.test.ts stubs from Plan 04-01 turn green (describe.skip → describe)"
    - "`pnpm test:prerender` passes (build/index.html exists with hero asset reference + 8 featured cards rendered)"
  artifacts:
    - path: "src/routes/+page.ts"
      provides: "Featured-slice loader: filter v.featured then sort by published desc (mirrors /work/+page.ts pattern)"
      exports: ["load", "prerender"]
    - path: "src/routes/+page.svelte"
      provides: "Home composition: <HeroPoster /> + featured grid (8 cards) + View All Work link. ENTIRELY REPLACES the Phase 1 splash."
      contains: "<HeroPoster"
  key_links:
    - from: "src/routes/+page.svelte"
      to: "src/lib/components/HeroPoster.svelte"
      via: "import HeroPoster from '$lib/components/HeroPoster.svelte' + render at top of page"
      pattern: "HeroPoster"
    - from: "src/routes/+page.ts"
      to: "src/lib/data (videos)"
      via: "videos.filter(v => v.featured).toSorted(...)"
      pattern: "v.featured"
    - from: "src/routes/+page.svelte"
      to: "src/lib/components/VideoCard.svelte"
      via: "{#each data.videos as video (video.id)} <VideoCard {video} eager={true} />"
      pattern: "VideoCard"
    - from: "src/routes/+page.svelte"
      to: "/work route"
      via: "<a href={`${base}/work`}>View All Work →</a>"
      pattern: "View All Work"
---

<objective>
Wire all the Phase 4 pieces into the home route. Replace the Phase 1 splash at `src/routes/+page.svelte` ENTIRELY (D-15). Create `src/routes/+page.ts` that mirrors the Phase 3 `/work/+page.ts` load function pattern but filters to the featured slice (D-26). Compose `<HeroPoster />` (from Plan 04-02) + featured grid (8 `<VideoCard>` with `eager={true}` — D-22) + "View All Work →" overflow link (D-28). The result must prerender correctly to `build/index.html` so `pnpm test:prerender` stays green.

The composition is the LAST step in Phase 4 — it depends on:
- 04-02 having shipped `<HeroPoster />` (so the import resolves)
- 04-03 having flipped `featured: true` on 8 rows (so `videos.filter(v => v.featured)` returns 8)
- 04-04 having extended TopNav (so the page renders with the scroll-aware nav working live)

Output: 2 modified route files (`+page.svelte` REPLACED, `+page.ts` NEW), 1 modified test file (page.test.ts unskipped). All Phase 4 requirements (HERO-01/02/03) verifiable end-to-end at `pnpm build` + `pnpm test:prerender`.
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
@.planning/phases/04-reel-led-home/04-02-hero-poster-component-SUMMARY.md
@.planning/phases/04-reel-led-home/04-03-featured-slice-flips-SUMMARY.md
@.planning/phases/04-reel-led-home/04-04-topnav-scroll-aware-SUMMARY.md
@src/routes/+page.svelte
@src/routes/+page.ts
@src/routes/page.test.ts
@src/routes/work/+page.svelte
@src/routes/work/+page.ts
@src/lib/components/VideoCard.svelte
@scripts/test-prerender-coverage.mjs

<interfaces>
<!-- Contracts the page consumes (all already shipped in Wave 1). -->

From src/lib/components/HeroPoster.svelte (Plan 04-02 — no props):
```typescript
// Renders the full hero (img + gradient + h1 + p + CTA + scroll cue + sentinel).
// No props, no slots. Drop in as <HeroPoster />.
```

From src/lib/components/VideoCard.svelte (Phase 3 — verbatim):
```typescript
type Props = {
  video: Video;
  eager?: boolean;  // First N above the fold pass eager={true}; Phase 4 passes true for ALL 8.
};
// Renders <li><a href={`${base}/watch/${video.id}`}>...</a></li>.
```

From src/lib/data (Plan 04-03 — 8 videos now have featured===true):
```typescript
import { videos } from '$lib/data';
const featured = videos.filter(v => v.featured); // length === 8
```

Phase 3 /work/+page.ts pattern (Phase 4 mirrors this for `/`):
```typescript
import type { PageLoad } from './$types';
import { videos } from '$lib/data';

export const load: PageLoad = () => ({
  videos: [...videos].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  }),
});
```

Phase 3 /work/+page.svelte markup (Phase 4 mirrors verbatim for the featured grid section):
```svelte
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
```

Phase 4 difference: all 8 cards pass `eager={true}` (NOT `i < 8` — that pattern matters when there are 56 videos; with 8 videos `i < 8` is always true, but use explicit `true` for clarity).

scripts/test-prerender-coverage.mjs thresholds (from Phase 3 P00 SUMMARY in STATE.md):
- >=1 build/work/index.html
- >=8 build/work/<slug>/index.html
- >=56 build/watch/<id>/index.html
- (does NOT explicitly count build/index.html — but build must succeed which implicitly emits it)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create +page.ts (featured loader) and replace +page.svelte (hero + grid + View All); flip page.test.ts to green</name>
  <files>src/routes/+page.ts, src/routes/+page.svelte, src/routes/page.test.ts</files>
  <read_first>
    - src/routes/+page.svelte (Phase 1 splash — replaced entirely; read first to confirm the existing content)
    - src/routes/work/+page.ts (pattern source for the featured loader — Phase 4 mirrors with one filter step added)
    - src/routes/work/+page.svelte (pattern source for the grid section markup — Phase 4 mirrors verbatim)
    - src/routes/page.test.ts (Plan 04-01 wrote 3 describe.skip blocks — this task flips them and replaces the lazy loadPage + loadPageData helpers with static imports)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Code Examples → Example 3 (+page.ts featured filter)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Code Examples → Example 4 (+page.svelte composition)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-21..D-28 (featured grid decisions — markup, eager-all, no section heading, View-All link)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-15 (Phase 1 splash retired entirely; Phase 4 owns the whole +page.svelte body)
    - src/lib/components/VideoCard.svelte (eager prop default + usage shape)
  </read_first>
  <behavior>
    Tests expected to pass (3 tests in page.test.ts after `describe.skip` → `describe`):
    - Test 1 (HERO-01 `renders hero`): mount /+page.svelte with the load result; `<h1>` and `<img>` (the hero's poster image) both exist in the host DOM
    - Test 2 (D-22 / D-24 `8 featured cards`): exactly 8 `<ul> > <li> > <a>` anchors exist (the 8 VideoCards in the featured grid). The hero's PLAY REEL anchor is NOT inside a `<ul>`, so it doesn't pollute the count.
    - Test 3 (D-28 `View All Work link`): an anchor whose text matches `/view\s+all\s+work/i` exists, has `href` matching `/\/work\/?$/`, and has `data-sveltekit-preload-data="hover"`

    Additional end-to-end gate: `pnpm build` followed by `pnpm test:prerender` exits 0 — the prerendered build/index.html contains the hero asset reference AND 8 VideoCard renders.
  </behavior>
  <action>
    **Step A — create `src/routes/+page.ts`** with this exact content (mirrors `src/routes/work/+page.ts` shape):

    ```ts
    /**
     * /+page.ts — Phase 4 home route loader.
     *
     * D-26: filter `videos` to `featured === true` at module load.
     * D-25 + 04-RESEARCH Example 3: within the featured slice, sort by published
     * date descending. Featured-first is N/A here (all 8 are featured), so the
     * sort reduces to "published desc".
     *
     * Returns the typed Video[] for the home page's featured grid. Mirrors the
     * shape of /work/+page.ts so /+page.svelte consumes data.videos the same way.
     */
    import type { PageLoad } from './$types';
    import { videos } from '$lib/data';

    export const load: PageLoad = () => ({
      videos: videos
        .filter((v) => v.featured)
        .toSorted((a, b) => b.published.localeCompare(a.published)),
    });
    ```

    Notes:
    - No `export const prerender = true` — inherits from `src/routes/+layout.ts` (Phase 1 D-06 + Phase 3 trailingSlash='always' setup).
    - `.toSorted()` returns a NEW array; the source `videos` array is never mutated.
    - `b.published.localeCompare(a.published)` sorts DESC (newest first); matches /work/+page.ts's sort within non-featured.

    **Step B — REPLACE `src/routes/+page.svelte` ENTIRELY.** The current 6-line splash is retired (D-15). Write the new content:

    ```svelte
    <!--
      Phase 4 HERO-01 / HERO-02 / HERO-03: reel-led home composition.

      Replaces the Phase 1 splash entirely (D-15). Owns:
        - <HeroPoster />: full-bleed hero + name + tagline + PLAY REEL CTA + sentinel
        - Featured grid: 8 VideoCards (eager={true} on every card — D-22)
        - "View All Work →" overflow link (D-28)

      Discovery model: hero scroll-cue + grid + View-All link communicate intent.
      No section heading above the grid (D-27 sam-hendi-faithful).

      ESLint: svelte/no-navigation-without-resolve disabled — View All anchor uses
      base-path-safe `${base}/work` (same idiom as VideoCard + TopNav).
    -->
    <script lang="ts">
      /* eslint-disable svelte/no-navigation-without-resolve */
      import type { PageData } from './$types';
      import { base } from '$app/paths';
      import HeroPoster from '$lib/components/HeroPoster.svelte';
      import VideoCard from '$lib/components/VideoCard.svelte';

      let { data }: { data: PageData } = $props();
    </script>

    <svelte:head>
      <title>Michelle Ngo — Filmmaker &amp; Producer</title>
    </svelte:head>

    <HeroPoster />

    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {#each data.videos as video (video.id)}
          <VideoCard {video} eager={true} />
        {/each}
      </ul>

      <a
        href={`${base}/work`}
        data-sveltekit-preload-data="hover"
        class="block text-center mt-8 text-sm tracking-widest uppercase hover:underline"
      >
        View All Work →
      </a>
    </section>
    ```

    Critical literals (test contract):
    - `<HeroPoster />` rendered at the top of the page (provides the `<h1>` and `<img>` page.test.ts asserts)
    - The grid section uses the verbatim `/work` markup: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8` container + `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3` ul
    - `eager={true}` on every VideoCard (D-22 — explicitly `true`, not `i < 8`)
    - View All Work anchor: `href={` + "`${base}/work`" + `}`, `data-sveltekit-preload-data="hover"`, label `View All Work →` (unicode right-arrow)
    - View All Work classes: `block text-center mt-8 text-sm tracking-widest uppercase hover:underline` (D-28 plain text link, all-caps tracked, centered, hover underline)
    - `<title>Michelle Ngo — Filmmaker &amp; Producer</title>` in `<svelte:head>` (overrides the `<title>Michelle Ngo</title>` from +layout.svelte for the home route specifically)

    **Step C — flip page.test.ts skips to green.** In `src/routes/page.test.ts`, make these transformations:

    1. **Replace every `describe.skip(` with `describe(`** (3 occurrences).
    2. **Replace lazy `loadPage()` + `loadPageData()` indirection with static imports.** At the top of the file (after the existing `vi.mock` lines), ADD:

       ```ts
       import Page from './+page.svelte';
       import { load } from './+page';
       ```

       Then DELETE the `async function loadPage() { ... }` and `async function loadPageData() { ... }` helpers. In each test body, replace:

       ```ts
       const Page = await loadPage();
       const data = await loadPageData();
       ```

       with:

       ```ts
       const data = await (load as () => Promise<{ videos: unknown[] }>)();
       ```

       (The static `Page` import is already at the top of the file; only `data` needs assignment inside each test.) Drop `@ts-expect-error` comments since the modules now exist. Drop `async` from test signatures only if no `await` remains — but each test still calls `await load(...)`, so keep async on all three.
  </action>
  <verify>
    <automated>pnpm vitest run src/routes/page.test.ts && pnpm build && pnpm test:prerender</automated>
  </verify>
  <acceptance_criteria>
    - `src/routes/+page.ts` exists and exports a `load` function
    - +page.ts contains the literal `videos.filter((v) => v.featured)` (or equivalent `v.featured` filter)
    - +page.ts contains the literal `.toSorted(`
    - `src/routes/+page.svelte` exists
    - +page.svelte contains the literal `<HeroPoster` (the import + render)
    - +page.svelte contains the literal `import HeroPoster from '$lib/components/HeroPoster.svelte'`
    - +page.svelte contains the literal `import VideoCard from '$lib/components/VideoCard.svelte'`
    - +page.svelte contains the literal `eager={true}` (the hot D-22 attribute on every card)
    - +page.svelte contains the literal `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3` (D-25 — verbatim /work grid)
    - +page.svelte contains the literal `max-w-7xl px-4 sm:px-6 lg:px-8 py-8` (D-25 — verbatim /work container)
    - +page.svelte contains the literal `View All Work →` (the View All anchor label)
    - +page.svelte contains the literal `data-sveltekit-preload-data="hover"` at least 1x (for View All)
    - +page.svelte contains the literal `block text-center mt-8 text-sm tracking-widest uppercase hover:underline` (D-28 View All classes)
    - +page.svelte does NOT contain `Site coming soon` (Phase 1 splash retired — D-15)
    - +page.svelte does NOT contain a feature-grid section heading like `<h2>Featured` (D-27 — no heading)
    - `grep -c "describe.skip" src/routes/page.test.ts` equals 0
    - page.test.ts contains `import Page from './+page.svelte'` (static import)
    - page.test.ts contains `import { load } from './+page'` (static import)
    - `pnpm vitest run src/routes/page.test.ts -t "renders hero"` exits 0
    - `pnpm vitest run src/routes/page.test.ts -t "8 featured cards"` exits 0
    - `pnpm vitest run src/routes/page.test.ts -t "View All Work link"` exits 0
    - `pnpm vitest run src/routes/page.test.ts` exits 0 (full suite green)
    - `pnpm test` exits 0 (entire project test suite — Phase 1/2/3/4 tests all green)
    - `pnpm check` exits 0
    - `pnpm build` exits 0
    - `pnpm test:prerender` exits 0 (Phase 3 prerender thresholds still met)
    - `build/index.html` exists after `pnpm build` (the home route's prerendered output)
    - `grep -c "hero-poster" build/index.html` >= 1 (the hashed hero asset URL appears in the SSR'd HTML — proves the LCP `<img>` + preload `<link>` rendered)
    - `grep -c "View All Work" build/index.html` >= 1 (the View All anchor SSR'd)
    - `grep -c "watch/264677021" build/index.html` >= 1 (the PLAY REEL anchor SSR'd)
  </acceptance_criteria>
  <done>
    `/` is the reel-led home: hero with name + tagline + PLAY REEL CTA above the fold, then 8 curated cards below, then a View All Work overflow link. The Phase 1 splash is fully retired. HERO-01 / HERO-02 / HERO-03 are all observable in the prerendered HTML and the test suite. Phase 4 is implementation-complete and ready for verify-work / UAT.
  </done>
</task>

</tasks>

<verification>
After the task:

1. `pnpm vitest run src/routes/page.test.ts` — exits 0 (all 3 suites GREEN).
2. `pnpm test` — exits 0 (entire project, Phase 1/2/3/4).
3. `pnpm check` — exits 0.
4. `pnpm build` — exits 0 and emits `build/index.html` with hero asset reference + 8 featured-card anchors + View All anchor.
5. `pnpm test:prerender` — exits 0 (Phase 3 thresholds still met).
6. **Cross-route manual sweep (deferred to UAT, per 04-VALIDATION.md manual-only verifications):**
   - Visit `/` in dev: hero fills viewport (`min-h-dvh`), name + tagline + CTA legible over the gradient, TopNav transparent.
   - Scroll past hero: TopNav flips to solid `bg-neutral-950/95 backdrop-blur`.
   - Click PLAY REEL: navigates to `/watch/264677021`, reel plays.
   - Navigate to `/work`, `/work/[category]`, `/watch/[id]`, `/about`, `/press`, `/contact`: TopNav stays SOLID from first paint on every one (no transparency leakage — D-13 cross-route).
   - Click "View All Work →" below the grid: lands on `/work` with all 56 cards.
   - At mobile widths (<640px): hero CTA tappable, no horizontal scroll.
</verification>

<success_criteria>
Plan 04-05 is complete (and Phase 4 is implementation-complete) when:

- [ ] `src/routes/+page.ts` exists with a `load` function that filters `videos.featured` and sorts by published desc
- [ ] `src/routes/+page.svelte` is FULLY REPLACED (no Phase 1 splash content remains)
- [ ] `<HeroPoster />` is rendered at the top of `+page.svelte`
- [ ] The featured grid renders 8 `<VideoCard {video} eager={true} />` using verbatim /work markup (max-w-7xl + 2/3/4 responsive grid)
- [ ] "View All Work →" anchor with hover prefetch links to `${base}/work`
- [ ] page.test.ts has zero `describe.skip` — all 3 tests green
- [ ] `pnpm test && pnpm check && pnpm build && pnpm test:prerender` all exit 0
- [ ] `build/index.html` contains hero-poster hashed URL + 8 watch links + the View All anchor
- [ ] HERO-01, HERO-02, HERO-03 all verifiable on a fresh build
</success_criteria>

<output>
After completion, create `.planning/phases/04-reel-led-home/04-05-home-page-composition-SUMMARY.md` per the standard summary template.

Phase 4 is implementation-complete at this point — orchestrator should proceed to `/gsd:verify-work` followed by UAT (manual cross-route sweep + visual gradient/legibility + mobile dvh check per 04-VALIDATION.md).
</output>
