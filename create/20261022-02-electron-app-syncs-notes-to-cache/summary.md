# electron app syncs notes to cache

- **Slug:** 20261022-02-electron-app-syncs-notes-to-cache
- **Started:** 2026-10-22
- **Completed:** 2026-10-22

## Overview

The Electron app can now push the notes of a chosen folder to the note cache service. After picking a folder, a sync button reads the `.md` files in the main process, pushes new and changed ones to the cache and deletes cached notes whose file is gone. The web app's grid then shows them.

## What was done

- **Sync logic** (`apps/electron/src/main/sync.ts`): helpers `fetchCachedSyncTimes`, `collectLocalNotes`, `needsPush`, `pushBatch` and the `syncFolder` outline. Uses the generated `@md-viz/api-client/cache` SDK.
  - Note id: first 16 hex chars of SHA-256 of the relative path. Fields: `title` (file name without `.md`) and `body`; the cache stamps `synced`.
  - Changed = floored mtime newer than the cached `synced`. Upserts in batches of 200, deletes 20 at a time.
  - Cache URL from `CACHE_URL` (default `http://localhost:8787`).
- **Shared walker** (`walk.ts`): async generator over markdown files; `scan.ts` rebuilt on it.
- **IPC/UI**: new `syncFolder`/`syncProgress` channels and types in `shared/ipc.ts`, preload forwarding, a sync button with progress and result lines in `App.tsx`. The card now fills the window (16px margin) and the "hello, notes" title was removed.
- **Build/config**: `@md-viz/api-client` dependency, bundled into main via `externalizeDeps.exclude` in `electron.vite.config.ts`; `DOM` lib added to `tsconfig.node.json`.
- **Ports**: web app moved to 5175 (`strictPort`) so it can run beside the Electron renderer (5173); `dev:all` now includes Electron; `.claude/launch.json`, docs and one cache CORS test updated.
- **Tests**: `tests/main/sync.test.ts` (fake in-memory cache) and new cases in `tests/renderer/App.test.tsx`.

## Highlights

- The cache does not generate ids; the client chooses them, so a path hash was used. A rename is a delete plus a new note.
- Safety: sync fails before walking if the folder is unreadable, and nothing is deleted unless the cache listing and walk both succeeded.
- A flaky test exposed that `synced` is truncated to milliseconds while mtimes are not; the comparison floors the mtime.
- Verified against a real in-memory cache: demo/ synced 18 notes, then 18 unchanged.

## Deviations from the plan

- `DOM` lib in `tsconfig.node.json` (the generated client references `BodyInit`).
- Sync tests use a fake fetch rather than the real cache app (`.ts` import extensions do not typecheck in the Electron tsconfig).
- Added the unreadable-folder guard, the port change and the layout tweaks, which were not in the plan.
- `sync.ts` was refactored into helper functions after review.

## Not done / follow-ups

- Deletes are not scoped to a source; add a `source` field before Bear sync, or this will delete Bear notes.
- Electron window itself was not run during the session (logic and renderer covered by tests and a real-cache run).
- Nothing is committed.

## Harvest

- **CLAUDE.md**: intro mentions the Electron push; commands (`dev`, `dev:all`, `dev:electron`) reflect the new ports; new convention describing the sync flow, `CACHE_URL`, the bundling exclude and the `DOM` lib.
- **README.md**: Electron description and usage now include sync and `CACHE_URL`; port note updated.
