/**
 * /pbs-american-portrait/ — Phase 5 D-01 flagship landing route.
 *
 * Parameterless prerendered route. `prerender = true` + `trailingSlash = 'always'`
 * inherited from src/routes/+layout.ts. No entries() needed (flat route).
 *
 * Load returns the 18 PBS videos sorted D-18 (featured-first then date-desc),
 * mirroring /work/[category]/+page.ts shape.
 *
 * Sync (no async) — no error() throw, no rejection contract; matches Phase 4 /+page.ts.
 */
import type { PageLoad } from './$types';
import { getByCategory } from '$lib/data';

export const load: PageLoad = () => ({
  videos: [...getByCategory('PBS American Portrait')].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  }),
});
