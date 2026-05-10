---
phase: 01-foundation
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md
autonomous: false
requirements: [FOUND-02]
requirements_addressed: [FOUND-02]
user_setup:
  - service: cloudflare-pages
    why: "Hosting target locked per D-05; staging deploys from main branch on every push"
    env_vars:
      - name: NODE_VERSION
        value: "22"
        source: "Cloudflare Pages dashboard -> Project -> Settings -> Environment variables -> Production"
      - name: PNPM_VERSION
        value: "<exact local pnpm version captured in plan 01-01 task 1 step 1>"
        source: "Cloudflare Pages dashboard -> Project -> Settings -> Environment variables -> Production"
    dashboard_config:
      - task: "Create Cloudflare Pages project connected to the GitHub repository"
        location: "Cloudflare dashboard -> Workers and Pages -> Create application -> Pages -> Connect to Git"
        details: "Project name: michelle-ngo (fallback: michelle-ngo-portfolio). Production branch: main. Build command: pnpm build. Build output directory: build. Root directory: (leave empty)."
      - task: "Set NODE_VERSION and PNPM_VERSION environment variables BEFORE first build"
        location: "Project -> Settings -> Environment variables (Production)"
        details: "CF Pages v3 build image does NOT auto-detect pnpm version from pnpm-lock.yaml (RESEARCH.md Pitfall 1). Both vars must be set or the first build will fail with ERR_PNPM_LOCKFILE_VERSION_MISMATCH or use the wrong Node."
must_haves:
  truths:
    - "Pushing a commit to the main branch triggers an automatic Cloudflare Pages build"
    - "The Cloudflare build runs `pnpm build` successfully and publishes the build/ directory"
    - "The deployed site is reachable at a public *.pages.dev URL over HTTPS"
    - "The staging URL serves the smoke-test splash with the MICHELLE NGO wordmark"
    - "The deployed robots.txt and meta noindex still block crawlers"
  artifacts:
    - path: ".planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md"
      provides: "Deployment record: project name, *.pages.dev URL, env var values, first-deploy timestamp"
      contains: "pages.dev"
  key_links:
    - from: "GitHub main branch"
      to: "Cloudflare Pages project"
      via: "Git integration webhook (configured in CF dashboard)"
      pattern: "main -> CF Pages auto-deploy"
    - from: "Cloudflare Pages build environment"
      to: "pnpm-lock.yaml"
      via: "PNPM_VERSION env var matching local pnpm version"
      pattern: "PNPM_VERSION=<version>"
    - from: "Cloudflare Pages build output"
      to: "*.pages.dev"
      via: "build/ directory served as static assets over HTTPS"
      pattern: "Build output directory: build"
---

<objective>
Deploy the Phase 1 scaffold to Cloudflare Pages with a Git integration that automatically rebuilds and publishes on every push to `main`. Configure the v3 build image with explicit `NODE_VERSION=22` and `PNPM_VERSION=<local>` environment variables (RESEARCH.md Pitfall 1), connect the GitHub repo, push the scaffold, and verify the public `*.pages.dev` URL serves the splash route over HTTPS. Record the deployment artifacts (project name, URL, timestamps) in a deploy notes file for downstream phases.

Purpose: Satisfy FOUND-02 in full and unblock every later phase from automatic staging deploys. After this plan, every commit to `main` becomes observable on the staging URL within minutes.

Output:
- A Cloudflare Pages project named `michelle-ngo` (or `michelle-ngo-portfolio` if taken) connected to the GitHub repo.
- A live `*.pages.dev` URL serving the MICHELLE NGO splash with the noindex meta tag intact.
- `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` recording the project name, URL, env var values, and the timestamp of the first successful deploy.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-VALIDATION.md
@.planning/phases/01-foundation/01-foundation-01-SUMMARY.md
@CLAUDE.md
</context>

<interfaces>
<!-- Contract surface from plan 01-01 + Cloudflare Pages config from RESEARCH.md -->

Inputs from plan 01-01 (must exist before this plan starts):
- `pnpm-lock.yaml` at repo root (Cloudflare auto-detects pnpm via this file's presence)
- `package.json` with `"build": "vite build"` script
- `svelte.config.js` configured with `@sveltejs/adapter-static` outputting to `build/`
- `static/robots.txt` with `Disallow: /`
- `src/routes/+page.svelte` with the MICHELLE NGO splash
- Local pnpm version recorded in plan 01-01 SUMMARY (used as `PNPM_VERSION`)

Cloudflare Pages build settings (RESEARCH.md Code Examples):
```
Framework preset:    None (or SvelteKit; both work — adapter-static produces a plain static dir)
Build command:       pnpm build
Build output dir:    build
Root directory:      (leave empty — repo root)

Environment variables (Production):
  NODE_VERSION=22
  PNPM_VERSION=<local pnpm version from plan 01-01>
```

Critical: per RESEARCH.md Pitfall 1, CF Pages v3 build image does NOT auto-detect pnpm version from `pnpm-lock.yaml`. `PNPM_VERSION` MUST be set explicitly or the first build will fail.

Branch strategy (per D-07):
- `main` -> staging only (deploys to `*.pages.dev`)
- No PR previews in v1
- No production branch / no custom domain (deferred to Phase 7)
</interfaces>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Push Phase 1 scaffold to GitHub main branch</name>
  <files>(no repo files modified — this task pushes existing commits)</files>
  <read_first>
    - .planning/phases/01-foundation/01-foundation-01-SUMMARY.md (confirm plan 01-01 completed and pnpm-lock.yaml + build/ are present locally)
    - The output of `git status` and `git log --oneline -5` to see the current branch state
    - .planning/phases/01-foundation/01-CONTEXT.md (D-07: main -> staging only)
    - CLAUDE.md (GSD Workflow Enforcement: this task only pushes existing commits; no new edits to repo files)
  </read_first>
  <action>
    Confirm the local repo is on `main`, has the Phase 1 scaffold committed, and a GitHub remote configured. Then push to `main`. This task does NOT modify any repo files — it only ensures the remote has the scaffold so Cloudflare Pages has something to build.

    **Step 1 — Verify branch + clean tree:**
    Run `git status`. Confirm:
    - Current branch is `main` (per D-07).
    - Working tree is clean OR only contains uncommitted plan files. If `package.json`, `pnpm-lock.yaml`, `svelte.config.js`, etc. from plan 01-01 are uncommitted, STOP and surface the error — plan 01-01 should have committed those.

    **Step 2 — Verify GitHub remote is configured:**
    Run `git remote -v`. Confirm `origin` points to the GitHub repository for this project. If no remote is configured, STOP — this is a user-provided value (the user must have created the GitHub repo and configured the remote during/before kickoff). Surface a clear error: "No `origin` remote configured. Add the GitHub remote: `git remote add origin git@github.com:<user>/<repo>.git`, then re-run this task."

    **Step 3 — Confirm there are commits to push:**
    Run `git log origin/main..HEAD --oneline` (if origin/main exists) or `git log --oneline -10` (if no upstream yet). Either way, the recent log should include the plan 01-01 scaffold commit(s). If empty, STOP — plan 01-01's commit was lost or the branch is wrong.

    **Step 4 — Push to main:**
    If `main` already tracks `origin/main`: run `git push`.
    If `main` has no upstream: run `git push -u origin main`.

    The push must succeed. If GitHub rejects the push (non-fast-forward, branch protection), surface the error verbatim — do not force-push.

    **Step 5 — Record the pushed commit SHA** for use in the deploy notes (Task 3). Capture from `git rev-parse HEAD`.
  </action>
  <verify>
    <automated>git rev-parse HEAD; git status; git log origin/main -1 --oneline</automated>
  </verify>
  <acceptance_criteria>
    - Command `git status` reports either a clean working tree or only planning-doc changes (no uncommitted source files from plan 01-01)
    - Command `git rev-parse --abbrev-ref HEAD` outputs `main`
    - Command `git remote -v` lists at least one remote named `origin`
    - Command `git log origin/main -1 --oneline` succeeds (origin/main exists and has at least one commit)
    - Command `git rev-parse HEAD` matches `git rev-parse origin/main` (local main is fully pushed)
    - The pushed commit history includes the plan 01-01 scaffold (grep `git log --oneline -20` for any of: `scaffold`, `foundation`, `01-01`, `sveltekit`, `tailwind`)
  </acceptance_criteria>
  <done>
    - The local `main` branch is fully pushed to GitHub origin/main.
    - The scaffold commits from plan 01-01 are visible on GitHub.
    - Cloudflare Pages now has a buildable commit to point its Git integration at.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 2: Create the Cloudflare Pages project and set environment variables (manual one-time setup)</name>
  <files>(no repo files modified — this task configures the external Cloudflare service)</files>
  <read_first>
    - .planning/phases/01-foundation/01-foundation-01-SUMMARY.md (find the local pnpm version recorded by plan 01-01 task 1 step 1 — needed for PNPM_VERSION below)
    - .planning/phases/01-foundation/01-RESEARCH.md, Common Pitfalls 1 (CF Pages v3 pnpm auto-detection broken; PNPM_VERSION env var required)
    - .planning/phases/01-foundation/01-CONTEXT.md (D-05 Cloudflare Pages free tier, D-07 main -> staging only, D-08 default *.pages.dev URL)
  </read_first>
  <action>
    Plan 01-01 produced a clean SvelteKit + Tailwind v4 scaffold that builds locally with `pnpm build`. Task 1 of this plan pushed it to GitHub origin/main. The remaining work (creating the Cloudflare Pages project + connecting the Git integration + setting env vars) is the only step Claude literally cannot automate without authenticated Cloudflare API credentials, which the user has not provided.

    This is the one-time setup. After this task completes, every push to `main` triggers an automatic deploy with no further human action.
  
  
    Perform these steps in the Cloudflare dashboard. Once finished, return to Claude with the assigned `*.pages.dev` URL and the deploy status.

    **Step 1 — Create the Pages project (Cloudflare dashboard):**
    1. Sign in at https://dash.cloudflare.com.
    2. Navigate: Workers and Pages -> Create application -> Pages -> Connect to Git.
    3. Authorize the Cloudflare GitHub app for the repository if not already authorized.
    4. Select the GitHub repository for this project.
    5. Project name: `michelle-ngo` (if taken, use `michelle-ngo-portfolio`). Note the chosen name — you'll report it to Claude.
    6. Production branch: `main`.
    7. Framework preset: leave as `None` (or pick `SvelteKit` — either works; adapter-static produces a plain static dir).
    8. Build command: `pnpm build`
    9. Build output directory: `build`
    10. Root directory: leave empty.

    **Step 2 — Set environment variables BEFORE the first build runs:**
    1. After project creation, go to: Project -> Settings -> Environment variables.
    2. Under Production, add two variables:
       - `NODE_VERSION` = `22`
       - `PNPM_VERSION` = `<the exact pnpm version from plan 01-01 SUMMARY>` (e.g., `10.11.1`)
    3. Save.

    Per RESEARCH.md Pitfall 1: if you skip `PNPM_VERSION`, the build will fail with `ERR_PNPM_LOCKFILE_VERSION_MISMATCH` or use a default pnpm version that does not match the lockfile. Both env vars are required.

    **Step 3 — Trigger the first deploy:**
    Either:
    (a) Click "Save and Deploy" at the end of project creation (this uses the env vars set in step 2 — make sure step 2 happens first via the "Environment variables" link in the create-project flow OR cancel and add env vars before the first deploy), OR
    (b) Push any small commit to `main` to trigger a fresh deploy that picks up the env vars.

    Watch the build logs in the dashboard. The build should:
    - Use Node 22 (visible in build log header)
    - Use pnpm at the pinned version (visible early in build log: "Using pnpm vX.Y.Z")
    - Run `pnpm install` then `pnpm build` successfully
    - Publish the `build/` directory

    **Step 4 — Visit the assigned `*.pages.dev` URL:**
    The dashboard shows the URL after a successful deploy (e.g., `https://michelle-ngo.pages.dev` or `https://michelle-ngo-portfolio.pages.dev`).

    Open the URL in a browser. Confirm:
    1. Page loads over HTTPS (lock icon visible in the URL bar).
    2. Page renders the MICHELLE NGO wordmark and "Filmmaker. Site coming soon." tagline on a black background with white type.
    3. View source (or DevTools): `<meta name="robots" content="noindex, nofollow">` is present in `<head>`.
    4. Visit `https://<project>.pages.dev/robots.txt` — content is `User-agent: *` then `Disallow: /`.

    **Step 5 — Report back to Claude with these values:**
    - The Cloudflare project name you used (`michelle-ngo` or fallback)
    - The full `*.pages.dev` URL
    - The exact `PNPM_VERSION` value you set
    - Confirmation that the first build succeeded (yes/no + any error)
    - The timestamp of the successful deploy (UTC)

    These values get written into the deploy notes in Task 3.

    **If the build fails:**
    Common failure modes (per RESEARCH.md Pitfall 1):
    - `ERR_PNPM_LOCKFILE_VERSION_MISMATCH` -> `PNPM_VERSION` doesn't match local. Update the env var to match `pnpm --version` from your local machine, then trigger a redeploy.
    - "pnpm not found" -> `PNPM_VERSION` not set or set to an invalid version. Set it to the local version.
    - "Node version" errors -> set `NODE_VERSION=22`.
    - Anything else -> paste the error from the build log to Claude verbatim.
  </action>
  <verify>
    <automated>echo "Manual checkpoint — no automated verification. User must report Cloudflare Pages URL, project name, pnpm version, and first-deploy timestamp via the resume-signal below before Task 3 can proceed."</automated>
  </verify>
  <resume-signal>
    Type one of the following when finished:
    - `deployed: <url> (project: <name>, pnpm: <version>, time: <utc>)` — first deploy succeeded
    - `failed: <error excerpt>` — first deploy failed; Claude will diagnose
    - `cannot-proceed: <reason>` — blocked (e.g., GitHub auth issue, no Cloudflare account)
  </resume-signal>
  <acceptance_criteria>
    - User confirms Cloudflare Pages project exists and is connected to the GitHub repository
    - User confirms `NODE_VERSION=22` is set in production env vars
    - User confirms `PNPM_VERSION=<local version>` is set in production env vars (value matches the version recorded in plan 01-01 SUMMARY)
    - User confirms the first build succeeded (build log shows `pnpm install` and `pnpm build` exit 0)
    - User reports the `*.pages.dev` URL
    - User confirms HTTPS, the MICHELLE NGO splash renders, the noindex meta tag is present in page source, and `/robots.txt` serves `Disallow: /`
  </acceptance_criteria>
  <done>
    - Cloudflare Pages project is created, connected to GitHub `main`, and configured with `NODE_VERSION=22` + `PNPM_VERSION=<version>`.
    - First build succeeded and the splash route is reachable at the `*.pages.dev` URL over HTTPS.
    - User has reported the URL, project name, and pnpm version back to Claude for inclusion in Task 3.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Record deploy artifacts and verify end-to-end auto-deploy</name>
  <files>.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md</files>
  <read_first>
    - The user's resume-signal output from Task 2 (project name, *.pages.dev URL, pnpm version, first-deploy timestamp)
    - .planning/phases/01-foundation/01-CONTEXT.md (D-07, D-08 — staging strategy and URL conventions)
    - .planning/phases/01-foundation/01-foundation-01-SUMMARY.md (confirm pnpm version matches what user reported)
  </read_first>
  <action>
    Write the deploy notes file with the artifacts the user reported in Task 2, then trigger an end-to-end auto-deploy verification by pushing a trivial doc-only commit and confirming the new commit lands on the live URL.

    **Step 1 — Create `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md`** with this exact structure (substitute bracketed values from the user's Task 2 report):

    ```
    # Phase 1 — Cloudflare Pages Deployment Notes

    Recorded: <YYYY-MM-DD>
    Plan: 01-foundation / 01-02

    ## Project

    - Cloudflare Pages project name: <project name from user>
    - Production branch: main
    - Framework preset: <None | SvelteKit>
    - Build command: pnpm build
    - Build output directory: build
    - Root directory: (empty / repo root)

    ## Environment Variables (Production)

    - NODE_VERSION=22
    - PNPM_VERSION=<version from user>

    ## Staging URL

    - URL: https://<project>.pages.dev
    - HTTPS: confirmed
    - First successful deploy: <UTC timestamp from user>
    - First-deploy commit SHA: <git rev-parse origin/main at time of first deploy>

    ## Auto-deploy Verification

    - Trigger commit SHA: <SHA of the doc-only commit pushed in step 3>
    - Trigger commit message: docs(01): trigger CF Pages auto-deploy verification
    - Auto-deploy observed: yes
    - Verification timestamp (UTC): <when step 4 confirmed>

    ## Indexing Block (per D-11)

    - https://<project>.pages.dev/robots.txt -> Disallow: /  (confirmed)
    - View source on / -> meta name="robots" content="noindex, nofollow"  (confirmed)

    ## Notes for Phase 7 Cutover

    - Branch strategy is main -> staging only (D-07). No PR previews configured.
    - Custom domain (michellengo.net) deferred to Phase 7 (D-08). Currently using default *.pages.dev host.
    - To flip noindex at Phase 7: replace `Disallow: /` in `static/robots.txt` with `Allow: /` (or remove the file) AND remove the meta robots line from src/routes/+layout.svelte.

    ---
    Recorded after first successful Cloudflare Pages deploy on <date>.
    ```

    **Step 2 — Commit the deploy notes:**
    Use the GSD commit flow (per CLAUDE.md GSD Workflow Enforcement):
    ```
    git add .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md
    git commit -m "docs(01): trigger CF Pages auto-deploy verification"
    ```
    The commit message intentionally includes "trigger" — this commit doubles as the auto-deploy test.

    **Step 3 — Push to main:**
    ```
    git push
    ```
    Capture the new HEAD SHA: `git rev-parse HEAD`. Update the `Trigger commit SHA` field in DEPLOY-NOTES.md (write a second commit with the SHA filled in if you didn't capture it before pushing).

    **Step 4 — Wait for the auto-deploy and verify:**
    Poll the live URL `https://<project>.pages.dev` until the page reflects the new commit. Two ways to confirm the new deploy landed:
    (a) HTTP fetch the URL and confirm a 200 response: `curl -sI https://<project>.pages.dev` returns `HTTP/2 200` (or `HTTP/1.1 200 OK`).
    (b) The Cloudflare dashboard build history shows a NEW build kicked off automatically by the doc-only commit (build #2 or higher), separate from the first build in Task 2.

    Record the verification timestamp.

    Wait at most 10 minutes total. If no auto-deploy is observed:
    - Check the Cloudflare dashboard's "Builds" tab for the project — was a build triggered? Did it fail?
    - Surface the failure to the user with the build log excerpt.

    **Step 5 — Update DEPLOY-NOTES.md** with the verification timestamp and the auto-deploy SHA, then commit:
    ```
    git add .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md
    git commit -m "docs(01): record CF Pages auto-deploy verification"
    git push
    ```

    Note: this final commit will trigger ANOTHER auto-deploy (which is expected — the system is working). No need to verify this one too; the loop has been demonstrated.
  </action>
  <verify>
    <automated>test -f .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md &amp;&amp; grep -E "pages\.dev" .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md &amp;&amp; grep -E "Auto-deploy observed:\s+yes" .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md &amp;&amp; curl -sI https://$(grep -oE "https://[a-z0-9-]+\.pages\.dev" .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md | head -1 | sed 's|https://||') | head -1 | grep -E "HTTP/[0-9.]+\s+200"</automated>
  </verify>
  <acceptance_criteria>
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` exists
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` contains the literal substring `pages.dev`
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` contains `NODE_VERSION=22`
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` contains `PNPM_VERSION=` followed by a non-empty version string
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` contains the literal substring `Auto-deploy observed: yes`
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` contains the literal substring `Build output directory: build`
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` contains the literal substring `Build command: pnpm build`
    - File `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` contains a Trigger commit SHA value (40-char hex string after `Trigger commit SHA:`)
    - Command `curl -sI https://<project>.pages.dev` returns an HTTP 200 response
    - Command `curl -s https://<project>.pages.dev/robots.txt` returns body containing `Disallow: /`
    - Command `curl -s https://<project>.pages.dev/` returns body containing `noindex` (case-insensitive)
    - Command `curl -s https://<project>.pages.dev/` returns body containing `Michelle Ngo` (case-insensitive)
    - The Cloudflare dashboard "Builds" tab shows at least 2 successful builds (the initial build from Task 2 + the auto-deploy triggered by the docs commit in step 3)
  </acceptance_criteria>
  <done>
    - DEPLOY-NOTES.md is committed to the repo with all required fields populated.
    - The doc-only push to `main` triggered a Cloudflare auto-deploy that succeeded.
    - The live `*.pages.dev` URL serves a 200 response over HTTPS with the splash content + noindex meta + Disallow robots.txt all intact.
    - Phase 1 success criteria #3 (push triggers deploy) and #4 (URL serves the route over HTTPS) are demonstrably satisfied.
  </done>
</task>

</tasks>

<verification>
After all three tasks complete, verify the full Phase 1 contract end-to-end:

```
# Local repo state
git rev-parse --abbrev-ref HEAD                   # Expect: main
git rev-parse HEAD                                 # Expect: matches origin/main
test -f .planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md

# Live URL contract (substitute actual *.pages.dev URL from DEPLOY-NOTES.md)
curl -sI https://<project>.pages.dev | head -1     # Expect: HTTP/2 200 or HTTP/1.1 200 OK
curl -s  https://<project>.pages.dev/ | grep -i "michelle ngo"
curl -s  https://<project>.pages.dev/ | grep -i "noindex"
curl -s  https://<project>.pages.dev/robots.txt | grep "Disallow: /"
```

All commands must exit 0 / return at least one match. The Cloudflare dashboard must show at least two successful builds (proving auto-deploy works).
</verification>

<success_criteria>
1. Cloudflare Pages project exists, is connected to GitHub `main`, and is configured with `NODE_VERSION=22` + `PNPM_VERSION=<local>` (Phase 1 success criterion #3).
2. The first build succeeded and produced a public `*.pages.dev` URL over HTTPS (Phase 1 success criterion #4).
3. A subsequent docs-only push to `main` triggered an automatic redeploy that also succeeded — proving the auto-deploy loop (Phase 1 success criterion #3).
4. The live URL serves the MICHELLE NGO splash with Tailwind classes, the noindex meta tag, and a Disallow-all robots.txt (D-09, D-10, D-11).
5. `.planning/phases/01-foundation/01-foundation-02-DEPLOY-NOTES.md` records the project name, URL, env var values, first-deploy timestamp, auto-deploy verification timestamp, and Phase 7 cutover instructions.
6. Combined with plan 01-01, FOUND-01 + FOUND-02 are both fully satisfied — Phase 1 is complete.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md` documenting:
- The Cloudflare Pages project name and `*.pages.dev` URL (the URL is referenced by Phase 7 cutover and any later phase that needs to share the staging link).
- Confirmation that auto-deploy works end-to-end (push -> CF Pages build -> live URL update).
- The exact `PNPM_VERSION` set in the dashboard (so it can be revisited if the local pnpm version drifts).
- Any deviations from the plan (e.g., if the project name `michelle-ngo` was unavailable and a fallback was used).
</output>
