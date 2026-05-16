<!--
  Phase 6 ABT-01 / ABT-02 / CONT-02: /about page.

  Decisions implemented:
    D-17 — first-person voice ("I'm ...", "I make ...")
    D-18 — punchy ~100-word bio (one paragraph)
    D-19 — bio approved verbatim at plan time (PLAN.md <approved>...</approved>)
    D-20 — no headshot, no Resume/CV download, no legacy disciplines
    D-21 — container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8
    D-22 — composition: h1 / bio paragraph / <ContactBlock />

  The approved bio paragraph is copied VERBATIM from the PLAN.md
  <approved>...</approved> element (Phase 5 D-11 pattern). Do NOT
  rewrite, summarize, or paraphrase. If a future content edit is
  needed, update the PLAN.md approval and re-paste the text here.
-->
<script lang="ts">
  import ContactBlock from '$lib/components/ContactBlock.svelte';

  // Phase 7 Plan 07-02 D-15 Person JSON-LD sameAs values. MUST match the literals in
  // src/lib/components/ContactBlock.svelte (single source of truth for the visible
  // links; this duplication is intentional because ContactBlock does not export its
  // URL constants). Update both files together if URLs change.
  //
  // v1.0 launch state (per Plan 07-01 deferral, 2026-05-13): IMDb + LinkedIn ship as
  // channel-homepage fallbacks — personalized profile URLs were not materializable
  // before cutover. Post-launch backlog item: swap to personalized URLs of the shape
  // `https://www.imdb.com/name/nm{NUMERIC_ID}/` and `https://www.linkedin.com/in/{HANDLE}/`
  // — single-line edit in BOTH this file AND ContactBlock.svelte.
  const IMDB_URL = 'https://www.imdb.com/';
  const LINKEDIN_URL = 'https://www.linkedin.com/';
  const VIMEO_URL = 'https://vimeo.com/user2149742';

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Michelle Ngo',
    jobTitle: 'Filmmaker, Producer',
    url: 'https://michellengo.net/about/',
    sameAs: [IMDB_URL, LINKEDIN_URL, VIMEO_URL],
  };
</script>

<svelte:head>
  <title>About — Michelle Ngo</title>
  <meta
    name="description"
    content="I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands and broadcasters tell stories well."
  />
  <!-- D-15 Person JSON-LD for SEO knowledge-panel candidacy.
       {@html} is safe here: personJsonLd is JSON.stringify of a hardcoded
       static object literal — no user input flows in. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(personJsonLd)}<` + `/script>`}
</svelte:head>

<main class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
  <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">About</h1>

  <p class="mt-8 text-base md:text-lg leading-relaxed text-neutral-200">
    <!-- BEGIN approved bio (D-19) — copied VERBATIM from PLAN.md <approved>...</approved> -->
    I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands
    and broadcasters tell stories well — short documentaries, branded films, promos, and trailers. My
    credits include PBS American Portrait, HBO Max, HBO, ABC News, U2's Sphere residency, Amazon News,
    and Music Box Films. I love a tight schedule and a thoughtful script. I work hardest when the subject
    matter is human — real people telling true stories about how they live, what they make, and why it
    matters. If you have a project that needs a steady hand and a quick turn, get in touch.
    <!-- END approved bio -->
  </p>

  <div class="mt-10 md:mt-12">
    <ContactBlock />
  </div>
</main>
