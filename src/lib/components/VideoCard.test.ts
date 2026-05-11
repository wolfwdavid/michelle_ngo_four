import { afterEach, describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import { getById, type Video } from '$lib/data';

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

function reel(): Video {
  const v = getById('264677021');
  if (!v) throw new Error('test fixture missing: vimeo:264677021');
  return v;
}

// Lazy-import pattern: VideoCard.svelte doesn't exist in Wave 0 (Plan 03-01 creates
// it). A top-level static import would crash the test loader before the skipped
// describe block can suppress the suite. The Phase 2 Wave 0 plan (02-00) established
// this lazy `await import()` pattern with a leading `// @ts-expect-error` directive.
// Plan 03-01 removes `.skip` AND removes the `@ts-expect-error` directive once the
// component exists. Returns a default Svelte 5 component-export shape.
async function loadVideoCard() {
  // @ts-expect-error — component exists after Plan 03-01
  const mod = await import('./VideoCard.svelte');
  return mod.default;
}

describe.skip('VideoCard — GRID-01 (thumb + title + tag + uploader)', () => {
  it('renders thumb img with the video thumbnail URL', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const img = host.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(reel().thumbnail);
  });

  it('renders title as h3 with the video title', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const h3 = host.querySelector('h3');
    expect(h3?.textContent?.trim()).toBe(reel().title);
  });

  it('renders uploader text', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.textContent).toContain(reel().uploader);
  });

  it('renders category tag with the video category text', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.textContent).toContain(reel().category);
  });

  it('alt attribute matches video.title (D-18)', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const img = host.querySelector('img');
    expect(img?.getAttribute('alt')).toBe(reel().title);
  });
});

describe.skip('VideoCard — GRID-03 lazy loading (D-17)', () => {
  it('eager prop defaults to false → loading="lazy"', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const img = host.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('eager={true} → loading="eager" (first 8 above the fold)', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel(), eager: true } });
    const img = host.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
  });

  it('decoding="async" on every thumb (D-17)', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.querySelector('img')?.getAttribute('decoding')).toBe('async');
  });

  it('thumb wrapper uses aspect-video class (D-10) and bg-neutral-900 (D-16)', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const wrapper = host.querySelector('img')?.parentElement;
    expect(wrapper?.className).toMatch(/aspect-video/);
    expect(wrapper?.className).toMatch(/bg-neutral-900/);
  });

  it('img has transition-opacity class for D-16 fade-in', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.querySelector('img')?.className).toMatch(/transition-opacity/);
  });
});

describe.skip('VideoCard — GRID-04 click target (D-13, D-14)', () => {
  it('whole card is a single <a> link', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    // The card itself wraps everything in an <a>.
    const links = host.querySelectorAll('a');
    expect(links.length).toBe(1);
  });

  it('href ends with /watch/<video.id> (BASE_PATH-safe)', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const a = host.querySelector('a');
    expect(a?.getAttribute('href')).toMatch(/\/watch\/264677021$/);
  });

  it('has data-sveltekit-preload-data="hover" attribute (D-14)', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const a = host.querySelector('a');
    expect(a?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
  });

  it('category chip on the card is NOT a nested <a> (D-13 — invalid HTML)', async () => {
    const VideoCard = await loadVideoCard();
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    // The chip should be a <span>, not an <a>. Total <a> count is 1 (the outer card).
    expect(host.querySelectorAll('a').length).toBe(1);
  });
});
