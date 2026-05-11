import { defineWorkspace } from 'vitest/config';

/**
 * Phase 3 Wave 0: split Vitest into two projects so component + route tests
 * (which need a DOM via jsdom) coexist with the Phase 2 data-layer tests
 * (which run faster in plain Node).
 *
 * Why a workspace (not a single global `environment: 'jsdom'` swap)?
 *   - Phase 2 ships 32 data-layer tests in plain Node — switching them to jsdom
 *     adds ~150ms of DOM bootstrap per test file for zero gain. Keep them in Node.
 *   - jsdom is only needed where `mount()` runs against `document.body`.
 *
 * Project layout:
 *   data — extends vite.config.ts (which has the validateVideosPlugin + the
 *          existing `test:` block with environment 'node'). Picks up
 *          src/lib/data/** test files only.
 *   ui   — fresh config with environment: 'jsdom'. Picks up
 *          src/lib/components/** and src/routes/** test files.
 *
 * Single command: `pnpm test` (which is `vitest run --passWithNoTests`)
 * runs BOTH projects. The existing `pnpm test:data` script narrowed to
 * `src/lib/data/` continues to work (path filter, no project filter).
 */
export default defineWorkspace([
  {
    // Data-layer project — inherits vite.config.ts (node env).
    extends: './vite.config.ts',
    test: {
      name: 'data',
      include: ['src/lib/data/**/*.{test,spec}.{js,ts}'],
    },
  },
  {
    // Component + route project — fresh jsdom env.
    // Do NOT `extends: './vite.config.ts'` here: that would inherit
    // environment: 'node' and we'd have to override with environment: 'jsdom'
    // anyway, plus inheriting brings the data-layer coverage `include`
    // which would emit coverage warnings for components.
    extends: './vite.config.ts',
    test: {
      name: 'ui',
      include: [
        'src/lib/components/**/*.{test,spec}.{js,ts}',
        'src/routes/**/*.{test,spec}.{js,ts}',
      ],
      environment: 'jsdom',
      globals: false,
    },
  },
]);
