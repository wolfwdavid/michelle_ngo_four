---
phase: 5
slug: pbs-american-portrait
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-11
updated: 2026-05-11
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 with two-project split: `data` (node env) + `ui` (jsdom env, browser conditions). Setup file: `vitest-setup-ui.ts` (IntersectionObserver stub). |
| **Config file** | `vite.config.ts` lines 73-122 (`test.projects` array). No new config needed for Phase 5. |
| **Quick run command** | `pnpm vitest run <path-or-pattern>` — e.g. `pnpm vitest run src/routes/pbs-american-portrait/` |
| **Full suite command** | `pnpm test --reporter=basic && pnpm check && pnpm lint && pnpm build && pnpm test:prerender` |
| **Estimated runtime** | ~8s for `pnpm test`, ~12s for `pnpm check`, ~6s for `pnpm lint`, ~25s for `pnpm build`, ~1s for `pnpm test:prerender` — full validation chain ~52s |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run <changed-file>` (sub-second feedback on the directly-affected suite).
- **After every plan wave:** Run the full chain: `pnpm test && pnpm check && pnpm lint && pnpm build && pnpm test:prerender` (~52s).
- **Before `/gsd:verify-work`:** Full chain green.
- **Max feedback latency:** < 60s for full chain; < 2s for single-suite quick run.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-T1 | 05-01 | 1 | PBS-02 (context block content) | checkpoint:decision | `node -e "..."` (verify <approved> tag in 05-01-PLAN.md — see task acceptance_criteria) | ✅ this PLAN | ⬜ pending |
| 05-01-T2 | 05-01 | 1 | PBS-02 (helper + render contracts) | unit (stubs) | `pnpm test --reporter=basic && pnpm check` | ❌ creates stubs | ⬜ pending |
| 05-01-T3 | 05-01 | 1 | PBS-01, PBS-02, PBS-03 (TopNav + cross-link contracts) | unit (stubs) + integration (prerender script) | `pnpm test --reporter=basic && pnpm check && pnpm build && pnpm test:prerender` | ✅ scripts exist; tests extended | ⬜ pending |
| 05-02-T1 | 05-02 | 2 | PBS-01 (TopNav D-02 retarget + D-03 active-state) | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts` | ✅ Wave 0 stubs | ⬜ pending |
| 05-02-T2 | 05-02 | 2 | PBS-02 (load + render + helper + badges) | unit (route + helper) | `pnpm vitest run src/routes/pbs-american-portrait/` + `pnpm build && pnpm test:prerender` | ✅ Wave 0 stubs | ⬜ pending |
| 05-02-T3 | 05-02 | 2 | PBS-01 (D-05 cross-link), PBS-03 (D-04 cross-link) | unit (route render) | `pnpm test --reporter=basic && pnpm build && pnpm test:prerender` | ✅ Wave 0 stubs | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Owning File |
|--------|----------|-----------|-------------------|-------------|
| **PBS-01** | `/pbs-american-portrait/` route exists and prerenders | integration | `pnpm build && pnpm test:prerender` | `scripts/test-prerender-coverage.mjs` (extended in 05-01-T3) |
| **PBS-01** | Route load returns the 18 PBS videos | unit | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "load returns 18 videos"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-01** | TopNav PBS category link points to `/pbs-american-portrait/` (D-02) | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts -t "D-02"` | `src/lib/components/TopNav.test.ts` |
| **PBS-01** | TopNav active-state on `/pbs-american-portrait/` (D-03) | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts -t "D-03"` | `src/lib/components/TopNav.test.ts` |
| **PBS-01** | D-05 cross-link present on `/watch/[id]` for PBS videos | unit (route render) | `pnpm vitest run src/routes/watch/[id]/page.test.ts -t "D-05"` | `src/routes/watch/[id]/page.test.ts` |
| **PBS-01** | D-05 cross-link absent on `/watch/[id]` for non-PBS videos | unit (route render — negative) | `pnpm vitest run src/routes/watch/[id]/page.test.ts -t "absent"` | `src/routes/watch/[id]/page.test.ts` |
| **PBS-02** | Page renders 18 VideoCards | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "renders 18 cards"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-02** | h1 has text-cat-pbs accent class (D-08) | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "text-cat-pbs"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-02** | Subtitle line "18 stories produced by Michelle Ngo" (D-09) | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "subtitle"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-02** | Verbatim PBS blockquote with attribution (D-10) | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "blockquote"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-02** | Outbound link to pbs.org/american-portrait with target=_blank rel=noopener (D-12) | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "outbound"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-02** | h2 "Stories" present (D-16) | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "Stories"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-02** | 15 "See on PBS →" badges rendered (D-21) | unit (route render) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "15"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-02** | `pbsCollectionUrl` extracts URL from 15 of 18 descriptions | unit (helper, 15+ assertions) | `pnpm vitest run src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts -t "positive"` | `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` |
| **PBS-02** | `pbsCollectionUrl` returns null for 3 known-null records | unit (helper, 3 assertions) | `pnpm vitest run src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts -t "null"` | `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` |
| **PBS-02** | `pbsCollectionUrl` edge cases (trailing punct, multiple URLs, non-PBS, malformed) | unit (helper, 5 assertions) | `pnpm vitest run src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts -t "edge"` | `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` |
| **PBS-02** | D-18 sort: featured-first then date desc | unit (route load) | `pnpm vitest run src/routes/pbs-american-portrait/page.test.ts -t "sort"` | `src/routes/pbs-american-portrait/page.test.ts` |
| **PBS-03** | `/work/pbs-american-portrait/` still loads 18 PBS videos | unit (existing test, unchanged) | `pnpm vitest run src/routes/work/[category]/page.test.ts -t "pbs-american-portrait"` | `src/routes/work/[category]/page.test.ts` (Phase 3, untouched) |
| **PBS-03** | `entries()` still emits 8 slugs including `pbs-american-portrait` | unit (existing test, unchanged) | `pnpm vitest run src/routes/work/[category]/page.test.ts -t "entries"` | `src/routes/work/[category]/page.test.ts` (Phase 3, untouched) |
| **PBS-03** | `build/work/pbs-american-portrait/index.html` still emitted | integration (prerender coverage, unchanged threshold) | `pnpm build && pnpm test:prerender` | `scripts/test-prerender-coverage.mjs` |
| **PBS-03** | D-04 cross-link rendered on `/work/pbs-american-portrait/` only | unit (route render, positive + negative) | `pnpm vitest run src/routes/work/[category]/page.test.ts -t "D-04"` | `src/routes/work/[category]/page.test.ts` |

---

## Wave 0 Requirements

All Wave 0 scaffolding is created in Plan 05-01 Task 2 + Task 3. Specifically:

- [ ] `src/routes/pbs-american-portrait/+page.ts` — stub `load()` returning `{ videos: [] as never[], pbsBlurb: '' }`. Plan 05-02 Task 2 replaces with real load.
- [ ] `src/routes/pbs-american-portrait/+page.svelte` — minimal stub renders `<section><p>...stub...</p></section>`. Plan 05-02 Task 2 replaces with full layout.
- [ ] `src/routes/pbs-american-portrait/_pbsCollectionUrl.ts` — stub `pbsCollectionUrl(): null`. Plan 05-02 Task 2 replaces with real regex.
- [ ] `src/routes/pbs-american-portrait/_pbsCollectionUrl.test.ts` — RED-by-skip stubs (3 `describe.skip` blocks): 15 positive extractions, 3 null records (audit-verified ids: 620232398, 1007061884, 1007027015), 5 edge cases (trailing punct ×2, multiple URLs, non-PBS URL, malformed protocol).
- [ ] `src/routes/pbs-american-portrait/page.test.ts` — RED-by-skip stubs (3 `describe.skip` blocks): load shape (PBS-02 + D-18 sort), render (D-08/09/10/12/16/19), per-card badges (D-21).
- [ ] `src/lib/components/TopNav.test.ts` — ADDITIVE Phase 5 `describe.skip` block with 5 assertions: D-02 PBS href retarget, D-02 non-PBS regression, D-03 active on /pbs-american-portrait/, D-03 active on /work/pbs-american-portrait/ regression, D-03 disambiguation (other links NOT highlighted). Existing Phase 3 + Phase 4 tests untouched.
- [ ] `src/routes/watch/[id]/page.test.ts` — ADDITIVE `describe.skip` block with 2 assertions: D-05 cross-link present on PBS video, D-05 cross-link absent on non-PBS video (producer reel).
- [ ] `src/routes/work/[category]/page.test.ts` — ADDITIVE `describe.skip` block with 2 assertions: D-04 cross-link present on /work/pbs-american-portrait/, D-04 cross-link absent on /work/reel.
- [ ] `scripts/test-prerender-coverage.mjs` — threshold extension: assert `build/pbs-american-portrait/index.html` exists; extend success log + diagnostic line.

No new framework install needed — Vitest 4.1.5 + jsdom 29.1.1 + existing two-project workspace cover everything.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual: h1 PBS accent color (cat-pbs) reads as flagship-distinct in context | PBS-02 (D-08) | Color perception + visual hierarchy can't be asserted by class regex alone (test confirms class is applied; eye confirms it reads as intended) | `pnpm preview` → navigate to `/pbs-american-portrait/` → visually confirm the h1 stands out in a recognizable PBS-accent color (warm pink/orange OKLCH L=0.72) |
| Visual: blockquote treatment feels editorial-restrained (not loud, not buried) | PBS-02 (D-10) | Aesthetic call — automated test only asserts the element exists with non-trivial body | Same preview check → blockquote should sit between subtitle and outbound link with `border-l-2 border-neutral-700 pl-4` styling visible |
| Visual: TopNav active-state on /pbs-american-portrait/ matches /work/pbs-american-portrait/ visually | PBS-01 (D-03) | Test asserts class regex; eye confirms color renders identically | Open `/pbs-american-portrait/` → note PBS nav link color → navigate to `/work/pbs-american-portrait/` → confirm PBS nav link color matches |
| Outbound link opens pbs.org in new tab without exposing window.opener | PBS-02 (D-12, Pitfall 6) | Test asserts attrs; manual confirms browser actually opens new tab and source page is safe | Click "Visit pbs.org/american-portrait →" → new tab opens at pbs.org; switch back to portfolio tab and confirm no nav state corruption |
| 15 "See on PBS →" badges look proportionate to card titles | PBS-02 (D-21) | Test asserts count; eye confirms visual weight isn't competing with VideoCard | Visually inspect /pbs-american-portrait/ — badges should be a smaller, muted accent below cards, not visually equal to titles |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (every Plan 05-01 + 05-02 task has a concrete command)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (all 6 tasks have verify commands)
- [x] Wave 0 covers all MISSING references (Plan 05-01 Tasks 2 + 3 create every stub)
- [x] No watch-mode flags (every verify uses `vitest run`, never `vitest` without args)
- [x] Feedback latency < 60s (full chain: ~52s; single suite: < 2s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready for execution
