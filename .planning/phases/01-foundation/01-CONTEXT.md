# Phase 1: Foundation - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the framework and the deploy pipeline. A producer can hit a public staging URL and see a clean SvelteKit + Tailwind build that redeploys on every push to `main`. No videos, no grid, no real home page yet — just a smoke-test route proving the toolchain works end-to-end.

In scope:
- Project scaffold (SvelteKit + TypeScript strict + Tailwind)
- One smoke-test route at `/` (branded splash placeholder)
- Cloudflare Pages deploy from `main` to a `*.pages.dev` URL
- Repo conventions (lint, format, TS config, hooks) that lock the shape of every later file

Out of scope (other phases):
- `videos.json` data layer — Phase 2
- Grid, filter, watch — Phase 3
- Real reel-led home page — Phase 4
- PBS, Press, About, Contact — Phases 5–6
- Perf budget + production cutover + custom domain — Phase 7

</domain>

<decisions>
## Implementation Decisions

### Stack versions
- **D-01:** Svelte 5 + SvelteKit 2. Use the runes API (`$state`, `$derived`, `$effect`) as the default reactivity model — no Svelte 4 stores in v1 component code unless there's a hard reason.
- **D-02:** Tailwind v4 with CSS-first configuration (`@theme` in CSS, no `tailwind.config.js`). Wire it through SvelteKit's Vite pipeline.
- **D-03:** Package manager is **pnpm**. Lockfile is `pnpm-lock.yaml`. CI install path on Cloudflare Pages must use pnpm.
- **D-04:** Node runtime target is **Node 22 LTS**. Pin via `.nvmrc` and `package.json` `engines.node`.

### Hosting + deploy
- **D-05:** Hosting is **Cloudflare Pages**, free tier. No Vercel.
- **D-06:** SvelteKit adapter is **`@sveltejs/adapter-static`** (pure SSG, zero runtime). No edge functions, no `adapter-cloudflare`, no `adapter-auto`.
- **D-07:** Branch strategy: `main` → staging only. No PR previews in v1. Production cutover is deferred to Phase 7.
- **D-08:** Staging URL is the default Cloudflare-assigned `*.pages.dev` (e.g., `michelle-ngo.pages.dev`). No custom subdomain on `michellengo.net` during the build window — that domain stays on WordPress.com until Phase 7.

### Smoke-test route
- **D-09:** `/` renders a **branded splash placeholder**: centered `MICHELLE NGO` wordmark plus a tone-setting tagline placeholder (e.g., "Filmmaker. Site coming soon."). Tailwind classes must be visibly applied — this also satisfies success criterion #2 (Tailwind utility classes render correctly).
- **D-10:** Splash is **wordmark + tagline placeholder only** — no email/IMDb/LinkedIn surfaced yet. Real contact surfaces land in Phase 6.
- **D-11:** Block staging from search-engine indexing: serve a `robots.txt` with `User-agent: * / Disallow: /` AND emit `<meta name="robots" content="noindex, nofollow">` on every route. Flip both at Phase 7 cutover.
- **D-12:** Metadata is minimal in this phase: a placeholder favicon (default SvelteKit favicon or a quick `MN` letter-mark SVG is fine) and a basic `<title>Michelle Ngo</title>`. Real OG/Twitter cards and a proper favicon set are deferred to Phase 7.

### Repo conventions
- **D-13:** **Prettier + ESLint** for formatting and linting. Use the SvelteKit-recommended ESLint config plus `eslint-plugin-svelte`. `.prettierrc` checked in.
- **D-14:** TypeScript is **`strict: true` plus `noUncheckedIndexedAccess` and `noImplicitOverride`**. These extra flags will catch real bugs once the videos array is indexed by id/category in Phase 3.
- **D-15:** **lint-staged + husky** pre-commit hook runs Prettier + ESLint on staged files. Commits with lint or format errors fail locally.
- **D-16:** **Minimal `src/lib/` structure** at scaffold time — do NOT pre-create `components/`, `data/`, `utils/`, `styles/` with `.gitkeep`. Each later phase creates the folders it needs (Phase 2 → `src/lib/data/`, Phase 3 → `src/lib/components/`, etc.).

### Claude's Discretion
- Exact splash typography and wordmark scale (will be revised in Phase 4 anyway).
- Whether the smoke-test splash uses a serif vs. sans-serif font — pick something neutral; final type system lands in Phase 4.
- `.prettierrc` specifics (print width, semis, single vs. double quotes) — pick sensible defaults.
- Husky / lint-staged version pinning.
- Whether to add a `pnpm check` script alongside `pnpm build` — yes, recommended, but not load-bearing.
- README.md content for the repo — fine to leave at the SvelteKit scaffold default for now.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 requirements + success criteria
- `.planning/REQUIREMENTS.md` §Foundation — FOUND-01 (clean build, TS strict, no runtime errors), FOUND-02 (Cloudflare Pages deploy from main with public staging URL)
- `.planning/ROADMAP.md` §Phase 1: Foundation — goal, depends-on, four success criteria, two seed plans (01-01 scaffold, 01-02 Cloudflare config)

### Project-wide context
- `.planning/PROJECT.md` — locked tech stack (SvelteKit + TS + Tailwind), constraints (static-export-friendly, modern browsers only, perf budget), Key Decisions table
- `.planning/REQUIREMENTS.md` §Out of Scope — explicit non-goals so Phase 1 doesn't accidentally pull in CMS, analytics, contact form, etc.

### Original brief + decision inventory
- `_prep/00-KICKOFF.md` — original kickoff prompt, behavior the user wants, design language references
- `_prep/05-decisions-needed.md` — full inventory of gray areas; Phase 1 resolves items 1, 2, 3, 4 (stack + hosting + domain) and intentionally defers others to later phases
- `_prep/02-references.md` — design language references (isotopefilms, yvonnerusso, samhendi); informs the splash placeholder feel only loosely in this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None** — repo is empty (just `.git`, `.planning/`, `_prep/`, `CLAUDE.md`). This phase creates the first source files. Every later phase reuses what Phase 1 establishes.

### Established Patterns
- **GSD workflow** — repo uses the `/gsd:*` family of commands; CLAUDE.md enforces routing all edits through GSD. Phase 1 must respect this when introducing tooling (e.g., husky hooks must not conflict with GSD's commit flow).
- **Planning docs structure** — `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, plus per-phase directories at `.planning/phases/XX-name/`. Don't move or rename these.

### Integration Points
- **Cloudflare Pages Git integration** — connects to the GitHub remote, watches `main`, runs `pnpm install && pnpm build`, serves `build/` output. The build command and output directory are the integration contract.
- **`pnpm-lock.yaml`** — Cloudflare Pages auto-detects pnpm when this file is present at the repo root.
- **`svelte.config.js`** — adapter-static is wired here; downstream phases (especially Phase 3 routing and Phase 5 PBS landing) depend on the prerender / fallback config chosen here.
- **Root layout (`src/routes/+layout.svelte`)** — the `<meta name="robots" content="noindex">` lives here so every route inherits it; Phase 7 flips it.

</code_context>

<specifics>
## Specific Ideas

- "Reads as intentional, pre-seeds typography/colors before Phase 4" — splash should feel deliberate, not like a default Vite landing page, even though it gets replaced.
- Default `*.pages.dev` is fine for staging — no DNS overhead during the build window.
- pnpm + Cloudflare Pages is a known-good combo; CI install path should be straightforward.

</specifics>

<deferred>
## Deferred Ideas

- **PR preview deploys** — useful but skipped for solo v1; revisit when collaborators or external review enter the picture.
- **Custom staging subdomain on michellengo.net** (e.g., `staging.michellengo.net`) — requires DNS work at WordPress.com; do at Phase 7 cutover if at all.
- **Real favicon set + OG/Twitter card metadata** — Phase 7 polish.
- **404 / 50x error pages** — Phase 7 polish (or Phase 3 once the layout shell exists).
- **Testing setup (Vitest, Playwright)** — not surfaced as a v1 requirement; revisit if a phase actually needs it.
- **Font self-hosting strategy** — defer to Phase 4 when the real type system lands.
- **`adapter-cloudflare` migration path** — if v2 ever needs server endpoints (contact form, analytics proxy), swap adapters then.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-05-10*
