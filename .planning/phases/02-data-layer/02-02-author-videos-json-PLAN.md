---
phase: 02-data-layer
plan: 02
type: execute
wave: 2
depends_on: ["02-01"]
files_modified:
  - src/lib/data/videos.json
  - src/lib/data/videos.json.test.ts
  - .prettierignore
autonomous: true
requirements:
  - DATA-01
  - DATA-02
must_haves:
  truths:
    - "`src/lib/data/videos.json` exists, parses as a JSON array of length exactly 56."
    - "Every record validates against `VideoArraySchema` from Plan 02-01 — zero failures, zero warnings."
    - "Every record's `(source, id)` pair is unique across the array — no dedupe regression."
    - "Category counts match D-04 exactly: PBS 18, Promos 12, Branded 8, Doc/Short 5, Reel 4, Personal 3, Edu 3, Other 3 (total = 56)."
    - "The Vimeo `264677021` Producer Reel record exists with `category: 'Reel'` (D-09 — referenced by Plan 02-03's `producerReelId` constant)."
    - "Zero records have `featured: true` in v1 (D-10 — Phase 4 will curate)."
    - "Zero records have `hidden: true` in v1 (D-12 — all 56 publish)."
    - "All `describe.skip` blocks in `videos.json.test.ts` have had `.skip` removed and turn GREEN."
  artifacts:
    - path: "src/lib/data/videos.json"
      provides: "Canonical 56-video data file"
      contains: "Array of 56 video records"
    - path: ".prettierignore"
      provides: "Excludes videos.json from Prettier reformat churn"
      contains: "src/lib/data/videos.json"
  key_links:
    - from: "src/lib/data/videos.json.test.ts"
      to: "src/lib/data/videos.json"
      via: "import videosJson from './videos.json'"
      pattern: "from\\s+['\"]\\./videos\\.json['\"]"
    - from: "src/lib/data/videos.json.test.ts"
      to: "src/lib/data/schema.ts"
      via: "VideoArraySchema validation"
      pattern: "VideoArraySchema"
---

<objective>
Author the canonical `src/lib/data/videos.json` from `_prep/03-videos-seed.json`. The seed already has 56 deduped records with the right shape — this plan does a one-shot copy + sanity checks against the Plan 02-01 schema, and adds the file to `.prettierignore` to avoid pre-commit reformat churn (Pitfall 4).

Purpose: Implements DATA-01 (56 videos in repo-checked JSON) and DATA-02 (every record has the required fields shape). Plan 02-03 will then wire the Vite plugin that fails the build on schema violation, but the schema-level proof that the canonical file is valid lives here in `videos.json.test.ts`.

Output:
- `src/lib/data/videos.json` — copied verbatim from `_prep/03-videos-seed.json`'s `videos` array
- `.prettierignore` — adds the videos.json path
- `videos.json.test.ts` — `.skip` removed, all 5 tests GREEN
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-data-layer/02-CONTEXT.md
@.planning/phases/02-data-layer/02-RESEARCH.md
@.planning/phases/02-data-layer/02-VALIDATION.md
@_prep/03-videos-seed.json

<interfaces>
<!-- Plan 02-01 created src/lib/data/{categories.ts, schema.ts}. -->
<!-- Plan 02-00 created src/lib/data/videos.json.test.ts with 5 describe.skip tests. -->

From src/lib/data/schema.ts (Plan 02-01):
```ts
export const VideoSchema = z.discriminatedUnion('source', [
  z.strictObject({ source: z.literal('youtube'), ...CommonFields }),
  z.strictObject({ source: z.literal('vimeo'), ...CommonFields }),
]);
export const VideoArraySchema = z.array(VideoSchema);
```
Important: `z.strictObject` rejects unknown keys. The seed records have these top-level keys:
- `source, id, title, uploader, published, thumbnail, url, embed, category` (always)
- `duration_seconds, description` (optional — present on most rows)

The schema accepts all of those (the optional `url` field is in `CommonFields`). NO seed record has `featured`, `hidden`, `tags`, or `credits` — those are D-08 schema-forward additions with defaults. They get materialized at parse time, NOT in the JSON.

From _prep/03-videos-seed.json (top-level shape — DO NOT copy verbatim, only the `.videos` ARRAY):
```json
{
  "sources": { ... },
  "counts": { "after_dedupe": 56 },
  "categories_proposed": [ ... ],
  "videos": [ /* 56 records */ ]
}
```
The output `src/lib/data/videos.json` is JUST the inner `.videos` array — top-level is `[`, not `{`.

From src/lib/data/videos.json.test.ts (Plan 02-00 stub):
- describe.skip block contains 5 it() tests:
  - 'canonical videos.json validates'
  - 'exactly 56 videos'
  - 'unique IDs per source'
  - 'contains the producer reel (vimeo:264677021)'
  - 'category counts match D-04 (PBS:18, Promos:12, Branded:8, Doc:5, Reel:4, Personal:3, Edu:3, Other:3)'

From package.json `lint-staged` (Phase 1):
```json
"*.{css,json,md,yaml,yml}": ["prettier --write"]
```
Without `.prettierignore`, every commit touching videos.json reformats the file → noisy diffs (Pitfall 4).

From .prettierignore (current state — likely doesn't exist yet, planner should check; if it doesn't exist, create it).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Author src/lib/data/videos.json from the seed and add it to .prettierignore</name>
  <files>src/lib/data/videos.json, .prettierignore</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\_prep\03-videos-seed.json (lines 1-30 — confirms top-level shape: outer object has `videos` array; we extract ONLY that array as the canonical file)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 552-575 Code Examples — Authoring videos.json from the seed)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\schema.ts (Plan 02-01 — this is the schema the output JSON must validate against; confirms accepted top-level keys per record)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-RESEARCH.md (lines 446-449 Pitfall 4 — Prettier reformat churn on JSON; .prettierignore is the documented mitigation)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\package.json (lint-staged config: `*.{css,json,md,yaml,yml}` runs `prettier --write` — without .prettierignore exclusion, pre-commit will reformat videos.json on every commit)
  </read_first>
  <action>
    Step 1 — Author `src/lib/data/videos.json` by extracting the `.videos` array from `_prep/03-videos-seed.json`. The seed already matches the schema exactly — no field renaming, no transforms, no backfill (D-06: optional fields stay missing where the seed omits them).

    From the repo root, run this one-shot Node command (NO `tsx`, NO extra dep, NO committed `scripts/seed-to-videos.ts` — the script in 02-RESEARCH was illustrative; running the one-liner is simpler and leaves no dead code):

    ```
    node -e "const fs=require('node:fs');const seed=JSON.parse(fs.readFileSync('_prep/03-videos-seed.json','utf-8'));const out=seed.videos;if(!Array.isArray(out)||out.length!==56){console.error('FATAL: expected 56 videos, got '+(out&&out.length));process.exit(1);}fs.writeFileSync('src/lib/data/videos.json',JSON.stringify(out,null,2)+'\n');console.log('Wrote '+out.length+' videos');"
    ```

    Expected console output: `Wrote 56 videos`.

    On Windows PowerShell, the command above works as-is from the Bash tool (the project's PowerShell shell tolerates the inner single quotes inside `node -e "..."`). If quote-escaping causes issues, save the payload as `scripts/_seed.mjs`, run `node scripts/_seed.mjs`, then DELETE the file (do NOT commit it).

    Verify the output by hand:
    - First two bytes of `src/lib/data/videos.json` are `[` then newline (it's an array, not an object).
    - File ends with `]` + trailing newline.
    - File is 2-space indented (JSON.stringify(_, null, 2)).

    Do NOT add `featured`, `hidden`, `tags`, or `credits` fields to any record. D-08 are schema defaults, materialized at parse time, NOT in the JSON. D-10 keeps `featured: false` uniformly in v1. D-12 keeps `hidden: false` uniformly in v1. Adding them to the JSON would create drift and inflate the diff for zero benefit.

    Do NOT modify any record's `category` value — they already match the canonical D-01 list (pre-verified by the planner: 8 categories present, exact counts PBS=18, Promos=12, Branded=8, Doc/Short=5, Reel=4, Personal=3, Edu=3, Other=3, total=56).

    Step 2 — Add `src/lib/data/videos.json` to `.prettierignore` (Pitfall 4: prevent pre-commit reformat churn from making one-line video edits produce massive diffs).

    Check whether `.prettierignore` exists at the repo root:
    - If it exists, append two lines on a new block:
      ```
      
      # Phase 2: data file owns its own format (avoid pre-commit reformat churn on small edits)
      src/lib/data/videos.json
      ```
    - If it does NOT exist, create it with the standard SvelteKit ignores PLUS our new line:
      ```
      # SvelteKit + build artifacts
      .DS_Store
      node_modules
      /build
      /.svelte-kit
      /package
      .env
      .env.*
      !.env.example
      pnpm-lock.yaml
      package-lock.json
      yarn.lock
      
      # Phase 2: data file owns its own format (avoid pre-commit reformat churn on small edits)
      src/lib/data/videos.json
      ```

    Step 3 — Confirm Prettier honors the ignore by running:
    ```
    pnpm prettier --check src/lib/data/videos.json
    ```
    Expected output: a message saying the file is ignored (Prettier 3 prints `[warn] src/lib/data/videos.json is ignored.` and exits 0).

    Step 4 — Sanity check that the JSON validates against the Plan 02-01 schema BEFORE running the test file (faster feedback than vitest):
    ```
    node -e "const{VideoArraySchema}=await import('./src/lib/data/schema.ts').catch(()=>import('./src/lib/data/schema.js')); /* fallback if not transpiled */"
    ```
    NOTE: this will NOT work directly because Node can't import `.ts` without a loader. Skip the inline schema check; rely on Task 2's vitest run instead. (Documented here so the executor doesn't waste time trying.)
  </action>
  <verify>
    <automated>node -e "const j=JSON.parse(require('node:fs').readFileSync('src/lib/data/videos.json','utf-8'));if(!Array.isArray(j))throw new Error('not array');if(j.length!==56)throw new Error('wrong length: '+j.length);const reel=j.find(v=>v.source==='vimeo'&&v.id==='264677021');if(!reel)throw new Error('reel missing');if(reel.category!=='Reel')throw new Error('reel category wrong: '+reel.category);console.log('OK: 56 videos, reel present');"</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/data/videos.json` exists.
    - File starts with the literal character `[` (it's a JSON array, not an object).
    - File parses successfully as JSON via `JSON.parse(readFileSync(...))`.
    - Parsed array has length exactly 56.
    - Parsed array contains an object with `source === 'vimeo'` AND `id === '264677021'` AND `category === 'Reel'` (Producer Reel — D-09 reference target).
    - Parsed array's category counts equal D-04: 18 PBS American Portrait, 12 Promos & Trailers, 8 Branded Content, 5 Documentary / Short Film, 4 Reel, 3 Personal / Tribute, 3 Educational / Nonprofit, 3 Other.
    - NO record in the array has a key named `featured`, `hidden`, `tags`, or `credits` (D-08 defaults stay in the schema, NOT in the JSON). Verifiable: `grep -c "\"featured\"\\|\"hidden\"\\|\"tags\"\\|\"credits\"" src/lib/data/videos.json` returns 0.
    - File `.prettierignore` exists.
    - File `.prettierignore` contains the literal line `src/lib/data/videos.json`.
    - `pnpm prettier --check src/lib/data/videos.json` exits 0 AND output contains the word `ignored`.
  </acceptance_criteria>
  <done>
    `src/lib/data/videos.json` is a 56-record array matching the seed; the Producer Reel record is present; D-04 category counts hold; no D-08 default fields are inlined; `.prettierignore` excludes the file from pre-commit reformat churn.
  </done>
</task>

<task type="auto">
  <name>Task 2: Unskip src/lib/data/videos.json.test.ts and verify all 5 tests pass</name>
  <files>src/lib/data/videos.json.test.ts</files>
  <read_first>
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\videos.json.test.ts (Wave 0 stub — has 1 describe.skip block with 5 it() tests; this task removes the .skip and removes the @ts-expect-error directive on the videos.json import)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\videos.json (created in Task 1)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\src\lib\data\schema.ts (Plan 02-01 — `VideoArraySchema` is what the test calls)
    - C:\Users\Mkaru\Documents\Hello_World\hugginface_profile\Websites\michelle_ngo_four\.planning\phases\02-data-layer\02-VALIDATION.md (rows for Plan 02-02 — the test names this task validates)
  </read_first>
  <action>
    Step 1 — In `src/lib/data/videos.json.test.ts`:

    a. Remove the line `// @ts-expect-error — file exists after Plan 02-02` directly above the `import videosJson from './videos.json';` line. The file now exists; the directive will trigger an "unused @ts-expect-error" error if left in place.

    b. Find the SINGLE `describe.skip(...)` call (`describe.skip('canonical videos.json', ...)`) and replace `describe.skip` with `describe`.

    The file should now start:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { VideoArraySchema } from './schema';
    import videosJson from './videos.json';

    describe('canonical videos.json', () => {
    ```

    (NO `@ts-expect-error`, NO `.skip`.)

    Step 2 — Confirm Vite's first-class JSON import is configured. The default Vite/SvelteKit setup imports `.json` files natively (per Vite docs); no plugin needed. If the test fails on the import line ("Cannot find module './videos.json'"), it's a `tsconfig`/`resolveJsonModule` issue — confirm `.svelte-kit/tsconfig.json` (the extended config) has `"resolveJsonModule": true`. SvelteKit's default tsconfig sets this; if missing, add it to `tsconfig.json` `compilerOptions` as a single-line override (this is one of the rare ALLOWED additions to the root tsconfig — Phase 1 RESEARCH Pitfall 3 only forbids `include`, not `compilerOptions` flags).

    Step 3 — Run the test file:
    ```
    pnpm vitest run src/lib/data/videos.json.test.ts
    ```
    Expected: 5/5 tests pass. If any fail, the failure points to a real schema-file mismatch — investigate, do NOT silence the test.

    Likely failure modes and resolutions:
    - "validates" fails with `unrecognized_keys` for some record → the seed has a field the schema doesn't accept. Re-check `CommonFields` in `schema.ts`; the schema must accept `url` (already in `CommonFields` per Plan 02-01).
    - "exactly 56 videos" fails → the seed got truncated or the array literal is wrong; re-run Task 1's `node -e ...` command.
    - "unique IDs per source" fails → seed has a dedupe regression; investigate `_prep/03-videos-seed.json`.
    - "contains the producer reel" fails → `264677021` got renamed; do not patch the test, investigate the seed.
    - "category counts match D-04" fails → category was edited in the seed; verify against `_prep/04-categories.md`.

    Step 4 — Run the full data-layer suite to confirm no cross-test regressions:
    ```
    pnpm vitest run src/lib/data/
    ```
    Expected: schema.test.ts (10), categories.test.ts (5), videos.json.test.ts (5) all green; videos.test.ts still skipped (Plan 02-03 owns it). Total: 20 passing, 6 skipped (the 6 describe blocks in videos.test.ts).

    Step 5 — Run `pnpm check` and confirm zero TS errors. The JSON-import line is the most likely TS-error source if `resolveJsonModule` isn't enabled.
  </action>
  <verify>
    <automated>pnpm vitest run src/lib/data/videos.json.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `src/lib/data/videos.json.test.ts` no longer contains the literal string `describe.skip` (count = 0).
    - `src/lib/data/videos.json.test.ts` no longer contains the literal string `@ts-expect-error`.
    - `pnpm vitest run src/lib/data/videos.json.test.ts` exits 0 with output showing "5 passed" (or equivalent — 5 tests in the unskipped describe block all pass).
    - `pnpm vitest run src/lib/data/` exits 0 with at least 20 passing tests (schema.test.ts: 10, categories.test.ts: 5, videos.json.test.ts: 5) and the videos.test.ts tests still skipped.
    - `pnpm check` exits 0.
  </acceptance_criteria>
  <done>
    All 5 canonical-file integrity tests pass: schema validation, length=56, unique-(source,id), reel present, D-04 category counts. The videos.json file is locked as the canonical source of truth.
  </done>
</task>

</tasks>

<verification>
**After both tasks complete:**

1. `node -e "const j=JSON.parse(require('node:fs').readFileSync('src/lib/data/videos.json','utf-8')); console.log(j.length);"` prints `56`.
2. `pnpm vitest run src/lib/data/videos.json.test.ts` exits 0 with 5/5 passing.
3. `pnpm vitest run src/lib/data/` exits 0 — totals: 20 passing, 6 skipped (the 6 describe blocks in videos.test.ts that Plan 02-03 will unskip).
4. `pnpm check` exits 0.
5. `pnpm build` exits 0 (no Vite plugin yet — schema validation runs only at vitest level until Plan 02-03).
6. `pnpm prettier --check src/lib/data/videos.json` exits 0 with output mentioning "ignored".
7. `.prettierignore` contains the line `src/lib/data/videos.json`.

**Goal-backward check:**
- Truth: "videos.json contains 56 records" → length test green ✓
- Truth: "videos.json validates against schema" → safeParse test green ✓
- Truth: "Producer Reel is present" → vimeo:264677021 test green ✓
- Truth: "Category counts match D-04" → counts test green ✓
- Truth: "No D-08 fields inlined" → grep returns 0 ✓
- Truth: "Pre-commit won't churn the file" → `.prettierignore` line present ✓
</verification>

<success_criteria>
Plan 02-02 complete when:
- [ ] `src/lib/data/videos.json` exists, is a 56-record array, validates against `VideoArraySchema`
- [ ] Producer Reel (vimeo:264677021, category: 'Reel') is in the array
- [ ] D-04 category counts hold (PBS 18, Promos 12, Branded 8, Doc 5, Reel 4, Personal 3, Edu 3, Other 3)
- [ ] No record has `featured`, `hidden`, `tags`, or `credits` keys (defaults live in the schema, not the JSON)
- [ ] `.prettierignore` excludes `src/lib/data/videos.json`
- [ ] All 5 tests in `videos.json.test.ts` pass
- [ ] `pnpm vitest run src/lib/data/` exits 0 (20 passing, 6 skipped)
- [ ] `pnpm check` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/02-data-layer/02-02-SUMMARY.md` documenting:
- The one-shot `node -e ...` command used to extract the array (no scripts committed)
- Confirmation of the 56-record count and category distribution
- Why `.prettierignore` excludes videos.json (Pitfall 4 mitigation)
- Why D-08 fields stay out of the JSON (defaults materialize at parse time, per Pitfall 2)
- Confirmation that the videos.test.ts tests remain skipped — owned by Plan 02-03
</output>
