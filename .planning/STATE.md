---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
stopped_at: Completed 05-02-PLAN.md (PBS American Portrait flagship landing — PBS-01/02/03)
last_updated: "2026-05-12T19:48:27.023Z"
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 19
  completed_plans: 19
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-10)

**Core value:** A producer can land on the site, watch the reel, click any video, and immediately see "more like this" — every interaction reinforces the depth and breadth of her video work.
**Current focus:** Phase 05 — pbs-american-portrait

## Current Position

Phase: 6
Plan: Not started

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P01-scaffold | 13m | 2 tasks | 24 files |
| Phase 02-data-layer P00-vitest-wave0 | 14m | 3 tasks | 8 files |
| Phase 02-data-layer P01-types-schema | 7m | 2 tasks | 7 files |
| Phase 02-data-layer P02-author-videos-json | 5m | 2 tasks | 4 files |
| Phase 02-data-layer P03-loader-and-vite-plugin | 7m | 2 tasks | 8 files |
| Phase 03-grid-filter-watch P00-test-infrastructure | 14m | 3 tasks tasks | 11 files files |
| Phase 03-grid-filter-watch P01 | 18m | 3 tasks | 11 files |
| Phase 03-grid-filter-watch P03 | 9 | 2 tasks | 5 files |
| Phase 03-grid-filter-watch P02-work-routes | 6m | 2 tasks | 6 files |
| Phase 03-grid-filter-watch P04-top-nav-and-placeholder-routes | 8m | 2 tasks tasks | 5 files files |
| Phase 04-reel-led-home P01 | 8 min | 3 tasks tasks | 6 files files |
| Phase 04-reel-led-home P02 | 5m | 2 tasks | 3 files |
| Phase 04-reel-led-home PP03 | 3m | 2 tasks tasks | 2 files files |
| Phase 04-reel-led-home P04 | 5m | 1 task tasks | 2 files files |
| Phase 04-reel-led-home P05 | 6m | 1 tasks | 3 files |
| Phase 05-pbs-american-portrait P01 | 9m | 3 tasks | 11 files |
| Phase 05-pbs-american-portrait P02 | 5m | 3 tasks tasks | 11 files files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: SvelteKit + TS + Tailwind locked in kickoff
- Init: `videos.json` checked into repo as source of truth (no CMS for v1)
- Init: Click-to-filter via routing (deep-linkable), not modal
- Init: PBS American Portrait gets dedicated page AND remains a filterable category
- Init: Press treated as first-class section (not buried in About)
- [Phase 01-foundation]: Pinned every load-bearing dep with -E (no caret/tilde). Locked pnpm@11.0.9 in packageManager + plan 01-02 PNPM_VERSION env var
- [Phase 01-foundation]: Omitted compilerOptions.runes from svelte.config.js (RESEARCH.md Pitfall 5) — runes are default in Svelte 5; global enforcement risks breaking third-party libs
- [Phase 01-foundation]: Added @types/node@22.19.18 (Rule 3 deviation) — required for vite/kit type defs to compile under svelte-check
- [Phase 02-data-layer]: Skipped pnpm dlx sv add vitest in favor of pnpm add -D -E vitest@4.1.5 @vitest/coverage-v8@4.1.5: avoids jsdom + playwright bloat we do not need (schema/loader tests run in node, not browser)
- [Phase 02-data-layer]: Lazy await import() in test stubs + // @ts-expect-error: lets Wave 0 vitest run + svelte-check both exit 0 while preserving downstream pnpm vitest run -t "<name>" contract; downstream plans flip describe.skip -> describe (one-rule rename) and drop the now-unused @ts-expect-error
- [Phase 02-data-layer]: Used z.discriminatedUnion('source', [...]) with two identical z.strictObject branches instead of single z.strictObject + z.enum on source: future-proofs for per-source field divergence and gives narrowed types at call sites that branch on v.source
- [Phase 02-data-layer]: CATEGORIES array stored in seed-proposal order NOT D-04 display order: display order is computed dynamically by getCategoriesInDisplayOrder() in Plan 02-03 loader; pre-sorting the static array would create a second source of truth that drifts when counts change
- [Phase 02-data-layer]: Kept Wave 0 lazy await import() pattern in unskipped test files instead of converting to static top-level imports: rename to describe is one-rule (drop @ts-expect-error directives as imports resolve); switching half the files to static imports while videos.json.test.ts + videos.test.ts still need lazy imports would create a two-pattern codebase
- [Phase 02-data-layer]: Accepted top-level url field as z.url().optional() on every record: seed includes url (human-friendly watch page) on all rows; accepting lossless keeps Plan 02-02 a near-byte-level seed copy and gives /watch/[id] a future hook for outbound links; z.strictObject still rejects unknown fields
- [Phase 02-data-layer]: Used inline 'node -e' one-liner instead of committed scripts/seed-to-videos.ts: deterministic byte-identical output to JSON.stringify(seed.videos, null, 2) + newline; no scripts/, no tsx dep, no dead code
- [Phase 02-data-layer]: Preserved Wave 0 lazy 'await import(./videos.json)' pattern instead of switching to static top-level import per the plan text's illustrative example: matches Plan 02-01 SUMMARY's explicit decision (no two-pattern codebase while videos.test.ts still needs lazy imports); both literal acceptance criteria met (no describe.skip, no @ts-expect-error)
- [Phase 02-data-layer]: Did NOT inline D-08 default fields (featured/hidden/tags/credits) in videos.json: Pitfall 2 says .default() only applies on .parse(); loader materializes defaults at runtime; would have added 224 lines of zero-info noise and drift risk
- [Phase 02-data-layer]: Followed PLAN.md frontmatter literal 'test:build-fails' script name (matches script filename test-build-fails.mjs) instead of casual 'test:smoke' reference in orchestrator brief and Plan 02-00 SUMMARY downstream-contract prose: PLAN.md is the binding contract via must_haves.artifacts + acceptance_criteria; prose references are illustrative shape.
- [Phase 02-data-layer]: Validate-twice contract: Vite plugin buildStart (build-time DATA-03 enforcement, fails before any bundling, this.error + z.prettifyError) + loader .parse() at module load (materializes D-08 defaults so runtime types match parsed shape, NOT raw-JSON shape). Schema module stays pure (no JSON import) — both consumers (plugin via readFileSync, loader via Vite JSON import) decoupled per Pitfall 1.
- [Phase 02-data-layer]: Public $lib/data surface intentionally does NOT re-export allVideos (D-14 future-tooling only) or Zod schemas (VideoSchema/VideoArraySchema are build-time only — routes consume parsed data, not schemas). Single import path = single point to refactor when internal structure changes.
- [Phase 03-grid-filter-watch]: Chose Vitest workspace split (data=node, ui=jsdom) over a global jsdom swap: keeps Phase 2's 32 data-layer tests in fast node env; jsdom isolated to component+route tests via vitest.workspace.ts. Both projects extends vite.config.ts so SvelteKit Vite plugins load.
- [Phase 03-grid-filter-watch]: Renamed route test files +page.test.ts -> page.test.ts (Rule 3 deviation): @sveltejs/kit 2.59.1's route analyzer hard-errors on +*.ts not matching recognized route shapes. Unprefixed names are silently ignored by the router (create_manifest_data line 233) and freely picked up by Vitest's include glob. 03-VALIDATION.md per-task verification map updated to match.
- [Phase 03-grid-filter-watch]: Kept lazy await import() pattern from Phase 2 Wave 0 for stubs whose target modules don't exist yet: planner's literal top-level static imports + // @ts-expect-error didn't actually prevent vitest's module loader from resolving the imports (the directive only suppresses the TS error, not the runtime resolve). Each test body now calls 'const X = await loadX()' where loadX is async; describe.skip stops loadX from ever running. Downstream plans drop the indirection + the @ts-expect-error when they unskip.
- [Phase 03-grid-filter-watch]: scripts/test-prerender-coverage.mjs thresholds are >=1 build/work/index.html + >=8 build/work/<slug>/index.html + >=56 build/watch/<id>/index.html. Why this complements adapter-static strict:true: strict catches non-prerenderable routes; this catches empty entries() enumerations (which would let the build succeed with zero output). Plans 03-02 + 03-03 own first GREEN run.
- [Phase 03-grid-filter-watch]: OKLCH category accents at L~0.78 C~0.18 (PBS bumped to L=0.72 C=0.21 for D-04 flagship prominence; Other desaturated to C=0.05 for 'uncategorized' semantics); contrast 4.7-5.6:1 on bg-neutral-950 clears AA
- [Phase 03-grid-filter-watch]: Static Record<Category, string> map in categoryAccent.ts (every text-cat-* class literal) instead of computed slug: Tailwind v4 scanner reads source as text; dynamic concatenations are NEVER detected and the utilities wouldn't ship in the bundled CSS
- [Phase 03-grid-filter-watch]: Vitest 4 workspace migration (Rule 3 deviation): vitest.workspace.ts silently ignored by Vitest 4.1.5 (verified 'vitest list --project=ui' returns 'No projects matched'); migrated config into vite.config.ts test.projects with resolve.conditions: ['browser'] for the ui project so mount() resolves to client entry (not lifecycle_function_unavailable SSR entry). Deleted vitest.workspace.ts. Plan 03-00 'pnpm test green' was a false positive — all ui stubs were describe.skip so missing jsdom never surfaced
- [Phase 03-grid-filter-watch]: Runtime-computed dynamic-import specifier (const spec = './' + '+page') for still-stubbed tests: /* @vite-ignore */ alone does NOT suppress vite:import-analysis for literal-string dynamic imports — only for non-literal expressions. Runtime concat IS non-literal from Vite's static perspective, so analysis skips resolution. Downstream plans 03-02/03/04 drop this hack entirely (replace loadXxx helper + spec with top-level static import) when they unskip
- [Phase 03-grid-filter-watch]: CategoryTag and VideoCard use file-level eslint-disable svelte/no-navigation-without-resolve: CategoryTag forwards caller's href verbatim (leaf component; caller produces base-path-safe URL — VideoCard builds ${base}/watch/${id}); rule expects SvelteKit 2.27+ typed-routes resolve() form which would break the literal-href test patterns the tests rely on
- [Phase 03-grid-filter-watch]: Plan 03-03: async load() so error(404) becomes a promise rejection — sync load() bypasses promise machinery and breaks .rejects.toMatchObject test patterns; async makes the throw surface as a rejection.
- [Phase 03-grid-filter-watch]: Plan 03-03: callLoad() narrowing helper in route tests — SvelteKit's PageLoad widens awaited return to void | (...); helper narrows via if(!result)throw; pattern shared with parallel Plan 03-02 /work/page.test.ts
- [Phase 03-grid-filter-watch]: Plan 03-03: trailingSlash='always' in src/routes/+layout.ts (Rule 3 deviation) — adapter-static default emits flat <route>.html but Plan 03-00 prerender-coverage script expects directory <route>/index.html; one-line fix in +layout.ts propagates to every route. Plan 03-04 inherits this.
- [Phase 03-grid-filter-watch]: Plan 03-03: (data.video) instead of bare const {video,rail}=data in +page.svelte — Svelte 5 state_referenced_locally warning; $derived is canonical idiom; behavior identical on prerendered routes.
- [Phase 03-grid-filter-watch]: Made /work/[category] load ASYNC instead of plan's literal sync signature so error(404) becomes an awaited rejection that .rejects.toMatchObject can catch (Plan 03-00 test contract). Sync load throws synchronously before await expect can wrap it — runtime crash instead of assertion. Zero runtime difference for happy path. Rule 1 deviation.
- [Phase 03-grid-filter-watch]: Added callLoad() narrow helper in both route test files (Rule 3 deviation): Plan 03-01's downstream contract (drop loadXxx() lazy-import) exposes SvelteKit PageLoad's void | (... & Record<string, any>) generic widening — void union blocks property access. Helper asserts non-void + casts to runtime shape. Preserves static-import contract; same pattern in /watch/[id]/page.test.ts (Plan 03-03 parallel).
- [Phase 03-grid-filter-watch]: Inherited trailingSlash='always' from src/routes/+layout.ts (added globally by Plan 03-03 parallel agent) instead of duplicating per-route on /work and /work/[category] — single source of truth, build emits canonical build/work/index.html + 8x build/work/<slug>/index.html directory shape that scripts/test-prerender-coverage.mjs counts.
- [Phase 03-grid-filter-watch]: Plan 03-04: Sticky-at-all-breakpoints TopNav header (research Open Question 4 recommendation supersedes CONTEXT.md's discretion note). bg-neutral-950/95 backdrop-blur + border-b border-white/10 at z-30; MobileMenu overlay at z-50 layers above when open
- [Phase 03-grid-filter-watch]: Plan 03-04: vi.hoisted() pattern for mutable mocks (Rule 1 deviation) — vi.mock factory references a const that mutates between tests; const must be wrapped in vi.hoisted to lift it alongside the mock so factory has no TDZ. Latent upstream Plan 03-00 stub bug surfaced when suite first ran
- [Phase 03-grid-filter-watch]: Plan 03-04: isActive(slug) compares page.url.pathname === `${base}/work/${slug}` (no trailing slash) — passes tests because mocked base='' makes shapes match; production behavior under trailingSlash='always' needs Phase 4 manual verify (page.url.pathname may carry the slash). Defensive fix is a strip-trailing-slash helper if visual fails
- [Phase 03-grid-filter-watch]: Plan 03-04: D-43 placeholder routes are dependency-free single +page.svelte files — no +page.ts; prerender=true inherits from root +layout.ts. Phase 6 replaces content; URL contract preserved. Each: <main><h1>Name</h1><p>Coming soon.</p></main>
- [Phase 04-reel-led-home]: Plan 04-01: Runtime-concat dynamic specifier carried forward to BOTH HeroPoster.test.ts AND page.test.ts (including loadPageData) — plan literal static-string await import('./+page') triggered vite:import-analysis + svelte-check 'cannot find module' simultaneously; fix preserves the Wave 0 -> Wave 1 one-rule transition (.skip -> describe + drop loadXxx indirection)
- [Phase 04-reel-led-home]: Plan 04-01: Dropped all @ts-expect-error directives in loadXxx helpers — runtime-concat specifiers widen to any, no TS error to suppress; svelte-check rejects unused @ts-expect-error so the directive must NOT be carried into Wave 0 stubs
- [Phase 04-reel-led-home]: Plan 04-01: Inline eslint-disable-next-line on stub constructor params (vitest-setup-ui.ts IntersectionObserverStub + TopNav.test.ts TrackingIO) — project eslint config does not honor _-prefixed unused-vars; the param types are load-bearing for IntersectionObserverCallback type compat
- [Phase 04-reel-led-home]: Plan 04-02: D-04 resolved WebP (user pick at Task 1 checkpoint) — Option 03 'Brooklyn Pigeons at Dusk' WebP @ 15.4KB beat its JPG sibling @ 24.5KB; both well under D-04 ~150KB target. Frame satisfies all 4 D-02 rubric points (wide / Michelle not on-camera / dark lower band / cinematic breadth). Phase 7 may revisit with <picture>+AVIF if FOUND-03 budget demands.
- [Phase 04-reel-led-home]: Plan 04-02: Sentinel ownership contract: the component painting the boundary owns the sentinel div. HeroPoster owns #hero-sentinel (D-14); TopNav (Plan 04-04) consumes via document.getElementById — decoupled. Pattern reference for any future scroll-aware element pairings.
- [Phase 04-reel-led-home]: Plan 04-02: Wave 0 -> Wave 1 stub transition executed verbatim per Plan 04-01 contract — 5 describe.skip -> describe, deleted loadHeroPoster() lazy helper, added top-level static import HeroPoster from './HeroPoster.svelte', dropped async/await from now-synchronous test bodies. Zero fixups, zero @ts-expect-error survivors. Template for Plans 04-03/04/05 to follow on their respective test files.
- [Phase 04-reel-led-home]: Plan 04-03: "featured": true placed inline after "category" on the 8 curated rows (diff-friendly grouping with quota-bearing field); zero "featured": false on the other 48 rows preserves Phase 2 D-08 contract (loader materializes z.boolean().default(false) at parse time) and avoids ~96 lines of drift-prone JSON noise. Curation source of truth = 04-RESEARCH.md §Featured Slice Curation; PLAN human-verify gate surfaces it verbatim; videos.test.ts featured suite locks the resulting shape in CI.
- [Phase 04-reel-led-home]: Plan 04-04: page.route.id MUST be read inside the $effect body (Pitfall 2) — hoisting to a top-level const breaks Svelte 5 reactivity tracking; the effect would attach once and never re-run on navigation. Inline read is the only correct shape; all 6 D-13 non-home route tests pin this contract
- [Phase 04-reel-led-home]: Plan 04-04: navClass $derived ternary returns TWO COMPLETE LITERAL CLASS STRINGS (Pitfall 4) — both branches include the full 'sticky top-0 z-30 border-b' prefix verbatim (no factoring/concat); Tailwind v4 source scanner tokenizes literal text only, so concatenation hides utilities from the build CSS
- [Phase 04-reel-led-home]: Plan 04-04: flushSync() pattern in Vitest after mount() when asserting on $effect side effects — Svelte 5's $effect runs on a microtask queue after mount() returns synchronously, so tests that assert on observer.observe() / observer.disconnect() / other effect-driven side effects must call flushSync() before the assertion. Plan 04-01 stub assumed synchronous effect run (1 deviation Rule 1 fix). Pattern carries forward to any future test asserting on $effect side effects
- [Phase 04-reel-led-home]: Plan 04-05: PageData-narrowed callLoad helper in page.test.ts — plan literal cast (load as () => Promise<{videos:unknown[]}>)() typed data as unknown[], which fails mount(Page,{props:{data}}) strict-prop check (Page.data is fully-typed PageData). Helper imports PageData from './$types' and returns Promise<PageData> via 'result as PageData'. Carries Phase 3 /work/page.test.ts callLoad pattern forward to the first route test that BOTH calls load() AND mounts the page.
- [Phase 04-reel-led-home]: Plan 04-05: Featured-slice loader = videos.filter(v=>v.featured).toSorted((a,b)=>b.published.localeCompare(a.published)) — mirrors /work/+page.ts shape with one filter step inserted; featured-first comparator collapses to published-desc only when every row in the slice is featured (all 8 in Phase 4). /+page.svelte iterates data.videos with eager={true} literal boolean (not i<8) to document that all 8 are intentionally above the fold. Same /work grid markup verbatim (max-w-7xl + grid-cols-2/3/4 + gap-2/3).
- [Phase 05-pbs-american-portrait]: Plan 05-01: Selected Candidate C (Editorial, ~50 words) at Task 1 checkpoint — most blockquote-worthy, complements <h2>Stories</h2>; embedded verbatim inline in <approved>...</approved> for Plan 05-02 to read directly
- [Phase 05-pbs-american-portrait]: Plan 05-01: Wave 0 stubs MUST match future-GREEN return types at type level (Video[] not never[], PageData not hand-narrowed subset) — svelte-check validates describe.skip bodies; broken stub types propagate to pnpm check failures even when tests never run
- [Phase 05-pbs-american-portrait]: Plan 05-01: PageData-narrowed callLoad helper required whenever a test BOTH calls load() AND mounts Page (mount needs strict Category enum literal — hand-narrowed {category:string,...} fails prop-type check). Pattern carried forward from Phase 4 Plan 04-05; applied to work/[category]/page.test.ts and pbs-american-portrait/page.test.ts
- [Phase 05-pbs-american-portrait]: Plan 05-01: Entity-escape <approved>...</approved> example tags inside doc-comment in PLAN.md so Task 1 verify regex (non-greedy first-match) captures the REAL approved element, not the literal '...' placeholder example. Without this, the regex captured 3 chars and failed the length-bounded check
- [Phase 05-pbs-american-portrait]: Plan 05-01: Per-file distinct mockPage identifiers (mockPage / mockPageW / mockPageWk) via vi.hoisted — eliminates risk of cross-suite scope collision under Vitest 4 worker pooling when multiple test files share a worker
- [Phase 05-pbs-american-portrait]: Plan 05-02: Coalesce video.description ?? '' at +page.svelte helper call sites — carries Plan 05-01 SUMMARY auto-fix #3 forward (Video.description is z.string().optional() per Phase 2 schema D-06); keeps pbsCollectionUrl signature pure (string) and matches the test file's coalesced approach
- [Phase 05-pbs-american-portrait]: Plan 05-02: TopNav slug-guarded /pbs-american-portrait/ suffix-match in isActive() — explicit slug === 'pbs-american-portrait' check before endsWith prevents future categories with similar suffix from false-positive highlighting on the flagship surface
- [Phase 05-pbs-american-portrait]: Plan 05-02: TopNav href ternary via {@const href = ...} inside #each block — pre-computes the URL in template scope; cleaner than inline ternary inside href attribute; follows Phase 4 D-13 navClass two-literal-strings discipline

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-05-12T19:42:43.169Z
Stopped at: Completed 05-02-PLAN.md (PBS American Portrait flagship landing — PBS-01/02/03)
Resume file: None
