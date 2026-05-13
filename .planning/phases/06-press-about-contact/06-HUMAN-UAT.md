---
status: partial
phase: 06-press-about-contact
source: [06-VERIFICATION.md]
started: "2026-05-13T01:55:00.000Z"
updated: "2026-05-13T01:55:00.000Z"
---

## Current Test

[awaiting human action — pre-production-cutover swap]

## Tests

### 1. IMDb + LinkedIn URL swap before michellengo.net cutover

expected: `src/lib/components/ContactBlock.svelte` lines 36–37 contain personalized profile URLs (e.g. `https://www.imdb.com/name/nm.../` and `https://www.linkedin.com/in/.../`) instead of the current `https://www.imdb.com/` / `https://www.linkedin.com/` channel-homepage fallbacks. Existing tests should pass without modification — the assertions are domain-contains checks.

result: [pending]

context: User explicitly approved the channel-homepage fallback on 2026-05-12 via the `/gsd:execute-phase` URL gate question. Documented in:
- `.planning/phases/06-press-about-contact/06-02-about-contact-pages-SUMMARY.md` Deviations §Rule 1
- `.planning/STATE.md` Blockers/Concerns
- A `NOTE` comment at the top of `src/lib/components/ContactBlock.svelte` source

This is a single-line edit per URL when Michelle's real profile URLs are available. Test command after edit: `pnpm test ContactBlock`.

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
