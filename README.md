# md-viz

A homelab project that loads markdown notes (a folder of `.md` files or a Bear database) into a cache so their content, relationships and structure can be analyzed.

Currently a bootstrap: a pnpm monorepo with a web app whose landing page shows a grid of the notes in the cache (one cell per note, hover for the title), an Electron app that counts the markdown files in a chosen folder and syncs them to the cache, a note cache service (notes API over SQLite) with a generated, validated API client (the web app loads its notes through it), a design viewer app and a shared UI package.

## Prerequisites

- Node 24 (`nvm use` reads `.nvmrc`)
- pnpm 10 (`corepack enable` picks up the pinned version)

## Getting started

```bash
pnpm install
pnpm dev          # web app on http://localhost:5175
pnpm dev:design   # design viewer on http://localhost:5174
pnpm dev:electron # Electron app (downloads the Electron binary on first run)
pnpm dev:cache    # note cache service on http://localhost:8787 (see apps/cache/README.md)
pnpm dev:all      # cache service, web app and Electron app together
```

The Electron renderer uses port 5173 and the web app 5175, so they can run together. In the Electron app, choose the `demo/` folder to see the count of 18, then click sync to push the notes to the cache (`CACHE_URL`, default `http://localhost:8787`); they show up in the web app's grid. Sync only pushes new or changed files and deletes cached notes whose file is gone.

## Commands

Run from the repo root.

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start the web app dev server         |
| `pnpm dev:design`   | Start the design viewer (port 5174)  |
| `pnpm dev:electron` | Start the Electron app               |
| `pnpm dev:cache`    | Start the note cache service         |
| `pnpm dev:all`      | Start the web app and the cache      |
| `pnpm generate`     | Generate the api client from specs   |
| `pnpm openapi`      | Rewrite the cache's OpenAPI spec     |
| `pnpm build`        | Typecheck and build every workspace  |
| `pnpm typecheck`    | Run `tsc` in every workspace         |
| `pnpm test`         | Run Vitest in every workspace        |
| `pnpm lint`         | Run ESLint (typed rules) on the repo |
| `pnpm format`       | Format with Prettier                 |
| `pnpm format:check` | Check formatting without writing     |

## Layout

```
apps/web/        React + Vite web app
apps/electron/   Electron app (electron-vite): main, preload, renderer, shared IPC contract
apps/cache/      Note cache service (Hono + node:sqlite): notes API, see its README
apps/design/     Design-board viewer for the theme and shared components
packages/ui/     @md-viz/ui: shared shadcn components, theme and styles
packages/api-client/  @md-viz/api-client: clients generated from the OpenAPI specs, see its README
demo/            Small committed set of markdown notes for trying and testing
```

Each workspace keeps its tests in a `tests/` folder beside `src/`. New apps go in `apps/*`, new shared packages in `packages/*`.

## Shared UI package

`@md-viz/ui` ships TypeScript source with no build step; each consuming Vite app compiles it. The theme (Solarized light and dark CSS variables, Space Mono, square edges, grid paper background) lives in `packages/ui/src/styles/globals.css`. `apps/design` is a design board that displays the theme tokens, shared components and the design guidelines; it holds no tokens of its own.

An app consumes it by:

1. Adding the dependency: `"@md-viz/ui": "workspace:*"`.
2. Importing the styles and telling Tailwind to scan the package in its CSS:

   ```css
   @import '@md-viz/ui/globals.css';
   @source '../../../packages/ui/src';
   ```

3. Importing components: `import { Button, Card } from '@md-viz/ui'`.

### Adding shadcn components

Run the CLI from an app (`apps/web` has a `components.json` whose `ui` alias points at the UI package):

```bash
cd apps/web
pnpm dlx shadcn@latest add dialog
```

Files land in `packages/ui/src/components`. Export the new component from `packages/ui/src/index.ts`, then run `pnpm format`.

## TypeScript version

TypeScript is pinned to 6.0.x. TypeScript 7 (the native compiler) has no stable programmatic API yet, so typescript-eslint cannot run on it. Revisit once TypeScript 7.1 and typescript-eslint support land.
