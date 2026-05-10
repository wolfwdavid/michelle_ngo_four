# Phase 02 — Deferred Items

Tracking out-of-scope issues discovered during plan execution that are NOT caused by the
current plan's changes. Per GSD SCOPE BOUNDARY rule.

## Discovered during Plan 02-02

### Prettier formatting drift in `scripts/test-build-fails.mjs`

- **Discovered:** 2026-05-10 (Plan 02-02 execution, Task 1)
- **How found:** Running `pnpm prettier --check .` to confirm `.prettierignore` exclusion of
  `videos.json` works. Prettier reports `scripts/test-build-fails.mjs` has style issues
  and `pnpm prettier --check .` exits 1.
- **Owner phase:** 02-00 (the plan that created the script)
- **Scope:** NOT my plan's deliverable; pre-existing condition. `lint-staged` won't touch
  it on this plan's commits (only staged files run through prettier), so it doesn't block
  my pre-commit hooks. Whoever next stages `scripts/test-build-fails.mjs` will trigger
  the autoformat.
- **Fix:** One-liner — `pnpm prettier --write scripts/test-build-fails.mjs`. Plan 02-03
  may want to do this as a Rule-1 fix if it touches the script for the smoke test.
