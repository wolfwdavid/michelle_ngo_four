---
phase: 01-foundation
plan: 01-scaffold
subsystem: foundation
tags: [scaffold, sveltekit, svelte5, tailwind4, typescript-strict, eslint, prettier, husky, lint-staged, pnpm]
requires: []
provides:
  - "SvelteKit 2 + Svelte 5 + TypeScript (strict + extras) build pipeline"
  - "Tailwind v4 via @tailwindcss/vite plugin (CSS-first, no postcss/tailwind config)"
  - "@sveltejs/adapter-static producing build/ directory (consumable by Cloudflare Pages in plan 01-02)"
  - "Pinned pnpm-lock.yaml + packageManager pnpm@11.0.9 (consumable as PNPM_VERSION env var in plan 01-02)"
  - "Branded splash placeholder at / (MICHELLE NGO wordmark + tagline)"
  - "Repo conventions: ESLint flat config + Prettier + husky/lint-staged pre-commit hook"
  - "robots.txt Disallow + meta noindex,nofollow on every route (D-11)"
affects:
  - "All later phases inherit this stack and conventions"
  - "Plan 01-02 depends on build/ output dir, pnpm-lock.yaml, and pnpm 11.0.9 version pin"
tech-stack:
  added:
    - "svelte 5.55.5"
    - "@sveltejs/kit 2.59.1"
    - "@sveltejs/adapter-static 3.0.10"
    - "@sveltejs/vite-plugin-svelte 7.1.2"
    - "tailwindcss 4.3.0"
    - "@tailwindcss/vite 4.3.0"
    - "vite 8.0.7"
    - "typescript 5.9.3"
    - "svelte-check 4.4.6"
    - "@types/node 22.19.18"
    - "eslint 9.39.4"
    - "@eslint/js 9.39.4"
    - "eslint-plugin-svelte 3.17.1"
    - "typescript-eslint 8.59.2"
    - "globals 17.6.0"
    - "prettier 3.8.3"
    - "prettier-plugin-svelte 3.5.1"
    - "husky 9.1.7"
    - "lint-staged 17.0.4"
  patterns:
    - "Tailwind v4 Vite plugin (RESEARCH.md Pattern 1) — tailwindcss() before sveltekit() in plugins array"
    - "adapter-static with strict prerender + root +layout.ts prerender=true (RESEARCH.md Pattern 2)"
    - "Svelte 5 runes default (no compilerOptions.runes flag set; RESEARCH.md Pattern 3 alternative)"
    - "ESLint flat config with eslint-plugin-svelte v3 + typescript-eslint projectService (RESEARCH.md Pattern 4)"
    - "Husky v9 init flow (no husky.sh source line; RESEARCH.md Pattern 5)"
    - "tsconfig extends .svelte-kit/tsconfig.json with no include field (RESEARCH.md Pattern 6 / Pitfall 3)"
    - "Two-layer search engine block: robots.txt Disallow + meta noindex (RESEARCH.md Pattern 7)"
key-files:
  created:
    - ".nvmrc"
    - ".prettierrc"
    - ".prettierignore"
    - "eslint.config.js"
    - "svelte.config.js (overwritten to use adapter-static)"
    - "vite.config.ts (overwritten to add tailwindcss plugin)"
    - "tsconfig.json (overwritten with strict + noUncheckedIndexedAccess + noImplicitOverride)"
    - "src/app.css"
    - "src/app.html (overwritten to add favicon link)"
    - "src/routes/+layout.svelte (overwritten to import app.css + emit noindex meta + title)"
    - "src/routes/+layout.ts (prerender=true)"
    - "src/routes/+page.svelte (splash placeholder)"
    - "src/lib/index.ts"
    - "static/robots.txt (overwritten to Disallow: /)"
    - "static/favicon.png (placeholder 1x1 PNG)"
    - ".husky/pre-commit"
    - "package.json (rewritten with pinned versions, scripts, lint-staged, packageManager, engines)"
    - "pnpm-lock.yaml"
    - "pnpm-workspace.yaml (sv-create generated; allowBuilds esbuild)"
    - "README.md (sv-create generated; default SvelteKit content)"
    - ".vscode/extensions.json (sv-create generated)"
    - ".npmrc (sv-create generated)"
  modified:
    - ".gitignore (sv-create generated; added /package and .claude/settings.local.json)"
    - "CLAUDE.md (sv-create prepended a Project Configuration block + reformatted markdown)"
decisions:
  - "Pinned every load-bearing dep with `-E` flag (no caret/tilde) — explicitly required by acceptance criteria"
  - "Omitted `compilerOptions.runes` from svelte.config.js per plan Step 7 — runes are available by default in Svelte 5; setting them globally risks breaking third-party Svelte 4 libraries (RESEARCH.md Pitfall 5). The sv-create-generated function form was overwritten."
  - "Used `pnpm dlx sv@latest create . --template minimal --types ts --no-add-ons` (interactive 'directory not empty' confirmed via piped yes); then overwrote sv-create defaults with plan-specified exact contents."
  - "Added Prettier override `*.css → singleQuote: false` so the repo-wide `singleQuote: true` doesn't downgrade `@import \"tailwindcss\"` (acceptance grep is literal-double-quote)."
  - "Pinned @types/node@22.19.18 to satisfy vite/kit type defs that reference Node globals (Buffer, http) — required for `pnpm check` to pass."
  - "Pinned @eslint/js@9.39.4 (matching eslint major) instead of the latest 10.x — aligns with `eslint@9` plan instruction and resolves the peer-dep warning."
metrics:
  start: "2026-05-10T16:36:57Z"
  end: "2026-05-10T16:49:57Z"
  duration: "~13 minutes"
  tasks_completed: 2
  files_created: 22
  files_modified: 2
  commits:
    - "691f800: feat(01-01): scaffold SvelteKit 2 + Tailwind v4 + TS strict + ESLint/Prettier"
    - "be8edf7: chore(01-01): wire husky v9 pre-commit hook with lint-staged"
---

# Phase 1 Plan 01: Scaffold Summary

**One-liner:** SvelteKit 2 + Svelte 5 + TypeScript (strict + noUncheckedIndexedAccess + noImplicitOverride) + Tailwind v4 (Vite plugin, CSS-first) scaffold with @sveltejs/adapter-static, ESLint flat config, Prettier + prettier-plugin-svelte, and husky v9/lint-staged pre-commit hook — builds clean to `build/`, renders `MICHELLE NGO` splash with visible Tailwind utilities, and blocks staging indexing via robots.txt Disallow + meta noindex.

## What Was Done

### Task 1: Project scaffold + tooling (commit `691f800`)

Scaffolded via `pnpm dlx sv@latest create . --template minimal --types ts --no-add-ons --install pnpm` (Svelte CLI v0.15.3), then overwrote sv-generated defaults to honor RESEARCH.md exact patterns and CONTEXT.md decisions D-01..D-16:

- **Versions pinned exactly** (no `^`, no `~`) per RESEARCH.md Standard Stack table:
  - Core: svelte 5.55.5, @sveltejs/kit 2.59.1, @sveltejs/adapter-static 3.0.10, @sveltejs/vite-plugin-svelte 7.1.2, vite 8.0.7, typescript 5.9.3, svelte-check 4.4.6, @types/node 22.19.18
  - Tailwind: tailwindcss 4.3.0, @tailwindcss/vite 4.3.0
  - ESLint: eslint 9.39.4, @eslint/js 9.39.4, eslint-plugin-svelte 3.17.1, typescript-eslint 8.59.2, globals 17.6.0
  - Prettier: prettier 3.8.3, prettier-plugin-svelte 3.5.1
  - Hooks: husky 9.1.7, lint-staged 17.0.4
- **package.json** rewritten with `packageManager: pnpm@11.0.9`, `engines.node: >=22`, scripts (`dev`/`build`/`preview`/`check`/`check:watch`/`lint`/`format`/`prepare`), and `lint-staged` config for `.{js,ts,svelte}` and `.{css,json,md,yaml,yml}` globs.
- **vite.config.ts** — `tailwindcss()` plugin **before** `sveltekit()` per RESEARCH.md Pattern 1.
- **svelte.config.js** — `@sveltejs/adapter-static` with `pages: 'build'`, `assets: 'build'`, `fallback: undefined`, `strict: true`. **Omitted** `compilerOptions.runes` per plan Step 7 (RESEARCH.md Pitfall 5).
- **tsconfig.json** — extends `./.svelte-kit/tsconfig.json`; **only** `compilerOptions: { strict, noUncheckedIndexedAccess, noImplicitOverride }`. **No `include` field** (RESEARCH.md Pitfall 3).
- **src/app.css** — `@import "tailwindcss";` + empty `@theme {}` block (Phase 1 minimal seed).
- **src/routes/+layout.svelte** — imports `../app.css`, emits `<meta name="robots" content="noindex, nofollow">` and `<title>Michelle Ngo</title>` in `<svelte:head>`.
- **src/routes/+layout.ts** — `export const prerender = true`.
- **src/routes/+page.svelte** — full-bleed black splash with `MICHELLE NGO` h1 (text-5xl md:text-7xl, font-bold, tracking-widest, uppercase) and "Filmmaker. Site coming soon." tagline (D-09, D-10).
- **src/lib/index.ts** — minimal `// place files... export {};` (D-16 — no pre-created subdirectories).
- **static/robots.txt** — overwrote sv-generated allow-all with `User-agent: *\nDisallow: /` (D-11).
- **static/favicon.png** — 67-byte placeholder 1x1 PNG (D-12; real favicon set is Phase 7).
- **eslint.config.js** — flat config with `js.configs.recommended`, `tseslint.configs.recommended`, `svelte.configs.recommended`; for `*.svelte` files uses `tseslint.parser` with `projectService: true` and `extraFileExtensions: ['.svelte']`.
- **.prettierrc** — `singleQuote: true`, `printWidth: 100`, `trailingComma: es5`, `prettier-plugin-svelte` enabled with `parser: svelte` override; **plus** a `*.css → singleQuote: false` override so `@import "tailwindcss"` keeps double quotes (matches acceptance grep).
- **.prettierignore**, **.nvmrc** (`22`), **.gitignore** (added `/package` and `.claude/settings.local.json`).

### Task 2: Husky pre-commit hook (commit `be8edf7`)

- `pnpm exec husky init` — created `.husky/pre-commit` (v9 flow; no `husky.sh` source line).
- Replaced default `pnpm test` content with `pnpm lint-staged`.
- `prepare: husky` script in package.json bootstraps `.husky/_/` on every `pnpm install`.

## Verification

All commands exit 0 in a clean clone after `pnpm install`:

```
pnpm check         → 264 files, 0 errors, 0 warnings
pnpm lint          → no violations
pnpm format --check → All matched files use Prettier code style!
pnpm build         → adapter-static wrote site to build/, exit 0
```

`build/` artifacts:
- `build/index.html` — contains `MICHELLE NGO`, `Filmmaker. Site coming soon.`, Tailwind utilities (`min-h-screen`, `bg-black`, `text-5xl`, `font-bold`, etc.), and `<meta name="robots" content="noindex, nofollow"/>`.
- `build/robots.txt` — `User-agent: *` + `Disallow: /`.
- `build/favicon.png` — placeholder PNG copied from static/.
- `build/_app/` — JS/CSS bundles.

Husky:
- `.husky/pre-commit` exists, contains `pnpm lint-staged`, no legacy `husky.sh` reference.
- `pnpm exec lint-staged --version` → `17.0.4` (resolves).
- `pnpm exec husky` exits 0 (resolves).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Missing `@types/node` broke `pnpm check`**
- **Found during:** Task 1 verification (`pnpm check` step)
- **Issue:** vite 8 + @sveltejs/kit 2.59.1 type defs reference Node globals (`Buffer`, `http`); without `@types/node`, svelte-check emitted 41 errors against `node_modules/.../vite/dist/node/index.d.ts`.
- **Fix:** `pnpm add -D -E @types/node@22.19.18` (matches Node 22 LTS pin from D-04). The plan's Step 3 dep list did not include `@types/node` because RESEARCH.md's Standard Stack table also omitted it; sv-create normally would have added it via add-ons, but `--no-add-ons` was used.
- **Files modified:** package.json, pnpm-lock.yaml.
- **Commit:** Folded into Task 1 commit `691f800`.

**2. [Rule 1 — Bug] ESLint `projectService: true` rejected `.svelte` files**
- **Found during:** Task 1 verification (`pnpm lint` step)
- **Issue:** typescript-eslint 8.59.2 with `projectService: true` requires `extraFileExtensions: ['.svelte']` to recognize the non-standard `.svelte` extension under TS project service. The plan's eslint.config.js (Step 17) omitted this; lint failed with "Parsing error: ... was not found by the project service because the extension for the file (`.svelte`) is non-standard."
- **Fix:** Added `extraFileExtensions: ['.svelte']` to the `*.svelte` block's `parserOptions`.
- **Files modified:** eslint.config.js.
- **Commit:** Folded into Task 1 commit `691f800`.

**3. [Rule 1 — Bug] Prettier `singleQuote: true` downgraded `@import "tailwindcss"` to single quotes, breaking the literal acceptance grep**
- **Found during:** Task 1 verification (`pnpm format --check` step)
- **Issue:** The plan's `.prettierrc` set `singleQuote: true` globally; Prettier 3.x applies this to CSS strings, rewriting `@import "tailwindcss"` to `@import 'tailwindcss'`. Acceptance criterion `File src/app.css contains @import "tailwindcss"` (literal double quote) then failed.
- **Fix:** Added a `*.css → singleQuote: false` override in `.prettierrc`. CSS conventionally uses double quotes anyway.
- **Files modified:** .prettierrc, src/app.css.
- **Commit:** Folded into Task 1 commit `691f800`.

**4. [Rule 3 — Blocking] `@eslint/js@10.0.1` peer-dep mismatch with `eslint@9.39.4`**
- **Found during:** Task 1 (`pnpm install` peer-dep warning)
- **Issue:** Latest `@eslint/js` is 10.0.1, which requires `eslint ^10.0.0`. Plan installed `eslint@9` (range), which resolved to 9.39.4.
- **Fix:** Pinned `@eslint/js@9.39.4` (matching the eslint major) instead of latest.
- **Files modified:** package.json, pnpm-lock.yaml.
- **Commit:** Folded into Task 1 commit `691f800`.

### Plan-Permitted Variances

- **`pnpm dlx sv create` ran in-place with directory non-empty.** sv prompted "Directory not empty. Continue?"; piped `yes` to confirm. The plan permitted "scaffold into a temp directory and copy" as fallback, but the in-place path worked. sv preserved `.git/`, `.planning/`, `_prep/`, `.claude/`, and `CLAUDE.md`; sv added a "Project Configuration" block to the top of CLAUDE.md (preserved as-is) and reformatted markdown.
- **sv-create generated extras kept:** `pnpm-workspace.yaml` (allows esbuild builds), `.npmrc`, `.vscode/extensions.json`, `README.md` — none are removed by the plan, all benign.

### Authentication Gates

None.

## Plan 01-02 Contract Surface

The next plan (`01-02-cloudflare-pages-PLAN.md`) depends on these artifacts produced by this plan:

- **`build/` output directory** — present and populated; SvelteKit's adapter-static writes here.
- **`pnpm-lock.yaml`** — present at repo root; Cloudflare Pages auto-detects pnpm via this file.
- **Local `pnpm` version:** **`11.0.9`** — set this as `PNPM_VERSION` env var in Cloudflare Pages dashboard (Settings → Environment variables) per RESEARCH.md Pitfall 1.
- **`packageManager: pnpm@11.0.9`** field in package.json — Corepack-aware tools (including newer Cloudflare build images) use this for self-consistency.
- **`.nvmrc` = `22`** + `engines.node: >=22` — set `NODE_VERSION=22` env var on Cloudflare for explicitness.
- **Build command:** `pnpm build` (script in package.json runs `vite build`).
- **Build output dir:** `build` (matches `pages: 'build'` in svelte.config.js).

## Self-Check: PASSED

- File `package.json`: FOUND
- File `pnpm-lock.yaml`: FOUND
- File `.nvmrc`: FOUND (contents: `22`)
- File `vite.config.ts`: FOUND (contains `tailwindcss()` before `sveltekit()`)
- File `svelte.config.js`: FOUND (contains `@sveltejs/adapter-static`, `pages: 'build'`, `strict: true`; no `compilerOptions.runes`)
- File `tsconfig.json`: FOUND (contains `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`; no `include`)
- File `src/app.css`: FOUND (contains `@import "tailwindcss"` literal)
- File `src/routes/+layout.svelte`: FOUND (contains `noindex, nofollow` and `<title>Michelle Ngo</title>`)
- File `src/routes/+layout.ts`: FOUND (contains `export const prerender = true`)
- File `src/routes/+page.svelte`: FOUND (contains `Michelle Ngo`, `Filmmaker. Site coming soon.`, Tailwind utilities)
- File `src/lib/index.ts`: FOUND
- File `static/robots.txt`: FOUND (contains `Disallow: /`)
- File `static/favicon.png`: FOUND (67 bytes)
- File `eslint.config.js`: FOUND
- File `.prettierrc`: FOUND (contains `prettier-plugin-svelte`, svelte parser override, css singleQuote override)
- File `.prettierignore`: FOUND
- File `.husky/pre-commit`: FOUND (contains `pnpm lint-staged`, no `husky.sh`)
- File `build/index.html`: FOUND (contains `Michelle Ngo`, `noindex`, Tailwind utilities)
- File `build/robots.txt`: FOUND (contains `Disallow: /`)
- No `tailwind.config.*` or `postcss.config.*` exists at repo root: VERIFIED
- Commit `691f800`: FOUND in `git log` (Task 1)
- Commit `be8edf7`: FOUND in `git log` (Task 2)
- `pnpm check` exits 0: VERIFIED
- `pnpm lint` exits 0: VERIFIED
- `pnpm format --check` exits 0: VERIFIED
- `pnpm build` exits 0: VERIFIED
