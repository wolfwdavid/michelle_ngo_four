<!--
  Phase 3 D-42: full-screen mobile overlay menu. Triggered from TopNav's
  hamburger (visible only <sm). Closes via close button or any link tap.

  Animation: instant (no transition) — sidesteps prefers-reduced-motion
  handling per CONTEXT.md Claude's Discretion.

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  MobileMenu is a leaf nav component; hrefs are produced base-path-safely
  via `${base}/...` template literals (same pattern as VideoCard / TopNav).
  Wrapping in resolve() here would break test patterns that assert literal
  hrefs and add no runtime safety.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';

  type Props = {
    /** Called when the user closes the menu (close button or link tap). */
    onclose: () => void;
  };
  let { onclose }: Props = $props();

  const categories = getCategoriesInDisplayOrder();
</script>

<div class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
  <div class="flex items-center justify-between px-4 h-14 border-b border-white/10">
    <a href={base || '/'} onclick={onclose} class="text-sm font-bold uppercase tracking-widest">
      Michelle Ngo
    </a>
    <button type="button" class="p-2 -mr-2" aria-label="Close menu" onclick={onclose}>
      <span class="block w-5 h-px bg-white rotate-45 translate-y-px"></span>
      <span class="block w-5 h-px bg-white -rotate-45 -translate-y-px"></span>
    </button>
  </div>

  <nav class="flex-1 overflow-y-auto px-4 py-6">
    <ul class="space-y-4 text-base uppercase tracking-wider">
      {#each categories as category (category)}
        <li>
          <a
            href={`${base}/work/${categoryToSlug(category)}`}
            onclick={onclose}
            class="block hover:underline"
          >
            {category}
          </a>
        </li>
      {/each}
    </ul>

    <hr class="my-6 border-white/10" />

    <ul class="space-y-3 text-sm uppercase tracking-wider text-neutral-400">
      <li>
        <a href={`${base}/about`} onclick={onclose} class="block hover:text-white">About</a>
      </li>
      <li>
        <a href={`${base}/press`} onclick={onclose} class="block hover:text-white">Press</a>
      </li>
      <li>
        <a href={`${base}/contact`} onclick={onclose} class="block hover:text-white">Contact</a>
      </li>
    </ul>
  </nav>
</div>
