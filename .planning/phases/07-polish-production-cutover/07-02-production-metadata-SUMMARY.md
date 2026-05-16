---
phase: 07-polish-production-cutover
plan: 02
subsystem: seo
tags: [metadata, og, twitter-card, json-ld, sitemap, favicon, schema-org, prerender]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: 'noindex meta (D-11) preserved; +layout.svelte head block; static/ asset dir; adapter-static prerender + trailingSlash always'
  - phase: 02-data-layer
    provides: '$lib/data exports (videos, getCategoriesInDisplayOrder, categoryToSlug) + Video schema (published, duration_seconds, description, thumbnail, embed)'
  - phase: 03-grid-filter-watch
    provides: '/watch/[id]/+page.svelte $derived(data.video) pattern; 8 prerendered category routes; 56 prerendered watch routes'
  - phase: 06-press-about-contact
    provides: 'ContactBlock.svelte single source of truth for IMDb/LinkedIn/Vimeo URLs (sameAs targets); approved about bio (description copy lossless reuse)'
  - phase: 07-polish-production-cutover (07-01)
    provides: 'ContactBlock IMDb/LinkedIn URL state — deferred to v1.0 launch as channel-homepage fallbacks; Person JSON-LD sameAs mirrors this v1.0 state verbatim'
provides:
  - 'Sitewide favicon set (favicon-{16,32,192,512}.png + .ico + apple-touch + og-image.jpg) referenced from <svelte:head>'
  - 'Sitewide OG + Twitter card meta tags (summary_large_image, 1200x630)'
  - 'Per-page <title> + <meta description> on all 7 routes (D-13 page-first format + D-14 copy)'
  - 'schema.org Person JSON-LD on /about (name, jobTitle, sameAs)'
  - 'schema.org VideoObject JSON-LD on 56 /watch/[id] routes (name, description, thumbnailUrl, uploadDate, embedUrl, ISO-8601 duration)'
  - 'build/sitemap.xml with 70 absolute https://michellengo.net URLs (prerendered endpoint)'
  - 'scripts/test-prerender-coverage.mjs asserts sitemap.xml + 7 binary assets in build/'
affects: ['07-05-noindex-flip-cutover (sitemap referenced via robots.txt Sitemap: directive)', 'post-launch backlog (favicon/og-image authoring + IMDb/LinkedIn URL swap)']

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'JSON-LD via {@html} template literal inside <svelte:head> (eslint-disable svelte/no-at-html-tags, safe because payload is JSON.stringify of build-time-static data)'
    - 'Sitemap as SvelteKit +server.ts endpoint with export const prerender = true → adapter-static emits build/sitemap.xml'
    - 'Absolute production URLs hardcoded (og:image + sitemap loc) — staging emits "wrong" host, harmless because staging is noindex per D-11'
    - 'Page-first title format (X — Michelle Ngo) preserves tab-strip scannability when truncated'

key-files:
  created:
    - 'src/routes/sitemap.xml/+server.ts (build-time sitemap generator, 70 URLs)'
  modified:
    - 'src/routes/+layout.svelte (favicon + OG + Twitter meta — Task 2 d661203, prior commit)'
    - 'src/routes/+page.svelte (D-13 title + approved D-14 description for /)'
    - 'src/routes/work/+page.svelte (D-13 title + D-14 description)'
    - 'src/routes/work/[category]/+page.svelte (D-13 title + dynamic D-14 description)'
    - 'src/routes/watch/[id]/+page.svelte (D-13 title + D-14 dynamic description + VideoObject JSON-LD)'
    - 'src/routes/pbs-american-portrait/+page.svelte (D-13 title + D-14 description)'
    - 'src/routes/press/+page.svelte (D-13 title + D-14 description)'
    - 'src/routes/about/+page.svelte (D-13 title + approved D-14 description + Person JSON-LD)'
    - 'src/routes/contact/+page.svelte (D-13 title + D-14 description)'
    - 'scripts/test-prerender-coverage.mjs (sitemap.xml + 7 binary asset assertions)'

key-decisions:
  - 'Task 1 (07-02): Use placeholder favicon set + og-image at v1.0 launch — wire metadata fully, defer pixel-perfect asset authoring to post-v1.0 backlog (committed 1b9ce31 prior to continuation)'
  - 'Task 3 (07-02): approve-as-suggested — / and /about description strings ship verbatim per planner-suggested values (140 + 132 chars; /about reuses first 132 chars of approved ABT-01 bio)'
  - 'Person JSON-LD sameAs uses channel-homepage IMDb/LinkedIn URLs verbatim from ContactBlock.svelte (post-Plan-07-01-deferral v1.0 launch state, NOT personalized URLs — backlog item)'
  - 'BASE_URL hardcoded as https://michellengo.net in og:image and sitemap.xml (production canonical host; staging wrong-host is intentional + harmless per D-11 noindex)'
  - 'Build-date lastmod for all sitemap entries (D-17 Claude Discretion — no per-video changelog tracking)'

patterns-established:
  - 'JSON-LD injection pattern: {@html `<script type="application/ld+json">${JSON.stringify(payload)}<` + `/script>`} with eslint-disable svelte/no-at-html-tags — safe because payload is JSON.stringify of static/Zod-validated data'
  - 'Sitemap endpoint pattern: src/routes/sitemap.xml/+server.ts with export const prerender = true and Response with application/xml content-type'
  - 'D-13 title format established: <Page> — Michelle Ngo (page-first, brand-suffix; home is brand-only)'

requirements-completed: [FOUND-03]

# Metrics
duration: ~75 min total (across 2 sessions; continuation session ~30 min)
completed: 2026-05-16
---

# Phase 7 Plan 02: Production Metadata Summary

**Sitewide favicon + OG + Twitter card meta, per-page D-13 titles + D-14 descriptions on all 7 routes, schema.org Person JSON-LD on /about + VideoObject JSON-LD on 56 /watch pages, and a prerendered 70-URL sitemap.xml — all metadata the public site needs in its `<head>` before search engines see the new domain.**

## Performance

- **Duration:** ~75 min (across 2 executor sessions; continuation session resumed at Task 3 after user approval)
- **Started:** 2026-05-14 (Task 1+2 in first session)
- **Continued:** 2026-05-16 (Task 3 approval + Tasks 4-7 in continuation session)
- **Completed:** 2026-05-16T10:30:54Z
- **Tasks:** 7 (1 placeholder asset prep, 1 layout meta, 1 approval-only checkpoint, 4 wiring tasks)
- **Files modified:** 10 (9 route/script + 1 new endpoint)
- **Files created:** 1 (sitemap.xml/+server.ts) + 7 binary assets (committed in Task 1)

## Accomplishments

- Every prerendered HTML route now emits a route-specific `<title>` in D-13 page-first format (e.g., `Work — Michelle Ngo`, `PBS American Portrait — Michelle Ngo`); home stays brand-only (`Michelle Ngo`)
- Every prerendered HTML route now emits a route-specific `<meta name="description">` per D-14 (≤155 chars each, verified)
- `/about` injects schema.org Person JSON-LD (name/jobTitle/sameAs) — 1 prerendered injection
- 56 `/watch/[id]/index.html` files each inject schema.org VideoObject JSON-LD (42 include ISO-8601 duration; 14 omit per duration_seconds-optional contract)
- `build/sitemap.xml` emits with exactly 70 `<url>` entries (6 static + 8 categories + 56 watch), all absolute `https://michellengo.net/...` URLs with build-date `<lastmod>`
- `scripts/test-prerender-coverage.mjs` now asserts sitemap.xml URL count + 7 binary asset presence — blocks future build if any go missing
- D-09 honored: zero new JS runtime deps; sitemap is pure string interpolation, JSON-LD is `JSON.stringify` of inline objects

## Task Commits

Each task committed atomically:

1. **Task 1: Placeholder favicon set + og-image** — `1b9ce31` (feat; prior session)
2. **Task 2: Sitewide favicon + OG + Twitter card meta in +layout.svelte** — `d661203` (feat; prior session)
3. **Task 3: Description copy approval (decision-only, no source edits)** — recorded in STATE.md Decisions
4. **Task 4: Per-page titles + descriptions across all 7 routes** — `a4eb986` (feat)
5. **Task 5: Person + VideoObject JSON-LD for SEO** — `51c70ff` (feat)
6. **Task 6: Build-time sitemap.xml endpoint** — `511e06e` (feat)
7. **Task 7: Prerender coverage script assertions for sitemap.xml + assets** — `cd053ac` (test)

**Plan metadata commit:** pending (post-self-check).

## Files Created/Modified

### Created
- `src/routes/sitemap.xml/+server.ts` — Build-time sitemap generator. Imports `videos`, `getCategoriesInDisplayOrder`, `categoryToSlug` from `$lib/data`. Exports `prerender = true` + a `GET()` that templates 70 `<url>` entries with absolute `https://michellengo.net` hosts and build-date `<lastmod>`. Returns `application/xml; charset=utf-8`.

### Modified (this session — continuation)
- `src/routes/+page.svelte` — D-13 title (`Michelle Ngo`, brand-only) + D-14 description (140 chars, approved verbatim)
- `src/routes/work/+page.svelte` — D-13 title (`Work — Michelle Ngo`) + D-14 description
- `src/routes/work/[category]/+page.svelte` — D-13 dynamic title (`{data.category} — Michelle Ngo`) + D-14 dynamic description (`{count} videos by Michelle Ngo in {category}.`)
- `src/routes/watch/[id]/+page.svelte` — D-13 dynamic title + D-14 dynamic description (first 150 chars of video.description with title fallback) + D-15 VideoObject JSON-LD injection
- `src/routes/pbs-american-portrait/+page.svelte` — D-13 title + D-14 description
- `src/routes/press/+page.svelte` — D-13 title + D-14 description
- `src/routes/about/+page.svelte` — D-13 title + D-14 description (132 chars, lossless reuse from approved ABT-01 bio) + D-15 Person JSON-LD injection with channel-homepage IMDb/LinkedIn URLs (matching ContactBlock v1.0 state)
- `src/routes/contact/+page.svelte` — D-13 title + D-14 description
- `scripts/test-prerender-coverage.mjs` — Added imports (readFileSync), sitemap.xml existence + URL count (≥70) assertion, 7-asset existence assertion, updated PASS + FAIL summary output

### Modified (prior session)
- `src/routes/+layout.svelte` — Sitewide favicon + OG + Twitter meta in `<svelte:head>` (preserved `<meta name="robots">` per D-16, Plan 07-05 owns the flip)
- 7 binary static assets in `static/` — favicon set + og-image (placeholders, see Known Stubs)

## User Decisions Captured

- **Task 1 (2026-05-14):** Selected placeholder approach — wire metadata fully; defer pixel-perfect favicon/og-image authoring to post-v1.0 launch backlog. Reasoning: the metadata wiring is the value delivery; binary asset quality is a separate concern that can be improved post-launch without re-deploying source code (just re-deploy `static/` assets).
- **Task 3 (2026-05-16):** `approve-as-suggested` — both `/` (140 chars) and `/about` (132 chars) description strings ship verbatim per planner-suggested values. `/about` description is the first 132 chars of the already-approved ABT-01 bio (lossless reuse). No re-authoring needed.

## Decisions Made

- **D-15 sameAs URL state (Task 5):** Person JSON-LD `sameAs` array mirrors ContactBlock.svelte's current channel-homepage URLs (`https://www.imdb.com/`, `https://www.linkedin.com/`, `https://vimeo.com/user2149742`). This matches the v1.0 launch state per Plan 07-01 deferral (2026-05-13). The PLAN.md acceptance criterion that forbade channel-homepage placeholders was authored under the assumption Plan 07-01 would swap to personalized URLs; the user explicitly chose to defer that swap. The two locations (ContactBlock IMDB_URL/LINKEDIN_URL + about/+page.svelte IMDB_URL/LINKEDIN_URL) need to be updated together when the personalized URLs land — single-line edit per file, already documented inline in both files.
- **JSON-LD injection mechanism (Task 5):** Used `{@html \`<script type="application/ld+json">${JSON.stringify(payload)}<\` + \`/script>\`}` with `eslint-disable-next-line svelte/no-at-html-tags`. Svelte's compiler treats a literal `<script>` inside `<svelte:head>` as a Svelte script block (not raw HTML), so direct embedding fails. The payload is always `JSON.stringify` of a build-time-static (Person) or Zod-validated (VideoObject from `videos.json`) object — no user input flows into the HTML, so `{@html}` is safe.
- **Sitemap URL count (Task 6):** Final count is exactly 70 (6 static + 8 categories + 56 watch), not the ~72 estimate in CONTEXT.md. The CONTEXT.md estimate was approximate; the static-route list audited down to 6 (no separate "/watch" root route exists). PLAN.md acceptance criteria say ≥70, which is satisfied exactly.
- **Sitemap absolute URLs (Task 6):** Hardcoded `https://michellengo.net` as the canonical host. Staging deploys at `wolfwdavid.github.io/michelle_ngo_four/` will emit a sitemap with the wrong host — this is acceptable because (a) staging is `noindex` per D-11, (b) search engines won't crawl the staging URL, and (c) the production build (BASE_PATH='') will emit identical sitemap content.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] svelte/no-at-html-tags eslint hook blocked initial Task 5 commit**
- **Found during:** Task 5 (Person + VideoObject JSON-LD)
- **Issue:** Pre-commit lint hook (`eslint --fix`) failed with `\`{@html\`} can lead to XSS attack` on both /about and /watch/[id] route files. The `{@html}` directive is the only viable mechanism to inject a literal `<script type="application/ld+json">` block inside `<svelte:head>` (Svelte's compiler treats inline `<script>` as a Svelte script block, not raw HTML).
- **Fix:** Added `<!-- eslint-disable-next-line svelte/no-at-html-tags -->` immediately before each `{@html}` directive, with an inline comment explaining why the payload is safe (JSON.stringify of static-typed data; no runtime user input).
- **Files modified:** `src/routes/about/+page.svelte`, `src/routes/watch/[id]/+page.svelte`
- **Verification:** Re-ran commit; lint-staged eslint --fix passed; svelte-check passed (463 files, 0 errors); pnpm test passed (168/168); pnpm build emitted JSON-LD in all 57 target prerendered HTML files (1 /about + 56 /watch).
- **Committed in:** 51c70ff (Task 5 commit)

**2. [Rule 1 - Acceptance Criterion Contradiction] Person JSON-LD sameAs URLs match ContactBlock v1.0 state (channel-homepages) rather than personalized URLs**
- **Found during:** Task 5 (Person JSON-LD wiring)
- **Issue:** PLAN.md acceptance criterion 5 forbade channel-homepage placeholders in /about/+page.svelte's IMDB_URL/LINKEDIN_URL literals, expecting them to be the post-Plan-07-01-swap personalized URLs. But Plan 07-01 was explicitly DEFERRED on 2026-05-13 (user accepted v1.0 launch with channel-homepage fallbacks); ContactBlock.svelte still contains the channel-homepage literals as its v1.0 launch contract. Following the PLAN.md acceptance criterion verbatim would have created a contradiction: about/+page.svelte would carry personalized URLs that don't exist while ContactBlock keeps the channel-homepages.
- **Fix:** Mirrored ContactBlock.svelte's actual v1.0 launch literals in about/+page.svelte. Both files now reference `https://www.imdb.com/` and `https://www.linkedin.com/`. When the personalized URL backlog item is resolved post-launch, BOTH files must be updated together (documented inline in both files).
- **Files modified:** `src/routes/about/+page.svelte` (Person JSON-LD sameAs)
- **Verification:** /about prerendered HTML emits Person JSON-LD with the channel-homepage URLs in sameAs; ContactBlock visible links still match (single-source-of-truth contract preserved on the visible/UI side).
- **Committed in:** 51c70ff (Task 5 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking lint, 1 acceptance-criterion-contradiction-due-to-upstream-deferral)
**Impact on plan:** Both auto-fixes preserve plan intent. The eslint-disable is the canonical pattern for safe JSON-LD `{@html}` injection. The sameAs URL choice respects the explicit v1.0 launch decision from Plan 07-01 (channel-homepages accepted; personalized URLs deferred to post-launch backlog) — adding the same backlog item to the SUMMARY ensures both locations are remembered together.

## Issues Encountered

- None blocking. The two deviations above were both resolved via inline auto-fix without architectural changes.

## Known Stubs

- **7 placeholder binary assets in `static/`** (`favicon-16.png`, `favicon-32.png`, `favicon-192.png`, `favicon-512.png`, `apple-touch-icon.png`, `favicon.ico`, `og-image.jpg`) — committed in Task 1 (1b9ce31) per user decision to defer pixel-perfect authoring to post-v1.0 backlog. The metadata wiring (favicon `<link>` tags, og:image meta) is fully functional; the binary assets satisfy the URL-resolution contract but are placeholders. **This is intentional and tracked in STATE.md Blockers/Concerns as a post-launch backlog item.** When designed assets land, drop them in `static/` overwriting the placeholders — no source code change needed.
- **Channel-homepage IMDb + LinkedIn URLs** in `src/lib/components/ContactBlock.svelte` AND `src/routes/about/+page.svelte` Person JSON-LD `sameAs` — both contain `https://www.imdb.com/` and `https://www.linkedin.com/` rather than personalized URLs. Carried forward from Plan 07-01 deferral (2026-05-13). **This is intentional and tracked in STATE.md Blockers/Concerns from Plan 07-01.** When personalized URLs materialize, update BOTH files together (single-line edit each).

## User Setup Required

**External assets pending v1.0 launch.** Tracked in STATE.md Blockers/Concerns. Drop-in replacements (no source code edits):

1. **Favicon set authoring** (post-v1.0 backlog): Generate `favicon.ico` (16+32 multi-res), `favicon-{192,512}.png`, `apple-touch-icon.png` (180×180) from a single 512×512 white-on-neutral-950 "MN" master. Use `realfavicongenerator.net` or an image editor. Overwrite the placeholders in `static/`.
2. **OG image authoring** (post-v1.0 backlog): Export a 1200×630 crop of `src/lib/assets/hero-poster.webp` as `static/og-image.jpg` (~150KB target; optional wordmark composite).
3. **IMDb + LinkedIn personalized URL swap** (post-v1.0 backlog, carried from Plan 07-01): Update `IMDB_URL` and `LINKEDIN_URL` literals in BOTH `src/lib/components/ContactBlock.svelte` AND `src/routes/about/+page.svelte` when materializable.

## Next Phase Readiness

- All metadata the public site needs in its `<head>` is now wired and prerendered.
- `build/sitemap.xml` is ready for Plan 07-05's `robots.txt` `Sitemap:` directive.
- The `<meta name="robots" content="noindex, nofollow">` is INTENTIONALLY preserved in `+layout.svelte` — Plan 07-05 removes it as the last commit before DNS swap per D-16 atomic flip.
- Plan 07-02 unblocks Plans 07-03 (Lighthouse perf) and 07-04 (responsive QA), which run in parallel (Wave 3).
- No regressions: pnpm check passes (463 files, 0 errors), pnpm test passes (168/168), pnpm build exits 0, `node scripts/test-prerender-coverage.mjs` exits 0.

## Self-Check

Verifying all SUMMARY claims against disk state...

- File `src/routes/sitemap.xml/+server.ts`: FOUND
- File `src/routes/+page.svelte`: FOUND (D-13 title + D-14 description)
- File `src/routes/work/+page.svelte`: FOUND
- File `src/routes/work/[category]/+page.svelte`: FOUND
- File `src/routes/watch/[id]/+page.svelte`: FOUND (JSON-LD verified in 56 prerendered files)
- File `src/routes/pbs-american-portrait/+page.svelte`: FOUND
- File `src/routes/press/+page.svelte`: FOUND
- File `src/routes/about/+page.svelte`: FOUND (Person JSON-LD verified in prerendered file)
- File `src/routes/contact/+page.svelte`: FOUND
- File `scripts/test-prerender-coverage.mjs`: FOUND (sitemap + asset assertions added)
- Commit `1b9ce31`: FOUND (Task 1)
- Commit `d661203`: FOUND (Task 2)
- Commit `a4eb986`: FOUND (Task 4)
- Commit `51c70ff`: FOUND (Task 5)
- Commit `511e06e`: FOUND (Task 6)
- Commit `cd053ac`: FOUND (Task 7)
- Build artifacts: `build/sitemap.xml` (70 URLs) + 7 favicon/og-image assets in `build/` — all PRESENT (verified via `node scripts/test-prerender-coverage.mjs` PASS)

## Self-Check: PASSED

---
*Phase: 07-polish-production-cutover*
*Completed: 2026-05-16*
