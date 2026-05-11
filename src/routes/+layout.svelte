<!--
  Phase 1 chrome: app.css import + noindex meta (D-11; stays through Phase 6 per Pitfall 9).
  Phase 3 addition: top nav above every route (D-39).
-->
<script lang="ts">
  import '../app.css';
  import TopNav from '$lib/components/TopNav.svelte';
  let { children } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <title>Michelle Ngo</title>
</svelte:head>

<TopNav />

{@render children()}
