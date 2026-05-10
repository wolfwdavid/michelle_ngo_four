---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - .nvmrc
  - svelte.config.js
  - vite.config.ts
  - tsconfig.json
  - eslint.config.js
  - .prettierrc
  - .prettierignore
  - .gitignore
  - src/app.css
  - src/app.html
  - src/app.d.ts
  - src/routes/+layout.svelte
  - src/routes/+layout.ts
  - src/routes/+page.svelte
  - static/robots.txt
  - static/favicon.png
  - .husky/pre-commit
autonomous: true
requirements: [FOUND-01]
requirements_addressed: [FOUND-01]
must_haves:
  truths:
    - "pnpm build produces a clean static build in build/ with no errors"
    - "TypeScript strict mode (with noUncheckedIndexedAccess + noImplicitOverride) compiles with no errors"
    - "Tailwind utility classes render in the smoke-test route at /"
    - "robots.txt and meta noindex both block search-engine indexing"
    - "Pre-commit hook runs ESLint + Prettier on staged files"
  artifacts:
    - path: "svelte.config.js"
      provides: "adapter-static configuration with build output dir"
      contains: "@sveltejs/adapter-static"
    - path: "vite.config.ts"
      provides: "Tailwind v4 Vite plugin + SvelteKit plugin"
      contains: "tailwindcss"
    - path: "src/app.css"
      provides: "Tailwind v4 entry"
      contains: "@import \"tailwindcss\""
    - path: "src/routes/+page.svelte"
      provides: "Branded splash placeholder with MICHELLE NGO wordmark"
      contains: "Michelle Ngo"
    - path: "src/routes/+layout.svelte"
      provides: "Root layout with noindex meta tag"
      contains: "noindex"
    - path: "static/robots.txt"
      provides: "Crawler block for staging"
      contains: "Disallow: /"
    - path: "tsconfig.json"
      provides: "Strict TypeScript with extra flags"
      contains: "noUncheckedIndexedAccess"
    - path: ".husky/pre-commit"
      provides: "Pre-commit lint hook"
      contains: "lint-staged"
  key_links:
    - from: "vite.config.ts"
      to: "@tailwindcss/vite"
      via: "import + plugin registration"
      pattern: "tailwindcss\\(\\)"
    - from: "src/routes/+layout.svelte"
      to: "src/app.css"
      via: "import statement"
      pattern: "import.*app\\.css"
    - from: "src/routes/+layout.ts"
      to: "SvelteKit prerender pipeline"
      via: "export const prerender = true"
      pattern: "prerender\\s*=\\s*true"
    - from: "package.json"
      to: ".husky/pre-commit"
      via: "prepare script + husky init"
      pattern: "\"prepare\":\\s*\"husky\""
---

<objective>
Scaffold a SvelteKit 2 + Svelte 5 + TypeScript (strict) + Tailwind v4 project that builds cleanly to a static `build/` directory, renders a branded splash placeholder at `/` with visible Tailwind utilities, blocks search-engine indexing via robots.txt + meta noindex, and locks repo conventions (Prettier, ESLint flat config, husky + lint-staged pre-commit hook). All version pins come directly from RESEARCH.md and all locked decisions D-01 through D-16 must be honored.

Purpose: Establish the framework, build pipeline, and repo conventions every later phase depends on. This plan satisfies FOUND-01 in full and produces all artifacts needed for plan 01-02 (Cloudflare Pages deploy).

Output:
- Running `pnpm build` exits 0, produces `build/index.html` with Tailwind classes and noindex meta tag.
- Running `pnpm check` exits 0 with TypeScript strict mode + extra flags enabled.
- Running `pnpm lint` and `pnpm format --check` exit 0.
- Running `git commit` triggers the pre-commit hook (ESLint + Prettier on staged files).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-VALIDATION.md
@CLAUDE.md
</context>

<interfaces>
<!-- Key contracts from RESEARCH.md the executor needs. No codebase exploration required. -->

Version pins (verified via npm registry on 2026-05-10 per RESEARCH.md §Standard Stack):
```
svelte@5.55.5
@sveltejs/kit@2.59.1
@sveltejs/adapter-static@3.0.10
tailwindcss@4.3.0
@tailwindcss/vite@4.3.0
husky@9.1.7
lint-staged@17.0.4
eslint-plugin-svelte@3.17.1
typescript-eslint@8.59.2
prettier@3.8.3
prettier-plugin-svelte@3.5.1
```

Locked decisions (from CONTEXT.md):
- D-01: Svelte 5 + SvelteKit 2 with runes API
- D-02: Tailwind v4 CSS-first (NO tailwind.config.js, NO postcss.config.js)
- D-03: pnpm package manager
- D-04: Node 22 LTS via .nvmrc + engines.node
- D-06: @sveltejs/adapter-static (NOT adapter-cloudflare, NOT adapter-auto)
- D-09: Splash = "MICHELLE NGO" wordmark + tagline placeholder "Filmmaker. Site coming soon."
- D-11: robots.txt with `Disallow: /` AND meta `noindex, nofollow` in root layout
- D-12: `<title>Michelle Ngo</title>`, placeholder favicon
- D-13: Prettier + ESLint with eslint-plugin-svelte
- D-14: TypeScript `strict: true` + `noUncheckedIndexedAccess` + `noImplicitOverride`
- D-15: lint-staged + husky pre-commit hook
- D-16: Minimal `src/lib/` — do NOT create empty subdirs with .gitkeep

Tailwind v4 + SvelteKit canonical wiring (from RESEARCH.md Pattern 1):
```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],  // tailwindcss BEFORE sveltekit
});
```

```css
/* src/app.css */
@import "tailwindcss";

@theme {
  /* Phase 1: minimal seeds — full type system in Phase 4 */
}
```

adapter-static config (RESEARCH.md Pattern 2):
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true,
    }),
  },
};

export default config;
```
Note on runes: per RESEARCH.md Pattern 3, do NOT set `compilerOptions.runes: true` globally without function guard. Omit `compilerOptions` entirely for Phase 1 — runes are available by default in Svelte 5.

tsconfig.json (RESEARCH.md Pattern 6 — CRITICAL: NO `include` field):
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```
</interfaces>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Scaffold SvelteKit + TypeScript with sv create, pin versions, install Tailwind v4 + tooling</name>
  <files>package.json, pnpm-lock.yaml, .nvmrc, .gitignore, src/app.html, src/app.d.ts, svelte.config.js, vite.config.ts, tsconfig.json, eslint.config.js, .prettierrc, .prettierignore, src/routes/+layout.svelte, src/routes/+layout.ts, src/routes/+page.svelte, static/favicon.png</files>
  <read_first>
    - .planning/phases/01-foundation/01-CONTEXT.md (D-01 through D-16, especially D-02 Tailwind v4 CSS-first and D-14 strict TS flags)
    - .planning/phases/01-foundation/01-RESEARCH.md §Standard Stack (version pins) + §Architecture Patterns 1, 2, 3, 4, 6 + §Common Pitfalls 1, 2, 3, 5
    - .planning/PROJECT.md (locked tech stack, perf constraints)
    - CLAUDE.md (GSD Workflow Enforcement — husky hook must coexist with GSD commit flow, not replace it)
    - The current repo root listing — confirm no existing package.json or src/ before scaffolding
  </read_first>
  <action>
    Scaffold the SvelteKit project, pin every dependency to the exact versions from RESEARCH.md, and produce all configuration files in a single coherent pass.

    **Step 1 — Verify pnpm and capture version:**
    Run `pnpm --version`. Record the version (e.g., `10.11.1`). This value MUST be used in two places below: `packageManager` field in package.json AND remembered for plan 01-02 to set `PNPM_VERSION` env var on Cloudflare.

    **Step 2 — Scaffold via Svelte CLI (preferred path per RESEARCH.md State of the Art):**
    Run from repo root:
    ```
    pnpm dlx sv@latest create . --template minimal --types ts --no-add-ons --install pnpm
    ```
    If the directory is non-empty (it contains `.planning/`, `_prep/`, `CLAUDE.md`, `.git/`), `sv create` will refuse — pass `--force` only if it also offers a flag for non-empty target directories. If `sv create` cannot run in-place, scaffold into a temp directory and copy the generated files (NOT `.git`, NOT any planning docs) into the repo root.

    Do NOT use `npm create svelte@latest` — it is the legacy path per RESEARCH.md.

    **Step 3 — Install exact-pinned versions (overwrite whatever sv create produced):**
    ```
    pnpm add -D -E svelte@5.55.5 @sveltejs/kit@2.59.1 @sveltejs/adapter-static@3.0.10 typescript@5
    pnpm add -D -E tailwindcss@4.3.0 @tailwindcss/vite@4.3.0
    pnpm add -D -E eslint@9 eslint-plugin-svelte@3.17.1 typescript-eslint@8.59.2 globals @eslint/js
    pnpm add -D -E prettier@3.8.3 prettier-plugin-svelte@3.5.1
    pnpm add -D -E husky@9.1.7 lint-staged@17.0.4
    pnpm add -D -E svelte-check
    ```
    The `-E` flag pins exact versions (no `^`). Use `-E` for every package above.

    **Step 4 — Edit package.json:**
    Add/replace these fields exactly:
    ```
    "packageManager": "pnpm@<EXACT VERSION FROM STEP 1>",
    "engines": { "node": ">=22" },
    "type": "module",
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
    ```
    Do NOT add `format:check` — `pnpm format --check` is what the validation suite uses.

    **Step 5 — Create `.nvmrc`** at repo root with exact contents:
    ```
    22
    ```

    **Step 6 — Create `vite.config.ts`** (overwrite whatever sv create produced) with EXACT contents:
    ```typescript
    import { sveltekit } from '@sveltejs/kit/vite';
    import { defineConfig } from 'vite';
    import tailwindcss from '@tailwindcss/vite';

    export default defineConfig({
      plugins: [tailwindcss(), sveltekit()],
    });
    ```
    Order matters: `tailwindcss()` MUST come before `sveltekit()` per RESEARCH.md Pattern 1.

    **Step 7 — Create `svelte.config.js`** (overwrite whatever sv create produced — sv likely produces adapter-auto) with EXACT contents:
    ```javascript
    import adapter from '@sveltejs/adapter-static';
    import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

    /** @type {import('@sveltejs/kit').Config} */
    const config = {
      preprocess: vitePreprocess(),
      kit: {
        adapter: adapter({
          pages: 'build',
          assets: 'build',
          fallback: undefined,
          precompress: false,
          strict: true,
        }),
      },
    };

    export default config;
    ```
    Do NOT add `compilerOptions: { runes: true }` — per RESEARCH.md Pattern 3 + Pitfall 5, omit it (runes are available by default in Svelte 5; setting `runes: true` globally risks breaking third-party Svelte 4 libs later).

    **Step 8 — Create `tsconfig.json`** (overwrite whatever sv create produced) with EXACT contents:
    ```json
    {
      "extends": "./.svelte-kit/tsconfig.json",
      "compilerOptions": {
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noImplicitOverride": true
      }
    }
    ```
    CRITICAL per RESEARCH.md Pitfall 3: do NOT add an `include` field — it overwrites SvelteKit's generated paths and breaks `./$types` resolution.

    **Step 9 — Create `src/app.css`** with EXACT contents:
    ```css
    @import "tailwindcss";

    @theme {
      /* Phase 1: minimal theme seeds — full type system lands in Phase 4 */
    }
    ```

    **Step 10 — Create `src/routes/+layout.svelte`** with EXACT contents:
    ```svelte
    <script lang="ts">
      import '../app.css';
      let { children } = $props();
    </script>

    <svelte:head>
      <meta name="robots" content="noindex, nofollow" />
      <title>Michelle Ngo</title>
    </svelte:head>

    {@render children()}
    ```

    **Step 11 — Create `src/routes/+layout.ts`** with EXACT contents:
    ```typescript
    export const prerender = true;
    ```

    **Step 12 — Create `src/routes/+page.svelte`** (the splash placeholder per D-09, D-10) with EXACT contents:
    ```svelte
    <main class="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 class="text-5xl md:text-7xl font-bold tracking-widest uppercase text-center">Michelle Ngo</h1>
      <p class="mt-6 text-base md:text-lg text-gray-400 tracking-wide text-center">Filmmaker. Site coming soon.</p>
    </main>
    ```
    This satisfies D-09 (wordmark + tagline + visible Tailwind), D-10 (no contact info yet).

    **Step 13 — Verify `src/app.html`** is present (sv create produces it) and contains `%sveltekit.head%` and `%sveltekit.body%` placeholders. If sv create did not produce one, create it:
    ```html
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <link rel="icon" href="%sveltekit.assets%/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        %sveltekit.head%
      </head>
      <body data-sveltekit-preload-data="hover">
        <div style="display: contents">%sveltekit.body%</div>
      </body>
    </html>
    ```

    **Step 14 — Verify `src/app.d.ts`** is present (sv create produces it). If absent, create with:
    ```typescript
    declare global {
      namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
      }
    }

    export {};
    ```

    **Step 15 — Create `.prettierrc`** with EXACT contents (per RESEARCH.md Code Examples + Pitfall 6):
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

    **Step 16 — Create `.prettierignore`** with these contents:
    ```
    .svelte-kit
    build
    node_modules
    pnpm-lock.yaml
    package-lock.json
    yarn.lock
    .planning
    _prep
    ```

    **Step 17 — Create `eslint.config.js`** with EXACT contents (RESEARCH.md Pattern 4):
    ```javascript
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
        ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/'],
      },
    );
    ```

    **Step 18 — Verify/extend `.gitignore`** contains at minimum:
    ```
    node_modules
    /build
    /.svelte-kit
    /package
    .env
    .env.*
    !.env.example
    !.env.test
    vite.config.js.timestamp-*
    vite.config.ts.timestamp-*
    .DS_Store
    ```
    sv create produces a workable .gitignore; just verify these entries exist and add any that are missing.

    **Step 19 — Create `static/robots.txt`** with EXACT contents (per D-11):
    ```
    User-agent: *
    Disallow: /
    ```
    (Trailing newline at EOF.)

    **Step 20 — Place a placeholder `static/favicon.png`** (per D-12). If sv create generated one in `static/`, leave it. If not, copy any small PNG (≤ 4KB) to `static/favicon.png`. The default SvelteKit favicon is acceptable for Phase 1.

    **Step 21 — Confirm what sv create did NOT produce that we must NOT have:**
    Per D-02 + RESEARCH.md Pitfall 2: there must be NO `tailwind.config.js`, NO `tailwind.config.ts`, NO `postcss.config.js`, NO `postcss.config.cjs`, NO `autoprefixer` in package.json. If sv create added any of these, delete them.

    **Step 22 — Confirm minimal src/lib (per D-16):** create the file `src/lib/index.ts` with only this content (no subdirectories, no .gitkeep files):
    ```typescript
    // place files you want to import through the `$lib` alias in this folder.
    export {};
    ```
    Each later phase will create the subdirectories it needs.

    **Step 23 — Lock the lockfile:** Run `pnpm install` once more after all package.json edits to ensure pnpm-lock.yaml is consistent with the pinned versions.
  </action>
  <verify>
    <automated>pnpm install &amp;&amp; pnpm check &amp;&amp; pnpm lint &amp;&amp; pnpm format --check &amp;&amp; pnpm build</automated>
  </verify>
  <acceptance_criteria>
    - File `package.json` contains `"packageManager": "pnpm@`
    - File `package.json` contains `"node": ">=22"`
    - File `package.json` contains `"prepare": "husky"`
    - File `package.json` contains `"lint-staged"` key with `"*.{js,ts,svelte}"` entry
    - File `package.json` `devDependencies` contains exact version `"svelte": "5.55.5"`
    - File `package.json` `devDependencies` contains exact version `"@sveltejs/kit": "2.59.1"`
    - File `package.json` `devDependencies` contains exact version `"@sveltejs/adapter-static": "3.0.10"`
    - File `package.json` `devDependencies` contains exact version `"tailwindcss": "4.3.0"`
    - File `package.json` `devDependencies` contains exact version `"@tailwindcss/vite": "4.3.0"`
    - File `package.json` `devDependencies` contains exact version `"husky": "9.1.7"`
    - File `package.json` `devDependencies` contains exact version `"lint-staged": "17.0.4"`
    - File `package.json` `devDependencies` contains exact version `"eslint-plugin-svelte": "3.17.1"`
    - File `package.json` `devDependencies` contains exact version `"typescript-eslint": "8.59.2"`
    - File `package.json` `devDependencies` contains exact version `"prettier": "3.8.3"`
    - File `package.json` `devDependencies` contains exact version `"prettier-plugin-svelte": "3.5.1"`
    - File `.nvmrc` exists and contains `22`
    - File `pnpm-lock.yaml` exists at repo root
    - File `tsconfig.json` contains `"strict": true`
    - File `tsconfig.json` contains `"noUncheckedIndexedAccess": true`
    - File `tsconfig.json` contains `"noImplicitOverride": true`
    - File `tsconfig.json` does NOT contain a top-level `"include"` key (grep `"include"` in tsconfig.json returns no match)
    - File `tsconfig.json` contains `"extends": "./.svelte-kit/tsconfig.json"`
    - File `vite.config.ts` contains `import tailwindcss from '@tailwindcss/vite'`
    - File `vite.config.ts` contains `tailwindcss()` and `sveltekit()` in plugins array, with `tailwindcss()` listed before `sveltekit()`
    - File `svelte.config.js` contains `import adapter from '@sveltejs/adapter-static'`
    - File `svelte.config.js` contains `pages: 'build'` and `assets: 'build'` and `strict: true`
    - File `svelte.config.js` does NOT contain `adapter-auto` or `adapter-cloudflare`
    - File `svelte.config.js` does NOT contain `compilerOptions: { runes: true }` (per RESEARCH.md Pattern 3)
    - File `src/app.css` contains `@import "tailwindcss"`
    - File `src/app.css` contains `@theme`
    - File `src/routes/+page.svelte` contains the literal text `Michelle Ngo`
    - File `src/routes/+page.svelte` contains the literal text `Filmmaker. Site coming soon.`
    - File `src/routes/+page.svelte` contains Tailwind utility classes (grep matches at least one of `text-5xl|bg-black|text-white|min-h-screen|font-bold`)
    - File `src/routes/+layout.svelte` contains `import '../app.css'`
    - File `src/routes/+layout.svelte` contains `name="robots"` and the value contains `noindex` and `nofollow`
    - File `src/routes/+layout.svelte` contains `<title>Michelle Ngo</title>`
    - File `src/routes/+layout.ts` contains `export const prerender = true`
    - File `static/robots.txt` exists, contains `User-agent: *`, and contains `Disallow: /`
    - File `static/favicon.png` exists
    - File `src/lib/index.ts` exists
    - File `eslint.config.js` exists and imports from `eslint-plugin-svelte`, `typescript-eslint`, and `@eslint/js`
    - File `.prettierrc` exists and contains `"prettier-plugin-svelte"` in plugins array
    - File `.prettierrc` contains an override entry with `"parser": "svelte"`
    - File `.prettierignore` exists and contains `.svelte-kit` and `build`
    - No file `tailwind.config.js`, `tailwind.config.ts`, `postcss.config.js`, or `postcss.config.cjs` exists at repo root
    - Command `pnpm install` exits 0
    - Command `pnpm check` exits 0 (TypeScript strict + extra flags pass)
    - Command `pnpm lint` exits 0
    - Command `pnpm format --check` exits 0
    - Command `pnpm build` exits 0
    - Directory `build/` exists after `pnpm build`
    - File `build/index.html` exists after `pnpm build`
    - Grep on `build/index.html` for pattern `text-|bg-|font-|min-h-` returns at least one match (Tailwind utilities survived prerender)
    - Grep on `build/index.html` for pattern `Michelle Ngo` (case-insensitive) returns at least one match
    - Grep on `build/index.html` for pattern `noindex` (case-insensitive) returns at least one match
    - File `build/robots.txt` exists and contains `Disallow: /`
  </acceptance_criteria>
  <done>
    - `pnpm build && pnpm check && pnpm lint && pnpm format --check` all exit 0 in a clean clone after `pnpm install`.
    - `build/index.html` contains the MICHELLE NGO wordmark, the tagline, Tailwind utility classes, and a `noindex` meta tag.
    - `build/robots.txt` is present and disallows all crawlers.
    - All package versions are pinned exactly (no `^` or `~`) and match RESEARCH.md.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Initialize husky pre-commit hook with lint-staged</name>
  <files>.husky/pre-commit, package.json</files>
  <read_first>
    - package.json (verify `"prepare": "husky"` script and `lint-staged` config from Task 1 are present)
    - .planning/phases/01-foundation/01-CONTEXT.md (D-15: lint-staged + husky pre-commit hook)
    - .planning/phases/01-foundation/01-RESEARCH.md §Pattern 5 (Husky v9 + lint-staged with pnpm)
    - CLAUDE.md (GSD Workflow Enforcement: husky must coexist with GSD's commit flow, not bypass it — pre-commit only formats/lints, does not call commit-tool, does not skip GSD)
  </read_first>
  <action>
    Initialize husky v9 and wire the pre-commit hook to run lint-staged.

    **Step 1 — Run husky init (per RESEARCH.md Pattern 5):**
    ```
    pnpm exec husky init
    ```
    This creates the `.husky/` directory and a default `.husky/pre-commit` file. It also (re-)adds `"prepare": "husky"` to package.json scripts — confirm it's there from Task 1; if husky init overwrote it, restore the full scripts block from Task 1.

    Do NOT use the legacy `husky install` command — RESEARCH.md State of the Art notes husky v9 uses `pnpm exec husky init` and dropped the `husky install` script.

    **Step 2 — Replace `.husky/pre-commit` contents** with EXACTLY this single line (no shebang, no `husky.sh` source — husky v9 dropped both):
    ```
    pnpm lint-staged
    ```

    **Step 3 — Verify execute permission on `.husky/pre-commit`** (Windows: not strictly required since git on Windows ignores POSIX exec bits inside .husky; husky v9 handles cross-platform). On a Unix-like CI container the file must be executable; if `chmod` is available, run `chmod +x .husky/pre-commit`. Skip silently if `chmod` is not available on Windows.

    **Step 4 — Smoke-test the hook (manual local proof):**
    Stage a deliberately mis-formatted file (e.g., write a temp file `tmp/lint-test.ts` containing `const x =1   ; console.log(x)`), then `git add tmp/lint-test.ts` and `git commit -m "test: lint hook smoke"`. The commit must either:
    (a) auto-format the file and succeed (lint-staged ran), OR
    (b) fail with an ESLint/Prettier error.
    Either outcome confirms the hook ran. Then `git reset HEAD~1` to undo the test commit and `rm -rf tmp/` to clean up. (Skip this step if it conflicts with GSD's commit flow — the acceptance criterion below is sufficient proof.)

    **GSD coexistence note (per CLAUDE.md):** The pre-commit hook only runs Prettier + ESLint on staged files; it does not invoke `gsd-tools commit`, does not bypass GSD planning, and does not block GSD's commit subprocess (which calls `git commit` like any other tool). No further coordination is needed.
  </action>
  <verify>
    <automated>test -f .husky/pre-commit &amp;&amp; grep -q "lint-staged" .husky/pre-commit &amp;&amp; pnpm exec lint-staged --version</automated>
  </verify>
  <acceptance_criteria>
    - File `.husky/pre-commit` exists at repo root
    - File `.husky/pre-commit` contains the literal string `lint-staged`
    - File `.husky/pre-commit` does NOT contain `husky.sh` (legacy v8 path)
    - File `package.json` `scripts` contains `"prepare": "husky"`
    - File `package.json` contains a top-level `"lint-staged"` key with at least the entry `"*.{js,ts,svelte}"`
    - Directory `.husky/` is committed (not gitignored)
    - Command `pnpm exec lint-staged --version` exits 0 (lint-staged is installed and resolvable)
    - Command `pnpm exec husky --version` exits 0 (husky is installed and resolvable)
  </acceptance_criteria>
  <done>
    - `.husky/pre-commit` is present, contains `pnpm lint-staged`, and the husky binary resolves.
    - The hook will run on every `git commit`, formatting/linting staged files before they enter history.
    - GSD's commit workflow is not blocked or bypassed by the hook.
  </done>
</task>

</tasks>

<verification>
After both tasks complete, run the full Phase 1 validation suite from the repo root:

```
pnpm install
pnpm check
pnpm lint
pnpm format --check
pnpm build
```

All must exit 0. Then verify the build artifact:

```
test -f build/index.html
test -f build/robots.txt
grep -E "text-|bg-|font-|min-h-" build/index.html  # Tailwind utilities present
grep -i "noindex" build/index.html                  # robots meta present
grep -i "michelle ngo" build/index.html             # wordmark present
grep "Disallow: /" build/robots.txt                 # crawler block present
```

All grep commands must return at least one match.

Then verify husky:
```
test -f .husky/pre-commit
grep "lint-staged" .husky/pre-commit
```

Both must succeed.
</verification>

<success_criteria>
1. `pnpm build` exits 0 and produces `build/index.html` (Phase 1 success criterion #1).
2. `pnpm check` exits 0 with TS strict + `noUncheckedIndexedAccess` + `noImplicitOverride` enforced (FOUND-01 type-safety component).
3. `pnpm lint` and `pnpm format --check` exit 0.
4. `build/index.html` contains visible Tailwind utility classes ("MICHELLE NGO" rendered with `text-5xl`, `bg-black`, etc.) — Phase 1 success criterion #2.
5. `build/index.html` contains `<meta name="robots" content="noindex, nofollow">` and `build/robots.txt` contains `Disallow: /` (D-11).
6. `.husky/pre-commit` exists and runs `pnpm lint-staged`.
7. All package versions in `package.json` are pinned exactly to the values in RESEARCH.md (no `^`, no `~`).
8. No `tailwind.config.js`, `tailwind.config.ts`, or `postcss.config.js` exists at repo root.
9. `tsconfig.json` does not contain an `include` field (per RESEARCH.md Pitfall 3).
10. `pnpm-lock.yaml` exists and is committed — required for plan 01-02 (Cloudflare Pages auto-detects pnpm via this file).

Phase 1 success criterion #3 (push triggers Cloudflare deploy) and #4 (HTTPS staging URL serves the route) are addressed by plan 01-02.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md` documenting:
- Final pinned package versions (so plan 01-02 can reference them)
- Local pnpm version captured in step 1 (needed for `PNPM_VERSION` env var in plan 01-02)
- Confirmation that `build/` directory and `pnpm-lock.yaml` are present (these are the contract surface for plan 01-02)
- Any deviations from the action plan (e.g., if sv create produced different defaults)
</output>
