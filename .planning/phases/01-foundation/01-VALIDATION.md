---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 1 is a scaffold/toolchain phase. There are no business-logic units, so validation is entirely command-checkable: build, type-check, lint, format, and grep against build artifacts. Vitest/Playwright are explicitly deferred (CONTEXT.md `<deferred>`).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — scaffold phase. Vitest/Playwright deferred per CONTEXT.md. |
| **Config file** | n/a |
| **Quick run command** | `pnpm check` |
| **Full suite command** | `pnpm build && pnpm check && pnpm lint && pnpm format --check` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm check`
- **After every plan wave:** Run `pnpm build && pnpm check && pnpm lint && pnpm format --check`
- **Before `/gsd:verify-work`:** Full suite must be green AND Cloudflare Pages deploy live at `*.pages.dev` URL over HTTPS
- **Max feedback latency:** 30 seconds (local); deploy verification is manual/visual

---

## Per-Task Verification Map

> Populated by planner during plan creation. Task IDs follow `1-{plan}-{task}`. Plan IDs `01-01` and `01-02` are seeded from ROADMAP.md.

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-* | 01-01 (Scaffold) | 1 | FOUND-01 | build + type-check | `pnpm build && pnpm check` | ✅ post-scaffold | ⬜ pending |
| 1-01-* | 01-01 (Scaffold) | 1 | FOUND-01 | lint + format | `pnpm lint && pnpm format --check` | ✅ post-scaffold | ⬜ pending |
| 1-01-* | 01-01 (Scaffold) | 1 | FOUND-01 | Tailwind utility renders | `grep -E "text-|bg-\|font-" build/index.html` | ✅ post-build | ⬜ pending |
| 1-01-* | 01-01 (Scaffold) | 1 | FOUND-01 | robots noindex present | `grep -i "noindex" build/index.html` | ✅ post-build | ⬜ pending |
| 1-02-* | 01-02 (CF Pages) | 2 | FOUND-02 | deploy succeeds | manual: visit `https://<project>.pages.dev` after push to `main` | n/a — external | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No test files required — Phase 1 validation is command-driven (build/lint/type-check) and grep against build artifacts.
- [ ] No test framework install — Vitest/Playwright deferred per CONTEXT.md `<deferred>`.

*Existing infrastructure (build/lint/type-check commands installed by scaffold) covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cloudflare Pages deploy is live and reachable | FOUND-02 | No CLI without authenticated Cloudflare API call; goal is observable HTTP 200 over HTTPS | After pushing to `main`, wait for CF Pages build, open `https://<project>.pages.dev` in browser, confirm: HTTPS lock icon, smoke-test page renders, "MICHELLE NGO" wordmark visible |
| Splash visually reads as intentional | implicit (CONTEXT.md `<specifics>`) | Subjective design check — Tailwind classes can render without looking deliberate | Open staging URL, confirm splash doesn't look like a default Vite landing page (centered wordmark, intentional spacing/typography) |
| Search engines blocked from staging | D-11 | Confirms BOTH layers (robots.txt and meta noindex) work end-to-end | Visit `https://<project>.pages.dev/robots.txt` — confirm `Disallow: /`. View source on `/` — confirm `<meta name="robots" content="noindex, nofollow">` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify commands or are listed in Manual-Only Verifications with explicit instructions
- [ ] Sampling continuity: every plan has at least one automated command (no plans rely solely on manual verification)
- [ ] Wave 0 covers all MISSING references (n/a — no test files required this phase)
- [ ] No watch-mode flags in any command
- [ ] Feedback latency < 30s for local checks
- [ ] `nyquist_compliant: true` set in frontmatter once planner populates per-task rows above

**Approval:** pending
