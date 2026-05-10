# Phase 2: Data Layer - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Lock the video data contract. Every record on the site is loaded from a single repo-checked `videos.json`, validated against a TypeScript schema at build time (build fails on schema violations), with categories drawn from a closed canonical list. A typed loader exposed via `$lib` makes the validated array available to all routes with zero runtime fetch.

In scope:
- TypeScript types for `Video` and `Category`
- Schema with build-time validation (intentional bad record fails the build)
- Closed canonical category list — free-text categories rejected
- Canonical `videos.json` authored from `_prep/03-videos-seed.json`
- Typed loader exposed via `$lib`
- A top-level `producerReelId` constant identifying the PLAY REEL CTA target

Out of scope (other phases):
- VideoCard component, grid, filter UI, watch route — Phase 3
- Featured grid curation + hero composition — Phase 4
- PBS landing copy + page — Phase 5
- Press / About / Contact / footer — Phase 6
- Perf budget, blur-up tuning, custom domain — Phase 7

</domain>

<decisions>
## Implementation Decisions

### Category taxonomy (DATA-04)
- **D-01:** Closed canonical list of **8 categories**, exactly as proposed in `_prep/04-categories.md`:
  `PBS American Portrait`, `Promos & Trailers`, `Branded Content`, `Documentary / Short Film`, `Reel`, `Personal / Tribute`, `Educational / Nonprofit`, `Other`. The `Other` bucket stays as a real category in v1 (3 videos: Whoopi Presents Moms Mabley, It's Raining May!!, Celebrate Bobby).
- **D-02:** **Single category per video** (no multi-tag, no primary+secondary). Matches YouTube-style click-to-filter mental model and keeps `/work/[category]` URL semantics unambiguous.
- **D-03:** **Slugs auto-derived from category name via kebab-case** in the schema (one place). `'PBS American Portrait'` → `'pbs-american-portrait'`, `'Documentary / Short Film'` → `'documentary-short-film'` (slashes/spaces collapsed to single hyphens). No manual slug field per video.
- **D-04:** **Display order = video count descending**, computed from the validated dataset. Initial v1 order: PBS American Portrait (18) → Promos & Trailers (12) → Branded Content (8) → Documentary / Short Film (5) → Reel (4) → Personal / Tribute (3) → Educational / Nonprofit (3) → Other (3). Ties broken alphabetically. Loader exposes `getCategoriesInDisplayOrder()`.

### Field requirements + gaps
- **D-05:** **Required fields** on every video: `source` (`'youtube' | 'vimeo'`), `id` (string), `title` (non-empty string), `uploader` (string), `thumbnail` (URL string), `embed` (URL string), `category` (one of D-01), `published` (ISO date string `YYYY-MM-DD`).
- **D-06:** **Optional fields**: `duration_seconds` (number, 14 of 56 missing — all YouTube), `description` (string, 23 of 56 missing/empty). UI hides duration badges + description blocks when these are absent. No backfill in this phase.
- **D-07:** **Date format is `'YYYY-MM-DD'` ISO date string**, matching the seed. Stored as string; helpers in `$lib/data` may cast to `Date` for sorting. Never serialize a `Date` object into the JSON.
- **D-08:** **Schema additions beyond DATA-02** (all optional, schema-forward for later phases):
  - `featured: boolean` (default `false`) — marks videos for the Phase 4 featured grid; multiple allowed.
  - `hidden: boolean` (default `false`) — soft-hide a video from all public surfaces; loader filters it out everywhere (grid, filters, rails, counts).
  - `credits: { director?, producer?, agency?, dop? }` (optional object, all subfields optional) — for future `/watch/[id]` crew display; populated as authored, not required.
  - `tags: string[]` (optional, default `[]`) — free-text secondary tags for v2-style facets; ignored by v1 UI.

### Reel + featured marker
- **D-09:** **Producer's reel identified by a top-level constant**: `producerReelId = '264677021'` (Vimeo) — exported from `$lib/data` next to the videos array. Phase 4's PLAY REEL CTA reads this const directly. Zero ambiguity, zero risk of multiple matches.
- **D-10:** **`featured: boolean` allows multiple `true`** rows. The featured grid in Phase 4 will render the set; Phase 2 ships the field but **leaves all rows `false`** in v1 `videos.json`. Curation happens when Phase 4 lands.
- **D-11:** **Producer's reel video stays in the public `/work` grid and the `Reel` filter** alongside Motion Graphics Reel, Fannie Mae Sizzle Reel, and Indigenous_Reel. Loader exposes it both via `producerReelId` AND in the regular videos array.

### Hidden / private videos
- **D-12:** **No videos are hidden in v1.** All 56 publish. The Personal / Tribute category and Memorial Sloan Kettering patient story are intentional public work.
- **D-13:** **Mechanism stays in the schema for future flexibility**: `hidden: boolean`, default `false` (omittable on every row). To hide a video later, add `"hidden": true` to its record. The default loader array filters out `hidden: true`; an opt-in helper (e.g., `getAllVideosIncludingHidden()`) exposes the full set if a tool ever needs it.
- **D-14:** **Hidden videos are excluded from every public surface** — `/work` grid, category filters, `/watch/[id]` "more in this category" rails, category counts (so a hidden PBS video doesn't inflate the "PBS (18)" chip).

### Validation hook (build behavior)
- **D-15:** **Schema violations fail the build** (validates DATA-03 success criterion). Intentionally breaking a record (unknown category, missing required field, non-ISO date) must produce a non-zero exit and a readable error pointing at the bad row.

### Claude's Discretion
- **Validation library**: Zod is the obvious default (universal community knowledge, dev-only since data is prerendered → no runtime bundle cost). Planner may pick Valibot or arktype if it has a concrete reason; otherwise Zod.
- **Where the validation hook lives**: SvelteKit `+layout.ts` `load` (with `prerender = true` already set) vs. a separate `prebuild` npm script vs. a Vite plugin `buildStart`. Planner picks based on which gives the cleanest error output.
- **Loader API surface**: helper names and exact shape (`getVideos()`, `getById()`, `getByCategory(slug)`, `getCategoriesWithCounts()`, etc.) — planner designs from the decisions above.
- **Schema error formatting**: how the build prints the violation (Zod's `format()` output, custom pretty-printer, etc.).
- **Whether categories live in a separate `src/lib/data/categories.ts`** or inline in the schema module.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 2 requirements + success criteria
- `.planning/REQUIREMENTS.md` §Data — DATA-01 (56 videos load from `videos.json`), DATA-02 (per-record fields), DATA-03 (build-time schema validation, build fails on violation), DATA-04 (closed canonical category list)
- `.planning/ROADMAP.md` §Phase 2: Data Layer — goal, four success criteria, three seed plans (02-01 types/schema, 02-02 author videos.json, 02-03 validation hook + loader)

### Project-wide context
- `.planning/PROJECT.md` — locked stack, key decisions, "videos.json in repo as source of truth"
- `.planning/REQUIREMENTS.md` §Out of Scope — explicit non-goals (no CMS, no hover autoplay, no contact form) so Phase 2 doesn't accidentally pull them in

### Source data + taxonomy
- `_prep/03-videos-seed.json` — 56 deduped videos (42 Vimeo + 14 YouTube), canonical input for Phase 2's `videos.json`
- `_prep/04-categories.md` — proposed 8-category taxonomy + decision rationale; D-01 through D-04 above lock this list as canonical
- `_prep/00-KICKOFF.md` — original kickoff, framing, design references
- `_prep/05-decisions-needed.md` — full inventory of gray areas; Phase 2 resolves items 5 (JSON-in-repo data source — already locked), 6 (single category vs. multi-tag — D-02), 7 (featured flag — D-08, D-10)

### Prior phase context (carry-forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 stack decisions: Svelte 5 runes, TS strict + `noUncheckedIndexedAccess` + `noImplicitOverride` (the loader's `getById()` will return `Video | undefined` because of `noUncheckedIndexedAccess`), `adapter-static` + prerender (Phase 2 data is build-time only), minimal `src/lib/` (Phase 2 creates `src/lib/data/`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None yet for data** — `src/lib/index.ts` is the empty stub from Phase 1. Phase 2 creates `src/lib/data/` from scratch.

### Established Patterns
- **`src/routes/+layout.ts`** sets `export const prerender = true;` — every route is statically prerendered, so all `videos.json` access happens at build time. No runtime fetch ever needed.
- **`adapter-static`** (`svelte.config.js`) emits a pure SSG build; the validation library is dev-only and its bundle size does not affect the runtime.
- **TS config flags from Phase 1** — `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. The loader's `videos[id]`-style lookups must handle `undefined`; `getById()` returns `Video | undefined` and callers must narrow.
- **pnpm@11.0.9 + Node 22** — any new dependency added in Phase 2 must be installed via pnpm and pinned exact (no caret/tilde) per Phase 1's exec convention.
- **lint-staged + husky** — schema modules + JSON live under the same Prettier/ESLint pre-commit pipeline. Large `videos.json` may need a `.prettierignore` entry if formatting churn becomes noisy (planner's call).

### Integration Points
- **`$lib` import alias** — Phase 2's loader exports live under `$lib/data` (e.g., `import { videos, producerReelId, getByCategory } from '$lib/data'`). This is the contract every later phase consumes.
- **Build pipeline** — the validation hook plugs into either SvelteKit's prerender lifecycle or `pnpm build`'s prebuild step. Either way, `pnpm build` must exit non-zero on a schema violation (DATA-03).
- **GitHub Pages deploy workflow (Phase 1)** — runs `pnpm install && pnpm build`. A failing schema validation already fails the deploy automatically — no extra CI wiring needed.

</code_context>

<specifics>
## Specific Ideas

- **Producer's Reel = Vimeo `264677021`** ("Michelle Ngo Producer's Reel", 52s, 2018-04-13). This is THE PLAY REEL CTA target.
- **PBS American Portrait is the flagship** — 18 of 56 videos, explicit dedicated landing page in Phase 5. The category-display-order rule (count descending, D-04) naturally puts it first in nav, which the user wants.
- **Schema must be strict enough to catch a typo'd category**: e.g., changing `"PBS American Portrait"` to `"PBS American Portraits"` in any row must fail the build. This is the canonical test for DATA-04.
- The seed already uses ISO date strings (`"2018-04-13"`) — Phase 2 mirrors that convention exactly.

</specifics>

<deferred>
## Deferred Ideas

- **Backfilling missing `duration_seconds` for the 14 YouTube videos** — could query YouTube oEmbed or Data API in a future phase; not needed for v1 since UI degrades gracefully (D-06).
- **Backfilling `description` for the 23 missing rows** — Michelle could author copy in a future content pass; UI degrades gracefully now.
- **Curating the `featured: true` set** — happens in Phase 4 when the home-page hero design is in front of you. Phase 2 ships the schema field with all rows `false`.
- **Crew/credits surfacing on `/watch/[id]`** — schema field added now (D-08), but no UI surface in v1; revisit in Phase 3 or as a v2 polish item.
- **Free-text `tags` consumption** — schema accepts the field but v1 UI ignores it. v2 facet/search work would consume it.
- **Hidden-video opt-in helper** — `getAllVideosIncludingHidden()` only needed if a future tool (sitemap, internal admin) wants the full set. Skip until there's a caller.
- **Migrating `videos.json` to a CMS (Sanity/Airtable)** — already in Out of Scope; revisit only if posting cadence grows.

</deferred>

---

*Phase: 02-data-layer*
*Context gathered: 2026-05-10*
