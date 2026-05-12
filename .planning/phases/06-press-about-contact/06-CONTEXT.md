# Phase 6: Press, About & Contact - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the three Phase 3 D-43 placeholder routes (`/about`, `/press`, `/contact`) with real content and ship a site-wide `<Footer />` component carrying the contact channels + the full TopNav mirror. Routes already exist in the layout's link graph (TopNav lists them; placeholders prevent 404s); Phase 6 swaps content, not URLs.

In scope:
- New content at `src/routes/press/+page.svelte` + `+page.ts` (prerendered) — broadcast credits grouped by network, derived from `videos.json`
- New content at `src/routes/about/+page.svelte` (prerendered) — first-person ~80–120 word bio + contact block + IMDb/LinkedIn/Vimeo links
- New content at `src/routes/contact/+page.svelte` (prerendered) — h1 + shared contact block
- New shared component `src/lib/components/ContactBlock.svelte` reused on /about, /contact, and inside the footer
- New shared component `src/lib/components/Footer.svelte` — three-column desktop / single-column mobile, contact + mirrored 8 categories (with Phase 5 D-02 PBS retarget) + secondary nav + copyright strip
- `src/routes/+layout.svelte` wired with `<Footer />` below `{@render children()}` (sibling to `<TopNav />`)
- Press credit helper: `src/routes/press/_pressCredits.ts` (route-local underscore-prefix per Phase 5 D-21 pattern) — derives Array<{ network: string; videos: Video[] }> from `videos.json` filtered + grouped + prestige-ordered
- Planner fetches/proposes first-person ~100-word bio copy at plan time and surfaces in PLAN.md for user approval (Phase 5 D-11 pattern). User supplies real IMDb / LinkedIn / Vimeo URLs at plan time

Out of scope (other phases):
- Perf budget < 2s on 4G + production cutover + removal of `noindex` robots meta — Phase 7
- Contact form / `/contact` form widget — Out of Scope per REQUIREMENTS.md (`mailto:` link sufficient)
- Newsletter capture / analytics — Out of Scope / v2
- Logo wall / network-brand image assets for /press — explicitly rejected (no logo authoring overhead)
- Resume/CV PDF download CTA on /about — explicitly rejected (IMDb is the canonical filmography)
- Headshot image on /about — explicitly rejected for v1 (no asset; site's strength is video work)
- Legacy disciplines (UX Design / Publishing / Copywriting) — Out of Scope per REQUIREMENTS.md
- TopNav changes — `TopNav.svelte` is NOT modified in Phase 6. The Phase 5 D-17 scroll-aware-on-`/`-only contract is preserved. NAV-02 is satisfied by the new Footer carrying the same links, not by extending TopNav.
- Search / filter on the press page — Out of Scope (DISC-01 v2)
- Per-video press blurbs, dates, role labels — rejected; per-credit metadata is title-only (network is the section header)

</domain>

<decisions>
## Implementation Decisions

### Routes & scope
- **D-01:** **`/press` replaces the Phase 3 D-43 placeholder.** Real content in `src/routes/press/+page.svelte` + new `src/routes/press/+page.ts` (load function reads press helper). Prerendered (inherits `+layout.ts` `prerender = true` and `trailingSlash = 'always'`). Build emits `build/press/index.html`.
- **D-02:** **`/about` replaces the Phase 3 D-43 placeholder.** Real content in `src/routes/about/+page.svelte`. No `+page.ts` needed (no load work — bio is inline copy, links are static URLs). Prerendered. Build emits `build/about/index.html`.
- **D-03:** **`/contact` stays as a real page** (does NOT redirect, does NOT drop). Replaces the Phase 3 D-43 placeholder with real h1 + shared `<ContactBlock />`. Prerendered. Build emits `build/contact/index.html`. Phase 3 commitment ("URLs don't change") preserved.
- **D-04:** **Site-wide `<Footer />` lives in `src/routes/+layout.svelte`** as a sibling of `<TopNav />`, rendered BELOW `{@render children()}`. Inherits the route on every prerendered HTML file.
- **D-05:** **`scripts/test-prerender-coverage.mjs` thresholds grow by 3** to keep coverage meaningful: ≥1 each of `build/press/index.html`, `build/about/index.html`, `build/contact/index.html`. Planner updates the script (or generalizes) when wiring tests.
- **D-06:** **TopNav (`TopNav.svelte`) is NOT modified.** No new links, no nav-mirror inside TopNav, no scroll-aware extension. NAV-02 ("footer mirrors top nav") is satisfied by the new Footer carrying the same link set, NOT by adding mirror logic to TopNav. Phase 5 D-17 scroll-aware-on-`/`-only contract preserved.
- **D-07:** **`noindex, nofollow` meta stays on every route through Phase 6** (Phase 1 D-11 contract). Removed in Phase 7 cutover.

### Press page
- **D-08:** **Press data source = derived from `videos.json` at build time.** Filter: `videos.filter(v => v.uploader !== 'Michelle Ngo')` returns 13 videos (Lenny Cooke (Movie), Music Box Films, Cargo Film & Releasing, PBS, HBO, AZPM, GrasshalmClips, Monument Releasing, U2, ABC News, HBO Max, Amazon News, HBODocs). Zero new data authoring. Stays in sync as `videos.json` grows.
- **D-09:** **Helper lives at `src/routes/press/_pressCredits.ts`** (route-local underscore-prefix excludes it from SvelteKit route detection — same pattern as Phase 5 `_pbsCollectionUrl.ts`). Exports `getPressCredits(): Array<{ network: string; videos: Video[] }>`. Pure function over the static `videos` import from `$lib/data`. Network labels use the **uploader string verbatim** — no relabeling/normalization in v1.
- **D-10:** **Section ordering by prestige** — hand-tuned ranking for hiring-producer scan signal. Recommended order: `HBO Max → HBO → PBS → ABC News → U2 → Amazon News → Music Box Films → Monument Releasing → Cargo Film & Releasing → AZPM → HBODocs → GrasshalmClips → Lenny Cooke (Movie)`. Planner surfaces the final ordering as a table in PLAN.md for user review before execution.
- **D-11:** **Every network gets its own section even with a single credit.** No "Other" / "Independent" rollup. Rationale: project's depth-and-breadth framing favors showing everything; 1-credit sections accepted as the cost.
- **D-12:** **Page composition top-to-bottom:**
  1. `<h1>Press</h1>` (no accent color — press is not a category; site default white at Phase 1 splash typography scale per Phase 3 D-19)
  2. For each `{ network, videos }` group: `<section>` containing `<h2>{network}</h2>` + `<ul>` of credit links
  3. No intro copy above the sections (cleanest scan; user picked this explicitly)
  4. No page footer beyond the site-wide `<Footer />`
- **D-13:** **Per-credit row = title only (no network repeated, no date, no role, no blurb).** The section's `<h2>` already names the network; repeating it per row is visual noise. The `<li>` content is:
  ```svelte
  <li>
    <a
      href={`${base}/watch/${video.id}`}
      data-sveltekit-preload-data="hover"
      class="text-white hover:underline underline-offset-2"
    >
      {video.title}
    </a>
  </li>
  ```
  Phase 3 D-08 inline-link style (body color, underline-on-hover); Phase 3 D-14 hover-prefetch. The whole credit is a single click target → `/watch/[id]`.
- **D-14:** **Container width `max-w-3xl px-4 sm:px-6 lg:px-8`** (editorial reading width). NOT `max-w-7xl`. Rationale: list is title-only one-liners — wider container leaves cards-worth of whitespace. Phase 5 D-15's `max-w-7xl` was a visual-cohesion-with-grid decision; /press has no grid. Same decision applies to /about (D-21) and /contact (D-37).
- **D-15:** **Section vertical rhythm: `space-y-12 md:space-y-16` between network groups** to make the section breaks unambiguous. Within each section: `<h2>` at `text-xl md:text-2xl font-bold uppercase tracking-wider` (planner can tune); credit `<ul>` at `space-y-2`.
- **D-16:** **No count per section** ("HBO Max (1)") — count is implied by the visible list. Matches Phase 5 D-16 ("Stories" h2 without count).

### About page
- **D-17:** **Bio voice: FIRST PERSON.** "I'm a filmmaker and producer..." Personal, warmer. **User override of the conventional third-person industry standard** — recorded explicitly here because it diverges from the recommended option. Reflects user preference for a personal landing voice over a press-kit-style credential block.
- **D-18:** **Bio length: punchy ~80–120 words.** One tight paragraph covering filmmaker discipline + key credentials (PBS American Portrait + broadcast credits) + location/focus. Optimized for the 15-second hiring-producer scan. NOT multi-paragraph; NOT a CV.
- **D-19:** **Bio authorship: planner drafts, user approves at plan time** (Phase 5 D-11 pattern). Planner uses public signals (PROJECT.md context, REQUIREMENTS.md, the broadcast credit list derived per D-08) to draft a ~100-word first-person paragraph, surfaces it verbatim in PLAN.md inside an `<approved>...</approved>` element for user sign-off. The approved text is then embedded inline in `src/routes/about/+page.svelte` (no separate strings file — i18n is Out of Scope).
- **D-20:** **No headshot, no Resume/CV download, no legacy-disciplines section.** All three explicitly rejected. /about ships text + links + contact block only. (Headshot revisitable post-launch if Michelle provides one; CV revisitable in Phase 7.)
- **D-21:** **Container `max-w-2xl mx-auto px-4 sm:px-6 lg:px-8` — editorial-narrow.** Single column, centered. Reading-width prose ergonomics (~70 chars per line). Narrower than /press (`max-w-3xl` per D-14) because the bio is one paragraph and the page content density is lighter.
- **D-22:** **Page composition top-to-bottom:**
  1. `<h1>About</h1>` (site default white; Phase 3 D-19 — one h1 per page)
  2. First-person bio paragraph (D-18 — final copy from D-19 plan-time approval), `<p>` with `text-base md:text-lg leading-relaxed text-neutral-200` or planner-tuned
  3. `<ContactBlock />` reused component (D-30 channel order, vertical layout)
- **D-23:** **IMDb / LinkedIn / Vimeo URLs: user supplies at plan time.** Planner surfaces a placeholder table in PLAN.md with three rows (IMDb / LinkedIn / Vimeo) and TBD URL slots; user fills them in before execution. Avoids guessing and shipping broken links. **Vimeo seed value `https://vimeo.com/user2149742`** from PROJECT.md context — planner double-checks against the published handle and flags if the numeric-id form looks like an internal Vimeo id rather than the public profile URL.

### Footer (site-wide)
- **D-24:** **New component `src/lib/components/Footer.svelte`** (Phase 1 D-16 — each phase creates its own folders/components). Imported into `src/routes/+layout.svelte` and rendered below `{@render children()}`.
- **D-25:** **Three-column layout on desktop, stacks on mobile.** Recommended grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12` (mobile single-column → tablet two-column → desktop three-column). Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (matches Phase 3 D-23 site chrome width).
- **D-26:** **Column 1 (left): `<ContactBlock />` — the same shared component used on /about and /contact.** Channel order per D-30. Email, phone, IMDb, LinkedIn, Vimeo each on their own line.
- **D-27:** **Column 2 (center): mirrored 8 categories.** Heading: small uppercase tracked label (e.g., `text-xs uppercase tracking-wider text-neutral-500`, planner tunes). Body: 8 category links in `getCategoriesInDisplayOrder()` order. **PBS link goes to `${base}/pbs-american-portrait/` (inherits Phase 5 D-02 retarget); other 7 go to `${base}/work/${slug}/`** — same href logic as TopNav (Phase 5 D-02 + D-03). No active-state highlighting in the footer (D-31).
- **D-28:** **Column 3 (right): secondary nav + View All Work.** Links: About (`${base}/about/`), Press (`${base}/press/`), Contact (`${base}/contact/`), and "View All Work →" (`${base}/work`). Optional small uppercase tracked header (planner picks "Site", "Navigation", or none).
- **D-29:** **Bottom strip: copyright + "Built with SvelteKit".** Centered single line below the three-column block, separated by a hairline `border-t border-white/10`. Format: `© 2026 Michelle Ngo  ·  Built with SvelteKit`. Typography: `text-xs text-neutral-500 tracking-wider` (planner tunes). Year is hardcoded literal `2026` (no `Date().getFullYear()` JS — site is prerendered; year updates on the next deploy after a calendar rollover).
- **D-30:** **Footer visual treatment:**
  - Top border: hairline `border-t border-white/10` (matches Phase 3 D-09 divider pattern)
  - Background: `bg-neutral-950` (continuous with the body — no distinct band)
  - Padding: `py-12 md:py-16` generous vertical rhythm
  - Internal links: Phase 3 D-08 style (body color, underline-on-hover) + Phase 3 D-14 hover prefetch (`data-sveltekit-preload-data="hover"`)
  - Focus ring: inherits Phase 3 D-07 white-with-offset ring
- **D-31:** **No active-state highlighting on footer links.** Active-state per category is a TopNav-only concern (Phase 3 D-41 + Phase 5 D-03). Footer is a static directory — every link looks the same regardless of current route. Simplifies the component (no `page.url.pathname` matching needed) and matches yvonnerusso's footer-mirror precedent.

### Contact channels (shared across Footer, /about, /contact)
- **D-32:** **`<ContactBlock />` is a single shared component** at `src/lib/components/ContactBlock.svelte`. Reused VERBATIM in three places: Footer column 1, /about page below the bio, /contact page below the h1. No `orientation` prop, no variants — same vertical layout everywhere. Footer's three-column grid just places the block in column 1; on /about and /contact it sits centered in the page container.
- **D-33:** **Email: clean `<a href="mailto:mynogo@gmail.com">mynogo@gmail.com</a>`.** No obfuscation. Industry standard in 2026; spam concern is solved by Gmail server-side filtering. Phase 3 D-08 inline-link style.
- **D-34:** **Phone: clean `<a href="tel:+19175661976">(917) 566-1976</a>` — clickable `tel:` link.** Phone IS public on every page (footer) + /about + /contact. User explicitly confirmed public visibility. Display format: `(917) 566-1976` (parens + dash, matches current site); `tel:` value uses E.164: `+19175661976`.
- **D-35:** **Socials: IMDb / LinkedIn / Vimeo.** All three rendered as inline-link-style `<a target="_blank" rel="noopener">` rows. Display text: `IMDb`, `LinkedIn`, `Vimeo` (just the platform name, NOT the handle — handles can be long and noisy). URLs supplied by user at plan time (D-23).
- **D-36:** **Channel order: Email → Phone → IMDb → LinkedIn → Vimeo.** Stable across all three surfaces (Footer, /about, /contact). Rationale: direct-contact channels first (email is the primary ask channel for hiring producers), professional profiles next (credentialing), platform last.
- **D-37:** **/contact page composition:**
  1. `<h1>Contact</h1>` (site default white; Phase 3 D-19)
  2. `<ContactBlock />` (D-32 — same component as Footer column 1 and /about)
  3. Container: `max-w-2xl mx-auto px-4 sm:px-6 lg:px-8` (editorial-narrow; matches /about per D-21 — both pages are sparse text content)
  4. No intro paragraph above the block (cleanest)
- **D-38:** **Contact info is mirrored across three surfaces and that is intentional** (CONT-01 + CONT-02 + footer requirement). Single shared component (D-32) means there's still one source of truth — to update an email/phone, edit `ContactBlock.svelte`. CONT-02 ("`/about` mirrors the same contact information") is automatically satisfied.

### Claude's Discretion
- **Section heading wording on /press** — recommend a one-line h1 `Press` and no h2 above the network sections (sections speak for themselves via their own `<h2>{network}`). If the planner's eye wants a wrapping h2 (e.g., "Networks"), it's a one-word change.
- **HBO / HBO Max / HBODocs section merging** — recommend keep distinct as uploaders verbatim per D-09 (each is a real distinct credit surface). If user prefers a curated `HBO (incl. HBO Max + HBODocs)` rollup, planner offers it in PLAN.md as an override option.
- **ABC News labeling (represents Hulu via "Lady Bird Diaries")** — recommend label section "ABC News" verbatim from data per D-09. Could be relabeled "Hulu" if user prefers — flag as a checkpoint option in PLAN.md.
- **Section ordering finalization** — recommended order in D-10; planner surfaces as a PLAN.md table for user review before execution. Re-orderable in one minute.
- **Per-credit `<h2>` vs `<h3>` for the network label inside each section** — recommend `<h2>` since /press has one h1 and each network is a top-level section. Per-credit titles inside use `<li><a>...</a></li>` (no heading element — credits are list items, not subsections).
- **Footer column header text** — recommend small uppercase tracked labels ("Contact", "Work", "Site") at `text-xs uppercase tracking-wider text-neutral-500` for column 2 + 3 only; column 1 has the ContactBlock which speaks for itself with email/phone visible. Or omit headers entirely if the columns are visually self-explanatory.
- **Footer column 3 microcopy variants** — "Site" / "Navigation" / "More" / no header. Recommend "Site" as the shortest/clearest.
- **"View All Work →" placement** — could live in footer column 3 (D-28) OR as the last item in column 2's category list. Recommend column 3 (secondary nav role).
- **Bottom-strip alignment** — centered vs left-aligned. Recommend centered for editorial symmetry. Sam-Hendi-ish: left-aligned matches the wordmark/contact column. Either acceptable.
- **Whether the bio `<p>` carries a tighter inner max-width than the page container** on /about — both work; recommend matching the page container (`max-w-2xl`) for visual unity since the container is already prose-narrow.
- **Trailing slash on footer's "View All Work →" link** — `${base}/work` vs `${base}/work/`. The trailingSlash='always' contract emits `/work/index.html`, but SvelteKit normalizes during navigation. Recommend `${base}/work` (no trailing slash) since that's how the existing Phase 4 "View All Work →" link on `/` is wired (Phase 4 D-28).
- **Whether `<ContactBlock />` includes a small "Based in NYC" line** (917 area code implies NYC) — out of scope unless user adds it; recommend NOT including unless user explicitly asks during plan-phase.
- **Whether the footer's mirrored category list re-renders Category names via `categoryAccent()` colors or stays mono** — recommend MONO (no per-category accent in the footer) so the footer reads as quiet directory chrome; the accents earn their distinction by appearing on the active TopNav link + card category tags + page heading on `/work/[category]` (Phase 3 D-26). Adding them in the footer would dilute the accent semantic.
- **Footer column breakpoint** — recommend `sm:grid-cols-2 lg:grid-cols-3` (mobile single → tablet two → desktop three). Planner can drop to `lg:grid-cols-3` only (mobile + tablet both stack) if the two-column intermediate looks awkward.

### Folded Todos
*None — `gsd-tools todo match-phase 6` returned `todo_count: 0`.*

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 6 requirements + success criteria
- `.planning/REQUIREMENTS.md` §Press — PRES-01 (reachable from top nav), PRES-02 (surfaces broadcast credits HBO Max / PBS / Hulu / Amazon / U2 Sphere / Music Box / etc. with network names)
- `.planning/REQUIREMENTS.md` §About — ABT-01 (reachable from top nav), ABT-02 (headshot, bio, IMDb link, LinkedIn link, contact info) — **note: headshot explicitly omitted in v1 per D-20; partial satisfaction of ABT-02 is intentional**
- `.planning/REQUIREMENTS.md` §Contact — CONT-01 (footer surfaces email mailto, phone, IMDb, LinkedIn, Vimeo on every page), CONT-02 (/about mirrors the same contact info)
- `.planning/REQUIREMENTS.md` §Navigation — NAV-02 (footer mirrors top nav: categories + secondary links) — **note: TopNav itself is NOT modified per D-06; the mirror is the new Footer carrying the same link set**
- `.planning/ROADMAP.md` §Phase 6: Press, About & Contact — goal, 5 success criteria, 3 seed plans (06-01 press, 06-02 about, 06-03 footer)

### Project-wide context
- `.planning/PROJECT.md` Key Decisions table — **"Press as first-class section"** (this phase resolves it); audience = hiring producers/agencies (drives prestige-ordered press grouping per D-10 and direct-contact-first channel order per D-36); "Click-only video preview, no hover autoplay" (drives press-credit-links-to-`/watch/[id]` per D-13)
- `.planning/PROJECT.md` Context — **current site contact info** (`mynogo [at] gmail.com`, `(917) 566-1976`, IMDb + LinkedIn) drives the D-33–D-35 channel literals; **Vimeo `user2149742`** in PROJECT.md context drives the D-23 seed Vimeo URL
- `.planning/PROJECT.md` Constraints — modern browsers only, static-export-friendly (drives adapter-static prerender + base-path wrapping on every new internal link)
- `.planning/REQUIREMENTS.md` §Out of Scope — **migrating UX Design / Publishing / Copywriting pages** (drives D-20 omit-legacy-disciplines decision); contact form (drives D-33 clean mailto: + D-37 no-form /contact page); i18n (drives inline copy in .svelte files, no strings file)

### Design language
- `_prep/02-references.md` §yvonnerusso.com — **press-as-first-class-section pattern** + **footer-mirrored nav** + **plain readable footer with phone + email — no contact form friction** + **production company copyright disclosure footer** are the verbatim Phase 6 precedents
- `_prep/02-references.md` §isotopefilms.com — **plain readable footer with phone + email — no contact form friction** reinforced; editorial type rhythm informs the /about prose treatment
- `_prep/02-references.md` §samhendi.com — **resume/CV download CTA in About** considered but explicitly rejected per D-20 (IMDb serves the filmography use case)
- `_prep/01-current-site.md` — verbatim contact strings: `mynogo [at] gmail.com`, `(917) 566-1976`, IMDb + LinkedIn linked (handles not surfaced) — drives D-33–D-35; "About page must keep contact info + IMDb / LinkedIn" requirement preservation
- `_prep/05-decisions-needed.md` — Phase 6 resolves items **8 (press/awards data source — derived from videos.json per D-08)**, **14 (information architecture — /about + /press + /contact all three kept as real pages per D-01–D-03)**, **19 (contact form vs mailto — mailto: clean link per D-33)**

### Source data + helpers
- `src/lib/data/videos.json` — D-08 filter pulls 13 records where `uploader !== 'Michelle Ngo'`; the press helper iterates the existing `videos` array (no schema changes)
- `src/lib/data/index.ts` — `videos` array import; press helper imports verbatim from `$lib/data`
- `src/lib/data/categories.ts` — `getCategoriesInDisplayOrder()` + `categoryToSlug()` used by Footer column 2 mirror (D-27)
- `src/lib/components/TopNav.svelte` — read-only reference for the footer's category-link href logic (D-27 inherits Phase 5 D-02 PBS retarget verbatim — same template literal: `slug === 'pbs-american-portrait' ? `${base}/pbs-american-portrait/` : `${base}/work/${slug}/``)
- `src/lib/components/categoryAccent.ts` — NOT used by Footer (D-31 — footer stays mono, no per-category accents)
- `src/routes/+layout.svelte` — current state has `<svelte:head>` + `<TopNav />` + `{@render children()}`; Phase 6 adds `<Footer />` below children

### Existing placeholder routes (replaced)
- `src/routes/about/+page.svelte` — Phase 3 D-43 placeholder ("Coming soon."); Phase 6 replaces content
- `src/routes/press/+page.svelte` — Phase 3 D-43 placeholder; Phase 6 replaces content
- `src/routes/contact/+page.svelte` — Phase 3 D-43 placeholder; Phase 6 replaces content

### Prior phase context (carry-forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — adapter-static + `prerender = true` (Phase 6 inherits via `src/routes/+layout.ts`); `BASE_PATH` env var (every footer + page internal link uses `$app/paths` `base`); Phase 1 D-11 `noindex, nofollow` robots meta stays through Phase 6 per D-07; pnpm@11.0.9 pinned-exact deps (no new deps expected for Phase 6); `noUncheckedIndexedAccess` (press helper filtering keeps strict types)
- `.planning/phases/02-data-layer/02-CONTEXT.md` — `$lib/data` public surface (`videos` array import); `Video` type's `uploader: string` field — D-08 press filter depends on this being non-empty string (Phase 2 schema enforces); `Video` type has no `featured`-affecting press semantics (press derivation is uploader-based, not featured-based)
- `.planning/phases/03-grid-filter-watch/03-CONTEXT.md` — **D-01..D-09 dark mono chrome carries forward** (footer + all three pages inherit `bg-neutral-950` body + white-on-dark text); **D-08 inline-link style** (body color + 1px underline on hover) used for every press credit row, contact channel link, and footer link; **D-09 hairline `white/10` dividers** used for footer top border per D-30 and any internal section separators; **D-14 hover prefetch** on all internal links; **D-19 heading hierarchy** preserved (one h1 per page, h2 for sections); **D-23 `max-w-7xl px-4 sm:px-6 lg:px-8`** container for the footer chrome per D-25; **D-43 placeholder routes** are the existing files Phase 6 replaces
- `.planning/phases/04-reel-led-home/04-CONTEXT.md` — **D-13 scroll-aware-on-`/`-ONLY contract preserved** per D-06 (Phase 6 does NOT extend it); **D-28 "View All Work →" link pattern** carries forward to the footer's column 3 link
- `.planning/phases/05-pbs-american-portrait/05-CONTEXT.md` — **D-02 PBS TopNav link retarget** (PBS → `/pbs-american-portrait/`) is the contract the Footer's column 2 mirror inherits per D-27; **D-11 verbatim-copy-via-PLAN-checkpoint pattern** is the template for Phase 6 bio authorship per D-19; **D-21 route-local underscore-prefixed helper** (`_pbsCollectionUrl.ts`) is the pattern for the press helper at `src/routes/press/_pressCredits.ts` per D-09

### External references (NOT needed by planner)
- *No external web fetches required for Phase 6.* All press credits live in `videos.json`. Bio copy is authored by planner from existing project signals + user approval (no web research needed beyond what's already in `.planning/`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`videos` array from `$lib/data`** — Phase 6 press helper (D-09) consumes it verbatim. No new exports needed.
- **`getCategoriesInDisplayOrder()` + `categoryToSlug()` from `$lib/data`** — Footer column 2 mirror (D-27) iterates exactly the same surface TopNav does.
- **`base` from `$app/paths`** — every Footer + page internal link wraps through it. Hardcoded paths (`/work/...`, `/about`) will 404 on the GitHub Pages deploy under `/<repo>/`.
- **Phase 3 D-08 inline-link style** — body color + 1px underline-on-hover utility class string used for every press credit, every contact channel link, every footer link. No new style needed.
- **Phase 3 D-09 hairline `border-white/10` dividers** — footer top border + any section separators on /press inherit this.
- **Phase 3 D-14 `data-sveltekit-preload-data="hover"`** — applied to every internal link on /press, /about, /contact, and the Footer.

### Established Patterns
- **Svelte 5 runes** — `<Footer />`, `<ContactBlock />`, and all three new page bodies use `$props()` if they accept data, otherwise just `<script lang="ts">` with imports. `+page.ts` load functions return `{ ... }` consumed by `$props().data` in `+page.svelte`.
- **`adapter-static` + `prerender = true`** — all three Phase 6 routes (/press, /about, /contact) prerender at build time. Build emits `build/press/index.html`, `build/about/index.html`, `build/contact/index.html`. Footer prerenders inline in every page's HTML.
- **`trailingSlash = 'always'`** (Phase 3 inherited from `src/routes/+layout.ts`) — all three routes' canonical URLs include trailing slash. Internal links to /about, /press, /contact should include the trailing slash (`${base}/about/`, etc.).
- **`noUncheckedIndexedAccess`** — press helper's `videos.filter(...)` returns `Video[]`; safe to iterate. Grouping operation produces `Map<string, Video[]>` or equivalent — narrow access pattern (`group.videos[0]` would need a guard, but iteration is fine).
- **Route-local underscore-prefixed helpers** (`_pressCredits.ts`) — excluded from SvelteKit route detection (matches Phase 5 `_pbsCollectionUrl.ts` pattern).
- **Pinned-exact deps + pnpm@11** — no new deps expected for Phase 6 (no icon library, no logo assets, no PDF tooling).
- **Vitest workspace (Phase 3)** — node project (helper tests) + ui project (component + route tests with jsdom). Press helper test goes in node project (pure function over data); Footer.test + ContactBlock.test + three page route tests go in ui project.
- **Phase 5 verbatim-content-via-PLAN-checkpoint pattern** (D-11) — bio authorship per D-19 uses the same `<approved>...</approved>` element in PLAN.md for the user-gated approval step.

### Integration Points
- **`src/routes/press/+page.svelte`** (REPLACES placeholder) — h1 + iteration over press helper's grouped output. Container `max-w-3xl` per D-14.
- **`src/routes/press/+page.ts`** (NEW) — load function calls `getPressCredits()` and returns `{ groups: Array<{ network: string; videos: Video[] }> }`.
- **`src/routes/press/_pressCredits.ts`** (NEW, route-local underscore-prefixed) — `getPressCredits(): Array<{ network: string; videos: Video[] }>`. Filter + group + prestige-order pure function over `videos` from `$lib/data`.
- **`src/routes/press/_pressCredits.test.ts`** (NEW) — unit tests: 13 records returned, all uploaders covered, ordering matches the D-10 prestige list, single-credit networks each get their own group (D-11), no 'Michelle Ngo' uploaders leak through.
- **`src/routes/press/page.test.ts`** (NEW) — route test: renders h1 'Press', renders N sections in prestige order with correct h2 labels, each section contains credit titles linked to `/watch/[id]`, no count appears next to section headers (D-16).
- **`src/routes/about/+page.svelte`** (REPLACES placeholder) — h1 + bio `<p>` (approved copy from D-19) + `<ContactBlock />`. Container `max-w-2xl` per D-21.
- **`src/routes/about/page.test.ts`** (NEW) — route test: renders h1 'About', bio paragraph contains a non-empty first-person string (matches D-17 contract — "I" / "I'm" / "my" detected), `<ContactBlock />` renders with the D-36 channel order.
- **`src/routes/contact/+page.svelte`** (REPLACES placeholder) — h1 + `<ContactBlock />`. Container `max-w-2xl` per D-37.
- **`src/routes/contact/page.test.ts`** (NEW) — route test: renders h1 'Contact', `<ContactBlock />` renders with D-36 channel order. Mirrors /about's ContactBlock assertion.
- **`src/lib/components/Footer.svelte`** (NEW) — three-column desktop grid + bottom strip (D-25–D-30). Imports `ContactBlock` + `getCategoriesInDisplayOrder` + `categoryToSlug` + `base`. ~80–120 LOC.
- **`src/lib/components/Footer.test.ts`** (NEW) — component test: renders three columns at lg breakpoint (jsdom can't measure layout but can assert markup), contact block in column 1, 8 category links in column 2 with PBS pointing to `/pbs-american-portrait/` (D-27 inherits Phase 5 D-02), About/Press/Contact + View All Work in column 3, copyright bottom strip with literal `© 2026 Michelle Ngo` text and "Built with SvelteKit" mention.
- **`src/lib/components/ContactBlock.svelte`** (NEW) — vertical stack of 5 channel rows in D-36 order. ~30–50 LOC.
- **`src/lib/components/ContactBlock.test.ts`** (NEW) — component test: renders 5 channel rows in D-36 order, email has `href="mailto:mynogo@gmail.com"`, phone has `href="tel:+19175661976"` and display text `(917) 566-1976`, IMDb/LinkedIn/Vimeo have `target="_blank"` and `rel="noopener"` and their respective URLs from PLAN.md approval (assertion uses placeholder values during Wave 0; finalized values flip in to GREEN at Wave 2).
- **`src/routes/+layout.svelte`** — adds `<Footer />` import + renders `<Footer />` below `{@render children()}` (D-04). One existing component (`<TopNav />`) + the new `<Footer />` bracket the routed page content.
- **`src/routes/+layout.test.ts`** (NEW or extend if exists) — assertion that `<Footer />` renders in every route's HTML (or at least sample routes: /, /work, /watch/[any-id], /press, /about, /contact, /pbs-american-portrait). Cheapest version: spot-check via prerender coverage that `build/<route>/index.html` contains the footer's distinctive markup (e.g., the copyright string).
- **`scripts/test-prerender-coverage.mjs`** — Phase 5 thresholds (≥1 work + ≥8 work/<slug> + ≥56 watch/<id> + ≥1 pbs-american-portrait) grow by 3 per D-05: ≥1 each of /press, /about, /contact prerendered. Update or generalize.
- **GitHub Pages deploy workflow** (Phase 1) — no CI changes needed; the three new prerendered HTML files drop into `build/` automatically and the workflow already runs `pnpm install && pnpm build`.

</code_context>

<specifics>
## Specific Ideas

- **yvonnerusso.com is the verbatim precedent** for both the press page (first-class section, sections by network, no contact form) and the footer-mirrored nav. Phase 6 implements the spirit: editorial, content-forward, mirror the nav for accessibility.
- **First-person bio (D-17) is a user-override of the conventional third-person industry default.** Recorded explicitly: the user wants `/about` to read as Michelle speaking, not as a press kit. Future phases or content swaps should preserve this voice.
- **The press list IS the credentials.** No logo wall, no badge grid — just the network names as section headers + the credit titles as linked rows. The producer scans HBO Max → HBO → PBS → ABC News (Hulu) → U2 → ... and registers credential breadth instantly.
- **The footer's full nav mirror (D-25–D-28) makes NAV-02 a Footer-only concern, not a TopNav modification.** This preserves the Phase 4 D-13 scroll-aware-on-`/`-only contract perfectly. No risk of accidentally extending transparency-aware behavior to a new surface.
- **`<ContactBlock />` is the linchpin** — single component reused on /about, /contact, and footer column 1. Editing email/phone/socials once propagates everywhere. CONT-02 satisfied by construction; not a constraint we have to remember to honor.
- **Phase 3 D-43 placeholder routes weren't dead weight** — they prevented 404s during Phases 3–5 (TopNav linked to them) AND they ensure Phase 6 work is purely a content swap (zero new TopNav links, zero new layout files, zero new routing decisions). The routes already prerender; Phase 6 just replaces what they prerender.
- **Phone IS public** (D-34) — the user explicitly confirmed visibility. This is the existing michellengo.net pattern preserved. Future privacy-concern reviews should consult this decision; the answer here is "user picked tel:-link from a menu that included omit-phone-entirely and phone-on-/about-only."

</specifics>

<deferred>
## Deferred Ideas

### Considered but rejected for v1
- **Hand-authored press list** — rejected per D-08 (derived from videos.json is faster and stays in sync; future non-video press can be added when it exists)
- **Logo grid / network-brand image wall** — rejected (no logo authoring overhead; brand names as section headers are sufficient credential signal)
- **Chronological press list** — rejected per D-10 (prestige order optimizes hiring-producer scan; chronological lists buries big-network credits mid-list)
- **Alphabetical press list** — rejected (buries HBO Max + HBO + Hulu mid-list; alphabetical is for reference docs, not portfolio scanability)
- **Per-credit role label (Producer / Associate Producer / Director)** — rejected (no role field in `videos.json` schema; adding requires hand-authored mapping; out of scope for v1)
- **Per-credit year/date** — rejected per D-13 (network is the credential, title is the asset; year adds chronological noise the prestige ordering already absorbs)
- **Per-credit blurb / description sentence** — rejected per D-13 (visual heaviness; descriptions are surfaced on /watch/[id] where they belong)
- **Omit single-credit networks ("Other" rollup)** — rejected per D-11 (depth-and-breadth framing favors showing everything; AZPM / Lenny Cooke / Cargo / Monument are real credentials)
- **Third-person bio voice** — rejected per D-17 (user picked first-person)
- **Medium / long bio (200+ words)** — rejected per D-18 (punchy 100-word optimizes the 15-second hiring-producer scan)
- **Headshot on /about** — rejected per D-20 (no asset; site's strength is the video work; revisitable post-launch if Michelle provides a portrait)
- **Resume/CV download CTA** — rejected per D-20 (IMDb is the canonical filmography; PDF adds asset dependency without filling a real gap)
- **Legacy disciplines section (UX Design / Publishing / Copywriting)** — rejected per D-20 + REQUIREMENTS.md Out of Scope (predate the video focus, don't fit the grid model)
- **Two-column /about layout (bio + sidebar)** — rejected per D-21 (single column reads as one tone; sidebar pattern is for ecommerce/CV templates)
- **/contact redirect to /about** — rejected per D-03 (cheaper to keep /contact real than to wire and test a static-export redirect; Phase 3 D-43 commitment preserved)
- **Drop /contact route entirely** — rejected per D-03 (TopNav links to it; surgery to remove the link AND the route is more work than just shipping a real /contact page)
- **Obfuscated email (`mynogo [at] gmail.com`)** — rejected per D-33 (Gmail server-side spam filtering is more effective than HTML obfuscation in 2026; clean mailto: is industry standard)
- **Phone omitted from footer** — rejected per D-34 (user explicitly confirmed public visibility; matches current site)
- **JS-deobfuscated email** — rejected per D-33 (adds JS to every page for spam-scraper avoidance that doesn't actually work)
- **Two-column footer / single editorial-row footer / stacked-sections footer** — rejected per D-25 (three-column desktop balances visual weight; yvonnerusso footer-mirror pattern is the precedent)
- **Mirrored-nav scope: secondary-only / categories-only** — rejected per D-27–D-28 (full mirror satisfies NAV-02 literally; partial mirrors leave the user wondering why)
- **Distinct darker footer band / heavy editorial footer / full-bleed accent footer** — rejected per D-30 (hairline border + neutral bg is quietest, matches Phase 3 D-09 site chrome)
- **Per-category accent colors on footer category links** — rejected per Claude's Discretion guidance (accents would dilute the TopNav active-link semantic)
- **`Date().getFullYear()` JS for copyright year** — rejected per D-29 (site is prerendered; year is a build-time literal that updates on the next deploy)
- **Active-state highlighting on footer links** — rejected per D-31 (footer is a static directory)
- **`<ContactBlock />` orientation prop / horizontal variant** — rejected per D-32 (one vertical layout reused verbatim; three-column footer just places the block in column 1)

### Phase 7 polish work (deferred)
- **Removal of `noindex, nofollow` robots meta** — Phase 7 cutover. Phase 6 keeps it on per D-07.
- **Custom domain + production hosting cutover** — Phase 7.
- **Real headshot if Michelle provides one** — Phase 7 or later (no schema/contract change needed; just a new `src/lib/assets/headshot.{webp,jpg}` + an `<img>` slot on /about; bio prose may want a small rewrite to flow around it).
- **Resume/CV PDF download** — Phase 7 or later if FOUND-03 perf budget has headroom and Michelle provides a PDF.
- **`<picture>` + AVIF / srcset on headshot if added** — Phase 7 perf polish.
- **OG / Twitter card metadata on /about + /press** — Phase 7 polish (currently `noindex` so OG previews aren't being indexed; Phase 7 cutover flips both).
- **Hand-authored non-video press items (Variety / Billboard / interview features)** — defer until such press actually exists; current scope is broadcast-credits-from-videos-only.

### Out of scope (REQUIREMENTS.md locked)
- **CMS for press list** — Out of Scope (small list, derived from videos.json suffices)
- **Newsletter capture** — Out of Scope (no demonstrated need)
- **Analytics** — Out of Scope / v2
- **Contact form** — Out of Scope (mailto: sufficient)
- **i18n / translated bio + press** — Out of Scope (English-only v1)
- **Real-time editing for bio/press** — Out of Scope (Michelle edits via PR for v1)

### Reviewed Todos (not folded)
*None — `gsd-tools todo match-phase 6` returned `todo_count: 0`. No deferred review entries.*

</deferred>

---

*Phase: 06-press-about-contact*
*Context gathered: 2026-05-12*
