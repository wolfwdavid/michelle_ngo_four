import { describe, expect, it } from 'vitest';

// Lazy-import pattern: `./+page.ts` doesn't exist in Wave 0 (Plan 03-02 creates it).
// A top-level static import would crash the test loader before the skipped describe
// block can suppress the suite. Phase 2 Wave 0 (Plan 02-00) established this lazy
// `await import()` pattern with a leading `// @ts-expect-error` directive. Plan
// 03-02 removes `.skip` AND the `@ts-expect-error` directive when the route lands.
async function loadPage() {
  // Defeat Vite's static import-analysis with a non-literal specifier — the
  // suite is describe.skip until Plan 03-02 creates ./+page.ts. Plan 03-02
  // removes this indirection in favor of a top-level static import.
  const spec = './' + '+page';
  return await import(/* @vite-ignore */ spec);
}

describe.skip('/work +page.ts load — GRID-02 + D-24 + D-25', () => {
  it('returns all 56 videos (D-24: no implicit category filter)', async () => {
    const { load } = await loadPage();
    const result = await load({} as Parameters<typeof load>[0]);
    expect(result.videos.length).toBe(56);
  });

  it('sort order: featured first, then published date descending (D-25)', async () => {
    const { load } = await loadPage();
    const result = await load({} as Parameters<typeof load>[0]);
    const sorted = result.videos;
    // Featured-first: every featured video appears before every non-featured.
    const firstNonFeatured = sorted.findIndex((v: { featured: boolean }) => !v.featured);
    if (firstNonFeatured >= 0) {
      for (let i = firstNonFeatured; i < sorted.length; i++) {
        expect(sorted[i]?.featured).toBe(false);
      }
    }
    // Within non-featured: published date descending.
    const nonFeatured = sorted.filter((v: { featured: boolean }) => !v.featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      const prev = nonFeatured[i - 1]!.published;
      const curr = nonFeatured[i]!.published;
      expect(prev.localeCompare(curr)).toBeGreaterThanOrEqual(0);
    }
  });

  it('result.videos is a NEW array (does NOT mutate the shared videos export)', async () => {
    const { load } = await loadPage();
    const result = await load({} as Parameters<typeof load>[0]);
    // Different reference from the live `$lib/data` videos array.
    const live = (await import('$lib/data')).videos;
    expect(result.videos).not.toBe(live);
  });
});
