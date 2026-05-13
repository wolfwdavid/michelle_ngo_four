# Phase 7: Polish & Production Cutover - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 07-polish-production-cutover
**Areas discussed:** Hosting & cutover plan, Perf budget & verification, Production metadata & assets, Responsive QA matrix

---

## Gray area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Hosting & cutover plan | michellengo.net DNS swap, custom domain on GitHub Pages vs migrate, BASE_PATH handling, staging↔production split, WordPress migration order, pre-cutover blocker checklist | ✓ |
| Perf budget & verification | FOUND-03 'under 2s on 4G' — tool choice, LCP target, JS bundle ceiling, CLS budget, pass criterion. Decides if hero `<picture>`+AVIF is needed. | ✓ |
| Production metadata & assets | Favicon set scope, OG/Twitter cards (image source), per-page `<title>` + `<meta description>` strategy, JSON-LD structured data, noindex/robots flip | ✓ |
| Responsive QA matrix | Devices/breakpoints to verify, DevTools emulation vs real device contract, what triggers a Phase 7 fix vs deferred to v2 polish | ✓ |

**User's choice:** All four areas selected.
**Notes:** Phase 7 is the launch event; user opted to cover all gray areas in a single discussion pass.

---

## Hosting & cutover plan

### Q1: Where should michellengo.net point in production?

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Pages + custom domain | Add michellengo.net as a custom domain on the existing GitHub Pages site. Same CI/CD already proven. Need to clear BASE_PATH at apex. | ✓ |
| Migrate to Cloudflare Pages | Original D-05 target before override; built-in image optimization + analytics; new CI workflow + dashboard config | |
| Migrate to Vercel | Best DX for SvelteKit; adds another vendor; drops BASE_PATH wrapping entirely | |

**User's choice:** GitHub Pages + custom domain (Recommended)
**Notes:** Carries Phase 1 D-05 override forward. Cheapest path, fewest moving parts.

### Q2: How should BASE_PATH be handled once michellengo.net is the apex domain?

| Option | Description | Selected |
|--------|-------------|----------|
| Drop BASE_PATH at apex; keep staging subpath | Production runs BASE_PATH=''; wolfwdavid.github.io/michelle_ngo_four/ keeps working as staging with BASE_PATH=/<repo>; workflow sets per-env | ✓ |
| Always BASE_PATH='', retire wolfwdavid.github.io URL | Loses Phase 1 D-08 staging-vs-production separation | |
| Keep BASE_PATH always | Strange UX (no apex landing); only for subdirectory deploys | |

**User's choice:** Drop BASE_PATH at apex; keep staging subpath (Recommended)
**Notes:** All internal links already wrap through `$app/paths` `base`, so this is a build-time env-var change, not a source-code change.

### Q3: How should cutover be sequenced and rolled back if it breaks?

| Option | Description | Selected |
|--------|-------------|----------|
| Verify on prod URL first, then DNS swap | 1) Add custom domain config + CNAME file; 2) GH provisions cert; 3) UAT via curl --resolve / hosts override; 4) Schedule DNS cutover; 5) Rollback = revert DNS records | ✓ |
| Hard swap — DNS first, fix forward | Faster but higher risk of broken pages during propagation | |
| Keep wordpress.com live behind a temp subdomain | Adds a moving piece during cutover; only useful if legacy WP URLs have inbound traffic | |

**User's choice:** Verify on prod URL first, then DNS swap (Recommended)
**Notes:** Lower-risk launch ritual. DNS is the last lever pulled.

### Q4: What about 301 redirects from old WordPress paths?

| Option | Description | Selected |
|--------|-------------|----------|
| Clean break — no redirects | Old paths 404; static-hosting limitation + fresh-inbound audience + legacy disciplines Out of Scope | ✓ |
| Custom 404 page steers traffic | Enhance +error.svelte with a 'Looking for X?' nudge | |
| Selective client-side redirects for top 3 legacy paths | Meta-refresh + JS prerendered redirect pages for /About, /Film-TV | |

**User's choice:** Clean break — no redirects (Recommended)
**Notes:** Audience is fresh inbound. GH Pages can't do server-side 301s anyway.

### Continuation prompt

| Option | Description | Selected |
|--------|-------------|----------|
| Next area | Move on to Perf budget & verification | ✓ |
| More questions | Discuss more about Hosting & cutover plan | |

---

## Perf budget & verification

### Q1: Which tool decides whether FOUND-03 is met?

| Option | Description | Selected |
|--------|-------------|----------|
| Lighthouse CI on the deployed prod URL | Reproducible, captured as JSON report, can re-run in CI; mobile preset + Slow 4G throttle | ✓ |
| WebPageTest from a real ISP test location | More realistic network conditions; harder to automate | |
| Real iPhone on actual 4G/LTE | Highest ecological validity but not reproducible | |

**User's choice:** Lighthouse CI on the deployed prod URL (Recommended)
**Notes:** Single number to gate on. Real iOS kept as a complement.

### Q2: What does 'under 2s' bind to — which metric is the pass gate?

| Option | Description | Selected |
|--------|-------------|----------|
| LCP < 2.0s mobile/4G | Hero poster is the LCP element on /; maps directly to FOUND-03 wording; Web Vitals 'Good' threshold | ✓ |
| FCP < 1.5s + LCP < 2.5s | Two-gate test; stricter; matches Web Vitals 'Good' fully | |
| Lighthouse Performance score ≥ 90 | Composite score; less precise about which metric blocks | |

**User's choice:** LCP < 2.0s mobile/4G (Recommended)
**Notes:** Single dial directly mapping FOUND-03 wording.

### Q3: Hero is already a 15KB WebP with preload. If LCP misses 2s, what's the escalation path?

| Option | Description | Selected |
|--------|-------------|----------|
| Add `<picture>`+AVIF only if LCP fails | Measure first; honors Phase 4 D-04 'revisit only if FOUND-03 budget demands' | ✓ |
| Add `<picture>`+AVIF preemptively | Belt-and-suspenders; eats planning budget on perf that might already be fine | |
| Lazy-load the featured grid below the hero only | Drops 8 thumbnail fetches off the critical path; reconsiders Phase 4 D-22 | |

**User's choice:** Add `<picture>`+AVIF only if LCP fails (Recommended)
**Notes:** Honors Phase 4 D-04 verbatim handoff.

### Q4: JS bundle / font policy — what's the budget?

| Option | Description | Selected |
|--------|-------------|----------|
| No new JS deps; system fonts only | No icon library, no analytics, no animation library, no web fonts in Phase 7 | ✓ |
| Allow one web font for wordmark, system fonts elsewhere | Adds ~30–80KB + render-blocking unless preloaded; cosmetic upgrade | |
| JS budget cap with no enforcement mechanism | Set 'first-load JS ≤ 80KB gzipped' target but no tooling to enforce | |

**User's choice:** No new JS deps; system fonts only (Recommended)
**Notes:** Reinforces pinned-exact-deps discipline.

### Continuation prompt

| Option | Description | Selected |
|--------|-------------|----------|
| Next area | Move on to Production metadata & assets | ✓ |
| More questions | Discuss more about Perf (CLS budget, blur-up width/height attrs, caching headers) | |

---

## Production metadata & assets

### Q1: Favicon set scope?

| Option | Description | Selected |
|--------|-------------|----------|
| Wordmark-derived multi-size set | favicon.ico (16+32), 192, 512, apple-touch (180); covers browser tabs + iOS + Android | ✓ |
| Minimum set — single PNG + apple-touch | Browsers downscale fine; skip 192/512 | |
| Keep as-is (favicon.png only) | iOS falls back to a screenshot for home-screen icon | |

**User's choice:** Wordmark-derived multi-size set (Recommended)
**Notes:** One-time authoring; ships once.

### Q2: OG / Twitter card strategy?

| Option | Description | Selected |
|--------|-------------|----------|
| Sitewide OG + per-page `<title>`/`<description>` | Single 1200×630 OG image; per-route titles/descriptions differentiate | ✓ |
| Per-page OG images | Richer share previews; ~60 OG declarations to wire | |
| OG image only on /, omit on subpages | Subpage shares look bare | |

**User's choice:** Sitewide OG + per-page `<title>`/`<description>` (Recommended)
**Notes:** Cheapest meaningful coverage.

### Q3: Per-page `<title>` format?

| Option | Description | Selected |
|--------|-------------|----------|
| '`<Page>` — Michelle Ngo' | SEO-friendly + scannable in tab strips | ✓ |
| 'Michelle Ngo — `<Page>`' | Brand-first; worse for tab-strip scannability | |
| Keep 'Michelle Ngo' sitewide | Bad for SEO + browser history | |

**User's choice:** '`<Page>` — Michelle Ngo' (Recommended)
**Notes:** Home stays brand-only.

### Q4: JSON-LD structured data?

| Option | Description | Selected |
|--------|-------------|----------|
| Person on /about + VideoObject on /watch/[id] | Person schema on /about; VideoObject on each /watch/[id]; eligible for video-rich snippets | ✓ |
| Person only | Skips 56 VideoObject injections | |
| Skip JSON-LD entirely | v2 polish if SEO becomes important | |

**User's choice:** Person on /about + VideoObject on /watch/[id] (Recommended)
**Notes:** 56 + 1 injections, all derived from existing data.

### Continuation prompt

| Option | Description | Selected |
|--------|-------------|----------|
| Next area | Move on to Responsive QA matrix | ✓ |
| More questions | Discuss more about Metadata | |

---

## Responsive QA matrix

### Q1: What's the responsive QA test matrix?

| Option | Description | Selected |
|--------|-------------|----------|
| 3 breakpoints × 7 routes = 21 cells | Walk every route at mobile/tablet/desktop; capture per-cell decisions | ✓ |
| 3 breakpoints × representative routes only | ~15 cells; skip duplicates like /work/[category] vs /work | |
| Real-user scenarios instead of grid sweep | 4–5 producer scan paths end-to-end at each breakpoint | |

**User's choice:** 3 breakpoints × 7 routes = 21 cells (Recommended)
**Notes:** Exhaustive but bounded.

### Q2: DevTools emulation or real devices?

| Option | Description | Selected |
|--------|-------------|----------|
| Chrome DevTools primary + real iOS spot-check | DevTools for the 21-cell sweep; one real-iPhone pass at the end | ✓ |
| DevTools only | Skips iOS Safari catch | |
| Real devices only — actual iPhone + Android | Unreproducible iteration loop | |

**User's choice:** Chrome DevTools primary + real iOS spot-check (Recommended)
**Notes:** Mirrors Phase 4 UAT methodology that already passed.

### Q3: What triggers a Phase 7 fix vs gets deferred to v2 polish?

| Option | Description | Selected |
|--------|-------------|----------|
| Functional bugs + visible breakage only | Fix horizontal scroll, broken type, tap targets <44px, layout shift > 0.1 CLS; defer cosmetic nits | |
| Pixel-polish everything | Treat every visible imperfection as a P7 fix | ✓ |
| Defer all polish; ship if no functional bugs | Stricter; accept any imperfection that doesn't block tasks | |

**User's choice:** Pixel-polish everything
**Notes:** Higher bar than the recommended functional-only option. Followed up with a bounding question in Q4 to prevent open-ended polish loop.

### Q4: Pixel-polish-everything is a significant scope expansion — how should we bound it?

| Option | Description | Selected |
|--------|-------------|----------|
| Single audit pass + fix list, then stop | Walk the matrix ONCE; log every imperfection into a numbered punch list; fix all; ship | ✓ |
| Iterative audit→fix loops until clean | Repeat cycles until a full sweep yields zero new issues; unbounded duration | |
| Two-pass: one functional + one cosmetic, fix list per pass | Pass 1 ship-blocking; Pass 2 cosmetic can be deferred post-launch | |

**User's choice:** Single audit pass + fix list, then stop (Recommended)
**Notes:** The numbered punch list IS the contract. Avoids polish-paralysis while preserving the high bar.

### Continuation prompt

| Option | Description | Selected |
|--------|-------------|----------|
| I'm ready for context | All 4 areas covered; write CONTEXT.md | ✓ |
| More questions about QA | Keep exploring (visual regression, a11y, keyboard nav) | |
| Explore more gray areas | Identify additional gray areas from what we learned | |

---

## Claude's Discretion

Areas where Claude has latitude in plan-phase (recorded in CONTEXT.md `Claude's Discretion` subsection):
- OG image authoring approach (1200×630 crop of hero-poster.webp with optional wordmark composite)
- Favicon authoring tooling (any image editor + realfavicongenerator.net)
- Per-page description copy tuning (shape locked, words flexible)
- Sitemap implementation pattern (`+server.ts` endpoint vs other)
- Lighthouse-CI tooling (`lhci autorun` vs plain `npx lighthouse`)
- www → apex redirect direction (canonical = apex; www 301s to apex)
- VideoObject duration ISO 8601 formatting
- Sitemap update cadence (build-timestamp `lastmod` on every route)
- Whether to also flip `<meta name="googlebot">` (No)
- CNAME file commit timing (same commit as repo settings change)

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section:
- Cloudflare Pages / Vercel migration (rejected per D-01)
- Hard DNS swap with fix-forward (rejected per D-03)
- 301 redirects from legacy WordPress paths (rejected per D-04)
- Preemptive `<picture>`+AVIF on the hero (rejected per D-08; measure-first)
- Web font for wordmark (rejected per D-09)
- Per-page OG images (rejected per D-12)
- Person-only JSON-LD / skip JSON-LD entirely (rejected per D-15)
- Real headshot on /about (deferred; post-launch if asset provided)
- Iterative polish loops (rejected per D-20; single-pass audit + fix list)

No scope-creep redirects were needed during this discussion — all questions stayed within Phase 7's polish + cutover boundary.
