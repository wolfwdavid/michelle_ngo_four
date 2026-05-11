---
phase: 3
slug: grid-filter-watch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-11
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `03-RESEARCH.md` § Validation Architecture (lines 823–882).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 (installed Phase 2) |
| **Config file** | `vite.config.ts` (Vitest `test:` block) — Wave 0 must add jsdom support |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm check && pnpm test && pnpm build` |
| **Estimated runtime** | ~25 seconds (component + load fn tests + build prerender check) |

**Wave 0 infrastructure change:** `src/lib/components/*.test.ts` and `src/routes/**/*.test.ts` require DOM access. Either (a) switch `vite.config.ts` test environment to `'jsdom'` globally, or (b) split Vitest into two projects via `vitest.workspace.ts` (node for `src/lib/data/`, jsdom for components/routes). The planner picks one in 03-00-WAVE-0.

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm check && pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green — `pnpm check && pnpm test && pnpm build`
- **Max feedback latency:** ~25 seconds (component test run); ~45 seconds including `pnpm build`

`pnpm build` is the strongest integration test: if `entries()` returns wrong slugs/ids, `adapter-static strict: true` fails the build.

---

## Per-Task Verification Map

> Filled by planner during 03-01..03-04 PLAN.md authoring. Each task in those plans MUST link a Req ID + automated command from this table (or be marked Wave 0).

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-00-01 | 00 | 0 | (infra) | infra | `pnpm test` smokes jsdom env | ❌ W0 | ⬜ pending |
| 3-01-01 | 01 | 1 | GRID-01 | unit (component) | `pnpm vitest run src/lib/components/VideoCard.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | GRID-03 | unit (component) | `pnpm vitest run src/lib/components/VideoCard.test.ts -t "lazy loading"` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | GRID-04 | unit (component) | `pnpm vitest run src/lib/components/VideoCard.test.ts -t "click target"` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 1 | GRID-05 | unit (component) | `pnpm vitest run src/lib/components/CategoryTag.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | GRID-02 | unit (component) | `pnpm vitest run src/routes/work/page.test.ts` (class strings + count) | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 2 | FILT-03 | unit (load fn) | `pnpm vitest run src/routes/work/[category]/page.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 2 | FILT-03 | unit (entries fn) | `pnpm vitest run src/routes/work/[category]/page.test.ts -t "entries"` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | FILT-01 | unit (load fn) | `pnpm vitest run src/routes/watch/[id]/page.test.ts` | ❌ W0 | ⬜ pending |
| 3-03-02 | 03 | 2 | FILT-02 | unit (load fn) | `pnpm vitest run src/routes/watch/[id]/page.test.ts -t "rail"` | ❌ W0 | ⬜ pending |
| 3-03-03 | 03 | 2 | FILT-01 | unit (entries fn) | `pnpm vitest run src/routes/watch/[id]/page.test.ts -t "entries"` | ❌ W0 | ⬜ pending |
| 3-03-04 | 03 | 2 | FILT-04 | integration (build) | `pnpm build && node scripts/test-prerender-coverage.mjs` | ❌ W0 | ⬜ pending |
| 3-04-01 | 04 | 3 | NAV-01 | unit (component) | `pnpm vitest run src/lib/components/TopNav.test.ts` | ❌ W0 | ⬜ pending |
| 3-04-02 | 04 | 3 | NAV-01 | unit (component, active state) | `pnpm vitest run src/lib/components/TopNav.test.ts -t "active"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install `jsdom@latest` as a dev-dependency (`pnpm add -DE jsdom`)
- [ ] Configure jsdom environment — either `vite.config.ts` test environment swap OR `vitest.workspace.ts` split (planner picks one and documents the rationale in 03-00-WAVE-0)
- [ ] `src/lib/components/VideoCard.test.ts` stub — placeholder tests for GRID-01, GRID-03, GRID-04 (filled out in Wave 1 alongside component implementation)
- [ ] `src/lib/components/CategoryTag.test.ts` stub — placeholder for GRID-05
- [ ] `src/lib/components/TopNav.test.ts` stub — placeholder for NAV-01 (with mocked `$app/state` `page`)
- [ ] `src/routes/work/page.test.ts` stub — placeholder for GRID-02 + /work load fn (D-25 sort). NOTE: leading `+` dropped from the planner's draft filename because SvelteKit's route analyzer (`@sveltejs/kit` 2.59.1, `create_manifest_data/index.js:518`) throws `Files prefixed with + are reserved` for any `+*.ts` not matching `+page` / `+layout` / `+server` / `+error`. The unprefixed name is silently ignored by SvelteKit and freely consumed by Vitest.
- [ ] `src/routes/work/[category]/page.test.ts` stub — placeholder for FILT-03 load + entries (leading `+` dropped, same reason)
- [ ] `src/routes/watch/[id]/page.test.ts` stub — placeholder for FILT-01 + FILT-02 + entries (leading `+` dropped, same reason)
- [ ] `scripts/test-prerender-coverage.mjs` — NEW Node script asserting `build/work/*/index.html` count ≥ 9 and `build/watch/*/index.html` count ≥ 56; wired as `pnpm test:prerender`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual blur-up effect smoothness | GRID-03 (success criterion 2) | Animation timing is subjective; vitest can only assert class transitions | `pnpm dev`, open `/work`, throttle network to Slow 3G in DevTools, scroll — thumbs should fade in (not pop) |
| Per-category accent color contrast (AA) on `bg-neutral-950` | D-04 | Requires WCAG contrast tooling on actual rendered colors | Run all 8 category accent hex values through a contrast checker against `#0a0a0a` |
| Hover-prefetch behavior on `/work` cards | D-14 (GRID-04) | Network-tab observation, not unit-testable | `pnpm dev`, open DevTools Network tab, hover cards — `/watch/[id]` HTML should prefetch on hover |
| Embed iframe actually plays (YouTube + Vimeo) | success criterion 3 | Cross-origin iframe; cannot mount in jsdom | `pnpm dev`, visit 1 YouTube `/watch/[id]` and 1 Vimeo `/watch/[id]`, confirm both play |
| Responsive breakpoints at 639/640/1023/1024 px | GRID-02 (D-22) | Visual + DOM measurement; tests assert class strings only | `pnpm dev`, resize window across breakpoints; count columns |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s for `pnpm test`; < 60s for full gate
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
