import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import HeroPoster from './HeroPoster.svelte';

// Mock $app/paths so href assertions are deterministic regardless of BASE_PATH.
vi.mock('$app/paths', () => ({ base: '' }));

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;

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

describe('HeroPoster — HERO-01 LCP attrs', () => {
  it('LCP attrs: <img> has loading="eager" and fetchpriority="high"', () => {
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const img = host.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
  });
});

describe('HeroPoster — HERO-01 preload link', () => {
  it('preload link: <svelte:head> emits <link rel="preload" as="image"> for hero asset', () => {
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    // <svelte:head> appends to document.head, not the host.
    const link = document.head.querySelector('link[rel="preload"][as="image"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('fetchpriority')).toBe('high');
  });
});

describe('HeroPoster — HERO-02 name and tagline', () => {
  it('name and tagline: renders <h1>Michelle Ngo</h1> and a <p> containing "Filmmaker & Producer"', () => {
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const h1 = host.querySelector('h1');
    expect(h1?.textContent?.trim().toLowerCase()).toBe('michelle ngo');
    const text = host.textContent ?? '';
    expect(text).toMatch(/filmmaker\s*&\s*producer/i);
  });
});

describe('HeroPoster — HERO-03 PLAY REEL', () => {
  it('PLAY REEL href: anchor points to /watch/264677021 (producerReelId)', () => {
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const playReel = Array.from(host.querySelectorAll('a')).find((a) =>
      /play\s*reel/i.test(a.textContent ?? '')
    );
    expect(playReel).toBeDefined();
    expect(playReel?.getAttribute('href')).toMatch(/\/watch\/264677021$/);
  });

  it('PLAY REEL prefetch: anchor has data-sveltekit-preload-data="hover"', () => {
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const playReel = Array.from(host.querySelectorAll('a')).find((a) =>
      /play\s*reel/i.test(a.textContent ?? '')
    );
    expect(playReel?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
  });
});

describe('HeroPoster — sentinel for TopNav IntersectionObserver (D-14)', () => {
  it('renders a div with id="hero-sentinel" inside the hero section', () => {
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const sentinel = host.querySelector('#hero-sentinel');
    expect(sentinel).not.toBeNull();
  });
});
