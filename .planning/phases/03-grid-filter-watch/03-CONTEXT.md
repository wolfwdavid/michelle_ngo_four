# Phase 3: Grid, Filter & Watch - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the killer feature end-to-end: a producer can browse all 56 videos in a YouTube-style grid, click any card to play it on `/watch/[id]`, immediately see "more in this category", and reach any filtered view via a clean URL.

In scope:
- `/work` — full grid of all 56 videos (featured-first, then date-desc), 2-col mobile / 3-col tablet / 4-col desktop
- `/work/[category]` — 8 prerendered category-filtered pages, same card grid + page heading
- `/watch/[id]` — embed player + metadata + "More in [Category]" rail below
- `VideoCard` component (reused by /work, /work/[category], and the /watch rail)
- Top nav: wordmark + 8 inline category links (display order) + About/Press/Contact (quieter, link to placeholder pages)
- Mobile hamburger → full-screen overlay menu
- Base dark mono theme + system sans + per-category accent color palette (the only color in the chrome)
- Lives in `src/routes/work/`, `src/routes/work/[category]/`, `src/routes/watch/[id]/`, `src/lib/components/`

Out of scope (other phases):
- Reel-led `/` hero composition + featured grid below — Phase 4 (`/` stays as the Phase 1 wordmark splash with the new Phase 3 nav on top)
- `/pbs` dedicated PBS American Portrait landing — Phase 5 (PBS as a filterable category lives here)
- `/press`, `/about` real content + footer + footer-mirrored nav (NAV-02) — Phase 6
- Perf budget < 2s on 4G + true LQIP blur-up tuning + production cutover — Phase 7

</domain>

<decisions>
## Implementation Decisions

### Theme & palette
- **D-01:** **Dark, monochromatic site chrome.** Background: black / near-black (e.g., `bg-neutral-950`). Text: white / near-white. Thumbnails and 8 category accents are the only color in v1. Phase 1 splash (`bg-black text-white`) already runs this — Phase 3 hardens it as the site default.
- **D-02:** **Pure monochrome base** — no global brand accent. Buttons, nav links, body text, dividers all run black/white/grays. The only color exception is the 8 category accents (D-04).
- **D-03:** **System sans, no webfonts.** Use the OS font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif`). Zero font-loading cost — directly helps the FOUND-03 sub-2s/4G budget at Phase 7. Phase 4 hero or Phase 7 polish can upgrade if needed.
- **D-04:** **Per-category color accent — high saturation.** Each of the 8 categories gets a distinct, high-saturation hue that appears on its card tag and on the active-state nav link. Color hex values are Claude's Discretion (with AA contrast on dark bg as the constraint). Categories: PBS American Portrait, Promos & Trailers, Branded Content, Documentary / Short Film, Reel, Personal / Tribute, Educational / Nonprofit, Other.
- **D-05:** **Tight YouTube-density spacing.** Gutters: `gap-2` mobile (8px), `gap-3` desktop (12px). Generous editorial whitespace is reserved for /about, /press, /watch metadata — `/work` and the rail run dense so producers can scan.
- **D-06:** **Subtle hover state on cards.** Title underlines on hover, thumb opacity nudges (e.g., 90% → 100%). No transform, no scale, no shadow. Pointer cursor on the whole card link.
- **D-07:** **White focus ring with offset** (`:focus-visible` 2px ring + 2px offset on dark bg, Tailwind's default ring utilities). WCAG 2.4.7.
- **D-08:** **Inline links use the body color with a 1px underline.** No blue, no accent shift. Used in /watch description and the eventual /about, /press, /watch credits.
- **D-09:** **Hairline 1px `white/10` dividers used sparingly** — separating top nav from content, content from where the footer will eventually sit.

### Card & grid surface
- **D-10:** **16:9 aspect ratio for every card thumb.** Tailwind `aspect-video` wrapper, `<img class="w-full h-full object-cover">`. Hides letterbox/pillarbox from inconsistent YouTube/Vimeo source thumbs. Reserves space before image load (no layout shift).
- **D-11:** **Card meta below the thumb (in this order):** small all-caps category tag (colored per category, no chip background — label-style à la samhendi/isotopefilms), title (h3, 2-line clamp), uploader/client (muted xs). **No duration badge, no published date** on cards. Date and duration surface on `/watch/[id]` only.
- **D-12:** **Type sizes:** tag `text-xs` (12px) bold uppercase tracked, title `text-sm md:text-base` medium, uploader `text-xs neutral-500`.
- **D-13:** **Whole card is a single `<a href={\`${base}/watch/${video.id}\`}>` link.** One focus target, one click target, one prefetch target. The category chip on the card is a non-interactive label (nested `<a>` inside `<a>` is invalid HTML; category navigation is provided by the top nav and the `/watch` rail heading).
- **D-14:** **SvelteKit `data-sveltekit-preload-data="hover"`** on card links — prefetches the `/watch/[id]` route module on hover for instant-feel click-through. Built-in, zero-cost when not hovered.
- **D-15:** **Use the thumbnail URL from `videos.json` as-is.** No runtime swap to YouTube `maxresdefault`, no srcset for v1. Phase 7 polish can upgrade.
- **D-16:** **"Blur-up" via solid-color fade-in for v1.** Each thumb's wrapper has a dark placeholder color (e.g., `bg-neutral-900`); thumb fades in on load (`transition-opacity`). Satisfies GRID-03's spirit. **True LQIP base64 placeholders are deferred to Phase 7** if FOUND-03 perf budget demands it.
- **D-17:** **`<img loading="lazy">` on all card thumbs except the first 8** (the above-the-fold 2 rows × 4 cols on desktop / 4 rows × 2 cols on mobile — first 8 either way). First 8 use `loading="eager"`. All thumbs use `decoding="async"`.
- **D-18:** **`alt={video.title}`** on every thumb image. Simple, sufficient.
- **D-19:** **Heading hierarchy:** `<h1>` for page title (`/watch` metadata title), `<h2>` for sections (e.g., "More in [Category]"), `<h3>` for card titles in the grid and rail.
- **D-20:** **Svelte `{#each videos as v (v.id)}`** — `video.id` as the key. Current dataset has no cross-source id collisions; if one ever surfaces, switch to composite key.

### Grid layout
- **D-21:** **Single flat CSS grid for `/work` and `/work/[category]`.** `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">`. No virtualization (56 items is tiny on a prerendered page), no pagination, no "Load more".
- **D-22:** **Breakpoints: Tailwind defaults.** 2-col below `sm` (640px), 3-col from `sm` to `lg` (640–1024px), 4-col `lg`+ (≥1024px). Maps directly to GRID-02. No 5-col on 2xl — deferred.
- **D-23:** **Max content width `max-w-7xl` (1280px), centered, with viewport padding** (e.g., `px-4 sm:px-6 lg:px-8`). Same container width on `/work`, `/work/[category]`, and the rail section of `/watch`.
- **D-24:** **`/work` shows all 56 videos by default**, no implicit category filter, no redirect to a featured category.
- **D-25:** **Grid ordering: featured first, then `published` date descending.** Phase 2 D-10 shipped the `featured: boolean` field with all rows `false` in v1; Phase 4 will set some to `true`. The ordering rule lives in the loader/route load function — does NOT mutate the source `videos` array. Ties broken by Vimeo-vs-YouTube id order (deterministic).
- **D-26:** **Page heading: nothing on `/work`** (nav implies "this is work"). **`/work/[category]` shows a heading like "PBS American Portrait (18)" in that category's accent color** above the grid. Count comes from `getCategoriesWithCounts()`.
- **D-27:** **Category tag stays visible on cards even on `/work/[category]`** (no card variant). Consistent component, predictable rendering, no special-casing.
- **D-28:** **Scroll restoration: SvelteKit default.** Clicking a card scrolls `/watch` from top; back button returns to the prior `/work` scroll position automatically.

### Filter URL pattern
- **D-29:** **Path-param `/work/[category]`** with the slug from `categoryToSlug()` (Phase 2 D-03 rule). Already matches REQUIREMENTS FILT-03 literally. Prerenders to 8 static `.html` files at build time — perfect for `adapter-static` + free GitHub Pages hosting. No query-string fallback for v1.
- **D-30:** **`/work/[category]` route load:** `slugToCategory(params.category) → Category | undefined`; if undefined, `error(404)`. If valid, load `getByCategory(category)` and pass to the page.

### Watch page
- **D-31:** **Watch route is `/watch/[id]`** with `id` = the source's native id (Vimeo digits like `264677021`, YouTube 11-char like `dQw4w9WgXcQ`). No source prefix, no slug. Current dataset has no id collisions across sources; if collisions ever happen, the `/watch/[source]/[id]` shape is the migration path.
- **D-32:** **Watch route load:** `getById(params.id) → Video | undefined`; if undefined, `error(404)`.
- **D-33:** **Direct iframe embed in an `aspect-video` wrapper. No autoplay, no JS player libs.** `<iframe src={video.embed} class="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen>` inside `<div class="relative aspect-video">`. User clicks play inside the iframe (Vimeo / YouTube native control).
- **D-34:** **Player container `max-w-5xl` (1024px), centered**, with `aspect-video`. Below the player, the metadata + rail expand to `max-w-7xl` matching `/work`.
- **D-35:** **Watch metadata, in this order, below the player:**
  1. Title as `<h1>` (the only `<h1>` on the page)
  2. Small all-caps category tag (links to `/work/[category]`, this is where the chip IS interactive)
  3. Uploader/client name
  4. Published year (4-digit, e.g., `2018` — derived from the `YYYY-MM-DD` ISO date string)
  5. Description block (rendered as plain text, `whitespace-pre-line`) — **only if `video.description` is present and non-empty.** 23 of 56 videos have empty descriptions; their metadata block ends at the year.
  6. `duration_seconds`, `credits`, and `tags` are **NOT rendered** in v1 even when present. Duration on watch is implied by the player UI; credits/tags are schema-forward only.
- **D-36:** **"More in [Category]" rail BELOW the metadata.** `<h2><a href={\`${base}/work/${categoryToSlug(video.category)}\`}>More in {video.category} →</a></h2>` — the heading itself is the link to the filtered grid. No separate "see all" button.
- **D-37:** **Rail content: all videos in the same category except the current one,** ordered by D-25 (featured first, then date desc). Uses the same `VideoCard` component and the same 2/3/4 responsive grid as `/work`.
- **D-38:** **Empty rail handling:** if `getByCategory(video.category).filter(v => v.id !== video.id)` is empty, **hide the entire "More in [Category]" section** (heading and rail both). Can't happen with current v1 data (smallest category is 3) but defensive.

### Top nav (NAV-01)
- **D-39:** **Top nav lives in `src/routes/+layout.svelte`** (or a `<Nav />` component imported there) so every route inherits it.
- **D-40:** **Desktop layout:** wordmark `MICHELLE NGO` on the left (clickable, → `/`), 8 category links inline in `getCategoriesInDisplayOrder()` order in the middle/right, then About / Press / Contact links at the far right with quieter visual weight (smaller text or `text-neutral-400`). All-caps tracked sans, matches splash typography.
- **D-41:** **Active category nav link uses that category's accent color** (the same color as its card tag). Reuses the per-category palette from D-04. On `/work/[category]`, the matching nav link is highlighted; on `/work` and `/watch/[id]`, no category is active. (The /watch page's category tag links to `/work/[category]` per D-35, so navigating there activates the nav highlight naturally.)
- **D-42:** **Mobile (`<sm`): hamburger icon top-right → full-screen overlay menu** listing wordmark, all 8 categories stacked, then About / Press / Contact below a divider. Closes on link tap or close button. Dark overlay (`bg-black/95`).
- **D-43:** **About / Press / Contact links exist in the nav from Phase 3.** Pages don't have real content until Phase 6, so Phase 3 ships **minimal placeholder routes** at `/about`, `/press`, `/contact` (each a single page with title + "Coming soon" — keeps the nav from 404'ing during Phases 3–5). Phase 6 replaces the placeholder content; the URLs don't change.
- **D-44:** **`/` stays as the Phase 1 wordmark splash with the new top nav on top** until Phase 4 replaces it with the reel-led hero. Phase 3 does NOT touch `/` content beyond adding the nav via the shared layout.

### Claude's Discretion
- **Specific hex values for the 8 category accent colors** (must hit AA contrast on `bg-neutral-950` and feel distinct from each other; PBS American Portrait gets the most prominent / most-saturated since it's the flagship and lands top of nav). Picker is free to use OKLCH, HSL, etc. — Tailwind v4 CSS-first config supports `@theme` colors.
- **Whether the top nav is sticky or static** (recommend sticky at desktop, non-sticky at mobile so the hamburger overlay isn't competing).
- **Whether nav category links show counts inline** (e.g., `PBS American Portrait (18)` vs `PBS American Portrait`). Counts add scan signal but can crowd 8 inline links. Lean toward counts only on the active page heading (D-26), not in the nav.
- **Exact hamburger icon style** (3-line standard is fine).
- **Mobile menu animation** (slide-down, fade, instant — all acceptable; instant is fine for v1 and avoids motion-preference complications).
- **`/watch` page favicon / OG metadata** — defer to Phase 7 polish unless trivial; titles can use `Michelle Ngo — {video.title}` shape, but final SEO is Phase 7.
- **Whether description is rendered as plain `<p>` with `whitespace-pre-line` or split by paragraphs** — schema is `string`; seed data uses prose. Plain text with whitespace preservation is the simplest correct rendering.
- **Hover-prefetch on category nav links** — same `data-sveltekit-preload-data="hover"` as on card links is the obvious default but the planner can dial it down if prefetch storms become a concern.
- **Whether the rail on `/watch/[id]` shows a count** in its heading (e.g., "More in PBS American Portrait (17) →"). Lean: no count in the heading link to keep it clean; count is on `/work/[category]` heading per D-26.
- **`+error.svelte` content** for the 404 path (D-30, D-32). Minimal: title "Not found", short copy, link back to `/work`.

### Folded Todos
*None — no pending todos surfaced for this phase.*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 3 requirements + success criteria
- `.planning/REQUIREMENTS.md` §Grid — GRID-01 (cards w/ thumb + title + tag + uploader), GRID-02 (2/3/4 responsive), GRID-03 (blur-up), GRID-04 (click → watch), GRID-05 (category type-tag)
- `.planning/REQUIREMENTS.md` §Filter & Watch — FILT-01 (click → /watch/[id] + plays), FILT-02 ("More in [Category]" rail), FILT-03 (`/work/[category]` filtered view), FILT-04 (URL reproduces filtered state)
- `.planning/REQUIREMENTS.md` §Navigation — NAV-01 (top text-link nav: categories + About/Press/Contact). NAV-02 (footer mirror) is Phase 6.
- `.planning/ROADMAP.md` §Phase 3: Grid, Filter & Watch — goal, 5 success criteria, 4 seed plans (03-01 VideoCard, 03-02 /work + /work/[category], 03-03 /watch/[id] + rail, 03-04 top nav)

### Project-wide context
- `.planning/PROJECT.md` Key Decisions table — "Click-to-filter via routing (not modal)" + "Click-only video preview (no hover autoplay)" + audience = hiring producers/agencies (drives reel-first hierarchy + press emphasis + type-tag-on-card scanability)
- `.planning/PROJECT.md` Constraints — modern browsers only, static-export-friendly, thumbnails blur-up rather than pop-in
- `.planning/REQUIREMENTS.md` §Out of Scope — no hover autoplay (locks D-33 behavior), no CMS (locks data import path from `$lib/data`)

### Design language
- `_prep/02-references.md` — samhendi.com (mono dark + type-tag-on-card + blur-up + PLAY REEL hero is the primary visual precedent; Phase 4 picks up the hero); isotopefilms.com (uppercase tracked tags, no chip backgrounds, editorial type rhythm); yvonnerusso.com (footer-mirrored nav for Phase 6)
- `_prep/05-decisions-needed.md` — Phase 3 resolves items **9 (click-to-filter via routing — locked here, was decided at kickoff)**, **10 (click-only, no hover autoplay — locked here, was decided at kickoff)**, **12 (light vs dark theme — locked here as dark mono per D-01)**, **13 (2/3/4 responsive grid — locked here per D-22)**

### Source data + taxonomy
- `_prep/04-categories.md` — 8-category list and the rationale for treating PBS as flagship (drives the nav-display-order anchor + per-category color accent palette)
- `src/lib/data/videos.json` — the 56 video records that the grid renders (read-only; do not mutate from routes)

### Prior phase context (carry-forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Svelte 5 runes (`$state`, `$props`, `$derived`), Tailwind v4 CSS-first, adapter-static + `prerender = true` on every route, `noUncheckedIndexedAccess` (so `getById()` returns `Video | undefined`), `BASE_PATH` env var for GitHub Pages (every internal link must go through `$app/paths` `base`), Phase 1 D-11 noindex robots meta on every route (stays through Phase 6)
- `.planning/phases/02-data-layer/02-CONTEXT.md` — the data contract: `$lib/data` public surface (`videos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`, `CATEGORIES`, `categoryToSlug`, `slugToCategory`), `Video` + `Category` types, 8-category closed list, count-desc display order, single category per video (D-02), `featured: boolean` field shipped with all rows `false` (D-10) — Phase 3 ordering rule honors it but doesn't set it, hidden videos already filtered out of `videos` (D-14), reel video stays in the public grid and Reel category (D-11), Vimeo digit ids + YouTube 11-char ids both stored as `string`

### Existing code (read before writing)
- `src/lib/data/index.ts` — the only file routes should import from (`import { ... } from '$lib/data'`)
- `src/lib/data/categories.ts` — `CATEGORIES`, `categoryToSlug()`, `slugToCategory()` (note: `slugToCategory` returns `Category | undefined`)
- `src/lib/data/videos.ts` — `videos`, `producerReelId`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`
- `src/lib/data/schema.ts` — `Video` type and the Zod schema (build-time only; routes consume `Video` type, not the schema)
- `src/routes/+layout.svelte` — top nav lives here in Phase 3
- `src/routes/+layout.ts` — `export const prerender = true;` already set
- `svelte.config.js` — `paths: { base: process.env.BASE_PATH ?? '' }` already wired; all internal links must use `import { base } from '$app/paths'`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Full `$lib/data` public surface from Phase 2** — `videos`, `producerReelId`, `getById(id)`, `getByCategory(category)`, `getCategoriesInDisplayOrder()`, `getCategoriesWithCounts()`, `CATEGORIES`, `categoryToSlug(category)`, `slugToCategory(slug)`. Every Phase 3 route loads from here.
- **Tailwind v4 utilities** wired via Phase 1's `app.css` and Vite plugin. CSS-first config (no `tailwind.config.js`) — custom theme tokens (like the 8 category accents) go in `app.css` via `@theme`.
- **Phase 1 splash typography** (`src/routes/+page.svelte`) sets the all-caps tracked-wide pattern the nav wordmark should match.

### Established Patterns
- **Svelte 5 runes API** — components use `$props()`, `$state()`, `$derived()`. No Svelte 4 stores. Bind nav state (mobile menu open) with `$state` local to the nav component.
- **`adapter-static` + `export const prerender = true` (in `+layout.ts`)** — every route is statically prerendered. `/work/[category]` and `/watch/[id]` need `entries()` exports in their `+page.ts` so SvelteKit prerenders one HTML per category and per video at build time.
- **`noUncheckedIndexedAccess`** — `getById()` returns `Video | undefined`; routes MUST narrow before accessing fields (e.g., `if (!video) error(404, 'not found')`). Same for `slugToCategory()`.
- **`BASE_PATH` env var** — GitHub Pages serves from `/<repo>/`. Every internal link MUST use `import { base } from '$app/paths'` and prefix paths (`<a href={\`${base}/work/${slug}\`}>`). Hardcoded `/work/...` will 404 on production.
- **pnpm@11 + Node 22**, pinned-exact deps (no `^` / `~`). Any new dep added in Phase 3 follows the same rule.
- **lint-staged + husky pre-commit** — Prettier + ESLint on staged files; new components must pass.

### Integration Points
- **`src/routes/+layout.svelte`** — top nav (D-39) lives here so every route inherits it. App-shell pattern.
- **`src/lib/components/`** — NEW in Phase 3 per Phase 1 D-16 (each phase creates its own folders). `VideoCard.svelte`, `TopNav.svelte`, `MobileMenu.svelte`, possibly a `CategoryTag.svelte` if it's reused.
- **`src/routes/work/+page.svelte`** + `src/routes/work/+page.ts` — `/work` route; load function calls `videos` + applies D-25 ordering.
- **`src/routes/work/[category]/+page.svelte`** + `+page.ts` — `/work/[category]` route; load function uses `slugToCategory(params.category)` then `getByCategory()`. **Needs `export function entries()`** for prerender to walk all 8 category slugs.
- **`src/routes/watch/[id]/+page.svelte`** + `+page.ts` — `/watch/[id]` route; load function uses `getById(params.id)`. **Needs `export function entries()`** returning all 56 video ids for prerender.
- **`src/routes/about/+page.svelte`**, **`src/routes/press/+page.svelte`**, **`src/routes/contact/+page.svelte`** — placeholder routes (D-43); Phase 6 fills in real content.
- **`src/routes/+error.svelte`** — 404 fallback for unknown ids/slugs.
- **`src/app.css`** — Tailwind theme `@theme` block for the 8 category accent colors + any global focus-ring overrides.
- **GitHub Pages deploy workflow** (Phase 1) — already runs `pnpm install && pnpm build` and serves `build/`. Phase 3's new prerendered routes (`/work`, 8× `/work/[category]`, 56× `/watch/[id]`, plus `/about` /`/press` / `/contact` placeholders) drop into `build/` automatically; no CI changes needed.

</code_context>

<specifics>
## Specific Ideas

- **YouTube-style mental model anchors the killer feature.** Users land on `/work`, scan a flat grid, click a card → land on `/watch/[id]` → see "more in this category" → click another card. samhendi.com is the closest visual precedent for cards (mono dark, type-tag-on-card, blur-up, click-only), but the click-to-filter behavior is YouTube-native.
- **The deliberate-tension move:** pure-mono site chrome with high-saturation category accents is a stronger design call than "all mono" or "all colorful." The 8 colors live exclusively on category tags + the active nav link — every other accent in the UI is restraint.
- **Reel video stays in the public `/work` grid AND the `Reel` filter** (Phase 2 D-11). It's also the PLAY REEL CTA target in Phase 4 (via `producerReelId = '264677021'`). Phase 3 doesn't special-case it.
- **All 56 videos publish in v1** (Phase 2 D-12) — no hidden videos, including the Personal/Tribute and Memorial Sloan Kettering pieces.
- **PBS American Portrait is the flagship in the nav** (18 videos, top of `getCategoriesInDisplayOrder()`). The dedicated `/pbs` landing page is Phase 5 — Phase 3 surfaces PBS as the first category link in the top nav. When Phase 5 ships, the nav doesn't need to change.

</specifics>

<deferred>
## Deferred Ideas

- **True LQIP base64 blur-up placeholders** — Phase 7 polish if FOUND-03 perf budget needs them. v1 ships solid-color fade-in (D-16).
- **Footer + footer-mirrored nav (NAV-02)** — Phase 6.
- **`/about`, `/press`, `/contact` real content** — Phase 6. Phase 3 ships placeholder routes so the nav links don't 404.
- **Featured curation set** — Phase 4 picks which videos get `featured: true` for the home grid. Phase 2 D-10 already shipped the schema field with all rows `false`; the D-25 ordering rule activates automatically when Phase 4 flips bits.
- **`/` reel-led hero composition** — Phase 4. `/` stays as Phase 1 splash with Phase 3 nav added.
- **`/pbs` dedicated PBS American Portrait landing** — Phase 5. PBS as a filterable category is delivered here.
- **Hover-prefetch tuning (e.g., `viewport` strategy)** — Phase 7 perf polish if `hover` causes prefetch storms.
- **5-col grid on `2xl` (≥1536px) displays** — defer; 4-col at ≥1024px reads well on standard monitors.
- **Higher-res YouTube thumb upgrade** (`maxresdefault.jpg`) — Phase 7 polish; not every YouTube video generates maxres, so it'd need a fallback.
- **`srcset` for retina + multiple thumb resolutions** — Phase 7 perf polish.
- **Share affordance on `/watch/[id]`** — out of scope for v1.
- **Crew / `credits` field surfacing on `/watch`** — schema has the field (Phase 2 D-08), no UI in v1. Revisit when Michelle wants to author crew copy.
- **`tags` field surfacing** — schema has the field, v1 ignores it. v2 facet/search work would consume it.
- **`/watch/[source]/[id]` composite-id route** — defer until an id collision actually surfaces between YouTube and Vimeo.
- **5-col / virtualized / paginated grid** — overkill at 56 items on a prerendered static page.
- **Active filter heading shows count outside `/work/[category]` (e.g., on /watch's rail heading)** — kept off for visual cleanliness; revisit if scanability suffers.
- **Custom hamburger animation** — fine to ship instant; revisit only if users complain.
- **Search across videos by title** — DISC-01 / v2.

### Reviewed Todos (not folded)
*None — no pending todos were surfaced during cross-reference.*

</deferred>

---

*Phase: 03-grid-filter-watch*
*Context gathered: 2026-05-10*
