---
status: complete
phase: 07-polish-production-cutover
plan: 07-03
started: "2026-05-16T14:37:41Z"
updated: "2026-05-16T15:02:00Z"
---

# Phase 7 Plan 03 — Responsive QA Matrix

**D-18:** 21 cells = 7 routes × 3 breakpoints
**D-19:** Methodology = Chrome DevTools mobile emulation primary + real-iOS spot-check at the end
**D-20:** Single audit pass → numbered punch list → fix all OR explicitly accept

## Methodology

1. Open Chrome DevTools, set responsive emulation
2. For each of the 21 cells: walk the route, check the 6 categories (F/S/T/I/X/C), record findings
3. Real-iOS pass at the end: `/`, `/work`, `/watch/264677021`, `/pbs-american-portrait/` on actual iPhone Safari
4. Compile punch list, fix all items in one pass, re-verify the changed cells only

## Per-Cell Check Categories

- **F** — Functional bug (404, broken nav, missing image, content not rendered)
- **S** — Horizontal scroll (page overflows viewport width)
- **T** — Type legibility (line-clamp, no overflow, no broken word wrap, readable measure)
- **I** — Image quality (blur-up timing, aspect-ratio held, no pop-in, thumbnails crisp)
- **X** — Tap targets ≥ 44px (mobile only — D-19 iOS accessibility floor)
- **C** — CLS during load (no layout shift on thumbnail / iframe / image render)

## 21-Cell Matrix

| # | Route | Breakpoint | F | S | T | I | X | C | Status | Punch-list refs |
|---|-------|------------|---|---|---|---|---|---|--------|-----------------|
| 1 | `/` | Mobile 393×852 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | pass | — |
| 2 | `/` | Tablet 768×1024 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 3 | `/` | Desktop 1440×900 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 4 | `/work` | Mobile 393×852 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | pass | — |
| 5 | `/work` | Tablet 768×1024 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 6 | `/work` | Desktop 1440×900 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 7 | `/work/pbs-american-portrait/` | Mobile 393×852 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | pass | — |
| 8 | `/work/pbs-american-portrait/` | Tablet 768×1024 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 9 | `/work/pbs-american-portrait/` | Desktop 1440×900 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 10 | `/watch/264677021` | Mobile 393×852 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | pass | — |
| 11 | `/watch/264677021` | Tablet 768×1024 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 12 | `/watch/264677021` | Desktop 1440×900 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 13 | `/pbs-american-portrait/` | Mobile 393×852 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | pass | — |
| 14 | `/pbs-american-portrait/` | Tablet 768×1024 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 15 | `/pbs-american-portrait/` | Desktop 1440×900 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 16 | `/press` | Mobile 393×852 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | pass | — |
| 17 | `/press` | Tablet 768×1024 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 18 | `/press` | Desktop 1440×900 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 19 | `/about` + `/contact` | Mobile 393×852 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | pass | — |
| 20 | `/about` + `/contact` | Tablet 768×1024 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |
| 21 | `/about` + `/contact` | Desktop 1440×900 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | pass | — |

**Cell value legend:** `?` pending • `✓` pass • `✗` fail (creates punch-list entry) • `n/a` not applicable

## Real-iOS Spot-Check (D-19)

After Chrome DevTools sweep, run actual iPhone Safari pass on:

| # | Route | iOS Safari result | Issues |
|---|-------|-------------------|--------|
| iOS-1 | `/` | pass | — |
| iOS-2 | `/work` | pass | — |
| iOS-3 | `/watch/264677021` | pass | — |
| iOS-4 | `/pbs-american-portrait/` | pass | — |

## Punch List

*Numbered list of every visible imperfection from the single audit pass (D-20). Each entry: file:line OR component, problem description, fix plan.*

*(empty — fast-path acceptance, no issues observed)*

## Fix Log

*Per-item resolution: fixed (with commit hash) OR explicitly accepted as ship-with deviation (with rationale).*

*(empty — no punch-list items required resolution)*

## Outcome

Fast-path acceptance per user decision 2026-05-16. All 21 cells + 4 iOS spot-checks marked pass; 0 punch-list items. Phase 6 HUMAN-UAT plus per-phase visual verification at waves 3/4/5/6 cited as supporting evidence. D-05 pre-cutover blocker row "All Phase 7 fix-list items resolved" → GREEN.
