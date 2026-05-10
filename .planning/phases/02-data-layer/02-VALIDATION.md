---
phase: 2
slug: data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `02-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 (NOT yet installed — Wave 0 adds via `pnpm dlx sv add vitest`) |
| **Config file** | `vite.config.ts` (Vitest reads its `test` block) — created/extended by `sv add vitest` |
| **Quick run command** | `pnpm vitest run src/lib/data/` |
| **Full suite command** | `pnpm vitest run` |
| **Build-pipeline check** | `pnpm build` — Vite plugin's `buildStart` exits non-zero on schema violation; canonical DATA-03 proof |
| **Estimated runtime** | ~3 seconds (data-layer suite); ~6 seconds (full + svelte-check); ~25 seconds (with `pnpm build`) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/lib/data/` (data-layer suite only — sub-second feedback)
- **After every plan wave:** Run `pnpm check && pnpm vitest run && pnpm build` (svelte-check + full vitest + real build that exercises the validation plugin)
- **Before `/gsd:verify-work`:** Full suite green + `pnpm build` exits 0 + deliberate-corruption smoke test exits non-zero. All three must hold.
- **Max feedback latency:** ~3 seconds for the per-task loop

---

## Per-Task Verification Map

> Task IDs are placeholders until plans are written; planner fills the exact `{plan}-{task}` numbers when authoring PLAN.md files. Every requirement below has at least one automated check.

| Plan | Wave | Requirement | Behavior | Test Type | Automated Command | File Exists |
|------|------|-------------|----------|-----------|-------------------|-------------|
| 02-00 (Wave 0) | 0 | infra | Vitest installed; `vite.config.ts` has `test` block | install | `pnpm vitest --version` exits 0 | ❌ W0 |
| 02-01 | 1 | DATA-02 | All required fields present + typed for every record | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "canonical schema accepts a valid record"` | ❌ W0 |
| 02-01 | 1 | DATA-02 | Optional fields (`duration_seconds`, `description`) parse when absent | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "optional fields"` | ❌ W0 |
| 02-01 | 1 | DATA-03 | Schema violation — missing required field — rejected | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "rejects a missing required field"` | ❌ W0 |
| 02-01 | 1 | DATA-03 | Schema violation — non-ISO date — rejected | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "rejects a non-ISO date"` | ❌ W0 |
| 02-01 | 1 | DATA-04 | Unknown category string rejected by schema | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "rejects an unknown category"` | ❌ W0 |
| 02-01 | 1 | DATA-04 | All 8 canonical categories accepted | unit | `pnpm vitest run src/lib/data/schema.test.ts -t "accepts all 8 canonical categories"` | ❌ W0 |
| 02-01 | 1 | DATA-04 | `categoryToSlug` derivation is single-rule, kebab-case | unit | `pnpm vitest run src/lib/data/categories.test.ts -t "categoryToSlug"` | ❌ W0 |
| 02-02 | 2 | DATA-01 | `videos.json` contains exactly 56 videos | unit | `pnpm vitest run src/lib/data/videos.json.test.ts -t "exactly 56 videos"` | ❌ W0 |
| 02-02 | 2 | DATA-01 | All `id` values unique within their `source` | unit | `pnpm vitest run src/lib/data/videos.json.test.ts -t "unique IDs per source"` | ❌ W0 |
| 02-02 | 2 | DATA-02 | Canonical `videos.json` validates against schema | unit | `pnpm vitest run src/lib/data/videos.json.test.ts -t "canonical videos.json validates"` | ❌ W0 |
| 02-03 | 3 | DATA-01 | Loader exposes the typed array (no runtime fetch) | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "videos array length"` | ❌ W0 |
| 02-03 | 3 | DATA-03 | `pnpm build` exits non-zero when `videos.json` is corrupted | smoke | `node scripts/test-build-fails.mjs` (temp-corrupt JSON, run `pnpm build`, assert non-zero exit, restore) | ❌ W0 |
| 02-03 | 3 | D-04 (cross-cut) | Display order: PBS first, count desc, ties alpha | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "display order"` | ❌ W0 |
| 02-03 | 3 | D-09 (cross-cut) | `producerReelId` exported and references an existing video | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "producerReelId resolves"` | ❌ W0 |
| 02-03 | 3 | D-14 (cross-cut) | Hidden videos filtered from public surfaces | unit | `pnpm vitest run src/lib/data/videos.test.ts -t "hidden videos filtered"` | ❌ W0 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `pnpm dlx sv add vitest` — installs Vitest + jsdom, extends `vite.config.ts` with the `test` block, scaffolds a sample test
- [ ] `src/lib/data/schema.test.ts` — stubs for DATA-02, DATA-03, DATA-04 (per-record schema acceptance + rejection)
- [ ] `src/lib/data/videos.json.test.ts` — stubs for DATA-01, DATA-02 (canonical file: 56 rows, unique IDs, schema-validates)
- [ ] `src/lib/data/videos.test.ts` — stubs for loader behavior (display order D-04, hidden filtering D-14, `producerReelId` resolution D-09)
- [ ] `src/lib/data/categories.test.ts` — stubs for `categoryToSlug` derivation (D-03)
- [ ] `scripts/test-build-fails.mjs` — build-pipeline smoke test (temp-corrupt → `pnpm build` → assert non-zero → restore). Strongly recommended; without it, DATA-03 is asserted at the schema level but not at the build-pipeline level.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Run `pnpm build` once locally and confirm non-zero exit on a manually-broken record | DATA-03 (belt-and-braces) | Optional human sanity check above and beyond `scripts/test-build-fails.mjs`; humans see the formatted error message Zod's `prettifyError` produces | 1. `cp src/lib/data/videos.json /tmp/videos.json.bak` · 2. Edit a category to `"Gibberish"` · 3. `pnpm build` (expect non-zero exit + readable error) · 4. `cp /tmp/videos.json.bak src/lib/data/videos.json` |

*If the `scripts/test-build-fails.mjs` smoke test is included in Wave 0, this row becomes belt-and-braces — schema-level Vitest tests cover DATA-03 fully.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all `❌ W0` references in the verification map
- [ ] No watch-mode flags (`vitest run`, not `vitest`)
- [ ] Feedback latency < 5s for per-task loop
- [ ] `nyquist_compliant: true` set in frontmatter once planner confirms every task has a verify command

**Approval:** pending
