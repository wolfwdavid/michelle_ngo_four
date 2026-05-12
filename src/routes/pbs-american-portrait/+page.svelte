<!--
  Phase 5 Plan 05-01 Wave 0 stub for /pbs-american-portrait/.
  Plan 05-02 Task 2 replaces this entire file with the real layout.
  For now: minimal markup so `mount(Page, { props: { data } })` doesn't crash
  and ALL Wave 0 page.test.ts assertions can be RED-by-skip.
-->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<section>
  <!-- intentionally minimal — flipped to full layout in 05-02 Task 2 -->
  <p>PBS American Portrait — stub ({data.videos.length} videos)</p>
</section>
