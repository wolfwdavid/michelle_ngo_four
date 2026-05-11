<!--
  /work/[category] — D-26 heading "Category (count)" in accent color above the
  same 2/3/4 grid as /work (D-21, D-22). Same VideoCard, no variant (D-27).
-->
<script lang="ts">
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccent } from '$lib/components/categoryAccent';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Michelle Ngo — {data.category}</title>
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <h1
    class="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-6 {categoryAccent(
      data.category,
    )}"
  >
    {data.category} ({data.videos.length})
  </h1>
  <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
