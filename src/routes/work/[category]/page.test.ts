import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load, entries } from './+page';
import type { PageData } from './$types';

// Phase 5 D-04 mocks: $app/state + $app/paths. Distinct identifier (`mockPageWk`)
// mirrors the watch/[id]/page.test.ts pattern and avoids cross-file collision.
const { mockPageWk } = vi.hoisted(() => ({
  mockPageWk: { url: new URL('http://localhost/'), route: { id: null as string | null } },
}));
vi.mock('$app/state', () => ({ page: mockPageWk }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

// SvelteKit's PageLoad generic widens the awaited return to `void | (... & Record<string, any>)`,
// which blocks direct property access. Phase 5 widened the narrower to `PageData`
// (from './$types') so the same helper feeds BOTH the existing assertion tests
// (which read result.category etc.) AND the new D-04 mount tests
// (`mount(Page, { props: { data } })` needs the strict Category enum, not a
// widened `string`). Auto-fix Rule 1 — was `{ category: string; videos: Video[] }`.
async function callLoad(
  event: Parameters<typeof load>[0]
): Promise<PageData> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as PageData;
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

// ---------------------------------------------------------------------------
// Phase 5 D-04: PBS-only cross-link `→ About the PBS American Portrait project`
// rendered after the h1 and before the grid on /work/pbs-american-portrait/.
// RED-by-skip in Plan 05-01; Plan 05-02 Task 3 turns this green.
// All imports + vi.mock + vi.hoisted live at the TOP of this file (PART A).
// ---------------------------------------------------------------------------

let hostWk: HTMLElement;
let componentWk: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPageWk.url = new URL('http://localhost/');
  mockPageWk.route = { id: '/work/[category]' };
});
afterEach(() => {
  if (componentWk) { unmount(componentWk); componentWk = undefined; }
  hostWk?.remove();
});
function makeHostWk(): HTMLElement {
  hostWk = document.createElement('div');
  document.body.appendChild(hostWk);
  return hostWk;
}

describe.skip('/work/[category] — Phase 5 D-04 PBS cross-link', () => {
  it('PBS cross-link present when category === "PBS American Portrait"', async () => {
    const data = await callLoad({ params: { category: 'pbs-american-portrait' } } as Parameters<typeof load>[0]);
    componentWk = mount(Page, { target: makeHostWk(), props: { data } });
    const crossLink = hostWk.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).not.toBeNull();
    expect(crossLink?.textContent?.trim()).toContain('About the PBS American Portrait project');
  });

  it('PBS cross-link absent on non-PBS category (e.g. /work/reel)', async () => {
    const data = await callLoad({ params: { category: 'reel' } } as Parameters<typeof load>[0]);
    componentWk = mount(Page, { target: makeHostWk(), props: { data } });
    const crossLink = hostWk.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).toBeNull();
  });
});
