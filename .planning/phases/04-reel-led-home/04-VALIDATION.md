---
phase: 4
slug: reel-led-home
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-11
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 (UI project: jsdom env; data project: node env) |
| **Config file** | `vite.config.ts` `test.projects` (Phase 3 carry-forward) |
| **Quick run command** | `pnpm test` (Vitest run, all projects, ~2–4s) |
| **Full suite command** | `pnpm test && pnpm check && pnpm build && pnpm test:prerender` |
| **Estimated runtime** | ~30–60s full suite (build dominates) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test && pnpm check && pnpm build`
- **Before `/gsd:verify-work`:** Full suite green + `pnpm test:prerender` + manual visual sweep
- **Max feedback latency:** ~4 seconds (Vitest quick run)

---

## Per-Task Verification Map

Task IDs are populated by the planner. Requirement → test mapping below is the contract every task `<automated>` block must satisfy.

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| HERO-01 | `/+page.svelte` renders HeroPoster with `<img src={heroPoster}>`, `<section class="min-h-dvh">`, gradient div, scroll cue, sentinel | unit | `pnpm vitest run src/routes/page.test.ts -t "renders hero"` | ❌ W0 | ⬜ pending |
| HERO-01 | HeroPoster `<img>` has `loading="eager"` and `fetchpriority="high"` | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "LCP attrs"` | ❌ W0 | ⬜ pending |
| HERO-01 | `<svelte:head>` emits `<link rel="preload" as="image">` for hero asset | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "preload link"` | ❌ W0 | ⬜ pending |
| HERO-02 | Hero renders `<h1>Michelle Ngo</h1>` and a `<p>` containing "Filmmaker & Producer" | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "name and tagline"` | ❌ W0 | ⬜ pending |
| HERO-03 | PLAY REEL anchor has `href` ending in `/watch/264677021` (matches `producerReelId`) | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "PLAY REEL href"` | ❌ W0 | ⬜ pending |
| HERO-03 | PLAY REEL anchor has `data-sveltekit-preload-data="hover"` | unit | `pnpm vitest run src/lib/components/HeroPoster.test.ts -t "PLAY REEL prefetch"` | ❌ W0 | ⬜ pending |
| D-22 / D-24 | `/+page.svelte` renders exactly 8 VideoCard elements (the featured slice) | unit | `pnpm vitest run src/routes/page.test.ts -t "8 featured cards"` | ❌ W0 | ⬜ pending |
| D-26 | `videos.filter(v => v.featured).length === 8` after flips | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "8 featured"` | ❌ W0 | ⬜ pending |
| D-23 | Featured slice contains `producerReelId` (Vimeo 264677021) | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "featured includes reel"` | ❌ W0 | ⬜ pending |
| D-23 | Featured quota: 2 PBS, 2 Promos, 2 Branded, 1 Doc, 1 Reel | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "featured quota"` | ❌ W0 | ⬜ pending |
| D-28 | `/+page.svelte` renders "View All Work →" anchor with `href` ending `/work` + `data-sveltekit-preload-data="hover"` | unit | `pnpm vitest run src/routes/page.test.ts -t "View All Work link"` | ❌ W0 | ⬜ pending |
| D-13 / D-14 | TopNav on `/` route flips between transparent and solid via IntersectionObserver on the hero sentinel | unit | `pnpm vitest run src/lib/components/TopNav.test.ts -t "scroll-aware home"` | ❌ W0 | ⬜ pending |
| D-13 | TopNav on `/work`, `/work/[category]`, `/watch/[id]`, `/about`, `/press`, `/contact` stays solid `bg-neutral-950/95` regardless of scroll | unit | `pnpm vitest run src/lib/components/TopNav.test.ts -t "solid on non-home"` | ❌ W0 | ⬜ pending |
| D-15 / build | `pnpm build` succeeds after `featured: true` flips (Zod plugin re-validates) | smoke | `pnpm build` | ✅ existing | ⬜ pending |
| FOUND-01 / build | `pnpm test:prerender` succeeds; `/` index.html contains the hero asset reference + 8 featured cards | smoke | `pnpm test:prerender` | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/components/HeroPoster.test.ts` — covers HERO-01, HERO-02, HERO-03 (renders hero, LCP attrs, preload link, name + tagline, PLAY REEL href, PLAY REEL prefetch)
- [ ] `src/routes/page.test.ts` — covers HERO-01, D-22, D-24, D-28 (renders hero composition, 8 featured cards, View-All link)
- [ ] Extend `src/lib/data/videos.test.ts` (or add `src/lib/data/featured.test.ts`) — covers D-23, D-24, D-26 (featured count = 8, quota matches, includes `producerReelId`)
- [ ] Extend `src/lib/components/TopNav.test.ts` — covers D-13, D-14 (scroll-aware on `/`, solid elsewhere, IntersectionObserver attach/detach)
- [ ] `vitest-setup-ui.ts` (NEW) — stub `globalThis.IntersectionObserver` for jsdom; wire into `vite.config.ts` `ui` project `test.setupFiles`
- [ ] Framework install: none — Vitest + jsdom already installed (Phase 3 carry-forward)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bottom gradient renders; text legible over image at every breakpoint | D-05 | Visual rendering — automatable only via screenshot diff, deferred to Phase 7 polish | Dev server: load `/`, eyeball at desktop / tablet / mobile widths |
| Hero fills viewport without horizontal scroll; CTA tappable on mobile | D-06 / D-10 | DOM size assertions in jsdom can't simulate iOS Safari's URL-bar behavior | Dev server at <640px width (or real iOS device); confirm `min-h-dvh` fills screen; tap PLAY REEL |
| No TopNav transparency leakage on `/work`, `/work/[category]`, `/watch/[id]`, `/about`, `/press`, `/contact` | D-13 cross-route | Unit tests cover state per route, but integration-level visual leakage on route change is best caught visually | Dev server: navigate each route, confirm TopNav is solid from first paint |
| Hero LCP feels instant (under ~1s on a fast connection) | FOUND-03 (Phase 7 budget) | True LCP measurement requires DevTools or WebPageTest, not Vitest | DevTools Performance panel on `pnpm preview`, or Lighthouse run on staging |
| `min-h-dvh` compiles to `min-height: 100dvh` in production CSS | D-10 | Easier to spot-check the built CSS than to write a Vitest harness that compiles Tailwind | `pnpm build` then grep `build/_app/immutable/assets/*.css` for `100dvh` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (HeroPoster.test.ts, page.test.ts, featured tests, TopNav extension, IntersectionObserver stub)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
