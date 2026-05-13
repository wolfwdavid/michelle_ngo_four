---
phase: 07-polish-production-cutover
plan: 05
type: execute
wave: 4
depends_on: ["07-01", "07-02", "07-03", "07-04"]
files_modified:
  - static/CNAME
  - static/robots.txt
  - src/routes/+layout.svelte
  - .github/workflows/deploy.yml
  - .github/workflows/deploy-production.yml
autonomous: false
requirements: [FOUND-03]
user_setup:
  - service: github-pages-custom-domain
    why: "GH Pages custom-domain configuration must be set in the repository settings UI; cert provisioning is dashboard-driven"
    dashboard_config:
      - task: "Add 'michellengo.net' (apex) and 'www.michellengo.net' as custom domains"
        location: "GitHub repo → Settings → Pages → Custom domain"
      - task: "Confirm Let's Encrypt cert provisioned (yellow → green checkmark in the same UI)"
        location: "GitHub repo → Settings → Pages → Custom domain status indicator"
      - task: "Enable 'Enforce HTTPS' once cert is ready"
        location: "GitHub repo → Settings → Pages → Enforce HTTPS checkbox"
  - service: domain-registrar-dns
    why: "Final DNS swap is a registrar-side change Claude has no API to perform"
    dashboard_config:
      - task: "Set TTL on existing WordPress.com records to 300s at least 1 hour before swap (rollback window)"
        location: "Domain registrar DNS settings for michellengo.net"
      - task: "Replace michellengo.net A records with GH Pages apex IPs: 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153"
        location: "Domain registrar DNS settings for michellengo.net"
      - task: "Set www.michellengo.net CNAME to wolfwdavid.github.io"
        location: "Domain registrar DNS settings for www.michellengo.net"

must_haves:
  truths:
    - "static/CNAME exists in the repo and the build artifact contains build/CNAME with content 'michellengo.net'"
    - "Production deploy workflow builds without BASE_PATH (BASE_PATH='') so internal links serve from / on the apex domain"
    - "Staging workflow continues to build with BASE_PATH=/michelle_ngo_four so wolfwdavid.github.io/michelle_ngo_four/ keeps working"
    - "robots.txt is replaced with the open policy + Sitemap directive (D-16) as an ATOMIC commit alongside the +layout.svelte noindex removal"
    - "+layout.svelte no longer emits <meta name=\"robots\" content=\"noindex, nofollow\" />"
    - "GH Pages custom domain config is verified BEFORE DNS swap via curl --resolve or /etc/hosts override per D-03"
  artifacts:
    - path: "static/CNAME"
      provides: "GitHub Pages custom-domain assertion baked into build artifact"
      contains: "michellengo.net"
    - path: "static/robots.txt"
      provides: "Open robots policy + Sitemap directive (D-16)"
      contains: "Allow: /"
    - path: "src/routes/+layout.svelte"
      provides: "noindex meta REMOVED (D-16 atomic flip)"
    - path: ".github/workflows/deploy-production.yml"
      provides: "Production deploy workflow building with BASE_PATH='' for the apex domain"
      contains: "BASE_PATH:"
  key_links:
    - from: "static/CNAME"
      to: "GH Pages custom-domain config + Let's Encrypt cert provisioning"
      via: "Build artifact assertion + repo settings UI"
      pattern: "michellengo.net"
    - from: ".github/workflows/deploy-production.yml"
      to: "GH Pages apex domain serving artifact built with BASE_PATH=''"
      via: "actions/deploy-pages@v4 with build artifact lacking the /michelle_ngo_four prefix"
      pattern: "BASE_PATH:"
    - from: "static/robots.txt Sitemap: directive"
      to: "build/sitemap.xml (emitted by Plan 07-02 endpoint)"
      via: "robots.txt absolute URL referencing https://michellengo.net/sitemap.xml"
      pattern: "Sitemap: https://michellengo.net/sitemap.xml"
---

<objective>
Land all the technical prerequisites for the DNS cutover: create `static/CNAME`, add a production-variant GH Pages workflow that builds with `BASE_PATH=''`, and perform the D-16 atomic noindex+robots flip as a single commit BEFORE the DNS swap. Then verify the production-configured build serves correctly on the apex domain via curl `--resolve` (pre-DNS-flip verification per D-03). Stop the plan at "ready for DNS swap" — the actual registrar DNS change is a human action.

Purpose: D-01 (GH Pages + michellengo.net custom domain) + D-02 (BASE_PATH split per environment) + D-03 (verify-then-flip cutover sequence) + D-04 (no 301s — clean break) + D-16 (atomic noindex+robots flip) + D-05 (pre-cutover blocker checklist).
Output: CNAME file, production deploy workflow, atomic robots flip commit, verified pre-DNS apex serving. DNS swap is a human action (CHECKPOINT) — plan stops there.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/07-polish-production-cutover/07-CONTEXT.md
@src/routes/+layout.svelte
@static/robots.txt
@.github/workflows/deploy.yml
@svelte.config.js

<interfaces>
<!-- Current staging workflow (.github/workflows/deploy.yml line 40-41): -->
<!--   env:                                                                                          -->
<!--     BASE_PATH: /${{ github.event.repository.name }}                                              -->
<!-- This builds for wolfwdavid.github.io/michelle_ngo_four/ (BASE_PATH='/michelle_ngo_four').        -->

<!-- D-02 split: production workflow MUST build with BASE_PATH='' (or omit the env var entirely      -->
<!--   so svelte.config.js's `paths.base: process.env.BASE_PATH ?? ''` defaults to ''). -->

<!-- Current robots.txt:                                                                             -->
<!--   User-agent: *                                                                                 -->
<!--   Disallow: /                                                                                   -->

<!-- D-16 target robots.txt (open policy + Sitemap directive):                                       -->
<!--   User-agent: *                                                                                 -->
<!--   Allow: /                                                                                      -->
<!--   Sitemap: https://michellengo.net/sitemap.xml                                                  -->

<!-- Current +layout.svelte line 14: <meta name="robots" content="noindex, nofollow" />              -->
<!--   D-16: REMOVE this line in the SAME commit as the robots.txt edit.                             -->

<!-- D-03 cutover sequence (Plan 07-05 owns steps 1-4; step 5 is the human DNS swap CHECKPOINT;      -->
<!--   step 7 rollback is registrar-side):                                                           -->
<!--     1. Add CNAME + custom-domain config                                                         -->
<!--     2. Wait for cert provisioning                                                               -->
<!--     3. Verify apex URL serves new build via curl --resolve                                      -->
<!--     4. Run final 21-cell QA + Lighthouse on apex URL (confirm Plan 07-03 + 07-04 still GREEN)   -->
<!--     5. [HUMAN] Schedule DNS swap; set TTL=300s; flip A records + www CNAME at registrar         -->
<!--     6. Monitor propagation                                                                      -->
<!--     7. Rollback = revert DNS at registrar                                                       -->

<!-- D-05 pre-cutover blocker checklist (verified before step 5 DNS swap):                           -->
<!--   [✓] IMDb URL swap        — Plan 07-01                                                          -->
<!--   [✓] LinkedIn URL swap    — Plan 07-01                                                          -->
<!--   [✓] Fix-list resolved    — Plan 07-03                                                          -->
<!--   [✓] Lighthouse LCP gate  — Plan 07-04                                                          -->
<!--   [✓] HTTPS cert on apex   — Task 1 below (manual UI step)                                       -->
<!--   [✓] Apex pre-verified    — Task 4 below                                                        -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create static/CNAME containing 'michellengo.net'</name>
  <files>static/CNAME</files>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-01 CNAME file expectation + custom domain config)
    - https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site (informational — CNAME file format)
  </read_first>
  <action>
    Create new file `static/CNAME` with EXACTLY ONE LINE of content:

    ```
    michellengo.net
    ```

    No trailing whitespace, no comments, no blank lines beyond a single trailing newline.

    Why: GitHub Pages reads `CNAME` from the build artifact root and (combined with the repo's Pages Settings UI custom-domain config) asserts the apex domain. Per CONTEXT.md Claude's Discretion: "commit static/CNAME containing michellengo.net in the SAME commit that adds the GH Pages custom-domain config in the repo settings, so the next build artifact carries the assertion." Avoids the GH-Pages "Save and lose custom domain on next deploy" footgun.

    The CNAME file goes in `static/` so SvelteKit's `adapter-static` copies it verbatim into `build/CNAME`. NO modification to `svelte.config.js` is needed — `static/` is automatically copied.

    Both production AND staging workflows will build this same artifact. CNAME is harmless on the staging URL (wolfwdavid.github.io/michelle_ngo_four/ ignores it).

    Implements D-01.
  </action>
  <verify>
    <automated>test -f static/CNAME && cat static/CNAME</automated>
  </verify>
  <acceptance_criteria>
    - `test -f static/CNAME` exits 0
    - `cat static/CNAME` outputs exactly `michellengo.net` (with trailing newline)
    - File content is exactly: `michellengo.net\n` (verify via `wc -l static/CNAME` returns 1 and `head -1 static/CNAME` returns `michellengo.net`)
    - After `pnpm build`: `test -f build/CNAME` exits 0
    - After `pnpm build`: `cat build/CNAME` returns exactly `michellengo.net`
    - `pnpm build` exits 0
  </acceptance_criteria>
  <done>
    static/CNAME is committed; build artifact includes build/CNAME with the apex domain assertion.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create production-variant GH Pages workflow with BASE_PATH='' for apex deploy</name>
  <files>.github/workflows/deploy-production.yml</files>
  <read_first>
    - .github/workflows/deploy.yml (current staging workflow — verify lines 1-58; this task creates a SIBLING workflow, NOT a replacement)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-02 BASE_PATH split per environment)
    - svelte.config.js (verify `paths.base: process.env.BASE_PATH ?? ''` is the override hook)
  </read_first>
  <action>
    Create new file `.github/workflows/deploy-production.yml` with the following EXACT content. This workflow is triggered only by manual dispatch (initial cutover should be deliberate) and produces a build artifact with empty BASE_PATH.

    ```yaml
    name: Deploy to GitHub Pages (production / apex)

    # Production deploy fires only on manual dispatch (D-03 verify-then-flip discipline).
    # Staging deploy on push-to-main lives in deploy.yml — that workflow keeps building
    # with BASE_PATH=/michelle_ngo_four for wolfwdavid.github.io/michelle_ngo_four/.
    on:
      workflow_dispatch:

    permissions:
      contents: read
      pages: write
      id-token: write

    concurrency:
      group: pages
      cancel-in-progress: false

    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v4

          - name: Setup Node.js
            uses: actions/setup-node@v4
            with:
              node-version: 22

          - name: Setup pnpm
            uses: pnpm/action-setup@v4
            with:
              version: 11.0.9
              standalone: true

          - name: Install dependencies
            run: pnpm install --frozen-lockfile

          - name: Build (apex — BASE_PATH unset)
            env:
              BASE_PATH: ''
            run: pnpm build

          - name: Verify CNAME in build artifact
            run: |
              test -f build/CNAME || (echo "build/CNAME missing — D-01 CNAME assertion not in artifact" && exit 1)
              echo "build/CNAME content: $(cat build/CNAME)"

          - name: Upload artifact
            uses: actions/upload-pages-artifact@v3
            with:
              path: build/

      deploy:
        needs: build
        runs-on: ubuntu-latest
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        steps:
          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v4
    ```

    Key differences from the existing `.github/workflows/deploy.yml`:
      - Trigger: `workflow_dispatch` ONLY (no push-to-main). Production deploys are deliberate.
      - `BASE_PATH: ''` (D-02): empty string so `svelte.config.js` `paths.base: process.env.BASE_PATH ?? ''` resolves to `''`. All internal links use `${base}/...` and the leading slash becomes `/...` on the apex.
      - Adds a "Verify CNAME" step that fails fast if `build/CNAME` is missing — catches the D-01 footgun where the CNAME file gets accidentally removed.

    The staging workflow (`.github/workflows/deploy.yml`) is UNCHANGED — it continues building with `BASE_PATH=/michelle_ngo_four` on every push to main.

    **Concurrency:** both workflows share `group: pages` — only one can run at a time. This is correct: we never want a staging deploy clobbering a production deploy (or vice versa) in mid-flight.

    Implements D-02.
  </action>
  <verify>
    <automated>test -f .github/workflows/deploy-production.yml && grep -c "BASE_PATH: ''" .github/workflows/deploy-production.yml && grep -c "workflow_dispatch" .github/workflows/deploy-production.yml</automated>
  </verify>
  <acceptance_criteria>
    - `test -f .github/workflows/deploy-production.yml` exits 0
    - `grep -c "BASE_PATH: ''" .github/workflows/deploy-production.yml` returns 1 (the empty BASE_PATH per D-02)
    - `grep -c "workflow_dispatch" .github/workflows/deploy-production.yml` returns at least 1
    - `grep -c "push:" .github/workflows/deploy-production.yml` returns 0 (production is NOT push-triggered)
    - `grep -c "actions/deploy-pages@v4" .github/workflows/deploy-production.yml` returns 1
    - `grep -c "Verify CNAME" .github/workflows/deploy-production.yml` returns 1
    - `.github/workflows/deploy.yml` is UNCHANGED: `grep -c "BASE_PATH: /\${{ github.event.repository.name }}" .github/workflows/deploy.yml` returns 1 (staging path preserved)
    - YAML parses cleanly: pick any YAML validator OR confirm `gh workflow view deploy-production.yml` exits 0 after push
  </acceptance_criteria>
  <done>
    deploy-production.yml exists; staging deploy.yml unchanged; both share concurrency group; production builds with empty BASE_PATH.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 3: User adds 'michellengo.net' as custom domain in GH Pages settings + waits for cert</name>
  <what-built>
    - `static/CNAME` committed (Task 1)
    - `.github/workflows/deploy-production.yml` committed (Task 2)
    - Both files pushed to main (assumed; if not, push before running this task)
  </what-built>
  <how-to-verify>
    **Step 1 — Trigger the production workflow (build the apex artifact):**
      Open https://github.com/wolfwdavid/michelle_ngo_four/actions
      Find "Deploy to GitHub Pages (production / apex)"
      Click "Run workflow" → select branch `main` → "Run workflow"
      Wait for it to complete (green checkmark). Verify the "Verify CNAME in build artifact" step echoes "build/CNAME content: michellengo.net".

    **Step 2 — Add the custom domain in repo settings:**
      Open https://github.com/wolfwdavid/michelle_ngo_four/settings/pages
      Under "Custom domain", enter: `michellengo.net`
      Click Save.
      GitHub will check DNS — at this point DNS still points to WordPress.com, so it will say "DNS check unsuccessful" with a yellow icon. **This is expected** per D-03 step 2.

    **Step 3 — Add the www. variant:**
      In the same Custom domain field, change to `www.michellengo.net`, Save.
      THEN change back to `michellengo.net` (apex is canonical per CONTEXT.md Claude's Discretion www → apex redirect).
      Both should now appear in the underlying GH Pages config. Apex is primary.

    **Step 4 — Wait for cert provisioning:**
      GitHub provisions Let's Encrypt cert for the unverified domain. This typically takes 15-60 minutes.
      Refresh the Pages settings UI; eventually the icon next to "michellengo.net" goes green and "Enforce HTTPS" checkbox becomes selectable.

    **Step 5 — Enable Enforce HTTPS:**
      Check the "Enforce HTTPS" checkbox.

    **Step 6 — Return:**
      When all 5 steps complete, report back: "Custom domain configured, cert ready, HTTPS enforced."
  </how-to-verify>
  <resume-signal>
    User reports: "Custom domain configured, cert ready, HTTPS enforced."
    OR reports a specific failure (e.g., cert hasn't provisioned after 2 hours — escalate).
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <what-built> + <how-to-verify> blocks to the user as numbered steps. Wait for the <resume-signal>. Once the user reports completion (or failure), record the outcome — including timestamps and any URLs / commit hashes / dashboard confirmations the user provides — in the plan SUMMARY draft. Do NOT attempt to automate any step listed under <how-to-verify> — these are explicitly out-of-CLI-reach actions (e.g., DNS registrar changes, dashboard UI clicks).
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has performed the required external action and reported the outcome (success or rollback with reason).</done>
</task>

<task type="auto">
  <name>Task 4: Verify apex domain serves new build via curl --resolve (pre-DNS-flip per D-03)</name>
  <files></files>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-03 cutover sequence step 3 — verify apex via curl --resolve BEFORE DNS swap)
  </read_first>
  <action>
    Use `curl --resolve` to hit michellengo.net directly without depending on DNS (which still points to WordPress.com at this point).

    GH Pages apex IPs (per D-03): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Any one is fine.

    Run:
    ```bash
    # Test the apex serves the new SvelteKit build (NOT WordPress)
    curl --resolve "michellengo.net:443:185.199.108.153" \
      "https://michellengo.net/" \
      -o /tmp/apex-home.html \
      --silent --show-error

    # Verify it's the SvelteKit build by checking for hero markup + favicon link
    grep -c "favicon-192.png" /tmp/apex-home.html
    grep -c "Michelle Ngo" /tmp/apex-home.html
    grep -c "wp-content" /tmp/apex-home.html  # MUST be 0 — wp-content means WordPress is serving

    # Test /work
    curl --resolve "michellengo.net:443:185.199.108.153" \
      "https://michellengo.net/work/" \
      -o /tmp/apex-work.html --silent --show-error
    grep -c "<title>Work — Michelle Ngo" /tmp/apex-work.html

    # Test /watch/264677021 (Producer's Reel, also has JSON-LD VideoObject)
    curl --resolve "michellengo.net:443:185.199.108.153" \
      "https://michellengo.net/watch/264677021/" \
      -o /tmp/apex-watch.html --silent --show-error
    grep -c "VideoObject" /tmp/apex-watch.html

    # Test sitemap.xml
    curl --resolve "michellengo.net:443:185.199.108.153" \
      "https://michellengo.net/sitemap.xml" \
      -o /tmp/apex-sitemap.xml --silent --show-error
    grep -c "<url>" /tmp/apex-sitemap.xml
    ```

    Capture the outputs in a verification log written to `.planning/phases/07-polish-production-cutover/07-05-apex-verification.txt` with the date/time, IP used, and curl exit codes + grep counts.

    If ANY check fails (especially the wp-content check returning > 0, meaning WordPress is still being served on the apex), STOP and surface to user — do NOT proceed to Task 5.

    **NOTE:** This task is best run AFTER Task 3 fully completes (cert ready, HTTPS enforced).
    Before the cert is ready, curl will fail TLS verification (`--insecure` flag would bypass but should NOT be used — pre-cutover verification needs real TLS).

    Implements D-03 step 3.
  </action>
  <verify>
    <automated>curl --resolve "michellengo.net:443:185.199.108.153" "https://michellengo.net/" --silent --show-error -o /tmp/apex-home.html && grep -c "favicon-192.png" /tmp/apex-home.html && grep -L "wp-content" /tmp/apex-home.html</automated>
  </verify>
  <acceptance_criteria>
    - `.planning/phases/07-polish-production-cutover/07-05-apex-verification.txt` exists
    - `grep -c "favicon-192.png" /tmp/apex-home.html` returns at least 1
    - `grep -c "wp-content" /tmp/apex-home.html` returns 0 (no WordPress artifacts — confirms GH Pages is serving)
    - `grep -c "VideoObject" /tmp/apex-watch.html` returns at least 1 (Plan 07-02 JSON-LD injection emitting on apex)
    - `grep -c "<url>" /tmp/apex-sitemap.xml` returns at least 70 (Plan 07-02 sitemap emitting on apex)
    - `grep -c "Work — Michelle Ngo" /tmp/apex-work.html` returns at least 1 (Plan 07-02 per-page title D-13 on apex)
    - `curl --resolve` returns HTTP 200 on all 4 URLs (no 404, no TLS error)
  </acceptance_criteria>
  <done>
    Apex URL pre-verified — GH Pages serves the new SvelteKit build, not WordPress. JSON-LD, sitemap, per-page titles all present. Ready for the atomic robots flip (Task 5) and DNS swap (Task 6).
  </done>
</task>

<task type="auto">
  <name>Task 5: Atomic noindex+robots flip — single commit BEFORE DNS swap (D-16)</name>
  <files>
    src/routes/+layout.svelte
    static/robots.txt
  </files>
  <read_first>
    - src/routes/+layout.svelte (full file — verify line 14 still has `<meta name="robots" content="noindex, nofollow" />`)
    - static/robots.txt (full file — verify content is currently `User-agent: *\nDisallow: /`)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-16 atomic flip — both edits in ONE commit)
    - .planning/phases/07-polish-production-cutover/07-04-SUMMARY.md (confirm Lighthouse passing before flipping — gate this task on Plan 07-04 outcome)
    - .planning/phases/07-polish-production-cutover/07-03-SUMMARY.md (confirm punch-list resolved before flipping)
  </read_first>
  <action>
    Two edits in a SINGLE atomic commit per D-16. The commit message MUST tag this as the cutover-readiness flip.

    **Edit 1 — Remove noindex meta from src/routes/+layout.svelte:**

      Current `<svelte:head>` block (Plan 07-02 expanded it but kept the noindex line at the top per Plan 07-02's "noindex preserved" comment):
      ```svelte
      <svelte:head>
        <meta name="robots" content="noindex, nofollow" />
        <title>Michelle Ngo</title>

        <!-- D-11 Favicon set ... -->
        ...
      </svelte:head>
      ```

      EDIT: delete the line `<meta name="robots" content="noindex, nofollow" />` entirely. Do NOT replace with `<meta name="robots" content="index, follow" />` — search engines treat absence of the meta tag as the default permissive policy, which is what we want (D-16 preference). Per D-16 Claude's Discretion: "Whether to also flip `<meta name=\"googlebot\">` — recommend NO; removing noindex is sufficient."

    **Edit 2 — Replace static/robots.txt content:**

      Current content:
      ```
      User-agent: *
      Disallow: /
      ```

      REPLACE entirely with:
      ```
      User-agent: *
      Allow: /
      Sitemap: https://michellengo.net/sitemap.xml
      ```

      Trailing newline at the end of the file. No additional directives.

    **Commit:** stage both files in ONE commit (D-16 atomic):
      ```
      git add src/routes/+layout.svelte static/robots.txt
      git commit -m "feat(07): open robots policy + remove noindex meta — D-16 pre-cutover atomic flip"
      ```

    Why atomic: prevents a window where ONE of the two flips is live (e.g., robots.txt open but meta tag still says noindex, or vice versa). Search engines see a consistent policy from the first crawl after DNS swap.

    Implements D-16. Closes the FOUND-02 D-11 staging-only-noindex contract that has been in place since Phase 1.

    **Do NOT trigger the production workflow yet.** Task 6 owns the production build + deploy AFTER this commit lands.
  </action>
  <verify>
    <automated>grep -c "noindex" src/routes/+layout.svelte && grep -c "Allow: /" static/robots.txt && grep -c "Sitemap: https://michellengo.net/sitemap.xml" static/robots.txt</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "noindex" src/routes/+layout.svelte` returns 0 (meta tag removed)
    - `grep -c "nofollow" src/routes/+layout.svelte` returns 0 (meta tag removed)
    - `grep -c "Disallow: /" static/robots.txt` returns 0 (closed policy gone)
    - `grep -c "^Allow: /$" static/robots.txt` returns 1 (open policy)
    - `grep -c "^Sitemap: https://michellengo.net/sitemap.xml$" static/robots.txt` returns 1 (sitemap directive)
    - `wc -l static/robots.txt` returns 3 (User-agent, Allow, Sitemap)
    - Last commit in git log mentions both files: `git log -1 --stat --name-only HEAD` shows `src/routes/+layout.svelte` AND `static/robots.txt` in the same commit
    - `pnpm build` exits 0; after build: `grep -c "noindex" build/index.html` returns 0 AND `cat build/robots.txt` contains `Sitemap: https://michellengo.net/sitemap.xml`
    - `pnpm test` exits 0
    - `pnpm check` exits 0
  </acceptance_criteria>
  <done>
    Single atomic commit lands the open-robots policy + noindex removal. Build artifact reflects the new policy. Ready for production deploy + DNS swap.
  </done>
</task>

<task type="auto">
  <name>Task 6: Trigger production workflow + final apex re-verification (post-flip)</name>
  <files></files>
  <read_first>
    - .github/workflows/deploy-production.yml (the workflow that will run)
    - .planning/phases/07-polish-production-cutover/07-05-apex-verification.txt (pre-flip baseline — for diffing)
  </read_first>
  <action>
    Trigger the production workflow to deploy the now-flipped build (Task 5 commit) to the apex GH Pages target. The artifact will:
      - Have `BASE_PATH=''` (D-02 production)
      - Have `CNAME` containing `michellengo.net` (D-01)
      - Have robots.txt with `Allow: /` + Sitemap directive (D-16)
      - Have NO noindex meta tag in `<head>` (D-16)

    Trigger via GitHub CLI:
    ```bash
    gh workflow run deploy-production.yml --ref main
    # Wait for completion
    gh run watch
    ```

    OR via the GitHub Actions UI: Actions → "Deploy to GitHub Pages (production / apex)" → Run workflow.

    After deploy completes, re-run the Task 4 curl --resolve checks against the NEW build:

    ```bash
    curl --resolve "michellengo.net:443:185.199.108.153" \
      "https://michellengo.net/" \
      -o /tmp/apex-home-post-flip.html --silent --show-error

    # CRITICAL CHECK: noindex should now be ABSENT
    grep -c "noindex" /tmp/apex-home-post-flip.html
    # MUST be 0

    # Sitemap should be reachable
    curl --resolve "michellengo.net:443:185.199.108.153" \
      "https://michellengo.net/robots.txt" \
      --silent --show-error
    # MUST contain "Allow: /" and "Sitemap: https://michellengo.net/sitemap.xml"

    curl --resolve "michellengo.net:443:185.199.108.153" \
      "https://michellengo.net/sitemap.xml" \
      -o /tmp/apex-sitemap-post-flip.xml --silent --show-error
    grep -c "<url>" /tmp/apex-sitemap-post-flip.xml
    # MUST be >= 70
    ```

    Append findings to `.planning/phases/07-polish-production-cutover/07-05-apex-verification.txt` under a "Post-flip verification" section.

    If any check fails, STOP — do NOT signal DNS-swap readiness in Task 7.

    Implements D-03 cutover sequence step 4 (post-flip apex re-verification).
  </action>
  <verify>
    <automated>curl --resolve "michellengo.net:443:185.199.108.153" "https://michellengo.net/" --silent -o /tmp/apex-home-post-flip.html && grep -c "noindex" /tmp/apex-home-post-flip.html</automated>
  </verify>
  <acceptance_criteria>
    - `gh run list --workflow=deploy-production.yml --limit=1` shows the latest run as `completed` with `success` status
    - `curl --resolve` of `https://michellengo.net/` returns HTTP 200
    - `grep -c "noindex" /tmp/apex-home-post-flip.html` returns 0 (meta tag removed in production build)
    - `curl --resolve` of `https://michellengo.net/robots.txt` returns content containing `Allow: /` and `Sitemap: https://michellengo.net/sitemap.xml`
    - `grep -c "Disallow: /" <(curl --resolve "michellengo.net:443:185.199.108.153" -s "https://michellengo.net/robots.txt")` returns 0
    - `grep -c "<url>" /tmp/apex-sitemap-post-flip.xml` returns at least 70
    - 07-05-apex-verification.txt has a "Post-flip verification" section with the date/time + check results
  </acceptance_criteria>
  <done>
    Production GH Pages serves the post-flip build on the apex (via curl --resolve). noindex gone; robots.txt open; sitemap reachable. Ready to flip DNS at the registrar.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 7: User flips DNS A records + www CNAME at domain registrar (the launch event)</name>
  <what-built>
    - GH Pages apex (michellengo.net) serves the new SvelteKit build via curl --resolve verification (Task 6)
    - HTTPS cert is ready (Task 3)
    - robots.txt is open + Sitemap directive in place (Task 5)
    - noindex meta tag is removed (Task 5)
    - D-05 pre-cutover blocker checklist is fully GREEN:
        [✓] IMDb URL swap (Plan 07-01)
        [✓] LinkedIn URL swap (Plan 07-01)
        [✓] Fix-list resolved (Plan 07-03 punch list)
        [✓] Lighthouse LCP gate passing (Plan 07-04)
        [✓] HTTPS cert on apex (Task 3)
        [✓] Apex pre-verified BEFORE DNS swap (Task 4 + Task 6)
  </what-built>
  <how-to-verify>
    **THIS IS THE LAUNCH EVENT. EVERY STEP BEFORE THIS WAS REVERSIBLE. THE DNS SWAP IS THE COMMIT POINT.**

    **Step 1 — Set short TTL (do this AT LEAST 1 HOUR before the actual swap):**
      Log in to the domain registrar (where michellengo.net is registered — check whois if unsure).
      Find the DNS settings for michellengo.net.
      Change the TTL on ALL existing records (especially the A records and CNAME records pointing to WordPress.com) to **300 seconds (5 minutes)**.
      Save. Wait at least 1 hour (the OLD TTL — whatever it was — must elapse so caches converge on the new 300s value).
      This is the rollback-window optimization: if the swap goes wrong, you can revert and propagation will complete in ≤5 minutes.

    **Step 2 — Schedule a low-traffic window:**
      Pick a time when minimal inbound traffic is expected (e.g., weekday early morning US time).
      Have curl, browser, and the registrar UI open in separate tabs.

    **Step 3 — At the scheduled time, flip the DNS records:**

      Replace the A records for `michellengo.net` (apex):
        - Delete existing A records pointing to WordPress.com IPs
        - Add four new A records pointing to GH Pages apex IPs:
            michellengo.net  A  185.199.108.153
            michellengo.net  A  185.199.109.153
            michellengo.net  A  185.199.110.153
            michellengo.net  A  185.199.111.153

      Replace/add CNAME for www:
        - Delete any existing record for www.michellengo.net
        - Add: www.michellengo.net  CNAME  wolfwdavid.github.io

      Save changes.

    **Step 4 — Monitor propagation:**
      Run repeatedly from your machine:
      ```
      dig michellengo.net +short
      ```
      OR use https://dnschecker.org/#A/michellengo.net to see global propagation.

      Initial response will still be WordPress IPs (cached). Within 5-15 minutes, GH Pages IPs (185.199.10x.153) should appear.

    **Step 5 — Verify in browser (no --resolve trick needed now):**
      ```
      curl -I https://michellengo.net/
      ```
      The response Server header should mention `GitHub.com` (not WordPress).
      Open https://michellengo.net/ in browser — should see Michelle Ngo SvelteKit site.

    **Step 6 — If anything breaks: ROLLBACK:**
      Revert the registrar DNS records to the previous WordPress.com targets.
      With TTL=300s, propagation back will complete within 5 minutes.

    **Step 7 — Report back:**
      "DNS swap complete; michellengo.net resolves to GH Pages; production verified."
      OR
      "DNS swap rolled back; reason: [...]."
  </how-to-verify>
  <resume-signal>
    User reports the outcome of the DNS swap. Plan 07-05 is complete on EITHER outcome:
      - SUCCESS: DNS resolves to GH Pages; production verified — Phase 7 complete; ROADMAP.md Phase 7 entry marked [x]
      - ROLLBACK: documented in SUMMARY; phase remains incomplete pending re-attempt
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <what-built> + <how-to-verify> blocks to the user as numbered steps. Wait for the <resume-signal>. Once the user reports completion (or failure), record the outcome — including timestamps and any URLs / commit hashes / dashboard confirmations the user provides — in the plan SUMMARY draft. Do NOT attempt to automate any step listed under <how-to-verify> — these are explicitly out-of-CLI-reach actions (e.g., DNS registrar changes, dashboard UI clicks).
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has performed the required external action and reported the outcome (success or rollback with reason).</done>
</task>

</tasks>

<verification>
- `static/CNAME` exists with exactly `michellengo.net` content
- `.github/workflows/deploy-production.yml` exists with `BASE_PATH: ''` and `workflow_dispatch` trigger
- `static/robots.txt` content is the open policy (`Allow: /` + Sitemap directive)
- `src/routes/+layout.svelte` does NOT contain `noindex` (grep -c returns 0)
- The atomic robots-flip commit (Task 5) lists BOTH files in the same commit
- `pnpm build` exits 0; build artifact contains build/CNAME and build/robots.txt with the new content
- curl --resolve verification log exists at `.planning/phases/07-polish-production-cutover/07-05-apex-verification.txt`
- Production workflow has run at least once successfully (gh run list)
- Manual: user has confirmed DNS swap status (either success or documented rollback)
</verification>

<success_criteria>
1. static/CNAME committed with apex domain
2. .github/workflows/deploy-production.yml committed with BASE_PATH='' + workflow_dispatch trigger
3. GH Pages custom domain configured in repo settings + cert provisioned + Enforce HTTPS enabled (Task 3 human-action)
4. Apex pre-verified via curl --resolve BEFORE DNS swap (Task 4)
5. D-16 atomic flip landed in ONE commit (robots.txt + +layout.svelte) (Task 5)
6. Production workflow deployed post-flip build; final apex re-verification done (Task 6)
7. DNS swap completed by user OR rollback documented (Task 7 — the launch event)
8. FOUND-03 satisfied: production deploy reachable on michellengo.net with HTTPS, staging continues to deploy independently
</success_criteria>

<output>
After completion, create `.planning/phases/07-polish-production-cutover/07-05-SUMMARY.md` capturing:
- Final state of D-05 pre-cutover blocker checklist (all rows GREEN)
- DNS swap outcome (success with timestamp OR rollback with reason)
- Confirmation that staging URL (wolfwdavid.github.io/michelle_ngo_four/) still deploys on push-to-main (D-02 staging path preserved)
- Pointers to: 07-05-apex-verification.txt (curl --resolve logs), the atomic robots-flip commit hash, the production deploy workflow run URL
- Note that ROADMAP.md Phase 7 entry can be marked [x] once user confirms DNS swap success
</output>
</content>
</invoke>