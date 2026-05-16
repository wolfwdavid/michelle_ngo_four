<!--
  Phase 4 HERO-01 / HERO-02 / HERO-03: reel-led home composition.

  Replaces the Phase 1 splash entirely (D-15). Owns:
    - <HeroPoster />: full-bleed hero + name + tagline + PLAY REEL CTA + sentinel
    - Featured grid: 8 VideoCards (eager={true} on every card — D-22)
    - "View All Work →" overflow link (D-28)

  Discovery model: hero scroll-cue + grid + View-All link communicate intent.
  No section heading above the grid (D-27 sam-hendi-faithful).

  ESLint: svelte/no-navigation-without-resolve disabled — View All anchor uses
  base-path-safe `${base}/work` (same idiom as VideoCard + TopNav).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import HeroPoster from '$lib/components/HeroPoster.svelte';
  import VideoCard from '$lib/components/VideoCard.svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Michelle Ngo</title>
  <meta
    name="description"
    content="Filmmaker and producer Michelle Ngo. PBS American Portrait, HBO Max, HBO, Hulu, U2 Sphere broadcast credits. Watch the reel."
  />
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
