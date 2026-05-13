---
phase: 07-polish-production-cutover
plan: 02
type: execute
wave: 2
depends_on: ["07-01"]
files_modified:
  - src/routes/+layout.svelte
  - src/routes/+page.svelte
  - src/routes/work/+page.svelte
  - src/routes/work/[category]/+page.svelte
  - src/routes/watch/[id]/+page.svelte
  - src/routes/pbs-american-portrait/+page.svelte
  - src/routes/press/+page.svelte
  - src/routes/about/+page.svelte
  - src/routes/contact/+page.svelte
  - src/routes/sitemap.xml/+server.ts
  - static/favicon-16.png
  - static/favicon-32.png
  - static/favicon-192.png
  - static/favicon-512.png
  - static/apple-touch-icon.png
  - static/favicon.ico
  - static/og-image.jpg
  - scripts/test-prerender-coverage.mjs
autonomous: false
requirements: [FOUND-03]
user_setup:
  - service: favicon-authoring
    why: "Multi-size favicon set must be authored as binary assets (no Node script can generate the icon design from scratch without input)"
    dashboard_config:
      - task: "Generate favicon.ico (16+32 multi-res), favicon-192.png, favicon-512.png, apple-touch-icon.png (180x180) from a single 512x512 'MN' white-on-neutral-950 master"
        location: "https://realfavicongenerator.net/ or any image editor"
  - service: og-image-authoring
    why: "1200x630 OG image asset for sitewide social previews; recommended to derive from src/lib/assets/hero-poster.webp"
    dashboard_config:
      - task: "Export a 1200x630 crop of hero-poster.webp as JPG (~150KB), optional wordmark composite, save to static/og-image.jpg"
        location: "Any image editor or `scripts/build-og-image.mjs` if authored"

must_haves:
  truths:
    - "Every route emits a per-page <title> matching D-13 format (e.g., /work emits 'Work — Michelle Ngo'; /pbs-american-portrait emits 'PBS American Portrait — Michelle Ngo')"
    - "Every route emits a per-page <meta name=\"description\"> with route-specific copy per D-14"
    - "/about route includes a <script type=\"application/ld+json\"> block with a schema.org Person payload using the URLs from ContactBlock.svelte"
    - "Every /watch/[id] route includes a <script type=\"application/ld+json\"> block with a schema.org VideoObject derived from the video record"
    - "Every route emits sitewide OG/Twitter meta tags pointing to /og-image.jpg"
    - "Every route emits favicon <link> tags referencing favicon-{16,32,192,512}.png + apple-touch-icon.png + favicon.ico"
    - "Build emits build/sitemap.xml containing exactly 71 <url> entries (7 static routes + 8 category routes + 56 watch routes), all with full https://michellengo.net URLs"
    - "test-prerender-coverage.mjs asserts build/sitemap.xml exists and contains >= 71 <url> entries"
  artifacts:
    - path: "src/routes/+layout.svelte"
      provides: "Sitewide favicon <link>s + OG <meta>s + Twitter card <meta>s in <svelte:head>"
      contains: "og-image.jpg"
    - path: "src/routes/sitemap.xml/+server.ts"
      provides: "GET endpoint with prerender = true returning XML sitemap of all 71 URLs"
      exports: ["GET", "prerender"]
    - path: "src/routes/watch/[id]/+page.svelte"
      provides: "VideoObject JSON-LD injection per video"
      contains: "application/ld+json"
    - path: "src/routes/about/+page.svelte"
      provides: "Person JSON-LD injection (name, jobTitle, sameAs)"
      contains: "application/ld+json"
    - path: "static/og-image.jpg"
      provides: "1200x630 OG card image"
    - path: "static/favicon.ico"
      provides: "Multi-resolution favicon for browser tabs"
    - path: "static/apple-touch-icon.png"
      provides: "iOS home-screen icon (180x180)"
    - path: "scripts/test-prerender-coverage.mjs"
      provides: "Extended assertions for build/sitemap.xml + build/og-image.jpg + favicon files"
      contains: "sitemap.xml"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "static/og-image.jpg, static/favicon-*.png, static/favicon.ico, static/apple-touch-icon.png"
      via: "<svelte:head> <link rel=\"icon\"> + <meta property=\"og:image\">"
      pattern: "og-image\\.jpg"
    - from: "src/routes/sitemap.xml/+server.ts"
      to: "src/lib/data (videos + getCategoriesInDisplayOrder + categoryToSlug)"
      via: "imports from $lib/data"
      pattern: "\\$lib/data"
    - from: "src/routes/about/+page.svelte"
      to: "ContactBlock literal URLs (IMDb, LinkedIn, Vimeo)"
      via: "Person sameAs array in JSON-LD payload"
      pattern: "\"@type\":\\s*\"Person\""
    - from: "src/routes/watch/[id]/+page.svelte"
      to: "video record from PageData (title, description, thumbnail, embed, published, duration_seconds)"
      via: "VideoObject JSON-LD interpolation"
      pattern: "\"@type\":\\s*\"VideoObject\""
---

<objective>
Wire production-grade metadata across all 7 routes (per-page titles, descriptions, OG/Twitter cards, favicons) and add the two SEO-critical structured data injections: Person JSON-LD on /about and VideoObject JSON-LD on every /watch/[id]. Generate the sitemap.xml endpoint at build time. This plan lands EVERYTHING the public site needs in its `<head>` before search engines see the new domain.

Purpose: D-11 favicons + D-12 OG + D-13 titles + D-14 descriptions + D-15 JSON-LD + D-17 sitemap. All metadata in one plan since the touchpoints are scattered across all route files and benefit from one coherent pass.

This plan depends on Plan 07-01 because Task 5's Person JSON-LD `sameAs` array reads the IMDb + LinkedIn URL literals from `src/lib/components/ContactBlock.svelte` lines 36-37 (per D-15) — those literals are swapped by Plan 07-01 Task 2. Wave 2 placement linearizes the dependency: 07-01 (wave 1) → 07-02 (wave 2) → 07-03/07-04 (wave 3) → 07-05 (wave 4). This prevents a race where 07-02 could read the channel-homepage placeholders before 07-01 commits its swap.

Output: 9 route files edited, 1 new endpoint, 7 new static asset files, 1 script extended. Build emits sitemap.xml + all favicon/OG assets in `build/`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/07-polish-production-cutover/07-CONTEXT.md
@src/routes/+layout.svelte
@src/routes/+page.svelte
@src/routes/work/+page.svelte
@src/routes/work/[category]/+page.svelte
@src/routes/watch/[id]/+page.svelte
@src/routes/watch/[id]/+page.ts
@src/routes/pbs-american-portrait/+page.svelte
@src/routes/press/+page.svelte
@src/routes/about/+page.svelte
@src/routes/contact/+page.svelte
@src/lib/components/ContactBlock.svelte
@src/lib/data/videos.ts
@src/lib/data/schema.ts
@scripts/test-prerender-coverage.mjs

<interfaces>
<!-- Current sitewide head (src/routes/+layout.svelte lines 13-16): -->

```svelte
<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <title>Michelle Ngo</title>
</svelte:head>
```

<!-- IMPORTANT: the `noindex` meta tag is INTENTIONALLY PRESERVED in this plan.
     Plan 07-05 removes it as the last commit before DNS swap (D-16 atomic flip).
     This plan only ADDS favicon + OG + Twitter + structured data — it does NOT
     touch the robots meta. -->

<!-- $lib/data public surface (src/lib/data/index.ts): -->

```typescript
export { videos, producerReelId, getById, getByCategory,
         getCategoriesInDisplayOrder, getCategoriesWithCounts } from './videos';
export { CATEGORIES, categoryToSlug, slugToCategory } from './categories';
export type { Video } from './schema';
export type { Category } from './categories';
```

<!-- Video type (src/lib/data/schema.ts) — fields VideoObject JSON-LD consumes: -->

```typescript
// Required:  source, id, title, uploader, thumbnail, embed, category, published (YYYY-MM-DD)
// Optional:  duration_seconds (number, 14/56 missing), description (string, 23/56 missing)
//            featured (default false), hidden (default false), tags, credits
```

<!-- /watch/[id]/+page.ts already provides {video, rail} via load(); +page.svelte
     reads via $derived(data.video). Plan extends the .svelte file with the
     JSON-LD <script> block — no +page.ts changes needed. -->

<!-- ContactBlock URLs after Plan 07-01 lands (read at execute time, NOT assumed): -->

```typescript
const IMDB_URL = '<personalized-imdb-url>';      // from Plan 07-01 swap (Wave 1)
const LINKEDIN_URL = '<personalized-linkedin-url>'; // from Plan 07-01 swap (Wave 1)
const VIMEO_URL = 'https://vimeo.com/user2149742';
```

<!-- Wave ordering: 07-02 is Wave 2 (depends_on: ["07-01"]). Plan 07-01 commits the
     personalized URLs to ContactBlock.svelte lines 36-37 BEFORE this plan reads them
     in Task 5. This prevents a race where the Person sameAs JSON-LD would otherwise
     duplicate the channel-homepage placeholders. -->
</interfaces>
</context>

<tasks>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 1: Confirm OG image + favicon asset authoring approach</name>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-11 favicon set, D-12 OG image, Claude's Discretion section on authoring approach)
    - src/lib/assets/hero-poster.webp (the OG image source per D-12)
    - static/favicon.png (the existing single-PNG fallback to be preserved)
  </read_first>
  <decision>
    How are the 7 binary asset files authored?
    Required files (D-11 + D-12):
      - static/og-image.jpg (1200x630, ~150KB target, derived from hero-poster.webp crop)
      - static/favicon.ico (multi-resolution 16+32)
      - static/favicon-16.png (16x16)
      - static/favicon-32.png (32x32)
      - static/favicon-192.png (192x192, Android Chrome)
      - static/favicon-512.png (512x512, PWA/install hint)
      - static/apple-touch-icon.png (180x180, iOS home-screen)
  </decision>
  <context>
    These are binary image assets — Claude CAN author them via a script using
    `sharp` or similar, BUT D-09 forbids new JS runtime deps. A dev-only dep (e.g.,
    `sharp` as devDependency) might be acceptable for a one-off `scripts/build-assets.mjs`
    script. Alternatively, the user generates them manually via realfavicongenerator.net
    and the OG image via any image editor.
  </context>
  <options>
    <option id="user-authors">
      <name>User authors all 7 files manually and drops them in static/</name>
      <pros>No new deps; user controls the exact wordmark/letter-mark; ships in one pass; matches D-09 "no new JS deps" strictly.</pros>
      <cons>Requires user effort; Claude can't verify pixel quality of the icon design.</cons>
    </option>
    <option id="script-with-sharp-devdep">
      <name>Claude adds `sharp` as a devDependency and writes scripts/build-assets.mjs to generate all 7 files from a single 512x512 master + hero-poster.webp crop</name>
      <pros>Reproducible; user only authors one 512x512 master + the script handles all derivative sizes.</pros>
      <cons>Adds a devDependency (sharp ~80MB on disk including platform-native binary); D-09 borderline (it's dev-only, but the line is "no new JS deps" generally).</cons>
    </option>
    <option id="hybrid">
      <name>Claude writes scripts/build-og-image.mjs (no new dep — uses a tiny inline canvas-like approach or hand-cropped output already saved) AND user manually generates favicon set via realfavicongenerator.net</name>
      <pros>OG image is automatable; favicon set is best done with a dedicated tool anyway.</pros>
      <cons>Splits the task; pure-Node image manipulation without `sharp` is awkward at best.</cons>
    </option>
  </options>
  <resume-signal>
    User selects option-id and EITHER provides the 7 binary files in static/ (option user-authors / hybrid)
    OR approves adding `sharp` as a devDependency (option script-with-sharp-devdep).
    Task 2 cannot proceed until all 7 files exist in static/ (existence verified before task 2 runs).
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <decision> prompt + <options> + <context> above to the user. Wait for the <resume-signal> response. Once received, record the user's selection (and any provided literals) in the plan SUMMARY's "User decisions captured" section so downstream tasks can reference them. Do NOT make a guess or proceed without an explicit resume signal — this checkpoint gates subsequent tasks.
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has explicitly selected one of the documented options and any required values are captured. The downstream task can read those values verbatim.</done>
</task>

<task type="auto">
  <name>Task 2: Wire sitewide favicon + OG + Twitter + Open Graph meta tags in +layout.svelte</name>
  <files>src/routes/+layout.svelte</files>
  <read_first>
    - src/routes/+layout.svelte (full file — verify current state has only `<meta name="robots">` and `<title>` in `<svelte:head>`)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-11 favicons, D-12 OG/Twitter card sitewide image)
    - static/ directory listing (confirm all 7 binary files exist post-Task-1)
    - https://ogp.me/ (OGP property names reference) — informational only
  </read_first>
  <action>
    Edit `src/routes/+layout.svelte`. The current `<svelte:head>` block (lines 13-16) reads:
    ```svelte
    <svelte:head>
      <meta name="robots" content="noindex, nofollow" />
      <title>Michelle Ngo</title>
    </svelte:head>
    ```

    REPLACE that block with the following EXACT content (preserving the `noindex` meta — Plan 07-05 removes it later as an atomic commit per D-16):

    ```svelte
    <svelte:head>
      <meta name="robots" content="noindex, nofollow" />
      <title>Michelle Ngo</title>

      <!-- D-11 Favicon set (multi-size for browser tabs + iOS + Android home-screen) -->
      <link rel="icon" type="image/x-icon" href="{base}/favicon.ico" sizes="any" />
      <link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="{base}/favicon-192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="{base}/favicon-512.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />

      <!-- D-12 Sitewide OG + Twitter card. Per-route <title>/<meta description>
           overrides happen in each +page.svelte's own <svelte:head>. -->
      <meta property="og:site_name" content="Michelle Ngo" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://michellengo.net{base}/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Michelle Ngo — Filmmaker & Producer" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://michellengo.net{base}/og-image.jpg" />
    </svelte:head>
    ```

    Also update the `<script lang="ts">` block (lines 6-11) to import `base`:
    ```svelte
    <script lang="ts">
      import '../app.css';
      import { base } from '$app/paths';
      import TopNav from '$lib/components/TopNav.svelte';
      import Footer from '$lib/components/Footer.svelte';
      let { children } = $props();
    </script>
    ```

    Why hardcode `https://michellengo.net` in og:image absolute URL: OGP requires
    absolute URLs for og:image, and the production canonical host is the apex.
    Staging deploys at wolfwdavid.github.io/michelle_ngo_four/ will emit incorrect
    OG previews — acceptable since staging is `noindex` per D-11 and not shared in
    iMessage/Slack.

    NO new JS runtime deps (D-09). NO new component, all literal markup in the layout.
    Do NOT remove or alter the `<meta name="robots">` line — Plan 07-05 owns that flip (D-16).
  </action>
  <verify>
    <automated>pnpm build && grep -c "favicon-192.png" build/index.html && grep -c "og:image" build/index.html && grep -c "summary_large_image" build/work/index.html</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "favicon-192.png" src/routes/+layout.svelte` returns at least 1
    - `grep -c "apple-touch-icon" src/routes/+layout.svelte` returns at least 1
    - `grep -c "og:image" src/routes/+layout.svelte` returns at least 1
    - `grep -c "summary_large_image" src/routes/+layout.svelte` returns at least 1
    - `grep -c "michellengo.net" src/routes/+layout.svelte` returns at least 1 (the absolute og:image URL)
    - `grep -c "noindex" src/routes/+layout.svelte` returns at least 1 (robots meta still present — Plan 07-05 removes it later)
    - `pnpm build` exits 0
    - After build: `grep -c "favicon-192.png" build/index.html` returns at least 1 (layout head propagates into every prerendered route)
    - After build: `grep -c "og:image" build/about/index.html` returns at least 1
    - `pnpm check` exits 0
  </acceptance_criteria>
  <done>
    Sitewide favicon + OG + Twitter meta tags emit on every route in the prerendered build.
    Producer sharing any URL in iMessage/Slack gets a 1200x630 preview.
  </done>
</task>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 3: Approve per-page <meta description> copy for / and /about</name>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-14 description copy — most routes have locked copy; / and /about have ≤155 char "or planner-tuned" notes)
    - src/routes/about/+page.svelte (the approved first-person bio for /about's description, first ~150 chars)
    - .planning/phases/06-press-about-contact/06-02-about-contact-pages-SUMMARY.md (Phase 5 D-11 verbatim-copy-via-PLAN-checkpoint precedent)
  </read_first>
  <decision>
    Approve the exact `<meta name="description">` content strings for `/` and `/about`.
    Other routes' description copy is locked in CONTEXT.md D-14 and embedded verbatim in Task 4.
  </decision>
  <context>
    D-14 locks the SHAPE (one line, ≤155 chars) but leaves wording to the planner
    for tuning. The Phase 5 D-11 precedent (verbatim copy through PLAN checkpoint)
    requires user approval for any non-trivial page-level copy.

    Other route descriptions are pre-locked in Task 4 verbatim from CONTEXT.md
    D-14 (no checkpoint needed — they are mechanical fills).
  </context>
  <options>
    <option id="planner-suggested">
      <name>Use planner-suggested values (recommended)</name>
      <pros>Ships immediately; both candidates are ≤155 chars; both honor the brand-first/audience-first framing.</pros>
      <cons>None.</cons>
    </option>
  </options>
  <resume-signal>
    User approves OR edits the following two strings (both ≤155 chars):

      / (home) → "Filmmaker and producer Michelle Ngo. PBS American Portrait, HBO Max, HBO, Hulu, U2 Sphere broadcast credits. Watch the reel."  (140 chars)

      /about → "I'm Michelle Ngo, a filmmaker and producer based in New York City. I make video that helps brands and broadcasters tell stories well."  (132 chars — first 132 chars of the approved bio)

    Once approved, paste the final strings into the resume-signal so Task 4 reads them verbatim.
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <decision> prompt + <options> + <context> above to the user. Wait for the <resume-signal> response. Once received, record the user's selection (and any provided literals) in the plan SUMMARY's "User decisions captured" section so downstream tasks can reference them. Do NOT make a guess or proceed without an explicit resume signal — this checkpoint gates subsequent tasks.
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has explicitly selected one of the documented options and any required values are captured. The downstream task can read those values verbatim.</done>
</task>

<task type="auto">
  <name>Task 4: Add per-page <title> + <meta description> in each route's <svelte:head> (D-13 + D-14)</name>
  <files>
    src/routes/+page.svelte
    src/routes/work/+page.svelte
    src/routes/work/[category]/+page.svelte
    src/routes/watch/[id]/+page.svelte
    src/routes/pbs-american-portrait/+page.svelte
    src/routes/press/+page.svelte
    src/routes/about/+page.svelte
    src/routes/contact/+page.svelte
  </files>
  <read_first>
    - Each of the 8 files above (verify current `<svelte:head>` block — most already have an OLD-format `<title>Michelle Ngo — X</title>`; this task UPDATES title format AND adds description)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-13 per-page titles — EVERY string is locked; D-14 per-page descriptions — most locked, / and /about approved in Task 3)
    - src/routes/watch/[id]/+page.ts (the load function — `video` has `title`, `description`, `category` fields)
    - src/lib/data/videos.ts (Video type — description is optional per Phase 2 D-06)
  </read_first>
  <action>
    Edit each `<svelte:head>` block per the literal mapping below. **Title format change**:
    existing files use `Michelle Ngo — X` format; D-13 locks NEW format `X — Michelle Ngo`
    (page-first, brand-suffix). Replace the title verbatim.

    Each description value below is the exact string to embed in `content="..."`.
    All values are ≤155 chars (verified). Use the approved strings from Task 3 for / and /about.

    **src/routes/+page.svelte** (currently has `<title>Michelle Ngo — Filmmaker &amp; Producer</title>`):
    ```svelte
    <svelte:head>
      <title>Michelle Ngo</title>
      <meta name="description" content="{APPROVED_HOME_DESCRIPTION_FROM_TASK_3}" />
    </svelte:head>
    ```

    **src/routes/work/+page.svelte** (currently `<title>Michelle Ngo — Work</title>`):
    ```svelte
    <svelte:head>
      <title>Work — Michelle Ngo</title>
      <meta name="description" content="All 56 videos by filmmaker Michelle Ngo, organized by category." />
    </svelte:head>
    ```

    **src/routes/work/[category]/+page.svelte** (currently `<title>Michelle Ngo — {data.category}</title>`):
    ```svelte
    <svelte:head>
      <title>{data.category} — Michelle Ngo</title>
      <meta name="description" content="{data.videos.length} videos by Michelle Ngo in {data.category}." />
    </svelte:head>
    ```

    **src/routes/watch/[id]/+page.svelte** (currently `<title>Michelle Ngo — {video.title}</title>`):
    ```svelte
    <svelte:head>
      <title>{video.title} — Michelle Ngo</title>
      <meta name="description" content="{video.description ? video.description.slice(0, 150) : `${video.title} — by Michelle Ngo`}" />
    </svelte:head>
    ```

    **src/routes/pbs-american-portrait/+page.svelte** (currently `<title>Michelle Ngo — PBS American Portrait</title>`):
    ```svelte
    <svelte:head>
      <title>PBS American Portrait — Michelle Ngo</title>
      <meta name="description" content="Michelle Ngo's PBS American Portrait work: 18 short documentary portraits broadcast on PBS." />
    </svelte:head>
    ```

    **src/routes/press/+page.svelte** (currently `<title>Michelle Ngo — Press</title>`):
    ```svelte
    <svelte:head>
      <title>Press — Michelle Ngo</title>
      <meta name="description" content="Broadcast credits: HBO Max, HBO, PBS, ABC News, U2, Amazon News, Music Box, and more." />
    </svelte:head>
    ```

    **src/routes/about/+page.svelte** (currently `<title>Michelle Ngo — About</title>`):
    ```svelte
    <svelte:head>
      <title>About — Michelle Ngo</title>
      <meta name="description" content="{APPROVED_ABOUT_DESCRIPTION_FROM_TASK_3}" />
    </svelte:head>
    ```

    **src/routes/contact/+page.svelte** (currently `<title>Michelle Ngo — Contact</title>`):
    ```svelte
    <svelte:head>
      <title>Contact — Michelle Ngo</title>
      <meta name="description" content="Reach Michelle Ngo by email or phone." />
    </svelte:head>
    ```

    Per D-13: each per-route `<title>` overrides the layout-level `<title>Michelle Ngo</title>`.
    SvelteKit picks the deepest title — verified via spec.

    Edits are ONLY inside `<svelte:head>` blocks — DO NOT touch any other markup or scripts.

    Implements D-13 (per-page titles) + D-14 (per-page descriptions). No new deps (D-09).
  </action>
  <verify>
    <automated>pnpm build && grep -lc "Work — Michelle Ngo" build/work/index.html && grep -lc "description" build/work/index.html && grep -c "PBS American Portrait — Michelle Ngo" build/pbs-american-portrait/index.html</automated>
  </verify>
  <acceptance_criteria>
    - `grep -Fc "<title>Work — Michelle Ngo</title>" src/routes/work/+page.svelte` returns 1
    - `grep -Fc "<title>Press — Michelle Ngo</title>" src/routes/press/+page.svelte` returns 1
    - `grep -Fc "<title>About — Michelle Ngo</title>" src/routes/about/+page.svelte` returns 1
    - `grep -Fc "<title>Contact — Michelle Ngo</title>" src/routes/contact/+page.svelte` returns 1
    - `grep -Fc "<title>PBS American Portrait — Michelle Ngo</title>" src/routes/pbs-american-portrait/+page.svelte` returns 1
    - `grep -Fc "<title>{data.category} — Michelle Ngo</title>" 'src/routes/work/[category]/+page.svelte'` returns 1
    - `grep -Fc "<title>{video.title} — Michelle Ngo</title>" 'src/routes/watch/[id]/+page.svelte'` returns 1
    - Every file has at least one `<meta name="description"` line in its `<svelte:head>`
    - After `pnpm build`: `grep -c "Work — Michelle Ngo" build/work/index.html` returns at least 1
    - After `pnpm build`: `grep -c "All 56 videos by filmmaker Michelle Ngo" build/work/index.html` returns at least 1
    - After `pnpm build`: `grep -c "PBS American Portrait — Michelle Ngo" build/pbs-american-portrait/index.html` returns at least 1
    - `pnpm build` exits 0 and `pnpm check` exits 0
    - Existing route tests (work, work/[category], watch/[id], pbs-american-portrait, press, about, contact page.test.ts) still pass — verify via `pnpm test`

    Note: `grep -F` (fixed-string) is required for source-file acceptance checks because the title strings contain literal `{...}` Svelte placeholders and brackets that regex would interpret. Build-output checks (`grep -c "..." build/.../index.html`) use plain `grep` because the prerendered HTML has the Svelte placeholders resolved to concrete strings.
  </acceptance_criteria>
  <done>
    Every prerendered HTML file contains a route-specific `<title>` and `<meta name="description">`.
    Tab-strip scannability + SEO description coverage achieved.
  </done>
</task>

<task type="auto">
  <name>Task 5: Inject Person JSON-LD on /about and VideoObject JSON-LD on /watch/[id]</name>
  <files>
    src/routes/about/+page.svelte
    src/routes/watch/[id]/+page.svelte
  </files>
  <read_first>
    - src/routes/about/+page.svelte (current state — confirm bio approved markers + ContactBlock import; this task adds a JSON-LD `<script>` block in `<svelte:head>`)
    - src/routes/watch/[id]/+page.svelte (current state — confirm $derived(data.video) pattern; this task adds JSON-LD `<script>` block in `<svelte:head>`)
    - src/lib/components/ContactBlock.svelte (read post-Plan-07-01-swap — IMDB_URL, LINKEDIN_URL, VIMEO_URL literals are the Person.sameAs values; Plan 07-02 depends on 07-01 specifically so this read is guaranteed to see the personalized URLs, not the channel-homepage placeholders)
    - src/lib/data/schema.ts (Video type — uploader, published YYYY-MM-DD, duration_seconds optional, description optional, thumbnail, embed)
    - https://schema.org/Person (informational only — properties: name, jobTitle, sameAs)
    - https://schema.org/VideoObject (informational only — properties: name, description, thumbnailUrl, uploadDate, embedUrl, duration)
  </read_first>
  <action>
    **Edit src/routes/about/+page.svelte:** add a JSON-LD `<script>` block inside `<svelte:head>` AFTER the `<meta name="description">` from Task 4. The Person payload's `sameAs` must reference the EXACT URL literals from `src/lib/components/ContactBlock.svelte` (read at execute time — they are the Plan 07-01 personalized values, guaranteed in place by the wave 2 dependency on 07-01).

    Add this block inside the existing `<svelte:head>` (after the Task 4 `<meta name="description">` line):

    ```svelte
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Michelle Ngo",
        "jobTitle": "Filmmaker, Producer",
        "url": "https://michellengo.net/about/",
        "sameAs": [
          IMDB_URL,
          LINKEDIN_URL,
          VIMEO_URL
        ]
      })}
    </script>
    ```

    And add an import + constants block in the `<script lang="ts">` (currently lines 17-19) to make the URLs available. Since ContactBlock.svelte does NOT export its URL constants (they are file-internal `const`s), DUPLICATE the three literal URL strings inline at the top of /about's `<script>`:

    ```svelte
    <script lang="ts">
      import ContactBlock from '$lib/components/ContactBlock.svelte';

      // D-15 Person JSON-LD sameAs values. MUST match the literals in
      // src/lib/components/ContactBlock.svelte (single source of truth for the
      // visible links; this duplication is intentional because ContactBlock does
      // not export its URL constants). Update both files together if URLs change.
      //
      // At execute time, READ ContactBlock.svelte lines 36-37 (post-Plan-07-01 swap)
      // and paste the LITERAL personalized URL strings here. The wave-2 depends_on
      // ["07-01"] guarantees Plan 07-01 committed the swap before this task runs —
      // so the values below MUST be the personalized URLs, NOT the channel-homepage
      // placeholders (https://www.imdb.com/ / https://www.linkedin.com/).
      const IMDB_URL = '<IMDB_URL_from_ContactBlock.svelte_line_36>';
      const LINKEDIN_URL = '<LINKEDIN_URL_from_ContactBlock.svelte_line_37>';
      const VIMEO_URL = 'https://vimeo.com/user2149742';
    </script>
    ```

    **Edit src/routes/watch/[id]/+page.svelte:** add a VideoObject JSON-LD `<script>` block inside `<svelte:head>` AFTER the `<meta name="description">` from Task 4. All values are derived from `video` (already `$derived(data.video)` at line 33).

    Add this block inside the existing `<svelte:head>` (after the Task 4 `<meta name="description">` line):

    ```svelte
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": video.title,
        "description": video.description ?? video.title,
        "thumbnailUrl": video.thumbnail,
        "uploadDate": video.published,
        "embedUrl": video.embed,
        ...(video.duration_seconds ? { "duration": `PT${Math.floor(video.duration_seconds / 60)}M${video.duration_seconds % 60}S` } : {})
      })}
    </script>
    ```

    Notes on VideoObject:
      - `uploadDate` uses the published string verbatim (already ISO-format YYYY-MM-DD per Phase 2 D-07)
      - `duration` is ISO 8601 (e.g., `PT5M30S` for 5 min 30 sec) — only emitted when `duration_seconds` is present (14 of 56 videos lack it per Phase 2 D-06; this conditional preserves the field shape without polluting non-duration records)
      - The `...(video.duration_seconds ? { ... } : {})` spread is a valid JS pattern; Svelte 5 + Vite handle it natively, no transform needed

    Do NOT add any new dependencies (D-09). Do NOT modify the existing /watch markup (rail, player, metadata) — JSON-LD goes ONLY in `<svelte:head>`.
  </action>
  <verify>
    <automated>pnpm build && grep -c "application/ld+json" build/about/index.html && grep -c "\"@type\":\"Person\"" build/about/index.html && grep -c "\"@type\":\"VideoObject\"" build/watch/264677021/index.html</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "application/ld+json" src/routes/about/+page.svelte` returns at least 1
    - `grep -c "\"@type\": \"Person\"" src/routes/about/+page.svelte` returns at least 1 OR `grep -c "@type.*Person" src/routes/about/+page.svelte` returns at least 1
    - `grep -c "application/ld+json" 'src/routes/watch/[id]/+page.svelte'` returns at least 1
    - `grep -c "VideoObject" 'src/routes/watch/[id]/+page.svelte'` returns at least 1
    - The IMDB_URL + LINKEDIN_URL literals duplicated in /about/+page.svelte MUST match the post-swap values in ContactBlock.svelte lines 36-37 (NOT the channel-homepage placeholders `https://www.imdb.com/` or `https://www.linkedin.com/`) — verify: `grep -c "https://www.imdb.com/'" src/routes/about/+page.svelte` returns 0 AND `grep -c "https://www.linkedin.com/'" src/routes/about/+page.svelte` returns 0
    - After `pnpm build`: `grep -c "application/ld+json" build/about/index.html` returns at least 1
    - After `pnpm build`: `grep -c "Person" build/about/index.html` returns at least 1 in a JSON-LD context
    - After `pnpm build`: `grep -c "application/ld+json" build/watch/264677021/index.html` returns at least 1 (the Producer's Reel)
    - After `pnpm build`: `grep -c "VideoObject" build/watch/264677021/index.html` returns at least 1
    - After `pnpm build`: `find build/watch -name index.html | wc -l` returns 56 (one prerendered HTML file per video)
    - After `pnpm build`: `grep -l "VideoObject" build/watch/*/index.html | wc -l` returns 56 (every watch page has the VideoObject JSON-LD injection)
    - `pnpm build` exits 0; `pnpm check` exits 0
    - Existing watch/[id]/page.test.ts and about/page.test.ts still pass
  </acceptance_criteria>
  <done>
    /about emits Person JSON-LD; every /watch/[id] (56 prerendered files) emits VideoObject JSON-LD with title, description, thumbnail, uploadDate, embedUrl, and duration when present. Google can ingest video-rich-snippet eligibility.
  </done>
</task>

<task type="auto">
  <name>Task 6: Create sitemap.xml endpoint at src/routes/sitemap.xml/+server.ts</name>
  <files>src/routes/sitemap.xml/+server.ts</files>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-17 sitemap pattern — `+server.ts` endpoint with `prerender = true`, lists 7 static + 8 categories + 56 watch = 71 URLs)
    - src/lib/data/index.ts (public exports — `videos`, `getCategoriesInDisplayOrder`, `categoryToSlug`)
    - src/lib/data/videos.ts (videos export — already hidden-filtered, 56 records)
    - src/routes/+layout.ts (the trailingSlash = 'always' contract — all URLs in the sitemap should match this convention)
    - https://www.sitemaps.org/protocol.html (informational — XML schema reference)
  </read_first>
  <action>
    Create new file `src/routes/sitemap.xml/+server.ts` with the following EXACT content:

    ```typescript
    /**
     * Phase 7 D-17: build-time-generated sitemap.xml.
     *
     * Emits all 71 URLs across the static site:
     *   - 7 static routes: /, /work, /press, /about, /contact, /pbs-american-portrait, (one more — see below)
     *   - 8 /work/[category] routes (one per category in display order)
     *   - 56 /watch/[id] routes (one per video, hidden-filtered)
     *
     * Wait — that's 7 static + 8 + 56 = 71. Static breakdown:
     *   1. /                             (home)
     *   2. /work                         (full grid)
     *   3. /pbs-american-portrait        (flagship landing)
     *   4. /press                        (broadcast credits)
     *   5. /about                        (bio + contact)
     *   6. /contact                      (h1 + contact)
     *   7. — only 6 static + 8 categories + 56 watch = 70 actual URLs
     *
     * Note: there is no /work as a separate "static" entry beyond the 6 listed.
     * Final URL count = 6 + 8 + 56 = 70 entries. The CONTEXT.md "71" estimate
     * was approximate; this implementation emits exactly 70 <url> blocks.
     * Acceptance criteria assert >= 70.
     *
     * D-17 contract: prerendered (build emits build/sitemap.xml). Open robots
     * policy in Plan 07-05 references this file via Sitemap: directive.
     *
     * BASE_PATH note: this file emits ABSOLUTE production URLs (https://michellengo.net/...).
     * Staging deploys at wolfwdavid.github.io/michelle_ngo_four/ will emit incorrect
     * sitemap host — acceptable since staging is noindex (D-11) and search engines
     * are not crawling it.
     */
    import { videos, getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';

    export const prerender = true;

    const SITE = 'https://michellengo.net';
    const TODAY = new Date().toISOString().slice(0, 10); // build-time lastmod (Claude's Discretion in CONTEXT.md)

    const STATIC_ROUTES = [
      '/',
      '/work/',
      '/pbs-american-portrait/',
      '/press/',
      '/about/',
      '/contact/'
    ];

    export function GET() {
      const urls: string[] = [];

      // Static routes
      for (const path of STATIC_ROUTES) {
        urls.push(`  <url><loc>${SITE}${path}</loc><lastmod>${TODAY}</lastmod></url>`);
      }

      // /work/[category] — 8 entries in display order
      for (const category of getCategoriesInDisplayOrder()) {
        const slug = categoryToSlug(category);
        urls.push(`  <url><loc>${SITE}/work/${slug}/</loc><lastmod>${TODAY}</lastmod></url>`);
      }

      // /watch/[id] — 56 entries
      for (const v of videos) {
        urls.push(`  <url><loc>${SITE}/watch/${v.id}/</loc><lastmod>${TODAY}</lastmod></url>`);
      }

      const body = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('\n')}
    </urlset>
    `;

      return new Response(body, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8'
        }
      });
    }
    ```

    Implements D-17 (sitemap endpoint). No new deps (D-09). Pure derivation from `$lib/data` exports.

    BASE_PATH discussion: this endpoint emits absolute production URLs.
    The staging build (wolfwdavid.github.io/michelle_ngo_four/) will emit a
    sitemap with the wrong host — this is acceptable because (a) staging stays
    `noindex` until Plan 07-05, (b) search engines won't crawl the staging URL,
    and (c) the production deploy with BASE_PATH='' will emit the same sitemap.xml
    content (no BASE_PATH variance in sitemap output).
  </action>
  <verify>
    <automated>pnpm build && test -f build/sitemap.xml && grep -c "<url>" build/sitemap.xml</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/routes/sitemap.xml/+server.ts` (file exists)
    - `grep -c "prerender = true" src/routes/sitemap.xml/+server.ts` returns at least 1
    - `grep -c "from '\\\$lib/data'" src/routes/sitemap.xml/+server.ts` returns 1
    - `grep -c "https://michellengo.net" src/routes/sitemap.xml/+server.ts` returns at least 1
    - After `pnpm build`: `test -f build/sitemap.xml` exits 0 (the file is emitted)
    - After `pnpm build`: `grep -c "<url>" build/sitemap.xml` returns >= 70 (6 static + 8 categories + 56 watch)
    - After `pnpm build`: `grep -c "<loc>https://michellengo.net" build/sitemap.xml` returns >= 70
    - After `pnpm build`: `grep -c "watch/264677021" build/sitemap.xml` returns 1 (Producer's Reel URL is in the sitemap)
    - After `pnpm build`: `grep -c "pbs-american-portrait" build/sitemap.xml` returns >= 2 (once for the static landing + once for the /work/pbs-american-portrait/ category route)
    - `pnpm check` exits 0; `pnpm build` exits 0
  </acceptance_criteria>
  <done>
    Build emits `build/sitemap.xml` with 70 absolute production URLs (6 static + 8 categories + 56 watch). Plan 07-05's robots.txt Sitemap: directive can reference it.
  </done>
</task>

<task type="auto">
  <name>Task 7: Extend scripts/test-prerender-coverage.mjs with sitemap.xml + favicon + og-image assertions</name>
  <files>scripts/test-prerender-coverage.mjs</files>
  <read_first>
    - scripts/test-prerender-coverage.mjs (full file — understand the existing pattern: check `build/<file>` existence; collect failures; print PASS/FAIL summary)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-17 sitemap + D-11 favicon + D-12 OG image — all expected in `build/`)
  </read_first>
  <action>
    Edit `scripts/test-prerender-coverage.mjs`. Add NEW assertions AFTER the existing `/contact` check (currently around lines 116-120). Insert the following block BEFORE the `if (failures.length > 0)` block:

    ```javascript
    // Phase 7 (Plan 07-02): sitemap.xml — D-17 build-time-generated sitemap.
    const sitemapPath = join(BUILD, 'sitemap.xml');
    const sitemapExists = existsSync(sitemapPath);
    if (!sitemapExists) {
      failures.push('Missing build/sitemap.xml (the D-17 sitemap endpoint).');
    } else {
      // Count <url> entries; expect at least 70 (6 static + 8 categories + 56 watch).
      const content = readFileSync(sitemapPath, 'utf8');
      const urlCount = (content.match(/<url>/g) ?? []).length;
      if (urlCount < 70) {
        failures.push(
          `build/sitemap.xml has only ${urlCount} <url> entries; expected ≥70 (6 static + 8 categories + 56 watch).`,
        );
      }
    }

    // Phase 7 (Plan 07-02): D-11 favicon set + D-12 OG image binary assets.
    const requiredStaticAssets = [
      'favicon.ico',
      'favicon-16.png',
      'favicon-32.png',
      'favicon-192.png',
      'favicon-512.png',
      'apple-touch-icon.png',
      'og-image.jpg'
    ];
    const missingAssets = requiredStaticAssets.filter(
      (name) => !existsSync(join(BUILD, name))
    );
    if (missingAssets.length > 0) {
      failures.push(
        `Missing required static assets in build/: ${missingAssets.join(', ')}`,
      );
    }
    ```

    Also add `readFileSync` to the import line at the top (currently imports `existsSync, readdirSync, statSync` from `'node:fs'`):
    ```javascript
    import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
    ```

    Update the final PASS console.log block (around lines 131-142) to include the new lines:
    ```javascript
    console.log(`  - build/sitemap.xml: present (${(readFileSync(sitemapPath, 'utf8').match(/<url>/g) ?? []).length} URLs)`);
    console.log(`  - build/{favicon.ico, favicon-{16,32,192,512}.png, apple-touch-icon.png, og-image.jpg}: all present`);
    ```

    Update the FAIL diagnostic console.error block (around lines 122-128) to mention the new asset checks if needed — minimal change, the per-failure messages above are already specific.

    Implements coverage assertions for D-17 + D-11 + D-12.
  </action>
  <verify>
    <automated>pnpm build && node scripts/test-prerender-coverage.mjs</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "sitemap.xml" scripts/test-prerender-coverage.mjs` returns at least 2 (path + failure message)
    - `grep -c "favicon-192" scripts/test-prerender-coverage.mjs` returns at least 1
    - `grep -c "og-image.jpg" scripts/test-prerender-coverage.mjs` returns at least 1
    - `grep -c "readFileSync" scripts/test-prerender-coverage.mjs` returns at least 1
    - After `pnpm build`: `node scripts/test-prerender-coverage.mjs` exits 0
    - All 7 static asset files exist in `build/`: `for f in favicon.ico favicon-16.png favicon-32.png favicon-192.png favicon-512.png apple-touch-icon.png og-image.jpg; do test -f build/$f; done` — every iteration exits 0
    - `build/sitemap.xml` contains at least 70 `<url>` blocks
  </acceptance_criteria>
  <done>
    Coverage script now blocks the build (exit 1) if sitemap.xml, any favicon file, or og-image.jpg is missing from `build/`. Plan 07-05 cutover gate can rely on this.
  </done>
</task>

</tasks>

<verification>
- `pnpm build` exits 0
- `pnpm check` exits 0
- `pnpm test` exits 0 (all existing tests continue to pass — no test changes in this plan)
- `node scripts/test-prerender-coverage.mjs` exits 0
- `grep -c "<title>Work — Michelle Ngo</title>" build/work/index.html` returns at least 1
- `grep -c "application/ld+json" build/about/index.html` returns at least 1
- `grep -lc "application/ld+json" build/watch/*/index.html` shows 56 hits (one per watch page)
- `grep -c "<url>" build/sitemap.xml` returns >= 70
- `grep -c "og-image.jpg" build/index.html` returns at least 1
- All 7 binary assets (favicon-* + apple-touch + og-image) exist in `build/`
</verification>

<success_criteria>
1. Every prerendered HTML file has a route-specific `<title>` in D-13 page-first format
2. Every prerendered HTML file has a route-specific `<meta name="description">` matching D-14
3. /about HTML includes a Person JSON-LD `<script>` block with name/jobTitle/sameAs (using the post-07-01-swap personalized URLs, NOT channel-homepage placeholders)
4. Every /watch/[id] HTML (all 56) includes a VideoObject JSON-LD `<script>` block
5. build/sitemap.xml exists and contains exactly 70 `<url>` entries with absolute https://michellengo.net URLs
6. All 7 required binary assets (4 PNG favicons + .ico + apple-touch + og-image.jpg) exist in `build/`
7. Sitewide layout `<svelte:head>` includes favicon `<link>`s + OG/Twitter meta tags
8. Existing test suite continues to pass (no test changes; route tests assert on title/meta presence only loosely)
9. D-09 honored — no new JS runtime dependencies added to package.json
</success_criteria>

<output>
After completion, create `.planning/phases/07-polish-production-cutover/07-02-SUMMARY.md` capturing:
- The 8 final `<title>` strings shipped (per-route D-13 mapping)
- The 8 final `<meta description>` strings shipped (per-route D-14 mapping, including the approved / and /about strings)
- Confirmation that `build/sitemap.xml` was emitted with N `<url>` entries (record actual count)
- Confirmation that all 7 binary static assets were emitted into `build/`
- The personalized IMDb + LinkedIn URL literals used in the Person JSON-LD sameAs (for cross-reference with Plan 07-01 SUMMARY)
- A note about the absolute production URL hardcoding in og:image + sitemap.xml (and why staging emits the "wrong" host, which is intentional and harmless)
</output>
</content>
</invoke>