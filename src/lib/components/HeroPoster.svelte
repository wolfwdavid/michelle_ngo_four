<!--
  Phase 4 HERO-01 / HERO-02 / HERO-03: full-bleed reel-led hero with name,
  tagline, and PLAY REEL CTA. Sits inside src/routes/+page.svelte (replaces
  the Phase 1 splash entirely — D-15).

  Layers (z-stacked inside min-h-dvh container):
    1. <img>             — the poster (LCP); eager + fetchpriority high
    2. gradient overlay  — D-05 bottom-band darken (from-black/80 → transparent)
    3. content stack     — D-12 lower-left flex: h1 + tagline + PLAY REEL CTA
    4. scroll cue        — D-11 chevron, bottom-center
    5. hero-sentinel     — TopNav's IntersectionObserver target (D-14)

  <svelte:head> emits <link rel="preload"> for the same hashed URL the <img>
  uses (D-07 + 04-RESEARCH Pitfall 6 — browser dedupes a single fetch).

  ESLint: svelte/no-navigation-without-resolve disabled — PLAY REEL href is
  built from base-path-safe `${base}/watch/${producerReelId}` (same idiom as
  VideoCard + CategoryTag in Phase 3).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import { producerReelId } from '$lib/data';
  import heroPoster from '$lib/assets/hero-poster.webp';
</script>

<svelte:head>
  <link rel="preload" as="image" href={heroPoster} fetchpriority="high" />
</svelte:head>

<section class="relative min-h-dvh w-full overflow-hidden bg-neutral-950">
  <!-- Layer 1: poster image -->
  <img
    src={heroPoster}
    alt=""
    loading="eager"
    fetchpriority="high"
    class="absolute inset-0 h-full w-full object-cover object-[center_30%]"
  />

  <!-- Layer 2: bottom gradient overlay (D-05) -->
  <div
    class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
    aria-hidden="true"
  ></div>

  <!-- Layer 3: content stack — D-12 lower-left flex stack -->
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

  <!-- Layer 4: scroll cue, D-11 chevron-down -->
  <div class="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60" aria-hidden="true">
    <span class="text-2xl">⌄</span>
  </div>

  <!-- Layer 5: sentinel for TopNav's IntersectionObserver (D-14).
       Hero's bottom edge; when visible, hero is in viewport. -->
  <div id="hero-sentinel" class="absolute bottom-0 left-0 h-px w-full" aria-hidden="true"></div>
</section>
