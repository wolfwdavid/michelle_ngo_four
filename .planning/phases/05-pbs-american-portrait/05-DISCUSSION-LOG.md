# Phase 5: PBS American Portrait - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 05-pbs-american-portrait
**Areas discussed:** URL & Discovery, Project Context Block, Page Composition, Grid & Per-Card Extras

---

## URL & Discovery

### Q1: What URL should the dedicated PBS landing live at?

| Option | Description | Selected |
|--------|-------------|----------|
| /pbs/ | Short, brandable, easy to type/share. Distinct from existing /work/pbs-american-portrait/ filter. | |
| /pbs-american-portrait/ | Spells out the full project name. More SEO-explicit. | ✓ |
| /projects/pbs-american-portrait/ | Nests under a /projects parent for future expansion. | |

**User's choice:** /pbs-american-portrait/
**Notes:** Explicit project name preferred for URL clarity even though it visually echoes /work/pbs-american-portrait/.

---

### Q2: Where should users find the link to this page?

| Option | Description | Selected |
|--------|-------------|----------|
| Cross-link from /work/pbs-american-portrait/ | Add link above/below filter grid. | ✓ |
| TopNav primary link | Add dedicated /pbs link to top nav. | ✓ |
| From /watch/[id] on each PBS video | "About this project" link near metadata. | ✓ |
| Footer link (deferred to Phase 6) | Phase 6 mirrored nav handles this automatically. | ✓ |

**User's choice:** All four (multi-select)
**Notes:** Maximum discovery. The TopNav choice triggered the follow-up about whether to retarget the existing PBS category link or add a second one.

---

### Q3: On /pbs, which TopNav link (if any) should be highlighted as active?

| Option | Description | Selected |
|--------|-------------|----------|
| The PBS American Portrait category link | Extend D-41 active logic so PBS link highlights on /pbs too. | ✓ |
| No nav link active on /pbs | Clean separation, /pbs is its own thing. | |
| Both PBS category link AND a new /pbs link | Two active states. | |

**User's choice:** The PBS American Portrait category link
**Notes:** Reinforces "you're in PBS context" regardless of surface (filter or landing).

---

### Q4: Should /work/pbs-american-portrait/ change as a result of Phase 5?

| Option | Description | Selected |
|--------|-------------|----------|
| Stays as-is, just add a cross-link | Phase 3 PBS-03 verified; add cross-link only. | ✓ |
| Redirects to /pbs entirely | Collapses to one PBS surface. Breaks PBS-03 literal interpretation. | |
| No change at all | Both stand alone; no cross-link. | |

**User's choice:** Stays as-is, just add a cross-link
**Notes:** Preserves PBS-03 parity contract; minimum-touch.

---

### Q5 (follow-up): The TopNav currently has 'PBS American Portrait' as one of 8 category links. How should the new /pbs-american-portrait/ landing fit in?

| Option | Description | Selected |
|--------|-------------|----------|
| Retarget the existing PBS category link to /pbs-american-portrait/ | PBS link in TopNav becomes the landing. Other 7 stay as /work/[slug]. | ✓ |
| Add /pbs-american-portrait as a SECOND PBS link in the nav | 9 primary nav items. Two PBS entries. | |
| Leave nav as-is, only add via cross-links and footer | No TopNav touch. | |

**User's choice:** Retarget the existing PBS category link to /pbs-american-portrait/
**Notes:** Cleanest. Special-cases PBS as the flagship — only category that breaks the /work/[slug] convention.

---

### Q6 (follow-up): Where exactly should the /watch/[id] → /pbs-american-portrait cross-link sit?

| Option | Description | Selected |
|--------|-------------|----------|
| Below the description, as an inline text link | After Phase 3 D-35 item 5, subtle. | ✓ |
| Replace the category tag link target for PBS videos | Retarget chip for PBS only. Breaks D-35 consistency. | |
| Above the description, as a dedicated callout | More visible bordered block. | |
| Skip the /watch → /pbs link | Redundant given TopNav retarget. | |

**User's choice:** Below the description, as an inline text link
**Notes:** Quiet, unobtrusive; preserves D-35 ordering for non-PBS videos.

---

## Project Context Block

### Q7: Who authors the project context copy?

| Option | Description | Selected |
|--------|-------------|----------|
| You write 2-3 sentences yourself | Michelle authors authentic copy. | |
| I draft 2-3 sentences, you edit | Claude drafts, user revises. | |
| Pull verbatim from PBS website (with attribution) | Use PBS's official description verbatim + credit. | ✓ |
| Minimal — just project name + outbound link | Lets cards speak. | |

**User's choice:** Pull verbatim from PBS website (with attribution)
**Notes:** Triggered the follow-up about Michelle's credit since PBS copy won't mention her role.

---

### Q8: How prominently should themes (Pride, Veterans, Juneteenth, etc.) surface?

| Option | Description | Selected |
|--------|-------------|----------|
| Mention the breadth in prose, no separate UI | Lets cards do the work. | ✓ |
| Pull-quote / stat callouts above the grid | "18 stories · 11 themed collections · 2020–2022" | |
| Themed chips/badges as visual anchors | Implies filterability. | |
| Don't surface themes at all | Cards reveal on hover/click. | |

**User's choice:** Mention the breadth in prose, no separate UI
**Notes:** Editorial restraint; avoids implying false filterability.

---

### Q9: Outbound link strategy?

| Option | Description | Selected |
|--------|-------------|----------|
| Single prominent link to pbs.org/american-portrait/ | One outbound link in context block. | ✓ |
| Project link + per-card 'See on PBS' badge on landing only | Surfaces per-collection URLs. | |
| No outbound links | Keep traffic on Michelle's site. | |

**User's choice:** Single prominent link to pbs.org/american-portrait/
**Notes:** Project-level only at the context-block level. (Per-card PBS badges were added separately in Area 4.)

---

### Q10 (follow-up): How should Michelle's credit appear?

| Option | Description | Selected |
|--------|-------------|----------|
| One-line credit after the PBS blockquote | "Michelle Ngo produced 18 stories for the series." | |
| Credit as the page subtitle, above the PBS blockquote | h1 → subtitle "18 stories produced by Michelle Ngo" → PBS blockquote. | ✓ |
| Just the PBS copy, no Michelle credit | Trust the site context. | |
| Two-paragraph block: PBS description + her POV | Highest quality, requires Michelle to author. | |

**User's choice:** Credit as the page subtitle, above the PBS blockquote
**Notes:** Portfolio-forward — leads with contribution. Reads quickly for cold-skimming producers.

---

### Q11 (follow-up): Where does the verbatim PBS copy come from at plan/execute time?

| Option | Description | Selected |
|--------|-------------|----------|
| Planner fetches pbs.org/american-portrait/ at plan time, surfaces in PLAN.md | Approved before execution. | ✓ |
| You paste the paragraph into the discussion now | Skips research round-trip. | |
| Execution-time — implementer fetches and pastes | Less review checkpoint. | |

**User's choice:** Planner fetches pbs.org/american-portrait/ at plan time, surfaces in PLAN.md for review
**Notes:** Approval gate before execution.

---

## Page Composition

### Q12: Overall page layout style?

| Option | Description | Selected |
|--------|-------------|----------|
| Editorial minimal — heading + subtitle + blockquote + grid | Magazine project page. No hero. | ✓ |
| Hero-style header with PBS still + overlay text | 40-60vh image header. Competes with Phase 4 `/` hero. | |
| Sectioned editorial — themed sub-groups | Highest engineering: requires title parsing. | |

**User's choice:** Editorial minimal — heading + subtitle + blockquote + grid
**Notes:** Avoids diluting the Phase 4 `/` hero pattern; matches editorial register of the rest of the site.

---

### Q13: How wide is the project context block?

| Option | Description | Selected |
|--------|-------------|----------|
| max-w-3xl (~48rem) — narrow editorial reading width | 65-75 char line. | |
| max-w-7xl (~80rem) — matches the grid width | Cohesive but wide for prose. | ✓ |
| max-w-5xl (~64rem) — middle ground | Compromise. | |

**User's choice:** max-w-7xl matching the grid width
**Notes:** Visual cohesion with grid trumps line-length ergonomics for a paragraph this short.

---

### Q14: Heading hierarchy on /pbs-american-portrait/?

| Option | Description | Selected |
|--------|-------------|----------|
| h1 project name in PBS accent + h2 'Stories' above grid | Phase 3 D-19 hierarchy. | ✓ |
| h1 project name only, no h2 above grid | Simpler markup. | |
| h1 project name + h2 'The Stories (18)' with count | Includes count. | |

**User's choice:** h1 project name in PBS accent color + h2 'Stories' above grid
**Notes:** Semantic clarity; count is implied by the visible grid.

---

### Q15: TopNav transparency — should /pbs-american-portrait/ inherit Phase 4's transparent-over-hero behavior?

| Option | Description | Selected |
|--------|-------------|----------|
| No — solid nav from first paint | Phase 4 D-13 contract preserved. | (resolved in Q16) |
| Yes — extend D-13 if hero-style | Only relevant with hero option. | (resolved in Q16) |

**User's choice:** (Conflicted with Q12 'editorial minimal' — resolved via Q16 follow-up)

---

### Q16 (follow-up): You picked 'editorial minimal' (no hero) AND 'extend transparent-nav.' Which do you actually want?

| Option | Description | Selected |
|--------|-------------|----------|
| Stick with editorial minimal — solid nav from first paint | Phase 4 D-13 stays intact. | ✓ |
| Switch to hero-style header + transparent nav | Revise Q12 to hero. | |
| Editorial minimal + thin PBS-accent-color band at top | Compromise. | |

**User's choice:** Stick with editorial minimal — solid nav from first paint
**Notes:** Confirmed Q12 was the stronger signal; nav transparency stays scoped to `/`.

---

## Grid & Per-Card Extras

### Q17: Sort order for the 18 PBS cards?

| Option | Description | Selected |
|--------|-------------|----------|
| Featured-first then date-desc (Phase 3 D-25 default) | Reuses comparator from /work/[category]. | ✓ |
| Pure date-desc — ignore featured flag | Featured rows blend in. | |
| Chronological (oldest first) — tells project arc | Reverse. | |
| User-curated order via new sort field | Schema change. | |

**User's choice:** Featured-first then date-desc (Phase 3 D-25 default)
**Notes:** Consistent with the rest of the site; predictable.

---

### Q18: How does the cross-link from /work/pbs-american-portrait/ render?

| Option | Description | Selected |
|--------|-------------|----------|
| Above the grid, below the heading — small inline link | Subtle, doesn't disrupt grid-first scan. | ✓ |
| Above the grid, as a callout block | Bordered, more visual weight. | |
| Below the grid, as a footer-style link | Like Phase 4 D-28 'View All Work →'. | |

**User's choice:** Above the grid, below the heading — small inline link
**Notes:** Phase 3 D-08 inline-link style; restraint over weight.

---

### Q19: Per-card 'See on PBS' badges?

| Option | Description | Selected |
|--------|-------------|----------|
| Skip — project-level outbound link is enough | One link in context block. | |
| Add small 'See on PBS →' badges below each card | Extract URL via regex from description. | ✓ |
| Make /watch description URLs clickable globally | Auto-linkify; out of strict scope. | |

**User's choice:** Add small 'See on PBS →' badges below each card
**Notes:** Each PBS description already contains a pbs.org/american-portrait/collection/... URL; render conditionally on /pbs-american-portrait/ only.

---

### Q20: VideoCard variant for PBS cards?

| Option | Description | Selected |
|--------|-------------|----------|
| Existing VideoCard verbatim — no variant | Same component as /work, /watch rail. | ✓ |
| Hide category tag on /pbs-american-portrait | Optional prop. | |
| Strip 'PBS American Portrait — ' prefix from titles | Title transform. | |

**User's choice:** Existing VideoCard verbatim — no variant
**Notes:** Triggered Q21 follow-up since Q19 (badges) and Q20 (no variant) conflicted.

---

### Q21 (follow-up): Where does the badge render without modifying VideoCard?

| Option | Description | Selected |
|--------|-------------|----------|
| Render badge in parent {#each} loop, BELOW VideoCard, inside <li> | VideoCard pure; page composes the extra. | ✓ |
| Add optional `extraSlot` snippet prop to VideoCard | More flexible but adds a slot. | |
| Drop per-card badges — reverse Q19 | Simplest. | |

**User's choice:** Render badge in the parent {#each} loop, BELOW the VideoCard, inside the <li>
**Notes:** Clean separation. Component contract untouched.

---

## Claude's Discretion

- Exact subtitle typography (size, tracking, shade) within Phase 3 D-12 type-scale
- Exact blockquote treatment (bordered-left vs italicized vs muted-bg)
- Exact outbound-link styling (inline vs subtle button)
- The regex for extracting `pbs.org/american-portrait/collection/...` URLs (recommended pattern surfaces in CONTEXT.md Claude's Discretion section)
- Path of the `pbsCollectionUrl` helper (route-local vs lib)
- Whether the "Stories" h2 includes count (default: no)
- Exact wording of cross-link microcopy (default: "→ About the PBS American Portrait project")
- Whether the `<blockquote>` carries a PBS-accent border-color

## Deferred Ideas

(See CONTEXT.md `<deferred>` section for the full list — covers rejected URL/layout options, Phase 6/7 punts, and out-of-scope items.)
