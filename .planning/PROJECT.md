# Michelle Ngo Portfolio

## What This Is

A portfolio website for **Michelle Ngo**, filmmaker and multidisciplinary creative. The site replaces the current WordPress.com landing at michellengo.net with a SvelteKit-based experience built around 56 deduped videos pulled from her YouTube playlist + Vimeo account. Primary audience is hiring producers and agencies evaluating her for video production work; the site leads with a reel and surfaces press credits prominently.

## Core Value

A producer can land on the site, watch the reel, click any video, and immediately see "more like this" — every interaction reinforces the depth and breadth of her video work.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Reel-first home page with full-bleed hero (looping reel or hero video + PLAY REEL CTA)
- [ ] YouTube-style video grid with thumbnail, title, category tag, and uploader/client name
- [ ] Click-to-filter mechanic: clicking a card opens a player view AND filters the surrounding grid to that card's category
- [ ] Deep-linkable URLs reflecting filter state (`/work?category=branded-content`, `/watch/[id]`)
- [ ] Dedicated PBS American Portrait page surfacing the 18 PBS videos with project context, in addition to PBS being a filterable category
- [ ] First-class Press page surfacing HBO Max, PBS, Hulu, Amazon, U2 Sphere, and other broadcast credits
- [ ] About page with bio, headshot, contact info, IMDb + LinkedIn links
- [ ] Contact surface (email + phone + socials in footer; About page mirrors it)
- [ ] Responsive grid (2-col mobile / 3-col tablet / 4-col desktop or similar standard breakpoints)
- [ ] Single video data source: `videos.json` checked into the repo, edited via PR
- [ ] Static deploy target (Cloudflare Pages or Vercel) with staging URL during build

### Out of Scope

- CMS integration (Sanity/Airtable) — 56 items is small enough that JSON-in-repo is simpler; revisit if she starts adding videos weekly
- Hover-autoplay previews — bandwidth + accessibility cost, and the user explicitly framed the UX as YouTube-like (click-to-play)
- Real-time video uploading / authoring UI — she edits via PR for v1
- Newsletter capture / mailing list — no demonstrated need
- Analytics — defer to v2 (Plausible if added)
- Contact form — `mailto:` link is sufficient
- i18n — current site is English-only
- Migrating non-video disciplines (UX Design, Publishing, Copywriting from current site) — they predate the video focus and don't fit the grid model

## Context

**Existing site (michellengo.net):**
- WordPress.com, footer reads "Powered by WordPress.com"
- Top nav: Home, Advertising, Film-TV, UX Design, Social & Transmedia, Publishing, About + sub-pages (Broadcast & Digital Producing, Copywriting)
- Self-positioning: "Multi-layered Creative"
- No video filtering, no reel-first hero, no press section, generic mobile theme
- Contact: `mynogo [at] gmail.com`, (917) 566-1976, IMDb + LinkedIn

**Reference design language** (from `_prep/02-references.md`):
- isotopefilms.com — editorial sectioned grid, status tags, light high-contrast palette
- yvonnerusso.com — press as first-class section, footer-mirrored nav
- samhendi.com — full-bleed hero with PLAY REEL CTA, type-tag-on-card, monochromatic palette letting thumbnails carry color

**Video corpus** (from `_prep/03-videos-seed.json`):
- 56 videos, 14 from YouTube playlist `PLhEPAS8...crMhZ`, 43 from Vimeo user `user2149742`, deduped
- 18 are PBS American Portrait (her flagship)
- 12 promos/trailers (HBO, Hulu, PBS, U2 Sphere, Music Box)
- 8 branded content (Amazon, Verizon, USPS, Fannie Mae, Target, Itochu, Porter Novelli & Axe)
- Smaller buckets: Documentary/Short Film, Reel, Personal/Tribute, Educational/Nonprofit
- Each entry has source (vimeo/youtube), id, title, uploader, published date, thumbnail URL, embed URL, proposed category, duration, description

## Constraints

- **Tech stack**: SvelteKit + TypeScript + Tailwind — locked in kickoff. Specific Tailwind/Svelte versions TBD in plan-phase
- **Data**: `videos.json` checked into the repo; build-time data only, no runtime CMS fetch
- **Hosting**: Static-export-friendly (Cloudflare Pages or Vercel); no Node server runtime required
- **Domain**: michellengo.net stays on WordPress.com until cutover; build against staging URL (`michelle-ngo.pages.dev` or equivalent)
- **Compatibility**: Modern browsers only — no IE/legacy support obligations
- **Performance**: Reel-led hero must feel instant; thumbnails should blur-up rather than pop-in

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SvelteKit + TS + Tailwind | Locked in kickoff prompt; aligns with 2026 filmmaker portfolios that need motion + static performance | — Pending |
| `videos.json` in repo as source of truth | 56 items is small; PR-based edits acceptable; eliminates CMS hosting + runtime fetch | — Pending |
| Click-to-filter via routing (not modal) | Deep-linkable, SEO-friendly, matches YouTube-style mental model the user described | — Pending |
| PBS American Portrait gets dedicated page + category tag | 18 of 56 videos and her flagship — warrants both a project landing AND filter inclusion | — Pending |
| Press as first-class section | HBO Max, PBS, Hulu, U2 Sphere, Amazon credits are commercial differentiators for the hiring-producer audience | — Pending |
| Click-only video preview (no hover autoplay) | Bandwidth + accessibility; user framed as "like YouTube" which is click-to-play | — Pending |
| Audience: hiring producers/agencies first | Drives reel-first hierarchy, press emphasis, type-tag-on-card scanability | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-10 after initialization*
