# Phase 3: Grid, Filter & Watch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `03-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 03-grid-filter-watch
**Areas discussed:** Theme & palette, Card & grid surface, Watch page composition, Top nav structure

---

## Theme & palette

### Q1: Site default theme
| Option | Description | Selected |
|--------|-------------|----------|
| Dark, monochromatic | Black/near-black bg, white/light-grey text, thumbnails carry all color. samhendi.com pattern. Phase 1 splash already runs this. RECOMMENDED | ✓ |
| Light, editorial | Off-white/cream bg, near-black text, isotopefilms / yvonnerusso pattern | |
| Dark home, light interior | Hero/home dark + /work + /watch + /about + /press light. Two design systems | |

**User's choice:** Dark, monochromatic.

### Q2: Accent / color treatment
| Option | Description | Selected |
|--------|-------------|----------|
| Pure monochrome | Black, white, grays only. Thumbnails carry 100% of color. RECOMMENDED | ✓ |
| Mono + one accent | Single accent for hovers, focus rings, active-filter chips | |
| You decide | Claude picks during planning | |

**User's choice:** Pure monochrome.

### Q3: Category-tag treatment on cards
| Option | Description | Selected |
|--------|-------------|----------|
| All-caps small tracked text, no chip background | Tag reads as label. samhendi / isotopefilms pattern. RECOMMENDED | |
| Pill chip with subtle background | Rounded chip with low-contrast bg | |
| Color-coded by category | Each category gets a distinct accent | ✓ |

**User's choice:** Color-coded by category.
**Notes:** Resolved with Q2 by reading the intent: chrome stays pure-mono, the 8 category tags are the only color in the UI (a deliberate tension). The tag still uses the all-caps tracked label form (not a pill chip) — it's the *fill color* that's category-specific.

### Q4: How cards sit against the background
| Option | Description | Selected |
|--------|-------------|----------|
| Flush thumbs, text below — no card panel | Just thumb + meta on the page bg. samhendi / YouTube. RECOMMENDED | ✓ |
| Subtle panel (1px hairline) | Soft delineation | |
| Drop-shadow / elevated card | Modern app-feel | |

**User's choice:** Flush thumbs, text below — no card panel.

### Q5: Typography family
| Option | Description | Selected |
|--------|-------------|----------|
| System sans (no webfonts) | Zero font-loading cost. Helps FOUND-03 perf budget. RECOMMENDED | ✓ |
| Self-hosted geometric sans | Inter / Manrope / Geist via @fontsource. ~30-50KB | |
| Serif headings + sans body | Editorial pairing | |

**User's choice:** System sans (no webfonts).

### Q6: Category color palette saturation
| Option | Description | Selected |
|--------|-------------|----------|
| Muted / desaturated tones | Low-chroma hues. RECOMMENDED | |
| High-saturation accents | Brighter, pop-y hues | ✓ |
| You decide | Claude picks 8 specific colors with AA contrast | |

**User's choice:** High-saturation accents.

### Q7: Card hover / focus state
| Option | Description | Selected |
|--------|-------------|----------|
| Subtle: title underline + thumb opacity shift | Quiet, accessible, fast. RECOMMENDED | ✓ |
| Lift: thumb scales 1.02 + shadow | More 'interactive' but adds noise | |
| Reveal: tag/meta animates in on hover | Hides info from non-hover users | |

**User's choice:** Subtle: title underline + thumb opacity shift.

### Q8: Focus ring for keyboard / accessibility
| Option | Description | Selected |
|--------|-------------|----------|
| White ring with offset on dark bg | 2px white outline + 2px offset. RECOMMENDED | ✓ |
| Browser default | Less consistent across browsers | |
| You decide | Claude picks | |

**User's choice:** White ring with offset on dark bg.

### Q9: Spacing rhythm
| Option | Description | Selected |
|--------|-------------|----------|
| Generous — editorial breathing room | 24-32px gutters, samhendi/isotopefilms feel. RECOMMENDED | |
| Tight — YouTube-density | 8-16px gutters | ✓ |
| You decide | Claude picks | |

**User's choice:** Tight — YouTube-density.

### Q10: Inline link / body-text color
| Option | Description | Selected |
|--------|-------------|----------|
| Underlined, same color as body text | 1px underline at body text color, no blue. RECOMMENDED | ✓ |
| Subtle color shift | Muted accent with optional underline | |
| You decide | Claude picks | |

**User's choice:** Underlined, same color as body text.

### Q11: Active filter state on /work
| Option | Description | Selected |
|--------|-------------|----------|
| Active category gets its accent color + persistent header | Chip uses category color; heading like 'PBS (18)'. RECOMMENDED | ✓ |
| Heading only, no chip styling change | | |
| You decide | Claude picks | |

**User's choice:** Active category gets its accent color + persistent header.

### Q12: Section dividers / horizontal rules
| Option | Description | Selected |
|--------|-------------|----------|
| Hairline 1px on white/10 — used sparingly | Thin top borders to separate nav/content/footer. RECOMMENDED | ✓ |
| No dividers — rely on whitespace | | |
| You decide | Claude picks | |

**User's choice:** Hairline 1px on white/10 — used sparingly.

---

## Card & grid surface

### Q13: Thumbnail aspect ratio
| Option | Description | Selected |
|--------|-------------|----------|
| 16:9 — cropped if source isn't 16:9 | object-cover, YouTube / samhendi. RECOMMENDED | ✓ |
| Native aspect of each source thumb | | |
| You decide | Claude picks | |

**User's choice:** 16:9 — cropped if source isn't 16:9.

### Q14: Card meta below the thumb
| Option | Description | Selected |
|--------|-------------|----------|
| Category tag + title + uploader (no date, no duration) | Three lines, cleanest scan. RECOMMENDED | ✓ |
| Tag + title + uploader + duration badge (when present) | | |
| Tag + title + uploader + published year | | |
| You decide | Claude picks | |

**User's choice:** Category tag + title + uploader (no date, no duration).

### Q15: Grid ordering
| Option | Description | Selected |
|--------|-------------|----------|
| Featured first, then date desc | Phase 2 D-10 already shipped `featured`. RECOMMENDED | ✓ |
| Date desc only | Ignores featured field | |
| Category display order grouped | isotopefilms manual sectioning | |

**User's choice:** Featured first, then date desc.

### Q16: Filter URL pattern
| Option | Description | Selected |
|--------|-------------|----------|
| Path-param: /work/[category] | REQUIREMENTS FILT-03 says this; prerenders per-category. RECOMMENDED | ✓ |
| Query-string: /work?category=[slug] | Single page, $page.url.searchParams | |
| Both — redirect query to path | | |

**User's choice:** Path-param: /work/[category].

### Q17: Blur-up placeholder strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Inline solid color placeholder | Fade-in, not true blur. RECOMMENDED for v1 | ✓ |
| Build-time LQIP base64 placeholders | True blur-up, higher build cost | |
| Native loading=lazy + decoding=async only | No placeholder | |

**User's choice:** Inline solid color placeholder.

### Q18: Responsive breakpoints
| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind defaults: 2-col <640, 3-col 640-1024, 4-col ≥1024 | Maps to GRID-02. RECOMMENDED | ✓ |
| 5-col on ≥1536px (2xl:) | More videos per row | |
| Container-query based | @container auto-fit | |

**User's choice:** Tailwind defaults: 2-col <640, 3-col 640-1024, 4-col ≥1024.

### Q19: Empty / error states
| Option | Description | Selected |
|--------|-------------|----------|
| SvelteKit 404 page — friendly but minimal | error() + +error.svelte. RECOMMENDED | ✓ |
| Redirect bogus slugs back to /work | | |
| You decide | Claude picks | |

**User's choice:** SvelteKit 404 page — friendly but minimal.

### Q20: /watch route shape
| Option | Description | Selected |
|--------|-------------|----------|
| /watch/[id] with id = source's id | Schema id directly. RECOMMENDED | ✓ |
| /watch/[source]/[id] | Disambiguates source | |
| /watch/[slug] (title-derived) | SEO-friendly | |

**User's choice:** /watch/[id] with id = the source's id.

### Q21: Thumbnail source resolution
| Option | Description | Selected |
|--------|-------------|----------|
| Use videos.json thumbnail URL as-is | No preprocessing. RECOMMENDED for v1 | ✓ |
| Request higher-res YouTube thumb (maxresdefault) | | |
| Add srcset for retina | | |

**User's choice:** Use videos.json thumbnail URL as-is.

### Q22: Hover prefetch
| Option | Description | Selected |
|--------|-------------|----------|
| Yes — SvelteKit data-sveltekit-preload-data='hover' | Built-in. RECOMMENDED | ✓ |
| Only on viewport (preload-data='viewport') | More aggressive | |
| No prefetch | | |

**User's choice:** SvelteKit data-sveltekit-preload-data='hover'.

### Q23: /work default landing
| Option | Description | Selected |
|--------|-------------|----------|
| All 56 videos, no category filter | RECOMMENDED | ✓ |
| Default to top category (PBS) | | |
| Grouped by category, all shown | isotopefilms manual sectioning | |

**User's choice:** All 56 videos, no category filter.

### Q24: Category tag on cards when filtered
| Option | Description | Selected |
|--------|-------------|----------|
| Always show the tag, even when filtered | Consistent component. RECOMMENDED | ✓ |
| Hide the tag on /work/[category] | Cleaner but introduces variant | |
| You decide | Claude picks | |

**User's choice:** Always show the tag, even when filtered.

### Q25: Max content width
| Option | Description | Selected |
|--------|-------------|----------|
| Constrained: max-w-7xl (1280px) centered | Standard portfolio width. RECOMMENDED | ✓ |
| Full-bleed | | |
| Wider: max-w-screen-2xl (1536px) | | |

**User's choice:** Constrained: max-w-7xl (1280px) centered.

### Q26: Image alt-text strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Alt = video title | Simple, sufficient. RECOMMENDED | ✓ |
| Alt = title + context | Verbose | |
| Alt = empty (decorative) | | |

**User's choice:** Alt = video title.

### Q27: Card gap spacing
| Option | Description | Selected |
|--------|-------------|----------|
| Tight: gap-2 mobile / gap-3 desktop (8px/12px) | YouTube-density. RECOMMENDED | ✓ |
| Medium: gap-4 / gap-6 (16px/24px) | | |
| You decide | Claude picks | |

**User's choice:** Tight: gap-2 mobile / gap-3 desktop.

### Q28: Page heading on /work
| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: small heading only on /work/[category], nothing on /work | RECOMMENDED | ✓ |
| Always show heading on both | | |
| Heading + category filter chips row on both | | |

**User's choice:** Minimal: small heading only on /work/[category], nothing on /work.

### Q29: Scroll restoration
| Option | Description | Selected |
|--------|-------------|----------|
| SvelteKit default — restores scroll on back-nav | RECOMMENDED | ✓ |
| Force scroll-to-top on every navigation | | |
| You decide | Claude picks | |

**User's choice:** SvelteKit default — restores scroll on back-nav.

### Q30: /work layout shape
| Option | Description | Selected |
|--------|-------------|----------|
| Single flat CSS grid | RECOMMENDED | ✓ |
| Virtualized list | Overkill at 56 | |
| Pagination / Load more | Unnecessary | |

**User's choice:** Single flat CSS grid.

### Q31: Card link shape
| Option | Description | Selected |
|--------|-------------|----------|
| Whole card is one <a href='/watch/[id]'> | One focus target. RECOMMENDED | ✓ |
| Thumb is link, title separate link | Two focus targets | |
| Clickable card via onClick | Worse a11y | |

**User's choice:** Whole card is one <a>.

### Q32: Category chip linkability on card
| Option | Description | Selected |
|--------|-------------|----------|
| Label only — chip is non-interactive | Avoids invalid nested <a>. RECOMMENDED | ✓ |
| Chip is its own link to /work/[category] | Requires lifting wrapper link off | |
| You decide | Claude picks | |

**User's choice:** Label only — chip is non-interactive.

### Q33: Cursor on hover
| Option | Description | Selected |
|--------|-------------|----------|
| cursor-pointer on the whole <a> | Automatic for <a>. RECOMMENDED | ✓ |
| Default cursor | Weakens affordance | |
| You decide | Claude picks | |

**User's choice:** cursor-pointer on the whole <a>.

### Q34: Aspect ratio enforcement
| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind aspect-video utility on wrapper | Reserves space, no layout shift. RECOMMENDED | ✓ |
| Set width/height attrs on <img> | | |
| You decide | Claude picks | |

**User's choice:** Tailwind aspect-video utility on wrapper.

### Q35: Title truncation
| Option | Description | Selected |
|--------|-------------|----------|
| 2-line clamp (line-clamp-2) | RECOMMENDED | ✓ |
| Single-line truncate | | |
| Don't truncate | Variable card heights | |

**User's choice:** 2-line clamp.

### Q36: Card body text sizes
| Option | Description | Selected |
|--------|-------------|----------|
| Tag xs / Title sm-base / Uploader xs muted | YouTube-style. RECOMMENDED | ✓ |
| Tag xs / Title base-lg / Uploader sm | Heavier per-card weight | |
| You decide | Claude picks | |

**User's choice:** Tag xs / Title sm-base / Uploader xs muted.

### Q37: Lazy-loading attribute
| Option | Description | Selected |
|--------|-------------|----------|
| loading='lazy' on all except first 8 | First 8 eager, rest lazy. RECOMMENDED | ✓ |
| loading='lazy' on all 56 | | |
| loading='eager' on all 56 | Worst for perf | |

**User's choice:** loading='lazy' on all except first 8.

### Q38: Decoding hint
| Option | Description | Selected |
|--------|-------------|----------|
| decoding='async' | RECOMMENDED | ✓ |
| No decoding attribute | | |
| You decide | Claude picks | |

**User's choice:** decoding='async'.

### Q39: Heading hierarchy
| Option | Description | Selected |
|--------|-------------|----------|
| <h3> for cards, <h1> for page, <h2> for /watch metadata title | Semantic landmark nav. RECOMMENDED | ✓ |
| <p> for card titles | Less semantic | |
| You decide | Claude picks | |

**User's choice:** <h3> for card titles, <h1> for page heading, <h2> for /watch metadata title.

### Q40: Svelte each key
| Option | Description | Selected |
|--------|-------------|----------|
| video.id (across both sources) | RECOMMENDED | ✓ |
| `${source}-${id}` composite | | |
| Array index | Risky | |

**User's choice:** video.id.

---

## Watch page composition

### Q41: Rail position
| Option | Description | Selected |
|--------|-------------|----------|
| Right-side on desktop, below on mobile (YouTube pattern) | RECOMMENDED | |
| Always below the player | Simpler layout | ✓ |
| Horizontal carousel below the player | Netflix rail | |

**User's choice:** Always below the player.

### Q42: Embed player loading
| Option | Description | Selected |
|--------|-------------|----------|
| Direct iframe in aspect-video wrapper, no autoplay | Simplest. RECOMMENDED | ✓ |
| Lazy iframe — poster image, instantiate on click | Saves ~200KB | |
| Autoplay-on-mount (muted) | Hostile to slow connections | |

**User's choice:** Direct iframe in aspect-video wrapper, no autoplay.

### Q43: Watch metadata
| Option | Description | Selected |
|--------|-------------|----------|
| Title h1, category tag, uploader, year, description (when present) | RECOMMENDED | ✓ |
| Title + uploader + year only | | |
| Title + uploader + full ISO date + description + credits + tags | | |

**User's choice:** Title (h1), category tag, uploader, published year, description (when present).

### Q44: Rail content
| Option | Description | Selected |
|--------|-------------|----------|
| All others in same category, current excluded | Matches FILT-02 literally. RECOMMENDED | ✓ |
| Capped at 12 + 'See all' link | | |
| Same category + 6 cross-category recs | | |

**User's choice:** All other videos in same category, current excluded.

### Q45: Rail card size
| Option | Description | Selected |
|--------|-------------|----------|
| Same grid as /work (2/3/4) | Reuses VideoCard component. RECOMMENDED | ✓ |
| Smaller compact rail cards (3/4/6) | Second card size | |
| Horizontal scroll strip | Netflix pattern | |

**User's choice:** Same grid as /work.

### Q46: Empty rail handling
| Option | Description | Selected |
|--------|-------------|----------|
| Hide the rail section entirely | RECOMMENDED | ✓ |
| Show heading + 'No other videos yet' copy | | |
| Fall back to cross-category strip | Dilutes 'more like this' | |

**User's choice:** Hide the rail section entirely.

### Q47: Browse-all-category CTA
| Option | Description | Selected |
|--------|-------------|----------|
| Heading is the link: 'More in PBS American Portrait →' clickable | RECOMMENDED | ✓ |
| Separate 'See all 18' button below the rail | | |
| No CTA — user uses top nav | | |

**User's choice:** Heading is the link.

### Q48: Player container width
| Option | Description | Selected |
|--------|-------------|----------|
| Constrained max-w-5xl (1024px) centered, aspect-video | RECOMMENDED | ✓ |
| Full max-w-7xl (1280px) centered | More cinematic | |
| Full-bleed, edge-to-edge | Most dramatic | |

**User's choice:** Constrained max-w-5xl (1024px) centered, aspect-video.

---

## Top nav structure

### Q49: How 8 categories surface
| Option | Description | Selected |
|--------|-------------|----------|
| Inline horizontal list of all 8 categories | samhendi pattern. RECOMMENDED | ✓ |
| Single 'Work' link — categories live inside /work | | |
| Work dropdown menu listing categories | | |

**User's choice:** Inline horizontal list of all 8 categories.

### Q50: Wordmark position
| Option | Description | Selected |
|--------|-------------|----------|
| Left-aligned 'MICHELLE NGO' clickable home link | Matches Phase 1 splash. RECOMMENDED | ✓ |
| Center-aligned wordmark | | |
| You decide | Claude picks | |

**User's choice:** Left-aligned 'MICHELLE NGO', clickable home link.

### Q51: Secondary links placement
| Option | Description | Selected |
|--------|-------------|----------|
| Right side, after categories, quieter (smaller or muted) | Pages land Phase 6; Phase 3 ships placeholder pages. RECOMMENDED | ✓ |
| Same weight as categories, mixed inline | | |
| Hidden in Phase 3 — only categories until Phase 6 | | |

**User's choice:** Right side of nav, after categories, visually quieter.

### Q52: Mobile nav pattern
| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger → full-screen overlay menu | RECOMMENDED | ✓ |
| Horizontal scroll chip bar at top | | |
| Bottom tab bar | iOS-app feel | |

**User's choice:** Hamburger → full-screen overlay menu listing all links.

---

## Claude's Discretion

The user deferred to Claude on the following details (called out in CONTEXT.md Claude's Discretion section):

- Specific hex values for the 8 category accent colors (AA contrast on bg-neutral-950, must feel distinct)
- Whether the top nav is sticky or static
- Whether nav category links show counts inline
- Hamburger icon style + mobile menu animation
- Plain-text-with-whitespace vs paragraph-split description rendering on /watch
- Hover-prefetch on category nav links
- `+error.svelte` exact copy
- Whether the rail heading on /watch shows a count

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section. No scope-creep ideas surfaced during the discussion — the user stayed inside Phase 3 boundaries throughout.
