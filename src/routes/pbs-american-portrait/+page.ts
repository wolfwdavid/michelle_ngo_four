/**
 * Phase 5 Plan 05-01 Wave 0 stub for /pbs-american-portrait/.
 *
 * Returns an empty videos array + empty pbsBlurb. Plan 05-02 Task 2 replaces
 * this with the real getByCategory('PBS American Portrait') + D-18 sort.
 *
 * Sync (no async): no error() throw, no rejection contract — mirrors /+page.ts (Phase 4).
 *
 * Why `Video[]` (not `never[]`): page.test.ts iterates the array and accesses
 * `.published`/`.featured`. Even under describe.skip, svelte-check still
 * type-checks the bodies. Typing as `Video[]` matches the future GREEN shape.
 */
import type { PageLoad } from './$types';
import type { Video } from '$lib/data';

export const load: PageLoad = () => ({
  videos: [] as Video[],
  pbsBlurb: '',
});
