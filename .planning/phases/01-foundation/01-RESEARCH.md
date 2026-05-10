# Phase 1: Foundation - Research

**Researched:** 2026-05-10
**Domain:** SvelteKit 2 + Svelte 5 + Tailwind v4 + adapter-static + Cloudflare Pages + pnpm + husky/lint-staged + ESLint flat config
**Confidence:** HIGH (all critical stack pieces verified against npm registry and official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Svelte 5 + SvelteKit 2. Use the runes API (`$state`, `$derived`, `$effect`) as the default reactivity model — no Svelte 4 stores in v1 component code unless there's a hard reason.
- **D-02:** Tailwind v4 with CSS-first configuration (`@theme` in CSS, no `tailwind.config.js`). Wire it through SvelteKit's Vite pipeline.
- **D-03:** Package manager is **pnpm**. Lockfile is `pnpm-lock.yaml`. CI install path on Cloudflare Pages must use pnpm.
- **D-04:** Node runtime target is **Node 22 LTS**. Pin via `.nvmrc` and `package.json` `engines.node`.
- **D-05:** Hosting is **Cloudflare Pages**, free tier. No Vercel.
- **D-06:** SvelteKit adapter is **`@sveltejs/adapter-static`** (pure SSG, zero runtime). No edge functions, no `adapter-cloudflare`, no `adapter-auto`.
- **D-07:** Branch strategy: `main` → staging only. No PR previews in v1. Production cutover is deferred to Phase 7.
- **D-08:** Staging URL is the default Cloudflare-assigned `*.pages.dev`. No custom subdomain during build window.
- **D-09:** `/` renders a **branded splash placeholder**: centered `MICHELLE NGO` wordmark plus tagline placeholder. Tailwind classes must be visibly applied.
- **D-10:** Splash is **wordmark + tagline placeholder only** — no email/IMDb/LinkedIn yet.
- **D-11:** Block staging from indexing: `robots.txt` with `Disallow: /` AND `<meta name="robots" content="noindex, nofollow">` on every route.
- **D-12:** Minimal metadata: placeholder favicon + `<title>Michelle Ngo</title>`. Real OG/Twitter cards deferred to Phase 7.
- **D-13:** **Prettier + ESLint** with eslint-plugin-svelte. `.prettierrc` checked in.
- **D-14:** TypeScript **`strict: true` + `noUncheckedIndexedAccess` + `noImplicitOverride`**.
- **D-15:** **lint-staged + husky** pre-commit hook runs Prettier + ESLint on staged files.
- **D-16:** **Minimal `src/lib/`** at scaffold time — do NOT pre-create subdirectories with `.gitkeep`.

### Claude's Discretion
- Exact splash typography and wordmark scale (revised in Phase 4 anyway).
- Serif vs. sans-serif font for smoke-test splash — pick neutral; final type system lands in Phase 4.
- `.prettierrc` specifics (print width, semis, single vs. double quotes) — pick sensible defaults.
- Husky / lint-staged version pinning.
- Whether to add a `pnpm check` script alongside `pnpm build` — yes, recommended, not load-bearing.
- README.md content — fine to leave at SvelteKit scaffold default.

### Deferred Ideas (OUT OF SCOPE)
- PR preview deploys
- Custom staging subdomain on michellengo.net
- Real favicon set + OG/Twitter card metadata
- 404 / 50x error pages
- Testing setup (Vitest, Playwright)
- Font self-hosting strategy
- `adapter-cloudflare` migration path
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Project builds with SvelteKit 2 + TypeScript (strict) + Tailwind, no runtime errors | Tailwind v4 Vite plugin integration verified; TS strict + extra flags documented; SvelteKit 2 scaffold via `sv create` confirmed |
| FOUND-02 | Project deploys to Cloudflare Pages from main branch on push, with a public staging URL | Cloudflare Pages git-integrated deploy confirmed; pnpm detection + v3 build image requirements documented; adapter-static output dir = `build` |
</phase_requirements>

---

## Summary

Phase 1 is a greenfield scaffold with a fully verified, modern stack. All tooling choices have stable, current versions available as of May 2026. The three highest-risk items requiring exact execution are: (1) the Tailwind v4 + Vite plugin wiring (canonical, but differs from all v3 guides — PostCSS must NOT be involved), (2) the Cloudflare Pages pnpm setup in v3 build image (pnpm-lock.yaml version auto-detection is broken; `PNPM_VERSION` env var must be set explicitly), and (3) the Svelte 5 runes compiler flag strategy (runes are opt-in per-file by default in Svelte 5; enforcing them globally via `compilerOptions.runes` can break third-party Svelte 4 libraries).

The adapter-static configuration also has a forward-compatibility implication: Phase 3 adds dynamic routes (`/watch/[id]`, `/work/[category]`) that SvelteKit will auto-crawl from links, but `strict: true` will fail the build if any route is not statically reachable. The Phase 1 scaffold should use `strict: true` now (no dynamic routes yet) and Phase 3 will wire `entries` exports to pre-render all video pages.

**Primary recommendation:** Scaffold via `pnpm dlx sv create` with SvelteKit + TypeScript + ESLint + Prettier options selected; then manually add `sv add tailwindcss`; then configure husky/lint-staged, adapter-static, and Cloudflare Pages per the patterns below. Do NOT use `npm create svelte@latest` — it's the legacy path.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| svelte | 5.55.5 | Component framework + runes reactivity | Svelte 5 is the current stable release; runes are the default API |
| @sveltejs/kit | 2.59.1 | Full-stack SvelteKit meta-framework | Current stable; SSG mode via adapter-static is first-class |
| @sveltejs/adapter-static | 3.0.10 | Pure SSG output, zero runtime | Locked per D-06; produces `build/` directory for Cloudflare Pages |
| tailwindcss | 4.3.0 | Utility-first CSS | Locked per D-02; v4 is now stable release |
| @tailwindcss/vite | 4.3.0 | Vite plugin for Tailwind v4 | The ONLY supported integration path for Tailwind v4 with Vite; replaces PostCSS |
| typescript | 5.x (managed by SvelteKit) | Type safety | Locked per D-14 |
| vite | (managed by SvelteKit) | Build tool | SvelteKit's underlying bundler |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| husky | 9.1.7 | Git hooks management | Pre-commit lint enforcement per D-15 |
| lint-staged | 17.0.4 | Run linters only on staged files | Paired with husky; keeps pre-commit fast |
| eslint | 9.x (managed by sv scaffold) | Code linting | Required by D-13 |
| eslint-plugin-svelte | 3.17.1 | Svelte-aware ESLint rules | Provides flat config preset + Svelte 5 support |
| typescript-eslint | 8.59.2 | TypeScript rules for ESLint | Required for TS-aware linting in flat config |
| prettier | 3.8.3 | Code formatting | Required by D-13 |
| prettier-plugin-svelte | 3.5.1 | Svelte file formatting for Prettier | Required; without it Prettier mangles `.svelte` files |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tailwindcss/vite | postcss + tailwindcss (v3 approach) | PostCSS approach is v3-only; v4 requires the Vite plugin |
| @sveltejs/adapter-static | @sveltejs/adapter-cloudflare | adapter-cloudflare adds edge runtime; D-06 locks static-only |
| husky + lint-staged | lefthook | lefthook is faster/zero-deps, but husky is the ecosystem default and `sv` integrates with it |
| eslint flat config | legacy .eslintrc | eslint-plugin-svelte v3 requires flat config only |

**Installation (after `sv create` scaffold):**
```bash
# Tailwind v4 (if not added during sv create)
pnpm add -D tailwindcss @tailwindcss/vite

# Git hooks
pnpm add -D husky lint-staged
pnpm exec husky init

# Prettier Svelte plugin (if not included by sv create)
pnpm add -D prettier-plugin-svelte
```

**Version verification:** Versions above verified via `npm view <package> version` on 2026-05-10.

---

## Architecture Patterns

### Recommended Project Structure
```
michelle_ngo_four/
├── src/
│   ├── app.css              # @import "tailwindcss"; + @theme block
│   ├── app.html             # SvelteKit HTML template
│   ├── app.d.ts             # Global ambient types
│   └── routes/
│       ├── +layout.svelte   # Root layout: svelte:head noindex, app.css import, {children}
│       ├── +layout.ts       # export const prerender = true (root-level)
│       └── +page.svelte     # Splash route: MICHELLE NGO wordmark + tagline
├── static/
│   ├── robots.txt           # User-agent: * / Disallow: /
│   └── favicon.png          # Placeholder (default SvelteKit or MN lettermark SVG)
├── .husky/
│   └── pre-commit           # pnpm lint-staged
├── .nvmrc                   # 22
├── eslint.config.js         # Flat config: js + ts + svelte presets
├── svelte.config.js         # adapter-static + runes compilerOptions
├── tsconfig.json            # strict + noUncheckedIndexedAccess + noImplicitOverride
├── vite.config.ts           # tailwindcss() + sveltekit() plugins
├── .prettierrc              # Sensible defaults + prettier-plugin-svelte
├── package.json             # engines.node: ">=22", pnpm scripts
└── pnpm-lock.yaml           # Committed
```

### Pattern 1: Tailwind v4 Vite Plugin Integration
**What:** Import Tailwind as a Vite plugin, not via PostCSS. All theme customization goes in `app.css` via `@theme`.
**When to use:** Always — this is the ONLY supported path for Tailwind v4.
**Example:**
```typescript
// vite.config.ts — Source: https://tailwindcss.com/docs/guides/sveltekit
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),  // Must come BEFORE sveltekit()
    sveltekit(),
  ],
});
```

```css
/* src/app.css — Source: https://tailwindcss.com/docs/guides/sveltekit */
@import "tailwindcss";

/* Phase 1: minimal theme seeds — full type system lands in Phase 4 */
@theme {
  /* placeholder: --color-brand: #000; */
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{@render children()}
```

### Pattern 2: adapter-static with Root Prerender
**What:** Set `prerender = true` in root `+layout.ts` so every route is statically generated. `strict: true` on the adapter (default) catches un-prerendered routes.
**When to use:** Phase 1 splash + all phases through Phase 6. Phase 3 will add `entries` exports on dynamic routes.

```typescript
// src/routes/+layout.ts
export const prerender = true;
```

```javascript
// svelte.config.js — Source: https://svelte.dev/docs/kit/adapter-static
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Enforce runes mode for project source files only (not node_modules)
    runes: true,
  },
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,   // Phase 1: no SPA fallback; strict SSG
      precompress: false,
      strict: true,
    }),
  },
};

export default config;
```

**Note on `fallback`:** Keep `undefined` in Phase 1. Phase 3 will evaluate whether auto-crawling of video links is sufficient to prerender all `/watch/[id]` routes without a fallback. If not, set `fallback: '404.html'` then (not SPA `index.html` — that conflicts with the homepage).

### Pattern 3: Svelte 5 Runes — compilerOptions.runes caveat
**What:** Setting `compilerOptions: { runes: true }` in `svelte.config.js` enforces runes mode globally.
**Caveat:** This can break third-party Svelte 4 libraries by forcing them into runes mode. The safe approach is a function-based opt-out for node_modules.

```javascript
// svelte.config.js — safer runes enforcement
compilerOptions: {
  runes: ({ filename }) => {
    // Only enforce runes in project source files, not node_modules
    return !filename?.includes('node_modules');
  },
},
```

**Alternative:** Omit `compilerOptions.runes` entirely. In Svelte 5, runes are available in any file by default — you don't need `$state()` etc. to be enabled globally. They're always available. The `runes: true` flag only blocks accidental use of legacy reactive syntax (`$:`, `let` reactivity). For a greenfield project with no Svelte 4 libraries, either approach works; the function variant is safer.

### Pattern 4: ESLint Flat Config with eslint-plugin-svelte
**What:** ESLint v9 flat config using `eslint.config.js` — this is what `sv add eslint` generates and what eslint-plugin-svelte v3 requires.

```javascript
// eslint.config.js — Source: https://sveltejs.github.io/eslint-plugin-svelte/user-guide/
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
      },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/'],
  },
);
```

### Pattern 5: Husky v9 + lint-staged with pnpm
**What:** `pnpm exec husky init` creates `.husky/pre-commit` and adds `prepare` script to `package.json`.

```bash
# Setup (run once during scaffold)
pnpm add -D husky lint-staged
pnpm exec husky init
```

```sh
# .husky/pre-commit
pnpm lint-staged
```

```json
// package.json — lint-staged config
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,svelte}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

### Pattern 6: TypeScript tsconfig with extra strict flags
**What:** Add `noUncheckedIndexedAccess` and `noImplicitOverride` to the tsconfig extending SvelteKit's generated config.

```json
// tsconfig.json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**CRITICAL:** Do NOT add an `include` field to this tsconfig. SvelteKit's generated `.svelte-kit/tsconfig.json` already includes all the right source paths and generated type directories. Adding `include` here overwrites those paths and breaks `./$types` resolution.

### Pattern 7: robots.txt + noindex
**What:** Two-layer search engine block for staging.
- `static/robots.txt` — disallows all crawlers
- `<meta name="robots" content="noindex, nofollow">` in root layout's `<svelte:head>` — belt-and-suspenders

```
# static/robots.txt
User-agent: *
Disallow: /
```

```svelte
<!-- In src/routes/+layout.svelte <svelte:head> block -->
<meta name="robots" content="noindex, nofollow" />
<title>Michelle Ngo</title>
```

Phase 7 flip: replace both with `Allow: /` in robots.txt and remove/replace the meta tag.

### Anti-Patterns to Avoid
- **Using PostCSS for Tailwind v4:** PostCSS integration is the v3 approach. Tailwind v4 uses the Vite plugin exclusively. Mixing them causes silent failures or duplicate processing.
- **Adding `tailwind.config.js`:** Tailwind v4 is CSS-first. All theme customization lives in `@theme {}` blocks in `app.css`. No JavaScript config file.
- **Using `adapter-cloudflare` or `adapter-auto`:** Locked to `adapter-static` per D-06. `adapter-auto` will select `adapter-cloudflare` in CI and add unwanted edge runtime overhead.
- **Adding `include` to tsconfig.json:** This overwrites SvelteKit's generated includes. Only use `compilerOptions` in the root tsconfig; let the extended `.svelte-kit/tsconfig.json` handle includes.
- **Setting `fallback: 'index.html'`:** This creates SPA mode and can interfere with the homepage. If a fallback is needed in Phase 3+, use `fallback: '404.html'`.
- **Using `npm create svelte@latest`:** This is the legacy path. Use `pnpm dlx sv create` with the current Svelte CLI.
- **Setting `compilerOptions.runes: true` globally without function guard:** Can break Svelte 4 third-party libraries if/when they're added. Use the function form or omit entirely.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS-first theme tokens | Custom CSS variable system | Tailwind v4 `@theme` in app.css | `@theme` generates utility classes AND CSS variables automatically |
| Staged-file linting | Shell scripts checking git diff | lint-staged | Handles file detection, parallel execution, git state correctly |
| Git hook installation | Manual `.git/hooks/` files | husky v9 | Handles hook permissions, cross-platform, `prepare` lifecycle |
| Static file serving config | Cloudflare `_routes.json` or `_headers` | adapter-static output + Cloudflare auto-detection | adapter-static outputs a standard static directory that Cloudflare recognizes |
| TypeScript path aliases | Custom webpack/vite aliases | SvelteKit's `$lib` alias (auto-configured) | SvelteKit generates `.svelte-kit/tsconfig.json` with `$lib` alias; available immediately |

**Key insight:** The SvelteKit + Tailwind v4 + Cloudflare Pages stack is extremely convention-driven. Every "custom" problem in this list has a first-class solution in the toolchain — fighting it costs more than adopting the convention.

---

## Common Pitfalls

### Pitfall 1: Cloudflare Pages pnpm version not auto-detected (v3 build image)
**What goes wrong:** Build fails with lockfile version mismatch or uses wrong pnpm version.
**Why it happens:** Cloudflare Pages v3 build image (default for new projects as of May 2025) does NOT auto-detect pnpm version from `pnpm-lock.yaml`. This is a documented unsupported feature in v3.
**How to avoid:** Set `PNPM_VERSION` environment variable in Cloudflare Pages dashboard → Settings → Environment variables. Set to the pnpm version used locally (e.g., `10.x`). Also set `NODE_VERSION=22` explicitly even though v3 defaults to Node 22 — makes it explicit and forward-safe.
**Warning signs:** Build log shows `ERR_PNPM_LOCKFILE_VERSION_MISMATCH` or pnpm install errors.

### Pitfall 2: Tailwind v4 + PostCSS conflict
**What goes wrong:** Tailwind styles do not apply, or apply partially, with cryptic CSS errors.
**Why it happens:** Developer has a `postcss.config.js` from a previous setup, or adds `tailwindcss` and `autoprefixer` to PostCSS thinking that's how v4 works (it was how v3 worked).
**How to avoid:** Ensure there is NO `postcss.config.js` referencing Tailwind. The only Tailwind wiring is the `tailwindcss()` Vite plugin in `vite.config.ts` and `@import "tailwindcss"` in `app.css`. No `postcss` key in `vite.config.ts`.
**Warning signs:** `tailwind.config.js` present in repo, `autoprefixer` in devDependencies, `postcss.config.js` exists.

### Pitfall 3: `include` in tsconfig.json breaks SvelteKit generated types
**What goes wrong:** TypeScript errors on SvelteKit-generated `$types` imports; IDE loses auto-complete for `PageData`, `LayoutData`, etc.
**Why it happens:** SvelteKit auto-generates `.svelte-kit/tsconfig.json` with `include` paths pointing at generated type directories. If `tsconfig.json` defines its own `include`, it completely overrides the extended value.
**How to avoid:** Never add `include` to the root `tsconfig.json`. Only add `compilerOptions` overrides.
**Warning signs:** `Cannot find module './$types'` TypeScript errors after adding tsconfig fields.

### Pitfall 4: adapter-static `strict: true` fails on dynamic routes in Phase 3
**What goes wrong:** `pnpm build` fails with "The following routes were not prerendered" once `/watch/[id]` routes are added in Phase 3.
**Why it happens:** `strict: true` (the default) validates that all routes are reachable. Dynamic routes need either an `entries` export to enumerate all parameter combinations, or link crawling from a linked page.
**How to avoid:** In Phase 1, `strict: true` is fine (no dynamic routes). When Phase 3 adds `/watch/[id]`, add an `entries` export to that page that enumerates all video IDs from `videos.json`. OR: confirm SvelteKit's auto-crawl picks up all IDs via links from the grid.
**Warning signs:** Phase 3 build fails with prerender errors about dynamic routes.

### Pitfall 5: Svelte 5 `runes: true` breaks a third-party Svelte 4 component
**What goes wrong:** A Svelte 4 component from npm fails to compile with "Cannot use legacy reactive declarations" or similar.
**Why it happens:** `runes: true` globally enforces runes mode on all files including `node_modules`.
**How to avoid:** Use the function variant of `compilerOptions.runes` that returns `undefined` for `node_modules`, or omit `runes: true` entirely (runes are available by default in Svelte 5 anyway).
**Warning signs:** Compile errors on `.svelte` files inside `node_modules`.

### Pitfall 6: `prettier-plugin-svelte` missing from `.prettierrc`
**What goes wrong:** Prettier runs but ignores `.svelte` file structure, mangling template syntax.
**Why it happens:** Prettier doesn't automatically detect the Svelte plugin; it must be declared in `.prettierrc`.
**How to avoid:** Include `"plugins": ["prettier-plugin-svelte"]` and `"overrides": [{"files": "*.svelte", "options": {"parser": "svelte"}}]` in `.prettierrc`.
**Warning signs:** Prettier re-formats `.svelte` files but template HTML is scrambled.

---

## Code Examples

### Splash Route (Phase 1 `/`)
```svelte
<!-- src/routes/+page.svelte — Source: project design intent -->
<script lang="ts">
  // No state needed for Phase 1 splash
</script>

<svelte:head>
  <title>Michelle Ngo</title>
</svelte:head>

<main class="min-h-screen flex flex-col items-center justify-center bg-black text-white">
  <h1 class="text-5xl font-bold tracking-widest uppercase">Michelle Ngo</h1>
  <p class="mt-4 text-lg text-gray-400 tracking-wide">Filmmaker. Site coming soon.</p>
</main>
```

### `.prettierrc` (sensible defaults + Svelte plugin)
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

### `package.json` scripts + engines
```json
{
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,svelte}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md,yaml,yml}": ["prettier --write"]
  }
}
```

### `.nvmrc`
```
22
```

### Cloudflare Pages build settings (dashboard configuration)
```
Build command:        pnpm build
Build output dir:     build
Root directory:       (leave empty — repo root)

Environment variables (Settings → Environment variables):
  NODE_VERSION=22
  PNPM_VERSION=10.11.1   (or whatever local version is used)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwindcss` + PostCSS in vite.config | `@tailwindcss/vite` Vite plugin | Tailwind v4.0 (Jan 2025) | No postcss.config.js needed; `tailwind.config.js` replaced by `@theme` in CSS |
| `npm create svelte@latest` | `pnpm dlx sv create` (Svelte CLI) | SvelteKit ecosystem shift ~2024 | `sv create` replaces the old create-svelte package; supports `sv add` for addons |
| ESLint `.eslintrc.js` / legacy config | ESLint `eslint.config.js` flat config | ESLint 9 (2024); required by eslint-plugin-svelte v3 | All SvelteKit + Svelte tooling now uses flat config |
| Svelte 4 reactive stores (`$store`, writable()) | Svelte 5 runes (`$state`, `$derived`, `$effect`) | Svelte 5.0 stable (Oct 2024) | No import needed; runes are language-level; no store subscriptions |
| `husky` v4 `.huskyrc` | `husky` v9 `pnpm exec husky init` + `.husky/pre-commit` | Husky v5+ | Direct shell scripts in `.husky/`; no JSON config |
| `adapter-auto` for Cloudflare | `adapter-static` explicit | Best practice for pure SSG | `adapter-auto` adds unnecessary edge runtime detection in CI |

**Deprecated/outdated:**
- `tailwind.config.js`: Replaced by `@theme {}` in CSS for v4. Do not create.
- `postcss.config.js` with Tailwind entries: v3 approach. Do not create for Tailwind v4.
- `eslint-plugin-svelte3`: The old plugin. Current plugin is `eslint-plugin-svelte` (no "3" in name).
- `@sveltejs/eslint-config`: A separate package; `sv add eslint` now generates flat config directly.
- `npm create svelte@latest`: Legacy entry point. Use `pnpm dlx sv create`.

---

## Open Questions

1. **Cloudflare Pages project name / *.pages.dev URL**
   - What we know: Cloudflare assigns `<project-name>.pages.dev`; project is created in the CF dashboard.
   - What's unclear: The exact project name to use (affects the staging URL). User mentioned `michelle-ngo.pages.dev` as a candidate.
   - Recommendation: During Plan 01-02 (Cloudflare setup), create the CF Pages project with name `michelle-ngo`. If taken, use `michelle-ngo-portfolio`. Document the resulting URL in STATE.md.

2. **pnpm version to pin in PNPM_VERSION env var**
   - What we know: Current pnpm latest is 10.11.1 (verified via Cloudflare's v3 default); `pnpm-lock.yaml` format version must match.
   - What's unclear: The exact pnpm version in the developer's local environment.
   - Recommendation: During Plan 01-01 scaffold, record the local pnpm version (`pnpm --version`) and pin that exact version in both `packageManager` field in `package.json` and `PNPM_VERSION` env var on Cloudflare.

3. **`sv create` vs manual scaffold**
   - What we know: `sv create` supports TypeScript + ESLint + Prettier as optional addons; `sv add tailwindcss` adds the Vite plugin.
   - What's unclear: Whether the `sv create` flow produces the exact tsconfig shape we need (strict + extra flags) or requires post-scaffold editing.
   - Recommendation: Use `sv create` for the base scaffold (saves wiring), then edit `tsconfig.json` to add `noUncheckedIndexedAccess` and `noImplicitOverride`. These flags are not in the default scaffold output.

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in config.json). Phase 1 is a scaffold/toolchain phase — there are no business-logic units requiring unit tests. Validation is entirely command-checkable.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (Phase 1 defers Vitest/Playwright to a later phase per CONTEXT.md deferred items) |
| Config file | n/a — Wave 0 gap |
| Quick run command | `pnpm check` (svelte-check type checking) |
| Full suite command | `pnpm build && pnpm check && pnpm lint` |

### Phase Requirements → Validation Map
| Req ID | Behavior | Validation Type | Automated Command | Notes |
|--------|----------|-----------------|-------------------|-------|
| FOUND-01 | TypeScript strict compiles with no errors | type-check | `pnpm check` | Exits non-zero on any TS error |
| FOUND-01 | Build produces static output with no runtime errors | build | `pnpm build` | Exits non-zero on build failure |
| FOUND-01 | Tailwind utility classes render in smoke route | build artifact grep | `grep -r "text-5xl\|text-white\|bg-black" build/index.html` | Confirms Tailwind isn't stripped |
| FOUND-01 | Lint passes | lint | `pnpm lint` | Exits non-zero on lint errors |
| FOUND-01 | Format is valid | format check | `pnpm format --check` | Exits non-zero if files need formatting |
| FOUND-01 | robots noindex present in built HTML | build artifact grep | `grep -i "noindex" build/index.html` | Confirms meta tag survived prerender |
| FOUND-02 | Cloudflare Pages deploy succeeds | manual + visual | Visit `*.pages.dev` URL after push to `main` | Automated portion: `pnpm build` exit code; visual: confirm URL is live over HTTPS |
| FOUND-02 | Site reachable at public URL over HTTPS | manual | Open browser to `https://<name>.pages.dev` | No CLI equivalent without an authenticated CF API call |

### Sampling Rate
- **Per task commit:** `pnpm check` (fast, type-safety only — ~5s)
- **Per wave merge:** `pnpm build && pnpm check && pnpm lint` (full local validation — ~30s)
- **Phase gate:** Full local suite green + Cloudflare Pages deploy live and reachable before marking Phase 1 complete

### Wave 0 Gaps
- No test framework installed — per CONTEXT.md deferred items, Vitest/Playwright are explicitly out of scope for Phase 1.
- The validation surface for this phase is entirely build/lint/type-check commands, not test files.
- `grep` commands above run against `build/` output directory — this directory does not exist until after `pnpm build` succeeds.

*(No Wave 0 test file creation needed — Phase 1 has no test-file requirements)*

---

## Sources

### Primary (HIGH confidence)
- `https://tailwindcss.com/docs/guides/sveltekit` — Canonical Tailwind v4 + SvelteKit integration; Vite plugin setup; CSS import syntax
- `https://svelte.dev/docs/kit/adapter-static` — adapter-static options; prerender configuration; fallback values
- `https://sveltejs.github.io/eslint-plugin-svelte/user-guide/` — eslint-plugin-svelte v3 flat config setup; preset names
- `https://typicode.github.io/husky/get-started.html` — husky v9 `pnpm exec husky init` flow
- `https://developers.cloudflare.com/pages/configuration/build-image/` — Cloudflare Pages v3 build image; Node 22 default; PNPM_VERSION env var requirement
- `npm view` registry — All package versions verified 2026-05-10: svelte 5.55.5, @sveltejs/kit 2.59.1, @sveltejs/adapter-static 3.0.10, tailwindcss 4.3.0, @tailwindcss/vite 4.3.0, husky 9.1.7, lint-staged 17.0.4, eslint-plugin-svelte 3.17.1, typescript-eslint 8.59.2, prettier 3.8.3, prettier-plugin-svelte 3.5.1

### Secondary (MEDIUM confidence)
- `https://svelte.dev/docs/cli/tailwind` — `sv add tailwindcss` uses Tailwind Vite plugin; verified consistent with official Tailwind docs
- `https://svelte.dev/docs/cli/eslint` — `sv add eslint` generates `eslint.config.js` flat config; consistent with eslint-plugin-svelte v3 requirement
- `https://developers.cloudflare.com/changelog/post/2025-05-30-pages-build-image-v3/` — CF Pages v3 default is Node 22; pnpm auto-detect from lockfile NOT supported
- DEV Community guide on Tailwind v4 + SvelteKit gotchas — PostCSS conflict and `@reference` in style blocks; cross-verified with official docs

### Tertiary (LOW confidence)
- Community reports of `runes: true` breaking Svelte 4 libraries — documented in SvelteKit issue tracker but no official docs statement; recommendation is conservative (use function form)

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — verified against npm registry 2026-05-10
- Tailwind v4 + Vite integration: HIGH — verified against official Tailwind docs
- adapter-static configuration: HIGH — verified against official SvelteKit docs
- Cloudflare Pages pnpm + NODE_VERSION: HIGH — verified against CF changelog and build image docs
- ESLint flat config pattern: HIGH — verified against eslint-plugin-svelte official user guide
- Husky v9 pnpm flow: HIGH — verified against official Husky docs
- Svelte 5 runes compiler flag behavior: MEDIUM — core behavior documented; third-party library interaction is inferred from issue tracker reports

**Research date:** 2026-05-10
**Valid until:** 2026-06-10 (30 days; stack is stable; Tailwind/SvelteKit move fast but major integration changes are unlikely within this window)
