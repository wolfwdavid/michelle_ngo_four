/**
 * /work load — D-24 (all 56 videos) + D-25 (featured-first, then published date desc).
 *
 * The sort is computed in the load function so the prerendered HTML for /work
 * contains the videos in their final display order. Zero client-side JS for ordering.
 *
 * `videos` from $lib/data is `readonly Video[]`; `.toSorted()` returns a NEW
 * (non-readonly) array — required for the page's iteration order. We never
 * mutate the shared export.
 */
import type { PageLoad } from './$types';
import { videos } from '$lib/data';

export const load: PageLoad = () => ({
  videos: [...videos].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  }),
});
