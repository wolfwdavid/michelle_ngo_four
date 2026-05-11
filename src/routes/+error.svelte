<!--
  Phase 3 minimal +error.svelte — catches D-30 (unknown category slug)
  and D-32 (unknown video id) 404s. Inherits +layout.svelte chrome.

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  the back-to-work link is built from `$app/paths` base + literal '/work'
  (already base-path safe). Same pattern as VideoCard / +page.svelte
  (Phase 1's BASE_PATH wiring, pre-typed-routes resolve()).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>Michelle Ngo — Not found</title>
</svelte:head>

<main class="min-h-[60vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
  <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Not found</h1>
  <p class="mt-4 text-sm text-neutral-400">
    {page.status} — That page doesn't exist (yet).
  </p>
  <a
    href={`${base}/work`}
    class="mt-6 inline-block text-sm underline underline-offset-4 hover:no-underline"
  >
    Back to work →
  </a>
</main>
