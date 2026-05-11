# Phase 4: Reel-Led Home - Research

**Researched:** 2026-05-11
**Domain:** SvelteKit 2 + Svelte 5 runes + Tailwind v4 — full-bleed hero composition, scroll-aware nav via IntersectionObserver, LCP-optimized hero image, curated featured grid
**Confidence:** HIGH (all critical claims verified against Svelte/Tailwind/MDN official docs)

## Summary

Phase 4 is mostly a **composition phase, not a discovery phase**. CONTEXT.md decisions D-01..D-28 lock the entire visual + interaction surface; this research validates the *implementation mechanics* the planner will translate into tasks and curates the 8 featured videos so the planner can drop the table straight into PLAN.md.

The five mechanics that actually require verification — Svelte 5 `$effect` cleanup for IntersectionObserver, Tailwind v4's `min-h-dvh` utility, `<img fetchpriority="high">` browser support, the `object-[center_30%]` arbitrary-value syntax, and Vite's asset fingerprinting for `$lib/assets` imports — all check out at **HIGH confidence**. No reach goals, no novel patterns. Phase 4 is a *deliberate* page composition that reuses the entire Phase 3 surface (VideoCard, TopNav, base-path wiring, focus-ring utilities, hover-prefetch attribute) and adds exactly **two new surfaces**: a `HeroPoster.svelte` component (recommended split) and a `scroll-aware-on-/` mode inside the existing TopNav.

The one substantive deliverable beyond mechanics-verification: the **curated 8-video featured slice** (§Featured Slice Curation below) — D-23 quota satisfied, picks justified, ready for user approval before flipping `featured: true` bits.

**Primary recommendation:** Extract `HeroPoster.svelte` (image + gradient + name + tagline + CTA + scroll cue + sentinel), let TopNav own the IntersectionObserver via `$effect` reading `page.route.id` from `$app/state`, and **preload the hero asset via `<svelte:head><link rel="preload" as="image">`** in addition to `<img loading="eager" fetchpriority="high">` — the LCP win is documented at 200–400ms in production sites and SvelteKit's prerendered HTML can ship the preload hint in the initial document.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero medium**
- **D-01:** Static hero image + PLAY REEL CTA (Sam Hendi pattern). No looping video in v1.
- **D-02:** Poster frame grabbed from her Producer's Reel (Vimeo `264677021`) and checked into the repo as a static asset. Frame: striking still where Michelle is NOT on-camera. Lean cinematic with depth (e.g., wide shot from PBS American Portrait work). Exact frame is Claude's Discretion (planner authors).
- **D-03:** Asset location `src/lib/assets/hero-poster.<ext>` — Vite bundles + fingerprints + cache-busts via content hash. `import heroPoster from '$lib/assets/hero-poster.jpg'`.
- **D-04:** Format: planner picks `.jpg` or `.webp`. Single asset in v1. Target compression: under ~150KB if achievable without artifacts.
- **D-05:** Bottom gradient overlay: `bg-gradient-to-t from-black/80 via-black/20 to-transparent`. Anchored to the lower band. NOT a full uniform dim.
- **D-06:** Single image for all breakpoints with `object-cover` + `object-position: center 30%` (or planner-tuned focal point). Tailwind: `object-cover object-[center_30%]`.
- **D-07:** `alt=""` on the hero poster `<img>` (decorative). `loading="eager"` + `fetchpriority="high"`. No `decoding="async"`.

**Hero composition**
- **D-08:** Name renders as all-caps tracked wordmark at hero scale. Classes: `text-6xl md:text-8xl lg:text-9xl tracking-widest uppercase font-bold` (planner can tune ±1 step).
- **D-09:** Tagline: **`Filmmaker & Producer`** — role-first. Stored inline in `/+page.svelte`. One line, no period. `text-sm md:text-base tracking-wide text-neutral-300 uppercase` (or planner equivalent).
- **D-10:** Hero height: full viewport, mobile-safe. `min-h-dvh`. Falls back to `min-h-screen` on browsers without `dvh` support. Featured grid sits below the hero (does NOT peek above the fold on desktop).
- **D-11:** Scroll cue at bottom-center of the hero. Small chevron glyph (down arrow), white ~60% opacity, no microcopy. ~40px above the hero's bottom edge.
- **D-12:** Text composition: left-aligned stack at lower-left of the hero. Order: NAME → tagline → CTA button. Container: `flex flex-col items-start justify-end pb-16 lg:pb-24 pl-6 sm:pl-10 lg:pl-16`. Sits over gradient-darkened lower band.
- **D-13:** TopNav goes scroll-aware ON `/` ONLY. Over hero: transparent. Past hero: existing `bg-neutral-950/95 backdrop-blur`. Every other route keeps the solid background.
- **D-14:** TopNav transparency wired via IntersectionObserver on a sentinel below the hero. Implementation lives inside `TopNav.svelte` (reads `page.route.id` from `$app/state`; observer only attaches when route is `/`). `+layout.svelte` does NOT change.
- **D-15:** Old `/` splash markup replaced entirely.

**PLAY REEL behavior**
- **D-16:** PLAY REEL is a regular anchor link: `<a href={` + "`${base}/watch/${producerReelId}`" + `}>`. NOT a modal, NOT inline-expand.
- **D-17:** `producerReelId` consumed from `$lib/data`.
- **D-18:** Outlined button. 1px white border, transparent fill, label "▷ PLAY REEL" all-caps tracked. Classes: `inline-flex items-center gap-2 border border-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`.
- **D-19:** Leading glyph "▷" unicode character. No icon system.
- **D-20:** Hover prefetch: `data-sveltekit-preload-data="hover"` on the anchor.

**Featured grid**
- **D-21:** `/` shows the featured slice ONLY, not the full 56.
- **D-22:** Featured slice size: 8 cards. Every featured card passes `eager={true}` to VideoCard.
- **D-23:** Featured composition (cross-category sampler): PBS American Portrait ×2, Promos & Trailers ×2, Branded Content ×2, Documentary/Short Film ×1, Reel ×1. Picks via date-desc within category + client recognizability tiebreaker. Reel slot MUST be the Producer's Reel (Vimeo `264677021`).
- **D-24:** `featured: true` flag flipped on 8 rows of `src/lib/data/videos.json`.
- **D-25:** Grid markup mirrors `/work` literally (same `<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">`, same `<VideoCard>`, same `max-w-7xl px-4 sm:px-6 lg:px-8` container, same keyed `{#each}`).
- **D-26:** Filter logic at module load: `videos.filter(v => v.featured)`. Then Phase 3 D-25 ordering applies. Lives in page's load function (or inline at top of `+page.svelte`).
- **D-27:** NO section heading above the featured grid. Sam-hendi-faithful. Normal `py-8` vertical rhythm.
- **D-28:** "View All Work →" link below grid. Plain text, all-caps tracked, centered, trailing right-arrow glyph. Anchors to `${base}/work`. `block text-center mt-8 text-sm tracking-widest uppercase hover:underline`. Includes `data-sveltekit-preload-data="hover"`.

### Claude's Discretion

- Exact poster frame from Vimeo 264677021 — planner picks; wide cinematic still where Michelle isn't on-camera, with depth and dark areas in the lower band so gradient + text composite cleanly.
- Image format (jpg vs webp) and target compression — single asset, ~150KB target if achievable without artifacts.
- Exact `object-position` value for mobile cropping — start with `center 30%`; tune in Phase 7.
- Scroll-cue glyph — chevron (recommended) vs arrow vs "SCROLL" microcopy. Lean single chevron, no text.
- Scroll threshold for TopNav transparent→solid transition — recommended IntersectionObserver sentinel at hero's bottom edge.
- Outlined button hover state — recommend `hover:bg-white hover:text-black`; planner can swap to `hover:bg-white/10` for quieter treatment.
- Exact `text-*xl` scale for wordmark — recommend `text-6xl md:text-8xl lg:text-9xl` (planner ±1 step).
- "View All Work →" microcopy + arrow glyph — "→" unicode is fine. Could be "View All 56 Videos →" if explicit count helps; default to "View All Work →".
- **HeroPoster.svelte vs inline composition** — recommend extracting `HeroPoster.svelte`. Cleaner testability + page route stays a thin composition.

### Deferred Ideas (OUT OF SCOPE)

- Looping background video hero — Phase 7 polish if budget has headroom.
- Hybrid poster→loop swap on idle — same perf concern.
- Modal/lightbox PLAY REEL — violates HERO-03.
- Inline-expand PLAY REEL — most engineering overhead for least benefit.
- 6 featured cards or 12 featured cards — 8 won (D-22).
- All 56 with featured on top on `/` — duplicates `/work` exactly.
- Featured-only with NO "View All Work" link — hostile to discovery.
- Featured grid section heading — hero scroll cue + grid itself communicate intent.
- Centered hero text composition — breaks editorial cinematic feel.
- Bold non-uppercase wordmark on hero — breaks consistency with splash + TopNav wordmark.
- PBS-heavy featured composition (4 PBS + 2 Promos + 2 Branded) — cross-category sampler won.
- Client-name-heavy featured composition — risks mixing strong + weak work.
- Solid white PLAY REEL button — reads as "product CTA" not "film portfolio".
- Text-link PLAY REEL — less discoverable.

**Phase 7 polish work (deferred):** True LQIP base64 placeholder, `<picture>` portrait crop for mobile, `srcset` retina, AVIF + format fallbacks, OG/Twitter card image, scroll-cue pulse animation.

**Out of scope (other phases):** `/pbs` PBS landing — Phase 5. `/press`, `/about`, `/contact` real content + footer + footer-mirrored nav — Phase 6. FOUND-03 <2s perf budget + true LQIP + srcset/`<picture>` + OG metadata + production cutover — Phase 7. `prefers-reduced-motion` handling — N/A (hero is static).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | Home page renders a full-bleed hero (looping reel video or hero image + PLAY REEL CTA) above the fold on desktop and mobile | Static-image branch per D-01. §Standard Stack confirms `min-h-dvh` (Tailwind v4 built-in) + `<img loading="eager" fetchpriority="high">` covers full-viewport + LCP-optimized delivery. §Architecture Patterns shows the absolute-positioned image + gradient + content-flex stack. |
| HERO-02 | Hero shows Michelle's name and a tone-setting tagline above the fold | D-08 wordmark scale + D-09 "Filmmaker & Producer" tagline + D-12 left-aligned `justify-end` stack ensures legibility across all breakpoints. Verified: `tracking-widest uppercase font-bold` is the locked-in Phase 1 splash typography reused at hero scale. |
| HERO-03 | PLAY REEL CTA opens her producer's reel in the watch view | D-16 anchor `<a href={` + "`${base}/watch/${producerReelId}`" + `}>` literally navigates to `/watch/264677021/` (the existing Phase 3 prerendered route). Free wins inherited: deep-linkable, gets `/watch`'s "More in Reel" rail, browser back button works. D-20 hover prefetch + verified SvelteKit preload-data behavior (§Common Pitfalls) means the click is instant after hover. |
</phase_requirements>

## Standard Stack

### Core (already installed — Phase 1/2/3 inheritance)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| svelte | 5.55.5 | Runes API (`$state`, `$effect`, `$props`, `$derived`) for HeroPoster + TopNav scroll-aware mode | Locked Phase 1 D-01; Svelte 5 is current production track. `$effect` is the canonical lifecycle for browser-only side effects (IntersectionObserver, addEventListener) per [Svelte docs](https://svelte.dev/docs/svelte/$effect). |
| @sveltejs/kit | 2.59.1 | `$app/state` `page` (reactive route id), `$app/paths` `base`, prerender of `/` | `page.route.id` is reactive in Svelte 5 from `$app/state`. The Phase 3 TopNav already reads `page.url.pathname` from `$app/state`. |
| @sveltejs/adapter-static | 3.0.10 | `/` prerenders to `build/index.html` at build time — no `entries()` needed (single static route) | Locked Phase 1 D-06. `strict: true` already set in `svelte.config.js`. |
| @tailwindcss/vite | 4.3.0 | `min-h-dvh`, `bg-gradient-to-t`, `object-cover`, `object-[center_30%]`, `tracking-widest`, etc. | Locked Phase 1 D-02. CSS-first config in `app.css` (`@theme`). All hero utilities are core. |
| typescript | 5.9.3 | Strict + `noUncheckedIndexedAccess` + `noImplicitOverride` | Locked Phase 1 D-14. `videos.filter(v => v.featured)` returns `Video[]` (safe under the flag). |
| vite | 8.0.7 | Asset bundling for `$lib/assets/hero-poster.jpg` — content-hash fingerprinting + emit to `_app/immutable/assets/` | The `import heroPoster from '$lib/assets/hero-poster.jpg'` pattern is the official SvelteKit recommendation; Vite produces hashed filenames (`hero-poster-<hash>.jpg`) and rewrites the import to the hashed URL. |

### Supporting (already installed — testing inheritance)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 4.1.5 | Component + route tests for HeroPoster (smoke), `/+page.svelte` (renders 8 featured cards + View-All link), TopNav (scroll-aware mode unit) | UI project (jsdom env). Inherits Phase 3 `vite.config.ts` `test.projects` split (data=node, ui=jsdom). |
| jsdom | 29.1.1 | DOM for component tests | Already wired in `ui` project per `vite.config.ts`. `IntersectionObserver` is NOT available in jsdom by default — see §Common Pitfalls Pitfall 3 for mocking strategy. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff | Verdict |
|------------|-----------|----------|---------|
| `IntersectionObserver` for TopNav transparency flip | `addEventListener('scroll', ...)` + rAF | Scroll listener fires on every frame; needs `requestAnimationFrame` debouncing; less precise threshold | **REJECTED** per D-14 (CONTEXT lock). IntersectionObserver is the modern idiom — single observer call, browser-batched, clean teardown via `disconnect()`. |
| `<picture>` with multiple sources | Single `<img>` + `object-position` | `<picture>` adds responsive art-direction (portrait crop on mobile) | **DEFERRED to Phase 7** per D-06. v1 ships single asset with `object-[center_30%]` tuning. |
| Self-hosted webfont for the hero name | OS font stack from Phase 3 D-03 | Webfont = custom brand voice; zero-load = better LCP | **DEFERRED** — Phase 3 D-03 locks no webfonts. Phase 7 polish can upgrade if brand identity requires. |
| `<link rel="preload" as="image">` + `<img>` | `<img loading="eager" fetchpriority="high">` alone | Preload starts the fetch earlier in the doc parse (saves ~200–400ms LCP per [SvelteKit LCP optimization article](https://www.cebre.us/blog/optimising-sveltekit-head-lcp/)) | **RECOMMEND BOTH** for prerendered routes — preload hint ships in the static HTML head; `<img>` element gets `fetchpriority="high"` as a secondary signal. Cost is ~1 line in `<svelte:head>`. |
| `+page.ts` load function with `videos.filter(v => v.featured)` | Inline filter at top of `+page.svelte` `<script>` | Load function returns typed `PageData` consumed by `+page.svelte` (matches Phase 3 `/work` pattern); inline is simpler | **RECOMMEND `+page.ts`** for consistency with Phase 3 `/work/+page.ts` (D-26 ordering rule shape). Featured filter is module-load (no async), so no perf cost. |

**Installation:** None — every dep already in `package.json` (verified 2026-05-11 against installed lockfile). No new packages needed for Phase 4.

**Version verification:** Skipped registry pull — Phase 4 adds zero new deps. The CONTEXT.md `<code_context>` "Pinned-exact deps + pnpm@11" note + Phase 1 D-03 pinning rule mean if a planner *did* add a dep, they'd `pnpm add -E` it. No such addition is expected.

## Architecture Patterns

### Recommended Project Structure (delta from Phase 3)

```
src/
├── lib/
│   ├── assets/                        # NEW IN PHASE 4 (per D-03; Phase 1 D-16 minimal-`src/lib/` rule)
│   │   └── hero-poster.jpg            # NEW (or .webp; planner picks per D-04)
│   ├── components/
│   │   ├── HeroPoster.svelte          # NEW (recommended split; owns image + gradient + name + tagline + CTA + scroll cue + sentinel)
│   │   ├── TopNav.svelte              # EXTENDED (scroll-aware-on-`/` mode added; existing Phase 3 D-39..D-43 machinery untouched)
│   │   ├── VideoCard.svelte           # UNCHANGED (reused with eager={true})
│   │   ├── CategoryTag.svelte         # UNCHANGED
│   │   ├── MobileMenu.svelte          # UNCHANGED
│   │   └── categoryAccent.ts          # UNCHANGED
│   └── data/
│       ├── videos.json                # EDITED (8 rows: featured false → true)
│       └── (all other files unchanged)
└── routes/
    ├── +layout.svelte                 # UNCHANGED (TopNav owns route-aware behavior internally per D-14)
    ├── +page.svelte                   # REPLACED ENTIRELY (Phase 1 splash → Phase 4 hero + featured grid + View-All link)
    └── +page.ts                       # NEW (recommended; featured filter + ordering, mirrors /work/+page.ts pattern)
```

### Pattern 1: Hero composition — absolute image + gradient + content-flex stack

**What:** Three z-stacked layers inside a `min-h-dvh relative` container. Image at z-0, gradient at z-10, content (flex column anchored bottom-left) at z-20, sentinel at z-0 at the absolute bottom for IntersectionObserver.

**When to use:** Full-bleed hero with text that must read legibly over photography. D-05 + D-12 lock this shape.

**Example:**
```svelte
<!-- HeroPoster.svelte (recommended) -->
<!-- Source: synthesized from Tailwind docs + Phase 3 patterns; gradient classes verbatim from D-05 -->
<script lang="ts">
  import { base } from '$app/paths';
  import { producerReelId } from '$lib/data';
  import heroPoster from '$lib/assets/hero-poster.jpg';
</script>

<svelte:head>
  <!-- LCP optimization: preload the hero asset BEFORE the document body parses (saves ~200-400ms).
       Vite's `import heroPoster` produces the same hashed URL used by the <img src> below,
       so this preload hits the same resource (browser dedupes). -->
  <link rel="preload" as="image" href={heroPoster} fetchpriority="high" />
</svelte:head>

<section class="relative min-h-dvh w-full overflow-hidden bg-neutral-950">
  <!-- Layer 1: poster image (z-0 implicit) -->
  <img
    src={heroPoster}
    alt=""
    loading="eager"
    fetchpriority="high"
    class="absolute inset-0 h-full w-full object-cover object-[center_30%]"
  />

  <!-- Layer 2: bottom gradient overlay -->
  <div
    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
    aria-hidden="true"
  ></div>

  <!-- Layer 3: content stack (lower-left) -->
  <div
    class="relative z-10 flex min-h-dvh flex-col items-start justify-end pb-16 lg:pb-24 pl-6 sm:pl-10 lg:pl-16 pr-6 sm:pr-10 lg:pr-16"
  >
    <h1 class="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-widest text-white">
      Michelle Ngo
    </h1>
    <p class="mt-4 text-sm md:text-base uppercase tracking-wide text-neutral-300">
      Filmmaker &amp; Producer
    </p>
    <a
      href={`${base}/watch/${producerReelId}`}
      data-sveltekit-preload-data="hover"
      class="mt-8 inline-flex items-center gap-2 border border-white px-6 py-3 text-sm tracking-widest uppercase text-white hover:bg-white hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      ▷ PLAY REEL
    </a>
  </div>

  <!-- Layer 4: scroll cue (bottom-center, ~40px from bottom) -->
  <div
    class="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60"
    aria-hidden="true"
  >
    <!-- chevron-down unicode glyph; planner can swap to inline SVG if sizing reads wrong -->
    <span class="text-2xl">⌄</span>
  </div>

  <!-- Layer 5: sentinel for TopNav IntersectionObserver (1px tall, sits at hero's bottom edge).
       Owned by HeroPoster so the page route stays thin. TopNav queries for it by id. -->
  <div id="hero-sentinel" class="absolute bottom-0 left-0 h-px w-full" aria-hidden="true"></div>
</section>
```

**Why these specific choices:**
- `min-h-dvh` (not `min-h-screen`) — dynamic viewport unit avoids iOS Safari's URL-bar CLS. Widely available since June 2025 ([caniuse](https://caniuse.com/viewport-unit-variants) Baseline Widely Available).
- `object-[center_30%]` — Tailwind v4 arbitrary value; underscore converts to space at build time, generating `object-position: center 30%`. Verified via [Tailwind arbitrary values docs](https://tailwindcss.com/docs/adding-custom-styles).
- `aria-hidden="true"` on gradient + scroll cue — they're decorative; the wordmark + tagline + CTA carry the page's semantic content (h1 + p + a).
- `alt=""` on the image — D-07 decorative call. The wordmark IS the heading; image is a visual anchor.
- Image inside `<section>` (not in `<svelte:head>` as a background-image CSS rule) — keeps the `<img>` semantic, observable in DOM, and lazy-load-friendly if v2 ever needs it. Background-image CSS is harder to `fetchpriority`-hint.
- **Sentinel inside HeroPoster** (recommended over inside `+page.svelte`) — keeps the hero's IntersectionObserver contract self-contained. TopNav looks up `document.getElementById('hero-sentinel')`. If sentinel isn't found (route !== `/`), TopNav skips attaching the observer.

### Pattern 2: Scroll-aware TopNav via `$effect` + IntersectionObserver

**What:** TopNav reads `page.route.id` from `$app/state`. When route is `/`, it queries the DOM for `#hero-sentinel` and attaches an IntersectionObserver that toggles a `$state` flag. When the flag is true (sentinel visible == hero visible), TopNav renders with transparent background. Cleanup function in `$effect` disconnects the observer on route change or unmount.

**When to use:** Route-conditional DOM-coupled side effect that needs reactive re-attach when the user navigates between `/` and `/work` (or anywhere else).

**Example:**
```svelte
<!-- TopNav.svelte (DELTA on top of existing Phase 3 file) -->
<!-- Source: Svelte 5 $effect docs (https://svelte.dev/docs/svelte/$effect) + $app/state docs (https://svelte.dev/docs/kit/$app-state) -->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
  import { categoryAccent } from './categoryAccent';
  import MobileMenu from './MobileMenu.svelte';

  const categories = getCategoriesInDisplayOrder();
  let mobileOpen = $state(false);

  // NEW IN PHASE 4: transparency mode for route `/` only.
  // Defaults to false (= solid nav). Flips to true when the hero sentinel is visible.
  let heroVisible = $state(false);

  $effect(() => {
    // $effect runs ONLY in the browser (per Svelte 5 docs: "They only run in the browser,
    // not during server-side rendering"). No `typeof window` guard needed.

    // Reactivity: re-runs whenever page.route.id changes (route navigation).
    const onHomeRoute = page.route.id === '/';

    if (!onHomeRoute) {
      // Not on home → ensure solid nav, no observer.
      heroVisible = false;
      return; // no cleanup needed (no observer to disconnect)
    }

    // On home route. Find the sentinel that HeroPoster renders at the hero's bottom edge.
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) {
      // Defensive: sentinel might not be mounted yet if HeroPoster renders after TopNav.
      // Phase 3 TopNav is in +layout.svelte BEFORE {@render children()}, so TopNav mounts
      // first. By the microtask tick, children (HeroPoster) have mounted; $effect runs
      // post-DOM-update so this is almost always present. But guard anyway.
      heroVisible = false;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry is guaranteed (we observe exactly one element).
        heroVisible = entry?.isIntersecting ?? false;
      },
      {
        // Default rootMargin '0px' + threshold 0 means: fires when ANY pixel of the sentinel
        // is in the viewport. Sentinel is 1px tall at the hero's bottom → fires exactly when
        // hero is on screen.
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    // Cleanup runs when: route changes (page.route.id read above invalidates), or component unmounts.
    return () => {
      observer.disconnect();
    };
  });

  function isActive(slug: string): boolean {
    return page.url.pathname.replace(/\/$/, '').endsWith(`/work/${slug}`);
  }

  // Class binding: transparent when heroVisible (only possible on `/`), else the locked Phase 3 chrome.
  // Both classes hold `sticky top-0 z-30 border-b` so the layout doesn't shift on transition.
  const navClass = $derived(
    heroVisible
      ? 'sticky top-0 z-30 bg-transparent border-b border-transparent'
      : 'sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10'
  );
</script>

<header class={navClass}>
  <!-- rest of nav unchanged from Phase 3 -->
</header>

{#if mobileOpen}
  <MobileMenu onclose={() => (mobileOpen = false)} />
{/if}
```

**Why these specific choices:**
- `$effect` (not `onMount`) — `$effect` is reactive on `page.route.id`. `onMount` runs once and doesn't re-run on navigation, which would mean the observer doesn't reattach when the user nav'd `/work` → `/`. `$effect` re-runs and re-evaluates the conditional.
- `page.route.id` (not `page.url.pathname`) — `route.id` is the SvelteKit route shape (`'/'`, `'/work'`, `'/work/[category]'`, `'/watch/[id]'`). It's stable; `pathname` changes with `BASE_PATH` and `trailingSlash`. Verified the existing TopNav uses `page.url.pathname` for slug matching (correct for that use) but for "am I on the home route" check, `route.id === '/'` is the canonical idiom.
- Cleanup function returned from `$effect` — official Svelte 5 pattern. Runs before re-execution AND on unmount. Disconnects the observer on route change.
- `heroVisible` as `$state` (not `$state.raw`) — primitive boolean; default `$state` is correct.
- `navClass` as `$derived` (not inline ternary in the template) — keeps the class binding in script-land where the conditional intent is explicit. Tailwind scans the source as text; both branches' class strings appear verbatim → no JIT bypass.
- **Both classes hold `sticky top-0 z-30 border-b`** — layout-stable transition. Only the colors swap.

### Pattern 3: Hero asset via Vite import (`$lib/assets/`)

**What:** Import the JPG/WebP as an ES module specifier; Vite bundles + content-hashes + emits to `build/_app/immutable/assets/hero-poster-<hash>.<ext>`. The import resolves to the public URL at runtime.

**When to use:** Any binary asset that benefits from cache-busting + parallel `import` graph awareness. SvelteKit official recommendation over `static/`.

**Example:**
```ts
// In HeroPoster.svelte
import heroPoster from '$lib/assets/hero-poster.jpg';
// At runtime: heroPoster === '/_app/immutable/assets/hero-poster-Bxk3qZj9.jpg' (hashed)
// On GitHub Pages with BASE_PATH='/michelle_ngo_four', SvelteKit prefixes correctly: '/michelle_ngo_four/_app/immutable/assets/hero-poster-Bxk3qZj9.jpg'

// In template:
// <img src={heroPoster} ... />
// <link rel="preload" as="image" href={heroPoster} ... />  (both use the same hashed URL → browser dedupes)
```

**Why this pattern:**
- Vite's [SvelteKit docs explicitly recommend it](https://svelte.dev/docs/kit/images): "Using an import allows Vite's built-in handling to give a unique name to an asset based on a hash of its contents so that it can be cached."
- Content hash = automatic cache-bust on poster updates. No manual cache-version query string.
- `BASE_PATH` honored automatically — no manual `${base}/...` prefixing needed for asset imports.

### Anti-Patterns to Avoid

- **Putting the hero poster in `static/hero-poster.jpg`** — no content hash, no cache-bust, requires manual `${base}/hero-poster.jpg` prefixing, no Vite-tracked import graph. D-03 locks the `$lib/assets/` choice.
- **CSS `background-image: url(...)` for the hero poster** — can't `fetchpriority`-hint, harder to preload, hidden from accessibility tree differently. Use `<img>` with `alt=""`.
- **`scroll` event listener with `requestAnimationFrame` for TopNav transparency** — D-14 rejects this; IntersectionObserver is the modern idiom. Cleaner teardown, browser-batched, no rAF math.
- **`<a>`-wrapping a `<button>` for the PLAY REEL CTA** — invalid HTML. D-18 specifies an `<a>` styled as a button. Anchor with hover-prefetch is the SvelteKit-idiomatic CTA.
- **Computing the featured-card class string dynamically** (e.g., `class={\`text-cat-${slug}\`}`) — Tailwind v4's scanner won't find the class. Phase 3 `categoryAccent.ts` static map is the established pattern; VideoCard inherits it via CategoryTag and doesn't need new wiring on `/`.
- **Filtering featured INSIDE `VideoCard.svelte` or pushing presentation logic into `$lib/data`** — D-26 locks "filter at module load in the page" (or +page.ts). `$lib/data` stays generic — exposes all 56.
- **Reading the hero poster as `import.meta.glob`** — for a single asset, the static `import` form is simpler and produces better type narrowing.
- **Using `onMount` + manual cleanup variable for the IntersectionObserver** — works but doesn't re-run on navigation. `$effect` is the right rune.
- **Putting the `noindex` meta in `+page.svelte`** — Phase 1 D-11 + the existing `+layout.svelte` already emit `<meta name="robots" content="noindex, nofollow" />` at the layout level. Phase 4 does NOT touch this (lock through Phase 6 per Phase 1 Pitfall 9).
- **Centering the hero text composition** — explicitly rejected in CONTEXT.md `<deferred>` ("splash-feeling, breaks editorial cinematic feel"). D-12 locks left-aligned `justify-end` stack.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll detection for nav transparency | `addEventListener('scroll', ...)` + rAF + threshold math | Native `IntersectionObserver` on a sentinel | Browser-batched, fires only on threshold change, no per-frame work, `disconnect()` is clean teardown |
| Reactive lifecycle that re-runs on route change | `onMount` + manual route subscription + manual teardown | `$effect` reading `page.route.id` from `$app/state` | `$effect` re-runs on dependency change; cleanup function pattern is built-in; runs browser-only by default |
| Hero image cache-busting | Manual query-string version (`?v=2`) | Vite content-hash via `import heroPoster from '$lib/assets/...'` | Vite hashes by content automatically; updates only when bytes change; integrates with `BASE_PATH` |
| LCP optimization for the hero image | DIY priority queue with Service Worker | `<link rel="preload" as="image" fetchpriority="high">` + `<img loading="eager" fetchpriority="high">` | Both attributes are Baseline Widely Available (per [MDN fetchpriority](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority) — Firefox added October 2024). Combined approach is documented in [web.dev fetch-priority](https://web.dev/articles/fetch-priority). |
| iOS Safari URL-bar height handling | JS measuring `window.innerHeight` + ResizeObserver | `min-h-dvh` (Tailwind v4 built-in → `min-height: 100dvh`) | `dvh` updates live as browser chrome appears/disappears. Baseline Widely Available June 2025 ([caniuse](https://caniuse.com/viewport-unit-variants)). |
| Route prefetch on hover | DIY `link.addEventListener('mouseenter', () => fetch(...))` | `data-sveltekit-preload-data="hover"` | Built into SvelteKit; preloads module + load function; saves ~200ms+ on click ([SvelteKit docs](https://svelte.dev/docs/kit/link-options)) |
| Cross-route visual regression checks | Hand-written CSS specificity gymnastics | Conditional rendering on `page.route.id === '/'` in TopNav | Single source of truth for which route gets the transparency mode |
| Curated-set persistence | Build a separate `featured.json` file | Flip `featured: true` on 8 rows of `videos.json` | Phase 2 D-08 already shipped the field (Zod schema accepts `featured: boolean`, default false). Data stays one source. |

**Key insight:** Phase 4 is *almost entirely* reuse + composition. The two browser APIs in play (IntersectionObserver + `<img fetchpriority>`) are both Baseline Widely Available with rock-solid Svelte 5 integration patterns. The featured grid is literal Phase 3 markup reuse with a 1-line filter. The TopNav extension is ~15 lines of new code (one `$effect`, one `$state`, one `$derived` class binding).

## Common Pitfalls

### Pitfall 1: Sentinel timing — observer attached before HeroPoster renders

**What goes wrong:** TopNav's `$effect` queries `document.getElementById('hero-sentinel')` before HeroPoster has mounted (TopNav is in `+layout.svelte` which renders BEFORE `{@render children()}`). `getElementById` returns `null`. Observer never attaches. Hero scrolls, transparency never flips.

**Why it happens:** Svelte component mount order: `+layout.svelte` script + DOM → `{@render children()}` triggers `+page.svelte` mount → `<HeroPoster>` mounts → sentinel `<div>` appears in DOM. `$effect` runs after the parent's DOM-update tick, BUT the timing depends on how children resolve.

**How to avoid:** Two-pronged defense:
1. `$effect` runs in the microtask queue after DOM updates (Svelte 5 guarantee). By the time it executes, children have mounted in the same render pass.
2. Guard with `if (!sentinel) return;` so worst case is a silent solid-nav fallback (correct visual on routes without a sentinel anyway).

**Warning signs:** Visual test reveals nav is always solid on `/` (transparency mode never engages). Check DevTools — sentinel `<div id="hero-sentinel">` IS in the DOM (HeroPoster mounted) but no observer registered (DevTools Performance → IntersectionObserver records).

**Verification:** Smoke test pattern: in a Vitest UI test that mounts `<TopNav />` after rendering a stub HeroPoster, assert that after one microtask tick, the observer is attached. Alternative: defer the observer setup to a `tick()` await:
```ts
import { tick } from 'svelte';
$effect(() => {
  // ...
  let observer: IntersectionObserver | null = null;
  tick().then(() => {
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) return;
    observer = new IntersectionObserver(...);
    observer.observe(sentinel);
  });
  return () => observer?.disconnect();
});
```
The `tick()` guarantees DOM has flushed. Only add this if a smoke test reveals the simpler pattern misses the sentinel.

### Pitfall 2: `page.route.id` not reactive in stale code paths

**What goes wrong:** Developer reads `page.route.id` once at component init (`const route = page.route.id;`) and uses the captured value. `$effect` doesn't see it as a dependency. Observer never re-attaches on navigation.

**Why it happens:** `$app/state`'s `page` object IS reactive per-property — accessing `.route.id` inside a tracked context (a `$effect`, `$derived`, template expression) marks it as a dependency. Captured to a local `const` outside that context, reactivity is lost.

**How to avoid:** ALWAYS read `page.route.id` INSIDE the `$effect` body (not in a top-level `const`). The Phase 3 TopNav's `isActive()` function does this correctly (`page.url.pathname` is read inside the function body, which is called from a template binding — reactivity tracked).

**Warning signs:** Navigating from `/work` → `/` doesn't activate transparency mode; only a hard reload of `/` does.

### Pitfall 3: jsdom doesn't have IntersectionObserver

**What goes wrong:** Vitest UI tests (jsdom env per `vite.config.ts`) crash with `ReferenceError: IntersectionObserver is not defined` when mounting `<TopNav />`.

**Why it happens:** jsdom (used by the `ui` test project per Phase 3 D-test-infra) does not implement IntersectionObserver. Other DOM APIs (`document.getElementById`, `addEventListener`) work; this one doesn't.

**How to avoid:** Stub `globalThis.IntersectionObserver` in the UI test setup before mounting TopNav. Two patterns:

**A. Per-test mock:**
```ts
// In TopNav.test.ts
beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
});
```

**B. Shared setup file:** Add to `vite.config.ts` `ui` project: `test.setupFiles: ['./vitest-setup-ui.ts']` and put the stub there. RECOMMEND **B** since Phase 5+ likely needs the same stub.

**Warning signs:** UI test suite goes red on first TopNav.test.ts run with `IntersectionObserver is not defined`. The data-layer suite stays green (node env, no jsdom).

### Pitfall 4: Tailwind doesn't see dynamic class concatenations

**What goes wrong:** Conditional class via dynamic string template (e.g., `` `bg-${heroVisible ? 'transparent' : 'neutral-950'}` ``) → Tailwind scanner doesn't tokenize the resulting class, doesn't generate the utility, class is missing in compiled CSS.

**Why it happens:** Tailwind v4's scanner reads source files as text and collects literal class-name occurrences. Runtime string concatenation produces classes that never appear literally in source. Phase 3 already hit this with category accent (see `categoryAccent.ts` static-map comment — verbatim).

**How to avoid:** Both branches of any conditional MUST contain the FULL class string verbatim. The `$derived` `navClass` pattern in Pattern 2 above is correct because both `'sticky top-0 z-30 bg-transparent border-b border-transparent'` and `'sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10'` appear as literals in source.

**Warning signs:** Build succeeds, page renders, but transparency mode's classes don't apply. DevTools shows the class names attached to the `<header>` but Tailwind didn't generate matching CSS.

### Pitfall 5: `object-position` arbitrary value with literal space breaks

**What goes wrong:** Developer writes `object-[center 30%]` (with a space) thinking it's the CSS value. HTML class attribute splits on spaces; Tailwind sees two classes (`object-[center` and `30%]`).

**Why it happens:** Class attribute is space-delimited; arbitrary values containing spaces must use underscores per [Tailwind docs](https://tailwindcss.com/docs/adding-custom-styles).

**How to avoid:** Use `object-[center_30%]` (underscore between tokens). Tailwind replaces the underscore with a space at build time, producing `object-position: center 30%`. Verified via [Tailwind PR 5460](https://github.com/tailwindlabs/tailwindcss/pull/5460) and discussion #15277.

**Warning signs:** Hero image looks wrong (default `center center` instead of `center 30%`); DevTools shows no `object-position` rule applied.

### Pitfall 6: Preload + img dedupe assumes same URL

**What goes wrong:** Developer preloads via `<link rel="preload" as="image" href="hero-poster.jpg">` but renders `<img src="/static/hero-poster.jpg">` — different URLs. Browser fetches twice; preload becomes wasted bandwidth.

**Why it happens:** `<link rel="preload">` only dedupes against `<img src>` when the URLs are byte-identical (modulo query strings).

**How to avoid:** Use the SAME imported `heroPoster` variable in BOTH `<svelte:head>` `<link>` AND `<img>`. Since both resolve to the same Vite-hashed URL, the browser dedupes the network request. Pattern in §Architecture Pattern 1 shows this.

**Warning signs:** DevTools Network tab shows two fetches for the hero asset (one with high priority from `<link>`, one normal from `<img>`).

### Pitfall 7: BASE_PATH on production GitHub Pages drops asset prefix

**What goes wrong:** Asset imported via `$lib/assets/...` works locally (BASE_PATH=''), 404s on GitHub Pages (BASE_PATH='/michelle_ngo_four').

**Why it happens:** This pitfall doesn't actually apply to Vite-imported assets — Vite/SvelteKit handles BASE_PATH prefixing automatically for `import` resolutions. The pitfall WOULD apply if the asset were in `static/` and referenced as `/hero-poster.jpg` instead of `${base}/hero-poster.jpg`. CONTEXT.md D-03 picks the `$lib/assets/` path precisely to avoid this trap.

**How to avoid:** Always use `import` form for assets (D-03 lock); never hand-write `/hero-poster.jpg` as a literal `src`.

**Warning signs:** Asset works at `https://michelle-ngo.pages.dev/` but 404s at `https://wolfwdavid.github.io/michelle_ngo_four/`.

### Pitfall 8: `featured: true` flipped on a non-Reel-category Reel video

**What goes wrong:** D-23 quota says "Reel ×1" — and specifies the Producer's Reel (`264677021`). If a planner mistakes "Reel category" for a different video, the PLAY REEL CTA target and the featured slot diverge — confusing UX.

**Why it happens:** The Reel category contains 4 videos (`28447961`, `227307921`, `264677021`, `1007087115`). Only `264677021` is the Producer's Reel (matches `producerReelId` in `$lib/data`).

**How to avoid:** Verify via assertion in `+page.ts`: `videos.filter(v => v.featured).some(v => v.id === producerReelId)` MUST be true. Recommend adding a build-time check (lightweight Zod refinement or unit test) so CI fails if the bits drift.

**Warning signs:** PLAY REEL navigates to `/watch/264677021` (correct) but the featured grid doesn't include that video; producer notices the inconsistency.

### Pitfall 9: Trailing-slash mismatch on `/`

**What goes wrong:** Phase 3 set `trailingSlash = 'always'` in `+layout.ts`. On `/`, that means `page.url.pathname === '/'` (root never gets a trailing slash even with the rule). But for matching, developer might check `pathname === '/'` vs `page.route.id === '/'` and get different results in tests with mocked stores.

**Why it happens:** `trailingSlash: 'always'` adds slashes to non-root paths (`/work/` not `/work`). Root is special.

**How to avoid:** Use `page.route.id === '/'` for the home-route check (SvelteKit route shape, not URL pathname). This is what Pattern 2 above does.

**Warning signs:** TopNav transparency works in dev but not in tests where `page` is mocked with `url.pathname: '/'` but `route.id: undefined`.

## Code Examples

Verified patterns from official sources, ready for the planner to drop into tasks.

### Example 1: `$effect` IntersectionObserver cleanup (verified Svelte 5 pattern)

```svelte
<script lang="ts">
  // Source: https://svelte.dev/docs/svelte/$effect
  // "If you return a function from the effect, it will be called right before
  //  the effect is run again, or when the component is unmounted."
  // "$effect runs only in the browser, not during SSR."
  let isVisible = $state(false);

  $effect(() => {
    const el = document.getElementById('sentinel');
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
    });
    observer.observe(el);
    return () => observer.disconnect();
  });
</script>
```

### Example 2: Vite asset import (verified SvelteKit pattern)

```svelte
<script lang="ts">
  // Source: https://svelte.dev/docs/kit/images
  // "Using an import allows Vite's built-in handling to give a unique name
  //  to an asset based on a hash of its contents so that it can be cached."
  import heroPoster from '$lib/assets/hero-poster.jpg';
</script>

<svelte:head>
  <link rel="preload" as="image" href={heroPoster} fetchpriority="high" />
</svelte:head>

<img
  src={heroPoster}
  alt=""
  loading="eager"
  fetchpriority="high"
  class="absolute inset-0 h-full w-full object-cover object-[center_30%]"
/>
```

### Example 3: `+page.ts` featured filter + ordering (mirrors Phase 3 /work pattern)

```ts
// src/routes/+page.ts (NEW IN PHASE 4)
// Source: synthesized from src/routes/work/+page.ts (Phase 3 D-25 ordering rule)
import type { PageLoad } from './$types';
import { videos } from '$lib/data';

export const prerender = true; // inherits from +layout.ts but explicit is fine

export const load: PageLoad = () => {
  // Filter to featured slice (D-26), then apply Phase 3 D-25 ordering:
  // featured first (N/A here — all 8 are featured), then published date desc, then id tiebreak.
  const featured = videos
    .filter((v) => v.featured)
    .toSorted((a, b) => {
      if (a.published !== b.published) return a.published < b.published ? 1 : -1;
      return a.id < b.id ? -1 : 1;
    });
  return { videos: featured };
};
```

### Example 4: Page composition (`/+page.svelte`)

```svelte
<!-- src/routes/+page.svelte (REPLACES Phase 1 splash) -->
<script lang="ts">
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

## Featured Slice Curation (D-23 deliverable)

**Selection algorithm:**
1. Quota per D-23: PBS ×2, Promos & Trailers ×2, Branded ×2, Documentary/Short Film ×1, Reel ×1.
2. Signal 1: date-desc within category (newest first).
3. Signal 2: client recognizability tiebreaker (HBO Max / Hulu / Amazon / U2 Sphere / PBS / Verizon / USPS / Fannie Mae > smaller clients).
4. Reel slot fixed to Producer's Reel `264677021` (PLAY REEL target).

**The 8 picks — for user review before flipping `featured: true` bits:**

| # | id | source | title | category | published | client / why picked |
|---|----|--------|-------|----------|-----------|---------------------|
| 1 | `264677021` | vimeo | Michelle Ngo Producer's Reel | Reel | 2018-04-13 | **REQUIRED** — D-23 Reel slot = `producerReelId`; same video as PLAY REEL CTA target |
| 2 | `1023002503` | vimeo | PBS American Portrait - Hispanic Heritage Month | PBS American Portrait | 2024-10-24 | PBS — newest PBS piece; broad cultural resonance |
| 3 | `1007027015` | vimeo | Introducing PBS American Portrait | PBS American Portrait | 2024-09-06 | PBS — the launch/anchor video for the entire PBS American Portrait initiative; highest narrative weight in the PBS bucket; tiebreaker over peers in same date cluster |
| 4 | `fvCB4gg7yS0` | youtube | Billy Joel: And So It Goes \| Official Trailer \| HBO Max | Promos & Trailers | 2025-07-11 | **HBO Max** — newest piece in the whole catalog; flagship broadcast credential |
| 5 | `T7VG52035Z4` | youtube | U2:UV Achtung Baby Live At Sphere (Trailer) | Promos & Trailers | 2023-04-24 | **U2 Sphere** — iconic venue + iconic band; unique in the catalog (no other Sphere work); broadcast credential |
| 6 | `770860055` | vimeo | Asians at Amazon Food Talks | Branded Content | 2022-11-14 | **Amazon** — newest Amazon piece + Michelle directed (per description); strong branded representation |
| 7 | `244851084` | vimeo | Verizon Fios - Xbox | Branded Content | 2017-11-28 | **Verizon + Xbox** + Halo Wars 2 launch + **2017 Clio Award honorable mention**; commercial cred |
| 8 | `264509512` | vimeo | Animal Art - Fly by Night | Documentary / Short Film | 2018-04-12 | Newest documentary short with the longest runtime (350s); strong format representation |

**Ordering on the page (post-D-25 sort by `published` desc):**
1. `fvCB4gg7yS0` Billy Joel HBO Max — 2025-07-11
2. `1023002503` PBS Hispanic Heritage Month — 2024-10-24
3. `1007027015` Introducing PBS American Portrait — 2024-09-06
4. `770860055` Asians at Amazon Food Talks — 2022-11-14
5. `T7VG52035Z4` U2 Sphere trailer — 2023-04-24
6. `264677021` Michelle Ngo Producer's Reel — 2018-04-13
7. `264509512` Animal Art - Fly by Night — 2018-04-12
8. `244851084` Verizon Fios - Xbox — 2017-11-28

Wait — `T7VG52035Z4` (2023-04-24) is newer than `770860055` (2022-11-14). Corrected sort:

| Row | id | published | title |
|-----|----|-----------|-------|
| 1 | `fvCB4gg7yS0` | 2025-07-11 | Billy Joel HBO Max |
| 2 | `1023002503` | 2024-10-24 | PBS Hispanic Heritage Month |
| 3 | `1007027015` | 2024-09-06 | Introducing PBS American Portrait |
| 4 | `T7VG52035Z4` | 2023-04-24 | U2 Sphere trailer |
| 5 | `770860055` | 2022-11-14 | Asians at Amazon Food Talks |
| 6 | `264677021` | 2018-04-13 | Producer's Reel |
| 7 | `264509512` | 2018-04-12 | Animal Art - Fly by Night |
| 8 | `244851084` | 2017-11-28 | Verizon Fios - Xbox |

This is a **strong opening composition**: newest splashy HBO Max trailer leads, immediately followed by two cinematic PBS pieces, then U2 Sphere (visual spectacle), Amazon (Michelle directed), Producer's Reel, an art documentary, and Verizon (Clio-winning). All 8 hover in the same era except the two pre-2018 anchors — and the desktop 4-col layout puts the four newest in row 1 (HBO, PBS, PBS, U2), which is exactly the broadcast-credentials-first read a hiring producer wants.

**Planner action:** Surface this table in PLAN.md as a user-review block BEFORE flipping `featured: true` bits in `videos.json`. After approval, edit 8 rows in `src/lib/data/videos.json` (add `"featured": true` to each of the 8 ids above). Build's Zod schema accepts the field (verified in `schema.ts` — `featured: z.boolean().default(false)`).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` for full-viewport sections | `100dvh` (dynamic viewport) | Baseline Widely Available June 2025; iOS Safari 15.6+, Chrome 108+, Firefox 101+ | No more URL-bar-induced CLS on iOS; D-10 locks `min-h-dvh` |
| `<img loading="eager">` alone for LCP | `<link rel="preload">` + `<img loading="eager" fetchpriority="high">` | `fetchpriority` Baseline since Firefox 123 (Oct 2024) | 20–30% LCP improvement in real-world tests ([Etsy case study](https://addyosmani.com/blog/fetch-priority/)) |
| `onMount` + manual cleanup | `$effect` with returned cleanup function | Svelte 5 GA (late 2024) | Reactive lifecycle that re-runs on dependency change; no manual `onDestroy` |
| `$app/stores` `page` subscription | `$app/state` `page` direct read | SvelteKit 2.x (Svelte 5 required) | Reactive properties; no `$page` store boilerplate; Phase 3 TopNav already uses this |
| Manual `requestAnimationFrame` scroll math | `IntersectionObserver` on sentinel | Decade-old browser API, but the modern idiom for visibility detection | Browser-batched, threshold-aware, clean `disconnect()` |
| `tailwind.config.js` extending theme | `@theme` block in CSS (CSS-first) | Tailwind v4 (Jan 2025) | Already locked Phase 1 D-02; Phase 4 doesn't add tokens — uses core utilities only |

**Deprecated/outdated:**
- `min-height: 100vh` for hero sections — replaced by `100dvh` for mobile correctness; v1 keeps `min-h-screen` as zero-effort fallback for the <5% legacy browsers.
- `$app/stores` (`$page`) — superseded by `$app/state` `page` in Svelte 5; Phase 3 TopNav already migrated.
- `loading="lazy"` on LCP images — explicitly anti-pattern per [web.dev](https://web.dev/articles/browser-level-image-lazy-loading) ("avoid loading='lazy' on the LCP image"); D-07 correctly specifies `loading="eager"`.

## Open Questions

1. **Exact hero poster frame from Vimeo `264677021`** — Claude's Discretion per D-02. Planner authors the asset selection.
   - What we know: prefer a wide cinematic still, Michelle NOT on-camera, dark areas in lower band so gradient + text composite cleanly.
   - What's unclear: which specific timecode in the 52-second reel best represents her range. Lean cinematic depth — a PBS American Portrait wide shot or one of the branded broadcast pieces.
   - Recommendation: Planner pulls 3–5 candidate frames, surfaces to user for vibe check before committing to `src/lib/assets/hero-poster.jpg`.

2. **JPG vs WebP for the hero asset** — Claude's Discretion per D-04.
   - What we know: ~150KB target. Single asset, no `<picture>` fallback in v1.
   - What's unclear: WebP can hit ~150KB at higher visual quality than JPG, but JPG is universally supported. Modern-browsers-only constraint (per PROJECT.md) makes WebP safe.
   - Recommendation: **WebP** for better quality-per-byte at the same target. Fall back to JPG only if compression artifacts surface in critical areas.

3. **`tick()` await before `getElementById('hero-sentinel')`?** — Implementation detail.
   - What we know: TopNav mounts before HeroPoster (layout → children). `$effect` runs after DOM update tick.
   - What's unclear: whether the same-pass DOM flush guarantees the sentinel is in the document when `$effect` first runs, OR whether a `tick()` await is needed.
   - Recommendation: Start WITHOUT `tick()`. If visual smoke test reveals nav stays solid on `/` on first paint, add the `tick().then(...)` pattern from Pitfall 1.

4. **+page.ts vs inline filter at `+page.svelte` top** — Phase consistency choice.
   - What we know: Phase 3 `/work` uses `+page.ts` with a `load` function returning `{ videos }`. Phase 4 can mirror that or inline `const featured = videos.filter(...)` directly in `+page.svelte` `<script>`.
   - Recommendation: **`+page.ts`** for symmetry with Phase 3 `/work` and to keep the `+page.svelte` component thin. Adds one file but matches the established pattern.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 (UI project: jsdom env; data project: node env) |
| Config file | `vite.config.ts` `test.projects` (Phase 3 D-test-infra carry-forward) |
| Quick run command | `pnpm test` (Vitest run, all projects) |
| Full suite command | `pnpm test && pnpm check && pnpm build && pnpm test:prerender` |
| Build verification | `pnpm build` (must succeed; Vite + Zod plugin validates `videos.json` shape after `featured: true` flips) |
| TypeScript verification | `pnpm check` (svelte-check + tsc) |
| Prerender verification | `pnpm test:prerender` (Phase 3 script — counts prerendered HTML pages; `/` adds 1 to expected total but core thresholds still apply) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | `/+page.svelte` renders HeroPoster with `<img src={heroPoster}>`, `<section class="min-h-dvh">`, gradient div, scroll cue, sentinel | unit | `pnpm vitest run src/routes/page.test.ts -t "renders hero"` | ❌ Wave 0 |
| HERO-01 | HeroPoster `<img>` has `loading="eager"` and `fetchpriority="high"` (LCP optimization) | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "LCP attrs"` | ❌ Wave 0 |
| HERO-01 | `<svelte:head>` emits `<link rel="preload" as="image">` for the hero asset | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "preload link"` | ❌ Wave 0 |
| HERO-02 | Hero renders `<h1>Michelle Ngo</h1>` and a `<p>` containing "Filmmaker & Producer" | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "name and tagline"` | ❌ Wave 0 |
| HERO-03 | PLAY REEL anchor has `href` ending in `/watch/264677021` (matches `producerReelId`) | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "PLAY REEL href"` | ❌ Wave 0 |
| HERO-03 | PLAY REEL anchor has `data-sveltekit-preload-data="hover"` | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "PLAY REEL prefetch"` | ❌ Wave 0 |
| D-22 / D-24 | `/+page.svelte` renders exactly 8 VideoCard elements (the featured slice) | unit | `pnpm vitest run src/routes/page.test.ts -t "8 featured cards"` | ❌ Wave 0 |
| D-26 | `videos.filter(v => v.featured).length === 8` in `videos.json` after flips | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "8 featured"` | ❌ Wave 0 (new test file or extend existing) |
| D-23 | Featured slice contains `producerReelId` | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "featured includes reel"` | ❌ Wave 0 |
| D-23 | Featured slice quota: 2 PBS, 2 Promos, 2 Branded, 1 Doc, 1 Reel | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "featured quota"` | ❌ Wave 0 |
| D-28 | `/+page.svelte` renders "View All Work →" anchor with `href` ending in `/work` and `data-sveltekit-preload-data="hover"` | unit | `pnpm vitest run src/routes/page.test.ts -t "View All Work link"` | ❌ Wave 0 |
| D-13/D-14 | TopNav on `/` route renders with `bg-transparent` class when sentinel intersects; solid otherwise | unit | `pnpm vitest run src/lib/components/TopNav.test.ts -t "scroll-aware home"` | ❌ Wave 0 (new tests) |
| D-13 | TopNav on `/work` and `/watch/[id]` routes renders solid bg-neutral-950/95 regardless of scroll | unit | `pnpm vitest run src/lib/components/TopNav.test.ts -t "solid on non-home"` | ❌ Wave 0 |
| D-15 / build | `pnpm build` succeeds after `featured: true` flips (Zod plugin still validates) | smoke | `pnpm build` | ✅ existing |
| FOUND-01 / build | Build emits `build/index.html` with hero asset reference + 8 featured cards | smoke | `pnpm test:prerender` (existing thresholds still met; `/` adds 1 HTML to the build) | ✅ existing (Phase 3) |
| D-10 / mobile | `min-h-dvh` Tailwind utility generates `min-height: 100dvh` in compiled CSS | manual smoke | Build, then grep `build/_app/immutable/assets/*.css` for `100dvh` | ❌ Wave 0 manual; LOW priority |
| D-13 cross-route | No transparency leakage on `/work`, `/work/[category]`, `/watch/[id]`, `/about`, `/press`, `/contact` | manual visual | Dev server: navigate each route, confirm solid TopNav | manual-only |
| D-06 mobile | Hero fills viewport without horizontal scroll; CTA tappable | manual visual | Dev server at <640px width; click PLAY REEL | manual-only |
| D-05 gradient | Bottom gradient renders; text legible over image | manual visual | Dev server: load `/`, visual eyeball | manual-only |

### Sampling Rate
- **Per task commit:** `pnpm test` (all Vitest projects, ~2-4s)
- **Per wave merge:** `pnpm test && pnpm check && pnpm build`
- **Phase gate:** Full suite green + `pnpm test:prerender` + manual visual sweep before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/components/HeroPoster.test.ts` — covers HERO-01, HERO-02, HERO-03 (renders hero, LCP attrs, preload link, name and tagline, PLAY REEL href, PLAY REEL prefetch)
- [ ] `src/routes/page.test.ts` — covers HERO-01, D-22, D-24, D-28 (renders hero composition, 8 featured cards, View-All link)
- [ ] Extend `src/lib/data/videos.test.ts` (or add `src/lib/data/featured.test.ts`) — covers D-23, D-24, D-26 (featured count = 8, quota matches, includes producerReelId)
- [ ] `src/lib/components/TopNav.test.ts` — extend (or add new test cases) — covers D-13, D-14 (scroll-aware home, solid on non-home routes, IntersectionObserver attach/detach)
- [ ] `vitest-setup-ui.ts` (NEW) — stub `globalThis.IntersectionObserver` for jsdom env; wire into `vite.config.ts` `ui` project `test.setupFiles`
- [ ] Framework install: none — Vitest + jsdom already installed (Phase 3)

## Sources

### Primary (HIGH confidence)
- [Svelte 5 `$effect` docs](https://svelte.dev/docs/svelte/$effect) — verified cleanup pattern (return function), browser-only execution, dependency tracking
- [SvelteKit `$app/state` docs](https://svelte.dev/docs/kit/$app-state) — verified `page.route.id` reactivity in Svelte 5; properties use `$state.raw` under the hood
- [SvelteKit link options / preloading docs](https://svelte.dev/docs/kit/link-options) — verified `data-sveltekit-preload-data="hover"` preloads module + load function; saves 200ms+
- [SvelteKit images docs](https://svelte.dev/docs/kit/images) — verified `import asset from '$lib/assets/...'` produces content-hashed URL via Vite
- [Tailwind v4 min-height docs](https://tailwindcss.com/docs/min-height) — verified `min-h-dvh` is a built-in core utility (generates `min-height: 100dvh`)
- [Tailwind arbitrary values docs](https://tailwindcss.com/docs/adding-custom-styles) — verified underscore-to-space conversion in `object-[center_30%]`
- [MDN fetchpriority attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority) — verified attribute syntax + Firefox added Oct 2024
- [caniuse viewport-unit-variants](https://caniuse.com/viewport-unit-variants) — verified `dvh` Baseline Widely Available since June 2025; iOS Safari 15.6+
- [web.dev fetch priority article](https://web.dev/articles/fetch-priority) — verified `<link rel="preload">` + `fetchpriority="high"` combined approach for LCP
- Existing project code (read directly):
  - `src/lib/components/TopNav.svelte` — verified active-state pattern, page.url.pathname reactivity, base-path safety, eslint-disable for `svelte/no-navigation-without-resolve`
  - `src/lib/components/VideoCard.svelte` — verified Phase 3 D-07 focus-ring classes (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950`) — Phase 4 D-18 uses `ring-offset-black` over the hero (different bg behind the button); planner should verify this swap is correct or use `ring-offset-neutral-950` for consistency
  - `src/routes/work/+page.svelte` + (`+page.ts`-style load) — verified grid markup contract for D-25 reuse
  - `src/lib/data/schema.ts` — verified `featured: z.boolean().default(false)` accepts `true` values (no schema change needed)
  - `src/lib/data/videos.json` — read all 56 records for featured slice curation
  - `vite.config.ts` — verified `validateVideosPlugin` runs in `buildStart` (will re-validate after `featured: true` flips); test projects split (data=node, ui=jsdom)
  - `svelte.config.js` — verified `paths.base = process.env.BASE_PATH ?? ''` (asset import handles this automatically)

### Secondary (MEDIUM confidence)
- [SvelteKit LCP optimization case study (cebre.us)](https://www.cebre.us/blog/optimising-sveltekit-head-lcp/) — 400ms LCP improvement from head tag reordering
- [AddyOsmani fetch-priority post](https://addyosmani.com/blog/fetch-priority/) — Etsy 4% LCP improvement case study
- [DebugBear fetchpriority article](https://www.debugbear.com/blog/fetchpriority-attribute) — 20-30% LCP improvement in lab tests
- [Snippets.khromov.se preloading images in Svelte](https://snippets.khromov.se/preloading-images-in-svelte/) — `<svelte:head>` preload pattern

### Tertiary (LOW confidence)
- Tailwind discussions / arbitrary value PR — corroborates underscore behavior but not load-bearing; the primary docs already cover it.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every dep pinned and version-verified against installed `package.json`; no new deps
- Architecture patterns: **HIGH** — `$effect` + IntersectionObserver + `page.route.id` verified directly against Svelte 5 docs; Vite asset import verified against SvelteKit docs
- LCP optimization: **HIGH** — `<link rel="preload">` + `fetchpriority="high"` verified against MDN, web.dev, and SvelteKit case studies
- Tailwind v4 utilities (`min-h-dvh`, `object-[center_30%]`): **HIGH** — verified against Tailwind v4 docs + tested via Phase 1/3 patterns
- Featured curation: **HIGH** — algorithm executed against the actual `videos.json` data; D-23 quota mathematically satisfied; Reel slot fixed to `producerReelId` per D-23 + D-17
- Common pitfalls: **HIGH** — 6 of 9 pitfalls are direct carry-forward from Phase 3 lessons (Tailwind dynamic class, BASE_PATH, trailingSlash); 3 are new but verified (sentinel timing, IntersectionObserver jsdom stub, page.route.id reactivity)
- Validation architecture: **HIGH** — test framework, projects split, and prerender script all inherited from Phase 3; Wave 0 gaps are 4-5 new test files

**Research date:** 2026-05-11
**Valid until:** 2026-06-10 (stable surface — Svelte 5 + SvelteKit 2 + Tailwind v4 are mature; CONTEXT.md locks the design; no fast-moving deps in play)
