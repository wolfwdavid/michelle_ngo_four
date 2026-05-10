# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 01-foundation
**Areas discussed:** Stack versions, Hosting + deploy, Smoke-test route, Repo conventions

---

## Stack versions

### Q1: Svelte / SvelteKit version?

| Option | Description | Selected |
|--------|-------------|----------|
| Svelte 5 + SvelteKit 2 | Current stable. Runes API ($state, $derived) is the new default. Kickoff already pointed at Svelte 5. | ✓ |
| Svelte 4 + SvelteKit 1 | More tutorials/examples online. Older reactivity model (let + stores). | |

**User's choice:** Svelte 5 + SvelteKit 2 (Recommended)
**Notes:** Aligns with kickoff brief and 2026 ecosystem norms.

### Q2: Tailwind version?

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind v4 | CSS-first config (@theme in CSS), faster builds, lockstep with Svelte 5 ecosystem. | ✓ |
| Tailwind v3 | Mature, JS config (tailwind.config.js), more examples + plugins. | |

**User's choice:** Tailwind v4 (Recommended)
**Notes:** Pairs cleanly with Svelte 5 + Vite pipeline.

### Q3: Package manager?

| Option | Description | Selected |
|--------|-------------|----------|
| pnpm | Fast installs, strict dep resolution, smaller node_modules. First-class on Cloudflare Pages. | ✓ |
| npm | Default with `npx sv create`. Slowest but zero setup. | |
| bun | Fastest installs and built-in runner. Adapter compat fine; CI install path needs setup. | |

**User's choice:** pnpm (Recommended)
**Notes:** —

### Q4: Node runtime version target?

| Option | Description | Selected |
|--------|-------------|----------|
| Node 22 LTS | Current LTS through 2027. Default for Cloudflare Pages new builds. | ✓ |
| Node 20 LTS | Older LTS, still supported. | |
| Pin latest minor at build time | Use `.nvmrc` or `engines` to pin whatever's current at scaffold. | |

**User's choice:** Node 22 LTS (Recommended)
**Notes:** —

---

## Hosting + deploy

### Q1: Cloudflare Pages or Vercel for hosting?

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare Pages | Free tier generous, great CDN, native Git integration. Already named in PROJECT.md. | ✓ |
| Vercel | Excellent DX, fastest preview deploys, branded preview URLs. Commercial-use restrictions exist on free tier. | |

**User's choice:** Cloudflare Pages (Recommended)
**Notes:** —

### Q2: Which SvelteKit adapter?

| Option | Description | Selected |
|--------|-------------|----------|
| adapter-static | Pure static export, zero runtime. Fits build-time data model (videos.json baked in). Hostswap easy. | ✓ |
| adapter-cloudflare | Adds Cloudflare-specific edge runtime. Useful only if server endpoints later. Locks to Cloudflare. | |
| adapter-auto | Detects platform at build time. Convenient, less explicit. | |

**User's choice:** adapter-static (Recommended)
**Notes:** Confirms SSG path; no edge functions in v1.

### Q3: Deploy branch + preview strategy?

| Option | Description | Selected |
|--------|-------------|----------|
| main → staging only, no PR previews | Simplest. Every push to main rebuilds staging. PR previews can be enabled later. | ✓ |
| main → staging + PR previews on every branch | Auto-builds preview URLs for every PR. Better collaboration. | |
| main → production, dedicated `staging` branch | Two-branch model. Overkill for solo v1. | |

**User's choice:** main → staging only, no PR previews (Recommended for v1)
**Notes:** —

### Q4: Staging URL plan?

| Option | Description | Selected |
|--------|-------------|----------|
| Default *.pages.dev | Auto-generated `michelle-ngo.pages.dev`. Zero DNS work. | ✓ |
| Custom subdomain on michellengo.net | e.g., `staging.michellengo.net`. Requires DNS work at WordPress.com. | |
| Separate domain for staging | Buy/use a different domain (e.g., michellengo.dev). Extra cost. | |

**User's choice:** Default *.pages.dev (Recommended)
**Notes:** —

---

## Smoke-test route

### Q1: What should `/` render in Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Branded splash placeholder | Centered `Michelle Ngo` wordmark + "coming soon" / construction note. Looks intentional. | ✓ |
| Minimal Hello World | Plain `<h1>Hello SvelteKit + Tailwind</h1>`. Fastest to write, ugly if shared. | |
| Layout shell (header + footer + empty main) | Build the global +layout.svelte skeleton now. Pulls scope from later phases. | |

**User's choice:** Branded splash placeholder (Recommended)
**Notes:** —

### Q2: Should the splash include any real content or just verify the build?

| Option | Description | Selected |
|--------|-------------|----------|
| Wordmark + tagline placeholder | "MICHELLE NGO" + "Filmmaker. Site coming soon." Pre-seeds typography before Phase 4. | ✓ |
| Wordmark + email link | Wordmark + mailto + IMDb/LinkedIn. Useful if staging URL gets shared early. | |
| Wordmark only | Just the name. Cleanest. | |

**User's choice:** Wordmark + tagline placeholder (Recommended)
**Notes:** —

### Q3: Should the staging URL be discoverable / indexed during Phase 1–6?

| Option | Description | Selected |
|--------|-------------|----------|
| Block all indexing on staging | robots.txt disallow + noindex meta. Flip at Phase 7 cutover. | ✓ |
| Allow indexing | Default robots behavior. Risk: Google indexes "coming soon" placeholder. | |

**User's choice:** Block all indexing on staging (Recommended)
**Notes:** —

### Q4: Favicon + basic metadata in Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder favicon + basic <title> only | Default SvelteKit favicon or quick MN letter-mark + `<title>Michelle Ngo</title>`. | ✓ |
| Real favicon + full OG/Twitter meta now | Source proper favicon (light + dark) + write OG image + meta. Pulls Phase 7 work forward. | |
| Skip — deal with all metadata in Phase 7 | Leave SvelteKit defaults entirely. | |

**User's choice:** Placeholder favicon + basic <title> only (Recommended)
**Notes:** —

---

## Repo conventions

### Q1: Linting + formatting setup?

| Option | Description | Selected |
|--------|-------------|----------|
| Prettier + ESLint | Industry-standard combo. ESLint catches Svelte-specific issues via eslint-plugin-svelte. | ✓ |
| Prettier only | Format-only, skip lint. Faster setup. | |
| Biome | Single Rust-based tool. Faster but Svelte support less mature. | |

**User's choice:** Prettier + ESLint (Recommended)
**Notes:** —

### Q2: TypeScript strictness?

| Option | Description | Selected |
|--------|-------------|----------|
| Full strict + extra checks | `strict: true` + `noUncheckedIndexedAccess` + `noImplicitOverride`. Catches real bugs in array indexing. | ✓ |
| Default SvelteKit strict | Just `strict: true`. Solid, less noisy. | |

**User's choice:** Full strict + extra checks (Recommended)
**Notes:** Catches index-into-videos-array bugs in Phase 3.

### Q3: Pre-commit hooks?

| Option | Description | Selected |
|--------|-------------|----------|
| lint-staged + husky on commit | Auto-runs Prettier + ESLint on staged files. Keeps commits clean. | ✓ |
| CI-only checks (no local hooks) | Cloudflare Pages build runs `pnpm run check`. Slower feedback. | |
| Skip both | No enforcement. Quality lives in editor + manual `pnpm check`. | |

**User's choice:** lint-staged + husky on commit (Recommended)
**Notes:** —

### Q4: Initial src/lib structure?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — just `src/lib/` and grow organically | Don't pre-create folders for things that don't exist yet. Each phase creates what it needs. | ✓ |
| Pre-stub the structure | Create `src/lib/{components,data,styles,utils}` with .gitkeep. Predictable but empty folders. | |

**User's choice:** Minimal — just `src/lib/` and grow organically (Recommended)
**Notes:** —

---

## Claude's Discretion

- Exact splash typography and wordmark scale (revised in Phase 4 anyway)
- Splash font choice (neutral default; final type system lands in Phase 4)
- `.prettierrc` specifics (print width, semis, quote style)
- Husky / lint-staged version pinning
- Whether to add `pnpm check` script alongside `pnpm build`
- README.md content (SvelteKit scaffold default is fine for now)

## Deferred Ideas

- PR preview deploys — defer past v1
- Custom staging subdomain on michellengo.net — Phase 7 if at all
- Real favicon set + OG/Twitter cards — Phase 7
- 404 / 50x error pages — Phase 7 (or Phase 3 once layout shell exists)
- Testing setup (Vitest, Playwright) — not a v1 requirement; revisit if needed
- Font self-hosting strategy — defer to Phase 4
- `adapter-cloudflare` migration path — if v2 needs server endpoints
