---
phase: 06-press-about-contact
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/ContactBlock.svelte
  - src/lib/components/ContactBlock.test.ts
  - src/routes/about/+page.svelte
  - src/routes/about/page.test.ts
  - src/routes/contact/+page.svelte
  - src/routes/contact/page.test.ts
  - scripts/test-prerender-coverage.mjs
autonomous: false
requirements:
  - ABT-01
  - ABT-02
  - CONT-01
  - CONT-02
must_haves:
  truths:
    - "A user can navigate to /about from the top nav and see a first-person ~100-word bio + contact block (no 'Coming soon' placeholder)."
    - "A user can navigate to /contact from the top nav and see an h1 + the same contact block (no placeholder)."
    - "The contact block surfaces five channels in stable order: Email → Phone → IMDb → LinkedIn → Vimeo."
    - "Email is a working mailto: link; phone is a working tel: link; IMDb / LinkedIn / Vimeo open in a new tab with rel=noopener."
    - "The contact block on /about is the SAME component as on /contact (CONT-02 satisfied by construction)."
    - "A static build emits build/about/index.html AND build/contact/index.html; the prerender coverage script enforces both."
  artifacts:
    - path: "src/lib/components/ContactBlock.svelte"
      provides: "Single shared component rendering 5 channel rows (D-32, D-33, D-34, D-35, D-36). Vertical layout. No props. Reused verbatim on /about, /contact, and Footer column 1."
    - path: "src/lib/components/ContactBlock.test.ts"
      provides: "Vitest 'ui' project component test — 5 rows in D-36 order, mailto + tel literals, social links open new tab with noopener."
    - path: "src/routes/about/+page.svelte"
      provides: "h1 'About' + first-person ~100-word approved bio paragraph + <ContactBlock /> in max-w-2xl editorial container (D-21, D-22)."
    - path: "src/routes/about/page.test.ts"
      provides: "Route test asserting h1 + first-person bio prose + <ContactBlock /> rendered."
    - path: "src/routes/contact/+page.svelte"
      provides: "h1 'Contact' + <ContactBlock /> in max-w-2xl editorial container (D-37)."
    - path: "src/routes/contact/page.test.ts"
      provides: "Route test asserting h1 + <ContactBlock /> rendered with same channel order as /about."
    - path: "scripts/test-prerender-coverage.mjs"
      provides: "Updated coverage script with new checks ≥1 build/about/index.html AND ≥1 build/contact/index.html."
      contains: "build/about/index.html"
  key_links:
    - from: "src/routes/about/+page.svelte"
      to: "src/lib/components/ContactBlock.svelte"
      via: "import ContactBlock from '$lib/components/ContactBlock.svelte'"
      pattern: "import.*ContactBlock.*from.*\\$lib/components/ContactBlock"
    - from: "src/routes/contact/+page.svelte"
      to: "src/lib/components/ContactBlock.svelte"
      via: "import ContactBlock from '$lib/components/ContactBlock.svelte'"
      pattern: "import.*ContactBlock.*from.*\\$lib/components/ContactBlock"
    - from: "src/lib/components/ContactBlock.svelte"
      to: "user's email + phone + socials"
      via: "literal hrefs: mailto:mynogo@gmail.com, tel:+19175661976, + 3 social URLs"
      pattern: "mailto:mynogo@gmail\\.com"
    - from: "scripts/test-prerender-coverage.mjs"
      to: "build/about/index.html + build/contact/index.html"
      via: "existsSync checks"
      pattern: "(about|contact).*index\\.html"
---

<objective>
Replace the Phase 3 D-43 placeholders at `/about` and `/contact` with real content. Ship a shared `<ContactBlock />` component that lists the five contact channels in locked D-36 order; render it on both pages (and consume it in Plan 06-03 Footer column 1). Update the prerender coverage script to enforce both new HTML outputs.

Purpose: Satisfies REQ ABT-01 (reachable /about), ABT-02 (bio + IMDb + LinkedIn + contact info — headshot intentionally deferred per D-20), CONT-01 (email/phone/IMDb/LinkedIn/Vimeo on /about and /contact — footer half lives in Plan 06-03), CONT-02 (same contact info on /about and footer — satisfied by single shared component). Phase 6 D-17 through D-23 + D-32 through D-38.

Output: ContactBlock component + about page + contact page + 3 test files + extended prerender script. No new dependencies.
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
@src/routes/about/+page.svelte
@src/routes/contact/+page.svelte
@src/lib/components/HeroPoster.svelte
@src/lib/components/HeroPoster.test.ts
@src/lib/components/TopNav.svelte
@src/routes/pbs-american-portrait/page.test.ts
@scripts/test-prerender-coverage.mjs

<interfaces>
<!-- ContactBlock has NO props (D-32 — same vertical layout everywhere). -->
<!-- Consumers: -->
<!--   - /about: <ContactBlock /> below the bio paragraph (D-22) -->
<!--   - /contact: <ContactBlock /> below the h1 (D-37) -->
<!--   - Footer (Plan 06-03): <ContactBlock /> in column 1 (D-26) -->

<!-- Phase 3 D-08 inline-link style — copy verbatim onto every link inside ContactBlock: -->
<!--   class="text-white hover:underline underline-offset-2" -->

<!-- Phase 4 vitest-setup-ui.ts already polyfills IntersectionObserver (jsdom UI project). -->
<!-- ContactBlock test does NOT need any setup beyond the existing setup. -->
</interfaces>
</context>

<checkpoint>
## Required user approvals BEFORE execution begins

This plan is NOT autonomous. Two user decisions must lock in before the executor proceeds:

### 1. Approve first-person bio copy (D-17, D-18, D-19)

Drafted ~100-word first-person bio for `/about`. Voice is warm, punchy, NYC-grounded. Surfaces filmmaker/producer discipline, PBS American Portrait + broadcast credits, NYC focus, and commercial work as the headline ask.

<approved>
I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands and broadcasters tell stories well — short documentaries, branded films, promos, and trailers. My credits include PBS American Portrait, HBO Max, HBO, ABC News, U2's Sphere residency, Amazon News, and Music Box Films. I love a tight schedule and a thoughtful script. I work hardest when the subject matter is human — real people telling true stories about how they live, what they make, and why it matters. If you have a project that needs a steady hand and a quick turn, get in touch.
</approved>

Word count: 109 words (within D-18 punchy ~80–120). First-person voice (D-17) confirmed: "I'm Michelle Ngo", "I make", "I love", "I work", "If you have...".

**Approve or revise?** If revising, paste the exact replacement text inside `<approved>...</approved>` in this section. The executor will copy whatever is between those tags VERBATIM into `src/routes/about/+page.svelte` (Phase 5 D-11 pattern: planner-drafted, user-approved, then verbatim-inserted; the test asserts the bio contains at least one of "I'm", "I make", "I work", "my"  for the D-17 first-person contract).

### 2. Confirm IMDb / LinkedIn / Vimeo URLs (D-23, D-35)

The contact block links three professional profiles. Fill in the URLs before the executor runs:

| Channel | URL |
|---------|-----|
| IMDb | TBD — user supplies (e.g., `https://www.imdb.com/name/nm1234567/`) |
| LinkedIn | TBD — user supplies (e.g., `https://www.linkedin.com/in/michelle-ngo/`) |
| Vimeo | `https://vimeo.com/user2149742` (PROJECT.md seed — user confirms or replaces) |

**Vimeo URL note:** PROJECT.md context lists `user2149742` as Michelle's Vimeo handle. The numeric form `user2149742` is the canonical Vimeo profile URL shape for accounts that haven't claimed a vanity slug — this is a real public profile path, not an internal id. If Michelle has since claimed a vanity slug (e.g., `vimeo.com/michellengo`), replace the seed value.

**Once locked**, the executor will use these literal URL strings in `src/lib/components/ContactBlock.svelte`. The ContactBlock test asserts the URLs are non-empty, point at `imdb.com`, `linkedin.com`, and `vimeo.com` respectively, and that all three have `target="_blank"` + `rel="noopener"`.

<resume-signal>Reply `approved` (with any bio edits in `<approved>...</approved>` tags and the URL table filled in) before executor begins. Both decisions are blocking.</resume-signal>
</checkpoint>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build &lt;ContactBlock /&gt; shared component + tests</name>
  <files>src/lib/components/ContactBlock.svelte, src/lib/components/ContactBlock.test.ts</files>
  <read_first>
    - src/lib/components/HeroPoster.svelte (Svelte 5 component shape reference — runes, no props in this case)
    - src/lib/components/HeroPoster.test.ts (Vitest 'ui' project mount/unmount/host pattern)
    - src/lib/components/TopNav.svelte (Phase 3 D-08 inline-link style — copy class string verbatim)
    - .planning/phases/06-press-about-contact/06-CONTEXT.md §Contact channels (D-32 through D-38)
    - vite.config.ts (confirm `ui` project glob `src/lib/components/**/*.{test,spec}.{js,ts}` matches this test file — see verify section)
  </read_first>
  <behavior>
    - Test 1: ContactBlock renders 5 contact channel rows (one per channel).
    - Test 2: Channel order in the DOM matches D-36: Email → Phone → IMDb → LinkedIn → Vimeo (assert via the rendered link text sequence: 'mynogo@gmail.com', '(917) 566-1976', 'IMDb', 'LinkedIn', 'Vimeo').
    - Test 3: Email link has `href="mailto:mynogo@gmail.com"` and visible text `mynogo@gmail.com`.
    - Test 4: Phone link has `href="tel:+19175661976"` and visible text `(917) 566-1976` (with parens + dash, NOT bare digits).
    - Test 5: IMDb link has `target="_blank"`, `rel="noopener"`, visible text `IMDb`, and `href` containing `imdb.com`.
    - Test 6: LinkedIn link has `target="_blank"`, `rel="noopener"`, visible text `LinkedIn`, and `href` containing `linkedin.com`.
    - Test 7: Vimeo link has `target="_blank"`, `rel="noopener"`, visible text `Vimeo`, and `href` containing `vimeo.com`.
    - Test 8: Every link has the Phase 3 D-08 inline-link class string (assert className contains `text-white`, `hover:underline`, `underline-offset-2`).
  </behavior>
  <action>
    Create **src/lib/components/ContactBlock.svelte** verbatim (substitute the IMDb + LinkedIn URLs from the checkpoint table; Vimeo defaults to the seed if user did not override):

    ```svelte
    <!--
      Phase 6 D-32 / D-33 / D-34 / D-35 / D-36 / D-38: shared contact block.

      Single component reused VERBATIM on /about (D-22), /contact (D-37), and
      Footer column 1 (D-26). One vertical layout — no orientation prop, no
      variants. Editing email/phone/socials here propagates to all three surfaces
      (CONT-02 satisfied by construction).

      Channel literals (D-33, D-34, D-35):
        - Email:    mailto:mynogo@gmail.com → display "mynogo@gmail.com"
        - Phone:    tel:+19175661976        → display "(917) 566-1976"
        - IMDb:     {USER-APPROVED URL}      → display "IMDb"     (external link)
        - LinkedIn: {USER-APPROVED URL}      → display "LinkedIn" (external link)
        - Vimeo:    https://vimeo.com/user2149742 (PROJECT.md seed; user-confirmable)
                                             → display "Vimeo"    (external link)

      Style: Phase 3 D-08 inline-link (text-white hover:underline underline-offset-2)
      on every link.
    -->
    <script lang="ts">
      // No props (D-32). One vertical layout everywhere.
      // Hardcoded literal URLs. If channels change, edit this file only —
      // it is the single source of truth for /about, /contact, and Footer.

      // Replace with user-approved URLs from PLAN.md checkpoint section.
      const IMDB_URL = '{{USER_IMDB_URL}}';
      const LINKEDIN_URL = '{{USER_LINKEDIN_URL}}';
      const VIMEO_URL = 'https://vimeo.com/user2149742';
    </script>

    <ul class="space-y-2 text-base">
      <li>
        <a
          href="mailto:mynogo@gmail.com"
          class="text-white hover:underline underline-offset-2"
        >
          mynogo@gmail.com
        </a>
      </li>
      <li>
        <a
          href="tel:+19175661976"
          class="text-white hover:underline underline-offset-2"
        >
          (917) 566-1976
        </a>
      </li>
      <li>
        <a
          href={IMDB_URL}
          target="_blank"
          rel="noopener"
          class="text-white hover:underline underline-offset-2"
        >
          IMDb
        </a>
      </li>
      <li>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener"
          class="text-white hover:underline underline-offset-2"
        >
          LinkedIn
        </a>
      </li>
      <li>
        <a
          href={VIMEO_URL}
          target="_blank"
          rel="noopener"
          class="text-white hover:underline underline-offset-2"
        >
          Vimeo
        </a>
      </li>
    </ul>
    ```

    **URL substitution at execution time:** Replace `{{USER_IMDB_URL}}` and `{{USER_LINKEDIN_URL}}` with the literal strings from the PLAN.md checkpoint table (filled in by the user before approval). If the user did NOT supply these URLs by execution time, STOP and surface a checkpoint — do not commit placeholder strings.

    Create **src/lib/components/ContactBlock.test.ts** verbatim:

    ```typescript
    import { afterEach, describe, expect, it } from 'vitest';
    import { mount, unmount } from 'svelte';
    import ContactBlock from './ContactBlock.svelte';

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;

    afterEach(() => {
      if (component) { unmount(component); component = undefined; }
      host?.remove();
    });

    function makeHost(): HTMLElement {
      host = document.createElement('div');
      document.body.appendChild(host);
      return host;
    }

    describe('ContactBlock — D-32 / D-36 channel rendering', () => {
      it('renders exactly 5 channel rows', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const items = Array.from(host.querySelectorAll('li'));
        expect(items.length).toBe(5);
      });

      it('renders channels in D-36 order: Email → Phone → IMDb → LinkedIn → Vimeo', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const linkTexts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
        expect(linkTexts).toEqual([
          'mynogo@gmail.com',
          '(917) 566-1976',
          'IMDb',
          'LinkedIn',
          'Vimeo',
        ]);
      });
    });

    describe('ContactBlock — D-33 email + D-34 phone', () => {
      it('email link has mailto:mynogo@gmail.com and text mynogo@gmail.com', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const emailLink = Array.from(host.querySelectorAll('a')).find(
          (a) => a.getAttribute('href') === 'mailto:mynogo@gmail.com'
        );
        expect(emailLink, 'mailto: link not found').toBeDefined();
        expect(emailLink?.textContent?.trim()).toBe('mynogo@gmail.com');
      });

      it('phone link has tel:+19175661976 and display text (917) 566-1976 with parens + dash', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const phoneLink = Array.from(host.querySelectorAll('a')).find(
          (a) => a.getAttribute('href') === 'tel:+19175661976'
        );
        expect(phoneLink, 'tel: link not found').toBeDefined();
        expect(phoneLink?.textContent?.trim()).toBe('(917) 566-1976');
      });
    });

    describe('ContactBlock — D-35 socials (target=_blank rel=noopener)', () => {
      it('IMDb link is external (target=_blank rel=noopener), points to imdb.com, text "IMDb"', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const imdb = Array.from(host.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'IMDb'
        );
        expect(imdb, 'IMDb link not found').toBeDefined();
        expect(imdb?.getAttribute('target')).toBe('_blank');
        expect(imdb?.getAttribute('rel')).toBe('noopener');
        expect(imdb?.getAttribute('href') ?? '').toContain('imdb.com');
      });

      it('LinkedIn link is external (target=_blank rel=noopener), points to linkedin.com, text "LinkedIn"', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const linkedin = Array.from(host.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'LinkedIn'
        );
        expect(linkedin, 'LinkedIn link not found').toBeDefined();
        expect(linkedin?.getAttribute('target')).toBe('_blank');
        expect(linkedin?.getAttribute('rel')).toBe('noopener');
        expect(linkedin?.getAttribute('href') ?? '').toContain('linkedin.com');
      });

      it('Vimeo link is external (target=_blank rel=noopener), points to vimeo.com, text "Vimeo"', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const vimeo = Array.from(host.querySelectorAll('a')).find(
          (a) => a.textContent?.trim() === 'Vimeo'
        );
        expect(vimeo, 'Vimeo link not found').toBeDefined();
        expect(vimeo?.getAttribute('target')).toBe('_blank');
        expect(vimeo?.getAttribute('rel')).toBe('noopener');
        expect(vimeo?.getAttribute('href') ?? '').toContain('vimeo.com');
      });
    });

    describe('ContactBlock — Phase 3 D-08 inline-link style', () => {
      it('every link has text-white hover:underline underline-offset-2 utility classes', () => {
        component = mount(ContactBlock, { target: makeHost(), props: {} });
        const links = Array.from(host.querySelectorAll('a'));
        expect(links.length).toBe(5);
        for (const a of links) {
          expect(a.className).toContain('text-white');
          expect(a.className).toContain('hover:underline');
          expect(a.className).toContain('underline-offset-2');
        }
      });
    });
    ```
  </action>
  <verify>
    <automated>pnpm test -- --project=ui --run src/lib/components/ContactBlock.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/ContactBlock.svelte` exists.
    - `grep -n "mailto:mynogo@gmail.com" src/lib/components/ContactBlock.svelte` returns ≥1 match (D-33 literal).
    - `grep -n "tel:+19175661976" src/lib/components/ContactBlock.svelte` returns ≥1 match (D-34 literal).
    - `grep -n "(917) 566-1976" src/lib/components/ContactBlock.svelte` returns ≥1 match (D-34 display).
    - `grep -n "vimeo.com" src/lib/components/ContactBlock.svelte` returns ≥1 match (Vimeo seed or user override).
    - `grep -n "{{USER_" src/lib/components/ContactBlock.svelte` returns ZERO matches (placeholder tokens replaced with real URLs).
    - File `src/lib/components/ContactBlock.test.ts` exists.
    - `pnpm test -- --project=ui --run src/lib/components/ContactBlock.test.ts` exits 0 (all 9 test cases pass).
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>ContactBlock component exists, exports 5 channel rows in D-36 order with all literal URLs substituted from the checkpoint table, and the test suite passes.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Build /about + /contact pages and extend prerender coverage script</name>
  <files>src/routes/about/+page.svelte, src/routes/about/page.test.ts, src/routes/contact/+page.svelte, src/routes/contact/page.test.ts, scripts/test-prerender-coverage.mjs</files>
  <read_first>
    - src/lib/components/ContactBlock.svelte (Task 1 output — verify import path and component shape)
    - src/routes/about/+page.svelte (CURRENT placeholder — will be replaced)
    - src/routes/contact/+page.svelte (CURRENT placeholder — will be replaced)
    - src/routes/pbs-american-portrait/page.test.ts (Phase 5 vitest 'ui' page-test pattern: vi.hoisted + vi.mock $app/state + $app/paths + callLoad helper)
    - scripts/test-prerender-coverage.mjs (Plan 06-01 added Press check; this task adds About + Contact next to it)
    - src/routes/+layout.ts (confirm `prerender = true` and `trailingSlash = 'always'` — both routes inherit)
  </read_first>
  <behavior>
    - Test (about) 1: /about renders `<h1>About</h1>` (exact text).
    - Test (about) 2: /about renders a `<p>` containing the approved bio prose. Assert the bio is at least 80 characters AND contains at least one of these first-person tokens: `I'm`, `I make`, `I love`, `I work`, ` my ` (D-17 contract).
    - Test (about) 3: /about renders the `<ContactBlock />` — assert at least 5 `<li>` children and the same channel order (Email → Phone → IMDb → LinkedIn → Vimeo) as ContactBlock.test.ts checks.
    - Test (about) 4: Container uses `max-w-2xl` (D-21).
    - Test (contact) 1: /contact renders `<h1>Contact</h1>` (exact text).
    - Test (contact) 2: /contact renders the `<ContactBlock />` with 5 channels in D-36 order.
    - Test (contact) 3: Container uses `max-w-2xl` (D-37).
    - Test (contact) 4: /contact does NOT contain a `<form>` element (Out of Scope per REQUIREMENTS.md; D-33 mailto: is the canonical channel).
  </behavior>
  <action>
    **Step 1 — REPLACE src/routes/about/+page.svelte entirely**. Verbatim content (substitute the approved bio paragraph between the marker comments — copy the EXACT text from the PLAN.md `<approved>...</approved>` block):

    ```svelte
    <!--
      Phase 6 ABT-01 / ABT-02 / CONT-02: /about page.

      Decisions implemented:
        D-17 — first-person voice ("I'm ...", "I make ...")
        D-18 — punchy ~100-word bio (one paragraph)
        D-19 — bio approved verbatim at plan time (PLAN.md <approved>...</approved>)
        D-20 — no headshot, no Resume/CV download, no legacy disciplines
        D-21 — container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8
        D-22 — composition: h1 / bio paragraph / <ContactBlock />

      The approved bio paragraph is copied VERBATIM from the PLAN.md
      <approved>...</approved> element (Phase 5 D-11 pattern). Do NOT
      rewrite, summarize, or paraphrase. If a future content edit is
      needed, update the PLAN.md approval and re-paste the text here.
    -->
    <script lang="ts">
      import ContactBlock from '$lib/components/ContactBlock.svelte';
    </script>

    <svelte:head>
      <title>Michelle Ngo — About</title>
    </svelte:head>

    <main class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">About</h1>

      <p class="mt-8 text-base md:text-lg leading-relaxed text-neutral-200">
        <!-- BEGIN approved bio (D-19) — copy VERBATIM from PLAN.md <approved>...</approved> -->
        {{APPROVED_BIO_TEXT}}
        <!-- END approved bio -->
      </p>

      <div class="mt-10 md:mt-12">
        <ContactBlock />
      </div>
    </main>
    ```

    **Bio substitution at execution time:** Replace `{{APPROVED_BIO_TEXT}}` with the EXACT text between the `<approved>...</approved>` tags in this PLAN.md's checkpoint section. Do NOT add quotation marks. Do NOT alter punctuation. If the user did not approve a bio by execution time, STOP and surface a checkpoint.

    **Step 2 — Create src/routes/about/page.test.ts** verbatim:

    ```typescript
    import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

    // Mock $app/state + $app/paths BEFORE Page import (Phase 5 pattern).
    const { mockPageAbout } = vi.hoisted(() => ({
      mockPageAbout: {
        url: new URL('http://localhost/about/'),
        route: { id: '/about' as string | null },
      },
    }));
    vi.mock('$app/state', () => ({ page: mockPageAbout }));
    vi.mock('$app/paths', () => ({ base: '' }));

    import { mount, unmount } from 'svelte';
    import Page from './+page.svelte';

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;
    beforeEach(() => {
      mockPageAbout.url = new URL('http://localhost/about/');
      mockPageAbout.route = { id: '/about' };
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

    describe('/about — ABT-01 / ABT-02 / D-22 composition', () => {
      it('renders h1 with exact text "About"', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const h1 = host.querySelector('h1');
        expect(h1?.textContent?.trim()).toBe('About');
      });

      it('renders a bio paragraph at least 80 chars long with at least one first-person token (D-17)', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const paragraphs = Array.from(host.querySelectorAll('p'));
        // Find a paragraph that's long enough to be the bio (placeholder "Coming soon." is 12 chars).
        const bio = paragraphs.find((p) => (p.textContent?.trim().length ?? 0) >= 80);
        expect(bio, 'bio paragraph (>=80 chars) not found').toBeDefined();
        const text = bio?.textContent ?? '';
        // D-17 first-person voice: at least one of the canonical first-person tokens.
        expect(
          /\bI'?m\b|\bI\s+(make|love|work|am)\b|\bmy\b/.test(text),
          `bio paragraph did not contain a first-person token: "${text.slice(0, 80)}..."`,
        ).toBe(true);
      });

      it('container uses max-w-2xl editorial width (D-21)', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const main = host.querySelector('main');
        expect(main?.className).toContain('max-w-2xl');
        expect(main?.className).toContain('mx-auto');
        expect(main?.className).toContain('px-4');
        expect(main?.className).toContain('sm:px-6');
        expect(main?.className).toContain('lg:px-8');
      });

      it('renders <ContactBlock /> with 5 channels in D-36 order (Email → Phone → IMDb → LinkedIn → Vimeo)', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const linkTexts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
        expect(linkTexts).toEqual([
          'mynogo@gmail.com',
          '(917) 566-1976',
          'IMDb',
          'LinkedIn',
          'Vimeo',
        ]);
      });
    });
    ```

    **Step 3 — REPLACE src/routes/contact/+page.svelte entirely**. Verbatim:

    ```svelte
    <!--
      Phase 6 CONT-01 (page half) / D-37 composition: /contact page.

      Decisions implemented:
        D-03 — /contact stays as a real page (does NOT redirect, does NOT drop)
        D-37 — composition: h1 / <ContactBlock /> (no intro paragraph, no form)
        D-32 — same shared <ContactBlock /> as /about and Footer column 1

      Contact form is Out of Scope per REQUIREMENTS.md (mailto: link sufficient).
    -->
    <script lang="ts">
      import ContactBlock from '$lib/components/ContactBlock.svelte';
    </script>

    <svelte:head>
      <title>Michelle Ngo — Contact</title>
    </svelte:head>

    <main class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 class="text-3xl md:text-4xl font-bold uppercase tracking-wider">Contact</h1>

      <div class="mt-10 md:mt-12">
        <ContactBlock />
      </div>
    </main>
    ```

    **Step 4 — Create src/routes/contact/page.test.ts** verbatim:

    ```typescript
    import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

    const { mockPageContact } = vi.hoisted(() => ({
      mockPageContact: {
        url: new URL('http://localhost/contact/'),
        route: { id: '/contact' as string | null },
      },
    }));
    vi.mock('$app/state', () => ({ page: mockPageContact }));
    vi.mock('$app/paths', () => ({ base: '' }));

    import { mount, unmount } from 'svelte';
    import Page from './+page.svelte';

    let host: HTMLElement;
    let component: ReturnType<typeof mount> | undefined;
    beforeEach(() => {
      mockPageContact.url = new URL('http://localhost/contact/');
      mockPageContact.route = { id: '/contact' };
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

    describe('/contact — CONT-01 / D-37 composition', () => {
      it('renders h1 with exact text "Contact"', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const h1 = host.querySelector('h1');
        expect(h1?.textContent?.trim()).toBe('Contact');
      });

      it('container uses max-w-2xl editorial width (D-37)', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const main = host.querySelector('main');
        expect(main?.className).toContain('max-w-2xl');
        expect(main?.className).toContain('mx-auto');
      });

      it('renders <ContactBlock /> with 5 channels in D-36 order (Email → Phone → IMDb → LinkedIn → Vimeo)', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const linkTexts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
        expect(linkTexts).toEqual([
          'mynogo@gmail.com',
          '(917) 566-1976',
          'IMDb',
          'LinkedIn',
          'Vimeo',
        ]);
      });

      it('does NOT render a <form> element (contact form Out of Scope; D-33 mailto: is the channel)', () => {
        component = mount(Page, { target: makeHost(), props: {} });
        const form = host.querySelector('form');
        expect(form).toBeNull();
      });
    });
    ```

    **Step 5 — UPDATE scripts/test-prerender-coverage.mjs** to add About + Contact checks.

    **Coordination with Plan 06-01:** Plan 06-01 Task 2 Step 4 added the Press check. Plan 06-02 + 06-01 are in the SAME WAVE (Wave 1). The executor for whichever runs second must merge — do NOT overwrite Plan 06-01's Press block. The expected end-state after BOTH plans run is THREE new blocks (press, about, contact) inserted between the existing PBS block (line ~97 in current file) and the `if (failures.length > 0)` block.

    Insert ABOUT + CONTACT blocks AFTER the Press block (if Plan 06-01 ran first) OR after the PBS block (if Plan 06-01 hasn't run yet) — in either case, BEFORE the `if (failures.length > 0)` block:

    ```javascript
    // Phase 6: /about — bio + contact block landing route.
    const aboutIndex = join(BUILD, 'about', 'index.html');
    const aboutIndexExists = existsSync(aboutIndex);
    if (!aboutIndexExists) {
      failures.push('Missing build/about/index.html (the /about page).');
    }

    // Phase 6: /contact — h1 + shared contact block.
    const contactIndex = join(BUILD, 'contact', 'index.html');
    const contactIndexExists = existsSync(contactIndex);
    if (!contactIndexExists) {
      failures.push('Missing build/contact/index.html (the /contact page).');
    }
    ```

    Then UPDATE the FAIL summary `console.error` template literal to append `, build/about/index.html=${aboutIndexExists}, build/contact/index.html=${contactIndexExists}`. And add two new `console.log` lines to the PASS block:

    ```javascript
    console.log(`  - build/about/index.html: present`);
    console.log(`  - build/contact/index.html: present`);
    ```

    **Step 6 — Manual sanity-grep**: at the top of execution, run `grep -n "Coming soon" src/routes/about/+page.svelte src/routes/contact/+page.svelte` and confirm BOTH files still match (sanity: the placeholders ARE being replaced — if they're already gone, another plan has already shipped). After replacement, the same grep must return ZERO matches.
  </action>
  <verify>
    <automated>pnpm test -- --project=ui --run src/lib/components/ContactBlock.test.ts src/routes/about/page.test.ts src/routes/contact/page.test.ts && pnpm build && node scripts/test-prerender-coverage.mjs</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/about/+page.svelte` no longer contains `Coming soon.` (placeholder removed).
    - File `src/routes/contact/+page.svelte` no longer contains `Coming soon.` (placeholder removed).
    - `grep -n "{{APPROVED_BIO_TEXT}}" src/routes/about/+page.svelte` returns ZERO matches (template token replaced).
    - `grep -n "import ContactBlock" src/routes/about/+page.svelte` returns ≥1 match.
    - `grep -n "import ContactBlock" src/routes/contact/+page.svelte` returns ≥1 match.
    - `grep -n "max-w-2xl" src/routes/about/+page.svelte src/routes/contact/+page.svelte` returns ≥2 matches (one per file, D-21 + D-37).
    - `grep -n "build/about/index.html" scripts/test-prerender-coverage.mjs` returns ≥2 matches (constant + failure + PASS log).
    - `grep -n "build/contact/index.html" scripts/test-prerender-coverage.mjs` returns ≥2 matches.
    - `pnpm test -- --project=ui --run src/lib/components/ContactBlock.test.ts src/routes/about/page.test.ts src/routes/contact/page.test.ts` exits 0.
    - `pnpm build` exits 0 AND `build/about/index.html` exists AND `build/contact/index.html` exists.
    - `node scripts/test-prerender-coverage.mjs` exits 0 after build (Phase 5 baseline + new ≥1 about + ≥1 contact ALL pass; press passes too if Plan 06-01 already ran).
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>/about and /contact each render real content with the shared ContactBlock; the placeholders are replaced; the prerender coverage script enforces both new HTML outputs; all tests pass.</done>
</task>

</tasks>

<verification>
**Final phase checks for this plan:**

1. `pnpm test -- --project=ui --run src/lib/components/ContactBlock.test.ts src/routes/about/page.test.ts src/routes/contact/page.test.ts` exits 0.
2. `pnpm check` exits 0.
3. `pnpm build && node scripts/test-prerender-coverage.mjs` exits 0; output includes `build/about/index.html: present` AND `build/contact/index.html: present`.
4. **Single-source-of-truth check (CONT-02):** the contact info on /about and /contact is rendered by the SAME component file. Verify by `grep -rn "mailto:mynogo@gmail.com" src/routes/` returns ZERO matches (the literal lives ONLY in `src/lib/components/ContactBlock.svelte`).
5. **No new dependencies added**: `git diff --stat package.json pnpm-lock.yaml` shows no changes to those files.

**Atomic commits (executor produces):**
- Commit 1: `feat(06-02): add ContactBlock shared component + tests` (Task 1)
- Commit 2: `feat(06-02): build /about + /contact pages + extend prerender coverage` (Task 2)
</verification>

<success_criteria>
- [ ] `src/lib/components/ContactBlock.svelte` renders 5 channels in D-36 order with literal mailto + tel + 3 external URLs substituted from the checkpoint
- [ ] `src/routes/about/+page.svelte` replaces the placeholder with h1 + verbatim approved bio + `<ContactBlock />` in `max-w-2xl` container
- [ ] `src/routes/contact/+page.svelte` replaces the placeholder with h1 + `<ContactBlock />` in `max-w-2xl` container, no `<form>`
- [ ] Bio text contains a first-person token (`I'm`, `I make`, `I love`, `I work`, or `my`)
- [ ] `scripts/test-prerender-coverage.mjs` enforces both `build/about/index.html` and `build/contact/index.html`
- [ ] `pnpm build` succeeds; both new HTML files emit; prerender coverage script passes
- [ ] CONT-02 satisfied: contact info lives in a single component shared by /about and /contact (and Footer in Plan 06-03)
- [ ] No new dependencies
- [ ] ABT-01 + ABT-02 (text + links subset of the requirement — headshot deferred per D-20) + CONT-01 (page half) + CONT-02 all addressed
</success_criteria>

<output>
After completion, create `.planning/phases/06-press-about-contact/06-02-SUMMARY.md` documenting:
- Approved bio paragraph (verbatim — for audit and future content edits)
- Final IMDb / LinkedIn / Vimeo URLs (post-checkpoint)
- Files created / modified (with LOC counts)
- Deviations from the plan (if any) with rationale
- Downstream contract for Plan 06-03 (Footer): `<ContactBlock />` is imported as `import ContactBlock from '$lib/components/ContactBlock.svelte';` and has NO props. Footer column 1 just renders `<ContactBlock />` verbatim.
</output>
