import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import { getCategoriesInDisplayOrder } from '$lib/data';

// Mock $app/state's `page` rune-style export BEFORE importing TopNav.
// The mock is mutable per-test: tests overwrite `mockPage.url` to simulate route changes.
const mockPage = { url: new URL('http://localhost/') };
vi.mock('$app/state', () => ({ page: mockPage }));

// Mock $app/paths so the test doesn't depend on BASE_PATH being set during vitest run.
vi.mock('$app/paths', () => ({ base: '' }));

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;

beforeEach(() => {
  mockPage.url = new URL('http://localhost/');
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

// Lazy-import pattern (see VideoCard.test.ts header). Plan 03-04 creates
// TopNav.svelte and removes this indirection + the `@ts-expect-error`.
async function loadTopNav() {
  // Defeat Vite's static import-analysis by computing the specifier at runtime
  // (a non-literal expression). The suite is describe.skip until Plan 03-04
  // lands TopNav.svelte; at that point this whole indirection is removed and
  // replaced with a top-level static `import TopNav from './TopNav.svelte'`.
  const spec = './TopNav' + '.svelte';
  const mod = await import(/* @vite-ignore */ spec);
  return mod.default;
}

describe.skip('TopNav — NAV-01 baseline rendering (D-39, D-40)', () => {
  it('renders the MICHELLE NGO wordmark linking to /', async () => {
    const TopNav = await loadTopNav();
    component = mount(TopNav, { target: makeHost(), props: {} });
    // Wordmark is the first <a> inside <header>; href is base+'/' or just '/'.
    const wordmark = host.querySelector('header a');
    expect(wordmark?.textContent?.toLowerCase()).toContain('michelle ngo');
  });

  it('renders all 8 category links in getCategoriesInDisplayOrder() order', async () => {
    const TopNav = await loadTopNav();
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const linkTexts = Array.from(host.querySelectorAll('a'))
      .map((a) => a.textContent?.trim() ?? '')
      .filter((t) => order.includes(t as (typeof order)[number]));
    expect(linkTexts).toEqual(order);
  });

  it('renders About / Press / Contact secondary links', async () => {
    const TopNav = await loadTopNav();
    component = mount(TopNav, { target: makeHost(), props: {} });
    const texts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(texts).toContain('About');
    expect(texts).toContain('Press');
    expect(texts).toContain('Contact');
  });

  it('category links use /work/<slug> hrefs', async () => {
    const TopNav = await loadTopNav();
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.getAttribute('href')).toBe('/work/pbs-american-portrait');
  });
});

describe.skip('TopNav — active state (D-41)', () => {
  it('on /work/pbs-american-portrait, PBS link gets cat-pbs accent class', async () => {
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait');
    const TopNav = await loadTopNav();
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.className).toMatch(/text-cat-pbs/);
  });

  it('on /work (no filter), no category link is highlighted', async () => {
    mockPage.url = new URL('http://localhost/work');
    const TopNav = await loadTopNav();
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const highlighted = Array.from(host.querySelectorAll('a'))
      .filter((a) => order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]))
      .filter((a) => /text-cat-/.test(a.className));
    expect(highlighted.length).toBe(0);
  });

  it('on /watch/<id>, no category link is highlighted (D-41)', async () => {
    mockPage.url = new URL('http://localhost/watch/264677021');
    const TopNav = await loadTopNav();
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const highlighted = Array.from(host.querySelectorAll('a'))
      .filter((a) => order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]))
      .filter((a) => /text-cat-/.test(a.className));
    expect(highlighted.length).toBe(0);
  });
});
