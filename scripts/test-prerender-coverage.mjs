#!/usr/bin/env node
/**
 * Phase 3 — Build-artifact coverage check.
 *
 * Proves: after `pnpm build`, the static output contains the expected number of
 * prerendered HTML files:
 *   - build/work/index.html                  (1 file — the unfiltered /work route)
 *   - build/work/<slug>/index.html           (8 files — one per category)
 *   - build/watch/<id>/index.html            (56 files — one per video)
 *
 * Why this is necessary in addition to `adapter-static strict: true`:
 *   - `strict: true` fails the build if a route imported by another route is NOT
 *     prerenderable. But if `entries()` returns ZERO entries for /watch/[id],
 *     the build succeeds with zero /watch HTML files — `strict` doesn't catch
 *     an empty enumeration. This script does.
 *
 * Usage:
 *   pnpm build && node scripts/test-prerender-coverage.mjs
 * OR:
 *   pnpm test:prerender (after running `pnpm build` separately)
 *
 * Exit codes:
 *   0 — all counts meet or exceed the threshold.
 *   1 — at least one count is below threshold (prerender broken).
 *   2 — `build/` directory doesn't exist (run `pnpm build` first).
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const BUILD = resolve(REPO_ROOT, 'build');

if (!existsSync(BUILD)) {
  console.error(
    `[test-prerender-coverage] FATAL: ${BUILD} does not exist. Run 'pnpm build' first.`,
  );
  process.exit(2);
}

/**
 * Count subdirectories inside a directory that themselves contain an index.html
 * file (the canonical adapter-static prerender shape).
 */
function countPrerendered(parentDir) {
  if (!existsSync(parentDir)) return 0;
  const entries = readdirSync(parentDir, { withFileTypes: true });
  let count = 0;
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const indexHtml = join(parentDir, e.name, 'index.html');
    if (existsSync(indexHtml) && statSync(indexHtml).isFile()) count++;
  }
  return count;
}

// /work itself (the unfiltered grid) lives at build/work/index.html.
const workIndex = join(BUILD, 'work', 'index.html');
const workIndexExists = existsSync(workIndex);

// /work/[category]: 8 subdirs each with an index.html.
const workCategoryDirs = countPrerendered(join(BUILD, 'work'));

// /watch/[id]: 56 subdirs each with an index.html.
const watchIdDirs = countPrerendered(join(BUILD, 'watch'));

const expectedCategorySlugs = 8;
const expectedVideoIds = 56;

const failures = [];

if (!workIndexExists) {
  failures.push('Missing build/work/index.html (the unfiltered /work route).');
}
if (workCategoryDirs < expectedCategorySlugs) {
  failures.push(
    `Expected ≥${expectedCategorySlugs} build/work/<slug>/index.html files; found ${workCategoryDirs}.`,
  );
}
if (watchIdDirs < expectedVideoIds) {
  failures.push(
    `Expected ≥${expectedVideoIds} build/watch/<id>/index.html files; found ${watchIdDirs}.`,
  );
}

if (failures.length > 0) {
  console.error('[test-prerender-coverage] FAIL:');
  for (const f of failures) console.error('  - ' + f);
  console.error(
    `Found: build/work/index.html=${workIndexExists}, build/work/<slug>/index.html count=${workCategoryDirs}, build/watch/<id>/index.html count=${watchIdDirs}.`,
  );
  process.exit(1);
}

console.log('[test-prerender-coverage] PASS:');
console.log(`  - build/work/index.html: present`);
console.log(
  `  - build/work/<slug>/index.html: ${workCategoryDirs} files (expected ≥${expectedCategorySlugs})`,
);
console.log(
  `  - build/watch/<id>/index.html: ${watchIdDirs} files (expected ≥${expectedVideoIds})`,
);
process.exit(0);
