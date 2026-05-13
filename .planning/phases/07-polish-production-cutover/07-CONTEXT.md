# Phase 7: Polish & Production Cutover - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Tune the existing 7 routes for production and ship them to michellengo.net. No new pages, no new components — Phase 7 measures, fixes, polishes, and cuts over.

In scope:
- Lighthouse-CI perf verification of FOUND-03 (LCP < 2.0s on simulated 4G mobile)
- Hero-image escalation path (`<picture>` + AVIF) IF LCP misses 2s — otherwise no change
- Full favicon set + sitewide OG image + per-page `<title>` / `<meta description>` + JSON-LD on `/about` + each `/watch/[id]`
- The `noindex` / `robots.txt Disallow` flip (Phase 1 D-11 reversal)
- IMDb + LinkedIn personalized-URL swap in `ContactBlock.svelte` (06-HUMAN-UAT carry-over)
- Responsive QA audit: 3 breakpoints × 7 routes = 21 cells, single audit pass → numbered punch list → fix all → ship
- Production cutover: add michellengo.net as a GitHub Pages custom domain (apex) with BASE_PATH='', preserve `wolfwdavid.github.io/michelle_ngo_four/` as the staging URL with BASE_PATH=/<repo>; verify on apex BEFORE DNS swap; DNS-flip = launch event

Out of scope (deferred to v2 or out-of-scope per REQUIREMENTS.md):
- Analytics / Plausible (v2: ANLT-01, ANLT-02)
- Contact form (Out of Scope — `mailto:` sufficient)
- CMS (EDIT-01) / newsletter (EDIT-03) / per-video markdown SEO pages (EDIT-02) — v2
- Search across videos (DISC-01) / filter by year or client (DISC-02) — v2
- 301 redirects from legacy WordPress paths (/About, /Advertising, /Film-TV, /UX-Design, /Publishing, /Social-Transmedia) — clean break, no redirects (static-hosting limitation + audience is fresh inbound)
- Headshot on `/about` (deferred; no asset; revisitable post-launch)
- Resume/CV download
- Looping video hero (Phase 4 deferred; static WebP is the v1 hero)
- PWA manifest / install prompt
- Web fonts (system fonts only in Phase 7)
- Hand-authored non-video press items (Variety / Billboard / interviews) — defer until they exist
- Real-device test on physical Android — Chrome DevTools mobile emulation is the contract for Android; real-iOS spot-check is the only required hardware pass

</domain>

<decisions>
## Implementation Decisions

### Hosting & cutover plan
- **D-01:** **Production host = GitHub Pages with `michellengo.net` as a custom domain.** Carries Phase 1 D-05 override forward (no migration to Cloudflare Pages / Vercel). Same `actions/deploy-pages@v4` workflow already proven on `wolfwdavid.github.io/michelle_ngo_four/`. Add the custom domain via the repo's Pages settings + a `CNAME` file in `static/` containing `michellengo.net` so the apex domain is asserted in the build artifact. Verify HTTPS cert provisioning before flipping DNS.
- **D-02:** **BASE_PATH split per environment.** Production build on `michellengo.net` runs with `BASE_PATH=''` (apex domain serves from root). Existing `wolfwdavid.github.io/michelle_ngo_four/` staging URL keeps working with `BASE_PATH=/michelle_ngo_four` per the current `deploy.yml`. Implementation: a separate production workflow (or a workflow-dispatch trigger) builds without setting `BASE_PATH`. All internal links already wrap through `$app/paths` `base` (Phase 1 D-08 + Phase 3 D-23), so this is a build-time env-var change, NOT a source-code change.
- **D-03:** **Cutover sequence = verify-then-flip, with DNS-revert as rollback.**
  1. Add `michellengo.net` (apex) and `www.michellengo.net` to GitHub Pages custom domain config; commit the `static/CNAME` file.
  2. GitHub provisions a Let's Encrypt cert for the unverified domain (still resolves to the old WordPress site at this point — DNS unchanged).
  3. Confirm GH Pages reports the cert is ready + the apex URL serves the new SvelteKit build (test via `--resolve` flag in curl, or a temporary hosts-file entry).
  4. Run the full FOUND-03 + 21-cell QA audit on the apex URL.
  5. Schedule the DNS cutover at a low-traffic window. Switch the nameservers/A-records at the registrar from WordPress.com to GitHub Pages' apex IPs (`185.199.108.153 / .109.153 / .110.153 / .111.153`) + a CNAME `www → wolfwdavid.github.io`.
  6. Monitor DNS propagation; site is live when the apex resolves to GH Pages everywhere material.
  7. **Rollback** = revert the registrar DNS records to WordPress.com's targets (TTL-bound; set TTL to 300s before the swap to minimize rollback window).
- **D-04:** **Clean break from WordPress paths — no 301 redirects.** Old WordPress paths (`/About`, `/Advertising`, `/Film-TV`, `/UX-Design`, `/Publishing`, `/Social-Transmedia`, etc.) just 404 after DNS swap. Justification: (a) GitHub Pages static hosting can't do server-side 301s, (b) the audience is hiring-producer inbound (fresh discovery via reel/press), not Michelle's existing readership returning to bookmarked WordPress posts, (c) legacy disciplines are explicitly Out of Scope per REQUIREMENTS.md. The existing `src/routes/+error.svelte` 404 surface is sufficient.
- **D-05:** **Pre-cutover blocker checklist (must be GREEN before DNS flip):**
  - IMDb personalized URL swap (`ContactBlock.svelte` line 36) — currently `https://www.imdb.com/` channel homepage; swap to Michelle's personalized profile URL (06-HUMAN-UAT.md test 1)
  - LinkedIn personalized URL swap (`ContactBlock.svelte` line 37) — currently `https://www.linkedin.com/` channel homepage; swap to Michelle's personalized profile URL (06-HUMAN-UAT.md test 1)
  - All Phase 7 fix-list items resolved (per D-15)
  - Lighthouse-CI LCP gate passing (per D-07)
  - HTTPS cert provisioned on apex
  - Tested apex URL with hosts-file override OR `curl --resolve` BEFORE flipping DNS
- **D-06:** **Headshot stays deferred.** No new asset in Phase 7 unless Michelle provides one between now and cutover. Bio + ContactBlock layout on `/about` already ships without it. If a headshot arrives during Phase 7, planner adds a small `<picture>` + slot in `/about/+page.svelte` as an in-scope addition (single-file change); otherwise no action.

### Perf budget & verification
- **D-07:** **Pass metric = Lighthouse mobile LCP < 2.0s on the deployed production URL.** Run Lighthouse with the mobile preset + Slow 4G throttle against `michellengo.net` (pre-DNS-flip, via `--resolve` host trick) **AND** against `michellengo.net/work`, `/watch/<reel-id>`, `/pbs-american-portrait`, `/press`. LCP target is on `/` specifically (hero is the LCP element); other routes report-but-don't-block. Captured as a JSON report committed to `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` for traceability. Single-number go/no-go gate.
- **D-08:** **Hero polish escalation rule (measure-first).** Current hero is a 15.4KB WebP with `<link rel="preload">` + `fetchpriority="high"` + `loading="eager"` (Phase 4 D-04..D-07). If Lighthouse measures LCP < 2.0s on `/`, **ship as-is** — no `<picture>`, no AVIF, no portrait crop. If LCP comes in over 2.0s, escalate in this order: (a) add AVIF variant via `<picture>` + WebP fallback, (b) add mobile portrait crop, (c) reconsider featured-grid `eager={true}` flag per Phase 4 D-22 (drop 8 thumbnail fetches off the critical path). Honors Phase 4 D-04 "Phase 7 may revisit with <picture>+AVIF if FOUND-03 budget demands it" verbatim. Avoids preemptive complexity.
- **D-09:** **No new JS runtime deps in Phase 7.** No icon library, no analytics SDK, no animation library, no web fonts, no client-side router enhancements. Current first-load JS is SvelteKit runtime + a handful of `$effect`s (TopNav scroll-aware on `/`); that's the budget. System font stack everywhere — current Tailwind v4 default. Phase 7 planner reports actual JS bundle size in the verification doc; no enforcement mechanism beyond "no new deps".
- **D-10:** **CLS is implicitly bounded by `aspect-video` containers on every card + hero.** No explicit CLS budget set (Phase 3 D-10 + D-16 already lock thumb dimensions via `aspect-video` wrapper). If the 21-cell QA audit (D-11) catches a layout shift, it lands on the fix list per D-15.

### Production metadata & assets
- **D-11:** **Favicon set = wordmark-derived multi-size.** Generate `favicon.ico` (16+32 multi-resolution), `favicon-192.png` (Android Chrome), `favicon-512.png` (PWA install — kept even though no manifest, browsers still honor), `apple-touch-icon.png` (180×180 for iOS home screen). Source: `MN` letter-mark or compact wordmark in white-on-neutral-950 (matches site chrome). Drop in `static/`; meta `<link>` tags in `src/routes/+layout.svelte` `<svelte:head>`. **No `manifest.json` / no PWA install prompt** — portfolio doesn't justify it. Replaces the existing `static/favicon.png` (which stays as a fallback).
- **D-12:** **OG / Twitter card = sitewide image + per-page `<title>` / `<meta description>`.** One OG image (1200×630, JPG or WebP) used on every route via `<meta property="og:image">` in `+layout.svelte`. Image source: a 1200×630 crop of the existing hero poster (`src/lib/assets/hero-poster.webp`), with the wordmark optionally composited in. Twitter `summary_large_image` card with the same image. Per-page differentiation via `<title>` (D-13) + `<meta name="description">` written for each route (D-14). One OG image to maintain; producers sharing any URL in iMessage/Slack get a recognizable preview.
- **D-13:** **Per-page `<title>` format: `<Page> — Michelle Ngo`.** Concrete strings:
  - `/` → `Michelle Ngo` (home stays brand-only)
  - `/work` → `Work — Michelle Ngo`
  - `/work/[category]` → `<Category Name> — Michelle Ngo` (e.g., `PBS American Portrait — Michelle Ngo`, `Promos & Trailers — Michelle Ngo`)
  - `/watch/[id]` → `<Video title> — Michelle Ngo` (uses `video.title` from the load function)
  - `/pbs-american-portrait` → `PBS American Portrait — Michelle Ngo`
  - `/press` → `Press — Michelle Ngo`
  - `/about` → `About — Michelle Ngo`
  - `/contact` → `Contact — Michelle Ngo`

  Implementation: per-route `<svelte:head><title>...</title></svelte:head>` overrides the layout-level `<title>Michelle Ngo</title>`. Confirmed SvelteKit picks the deepest `<title>`.
- **D-14:** **Per-page `<meta name="description">`.** One-line descriptions per route:
  - `/` → "Filmmaker and producer. PBS American Portrait, HBO Max, Hulu, U2 Sphere broadcast credits." (or planner-tuned ≤155 chars)
  - `/work` → "All 56 videos by filmmaker Michelle Ngo, organized by category."
  - `/work/[category]` → "<count> videos by Michelle Ngo in <Category Name>."
  - `/watch/[id]` → first ~150 chars of `video.description` (or `video.title` + " — by Michelle Ngo" if description is empty per Phase 2 D-06 optional field)
  - `/pbs-american-portrait` → "Michelle Ngo's PBS American Portrait work: 18 short documentary portraits broadcast on PBS."
  - `/press` → "Broadcast credits: HBO Max, HBO, PBS, ABC News, U2, Amazon News, Music Box, and more."
  - `/about` → first ~150 chars of the approved bio
  - `/contact` → "Reach Michelle Ngo by email or phone."
- **D-15:** **JSON-LD structured data: Person on `/about` + VideoObject on each `/watch/[id]`.**
  - `/about` injects a single `<script type="application/ld+json">` with `Person` (name="Michelle Ngo", jobTitle="Filmmaker, Producer", sameAs=[IMDb URL, LinkedIn URL, Vimeo URL] using the same URLs from `ContactBlock.svelte` after the D-05 swap)
  - Each `/watch/[id]` injects `VideoObject` (name=video.title, description=video.description, thumbnailUrl=video.thumbnail, uploadDate=video.published, embedUrl=video.embed, duration=video.duration in ISO 8601 if available)
  - 56 VideoObject injections happen automatically via the `/watch/[id]` `+page.svelte` template — single source, no per-video maintenance
  - Validates against schema.org; eligible for video-rich snippets in Google search results
- **D-16:** **The `noindex` / `robots.txt` flip is its own atomic commit BEFORE the DNS swap (Phase 1 D-11 reversal).** Two edits in one commit:
  1. `src/routes/+layout.svelte` line 14: remove the `<meta name="robots" content="noindex, nofollow" />` (or change to `index, follow` if explicit; preference is to remove and rely on default)
  2. `static/robots.txt` content: replace `User-agent: *\nDisallow: /` with `User-agent: *\nAllow: /\nSitemap: https://michellengo.net/sitemap.xml` (only emit the Sitemap directive if a sitemap is actually generated per D-17)
  This is the last commit BEFORE the DNS swap so search engines see the open robots policy from the first crawl on the new domain.
- **D-17:** **Sitemap.xml: build-time generated, prerendered.** Single `src/routes/sitemap.xml/+server.ts` (or `sitemap.xml/+page.ts` with a custom load that returns XML — planner picks; the SvelteKit-canonical pattern is an endpoint with `prerender = true`). Lists all 7 page routes + 8 `/work/[category]` slugs + 56 `/watch/[id]` URLs + the PBS landing = ~72 entries. Trivial to maintain (derived from `videos.json` + `getCategoriesInDisplayOrder()`). Honors the `Sitemap:` directive in the new robots.txt per D-16.

### Responsive QA matrix & polish scope
- **D-18:** **Test matrix = 3 breakpoints × 7 routes = 21 cells.** Walk every public route at mobile (≤640px), tablet (~768px), desktop (≥1280px). Routes:
  1. `/` (hero + featured grid)
  2. `/work` (56-card grid)
  3. `/work/[any-category]` (use `/work/pbs-american-portrait/` as the canonical sample)
  4. `/watch/[any-id]` (use the Producer's Reel id as the canonical sample)
  5. `/pbs-american-portrait` (flagship landing)
  6. `/press` (vertical credit list)
  7. `/about` + `/contact` (prose pages — combined since same layout)

  21 cells produces a screenshot grid documented in `07-QA-MATRIX.md` (or per-cell entries in `07-HUMAN-UAT.md`). Each cell gets a pass/fix decision.
- **D-19:** **Methodology = Chrome DevTools primary + real iOS spot-check.** Walk the 21-cell matrix in Chrome DevTools mobile emulation (fastest iteration, scriptable, captures network throttle for FOUND-03 alignment). At the end, ONE real-iPhone pass through `/`, `/work`, `/watch/[reelId]`, `/pbs-american-portrait` to catch iOS Safari-only issues (`100dvh` URL-bar handling, momentum scroll, tap-target hit zones, blur-up timing). Real-Android is NOT required — Chrome DevTools mobile emulation is the contract for Android. Mirrors Phase 4 04-HUMAN-UAT.md methodology that already validated successfully.
- **D-20:** **Fix bar = pixel-polish-everything, bounded by single-pass audit.** Every visible imperfection caught during the 21-cell sweep — functional bugs (horizontal scroll, broken type, illegible text, tap targets <44px, layout shift > 0.1 CLS, broken images, 404s from internal nav) AND cosmetic nits (spacing, color saturation, type-scale tweaks, alignment) — is logged as a numbered punch-list entry. Polish scope is high; bounded by the rule: **ONE audit pass → fix all listed items → ship.** No iterative audit-fix-audit loop (avoids polish-paralysis). The numbered punch list IS the contract for "Phase 7 fix-list resolved" in D-05.

### Claude's Discretion
- **Where to author the 1200×630 OG image** — recommend a JPG export of a crop of `src/lib/assets/hero-poster.webp` at 1200×630, with the wordmark optionally composited. Planner can do this in a one-shot pass (`scripts/build-og-image.mjs` or just author manually); no design tool dependency. If wordmark compositing complicates, just ship the cropped poster as-is.
- **Favicon authoring approach** — recommend a single 512×512 master white-on-neutral-950 `MN` letter-mark or compact wordmark, then export to ico (16+32), 192, 512, apple-touch (180) sizes. Tooling: any image editor + `realfavicongenerator.net` is the canonical helper. Drop outputs in `static/`; planner picks the exact font/letter rendering.
- **Description copy tuning** — D-14 sets the shape (one line, ≤155 chars). Planner can tune wording for each route; the schema is locked but the words aren't.
- **Sitemap implementation pattern** — recommend `src/routes/sitemap.xml/+server.ts` returning a manually-templated XML string. Avoids any new dep. Planner can opt for a tiny `sitemap` helper if the manual template gets hairy.
- **Lighthouse-CI tooling** — recommend `lhci autorun` against the prod URL via GH Actions (a simple manual run is fine too). Either way, the JSON report lands in `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json`. If `lhci` adds dep friction, ditch it and use `npx lighthouse <url> --preset=desktop` against staging + mobile against prod, captured by hand.
- **www → apex redirect direction** — recommend canonical = apex (`michellengo.net`), `www.michellengo.net` 301s to apex via GH Pages' built-in custom-domain config. (GH Pages handles this automatically when both are added; planner just confirms it in the dashboard.)
- **VideoObject duration field handling** — recommend formatting `video.duration` to ISO 8601 (`PT5M30S`) IF the seed value is parseable; otherwise omit the field. Planner inspects `videos.json` for the current shape during plan-phase.
- **Sitemap update cadence after launch** — recommend `lastmod` field equals the build timestamp on every route (one cheap line); no per-video changelog tracking. Site rebuilds on every push, sitemap updates automatically.
- **Whether to also flip `<meta name="googlebot">`** — recommend NO. Removing `noindex, nofollow` from the generic `robots` meta tag (D-16) is sufficient; no per-bot override needed.
- **CNAME file commit timing** — recommend committing `static/CNAME` containing `michellengo.net` in the SAME commit that adds the GH Pages custom-domain config in the repo settings, so the next build artifact carries the assertion. Avoids the GH-Pages "Save and lose custom domain on next deploy" footgun.

### Folded Todos
*None — `gsd-tools todo match-phase 7` returned `todo_count: 0`.*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 7 requirements + success criteria
- `.planning/REQUIREMENTS.md` §Foundation — **FOUND-03** (only requirement mapped to Phase 7): user sees production build under 2s on a 4G connection, no client-side data fetch on first paint
- `.planning/ROADMAP.md` §Phase 7: Polish & Production Cutover — goal, depends-on Phases 1–6, 4 success criteria, 3 seed plans (07-01 responsive QA / 07-02 perf / 07-03 cutover)

### Project-wide context
- `.planning/PROJECT.md` Constraints — "Performance: reel-led hero must feel instant; thumbnails should blur-up rather than pop-in" (drives D-07 LCP gate + D-08 hero-polish escalation rule); "Hosting: static-export-friendly; no Node server runtime required" (locks GitHub Pages choice per D-01); "Domain: michellengo.net stays on WordPress.com until cutover; build against staging URL" (drives D-03 cutover sequence + D-02 BASE_PATH split)
- `.planning/PROJECT.md` Key Decisions table — **D-05 override: GitHub Pages instead of Cloudflare Pages** (Phase 1 decision carried forward to Phase 7 production cutover per D-01); **Static-export-friendly hosting** (no edge functions / no Node server)
- `.planning/PROJECT.md` Context §Existing site — current contact info preserved verbatim in `ContactBlock.svelte`; legacy WordPress nav (Home, Advertising, Film-TV, UX Design, Social & Transmedia, Publishing, About) — drives D-04 clean-break decision
- `.planning/REQUIREMENTS.md` §Out of Scope — Analytics, Contact form, CMS, Newsletter, i18n, Search/filter, Migrating legacy disciplines — all stay out for Phase 7
- `.planning/REQUIREMENTS.md` §v2 — Plausible analytics (ANLT-01/02), CMS (EDIT-01..03), Search/Filter (DISC-01/02), Contact form (CONT2-01) — deferred backlog

### Pre-cutover blocker tracking
- `.planning/phases/06-press-about-contact/06-HUMAN-UAT.md` — **Test 1: IMDb + LinkedIn URL swap** is the canonical pre-cutover blocker tracker. Phase 7 D-05 inherits this; resolving the test = ungating DNS swap. Test command: `pnpm test ContactBlock`.
- `.planning/STATE.md` Blockers/Concerns — current single concern is the IMDb/LinkedIn swap (carried per Phase 6 deviation). Phase 7 closes this.
- `src/lib/components/ContactBlock.svelte` lines 36–37 + the `NOTE` comment at the top of the file — single source of truth for the swap; one-line edit per URL; no test changes needed (assertions are domain-contains checks)

### Source files & current state
- `src/routes/+layout.svelte` — currently emits `<meta name="robots" content="noindex, nofollow" />` (Phase 1 D-11) at line 14; Phase 7 D-16 removes this in the same commit as the robots.txt flip. Also where favicon `<link>` tags + OG `<meta>` tags + sitewide `<title>` live.
- `static/robots.txt` — currently `User-agent: *\nDisallow: /`; Phase 7 D-16 replaces with `Allow: /` + Sitemap directive
- `static/favicon.png` — current single PNG; Phase 7 D-11 adds the multi-size set alongside
- `static/.nojekyll` — existing GH Pages config; do not remove
- `static/CNAME` — DOES NOT EXIST yet; Phase 7 D-01 creates it containing `michellengo.net`
- `.github/workflows/deploy.yml` — currently builds with `BASE_PATH: /${{ github.event.repository.name }}` (line 41); Phase 7 D-02 adds a production variant that builds without BASE_PATH (or sets it to empty) when deploying to the apex domain
- `svelte.config.js` lines 14–16 — `paths.base: process.env.BASE_PATH ?? ''` already supports per-env override; no source change needed for D-02
- `src/lib/assets/hero-poster.webp` — 15.4KB content-hashed WebP (Phase 4 D-04); Phase 7 D-08 only modifies this IF Lighthouse measures LCP > 2.0s
- `src/routes/+error.svelte` — current 404 surface; Phase 7 D-04 leaves it unchanged (clean break, no per-URL redirect logic)
- `src/routes/watch/[id]/+page.svelte` — Phase 7 D-15 adds VideoObject JSON-LD injection here; site of one of two structured-data injection points
- `src/routes/about/+page.svelte` — Phase 7 D-15 adds Person JSON-LD injection here

### Prior phase context (carry-forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — **D-11 `noindex` + robots.txt Disallow flip happens in Phase 7** (canonical reversal point); **D-05 hosting override to GitHub Pages** carries forward to production cutover (D-01); **D-08 staging URL = wolfwdavid.github.io/michelle_ngo_four/** stays as the staging URL after cutover per D-02; **adapter-static strict:true** means every Phase 7 metadata/sitemap addition must prerender successfully; **`BASE_PATH` env var** is the existing per-environment hook D-02 exploits
- `.planning/phases/02-data-layer/02-CONTEXT.md` — `Video.description` is `z.string().optional()` (Phase 7 D-14 description copy + D-15 VideoObject must handle the absent case); `Video.duration` is the field VideoObject consumes (D-15); `Video.published` is the field VideoObject's `uploadDate` consumes
- `.planning/phases/03-grid-filter-watch/03-CONTEXT.md` — Phase 3 D-10 `aspect-video` thumbnail containers + Phase 3 D-16 blur-up fade-in already lock thumbnail dimensions (drives D-10 implicit CLS bound); Phase 3 D-19 heading hierarchy + Phase 3 D-23 max-w-7xl container preserved across all Phase 7 metadata additions; Phase 3 D-43 placeholder routes were already replaced in Phases 5–6, so all 7 routes Phase 7 audits carry real content
- `.planning/phases/04-reel-led-home/04-CONTEXT.md` — **D-04: "Phase 7 may revisit with `<picture>` + AVIF if FOUND-03 budget demands"** is the canonical anchor for D-08 hero-polish escalation rule; **D-07: `loading="eager"` + `fetchpriority="high"`** on the hero already in place (Phase 7 inherits); **D-22: featured grid `eager={true}`** is the escalation lever (D-08 step c) if AVIF + portrait crop don't clear LCP; **D-13/D-14 scroll-aware-on-`/`-only TopNav** stays intact through Phase 7 (responsive QA audit verifies on every route, no behavior change)
- `.planning/phases/05-pbs-american-portrait/05-CONTEXT.md` — `/pbs-american-portrait/` is one of the 7 routes in the 21-cell QA matrix per D-18; PBS landing's verbatim copy + 18-card grid + per-card "See on PBS →" badges all stay intact
- `.planning/phases/06-press-about-contact/06-CONTEXT.md` — `<ContactBlock />` is the single-file site of the D-05 IMDb/LinkedIn swap; the `mailto:` literal + `tel:` literal stay verbatim; **D-07 `noindex` stays through Phase 6 per Phase 1 D-11 → flipped in Phase 7 per D-16**; the Footer carries forward unchanged (D-29 hardcoded `© 2026` literal stays the same)

### Design language (light-touch in Phase 7)
- `_prep/02-references.md` — design references already locked in earlier phases; Phase 7 doesn't introduce new visual decisions, only enforces consistency
- `_prep/01-current-site.md` — `mynogo [at] gmail.com`, `(917) 566-1976`, IMDb + LinkedIn linked — content already wired in Phase 6; Phase 7 D-05 closes the URL-swap loop

### External references (planner consults at plan-phase)
- **GitHub Pages custom domain docs** — https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site (apex domain A records, www CNAME, HTTPS enforcement, CNAME file expectations) — D-01 + D-03 cutover sequence
- **schema.org Person + VideoObject** — https://schema.org/Person, https://schema.org/VideoObject — D-15 JSON-LD shape reference
- **OG protocol** — https://ogp.me/ — D-12 OG image dimensions + property names
- **Lighthouse CI** — https://github.com/GoogleChrome/lighthouse-ci — D-07 CI integration if planner opts in (otherwise plain `npx lighthouse`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/routes/+layout.svelte` `<svelte:head>` block** — already the home for the sitewide `<title>` + `<meta robots>`. Phase 7 D-11 favicons + D-12 OG meta + D-16 robots flip all extend this same head block. One file to edit.
- **`src/lib/assets/hero-poster.webp`** — already content-hashed + preloaded (Phase 4); Phase 7 D-12 derives the OG image from a 1200×630 crop of this asset (no new high-res source needed). Phase 7 D-08 may augment with AVIF/portrait variants ONLY if LCP fails.
- **`src/lib/data/{videos,categories}.ts`** — `videos` + `getCategoriesInDisplayOrder()` exports feed both the D-17 sitemap (~72 URLs) AND the D-15 VideoObject JSON-LD payload (56 records). Zero new data authoring; both features are pure derivations of existing data.
- **`src/lib/components/ContactBlock.svelte`** — D-05 IMDb + LinkedIn URL swap is two-line edit on this one file; no test changes (existing assertions are domain-contains).
- **`$app/paths` `base`** — every internal link already wraps through this; D-02 BASE_PATH-per-environment split works because every page already prepends `${base}/...` to links.
- **`adapter-static` + `prerender = true` + `trailingSlash = 'always'`** — Phase 7 D-17 sitemap endpoint + D-15 JSON-LD inject + D-13/D-14 per-page title/description all prerender at build time. No runtime needed.
- **Existing `.github/workflows/deploy.yml`** — already builds + uploads-artifact + deploys; D-02 needs only an additional workflow (or workflow_dispatch input) that builds without setting `BASE_PATH` for production. The `actions/deploy-pages@v4` config doesn't change.

### Established Patterns
- **`<svelte:head>` for per-route head edits** — Phase 7 D-13 (titles) + D-14 (descriptions) + D-15 (JSON-LD `<script type="application/ld+json">`) follow this pattern. SvelteKit picks the deepest title.
- **`+server.ts` endpoints for non-HTML routes** — Phase 7 D-17 sitemap.xml uses `src/routes/sitemap.xml/+server.ts` with `prerender = true` so the build emits `build/sitemap.xml`. Phase 7 may also use this pattern for the favicon if any size needs to be served from a route (but D-11 favicons live in `static/`, served as-is).
- **Vitest workspace (node + jsdom)** — Phase 7 may add a Lighthouse-CI integration test (workflow-only, not Vitest) and a sitemap unit test (node project, asserts URL count and shape). No new test infrastructure.
- **Phase 5 D-11 verbatim-copy-via-PLAN-checkpoint pattern** — Phase 7 D-14 per-page descriptions can use this if any route's description copy needs user approval (especially `/` and `/about`). Lower priority than Phase 6 bio approval since descriptions are SEO-only.
- **Pinned-exact deps + pnpm@11** — D-09 "no new JS deps" reinforces this; no new entries in `package.json` for Phase 7 unless something on the fix list requires it.

### Integration Points
- **`src/routes/+layout.svelte`** — Phase 7 EDITS this file: removes `noindex` meta (D-16), adds favicon `<link>`s (D-11), adds sitewide OG `<meta property="og:*">` + Twitter card tags (D-12). One edit batch.
- **`static/robots.txt`** — Phase 7 REPLACES the content (D-16). One-file edit.
- **`static/CNAME`** — Phase 7 CREATES this file containing `michellengo.net` (D-01). One-line file.
- **`static/favicon-{16,32,192,512}.png` + `static/apple-touch-icon.png` + `static/favicon.ico`** — Phase 7 CREATES these assets (D-11). Authoring outside the codebase; commit binaries.
- **`static/og-image.{jpg,webp}`** — Phase 7 CREATES this 1200×630 OG image asset (D-12). Authored from the existing hero-poster.webp.
- **`src/routes/sitemap.xml/+server.ts`** — Phase 7 CREATES this new endpoint (D-17). ~30–50 LOC, iterates `videos` + categories + static routes, returns XML. `prerender = true` exported.
- **`src/routes/+page.svelte`** — Phase 7 may EDIT to add per-page description (D-14) and confirm title behavior (D-13 default).
- **`src/routes/work/+page.svelte`, `src/routes/work/[category]/+page.svelte`, `src/routes/watch/[id]/+page.svelte`, `src/routes/pbs-american-portrait/+page.svelte`, `src/routes/press/+page.svelte`, `src/routes/about/+page.svelte`, `src/routes/contact/+page.svelte`** — Each EDITED to add `<svelte:head><title>...</title><meta name="description" content="..."/></svelte:head>` per D-13 + D-14. `/watch/[id]` AND `/about` additionally inject JSON-LD per D-15.
- **`src/lib/components/ContactBlock.svelte` lines 36–37** — Phase 7 EDITS the IMDb + LinkedIn `href` values to personalized URLs (D-05). Single-line change each.
- **`.github/workflows/deploy.yml`** — Phase 7 EDITS this OR adds a `deploy-production.yml` to build without `BASE_PATH` for the apex deploy (D-02).
- **`scripts/test-prerender-coverage.mjs`** — Phase 7 EXTENDS to assert `build/sitemap.xml` exists (D-17), `build/robots.txt` content is the open-policy form (D-16), `build/CNAME` matches (D-01), and all favicon files emitted (D-11).
- **`.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json`** — Phase 7 CREATES this report artifact (D-07). Committed for traceability.
- **`.planning/phases/07-polish-production-cutover/07-QA-MATRIX.md` (or 07-HUMAN-UAT.md)** — Phase 7 CREATES this 21-cell punch-list document (D-18, D-20). Each cell pass/fix decision; numbered fix list drives the remaining work.

</code_context>

<specifics>
## Specific Ideas

- **"Verify on prod URL first, then DNS swap" is the launch ritual** (D-03). DNS is the last lever pulled. Everything else — Lighthouse, 21-cell QA, IMDb/LinkedIn swap, favicon, OG image, JSON-LD, sitemap, robots flip — is finishable on the apex URL pre-DNS via `curl --resolve` or `/etc/hosts` override. The DNS flip is just "make the audience see what we already verified."
- **Pixel-polish-everything bounded by single-pass audit (D-20)** is the user-picked balance between "ship if no functional bugs" (too loose for launch) and "iterative perfectionism" (open-ended). The 21-cell sweep produces a numbered punch list; the list IS the contract.
- **Lighthouse mobile LCP < 2.0s** (D-07) is the single number that decides whether the hero needs `<picture>` + AVIF (D-08). Measure first. Phase 4 D-04 explicitly handed this decision to Phase 7 — Phase 7 honors that handoff.
- **Sitewide OG image + per-page titles** (D-12 + D-13) is the cheapest meaningful metadata coverage. One 1200×630 file maintains; ~10 per-route `<title>` strings differentiate.
- **Person + VideoObject JSON-LD** (D-15) gives `/watch/[id]` pages video-rich-snippet eligibility in Google search, and `/about` consolidates Michelle's identity for knowledge-panel candidacy. 56 + 1 injections, all derived from existing data.
- **Clean break from WordPress legacy paths** (D-04) signals the audience is fresh-inbound producers, not returning WordPress readers. The 404 page (existing `+error.svelte`) is sufficient.

</specifics>

<deferred>
## Deferred Ideas

### Considered but rejected for Phase 7
- **Migrate hosting to Cloudflare Pages or Vercel** — rejected per D-01 (GitHub Pages + custom domain is the cheapest path; the CI/CD already works; original Cloudflare target was overridden in Phase 1 D-05 for the same reason)
- **Hard DNS swap with fix-forward** — rejected per D-03 (verify-then-flip is lower-risk for a one-shot launch event; rollback by reverting DNS records)
- **WordPress staying live behind a temp subdomain (old.michellengo.net)** — rejected per D-03 (no inbound traffic to legacy WP paths justifies the parallel state)
- **301 redirects from old WordPress paths** — rejected per D-04 (static-hosting limitation + audience is fresh inbound; legacy disciplines Out of Scope)
- **WebPageTest from a real ISP location** — rejected per D-07 (Lighthouse-CI is reproducible + scriptable; WPT is a one-shot verification — useful complement but not the gate)
- **Real iPhone on actual 4G as the perf gate** — rejected per D-07 (unreproducible; can't re-run conditions when fixing); real iOS spot-check stays as a complement to Lighthouse mobile per D-19
- **FCP + LCP two-gate or Lighthouse score ≥ 90** — rejected per D-07 (LCP < 2.0s is the single dial directly mapping FOUND-03 wording; cleaner go/no-go)
- **Preemptive `<picture>` + AVIF on the hero** — rejected per D-08 (measure-first; only escalate if Lighthouse fails the 2.0s gate); honors Phase 4 D-04 verbatim handoff
- **One web font for wordmark + system fonts for body** — rejected per D-09 (no new JS deps + no new fonts; system stack stays); revisitable in v2 if cosmetic-upgrade demand emerges
- **Per-page OG images** — rejected per D-12 (one sitewide OG image is the cheapest meaningful coverage; per-page differentiation handled via `<title>` + description)
- **OG only on `/`, omit on subpages** — rejected per D-12 (subpages share well too; sitewide is one extra layout-level meta block)
- **Brand-first title format ("Michelle Ngo — Work")** — rejected per D-13 (page-first preserves tab-strip scannability when titles truncate)
- **Sitewide `<title>Michelle Ngo</title>` without per-route override** — rejected per D-13 (bad SEO + bad browser-history scanability)
- **Person-only JSON-LD (skip VideoObject)** — rejected per D-15 (video-rich-snippet eligibility on 56 pages is a force multiplier for the producer audience)
- **Skip JSON-LD entirely** — rejected per D-15 (low-cost addition with measurable SEO upside; both schemas derive from existing data)
- **Minimum favicon set (just PNG + apple-touch)** — rejected per D-11 (multi-size set is one-time authoring + ships once); apple-touch alone misses Android Chrome's home-screen icon path
- **Keep `static/favicon.png` only** — rejected per D-11 (unpolished on iOS home screen)
- **PWA manifest / install prompt** — rejected per D-11 (portfolio doesn't justify; Out of Scope-adjacent)
- **Real-user-scenario QA instead of grid sweep** — rejected per D-18 (21 cells is exhaustive + bounded; scenario walks can come back in a post-launch retro if friction is reported)
- **DevTools-only QA** — rejected per D-19 (iOS Safari has Chrome-undetectable bugs; Phase 4 already caught `100dvh` this way)
- **Real-devices-only QA (iPhone + Android)** — rejected per D-19 (unreproducible iteration loop on fixes; real-iOS as spot-check is the compromise)
- **"Ship if no functional bugs" (defer all polish)** — rejected per D-20 (too loose for the launch event; pixel-polish-everything is the user's higher bar)
- **Iterative audit-fix-audit polish loops** — rejected per D-20 (open-ended; risks launch slipping on subjective "cleanliness"); single audit pass + fix list is the bound

### Deferred to v2 / post-launch
- **Plausible analytics** — REQUIREMENTS.md ANLT-01, ANLT-02 v2
- **Contact form on /contact** — REQUIREMENTS.md CONT2-01 v2; `mailto:` sufficient for v1
- **CMS-backed editing** — REQUIREMENTS.md EDIT-01 v2; PR-based edits acceptable
- **Per-video markdown pages for SEO depth** — REQUIREMENTS.md EDIT-02 v2 (JSON-LD VideoObject per D-15 is the v1 SEO bridge)
- **Newsletter capture** — REQUIREMENTS.md EDIT-03 v2
- **Search across videos by title/description** — REQUIREMENTS.md DISC-01 v2
- **Filter by year or client** — REQUIREMENTS.md DISC-02 v2
- **Real headshot on /about** — Phase 6 D-20 deferred; revisitable post-launch if Michelle provides one (single-file change to add)
- **Resume/CV PDF download CTA** — Phase 6 D-20 deferred; IMDb is canonical filmography for v1
- **Hand-authored non-video press (Variety / Billboard / interview features)** — defer until such press exists
- **Looping reel-video hero** — Phase 4 deferred; static WebP is v1; revisit only if a producer test reveals a meaningful uplift
- **Per-page OG image variants** — Phase 7 D-12 deferred; sitewide is the v1 baseline
- **Web font for wordmark** — Phase 7 D-09 deferred; system fonts ship for v1
- **CLS budget enforcement mechanism** — Phase 7 D-10 deferred; aspect-video containers already bound CLS implicitly
- **JS bundle size enforcement** — Phase 7 D-09 deferred; "no new deps" is the soft policy
- **Sitemap with per-video `lastmod`** — D-17 uses build-timestamp `lastmod` for all entries; per-video changelog tracking deferred
- **301 redirects from legacy WordPress paths** — D-04 clean break; revisit only if specific inbound-link telemetry shows it would help (no telemetry in v1, so this is purely speculative)
- **Real-Android device test pass** — D-19 deferred (DevTools mobile emulation is the contract for Android in Phase 7)

### Out of scope (REQUIREMENTS.md locked)
- **Mobile native app** — Out of Scope
- **i18n / translated metadata** — Out of Scope (English-only v1)
- **Real-time editing for bio / videos / press** — Out of Scope

### Reviewed Todos (not folded)
*None — `gsd-tools todo match-phase 7` returned `todo_count: 0`. No deferred review entries.*

</deferred>

---

*Phase: 07-polish-production-cutover*
*Context gathered: 2026-05-13*
