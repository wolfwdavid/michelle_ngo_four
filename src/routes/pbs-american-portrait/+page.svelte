<!--
  /pbs-american-portrait/ — Phase 5 flagship landing page.

  Decisions implemented:
    D-08 — h1 in PBS accent color (text-cat-pbs via categoryAccent helper)
    D-09 — subtitle "18 stories produced by Michelle Ngo" (portfolio-forward credit)
    D-10 — verbatim PBS blockquote + attribution
    D-12 — outbound link to pbs.org/american-portrait (target=_blank rel=noopener)
    D-14 — editorial minimal DOM order: h1 / subtitle / blockquote / outbound / h2 / grid
    D-15 — container max-w-7xl px-4 sm:px-6 lg:px-8 (matches Phase 3 D-23)
    D-16 — h2 "Stories" (no count — implied by visible grid)
    D-17 — TopNav stays solid (no scroll-aware on this route — Phase 4 D-13 contract preserved)
    D-18 — featured-first then published-desc sort (D-25 inherited)
    D-19 — grid markup mirrors /work/[category] verbatim
    D-20 — VideoCard reused verbatim, eager={i < 8}
    D-21 — per-card "See on PBS →" badge in parent <li> (NOT in VideoCard)

  Verbatim PBS paragraph between <blockquote>...</blockquote> below is the
  user-approved Candidate C, locked in 05-01-PLAN.md under <approved>...</approved>
  (read at Plan 05-02 Task 2 STEP 0 via the documented extraction protocol;
  inserted here as plain text, no quotation marks added, no edits).

  ESLint: svelte/no-navigation-without-resolve disabled (project idiom — internal
  hrefs built from $app/paths base; same pattern as VideoCard + TopNav + /watch/[id]).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { categoryAccent } from '$lib/components/categoryAccent';
  import { pbsCollectionUrl } from './_pbsCollectionUrl';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>PBS American Portrait — Michelle Ngo</title>
  <meta
    name="description"
    content="Michelle Ngo's PBS American Portrait work: 18 short documentary portraits broadcast on PBS."
  />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <h1
    class="text-3xl md:text-5xl font-bold uppercase tracking-wider {categoryAccent(
      'PBS American Portrait'
    )}"
  >
    PBS American Portrait
  </h1>
  <p class="mt-3 text-sm md:text-base tracking-wide text-neutral-400 uppercase">
    18 stories produced by Michelle Ngo
  </p>

  <blockquote class="mt-6 border-l-2 border-neutral-700 pl-4 text-neutral-200 max-w-3xl">
    Whether it's joy or sorrow, triumph or hardship, family traditions followed for decades or just
    the chaos of the morning school run, PBS American Portrait put together a picture of life as
    it's really lived. The show gives a glimpse into American life, and a chance for everyday
    Americans to be heard.
  </blockquote>
  <p class="mt-2 text-xs text-neutral-500">Description from pbs.org/american-portrait</p>

  <p class="mt-6">
    <a
      href="https://www.pbs.org/american-portrait/"
      target="_blank"
      rel="noopener"
      class="hover:underline"
    >
      Visit pbs.org/american-portrait →
    </a>
  </p>

  <h2 class="mt-12 text-lg font-medium">Stories</h2>
  <ul class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
    {#each data.videos as video, i (video.id)}
      <li>
        <VideoCard {video} eager={i < 8} />
        {#if pbsCollectionUrl(video.description ?? '')}
          <a
            href={pbsCollectionUrl(video.description ?? '') ?? ''}
            target="_blank"
            rel="noopener"
            class="mt-1 inline-block text-xs text-neutral-400 hover:underline"
          >
            See on PBS →
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</section>
