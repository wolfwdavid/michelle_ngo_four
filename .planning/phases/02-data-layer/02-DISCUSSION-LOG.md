# Phase 2: Data Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 02-data-layer
**Areas discussed:** Category taxonomy, Field requirements + gaps, Reel + featured marker, Hidden / private videos

---

## Category taxonomy

### Q1: Final category list — what shape should the closed canonical list take?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep all 8 as-is (Recommended) | PBS American Portrait, Promos & Trailers, Branded Content, Documentary / Short Film, Reel, Personal / Tribute, Educational / Nonprofit, Other. Lowest authoring cost. | ✓ |
| Keep 7, drop Other (reassign its 3) | Move Whoopi → Promos & Trailers, May/Bobby → Personal / Tribute. Cleaner closed list. | |
| Collapse to 6 work-types | Merge Documentary + Educational; collapse Other into nearest. Cleaner nav. | |
| Rename a few labels | Promos & Trailers → Promo Reel, Personal / Tribute → Tribute. | |

**User's choice:** Keep all 8 as-is.
**Notes:** Recommended default accepted; "Other" remains a real category in v1.

### Q2: Single category per video, or multi-tag?

| Option | Description | Selected |
|--------|-------------|----------|
| Single category (Recommended) | Exactly one category per video. Matches YouTube-style click-to-filter and `/work/[category]` URL semantics. | ✓ |
| Single category + secondary tags | Primary category + optional free-tag array. More authoring overhead. | |
| Multi-tag (no primary) | 1–N tags per video. Click-to-filter ambiguity. | |

**User's choice:** Single category.

### Q3: Slug strategy for category URLs (`/work/[category]`)?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto kebab-case from name (Recommended) | Derived once in the schema; no per-video slug field. | ✓ |
| Explicit slug field on the category | More control; required if names have tricky punctuation. | |
| Hand-mapped overrides for a few | Auto kebab-case + override map for awkward names. | |

**User's choice:** Auto kebab-case from name.

### Q4: Category display order?

| Option | Description | Selected |
|--------|-------------|----------|
| By count descending (Recommended) | PBS American Portrait first, then Promos & Trailers, etc. Leads with flagship. | ✓ |
| Manual ordering on canonical list | Explicit order field per category. More control. | |
| Alphabetical | Predictable, but buries PBS. | |

**User's choice:** Count descending.

---

## Field requirements + gaps

### Q1: Required vs. optional — `duration_seconds` (14 of 56 missing, all YouTube)?

| Option | Description | Selected |
|--------|-------------|----------|
| Optional in schema (Recommended) | Schema accepts missing duration; UI degrades gracefully. Fastest. | ✓ |
| Required — backfill all 14 manually | Cleanest data; adds upstream task. | |
| Required + write a backfill script | Future-proof but requires API key handling. | |

**User's choice:** Optional in schema.

### Q2: Required vs. optional — `description` (23 of 56 missing/empty)?

| Option | Description | Selected |
|--------|-------------|----------|
| Optional in schema (Recommended) | Schema accepts empty/missing; UI hides description block. | ✓ |
| Required, default to empty string | Forces explicit '' on every row; makes "no copy" intentional. | |
| Required, must be non-empty | Strongest data quality; biggest authoring lift. | |

**User's choice:** Optional in schema.

### Q3: Date format in JSON?

| Option | Description | Selected |
|--------|-------------|----------|
| ISO date string `YYYY-MM-DD` (Recommended) | Already used in seed; JSON-native; sortable. | ✓ |
| Full ISO datetime `YYYY-MM-DDTHH:MM:SSZ` | Overkill; published times not meaningful at hour granularity. | |
| Unix epoch number | Compact but unreadable in PR diffs. | |

**User's choice:** ISO date string `YYYY-MM-DD`.

### Q4: Optional fields beyond DATA-02 to add now (multi-select)?

| Option | Description | Selected |
|--------|-------------|----------|
| `featured: boolean` (Recommended) | Marks videos for Phase 4 home grid. Optional, defaults false. | ✓ |
| `hidden: boolean` (Recommended) | Soft-hide a video without removing the row. Defaults false. | ✓ |
| `credits: { director?, producer?, agency?, dop? }` | Surface crew on /watch/[id] later. | ✓ |
| `tags: string[]` | Free-text v2 facets; ignored by v1 UI. | ✓ |

**User's choice:** All four added.

---

## Reel + featured marker

### Q1: How should the producer's reel be identified (PLAY REEL CTA target)?

| Option | Description | Selected |
|--------|-------------|----------|
| Top-level constant `producerReelId` (Recommended) | Single exported const = Vimeo 264677021. Zero ambiguity, stable contract. | ✓ |
| Per-video flag `isProducerReel: true` | Schema enforces "exactly one"; declarative inside JSON. | |
| Reuse `featured: true` for it | Fuzzier semantics; risk of Phase 4 picking wrong video. | |

**User's choice:** Top-level constant `producerReelId`.
**Notes:** Resolved value: `producerReelId = '264677021'` (Vimeo, "Michelle Ngo Producer's Reel", 52s, 2018-04-13).

### Q2: What does `featured: true` mean — single hero or multiple?

| Option | Description | Selected |
|--------|-------------|----------|
| Multiple allowed (Recommended) | Phase 4 featured grid shows the set; producer's reel identified separately. | ✓ |
| Exactly one allowed | Cleaner if "featured" means "the hero". | |
| Leave it open — Phase 4 decides | No enforcement now; might re-discuss. | |

**User's choice:** Multiple allowed.

### Q3: Should the producer's reel video appear in the regular `/work` grid + filters?

| Option | Description | Selected |
|--------|-------------|----------|
| Show it (Recommended) | Lives in Reel category alongside other 3 reels; producers expect to see her reel when filtering. | ✓ |
| Hide it from /work, only via PLAY REEL CTA | Treats reel as hero-only. | |

**User's choice:** Show it.

### Q4: Which videos should be marked `featured: true` initially?

| Option | Description | Selected |
|--------|-------------|----------|
| Defer — leave all false in v1 (Recommended) | Phase 4 picks once hero design exists. Schema is forward-compatible. | ✓ |
| Pick a curated 6–8 now | Lock featured grid in Phase 2. | |
| Auto-rule: most recent N per category | Recency ≠ quality. | |

**User's choice:** Defer — leave all false in v1; Phase 4 picks.

---

## Hidden / private videos

### Q1: Any of the 56 you do NOT want public on the new site?

| Option | Description | Selected |
|--------|-------------|----------|
| None — publish all 56 (Recommended) | New site mirrors the existing public Vimeo + YouTube surface. | ✓ |
| Hide MSK patient story | Patient stories sometimes carry consent constraints. | |
| Hide all 3 Personal / Tribute | Treats tributes as personal work, not portfolio. | |
| Let me list specific IDs | Free-form. | |

**User's choice:** None — publish all 56.

### Q2: Hidden mechanism — schema flag or omit row?

| Option | Description | Selected |
|--------|-------------|----------|
| Schema flag `hidden: true`; loader filters (Recommended) | Preserves canonical record; flip back via PR. | ✓ |
| Just omit the row from videos.json | Cleanest, but loses canonical record. | |
| Hidden flag + .gitignored `private/` fragment | Overkill for v1. | |

**User's choice:** Schema flag `hidden: true`; loader filters.

### Q3: Should hidden videos still show in "more in this category" rails?

| Option | Description | Selected |
|--------|-------------|----------|
| No, fully hidden everywhere (Recommended) | Single rule across grid, filters, rails, counts. | ✓ |
| Hidden from grid/filters but visible in rails | Confusing UX. | |

**User's choice:** No, fully hidden everywhere.

### Q4: Field default behavior — should missing `hidden` default to false?

| Option | Description | Selected |
|--------|-------------|----------|
| Default false (Recommended) | Omission = public; lowest noise in JSON. | ✓ |
| Required field on every row | Explicit status; adds 56 lines of `false`. | |

**User's choice:** Default false.

---

## Closing

### Anything else to discuss for Phase 2?

| Option | Description | Selected |
|--------|-------------|----------|
| I'm ready for context (Recommended) | Write CONTEXT.md; remaining items go to Claude's discretion. | ✓ |
| Explore more gray areas | Surface 2–3 additional decisions (validation library, loader API, error format). | |

**User's choice:** Ready for context.

## Claude's Discretion

- Validation library choice (Zod is the default; planner may pick Valibot/arktype with a reason).
- Where the validation hook runs (SvelteKit prerender vs. prebuild script vs. Vite plugin).
- Loader API surface — exact helper names and shapes.
- Schema error formatting / pretty-printing.
- Whether categories live in a separate `src/lib/data/categories.ts` or inline in the schema module.

## Deferred Ideas

- Backfill missing `duration_seconds` (14 YouTube rows) — future content pass.
- Backfill missing `description` (23 rows) — future content pass.
- Curate `featured: true` set — Phase 4.
- Surface `credits` on `/watch/[id]` — Phase 3 polish or v2.
- Consume `tags` in the UI — v2 facets/search.
- `getAllVideosIncludingHidden()` opt-in helper — only when a caller needs it.
- CMS migration — already Out of Scope.
