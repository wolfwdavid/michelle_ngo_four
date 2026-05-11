import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';

// Mock $app/paths so href assertions stay deterministic.
vi.mock('$app/paths', () => ({ base: '' }));

// Mock $app/state's page rune so the page renders deterministically; TopNav
// is NOT mounted by +page.svelte (lives in +layout.svelte), but defensive
// for any future hook.
const { mockPage } = vi.hoisted(() => ({
  mockPage: { url: new URL('http://localhost/'), route: { id: '/' } },
}));
vi.mock('$app/state', () => ({ page: mockPage }));

import Page from './+page.svelte';
import { load } from './+page';
import type { PageData } from './$types';

// SvelteKit's PageLoad generic widens the awaited return to a `Partial<...> & Record<string, any>`
// shape (videos is optional at that type level), but Page's `data` prop is strict PageData
// (videos required). Narrowing through a helper preserves the real runtime shape while keeping
// the static `import { load }` form — same idiom as /work/page.test.ts callLoad (carry-forward
// from Phase 3 Plan 03-02). The cast lands as PageData so `mount(Page, { props: { data } })`
// type-checks against the component's declared prop shape.
async function callLoad(): Promise<PageData> {
  const event = {} as Parameters<typeof load>[0];
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as PageData;
}

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;

beforeEach(() => {
  mockPage.url = new URL('http://localhost/');
  mockPage.route = { id: '/' };
});

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  host?.remove();
});

function makeHost(): HTMLElement {
  host = document.createElement('div');
  document.body.appendChild(host);
  return host;
}

describe('/+page.svelte — HERO-01 renders hero', () => {
  it('renders hero: composes <HeroPoster /> (h1 + img both present)', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    // HeroPoster contributes the h1 + the hero <img>.
    expect(host.querySelector('h1')).not.toBeNull();
    expect(host.querySelector('img')).not.toBeNull();
  });
});

describe('/+page.svelte — D-22 / D-24 8 featured cards', () => {
  it('8 featured cards: renders exactly 8 VideoCard <li> entries below the hero', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    // VideoCard renders <li><a>...</a></li>. The featured grid has 8 cards.
    // The hero's PLAY REEL is an <a> but not inside a <li>.
    const liAnchors = host.querySelectorAll('ul > li > a');
    expect(liAnchors.length).toBe(8);
  });
});

describe('/+page.svelte — D-28 View All Work link', () => {
  it('View All Work link: anchor ends with /work and has hover prefetch', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    const viewAll = Array.from(host.querySelectorAll('a')).find((a) =>
      /view\s+all\s+work/i.test(a.textContent ?? '')
    );
    expect(viewAll).toBeDefined();
    expect(viewAll?.getAttribute('href')).toMatch(/\/work\/?$/);
    expect(viewAll?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
  });
});
