---
phase: 03-grid-filter-watch
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - package.json
  - vitest.workspace.ts
  - src/lib/components/VideoCard.test.ts
  - src/lib/components/CategoryTag.test.ts
  - src/lib/components/TopNav.test.ts
  - src/routes/work/+page.test.ts
  - src/routes/work/[category]/+page.test.ts
  - src/routes/watch/[id]/+page.test.ts
  - scripts/test-prerender-coverage.mjs
autonomous: true
requirements: []
must_haves:
  truths:
    - "jsdom is installed as a dev dependency, pinned exact (no caret/tilde)."
    - "`vitest.workspace.ts` exists at repo root and defines two projects: a node project for `src/lib/data/**` and a jsdom project for `src/lib/components/**` and `src/routes/**`."
    - "Seven test stub files exist (six `.test.ts` under components + routes, plus the existing data-layer tests still run under the node project)."
    - "Every component/route stub uses `describe.skip(...)` so `pnpm test` exits 0 in Wave 0."
    - "`scripts/test-prerender-coverage.mjs` exists, is dependency-free Node ESM, and counts prerendered HTML files in `build/work/*/index.html` (≥9) and `build/watch/*/index.html` (≥56)."
    - "`pnpm test:prerender` script is wired in package.json (but does NOT need to pass in Wave 0 — only after Plans 03-02 and 03-03 land)."
    - "`pnpm test` exits 0 (zero failures; all new component/route tests skipped; existing 32 data-layer tests still pass)."
    - "`pnpm check` exits 0 (no TS errors from the stub files or the workspace config)."
    - "`pnpm build` still exits 0 (Wave 0 does not add Vite plugin logic; build pipeline unchanged)."
  artifacts:
    - path: "vitest.workspace.ts"
      provides: "Two-project Vitest workspace — node env for data layer, jsdom env for components + routes"
      contains: "defineWorkspace"
    - path: "src/lib/components/VideoCard.test.ts"
      provides: "Stub tests for GRID-01, GRID-03, GRID-04 — describe.skip until Plan 03-01 fills them in"
    - path: "src/lib/components/CategoryTag.test.ts"
      provides: "Stub tests for GRID-05 — describe.skip until Plan 03-01"
    - path: "src/lib/components/TopNav.test.ts"
      provides: "Stub tests for NAV-01 (basic + active-state) — describe.skip until Plan 03-04"
    - path: "src/routes/work/+page.test.ts"
      provides: "Stub tests for /work load fn (D-25 sort) — describe.skip until Plan 03-02"
    - path: "src/routes/work/[category]/+page.test.ts"
      provides: "Stub tests for FILT-03 load + entries — describe.skip until Plan 03-02"
    - path: "src/routes/watch/[id]/+page.test.ts"
      provides: "Stub tests for FILT-01, FILT-02, entries — describe.skip until Plan 03-03"
    - path: "scripts/test-prerender-coverage.mjs"
      provides: "Build-artifact coverage check — fails if /work/* or /watch/* prerendered count is wrong"
    - path: "package.json"
      provides: "test:prerender script wiring scripts/test-prerender-coverage.mjs"
      contains: "\"test:prerender\":"
  key_links:
    - from: "vitest.workspace.ts"
      to: "vite.config.ts"
      via: "node project extends vite.config.ts (data-layer tests stay in node env)"
      pattern: "extends.*vite\\.config"
    - from: "src/lib/components/VideoCard.test.ts"
      to: "src/lib/components/VideoCard.svelte"
      via: "describe.skip block imports VideoCard component (created by Plan 03-01)"
      pattern: "VideoCard\\.svelte"
    - from: "src/lib/components/TopNav.test.ts"
      to: "$app/state"
      via: "stub uses vi.mock('$app/state') for the `page` rune-style state import"
      pattern: "vi\\.mock\\(['\"]\\$app/state"
    - from: "package.json"
      to: "scripts/test-prerender-coverage.mjs"
      via: "test:prerender script: node scripts/test-prerender-coverage.mjs"
      pattern: "test:prerender.*node scripts/test-prerender-coverage"
---

<objective>
Install `jsdom` (pinned exact), split Vitest into two projects via `vitest.workspace.ts` (node for data layer, jsdom for components + routes), scaffold six RED-by-design test stub files (`describe.skip`) that downstream plans 03-01..03-04 will fill in, and create `scripts/test-prerender-coverage.mjs` as the build-artifact coverage check for the phase.

Purpose: Without this plan, no downstream plan in Phase 3 has a runnable `<automated>` command. The Phase 2 Vitest config currently runs `environment: 'node'` (per `vite.config.ts`), which means any test that does `mount(VideoCard, …)` blows up with "document is not defined". This plan creates the jsdom-enabled workspace project and the empty test scaffolding without yet adding the implementation. RED-by-design: every new test stub is wrapped in `describe.skip(...)`; Plans 03-01..03-04 remove `.skip` as they land their implementations.

Output:
- `jsdom` in devDependencies (latest, pinned exact via `-E`)
- `vitest.workspace.ts` at repo root with two-project split (node for `src/lib/data/`, jsdom for `src/lib/components/` + `src/routes/`)
- 6 new test stub files in `src/lib/components/` and `src/routes/` (each starts in `describe.skip` state)
- `scripts/test-prerender-coverage.mjs` (NEW dependency-free Node ESM)
- `package.json` script: `"test:prerender": "node scripts/test-prerender-coverage.mjs"`
- `pnpm test` exits 0; `pnpm check` exits 0; `pnpm build` exits 0
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
@.planning/phases/02-data-layer/02-00-vitest-wave0-PLAN.md

<interfaces>
<!-- Existing toolchain on disk before this plan runs. Executor MUST preserve. -->

From package.json (current):
```json
"packageManager": "pnpm@11.0.9",
"engines": { "node": ">=22" },
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
  "test": "vitest run --passWithNoTests",
  "test:watch": "vitest",
  "test:data": "vitest run src/lib/data/",
  "test:build-fails": "node scripts/test-build-fails.mjs",
  "lint": "eslint .",
  "format": "prettier --write .",
  "prepare": "husky"
}
```
All deps pinned EXACT (no `^`, no `~`) — see `"svelte": "5.55.5"`, `"vite": "8.0.7"`, `"vitest": "4.1.5"`, `"zod": "4.4.3"`, etc.

From vite.config.ts (current — Plan 02-03 wired the validateVideosPlugin and the Vitest test block):
- Plugins: `tailwindcss(), validateVideosPlugin(), sveltekit()` (in that order).
- Vitest `test` block: `{ include: ['src/**/*.{test,spec}.{js,ts}'], environment: 'node', globals: false, coverage: {…} }`.
- The `test` block stays — `vitest.workspace.ts` will override `environment` per-project; data-layer tests inherit `node` from vite.config.ts as the workspace's `node` project extends it.

From src/lib/data/ (Phase 2):
- 4 existing test files: `schema.test.ts`, `categories.test.ts`, `videos.json.test.ts`, `videos.test.ts` — all run in node env (no DOM access).
- 32 passing tests total. Wave 0 of Phase 3 MUST NOT regress these — they stay in the node project.

From tsconfig.json (current):
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```
NEVER add `include` (Phase 1 RESEARCH Pitfall 3). The svelte-kit-generated config already includes everything under `src/`.

From `_prep/` and BASE_PATH carry-forward:
- `import { base } from '$app/paths'` is the canonical internal-link pattern. Stub tests that assert hrefs MUST account for `base` being possibly empty (use `\${base}/watch/${id}` or `endsWith('/watch/' + id)`).

Test data the stubs reference:
- Producer reel: `vimeo:264677021`, category `Reel`.
- A YouTube example (any 11-char id from `src/lib/data/videos.json`): use the first YouTube record by reading the data layer.
- Total videos: 56 (Phase 2 D-12 / DATA-01).
- Categories in display order (Phase 2 D-04): `['PBS American Portrait', 'Promos & Trailers', 'Branded Content', 'Documentary / Short Film', 'Reel', 'Educational / Nonprofit', 'Other', 'Personal / Tribute']`.

Svelte 5 testing primer (from research 03-RESEARCH.md Open Question 2):
- Use bare `mount()` from `svelte`, NOT `@testing-library/svelte` (research recommends bare).
- Each test imports `{ mount, unmount } from 'svelte'`.
- Mount target is `document.body` (provided by jsdom).
- Always `unmount` in `afterEach` to prevent leaked state between tests.
- For `$app/state` `page` mocking, use `vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/work/pbs-american-portrait') } }))` at the top of the file.

For load-fn tests, you call the exported `load` function directly with a mock event:
```ts
const { load } = await import('./+page');
const result = await load({ params: { id: '264677021' } } as Parameters<typeof load>[0]);
```
No DOM needed (load is pure data) — but we still put these under the jsdom project for consistency since they live under `src/routes/`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install jsdom pinned exact and create vitest.workspace.ts splitting node vs jsdom test environments</name>
  <files>package.json, vitest.workspace.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\package.json (current dep pinning convention — every dep is EXACT; Phase 1 STATE locked this; Phase 2 reinforced for vitest/zod)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\vite.config.ts (current Vitest `test` block must be preserved — workspace projects can `extends` it for the node project)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 154-188 Standard Stack, line 862 Wave 0 Gaps — confirms `jsdom@latest` pinned exact and the workspace split is option (b))
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-VALIDATION.md (lines 25-31 — Wave 0 infrastructure change description)
  </read_first>
  <action>
    Step 1 — Resolve the latest jsdom version, then install pinned exact:

    ```
    pnpm view jsdom version
    ```

    Capture the version printed (e.g., `25.0.1` as of research date; whatever the registry returns at execution time). Then:

    ```
    pnpm add -D -E jsdom@<version-printed-by-step-1>
    ```

    Verify `package.json` `devDependencies` contains the literal `"jsdom": "<version>"` with NO caret and NO tilde. If pnpm inserted `^`, hand-edit `package.json` to strip it, then run `pnpm install --frozen-lockfile=false` to regenerate the lockfile.

    Do NOT install `@testing-library/svelte` (research Open Question 2 recommends bare `mount()` for Svelte 5 — zero extra deps; svelte.dev/docs canonical pattern).
    Do NOT install `happy-dom` as an alternative — jsdom is what svelte.dev/docs uses in its component-test example.

    Step 2 — Create `vitest.workspace.ts` at the repo root with EXACTLY this content:

    ```ts
    /// <reference types="vitest/config" />
    import { defineWorkspace } from 'vitest/config';

    /**
     * Phase 3 Wave 0: split Vitest into two projects so component + route tests
     * (which need a DOM via jsdom) coexist with the Phase 2 data-layer tests
     * (which run faster in plain Node).
     *
     * Why a workspace (not a single global `environment: 'jsdom'` swap)?
     *   - Phase 2 ships 32 data-layer tests in plain Node — switching them to jsdom
     *     adds ~150ms of DOM bootstrap per test file for zero gain. Keep them in Node.
     *   - jsdom is only needed where `mount()` runs against `document.body`.
     *
     * Project layout:
     *   data — extends vite.config.ts (which has the validateVideosPlugin + the
     *          existing `test:` block with environment 'node'). Picks up
     *          src/lib/data/** test files only.
     *   ui   — fresh config with environment: 'jsdom'. Picks up
     *          src/lib/components/** and src/routes/** test files.
     *
     * Single command: `pnpm test` (which is `vitest run --passWithNoTests`)
     * runs BOTH projects. The existing `pnpm test:data` script narrowed to
     * `src/lib/data/` continues to work (path filter, no project filter).
     */
    export default defineWorkspace([
      {
        // Data-layer project — inherits vite.config.ts (node env).
        extends: './vite.config.ts',
        test: {
          name: 'data',
          include: ['src/lib/data/**/*.{test,spec}.{js,ts}'],
        },
      },
      {
        // Component + route project — fresh jsdom env.
        // Do NOT `extends: './vite.config.ts'` here: that would inherit
        // environment: 'node' and we'd have to override with environment: 'jsdom'
        // anyway, plus inheriting brings the data-layer coverage `include`
        // which would emit coverage warnings for components.
        extends: './vite.config.ts',
        test: {
          name: 'ui',
          include: [
            'src/lib/components/**/*.{test,spec}.{js,ts}',
            'src/routes/**/*.{test,spec}.{js,ts}',
          ],
          environment: 'jsdom',
          globals: false,
        },
      },
    ]);
    ```

    NOTES:
    - Both projects `extends: './vite.config.ts'` so the SvelteKit Vite plugins (`tailwindcss`, `validateVideosPlugin`, `sveltekit`) are loaded — required for `$lib/*` alias resolution and Svelte component imports.
    - The `ui` project overrides `environment: 'jsdom'`. The `data` project inherits `environment: 'node'` from `vite.config.ts`'s `test` block.
    - `include` narrows each project to its file scope so a single test file never runs in both environments.
    - `name` is purely cosmetic — surfaces in Vitest output as `[data]` / `[ui]` prefixes.

    Step 3 — Verify Vitest picks up the workspace file. Run:
    ```
    pnpm vitest run --passWithNoTests
    ```
    Expected: exit 0; output shows BOTH `data` and `ui` project headers. The `ui` project finds zero tests (none exist yet — they're scaffolded in Task 2); the `data` project runs the existing 32 passing tests.

    Step 4 — DO NOT touch `vite.config.ts` — the existing `test:` block stays as the inherited config for both projects. DO NOT remove the `test:` block from `vite.config.ts`; the workspace `extends` mechanism reads it.

    Step 5 — DO NOT modify `tsconfig.json` — `vitest.workspace.ts` at repo root is included automatically by the svelte-kit-generated tsconfig's `**/*.ts` glob.
  </action>
  <verify>
    <automated>pnpm vitest run --passWithNoTests</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` `devDependencies` contains a literal line matching the regex `"jsdom":\s*"\d+\.\d+\.\d+"` with NO caret and NO tilde (e.g., `"jsdom": "25.0.1"`).
    - `vitest.workspace.ts` exists at the repo root.
    - `vitest.workspace.ts` contains the literal string `defineWorkspace`.
    - `vitest.workspace.ts` contains the literal string `name: 'data'`.
    - `vitest.workspace.ts` contains the literal string `name: 'ui'`.
    - `vitest.workspace.ts` contains the literal string `environment: 'jsdom'`.
    - `vitest.workspace.ts` contains the literal string `'src/lib/components/**/*.{test,spec}.{js,ts}'`.
    - `vitest.workspace.ts` contains the literal string `'src/routes/**/*.{test,spec}.{js,ts}'`.
    - `vite.config.ts` is BYTE-IDENTICAL to its pre-task state (no edits — the workspace `extends` it).
    - `tsconfig.json` is BYTE-IDENTICAL to its pre-task state.
    - `pnpm vitest run --passWithNoTests` exits 0.
    - The 32 existing data-layer tests still pass: `pnpm vitest run src/lib/data/` exits 0.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    jsdom is installed pinned exact; `vitest.workspace.ts` defines two projects (data=node, ui=jsdom); `pnpm vitest run --passWithNoTests` exits 0; existing Phase 2 data-layer tests still pass.
  </done>
</task>

<task type="auto">
  <name>Task 2: Scaffold six test stub files in src/lib/components/ and src/routes/ (RED-by-design via describe.skip)</name>
  <files>src/lib/components/VideoCard.test.ts, src/lib/components/CategoryTag.test.ts, src/lib/components/TopNav.test.ts, src/routes/work/+page.test.ts, src/routes/work/[category]/+page.test.ts, src/routes/watch/[id]/+page.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-VALIDATION.md (lines 42-65 Per-Task Verification Map — every test name below must match a row verbatim so downstream `pnpm vitest run -t "<name>"` commands resolve)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-RESEARCH.md (lines 232-279 Pattern 1 VideoCard shape; lines 376-401 Pattern 4 CategoryTag shape; lines 569-639 Pattern 8 TopNav shape; lines 405-491 Pattern 5 /watch load fn; lines 499-525 Pattern 6 /work/[category] load fn; lines 552-565 Pattern 7 /work load fn)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-CONTEXT.md (D-13 single-link card, D-14 preload-hover, D-17 first-8-eager, D-25 sort, D-29/D-30 /work/[category] load contract, D-32 /watch load contract, D-37/D-38 rail contract, D-39/D-40/D-41/D-42 nav contract)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-00-vitest-wave0-PLAN.md (the analogous Wave 0 plan in Phase 2 — Task 2 there is the source-of-truth pattern for describe.skip stubs + // @ts-expect-error directives over imports that don't resolve yet)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\index.ts (the import surface every stub may consume — videos, getById, getByCategory, CATEGORIES, categoryToSlug, slugToCategory, producerReelId)
  </read_first>
  <action>
    Create SIX test files. Each uses `describe.skip(...)` (the entire block) so `pnpm test` exits 0 in Wave 0. Plans 03-01..03-04 remove `.skip` as they land their implementations.

    For files whose `.svelte` / `+page.ts` modules don't exist yet, every cross-module import sits behind a `// @ts-expect-error — module exists after Plan 03-NN` directive. After the downstream plan creates the module, that directive must be removed when `.skip` is removed (Phase 2's pattern — see `02-00-vitest-wave0-PLAN.md` Task 2).

    All component tests use bare `mount()` from `svelte` (per 03-RESEARCH.md Open Question 2). DO NOT import `@testing-library/svelte`.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    File 1 — `src/lib/components/VideoCard.test.ts`:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ```ts
    import { afterEach, describe, expect, it } from 'vitest';
    import { mount, unmount } from 'svelte';
    // @ts-expect-error — component exists after Plan 03-01
    import VideoCard from './VideoCard.svelte';
    import { getById, type Video } from '$lib/data';

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

    function reel(): Video {
      const v = getById('264677021');
      if (!v) throw new Error('test fixture missing: vimeo:264677021');
      return v;
    }

    describe.skip('VideoCard — GRID-01 (thumb + title + tag + uploader)', () => {
      it('renders thumb img with the video thumbnail URL', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        const img = host.querySelector('img');
        expect(img).not.toBeNull();
        expect(img?.getAttribute('src')).toBe(reel().thumbnail);
      });

      it('renders title as h3 with the video title', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        const h3 = host.querySelector('h3');
        expect(h3?.textContent?.trim()).toBe(reel().title);
      });

      it('renders uploader text', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        expect(host.textContent).toContain(reel().uploader);
      });

      it('renders category tag with the video category text', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        expect(host.textContent).toContain(reel().category);
      });

      it('alt attribute matches video.title (D-18)', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        const img = host.querySelector('img');
        expect(img?.getAttribute('alt')).toBe(reel().title);
      });
    });

    describe.skip('VideoCard — GRID-03 lazy loading (D-17)', () => {
      it('eager prop defaults to false → loading="lazy"', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        const img = host.querySelector('img');
        expect(img?.getAttribute('loading')).toBe('lazy');
      });

      it('eager={true} → loading="eager" (first 8 above the fold)', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel(), eager: true } });
        const img = host.querySelector('img');
        expect(img?.getAttribute('loading')).toBe('eager');
      });

      it('decoding="async" on every thumb (D-17)', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        expect(host.querySelector('img')?.getAttribute('decoding')).toBe('async');
      });

      it('thumb wrapper uses aspect-video class (D-10) and bg-neutral-900 (D-16)', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        const wrapper = host.querySelector('img')?.parentElement;
        expect(wrapper?.className).toMatch(/aspect-video/);
        expect(wrapper?.className).toMatch(/bg-neutral-900/);
      });

      it('img has transition-opacity class for D-16 fade-in', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        expect(host.querySelector('img')?.className).toMatch(/transition-opacity/);
      });
    });

    describe.skip('VideoCard — GRID-04 click target (D-13, D-14)', () => {
      it('whole card is a single <a> link', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        // The card itself wraps everything in an <a>.
        const links = host.querySelectorAll('a');
        expect(links.length).toBe(1);
      });

      it('href ends with /watch/<video.id> (BASE_PATH-safe)', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        const a = host.querySelector('a');
        expect(a?.getAttribute('href')).toMatch(/\/watch\/264677021$/);
      });

      it('has data-sveltekit-preload-data="hover" attribute (D-14)', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        const a = host.querySelector('a');
        expect(a?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
      });

      it('category chip on the card is NOT a nested <a> (D-13 — invalid HTML)', () => {
        component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
        // The chip should be a <span>, not an <a>. Total <a> count is 1 (the outer card).
        expect(host.querySelectorAll('a').length).toBe(1);
      });
    });
    ```

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    File 2 — `src/lib/components/CategoryTag.test.ts`:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ```ts
    import { afterEach, describe, expect, it } from 'vitest';
    import { mount, unmount } from 'svelte';
    // @ts-expect-error — component exists after Plan 03-01
    import CategoryTag from './CategoryTag.svelte';

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

    describe.skip('CategoryTag — GRID-05 per-category accent', () => {
      it('renders the category text', () => {
        component = mount(CategoryTag, {
          target: makeHost(),
          props: { category: 'PBS American Portrait' },
        });
        expect(host.textContent?.trim()).toBe('PBS American Portrait');
      });

      it('PBS gets the cat-pbs accent class (D-04 most-prominent)', () => {
        component = mount(CategoryTag, {
          target: makeHost(),
          props: { category: 'PBS American Portrait' },
        });
        const el = host.firstElementChild;
        expect(el?.className).toMatch(/text-cat-pbs/);
      });

      it('Reel gets the cat-reel accent class', () => {
        component = mount(CategoryTag, { target: makeHost(), props: { category: 'Reel' } });
        expect(host.firstElementChild?.className).toMatch(/text-cat-reel/);
      });

      it('renders as <span> when no href prop (D-13 — non-interactive on cards)', () => {
        component = mount(CategoryTag, { target: makeHost(), props: { category: 'Reel' } });
        expect(host.querySelector('a')).toBeNull();
        expect(host.querySelector('span')).not.toBeNull();
      });

      it('renders as <a> when href prop is provided (D-35 — interactive on /watch)', () => {
        component = mount(CategoryTag, {
          target: makeHost(),
          props: { category: 'Reel', href: '/work/reel' },
        });
        const a = host.querySelector('a');
        expect(a).not.toBeNull();
        expect(a?.getAttribute('href')).toBe('/work/reel');
      });

      it('uses text-xs uppercase tracking (D-12) typography classes', () => {
        component = mount(CategoryTag, { target: makeHost(), props: { category: 'Other' } });
        const el = host.firstElementChild;
        expect(el?.className).toMatch(/text-xs/);
        expect(el?.className).toMatch(/uppercase/);
        expect(el?.className).toMatch(/tracking-/);
      });
    });
    ```

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    File 3 — `src/lib/components/TopNav.test.ts`:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ```ts
    import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

    // Mock $app/state's `page` rune-style export BEFORE importing TopNav.
    // The mock is mutable per-test: tests overwrite `mockPage.url` to simulate route changes.
    const mockPage = { url: new URL('http://localhost/') };
    vi.mock('$app/state', () => ({ page: mockPage }));

    // Mock $app/paths so the test doesn't depend on BASE_PATH being set during vitest run.
    vi.mock('$app/paths', () => ({ base: '' }));

    import { mount, unmount } from 'svelte';
    // @ts-expect-error — component exists after Plan 03-04
    import TopNav from './TopNav.svelte';
    import { getCategoriesInDisplayOrder } from '$lib/data';

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;

    beforeEach(() => {
      mockPage.url = new URL('http://localhost/');
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

    describe.skip('TopNav — NAV-01 baseline rendering (D-39, D-40)', () => {
      it('renders the MICHELLE NGO wordmark linking to /', () => {
        component = mount(TopNav, { target: makeHost(), props: {} });
        // Wordmark is the first <a> inside <header>; href is base+'/' or just '/'.
        const wordmark = host.querySelector('header a');
        expect(wordmark?.textContent?.toLowerCase()).toContain('michelle ngo');
      });

      it('renders all 8 category links in getCategoriesInDisplayOrder() order', () => {
        component = mount(TopNav, { target: makeHost(), props: {} });
        const order = getCategoriesInDisplayOrder();
        const linkTexts = Array.from(host.querySelectorAll('a'))
          .map((a) => a.textContent?.trim() ?? '')
          .filter((t) => order.includes(t as (typeof order)[number]));
        expect(linkTexts).toEqual(order);
      });

      it('renders About / Press / Contact secondary links', () => {
        component = mount(TopNav, { target: makeHost(), props: {} });
        const texts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
        expect(texts).toContain('About');
        expect(texts).toContain('Press');
        expect(texts).toContain('Contact');
      });

      it('category links use /work/<slug> hrefs', () => {
        component = mount(TopNav, { target: makeHost(), props: {} });
        const pbsLink = Array.from(host.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'PBS American Portrait',
        );
        expect(pbsLink?.getAttribute('href')).toBe('/work/pbs-american-portrait');
      });
    });

    describe.skip('TopNav — active state (D-41)', () => {
      it('on /work/pbs-american-portrait, PBS link gets cat-pbs accent class', () => {
        mockPage.url = new URL('http://localhost/work/pbs-american-portrait');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const pbsLink = Array.from(host.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'PBS American Portrait',
        );
        expect(pbsLink?.className).toMatch(/text-cat-pbs/);
      });

      it('on /work (no filter), no category link is highlighted', () => {
        mockPage.url = new URL('http://localhost/work');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const order = getCategoriesInDisplayOrder();
        const highlighted = Array.from(host.querySelectorAll('a')).filter((a) =>
          order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]),
        ).filter((a) => /text-cat-/.test(a.className));
        expect(highlighted.length).toBe(0);
      });

      it('on /watch/<id>, no category link is highlighted (D-41)', () => {
        mockPage.url = new URL('http://localhost/watch/264677021');
        component = mount(TopNav, { target: makeHost(), props: {} });
        const order = getCategoriesInDisplayOrder();
        const highlighted = Array.from(host.querySelectorAll('a')).filter((a) =>
          order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]),
        ).filter((a) => /text-cat-/.test(a.className));
        expect(highlighted.length).toBe(0);
      });
    });
    ```

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    File 4 — `src/routes/work/+page.test.ts`:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ```ts
    import { describe, expect, it } from 'vitest';
    // @ts-expect-error — module exists after Plan 03-02
    import { load } from './+page';

    describe.skip('/work +page.ts load — GRID-02 + D-24 + D-25', () => {
      it('returns all 56 videos (D-24: no implicit category filter)', async () => {
        const result = await load({} as Parameters<typeof load>[0]);
        expect(result.videos.length).toBe(56);
      });

      it('sort order: featured first, then published date descending (D-25)', async () => {
        const result = await load({} as Parameters<typeof load>[0]);
        const sorted = result.videos;
        // Featured-first: every featured video appears before every non-featured.
        const firstNonFeatured = sorted.findIndex((v) => !v.featured);
        if (firstNonFeatured >= 0) {
          for (let i = firstNonFeatured; i < sorted.length; i++) {
            expect(sorted[i]?.featured).toBe(false);
          }
        }
        // Within non-featured: published date descending.
        const nonFeatured = sorted.filter((v) => !v.featured);
        for (let i = 1; i < nonFeatured.length; i++) {
          const prev = nonFeatured[i - 1]!.published;
          const curr = nonFeatured[i]!.published;
          expect(prev.localeCompare(curr)).toBeGreaterThanOrEqual(0);
        }
      });

      it('result.videos is a NEW array (does NOT mutate the shared videos export)', async () => {
        const result = await load({} as Parameters<typeof load>[0]);
        // Different reference from the live `$lib/data` videos array.
        const live = (await import('$lib/data')).videos;
        expect(result.videos).not.toBe(live);
      });
    });
    ```

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    File 5 — `src/routes/work/[category]/+page.test.ts`:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ```ts
    import { describe, expect, it } from 'vitest';
    // @ts-expect-error — module exists after Plan 03-02
    import { load, entries } from './+page';

    describe.skip('/work/[category] +page.ts load — FILT-03 (D-29, D-30)', () => {
      it('valid slug returns the matching category and its videos', async () => {
        const result = await load({
          params: { category: 'pbs-american-portrait' },
        } as Parameters<typeof load>[0]);
        expect(result.category).toBe('PBS American Portrait');
        expect(result.videos.length).toBe(18);
      });

      it('all returned videos have category === result.category', async () => {
        const result = await load({
          params: { category: 'reel' },
        } as Parameters<typeof load>[0]);
        expect(result.category).toBe('Reel');
        for (const v of result.videos) {
          expect(v.category).toBe('Reel');
        }
      });

      it('unknown slug throws 404 (D-30)', async () => {
        await expect(
          load({ params: { category: 'does-not-exist' } } as Parameters<typeof load>[0]),
        ).rejects.toMatchObject({ status: 404 });
      });

      it('videos sorted featured-first then published date desc (D-25)', async () => {
        const result = await load({
          params: { category: 'pbs-american-portrait' },
        } as Parameters<typeof load>[0]);
        const nonFeatured = result.videos.filter((v) => !v.featured);
        for (let i = 1; i < nonFeatured.length; i++) {
          expect(nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)).toBeGreaterThanOrEqual(0);
        }
      });
    });

    describe.skip('/work/[category] +page.ts entries — FILT-03 prerender enumeration', () => {
      it('returns exactly 8 entries (one per category)', () => {
        const result = entries();
        expect(Array.isArray(result)).toBe(true);
        expect((result as Array<{ category: string }>).length).toBe(8);
      });

      it('each entry has a non-empty category slug', () => {
        const list = entries() as Array<{ category: string }>;
        for (const e of list) {
          expect(typeof e.category).toBe('string');
          expect(e.category.length).toBeGreaterThan(0);
          expect(e.category).toMatch(/^[a-z0-9-]+$/);
        }
      });

      it('entries include "pbs-american-portrait" and "reel"', () => {
        const slugs = (entries() as Array<{ category: string }>).map((e) => e.category);
        expect(slugs).toContain('pbs-american-portrait');
        expect(slugs).toContain('reel');
      });
    });
    ```

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    File 6 — `src/routes/watch/[id]/+page.test.ts`:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ```ts
    import { describe, expect, it } from 'vitest';
    // @ts-expect-error — module exists after Plan 03-03
    import { load, entries } from './+page';
    import { videos, producerReelId } from '$lib/data';

    describe.skip('/watch/[id] +page.ts load — FILT-01 (D-31, D-32, D-33)', () => {
      it('valid id returns the matching video', async () => {
        const result = await load({
          params: { id: producerReelId },
        } as Parameters<typeof load>[0]);
        expect(result.video.id).toBe(producerReelId);
        expect(result.video.category).toBe('Reel');
      });

      it('unknown id throws 404 (D-32)', async () => {
        await expect(
          load({ params: { id: 'does-not-exist-xyz' } } as Parameters<typeof load>[0]),
        ).rejects.toMatchObject({ status: 404 });
      });
    });

    describe.skip('/watch/[id] +page.ts load — FILT-02 rail (D-36, D-37, D-38)', () => {
      it('rail contains other videos in the same category', async () => {
        const result = await load({
          params: { id: producerReelId },
        } as Parameters<typeof load>[0]);
        for (const v of result.rail) {
          expect(v.category).toBe('Reel');
          expect(v.id).not.toBe(producerReelId);
        }
      });

      it('rail excludes the current video (D-37)', async () => {
        const result = await load({
          params: { id: producerReelId },
        } as Parameters<typeof load>[0]);
        const ids = result.rail.map((v: { id: string }) => v.id);
        expect(ids).not.toContain(producerReelId);
      });

      it('rail count = same-category count - 1 (Reel has 4; rail = 3)', async () => {
        const result = await load({
          params: { id: producerReelId },
        } as Parameters<typeof load>[0]);
        expect(result.rail.length).toBe(3);
      });

      it('rail is sorted featured-first then published date desc (D-25)', async () => {
        // Pick a PBS video (18 in that category — plenty of sortable rail items).
        const pbs = videos.find((v) => v.category === 'PBS American Portrait');
        if (!pbs) throw new Error('test fixture missing: any PBS video');
        const result = await load({
          params: { id: pbs.id },
        } as Parameters<typeof load>[0]);
        const nonFeatured = result.rail.filter((v: { featured: boolean }) => !v.featured);
        for (let i = 1; i < nonFeatured.length; i++) {
          expect(
            nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published),
          ).toBeGreaterThanOrEqual(0);
        }
      });
    });

    describe.skip('/watch/[id] +page.ts entries — FILT-01 prerender enumeration', () => {
      it('returns one entry per video — count matches videos.length (56)', () => {
        const list = entries() as Array<{ id: string }>;
        expect(list.length).toBe(56);
      });

      it('every entry has a non-empty id', () => {
        const list = entries() as Array<{ id: string }>;
        for (const e of list) {
          expect(typeof e.id).toBe('string');
          expect(e.id.length).toBeGreaterThan(0);
        }
      });

      it('entries include the producer reel id (vimeo:264677021)', () => {
        const ids = (entries() as Array<{ id: string }>).map((e) => e.id);
        expect(ids).toContain('264677021');
      });
    });
    ```

    NOTES on the `.skip` strategy:
    - Every `describe.skip(...)` keeps the suite GREEN in Wave 0.
    - Plan 03-01 removes `.skip` from `VideoCard.test.ts` (3 blocks) and `CategoryTag.test.ts` (1 block) after creating the components.
    - Plan 03-02 removes `.skip` from `src/routes/work/+page.test.ts` (1 block) and `src/routes/work/[category]/+page.test.ts` (2 blocks) after creating the routes.
    - Plan 03-03 removes `.skip` from `src/routes/watch/[id]/+page.test.ts` (3 blocks) after creating the route.
    - Plan 03-04 removes `.skip` from `TopNav.test.ts` (2 blocks) after creating the component.
    - Each downstream plan also removes the `// @ts-expect-error` directives over imports once the target modules exist.

    Do NOT add any other test files. Do NOT remove any `.skip` in this task — Wave 0 is RED-by-design.
  </action>
  <verify>
    <automated>pnpm test</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/VideoCard.test.ts` exists.
    - File `src/lib/components/CategoryTag.test.ts` exists.
    - File `src/lib/components/TopNav.test.ts` exists.
    - File `src/routes/work/+page.test.ts` exists.
    - File `src/routes/work/[category]/+page.test.ts` exists.
    - File `src/routes/watch/[id]/+page.test.ts` exists.
    - `grep -c "describe.skip" src/lib/components/VideoCard.test.ts` returns 3.
    - `grep -c "describe.skip" src/lib/components/CategoryTag.test.ts` returns 1.
    - `grep -c "describe.skip" src/lib/components/TopNav.test.ts` returns 2.
    - `grep -c "describe.skip" src/routes/work/+page.test.ts` returns 1.
    - `grep -c "describe.skip" src/routes/work/[category]/+page.test.ts` returns 2.
    - `grep -c "describe.skip" src/routes/watch/[id]/+page.test.ts` returns 3.
    - Every component test file contains `import { mount, unmount } from 'svelte';` (NOT `@testing-library/svelte`).
    - `src/lib/components/TopNav.test.ts` contains the literal `vi.mock('$app/state'` and the literal `vi.mock('$app/paths'`.
    - The literal test name `'lazy loading'` appears in a `describe.skip` line inside `VideoCard.test.ts` (matches the 03-VALIDATION.md row `pnpm vitest run … -t "lazy loading"`).
    - The literal test name `'click target'` appears in a `describe.skip` line inside `VideoCard.test.ts` (matches 03-VALIDATION.md).
    - The literal test name `'entries'` appears in a `describe.skip` line inside `src/routes/work/[category]/+page.test.ts` and `src/routes/watch/[id]/+page.test.ts`.
    - The literal test name `'rail'` appears in a `describe.skip` line inside `src/routes/watch/[id]/+page.test.ts`.
    - The literal test name `'active'` appears in a `describe.skip` line inside `src/lib/components/TopNav.test.ts`.
    - `pnpm test` exits 0 (zero failures — all new tests skipped, existing 32 data-layer tests still pass).
    - `pnpm check` exits 0 (the `@ts-expect-error` directives cover every "module exists after Plan 03-NN" import).
  </acceptance_criteria>
  <done>
    Six test stub files exist; each is RED-by-design (describe.skip); literal test names match 03-VALIDATION.md Per-Task Verification Map rows; `pnpm test` exits 0; `pnpm check` exits 0.
  </done>
</task>

<task type="auto">
  <name>Task 3: Create scripts/test-prerender-coverage.mjs and wire pnpm test:prerender</name>
  <files>scripts/test-prerender-coverage.mjs, package.json</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\03-grid-filter-watch\03-VALIDATION.md (lines 67-77 Wave 0 Requirements — this script counts build/work/*/index.html (≥9) and build/watch/*/index.html (≥56))
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\scripts\test-build-fails.mjs (existing Phase 2 script — same dependency-free Node ESM style; use the same shebang + path conventions)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\svelte.config.js (adapter-static `pages: 'build', assets: 'build'` — confirms output dir is `build/`)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\package.json (scripts block — append `"test:prerender"` after `"test:build-fails"`)
  </read_first>
  <action>
    Step 1 — Create `scripts/test-prerender-coverage.mjs` with EXACTLY this content:

    ```js
    #!/usr/bin/env node
    /**
     * Phase 3 — Build-artifact coverage check.
     *
     * Proves: after `pnpm build`, the static output contains the expected number of
     * prerendered HTML files:
     *   - build/work/index.html                  (1 file — the unfiltered /work route)
     *   - build/work/<slug>/index.html           (8 files — one per category)
     *   - build/watch/<id>/index.html            (56 files — one per video)
     *
     * Why this is necessary in addition to `adapter-static strict: true`:
     *   - `strict: true` fails the build if a route imported by another route is NOT
     *     prerenderable. But if `entries()` returns ZERO entries for /watch/[id],
     *     the build succeeds with zero /watch HTML files — `strict` doesn't catch
     *     an empty enumeration. This script does.
     *
     * Usage:
     *   pnpm build && node scripts/test-prerender-coverage.mjs
     * OR:
     *   pnpm test:prerender (after running `pnpm build` separately)
     *
     * Exit codes:
     *   0 — all counts meet or exceed the threshold.
     *   1 — at least one count is below threshold (prerender broken).
     *   2 — `build/` directory doesn't exist (run `pnpm build` first).
     */
    import { existsSync, readdirSync, statSync } from 'node:fs';
    import { resolve, dirname, join } from 'node:path';
    import { fileURLToPath } from 'node:url';

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const REPO_ROOT = resolve(__dirname, '..');
    const BUILD = resolve(REPO_ROOT, 'build');

    if (!existsSync(BUILD)) {
      console.error(`[test-prerender-coverage] FATAL: ${BUILD} does not exist. Run 'pnpm build' first.`);
      process.exit(2);
    }

    /**
     * Count subdirectories inside a directory that themselves contain an index.html
     * file (the canonical adapter-static prerender shape).
     */
    function countPrerendered(parentDir) {
      if (!existsSync(parentDir)) return 0;
      const entries = readdirSync(parentDir, { withFileTypes: true });
      let count = 0;
      for (const e of entries) {
        if (!e.isDirectory()) continue;
        const indexHtml = join(parentDir, e.name, 'index.html');
        if (existsSync(indexHtml) && statSync(indexHtml).isFile()) count++;
      }
      return count;
    }

    // /work itself (the unfiltered grid) lives at build/work/index.html.
    const workIndex = join(BUILD, 'work', 'index.html');
    const workIndexExists = existsSync(workIndex);

    // /work/[category]: 8 subdirs each with an index.html.
    const workCategoryDirs = countPrerendered(join(BUILD, 'work'));

    // /watch/[id]: 56 subdirs each with an index.html.
    const watchIdDirs = countPrerendered(join(BUILD, 'watch'));

    const expectedCategorySlugs = 8;
    const expectedVideoIds = 56;

    const failures = [];

    if (!workIndexExists) {
      failures.push('Missing build/work/index.html (the unfiltered /work route).');
    }
    if (workCategoryDirs < expectedCategorySlugs) {
      failures.push(
        `Expected ≥${expectedCategorySlugs} build/work/<slug>/index.html files; found ${workCategoryDirs}.`,
      );
    }
    if (watchIdDirs < expectedVideoIds) {
      failures.push(
        `Expected ≥${expectedVideoIds} build/watch/<id>/index.html files; found ${watchIdDirs}.`,
      );
    }

    if (failures.length > 0) {
      console.error('[test-prerender-coverage] FAIL:');
      for (const f of failures) console.error('  - ' + f);
      console.error(
        `Found: build/work/index.html=${workIndexExists}, build/work/<slug>/index.html count=${workCategoryDirs}, build/watch/<id>/index.html count=${watchIdDirs}.`,
      );
      process.exit(1);
    }

    console.log('[test-prerender-coverage] PASS:');
    console.log(`  - build/work/index.html: present`);
    console.log(`  - build/work/<slug>/index.html: ${workCategoryDirs} files (expected ≥${expectedCategorySlugs})`);
    console.log(`  - build/watch/<id>/index.html: ${watchIdDirs} files (expected ≥${expectedVideoIds})`);
    process.exit(0);
    ```

    DO NOT make this script executable via `chmod +x` (Windows repo; shebang informational only).
    DO NOT use any external dep (no `glob`, no `fast-glob` — pure `node:fs`).

    Step 2 — Add the `test:prerender` script to `package.json` `scripts` block. Insert it immediately after the existing `"test:build-fails"` line:

    ```json
    "test:prerender": "node scripts/test-prerender-coverage.mjs",
    ```

    Do NOT touch any other script. Order in the `scripts` object after this insertion:
    `dev`, `build`, `preview`, `check`, `check:watch`, `test`, `test:watch`, `test:data`, `test:build-fails`, `test:prerender`, `lint`, `format`, `prepare`.

    Step 3 — In Wave 0 the script will FAIL the coverage check because `/work/[category]/` and `/watch/[id]/` don't exist as routes yet. That's expected. Verify the script EXISTS and is invocable without crashing:

    ```
    node scripts/test-prerender-coverage.mjs
    ```

    Expected: exits with code `2` if `build/` doesn't exist yet, OR exits with code `1` with the FAIL listing (depending on whether a stale `build/` from Phase 2 is on disk). Both are acceptable — the script existing and being syntactically valid is what Wave 0 needs. Plans 03-02 and 03-03 own its first successful (exit 0) run.

    Do NOT add a Phase 3 build step to this plan. `pnpm build` still works in Wave 0 (the routes don't exist yet, so the build just doesn't emit /work or /watch HTML — but it doesn't fail either).
  </action>
  <verify>
    <automated>node -e "import('node:fs').then(fs=>process.exit(fs.existsSync('scripts/test-prerender-coverage.mjs') ? 0 : 1))"</automated>
  </verify>
  <acceptance_criteria>
    - File `scripts/test-prerender-coverage.mjs` exists.
    - File contains the literal string `import { existsSync, readdirSync, statSync } from 'node:fs';`.
    - File contains the literal string `const expectedCategorySlugs = 8;`.
    - File contains the literal string `const expectedVideoIds = 56;`.
    - File contains the literal string `process.exit(0)`.
    - File contains the literal string `process.exit(1)`.
    - File contains the literal string `process.exit(2)`.
    - File DOES NOT have any import other than `node:fs`, `node:path`, `node:url` (no external deps).
    - `package.json` `scripts` contains the literal line `"test:prerender": "node scripts/test-prerender-coverage.mjs"`.
    - `package.json` `scripts.test:prerender` value is the literal `"node scripts/test-prerender-coverage.mjs"` (matching the line above).
    - `node scripts/test-prerender-coverage.mjs` exits 1 or 2 (NOT 0 — Wave 0 hasn't built the dynamic routes yet) AND does NOT crash with a SyntaxError/ReferenceError.
    - `pnpm check` exits 0.
    - `pnpm build` still exits 0.
    - `pnpm test` still exits 0.
  </acceptance_criteria>
  <done>
    `scripts/test-prerender-coverage.mjs` exists, is dependency-free Node ESM, exits 0 only when ≥1 `/work/index.html`, ≥8 `/work/<slug>/index.html`, and ≥56 `/watch/<id>/index.html` files exist after a build. `pnpm test:prerender` is wired in package.json. Plans 03-02 and 03-03 own the first GREEN run.
  </done>
</task>

</tasks>

<verification>
**After all 3 tasks complete:**

1. `pnpm view jsdom version` matches the version in `package.json` `devDependencies.jsdom` (pinned exact).
2. `vitest.workspace.ts` exists at the repo root with `name: 'data'` and `name: 'ui'` projects.
3. `pnpm test` exits 0 — the `[data]` project runs 32 passing tests; the `[ui]` project runs 0 (all new stubs in describe.skip).
4. `pnpm check` exits 0.
5. `pnpm build` exits 0 (Wave 0 doesn't add Phase 3 routes; build pipeline unchanged from Phase 2 end state).
6. `pnpm vitest run src/lib/data/` still exits 0 with 32 passing (no regression).
7. The 6 new test files exist with the exact `describe.skip` counts: VideoCard=3, CategoryTag=1, TopNav=2, work=1, work/[category]=2, watch/[id]=3.
8. `scripts/test-prerender-coverage.mjs` exists. `pnpm test:prerender` is wired. Running it in Wave 0 exits non-zero (FAIL or no-build) — that's expected.
9. `vite.config.ts` BYTE-IDENTICAL to its pre-Phase-3 state.
10. `tsconfig.json` BYTE-IDENTICAL to its pre-Phase-3 state.
11. `src/lib/index.ts` BYTE-IDENTICAL to its pre-Phase-3 state.

**Goal-backward check:**
- Truth: "Test infrastructure exists for components + routes" → `vitest.workspace.ts` defines `ui` project with `environment: 'jsdom'` ✓
- Truth: "jsdom is installed pinned exact" → `package.json` `devDependencies.jsdom` matches `\d+\.\d+\.\d+` (no caret/tilde) ✓
- Truth: "Test stubs exist with names matching 03-VALIDATION.md" → 6 files with `describe.skip` blocks; literal test names match the Per-Task Verification Map ✓
- Truth: "Prerender coverage script exists and is wired" → `scripts/test-prerender-coverage.mjs` exists; `pnpm test:prerender` script in package.json ✓
- Truth: "All Wave 0 tests are RED-by-design" → every new test is in `describe.skip`; `pnpm test` exits 0 with 0 failures ✓
</verification>

<success_criteria>
Wave 0 complete when:
- [ ] `jsdom` installed pinned exact in `devDependencies`
- [ ] `vitest.workspace.ts` exists at repo root with two projects (data=node, ui=jsdom)
- [ ] Six test stub files exist with the exact `describe.skip` test names referenced in `03-VALIDATION.md`
- [ ] `scripts/test-prerender-coverage.mjs` exists, dependency-free, with the 1/8/56 thresholds
- [ ] `package.json` exposes `pnpm test:prerender`
- [ ] `pnpm test` exits 0 (no regression; new tests skipped)
- [ ] `pnpm check` exits 0
- [ ] `pnpm build` exits 0
- [ ] `vite.config.ts`, `tsconfig.json`, `src/lib/index.ts` all byte-identical to their pre-Phase-3 state
- [ ] 03-VALIDATION.md Wave 0 Requirements section can be checked off (planner updates `nyquist_compliant: true` after this plan + 03-01..03-04 all land)
</success_criteria>

<output>
After completion, create `.planning/phases/03-grid-filter-watch/03-00-SUMMARY.md` documenting:
- jsdom version installed and pinning convention preserved
- Why we chose the workspace split (option b) over a global jsdom swap (option a) — data-layer tests stay in fast node env
- The 6 test stub files created and the literal test names they expose to downstream plans (cross-reference 03-VALIDATION.md rows)
- The describe.skip → describe rename pattern (and `@ts-expect-error` removal) downstream plans must follow
- The `scripts/test-prerender-coverage.mjs` thresholds (1 /work index, 8 categories, 56 video ids) and why this complements `adapter-static strict: true`
</output>
</content>
