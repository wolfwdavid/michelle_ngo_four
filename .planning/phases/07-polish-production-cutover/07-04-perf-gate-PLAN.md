---
phase: 07-polish-production-cutover
plan: 04
type: execute
wave: 3
depends_on: ["07-02"]
files_modified:
  - .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json
  - src/lib/components/HeroPoster.svelte
  - src/lib/assets/hero-poster.webp
  - src/lib/assets/hero-poster.avif
autonomous: false
requirements: [FOUND-03]

must_haves:
  truths:
    - "Lighthouse mobile audit of `/` measures LCP < 2.0s on simulated Slow 4G throttle"
    - "Lighthouse JSON report is committed to .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json for traceability"
    - "If LCP measures over 2.0s on `/`: hero asset escalation is applied per D-08 order (a→b→c) until LCP clears the gate"
    - "Lighthouse audits of /work, /watch/264677021, /pbs-american-portrait are captured for record (report-only, do not block)"
  artifacts:
    - path: ".planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json"
      provides: "Lighthouse mobile audit JSON output(s) — minimum the `/` report with audits.largest-contentful-paint.numericValue value"
      min_lines: 50
      contains: "largest-contentful-paint"
  key_links:
    - from: "07-LIGHTHOUSE.json audits.largest-contentful-paint.numericValue"
      to: "FOUND-03 success criterion ('user sees the production build under 2s on a 4G connection')"
      via: "Lighthouse mobile Slow-4G preset measurement"
      pattern: "largest-contentful-paint"
    - from: "src/lib/components/HeroPoster.svelte (if escalation triggered)"
      to: "src/lib/assets/hero-poster.{webp,avif} (potentially new AVIF variant)"
      via: "<picture> element wrapping hero <img>"
      pattern: "<picture>|<source type=\"image/avif\""
---

<objective>
Run Lighthouse mobile with Slow-4G throttle against the staging URL `/` (the FOUND-03 gate) and against `/work`, `/watch/264677021`, `/pbs-american-portrait/` for record. If LCP on `/` measures < 2.0s, ship as-is per D-08 measure-first rule. If LCP exceeds 2.0s, apply hero-poster escalation in D-08 order: (a) add AVIF variant via `<picture>` + WebP fallback, (b) add mobile portrait crop, (c) drop featured-grid `eager={true}`. Stop at the first step that clears the gate. Commit the Lighthouse JSON for traceability.

Purpose: D-07 (LCP < 2.0s on `/` is the single-number gate) + D-08 (hero polish escalation, measure-first) + D-09 (no new JS deps — image assets only) + D-10 (CLS implicitly bounded by aspect-video; report-only confirmation). Closes FOUND-03.
Output: `07-LIGHTHOUSE.json` committed. Possibly an AVIF asset + `<picture>` markup if escalation triggered.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/07-polish-production-cutover/07-CONTEXT.md
@.planning/phases/04-reel-led-home/04-CONTEXT.md
@src/lib/components/HeroPoster.svelte
@src/routes/+page.svelte
@src/routes/+page.ts

<interfaces>
<!-- D-07 single-number gate: Lighthouse mobile preset + Slow-4G throttle. -->
<!--   PASS: audits.largest-contentful-paint.numericValue < 2000 (milliseconds)                      -->
<!--   FAIL: audits.largest-contentful-paint.numericValue >= 2000                                    -->

<!-- D-08 hero escalation order (apply ONLY if Lighthouse fails the 2.0s gate): -->
<!--   (a) Add AVIF variant: <picture><source type="image/avif" srcset={heroAvif} /><img src={heroWebp} ... /></picture> -->
<!--   (b) Add mobile portrait crop: <picture><source media="(max-width:640px)" srcset={heroPortrait} />...   -->
<!--   (c) Drop featured-grid eager={true}: edit /+page.svelte eager={true} → eager={false}         -->

<!-- D-09 constraint: image format work uses image-editor / one-shot scripts, NOT new JS runtime deps. -->
<!-- D-10 CLS: already bounded by aspect-video wrapper on every card (Phase 3 D-10 + D-16). -->
<!--   Report-only check; no fix expected. -->

<!-- Existing hero asset (Phase 4 D-04): src/lib/assets/hero-poster.webp (15.4 KB, content-hashed) -->
<!-- Existing markup pattern in HeroPoster.svelte: <img src={heroPoster} loading="eager" fetchpriority="high" decoding="async" /> -->

<!-- Staging URL: https://wolfwdavid.github.io/michelle_ngo_four/ -->
<!-- Cmd reference: `npx lighthouse <url> --preset=mobile --form-factor=mobile --throttling-method=devtools --output=json --output-path=07-LIGHTHOUSE.json` -->
</interfaces>
</context>

<tasks>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 1: Confirm Lighthouse target URL — staging or production-via-resolve?</name>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-03 cutover sequence — verify on apex BEFORE DNS swap; D-07 measure target)
    - .github/workflows/deploy.yml (verify staging deploy URL — wolfwdavid.github.io/michelle_ngo_four/)
  </read_first>
  <decision>
    Which URL does Lighthouse audit?
  </decision>
  <context>
    D-07 says "run Lighthouse against michellengo.net (pre-DNS-flip, via `--resolve` host trick)".
    BUT: the production GH Pages config + CNAME isn't added until Plan 07-05.
    Two options:

    1. **Staging URL first-pass:** measure against `https://wolfwdavid.github.io/michelle_ngo_four/` now (Plan 07-04 in Wave 3). The hero asset, JSON-LD, metadata, sitemap are all on staging post-Plan 07-02. The 4G LCP measurement against staging gives a near-identical signal to production (CDN behavior is the same: GH Pages serves both). The only difference is BASE_PATH affecting the URL paths (no effect on LCP — same asset bytes).

    2. **Wait for production:** measure against the apex domain pre-DNS-flip after Plan 07-05 adds CNAME + the production workflow. Most-realistic measurement BUT blocks Wave 3/4 transition until Plan 07-05's setup tasks land.

    Recommendation: Option 1 (staging first-pass) for the FOUND-03 gate. If staging passes, ship to production confident. If staging fails, escalate per D-08 and re-measure — still on staging. The final apex-domain Lighthouse run can be a smoke-check in Plan 07-05 before DNS swap.
  </context>
  <options>
    <option id="staging-first-pass">
      <name>Measure against staging URL https://wolfwdavid.github.io/michelle_ngo_four/ now</name>
      <pros>Plan 07-04 unblocks immediately in Wave 3; CDN/Hosting characteristics identical to production; D-08 escalation iterates on staging.</pros>
      <cons>Doesn't catch any production-only edge case (e.g., apex DNS lookup time differences — negligible on 4G).</cons>
    </option>
    <option id="defer-to-production">
      <name>Defer the perf gate until Plan 07-05 sets up apex domain + CNAME</name>
      <pros>Most-realistic measurement.</pros>
      <cons>Pushes 07-04 into Wave 4 sequential with 07-05; cycle-time hit.</cons>
    </option>
  </options>
  <resume-signal>
    User selects option-id. Task 2 onward uses that URL.
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <decision> prompt + <options> + <context> above to the user. Wait for the <resume-signal> response. Once received, record the user's selection (and any provided literals) in the plan SUMMARY's "User decisions captured" section so downstream tasks can reference them. Do NOT make a guess or proceed without an explicit resume signal — this checkpoint gates subsequent tasks.
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has explicitly selected one of the documented options and any required values are captured. The downstream task can read those values verbatim.</done>
</task>

<task type="auto">
  <name>Task 2: Run Lighthouse mobile audit against the 4 target URLs and commit the JSON report(s)</name>
  <files>.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json</files>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-07 measurement target — `/` LCP < 2.0s is the gate; other routes report-only; D-07 locks **mobile preset + Slow 4G throttle** — every audited URL MUST use the same preset profile)
    - https://github.com/GoogleChrome/lighthouse-ci (informational — for the `--preset=mobile` + 4G throttle defaults)
  </read_first>
  <action>
    Use `npx lighthouse` (already available via Node — no new dep) to audit 4 URLs. Save results to `07-LIGHTHOUSE.json` as a structured collection.

    **CRITICAL — D-07 preset contract:** D-07 locks the audit profile to **Lighthouse mobile preset + Slow 4G throttle**. Lighthouse's default profile when no `--preset` flag is supplied is already `mobile + Slow 4G + 4x CPU throttle` — this is the canonical FOUND-03 measurement profile. Do NOT pass `--preset=desktop` for ANY of the 4 audited URLs (desktop preset disables Slow-4G defaults and would allow a passing audit that the canonical mobile preset would fail). All 4 audits below use the SAME profile: either omit `--preset` entirely (defaults to mobile) OR explicitly pass `--preset=mobile`. They are equivalent — do not mix.

    Use whichever URL was approved in Task 1. Assuming staging:

    ```bash
    BASE_URL="https://wolfwdavid.github.io/michelle_ngo_four"

    # Primary gate: / (home) — mobile preset + Slow-4G (D-07 canonical profile)
    npx lighthouse "${BASE_URL}/" \
      --preset=mobile \
      --throttling-method=devtools \
      --output=json \
      --output-path=.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE-home.json \
      --chrome-flags="--headless --no-sandbox"

    # Report-only secondaries — SAME profile (mobile preset + Slow-4G) per D-07 consistency
    npx lighthouse "${BASE_URL}/work/" \
      --preset=mobile \
      --throttling-method=devtools \
      --output=json \
      --output-path=.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE-work.json \
      --chrome-flags="--headless --no-sandbox"

    npx lighthouse "${BASE_URL}/watch/264677021/" \
      --preset=mobile \
      --throttling-method=devtools \
      --output=json \
      --output-path=.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE-watch.json \
      --chrome-flags="--headless --no-sandbox"

    npx lighthouse "${BASE_URL}/pbs-american-portrait/" \
      --preset=mobile \
      --throttling-method=devtools \
      --output=json \
      --output-path=.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE-pbs.json \
      --chrome-flags="--headless --no-sandbox"
    ```

    Note: the `/press` route from CONTEXT.md D-07 is not in the report-only set above per the original PLAN scope (4 URLs: `/`, `/work`, `/watch/<reel>`, `/pbs-american-portrait`). If the user wants to expand to 5 URLs (add `/press`), re-run with the same `--preset=mobile` profile.

    Then create a combined summary file at `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` with the structure:

    ```json
    {
      "phase": "07-polish-production-cutover",
      "plan": "07-04",
      "captured": "{ISO-TIMESTAMP}",
      "target_url_base": "{BASE_URL_FROM_TASK_1}",
      "tool": "npx lighthouse",
      "preset": "mobile",
      "throttling": "devtools (Slow 4G)",
      "found_03_gate_route": "/",
      "found_03_gate_threshold_ms": 2000,
      "results": [
        {
          "route": "/",
          "report_file": "07-LIGHTHOUSE-home.json",
          "lcp_ms": <extracted from audits.largest-contentful-paint.numericValue>,
          "cls": <extracted from audits.cumulative-layout-shift.numericValue>,
          "fcp_ms": <extracted from audits.first-contentful-paint.numericValue>,
          "tbt_ms": <extracted from audits.total-blocking-time.numericValue>,
          "perf_score": <extracted from categories.performance.score * 100>,
          "found_03_pass": <true if lcp_ms < 2000 else false>
        },
        { "route": "/work/", "report_file": "07-LIGHTHOUSE-work.json", "lcp_ms": ..., "perf_score": ..., "found_03_pass": null },
        { "route": "/watch/264677021/", "report_file": "07-LIGHTHOUSE-watch.json", "lcp_ms": ..., "perf_score": ..., "found_03_pass": null },
        { "route": "/pbs-american-portrait/", "report_file": "07-LIGHTHOUSE-pbs.json", "lcp_ms": ..., "perf_score": ..., "found_03_pass": null }
      ]
    }
    ```

    The `found_03_pass` field on `/` is the SINGLE GO/NO-GO signal. Other routes are `null` (report-only per D-07).

    If `npx lighthouse` requires chrome installation: install via `npx -y -p puppeteer ...` is NOT preferred (puppeteer adds 200MB+) — use the user's local Chrome/Edge instead by setting `CHROME_PATH` env var if needed. If headless mode fails on the runner, drop `--chrome-flags="--headless"` and run interactively.

    D-09 constraint: `lighthouse` is invoked via `npx` (one-shot, no install). Do NOT add `lighthouse` or `@lhci/cli` to `package.json` devDependencies.

    Implements D-07 (measurement) + D-10 (CLS report-only — captured in `cls` field for record).
  </action>
  <verify>
    <automated>test -f .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json && grep -c "found_03_pass" .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json</automated>
  </verify>
  <acceptance_criteria>
    - `test -f .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` exits 0
    - `test -f .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE-home.json` exits 0
    - `grep -c "largest-contentful-paint" .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE-home.json` returns at least 1
    - `grep -c "found_03_gate_threshold_ms" .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` returns 1
    - `grep -c "\"route\": \"/\"" .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` returns at least 1
    - `grep -c "lcp_ms" .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` returns at least 4 (one per result entry)
    - The JSON parses cleanly: `node -e "JSON.parse(require('fs').readFileSync('.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json'))"` exits 0
    - The summary JSON `preset` field is `"mobile"` (NOT `"desktop"`) — D-07 contract
    - All 4 per-route Lighthouse JSON files were generated with `--preset=mobile` (or no `--preset` flag — same default); none used `--preset=desktop` (D-07 consistency)
    - `package.json` has NO new entries in `dependencies` or `devDependencies` (D-09 — `lighthouse` invoked via `npx`, not installed)
  </acceptance_criteria>
  <done>
    Lighthouse JSON committed. `found_03_pass` field on `/` is true OR false; Task 3 decides next.
  </done>
</task>

<task type="checkpoint:decision" gate="blocking">
  <name>Task 3: Branch on Lighthouse `/` LCP result — pass-and-ship OR escalate per D-08</name>
  <read_first>
    - .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json (Task 2 output — read the `results[0].lcp_ms` value)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-08 hero polish escalation rule, three-step order)
  </read_first>
  <decision>
    Did `/` LCP measure < 2.0s?
  </decision>
  <context>
    D-08 measure-first rule: if PASS, do nothing else — Task 4 is a no-op.
    If FAIL, escalate per D-08 order:
      (a) Add AVIF variant via `<picture>` + WebP fallback
      (b) Add mobile portrait crop
      (c) Drop featured-grid `eager={true}` flag

    Stop at the first step that gets LCP under 2.0s. Don't apply (b) if (a) already cleared.

    If even step (c) fails, that's a hard finding — surface for user decision (ship over-budget vs. delay-launch).
  </context>
  <options>
    <option id="pass-ship-as-is">
      <name>LCP < 2.0s — ship as-is per D-08 measure-first</name>
      <pros>FOUND-03 gate cleared; Plan 07-04 complete in 2 tasks; ship-fast.</pros>
      <cons>None.</cons>
    </option>
    <option id="escalate-a-avif">
      <name>LCP ≥ 2.0s — apply step (a) AVIF + <picture></name>
      <pros>Cheapest perf win; AVIF typically saves 30-50% bytes vs WebP at equal quality.</pros>
      <cons>Requires authoring an AVIF derivative of hero-poster.webp.</cons>
    </option>
    <option id="escalate-b-portrait">
      <name>Step (a) didn't clear — apply step (b) mobile portrait crop</name>
      <pros>Reduces mobile asset bytes substantially (portrait 9:16 crop of a wide poster).</pros>
      <cons>Requires authoring + maintaining two image variants.</cons>
    </option>
    <option id="escalate-c-drop-eager">
      <name>Steps (a)+(b) didn't clear — drop featured-grid eager={true}</name>
      <pros>Drops 8 thumbnail fetches off the critical path; meaningful LCP improvement.</pros>
      <cons>First 8 cards briefly show placeholder before image load — minor UX cost.</cons>
    </option>
    <option id="ship-over-budget">
      <name>All escalations applied; LCP still >= 2.0s — ship over-budget with documented finding</name>
      <pros>Doesn't block launch indefinitely.</pros>
      <cons>FOUND-03 fails verbatim; user accepts launch-with-deviation.</cons>
    </option>
  </options>
  <resume-signal>
    Read `results[0].lcp_ms` from 07-LIGHTHOUSE.json:
      - < 2000ms → select "pass-ship-as-is" → Task 4 is a no-op, plan complete
      - ≥ 2000ms → select "escalate-a-avif" → Task 4 applies step (a), then re-runs Task 2 measurement; loop until pass OR all steps exhausted
  </resume-signal>

  <files>(no file edits — this is a checkpoint task that pauses execution for user input/action)</files>
  <action>
    Pause execution and present the <decision> prompt + <options> + <context> above to the user. Wait for the <resume-signal> response. Once received, record the user's selection (and any provided literals) in the plan SUMMARY's "User decisions captured" section so downstream tasks can reference them. Do NOT make a guess or proceed without an explicit resume signal — this checkpoint gates subsequent tasks.
  </action>
  <verify>
    <automated>echo "Checkpoint task — resume-signal received and recorded in plan SUMMARY"</automated>
  </verify>
  <acceptance_criteria>
    - User has provided the resume-signal documented above
    - Outcome (selection / pass-fail / success-rollback) is captured in the plan SUMMARY draft
  </acceptance_criteria>
  <done>User has explicitly selected one of the documented options and any required values are captured. The downstream task can read those values verbatim.</done>
</task>

<task type="auto">
  <name>Task 4: Apply hero escalation per D-08 step order (CONDITIONAL — skip if Task 3 = pass-ship-as-is)</name>
  <files>
    src/lib/components/HeroPoster.svelte
    src/lib/assets/hero-poster.avif
    src/routes/+page.svelte
  </files>
  <read_first>
    - src/lib/components/HeroPoster.svelte (current state — the `<img>` markup pattern)
    - src/routes/+page.svelte (current state — `eager={true}` on featured cards, line 34)
    - src/lib/assets/hero-poster.webp (existing 15.4 KB WebP, content-hashed)
    - .planning/phases/07-polish-production-cutover/07-CONTEXT.md (D-08 three-step order)
    - .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json (current LCP value)
  </read_first>
  <action>
    **CONDITIONAL TASK** — execute ONLY if Task 3 selected an escalation option.

    Apply one step at a time, re-measure, decide whether to continue.

    **Step (a) — AVIF variant via `<picture>`:**

      1. Author `src/lib/assets/hero-poster.avif` from the same source frame as `hero-poster.webp` (target ~50% of WebP byte size, no visible quality loss).
         - Options: realfavicongenerator.net (no — that's for icons), squoosh.app (manual), one-off ffmpeg or sharp script.
         - If using a sharp-based script, do NOT add `sharp` to `package.json` — use `npx sharp` or another one-shot tool to avoid the dep (D-09).
         - Acceptable to ask user to drop the AVIF file in if scripting is awkward.

      2. Edit `src/lib/components/HeroPoster.svelte` — wrap the existing `<img>` in a `<picture>`:

         REPLACE the existing img-only block:
         ```svelte
         <img
           src={heroPoster}
           alt=""
           loading="eager"
           fetchpriority="high"
           class="absolute inset-0 w-full h-full object-cover object-[center_30%]"
         />
         ```

         WITH:
         ```svelte
         <picture>
           <source srcset={heroPosterAvif} type="image/avif" />
           <img
             src={heroPoster}
             alt=""
             loading="eager"
             fetchpriority="high"
             class="absolute inset-0 w-full h-full object-cover object-[center_30%]"
           />
         </picture>
         ```

         And add `import heroPosterAvif from '$lib/assets/hero-poster.avif';` at the top of the script block.

         (Exact `<img>` content may vary slightly from current file; preserve existing classes/attrs verbatim — only wrap in `<picture>` and add the `<source>`.)

      3. Re-run Task 2 measurement (just the `/` URL is enough — the FOUND-03 gate). Use the SAME `--preset=mobile` profile as Task 2 — do NOT switch presets mid-escalation.
         If LCP now < 2.0s, stop here. Update 07-LIGHTHOUSE.json with the new measurement.
         If LCP still ≥ 2.0s, proceed to step (b).

    **Step (b) — Mobile portrait crop:**

      1. Author `src/lib/assets/hero-poster-portrait.{webp,avif}` (9:16 crop, mobile-optimized).
      2. Edit HeroPoster.svelte's `<picture>`:
         ```svelte
         <picture>
           <source media="(max-width: 640px)" srcset={heroPosterPortraitAvif} type="image/avif" />
           <source media="(max-width: 640px)" srcset={heroPosterPortraitWebp} type="image/webp" />
           <source srcset={heroPosterAvif} type="image/avif" />
           <img src={heroPoster} ... />
         </picture>
         ```
      3. Re-run measurement (same `--preset=mobile` profile). If pass, stop. Else proceed to (c).

    **Step (c) — Drop featured-grid `eager={true}`:**

      Edit `src/routes/+page.svelte` line 34:
        FROM: `<VideoCard {video} eager={true} />`
        TO:   `<VideoCard {video} eager={false} />`

      Re-run measurement (same `--preset=mobile` profile). If pass, stop. Else escalate to user per Task 3 option "ship-over-budget".

    **Per-step:** update `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` with the new measurement; add an `escalation_applied` field listing the steps taken (e.g., `["step-a-avif"]` or `["step-a-avif", "step-b-portrait"]`).

    D-09: every step uses image assets + Svelte markup — zero new JS deps.
  </action>
  <verify>
    <automated>pnpm build && pnpm test && grep -c "lcp_ms" .planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json</automated>
  </verify>
  <acceptance_criteria>
    - IF Task 3 selected "pass-ship-as-is": Task 4 is a no-op — no files modified, plan complete
    - IF any escalation applied: `07-LIGHTHOUSE.json` has an `"escalation_applied":` field listing the steps taken
    - IF step (a) applied: `grep -c "<picture>" src/lib/components/HeroPoster.svelte` returns at least 1
    - IF step (a) applied: `test -f src/lib/assets/hero-poster.avif` exits 0
    - IF step (a) applied: `grep -c "type=\"image/avif\"" src/lib/components/HeroPoster.svelte` returns at least 1
    - IF step (b) applied: `test -f src/lib/assets/hero-poster-portrait.webp` OR similar exists; HeroPoster.svelte has `media="(max-width: 640px)"` somewhere
    - IF step (c) applied: `grep -c "eager={true}" src/routes/+page.svelte` returns 0
    - Final LCP value in 07-LIGHTHOUSE.json `results[0].lcp_ms` is < 2000 OR `escalations_exhausted: true` field is set with rationale
    - `pnpm build` exits 0
    - `pnpm test` exits 0 (existing HeroPoster.test.ts + page.test.ts continue to pass — if step (a) or (b) wrap markup changes, test assertions on `<img>` selectors may need updating; if so, update tests minimally to use `picture img` selector instead of `img` direct)
    - `pnpm check` exits 0
    - `package.json` `dependencies` + `devDependencies` unchanged (D-09)
  </acceptance_criteria>
  <done>
    Either: (1) Task 3 = pass-and-ship and nothing was done, OR (2) one or more escalation steps applied and the final LCP measurement clears the 2.0s gate (or hard-finding documented for user).
  </done>
</task>

</tasks>

<verification>
- `.planning/phases/07-polish-production-cutover/07-LIGHTHOUSE.json` exists and parses as valid JSON
- `results[0].lcp_ms` (for `/`) is < 2000 ms OR a documented `escalations_exhausted` field explains a ship-over-budget decision
- All 4 per-route Lighthouse JSON files exist in the phase directory
- All Lighthouse audits used the D-07 canonical profile (mobile preset + Slow-4G throttle) — NOT desktop preset
- `pnpm build` exits 0; `pnpm test` exits 0; `pnpm check` exits 0
- `package.json` has no new dependencies (D-09)
</verification>

<success_criteria>
1. Lighthouse mobile audit captured against the approved target URL for all 4 routes
2. `07-LIGHTHOUSE.json` committed with structured summary (lcp_ms, cls, perf_score per route)
3. `/` LCP measurement is the FOUND-03 single-number gate; result recorded
4. If `/` LCP < 2.0s: shipped as-is per D-08 measure-first; D-05 pre-cutover blocker row "Lighthouse-CI LCP gate passing" flips GREEN
5. If `/` LCP ≥ 2.0s: D-08 escalation applied in order (a→b→c), stopping at the first pass
6. No new JS deps in `package.json` (D-09)
7. Existing test suite continues to pass
</success_criteria>

<output>
After completion, create `.planning/phases/07-polish-production-cutover/07-04-SUMMARY.md` capturing:
- Final `/` LCP value in ms
- Which escalation steps (if any) were applied
- Pass/fail status against the 2.0s FOUND-03 gate
- Pointer to 07-LIGHTHOUSE.json + per-route detailed reports
- Confirmation that pnpm build/test/check all exit 0
</output>
</content>
</invoke>