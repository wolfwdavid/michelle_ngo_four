---
phase: 03-grid-filter-watch
plan: 01
subsystem: ui
tags: [svelte5, tailwind-v4, oklch, category-accent, video-card, blur-up, vitest-projects]
one_liner: "Wave 1 leaf components — categoryAccent helper + 8 OKLCH @theme variables, CategoryTag (span/a switch on optional href), VideoCard (single-link, aspect-video, blur-up via opacity-0->100 onload); 20 component tests green."
dependency_graph:
  requires:
    - "$lib/data (Phase 2): Video, Category, getById('264677021') as the producer-reel test fixture"
    - "$app/paths (Phase 1): base for BASE_PATH-safe internal hrefs"
    - "vitest workspace stubs (Plan 03-00): VideoCard.test.ts, CategoryTag.test.ts (describe.skip + lazy-await-import scaffolding)"
  provides:
    - "src/lib/components/categoryAccent.ts — categoryAccent(c): text-cat-* literal class string (static Record<Category, string> so Tailwind v4 scanner sees every literal)"
    - "src/lib/components/CategoryTag.svelte — { category; href? } props; <span> by default (D-13), <a> when href is provided (D-35)"
    - "src/lib/components/VideoCard.svelte — { video; eager? = false } props; single-<a> click target; aspect-video bg-neutral-900 blur-up wrapper; CategoryTag chip + h3 + uploader meta"
    - "src/app.css — Tailwind v4 @theme block with 8 --color-cat-* OKLCH variables (PBS L=0.72 C=0.21, Other L=0.78 C=0.05, rest ~L=0.78 C=0.18)"
    - "Vitest workspace migration: test.projects inside vite.config.ts (Vitest 4 contract; vitest.workspace.ts deleted)"
  affects:
    - "Plan 03-02 (/work, /work/[category]): imports VideoCard for grid rendering; eager={i < 8} pattern on first row"
    - "Plan 03-03 (/watch/[id]): imports VideoCard for the rail; imports CategoryTag with href prop for the metadata block"
    - "Plan 03-04 (TopNav): imports categoryAccent for active-state highlighting per D-41"
    - "All downstream 03-NN test stubs: must use runtime-computed dynamic import specifiers (const spec = './' + '+page') OR drop the indirection entirely when they unskip"
tech-stack:
  added:
    - "Tailwind v4 @theme block with 8 --color-cat-* OKLCH variables in src/app.css"
  patterns:
    - "Static Record<Category, string> map for category-to-color binding: avoids Tailwind v4 Pitfall 7 (scanner reads file as text; literal class strings must be present verbatim)"
    - "Single-element-or-link switch in Svelte 5: `{#if href}<a>{:else}<span>{/if}` so one component handles both interactive (/watch metadata) and non-interactive (inside cards) call sites without nested-<a> markup"
    - "Blur-up via solid-color fade-in (D-16): aspect-video bg-neutral-900 wrapper reserves space; img opacity-0 + transition-opacity + class:opacity-100={loaded} + onload handler flips state — zero layout shift, no client-side decoding cost"
    - "Vitest 4 test.projects inline split (data=node, ui=jsdom) inside vite.config.ts; replaces deprecated vitest.workspace.ts. ui project sets resolve.conditions: ['browser'] so 'svelte' resolves to client mount() (not the SSR entry)."
    - "Runtime-computed dynamic-import specifier (`const spec = './' + '+page'`) defeats Vite's vite:import-analysis for stubs that still target not-yet-existing modules. /* @vite-ignore */ alone is insufficient for literal-string dynamic imports."
key-files:
  created:
    - src/app.css (modified — added @theme block with 8 --color-cat-* variables)
    - src/lib/components/categoryAccent.ts
    - src/lib/components/CategoryTag.svelte
    - src/lib/components/VideoCard.svelte
  modified:
    - vite.config.ts (added test.projects with data+ui split; coverage stays at root)
    - src/lib/components/CategoryTag.test.ts (dropped describe.skip + lazy-import; static top-level import)
    - src/lib/components/VideoCard.test.ts (dropped 3 describe.skip + lazy-import; static top-level import)
    - src/lib/components/TopNav.test.ts (runtime-spec dynamic import to defeat vite:import-analysis)
    - src/routes/work/page.test.ts (runtime-spec dynamic import)
    - src/routes/work/[category]/page.test.ts (runtime-spec dynamic import)
    - src/routes/watch/[id]/page.test.ts (runtime-spec dynamic import)
  deleted:
    - vitest.workspace.ts (Vitest 4 deprecates standalone workspace file; config migrated into vite.config.ts test.projects)
decisions:
  - "OKLCH color hierarchy: PBS at L=0.72 C=0.21 (warmest red-orange, flagship prominence per D-04); 6 mid-tier categories at L=0.78 C=0.18 (varied hue); Other at L=0.78 C=0.05 (intentionally desaturated — semantically 'uncategorized'). All clear AA contrast (~4.7-5.6:1) on bg-neutral-950."
  - "Static Record<Category, string> in categoryAccent.ts instead of computed `text-cat-${slug}`: Tailwind v4 scanner reads source files as text. A computed class wouldn't appear literally and wouldn't be generated. The static map has every text-cat-* string verbatim."
  - "CategoryTag forwards the caller's href verbatim (no resolve() wrapping). File-level eslint-disable svelte/no-navigation-without-resolve: CategoryTag is a leaf; the CALLER produces a base-path-safe href (VideoCard builds `${base}/watch/${id}`; /watch/[id] metadata builds `${base}/work/${slug}`). Wrapping in resolve() here would block the literal-href test pattern that GRID-05 relies on."
  - "Vitest 4 workspace migration (Rule 3 deviation): Vitest 4.1.5 silently ignores vitest.workspace.ts (verified via `vitest list --project=ui` returning 'No projects matched'). Plan 03-00's 'pnpm test green' was a false positive — workspace didn't load, so the ui project's jsdom environment never engaged; the 6 ui stubs ran (or rather, were skipped) under the default vite.config.ts node env. Migrated to inline test.projects + added resolve.conditions: ['browser'] for the ui project so mount() doesn't crash with lifecycle_function_unavailable from the SSR entry."
  - "Runtime-computed specifiers for still-stubbed dynamic imports (`const spec = './' + '+page'`): /* @vite-ignore */ alone doesn't suppress vite:import-analysis on literal-string dynamic imports — it only suppresses the warning about non-literal specifiers. The runtime concat IS a non-literal specifier from Vite's perspective, so analysis skips resolution. Downstream plans (03-02..03-04) drop this hack along with the whole loadXxx() helper when they replace it with a top-level static import."
  - "Direct top-level static imports in CategoryTag.test.ts and VideoCard.test.ts (this plan's tests): per the upstream 03-00 SUMMARY downstream contract, when a plan lands the target module it removes BOTH .skip AND the lazy-await-import indirection. Done here for both files."
metrics:
  duration_minutes: 18
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 8
  commits:
    - "f5c428d feat(03-01): add 8 category accent colors and categoryAccent helper"
    - "6418334 fix(03-01): migrate Vitest workspace to test.projects (Vitest 4 contract)"
    - "ff4abe5 feat(03-01): add CategoryTag.svelte + unskip GRID-05 tests"
    - "3c6ce07 feat(03-01): add VideoCard.svelte + unskip GRID-01/03/04 tests"
  completed_at: "2026-05-10"
requirements-completed: [GRID-01, GRID-03, GRID-04, GRID-05]
---

# Phase 3 Plan 01: VideoCard & CategoryTag Summary

## One-liner

Wave 1 leaf components — `categoryAccent` helper + 8 OKLCH `@theme` variables, `CategoryTag` (span/a switch on optional href), `VideoCard` (single-link, aspect-video, blur-up via opacity-0->100 onload); 20 component tests green.

## Performance

- **Duration:** ~18 minutes
- **Tasks:** 3 of 3
- **Files created:** 3 (`categoryAccent.ts`, `CategoryTag.svelte`, `VideoCard.svelte`)
- **Files modified:** 8 (`app.css`, `vite.config.ts`, 5 test files, deleted `vitest.workspace.ts`)
- **Commits:** 4 task-level commits

## What Shipped

### 8 OKLCH category accent colors (D-04)

`src/app.css` declares a Tailwind v4 `@theme` block with 8 `--color-cat-*` variables. Tailwind auto-generates `text-cat-{name}`, `bg-cat-{name}`, `ring-cat-{name}`, etc. utilities from each variable.

| Category                  | CSS variable          | OKLCH                    | Rationale                                  |
| ------------------------- | --------------------- | ------------------------ | ------------------------------------------ |
| PBS American Portrait     | `--color-cat-pbs`     | `oklch(0.72 0.21 25)`    | Most prominent flagship (D-04); red-orange |
| Promos & Trailers         | `--color-cat-promos`  | `oklch(0.78 0.18 60)`    | Saturated amber/orange                     |
| Branded Content           | `--color-cat-branded` | `oklch(0.72 0.18 180)`   | Saturated teal/cyan                        |
| Documentary / Short Film  | `--color-cat-docshort`| `oklch(0.78 0.18 130)`   | Saturated lime/green                       |
| Reel                      | `--color-cat-reel`    | `oklch(0.78 0.18 280)`   | Saturated indigo/violet                    |
| Personal / Tribute        | `--color-cat-personal`| `oklch(0.78 0.18 330)`   | Saturated magenta/pink                     |
| Educational / Nonprofit   | `--color-cat-edunon`  | `oklch(0.78 0.18 90)`    | Saturated yellow                           |
| Other                     | `--color-cat-other`   | `oklch(0.78 0.05 250)`   | Desaturated gray-blue ("uncategorized")    |

**Contrast strategy:** Target lightness ~0.78 against `bg-neutral-950` (~`oklch(0.16 0 0)`) → measured ratio ~4.7-5.6:1 (AA for normal text). PBS drops to L=0.72 + C=0.21 for the highest visual weight; Other is L=0.78 + C=0.05 to recede semantically. All ratios clear AA for the `text-xs font-bold tracking-wider` style used on the tag (D-12).

### categoryAccent helper (avoids Tailwind v4 Pitfall 7)

`src/lib/components/categoryAccent.ts` exports a single function over a static `Record<Category, string>` map. Every `text-cat-*` class string appears LITERALLY in the file so Tailwind v4's scanner generates utilities for each. A computed `` `text-cat-${categoryToSlug(c)}` `` would NOT be detected — the scanner reads source files as text, not at runtime.

```ts
const ACCENT: Record<Category, string> = {
  'PBS American Portrait': 'text-cat-pbs',
  'Promos & Trailers': 'text-cat-promos',
  // ... 6 more, all literal
};
export function categoryAccent(category: Category): string {
  return ACCENT[category];
}
```

Adding a category = three lines in three files: `CATEGORIES` (categories.ts), `ACCENT` (here), `--color-cat-*` (app.css).

### CategoryTag.svelte — one component, two call sites

`{ category; href? }` props. Renders `<span>` by default (D-13: non-interactive inside cards, avoiding nested-`<a>` HTML) and `<a href={href}>` when href is provided (D-35: interactive on `/watch/[id]` metadata for click-through to `/work/<slug>`).

Forwards the caller's href verbatim — `CategoryTag` is a leaf; callers (`VideoCard`, `/watch/[id]` metadata) own base-path resolution. File-level `eslint-disable svelte/no-navigation-without-resolve` documents this contract; the GRID-05 test pattern (`expect(a.getAttribute('href')).toBe('/work/reel')`) depends on no transformation.

### VideoCard.svelte — single-<a> card with blur-up

`{ video: Video; eager?: boolean = false }` props. Root `<li>` wraps a single `<a href={\`${base}/watch/${video.id}\`} data-sveltekit-preload-data="hover">` (D-13, D-14). Inside:

```
<a>
  <div aspect-video bg-neutral-900>
    <img opacity-0 transition-opacity class:opacity-100={loaded} onload={() => (loaded = true)} />
  </div>
  <CategoryTag category={video.category} />   <!-- NO href, chip is <span> -->
  <h3 line-clamp-2>{video.title}</h3>
  <p text-neutral-500>{video.uploader}</p>
</a>
```

- **D-16 blur-up:** the bg-neutral-900 wrapper reserves space at every breakpoint (zero layout shift); the img starts at opacity-0 and transitions to opacity-100 when the onload handler flips `loaded`. Solid-color fade-in, no canvas/blurhash.
- **D-17 eager-first-8:** Wave 2 grid plans pass `eager={i < 8}` on the first row; default is lazy with `decoding="async"` on every thumb.
- **D-13 single link:** the only `<a>` in the rendered tree is the outer card link. The CategoryTag chip is a `<span>` because no href is passed.
- **D-06/D-07:** focus ring (white 2px + offset on dark bg) and hover state (group-hover:underline + group-hover:opacity-90 on the thumb).

### Test suite GREEN

| File                                          | Suites | Tests | Status                       |
| --------------------------------------------- | ------ | ----- | ---------------------------- |
| `src/lib/components/CategoryTag.test.ts`      | 1      | 6     | All pass (was describe.skip) |
| `src/lib/components/VideoCard.test.ts`        | 3      | 14    | All pass (was describe.skip) |
| `src/lib/data/*.test.ts` (Phase 2 carry)      | —      | 32    | Pass                         |
| **`pnpm test` total**                         |        | **52 pass / 26 skip (78)** | |

Remaining 26 skipped: TopNav.test.ts (5 tests, Plan 03-04), /work/page.test.ts (3, Plan 03-02), /work/[category]/page.test.ts (7, Plan 03-02), /watch/[id]/page.test.ts (11, Plan 03-03).

`pnpm check` clean (0 errors, 0 warnings across 417 files). `pnpm build` succeeds via `@sveltejs/adapter-static`. `pnpm lint` clean.

## Downstream Contract for Wave 2 Plans

### Plan 03-02 (/work, /work/[category])

- Import VideoCard: `import VideoCard from '$lib/components/VideoCard.svelte'`
- Render: `<ul class="grid …"><VideoCard {video} eager={i < 8} /></ul>` (each VideoCard root is `<li>`)
- The grid wrapper provides `class="grid"`; VideoCard itself only emits a single `<li>`
- D-25 sort order (featured-first then published desc) is the route's responsibility — VideoCard does NOT sort
- Test file `src/routes/work/page.test.ts` (and `/work/[category]/page.test.ts`): drop `describe.skip`, drop the `loadPage()` helper, replace with `import * as page from './+page'`

### Plan 03-03 (/watch/[id])

- Import VideoCard for the rail (same pattern as /work)
- Import CategoryTag WITH href prop for the metadata block: `<CategoryTag category={video.category} href={\`${base}/work/${categoryToSlug(video.category)}\`} />` (D-35)
- Test file: same drop-skip + static-import pattern

### Plan 03-04 (TopNav)

- Import `categoryAccent` for active-state highlighting: `class:text-cat-pbs={page.url.pathname === '/work/pbs-american-portrait'}` — but the cleaner pattern is `class={getActiveCat(page.url.pathname, c)}` where the helper returns `categoryAccent(c)` or `''`
- Test file: drop the `loadTopNav()` helper, replace with `import TopNav from './TopNav.svelte'`

### All downstream test files

The runtime-computed `const spec = './' + '+page'` hack in the 4 still-stubbed files exists ONLY to defeat Vite's import-analysis until the target module ships. **Drop the entire `loadXxx()` indirection when you unskip** — don't keep the hack and just rename the function.

## Decisions Made

### 1. OKLCH over HSL (D-04 carry-forward from research)

Tailwind v4 first-class. Perceptual uniformity gives predictable contrast at constant lightness — the 6 mid-tier accents share L=0.78 + C=0.18, so they read at the same visual weight despite varied hue. HSL would have required hand-tuning each color for equal perceived brightness.

### 2. Static Record map for category->class binding

Tailwind v4 Pitfall 7. Computed class strings (`` `text-cat-${slug}` ``) aren't generated. The static map has every literal string verbatim. Single source of binding — adding a category is three coordinated lines (CATEGORIES, ACCENT, --color-cat-*).

### 3. CategoryTag forwards href verbatim (no resolve())

Leaf component, caller's responsibility. File-level eslint-disable. Keeps the GRID-05 test pattern (`expect(a.getAttribute('href')).toBe('/work/reel')`) trivially provable — no need to mock `$app/paths` to assert behavior.

### 4. Vitest 4 test.projects (replaces vitest.workspace.ts)

Rule 3 deviation. See "Deviations from Plan" below.

### 5. Runtime-computed dynamic-import specifiers for still-stubbed tests

`/* @vite-ignore */` doesn't suppress vite:import-analysis on literal-string dynamic imports — only on non-literal expressions. `const spec = './' + '+page'` is non-literal from Vite's static perspective, so the analyzer skips resolution and the suite stays loadable while the module doesn't exist yet.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vitest 4 deprecates standalone `vitest.workspace.ts`**

- **Found during:** Task 2 first verification run (`pnpm test` after unskipping CategoryTag.test.ts → 6 tests failed with `ReferenceError: document is not defined`)
- **Issue:** Plan 03-00 created `vitest.workspace.ts` with a data/ui project split (data=node, ui=jsdom). Vitest 4.1.5 silently ignores this file (verified: `pnpm vitest list --project=ui` returns `Error: No projects matched the filter "ui"` — the projects don't exist in the runtime config). The Plan 03-00 "pnpm test green" result was a false positive — all 10 test files ran under the default `vite.config.ts` `environment: 'node'`, and the 6 ui stubs were `describe.skip` so the missing jsdom never surfaced. The moment Plan 03-01 unskipped CategoryTag.test.ts, `document` blew up.
- **Fix:** Migrated workspace config into `vite.config.ts` via `test.projects` (Vitest 4 contract). Each project re-declares the plugin set so SvelteKit Vite plugins load. The ui project sets `resolve.conditions: ['browser']` so `'svelte'`'s `mount()` resolves to the client entry (not the SSR entry, which crashes with `lifecycle_function_unavailable`). Deleted `vitest.workspace.ts`.
- **Files modified:** `vite.config.ts`, `vitest.workspace.ts` (deleted)
- **Verification:** `pnpm test` reports `Test Files 5 passed | 5 skipped (10); Tests 38 passed | 40 skipped (78)` after the fix (CategoryTag's 6 tests pass under jsdom + browser conditions).
- **Committed in:** `6418334`

**2. [Rule 3 - Blocking] Vite's `vite:import-analysis` rejects literal-string dynamic imports to unresolvable modules**

- **Found during:** Same verification run as #1 — after the workspace fix, 5 still-stubbed test files (TopNav, VideoCard, 3 route stubs) failed with `Failed to resolve import "./+page" from "src/routes/work/page.test.ts"` / `Failed to resolve import "./TopNav.svelte"`.
- **Issue:** Plan 03-00's lazy-import pattern (`await import('./+page')` inside `loadXxx()` helper) relies on the dynamic import never being statically analyzed. Under the proper jsdom + browser-conditions environment, Vite's `vite:import-analysis` plugin DOES statically analyze literal-string dynamic imports and fails on unresolvable specifiers — `describe.skip` doesn't prevent transform-time analysis. The original plan worked accidentally under the broken-workspace node env. The `/* @vite-ignore */` Vite escape hatch is documented as "ONLY suppresses warnings about non-literal specifiers" — it does NOT suppress resolution errors for literal strings.
- **Fix:** Rewrote dynamic-import specifiers in the 4 still-stubbed test files (TopNav.test.ts, /work/page.test.ts, /work/[category]/page.test.ts, /watch/[id]/page.test.ts) plus VideoCard.test.ts (later cleaned up in Task 3) as runtime-computed strings: `const spec = './' + '+page'; await import(/* @vite-ignore */ spec)`. The runtime concat IS non-literal from Vite's static perspective, so analysis skips resolution. Removed orphaned `// @ts-expect-error` directives that became unused once the import return-type became `Promise<any>`.
- **Files modified:** 5 test files (4 still-stubbed for downstream plans + VideoCard.test.ts which Task 3 then replaces with a top-level static import)
- **Verification:** `pnpm test` → 5 passed | 5 skipped (10) test files. `pnpm check` → 0 errors after removing orphaned directives.
- **Committed in:** `6418334` (same commit as #1 — both are facets of the same upstream-contract gap)
- **Downstream contract update:** Plans 03-02..03-04, when they unskip their test files, DROP the entire `loadXxx()` indirection (helper function + runtime-computed spec) and replace with top-level static imports.

**3. [Rule 1 - Lint] CategoryTag.svelte tripped `svelte/no-navigation-without-resolve`**

- **Found during:** Task 2 commit (lint-staged pre-commit hook)
- **Issue:** The Svelte ESLint rule `svelte/no-navigation-without-resolve` wants internal `<a href>` to be wrapped in `resolve()` from `$app/paths`. Inline `<!-- eslint-disable-next-line ... -->` comments inside the template did NOT propagate to the rule check (Svelte parser quirk).
- **Fix:** Used file-level `/* eslint-disable svelte/no-navigation-without-resolve */` inside the `<script>` block with a documenting comment in the file header explaining the contract: CategoryTag is a leaf, the CALLER produces a base-path-safe href; forwarding verbatim keeps the GRID-05 literal-href test pattern provable.
- **Files modified:** `src/lib/components/CategoryTag.svelte`
- **Verification:** `pnpm lint` clean.
- **Committed in:** `ff4abe5`

**4. [Rule 1 - Lint] VideoCard.svelte tripped the same `svelte/no-navigation-without-resolve` rule**

- **Found during:** Task 3 commit (lint-staged pre-commit hook — pre-emptively addressed before commit)
- **Issue:** VideoCard's outer `<a href={\`${base}/watch/${video.id}\`}>` flags the same rule. The href IS base-path safe (built from `$app/paths`'s `base`); the rule expects the SvelteKit 2.27+ typed-routes `resolve('/watch/[id]', { id })` form.
- **Fix:** Same pattern as CategoryTag — file-level eslint-disable inside `<script>` with a documenting comment in the file header.
- **Files modified:** `src/lib/components/VideoCard.svelte`
- **Verification:** `pnpm lint` clean.
- **Committed in:** `3c6ce07`

---

**Total deviations:** 4 auto-fixed (2 Rule 3 blocking — the same root cause split into workspace + import-analysis; 2 Rule 1 lint)
**Impact on plan:** Deviations 1 and 2 expose a real Plan 03-00 gap — the test infrastructure was never actually exercising jsdom, so the upstream contract had a latent bug. Fixing it is necessary for ANY Phase 3 plan to work. Deviations 3 and 4 are documented contracts (CategoryTag/VideoCard own base-path resolution at the call site). No scope creep — all four changes are required for `pnpm test` / `pnpm check` / `pnpm lint` to go green.

## Authentication Gates

None.

## Self-Check: PASSED

All claimed artifacts exist on disk and all claimed commits are reachable in `git log`:

- FOUND: `src/app.css` (modified — contains `@theme {` and 8 `--color-cat-*` literals)
- FOUND: `src/lib/components/categoryAccent.ts` (contains `text-cat-pbs`, `text-cat-promos`, ...,  `text-cat-other`)
- FOUND: `src/lib/components/CategoryTag.svelte`
- FOUND: `src/lib/components/VideoCard.svelte`
- FOUND: `vite.config.ts` (contains `projects: [` with `data` + `ui` named projects)
- NOT FOUND (intentional): `vitest.workspace.ts` (deleted)
- FOUND commit: `f5c428d` (Task 1 — colors + categoryAccent)
- FOUND commit: `6418334` (Rule 3 fix — Vitest workspace migration)
- FOUND commit: `ff4abe5` (Task 2 — CategoryTag.svelte)
- FOUND commit: `3c6ce07` (Task 3 — VideoCard.svelte)

`src/lib/components/CategoryTag.test.ts` and `src/lib/components/VideoCard.test.ts` no longer contain `describe.skip` or `@ts-expect-error`.

## Known Stubs

The Wave 1 leaf components are STATEFUL only in the sense of the local `loaded` `$state` (blur-up trigger). They take real props from real `$lib/data` types — no placeholder data, no hardcoded "coming soon" text, no mocked stubs. The grid that consumes them (Plan 03-02) does NOT yet exist — but that's Wave 2 work, not a stub.

The 4 still-skipped test files (TopNav + 3 route stubs) are upstream-owned by Plans 03-02..03-04. They use a runtime-computed dynamic-import hack documented above. Each downstream plan owns dropping that hack when it unskips.

## Final State

- `pnpm test` — `Test Files 6 passed | 4 skipped (10); Tests 52 passed | 26 skipped (78)`
- `pnpm check` — `0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS` (417 files)
- `pnpm build` — `Wrote site to "build"` via @sveltejs/adapter-static
- `pnpm lint` — clean
- `pnpm test:prerender` — still exits 1 (routes don't exist yet — Plans 03-02 + 03-03 own the first GREEN run)

## Next Phase Readiness

Wave 2 plans (03-02 /work routes + 03-03 /watch route) can run in parallel — both consume `VideoCard` directly from `$lib/components/VideoCard.svelte`, and 03-03 also consumes `CategoryTag` (with href) for metadata. Plan 03-04 (TopNav) is Wave 3 and consumes `categoryAccent` for active-state highlighting; it can also be unblocked now.

No blockers carried forward. The Vitest 4 workspace migration + Vite import-analysis workaround are documented in this SUMMARY and in the downstream contract.

---
*Phase: 03-grid-filter-watch*
*Completed: 2026-05-10*
