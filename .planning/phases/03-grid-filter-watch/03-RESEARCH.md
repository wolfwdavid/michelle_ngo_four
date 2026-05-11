---
phase: 3
gathered: 2026-05-11
status: ready-for-planning
confidence: HIGH
domain: SvelteKit 2 + Svelte 5 routing + Tailwind v4 component patterns + iframe embed lazy-load + adapter-static prerender of dynamic routes
---

# Phase 3: Grid, Filter & Watch - Research

**Researched:** 2026-05-11
**Domain:** SvelteKit 2 + Svelte 5 component & routing patterns for a YouTube-style grid + watch experience, fully prerendered via adapter-static
**Confidence:** HIGH (every implementation-level claim verified against svelte.dev/docs and current ecosystem; one decision flagged MEDIUM — the lite-youtube-embed facade vs direct iframe — and resolved per CONTEXT D-33)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Theme & palette**
- **D-01:** Dark, monochromatic site chrome. Background `bg-neutral-950` (or black/near-black equivalent); text white/near-white. Thumbnails and 8 category accents are the only color in v1.
- **D-02:** Pure monochrome base — no global brand accent. Buttons/links/dividers run black/white/grays. Only exception: 8 category accents.
- **D-03:** System sans, no webfonts. OS font stack `-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif`. Zero font-loading cost.
- **D-04:** Per-category color accent — high saturation. 8 categories each get a distinct, high-saturation hue. Hex values are Claude's Discretion; constraint is AA contrast on `bg-neutral-950`.
- **D-05:** Tight YouTube-density spacing. Gutters `gap-2` mobile (8px), `gap-3` desktop (12px).
- **D-06:** Subtle card hover state — title underlines on hover, thumb opacity 90% → 100%. No transform, scale, or shadow.
- **D-07:** White focus ring with offset (`:focus-visible` 2px ring + 2px offset).
- **D-08:** Inline links use body color with 1px underline. No blue.
- **D-09:** Hairline 1px `white/10` dividers, used sparingly.

**Card & grid surface**
- **D-10:** 16:9 aspect ratio for every card thumb. Tailwind `aspect-video` wrapper + `<img class="w-full h-full object-cover">`.
- **D-11:** Card meta below thumb: small all-caps category tag (colored per category, label-style — no chip background), title (h3, 2-line clamp), uploader/client (muted xs). No duration badge, no published date.
- **D-12:** Type sizes — tag `text-xs` (12px) bold uppercase tracked, title `text-sm md:text-base` medium, uploader `text-xs neutral-500`.
- **D-13:** Whole card is a single `<a href={\`${base}/watch/${video.id}\`}>`. Category chip on the card is non-interactive (no nested `<a>`).
- **D-14:** SvelteKit `data-sveltekit-preload-data="hover"` on card links.
- **D-15:** Use thumbnail URL from `videos.json` as-is. No runtime swap, no srcset for v1.
- **D-16:** "Blur-up" via solid-color fade-in for v1. Wrapper has `bg-neutral-900`; thumb fades in on load (`transition-opacity`). True LQIP deferred to Phase 7.
- **D-17:** `<img loading="lazy">` on all card thumbs except the first 8 (`loading="eager"`). All thumbs `decoding="async"`.
- **D-18:** `alt={video.title}`.
- **D-19:** Heading hierarchy — `<h1>` for page title (`/watch` only), `<h2>` for "More in [Category]", `<h3>` for card titles.
- **D-20:** `{#each videos as v (v.id)}` — `video.id` as key.

**Grid layout**
- **D-21:** Single flat CSS grid for `/work` and `/work/[category]`. `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">`. No virtualization, no pagination.
- **D-22:** Tailwind default breakpoints — 2-col `<640`, 3-col 640–1024, 4-col `≥1024`.
- **D-23:** `max-w-7xl` (1280px), centered, with `px-4 sm:px-6 lg:px-8`.
- **D-24:** `/work` shows all 56 videos by default.
- **D-25:** Grid ordering — featured first, then `published` date descending. Ties broken by Vimeo-vs-YouTube id order (deterministic).
- **D-26:** No page heading on `/work`. `/work/[category]` shows "PBS American Portrait (18)" in that category's accent color.
- **D-27:** Category tag stays visible on cards even on `/work/[category]`. One component, no variant.
- **D-28:** Scroll restoration — SvelteKit default.

**Filter URL pattern**
- **D-29:** Path-param `/work/[category]` with slug from `categoryToSlug()`. Prerenders to 8 static `.html` files. No query-string fallback.
- **D-30:** `/work/[category]` load — `slugToCategory(params.category)`; if undefined, `error(404)`. Else `getByCategory(category)`.

**Watch page**
- **D-31:** Watch route is `/watch/[id]` — id = source's native id (Vimeo digits, YouTube 11-char). No source prefix.
- **D-32:** Watch load — `getById(params.id)`; if undefined, `error(404)`.
- **D-33:** Direct iframe embed in `aspect-video` wrapper. No autoplay, no JS player libs.
- **D-34:** Player container `max-w-5xl` (1024px) centered; metadata + rail below expand to `max-w-7xl`.
- **D-35:** Watch metadata order — Title (`<h1>`), category tag (interactive → `/work/[category]`), uploader, published year (4-digit), description block (`whitespace-pre-line`, only if non-empty). `duration_seconds`, `credits`, `tags` NOT rendered in v1.
- **D-36:** "More in [Category]" rail below metadata. `<h2><a href={\`${base}/work/${slug}\`}>More in {category} →</a></h2>` — heading itself is the link.
- **D-37:** Rail content — all same-category videos minus current; D-25 ordering; same `VideoCard` + 2/3/4 grid.
- **D-38:** Empty rail handling — if filter yields zero, hide entire rail section. Defensive only (smallest category in v1 is 3).

**Top nav (NAV-01)**
- **D-39:** Top nav lives in `src/routes/+layout.svelte` (or a `<TopNav />` imported there).
- **D-40:** Desktop layout — wordmark `MICHELLE NGO` left (→ `/`), 8 category links inline in `getCategoriesInDisplayOrder()` order, then About / Press / Contact at far right with quieter weight.
- **D-41:** Active category nav link uses that category's accent color (matches card tag). On `/work` and `/watch/[id]`, no category is active.
- **D-42:** Mobile (`<sm`) — hamburger top-right → full-screen overlay menu with wordmark, 8 stacked categories, then About/Press/Contact below a divider. `bg-black/95` overlay.
- **D-43:** About / Press / Contact links exist in nav from Phase 3. Phase 3 ships minimal placeholder routes at `/about`, `/press`, `/contact` (title + "Coming soon"). Phase 6 replaces content; URLs don't change.
- **D-44:** `/` stays as the Phase 1 wordmark splash with the new top nav on top. Phase 3 does not touch `/` content.

### Claude's Discretion
- Specific hex values for the 8 category accent colors (AA contrast on `bg-neutral-950`, distinct, PBS most prominent).
- Whether top nav is sticky or static (research recommends: sticky at desktop, non-sticky at mobile).
- Whether nav category links show counts inline (research recommends: no counts in nav, only on `/work/[category]` heading).
- Hamburger icon style (3-line standard fine).
- Mobile menu animation (instant fine for v1; sidesteps `prefers-reduced-motion` handling).
- `/watch` page favicon / OG metadata — defer to Phase 7 unless trivial.
- Whether description renders as plain `<p>` with `whitespace-pre-line` or split by paragraphs (research recommends `whitespace-pre-line` — simplest correct rendering).
- Hover-prefetch on category nav links (research recommends keep `hover`; prefetch storm risk is minimal for 8 links).
- Whether rail heading shows a count (research recommends no — keep the link clean).
- `+error.svelte` content (minimal: "Not found" + link back to `/work`).

### Deferred Ideas (OUT OF SCOPE)
- True LQIP base64 blur-up placeholders → Phase 7.
- Footer + footer-mirrored nav (NAV-02) → Phase 6.
- `/about`, `/press`, `/contact` real content → Phase 6 (Phase 3 ships placeholder routes only).
- Featured curation set → Phase 4.
- `/` reel-led hero composition → Phase 4.
- `/pbs` dedicated PBS landing → Phase 5.
- Hover-prefetch tuning (e.g., `viewport`) → Phase 7.
- 5-col grid on `2xl` → deferred.
- Higher-res YouTube `maxresdefault.jpg` → Phase 7.
- `srcset` for retina → Phase 7.
- Share affordance on `/watch/[id]` — out of scope.
- Crew/`credits` field UI surfacing — schema only.
- `tags` field UI surfacing — schema only.
- `/watch/[source]/[id]` composite route — defer until collision surfaces.
- Virtualized / paginated grid — overkill at 56.
- Custom hamburger animation.
- Search across videos by title — DISC-01 / v2.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GRID-01 | Grid shows thumbnail, title, category tag, uploader/client | `VideoCard.svelte` with `aspect-video` wrapper + 16:9 thumb + below-thumb meta (tag/title/uploader). Pattern 1 below. Tailwind `line-clamp-2` on title (built into v4 by default). |
| GRID-02 | Responsive 2-col mobile, 3-col tablet, 4-col desktop | Tailwind defaults map exactly: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`. `sm` = 640px, `lg` = 1024px. Pattern 2. |
| GRID-03 | Thumbnails blur-up from low-res placeholder | Solid-color fade-in (D-16) via `transition-opacity` on `<img>`, wrapper `bg-neutral-900`. Pattern 3. True LQIP deferred. |
| GRID-04 | Click any card → opens watch view | Whole card is single `<a href={\`${base}/watch/${video.id}\`}>`. `data-sveltekit-preload-data="hover"` for instant feel. Pattern 1. |
| GRID-05 | Category visually reflected via consistent type-tag | Per-category accent color (D-04) on `<span>` inside `VideoCard`. Color sourced from a `categoryAccent(category)` helper (Pattern 4). |
| FILT-01 | Clicking card → `/watch/[id]` plays the video | `/watch/[id]/+page.svelte` renders direct iframe (`embed` URL from `videos.json`) in `aspect-video` wrapper. Pattern 5. |
| FILT-02 | `/watch/[id]` shows "more in this category" rail | Rail data computed in `+page.ts` load: `getByCategory(video.category).filter(v => v.id !== video.id)`. Hide section if empty. Pattern 6. |
| FILT-03 | `/work/[category]` shows that category's videos | `[category]/+page.ts` with `slugToCategory()` narrowing → `getByCategory()`. Pattern 7. `entries()` export enumerates 8 slugs for prerender. |
| FILT-04 | URL alone reproduces filtered view on reload/paste | Path-param means each filter is a real prerendered HTML file. Zero runtime state, deep-linkable, shareable. No query-string ambiguity. |
| NAV-01 | Top text-link nav: categories + About/Press/Contact | `TopNav.svelte` imported into `+layout.svelte`. Source category list from `getCategoriesInDisplayOrder()`. Active state via `$page.url.pathname` matching. Pattern 8. |
</phase_requirements>

---

## Phase Summary

Phase 3 ships the killer feature end-to-end. **Every implementation-level decision is mainstream and well-documented in svelte.dev/docs.** The 56-video dataset is small enough that no virtualization, no pagination, no incremental loading, and no client-side filter store is needed — every page is a real prerendered `.html` file produced once at build time. Total prerendered output: 1 `/work` + 8 `/work/[category]` + 56 `/watch/[id]` + 3 placeholder pages (`/about`, `/press`, `/contact`) + 1 `/` (unchanged) + 1 `/404` fallback = ~70 files. The whole site fits comfortably on Cloudflare Pages free tier.

The seven implementation-level decision points the planner needs to lock are:

1. **URL pattern** — locked to `/work/[category]` path param (CONTEXT D-29). Confirmed superior to query-string for `adapter-static`: each filtered view becomes a real shareable URL with its own HTML file; `adapter-static`'s `strict: true` mode verifies the route is fully prerenderable; no client-side reactivity to manage.
2. **Prerender strategy** — both routes (`/work/[category]` and `/watch/[id]`) MUST export `entries()` from `+page.ts`. SvelteKit's auto-crawler *would* discover the URLs via links on `/work`, but the explicit `entries()` export is the canonical SvelteKit 2 pattern, gives a deterministic build, and means changes to `/work`'s link emission don't silently break prerender coverage. Belt-and-suspenders against `strict: true`.
3. **Blur-up** — CONTEXT D-16 locks v1 to solid-color fade-in. Implementation: `<img class="opacity-0 transition-opacity duration-300" onload={(e) => e.currentTarget.classList.remove('opacity-0')}>` (or `data-loaded` state) over `bg-neutral-900` wrapper. True LQIP is **explicitly deferred to Phase 7** because external thumb URLs (`i.vimeocdn.com`, `i2.ytimg.com`) cannot be processed at build time without mirroring them into the repo — out of scope.
4. **Embed player** — CONTEXT D-33 locks direct iframe, no facade. Research confirms this is correct for v1: `<iframe loading="lazy">` is fully supported in modern browsers (CONTEXT compatibility scope), Vimeo's `dnt=true` parameter blocks analytics, and YouTube embeds in `videos.json` already use `youtube.com/embed/` (privacy upgrade to `youtube-nocookie.com` is a Phase 7 tweak if FOUND-03 needs it). `lite-youtube-embed` facade would save ~500KB on first paint of `/watch/[id]` BUT adds a JS component to ship; deferred unless Phase 7 perf budget demands it.
5. **Rail data flow** — CONTEXT D-37 implies build-time computation. Recommended shape: rail videos are computed inside `/watch/[id]/+page.ts` `load()` and returned alongside the main `video` object. Zero runtime cost, no client store, no shared global.
6. **Responsive grid** — CONTEXT D-21/D-22 lock the exact Tailwind classes. Confirmed `line-clamp-2`, `aspect-video`, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` are all built-in Tailwind v4 utilities (no plugin, no config). Container `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
7. **Top nav category source** — Single source of truth is `getCategoriesInDisplayOrder()` from `$lib/data` (Phase 2 D-04, count-desc + tie-alpha). Already exposed. Nav consumes this directly; no hard-coded list.

**Primary recommendation:** Plan 03-01 builds `VideoCard.svelte` + a tiny `categoryAccent(category)` helper + the 8-color `@theme` block in `app.css`. Plan 03-02 builds the two `/work` routes with their `entries()` exports and load functions. Plan 03-03 builds `/watch/[id]` with iframe embed + rail. Plan 03-04 builds `TopNav.svelte` + `MobileMenu.svelte` + the three placeholder pages + `+error.svelte`. All four plans share the same patterns documented below — there is no exotic risk.

The single thing that **will bite if missed** is that `noUncheckedIndexedAccess` (Phase 1 D-14) means every load function MUST narrow `params.id`, `params.category`, and the return values of `getById()` / `slugToCategory()` before accessing fields. The `error(404, '…')` helper from `@sveltejs/kit` is the canonical pattern for the unhappy path.

---

## Standard Stack

### Core (already installed — no new runtime deps)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| svelte | 5.55.5 | Component framework + runes ($state, $props, $derived) | Phase 1 |
| @sveltejs/kit | 2.59.1 | Routing, load functions, prerender, page options | Phase 1 |
| @sveltejs/adapter-static | 3.0.10 | Pure SSG output with `strict: true` | Phase 1 |
| tailwindcss | 4.3.0 | Utility-first CSS, `@theme` block in `app.css` | Phase 1 — CSS-first config; `line-clamp-2`, `aspect-video`, `object-cover`, `grid-cols-*` all built-in |

### Supporting (Phase 3 may add)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/svelte | (latest, Svelte 5 compat) | Component-level unit tests for VideoCard | If planner wants RTL DOM-query API instead of bare `mount()` |
| jsdom | (latest) | DOM environment for component tests | Required for either RTL or bare `mount()` testing; vitest currently runs `environment: 'node'` (per `vite.config.ts`) |
| @playwright/test | (latest) | E2E test for filter URL round-trip + watch-page rail | Only if planner wants a true E2E gate; vitest component tests + a smoke `pnpm build && pnpm preview` probably enough for Phase 3 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct iframe (D-33) | `lite-youtube-embed` + `lite-vimeo-embed` (facade web components) | Facades save ~500KB / 800ms LCP on first watch view but add JS bundle weight and complicate the Vimeo path (lite-vimeo-embed is less mature than lite-youtube). **Locked to direct iframe per D-33; revisit in Phase 7 if FOUND-03 budget fails.** |
| Build-time computed rail (in `/watch/[id]/+page.ts` `load`) | Client-side `getByCategory()` call from the component | Build-time keeps the rail data in the prerendered HTML (zero JS, zero hydration cost). Client-side would require shipping the full video array to the browser. **Build-time wins; the rail data is already inlined into the prerendered page.** |
| `getCategoriesInDisplayOrder()` (Phase 2 helper) for nav | Hard-coded category list in `TopNav.svelte` | Helper is the locked single source of truth (Phase 2 D-04). Hard-coded list would drift the moment counts change. **Always use the helper.** |
| `entries()` export per route | Auto-crawl from `/work` links + `kit.prerender.entries` in `svelte.config.js` | Auto-crawl works (SvelteKit follows links during prerender) BUT silently breaks if a card stops rendering. `kit.prerender.entries` works but centralizes route knowledge outside the route. **Per-route `entries()` is the canonical SvelteKit 2 pattern and is what the docs recommend.** |
| @testing-library/svelte (RTL) | `mount()` + bare DOM queries (Svelte 5 testing guide) | RTL gives `getByRole`/`getByText` ergonomics. Bare `mount()` is what svelte.dev/docs documents and has zero extra deps. **Defer to planner — both work.** |

**Installation (Phase 3 testing only, if planner wants component tests):**
```bash
pnpm add -D -E jsdom@latest
# OR (preferred for ergonomics):
pnpm add -D -E @testing-library/svelte@latest jsdom@latest
```

**Version verification (verified 2026-05-11 via npm registry):**
- All Phase 1 / Phase 2 deps still current — no upgrades needed.
- `jsdom` and `@testing-library/svelte` (if added): planner runs `pnpm view <pkg> version` before pinning.

**Phase 1 pinning convention applies:** install with `-E` (no caret/tilde).

---

## Architecture Patterns

### Recommended File Layout
```
src/
├── lib/
│   └── components/
│       ├── VideoCard.svelte             # GRID-01/02/03/04/05 — used by /work, /work/[category], /watch rail
│       ├── CategoryTag.svelte           # GRID-05 — the colored all-caps label; reused by VideoCard and /watch metadata
│       ├── TopNav.svelte                # NAV-01 — wordmark + 8 categories + About/Press/Contact
│       ├── MobileMenu.svelte            # D-42 — full-screen overlay
│       └── (optional) BlurUpImage.svelte # D-16 — solid-color fade-in wrapper; inline in VideoCard if only one caller
├── lib/
│   └── styles/
│       └── (no new file — accents go in app.css @theme block per Tailwind v4)
└── routes/
    ├── +layout.svelte                   # Imports TopNav, renders {@render children()}
    ├── +layout.ts                       # Already has `export const prerender = true` (no change)
    ├── +error.svelte                    # NEW — 404 fallback for unknown id/slug
    ├── +page.svelte                     # Phase 1 splash (UNCHANGED per D-44)
    ├── work/
    │   ├── +page.svelte                 # /work — all 56 cards, no heading
    │   ├── +page.ts                     # Sorts by D-25 (featured first, then date desc)
    │   └── [category]/
    │       ├── +page.svelte             # /work/[category] — filtered grid + heading
    │       └── +page.ts                 # entries() = 8 slugs; load narrows + filters
    ├── watch/
    │   └── [id]/
    │       ├── +page.svelte             # iframe + metadata + rail
    │       └── +page.ts                 # entries() = 56 ids; load returns {video, rail}
    ├── about/
    │   └── +page.svelte                 # D-43 placeholder: "About — Coming soon"
    ├── press/
    │   └── +page.svelte                 # D-43 placeholder
    └── contact/
        └── +page.svelte                 # D-43 placeholder

src/app.css                              # ADD @theme block with 8 category accent colors
```

### Pattern 1: VideoCard component (GRID-01/04, D-10/D-11/D-13/D-14/D-17/D-18/D-19/D-20)

```svelte
<!-- src/lib/components/VideoCard.svelte -->
<!-- Source: CONTEXT.md D-10..D-20, svelte.dev/docs/svelte/$props (Svelte 5 props) -->
<script lang="ts">
  import { base } from '$app/paths';
  import type { Video } from '$lib/data';
  import CategoryTag from './CategoryTag.svelte';

  type Props = {
    video: Video;
    /** First 8 cards above the fold are eager-loaded (D-17). */
    eager?: boolean;
  };
  let { video, eager = false }: Props = $props();

  let loaded = $state(false);
</script>

<li>
  <a
    href={`${base}/watch/${video.id}`}
    data-sveltekit-preload-data="hover"
    class="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
  >
    <div class="relative aspect-video overflow-hidden bg-neutral-900">
      <img
        src={video.thumbnail}
        alt={video.title}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-90"
        class:opacity-100={loaded}
        onload={() => (loaded = true)}
      />
    </div>
    <div class="mt-2 space-y-0.5">
      <CategoryTag category={video.category} />
      <h3 class="text-sm md:text-base font-medium line-clamp-2 group-hover:underline">
        {video.title}
      </h3>
      <p class="text-xs text-neutral-500">{video.uploader}</p>
    </div>
  </a>
</li>
```

**Why this works:**
- Single `<a>` per card (D-13) → one focus target, native keyboard nav.
- `aspect-video` wrapper reserves space → zero CLS (covers GRID-03's "no pop-in" intent for layout shift).
- `opacity-0 → opacity-100` on `onload` is the v1 blur-up (D-16). Group-hover takes thumb back to `opacity-90` (D-06).
- `data-sveltekit-preload-data="hover"` warms the `/watch/[id]` route module on hover (D-14).
- The card uses `$props()` with an inline type — the Svelte 5 docs' recommended pattern.
- `eager` defaults to `false`; the parent grid passes `eager={i < 8}` on the first 8 cards (D-17).

### Pattern 2: Responsive grid (GRID-02, D-21/D-22/D-23)

```svelte
<!-- src/routes/work/+page.svelte (illustrative) -->
<script lang="ts">
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';
  let { data }: { data: PageData } = $props();
</script>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
```

**Tailwind v4 utility verification (all built into the framework, no plugin, no config):**
- `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` → 2/3/4 responsive columns at 640px and 1024px breakpoints
- `gap-2 sm:gap-3` → 8px mobile, 12px desktop gutters (D-05)
- `aspect-video` → 16:9 ratio container (D-10)
- `line-clamp-2` → 2-line title truncation (D-35-ish, built into v3.3+, available in v4 by default — verified)
- `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` → centered 1280px container with viewport padding (D-23)

### Pattern 3: Blur-up via solid-color fade-in (GRID-03, D-16)

```svelte
<!-- Inline in VideoCard.svelte (see Pattern 1) -->
<div class="relative aspect-video overflow-hidden bg-neutral-900">
  <img
    src={video.thumbnail}
    alt={video.title}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300"
    class:opacity-100={loaded}
    onload={() => (loaded = true)}
  />
</div>
```

**Why this satisfies GRID-03 for v1:**
- The success criterion reads "Thumbnails render with a low-res placeholder that blurs up to full resolution." A solid-color placeholder + fade-in is the **degenerate case** of a low-res placeholder (zero-resolution placeholder). CONTEXT D-16 explicitly accepts this for v1 and defers true LQIP to Phase 7.
- `decoding="async"` hands decode work to the browser idle queue.
- `loading="lazy"` defers off-viewport thumbs (D-17). First 8 use `eager`.
- The `loaded` `$state` is local to each card instance — Svelte 5's per-instance reactivity handles this without ceremony.

### Pattern 4: Category accent helper + Tailwind v4 @theme tokens (GRID-05, D-04)

```css
/* src/app.css */
@import 'tailwindcss';

@theme {
  --color-cat-pbs: oklch(0.72 0.21 25);            /* PBS American Portrait — most prominent */
  --color-cat-promos: oklch(0.78 0.18 60);          /* Promos & Trailers */
  --color-cat-branded: oklch(0.72 0.18 180);        /* Branded Content */
  --color-cat-docshort: oklch(0.78 0.18 130);       /* Documentary / Short Film */
  --color-cat-reel: oklch(0.78 0.18 280);           /* Reel */
  --color-cat-personal: oklch(0.78 0.18 330);       /* Personal / Tribute */
  --color-cat-edunon: oklch(0.78 0.18 90);          /* Educational / Nonprofit */
  --color-cat-other: oklch(0.78 0.05 250);          /* Other — desaturated */
}
```

> **Note:** OKLCH values above are **placeholders for the planner's color picker** — must hit WCAG AA (4.5:1 contrast minimum) against `bg-neutral-950` (~oklch 0.16 0 0). PBS gets the most-saturated/most-prominent hue per the discretion note.

```typescript
// src/lib/components/categoryAccent.ts (or inline in CategoryTag.svelte)
import type { Category } from '$lib/data';

const ACCENT: Record<Category, string> = {
  'PBS American Portrait': 'text-cat-pbs',
  'Promos & Trailers': 'text-cat-promos',
  'Branded Content': 'text-cat-branded',
  'Documentary / Short Film': 'text-cat-docshort',
  'Reel': 'text-cat-reel',
  'Personal / Tribute': 'text-cat-personal',
  'Educational / Nonprofit': 'text-cat-edunon',
  'Other': 'text-cat-other',
};

export function categoryAccent(category: Category): string {
  return ACCENT[category];
}
```

```svelte
<!-- src/lib/components/CategoryTag.svelte -->
<script lang="ts">
  import type { Category } from '$lib/data';
  import { categoryAccent } from './categoryAccent';

  type Props = { category: Category; href?: string };
  let { category, href }: Props = $props();
</script>

{#if href}
  <a {href} class="text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline {categoryAccent(category)}">
    {category}
  </a>
{:else}
  <span class="text-xs font-bold uppercase tracking-wider {categoryAccent(category)}">
    {category}
  </span>
{/if}
```

**Why this works:**
- Tailwind v4's `@theme` block exposes `--color-cat-pbs` as `text-cat-pbs`, `bg-cat-pbs`, `ring-cat-pbs` automatically. No `tailwind.config.js` needed.
- The accent map is the **only** place a category-to-color binding lives. Future category renames are one-line edits.
- `CategoryTag` supports both label (D-13: non-interactive on cards) and link (D-35: interactive on watch metadata) modes via the optional `href` prop. Same component, two call sites.

### Pattern 5: /watch/[id] route with iframe embed (FILT-01, D-31/D-32/D-33/D-34/D-35)

```typescript
// src/routes/watch/[id]/+page.ts
// Source: svelte.dev/docs/kit/page-options (entries), svelte.dev/docs/kit/load (error)
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { getById, getByCategory, videos } from '$lib/data';

/** Prerender all 56 watch pages. Belt-and-suspenders against link-crawl drift. */
export const entries: EntryGenerator = () => videos.map((v) => ({ id: v.id }));

export const load: PageLoad = ({ params }) => {
  const video = getById(params.id);
  if (!video) error(404, 'Video not found');

  // Rail: same category minus current, sorted per D-25 (featured-first, date-desc).
  // featured: true is impossible in v1 (Phase 2 D-10) but the sort handles it for forward compat.
  const rail = getByCategory(video.category)
    .filter((v) => v.id !== video.id)
    .toSorted((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.published.localeCompare(a.published);
    });

  return { video, rail };
};
```

```svelte
<!-- src/routes/watch/[id]/+page.svelte -->
<script lang="ts">
  import { base } from '$app/paths';
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import CategoryTag from '$lib/components/CategoryTag.svelte';
  import { categoryToSlug } from '$lib/data';

  let { data }: { data: PageData } = $props();
  const { video, rail } = data;
  const year = video.published.slice(0, 4); // D-35 step 4
</script>

<svelte:head>
  <title>Michelle Ngo — {video.title}</title>
</svelte:head>

<article class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <!-- Player container (D-34): max-w-5xl centered, aspect-video -->
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

  <!-- Metadata (D-35): h1, tag (interactive), uploader, year, description (optional) -->
  <div class="mx-auto max-w-7xl mt-6 space-y-2">
    <h1 class="text-2xl md:text-3xl font-medium">{video.title}</h1>
    <CategoryTag category={video.category} href={`${base}/work/${categoryToSlug(video.category)}`} />
    <p class="text-sm text-neutral-400">{video.uploader} · {year}</p>
    {#if video.description}
      <p class="text-sm text-neutral-300 whitespace-pre-line max-w-3xl pt-2">{video.description}</p>
    {/if}
  </div>

  <!-- Rail (FILT-02 / D-36 / D-37 / D-38): hidden if empty -->
  {#if rail.length > 0}
    <section class="mx-auto max-w-7xl mt-10 border-t border-white/10 pt-8">
      <h2 class="text-lg font-medium mb-4">
        <a href={`${base}/work/${categoryToSlug(video.category)}`} class="hover:underline">
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

**Why this works:**
- `entries()` enumerates all 56 video ids → SvelteKit prerenders 56 `.html` files. `strict: true` will complain if a video id reachable via /work is NOT in this list — but the list IS literally `videos.map(...)`, so coverage is total.
- `error(404)` after the `getById()` narrow handles the unhappy path. The `if (!video)` narrows `Video | undefined` → `Video` for the rest of the file (Phase 1 D-14 / `noUncheckedIndexedAccess`).
- The rail is computed in `load()`, so the prerendered HTML contains the full rail data. Zero client JS for the filter.
- `<iframe loading="lazy">` defers off-viewport iframe loading (the iframe IS off-viewport on `/watch` if the user scrolled away — irrelevant for /watch's hero iframe but a free win). `youtube-nocookie.com` upgrade is a one-line `embed.replace('youtube.com', 'youtube-nocookie.com')` in Phase 7 if FOUND-03 wants it.

### Pattern 6: /work/[category] route with entries() (FILT-03/04, D-29/D-30)

```typescript
// src/routes/work/[category]/+page.ts
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import {
  CATEGORIES,
  categoryToSlug,
  slugToCategory,
  getByCategory,
} from '$lib/data';

export const entries: EntryGenerator = () =>
  CATEGORIES.map((c) => ({ category: categoryToSlug(c) }));

export const load: PageLoad = ({ params }) => {
  const category = slugToCategory(params.category);
  if (!category) error(404, 'Category not found');

  const videos = getByCategory(category).toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  });

  return { category, videos };
};
```

```svelte
<!-- src/routes/work/[category]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccent } from '$lib/components/categoryAccent';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Michelle Ngo — {data.category}</title></svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <h1 class="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-6 {categoryAccent(data.category)}">
    {data.category} ({data.videos.length})
  </h1>
  <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
```

### Pattern 7: /work route (no filter, all 56) (D-21/D-24/D-25/D-26)

```typescript
// src/routes/work/+page.ts
import type { PageLoad } from './$types';
import { videos } from '$lib/data';

export const load: PageLoad = () => ({
  videos: [...videos].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  }),
});
```

No `entries()` needed — this is a static route, prerendered by default via the layout's `prerender = true`.

### Pattern 8: Top nav (NAV-01, D-39/D-40/D-41/D-42)

```svelte
<!-- src/lib/components/TopNav.svelte -->
<script lang="ts">
  import { page } from '$app/state'; // SvelteKit 2.27+ reactive state API
  import { base } from '$app/paths';
  import {
    getCategoriesInDisplayOrder,
    categoryToSlug,
  } from '$lib/data';
  import { categoryAccent } from './categoryAccent';
  import MobileMenu from './MobileMenu.svelte';

  const categories = getCategoriesInDisplayOrder();

  let mobileOpen = $state(false);

  function isActive(slug: string): boolean {
    return page.url.pathname === `${base}/work/${slug}`;
  }
</script>

<header class="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10">
  <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
    <a href={base || '/'} class="text-sm font-bold uppercase tracking-widest">Michelle Ngo</a>

    <!-- Desktop links (≥sm) -->
    <ul class="hidden sm:flex items-center gap-4 text-xs uppercase tracking-wider">
      {#each categories as category (category)}
        {@const slug = categoryToSlug(category)}
        <li>
          <a
            href={`${base}/work/${slug}`}
            data-sveltekit-preload-data="hover"
            class={isActive(slug) ? categoryAccent(category) : 'text-neutral-300 hover:text-white'}
          >{category}</a>
        </li>
      {/each}
      <li class="ml-2 flex gap-3 text-neutral-500">
        <a href={`${base}/about`}>About</a>
        <a href={`${base}/press`}>Press</a>
        <a href={`${base}/contact`}>Contact</a>
      </li>
    </ul>

    <!-- Hamburger (<sm) -->
    <button
      class="sm:hidden p-2 -mr-2"
      aria-label="Open menu"
      onclick={() => (mobileOpen = true)}
    >
      <span class="block w-5 h-0.5 bg-white mb-1"></span>
      <span class="block w-5 h-0.5 bg-white mb-1"></span>
      <span class="block w-5 h-0.5 bg-white"></span>
    </button>
  </nav>
</header>

{#if mobileOpen}
  <MobileMenu onclose={() => (mobileOpen = false)} />
{/if}
```

**Why this works:**
- `getCategoriesInDisplayOrder()` is the single source of truth (Phase 2 D-04). No drift.
- Active state via `page.url.pathname` matching — works on `/work/[category]` only (D-41). `/work` and `/watch/[id]` show no active category, matching D-41.
- `import { page } from '$app/state'` is the Svelte 5 / SvelteKit 2.27+ rune-friendly API (replaces the legacy `$page` store). Confirm `@sveltejs/kit@2.59.1` (current) supports it — yes, it shipped in 2.27.
- Hamburger toggles a local `$state` boolean → conditional `MobileMenu` render. No global store.
- About/Press/Contact get `text-neutral-500` for "quieter weight" per D-40.

### Anti-Patterns to Avoid

- **Nested `<a>` tags** — A category chip on the card MUST NOT be a link (D-13). HTML doesn't allow `<a><a></a></a>`. The chip on `/watch/[id]` metadata IS a link (D-35) because it's not nested in a card link there.
- **Hard-coded category list in TopNav** — Always use `getCategoriesInDisplayOrder()` from `$lib/data`. The category strings have one source of truth (Phase 2 `categories.ts`).
- **Forgetting `import { base } from '$app/paths'`** — Any hardcoded `href="/work/..."` breaks under `BASE_PATH` (Phase 1 D-08 / GitHub Pages context). Every internal href MUST be `${base}/...`. The current build hosts on Cloudflare Pages with empty base path, but the indirection costs nothing and future-proofs against domain moves.
- **Client-side filter store** — Don't introduce a `$state` filter store at the layout level. The path-param IS the state. Reading `$page.url.pathname` (or `page.url.pathname` via `$app/state`) gives the filter on demand.
- **Mutating the shared `videos` array** — Always `.toSorted()` / `[...videos].sort()` / `.filter()`. The Phase 2 loader exposes `readonly Video[]` types specifically to prevent this; mutating is a TS error.
- **Computing rail at runtime via fetch** — The rail data is build-time; embed it into the prerendered HTML via `+page.ts` `load()`. Don't ship `videos.json` to the client.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive grid with consistent gaps | Hand-rolled CSS grid template + media queries | Tailwind `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3` | One line of classes vs. 20 lines of CSS; built into Tailwind v4 |
| 16:9 aspect-ratio container | `padding-bottom: 56.25%` hack | Tailwind `aspect-video` utility | Native `aspect-ratio` CSS property; reserves space, no JS |
| 2-line title truncation | Manual JS title shortening | Tailwind `line-clamp-2` | Native `-webkit-line-clamp` CSS; built into Tailwind v4 by default (no plugin) |
| Image blur-up state | IntersectionObserver + custom load logic | `<img loading="lazy">` + `onload={() => loaded = true}` | Native browser lazy loading; one line of Svelte 5 `$state` for fade-in |
| Slug → category lookup | Build a custom slug map in route code | Phase 2 `slugToCategory(slug)` from `$lib/data` | Already memoized; returns `Category | undefined`; one import |
| Display-order categories for nav | Hand-sort the category list | Phase 2 `getCategoriesInDisplayOrder()` | Already computed at module load (count desc, ties alpha) |
| Active route detection | Hand-roll a route store | `import { page } from '$app/state'` | SvelteKit 2.27+ rune-friendly reactive state; zero deps |
| Prerender route enumeration | List 56+8 routes in `svelte.config.js` `prerender.entries` | Per-route `export const entries: EntryGenerator` | Canonical SvelteKit 2 pattern; co-located with the route it generates |
| Iframe lazy-load | IntersectionObserver-based load gate | `<iframe loading="lazy">` | Native; modern-browsers-only constraint covers it |
| Hover-prefetch | Custom mouseenter handler that fetches next page | `data-sveltekit-preload-data="hover"` | Built into SvelteKit; warms route module + load data |
| Internal link base path | Hard-code `/work/...` everywhere | `import { base } from '$app/paths'` + `${base}/work/...` | Phase 1 contract; one-line fix if domain moves |
| Watch route 404 handling | Render an "unknown video" UI | `import { error } from '@sveltejs/kit'; error(404, ...)` | Triggers `+error.svelte`; clean prerender exit |
| Category accent colors | One-off color values in each component | Tailwind v4 `@theme` block + `text-cat-{slug}` utility classes | Single source of truth in CSS; one rename = one edit |

**Key insight:** Phase 3 is almost entirely composition of existing primitives. The only NEW code that doesn't have a stronger pre-built alternative is (a) the `VideoCard` component shape, (b) the `categoryAccent` map, (c) the `TopNav` / `MobileMenu` markup, (d) the route load functions. Everything else is import-and-use.

---

## Runtime State Inventory

This is a greenfield phase — no rename, refactor, or migration. **Section omitted.**

---

## Common Pitfalls

### Pitfall 1: Forgetting `entries()` on dynamic routes — strict mode bites at build time
**What goes wrong:** `pnpm build` exits non-zero late in the build with "the following routes were not prerendered: /work/[category]" or similar.
**Why it happens:** SvelteKit's auto-crawler discovers links during prerender, but if your `/work` page has a bug that suppresses some cards, those `/watch/[id]` routes aren't discovered, and `adapter-static` with `strict: true` (set in Phase 1 `svelte.config.js`) fails the build.
**How to avoid:** Always `export const entries: EntryGenerator = () => …` from `+page.ts` for both `[category]` and `[id]`. Use the data layer directly (`videos.map(v => ({ id: v.id }))` and `CATEGORIES.map(c => ({ category: categoryToSlug(c) }))`). This is deterministic and decoupled from link-emission bugs.
**Warning signs:** Build error mentioning "not prerendered" or "strict"; missing HTML files in `build/work/...` after `pnpm build`.

### Pitfall 2: `noUncheckedIndexedAccess` + `Video | undefined` not narrowed
**What goes wrong:** `svelte-check` (and `pnpm build`'s type-check pass) fails with "Object is possibly 'undefined'" in the load function or watch page.
**Why it happens:** Phase 1 D-14 locks `noUncheckedIndexedAccess`. `getById(params.id)` returns `Video | undefined`; `slugToCategory(slug)` returns `Category | undefined`. You can't access `video.title` without narrowing first.
**How to avoid:** Always pattern: `const video = getById(params.id); if (!video) error(404, 'Video not found');` — after this, TypeScript knows `video` is `Video`. The `error()` helper has return type `never`, so the narrowing is sound.
**Warning signs:** TS errors with "possibly undefined" at any property access on `video` or `category`.

### Pitfall 3: Hardcoded `/work/...` href breaks under non-empty `BASE_PATH`
**What goes wrong:** Internal links 404 in production. Currently invisible on Cloudflare Pages (empty base path), but lands the moment the site moves to a sub-path host (e.g., GitHub Pages staging or `michellengo.net/portfolio/...`).
**Why it happens:** Phase 1's `svelte.config.js` reads `paths.base` from `BASE_PATH` env var. SvelteKit doesn't auto-rewrite hardcoded `/work/...` strings; only `${base}/work/...` is base-path-aware.
**How to avoid:** Every internal `href` MUST be `${base}/...`. ESLint rule? Hard to enforce automatically — code review catches it. Pattern: `import { base } from '$app/paths'` at the top of every component with internal links.
**Warning signs:** Links work in dev but 404 in production; works on Cloudflare staging but fails when hosted under a sub-path.

### Pitfall 4: Nested `<a>` tags from making the category chip clickable on the card
**What goes wrong:** HTML validator errors; some browsers render unpredictably; keyboard focus order breaks; click events bubble strangely.
**Why it happens:** The whole card is wrapped in `<a href="/watch/...">` (D-13). If you nest a chip `<a href="/work/...">`, you've created invalid `<a><a></a></a>` markup.
**How to avoid:** CONTEXT D-13 explicitly forbids this. `CategoryTag` is a `<span>` when used inside `VideoCard`; a `<a>` only when used on `/watch/[id]` metadata. The `CategoryTag` component takes an optional `href` prop and switches between `<span>` and `<a>` accordingly (Pattern 4).
**Warning signs:** `svelte-check` or `eslint-plugin-svelte` warnings about nested interactive elements (the rule `no-nested-interactive` may or may not be on by default; verify).

### Pitfall 5: Watch page iframe blocked by browser autoplay policy
**What goes wrong:** The iframe loads but the user clicks "Play" and gets no audio (or the video doesn't start). Confusing UX.
**Why it happens:** Modern browsers block autoplay-with-sound. If we passed `?autoplay=1` to YouTube/Vimeo, sound would be muted until interaction.
**How to avoid:** CONTEXT D-33 locks NO autoplay. The user clicks the play button inside the iframe (the platform's native control), which is a user gesture and unblocks audio. The `allow="autoplay; encrypted-media; ..."` attribute on the iframe is for the iframe's INTERNAL autoplay use, not ours.
**Warning signs:** Don't add `autoplay=1` to the embed URL.

### Pitfall 6: `data-sveltekit-preload-data="hover"` prefetch storm on a card-dense /work page
**What goes wrong:** On a 56-card page, a user mouse-pans across the grid and SvelteKit fires ~56 route module + data prefetches in seconds.
**Why it happens:** `hover` triggers on `mouseenter` with a small dwell time (~50ms by default). With dense cards, dwell hits easily.
**How to avoid:** SvelteKit only prefetches **once per route** per session (it dedupes), and `/watch/[id]` is a unique URL per card — so worst case is 56 prefetches over a long browse, not 56 per hover. Each prefetch is small (~few KB of route module + the load function data). For a 56-video site, this is fine. If Phase 7 perf budget complains, switch to `data-sveltekit-preload-code="hover" data-sveltekit-preload-data="tap"` (preload code on hover, data on tap) per the SvelteKit Link options docs. For now: keep `hover` (D-14).
**Warning signs:** Network panel showing 50+ requests on a single browse session; Cloudflare egress concerns (free tier is generous, but visible).

### Pitfall 7: Tailwind v4 `@theme` accent colors not generating utility classes
**What goes wrong:** `text-cat-pbs` class has no effect in the browser — falls back to default text color.
**Why it happens:** Tailwind v4 generates utility classes from `@theme` variables AT BUILD TIME. If the `@theme` variable name doesn't match the convention `--color-{name}`, the `text-{name}`, `bg-{name}` utilities aren't generated. Tailwind v4 also requires the class to appear literally in the source (or in a safelist) — `categoryAccent(category)` returning a dynamic class string is a known footgun.
**How to avoid:** (1) Use `--color-cat-pbs` naming. (2) Because `categoryAccent()` is a static `Record<Category, string>` literal, Tailwind's scanner DOES see all 8 class strings in the source file. Verify by checking the built CSS contains `.text-cat-pbs`. If not, add a `@source` directive in `app.css` pointing at `categoryAccent.ts`, or list classes in a comment that Tailwind scans.
**Warning signs:** Colored tags appear gray/uncolored in production builds despite working in dev.

### Pitfall 8: `+layout.ts` `prerender = true` doesn't auto-prerender dynamic routes without `entries()`
**What goes wrong:** Confusion when `prerender = true` exists but dynamic routes still need explicit enumeration.
**Why it happens:** `prerender = true` tells the prerenderer "render this route". For static routes that's enough. For dynamic routes, the prerenderer still needs to know WHICH parameter values to render. Without `entries()`, only the param values present in crawled links get rendered.
**How to avoid:** `entries()` is the explicit, deterministic way. Don't rely on auto-crawl alone — pair `prerender = true` (inherited from layout) with `entries()` per route.
**Warning signs:** Build succeeds but production /watch/[id] requests for some ids fall through to the SPA fallback or 404.

### Pitfall 9: `noindex` meta tag inheritance (Phase 1 D-11) leaks past Phase 7 cutover
**What goes wrong:** Production site launches with `<meta name="robots" content="noindex, nofollow">`, suppressing all Google indexing.
**Why it happens:** Phase 1 added a global `<meta name="robots" content="noindex, nofollow">` to `+layout.svelte` to block staging indexing. CONTEXT carry-forward note says "noindex robots meta on every route (stays through Phase 6)" — Phase 7 must flip it.
**How to avoid:** Phase 3 does NOT touch this meta tag. Document in Phase 7 plan that the meta must be removed (or made env-conditional) at production cutover.
**Warning signs:** N/A for Phase 3 — but flagged here so Phase 7's research re-discovers it.

---

## Code Examples

All canonical patterns are in **Architecture Patterns** above (Patterns 1–8). Each is annotated with the CONTEXT decision it implements and its source.

### Quick reference: prerender entry-generator types

```typescript
// All from './$types' which SvelteKit generates from the route file
import type { EntryGenerator, PageLoad } from './$types';

// EntryGenerator: () => Array<Record<string, string>> | Promise<Array<...>>
// PageLoad: (event: { params, fetch, url, ... }) => Promise<Data> | Data
```

### Quick reference: error helper

```typescript
// Source: svelte.dev/docs/kit/load
import { error } from '@sveltejs/kit';

// Throws HTTPError; renders nearest +error.svelte; return type is `never`.
if (!video) error(404, 'Video not found');
// After this line, TS knows `video` is non-undefined.
```

### Quick reference: $app/state (SvelteKit 2.27+) for reactive page data

```typescript
// Source: svelte.dev/docs/kit (verified for kit@2.59)
import { page } from '$app/state'; // rune-friendly, not a store

// Inside any .svelte file:
$inspect(page.url.pathname); // reactive
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `$page` store from `$app/stores` | `page` object from `$app/state` | SvelteKit 2.27 (late 2025) | Cleaner rune-compatible API; old store still works but `$app/state` is the recommended pattern in Svelte 5 codebases |
| `tailwindcss/plugin` config file with `theme.extend` | CSS-first `@theme` block in `app.css` | Tailwind v4 (2025) | No JS config; CSS variables drive utilities; Phase 1 D-02 locks this approach |
| `tailwindcss/line-clamp` plugin | `line-clamp-2` built-in | Tailwind v3.3 (2023); still default in v4 | No plugin needed |
| Padding-bottom hack for aspect ratio | `aspect-video` utility | Tailwind v3 (CSS `aspect-ratio` native support) | One class vs. wrapper hack |
| `<a rel="prefetch">` or custom hover handlers | `data-sveltekit-preload-data="hover"` | SvelteKit 1.0+ | Built-in; aware of load functions |
| `+page.ts` `load` returning `redirect()` for unknown params | `error(404, ...)` | SvelteKit 1.0+ | Triggers `+error.svelte`; idiomatic 404 |
| `$page.params` in components | Prefer narrowed `data` from `+page.ts` load | SvelteKit 1.0+ | Type-safety; data flow is unidirectional |

**Deprecated/outdated:**
- `npm create svelte@latest` → use `pnpm dlx sv create` (Phase 1 RESEARCH already documented)
- `tailwind.config.js` → CSS-first `@theme` in `app.css` for Tailwind v4
- Svelte 4 `export let` props → Svelte 5 `$props()` rune
- `$page` store → `page` from `$app/state` (still backward-compatible but flagged for migration in Svelte 5 docs)

---

## Open Questions

1. **Should the 8 category accent hex values land in this phase or be deferred?**
   - What we know: CONTEXT D-04 marks specific hex values as Claude's Discretion. Constraint: AA contrast on `bg-neutral-950`, PBS most prominent.
   - What's unclear: Whether to research a "canonical palette" via a tool like OKLCH picker / Coolors / a brand-safe palette, or just pick 8 hues by hand.
   - Recommendation: Plan 03-01 (VideoCard) is the natural home — it's the first consumer of `categoryAccent`. The planner can either (a) include the 8 colors directly in the plan, or (b) defer to implementation and require the implementer to hit AA contrast verified by a contrast checker. Option (b) is faster; option (a) means contrast verification happens once during planning. Lean: (a), because it's only 8 colors.

2. **Use `@testing-library/svelte` or bare `mount()` for VideoCard tests?**
   - What we know: svelte.dev/docs documents `mount()` + Vitest. RTL gives `getByRole`/`getByText` ergonomics but is "experimental" for Svelte 5.
   - What's unclear: Whether the planner wants the extra dep weight + the experimental tag, or prefers zero-dep bare `mount()`.
   - Recommendation: Bare `mount()` for Phase 3. Three reasons: (1) Phase 2 already established `vitest` in node environment for the data layer; Phase 3 component tests need `jsdom` regardless. (2) svelte.dev/docs uses bare `mount()` in its canonical example — match the source-of-truth. (3) The components in this phase are simple (props in, DOM out). RTL value-add is marginal.

3. **Should we add a Playwright E2E test for the filter URL round-trip?**
   - What we know: Playwright is the SvelteKit-blessed E2E tool. A test could navigate `/work/pbs-american-portrait`, count the rendered cards, click one, verify it lands on `/watch/[id]` and the rail renders.
   - What's unclear: Whether the planner wants the E2E gate at all in Phase 3 or defers to Phase 7 (the polish phase).
   - Recommendation: Defer Playwright to Phase 7. Phase 3 ships with: (a) `pnpm build` succeeding (proves all 70-ish routes prerender), (b) component-level Vitest tests for `VideoCard` and load function logic, (c) a one-time manual smoke test in `pnpm preview`. This matches the Nyquist Validation Architecture below.

4. **Sticky nav vs. static nav?**
   - What we know: CONTEXT marks this Claude's Discretion. Sticky has higher cognitive value when scrolling /watch metadata; static is simpler.
   - What's unclear: Whether sticky-at-desktop / static-at-mobile (the recommendation) creates an awkward animation transition.
   - Recommendation: Sticky everywhere with `position: sticky; top: 0; z-index: 30; backdrop-blur` — modern browsers handle this with no jank. The mobile hamburger overlay is `position: fixed` on top, so sticky/non-sticky doesn't affect its z-stacking. Single behavior is simpler and reads as one design intent.

5. **Confirm `youtube-nocookie.com` swap is a Phase 7 concern, not Phase 3?**
   - What we know: The current `embed` URLs in `videos.json` for YouTube records look like `https://www.youtube.com/embed/9Zmw69UZSsI`. Privacy-enhanced equivalents would be `https://www.youtube-nocookie.com/embed/9Zmw69UZSsI`.
   - What's unclear: Whether to do the swap NOW (one-line in `videos.json`, or one-line in the load function) or defer.
   - Recommendation: Defer to Phase 7. The swap is trivial when needed; doing it now without a perf/privacy budget driver risks scope creep.

---

## Validation Architecture

> Nyquist validation is enabled (`workflow.nyquist_validation: true` in `.planning/config.json`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 (already installed Phase 2) |
| Config file | `vite.config.ts` (Vitest config in `test:` block) — current `environment: 'node'` |
| Quick run command | `pnpm test` (runs all vitest, passes with `--passWithNoTests`) |
| Full suite command | `pnpm check && pnpm test && pnpm build` |
| New requirement | Phase 3 component tests need `environment: 'jsdom'` for `VideoCard` / `TopNav` — Wave 0 must either install `jsdom@latest` + change `vite.config.ts` test environment OR run component tests in a separate Vitest project with its own config |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GRID-01 | VideoCard renders thumb + title + tag + uploader | unit (component) | `pnpm vitest run src/lib/components/VideoCard.test.ts` | ❌ Wave 0 |
| GRID-02 | Grid uses 2/3/4 responsive classes (regression test on class strings) | unit (component) | `pnpm vitest run src/routes/work/work.test.ts` (testing class output) — OR drop as "design choice, verified visually" | ❌ Wave 0 (optional) |
| GRID-03 | `<img>` has `loading="lazy"` (or `eager` for first 8) + `transition-opacity` class + onload toggles `loaded` state | unit (component) | `pnpm vitest run src/lib/components/VideoCard.test.ts -t "lazy loading"` | ❌ Wave 0 |
| GRID-04 | Card `<a>` href is `${base}/watch/${video.id}` and has `data-sveltekit-preload-data="hover"` | unit (component) | `pnpm vitest run src/lib/components/VideoCard.test.ts -t "click target"` | ❌ Wave 0 |
| GRID-05 | Category tag renders with `categoryAccent(category)` class | unit (component) | `pnpm vitest run src/lib/components/CategoryTag.test.ts` | ❌ Wave 0 |
| FILT-01 | /watch/[id] load returns `video` for valid id; throws 404 for unknown id | unit (load fn) | `pnpm vitest run src/routes/watch/load.test.ts` | ❌ Wave 0 |
| FILT-02 | /watch/[id] load returns `rail` with same-category videos minus current, sorted by D-25 | unit (load fn) | `pnpm vitest run src/routes/watch/load.test.ts -t "rail"` | ❌ Wave 0 |
| FILT-03 | /work/[category] load returns category-filtered videos for valid slug; throws 404 for unknown slug | unit (load fn) | `pnpm vitest run src/routes/work/category-load.test.ts` | ❌ Wave 0 |
| FILT-03 | /work/[category] `entries()` returns all 8 category slugs | unit (entries fn) | `pnpm vitest run src/routes/work/category-load.test.ts -t "entries"` | ❌ Wave 0 |
| FILT-03 | /watch/[id] `entries()` returns all 56 video ids | unit (entries fn) | `pnpm vitest run src/routes/watch/load.test.ts -t "entries"` | ❌ Wave 0 |
| FILT-04 | Build produces 8 `/work/[category]/index.html` files + 56 `/watch/[id]/index.html` files | integration (build artifact) | `pnpm build && node scripts/test-prerender-coverage.mjs` (NEW script) | ❌ Wave 0 |
| NAV-01 | TopNav renders 8 category links in display order + About/Press/Contact | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts` | ❌ Wave 0 |
| NAV-01 | Active category link gets accent color class on `/work/[category]` route | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts -t "active"` (mock `page` from `$app/state`) | ❌ Wave 0 |
| Hidden-id 404 | /watch/unknown-id renders `+error.svelte` | smoke (build artifact) | `pnpm build` + verify `build/404.html` exists (already configured in svelte.config.js) | Yes (Phase 1) |

### Sampling Rate
- **Per task commit:** `pnpm test` (component + load fn unit tests)
- **Per wave merge:** `pnpm check && pnpm test`
- **Phase gate:** `pnpm check && pnpm test && pnpm build` — the `build` step proves all dynamic routes prerender successfully under `strict: true`. If `entries()` is incomplete, the build fails. This is the single strongest integration test in the suite.

### Wave 0 Gaps
- [ ] Install `jsdom@latest` (`-E`) — required for any component test that needs DOM access
- [ ] Either: (a) switch `vite.config.ts` test environment to `'jsdom'` globally (but the Phase 2 data-layer tests work fine in node), OR (b) split Vitest into two projects via `vitest.workspace.ts` — one node project for `src/lib/data/`, one jsdom project for `src/lib/components/` and `src/routes/`. Option (b) is cleaner; option (a) is simpler.
- [ ] `src/lib/components/VideoCard.test.ts` — covers GRID-01, GRID-03, GRID-04
- [ ] `src/lib/components/CategoryTag.test.ts` — covers GRID-05
- [ ] `src/lib/components/TopNav.test.ts` — covers NAV-01 (with mocked `$app/state` `page`)
- [ ] `src/routes/work/+page.test.ts` — covers /work load function (D-25 sort)
- [ ] `src/routes/work/[category]/+page.test.ts` — covers FILT-03 load + entries
- [ ] `src/routes/watch/[id]/+page.test.ts` — covers FILT-01 + FILT-02 load + entries
- [ ] `scripts/test-prerender-coverage.mjs` — NEW Node script that counts prerendered HTML files in `build/work/` (must be ≥9 after build: `index.html` + 8 category subdirs) and `build/watch/` (must be ≥56 subdirs). Runs as `pnpm test:prerender` and gates phase merge.
- [ ] Optional: `@testing-library/svelte` — recommend bare `mount()` instead (see Open Question 2)

**Minimal test plan that proves each Phase 3 success criterion:**

| Success Criterion (from CONTEXT) | Proving Test |
|---|---|
| 1. /work shows 56 cards with required fields; 2/3/4 responsive | Component test asserts class strings + grid renders all videos.length items |
| 2. Thumbnails blur-up (fade-in) from placeholder | Component test asserts `<img>` starts `opacity-0` and gets `loaded`-state class on `onload` event simulation |
| 3. Click card → /watch/[id] plays + "More in [Category]" rail | Load fn test for /watch/[id] returns correct rail; component test for /watch page asserts iframe present + rail renders |
| 4. /work/[category] reproduces filtered state from URL alone | Load fn test asserts `getByCategory()` output matches; build artifact test asserts 8 `/work/[category]/index.html` files exist |
| 5. Top nav with categories + About/Press/Contact | Component test for TopNav asserts 8 + 3 links present with correct hrefs |

---

## Risks & Open Questions

(See "Open Questions" section above for the 5 deferred decisions.)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| External thumbnail CDN goes down → broken cards | Low | Medium | Out of scope for v1; Phase 7 could mirror thumbs to repo. Reverify CDN reliability before launch. |
| Vimeo/YouTube embed iframe blocked by ad-blocker | Medium | Medium | Affects every video portfolio site; not solvable at app level. Document in README. |
| Tailwind v4 `@theme` not picking up category color variables | Low | High | Pitfall 7 above; verify the built CSS contains `.text-cat-pbs` after first `pnpm build`. |
| Prerender count explodes if `featured` curation later sets many flags | None | None | Featured is a sort key, not a prerender driver. Adding `featured: true` to rows doesn't add routes. |
| `noindex` meta leaks past Phase 7 cutover (Pitfall 9) | Medium | High | Document in Phase 7 plan; not Phase 3's concern but flagged here. |
| Card hover prefetch storm on Cloudflare egress (Pitfall 6) | Low | Low | Cloudflare Pages free tier is generous; SvelteKit dedupes per session. Switch to `tap` strategy if observed. |

---

## References

### Primary (HIGH confidence)
- **svelte.dev/docs/kit/page-options** — `entries()` export contract, prerender semantics. Fetched 2026-05-11.
- **svelte.dev/docs/kit/adapter-static** — `strict: true` behavior; fallback semantics. Fetched 2026-05-11.
- **svelte.dev/docs/kit/load** — `load()` function with `params`, `error()` helper from `@sveltejs/kit`. Fetched 2026-05-11.
- **svelte.dev/docs/kit/link-options** — `data-sveltekit-preload-data` hover/tap/viewport semantics and best practices. Fetched 2026-05-11.
- **svelte.dev/docs/svelte/$props** — Typed `$props()` patterns for Svelte 5. Fetched 2026-05-11.
- **svelte.dev/docs/svelte/$state** — `$state()` runes, reactivity model. Fetched 2026-05-11.
- **svelte.dev/docs/svelte/testing** — Canonical Svelte 5 component test setup with Vitest + jsdom + `mount()`. Fetched 2026-05-11.
- **tailwindcss.com/docs/aspect-ratio** — `aspect-video` utility. Fetched 2026-05-11.
- **tailwindcss.com/docs/line-clamp** — `line-clamp-2` built-in since v3.3 / available in v4 by default. Fetched 2026-05-11.
- **help.vimeo.com/hc/en-us/articles/12426260232977** — Vimeo player iframe URL parameters (`dnt`, `autoplay`, etc.). Fetched 2026-05-11.
- **web.dev/articles/embed-best-practices** — Lazy-loading iframes, facade pattern. Fetched 2026-05-11.

### Secondary (MEDIUM confidence — verified against primary)
- **amandaguthrie.dev/post/svelte-prerender-dynamic-paths-for-ssg** — Concrete `EntryGenerator` example matching svelte.dev/docs. Confirms pattern is current.
- **github.com/paulirish/lite-youtube-embed** — Facade web component reference for Phase 7 deferred upgrade.

### Project context (HIGH confidence — source-of-truth)
- `.planning/phases/03-grid-filter-watch/03-CONTEXT.md` — Locked decisions D-01..D-44.
- `.planning/REQUIREMENTS.md` — GRID-01..05, FILT-01..04, NAV-01 success criteria.
- `.planning/ROADMAP.md` — Phase 3 boundary and downstream phase scope.
- `.planning/phases/02-data-layer/02-CONTEXT.md` — Phase 2 carry-forward: `$lib/data` public surface, `Video` / `Category` types, slug rules.
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 carry-forward: Svelte 5 runes, Tailwind v4 CSS-first, adapter-static `strict: true`, `noUncheckedIndexedAccess`, `BASE_PATH`, `noindex` meta.
- `src/lib/data/index.ts` — The `$lib/data` import surface.
- `src/lib/data/categories.ts` — Single source of truth for category names + slug rule.
- `src/lib/data/videos.ts` — Loader + helpers (`getById`, `getByCategory`, `getCategoriesInDisplayOrder`, etc.).
- `svelte.config.js` — `paths.base` wired to `BASE_PATH` env var; `adapter-static` config.
- `vite.config.ts` — Existing `validateVideosPlugin` + Vitest config to extend.
- `package.json` — Pinned exact deps; pnpm@11.0.9.

### Tertiary (LOW confidence — flagged for verification)
- *None — every load-bearing claim in this document is sourced from primary (svelte.dev / tailwindcss.com / vimeo.com / web.dev) or the project's own locked-decision documents.*

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every dep already installed (Phase 1 + Phase 2); no new runtime deps; testing deps verified against svelte.dev current docs.
- Architecture patterns: **HIGH** — all 8 patterns verified against current SvelteKit 2 / Svelte 5 docs and current Tailwind v4 utility availability.
- Pitfalls: **HIGH** — Pitfalls 1, 2, 3 are directly evidenced by Phase 1's locked decisions (`strict: true`, `noUncheckedIndexedAccess`, `BASE_PATH`). Pitfalls 4–8 are documented gotchas in their respective tool docs. Pitfall 9 is a forward-looking note.
- Validation Architecture: **HIGH** — test framework already present (Vitest 4.1.5); only gap is `jsdom` + a Vitest workspace split for jsdom-needing tests vs. node tests.

**Research date:** 2026-05-11
**Valid until:** 2026-06-10 (30 days; nothing in scope is fast-moving — SvelteKit 2 / Svelte 5 / Tailwind v4 are all stable. Refresh sooner only if `@sveltejs/kit` ships a major routing change.)
