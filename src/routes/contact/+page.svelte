<!--
  Phase 6 CONT-01 (page half) / D-37 composition: /contact page.

  Decisions implemented:
    D-03 — /contact stays as a real page (does NOT redirect, does NOT drop)
    D-37 — composition: h1 / <ContactBlock /> (no intro paragraph, no form)
    D-32 — same shared <ContactBlock /> as /about and Footer column 1

  Contact form is Out of Scope per REQUIREMENTS.md (mailto: link sufficient).
-->
<script lang="ts">
  import ContactBlock from '$lib/components/ContactBlock.svelte';
</script>

<svelte:head>
  <title>Michelle Ngo — Contact</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
  <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Contact</h1>

  <div class="mt-10 md:mt-12">
    <ContactBlock />
  </div>
</main>
