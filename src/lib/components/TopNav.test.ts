import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $app/state's `page` rune-style export BEFORE importing TopNav.
// The mock is mutable per-test: tests overwrite `mockPage.url` to simulate route changes.
//
// `vi.mock` is hoisted to the top of the file by Vitest's transformer (above all
// imports). Plain top-level `const` declarations are NOT hoisted with it, which
// produces a TDZ "Cannot access 'mockPage' before initialization" error when the
// mock factory runs. `vi.hoisted` lifts the const initialization alongside the
// mock so the factory can safely reference it (Vitest 4 idiom).
const { mockPage } = vi.hoisted(() => ({
  mockPage: { url: new URL('http://localhost/') },
}));
vi.mock('$app/state', () => ({ page: mockPage }));

// Mock $app/paths so the test doesn't depend on BASE_PATH being set during vitest run.
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import TopNav from './TopNav.svelte';
import { getCategoriesInDisplayOrder } from '$lib/data';

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

describe('TopNav — NAV-01 baseline rendering (D-39, D-40)', () => {
  it('renders the MICHELLE NGO wordmark linking to /', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    // Wordmark is the first <a> inside <header>; href is base+'/' or just '/'.
    const wordmark = host.querySelector('header a');
    expect(wordmark?.textContent?.toLowerCase()).toContain('michelle ngo');
  });

  it('renders all 8 category links in getCategoriesInDisplayOrder() order', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const linkTexts = Array.from(host.querySelectorAll('a'))
      .map((a) => a.textContent?.trim() ?? '')
      .filter((t) => order.includes(t as (typeof order)[number]));
    expect(linkTexts).toEqual(order);
  });

  it('renders About / Press / Contact secondary links', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    const texts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(texts).toContain('About');
    expect(texts).toContain('Press');
    expect(texts).toContain('Contact');
  });

  it('category links use /work/<slug> hrefs', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.getAttribute('href')).toBe('/work/pbs-american-portrait');
  });
});

describe('TopNav — active state (D-41)', () => {
  it('on /work/pbs-american-portrait, PBS link gets cat-pbs accent class', () => {
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.className).toMatch(/text-cat-pbs/);
  });

  it('on /work/pbs-american-portrait/ (trailing slash, production shape under trailingSlash=always), PBS link still gets cat-pbs accent class', () => {
    // src/routes/+layout.ts sets `trailingSlash = 'always'` (Plan 03-03), so the
    // production URL on a /work/<slug>/ prerendered page carries a trailing slash.
    // isActive(slug) MUST normalize pathname before comparison or the active
    // branch is unreachable. Regression test for 03-VERIFICATION.md gap.
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.className).toMatch(/text-cat-pbs/);
  });

  it('on /work (no filter), no category link is highlighted', () => {
    mockPage.url = new URL('http://localhost/work');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const highlighted = Array.from(host.querySelectorAll('a'))
      .filter((a) => order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]))
      .filter((a) => /text-cat-/.test(a.className));
    expect(highlighted.length).toBe(0);
  });

  it('on /watch/<id>, no category link is highlighted (D-41)', () => {
    mockPage.url = new URL('http://localhost/watch/264677021');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const highlighted = Array.from(host.querySelectorAll('a'))
      .filter((a) => order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]))
      .filter((a) => /text-cat-/.test(a.className));
    expect(highlighted.length).toBe(0);
  });
});
