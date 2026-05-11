---
phase: 03-grid-filter-watch
plan: 03
type: execute
wave: 2
depends_on: ["03-00", "03-01"]
files_modified:
  - src/routes/watch/[id]/+page.ts
  - src/routes/watch/[id]/+page.svelte
  - src/routes/watch/[id]/+page.test.ts
  - src/routes/+error.svelte
autonomous: true
requirements:
  - FILT-01
  - FILT-02
  - FILT-04
  - GRID-01
  - GRID-04
  - GRID-05
must_haves:
  truths:
    - "/watch/[id] +page.ts exports `entries: EntryGenerator` returning all 56 video ids — prerender enumerates 56 HTML files (D-31)."
    - "/watch/[id] `load()` narrows `params.id` via `getById(...)`; throws `error(404, 'Video not found')` on unknown id (D-32)."
    - "/watch/[id] `load()` also computes the 'more in [Category]' rail at build time: same-category videos minus the current one, sorted by D-25 (D-36, D-37)."
    - "/watch/[id] page renders a direct iframe in an `aspect-video` wrapper (D-33) — no autoplay, no JS player libs."
    - "Player container is `max-w-5xl` centered (D-34); metadata + rail below expand to `max-w-7xl`."
    - "Metadata in D-35 order: <h1>{title}</h1>, interactive CategoryTag href=/work/<slug>, uploader, published year (4-digit), description (only if non-empty, whitespace-pre-line). NO duration_seconds, NO credits, NO tags in v1."
    - "Rail (FILT-02): `<h2><a href=/work/<slug>>More in {category} →</a></h2>` then the same responsive grid + VideoCard. Hidden entirely if rail is empty (D-38)."
    - "`+error.svelte` exists at `src/routes/+error.svelte` rendering a minimal 404 page (title 'Not found' + link back to /work)."
    - "All `describe.skip` blocks in `src/routes/watch/[id]/+page.test.ts` (3) have had `.skip` removed and turn GREEN."
    - "`pnpm build` emits 56 `build/watch/<id>/index.html` files."
    - "`pnpm test:prerender` exits 0 (combined with Plan 03-02's /work output, all thresholds are met)."
  artifacts:
    - path: "src/routes/watch/[id]/+page.ts"
      provides: "entries() returns 56 ids; load() returns {video, rail} with D-25 sort"
      exports: ["entries", "load"]
    - path: "src/routes/watch/[id]/+page.svelte"
      provides: "iframe player (aspect-video, max-w-5xl) + metadata (h1, chip, uploader/year, description) + rail (h2 link + 2/3/4 grid)"
    - path: "src/routes/+error.svelte"
      provides: "Minimal 404 page — title + link back to /work"
  key_links:
    - from: "src/routes/watch/[id]/+page.ts"
      to: "$lib/data"
      via: "import { getById, getByCategory, videos } from '$lib/data'"
      pattern: "getById"
    - from: "src/routes/watch/[id]/+page.ts"
      to: "@sveltejs/kit"
      via: "import { error } from '@sveltejs/kit'"
      pattern: "error\\(404"
    - from: "src/routes/watch/[id]/+page.svelte"
      to: "src/lib/components/VideoCard.svelte"
      via: "import VideoCard from '$lib/components/VideoCard.svelte' (used in rail)"
      pattern: "import VideoCard from"
    - from: "src/routes/watch/[id]/+page.svelte"
      to: "src/lib/components/CategoryTag.svelte"
      via: "import CategoryTag from '$lib/components/CategoryTag.svelte' (used in metadata with href)"
      pattern: "import CategoryTag from"
    - from: "src/routes/watch/[id]/+page.svelte"
      to: "$lib/data"
      via: "import { categoryToSlug } from '$lib/data' (for the chip + rail heading hrefs)"
      pattern: "categoryToSlug"
    - from: "src/routes/+error.svelte"
      to: "$app/paths"
      via: "import { base } from '$app/paths' for the BASE_PATH-safe /work link"
      pattern: "from\\s+['\"]\\$app/paths['\"]"
---

<objective>
Build the `/watch/[id]` route — the heart of the killer feature: a producer clicks any card on /work, lands on a watch page that plays the video via iframe embed, and immediately sees the "More in [Category]" rail of other videos in the same category. Also ship the minimal `+error.svelte` fallback for unknown ids/slugs.

Purpose: Wave 2 of Phase 3, parallel with Plan 03-02 (work routes). `files_modified` is disjoint from Plan 03-02 (this plan touches `src/routes/watch/[id]/*` and `src/routes/+error.svelte`; Plan 03-02 touches `src/routes/work/*`). Both consume the same `VideoCard` component from Plan 03-01 (read-only). Implements FILT-01 (click → /watch/[id] plays), FILT-02 (same-category rail), FILT-04 (URL = state via path-param). Also touches GRID-01/04/05 via the rail rendering VideoCards.

Output:
- `src/routes/watch/[id]/+page.ts` — `entries()` for 56 ids + load returning `{video, rail}`
- `src/routes/watch/[id]/+page.svelte` — player (iframe, max-w-5xl) + metadata (D-35 order) + rail (D-36/37/38)
- `src/routes/+error.svelte` — minimal 404 page
- `src/routes/watch/[id]/+page.test.ts` — 3 describe.skip → describe; 9 tests pass
- `pnpm build` emits 56 `build/watch/<id>/index.html` files
- When run AFTER Plan 03-02's /work routes also build, `pnpm test:prerender` exits 0
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
<!-- Phase 1 carry-forward: adapter-static strict, prerender=true in +layout.ts, BASE_PATH wiring, +layout.svelte renders noindex meta. -->
<!-- Phase 2 carry-forward: $lib/data public surface — getById, getByCategory, videos. -->
<!-- Plan 03-01 carry-forward: VideoCard (used in rail) + CategoryTag (used in metadata with href). -->

From src/lib/data/index.ts (Phase 2):
```ts
export { videos, getById, getByCategory, categoryToSlug, … } from … ;
```

After parsing, every Video has fields:
- `source: 'youtube' | 'vimeo'` (D-discriminated)
- `id: string`
- `title: string`
- `uploader: string`
- `published: string` (ISO `YYYY-MM-DD`)
- `thumbnail: string` (URL)
- `embed: string` (URL — e.g., `https://www.youtube.com/embed/9Zmw69UZSsI` or `https://player.vimeo.com/video/264677021`)
- `category: Category`
- `featured: boolean`
- `hidden: boolean` (always false in v1; pre-filtered out of `videos`)
- `tags: string[]`
- optional: `url`, `description`, `duration_seconds`, `credits`

From src/lib/components/VideoCard.svelte (Plan 03-01):
- Props: `{ video: Video; eager?: boolean }`
- Root element: `<li>` (drops into `<ul class="grid …">` directly).

From src/lib/components/CategoryTag.svelte (Plan 03-01):
- Props: `{ category: Category; href?: string }`
- When `href` is provided: renders `<a href={href}>…</a>` (D-35 interactive on /watch metadata).
- When `href` is omitted: renders `<span>…</span>` (D-13 non-interactive on cards).

From svelte.config.js (Phase 1):
- `adapter: adapter({ pages: 'build', assets: 'build', fallback: '404.html', precompress: false, strict: true })`.
- `paths: { base: process.env.BASE_PATH ?? '' }`.

From src/routes/watch/[id]/+page.test.ts (Plan 03-00 stub):
- 3 describe.skip blocks:
  - '/watch/[id] +page.ts load — FILT-01 (D-31, D-32, D-33)' (2 tests: valid id, 404 on unknown id)
  - '/watch/[id] +page.ts load — FILT-02 rail (D-36, D-37, D-38)' (4 tests: same-category, excludes self, count-minus-one, D-25 sort)
  - '/watch/[id] +page.ts entries — FILT-01 prerender enumeration' (3 tests: 56 entries, non-empty ids, contains producer reel)
- 9 tests total.

Pitfall 1 (Plan 03-02 carry): `entries: EntryGenerator` is mandatory under `adapter-static strict: true` — even though links from /work would auto-crawl, explicit `entries()` is the canonical SvelteKit 2 pattern.

Pitfall 2 (noUncheckedIndexedAccess): `getById(id)` returns `Video | undefined`; MUST narrow with `if (!video) error(404, …)` before accessing fields.

D-25 sort (verbatim — also used in Plan 03-02):
```ts
.toSorted((a, b) => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return b.published.localeCompare(a.published);
})
```

D-35 metadata order (verbatim from CONTEXT.md):
1. Title as `<h1>` (the only `<h1>` on the page)
2. Small all-caps category tag (LINKS to `/work/[category]` — interactive on watch)
3. Uploader/client name
4. Published year (4-digit, derived from `video.published.slice(0, 4)`)
5. Description block (rendered as plain text, `whitespace-pre-line`) — **only if `video.description` is present and non-empty.**

D-33 player contract:
```svelte
<div class="relative aspect-video bg-neutral-900">
  <iframe
    src={video.embed}
    title={video.title}
    loading="lazy"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
    allowfullscreen
    class="absolute inset-0 w-full h-full border-0"
  ></iframe>
</div>
```
No autoplay query param (Pitfall 5 — browser autoplay policy). The `allow="autoplay; …"` attribute is for the iframe's internal use, not ours.

D-38 empty rail handling:
- If `getByCategory(video.category).filter(v => v.id !== video.id)` is empty, the entire "More in [Category]" section (heading + grid) is hidden.
- v1: every category has ≥3 videos, so the rail is never empty in practice. Defensive `{#if rail.length > 0}` wrapping.

+error.svelte contract (from 03-CONTEXT.md Claude's Discretion):
- Minimal: title "Not found", short copy, link back to `/work`.
- Inherits the +layout.svelte chrome (noindex meta + body wrapper) automatically.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build /watch/[id] +page.ts with entries() and load() (FILT-01 + FILT-02)</name>
  <files>src/routes/watch/[id]/+page.ts, src/routes/watch/[id]/+page.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-31 id-only route, D-32 narrowed load, D-25 sort, D-36 rail link to /work/<slug>, D-37 same-category-minus-self, D-38 empty rail handling)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 405-431 Pattern 5 +page.ts — exact entries + load code; lines 681-691 Pitfall 1 + Pitfall 2)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\watch\[id]\+page.test.ts (Plan 03-00 stub — 3 describe.skip blocks with 9 tests; remove .skip + @ts-expect-error)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\index.ts (Phase 2 — getById, getByCategory, videos exports)
  </read_first>
  <behavior>
    Load FILT-01 (2 tests):
    - Test 1 (`'valid id returns the matching video'`): `load({params:{id:'264677021'}})` resolves to `{video, rail}` where `video.id === '264677021'` AND `video.category === 'Reel'`.
    - Test 2 (`'unknown id throws 404 (D-32)'`): `load({params:{id:'does-not-exist-xyz'}})` rejects with `{ status: 404 }`.

    Load FILT-02 rail (4 tests):
    - Test 3 (`'rail contains other videos in the same category'`): for any v.id, all rail videos have `category === video.category` AND `id !== video.id`.
    - Test 4 (`'rail excludes the current video (D-37)'`): rail.map(v=>v.id) does NOT contain the current id.
    - Test 5 (`'rail count = same-category count - 1 (Reel has 4; rail = 3)'`): for the producer reel id, `rail.length === 3`.
    - Test 6 (`'rail is sorted featured-first then published date desc (D-25)'`): for a PBS video, non-featured rail items have descending `published`.

    Entries FILT-01 (3 tests):
    - Test 7 (`'returns one entry per video — count matches videos.length (56)'`): `entries().length === 56`.
    - Test 8 (`'every entry has a non-empty id'`): every entry.id is a non-empty string.
    - Test 9 (`'entries include the producer reel id (vimeo:264677021)'`): the id list contains '264677021'.
  </behavior>
  <action>
    Step 1 — Create `src/routes/watch/[id]/+page.ts` with EXACTLY this content:

    ```ts
    /**
     * /watch/[id] — D-31 route (id only, no source prefix), D-32 narrowed load.
     *
     * entries(): mandatory under adapter-static strict: true (03-RESEARCH.md Pitfall 1).
     *   Returns one entry per video, derived from the $lib/data videos export
     *   (already hidden-filtered per Phase 2 D-14). Prerenders exactly 56 HTML
     *   files (build/watch/<id>/index.html).
     *
     * load(): D-32 — narrows params.id via getById(). On unknown id throws
     *   error(404). The `error()` helper from @sveltejs/kit returns `never`
     *   so TypeScript narrows `video` from `Video | undefined` → `Video`.
     *
     * Rail (D-36, D-37, D-38): build-time computed — same-category videos minus
     *   the current one, sorted by D-25 (featured-first, then published desc).
     *   Returned alongside `video` so the prerendered HTML contains both.
     *   Zero client-side JS for the rail.
     */
    import { error } from '@sveltejs/kit';
    import type { EntryGenerator, PageLoad } from './$types';
    import { getById, getByCategory, videos } from '$lib/data';

    export const entries: EntryGenerator = () => videos.map((v) => ({ id: v.id }));

    export const load: PageLoad = ({ params }) => {
      const video = getById(params.id);
      if (!video) error(404, 'Video not found');

      const rail = [...getByCategory(video.category)]
        .filter((v) => v.id !== video.id)
        .toSorted((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return b.published.localeCompare(a.published);
        });

      return { video, rail };
    };
    ```

    Notes:
    - `videos.map((v) => ({ id: v.id }))` — directly enumerates the 56 prerender entries. Hidden videos already filtered out by Phase 2 D-14.
    - `[...getByCategory(video.category)]` — spread because `getByCategory` returns `readonly Video[]` and `.filter().toSorted()` chains need a non-readonly type for the eventual return.
    - The rail is fully computed in `load()` — Vite/SvelteKit serializes the result into the prerendered HTML's `__sveltekit_data` block. No client-side `getByCategory()` call.

    Step 2 — In `src/routes/watch/[id]/+page.test.ts`:

    a. Remove the line `// @ts-expect-error — module exists after Plan 03-03` directly above the `import { load, entries } from './+page';` line.

    b. Change ALL THREE `describe.skip(...)` calls to `describe(...)`:
       - `describe.skip('/watch/[id] +page.ts load — FILT-01 (D-31, D-32, D-33)', ...)` → `describe(...)`
       - `describe.skip('/watch/[id] +page.ts load — FILT-02 rail (D-36, D-37, D-38)', ...)` → `describe(...)`
       - `describe.skip('/watch/[id] +page.ts entries — FILT-01 prerender enumeration', ...)` → `describe(...)`

    The top of the file should now read:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { load, entries } from './+page';
    import { videos, producerReelId } from '$lib/data';
    ```

    Step 3 — Run the test file:
    ```
    pnpm vitest run src/routes/watch/[id]/+page.test.ts
    ```
    Expected: 9 tests pass.

    Step 4 — Run `pnpm check` — expected: exit 0.

    DO NOT touch `+page.svelte` in this task — Task 2 owns the page render. The load function tests pass without a +page.svelte present (vitest imports the .ts file directly).
  </action>
  <verify>
    <automated>pnpm vitest run src/routes/watch/[id]/+page.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/watch/[id]/+page.ts` exists.
    - File contains the literal string `import { error } from '@sveltejs/kit';`.
    - File contains the literal string `import type { EntryGenerator, PageLoad } from './$types';`.
    - File contains the literal string `import { getById, getByCategory, videos } from '$lib/data';`.
    - File contains the literal string `export const entries: EntryGenerator = () => videos.map((v) => ({ id: v.id }));`.
    - File contains the literal string `const video = getById(params.id);`.
    - File contains the literal string `if (!video) error(404,`.
    - File contains the literal string `[...getByCategory(video.category)]`.
    - File contains the literal string `.filter((v) => v.id !== video.id)` (D-37 — rail excludes current video).
    - File contains the literal string `b.published.localeCompare(a.published)` (D-25 descending date sort).
    - File contains the literal string `return { video, rail };`.
    - `src/routes/watch/[id]/+page.test.ts` no longer contains `describe.skip`.
    - `src/routes/watch/[id]/+page.test.ts` no longer contains `@ts-expect-error`.
    - `pnpm vitest run src/routes/watch/[id]/+page.test.ts` exits 0 with 9 tests passing.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    /watch/[id] +page.ts ships: entries() enumerates 56 ids, load() narrows id→Video+rail (D-25 sorted, current excluded). All 9 +page.ts tests pass.
  </done>
</task>

<task type="auto">
  <name>Task 2: Build /watch/[id] +page.svelte (iframe player + D-35 metadata + FILT-02 rail) and src/routes/+error.svelte</name>
  <files>src/routes/watch/[id]/+page.svelte, src/routes/+error.svelte</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-33 iframe contract, D-34 player container max-w-5xl, D-35 metadata order, D-36 rail heading-is-link, D-38 empty rail hide, D-19 heading hierarchy)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 432-491 Pattern 5 +page.svelte — exact iframe + metadata + rail markup; lines 700-708 Pitfall 5 no autoplay; lines 770-777 noindex meta carry-forward)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\VideoCard.svelte (Plan 03-01 — used in the rail; props {video, eager?})
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\components\CategoryTag.svelte (Plan 03-01 — used in metadata WITH href; props {category, href})
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\watch\[id]\+page.ts (Task 1 just-created — load returns {video, rail})
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\routes\+layout.svelte (Phase 1 — inherits noindex meta, no changes needed here)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\scripts\test-prerender-coverage.mjs (Plan 03-00 — this task's `pnpm build` makes /watch/<id>/index.html count = 56)
  </read_first>
  <action>
    Step 1 — Create `src/routes/watch/[id]/+page.svelte` with EXACTLY this content:

    ```svelte
    <!--
      /watch/[id] — the killer feature endpoint.

      Decisions implemented:
        D-33 — direct iframe embed in aspect-video wrapper; no autoplay, no facade
        D-34 — player container max-w-5xl centered; metadata + rail max-w-7xl below
        D-35 — metadata order: <h1> title, interactive CategoryTag → /work/[slug],
                uploader · year, description (only if non-empty, whitespace-pre-line)
        D-36 — rail heading IS the link: <h2><a href=/work/[slug]>More in {category} →</a></h2>
        D-37 — rail uses VideoCard + same 2/3/4 responsive grid as /work
        D-38 — empty rail handling: hide the entire section if rail.length === 0
        D-19 — heading hierarchy: h1 (page title), h2 (rail section), h3 (card titles, via VideoCard)
        D-09 hairline divider — border-t border-white/10 between metadata and rail
    -->
    <script lang="ts">
      import { base } from '$app/paths';
      import type { PageData } from './$types';
      import VideoCard from '$lib/components/VideoCard.svelte';
      import CategoryTag from '$lib/components/CategoryTag.svelte';
      import { categoryToSlug } from '$lib/data';

      let { data }: { data: PageData } = $props();
      const { video, rail } = data;
      const year = video.published.slice(0, 4); // D-35 step 4 — 4-digit year from ISO date
      const categorySlug = categoryToSlug(video.category);
    </script>

    <svelte:head>
      <title>Michelle Ngo — {video.title}</title>
    </svelte:head>

    <article class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- D-34 Player: max-w-5xl centered, aspect-video. D-33: direct iframe, no autoplay. -->
      <div class="mx-auto max-w-5xl">
        <div class="relative aspect-video bg-neutral-900">
          <iframe
            src={video.embed}
            title={video.title}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
            class="absolute inset-0 w-full h-full border-0"
          ></iframe>
        </div>
      </div>

      <!-- D-35 Metadata: h1, interactive chip, uploader · year, optional description -->
      <div class="mx-auto max-w-7xl mt-6 space-y-2">
        <h1 class="text-2xl md:text-3xl font-medium">{video.title}</h1>
        <CategoryTag category={video.category} href={`${base}/work/${categorySlug}`} />
        <p class="text-sm text-neutral-400">{video.uploader} · {year}</p>
        {#if video.description}
          <p class="text-sm text-neutral-300 whitespace-pre-line max-w-3xl pt-2">
            {video.description}
          </p>
        {/if}
      </div>

      <!-- D-36/37/38 Rail: heading-is-link, same VideoCard + 2/3/4 grid, hide if empty -->
      {#if rail.length > 0}
        <section class="mx-auto max-w-7xl mt-10 border-t border-white/10 pt-8">
          <h2 class="text-lg font-medium mb-4">
            <a href={`${base}/work/${categorySlug}`} class="hover:underline">
              More in {video.category} →
            </a>
          </h2>
          <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {#each rail as v (v.id)}
              <VideoCard video={v} />
            {/each}
          </ul>
        </section>
      {/if}
    </article>
    ```

    Notes:
    - `const { video, rail } = data;` destructures the load return synchronously — `video` is `Video` (non-undefined; load already narrowed via error(404)).
    - `video.published.slice(0, 4)` — extracts 4-digit year from `YYYY-MM-DD`. Works because the schema's `published` is validated as ISO date.
    - `<CategoryTag … href={…}>` — passes the href, so CategoryTag renders as `<a>` (D-35 interactive). On cards (Plan 03-02 /work, /work/[category]) the chip is `<span>` (no href).
    - Rail cards DO NOT use `eager={true}` — rail thumbs are below the player and likely off-viewport on mobile; lazy is correct.
    - `border-t border-white/10` — D-09 hairline divider between metadata and rail.
    - The iframe's `allow="autoplay; …"` attribute permits user-initiated autoplay inside the embed (clicking the play button). We never set `?autoplay=1` (Pitfall 5).
    - The page does NOT add `<meta name="robots">` — the global noindex from `+layout.svelte` (Phase 1 D-11) inherits.

    Step 2 — Create `src/routes/+error.svelte` with EXACTLY this content:

    ```svelte
    <!--
      Phase 3 minimal +error.svelte — catches D-30 (unknown category slug)
      and D-32 (unknown video id) 404s. Inherits +layout.svelte chrome.
    -->
    <script lang="ts">
      import { base } from '$app/paths';
      import { page } from '$app/state';
    </script>

    <svelte:head>
      <title>Michelle Ngo — Not found</title>
    </svelte:head>

    <main class="min-h-[60vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Not found</h1>
      <p class="mt-4 text-sm text-neutral-400">
        {page.status} — That page doesn't exist (yet).
      </p>
      <a
        href={`${base}/work`}
        class="mt-6 inline-block text-sm underline underline-offset-4 hover:no-underline"
      >
        Back to work →
      </a>
    </main>
    ```

    Notes:
    - `page.status` from `$app/state` (SvelteKit 2.27+) gives the numeric status code so the page reads "404 — That page…".
    - Link back to `/work` per the CONTEXT.md "minimal +error.svelte" guidance.
    - Inherits noindex meta + chrome from +layout.svelte (no extra meta needed).

    Step 3 — Verify prerender works end-to-end. Run:
    ```
    pnpm check && pnpm test && pnpm build
    ```
    Expected: all three exit 0. After build:
    - `build/watch/index.html` does NOT exist (no /watch/ static parent — /watch is only meaningful with an id).
    - `build/watch/264677021/index.html` exists (producer reel — Vimeo id).
    - 56 directories total under `build/watch/`, each with an `index.html`.
    - `build/404.html` exists (adapter-static fallback emits this; +error.svelte is the source).

    Step 4 — Run the prerender coverage script. This should now PASS (assuming Plan 03-02 ran first and emitted the /work files; if running 03-02 and 03-03 in parallel, the parent orchestrator's wave gate ensures both have completed before this script gates merge):

    ```
    pnpm test:prerender
    ```
    Expected: exit 0. Output:
    - `build/work/index.html: present`
    - `build/work/<slug>/index.html: 8 files`
    - `build/watch/<id>/index.html: 56 files`

    If Plan 03-02 has NOT yet completed (running in isolation), `pnpm test:prerender` will fail on the /work counts — that's expected; the orchestrator's wave merge gate reruns it after both Wave 2 plans land.
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/watch/[id]/+page.svelte` exists.
    - File contains the literal string `import { base } from '$app/paths';`.
    - File contains the literal string `import VideoCard from '$lib/components/VideoCard.svelte';`.
    - File contains the literal string `import CategoryTag from '$lib/components/CategoryTag.svelte';`.
    - File contains the literal string `import { categoryToSlug } from '$lib/data';`.
    - File contains the literal string `const { video, rail } = data;`.
    - File contains the literal string `video.published.slice(0, 4)` (D-35 year extraction).
    - File contains the literal string `mx-auto max-w-5xl` (D-34 player container).
    - File contains the literal string `relative aspect-video bg-neutral-900` (D-33 player wrapper).
    - File contains an `<iframe` tag with literal substring `src={video.embed}` AND literal `loading="lazy"` AND literal `allowfullscreen`.
    - File contains the literal string `allow="autoplay; encrypted-media; picture-in-picture; fullscreen"`.
    - File does NOT contain the literal string `autoplay=1` (Pitfall 5 — no autoplay query param).
    - File contains the literal string `<h1` (D-35 / D-19 — title is h1).
    - File contains the literal string `` <CategoryTag category={video.category} href={`${base}/work/${categorySlug}`} /> ``.
    - File contains the literal string `whitespace-pre-line` (D-35 description rendering).
    - File contains the literal string `{#if video.description}` (D-35 conditional description).
    - File contains the literal string `{#if rail.length > 0}` (D-38 empty-rail hide).
    - File contains the literal string `<h2` AND the literal string `More in` (D-36 rail heading).
    - File contains the literal string `border-t border-white/10` (D-09 divider).
    - File contains the literal string `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3` (D-21 rail grid).
    - File `src/routes/+error.svelte` exists.
    - File contains the literal string `import { base } from '$app/paths';`.
    - File contains the literal string `import { page } from '$app/state';`.
    - File contains the literal string `Not found` (page title text).
    - File contains the literal string `` href={`${base}/work`} `` (back-to-work link).
    - `pnpm check` exits 0.
    - `pnpm test` exits 0 (data 32 + components 20 + /work 3 + /work/[category] 7 + /watch/[id] 9 = 71 tests; TopNav 5 still skipped — Plan 03-04).
    - `pnpm build` exits 0.
    - After `pnpm build`: `build/watch/264677021/index.html` exists (producer reel).
    - After `pnpm build`: counting directories under `build/watch/` that contain an `index.html`, the count is exactly 56. Verifiable by `node scripts/test-prerender-coverage.mjs` — the line `build/watch/<id>/index.html: 56 files` must appear.
    - After `pnpm build` AND assuming Plan 03-02 has also landed in the same build, `pnpm test:prerender` exits 0 (all three thresholds met: /work index present, /work/<slug>=8, /watch/<id>=56).
  </acceptance_criteria>
  <done>
    /watch/[id] route ships: iframe player (D-33, D-34), D-35 metadata (h1 + interactive chip + uploader·year + optional description), FILT-02 rail (D-36/37/38), and `+error.svelte` for 404 fallback. `pnpm build` emits 56 `build/watch/<id>/index.html` files. With Plan 03-02 also landed, `pnpm test:prerender` exits 0.
  </done>
</task>

</tasks>

<verification>
**After both tasks complete (assuming Plan 03-02 has also landed in the same build state):**

1. `pnpm test` exits 0 — 71 tests passing (32 data + 20 components + 10 work routes + 9 watch route). TopNav 5 still skipped.
2. `pnpm check` exits 0.
3. `pnpm build` exits 0.
4. `build/watch/` contains 56 subdirectories, each with `index.html`. Specific check: `build/watch/264677021/index.html` (producer reel — Vimeo); for a YouTube example, `build/watch/<any 11-char YT id from videos.json>/index.html`.
5. `build/404.html` exists (adapter-static fallback page, source is +error.svelte).
6. `pnpm test:prerender` exits 0 (paired with Plan 03-02's /work output).

**Goal-backward check (Phase 3 success criteria 3, 4):**
- Truth 3 ("Clicking any card navigates to /watch/[id], plays the video via its embed URL, and renders a 'More in [Category]' rail of other videos sharing that category"):
  - VideoCard click → /watch/[id] route exists (Plan 03-02 cards link here via base+/watch/+id from Plan 03-01).
  - Iframe with `src={video.embed}` plays the video (FILT-01) ✓ at route level.
  - Rail with same-category videos, sorted, current excluded, heading links to /work/<slug> (FILT-02) ✓ at route level + verified by 4 load tests.
- Truth 4 ("/work/[category] (or /work?category=[slug]) renders only that category's videos and the URL alone reproduces that filtered view on reload or paste"):
  - Already addressed by Plan 03-02 at the /work side.
  - The /watch page's interactive CategoryTag chip (this plan) is what closes the round-trip: producer clicks card on /work → /watch/[id] → clicks chip → /work/<slug> → sees the filtered grid (FILT-04) ✓.

**Coverage notes:**
- FILT-01 — addressed by /watch/[id] route + iframe player.
- FILT-02 — addressed by rail in load + page.svelte.
- FILT-04 — addressed by the watch page's chip linking back to /work/<slug>, completing the round-trip.
- GRID-01/04/05 — addressed by VideoCard (Plan 03-01) rendered in the rail.

**Wave 2 disjointness check:**
- Plan 03-02 files_modified: `src/routes/work/{*.test.ts,+page.svelte,+page.ts}`, `src/routes/work/[category]/{*.test.ts,+page.svelte,+page.ts}`.
- Plan 03-03 files_modified: `src/routes/watch/[id]/{*.test.ts,+page.svelte,+page.ts}`, `src/routes/+error.svelte`.
- Intersection: ∅ (empty). Both plans can run in parallel.
</verification>

<success_criteria>
Plan 03-03 complete when:
- [ ] `src/routes/watch/[id]/+page.ts` exists with `entries()` (56 ids) + load returning `{video, rail}` (D-25 sorted, current excluded)
- [ ] `src/routes/watch/[id]/+page.svelte` exists with iframe (D-33), max-w-5xl player (D-34), D-35 metadata order, D-36/37/38 rail
- [ ] `src/routes/+error.svelte` exists with minimal "Not found" + link to /work
- [ ] All 9 watch route tests pass
- [ ] `pnpm test` exits 0
- [ ] `pnpm check` exits 0
- [ ] `pnpm build` exits 0
- [ ] 56 `build/watch/<id>/index.html` files exist
- [ ] After both Wave 2 plans land: `pnpm test:prerender` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/03-grid-filter-watch/03-03-SUMMARY.md` documenting:
- The build-time rail computation (D-37): `[...getByCategory(video.category)].filter(v => v.id !== video.id).toSorted(D-25)` — zero client JS, embedded in prerendered HTML
- The D-35 metadata order verbatim and which optional fields v1 skips (duration_seconds, credits, tags — D-35 step 6)
- Why the iframe uses no autoplay query param (Pitfall 5) — `allow="autoplay; ..."` permits user-gesture autoplay inside the iframe, but we never request it from the outside
- The empty-rail invariant (D-38) — defensive `{#if rail.length > 0}` even though v1's smallest category has 3 videos
- The interactive CategoryTag pattern on /watch metadata (`href` prop provided) vs non-interactive on cards (no `href` prop) — same component, two call sites (D-13 / D-35)
- The +error.svelte fallback chain: D-30 (unknown category slug) and D-32 (unknown video id) both hit this page; adapter-static emits build/404.html from it
- Prerender coverage: 56 ids via `videos.map(v => ({id: v.id}))`; pairs with Plan 03-02's 8 category slugs to satisfy `pnpm test:prerender`
</output>
</content>
