<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <title>Michelle Ngo</title>
</svelte:head>

{@render children()}
