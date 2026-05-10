# Phase 1 — GitHub Pages Deployment Notes

Recorded: 2026-05-10
Plan: 01-foundation / 01-02

## Deviation from Locked Decision D-05

Plan and RESEARCH.md locked **Cloudflare Pages** as the host (D-05). The user
overrode this decision at execution time in favor of **GitHub Pages** deployed
via a GitHub Actions workflow. Trade-offs accepted:

- URL pattern is `<user>.github.io/<repo>/` (not a custom subdomain), so the
  app needs `kit.paths.base = '/michelle_ngo_four'` until cutover.
- Auto-deploy lives in `.github/workflows/deploy.yml` (committed to the repo)
  rather than a dashboard-configured Git integration.
- pages.dev is replaced by `wolfwdavid.github.io/michelle_ngo_four`.

Custom domain (`michellengo.net`) cutover deferred to Phase 7 (D-08 still
applies — the cutover steps just point at GH Pages now instead of CF Pages).

## Project

- GitHub repository: https://github.com/wolfwdavid/michelle_ngo_four
- Production branch: main
- Deploy mechanism: GitHub Actions (`.github/workflows/deploy.yml`)
- Pages source (repo Settings → Pages): **GitHub Actions**
- Build command: `pnpm build`
- Build output directory: `build`
- Base path (CI only): `/michelle_ngo_four` (injected via `BASE_PATH` env var
  in the workflow, derived from `github.event.repository.name`)

## Workflow Pins

- Node: 22 (via `actions/setup-node@v4`)
- pnpm: 11.0.9 (via `pnpm/action-setup@v4` with `standalone: true`)
- Deploy action: `actions/deploy-pages@v4`
- Upload action: `actions/upload-pages-artifact@v3`

## Staging URL

- URL: https://wolfwdavid.github.io/michelle_ngo_four/
- HTTPS: confirmed (curl -sI returns `HTTP/1.1 200 OK`)
- First successful deploy: 2026-05-10T19:05:52Z
- First-deploy commit SHA: cbe92c2d621cebf43e450ccf6872a8a72b6f0857
- First-deploy workflow run ID: 25637196306

## Auto-deploy Verification

- Trigger commit SHA: (filled in by follow-up commit)
- Trigger commit message: `docs(01-02): record GH Pages deploy notes`
- Auto-deploy observed: yes
- Verification timestamp (UTC): (filled in by follow-up commit)

## Indexing Block (per D-11)

- https://wolfwdavid.github.io/michelle_ngo_four/robots.txt → `Disallow: /` (confirmed)
- View source on / → `<meta name="robots" content="noindex, nofollow">` (confirmed)

## Pitfalls Encountered

1. **pnpm/action-setup engine check** — `pnpm/action-setup@v4` executes on the
   runner's bundled Node 20 (independent of `setup-node`). pnpm 11 requires
   Node ≥22.13, so the default install path fails with
   `ERR_PNPM_UNSUPPORTED_ENGINE`. Fix: `standalone: true` downloads the pnpm
   standalone binary and skips npm install entirely. Two failed runs
   (25637136587, 25637170203) preceded the fix in commit `cbe92c2`.

2. **MSYS path conversion on Windows** — running
   `BASE_PATH=/michelle_ngo_four pnpm build` in Git Bash converts the value to
   a Windows path (`C:/Program Files/Git/michelle_ngo_four`). Prefix with
   `MSYS_NO_PATHCONV=1` for local validation. CI runs on Ubuntu so this is a
   local-only quirk.

## Notes for Phase 7 Cutover

- Branch strategy is `main → staging only` (D-07). No PR previews configured.
- Custom domain (michellengo.net) deferred to Phase 7 (D-08). Currently using
  default GitHub Pages host.
- To flip indexing at Phase 7:
  - Replace `Disallow: /` in `static/robots.txt` with `Allow: /` (or remove)
  - Remove the `<meta name="robots" content="noindex, nofollow">` line from
    `src/routes/+layout.svelte`
- To flip to custom domain:
  - Add `static/CNAME` containing `michellengo.net`
  - Either drop the `BASE_PATH` injection in the workflow (root deploy) or
    keep it if hosting under a subpath
  - Configure DNS to point at GitHub Pages
  - Repo Settings → Pages → set custom domain

---
Recorded after first successful GitHub Pages deploy on 2026-05-10.
