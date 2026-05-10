#!/usr/bin/env node
/**
 * Build-pipeline smoke test for DATA-03.
 *
 * Proves: `pnpm build` exits non-zero when `src/lib/data/videos.json` is corrupted
 * (the Vite plugin's `buildStart` hook calls `this.error()` on schema violation).
 *
 * Flow:
 *   1. Snapshot the current videos.json to a temp backup.
 *   2. Write a deliberately-corrupted videos.json (unknown category).
 *   3. Run `pnpm build` and capture the exit code.
 *   4. Restore the original videos.json from the backup (always — even on script crash).
 *   5. Exit 0 iff the build exited non-zero. Exit 1 if the build PASSED (that's the bug we're catching).
 *
 * Usage: node scripts/test-build-fails.mjs
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const VIDEOS_JSON = resolve(REPO_ROOT, 'src/lib/data/videos.json');
const BACKUP = resolve(REPO_ROOT, 'src/lib/data/videos.json.smoke-backup');

if (!existsSync(VIDEOS_JSON)) {
  console.error(
    `[test-build-fails] FATAL: ${VIDEOS_JSON} does not exist yet. ` +
      `This script can only run after Plan 02-02 authors videos.json AND Plan 02-03 wires the Vite plugin.`,
  );
  process.exit(2); // distinct from 1 (build-passed-bug) and 0 (success)
}

// Snapshot — restore on every exit path.
copyFileSync(VIDEOS_JSON, BACKUP);
const restore = () => {
  if (existsSync(BACKUP)) {
    copyFileSync(BACKUP, VIDEOS_JSON);
    unlinkSync(BACKUP);
  }
};
process.on('exit', restore);
process.on('SIGINT', () => {
  restore();
  process.exit(130);
});
process.on('uncaughtException', (e) => {
  restore();
  console.error(e);
  process.exit(2);
});

try {
  // Corrupt: take row 0, change its category to a definitely-not-canonical value.
  const original = JSON.parse(readFileSync(VIDEOS_JSON, 'utf-8'));
  if (!Array.isArray(original) || original.length === 0) {
    console.error('[test-build-fails] FATAL: videos.json is not a non-empty array.');
    process.exit(2);
  }
  const corrupted = JSON.parse(JSON.stringify(original));
  corrupted[0].category = 'Gibberish — Not A Real Category';
  writeFileSync(VIDEOS_JSON, JSON.stringify(corrupted, null, 2) + '\n');

  console.log('[test-build-fails] Corrupted videos.json[0].category. Running pnpm build...');
  const build = spawnSync('pnpm', ['build'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: true, // Windows-friendly: pnpm.cmd resolution
  });

  const exitCode = build.status ?? 1;
  console.log(`[test-build-fails] pnpm build exited with code ${exitCode}.`);

  if (exitCode === 0) {
    console.error(
      '[test-build-fails] FAIL: pnpm build PASSED on corrupted videos.json. ' +
        'The Vite validation plugin is not wired correctly — DATA-03 is not enforced at the build pipeline.',
    );
    process.exit(1);
  }

  console.log(
    '[test-build-fails] PASS: pnpm build correctly rejected corrupted videos.json (DATA-03 enforced).',
  );
  process.exit(0);
} finally {
  // restore() also fires from 'exit' handler — belt-and-braces in case process.exit short-circuits.
  restore();
}
