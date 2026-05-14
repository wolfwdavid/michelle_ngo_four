<!--
  Phase 1 chrome: app.css import + noindex meta (D-11; stays through Phase 6 per Pitfall 9).
  Phase 3 addition: top nav above every route (D-39).
  Phase 6 addition: site-wide Footer below the routed page content (D-04).
-->
<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import TopNav from '$lib/components/TopNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  let { children } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <title>Michelle Ngo</title>

  <!-- D-11 Favicon set (multi-size for browser tabs + iOS + Android home-screen) -->
  <link rel="icon" type="image/x-icon" href="{base}/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="{base}/favicon-192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="{base}/favicon-512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />

  <!-- D-12 Sitewide OG + Twitter card. Per-route <title>/<meta description>
       overrides happen in each +page.svelte's own <svelte:head>. -->
  <meta property="og:site_name" content="Michelle Ngo" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://michellengo.net{base}/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Michelle Ngo — Filmmaker & Producer" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://michellengo.net{base}/og-image.jpg" />
</svelte:head>

<TopNav />

{@render children()}

<Footer />
