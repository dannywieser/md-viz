# Summary: repo bootstrap

- **Slug:** 20261015-01-repo-bootstrap
- **Started:** 2026.10.15
- **Completed:** 2026.10.15

## Overview

Bootstrapped `md-insights`, a homelab TypeScript/Node project that will load markdown notes (a folder of `.md` files or a Bear DB) into a cache for analysis of content, relationships and structure. The repo is now a pnpm monorepo with a hello world web app and a shared UI package (`@md-insights/ui`) that a future second app (likely Electron) can reuse, plus linting, formatting, tests and docs.

## What was done

- **Workspace:** `package.json`, `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.nvmrc` (Node 24), `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.prettierrc.json`, `.prettierignore`.
- **`packages/ui` (`@md-insights/ui`):** TypeScript-source package with no build step. Tailwind v4 theme with light/dark CSS variables (`src/styles/globals.css`), `cn` helper, shadcn `button` and `card` (added via the CLI), barrel `src/index.ts`, `components.json`, Vitest config, `tests/card.test.tsx`.
- **`apps/web` (`@md-insights/web`):** hand-scaffolded Vite + React app (no default Vite demo). `App.tsx` renders a hello world inside a shadcn `Card` from the UI package. `components.json` points the shadcn `ui` alias at `packages/ui`. `tests/App.test.tsx` and `tests/setup.ts`.
- **Tooling:** ESLint flat config with typed typescript-eslint rules, react-hooks and react-refresh; Prettier; Vitest + Testing Library + jsdom. Tests live in `tests/` beside `src/`.
- **Docs:** `README.md` and `CLAUDE.md`.
- **Dev:** `.claude/launch.json` so the preview tool can start the web dev server.
- **Verified:** format:check, lint, typecheck, test (2 tests) and build pass. The page renders in light mode, and the `dark` class switches the theme. `shadcn add` run from `apps/web` writes into `packages/ui`.
- **Commits:** `c147829` (session log and plan), `a86145a` (implementation).

## Highlights

- **Shared UI package from day one:** the plan was revised mid-session to extract shared components and theming up front, anticipating a second app. Tailwind scans the package through an `@source` directive in each app's CSS.
- **shadcn CLI must work in the monorepo:** no hand-written fallback. Config in both `components.json` files with matching aliases; verified end to end.
- **TypeScript pinned to 6.0.x:** TypeScript 7 (7.0.2 on npm) has no stable programmatic API and typescript-eslint 8.71.2 requires `typescript <6.1.0`. Revisit after TypeScript 7.1 and typescript-eslint support land.
- **Tests in their own folder** beside `src/`, per request.
- No CI and no service stub, per request.

## Deviations from the plan

- The current shadcn CLI generates `import { cn } from "cn"` (a new npm package), so `clsx` and `tailwind-merge` were dropped and `lib/utils.ts` re-exports `cn`.
- `baseUrl` removed from tsconfigs (deprecated in TypeScript 6).
- `typescript` pinned to exactly 6.0.3 rather than `~6.0`.
- Added `.claude/launch.json`, which was not in the plan.
- Prettier is run over the shadcn-generated files (single quotes, no semicolons), so regenerated components will need a `pnpm format`.

## Not done / follow-ups

- The service (`apps/service`), markdown loading, cache, Bear integration and the second (Electron) app.
- Dark mode is class-based only: no toggle and no `prefers-color-scheme` handling.
- CI.
- Revisit the TypeScript 7 pin once typescript-eslint supports it; optionally add `tsgo` as a separate fast typecheck.
