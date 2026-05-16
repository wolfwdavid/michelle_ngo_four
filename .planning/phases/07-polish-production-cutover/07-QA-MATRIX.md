---
status: pending
phase: 07-polish-production-cutover
plan: 07-03
started: "2026-05-16T14:37:41Z"
updated: "2026-05-16T14:37:41Z"
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
| 1 | `/` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
| 2 | `/` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
| 3 | `/` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
| 4 | `/work` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
| 5 | `/work` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
| 6 | `/work` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
| 7 | `/work/pbs-american-portrait/` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
| 8 | `/work/pbs-american-portrait/` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
| 9 | `/work/pbs-american-portrait/` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
| 10 | `/watch/264677021` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
| 11 | `/watch/264677021` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
| 12 | `/watch/264677021` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
| 13 | `/pbs-american-portrait/` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
| 14 | `/pbs-american-portrait/` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
| 15 | `/pbs-american-portrait/` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
| 16 | `/press` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
| 17 | `/press` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
| 18 | `/press` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |
| 19 | `/about` + `/contact` | Mobile 393×852 | ? | ? | ? | ? | ? | ? | pending | — |
| 20 | `/about` + `/contact` | Tablet 768×1024 | ? | ? | ? | ? | ? | ? | pending | — |
| 21 | `/about` + `/contact` | Desktop 1440×900 | ? | ? | ? | ? | ? | ? | pending | — |

**Cell value legend:** `?` pending • `✓` pass • `✗` fail (creates punch-list entry) • `n/a` not applicable

## Real-iOS Spot-Check (D-19)

After Chrome DevTools sweep, run actual iPhone Safari pass on:

| # | Route | iOS Safari result | Issues |
|---|-------|-------------------|--------|
| iOS-1 | `/` | pending | — |
| iOS-2 | `/work` | pending | — |
| iOS-3 | `/watch/264677021` | pending | — |
| iOS-4 | `/pbs-american-portrait/` | pending | — |

## Punch List

*Numbered list of every visible imperfection from the single audit pass (D-20). Each entry: file:line OR component, problem description, fix plan.*

*(Filled in during Task 2)*

## Fix Log

*Per-item resolution: fixed (with commit hash) OR explicitly accepted as ship-with deviation (with rationale).*

*(Filled in during Task 3)*

## Outcome

*Final state: ALL items fixed OR explicitly accepted. Matrix doc is committed; D-05 pre-cutover blocker checklist row "All Phase 7 fix-list items resolved" can be marked GREEN.*

*(Filled in at end of Task 3)*
