<!--
  Phase 6 PRES-01 / PRES-02: /press broadcast credits page.

  Decisions implemented:
    D-08 — credits derived from videos.json (filter uploader !== 'Michelle Ngo')
    D-09 — uploader strings used verbatim as network labels (no normalization)
    D-10 — prestige order locked in _pressCredits.ts PRESTIGE_ORDER
    D-12 — composition: <h1>Press</h1> + <section>/<h2>/<ul> blocks
    D-13 — per-credit row = inline-link to /watch/[id] (title only, no date/role)
    D-14 — container max-w-3xl (editorial reading width, NOT max-w-7xl)
    D-15 — section vertical rhythm space-y-12 md:space-y-16
    D-16 — no count next to section h2

  ESLint: svelte/no-navigation-without-resolve disabled — internal hrefs built
  from `${base}/watch/${id}` (same idiom as VideoCard + TopNav + PBS landing).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { PageData } from './$types';
  import { base } from '$app/paths';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Michelle Ngo — Press</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
  <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Press</h1>

  <div class="mt-10 md:mt-12 space-y-12 md:space-y-16">
    {#each data.groups as group (group.network)}
      <section>
        <h2 class="text-xl md:text-2xl font-bold uppercase tracking-wider">{group.network}</h2>
        <ul class="mt-4 space-y-2">
          {#each group.videos as video (video.id)}
            <li>
              <a
                href={`${base}/watch/${video.id}`}
                data-sveltekit-preload-data="hover"
                class="text-white hover:underline underline-offset-2"
              >
                {video.title}
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
</main>
