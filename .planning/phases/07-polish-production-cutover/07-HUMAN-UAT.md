---
status: partial
phase: 07-polish-production-cutover
source: [07-VERIFICATION.md]
started: "2026-05-19T00:00:00Z"
updated: "2026-05-19T00:00:00Z"
---

## Current Test

[awaiting human testing — execute Launch Runbook on cutover day]

## Tests

### 1. Execute Launch Runbook (07-05-SUMMARY.md § Launch Runbook, 9 gated steps)
expected: michellengo.net resolves to GH Pages anycast IPs (185.199.108-111.153); `curl -I https://michellengo.net/` returns HTTP/2 200 + `server: GitHub.com`; browser load shows SvelteKit site (not WordPress)
result: [pending]
blocks_criterion: Success Criterion 4 (production deploy reachable on final hosting URL with HTTPS)

### 2. Real-user LCP telemetry on `/` on michellengo.net after cutover
expected: LCP < 2.0s on `/` in real-user measurement (Cloudflare Pages Analytics, or one-off Lighthouse against apex)
result: [pending]
blocks_criterion: Success Criterion 1 (production build first paint < 2s on simulated 4G)
notes: If LCP > 2.0s on `/`, reopen FOUND-03 and apply D-08 escalation (AVIF → mobile portrait → drop eager)

### 3. Visual confirmation of favicon set + OG image on social shares and browser tabs
expected: Browser tab icon is the designed MN white-on-neutral-950 mark; iMessage/Slack link previews show a 1200×630 hero-derived OG image (not a 67-byte placeholder PNG and not the 15.4KB hero-poster.webp bytes renamed to og-image.jpg)
result: [pending]
blocks_criterion: (no success criterion gates this — placeholder assets satisfy URL-resolution contract for cutover; cosmetic polish is post-launch)

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
