# Phase 2: Data Layer - Research

**Researched:** 2026-05-10
**Domain:** TypeScript schema validation + canonical JSON authoring + SvelteKit `$lib` typed loader for a 100% prerendered (adapter-static) site
**Confidence:** HIGH (every load-bearing claim verified against npm registry + Zod 4 official docs + SvelteKit 2 official docs + the project's own Phase 1 RESEARCH.md)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Category taxonomy (DATA-04)**
- **D-01:** Closed canonical list of **8 categories**, exactly as proposed in `_prep/04-categories.md`: `PBS American Portrait`, `Promos & Trailers`, `Branded Content`, `Documentary / Short Film`, `Reel`, `Personal / Tribute`, `Educational / Nonprofit`, `Other`. The `Other` bucket stays as a real category in v1 (3 videos: Whoopi Presents Moms Mabley, It's Raining May!!, Celebrate Bobby).
- **D-02:** **Single category per video** (no multi-tag, no primary+secondary). Matches YouTube-style click-to-filter mental model and keeps `/work/[category]` URL semantics unambiguous.
- **D-03:** **Slugs auto-derived from category name via kebab-case** in the schema (one place). `'PBS American Portrait'` → `'pbs-american-portrait'`, `'Documentary / Short Film'` → `'documentary-short-film'` (slashes/spaces collapsed to single hyphens). No manual slug field per video.
- **D-04:** **Display order = video count descending**, computed from the validated dataset. Initial v1 order: PBS American Portrait (18) → Promos & Trailers (12) → Branded Content (8) → Documentary / Short Film (5) → Reel (4) → Personal / Tribute (3) → Educational / Nonprofit (3) → Other (3). Ties broken alphabetically. Loader exposes `getCategoriesInDisplayOrder()`.

**Field requirements + gaps**
- **D-05:** **Required fields** on every video: `source` (`'youtube' | 'vimeo'`), `id` (string), `title` (non-empty string), `uploader` (string), `thumbnail` (URL string), `embed` (URL string), `category` (one of D-01), `published` (ISO date string `YYYY-MM-DD`).
- **D-06:** **Optional fields**: `duration_seconds` (number, 14 of 56 missing — all YouTube), `description` (string, 23 of 56 missing/empty). UI hides duration badges + description blocks when these are absent. No backfill in this phase.
- **D-07:** **Date format is `'YYYY-MM-DD'` ISO date string**, matching the seed. Stored as string; helpers in `$lib/data` may cast to `Date` for sorting. Never serialize a `Date` object into the JSON.
- **D-08:** **Schema additions beyond DATA-02** (all optional, schema-forward for later phases):
  - `featured: boolean` (default `false`) — marks videos for the Phase 4 featured grid; multiple allowed.
  - `hidden: boolean` (default `false`) — soft-hide a video from all public surfaces; loader filters it out everywhere (grid, filters, rails, counts).
  - `credits: { director?, producer?, agency?, dop? }` (optional object, all subfields optional) — for future `/watch/[id]` crew display; populated as authored, not required.
  - `tags: string[]` (optional, default `[]`) — free-text secondary tags for v2-style facets; ignored by v1 UI.

**Reel + featured marker**
- **D-09:** **Producer's reel identified by a top-level constant**: `producerReelId = '264677021'` (Vimeo) — exported from `$lib/data` next to the videos array. Phase 4's PLAY REEL CTA reads this const directly.
- **D-10:** **`featured: boolean` allows multiple `true`** rows. Phase 2 ships the field but **leaves all rows `false`** in v1 `videos.json`. Curation happens when Phase 4 lands.
- **D-11:** **Producer's reel video stays in the public `/work` grid and the `Reel` filter**. Loader exposes it both via `producerReelId` AND in the regular videos array.

**Hidden / private videos**
- **D-12:** **No videos are hidden in v1.** All 56 publish.
- **D-13:** **Mechanism stays in the schema for future flexibility**: `hidden: boolean`, default `false` (omittable on every row).
- **D-14:** **Hidden videos are excluded from every public surface** — grid, filters, rails, category counts.

**Validation hook (build behavior)**
- **D-15:** **Schema violations fail the build** (validates DATA-03 success criterion). Intentionally breaking a record (unknown category, missing required field, non-ISO date) must produce a non-zero exit and a readable error pointing at the bad row.

### Claude's Discretion
- **Validation library**: Zod is the obvious default (universal community knowledge, dev-only since data is prerendered → no runtime bundle cost). Planner may pick Valibot or arktype if it has a concrete reason; otherwise Zod.
- **Where the validation hook lives**: SvelteKit `+layout.ts` `load` (with `prerender = true` already set) vs. a separate `prebuild` npm script vs. a Vite plugin `buildStart`.
- **Loader API surface**: helper names and exact shape (`getVideos()`, `getById()`, `getByCategory(slug)`, `getCategoriesWithCounts()`, etc.).
- **Schema error formatting**: how the build prints the violation (`z.prettifyError()` output, custom pretty-printer, etc.).
- **Whether categories live in a separate `src/lib/data/categories.ts`** or inline in the schema module.

### Deferred Ideas (OUT OF SCOPE)
- Backfilling missing `duration_seconds` for the 14 YouTube videos (UI degrades gracefully).
- Backfilling `description` for the 23 missing rows.
- Curating the `featured: true` set (Phase 4).
- Crew/credits surfacing on `/watch/[id]` (schema field added now, no UI).
- Free-text `tags` consumption (v2).
- `getAllVideosIncludingHidden()` helper (only when a caller exists).
- Migrating `videos.json` to a CMS (already Out of Scope).
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Site renders 56 videos sourced from `videos.json` checked into the repo | `videos.json` authored from `_prep/03-videos-seed.json` (56 rows verified); imported via Vite's first-class JSON support; loader exposed via `$lib/data` |
| DATA-02 | Each video record exposes source, id, title, uploader, thumbnail, embed, category, duration, published, description | Zod `z.discriminatedUnion('source', [...])` for source-specific fields; `z.iso.date()` for `published`; required vs optional split documented in schema patterns below |
| DATA-03 | Video data validates against a TypeScript schema at build time; build fails on schema violations | Vite plugin `buildStart` hook is the canonical place — runs before any bundling, throwing in it produces a non-zero exit. Backup pattern: `+layout.ts` load throws via SvelteKit's `error()` helper during prerender, which also fails the build |
| DATA-04 | Categories accepted by the schema are the closed canonical list from `_prep/04-categories.md` — free-text rejected | `z.enum(CATEGORIES as const)` rejects any string outside the 8-item list; single source of truth via `categories.ts` `as const` export |
</phase_requirements>

---

## Summary

This phase has **no exotic risk**. Every piece is mainstream and well-documented. The five decisions the planner needs to lock are: (1) Zod 4 vs. Valibot — Zod wins on prescriptive grounds because the bundle is dev-only on a prerendered site, and Zod 4's `z.iso.date()`, `z.url()`, `z.discriminatedUnion()`, and `z.prettifyError()` give us exactly the primitives the schema needs with zero hand-rolling; (2) where validation runs — a Vite plugin `buildStart` hook is the cleanest place because it runs **before** any module evaluation and any throw produces a clean non-zero `pnpm build` exit; (3) how the data flows to routes — `import videos from '$lib/data/videos.json'` is the canonical Vite pattern, but we wrap it in a single `parse()` call in `$lib/data/index.ts` so callers always get the typed/branded result; (4) how the canonical category list stays single-sourced — a `CATEGORIES` `as const` array in `$lib/data/categories.ts` is the source of truth, the schema's `z.enum()` reads it directly, and a derived `Category` type flows everywhere; (5) the slug helper — a tiny pure function in `categories.ts` (kebab-case, slash-collapse) memoized at module load.

The single non-obvious finding is that **on a fully-prerendered SvelteKit site, the validation library bundle size literally does not matter for production — `adapter-static` strips the entire server runtime** (Phase 1 RESEARCH.md confirms zero JS sent to client beyond the Svelte component bundles). Zod 4's "47x faster than Zod 3" claim and Valibot's "95% smaller bundle" claim are both irrelevant here. We pick on DX, not on bundle weight. Zod's universal community knowledge wins.

The single thing that **will bite if missed** is that `noUncheckedIndexedAccess` (locked in Phase 1) means `getById(id)` returns `Video | undefined` and **every caller in Phase 3+ must narrow**. Document this in the loader's JSDoc and add a smoke test that proves the type signature is right.

**Primary recommendation:** Use Zod 4 (`zod@4.4.3`) + a tiny custom Vite plugin (`vite-plugin-validate-videos.ts`) that runs in `buildStart` and calls `VideoArraySchema.parse(...)` on the JSON, throwing with `z.prettifyError()` output on failure. Author `videos.json` from `_prep/03-videos-seed.json` with a one-shot pure-TypeScript node script (no extra deps). Expose the typed array via `$lib/data` with `videos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, and `getCategoriesWithCounts`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zod | 4.4.3 | Schema validation + TypeScript inference | Universal community standard; v4 is current stable (published 2026-05-04); `z.iso.date()`, `z.url()`, `z.discriminatedUnion()`, `z.prettifyError()` cover every primitive this schema needs without hand-rolling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 4.1.5 | Test runner for the validation suite | Required to prove DATA-03 (build fails on bad data) and DATA-04 (unknown category rejected) — added in Wave 0 if not present |
| @vitest/coverage-v8 | 4.1.5 | Coverage reporting | Optional; only if the planner wants it for the schema test suite |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod 4 (full) | `zod/mini` | 85% smaller bundle but functional API has steeper DX cost; **irrelevant** on a prerendered site where validation bundle never ships to client |
| Zod 4 | Valibot 1.4.0 | Valibot has true tree-shakable modular API and ~95% smaller minified bundle; same API maturity since v1; **same caveat** — no client bundle cost on prerendered site, so zero practical advantage. Zod's larger ecosystem (community examples, error-formatting prior art) wins |
| Zod 4 | ArkType 2.2.0 | TS-syntax-as-runtime-types is elegant, but smaller community + this schema has zero shape complexity that benefits from ArkType's syntax sugar |
| Vite plugin `buildStart` | `prebuild` npm script (`"prebuild": "tsx scripts/validate.ts"`) | Equally valid; `prebuild` runs before `pnpm build` automatically. Tradeoff: needs `tsx` or `vite-node` to run TypeScript; plugin avoids that dep |
| Vite plugin `buildStart` | `+layout.ts` `load` throwing during prerender | Works (load runs at build time when prerender=true), but error output is wrapped in SvelteKit's prerender error reporter — less clean than a plugin |
| `import videos from '...json'` | `$lib/data/videos.ts` exporting `JSON.parse(jsonStringLiteral)` | Vite handles JSON natively with named-export tree-shaking; no reason to bypass it |

**Installation:**
```bash
pnpm add -D -E zod
pnpm add -D -E vitest @vitest/coverage-v8   # if not already present
# OR scaffold via the SvelteKit CLI:
pnpm dlx sv add vitest                       # adds vitest + config + sample test
```

**Version verification (verified 2026-05-10):**
- `zod@4.4.3` — `pnpm view zod version` → `4.4.3` (published 2026-05-04T18:06:03Z, six days old, stable)
- `valibot@1.4.0` — `pnpm view valibot version` → `1.4.0` (published 2026-05-05; for record only, not selected)
- `arktype@2.2.0` — `pnpm view arktype version` → `2.2.0` (for record only, not selected)
- `vitest@4.1.5` — `pnpm view vitest version` → `4.1.5` (current)

**Phase 1 pinning convention applies:** install with `-E` (no caret/tilde), per Phase 1 STATE decision.

---

## Architecture Patterns

### Recommended Project Structure
```
src/lib/
├── data/
│   ├── index.ts             # Public API: re-exports + loader helpers (the $lib/data surface)
│   ├── categories.ts        # CATEGORIES as const (single source of truth) + Category type + slug helpers
│   ├── schema.ts            # Zod schemas (CategorySchema, VideoSchema, VideoArraySchema)
│   ├── videos.ts            # Pure-TS loader: imports videos.json, runs VideoArraySchema.parse(), exports typed array
│   ├── videos.json          # Canonical 56-video data file (committed to git)
│   └── videos.json.test.ts  # Schema tests + author-mistake fixtures (proves DATA-03/04)
└── index.ts                 # Existing Phase 1 stub — re-export $lib/data surface here, OR leave it; planner decides

scripts/
└── seed-to-videos.ts        # One-shot tool that reads _prep/03-videos-seed.json, writes src/lib/data/videos.json
                             # Run once during plan 02-02; can be deleted after, or kept for re-runs

vite.config.ts               # Adds custom plugin: validateVideosPlugin()
src/routes/+layout.ts        # Already has `export const prerender = true;` (no change needed)
```

**Two paths the planner can pick between:**
- **Path A (recommended):** Validation lives in a Vite plugin. Loader (`videos.ts`) is a tiny `parse()` wrapper. Tests cover both the schema and the loader.
- **Path B:** Validation is inline in `videos.ts` at module-evaluation time, called once. SvelteKit's prerender pulls `videos.ts` via the route layer, which causes the parse to run. A throw from there fails the prerender → fails the build.

Path A is cleaner (fail-fast, before any bundle work, error printed cleanly to terminal). Path B has fewer moving parts (no plugin) but couples validation timing to the prerender lifecycle.

### Pattern 1: Single source of truth for categories

```typescript
// src/lib/data/categories.ts
// Source: D-01, D-03 (CONTEXT.md)

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

export type Category = (typeof CATEGORIES)[number];

/** Auto-derived kebab-case slug. Single rule: lowercase, [^a-z0-9]+ → '-', trim '-'. */
export function categoryToSlug(category: Category): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Build the slug → category lookup once at module load (memoized).
const SLUG_TO_CATEGORY: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [categoryToSlug(c), c]),
);

export function slugToCategory(slug: string): Category | undefined {
  return SLUG_TO_CATEGORY[slug];
}
```

**Why this works:** The `CATEGORIES` array is the only place the literal strings appear. Zod's `z.enum(CATEGORIES)` reads it directly. The `Category` TS type is derived. The slug rule lives in one function. Adding a category = one-line edit to the array.

### Pattern 2: Zod schema with discriminated union

```typescript
// src/lib/data/schema.ts
// Source: zod.dev/api (Zod 4 official docs)

import { z } from 'zod';
import { CATEGORIES } from './categories';

export const CategorySchema = z.enum(CATEGORIES);

const CommonFields = {
  id: z.string().min(1),
  title: z.string().min(1, 'title must not be empty'),
  uploader: z.string().min(1),
  published: z.iso.date(), // strict YYYY-MM-DD per Zod 4 docs
  thumbnail: z.url(),
  embed: z.url(),
  url: z.url().optional(), // present in seed but not load-bearing for the site; allow for round-trip
  category: CategorySchema,
  description: z.string().optional(),
  duration_seconds: z.number().int().positive().optional(),
  // Schema-forward additions per D-08
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  credits: z
    .object({
      director: z.string().optional(),
      producer: z.string().optional(),
      agency: z.string().optional(),
      dop: z.string().optional(),
    })
    .optional(),
};

export const VideoSchema = z.discriminatedUnion('source', [
  z.strictObject({ source: z.literal('youtube'), ...CommonFields }),
  z.strictObject({ source: z.literal('vimeo'), ...CommonFields }),
]);

export const VideoArraySchema = z.array(VideoSchema);

export type Video = z.infer<typeof VideoSchema>;
```

**Why `z.strictObject`:** rejects unknown keys (a typo'd field name fails the build instead of being silently dropped). Confirmed by Zod 4 official docs: `z.object()` strips unknown keys; `z.strictObject()` rejects them.

**Why `z.discriminatedUnion`:** future-proofs for the case where YouTube and Vimeo records diverge (e.g., YouTube might one day have a `playlist_id`). Right now both branches are identical so `z.strictObject({ source: z.enum(['youtube','vimeo']), ...CommonFields })` would also work — planner's call. Discriminated union is the more idiomatic Zod pattern and gives narrower types at the call site.

**Why `z.iso.date()` not `z.string().regex(/.../)`:** Zod 4 ships a built-in for `'YYYY-MM-DD'` that handles zero-padding correctly. Quoted from zod.dev/api: *"validates the strict format YYYY-MM-DD with zero-padding requirements."* Verified seed data already uses this format.

### Pattern 3: Vite plugin that fails the build

```typescript
// vite.config.ts (or vite-plugin-validate-videos.ts imported into vite.config.ts)
// Source: vite.dev/guide/api-plugin (buildStart hook), Phase 1 RESEARCH.md (vite.config.ts already exists)

import type { Plugin } from 'vite';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { VideoArraySchema } from './src/lib/data/schema';

function validateVideosPlugin(): Plugin {
  return {
    name: 'validate-videos',
    // buildStart fires once at the start of bundling for `vite build`,
    // and once on server start for `vite dev`. Throwing here aborts both.
    buildStart() {
      const path = resolve(__dirname, 'src/lib/data/videos.json');
      const raw = JSON.parse(readFileSync(path, 'utf-8'));
      const result = VideoArraySchema.safeParse(raw);
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        // this.error() includes Vite's plugin-context info (file/loc) and
        // produces a non-zero exit. throw new Error(pretty) also works.
        this.error(`videos.json failed schema validation:\n${pretty}`);
      }
      // Optional: also enforce uniqueness of (source, id) here — not in the
      // per-row schema, since cross-row checks aren't single-record.
      const seen = new Set<string>();
      for (const v of result.data) {
        const key = `${v.source}:${v.id}`;
        if (seen.has(key)) this.error(`duplicate video: ${key}`);
        seen.add(key);
      }
    },
  };
}
```

**Why this fails the build cleanly:** `this.error()` (a Rollup/Vite plugin-context method, available in `buildStart`) terminates the build with a non-zero exit code and a formatted error. Verified: Vite's plugin API page documents `buildStart` as a Rollup-compatible hook; Rollup's plugin docs (which Vite inherits) specify `this.error()` as the canonical fail-the-build call.

**Why `z.prettifyError()`:** Zod 4 docs (zod.dev) confirm: *"`z.prettifyError` function for converting a `ZodError` to a user-friendly formatted string."* Output looks like: `✖ Invalid input: expected one of [...] · at [3].category`. Pointing the author at the bad row by index is exactly what we need for DATA-03's "readable error pointing at the bad row" criterion.

### Pattern 4: Typed loader exposed via `$lib`

```typescript
// src/lib/data/videos.ts
// Source: vite.dev/guide/features.html (JSON imports work natively)

import rawVideos from './videos.json';
import { VideoArraySchema, type Video } from './schema';
import { CATEGORIES, type Category, categoryToSlug } from './categories';

// Validate at module-evaluation time. The Vite plugin already validated this
// file at buildStart, so this parse() should never throw in production.
// We do it again here so the runtime types reflect the parsed (default-applied)
// shape, not the raw JSON shape (e.g., featured/hidden booleans, tags array).
const _parsed = VideoArraySchema.parse(rawVideos);

// All public videos (hidden filtered out per D-14)
export const videos: readonly Video[] = _parsed.filter((v) => !v.hidden);

// All videos including hidden — kept for future internal tooling (deferred)
// Not exported from $lib/data/index.ts in v1; no caller needs it.
export const allVideos: readonly Video[] = _parsed;

// D-09: producer's reel
export const producerReelId = '264677021' as const;

// Helpers — see `index.ts` for the public surface
export function getById(id: string): Video | undefined {
  // noUncheckedIndexedAccess + .find() is fine, returns Video | undefined
  return videos.find((v) => v.id === id);
}

export function getByCategory(category: Category): readonly Video[] {
  return videos.filter((v) => v.category === category);
}

/**
 * Returns categories sorted by descending video count, ties broken alphabetically.
 * Per D-04. Computed once at module load.
 */
const _categoriesInDisplayOrder: readonly Category[] = (() => {
  const counts = new Map<Category, number>();
  for (const c of CATEGORIES) counts.set(c, 0);
  for (const v of videos) counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
  return [...CATEGORIES].sort((a, b) => {
    const diff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
})();

export function getCategoriesInDisplayOrder(): readonly Category[] {
  return _categoriesInDisplayOrder;
}

export function getCategoriesWithCounts(): ReadonlyArray<{
  category: Category;
  slug: string;
  count: number;
}> {
  return _categoriesInDisplayOrder.map((category) => ({
    category,
    slug: categoryToSlug(category),
    count: videos.filter((v) => v.category === category).length,
  }));
}
```

```typescript
// src/lib/data/index.ts — the $lib/data public surface
export type { Video } from './schema';
export type { Category } from './categories';
export {
  CATEGORIES,
  categoryToSlug,
  slugToCategory,
} from './categories';
export {
  videos,
  producerReelId,
  getById,
  getByCategory,
  getCategoriesInDisplayOrder,
  getCategoriesWithCounts,
} from './videos';
```

**Why this gives the smallest client bundle:** The full Zod library is imported by `videos.ts`, but **`adapter-static` produces a static SSG output** (Phase 1 D-06). When SvelteKit prerenders every route at build time, the parsed `videos` array is materialized into the prerendered HTML/JS as a constant, and Zod's runtime is never shipped to the client. Verified by Phase 1 CONTEXT.md: *"all `videos.json` access happens at build time. No runtime fetch ever needed."* and svelte.dev/docs/kit/load: *"A `load` function is invoked at runtime, unless you prerender the page — in that case, it's invoked at build time."*

**Why call `.parse()` again in the loader:** Zod's `.default(false)` and `.default([])` only apply during a parse — not on a raw JSON import. The plugin already validated; calling parse here gives us the post-defaults shape so `featured`/`hidden`/`tags` are guaranteed present in the runtime types.

### Anti-Patterns to Avoid

- **Anti-pattern: separate `slug` field on each video record.** Drift waiting to happen. D-03 mandates auto-derivation; one rule, one place.
- **Anti-pattern: storing `published` as a `Date`-serializable timestamp.** D-07 says ISO date string, period. JSON can't natively round-trip `Date`.
- **Anti-pattern: importing `zod` in a Svelte component.** It works, but defeats the "no runtime fetch / minimal client bundle" intent. Validation is build-time only. Components consume the typed `Video[]` array, not the schema.
- **Anti-pattern: hand-rolling a category-typo regex test.** Zod's `z.enum()` does this with better error messages and full type narrowing.
- **Anti-pattern: writing `videos.json` from a YouTube/Vimeo API at build time.** Out of Scope per CONTEXT.md `<deferred>` and STATE — `videos.json` is the source of truth; backfill is deferred.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Validate 56 records against a closed schema with readable errors | A custom `validate(record)` function with manual `if`s | Zod 4 `safeParse` + `z.prettifyError()` | Hand-rolled validators miss edge cases (empty strings, nested objects, default values, discriminated unions); Zod's error messages already include path + expected/got |
| Reject unknown category strings | A custom `if (!CATEGORIES.includes(s))` check | `z.enum(CATEGORIES)` | Zod handles the `as const` inference, gives narrowed types downstream, and prints the allowed list in the error |
| Validate ISO date strings | `if (!/^\d{4}-\d{2}-\d{2}$/.test(s))` | `z.iso.date()` | Built-in handles zero-padding rules and gives consistent error format |
| Validate URL strings | Custom URL regex | `z.url()` | Zod uses `new URL()` internally; handles edge cases; consistent error format |
| Format Zod errors for the build log | Custom error walker over `result.error.issues` | `z.prettifyError(result.error)` | Zod ships this; quoted from zod.dev: *"converts a ZodError to a user-friendly formatted string"* |
| Run validation before bundle | A `prebuild` shell script that calls `node -e "..."` | A Vite plugin `buildStart` hook with `this.error()` | Plugin runs in the same Node context as the build, can directly import the schema TS module, fails cleanly with proper exit code, no extra `tsx`/`ts-node` dep |
| Derive a slug from a category name | Per-video `"slug": "..."` field | `categoryToSlug(category)` pure function called wherever needed | Drift between `category` and `slug` becomes impossible — there's only one rule |
| Compute display order from counts | Hand-curated `DISPLAY_ORDER = [...]` array | `getCategoriesInDisplayOrder()` derived from validated data | Eliminates a second source of truth that has to be kept in sync as videos are added |
| Test that a typo in a category fails the build | A bash script that mutates the file and runs build | A Vitest test that calls `VideoArraySchema.safeParse(badFixture)` and asserts `.success === false` | Faster feedback loop, no shell, runs in `pnpm check` pipeline |

**Key insight:** Every primitive this phase needs has a Zod helper. The total custom code is the slug function (~5 lines), the count-and-sort for display order (~10 lines), and the loader API surface (~30 lines). Everything else is "configure Zod and let it work."

---

## Runtime State Inventory

> Phase 2 is greenfield (creates new files, no rename/refactor). The five-category inventory still applies because Phase 1 just shipped — there *is* prior runtime state, but it doesn't intersect with anything Phase 2 introduces.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases or persistent stores in this project. `videos.json` IS the data store and it's introduced by this phase. | None |
| Live service config | None affecting Phase 2. (GitHub Pages deploy from Phase 1 just runs `pnpm build`; no env vars or external service config that this phase touches.) | None |
| OS-registered state | None — no scheduled tasks, no installed binaries, no daemons | None |
| Secrets/env vars | None — Phase 2 is fully build-time public data. No API keys (YouTube/Vimeo backfill is deferred). The only env var in the project is `BASE_PATH` (Phase 1, GitHub Pages base) which Phase 2 doesn't touch. | None |
| Build artifacts | The `.svelte-kit/` directory will be regenerated. After adding the Vite plugin, the next `pnpm dev` and `pnpm build` will pick it up automatically — no manual `rm -rf .svelte-kit` needed unless `svelte-kit sync` complains. | None expected; if hot-reload misbehaves, restart `pnpm dev` |

**Net:** No runtime state inventory action items. Phase 2 is additive.

---

## Common Pitfalls

### Pitfall 1: Vite plugin imports a TypeScript file that imports the JSON
**What goes wrong:** `vite.config.ts` imports `./src/lib/data/schema.ts`. If `schema.ts` (or anything it imports) eagerly imports `videos.json`, the plugin's `buildStart` reads the file again and you have two paths to the same data.
**Why it happens:** Co-locating the schema and the loader in the same module.
**How to avoid:** Keep `schema.ts` pure (only Zod schemas + types, no JSON imports). The loader (`videos.ts`) imports the JSON. The plugin imports `schema.ts` only.
**Warning signs:** Build hangs, or "module evaluation order" errors.

### Pitfall 2: `z.object().default()` doesn't apply on raw JSON imports
**What goes wrong:** A consumer reads `video.featured` expecting `false` but gets `undefined` because the field was omitted in JSON and Zod defaults only apply during a `.parse()` call, not on a raw import.
**Why it happens:** Mixing the raw JSON import with the Zod-parsed shape.
**How to avoid:** Always read videos through the loader, never `import videos from '$lib/data/videos.json'` directly from a route. The loader runs `.parse()` so defaults are materialized.
**Warning signs:** TypeScript thinks `featured` is `boolean`, runtime returns `undefined` on rows where the field is omitted.

### Pitfall 3: `noUncheckedIndexedAccess` + array `.find()` returns `Video | undefined`
**What goes wrong:** Phase 3 callers write `videos.find(v => v.id === id).title` — TS error.
**Why it happens:** Phase 1 D-14 locked `noUncheckedIndexedAccess` and the loader correctly types `getById` as `Video | undefined`. Callers must narrow.
**How to avoid:** Document this in the loader's JSDoc with an example. Add a narrowing helper if Phase 3 finds itself writing the same `if (!video) error(404)` over and over (defer until then).
**Warning signs:** Phase 3 PRs dropping `!` non-null assertions everywhere.

### Pitfall 4: Author edits `videos.json` and Prettier reformats it on save
**What goes wrong:** Pre-commit hook reformats the JSON, churn in diffs, larger commits, harder reviews.
**Why it happens:** Phase 1 lint-staged config runs Prettier on `*.json`.
**How to avoid:** Either (a) accept the reformat (Prettier on JSON is stable enough), or (b) add `src/lib/data/videos.json` to `.prettierignore` if churn becomes annoying. CONTEXT.md `<code_context>` already flags this as planner's call.
**Warning signs:** Massive diff on a one-line video edit.

### Pitfall 5: Discriminated union with identical branches confuses readers
**What goes wrong:** YouTube and Vimeo branches have identical fields → reviewers ask "why is this a union?"
**Why it happens:** Future-proofing in a phase where the future hasn't arrived yet.
**How to avoid:** Either (a) use `source: z.enum(['youtube', 'vimeo'])` in a single `strictObject` (simpler, equally type-safe today), or (b) add a code comment explaining the discriminated union is for future per-source field divergence. Planner picks; the simpler approach is fine for v1.
**Warning signs:** Reviewer comments "why discriminated union here?"

### Pitfall 6: `pnpm dev` doesn't re-validate on JSON edit
**What goes wrong:** Author edits `videos.json` while `pnpm dev` is running. The dev server hot-reloads but doesn't re-run the plugin's `buildStart`. Bad data slips through until next `pnpm build`.
**Why it happens:** `buildStart` fires once at server start.
**How to avoid:** Either (a) accept it — the `pnpm build` and CI both fail on bad data, so production is safe; (b) add `configureServer` hook that watches `videos.json` and re-validates on change; (c) call `VideoArraySchema.parse()` inside `videos.ts` (the loader), which runs whenever the loader module is re-evaluated. Path (c) is already in the recommended pattern above and gives reasonable dev-time feedback.
**Warning signs:** Bad data only caught in CI, not during local dev.

### Pitfall 7: SvelteKit auto-crawl misses the data because there's no link to it
**What goes wrong:** Not actually a Phase 2 problem (Phase 2 doesn't add routes that consume the data). Logged for the planner: Phase 3 routes (`/work`, `/work/[category]`, `/watch/[id]`) need their `entries` exports to enumerate all video IDs and category slugs, otherwise `adapter-static` with `strict: true` (Phase 1 setting) will fail the build for un-linked routes.
**Why it happens:** Phase 1 RESEARCH.md flagged this; reproduced here so Phase 2 doesn't accidentally introduce the trap by exposing helpers Phase 3 will rely on.
**How to avoid:** The loader already exposes the data Phase 3 needs (`videos`, `getCategoriesWithCounts`). Phase 3 plans should reference these for `entries`. Not a Phase 2 action item.
**Warning signs:** Phase 3 build fails with "the following routes were not prerendered."

---

## Code Examples

### Example: Building the Vitest test for "unknown category fails"
```typescript
// src/lib/data/videos.json.test.ts
// Source: zod.dev/api (safeParse), vitest.dev (test/expect)

import { describe, expect, it } from 'vitest';
import { VideoArraySchema, VideoSchema } from './schema';
import videos from './videos.json';

describe('videos.json schema', () => {
  it('the canonical videos.json validates', () => {
    const result = VideoArraySchema.safeParse(videos);
    expect(result.success).toBe(true);
  });

  it('contains exactly 56 videos', () => {
    const parsed = VideoArraySchema.parse(videos);
    expect(parsed).toHaveLength(56);
  });

  it('has unique (source, id) pairs', () => {
    const parsed = VideoArraySchema.parse(videos);
    const keys = parsed.map((v) => `${v.source}:${v.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('schema rejects bad data', () => {
  const valid = {
    source: 'vimeo',
    id: '264677021',
    title: 'Producer Reel',
    uploader: 'Michelle Ngo',
    published: '2018-04-13',
    thumbnail: 'https://example.com/t.jpg',
    embed: 'https://player.vimeo.com/video/264677021',
    category: 'Reel',
  };

  it('rejects an unknown category (DATA-04)', () => {
    const bad = { ...valid, category: 'PBS American Portraits' }; // typo'd 's'
    expect(VideoSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a missing required field (DATA-03)', () => {
    const { title: _, ...bad } = valid;
    expect(VideoSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a non-ISO date (DATA-03)', () => {
    const bad = { ...valid, published: '04/13/2018' };
    expect(VideoSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an unknown extra field (strictObject)', () => {
    const bad = { ...valid, evil_extra: true };
    expect(VideoSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an empty title', () => {
    const bad = { ...valid, title: '' };
    expect(VideoSchema.safeParse(bad).success).toBe(false);
  });
});
```

### Example: Smoke test for the loader's display order (D-04)
```typescript
// Source: D-04 (CONTEXT.md)

import { expect, it } from 'vitest';
import { getCategoriesInDisplayOrder } from './videos';

it('first category in display order is PBS American Portrait', () => {
  expect(getCategoriesInDisplayOrder()[0]).toBe('PBS American Portrait');
});
```

### Example: Authoring `videos.json` from the seed
```typescript
// scripts/seed-to-videos.ts — run once via: pnpm dlx tsx scripts/seed-to-videos.ts
// (or add a one-shot npm script; tsx is a lightweight peer dep, NOT pinned)

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const seed = JSON.parse(
  readFileSync(resolve('_prep/03-videos-seed.json'), 'utf-8'),
);

// The seed already matches the schema's required + optional shape, but does
// NOT include featured/hidden/tags/credits. Strip nothing; preserve as-is.
// The schema's defaults will apply during loader-time parse.
const out = seed.videos;

writeFileSync(
  resolve('src/lib/data/videos.json'),
  JSON.stringify(out, null, 2) + '\n',
);
console.log(`Wrote ${out.length} videos`);
```

**Note:** `tsx` is NOT being added as a project dependency. The script runs via `pnpm dlx tsx` (one-shot), or the planner can transcribe the seed manually as a one-time JSON copy if scripting is overkill. The output JSON is then committed and never regenerated unless videos are added.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `z.formatError(result.error)` | `z.treeifyError(result.error)` / `z.prettifyError(result.error)` | Zod 4 (2025+) | `formatError` is deprecated; new APIs give better DX. Verified at zod.dev. |
| `z.object().strict()` | `z.strictObject({...})` | Zod 4 | Functionally equivalent; `strictObject` is the canonical Zod 4 form. |
| `z.string().date()` | `z.iso.date()` | Zod 4 | New `z.iso.*` namespace for ISO format helpers (date, datetime, time, duration). |
| Multi-`z.literal()` `z.union([...])` | `z.literal([200, 201, 204])` (multi-value) or `z.enum([...])` for strings | Zod 4 | Both single-line replacements for the verbose pattern. For string-only enums, `z.enum()` is preferred. |
| `tailwind.config.js` | `@theme` in CSS (Tailwind v4) | Tailwind v4 (2024) | Already locked in Phase 1; for record. |
| `npm create svelte@latest` | `pnpm dlx sv create` | sv CLI (2024+) | Already locked in Phase 1; for record. |

**Deprecated/outdated (do not use):**
- `z.formatError()` — deprecated, use `z.treeifyError()` or `z.prettifyError()`.
- `z.string().email()` — Zod 4 moves email to `z.email()` directly (top-level).
- Zod 3 docs and tutorials referencing `.merge()`, `.passthrough()` defaults — Zod 4 changed several method names. Always check the Zod 4 docs (zod.dev), not Zod 3 tutorials.

---

## Open Questions

1. **Discriminated union vs single object — minor stylistic choice**
   - What we know: Both are type-safe and reject unknown sources. Discriminated union is more idiomatic Zod and gives narrowed types on `if (v.source === 'youtube')` branches.
   - What's unclear: Whether Phase 3+ will ever actually need source-specific narrowing (e.g., a `<YouTubeEmbed>` vs `<VimeoEmbed>` component split).
   - Recommendation: Default to discriminated union. Cost is one extra line; benefit is forward-flexibility.

2. **`videos.json` location: `src/lib/data/videos.json` vs `static/videos.json` vs project root**
   - What we know: `static/` would expose it as a fetchable URL (against the no-runtime-fetch principle); project root would awkwardly sit outside `src/`. `src/lib/data/videos.json` co-locates with the loader and is naturally Vite-imported.
   - Recommendation: `src/lib/data/videos.json`. Matches the `$lib/data` import path users already use.

3. **Run validation in `+layout.ts` instead of a Vite plugin?**
   - What we know: Both work. `+layout.ts` `load` runs at build time when `prerender = true` is set (Phase 1 has this). Throwing from there fails the prerender → fails the build.
   - What's unclear: Error message presentation. SvelteKit wraps prerender errors in its own reporter; a Vite plugin's `this.error()` prints directly to the terminal.
   - Recommendation: Vite plugin for error clarity. Fall back to `+layout.ts` if the planner finds the plugin too heavy.

4. **Should the test suite (Vitest) be added in Wave 0 or skipped?**
   - What we know: Vitest is not currently in the project. Phase 1 deferred testing. Validation Architecture (Nyquist Dim 8) requires automated proof.
   - Recommendation: Add Vitest in Wave 0 of this phase via `pnpm dlx sv add vitest` — small, idiomatic, cheap. The schema test suite exists exactly because DATA-03 demands "build fails on schema violations" be *demonstrated*, not asserted.

5. **`source: 'youtube'` and `source: 'vimeo'` — should `source` itself be a Zod enum extracted to its own constant?**
   - What we know: Currently embedded in the schema literal. Keeping it inline is fine for two known providers.
   - Recommendation: Inline. Fewer indirections. If a third provider ever appears, refactor then.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 (NOT yet installed) |
| Config file | None — install via `pnpm dlx sv add vitest` (creates `vite.config.ts` test block + sample) |
| Quick run command | `pnpm vitest run src/lib/data/` |
| Full suite command | `pnpm vitest run` |
| Build-fails-on-bad-data check | `pnpm build` (the Vite plugin's `buildStart` exits non-zero on schema violation; this is the canonical DATA-03 proof) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| DATA-01 | `videos.json` contains all 56 videos | unit | `pnpm vitest run src/lib/data/videos.json.test.ts -t "exactly 56 videos"` | Wave 0 |
| DATA-01 | Loader exposes the typed array (no runtime fetch) | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "videos array length"` | Wave 0 |
| DATA-02 | All required fields present + typed for every record | unit | `pnpm vitest run src/lib/data/videos.json.test.ts -t "canonical videos.json validates"` | Wave 0 |
| DATA-02 | Optional fields (duration_seconds, description) parse correctly when absent | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "optional fields"` | Wave 0 |
| DATA-03 | Schema violation — missing required field — fails the build | integration | `pnpm vitest run src/lib/data/schema.test.ts -t "rejects a missing required field"` | Wave 0 |
| DATA-03 | Schema violation — non-ISO date — fails the build | integration | `pnpm vitest run src/lib/data/schema.test.ts -t "rejects a non-ISO date"` | Wave 0 |
| DATA-03 | `pnpm build` exits non-zero when `videos.json` is corrupted | smoke | `node scripts/test-build-fails.mjs` (temporarily corrupts JSON, runs `pnpm build`, asserts exit code, restores file) — **OR** manual: copy a `videos.bad.json` fixture, run `pnpm build`, observe failure. Planner's call. | Wave 0 (script) — manual smoke acceptable as fallback |
| DATA-04 | Unknown category string rejected by schema | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "rejects an unknown category"` | Wave 0 |
| DATA-04 | All 8 canonical categories accepted | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "accepts all 8 canonical categories"` | Wave 0 |
| DATA-04 | Slug derivation is single-rule, kebab-case | unit | `pnpm vitest run src/lib/data/categories.test.ts -t "categoryToSlug"` | Wave 0 |
| (cross-cut) | Loader display order: PBS first, count desc, ties alpha (D-04) | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "display order"` | Wave 0 |
| (cross-cut) | `producerReelId` is exported and references an existing video (D-09) | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "producerReelId resolves"` | Wave 0 |
| (cross-cut) | All hidden videos filtered from public surfaces (D-14) | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "hidden videos filtered"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm vitest run src/lib/data/` (just the data layer suite, ~milliseconds)
- **Per wave merge:** `pnpm check && pnpm vitest run && pnpm build` (svelte-check + full vitest + a real build that exercises the validation plugin)
- **Phase gate:** Full suite green + `pnpm build` exits 0 + the deliberate-corruption smoke test exits non-zero. All three must hold before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `vitest` install + config — `pnpm dlx sv add vitest` (also adds jsdom/setup; for our schema tests we only need node env, but the default sv add config is fine)
- [ ] `src/lib/data/schema.test.ts` — covers DATA-02, DATA-03, DATA-04 (per-record schema tests)
- [ ] `src/lib/data/videos.json.test.ts` — covers DATA-01, DATA-02 (the actual canonical file validates and has 56 rows + unique IDs)
- [ ] `src/lib/data/videos.test.ts` — covers loader behavior (display order, hidden filtering, producerReelId resolution)
- [ ] `src/lib/data/categories.test.ts` — covers slug derivation (D-03)
- [ ] `scripts/test-build-fails.mjs` — optional but recommended — temporarily corrupts `videos.json`, runs `pnpm build`, asserts non-zero exit, restores. Without it, DATA-03's "build fails" is asserted by Vitest at the schema level but not at the **build pipeline** level. The planner should include this if budget allows.

---

## Sources

### Primary (HIGH confidence)
- **Zod 4 official docs** — https://zod.dev/api (verified 2026-05-10): `z.enum()`, `z.iso.date()`, `z.url()`, `z.discriminatedUnion()`, `z.strictObject()` signatures and behavior
- **Zod 4 v4 migration page** — https://zod.dev/v4 (verified 2026-05-10): canonical import is `'zod'`; `z.literal([...])` multi-value support; `z.prettifyError()` confirmed
- **Zod 4 error formatting** — https://zod.dev/error-formatting (verified 2026-05-10): `z.prettifyError`, `z.treeifyError`, `z.flattenError`; `z.formatError` deprecated
- **Vite features (JSON imports)** — https://vite.dev/guide/features.html (verified 2026-05-10): `.json` files import natively, parsed object, named-export tree-shaking supported
- **Vite plugin API** — https://vite.dev/guide/api-plugin (verified 2026-05-10): `buildStart` is a Rollup-compatible hook fired once on server start (dev) and once before bundling (build)
- **SvelteKit load functions** — https://svelte.dev/docs/kit/load (verified 2026-05-10): *"A load function is invoked at runtime, unless you prerender the page — in that case, it's invoked at build time."*
- **SvelteKit page options** — https://svelte.dev/docs/kit/page-options (verified 2026-05-10): `export const prerender = true` in root `+layout.ts` prerenders everything; `building` from `$app/environment` is `true` during prerender
- **sv CLI add-ons** — https://svelte.dev/docs/cli/sv-add (verified 2026-05-10): `vitest` is an officially supported `sv add` add-on
- **npm registry** — verified 2026-05-10: `zod@4.4.3`, `valibot@1.4.0`, `arktype@2.2.0`, `vitest@4.1.5`
- **Project context** — `.planning/phases/01-foundation/01-RESEARCH.md`, `.planning/STATE.md`, `_prep/03-videos-seed.json` (56 videos confirmed), `_prep/04-categories.md` (8-category taxonomy)

### Secondary (MEDIUM confidence — verified against primary)
- **Valibot intro** — https://valibot.dev/guides/introduction/: bundle-size claims (95% smaller than Zod) — flagged for honesty; **irrelevant to this phase** because validation runs build-time only on a prerendered site
- **Total TypeScript Zod tutorial / Steve Kinney** — confirmed `z.enum()` preferred over multi-`z.literal()` for closed string lists (cross-references Zod 4 official guidance)

### Tertiary (LOW confidence — flagged)
- **GitHub issues on SvelteKit prerender failures** — surfaced anecdotal patterns (load throws → build fails) but no single canonical line in current docs. Used only to corroborate the SvelteKit `load` doc's wording. The actionable claim ("Vite plugin `this.error()` fails the build") is HIGH-confidence via the Rollup plugin contract that Vite inherits.

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every version verified against npm registry on 2026-05-10; every API verified against Zod 4 / Vite / SvelteKit official docs
- Architecture: **HIGH** — patterns are canonical Vite + Zod + SvelteKit usage; the loader pattern is the exact one Phase 1 RESEARCH.md anticipated for build-time data
- Pitfalls: **HIGH** for Zod-specific items (verified against docs); **MEDIUM** for the dev-server hot-reload behavior (Pitfall 6) — not formally documented, derived from the `buildStart` lifecycle
- Validation Architecture: **HIGH** — every test maps to a specific requirement; the only judgment call is whether the planner adds the build-pipeline smoke test (`scripts/test-build-fails.mjs`) on top of the schema-level tests

**Research date:** 2026-05-10
**Valid until:** 2026-06-10 (30 days; Zod 4 is stable, SvelteKit 2 is stable, Tailwind v4 is stable — no fast-moving pieces in this phase)

---
