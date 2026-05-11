import { describe, expect, it } from 'vitest';
import { videos, producerReelId } from '$lib/data';

// Lazy-import pattern (see /work/+page.test.ts header). Plan 03-03 creates
// `./+page.ts` and removes this indirection + the `@ts-expect-error` directive.
async function loadPage() {
  // Defeat Vite's static import-analysis with a non-literal specifier — the
  // suite is describe.skip until Plan 03-03 creates ./+page.ts. Plan 03-03
  // removes this indirection in favor of a top-level static import.
  const spec = './' + '+page';
  return await import(/* @vite-ignore */ spec);
}

describe.skip('/watch/[id] +page.ts load — FILT-01 (D-31, D-32, D-33)', () => {
  it('valid id returns the matching video', async () => {
    const { load } = await loadPage();
    const result = await load({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    expect(result.video.id).toBe(producerReelId);
    expect(result.video.category).toBe('Reel');
  });

  it('unknown id throws 404 (D-32)', async () => {
    const { load } = await loadPage();
    await expect(
      load({ params: { id: 'does-not-exist-xyz' } } as Parameters<typeof load>[0])
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe.skip('/watch/[id] +page.ts load — FILT-02 rail (D-36, D-37, D-38)', () => {
  it('rail contains other videos in the same category', async () => {
    const { load } = await loadPage();
    const result = await load({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    for (const v of result.rail) {
      expect(v.category).toBe('Reel');
      expect(v.id).not.toBe(producerReelId);
    }
  });

  it('rail excludes the current video (D-37)', async () => {
    const { load } = await loadPage();
    const result = await load({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    const ids = result.rail.map((v: { id: string }) => v.id);
    expect(ids).not.toContain(producerReelId);
  });

  it('rail count = same-category count - 1 (Reel has 4; rail = 3)', async () => {
    const { load } = await loadPage();
    const result = await load({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    expect(result.rail.length).toBe(3);
  });

  it('rail is sorted featured-first then published date desc (D-25)', async () => {
    const { load } = await loadPage();
    // Pick a PBS video (18 in that category — plenty of sortable rail items).
    const pbs = videos.find((v) => v.category === 'PBS American Portrait');
    if (!pbs) throw new Error('test fixture missing: any PBS video');
    const result = await load({
      params: { id: pbs.id },
    } as Parameters<typeof load>[0]);
    const nonFeatured = result.rail.filter((v: { featured: boolean }) => !v.featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      expect(
        nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe.skip('/watch/[id] +page.ts entries — FILT-01 prerender enumeration', () => {
  it('returns one entry per video — count matches videos.length (56)', async () => {
    const { entries } = await loadPage();
    const list = entries() as Array<{ id: string }>;
    expect(list.length).toBe(56);
  });

  it('every entry has a non-empty id', async () => {
    const { entries } = await loadPage();
    const list = entries() as Array<{ id: string }>;
    for (const e of list) {
      expect(typeof e.id).toBe('string');
      expect(e.id.length).toBeGreaterThan(0);
    }
  });

  it('entries include the producer reel id (vimeo:264677021)', async () => {
    const { entries } = await loadPage();
    const ids = (entries() as Array<{ id: string }>).map((e) => e.id);
    expect(ids).toContain('264677021');
  });
});
