---
phase: 04-reel-led-home
plan: 03
type: execute
wave: 1
depends_on: ["04-01"]
files_modified:
  - src/lib/data/videos.json
  - src/lib/data/videos.test.ts
autonomous: false
requirements: []
must_haves:
  truths:
    - "Exactly 8 rows in src/lib/data/videos.json have featured===true after the flip"
    - "The featured 8 include vimeo:264677021 (producerReelId) — same video that is the PLAY REEL CTA target (Pitfall 8)"
    - "Featured quota matches D-23: 2 PBS American Portrait, 2 Promos & Trailers, 2 Branded Content, 1 Documentary / Short Film, 1 Reel"
    - "Featured-included videos test stubs from Plan 04-01 turn green (describe.skip flipped to describe)"
    - "pnpm build still exits 0 (Zod plugin re-validates videos.json after edits — D-24)"
  artifacts:
    - path: "src/lib/data/videos.json"
      provides: "8 rows with featured: true (cross-category sampler per D-23)"
      contains: "\"featured\": true"
  key_links:
    - from: "src/lib/data/videos.json"
      to: "src/routes/+page.ts (plan 04-05)"
      via: "videos.filter(v => v.featured) returns the 8 cards"
      pattern: "v.featured"
    - from: "src/lib/data/videos.json"
      to: "/watch/${producerReelId} (PLAY REEL CTA target — plan 04-02)"
      via: "featured slice INCLUDES the reel — same video plays both roles (D-23 Reel slot, Pitfall 8)"
      pattern: "264677021"
---

<objective>
Flip `"featured": true` on the 8 specific `videos.json` rows curated in 04-RESEARCH.md §Featured Slice Curation. These 8 are the **cross-category sampler** the home page renders below the hero (D-23 quota: PBS x2, Promos x2, Branded x2, Doc x1, Reel x1; D-26 module-load filter). Then flip the featured-related test stubs in `videos.test.ts` from `describe.skip` to `describe` so the quota + reel-inclusion contract is locked in CI.

Purpose: this plan owns curation correctness. The 8 picks define the producer's first impression of Michelle's work — wrong picks = wrong message. Plan is **NOT autonomous**: Task 1 is a human-gate where the user reviews the curated table (verbatim from RESEARCH.md) and approves before any bits flip. D-23 is explicitly user-reviewable per CONTEXT.md.

Output: 8 edited rows in `videos.json`, 3 unskipped test suites in `videos.test.ts`, all green at `pnpm test`, build still passes Zod validation.

**Independence:** This plan has no production-code dependency on 04-02 (HeroPoster) or 04-04 (TopNav). It depends only on 04-01 (test infra Wave 0). It CAN run in parallel with 04-02 and 04-04 in Wave 1. But 04-05 (page composition) consumes the resulting featured slice, so 04-05 depends on this plan.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/04-reel-led-home/04-CONTEXT.md
@.planning/phases/04-reel-led-home/04-RESEARCH.md
@.planning/phases/04-reel-led-home/04-01-test-infrastructure-SUMMARY.md
@src/lib/data/videos.json
@src/lib/data/schema.ts
@src/lib/data/videos.test.ts

<interfaces>
<!-- The contract: featured is a boolean field already accepted by the Zod schema. -->

From src/lib/data/schema.ts (D-08 — `featured` already shipped in Phase 2):
```typescript
featured: z.boolean().default(false),
```

From src/lib/data/index.ts (consumer surface — what /+page.ts reads):
```typescript
export { videos, producerReelId } from './videos';
// producerReelId === '264677021' (Vimeo)
// videos.filter(v => v.featured) returns Video[]
```

D-08 contract from Phase 2 SUMMARY (videos.json does NOT inline `featured: false` for unflipped rows — the loader materializes the default at runtime). So Phase 4 ONLY adds `"featured": true` to 8 specific rows; it does NOT add `"featured": false` everywhere else.
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 1: Surface the curated 8-video featured table for user approval (D-23 deliverable)</name>
  <files>(no file edits — read-only surface)</files>
  <read_first>
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Featured Slice Curation (D-23 deliverable) — the canonical curation
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-23 (selection rule: quota + date-desc + client-recognizability tiebreaker)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-24 (`featured: true` flag flipped on 8 rows)
    - .planning/phases/04-reel-led-home/04-CONTEXT.md D-26 (filter at module load)
    - .planning/phases/04-reel-led-home/04-RESEARCH.md §Common Pitfalls Pitfall 8 (featured includes producerReelId, must be in Reel category)
    - src/lib/data/videos.json (verify each of the 8 ids actually exists with the asserted category + published date)
  </read_first>
  <action>
    Surface the verbatim D-23 curation table from 04-RESEARCH.md to the user for approval. Do NOT edit `videos.json` yet. Present:

    **The 8 curated picks (per 04-RESEARCH.md §Featured Slice Curation):**

    | # | id | source | title | category | published | client / why picked |
    |---|----|--------|-------|----------|-----------|---------------------|
    | 1 | `264677021` | vimeo | Michelle Ngo Producer's Reel | Reel | 2018-04-13 | **REQUIRED** — D-23 Reel slot = `producerReelId`; same video as PLAY REEL CTA target |
    | 2 | `1023002503` | vimeo | PBS American Portrait - Hispanic Heritage Month | PBS American Portrait | 2024-10-24 | PBS — newest PBS piece; broad cultural resonance |
    | 3 | `1007027015` | vimeo | Introducing PBS American Portrait | PBS American Portrait | 2024-09-06 | PBS — the launch/anchor video for the entire PBS American Portrait initiative; highest narrative weight in the PBS bucket; tiebreaker over peers in same date cluster |
    | 4 | `fvCB4gg7yS0` | youtube | Billy Joel: And So It Goes \| Official Trailer \| HBO Max | Promos & Trailers | 2025-07-11 | **HBO Max** — newest piece in the whole catalog; flagship broadcast credential |
    | 5 | `T7VG52035Z4` | youtube | U2:UV Achtung Baby Live At Sphere (Trailer) | Promos & Trailers | 2023-04-24 | **U2 Sphere** — iconic venue + iconic band; unique in the catalog (no other Sphere work); broadcast credential |
    | 6 | `770860055` | vimeo | Asians at Amazon Food Talks | Branded Content | 2022-11-14 | **Amazon** — newest Amazon piece + Michelle directed (per description); strong branded representation |
    | 7 | `244851084` | vimeo | Verizon Fios - Xbox | Branded Content | 2017-11-28 | **Verizon + Xbox** + Halo Wars 2 launch + **2017 Clio Award honorable mention**; commercial cred |
    | 8 | `264509512` | vimeo | Animal Art - Fly by Night | Documentary / Short Film | 2018-04-12 | Newest documentary short with the longest runtime (350s); strong format representation |

    **Quota check (D-23):**
    - PBS American Portrait: 2 ✓ (rows 2, 3)
    - Promos & Trailers: 2 ✓ (rows 4, 5)
    - Branded Content: 2 ✓ (rows 6, 7)
    - Documentary / Short Film: 1 ✓ (row 8)
    - Reel: 1 ✓ (row 1)
    - **Total: 8** ✓

    **Pitfall 8 check:** Row 1 (`264677021`) IS in the Reel category AND IS the `producerReelId` — the PLAY REEL CTA target and the featured Reel slot align (no UX inconsistency).

    **Post-sort row order (after D-25 published-date desc, computed at module load):**

    | Display position | id | published | title |
    |---|----|-----------|-------|
    | 1 | `fvCB4gg7yS0` | 2025-07-11 | Billy Joel HBO Max |
    | 2 | `1023002503` | 2024-10-24 | PBS Hispanic Heritage Month |
    | 3 | `1007027015` | 2024-09-06 | Introducing PBS American Portrait |
    | 4 | `T7VG52035Z4` | 2023-04-24 | U2 Sphere trailer |
    | 5 | `770860055` | 2022-11-14 | Asians at Amazon Food Talks |
    | 6 | `264677021` | 2018-04-13 | Producer's Reel |
    | 7 | `264509512` | 2018-04-12 | Animal Art - Fly by Night |
    | 8 | `244851084` | 2017-11-28 | Verizon Fios - Xbox |

    First desktop row (4-col) = HBO / PBS / PBS / U2 — exactly the broadcast-credentials-first read a hiring producer wants.

    Before surfacing, verify each of the 8 ids actually exists in `src/lib/data/videos.json` with the asserted source + category + published date. If any row is mismatched (e.g., id has different category than the table claims), flag it to the user as an inconsistency, do NOT proceed with substitutions on Claude's own judgment — surface the issue and ask for guidance.

    Then PAUSE and wait for user approval before proceeding to Task 2 (which actually edits videos.json).
  </action>
  <verify>
    User reply contains the literal string "approved" (or completes a swap/redo cycle that ends in "approved").
  </verify>
  <what-built>
    The verbatim 8-video curation table from 04-RESEARCH.md surfaced in chat with quota + Pitfall 8 + post-sort order tables. No code or data changes yet.
  </what-built>
  <how-to-verify>
    1. Claude prints the curated table to chat with quota + Pitfall 8 check + post-sort order.
    2. Claude confirms it has verified each id exists with the asserted shape in `videos.json`.
    3. User reviews the picks and replies with EITHER:
       - "approved" (proceed with all 8 picks as listed), OR
       - "swap N for [other id from videos.json], reason: ..." (substitute a specific pick), OR
       - "redo the [category] picks" (re-curate one category).
    4. If swap/redo: Claude re-applies the D-23 selection rules to the changed slot and re-surfaces the updated table. Iterate until "approved".
    5. After approval, Claude proceeds to Task 2.
  </how-to-verify>
  <resume-signal>
    Reply: "approved" — OR — "swap N for [id]" — OR — "redo the [category] picks"
  </resume-signal>
  <acceptance_criteria>
    - User has explicitly approved (or iterated to an approved set of) 8 video ids
    - Final approved set satisfies the D-23 quota: 2 PBS / 2 Promos / 2 Branded / 1 Doc / 1 Reel
    - Final approved set includes `264677021` in the Reel slot (Pitfall 8)
    - All 8 approved ids actually exist in `videos.json` with the asserted category
  </acceptance_criteria>
  <done>
    User has approved an 8-video featured set. Claude has the final id list ready for Task 2.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Flip "featured": true on 8 rows in videos.json + unskip videos.test.ts featured suite</name>
  <files>src/lib/data/videos.json, src/lib/data/videos.test.ts</files>
  <read_first>
    - src/lib/data/videos.json (the rows for the 8 ids — read the full file to confirm exact byte positions; the JSON is large but readable in 2-3 reads)
    - src/lib/data/videos.test.ts (Plan 04-01 appended a `describe.skip` block at the END — this task flips it to `describe`)
    - .planning/STATE.md note (Phase 2 D-08: featured/hidden/tags/credits NOT inlined as defaults in videos.json — only added per-row when non-default)
    - vite.config.ts (validateVideosPlugin — runs Zod validation on `pnpm build`; the schema accepts `featured: true` per Phase 2 D-08)
  </read_first>
  <behavior>
    Tests expected to pass (3 tests in the new `describe('Phase 4 featured slice — D-23 / D-24 / D-26', ...)` block):
    - Test 1 (`8 featured`): `videos.filter(v => v.featured).length === 8`
    - Test 2 (`featured includes reel`): featured slice contains an entry where `id === producerReelId` AND `category === 'Reel'` (Pitfall 8)
    - Test 3 (`featured quota`): featured slice has counts `PBS American Portrait: 2`, `Promos & Trailers: 2`, `Branded Content: 2`, `Documentary / Short Film: 1`, `Reel: 1`, and NO entries from `Personal / Tribute`, `Educational / Nonprofit`, or `Other`
  </behavior>
  <action>
    **Step A — flip 8 rows in `src/lib/data/videos.json`.** For each of the 8 approved ids from Task 1 (the canonical set from 04-RESEARCH.md §Featured Slice Curation, modulo any user swaps):

    ```
    264677021   (Vimeo, Reel)
    1023002503  (Vimeo, PBS American Portrait)
    1007027015  (Vimeo, PBS American Portrait)
    fvCB4gg7yS0 (YouTube, Promos & Trailers)
    T7VG52035Z4 (YouTube, Promos & Trailers)
    770860055   (Vimeo, Branded Content)
    244851084   (Vimeo, Branded Content)
    264509512   (Vimeo, Documentary / Short Film)
    ```

    Find each record in `videos.json` and add `"featured": true` to the object. Place the key right after `"category"` (or at any consistent position — the field order inside a JSON object is not load-bearing but consistency reduces diff noise). Example (existing row for `264677021`):

    ```jsonc
    {
      "source": "vimeo",
      "id": "264677021",
      "title": "Michelle Ngo Producer's Reel",
      ...
      "category": "Reel",
      "featured": true,   // ← NEW
      ...
    }
    ```

    **Do NOT** add `"featured": false` to any other rows. Phase 2 D-08 contract: defaults are materialized by the loader at parse time (`featured: z.boolean().default(false)`), and STATE.md explicitly notes "Did NOT inline D-08 default fields ... loader materializes defaults at runtime" — adding 48 `"featured": false` entries to the other rows would add 224 lines of zero-info noise and drift risk (per the Phase 2 SUMMARY decision).

    **Critical: preserve JSON byte-format conventions.**
    - File ends with a trailing newline.
    - Indentation = 2 spaces (matches existing file).
    - String quotes = double quotes.
    - No trailing commas.
    - Run `pnpm format` after edits if you're unsure — Prettier on the `.json` will fix any whitespace inconsistency. (`videos.json` is in `.prettierignore` per Phase 2 P02 — if so, just hand-format consistently.)

    After saving, run `pnpm build` immediately to confirm the Zod plugin still validates the file. If the build fails, surface the error to the user (likely a typo in the JSON edits).

    **Step B — flip the featured test suite from RED-by-skip to GREEN.** In `src/lib/data/videos.test.ts`, find the block appended at the end by Plan 04-01:

    ```ts
    describe.skip('Phase 4 featured slice — D-23 / D-24 / D-26', () => {
      ...
    });
    ```

    Replace `describe.skip(` with `describe(`. The block stays otherwise identical. Tests inside use lazy `await import('./videos')` so no other restructuring needed.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/data/videos.test.ts && pnpm build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '"featured": true' src/lib/data/videos.json` equals 8
    - `grep -c '"featured": false' src/lib/data/videos.json` equals 0 (per Phase 2 D-08 contract — defaults stay out of JSON)
    - `pnpm vitest run src/lib/data/videos.test.ts -t "8 featured"` exits 0
    - `pnpm vitest run src/lib/data/videos.test.ts -t "featured includes reel"` exits 0
    - `pnpm vitest run src/lib/data/videos.test.ts -t "featured quota"` exits 0
    - `pnpm vitest run src/lib/data/videos.test.ts` exits 0 (full suite — existing Phase 2 tests still green, new Phase 4 suite green)
    - `grep -c "describe.skip" src/lib/data/videos.test.ts` equals 0 (no remaining skips)
    - `pnpm build` exits 0 (Zod plugin re-validates after edits — D-24)
    - `pnpm test` exits 0 (full project test suite)
    - `pnpm check` exits 0
  </acceptance_criteria>
  <done>
    Exactly 8 videos.json rows have `featured: true`. The featured slice composition is locked in CI: quota tests + Pitfall 8 reel inclusion test all green. `/+page.ts` (plan 04-05) can rely on `videos.filter(v => v.featured).length === 8` returning the curated 8.
  </done>
</task>

</tasks>

<verification>
After both tasks:

1. `pnpm vitest run src/lib/data/videos.test.ts -t "8 featured"` — exits 0
2. `pnpm vitest run src/lib/data/videos.test.ts -t "featured quota"` — exits 0
3. `pnpm vitest run src/lib/data/videos.test.ts -t "featured includes reel"` — exits 0
4. `pnpm build` — exits 0, no Zod validation errors
5. The featured set matches user approval (no drift between Task 1 surface and Task 2 edits)
</verification>

<success_criteria>
Plan 04-03 is complete when:

- [ ] User has approved the 8-video featured set (Task 1 checkpoint signed off)
- [ ] Exactly 8 `videos.json` rows have `"featured": true` (zero `"featured": false` entries)
- [ ] The approved 8 include `264677021` (producerReelId, Reel category) — Pitfall 8 lock
- [ ] D-23 quota satisfied: 2 PBS / 2 Promos / 2 Branded / 1 Doc / 1 Reel
- [ ] All Phase 4 featured-slice tests in `videos.test.ts` are GREEN (no skips)
- [ ] `pnpm build` still passes (Zod validates the edited JSON)
- [ ] `pnpm test && pnpm check && pnpm build` all exit 0
</success_criteria>

<output>
After completion, create `.planning/phases/04-reel-led-home/04-03-featured-slice-flips-SUMMARY.md` per the standard summary template.
</output>
