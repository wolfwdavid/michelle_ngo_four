---
phase: 01-foundation
plan: 02
subsystem: infra
tags: [github-pages, github-actions, sveltekit-static, pnpm, deploy-pipeline]

requires:
  - phase: 01-foundation
    provides: scaffold builds clean via `pnpm build`, package.json pins pnpm@11.0.9 + node 22, robots.txt + noindex meta in place
provides:
  - GitHub Pages staging URL at https://wolfwdavid.github.io/michelle_ngo_four/
  - Auto-deploy on push to main via `.github/workflows/deploy.yml`
  - BASE_PATH env var pattern in svelte.config.js for repo-subpath hosting
  - 404.html SPA fallback + .nojekyll for GH Pages compatibility
  - DEPLOY-NOTES.md with URL, env pins, pitfalls, Phase 7 cutover instructions
affects: [all-future-phases, phase-7-cutover]

tech-stack:
  added:
    - actions/checkout@v4
    - actions/setup-node@v4
    - pnpm/action-setup@v4 (standalone mode)
    - actions/upload-pages-artifact@v3
    - actions/deploy-pages@v4
  patterns:
    - "BASE_PATH env var injected by CI from github.event.repository.name; dev defaults to root via `?? ''`"
    - "Static export with 404.html fallback for SPA-style routing on GH Pages"
    - "Auto-deploy pipeline runs on every push to main; user enables Pages source = GitHub Actions once in repo settings"

key-files:
  created:
    - .github/workflows/deploy.yml
    - static/.nojekyll
    - .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md
  modified:
    - svelte.config.js

key-decisions:
  - "Override D-05: switch deploy target from Cloudflare Pages → GitHub Pages (user directive at execution time)"
  - "Use pnpm/action-setup standalone mode to bypass the runner's Node-20 engine check on pnpm 11"
  - "Inject BASE_PATH from github.event.repository.name so the workflow is repo-rename safe"

patterns-established:
  - "Deploy via committed workflow file, not dashboard-configured Git integration — entire pipeline is in the repo"
  - "Local builds default to root; only CI injects the subpath, so local `pnpm preview` mirrors what the splash will look like at the eventual custom domain"
  - "Deviations from locked decisions get recorded in DEPLOY-NOTES.md with rationale + Phase 7 cutover impact"

requirements-completed: [FOUND-02]

duration: ~22min (executor) + ~8min (orchestrator inline)
completed: 2026-05-10
---

# Phase 01-02: GitHub Pages Deployment Summary

**GitHub Pages auto-deploy pipeline serving the splash at https://wolfwdavid.github.io/michelle_ngo_four/ on every push to main**

## Performance

- **Duration:** ~30 min (multi-segment: executor Task 1 + 3 orchestrator-inline iterations + 1 verification cycle)
- **Started:** 2026-05-10T18:55Z (executor begin)
- **Completed:** 2026-05-10T19:17:39Z (auto-deploy verification succeeded)
- **Tasks:** 3 (push, configure pipeline, verify)
- **Files created:** 3 (workflow, .nojekyll, deploy notes)
- **Files modified:** 1 (svelte.config.js)

## Accomplishments

- Scaffold from plan 01-01 pushed to `origin/main` at `1c32817`
- Deploy target switched from Cloudflare Pages → GitHub Pages (user override of D-05)
- `.github/workflows/deploy.yml` wired with Node 22 + pnpm 11.0.9 (standalone) + `actions/deploy-pages@v4`
- `svelte.config.js` extended with `BASE_PATH` env var + `404.html` fallback
- `static/.nojekyll` added so `_app/` survives GH Pages publishing
- Live URL serves the MICHELLE NGO splash over HTTPS with `noindex` + `Disallow: /` intact
- Auto-deploy loop demonstrated: docs commit `bdca809` triggered run `25637442378` which succeeded at `2026-05-10T19:17:39Z`

## Task Commits

1. **Task 1: Push Phase 1 scaffold to GitHub main** — no new commit; the push (`1c32817 → origin/main`) is the artifact
2. **Task 2 (re-scoped to GH Pages): Configure deploy pipeline** — atomic across three commits:
   - `19bd8cd` feat(01-02): configure github pages deployment (override D-05)
   - `87f2dcf` fix(01-02): setup-node before setup-pnpm in deploy workflow
   - `cbe92c2` fix(01-02): use standalone pnpm install in deploy workflow
3. **Task 3: Record deploy artifacts + verify auto-deploy** — `bdca809` docs(01-02): record GH Pages deploy notes

## Files Created/Modified

- `.github/workflows/deploy.yml` — Push-to-main → build with `BASE_PATH=/<repo>` → upload artifact → deploy via `actions/deploy-pages@v4`
- `static/.nojekyll` — Tells GH Pages not to filter underscore-prefixed dirs (preserves `_app/`)
- `svelte.config.js` — `kit.paths.base = process.env.BASE_PATH ?? ''`; `adapter-static` fallback set to `404.html`
- `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` — URL, env pins, pitfalls, Phase 7 cutover impact

## Decisions Made

- **Override D-05 — host on GitHub Pages instead of Cloudflare Pages.** User directive at execution time. Trade-off: must carry `BASE_PATH` until Phase 7 custom-domain cutover; pipeline lives in the repo instead of a dashboard.
- **`standalone: true` on `pnpm/action-setup@v4`.** Bypasses the npm-install engine check that fails on the runner's bundled Node 20. The alternative (downgrading to pnpm 10) was rejected because the local lockfile is pnpm 11.
- **Derive BASE_PATH from `github.event.repository.name`.** Survives a repo rename without workflow edits.

## Deviations from Plan

### Scope override

**1. [User directive] Host target changed from Cloudflare Pages to GitHub Pages**
- **Found during:** Task 2 checkpoint (before user took any Cloudflare action)
- **Issue:** Plan + RESEARCH.md locked D-05 = Cloudflare Pages. User asked to publish via GH Pages instead.
- **Fix:** Replaced Task 2's Cloudflare dashboard work with three code changes — `paths.base`, `static/.nojekyll`, `.github/workflows/deploy.yml` — and a one-click user step to enable Pages source = GitHub Actions in repo settings. Recorded the deviation in DEPLOY-NOTES.md including Phase 7 cutover impact.
- **Files modified:** svelte.config.js, +static/.nojekyll, +.github/workflows/deploy.yml
- **Verification:** Live URL returns HTTP 200, splash + noindex + Disallow all present.
- **Committed in:** `19bd8cd` (plus `87f2dcf` + `cbe92c2` follow-ups for workflow correctness)

### Auto-fixed Issues

**2. [Rule 3 - Blocking] pnpm/action-setup engine check failed against runner's bundled Node 20**
- **Found during:** Task 2 first workflow run (25637136587, then 25637170203)
- **Issue:** `pnpm/action-setup@v4` executes on the runner's bundled Node 20 regardless of `setup-node`, so installing pnpm 11 (engines.node ≥22.13) fails with `ERR_PNPM_UNSUPPORTED_ENGINE`.
- **Fix:** Set `standalone: true` on the action — downloads pnpm as a standalone binary and skips npm install entirely.
- **Files modified:** .github/workflows/deploy.yml
- **Verification:** Run `25637196306` succeeded; pnpm 11.0.9 installed standalone, `pnpm install --frozen-lockfile` + `pnpm build` both green.
- **Committed in:** `87f2dcf` (order swap — necessary but insufficient) and `cbe92c2` (final fix)

---

**Total deviations:** 1 user-directed scope override (host change), 1 auto-fixed (workflow bootstrap)
**Impact on plan:** D-05 is now superseded by the override recorded in DEPLOY-NOTES.md. FOUND-02 success criteria (auto-deploy on push, public HTTPS URL, splash + noindex preserved) are all satisfied — just on a different host.

## Issues Encountered

- **Git Bash MSYS path conversion (local-only):** Running `BASE_PATH=/michelle_ngo_four pnpm build` on Windows converts the value to a Windows path. Resolved by prefixing with `MSYS_NO_PATHCONV=1` for local validation. CI runs on Ubuntu so this is a local-machine quirk, not a deployment issue.
- **Two failed workflow runs before the standalone fix landed.** Both surfaced the same `ERR_PNPM_UNSUPPORTED_ENGINE`; documented as Pitfall 1 in DEPLOY-NOTES.md for future-me / Phase 7.

## User Setup Required

One-time GitHub Pages enable (completed during this plan):
- Repo Settings → Pages → Source: **GitHub Actions**

No further dashboard work is needed for ongoing operations — every push to `main` rebuilds and republishes automatically.

## Next Phase Readiness

- Staging URL is observable: every commit on `main` lands on https://wolfwdavid.github.io/michelle_ngo_four/ within ~1–2 minutes
- FOUND-01 + FOUND-02 both satisfied → Phase 1 contract complete
- Phase 7 cutover instructions captured in DEPLOY-NOTES.md (custom domain, indexing flip, optional BASE_PATH removal)

---
*Phase: 01-foundation*
*Completed: 2026-05-10*
