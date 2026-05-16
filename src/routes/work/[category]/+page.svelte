<!--
  /work/[category] — D-26 heading "Category (count)" in accent color above the
  same 2/3/4 grid as /work (D-21, D-22). Same VideoCard, no variant (D-27).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccent } from '$lib/components/categoryAccent';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.category} — Michelle Ngo</title>
  <meta
    name="description"
    content="{data.videos.length} videos by Michelle Ngo in {data.category}."
  />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <h1
    class="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-6 {categoryAccent(
      data.category
    )}"
  >
    {data.category} ({data.videos.length})
  </h1>
  {#if data.category === 'PBS American Portrait'}
    <!-- Phase 5 D-04: cross-link to the dedicated PBS landing page. -->
    <p class="-mt-4 mb-6 text-sm text-neutral-400">
      <a href={`${base}/pbs-american-portrait/`} class="hover:underline">
        → About the PBS American Portrait project
      </a>
    </p>
  {/if}
  <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
