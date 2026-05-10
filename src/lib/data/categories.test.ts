import { describe, expect, it } from 'vitest';
// NOTE: imports for ./categories are lazy (`await import(...)`) inside each `it()` body
// so this file loads cleanly in Wave 0 even though the module doesn't exist yet.
// Plan 02-01 creates ./categories.ts and removes `.skip` to turn the suite GREEN.

describe.skip('CATEGORIES array', () => {
  it('contains exactly 8 entries from _prep/04-categories.md', async () => {
    // @ts-expect-error — module exists after Plan 02-01
    const { CATEGORIES } = await import('./categories');
    expect(CATEGORIES).toEqual([
      'PBS American Portrait',
      'Promos & Trailers',
      'Branded Content',
      'Documentary / Short Film',
      'Reel',
      'Personal / Tribute',
      'Educational / Nonprofit',
      'Other',
    ]);
  });
});

describe.skip('categoryToSlug', () => {
  it('derives kebab-case slugs single-rule (D-03)', async () => {
    // @ts-expect-error — module exists after Plan 02-01
    const { categoryToSlug } = await import('./categories');
    expect(categoryToSlug('PBS American Portrait')).toBe('pbs-american-portrait');
    expect(categoryToSlug('Promos & Trailers')).toBe('promos-trailers');
    expect(categoryToSlug('Branded Content')).toBe('branded-content');
    expect(categoryToSlug('Documentary / Short Film')).toBe('documentary-short-film');
    expect(categoryToSlug('Reel')).toBe('reel');
    expect(categoryToSlug('Personal / Tribute')).toBe('personal-tribute');
    expect(categoryToSlug('Educational / Nonprofit')).toBe('educational-nonprofit');
    expect(categoryToSlug('Other')).toBe('other');
  });

  it('produces unique slugs for all 8 categories (no collisions)', async () => {
    // @ts-expect-error — module exists after Plan 02-01
    const { CATEGORIES, categoryToSlug } = await import('./categories');
    const slugs = CATEGORIES.map((c: (typeof CATEGORIES)[number]) => categoryToSlug(c));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe.skip('slugToCategory', () => {
  it('round-trips every category', async () => {
    // @ts-expect-error — module exists after Plan 02-01
    const { CATEGORIES, categoryToSlug, slugToCategory } = await import('./categories');
    for (const cat of CATEGORIES) {
      expect(slugToCategory(categoryToSlug(cat))).toBe(cat);
    }
  });

  it('returns undefined for an unknown slug', async () => {
    // @ts-expect-error — module exists after Plan 02-01
    const { slugToCategory } = await import('./categories');
    expect(slugToCategory('does-not-exist')).toBeUndefined();
  });
});
