import { describe, expect, it } from 'vitest';
// NOTE: imports for ./videos are lazy (`await import(...)`) inside each `it()` body
// so this file loads cleanly in Wave 0 even though the loader doesn't exist yet.
// Plan 02-03 creates ./videos.ts and removes `.skip` to turn each suite GREEN.

describe.skip('loader: videos array', () => {
  it('videos array length is 56 (no hidden in v1 per D-12)', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { videos } = await import('./videos');
    expect(videos.length).toBe(56);
  });

  it('hidden videos filtered (D-14) — none in v1, but loader path exists', async () => {
    // D-12: zero hidden in v1; D-14: loader filters hidden=true.
    // Smoke test: every video in the public array has hidden===false after parse.
    // @ts-expect-error — module exists after Plan 02-03
    const { videos } = await import('./videos');
    for (const v of videos) {
      expect(v.hidden).toBe(false);
    }
  });
});

describe.skip('loader: producerReelId (D-09)', () => {
  it('producerReelId is the literal "264677021"', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { producerReelId } = await import('./videos');
    expect(producerReelId).toBe('264677021');
  });

  it('producerReelId resolves to a real video in the public array (D-11)', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { videos, producerReelId } = await import('./videos');
    const reel = videos.find(
      (v: { source: string; id: string }) => v.source === 'vimeo' && v.id === producerReelId
    );
    expect(reel).toBeDefined();
    expect(reel?.category).toBe('Reel');
  });
});

describe.skip('loader: getById', () => {
  it('returns the matching video', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getById } = await import('./videos');
    const v = getById('264677021');
    expect(v).toBeDefined();
    expect(v?.title.toLowerCase()).toContain('reel');
  });

  it('returns undefined for an unknown id (noUncheckedIndexedAccess narrowing)', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getById } = await import('./videos');
    expect(getById('does-not-exist')).toBeUndefined();
  });
});

describe.skip('loader: getByCategory', () => {
  it('returns all 18 PBS videos', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getByCategory } = await import('./videos');
    expect(getByCategory('PBS American Portrait').length).toBe(18);
  });

  it('returns empty array for a category with zero matches (none in v1, smoke check on Reel=4)', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getByCategory } = await import('./videos');
    expect(getByCategory('Reel').length).toBe(4);
  });
});

describe.skip('loader: display order (D-04)', () => {
  it('display order: first category is PBS American Portrait (18 videos, count desc)', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getCategoriesInDisplayOrder } = await import('./videos');
    expect(getCategoriesInDisplayOrder()[0]).toBe('PBS American Portrait');
  });

  it('display order: ties broken alphabetically (Educational / Nonprofit, Other, Personal / Tribute all =3)', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getCategoriesInDisplayOrder } = await import('./videos');
    const order: string[] = getCategoriesInDisplayOrder();
    const threeWayTie = order.filter(
      (c: string) => c === 'Educational / Nonprofit' || c === 'Other' || c === 'Personal / Tribute'
    );
    expect(threeWayTie).toEqual(['Educational / Nonprofit', 'Other', 'Personal / Tribute']);
  });

  it('display order: full sequence per D-04', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getCategoriesInDisplayOrder } = await import('./videos');
    expect(getCategoriesInDisplayOrder()).toEqual([
      'PBS American Portrait',
      'Promos & Trailers',
      'Branded Content',
      'Documentary / Short Film',
      'Reel',
      'Educational / Nonprofit',
      'Other',
      'Personal / Tribute',
    ]);
  });
});

describe.skip('loader: getCategoriesWithCounts', () => {
  it('returns category + slug + count for all 8', async () => {
    // @ts-expect-error — module exists after Plan 02-03
    const { getCategoriesWithCounts } = await import('./videos');
    const arr = getCategoriesWithCounts();
    expect(arr.length).toBe(8);
    const pbs = arr.find(
      (c: { category: string; slug: string; count: number }) =>
        c.category === 'PBS American Portrait'
    );
    expect(pbs?.slug).toBe('pbs-american-portrait');
    expect(pbs?.count).toBe(18);
  });
});
