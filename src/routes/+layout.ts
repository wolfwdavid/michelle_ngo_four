export const prerender = true;

// Phase 3 Plan 03-03 D-Rule3: adapter-static emits flat `<route>.html` files
// by default (trailingSlash='never'); the build-artifact coverage script
// (scripts/test-prerender-coverage.mjs from Plan 03-00) expects the directory
// shape `<route>/index.html`. Setting trailingSlash='always' instructs the
// router AND adapter-static to use the directory output shape, matching the
// canonical Cloudflare Pages convention (URLs end with /).
// Affects: /work → /work/, /work/<slug> → /work/<slug>/, /watch/<id> → /watch/<id>/.
export const trailingSlash = 'always';
