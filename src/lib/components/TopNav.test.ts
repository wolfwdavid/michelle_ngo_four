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
  mockPage: {
    url: new URL('http://localhost/'),
    route: { id: '/' as string | null },
  },
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

// ---------------------------------------------------------------------------
// Phase 4 D-13 / D-14: scroll-aware TopNav on `/` only.
// RED-by-skip in Wave 0; Plan 04-04 turns these green after extending TopNav with
// the IntersectionObserver $effect.
// ---------------------------------------------------------------------------

function makeSentinel(): HTMLElement {
  // HeroPoster renders <div id="hero-sentinel"> inside the hero section.
  // Tests construct the sentinel inline to simulate HeroPoster having mounted.
  const sentinel = document.createElement('div');
  sentinel.id = 'hero-sentinel';
  document.body.appendChild(sentinel);
  return sentinel;
}

describe.skip('TopNav — D-13 scroll-aware on home', () => {
  it('scroll-aware home: on route "/", TopNav attaches an IntersectionObserver on #hero-sentinel', () => {
    mockPage.route = { id: '/' };
    mockPage.url = new URL('http://localhost/');
    const sentinel = makeSentinel();
    // Spy on the global stub so we can verify observe() was called with the sentinel.
    // vitest-setup-ui.ts wires a global stub class — its observe() is a vi.fn().
    // Pattern: capture the constructor call args via the stub class.
    const observed: Element[] = [];
    const originalIO = globalThis.IntersectionObserver;
    class TrackingIO {
      observe = (el: Element) => observed.push(el);
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '';
      thresholds = [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_cb: IntersectionObserverCallback) {}
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.IntersectionObserver = TrackingIO as any;
    try {
      component = mount(TopNav, { target: makeHost(), props: {} });
      expect(observed).toContain(sentinel);
    } finally {
      globalThis.IntersectionObserver = originalIO;
      sentinel.remove();
    }
  });

  it('scroll-aware home: TopNav <header> has bg-neutral-950 class by default (sentinel not intersecting)', () => {
    mockPage.route = { id: '/' };
    mockPage.url = new URL('http://localhost/');
    makeSentinel();
    component = mount(TopNav, { target: makeHost(), props: {} });
    // Default: heroVisible=false → solid bg.
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
  });
});

describe.skip('TopNav — D-13 solid on non-home routes', () => {
  it('solid on non-home: on /work, TopNav <header> renders bg-neutral-950 (no transparent class)', () => {
    mockPage.route = { id: '/work' };
    mockPage.url = new URL('http://localhost/work/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /work/[category], TopNav stays solid', () => {
    mockPage.route = { id: '/work/[category]' };
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /watch/[id], TopNav stays solid', () => {
    mockPage.route = { id: '/watch/[id]' };
    mockPage.url = new URL('http://localhost/watch/264677021/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /about, TopNav stays solid', () => {
    mockPage.route = { id: '/about' };
    mockPage.url = new URL('http://localhost/about/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /press, TopNav stays solid', () => {
    mockPage.route = { id: '/press' };
    mockPage.url = new URL('http://localhost/press/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /contact, TopNav stays solid', () => {
    mockPage.route = { id: '/contact' };
    mockPage.url = new URL('http://localhost/contact/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });
});
