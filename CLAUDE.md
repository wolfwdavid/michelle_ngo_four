<!-- GSD:project-start source:PROJECT.md -->
## Project

**Michelle Ngo Portfolio**

A portfolio website for **Michelle Ngo**, filmmaker and multidisciplinary creative. The site replaces the current WordPress.com landing at michellengo.net with a SvelteKit-based experience built around 56 deduped videos pulled from her YouTube playlist + Vimeo account. Primary audience is hiring producers and agencies evaluating her for video production work; the site leads with a reel and surfaces press credits prominently.

**Core Value:** A producer can land on the site, watch the reel, click any video, and immediately see "more like this" — every interaction reinforces the depth and breadth of her video work.

### Constraints

- **Tech stack**: SvelteKit + TypeScript + Tailwind — locked in kickoff. Specific Tailwind/Svelte versions TBD in plan-phase
- **Data**: `videos.json` checked into the repo; build-time data only, no runtime CMS fetch
- **Hosting**: Static-export-friendly (Cloudflare Pages or Vercel); no Node server runtime required
- **Domain**: michellengo.net stays on WordPress.com until cutover; build against staging URL (`michelle-ngo.pages.dev` or equivalent)
- **Compatibility**: Modern browsers only — no IE/legacy support obligations
- **Performance**: Reel-led hero must feel instant; thumbnails should blur-up rather than pop-in
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
