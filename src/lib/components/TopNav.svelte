<!--
  Phase 3 NAV-01: top nav — wordmark + 8 categories + About/Press/Contact.
  Sticky at desktop AND mobile (per 03-RESEARCH.md Open Question 4 recommendation:
  single behavior reads as one design intent; backdrop-blur prevents content bleed).

  Decisions implemented:
    D-09 — hairline border-b border-white/10 divider below the nav
    D-39 — lives in +layout.svelte (this component is imported there)
    D-40 — wordmark left, 8 categories inline, About/Press/Contact quieter at far right
    D-41 — active category gets categoryAccent() class; /work and /watch never highlight
    D-42 — hamburger triggers MobileMenu overlay (<sm only)
    D-14 carry-forward — data-sveltekit-preload-data="hover" on category links

  $app/state contract: page.url.pathname is REACTIVE inside .svelte files (SvelteKit 2.27+).
  Active-link detection re-runs whenever the user navigates.

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  TopNav is the site's primary nav; hrefs are produced base-path-safely via
  `${base}/...` template literals (same pattern as VideoCard + CategoryTag).
  Wrapping in resolve() here would break the test patterns that assert
  literal hrefs (e.g. `/work/pbs-american-portrait`) under mocked `base=''`.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
  import { categoryAccent } from './categoryAccent';
  import MobileMenu from './MobileMenu.svelte';

  const categories = getCategoriesInDisplayOrder();
  let mobileOpen = $state(false);

  function isActive(slug: string): boolean {
    // Normalize trailing slash, then suffix-match the slug. Two production
    // forces make a naive `=== \`${base}/work/${slug}\`` comparison fail:
    //   1. `trailingSlash = 'always'` (src/routes/+layout.ts, Plan 03-03)
    //      normalizes page.url.pathname to `/work/<slug>/`.
    //   2. adapter-static + SvelteKit's default `paths.relative: true` renders
    //      `base` as a per-page relative string (e.g. `../..`), so the literal
    //      `${base}/work/${slug}` evaluates to `../../work/<slug>` during SSR
    //      while page.url.pathname stays absolute (`/work/<slug>/`).
    // endsWith on `/work/${slug}` sidesteps both: it matches the absolute
    // pathname's slug suffix regardless of `base` shape (relative or absolute
    // deployed prefix), and the trailing-slash strip handles trailingSlash.
    return page.url.pathname.replace(/\/$/, '').endsWith(`/work/${slug}`);
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
          >
            {category}
          </a>
        </li>
      {/each}
      <li class="ml-2 flex gap-3 text-neutral-500">
        <a href={`${base}/about`} class="hover:text-white">About</a>
        <a href={`${base}/press`} class="hover:text-white">Press</a>
        <a href={`${base}/contact`} class="hover:text-white">Contact</a>
      </li>
    </ul>

    <!-- Hamburger (<sm) -->
    <button
      type="button"
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
