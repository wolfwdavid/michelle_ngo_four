/**
 * /+page.ts — Phase 4 home route loader.
 *
 * D-26: filter `videos` to `featured === true` at module load.
 * D-25 + 04-RESEARCH Example 3: within the featured slice, sort by published
 * date descending. Featured-first is N/A here (all 8 are featured), so the
 * sort reduces to "published desc".
 *
 * Returns the typed Video[] for the home page's featured grid. Mirrors the
 * shape of /work/+page.ts so /+page.svelte consumes data.videos the same way.
 */
import type { PageLoad } from './$types';
import { videos } from '$lib/data';

export const load: PageLoad = () => ({
  videos: videos
    .filter((v) => v.featured)
    .toSorted((a, b) => b.published.localeCompare(a.published)),
});
