import { afterEach, describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';

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

// Lazy-import pattern (see VideoCard.test.ts header). Plan 03-01 creates
// CategoryTag.svelte and removes this indirection + the `@ts-expect-error`.
async function loadCategoryTag() {
  // @ts-expect-error — component exists after Plan 03-01
  const mod = await import('./CategoryTag.svelte');
  return mod.default;
}

describe.skip('CategoryTag — GRID-05 per-category accent', () => {
  it('renders the category text', async () => {
    const CategoryTag = await loadCategoryTag();
    component = mount(CategoryTag, {
      target: makeHost(),
      props: { category: 'PBS American Portrait' },
    });
    expect(host.textContent?.trim()).toBe('PBS American Portrait');
  });

  it('PBS gets the cat-pbs accent class (D-04 most-prominent)', async () => {
    const CategoryTag = await loadCategoryTag();
    component = mount(CategoryTag, {
      target: makeHost(),
      props: { category: 'PBS American Portrait' },
    });
    const el = host.firstElementChild;
    expect(el?.className).toMatch(/text-cat-pbs/);
  });

  it('Reel gets the cat-reel accent class', async () => {
    const CategoryTag = await loadCategoryTag();
    component = mount(CategoryTag, { target: makeHost(), props: { category: 'Reel' } });
    expect(host.firstElementChild?.className).toMatch(/text-cat-reel/);
  });

  it('renders as <span> when no href prop (D-13 — non-interactive on cards)', async () => {
    const CategoryTag = await loadCategoryTag();
    component = mount(CategoryTag, { target: makeHost(), props: { category: 'Reel' } });
    expect(host.querySelector('a')).toBeNull();
    expect(host.querySelector('span')).not.toBeNull();
  });

  it('renders as <a> when href prop is provided (D-35 — interactive on /watch)', async () => {
    const CategoryTag = await loadCategoryTag();
    component = mount(CategoryTag, {
      target: makeHost(),
      props: { category: 'Reel', href: '/work/reel' },
    });
    const a = host.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('/work/reel');
  });

  it('uses text-xs uppercase tracking (D-12) typography classes', async () => {
    const CategoryTag = await loadCategoryTag();
    component = mount(CategoryTag, { target: makeHost(), props: { category: 'Other' } });
    const el = host.firstElementChild;
    expect(el?.className).toMatch(/text-xs/);
    expect(el?.className).toMatch(/uppercase/);
    expect(el?.className).toMatch(/tracking-/);
  });
});
