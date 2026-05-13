<!--
  Phase 6 D-32 / D-33 / D-34 / D-35 / D-36 / D-38: shared contact block.

  Single component reused VERBATIM on /about (D-22), /contact (D-37), and
  Footer column 1 (D-26 — Plan 06-03). One vertical layout — no orientation
  prop, no variants. Editing email/phone/socials here propagates to all three
  surfaces (CONT-02 satisfied by construction).

  Channel literals (D-33, D-34, D-35):
    - Email:    mailto:mynogo@gmail.com → display "mynogo@gmail.com"
    - Phone:    tel:+19175661976        → display "(917) 566-1976"
    - IMDb:     https://www.imdb.com/    → display "IMDb"     (external link)
    - LinkedIn: https://www.linkedin.com/ → display "LinkedIn" (external link)
    - Vimeo:    https://vimeo.com/user2149742 → display "Vimeo" (external link)

  Style: Phase 3 D-08 inline-link (text-white hover:underline underline-offset-2)
  on every link.

  NOTE — pre-production swap required before michellengo.net cutover:
    IMDb and LinkedIn currently point at the channel homepages
    (https://www.imdb.com/, https://www.linkedin.com/) as approved-fallback
    values per /gsd:execute-phase decision on 2026-05-12. The user did not
    have personalized profile URLs ready at execution time and chose to ship
    with the homepages rather than block Phase 6. Before Phase 7 cutover,
    swap IMDB_URL + LINKEDIN_URL below to real profile URLs. Single-line
    change each; no test changes needed as long as the new URLs still
    contain 'imdb.com' / 'linkedin.com' respectively. Tracked in STATE.md
    Blockers/Concerns until resolved.
-->
<script lang="ts">
  // No props (D-32). One vertical layout everywhere.
  // Hardcoded literal URLs. If channels change, edit this file only —
  // it is the single source of truth for /about, /contact, and Footer.

  // Approved at execute-time on 2026-05-12 — see comment above for swap-before-cutover note.
  const IMDB_URL = 'https://www.imdb.com/';
  const LINKEDIN_URL = 'https://www.linkedin.com/';
  const VIMEO_URL = 'https://vimeo.com/user2149742';
</script>

<ul class="space-y-2 text-base">
  <li>
    <a href="mailto:mynogo@gmail.com" class="text-white hover:underline underline-offset-2">
      mynogo@gmail.com
    </a>
  </li>
  <li>
    <a href="tel:+19175661976" class="text-white hover:underline underline-offset-2">
      (917) 566-1976
    </a>
  </li>
  <li>
    <a
      href={IMDB_URL}
      target="_blank"
      rel="noopener"
      class="text-white hover:underline underline-offset-2"
    >
      IMDb
    </a>
  </li>
  <li>
    <a
      href={LINKEDIN_URL}
      target="_blank"
      rel="noopener"
      class="text-white hover:underline underline-offset-2"
    >
      LinkedIn
    </a>
  </li>
  <li>
    <a
      href={VIMEO_URL}
      target="_blank"
      rel="noopener"
      class="text-white hover:underline underline-offset-2"
    >
      Vimeo
    </a>
  </li>
</ul>
