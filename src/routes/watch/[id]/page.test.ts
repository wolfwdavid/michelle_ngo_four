import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load, entries } from './+page';
import { videos, producerReelId } from '$lib/data';
import type { Video } from '$lib/data';

// Phase 5 D-05 mocks: $app/state + $app/paths. vi.hoisted lifts mockPageW
// alongside the vi.mock() factory (Vitest 4 idiom — see TopNav.test.ts lines 11-17
// for the canonical reference pattern). Distinct identifier (`mockPageW`) avoids
// any future collision if more test files share the worker.
const { mockPageW } = vi.hoisted(() => ({
  mockPageW: { url: new URL('http://localhost/'), route: { id: null as string | null } },
}));
vi.mock('$app/state', () => ({ page: mockPageW }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

// SvelteKit's PageLoad generic widens the awaited return to `void | (... & Record<string, any>)`,
// which blocks direct property access. Narrowing through a small helper preserves the
// real runtime shape while keeping the static `import { load }` form. Plan 03-01's
// downstream contract requires removing the lazy `loadPage()` indirection AND the
// `@ts-expect-error` directive — this narrow is the route-test equivalent. The
// parallel /work/page.test.ts uses the identical pattern.
async function callLoad(
  event: Parameters<typeof load>[0]
): Promise<{ video: Video; rail: Video[] }> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as { video: Video; rail: Video[] };
}

describe('/watch/[id] +page.ts load — FILT-01 (D-31, D-32, D-33)', () => {
  it('valid id returns the matching video', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    expect(result.video.id).toBe(producerReelId);
    expect(result.video.category).toBe('Reel');
  });

  it('unknown id throws 404 (D-32)', async () => {
    await expect(
      load({ params: { id: 'does-not-exist-xyz' } } as Parameters<typeof load>[0])
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('/watch/[id] +page.ts load — FILT-02 rail (D-36, D-37, D-38)', () => {
  it('rail contains other videos in the same category', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    for (const v of result.rail) {
      expect(v.category).toBe('Reel');
      expect(v.id).not.toBe(producerReelId);
    }
  });

  it('rail excludes the current video (D-37)', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    const ids = result.rail.map((v) => v.id);
    expect(ids).not.toContain(producerReelId);
  });

  it('rail count = same-category count - 1 (Reel has 4; rail = 3)', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    expect(result.rail.length).toBe(3);
  });

  it('rail is sorted featured-first then published date desc (D-25)', async () => {
    // Pick a PBS video (18 in that category — plenty of sortable rail items).
    const pbs = videos.find((v) => v.category === 'PBS American Portrait');
    if (!pbs) throw new Error('test fixture missing: any PBS video');
    const result = await callLoad({
      params: { id: pbs.id },
    } as Parameters<typeof load>[0]);
    const nonFeatured = result.rail.filter((v) => !v.featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      expect(
        nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('/watch/[id] +page.ts entries — FILT-01 prerender enumeration', () => {
  it('returns one entry per video — count matches videos.length (56)', async () => {
    const list = entries() as Array<{ id: string }>;
    expect(list.length).toBe(56);
  });

  it('every entry has a non-empty id', async () => {
    const list = entries() as Array<{ id: string }>;
    for (const e of list) {
      expect(typeof e.id).toBe('string');
      expect(e.id.length).toBeGreaterThan(0);
    }
  });

  it('entries include the producer reel id (vimeo:264677021)', async () => {
    const ids = (entries() as Array<{ id: string }>).map((e) => e.id);
    expect(ids).toContain('264677021');
  });
});

// ---------------------------------------------------------------------------
// Phase 5 D-05: PBS-only cross-link `→ About the PBS American Portrait project`
// rendered below the description on /watch/[id]. RED-by-skip in Plan 05-01;
// Plan 05-02 Task 3 turns this green by adding the conditional anchor.
// All imports + vi.mock + vi.hoisted live at the TOP of this file (PART A).
// ---------------------------------------------------------------------------

let hostW: HTMLElement;
let componentW: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPageW.url = new URL('http://localhost/');
  mockPageW.route = { id: '/watch/[id]' };
});
afterEach(() => {
  if (componentW) { unmount(componentW); componentW = undefined; }
  hostW?.remove();
});
function makeHostW(): HTMLElement {
  hostW = document.createElement('div');
  document.body.appendChild(hostW);
  return hostW;
}

describe('/watch/[id] — Phase 5 D-05 PBS cross-link', () => {
  it('PBS cross-link present when video.category === "PBS American Portrait"', async () => {
    // Pick the first PBS video in the data (any will do — the link is conditional, not data-dependent).
    const pbs = videos.find((v) => v.category === 'PBS American Portrait');
    if (!pbs) throw new Error('test fixture missing: any PBS video');
    const data = await callLoad({ params: { id: pbs.id } } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    const crossLink = hostW.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).not.toBeNull();
    expect(crossLink?.textContent?.trim()).toContain('About the PBS American Portrait project');
  });

  it('PBS cross-link absent when video.category !== "PBS American Portrait"', async () => {
    // Producer reel — category === 'Reel'.
    const data = await callLoad({ params: { id: producerReelId } } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    const crossLink = hostW.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).toBeNull();
  });
});
