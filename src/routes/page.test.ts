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

async function loadPage() {
  // Runtime-computed specifier (string concat) is non-literal from Vite's
  // static-analysis perspective so vite:import-analysis skips resolution.
  // TypeScript widens dynamic specifiers to `any`, so no @ts-expect-error needed.
  const spec = './' + '+page.svelte';
  const mod = await import(/* @vite-ignore */ spec);
  return mod.default;
}

async function loadPageData() {
  // Loads the featured slice that the page expects to receive. If +page.ts
  // doesn't exist yet (Wave 0), this throws — describe.skip prevents that.
  // Same runtime-concat trick as loadPage() to defeat both Vite's
  // vite:import-analysis (literal-string resolve) and TypeScript's module
  // existence check.
  const spec = './' + '+page';
  const mod = await import(/* @vite-ignore */ spec);
  const result = await (mod.load as () => Promise<{ videos: unknown[] }>)();
  return result;
}

describe.skip('/+page.svelte — HERO-01 renders hero', () => {
  it('renders hero: composes <HeroPoster /> (h1 + img both present)', async () => {
    const Page = await loadPage();
    const data = await loadPageData();
    component = mount(Page, { target: makeHost(), props: { data } });
    // HeroPoster contributes the h1 + the hero <img>.
    expect(host.querySelector('h1')).not.toBeNull();
    expect(host.querySelector('img')).not.toBeNull();
  });
});

describe.skip('/+page.svelte — D-22 / D-24 8 featured cards', () => {
  it('8 featured cards: renders exactly 8 VideoCard <li> entries below the hero', async () => {
    const Page = await loadPage();
    const data = await loadPageData();
    component = mount(Page, { target: makeHost(), props: { data } });
    // VideoCard renders <li><a>...</a></li>. The featured grid has 8 cards.
    // The hero's PLAY REEL is an <a> but not inside a <li>.
    const liAnchors = host.querySelectorAll('ul > li > a');
    expect(liAnchors.length).toBe(8);
  });
});

describe.skip('/+page.svelte — D-28 View All Work link', () => {
  it('View All Work link: anchor ends with /work and has hover prefetch', async () => {
    const Page = await loadPage();
    const data = await loadPageData();
    component = mount(Page, { target: makeHost(), props: { data } });
    const viewAll = Array.from(host.querySelectorAll('a')).find((a) =>
      /view\s+all\s+work/i.test(a.textContent ?? '')
    );
    expect(viewAll).toBeDefined();
    expect(viewAll?.getAttribute('href')).toMatch(/\/work\/?$/);
    expect(viewAll?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
  });
});
