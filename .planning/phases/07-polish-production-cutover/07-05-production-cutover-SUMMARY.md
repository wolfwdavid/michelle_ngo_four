---
phase: 07-polish-production-cutover
plan: 05
subsystem: infra
tags: [github-pages, custom-domain, cname, dns-cutover, base-path, robots-flip, launch-runbook, deferral, v1.0-launch]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: GitHub Pages auto-deploy workflow (.github/workflows/deploy.yml) at wolfwdavid.github.io/michelle_ngo_four/ with BASE_PATH=/michelle_ngo_four — the staging path this plan preserves via D-02 environment split
  - phase: 04-reel-led-home
    provides: HeroPoster.svelte D-04..D-07 perf budget intact at source (15.4KB WebP + preload + fetchpriority=high + loading=eager) — what production telemetry will measure
  - phase: 07-polish-production-cutover
    provides: Plans 07-01 / 07-02 / 07-03 / 07-04 established the Phase 7 pragmatic-deferral chain (defer-with-fallback, fast-path acceptance, accepted-deferred terminal state) — this plan is the fifth link
provides:
  - static/CNAME committed (D-01) — every build artifact (staging AND production) now carries the apex-domain assertion
  - .github/workflows/deploy-production.yml committed (D-02) — manual-dispatch production workflow building with BASE_PATH='' for the apex domain; sibling to staging deploy.yml (unchanged)
  - Self-contained Launch Runbook (this SUMMARY § Launch Runbook) covering pre-flight push → workflow trigger → custom-domain config → cert wait → pre-DNS curl --resolve verification → atomic noindex+robots flip → post-flip re-verification → registrar DNS swap → post-cutover verification → rollback path
  - Concurrency group share (`group: pages`) between staging and production workflows preventing mid-flight clobber
  - "Verify CNAME in build artifact" guard step in deploy-production.yml — fails fast if D-01 assertion ever drops out of the artifact
affects: [post-v1.0-cutover-event (runbook is binding), post-v1.0-backlog (favicon set + OG image + IMDb/LinkedIn URL swap + post-launch LCP telemetry)]

# Tech tracking
tech-stack:
  added:
    - .github/workflows/deploy-production.yml (manual-dispatch production deploy with BASE_PATH='')
    - static/CNAME (GitHub Pages custom-domain assertion baked into every build artifact)
  patterns:
    - "D-02 environment split via per-workflow BASE_PATH env var: staging keeps BASE_PATH=/michelle_ngo_four (deploy.yml on push-to-main) for wolfwdavid.github.io/michelle_ngo_four/; production builds with BASE_PATH='' (deploy-production.yml on workflow_dispatch) for michellengo.net apex. Both share concurrency group `pages` so they cannot race. svelte.config.js's `paths.base: process.env.BASE_PATH ?? ''` is the single override hook — no source code branches on environment."
    - "Documented-runbook-as-deliverable for tasks that are pure human action (multi-hour cert waits + registrar DNS + dashboard UI clicks). When Claude has no API to perform the steps, the SUMMARY § Launch Runbook becomes the binding artifact: numbered, gated, self-contained, with rollback path. User executes it outside the GSD workflow on cutover day — no re-entry required."
    - "Verify-then-flip cutover sequence (D-03): infrastructure ships (CNAME + production workflow) → human configures GH Pages custom domain → cert provisions → curl --resolve verifies the apex serves the build BEFORE DNS swap → atomic noindex+robots flip (D-16 one-way door) → post-flip re-verification → registrar DNS swap (the launch event). Every step before the DNS swap is reversible; the DNS swap is the commit point."

key-files:
  created:
    - static/CNAME (1 line — `michellengo.net`)
    - .github/workflows/deploy-production.yml (63 lines — manual-dispatch production deploy)
    - .planning/phases/07-polish-production-cutover/07-05-production-cutover-SUMMARY.md (this file)
  modified:
    - .planning/STATE.md (plan counter advanced 5/5; cutover-day blocker recorded)
    - .planning/ROADMAP.md (Plan 07-05 marked complete)

key-decisions:
  - "User selected stop-at-infrastructure-ready (2026-05-16): infrastructure work (Tasks 1-2) shipped at commits d298774 + 89c795a; remaining Tasks 3-7 (custom-domain config, cert wait, curl --resolve apex verification, D-16 atomic noindex+robots flip, production workflow re-trigger, registrar DNS swap) captured as a self-contained Launch Runbook in this SUMMARY for user execution on cutover day outside the GSD workflow."
  - "Plan status terminal state = accepted-deferred (NOT passed). The Plan IS complete at the workflow level (the runbook IS the deliverable for Tasks 3-7) but FOUND-03's cutover-launch criterion ('production deploy reachable on its final hosting URL with HTTPS') is parked to the user's runbook execution, not satisfied by a measured DNS-resolves-to-GH-Pages event. Marking 'passed' would falsely imply the DNS swap shipped."
  - "Consistent with Phase 7 pragmatic-deferral chain: 07-01 (channel-homepage IMDb/LinkedIn URLs accepted at v1.0), 07-02 (favicon + OG placeholders accepted), 07-03 (fast-path QA acceptance), 07-04 (Lighthouse → post-launch real-user telemetry), 07-05 (cutover execution → user runbook). Cutover-day involves GH Pages dashboard + Let's Encrypt cert wait (15-60 min) + DNS registrar — all human action with multi-hour wait windows the GSD workflow has no value in mediating. Infrastructure (CNAME + production workflow) is the meaningful code deliverable; runbook is the binding contract for the human steps."
  - "D-02 staging path preserved: .github/workflows/deploy.yml is UNCHANGED (`BASE_PATH: /${{ github.event.repository.name }}` still in place at line 40). Staging will continue auto-deploying to wolfwdavid.github.io/michelle_ngo_four/ on push to main, side-by-side with the (manual-dispatch) production workflow. Both workflows share concurrency group `pages` — only one can run at a time, preventing mid-flight clobber."

patterns-established:
  - "Pause-with-pre-resume-marker commit pattern: when execution legitimately pauses mid-plan at a checkpoint, commit a STATE.md update (cb91a46 in this case) capturing the pause point + resume context BEFORE the new context window arrives. The continuation agent verifies the prior commit hashes exist, reads the pause marker, and knows exactly where to resume from. Cleaner than relying on the prompt's <completed_tasks> table alone."
  - "Cutover-day runbook discipline: every step gated (do NOT proceed past a failed step) + verification command embedded inline (curl --resolve … grep -c) + rollback path documented (registrar DNS revert with TTL=300s) + one-way doors marked explicitly (D-16 atomic flip = ONE-WAY DOOR after deploy). Mirrors aviation-checklist shape so a stressed user reading at 6am cutover-morning cannot accidentally skip a verification or break the atomicity contract."
  - "Pragmatic-deferral chain across an entire phase: when 5/5 plans in a phase land defer-with-fallback or stop-at-infrastructure-ready resolutions, the pattern is itself precedent — the deferral chain becomes the phase's signature outcome rather than an exception. The bar for switching back to measure-now/execute-now is whether the underlying code-level contract is intact (here: hero perf budget + CNAME assertion + BASE_PATH split); if yes, defer/runbook; if no, re-checkpoint."

requirements-completed: []  # FOUND-03 was listed in PLAN frontmatter (D-05 closes all rows + DNS launch event). This plan's deliverable is the runbook + infrastructure, NOT the cutover itself. FOUND-03 was already reconciled to Accepted-Deferred in 07-04 SUMMARY (status row in REQUIREMENTS.md mentions post-launch real-user telemetry as the measured signal); marking it complete here would conflict with 07-04's terminal state. Leaving as [] preserves traceability honesty.

# Metrics
duration: ~25 min (Tasks 1-2 execution before pause) + ~15 min (continuation: runbook authoring + state advance)
completed: 2026-05-16
status: accepted-deferred
---

# Phase 7 Plan 05: Production Cutover Summary

**Cutover infrastructure shipped (CNAME assertion + manual-dispatch production deploy workflow with BASE_PATH=''); remaining human-action steps (custom-domain config + cert wait + atomic noindex+robots flip + registrar DNS swap) documented as a self-contained Launch Runbook for user execution on cutover day per user decision to stop-at-infrastructure-ready (2026-05-16).**

## Performance

- **Duration:** ~25 min (Tasks 1-2 first session) + ~15 min (continuation agent: runbook authoring + state advance)
- **Started:** 2026-05-16 (Tasks 1-2 first session)
- **Continuation:** 2026-05-16T15:14:34Z (this SUMMARY pass)
- **Completed:** 2026-05-16
- **Tasks:** 2/7 executed; 5/7 documented as runbook
- **Files modified:** 5 (2 source: static/CNAME + .github/workflows/deploy-production.yml; 3 planning: this SUMMARY + STATE.md + ROADMAP.md)

## Accomplishments

- **D-01 CNAME assertion baked into every build artifact** — `static/CNAME` (1 line) ships in both staging AND production builds; staging URL ignores it harmlessly; production build artifact carries `build/CNAME = michellengo.net` for GitHub Pages custom-domain pickup
- **D-02 production deploy workflow** — `.github/workflows/deploy-production.yml` (manual-dispatch only, BASE_PATH=''), with a fail-fast "Verify CNAME in build artifact" guard step catching the D-01 footgun where the CNAME file could accidentally drop out of the artifact
- **D-02 staging path preserved** — `.github/workflows/deploy.yml` UNCHANGED at line 40 (`BASE_PATH: /${{ github.event.repository.name }}`); staging continues auto-deploying to `wolfwdavid.github.io/michelle_ngo_four/` on push-to-main, side-by-side with the new production workflow; both share `concurrency.group: pages` so they cannot race
- **Self-contained Launch Runbook** — the load-bearing deliverable for Tasks 3-7 (and for the registrar DNS swap which is outside the plan but on cutover day). 9 gated steps + rollback path + one-way-door warnings + inline verification commands; user reads only this SUMMARY § Launch Runbook on cutover day

## Task Commits

1. **Task 1: Create static/CNAME with apex domain** — `d298774` (feat) — `feat(07-05): add static/CNAME asserting michellengo.net (D-01)`
2. **Task 2: Create production deploy workflow (BASE_PATH='')** — `89c795a` (feat) — `feat(07-05): add production GH Pages deploy workflow with BASE_PATH='' (D-02)`
3. **Task 3-7: documented as Launch Runbook (no execution)** — runbook lives in this SUMMARY § Launch Runbook; user executes on cutover day

**Pause marker commit:** `cb91a46` — `docs(07-05): pause execution at Task 3 checkpoint (human-action)`

**Plan metadata:** _TBD on this commit pass (this SUMMARY + STATE.md + ROADMAP.md)_

## Files Created/Modified

### Source
- `static/CNAME` — created — 1 line (`michellengo.net`) — GitHub Pages custom-domain assertion baked into every build artifact (D-01)
- `.github/workflows/deploy-production.yml` — created — 63 lines — manual-dispatch production deploy with `BASE_PATH: ''`, fail-fast CNAME guard step, shares `concurrency.group: pages` with staging (D-02)

### Planning
- `.planning/phases/07-polish-production-cutover/07-05-production-cutover-SUMMARY.md` — this file (the runbook + decisions)
- `.planning/STATE.md` — plan counter advanced 5/5; cutover-day blocker recorded; decision logged
- `.planning/ROADMAP.md` — Plan 07-05 marked complete; Phase 7 progress table row updated to 5/5

### NOT touched
- `src/routes/+layout.svelte` — `<meta name="robots" content="noindex, nofollow" />` STAYS at line 15 until the user's D-16 atomic-flip commit on cutover day (Step 6 in the runbook below)
- `static/robots.txt` — `User-agent: *\nDisallow: /` STAYS until the user's D-16 atomic-flip commit on cutover day (Step 6 in the runbook below)
- `.github/workflows/deploy.yml` — UNCHANGED at every line (D-02 staging path preservation)

## Launch Runbook

*Execute these steps on cutover day. Each step is gated; do NOT proceed past a failed step. Estimated total wall-clock: 60-120 min including the 15-60 min cert-provisioning wait.*

### Pre-Flight (one-time, anytime before cutover)

1. Push the infrastructure commits to `origin/main`:
   ```
   git push origin main
   ```
   Confirms commits `d298774` (static/CNAME), `89c795a` (deploy-production.yml), `cb91a46` (STATE pause marker), plus this SUMMARY's plan-metadata commit land on the remote.

2. Verify the production workflow is discoverable in GitHub's Actions UI:
   - Open https://github.com/wolfwdavid/michelle_ngo_four/actions
   - Confirm "Deploy to GitHub Pages (production / apex)" appears in the workflow list (left sidebar)

### Step 1 — Trigger production build (5 min wall-clock)

- Open https://github.com/wolfwdavid/michelle_ngo_four/actions
- Click "Deploy to GitHub Pages (production / apex)" in the left sidebar
- Click "Run workflow" (top-right) → select branch `main` → click "Run workflow"
- Wait for green check (~3 min)
- Expand the build job → expand the "Verify CNAME in build artifact" step → confirm output is:
  ```
  build/CNAME content: michellengo.net
  ```

If the workflow fails or the CNAME content is wrong, STOP. The plan's D-01 assertion has regressed.

### Step 2 — Add custom domain in repo settings (2 min)

- Open https://github.com/wolfwdavid/michelle_ngo_four/settings/pages
- Under "Custom domain", enter: `michellengo.net`
- Click "Save"
- Expect a yellow "DNS check unsuccessful" message — this is NORMAL because DNS still points to WordPress.com. The CNAME file in the build artifact tells GH Pages this is the intended apex; the yellow icon will flip green once DNS resolves to GH Pages in Step 8.

### Step 3 — Wait for cert provisioning (15-60 min wall-clock, polling)

- Refresh https://github.com/wolfwdavid/michelle_ngo_four/settings/pages periodically (every 5-10 min)
- The yellow icon next to `michellengo.net` flips green when Let's Encrypt cert lands
- The "Enforce HTTPS" checkbox becomes selectable

If cert provisioning hangs past 2 hours, the most common cause is that GH Pages cannot reach the domain for the ACME challenge. Remove the custom domain, re-save it, and the provisioner re-tries.

### Step 4 — Enable Enforce HTTPS (10 sec)

- Check the "Enforce HTTPS" checkbox in the Pages settings UI
- Save (some UIs auto-save; some require a button click)

### Step 5 — Pre-DNS-flip verification via curl --resolve (5 min)

*Proves GH Pages serves the apex build BEFORE the DNS swap. The IP is GH Pages's anycast set; `--resolve` overrides DNS for the single curl invocation so we test the apex while real DNS still points to WordPress.*

```
# GH Pages IPv4 apex anycast addresses (any one works):
#   185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153

# Headers — confirm GH Pages is serving (NOT WordPress)
curl --resolve michellengo.net:443:185.199.108.153 https://michellengo.net/ -I

# Body — confirm SvelteKit build markers present, WordPress markers absent
curl --resolve michellengo.net:443:185.199.108.153 https://michellengo.net/ -s -o /tmp/apex-home.html
grep -c "favicon-192.png" /tmp/apex-home.html        # expect: >=1 (D-11 favicon set)
grep -c "Michelle Ngo" /tmp/apex-home.html           # expect: >=1
grep -c "wp-content" /tmp/apex-home.html             # expect: 0 (MUST be 0 — wp-content means WP is serving)
grep -c "noindex" /tmp/apex-home.html                # expect: >=1 (noindex still in place pre-Step-6 flip)

# /work
curl --resolve michellengo.net:443:185.199.108.153 https://michellengo.net/work/ -s -o /tmp/apex-work.html
grep -c "Work — Michelle Ngo" /tmp/apex-work.html    # expect: >=1 (Plan 07-02 D-13 per-page title)

# /watch/264677021 (Producer's Reel, has VideoObject JSON-LD per Plan 07-02)
curl --resolve michellengo.net:443:185.199.108.153 https://michellengo.net/watch/264677021/ -s -o /tmp/apex-watch.html
grep -c "VideoObject" /tmp/apex-watch.html           # expect: >=1

# /sitemap.xml (Plan 07-02 endpoint)
curl --resolve michellengo.net:443:185.199.108.153 https://michellengo.net/sitemap.xml -s -o /tmp/apex-sitemap.xml
grep -c "<url>" /tmp/apex-sitemap.xml                # expect: >=70
```

Expected response headers from the first curl:
- `HTTP/2 200`
- `server: GitHub.com`
- `content-type: text/html`

If you see HTTP/2 404, non-GitHub `server` header, or wp-content > 0, STOP — re-trigger Step 1 (workflow may not have deployed cleanly) and re-verify before proceeding.

### Step 6 — Atomic noindex+robots flip (D-16 — ONE-WAY DOOR)

*This commit makes the site indexable. After this commit deploys, search engines may start crawling and the closed-policy → open-policy transition is effectively irreversible (you cannot un-crawl). Both files MUST change in ONE commit so search engines never see a half-flipped state.*

**File 1: `src/routes/+layout.svelte`** — find this line (currently line 15) in `<svelte:head>`:

```html
<meta name="robots" content="noindex, nofollow" />
```

DELETE the line entirely (absence of the meta tag = crawler default = index, follow — the cleanest open policy per D-16 Claude's-Discretion guidance). Do NOT replace with `<meta name="robots" content="index, follow" />` — that would be redundant noise.

**File 2: `static/robots.txt`** — current 2-line content:

```
User-agent: *
Disallow: /
```

REPLACE entirely with this 3-line content (trailing newline, no other directives):

```
User-agent: *
Allow: /

Sitemap: https://michellengo.net/sitemap.xml
```

**Single atomic commit** (both files in ONE `git add` + ONE `git commit`):

```
git add src/routes/+layout.svelte static/robots.txt
git commit -m "feat(07-05): atomic noindex+robots flip — site is now indexable (D-16)"
git push origin main
```

### Step 7 — Trigger production workflow with the flipped build (5 min)

- Open https://github.com/wolfwdavid/michelle_ngo_four/actions
- Click "Deploy to GitHub Pages (production / apex)" → "Run workflow" → branch `main` → "Run workflow"
- Wait for green check

Re-run the Step 5 curl verification commands and confirm the flip landed in the deployed artifact:

```
curl --resolve michellengo.net:443:185.199.108.153 https://michellengo.net/ -s | grep -c "noindex"
# expect: 0 (meta tag removed)

curl --resolve michellengo.net:443:185.199.108.153 https://michellengo.net/robots.txt -s
# expect: User-agent: * / Allow: / / blank line / Sitemap: https://michellengo.net/sitemap.xml
```

If `noindex` count is not 0, the build picked up the wrong commit — re-trigger the workflow and re-verify.

### Step 8 — DNS swap at registrar (the actual cutover — one-way door)

*This is the launch event. Every step before this was reversible without users noticing. The DNS swap is the commit point.*

Optional but recommended pre-step (at least 1 hour before the swap):
- Log into the domain registrar holding `michellengo.net`
- Change the TTL on the existing A records pointing to WordPress.com to **300 seconds (5 minutes)**
- Save and wait at least 1 hour so caches converge on the new short TTL — this gives a fast rollback window if the swap goes wrong

At the scheduled swap time:
- Log into the domain registrar
- Locate the DNS records for `michellengo.net`
- Remove the existing A records pointing to WordPress.com IPs
- Add four new A records pointing to GH Pages apex anycast IPs:
  ```
  A    @    185.199.108.153
  A    @    185.199.109.153
  A    @    185.199.110.153
  A    @    185.199.111.153
  ```
- Remove any existing record for `www.michellengo.net`
- Add: `CNAME www  wolfwdavid.github.io`
- Save changes

DNS propagation typically completes within 5 minutes - 1 hour for fresh records (with the TTL=300s prep above); some recursive resolvers may take up to 48 hours, but the majority of traffic sees the new records quickly.

### Step 9 — Post-cutover verification

After ~5-15 minutes of propagation, verify:

```
# DNS now resolves to GH Pages
dig michellengo.net +short
# expect: 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153

# Apex serves over HTTPS without the --resolve override
curl -I https://michellengo.net/
# expect: HTTP/2 200, server: GitHub.com

# www redirects to apex (or matches)
curl -I https://www.michellengo.net/
# expect: HTTP/2 200 OR HTTP/2 301 → https://michellengo.net/
```

In a browser:
- https://michellengo.net loads the new SvelteKit site (NOT WordPress)
- The PLAY REEL CTA in the hero works
- /work / /press / /about / /contact / /pbs-american-portrait all load

In GitHub:
- https://github.com/wolfwdavid/michelle_ngo_four/settings/pages now shows a green checkmark next to `michellengo.net` with no DNS errors

### Rollback (if cutover fails after Step 8)

The DNS swap is the ONLY step from this runbook that affects real users. If anything goes wrong after Step 8:

- Log back into the domain registrar
- Restore the previous WordPress.com A records (and remove the GH Pages A records + `www` CNAME)
- Wait DNS propagation back — with TTL=300s prep from Step 8, completion is typically < 5 min
- Site is back on WordPress while you diagnose
- The GH Pages deploy persists — it remains reachable at https://wolfwdavid.github.io/michelle_ngo_four/ (the staging URL) for continued debugging
- Re-attempt the cutover from Step 8 (the runbook from Step 1 through Step 7 does NOT need to be re-run — the production GH Pages config is sticky)

Note: the D-16 atomic flip (Step 6) is NOT rolled back by the DNS revert — search engines that already crawled may have indexed pages. This is expected and acceptable. If the site stays on WordPress for an extended period after a failed cutover, consider reverting the D-16 commit and re-deploying to GH Pages so the (still-reachable) staging URL doesn't get indexed mid-debugging.

## Decisions Made

- **Stop-at-infrastructure-ready (2026-05-16)** — user explicitly chose to ship Tasks 1-2 as code and document Tasks 3-7 as the Launch Runbook above. Rationale: cutover-day involves GH Pages dashboard UI + 15-60 min Let's Encrypt cert wait + registrar DNS — all human action with multi-hour wait windows the GSD workflow has no value in mediating. Code-meaningful work (CNAME + production workflow) is the deliverable; runbook is the binding contract for the human steps.
- **Plan status = accepted-deferred (NOT passed)** — consistent with 07-01, 07-04 terminal-state pattern. The Plan IS complete at the workflow level; FOUND-03's cutover criterion is parked to the user's runbook execution.
- **D-02 staging path preserved verbatim** — `.github/workflows/deploy.yml` was NOT touched. Two workflows coexist with shared concurrency. This means after the DNS cutover, push-to-main still triggers a deploy with BASE_PATH=/michelle_ngo_four to the staging URL — useful for parallel testing and rollback. If the staging URL feels noisy post-launch, defer to a post-v1.0 cleanup (delete deploy.yml, or guard it behind `if: github.event_name == 'workflow_dispatch'`).
- **D-16 atomic flip kept as user-runbook step, NOT pre-staged** — even though Claude could have authored the noindex-removal + robots.txt edits and committed them now (with the production workflow staying un-triggered), staging them pre-cutover would mean the next push-to-main triggers staging deploy with an open robots.txt, potentially leaking the staging URL to crawlers if someone discovered it. Keeping the flip as the user's atomic commit on cutover day ties indexability to the production deploy event.

## Deviations from Plan

**Total source-code deviations:** 0 — Tasks 1-2 executed exactly as specified in the plan.

**Workflow deviation:** Tasks 3-7 deferred to user execution via Launch Runbook per user decision to stop-at-infrastructure-ready. This is NOT an auto-fix (no Rule 1-3 applied); it is a deliberate user decision recorded in the decisions section above. The PLAN's tasks 3, 4, 6, 7 were already `type="checkpoint:human-action"` style or curl-verification work; Task 5 (D-16 atomic flip) was the only `type="auto"` task in the 3-7 range, and the user chose to keep it as a cutover-day atomic commit rather than pre-stage it.

**Impact on plan:** None — runbook captures all of Tasks 3-7 verbatim plus the registrar DNS swap. No success criterion silently dropped; FOUND-03's launch criterion is explicitly parked (consistent with 07-04's accepted-deferred reconciliation).

## Issues Encountered

None — Tasks 1-2 verification (`test -f static/CNAME`, `grep -c "BASE_PATH: ''" .github/workflows/deploy-production.yml`, `grep -c "workflow_dispatch"`, `grep -c "Verify CNAME"`) all passed at first run. Pause-at-checkpoint was clean (cb91a46 captures the state).

## User Setup Required

**Cutover day:** execute the Launch Runbook in this SUMMARY (§ Launch Runbook above). All 9 steps + rollback path are documented inline; no other files needed. Estimated wall-clock: 60-120 min including the 15-60 min cert-provisioning wait.

**Post-cutover backlog** (not launch blockers):

- **Favicon set + OG image** (carried from Plan 07-02 backlog) — author proper favicons (`favicon-{16,32,192,512}.png` + `apple-touch-icon.png` + `favicon.ico`) from a 512×512 MN white-on-neutral-950 master AND export a 1200×630 OG image crop from `hero-poster.webp` to `static/og-image.jpg`. Drop into `static/` overwriting placeholders. No source code change needed.
- **IMDb + LinkedIn personalized URLs** (carried from Plan 07-01 + 07-02 backlog) — swap channel-homepage URLs in `src/lib/components/ContactBlock.svelte` (`IMDB_URL` + `LINKEDIN_URL` constants) for Michelle's personalized profile URLs when materializable. Tests pass without modification as long as new URLs still contain `imdb.com` / `linkedin.com`. Also update Person JSON-LD `sameAs` array in `src/routes/about/+page.svelte` if Plan 07-02 wired URLs there.
- **Post-launch LCP telemetry** (carried from Plan 07-04 backlog) — monitor production LCP via real-user telemetry (Cloudflare Pages Analytics built-in OR Plausible v2 ANLT-01); if > 2.0s on `/`, reopen FOUND-03 and apply D-08 escalation: (a) AVIF variant via `<picture>` + WebP fallback in `src/lib/components/HeroPoster.svelte`, (b) mobile portrait crop, (c) drop `eager={true}` on featured-grid in `src/routes/+page.svelte`. Stop at first step that clears 2.0s.
- **WordPress.com legacy site** — once cutover is verified stable for 1-2 weeks, decide what to do with the WordPress.com site (cancel subscription, archive content, set up a 301 redirect from any WP-side URLs to apex). The DNS swap alone disconnects WordPress from `michellengo.net`; the WP site itself remains at the WordPress.com subdomain until cancelled.

## Next Phase Readiness

- **Phase 7 status:** complete-pending-cutover. All 5 plans landed terminal status (07-01 accepted-deferred / 07-02 complete / 07-03 complete / 07-04 accepted-deferred / 07-05 accepted-deferred).
- **No subsequent phases planned** — this is v1.0. Phase 8+ would be post-launch iteration (analytics, v2 requirements from REQUIREMENTS.md).
- **Cutover-day blocker** (NOT a planning blocker — a real-world action item): execute the Launch Runbook above. No GSD-workflow re-entry needed; the runbook is self-contained.

## Self-Check: PASSED

Verified:
- Prior commits exist: `d298774` (CNAME), `89c795a` (deploy-production.yml), `cb91a46` (pause marker) — confirmed via `git log --oneline -10`
- `static/CNAME` exists with content `michellengo.net` — confirmed via Read tool
- `.github/workflows/deploy-production.yml` exists with `BASE_PATH: ''` (line 41) + `workflow_dispatch:` trigger (line 7) + "Verify CNAME in build artifact" step (line 44) — confirmed via Read tool
- `.github/workflows/deploy.yml` UNCHANGED at line 40 (`BASE_PATH: /${{ github.event.repository.name }}`) — confirmed via Read tool
- `src/routes/+layout.svelte` STILL contains `<meta name="robots" content="noindex, nofollow" />` at line 15 (D-16 flip is the user's cutover-day step, not pre-staged) — confirmed via Read tool
- `static/robots.txt` STILL contains `User-agent: *\nDisallow: /` (D-16 flip is the user's cutover-day step, not pre-staged) — confirmed via Read tool
- No source-code changes made by this continuation pass

---
*Phase: 07-polish-production-cutover*
*Plan: 05 — production-cutover*
*Completed: 2026-05-16*
*Status: accepted-deferred (infrastructure shipped; runbook documents cutover-day execution)*
