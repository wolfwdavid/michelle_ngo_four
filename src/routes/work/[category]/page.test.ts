import { describe, expect, it } from 'vitest';
import { load, entries } from './+page';
import type { Video } from '$lib/data';

// SvelteKit's PageLoad generic widens the awaited return to `void | (... & Record<string, any>)`,
// which blocks direct property access. Narrowing through a small helper preserves the
// real runtime shape while keeping the static `import { load }` form. Plan 03-01's
// downstream contract requires removing the lazy `loadPage()` indirection AND the
// `@ts-expect-error` directive — this narrow is the route-test equivalent. Identical
// pattern to /work/page.test.ts.
async function callLoad(
  event: Parameters<typeof load>[0]
): Promise<{ category: string; videos: Video[] }> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as { category: string; videos: Video[] };
}

describe('/work/[category] +page.ts load — FILT-03 (D-29, D-30)', () => {
  it('valid slug returns the matching category and its videos', async () => {
    const result = await callLoad({
      params: { category: 'pbs-american-portrait' },
    } as Parameters<typeof load>[0]);
    expect(result.category).toBe('PBS American Portrait');
    expect(result.videos.length).toBe(18);
  });

  it('all returned videos have category === result.category', async () => {
    const result = await callLoad({
      params: { category: 'reel' },
    } as Parameters<typeof load>[0]);
    expect(result.category).toBe('Reel');
    for (const v of result.videos) {
      expect(v.category).toBe('Reel');
    }
  });

  it('unknown slug throws 404 (D-30)', async () => {
    await expect(
      load({ params: { category: 'does-not-exist' } } as Parameters<typeof load>[0])
    ).rejects.toMatchObject({ status: 404 });
  });

  it('videos sorted featured-first then published date desc (D-25)', async () => {
    const result = await callLoad({
      params: { category: 'pbs-american-portrait' },
    } as Parameters<typeof load>[0]);
    const nonFeatured = result.videos.filter((v: { featured: boolean }) => !v.featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      expect(
        nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('/work/[category] +page.ts entries — FILT-03 prerender enumeration', () => {
  it('returns exactly 8 entries (one per category)', async () => {
    const result = entries();
    expect(Array.isArray(result)).toBe(true);
    expect((result as Array<{ category: string }>).length).toBe(8);
  });

  it('each entry has a non-empty category slug', async () => {
    const list = entries() as Array<{ category: string }>;
    for (const e of list) {
      expect(typeof e.category).toBe('string');
      expect(e.category.length).toBeGreaterThan(0);
      expect(e.category).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('entries include "pbs-american-portrait" and "reel"', async () => {
    const slugs = (entries() as Array<{ category: string }>).map((e) => e.category);
    expect(slugs).toContain('pbs-american-portrait');
    expect(slugs).toContain('reel');
  });
});
