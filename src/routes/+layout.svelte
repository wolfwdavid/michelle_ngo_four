<!--
  Phase 1 chrome: app.css import + noindex meta (D-11; stays through Phase 6 per Pitfall 9).
  Phase 3 addition: top nav above every route (D-39).
  Phase 6 addition: site-wide Footer below the routed page content (D-04).
-->
<script lang="ts">
  import '../app.css';
  import TopNav from '$lib/components/TopNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  let { children } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <title>Michelle Ngo</title>
</svelte:head>

<TopNav />

{@render children()}

<Footer />
