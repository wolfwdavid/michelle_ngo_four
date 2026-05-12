<!--
  /watch/[id] — the killer feature endpoint.

  Decisions implemented:
    D-33 — direct iframe embed in aspect-video wrapper; no autoplay, no facade
    D-34 — player container max-w-5xl centered; metadata + rail max-w-7xl below
    D-35 — metadata order: <h1> title, interactive CategoryTag → /work/[slug],
            uploader · year, description (only if non-empty, whitespace-pre-line)
    D-36 — rail heading IS the link: <h2><a href=/work/[slug]>More in {category} →</a></h2>
    D-37 — rail uses VideoCard + same 2/3/4 responsive grid as /work
    D-38 — empty rail handling: hide the entire section if rail.length === 0
    D-19 — heading hierarchy: h1 (page title), h2 (rail section), h3 (card titles, via VideoCard)
    D-09 hairline divider — border-t border-white/10 between metadata and rail

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  the rail-heading <a href> is built from `$app/paths` base + categoryToSlug() output
  (already base-path safe). The rule would require resolve('/work/[category]', {category}),
  which is the SvelteKit 2.27+ typed-routes API; we're using the older string
  concatenation pattern locked in by Phase 1's BASE_PATH wiring (same as VideoCard).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import CategoryTag from '$lib/components/CategoryTag.svelte';
  import { categoryToSlug } from '$lib/data';

  let { data }: { data: PageData } = $props();
  // Use $derived so reactivity is preserved if SvelteKit navigates between
  // /watch/[id] entries client-side (svelte/state_referenced_locally warning).
  // The destructure of {video, rail} is intentional — both come from load().
  const video = $derived(data.video);
  const rail = $derived(data.rail);
  const year = $derived(video.published.slice(0, 4)); // D-35 step 4 — 4-digit year from ISO date
  const categorySlug = $derived(categoryToSlug(video.category));
</script>

<svelte:head>
  <title>Michelle Ngo — {video.title}</title>
</svelte:head>

<article class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <!-- D-34 Player: max-w-5xl centered, aspect-video. D-33: direct iframe, no autoplay. -->
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

  <!-- D-35 Metadata: h1, interactive chip, uploader · year, optional description -->
  <div class="mx-auto max-w-7xl mt-6 space-y-2">
    <h1 class="text-2xl md:text-3xl font-medium">{video.title}</h1>
    <CategoryTag category={video.category} href={`${base}/work/${categorySlug}`} />
    <p class="text-sm text-neutral-400">{video.uploader} · {year}</p>
    {#if video.description}
      <p class="text-sm text-neutral-300 whitespace-pre-line max-w-3xl pt-2">
        {video.description}
      </p>
    {/if}
    {#if video.category === 'PBS American Portrait'}
      <!-- Phase 5 D-05: cross-link to the dedicated PBS landing (PBS videos only). -->
      <p class="text-sm text-neutral-400 pt-2">
        <a href={`${base}/pbs-american-portrait/`} class="hover:underline">
          → About the PBS American Portrait project
        </a>
      </p>
    {/if}
  </div>

  <!-- D-36/37/38 Rail: heading-is-link, same VideoCard + 2/3/4 grid, hide if empty -->
  {#if rail.length > 0}
    <section class="mx-auto max-w-7xl mt-10 border-t border-white/10 pt-8">
      <h2 class="text-lg font-medium mb-4">
        <a href={`${base}/work/${categorySlug}`} class="hover:underline">
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
