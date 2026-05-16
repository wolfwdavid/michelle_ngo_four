<!--
  /work — unfiltered grid of all 56 videos (D-24). No page heading (D-26).
  Layout: single flat CSS grid (D-21), 2/3/4 responsive (D-22) at Tailwind
  default breakpoints (sm=640, lg=1024), tight YouTube-density gaps (D-05),
  max-w-7xl content container (D-23).

  Cards: <VideoCard> from Plan 03-01. First 8 are eager (D-17); rest lazy.
-->
<script lang="ts">
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Work — Michelle Ngo</title>
  <meta
    name="description"
    content="All 56 videos by filmmaker Michelle Ngo, organized by category."
  />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <VideoCard {video} eager={i < 8} />
    {/each}
  </ul>
</section>
