import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';

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

async function loadHeroPoster() {
  // Lazy dynamic import — file doesn't exist in Wave 0; flipped to static
  // import once Plan 04-02 creates HeroPoster.svelte.
  // Runtime-computed specifier (string concat) is non-literal from Vite's
  // static-analysis perspective so vite:import-analysis skips resolution.
  // TypeScript widens dynamic specifiers to `any`, so no @ts-expect-error needed.
  const spec = './' + 'HeroPoster.svelte';
  const mod = await import(/* @vite-ignore */ spec);
  return mod.default;
}

describe.skip('HeroPoster — HERO-01 LCP attrs', () => {
  it('LCP attrs: <img> has loading="eager" and fetchpriority="high"', async () => {
    const HeroPoster = await loadHeroPoster();
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const img = host.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
  });
});

describe.skip('HeroPoster — HERO-01 preload link', () => {
  it('preload link: <svelte:head> emits <link rel="preload" as="image"> for hero asset', async () => {
    const HeroPoster = await loadHeroPoster();
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    // <svelte:head> appends to document.head, not the host.
    const link = document.head.querySelector('link[rel="preload"][as="image"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('fetchpriority')).toBe('high');
  });
});

describe.skip('HeroPoster — HERO-02 name and tagline', () => {
  it('name and tagline: renders <h1>Michelle Ngo</h1> and a <p> containing "Filmmaker & Producer"', async () => {
    const HeroPoster = await loadHeroPoster();
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const h1 = host.querySelector('h1');
    expect(h1?.textContent?.trim().toLowerCase()).toBe('michelle ngo');
    const text = host.textContent ?? '';
    expect(text).toMatch(/filmmaker\s*&\s*producer/i);
  });
});

describe.skip('HeroPoster — HERO-03 PLAY REEL', () => {
  it('PLAY REEL href: anchor points to /watch/264677021 (producerReelId)', async () => {
    const HeroPoster = await loadHeroPoster();
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const playReel = Array.from(host.querySelectorAll('a')).find((a) =>
      /play\s*reel/i.test(a.textContent ?? '')
    );
    expect(playReel).toBeDefined();
    expect(playReel?.getAttribute('href')).toMatch(/\/watch\/264677021$/);
  });

  it('PLAY REEL prefetch: anchor has data-sveltekit-preload-data="hover"', async () => {
    const HeroPoster = await loadHeroPoster();
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const playReel = Array.from(host.querySelectorAll('a')).find((a) =>
      /play\s*reel/i.test(a.textContent ?? '')
    );
    expect(playReel?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
  });
});

describe.skip('HeroPoster — sentinel for TopNav IntersectionObserver (D-14)', () => {
  it('renders a div with id="hero-sentinel" inside the hero section', async () => {
    const HeroPoster = await loadHeroPoster();
    component = mount(HeroPoster, { target: makeHost(), props: {} });
    const sentinel = host.querySelector('#hero-sentinel');
    expect(sentinel).not.toBeNull();
  });
});
