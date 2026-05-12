# Phase 6: Press, About & Contact - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 06-press-about-contact
**Areas discussed:** Press page composition, About page composition, Footer layout & mirrored-nav scope, Contact channels + /contact route fate

---

## Area selection

| Option | Description | Selected |
|--------|-------------|----------|
| Press page composition | Structure, data source, linkability, metadata | ✓ |
| About page composition | Bio voice/length, headshot, layout, disciplines | ✓ |
| Footer layout & mirrored-nav scope | Columns, mirror scope, copyright, visual treatment | ✓ |
| Contact channels + /contact route fate | Route fate, email surface, phone, channel order | ✓ |

**User's choice:** All four areas selected.

---

## Press page composition

### Press data source — where do the credits come from?

| Option | Description | Selected |
|--------|-------------|----------|
| Derived from videos.json | Press list computed at build time from videos where uploader/category signals broadcast credit. Zero new data authoring. (Recommended.) | ✓ |
| Hand-authored list | Separate press.json with title + network + date + optional blurb. Most flexibility, most authoring overhead. | |
| Hybrid: derived + hand-authored | Videos for broadcast credits + small hand-authored list for non-video press. Most flexible. | |

**User's choice:** Derived from videos.json

### Press page structure — how are credits organized?

| Option | Description | Selected |
|--------|-------------|----------|
| Grouped by network | Sections by publisher: HBO Max / HBO / PBS / Hulu / etc. Strongest brand-recognition scan signal. (Recommended.) | ✓ |
| Chronological list | Single linear list, newest first. CV-style. | |
| Logo grid (Sam Hendi-style) | Grid of network/brand logos as a trust wall. Requires logo assets. | |
| Hybrid: logo wall + grouped list | Logo grid above, grouped sections below. Strongest visual + scannable. | |

**User's choice:** Grouped by network

### Press item linkability — what does a press credit click do?

| Option | Description | Selected |
|--------|-------------|----------|
| Link to /watch/[id] | Each credit clicks to corresponding video on the site. (Recommended — single-site loop.) | ✓ |
| Link out to network URL | Click goes to HBO Max / Hulu / PBS landing for the show. Off-site bounce. | |
| Static — no link per item | Press credits render as text only. Cleanest editorial feel. | |
| Hybrid: /watch/[id] + external | Title links to /watch/[id], network links to external network landing. | |

**User's choice:** Link to /watch/[id]

### Press metadata — what shows per credit?

| Option | Description | Selected |
|--------|-------------|----------|
| Title + network only | Two-line entry: title, then network in muted small text. Cleanest. (Recommended for grouped-by-network.) | ✓ |
| Title + network + year | Adds 4-digit year derived from `published` ISO date. Three lines. | |
| Title + network + year + role | Adds Michelle's role. Requires new schema field. | |
| Title + network + year + blurb | Each credit gets 1-2 line description. Editorial but heavy. | |

**User's choice:** Title + network only
**Notes:** Since sections are grouped by network, the network is redundant inside the section — effective per-credit row is title only (linked to /watch/[id]). CONTEXT.md D-13 reflects this collapse.

### More Press questions (round 2)

### Which videos qualify as 'press' credits?

| Option | Description | Selected |
|--------|-------------|----------|
| Uploader is a network/distributor | Filter `uploader !== 'Michelle Ngo'` — 13 videos. (Recommended.) | ✓ |
| Promos & Trailers category only | category === 'Promos & Trailers' — 12 videos. Excludes Amazon News. | |
| Promos & Trailers + curated Branded | 12 + Amazon News = 13. Category-based filter. | |
| Hand-pick during plan | Planner surfaces all 56, user picks at plan time. | |

**User's choice:** Uploader is a network/distributor

### Section ordering — which network goes first?

| Option | Description | Selected |
|--------|-------------|----------|
| By prestige/recognizability | Hand-tuned: HBO Max / HBO / PBS / Hulu / U2 Sphere / Amazon / Music Box / ... (Recommended.) | ✓ |
| By count (most credits first) | Algorithmic; PBS would lead. | |
| Alphabetical | Neutral, but buries HBO Max + Hulu mid-list. | |
| Chronological by latest credit | Recency-first; HBO Max (2025 Billy Joel) leads. | |

**User's choice:** By prestige/recognizability

### Small/independent networks — how do they render?

| Option | Description | Selected |
|--------|-------------|----------|
| Each gets its own section | Every network from the filter gets a section even with 1 credit. (Recommended — depth-and-breadth framing.) | ✓ |
| Group small under 'Other' | 1-credit networks collapse into a final 'Other' section. | |
| Omit single-credit networks | Only render sections with 2+ credits. | |

**User's choice:** Each gets its own section

### Page heading + intro copy on /press?

| Option | Description | Selected |
|--------|-------------|----------|
| h1 'Press' only, no intro copy | Cleanest, fastest scan. (Recommended.) | ✓ |
| h1 + one-line tagline | h1 + muted single-line context-setter. | |
| h1 + multi-paragraph intro | h1 + short editorial paragraph framing career arc. | |
| h1 + section heading 'Networks' | h1 + h2 'Networks' anchoring sections (Phase 5 pattern). | |

**User's choice:** h1 'Press' only, no intro copy

---

## About page composition

### Bio voice — first person or third person?

| Option | Description | Selected |
|--------|-------------|----------|
| Third person | "Michelle Ngo is a filmmaker..." Industry-standard for hiring producers. (Recommended.) | |
| First person | "I'm a filmmaker..." More personal, warmer. | ✓ |
| Mixed | Third-person header + first-person prose. Rare. | |

**User's choice:** First person
**Notes:** User override of the recommended third-person default. CONTEXT.md D-17 records this explicitly as a user preference for a personal-landing voice over press-kit credential framing.

### Bio length — how much copy?

| Option | Description | Selected |
|--------|-------------|----------|
| Punchy (~80–120 words) | One tight paragraph optimized for 15-second hiring-producer scan. (Recommended.) | ✓ |
| Medium (~200–300 words) | Two-three paragraphs. Standard portfolio bio length. | |
| Long (~400–600 words) | Full editorial bio. Reading commitment. | |
| Placeholder until Michelle authors | Thin stand-in; real bio is a future swap. | |

**User's choice:** Punchy (~80–120 words)

### Headshot — how does it render?

| Option | Description | Selected |
|--------|-------------|----------|
| No headshot in v1 | Skip the photo entirely. (Recommended pending headshot confirmation.) | ✓ |
| Small portrait | Square/4:5 at ~200–320px beside bio. Needs new asset. | |
| Full-bleed hero portrait | Phase 4 hero pattern on /about. Competes with home hero. | |
| Candid on-set still | Frame from one of the videos. Zero new asset. | |

**User's choice:** No headshot in v1

### About page layout — how is the content arranged?

| Option | Description | Selected |
|--------|-------------|----------|
| Single column, editorial-narrow | Centered single column at max-w-2xl/3xl. Article-like reading. | ✓ |
| Single column, max-w-7xl matching site | Same width as /work and /press for cohesion. | |
| Two-column: bio + sidebar | Left bio, right sidebar with contact/links. | |
| Sectioned: bio / credentials / contact / links | Multiple h2-anchored sections stacked. | |

**User's choice:** Single column, editorial-narrow
**Notes:** CONTEXT.md D-21 locks max-w-2xl for /about prose ergonomics. Diverges from Phase 5 D-15 (which locked max-w-7xl for visual cohesion with the PBS grid) — different surface, different decision.

### More About questions (round 2)

### Bio copy authorship — who writes the ~100 words?

| Option | Description | Selected |
|--------|-------------|----------|
| Planner drafts, you approve at plan time | Phase 5 D-11 verbatim-copy pattern. (Recommended.) | ✓ |
| You provide the copy now | Hand-author in discuss session; CONTEXT.md captures inline. | |
| Placeholder — swap later | Thin placeholder; real bio is post-launch swap. | |

**User's choice:** Planner drafts, you approve at plan time

### Resume/CV download CTA on /about?

| Option | Description | Selected |
|--------|-------------|----------|
| No CV download | IMDb serves the credit-list use case. (Recommended.) | ✓ |
| Yes, PDF download | Sam Hendi-style. Needs new PDF asset. | |
| Yes, but Phase 7 polish | Defer to Phase 7. | |

**User's choice:** No CV download

### Legacy disciplines — surface on /about?

| Option | Description | Selected |
|--------|-------------|----------|
| Omit entirely | REQUIREMENTS.md Out of Scope. Page stays video-focused. (Recommended.) | ✓ |
| One-line mention in bio | Acknowledges range without dedicated UI. | |
| Dedicated 'Also' section below bio | Separate h2 + short list. | |

**User's choice:** Omit entirely

### IMDb / LinkedIn / Vimeo URLs — do you have them now?

| Option | Description | Selected |
|--------|-------------|----------|
| You'll provide them at plan time | Planner surfaces TBD placeholders in PLAN.md. (Recommended.) | ✓ |
| Vimeo only — derive from data | Vimeo from PROJECT.md context; IMDb + LinkedIn TBD. | |
| Paste them now | All three URLs in discuss session. | |

**User's choice:** You'll provide them at plan time

---

## Footer layout & mirrored-nav scope

### Footer layout — column structure?

| Option | Description | Selected |
|--------|-------------|----------|
| Three-column desktop | Contact / 8 categories / secondary. Stacks on mobile. (Recommended — yvonnerusso pattern.) | ✓ |
| Two-column desktop | Contact / full nav. Simpler; nav crowded. | |
| Single editorial row | One horizontal row. Most editorial; nav coverage suffers. | |
| Stacked sections, no columns | Vertical stack always. Most accessible, visually heaviest. | |

**User's choice:** Three-column desktop

### Mirrored-nav scope — what nav appears in the footer?

| Option | Description | Selected |
|--------|-------------|----------|
| Full mirror: 8 categories + About/Press/Contact | Every TopNav link in footer. NAV-02 literal. (Recommended.) | ✓ |
| Secondary only: About/Press/Contact + View All Work | Lighter weight; categories one click via TopNav. | |
| Categories only | 8 categories but not secondary. | |

**User's choice:** Full mirror: 8 categories + About/Press/Contact

### Production company / copyright treatment in footer?

| Option | Description | Selected |
|--------|-------------|----------|
| Copyright + 'Site by ...' | "© 2026 Michelle Ngo · Site built with SvelteKit". (Recommended.) | ✓ |
| Copyright only | "© 2026 Michelle Ngo" alone. | |
| Production company disclosure | "Michelle Ngo Productions LLC © 2026" — needs legal entity name. | |
| No footer credits strip | Footer ends at nav-mirror + contact. | |

**User's choice:** Copyright + 'Site by ...'

### Footer visual treatment — how does it sit on the page?

| Option | Description | Selected |
|--------|-------------|----------|
| Hairline top border + neutral bg | border-t border-white/10 + bg-neutral-950 + py-12/16. (Recommended — Phase 3 D-09 pattern.) | ✓ |
| Distinct darker band | Slightly different background. Subtle demarcation. | |
| Heavy editorial band | Tall footer with large wordmark — sam-hendi end-of-page. | |
| Full-bleed accent color | Category accent as background. Breaks Phase 3 D-02 monochrome. | |

**User's choice:** Hairline top border + neutral bg

---

## Contact channels + /contact route fate

### /contact route fate — Phase 3 ships a placeholder; what does Phase 6 do with it?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as real /contact page | h1 'Contact' + email/phone/socials block. Cheapest. (Recommended.) | ✓ |
| Redirect /contact → /about | One canonical contact surface. Static-export redirect. | |
| Drop /contact route entirely | Remove route + TopNav/footer links. Breaks Phase 3 D-43 URL contract. | |

**User's choice:** Keep as real /contact page

### Email surface — how does the email render?

| Option | Description | Selected |
|--------|-------------|----------|
| Clean mailto: link | `mailto:mynogo@gmail.com`. Industry standard 2026. (Recommended.) | ✓ |
| Obfuscated text + mailto: | Display 'mynogo [at] gmail.com', href is real. Belt-and-suspenders. | |
| Obfuscated, no mailto: | No href; users copy/paste. Maximum anti-scrape. | |
| JS-deobfuscated mailto: | JS reassembles on load. Adds JS to every page. | |

**User's choice:** Clean mailto: link

### Phone treatment — public visibility?

| Option | Description | Selected |
|--------|-------------|----------|
| Render as clickable tel: link | `tel:+19175661976` + display `(917) 566-1976`. (Recommended pending public visibility confirmation.) | ✓ |
| Render plain text, no tel: | Visible but not clickable. | |
| Omit phone entirely | Email + socials only. Privacy. | |
| Phone on /about only, not in footer | Phone on /about (engaged readers) but not every-page footer. | |

**User's choice:** Render as clickable tel: link
**Notes:** User explicitly confirmed public phone visibility. CONTEXT.md D-34 records this explicitly as a user decision for future privacy-review consultation.

### Channel order on the contact block?

| Option | Description | Selected |
|--------|-------------|----------|
| Email / Phone / IMDb / LinkedIn / Vimeo | Direct first, profiles next, platform last. (Recommended.) | ✓ |
| Email / IMDb / LinkedIn / Vimeo / Phone | Email first, then credentialing, phone last. | |
| IMDb / LinkedIn / Email / Phone / Vimeo | Credentialing first (proves credits), contact follows. | |
| Three groups: socials + direct + Vimeo | Visually-grouped rows. Needs icons. | |

**User's choice:** Email / Phone / IMDb / LinkedIn / Vimeo

---

## Final readiness

### We've discussed all four areas. Ready for context?

| Option | Description | Selected |
|--------|-------------|----------|
| I'm ready for context | Write CONTEXT.md now. Tactical details become Claude's Discretion. (Recommended.) | ✓ |
| Explore more gray areas | Surface 2-4 additional areas (page-bottom CTAs, mobile-collapse, focus-ring inheritance, component placement). | |

**User's choice:** I'm ready for context

---

## Claude's Discretion (captured in CONTEXT.md)

- HBO / HBO Max / HBODocs section merging (keep distinct per data, or curate)
- ABC News labeling (keep verbatim, or relabel "Hulu")
- Section heading wording on /press (no h2 above sections, or wrapping "Networks" h2)
- Container width on /press (max-w-3xl recommended)
- Footer column breakpoint (`sm:grid-cols-2 lg:grid-cols-3` recommended)
- Bottom-strip microcopy + alignment
- Per-section spacing between credit groups
- Whether /press groups show counts (recommend no, per D-16)
- Whether bio `<p>` carries an inner max-width tighter than the page container
- Footer column 3 microcopy ("Site" / "Navigation" / none)
- Whether `<ContactBlock />` includes a "Based in NYC" line (recommend no unless user asks)
- Whether footer category links use accent colors (recommend mono per D-31 guidance)

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section. Notable categories:
- Phase 7 polish (noindex removal, custom domain, headshot if provided, OG metadata)
- v2 / Out of Scope (CMS, newsletter, analytics, contact form, i18n)
- Considered-but-rejected alternatives for every gray area covered in this log
