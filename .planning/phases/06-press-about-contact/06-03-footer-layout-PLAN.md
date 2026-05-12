---
phase: 06-press-about-contact
plan: 03
type: execute
wave: 2
depends_on:
  - 06-02
files_modified:
  - src/lib/components/Footer.svelte
  - src/lib/components/Footer.test.ts
  - src/routes/+layout.svelte
autonomous: true
requirements:
  - CONT-01
  - NAV-02
must_haves:
  truths:
    - "Every prerendered route on the site renders a site-wide footer below the page content."
    - "The footer shows the contact block in column 1 (email mailto + phone tel + IMDb + LinkedIn + Vimeo) — same component instance as /about and /contact."
    - "The footer mirrors the TopNav: 8 category links in display order (PBS retargeted to /pbs-american-portrait/ per Phase 5 D-02; the other 7 use the same /work/<slug> form as TopNav) in column 2, secondary links (About, Press, Contact, View All Work →) in column 3."
    - "A bottom strip below the three columns shows `© 2026 Michelle Ngo  ·  Built with SvelteKit`, separated by a hairline `border-t border-white/10`."
    - "Footer renders on /, /work, /watch/[any-id], /press, /about, /contact, /pbs-american-portrait — verified at minimum on the prerendered HTML for at least one route via spot-check."
  artifacts:
    - path: "src/lib/components/Footer.svelte"
      provides: "Site-wide footer: three-column desktop / one-column mobile grid + bottom strip. Imports ContactBlock, getCategoriesInDisplayOrder, categoryToSlug, base."
      min_lines: 80
    - path: "src/lib/components/Footer.test.ts"
      provides: "Vitest 'ui' project component test — three columns rendered, contact block in column 1, 8 category links in column 2 with PBS retarget, secondary links + View All Work in column 3, copyright bottom strip with literal `© 2026 Michelle Ngo` and `Built with SvelteKit`."
    - path: "src/routes/+layout.svelte"
      provides: "Updated to render <Footer /> below {@render children()} (D-04). <TopNav /> stays unchanged."
      contains: "Footer"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "src/lib/components/Footer.svelte"
      via: "import Footer from '$lib/components/Footer.svelte' AND <Footer /> below {@render children()}"
      pattern: "import\\s+Footer\\s+from\\s+'\\$lib/components/Footer\\.svelte'"
    - from: "src/lib/components/Footer.svelte"
      to: "src/lib/components/ContactBlock.svelte"
      via: "import ContactBlock — column 1 just renders <ContactBlock />"
      pattern: "import\\s+ContactBlock\\s+from\\s+'\\$lib/components/ContactBlock\\.svelte'"
    - from: "src/lib/components/Footer.svelte"
      to: "Phase 5 D-02 PBS retarget (/pbs-american-portrait/) + Phase 3 D-43 /work/<slug>"
      via: "{slug === 'pbs-american-portrait' ? ... : ...} ternary on each category link"
      pattern: "pbs-american-portrait"
---

<objective>
Build the site-wide `<Footer />` component and wire it into `src/routes/+layout.svelte`. The footer is three-column on desktop (ContactBlock + mirrored categories + secondary nav), single-column on mobile, with a copyright bottom strip. Every prerendered route renders the footer inline — satisfying NAV-02 (footer mirrors top nav) and the footer half of CONT-01 (email/phone/IMDb/LinkedIn/Vimeo on every page).

Purpose: Satisfies REQ NAV-02 (footer mirrors top nav) + CONT-01 footer half (contact channels surfaced on every page). Phase 6 D-04 + D-24 through D-31 + D-36 + D-38.

Output: Footer component + test + layout wiring. No new dependencies. Consumes `<ContactBlock />` from Plan 06-02 (this plan WILL FAIL at compile time if 06-02 hasn't completed).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-press-about-contact/06-CONTEXT.md
@.planning/phases/06-press-about-contact/06-02-about-contact-pages-PLAN.md
@src/routes/+layout.svelte
@src/lib/components/TopNav.svelte
@src/lib/data/index.ts
@src/lib/data/categories.ts

<interfaces>
<!-- From src/lib/data/index.ts: -->
<!--   import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data'; -->
<!--   - getCategoriesInDisplayOrder() → Category[]   // 8 categories, D-04 count-desc tie-alpha order -->
<!--   - categoryToSlug(category: Category) → string  // e.g., 'PBS American Portrait' → 'pbs-american-portrait' -->

<!-- From src/lib/components/ContactBlock.svelte (Plan 06-02 output): -->
<!--   import ContactBlock from '$lib/components/ContactBlock.svelte'; -->
<!--   - NO props. Renders <ul> of 5 channel <li> rows in D-36 order. -->

<!-- TopNav category href logic (Phase 5 D-02 — src/lib/components/TopNav.svelte lines 132-135): -->
<!--   {@const href = -->
<!--     slug === 'pbs-american-portrait' -->
<!--       ? `${base}/pbs-american-portrait/` -->
<!--       : `${base}/work/${slug}`} -->
<!-- The Footer mirror uses the SAME ternary verbatim (D-27 — same href logic as TopNav). -->
<!-- NOTE: TopNav uses `/work/${slug}` (no trailing slash) for non-PBS categories. -->
<!-- The footer matches TopNav exactly to preserve "mirror" semantics. trailingSlash='always' -->
<!-- normalizes the URL on click — both forms reach the same prerendered HTML. -->

<!-- TopNav secondary link href logic (lines 147-149): -->
<!--   <a href={`${base}/about`} ...> -->
<!--   <a href={`${base}/press`} ...> -->
<!--   <a href={`${base}/contact`} ...> -->
<!-- Same form (no trailing slash) used in Footer column 3 to keep "mirror" exact. -->
<!-- D-28 in CONTEXT.md text uses `${base}/about/` form (with slash) — this is an -->
<!-- inconsistency in the context document; TopNav source is the source of truth. -->
<!-- Both forms work; matching TopNav is the safer call for "mirror" semantics. -->

<!-- Phase 4 D-28 "View All Work →" pattern (src/routes/+page.svelte line 39): -->
<!--   <a href={`${base}/work`} data-sveltekit-preload-data="hover" ...>View All Work →</a> -->
<!-- Footer column 3 reuses the SAME href form (no trailing slash). -->
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build &lt;Footer /&gt; component + tests</name>
  <files>src/lib/components/Footer.svelte, src/lib/components/Footer.test.ts</files>
  <read_first>
    - src/lib/components/ContactBlock.svelte (Plan 06-02 output — MUST exist; verify import path)
    - src/lib/components/TopNav.svelte (D-27 inherits the category href ternary VERBATIM; lines 132-135 are the canonical source)
    - src/lib/components/TopNav.test.ts (vitest 'ui' project component-test pattern with vi.hoisted mockPage + $app/state + $app/paths mocks)
    - src/lib/data/index.ts (confirm `getCategoriesInDisplayOrder` and `categoryToSlug` exports)
    - src/lib/data/categories.ts (confirm CATEGORIES array — verify the executor knows there are exactly 8 categories)
    - src/routes/+page.svelte (Phase 4 D-28 "View All Work →" pattern — line 39 `${base}/work` no trailing slash)
    - .planning/phases/06-press-about-contact/06-CONTEXT.md §Footer (D-24 through D-31)
  </read_first>
  <behavior>
    - Test 1: Footer renders three column elements at the top level of its inner grid (assert via `[data-footer-col]` markers or count children of the grid container).
    - Test 2: Column 1 contains a `<ContactBlock />` — assert at least 5 `<li>` rows with the same channel anchors as ContactBlock.test.ts (mailto:mynogo@gmail.com, tel:+19175661976, IMDb, LinkedIn, Vimeo).
    - Test 3: Column 2 contains 8 category links in `getCategoriesInDisplayOrder()` order; the PBS American Portrait link href ends with `/pbs-american-portrait/`; the Reel link href ends with `/work/reel` (no trailing slash, matching TopNav).
    - Test 4: Column 3 contains exactly 4 secondary links in this order: About, Press, Contact, View All Work →. Hrefs match `/about`, `/press`, `/contact`, `/work` respectively (matching TopNav + Phase 4 D-28).
    - Test 5: Every internal link in the footer has `data-sveltekit-preload-data="hover"` (D-30 — Phase 3 D-14 hover prefetch inherited).
    - Test 6: Bottom strip renders literal text `© 2026 Michelle Ngo  ·  Built with SvelteKit` (use `textContent.includes` to ignore inter-element whitespace).
    - Test 7: Bottom strip is separated from the columns by a `border-t border-white/10` element (D-29, D-30).
    - Test 8: The footer's outer `<footer>` element exists.
    - Test 9: No category link in the footer carries an active-state accent class (D-31 — no `text-cat-pbs`, `text-cat-promo`, etc. on footer category anchors).
  </behavior>
  <action>
    Create **src/lib/components/Footer.svelte** verbatim:

    ```svelte
    <!--
      Phase 6 NAV-02 / CONT-01 (footer half): site-wide footer.

      Decisions implemented:
        D-04 — lives in src/routes/+layout.svelte, below {@render children()}
        D-24 — new component at src/lib/components/Footer.svelte
        D-25 — three-column desktop / single-column mobile grid
        D-26 — column 1: <ContactBlock /> (same shared component as /about + /contact)
        D-27 — column 2: 8 category links in display order, PBS retargeted to /pbs-american-portrait/
        D-28 — column 3: About, Press, Contact, View All Work →
        D-29 — bottom strip: © 2026 Michelle Ngo  ·  Built with SvelteKit
        D-30 — hairline border-t border-white/10, bg-neutral-950 continuous, py-12 md:py-16
        D-31 — NO active-state highlighting on footer category links (footer is static directory)
        D-32 — ContactBlock reused VERBATIM (no orientation prop, no variants)
        D-38 — CONT-02 satisfied: editing email/phone in ContactBlock propagates here

      ESLint: svelte/no-navigation-without-resolve disabled — internal hrefs built
      from `${base}/...` (same idiom as TopNav + VideoCard + page-level /work link).

      Mirror semantics (D-27): category link hrefs match TopNav exactly. TopNav uses
      `${base}/work/${slug}` (no trailing slash) for non-PBS categories — this footer
      uses the same form to keep "mirror" exact. SvelteKit normalizes URLs on click
      under trailingSlash='always'; both forms reach the same prerendered HTML.
    -->
    <script lang="ts">
      /* eslint-disable svelte/no-navigation-without-resolve */
      import { base } from '$app/paths';
      import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
      import ContactBlock from './ContactBlock.svelte';

      const categories = getCategoriesInDisplayOrder();
    </script>

    <footer class="border-t border-white/10 bg-neutral-950 py-12 md:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
        >
          <!-- Column 1: ContactBlock (D-26) — same shared component as /about + /contact (D-32, D-38) -->
          <div data-footer-col="contact">
            <h3 class="text-xs uppercase tracking-wider text-neutral-500">Contact</h3>
            <div class="mt-4">
              <ContactBlock />
            </div>
          </div>

          <!-- Column 2: 8 categories mirror (D-27) — PBS retargeted per Phase 5 D-02 -->
          <div data-footer-col="work">
            <h3 class="text-xs uppercase tracking-wider text-neutral-500">Work</h3>
            <ul class="mt-4 space-y-2 text-base">
              {#each categories as category (category)}
                {@const slug = categoryToSlug(category)}
                {@const href =
                  slug === 'pbs-american-portrait'
                    ? `${base}/pbs-american-portrait/`
                    : `${base}/work/${slug}`}
                <li>
                  <a
                    {href}
                    data-sveltekit-preload-data="hover"
                    class="text-white hover:underline underline-offset-2"
                  >
                    {category}
                  </a>
                </li>
              {/each}
            </ul>
          </div>

          <!-- Column 3: secondary nav (D-28) — About, Press, Contact, View All Work → -->
          <div data-footer-col="site">
            <h3 class="text-xs uppercase tracking-wider text-neutral-500">Site</h3>
            <ul class="mt-4 space-y-2 text-base">
              <li>
                <a
                  href={`${base}/about`}
                  data-sveltekit-preload-data="hover"
                  class="text-white hover:underline underline-offset-2"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href={`${base}/press`}
                  data-sveltekit-preload-data="hover"
                  class="text-white hover:underline underline-offset-2"
                >
                  Press
                </a>
              </li>
              <li>
                <a
                  href={`${base}/contact`}
                  data-sveltekit-preload-data="hover"
                  class="text-white hover:underline underline-offset-2"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href={`${base}/work`}
                  data-sveltekit-preload-data="hover"
                  class="text-white hover:underline underline-offset-2"
                >
                  View All Work →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom strip (D-29): hairline border + copyright + Built with SvelteKit -->
        <div class="mt-12 md:mt-16 pt-6 border-t border-white/10 text-center text-xs text-neutral-500 tracking-wider">
          © 2026 Michelle Ngo  ·  Built with SvelteKit
        </div>
      </div>
    </footer>
    ```

    **Whitespace note for bottom-strip literal:** The string `© 2026 Michelle Ngo  ·  Built with SvelteKit` uses regular spaces around the middle dot (verbatim per D-29). HTML collapses consecutive whitespace, so visual rendering uses single spaces — that's correct.

    Create **src/lib/components/Footer.test.ts** verbatim (Phase 5 vi.hoisted pattern):

    ```typescript
    import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

    // Mock $app/state + $app/paths BEFORE Footer import (Phase 5 pattern).
    // mockPage required even though Footer doesn't read page.url directly —
    // <TopNav /> and other consumers in test environments may pull from
    // $app/state through hoisted module side-effects. Defensive.
    const { mockPageFooter } = vi.hoisted(() => ({
      mockPageFooter: {
        url: new URL('http://localhost/'),
        route: { id: '/' as string | null },
      },
    }));
    vi.mock('$app/state', () => ({ page: mockPageFooter }));
    vi.mock('$app/paths', () => ({ base: '' }));

    import { mount, unmount } from 'svelte';
    import Footer from './Footer.svelte';
    import { getCategoriesInDisplayOrder } from '$lib/data';

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;
    beforeEach(() => {
      mockPageFooter.url = new URL('http://localhost/');
      mockPageFooter.route = { id: '/' };
    });
    afterEach(() => {
      if (component) { unmount(component); component = undefined; }
      host?.remove();
    });
    function makeHost(): HTMLElement {
      host = document.createElement('div');
      document.body.appendChild(host);
      return host;
    }

    describe('Footer — D-24 / D-25 structure', () => {
      it('renders a <footer> element', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const footer = host.querySelector('footer');
        expect(footer).not.toBeNull();
      });

      it('renders three columns (data-footer-col="contact" / "work" / "site")', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const cols = Array.from(host.querySelectorAll('[data-footer-col]')).map(
          (el) => el.getAttribute('data-footer-col'),
        );
        expect(cols).toEqual(['contact', 'work', 'site']);
      });
    });

    describe('Footer — D-26 column 1 (ContactBlock)', () => {
      it('column 1 contains the 5 channel rows in D-36 order (Email → Phone → IMDb → LinkedIn → Vimeo)', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col1 = host.querySelector('[data-footer-col="contact"]');
        expect(col1).not.toBeNull();
        const linkTexts = Array.from(col1!.querySelectorAll('a')).map((a) => a.textContent?.trim());
        expect(linkTexts).toEqual([
          'mynogo@gmail.com',
          '(917) 566-1976',
          'IMDb',
          'LinkedIn',
          'Vimeo',
        ]);
      });

      it('column 1 email is mailto:mynogo@gmail.com', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col1 = host.querySelector('[data-footer-col="contact"]');
        const email = Array.from(col1!.querySelectorAll('a')).find(
          (a) => a.getAttribute('href') === 'mailto:mynogo@gmail.com'
        );
        expect(email).toBeDefined();
      });

      it('column 1 phone is tel:+19175661976', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col1 = host.querySelector('[data-footer-col="contact"]');
        const phone = Array.from(col1!.querySelectorAll('a')).find(
          (a) => a.getAttribute('href') === 'tel:+19175661976'
        );
        expect(phone).toBeDefined();
      });
    });

    describe('Footer — D-27 column 2 (mirrored categories)', () => {
      it('column 2 renders all 8 categories in getCategoriesInDisplayOrder() order', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col2 = host.querySelector('[data-footer-col="work"]');
        expect(col2).not.toBeNull();
        const order = getCategoriesInDisplayOrder();
        const linkTexts = Array.from(col2!.querySelectorAll('a')).map((a) => a.textContent?.trim() ?? '');
        // Filter to only category names (drop the column header if any non-link text is in <a>; here there isn't).
        expect(linkTexts).toEqual(Array.from(order));
      });

      it('PBS American Portrait link points to /pbs-american-portrait/ (Phase 5 D-02 inherited)', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col2 = host.querySelector('[data-footer-col="work"]');
        const pbsLink = Array.from(col2!.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'PBS American Portrait'
        );
        expect(pbsLink?.getAttribute('href')).toBe('/pbs-american-portrait/');
      });

      it('non-PBS category links use /work/<slug> (no trailing slash) — matches TopNav verbatim', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col2 = host.querySelector('[data-footer-col="work"]');
        const reelLink = Array.from(col2!.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'Reel'
        );
        expect(reelLink?.getAttribute('href')).toBe('/work/reel');
      });

      it('column 2 category links carry NO accent class (D-31 — footer stays mono)', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col2 = host.querySelector('[data-footer-col="work"]');
        const links = Array.from(col2!.querySelectorAll('a'));
        for (const a of links) {
          // No active-state per-category accent in footer. Class must NOT contain text-cat-*.
          expect(a.className).not.toMatch(/text-cat-/);
        }
      });
    });

    describe('Footer — D-28 column 3 (secondary nav)', () => {
      it('column 3 contains exactly 4 links in order: About / Press / Contact / View All Work →', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col3 = host.querySelector('[data-footer-col="site"]');
        expect(col3).not.toBeNull();
        const linkTexts = Array.from(col3!.querySelectorAll('a')).map((a) => a.textContent?.trim());
        expect(linkTexts).toEqual(['About', 'Press', 'Contact', 'View All Work →']);
      });

      it('column 3 hrefs match TopNav form: /about, /press, /contact, /work', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        const col3 = host.querySelector('[data-footer-col="site"]');
        const links = Array.from(col3!.querySelectorAll('a'));
        const hrefs = links.map((a) => a.getAttribute('href'));
        expect(hrefs).toEqual(['/about', '/press', '/contact', '/work']);
      });
    });

    describe('Footer — D-29 bottom strip', () => {
      it('renders copyright + Built with SvelteKit literal', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        // Use textContent.includes to be whitespace-tolerant.
        const text = host.textContent ?? '';
        expect(text).toContain('© 2026 Michelle Ngo');
        expect(text).toContain('Built with SvelteKit');
      });

      it('bottom strip has a top border (hairline border-t border-white/10)', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        // The bottom-strip div carries `border-t border-white/10`.
        const strips = Array.from(host.querySelectorAll('div')).filter(
          (d) => d.className.includes('border-t') && d.className.includes('border-white/10'),
        );
        // The footer's outer <footer> also has border-t border-white/10 (D-30 top border);
        // expect at least 2 elements with the class combo (footer wrapper + bottom strip).
        expect(strips.length).toBeGreaterThanOrEqual(1);
        // Confirm at least one of these elements contains the copyright text.
        const stripWithCopy = strips.find((s) => (s.textContent ?? '').includes('© 2026'));
        expect(stripWithCopy, 'bottom strip with copyright not found').toBeDefined();
      });
    });

    describe('Footer — D-30 prefetch on all internal links', () => {
      it('every internal link in columns 2 + 3 has data-sveltekit-preload-data="hover"', () => {
        component = mount(Footer, { target: makeHost(), props: {} });
        // Columns 2 and 3 — internal site nav.
        const col2 = host.querySelector('[data-footer-col="work"]');
        const col3 = host.querySelector('[data-footer-col="site"]');
        const links = [
          ...Array.from(col2!.querySelectorAll('a')),
          ...Array.from(col3!.querySelectorAll('a')),
        ];
        // Sanity: 8 + 4 = 12 links.
        expect(links.length).toBe(12);
        for (const a of links) {
          expect(a.getAttribute('data-sveltekit-preload-data')).toBe('hover');
        }
      });
    });
    ```
  </action>
  <verify>
    <automated>pnpm test -- --project=ui --run src/lib/components/Footer.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/Footer.svelte` exists.
    - `grep -n "import ContactBlock from './ContactBlock.svelte'" src/lib/components/Footer.svelte` returns 1 match (D-26 + D-32 import).
    - `grep -n "getCategoriesInDisplayOrder" src/lib/components/Footer.svelte` returns ≥1 match (D-27 category mirror).
    - `grep -n "pbs-american-portrait" src/lib/components/Footer.svelte` returns ≥1 match (Phase 5 D-02 retarget).
    - `grep -n "data-footer-col" src/lib/components/Footer.svelte` returns exactly 3 matches (one per column marker).
    - `grep -n "© 2026 Michelle Ngo" src/lib/components/Footer.svelte` returns 1 match (D-29 literal).
    - `grep -n "Built with SvelteKit" src/lib/components/Footer.svelte` returns 1 match (D-29 literal).
    - `grep -n "border-t border-white/10" src/lib/components/Footer.svelte` returns ≥2 matches (footer top border + bottom strip top border).
    - `grep -n "max-w-7xl" src/lib/components/Footer.svelte` returns ≥1 match (D-25 container).
    - `grep -n "data-sveltekit-preload-data" src/lib/components/Footer.svelte` returns ≥12 matches (8 categories + 4 secondary).
    - `grep -n "text-cat-" src/lib/components/Footer.svelte` returns ZERO matches (D-31 footer stays mono).
    - `pnpm test -- --project=ui --run src/lib/components/Footer.test.ts` exits 0 (all 13 test cases pass).
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>Footer component renders three columns + bottom strip in the locked layout, mirrors TopNav's categories + secondary links exactly, reuses ContactBlock verbatim, and the test suite passes.</done>
</task>

<task type="auto">
  <name>Task 2: Wire &lt;Footer /&gt; into +layout.svelte + verify site-wide render via build</name>
  <files>src/routes/+layout.svelte</files>
  <read_first>
    - src/lib/components/Footer.svelte (Task 1 output — verify import path)
    - src/routes/+layout.svelte (CURRENT state — TopNav + children render; this task adds Footer as a sibling below children)
    - .planning/phases/06-press-about-contact/06-CONTEXT.md §D-04 (layout wiring contract)
  </read_first>
  <action>
    **Step 1 — REPLACE src/routes/+layout.svelte entirely** with the new content (preserves Phase 1 robots meta + Phase 3 TopNav + adds Footer):

    ```svelte
    <!--
      Phase 1 chrome: app.css import + noindex meta (D-11; stays through Phase 6 per Pitfall 9).
      Phase 3 addition: top nav above every route (D-39).
      Phase 6 addition: site-wide Footer below the routed page content (D-04).
    -->
    <script lang="ts">
      import '../app.css';
      import TopNav from '$lib/components/TopNav.svelte';
      import Footer from '$lib/components/Footer.svelte';
      let { children } = $props();
    </script>

    <svelte:head>
      <meta name="robots" content="noindex, nofollow" />
      <title>Michelle Ngo</title>
    </svelte:head>

    <TopNav />

    {@render children()}

    <Footer />
    ```

    **Step 2 — Build + spot-check sanity** (no new test file; spot-check via grep on built HTML):

    Run `pnpm build` to regenerate every prerendered HTML file with the new layout. Then verify the footer markup appears in the prerendered HTML for at least three sampled routes:

    ```bash
    # Confirm the footer copyright literal renders inline in 3+ prerendered HTML files.
    # Each command should return ≥1 match per file.
    grep -l "© 2026 Michelle Ngo" build/index.html
    grep -l "© 2026 Michelle Ngo" build/work/index.html
    grep -l "© 2026 Michelle Ngo" build/pbs-american-portrait/index.html
    grep -l "© 2026 Michelle Ngo" build/press/index.html
    grep -l "© 2026 Michelle Ngo" build/about/index.html
    grep -l "© 2026 Michelle Ngo" build/contact/index.html
    ```

    All 6 files must contain the copyright string. If any one doesn't, STOP — the footer is missing from that route's prerender (layout misconfiguration).

    **Step 3 — Run prerender coverage script** to confirm Plans 06-01 + 06-02 + 06-03 collectively haven't regressed coverage:

    ```bash
    node scripts/test-prerender-coverage.mjs
    ```

    Expected output: PASS with lines for build/work/index.html, build/work/<slug>/index.html count=8, build/watch/<id>/index.html count=56, build/pbs-american-portrait/index.html, build/press/index.html, build/about/index.html, build/contact/index.html.
  </action>
  <verify>
    <automated>pnpm build && grep -q "© 2026 Michelle Ngo" build/index.html && grep -q "© 2026 Michelle Ngo" build/about/index.html && grep -q "© 2026 Michelle Ngo" build/press/index.html && grep -q "© 2026 Michelle Ngo" build/contact/index.html && node scripts/test-prerender-coverage.mjs</automated>
  </verify>
  <acceptance_criteria>
    - `grep -n "import Footer" src/routes/+layout.svelte` returns 1 match.
    - `grep -n "<Footer />" src/routes/+layout.svelte` returns 1 match.
    - `grep -n "<TopNav />" src/routes/+layout.svelte` returns 1 match (TopNav still present — D-06 contract preserved).
    - `grep -n "noindex, nofollow" src/routes/+layout.svelte` returns 1 match (Phase 1 D-11 + Phase 6 D-07 contract preserved).
    - The `<Footer />` element appears AFTER `{@render children()}` in the layout source (verify by reading the file — Footer is a SIBLING below children, not a wrapping element).
    - `pnpm build` exits 0.
    - `build/index.html` contains `© 2026 Michelle Ngo` (home page footer renders).
    - `build/about/index.html` contains `© 2026 Michelle Ngo` (about page footer renders).
    - `build/press/index.html` contains `© 2026 Michelle Ngo` (press page footer renders).
    - `build/contact/index.html` contains `© 2026 Michelle Ngo` (contact page footer renders).
    - `build/work/index.html` contains `© 2026 Michelle Ngo` (work page footer renders).
    - `build/pbs-american-portrait/index.html` contains `© 2026 Michelle Ngo` (PBS landing footer renders).
    - `node scripts/test-prerender-coverage.mjs` exits 0 (all thresholds from Plans 06-01 + 06-02 + Phase 5 baseline pass).
    - `pnpm check` exits 0.
    - `pnpm test` exits 0 (full suite — no regressions in TopNav.test.ts, HeroPoster.test.ts, or any route test).
  </acceptance_criteria>
  <done>The layout renders Footer below children on every prerendered route, the full test suite passes, and the build produces every expected HTML file with the footer inline.</done>
</task>

</tasks>

<verification>
**Final phase checks for this plan:**

1. `pnpm test -- --project=ui --run src/lib/components/Footer.test.ts` exits 0 (Task 1 test suite).
2. `pnpm test` exits 0 (full vitest suite — Task 2 must not regress any prior test, including TopNav.test.ts which mocks $app/state similarly).
3. `pnpm check` exits 0.
4. `pnpm build` produces `build/` with every prerendered HTML file containing the footer copyright string.
5. `node scripts/test-prerender-coverage.mjs` exits 0 — proves Plans 06-01 + 06-02 + 06-03 thresholds collectively pass.
6. **Site-wide spot-check (delegated to phase-level human-verify):** load the staging URL (Cloudflare Pages auto-deploys on push), navigate to /, /work, /watch/<any-id>, /press, /about, /contact, /pbs-american-portrait — confirm visually that the footer renders on every route with three columns at desktop width, single column on mobile.
7. **No new dependencies added**: `git diff --stat package.json pnpm-lock.yaml` shows no changes.

**Atomic commit (executor produces):**
- Commit 1: `feat(06-03): add site-wide Footer component + wire into +layout.svelte` (Tasks 1 + 2 combined — Task 2 is a 1-line addition to the layout, naturally chains with Task 1; planner discretion per phase notes)
</verification>

<success_criteria>
- [ ] `src/lib/components/Footer.svelte` exists with three-column desktop / one-column mobile grid + bottom strip
- [ ] Footer column 1 renders `<ContactBlock />` (single shared component instance)
- [ ] Footer column 2 mirrors the 8 categories from `getCategoriesInDisplayOrder()` with PBS retargeted to `/pbs-american-portrait/` per Phase 5 D-02 (mirrors TopNav verbatim)
- [ ] Footer column 3 renders About / Press / Contact / View All Work → with hrefs matching TopNav + Phase 4 D-28
- [ ] Bottom strip renders `© 2026 Michelle Ngo  ·  Built with SvelteKit` with hairline `border-t border-white/10`
- [ ] No active-state accent on any footer category link (D-31)
- [ ] Every footer internal link has `data-sveltekit-preload-data="hover"` (D-30)
- [ ] `src/routes/+layout.svelte` renders `<Footer />` below `{@render children()}` as a sibling to `<TopNav />` (D-04)
- [ ] `pnpm build` produces footer markup in EVERY prerendered HTML file (verified on 6+ sample routes)
- [ ] `pnpm test` exits 0 (full suite, no regressions)
- [ ] `pnpm check` exits 0
- [ ] No new dependencies
- [ ] NAV-02 (footer mirrors top nav) + CONT-01 (contact channels on every page) fully satisfied
</success_criteria>

<output>
After completion, create `.planning/phases/06-press-about-contact/06-03-SUMMARY.md` documenting:
- Files created / modified (with LOC counts)
- Sample routes verified to render the footer inline (paste grep evidence)
- Deviations from the plan (if any) with rationale
- Downstream contract for Phase 7 (Polish & Production Cutover): the footer is a stable component; Phase 7 perf work may inspect it for layout-shift / unused-CSS budget but should not change behavior.
</output>
