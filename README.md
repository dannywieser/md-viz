# md-viz

A homelab project that loads markdown notes (a folder of `.md` files or a Bear database) into a cache so their content, relationships and structure can be analyzed.

Currently a bootstrap: a pnpm monorepo with a web app whose landing page shows a grid of the notes in the cache (one square per note, coloured by its tag set, a toggle in the grid's bar groups the sets, hover for the note and its set), an Electron app that syncs notes to the cache from a folder of markdown files or from Bear and shows the cache's sync sets (created, updated and deleted today and in the last 30 days, unchanged) as one note grid, a theme switcher in both apps, a note cache service (notes API and note sets over SQLite) with a generated, validated API client (the web app loads its notes through it), a design viewer app and a shared UI package.

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

The Electron renderer uses port 5173 and the web app 5175, so they can run together. In the Electron app, choose the `demo/` folder to see the count of 18 (the app reopens the last folder on the next launch), then click sync to push the notes to the cache (`CACHE_URL`, default `http://localhost:8787`); they show up in the web app's grid. Pick `bear` in the source select to sync your Bear library instead (macOS with Bear installed, read through Bear's `bearcli`; trashed and locked notes are skipped). Sync only pushes new or changed notes and deletes cached notes of the same source that are gone, so syncing one source never removes the other's notes; it also refreshes that source's note sets in the cache (a `tags` set per top-level tag and the `sync` sets: created, updated and deleted today and in the last 30 days, and unchanged; a note is in only one set of a grouping, each set has a colour, see `apps/cache/README.md`), and a deleted note is only marked deleted in the cache; the last sync of each source (its notes with their tags) is kept in `state.json` in Electron's user data folder (on macOS `~/Library/Application Support/@md-viz/electron/`). Each set gets a colour once (a tag set only for the top level of a nested tag, `daily/10/28` is `daily`) and keeps it, so it looks the same everywhere. Cached notes keep the tags they were synced with until they change, so after changing how tags are read, stop the cache, delete `apps/cache/data/` and sync again.

## Docker

The cache service and the web app are published as images (`ghcr.io/dannywieser/md-viz-cache` and `md-viz-web`, amd64). `deploy/docker-compose.yml` runs both behind one origin (the web container proxies `/api` to the cache); see [deploy/README.md](deploy/README.md) to install it with `wget` and to point the Electron app at it (`CACHE_URL=https://<host>/api`).

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
| `pnpm coverage`     | Tests with coverage, 95% minimum     |
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
packages/sync/  @md-viz/sync: loads notes from a source, syncs them to the cache and keeps the sync state (Node only, used by the Electron app, meant for a CLI too), see its README
demo/            Small committed set of markdown notes for trying and testing
```

Each workspace keeps its tests in a `tests/` folder beside `src/`, and every workspace must stay at 95% coverage (`pnpm coverage`). The web app, the Electron renderer and the UI package keep React components in `components/`, hooks in `hooks/` and other helpers in `lib/` (see `CLAUDE.md`). New apps go in `apps/*`, new shared packages in `packages/*`.

## Shared UI package

`@md-viz/ui` ships TypeScript source with no build step; each consuming Vite app compiles it. The theme (Solarized light CSS variables as the default, Space Mono, square edges, dot grid background) lives in `packages/ui/src/styles/globals.css`, and the nine themes the apps switch between (`ThemeSelect`, `useTheme`) in `packages/ui/src/lib/themes.ts`. `apps/design` is a design board that displays the theme tokens, shared components and the design guidelines (`/explorations` lists design explorations such as the page background, the loading, empty and error states and the sync app layout); it holds no tokens of its own.

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
