/**
 * Phase 6 PRES-01 / PRES-02: /press load.
 *
 * Calls the route-local helper (D-09) and returns the grouped press credits
 * for +page.svelte to iterate. Prerendered (inherits from src/routes/+layout.ts
 * prerender=true). Build emits build/press/index.html.
 */
import type { PageLoad } from './$types';
import { getPressCredits, type PressGroup } from './_pressCredits';

export const load: PageLoad<{ groups: PressGroup[] }> = () => {
  return { groups: getPressCredits() };
};
