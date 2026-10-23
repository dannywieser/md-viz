# Plan: electron app syncs notes to cache

## Goal

After picking a folder, the Electron app gets a manual "sync" button. Sync reads the folder's `.md` files in main and pushes them to the note cache service: new and changed notes are upserted in batches, notes whose file is gone are deleted. The renderer shows progress and the final counts.

## Scope

In:

- A sync button in the renderer, enabled once a folder is picked.
- Main-process sync: walk the folder, read files, diff against the cache, upsert changed notes, delete vanished ones.
- Per note: `id` = first 16 hex chars of SHA-256 of the relative path (posix separators); fields `title` (basename without `.md`) and `body` (file contents). The cache stamps `synced` itself.
- Changed = file mtime newer than the cached `synced` (from `GET /notes?fields=synced`).
- Deletion of every cache note not found on disk.
- Cache URL from `CACHE_URL` in main (default `http://localhost:8787`), via the generated `@md-viz/api-client/cache` SDK.
- Batches of 200 notes per `PUT`.
- Progress events (`synced`, `deleted`, `total`) over IPC; result counts.

Out:

- Bear sync, file watching, auto-sync on pick.
- Scoping deletes to a `source` (added later with Bear).
- Content hashing, renames as moves, a UI field for the cache URL.
- Changing the cache service or its OpenAPI spec.

## Technologies

- Existing stack: TypeScript, Electron + electron-vite, React, Vitest.
- `@md-viz/api-client/cache` (generated SDK: `listNotes`, `upsertNotes`, `deleteNote`) as the project requires; no hand-written fetch.
- `node:crypto` for ids, `node:fs/promises` for reading.
- Reuse the walk rules of `scan.ts` (skip dot-dirs and `node_modules`, no symlinks, ignore unreadable dirs) by extracting a shared walker.

## Repository structure

```
apps/electron/
  package.json                    (+ @md-viz/api-client dep)
  electron.vite.config.ts         (bundle api-client into main)
  src/shared/ipc.ts               (+ sync channels and types)
  src/main/walk.ts                (new: shared markdown walker)
  src/main/scan.ts                (use walker)
  src/main/sync.ts                (new: sync logic)
  src/main/ipc.ts                 (+ sync handler)
  src/preload/index.ts            (+ forward sync)
  src/renderer/src/App.tsx        (+ sync button and status)
  tests/main/sync.test.ts         (new)
  tests/main/scan.test.ts         (still passes)
  tests/renderer/App.test.tsx     (+ sync cases)
CLAUDE.md                         (document sync + CACHE_URL)
```

## Files

- `apps/electron/package.json` - add `"@md-viz/api-client": "workspace:*"` dependency; run `pnpm install`.
- `apps/electron/electron.vite.config.ts` - exclude `@md-viz/api-client` from externalization so main bundles its TypeScript source (node cannot strip types inside `node_modules`).
- `apps/electron/src/shared/ipc.ts` - add `syncFolder` and `syncProgress` channels, `SyncProgress`, `SyncResult`, and `Api.syncFolder` / `Api.onSyncProgress` (function-typed properties).
- `apps/electron/src/main/walk.ts` - async generator yielding `{ absolutePath, relativePath, mtimeMs }` for `.md` files with the existing skip rules; also reports visited dirs.
- `apps/electron/src/main/scan.ts` - rebuild on the walker, behavior unchanged.
- `apps/electron/src/main/sync.ts` - `syncFolder(root, { baseUrl, onProgress })`: configure client, fetch `listNotes({ fields: 'synced' })`, walk the folder, compute ids, pick changed files, read bodies, upsert in batches of 200, delete cache ids not on disk, return `{ total, synced, deleted, unchanged }`.
- `apps/electron/src/main/ipc.ts` - handler for sync that validates the folder, reads `process.env.CACHE_URL`, and forwards progress.
- `apps/electron/src/preload/index.ts` - forward the new channels only.
- `apps/electron/src/renderer/src/App.tsx` - "sync" button (disabled while scanning or syncing), progress line, result line, errors in the existing alert.
- `apps/electron/tests/main/sync.test.ts` - temp folder plus a fake `fetch` (via `configureCacheClient`) or the real cache `app` with `:memory:` store.
- `apps/electron/tests/renderer/App.test.tsx` - sync button flow with a stubbed `window.api`.
- `CLAUDE.md` - note the sync flow and `CACHE_URL`.

## Steps

1. Add the `@md-viz/api-client` dependency and bundling config; `pnpm install`, `pnpm generate`; confirm `electron-vite build` bundles it.
2. Extract `walk.ts` and move `scan.ts` onto it; existing scan tests stay green.
3. Extend `shared/ipc.ts` with sync channels and types.
4. Implement `sync.ts` (id, change detection, batching, deletion) with unit tests in `tests/main/sync.test.ts`.
5. Wire `ipc.ts` and `preload/index.ts`.
6. Update the renderer: sync button, progress, result, error; add renderer tests.
7. Update `CLAUDE.md`; run `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
8. Manual check: `pnpm dev:cache`, `pnpm dev:electron`, sync `demo/`, confirm the notes in the web app grid, edit/delete a file and re-sync.

## Open questions / risks

- Bundling: electron-vite externalizes dependencies by default, and the api-client is TypeScript source. Step 1 verifies the exclude works in both dev and build.
- mtime vs `synced` compares the file clock to the cache's clock; fine on one machine. Clock skew or an edit with an older mtime is missed (accepted).
- A cache that is down gives a clear error in the UI and nothing is deleted: the list call must succeed before any delete.
- Unreadable files are skipped and counted so a bad file does not abort the sync.
- Deleting everything not on disk will remove notes from other sources once Bear exists; the `source` guard is deferred by decision.
- Large bodies in a batch of 200 may hit a request size limit; the cache has none configured, so check in the manual step.
