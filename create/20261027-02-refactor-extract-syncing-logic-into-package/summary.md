# Summary: refactor: extract syncing logic into package

- **Slug:** 20261027-02-refactor-extract-syncing-logic-into-package
- **Started:** 2026-10-27 08:04
- **Completed:** 2026-10-27
- **PR:** https://github.com/dannywieser/md-viz/pull/13

## Overview

The note-syncing logic that lived in Electron's main process now lives in a new Node-only workspace package, `@md-viz/sync` (`packages/sync`), so a CLI can reuse it later (the CLI itself is out of scope). Electron keeps only the window, the folder dialog, the IPC wiring and progress events. Behavior and the on-disk state format are unchanged.

## What was done

- **New package `packages/sync`** (TypeScript source, no build step, entry points `.` and the type-only `./types`, depends on `@md-viz/api-client`), with its own 95% coverage thresholds and a README documenting the API, every type, the sync workflow and its safety rules, the state file, adding a source and the layout.
- **Layout inside `src`:** `pipeline/` (`sync`, `notes`, `note-sets`; source-agnostic), `sources/file/` and `sources/bear/` (each an `index.ts` exporting one `SourceAdapter`, everything else private), `sources/index.ts` (registry: `sources`, `isSource`, `adapterOf`, `adapterFor`), plus `run.ts`, `target.ts`, `state.ts`, `types.ts`.
- **Orchestration moved out of `ipc.ts`:** `scanTarget`, `syncTarget`, `selectSource`, `loadLastSelection`, `rememberFolder`. The caller passes the cache URL and the state file path; the package never reads env for them.
- **Adapters own source knowledge:** `load`, `scan`, `parse`, `key`, `remember`, `restore`. `run.ts`, `state.ts` and `target.ts` no longer name a source (except `rememberFolder`, a file-only API, and the state defaults).
- **Types** (`Source`, `SyncTarget`, `FileTarget`, `BearTarget`, `Scan*`, `Sync*`, `NoteRef`, `LastSync`, `LastSelection`) are owned by the package; `apps/electron/src/shared/ipc.ts` re-exports them and keeps the channels and `Api`.
- **Electron:** `src/main/ipc.ts` is 48 lines of forwarding; the moved sources and tests are gone from `src/main`; `electron.vite.config.ts` bundles `@md-viz/sync`; `FolderCard` shows `'folder' in target ? target.folder : target.source` instead of naming Bear.
- **Lint:** `no-restricted-imports` stops code outside a source folder importing its private files (proved with a deliberate violation).
- **Docs:** `packages/sync/README.md`, `CLAUDE.md`, `README.md`, and this session's `plan.md` (two extensions for the source structure and adapter state).

## Highlights

- The CLI goal decided the scope: loaders, scan, state and orchestration all moved, not just `syncNotes`.
- A second `./types` entry exists because the renderer's tsconfig has no Node types and must not type-check the Node-only sources.
- The target-to-adapter correlation is not expressible in a TypeScript union, so one cast is confined to `adapterOf`.
- `lastFolder` stays a top-level state field (owned by the file adapter) and `LastSelection.folder` stays in the IPC contract, to avoid a state migration and an IPC change in a refactor.
- `run.test.ts` spies on the real adapters' `load`/`scan` and uses a real temp state file, rather than mocking the registry.

## Coverage

Fresh `pnpm coverage` run: exit 0, every workspace ran, thresholds 95% (lines, statements, branches, functions) unchanged.

| Workspace | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| apps/cache | 96.2 | 100 | 100 | 95.89 |
| apps/design | 99.39 | 100 | 98.9 | 99.35 |
| apps/electron | 100 | 100 | 100 | 100 |
| apps/web | 100 | 100 | 100 | 100 |
| packages/api-client | 100 | 100 | 100 | 100 |
| packages/sync | 100 | 97.59 | 100 | 100 |
| packages/ui | 99.61 | 98.7 | 100 | 100 |

## Deviations from the plan

- Steps 1 and 2 share a commit.
- The plan grew by three extensions agreed in the session: source folders and registry (steps 11-16), adapters owning parsing and state (17-19) and the `FolderCard` change (20).
- `assertDirectory` is internal to the file source, not exported from the package.

## Not done / follow-ups

- `pipeline/note-sets.ts` still checks `source !== 'file'` to skip `created-*` sets; making it an adapter property was offered and not taken yet.
- `walk.ts` has no test file of its own (covered through `scan.ts`), as before the move.
- `docker build` was not run (neither image depends on `packages/sync`; the lockfile has the new importer).
- A CLI and a default state file location for it.

## Harvest

- `CLAUDE.md`: added the `packages/sync` structure line and its internal layout; slimmed the Electron sync/state bullets to point at the package (cache URL passed by the caller, renderer imports types only through `@md-viz/sync/types`, the one source check left in note-sets).
- `README.md`: added `packages/sync` to the project structure.
