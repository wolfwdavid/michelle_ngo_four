import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page';
import type { PageData } from './$types';
import type { Video } from '$lib/data';

// Mock $app/state + $app/paths BEFORE Page import (same pattern as TopNav.test.ts).
const { mockPage } = vi.hoisted(() => ({
  mockPage: { url: new URL('http://localhost/pbs-american-portrait/'), route: { id: '/pbs-american-portrait' as string | null } },
}));
vi.mock('$app/state', () => ({ page: mockPage }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

// PageData narrower (mirrors src/routes/+page.ts test in Phase 4 Plan 04-05).
// Returns the full PageData shape so `mount(Page, { props: { data } })` accepts
// it without prop-type errors; assertions cast to `Video[]` as needed.
async function callLoad(
  event: Parameters<typeof load>[0]
): Promise<PageData> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as PageData;
}

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPage.url = new URL('http://localhost/pbs-american-portrait/');
  mockPage.route = { id: '/pbs-american-portrait' };
});
afterEach(() => {
  if (component) { unmount(component); component = undefined; }
  host?.remove();
});
function makeHost(): HTMLElement {
  host = document.createElement('div');
  document.body.appendChild(host);
  return host;
}

describe.skip('/pbs-american-portrait load — PBS-02 (D-18 sort, 18 cards)', () => {
  it('load returns 18 videos (all PBS)', async () => {
    const result = await callLoad({} as Parameters<typeof load>[0]);
    expect(result.videos.length).toBe(18);
    for (const v of result.videos) {
      expect((v as Video).category).toBe('PBS American Portrait');
    }
  });
  it('sort featured-first then published date desc (D-25)', async () => {
    const result = await callLoad({} as Parameters<typeof load>[0]);
    // Featured rows precede non-featured.
    let sawNonFeatured = false;
    for (const v of result.videos) {
      if (!(v as Video & { featured: boolean }).featured) sawNonFeatured = true;
      else if (sawNonFeatured) throw new Error('featured row after non-featured — sort violated');
    }
    // Within non-featured: dates monotonically non-increasing.
    const nonFeatured = result.videos.filter((v) => !(v as Video & { featured: boolean }).featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      expect(nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe.skip('/pbs-american-portrait render — PBS-02 (D-08, D-09, D-10, D-12, D-16, D-19)', () => {
  it('renders 18 cards', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    // VideoCard wraps each card in a single <a> with href /watch/[id] — count the anchors that match.
    const cardLinks = Array.from(host.querySelectorAll('a[href^="/watch/"]'));
    expect(cardLinks.length).toBe(18);
  });
  it('h1 has text-cat-pbs class and text "PBS American Portrait" (D-08)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const h1 = host.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('PBS American Portrait');
    expect(h1?.className).toMatch(/text-cat-pbs/);
  });
  it('subtitle text present "18 stories produced by Michelle Ngo" (D-09)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    // Locate the paragraph whose textContent matches verbatim.
    const subtitleP = Array.from(host.querySelectorAll('p')).find(
      (p) => p.textContent?.trim() === '18 stories produced by Michelle Ngo'
    );
    expect(subtitleP).toBeDefined();
  });
  it('blockquote rendered with non-trivial body (D-10)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const bq = host.querySelector('blockquote');
    expect(bq).toBeDefined();
    expect((bq?.textContent?.trim().length ?? 0)).toBeGreaterThanOrEqual(20);
  });
  it('outbound link attrs: target=_blank rel=noopener (D-12)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const outbound = host.querySelector('a[href="https://www.pbs.org/american-portrait/"]');
    expect(outbound).toBeDefined();
    expect(outbound?.getAttribute('target')).toBe('_blank');
    expect(outbound?.getAttribute('rel')).toBe('noopener');
  });
  it('h2 "Stories" present (D-16)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const h2 = host.querySelector('h2');
    expect(h2?.textContent?.trim()).toBe('Stories');
  });
});

describe.skip('/pbs-american-portrait per-card PBS badges — PBS-02 (D-21)', () => {
  it('15 "See on PBS →" badges rendered (3 PBS videos have no collection URL)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    // Per-card badge anchors point at pbs.org/american-portrait/collection/...
    const badges = Array.from(host.querySelectorAll('a[href*="pbs.org/american-portrait/collection/"]'));
    expect(badges.length).toBe(15);
    // All open in new tab with noopener.
    for (const b of badges) {
      expect(b.getAttribute('target')).toBe('_blank');
      expect(b.getAttribute('rel')).toBe('noopener');
      expect(b.textContent?.trim()).toContain('See on PBS');
    }
  });
});
