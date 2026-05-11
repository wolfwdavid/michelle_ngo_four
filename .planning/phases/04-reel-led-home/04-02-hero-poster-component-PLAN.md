---
phase: 04-reel-led-home
plan: 02
type: execute
wave: 1
depends_on: ["04-01"]
files_modified:
  - src/lib/assets/hero-poster.jpg
  - src/lib/components/HeroPoster.svelte
  - src/lib/components/HeroPoster.test.ts
autonomous: false
requirements: ["HERO-01", "HERO-02", "HERO-03"]
must_haves:
  truths:
    - "A poster image asset lives at src/lib/assets/hero-poster.{jpg|webp} and is imported via Vite (content-hashed, BASE_PATH-safe)"
    - "<HeroPoster /> renders a <section> with min-h-dvh containing a hero <img> (eager + fetchpriority=high), a bottom gradient overlay, a centered scroll cue, and a <div id=\"hero-sentinel\"> at the absolute bottom for TopNav's IntersectionObserver"
    - "Hero composition (lower-left stack): <h1>Michelle Ngo</h1>, <p>Filmmaker & Producer</p>, <a href=\"${base}/watch/${producerReelId}\" data-sveltekit-preload-data=\"hover\">▷ PLAY REEL</a>"
    - "<svelte:head> emits <link rel=\"preload\" as=\"image\" fetchpriority=\"high\"> for the same hashed hero URL the <img> uses (browser dedupes)"
    - "All HeroPoster Vitest stubs from Plan 04-01 turn green (describe.skip flipped to describe; lazy loadHeroPoster helper replaced with static import)"
  artifacts:
    - path: "src/lib/assets/hero-poster.jpg"
      provides: "Hero poster image (Vimeo 264677021 frame; D-02; .jpg OR .webp per planner D-04 choice)"
    - path: "src/lib/components/HeroPoster.svelte"
      provides: "Full hero composition (image + gradient + name + tagline + CTA + scroll cue + sentinel)"
      min_lines: 40
      contains: "id=\"hero-sentinel\""
  key_links:
    - from: "src/lib/components/HeroPoster.svelte"
      to: "src/lib/assets/hero-poster.jpg"
      via: "import heroPoster from '$lib/assets/hero-poster.jpg'"
      pattern: "import heroPoster"
    - from: "src/lib/components/HeroPoster.svelte"
      to: "$lib/data (producerReelId)"
      via: "import { producerReelId } from '$lib/data'"
      pattern: "producerReelId"
    - from: "src/lib/components/HeroPoster.svelte"
      to: "TopNav scroll-aware $effect (plan 04-04)"
      via: "<div id=\"hero-sentinel\"> at hero's bottom edge"
      pattern: "hero-sentinel"
---

<objective>
Build the `<HeroPoster />` component — Phase 4's only new presentational primitive. Owns the hero image + bottom gradient overlay + lower-left name/tagline/CTA stack + scroll cue + the sentinel div TopNav observes (D-13/D-14). Drops a hero poster image into `src/lib/assets/` (Vite bundles + content-hashes it). Implements all three Phase 4 requirements (HERO-01 full-bleed hero, HERO-02 name + tagline above the fold, HERO-03 PLAY REEL → watch view).

Purpose: this is the LCP element for `/`. Done right, the page paints the poster + name + tagline + CTA in one critical-path render. Done wrong, every other Phase 4 task is built on a wobbly foundation.

Output: 1 new asset, 1 new Svelte component, all HeroPoster Vitest stubs green.

**This plan is NOT autonomous.** Task 1 surfaces 3-5 candidate frames from Vimeo 264677021 for user vibe-check approval BEFORE committing the binary to git (D-02 Claude's-Discretion is too consequential — wrong frame derails the whole page feel). User picks the frame, then Claude pulls + compresses + commits.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/04-reel-led-home/04-CONTEXT.md
@.planning/phases/04-reel-led-home/04-RESEARCH.md
@.planning/phases/04-reel-led-home/04-VALIDATION.md
@.planning/phases/04-reel-led-home/04-01-test-infrastructure-SUMMARY.md
@_prep/02-references.md
@src/lib/components/VideoCard.svelte
@src/lib/components/HeroPoster.test.ts
@src/lib/data/index.ts
@svelte.config.js
@src/app.css

<interfaces>
<!-- Key interfaces the executor needs. Phase 4 EXTENDS but does not redesign. -->

From src/lib/data/index.ts (single import path):
```typescript
export { producerReelId } from './videos';
// producerReelId === '264677021' (Vimeo)
```

From svelte.config.js:
```typescript
paths: { base: process.env.BASE_PATH ?? '' }
// → import { base } from '$app/paths';
// → href={`${base}/watch/${producerReelId}`} for BASE_PATH safety
```

The sentinel contract HeroPoster owns (downstream consumer: TopNav in plan 04-04):
```html
<div id="hero-sentinel" class="absolute bottom-0 left-0 h-px w-full" aria-hidden="true"></div>
```
TopNav queries `document.getElementById('hero-sentinel')` in a `$effect` (only when page.route.id === '/').

Hero composition shape (from 04-RESEARCH.md §Pattern 1 + 04-CONTEXT.md D-01..D-12, D-16..D-20):
```html
<section class="relative min-h-dvh w-full overflow-hidden bg-neutral-950">
  <img src={heroPoster} alt="" loading="eager" fetchpriority="high"
       class="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true"></div>
  <div class="relative z-10 flex min-h-dvh flex-col items-start justify-end pb-16 lg:pb-24 pl-6 sm:pl-10 lg:pl-16 pr-6 sm:pr-10 lg:pr-16">
    <h1 class="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-widest text-white">Michelle Ngo</h1>
    <p class="mt-4 text-sm md:text-base uppercase tracking-wide text-neutral-300">Filmmaker &amp; Producer</p>
    <a href={`${base}/watch/${producerReelId}`}
       data-sveltekit-preload-data="hover"
       class="mt-8 inline-flex items-center gap-2 border border-white px-6 py-3 text-sm tracking-widest uppercase text-white hover:bg-white hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">
      ▷ PLAY REEL
    </a>
  </div>
  <div class="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60" aria-hidden="true">
    <span class="text-2xl">⌄</span>
  </div>
  <div id="hero-sentinel" class="absolute bottom-0 left-0 h-px w-full" aria-hidden="true"></div>
</section>
```
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 1: Pull 3-5 candidate hero frames from Vimeo 264677021 and surface for user pick</name>
  <files>(transient — candidate frames live in a scratch dir, not committed)</files>
  <read_first>
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-02 (frame selection: wide shot, Michelle NOT on-camera, cinematic depth, dark areas in lower band for gradient legibility)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-04 (jpg vs webp — planner picks; ~150KB target)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Open Questions #1 + #2 (frame selection + format guidance)
  </read_first>
  <action>
    Pull the Producer's Reel from Vimeo (embed URL: `https://player.vimeo.com/video/264677021`; the source MP4 can be obtained via Vimeo's player config endpoint, or `ffmpeg` against the HLS playlist if the user has it locally). From the 52-second reel, extract 3-5 candidate still frames per D-02.

    Selection rubric (4 hard constraints):
    1. **Wide cinematic shot** — landscape framing, not a close-up.
    2. **Michelle NOT on-camera** — her name sits over the image; her face shouldn't compete.
    3. **Dark lower band** — the bottom-band gradient (`from-black/80`) needs underlying contrast to stay legible.
    4. **Visual breadth** — prefer frames suggesting her range (PBS American Portrait wide shot > a single branded talking-head).

    Compress each candidate to roughly the production target (~150KB at JPG q=82 or WebP q=80) for fidelity preview. Surface candidates inline in chat: numbered thumbnails (`1.jpg`, `2.jpg`, ...) with one-line notes for each ("wide shot from PBS subject's home", "cinematic backstage of branded shoot", etc.).

    Also surface the format recommendation: WebP is the research recommendation (better quality-per-byte; modern-browsers-only is locked per PROJECT.md). Default to WebP unless a specific candidate's compression artifacts force JPG.

    Then PAUSE and wait for user approval before proceeding to Task 2 (which writes the binary into `src/lib/assets/` and commits it).
  </action>
  <verify>
    User reply contains the literal string "approved" (and ideally an option number).
  </verify>
  <what-built>
    3-5 candidate stills from the Producer's Reel, compressed to ~150KB each, surfaced in chat with one-line descriptions + a top-pick recommendation.
  </what-built>
  <how-to-verify>
    1. Claude shows 3-5 numbered candidate frames in chat (image previews if the harness supports it; otherwise file paths to scratch dir + brief descriptions).
    2. Claude states its top-1 pick with reasoning + format recommendation.
    3. User reviews and replies with EITHER:
       - "approved: option N" + optional override on jpg/webp choice, OR
       - "redo with [specific guidance]" (different timecode region, different format, different vibe).
    4. If "redo": Claude pulls a fresh set and re-surfaces. If "approved": Claude proceeds to Task 2.
  </how-to-verify>
  <resume-signal>
    Reply: "approved: option N" (1-5) and optionally "format: jpg" or "format: webp" — OR — "redo: [guidance]"
  </resume-signal>
  <acceptance_criteria>
    - User explicitly approves one candidate (or sends a "redo" cycle that completes with approval)
    - The approved candidate satisfies the 4-constraint rubric (wide / Michelle not on-camera / dark lower band / cinematic)
    - Format choice locked (jpg OR webp)
  </acceptance_criteria>
  <done>
    User has approved one frame + format. Claude has the approved binary ready to commit in Task 2.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Build HeroPoster.svelte + commit the approved poster asset; flip HeroPoster.test.ts to green</name>
  <files>src/lib/assets/hero-poster.jpg, src/lib/components/HeroPoster.svelte, src/lib/components/HeroPoster.test.ts</files>
  <read_first>
    - src/lib/components/HeroPoster.test.ts (Plan 04-01 wrote 5 describe.skip blocks — this task flips them to describe and removes the lazy loadHeroPoster() helper indirection + @ts-expect-error)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Architecture Pattern 1 (full Pattern 1 template — verbatim hero composition)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Code Examples → Example 2 (Vite asset import shape)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-01..D-12 (image), D-16..D-20 (PLAY REEL CTA)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 4 (Tailwind dynamic class concat — both class strings literal)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 5 (object-position underscore syntax: `object-[center_30%]` NOT `object-[center 30%]`)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 6 (preload + img dedupe — same hashed URL)
    - src/lib/data/index.ts (verify producerReelId export path is `$lib/data`)
    - svelte.config.js (BASE_PATH wiring; `import { base } from '$app/paths'`)
  </read_first>
  <behavior>
    Tests expected to pass (5 suites in HeroPoster.test.ts after `describe.skip` → `describe`):
    - Test 1 (HERO-01 LCP attrs): `<img>` has `loading="eager"` AND `fetchpriority="high"`
    - Test 2 (HERO-01 preload link): `document.head` contains `<link rel="preload" as="image" fetchpriority="high">`
    - Test 3 (HERO-02 name and tagline): `<h1>` text equals "Michelle Ngo"; the document body text matches `/filmmaker\s*&\s*producer/i`
    - Test 4 (HERO-03 PLAY REEL href): the anchor whose text matches `/play\s*reel/i` has `href` ending in `/watch/264677021`
    - Test 5 (HERO-03 PLAY REEL prefetch): same anchor has `data-sveltekit-preload-data="hover"`
    - Test 6 (sentinel): `<div id="hero-sentinel">` exists inside the host after mount
  </behavior>
  <action>
    **Step A — commit the approved asset.** From the candidates produced in Task 1, write the approved binary to `src/lib/assets/hero-poster.jpg` OR `src/lib/assets/hero-poster.webp` (whichever the user approved). Create the `src/lib/assets/` directory (currently does not exist — Phase 1 D-16 minimal-`src/lib/` rule means each phase creates its own folders). Target compression: roughly ≤150KB if achievable without visible artifacts.

    If the user picked WebP, the import path in step B below uses `'$lib/assets/hero-poster.webp'`. If JPG, `'$lib/assets/hero-poster.jpg'`. The rest of the code is format-agnostic.

    **Step B — create `src/lib/components/HeroPoster.svelte`** with this exact shape (verbatim from 04-RESEARCH.md §Pattern 1):

    ```svelte
    <!--
      Phase 4 HERO-01 / HERO-02 / HERO-03: full-bleed reel-led hero with name,
      tagline, and PLAY REEL CTA. Sits inside src/routes/+page.svelte (replaces
      the Phase 1 splash entirely — D-15).

      Layers (z-stacked inside min-h-dvh container):
        1. <img>             — the poster (LCP); eager + fetchpriority high
        2. gradient overlay  — D-05 bottom-band darken (from-black/80 → transparent)
        3. content stack     — D-12 lower-left flex: h1 + tagline + PLAY REEL CTA
        4. scroll cue        — D-11 chevron, bottom-center
        5. hero-sentinel     — TopNav's IntersectionObserver target (D-14)

      <svelte:head> emits <link rel="preload"> for the same hashed URL the <img>
      uses (D-07 + 04-RESEARCH Pitfall 6 — browser dedupes a single fetch).

      ESLint: svelte/no-navigation-without-resolve disabled — PLAY REEL href is
      built from base-path-safe `${base}/watch/${producerReelId}` (same idiom as
      VideoCard + CategoryTag in Phase 3).
    -->
    <script lang="ts">
      /* eslint-disable svelte/no-navigation-without-resolve */
      import { base } from '$app/paths';
      import { producerReelId } from '$lib/data';
      import heroPoster from '$lib/assets/hero-poster.jpg';
      // ↑ swap `.jpg` to `.webp` if Task 1 user chose webp.
    </script>

    <svelte:head>
      <link rel="preload" as="image" href={heroPoster} fetchpriority="high" />
    </svelte:head>

    <section class="relative min-h-dvh w-full overflow-hidden bg-neutral-950">
      <!-- Layer 1: poster image -->
      <img
        src={heroPoster}
        alt=""
        loading="eager"
        fetchpriority="high"
        class="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />

      <!-- Layer 2: bottom gradient overlay (D-05) -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        aria-hidden="true"
      ></div>

      <!-- Layer 3: content stack — D-12 lower-left flex stack -->
      <div
        class="relative z-10 flex min-h-dvh flex-col items-start justify-end pb-16 lg:pb-24 pl-6 sm:pl-10 lg:pl-16 pr-6 sm:pr-10 lg:pr-16"
      >
        <h1
          class="text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-widest text-white"
        >
          Michelle Ngo
        </h1>
        <p class="mt-4 text-sm md:text-base uppercase tracking-wide text-neutral-300">
          Filmmaker &amp; Producer
        </p>
        <a
          href={`${base}/watch/${producerReelId}`}
          data-sveltekit-preload-data="hover"
          class="mt-8 inline-flex items-center gap-2 border border-white px-6 py-3 text-sm tracking-widest uppercase text-white hover:bg-white hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          ▷ PLAY REEL
        </a>
      </div>

      <!-- Layer 4: scroll cue, D-11 chevron-down -->
      <div
        class="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60"
        aria-hidden="true"
      >
        <span class="text-2xl">⌄</span>
      </div>

      <!-- Layer 5: sentinel for TopNav's IntersectionObserver (D-14).
           Hero's bottom edge; when visible, hero is in viewport. -->
      <div
        id="hero-sentinel"
        class="absolute bottom-0 left-0 h-px w-full"
        aria-hidden="true"
      ></div>
    </section>
    ```

    **Critical literals (do NOT paraphrase or restyle):**
    - `loading="eager"` (D-07 — LCP)
    - `fetchpriority="high"` (D-07 — LCP)
    - `alt=""` (D-07 — decorative)
    - `object-[center_30%]` with an underscore (Pitfall 5; Tailwind v4 arbitrary value)
    - `bg-gradient-to-t from-black/80 via-black/20 to-transparent` (D-05 verbatim)
    - `<h1>` text = `Michelle Ngo` (HERO-02; test asserts toLowerCase().trim() === 'michelle ngo')
    - `<p>` text = `Filmmaker &amp; Producer` (HERO-02; test regex `/filmmaker\s*&\s*producer/i`)
    - PLAY REEL anchor `href` template literal: `` `${base}/watch/${producerReelId}` `` — the test asserts `href.endsWith('/watch/264677021')`
    - PLAY REEL anchor `data-sveltekit-preload-data="hover"` (D-20)
    - PLAY REEL label: `▷ PLAY REEL` (D-19 — unicode triangle, space, all-caps)
    - Sentinel div: `id="hero-sentinel"` (HeroPoster owns the contract per D-14)
    - `<link rel="preload" as="image" href={heroPoster} fetchpriority="high" />` in `<svelte:head>` — uses the same `heroPoster` import the `<img>` uses so Pitfall 6 dedupe works

    **Step C — flip HeroPoster.test.ts from RED-by-skip to GREEN.** Open `src/lib/components/HeroPoster.test.ts` (created in Plan 04-01) and make TWO transformations across the file:

    1. **Replace every `describe.skip(` with `describe(`** (5 occurrences).
    2. **Replace the lazy `loadHeroPoster()` indirection with a static import.** At the top of the file (below the existing `vi.mock('$app/paths', ...)` line), ADD:

       ```ts
       import HeroPoster from './HeroPoster.svelte';
       ```

       Then DELETE the `async function loadHeroPoster() { ... }` helper. In each test body, replace the literal lines:

       ```ts
       const HeroPoster = await loadHeroPoster();
       component = mount(HeroPoster, { target: makeHost(), props: {} });
       ```

       with:

       ```ts
       component = mount(HeroPoster, { target: makeHost(), props: {} });
       ```

       Also drop the `// @ts-expect-error stub: target module doesn't exist yet` line (no longer needed — module now exists). Drop the `await` and `async` from the test function signatures where the only async work was the loadHeroPoster() call. (Tests that no longer have any `await` inside drop `async`; tests that retain other awaits keep `async`.)

    Why this dance: matches the Phase 2/3 Wave 0 pattern documented in STATE.md ("Renamed test files to use lazy `await import()` for stubs whose target modules don't exist yet; downstream plans drop the indirection + the @ts-expect-error when they unskip"). Keeps Wave 0 vitest run + svelte-check both exit 0 while preserving the `pnpm vitest run -t "<name>"` contract.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/components/HeroPoster.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/assets/hero-poster.jpg` OR `src/lib/assets/hero-poster.webp` exists (whichever Task 1 user approved)
    - The asset file size is ≤ 250KB (target ~150KB; ≤250KB is the hard cap allowing some headroom)
    - `src/lib/components/HeroPoster.svelte` exists
    - HeroPoster.svelte contains the literal `id="hero-sentinel"`
    - HeroPoster.svelte contains the literal `loading="eager"`
    - HeroPoster.svelte contains the literal `fetchpriority="high"`
    - HeroPoster.svelte contains the literal `alt=""`
    - HeroPoster.svelte contains the literal `object-[center_30%]` (with underscore)
    - HeroPoster.svelte contains the literal `bg-gradient-to-t from-black/80 via-black/20 to-transparent`
    - HeroPoster.svelte contains `import heroPoster from '$lib/assets/hero-poster.` (either .jpg or .webp)
    - HeroPoster.svelte contains `import { producerReelId } from '$lib/data'`
    - HeroPoster.svelte contains `<link rel="preload" as="image"`
    - HeroPoster.svelte contains `▷ PLAY REEL`
    - HeroPoster.svelte contains `data-sveltekit-preload-data="hover"`
    - HeroPoster.svelte contains the literal `Michelle Ngo` inside `<h1>` and `Filmmaker` inside a `<p>`
    - `grep -c "describe.skip" src/lib/components/HeroPoster.test.ts` equals 0 (all flipped)
    - HeroPoster.test.ts contains `import HeroPoster from './HeroPoster.svelte'` (static import replaces lazy helper)
    - `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "LCP attrs"` exits 0
    - `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "preload link"` exits 0
    - `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "name and tagline"` exits 0
    - `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "PLAY REEL href"` exits 0
    - `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "PLAY REEL prefetch"` exits 0
    - `pnpm vitest run src/lib/components/HeroPoster.test.ts` exits 0 (full suite green)
    - `pnpm check` exits 0
    - `pnpm build` exits 0 (asset is bundled and emitted to `build/_app/immutable/assets/` with a content hash)
  </acceptance_criteria>
  <done>
    HeroPoster.svelte is a self-contained, testable hero composition. HeroPoster.test.ts is GREEN (no skips, no expected-fails). The asset ships with Vite content-hashing. Plan 04-04 (TopNav scroll-aware) can query the sentinel via `document.getElementById('hero-sentinel')`. Plan 04-05 (page composition) can `<HeroPoster />` in `/+page.svelte`.
  </done>
</task>

</tasks>

<verification>
After both tasks:

1. `pnpm vitest run src/lib/components/HeroPoster.test.ts` — exits 0, all suites green.
2. `pnpm check` — exits 0 (TypeScript strict + svelte-check).
3. `pnpm build` — exits 0; emit shows the hero asset hash-prefixed in `build/_app/immutable/assets/`.
4. Visual sanity (optional, deferred to Plan 04-05 composition + UAT): nothing else mounts HeroPoster yet, so visual verification waits until `/+page.svelte` is wired.
</verification>

<success_criteria>
Plan 04-02 is complete when:

- [ ] User has approved a hero poster frame from Vimeo 264677021 (checkpoint signed off)
- [ ] `src/lib/assets/hero-poster.{jpg|webp}` exists, ≤ 250KB
- [ ] `src/lib/components/HeroPoster.svelte` exists with the verbatim shape from 04-RESEARCH.md §Pattern 1
- [ ] HeroPoster renders the sentinel `<div id="hero-sentinel">` at the hero's bottom edge
- [ ] HeroPoster.test.ts has zero `describe.skip` and zero `@ts-expect-error`
- [ ] All HeroPoster tests green: LCP attrs, preload link, name and tagline, PLAY REEL href, PLAY REEL prefetch, sentinel
- [ ] HERO-01, HERO-02, HERO-03 all observable at the component level (composition into /+page.svelte happens in Plan 04-05)
- [ ] `pnpm test && pnpm check && pnpm build` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-reel-led-home/04-02-hero-poster-component-SUMMARY.md` per the standard summary template.
</output>
