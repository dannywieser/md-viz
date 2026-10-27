# Plan: extract syncing logic into a package

## Goal

Move everything that loads notes from a source, syncs them to the cache and remembers what was synced out of `apps/electron/src/main` into a new Node-only workspace package, `@md-viz/sync`, so a CLI can reuse it later. Electron's main process is left with the Electron-only parts (windows, dialogs, IPC channels, sending progress events) and forwards the rest to the package. A solid package README documents the types and the workflow. Pure move: behavior is identical.

## Scope

In:

- New `packages/sync` (`@md-viz/sync`), TypeScript source, no build step, Node-only (no `electron`, no DOM use), depends on `@md-viz/api-client`.
- Moved into it: `Note`/`noteToFields`, `buildNoteSets`, `syncNotes`, the file and Bear loaders (`bearcli`, `walk`), `scan` / `scan-bear`, the state file (`state.ts`) and the orchestration now in `ipc.ts` (target and source validation, choosing the loader, running the sync, recording the state, building the last selection).
- The package owns the types: `Source`, `SyncTarget`, `ScanProgress`, `ScanResult`, `SyncProgress`, `NoteRef`, `SyncNotes`, `SyncResult`, `LastSync`, `LastSelection`. `shared/ipc.ts` keeps the channel names and `Api` and re-exports the types.
- The caller passes the cache URL and the state file path; the package never reads env for them (it exports `DEFAULT_CACHE_URL`). `BEAR_CLI` stays an env override inside `bearcli.ts`, as it is today.
- Tests move with the code; the package gets its own 95% thresholds.
- `packages/sync/README.md`: the types and the workflow.
- `CLAUDE.md` updates (structure, Electron sync/state bullets, package layout).

Out:

- The CLI itself, a default state file location for a CLI, any behavior change.
- Anything else in `ipc.ts` that is Electron-only (folder dialog, `webContents.send`); whether more should move is reviewed once the result is in (open question C from the discussion).

## Technologies

- TypeScript source package like `packages/ui` and `packages/api-client` (exports `.ts`, no build), Vitest in the `node` environment, v8 coverage.
- Electron's `electron-vite` bundles it into main (`externalizeDeps.exclude`), as it already does for `@md-viz/api-client`.

## Repository structure

```
packages/sync/
  package.json            @md-viz/sync, exports "." and "./types"
  tsconfig.json
  vitest.config.ts
  README.md
  src/
    index.ts              the public API (re-exports)
    types.ts              all shared types; no node imports (the renderer type-checks it)
    notes.ts              Note, noteToFields
    note-sets.ts          buildNoteSets
    sync.ts               syncNotes, DEFAULT_CACHE_URL
    bearcli.ts            runBearcli, listBearRows
    load-bear-notes.ts
    load-file-notes.ts    LoadedNotes
    walk.ts
    scan.ts               scanMarkdown
    scan-bear.ts
    state.ts              AppState, read/write/updateState, syncKey
    target.ts             parseTarget, parseSource (validation of untrusted input)
    run.ts                scanTarget, syncTarget, selectSource, loadLastSelection, rememberFolder
  tests/                  mirrors src/ (moved from apps/electron/tests/main, plus target/run)
```

`./types` is a second entry so the Electron renderer (`tsconfig.web.json`, no node types) can import the types without type-checking the node-only sources.

## Files

Create (new package): everything under `packages/sync` above. Most source files are `git mv`s from `apps/electron/src/main` with their imports of `../shared/ipc` changed to `./types`.

Modify:

- `apps/electron/src/main/ipc.ts` - shrinks to: pick-folder dialog, wiring each channel to a `@md-viz/sync` function, sending progress events, passing `CACHE_URL` and the `userData` state path.
- `apps/electron/src/shared/ipc.ts` - types removed, re-exported (`export type`) from `@md-viz/sync/types`; channels and `Api` stay.
- `apps/electron/package.json` - add `@md-viz/sync` dependency.
- `apps/electron/electron.vite.config.ts` - add `@md-viz/sync` to `externalizeDeps.exclude`.
- `apps/electron/tests/main/ipc.test.ts` - rewritten around the thin handlers, mocking `@md-viz/sync` at the boundary.
- `apps/electron/vitest.config.ts` / `tsconfig.node.json` - only if the moved files left stale paths.
- `CLAUDE.md` - document the package and slim the Electron bullets.
- `pnpm-lock.yaml` - workspace link.

Delete from `apps/electron`: the moved sources in `src/main` and their tests in `tests/main` (`shared-ipc.test.ts` stays).

## Steps

1. Create the package skeleton (`package.json`, `tsconfig.json`, `vitest.config.ts`, empty `src/index.ts`), run `pnpm install`, check that root `typecheck`/`coverage` pick it up.
2. Move the types into `packages/sync/src/types.ts`; make `shared/ipc.ts` re-export them; add the dependency and the `electron.vite.config.ts` exclude. Electron typecheck and tests still pass.
3. `git mv` the leaf modules with their tests: `notes`, `note-sets`, `walk`, `scan`, `scan-bear`, `bearcli`, `load-file-notes`, `load-bear-notes`, `state`, `sync`; fix imports; export from `index.ts`; update Electron's `ipc.ts` imports. Tests, typecheck and lint pass.
4. Add `target.ts` (`parseTarget`, `parseSource`, moved from `ipc.ts`) with unit tests.
5. Add `run.ts` (`scanTarget`, `syncTarget`, `selectSource`, `loadLastSelection`, `rememberFolder`, the logic moved from `ipc.ts` and unchanged in behavior) with unit tests mirroring the old `ipc.test.ts` cases for them.
6. Slim `apps/electron/src/main/ipc.ts` to forwarding and rewrite `tests/main/ipc.test.ts` for it.
7. Write `packages/sync/README.md`: purpose and non-goals; the public API; every type with its meaning; the workflow (target -> load -> diff against the cache by `synced` vs `modified` -> batched upserts -> deletes of vanished notes of the same source -> automatic sets replaced -> state recorded), including the rules that keep it safe (failed notes are neither pushed nor deleted, a failed load or cache listing deletes nothing, notes without `source` are never deleted, the loaders' id scheme); state file format and keys; how a new source or a CLI plugs in; the env the caller supplies (`CACHE_URL`, `BEAR_CLI`); a short usage example.
8. Update `CLAUDE.md` (Structure, the Electron sync/state/IPC bullets pointing to the package, the `.dockerignore` note if needed).
9. Review what the Electron side looks like now and list candidates for moving more (answers open question C; no further moves without the user's go-ahead).
10. Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, then `pnpm coverage` and bring every workspace to at least 95% (lines, statements, branches, functions). Confirm `docker build` contexts are unaffected (`.dockerignore`).

Each step that adds or changes source has its unit tests in the same step; per the testing convention, one test file per source file in `tests/`, mocking only at boundaries (`node:fs/promises` for failure paths, the SDK, `bearcli`'s `execFile`).

## Open questions / risks

- The renderer's `tsconfig.web.json` has no node types, so the renderer must only ever import `@md-viz/sync/types`; step 2 verifies it.
- `node:sqlite`/Node versions are not involved, but the package uses the generated cache client, so a workspace script that runs it directly needs `pnpm generate` once (the root scripts do it). The README says so.
- `run.ts` has to stay free of `electron` and of `webContents`: progress goes through callbacks only.
- The Docker images do not include `apps/electron`; `packages/sync` is not needed by either image. Step 10 checks that `.dockerignore` and the Dockerfiles need no change.
- What else should move after the Electron side is thin is deliberately left for step 9.

## Extension: structure inside `packages/sync/src` (steps 11-16)

Added after steps 1-10 were implemented. It supersedes the flat layout in "Repository structure" above.

### Goal

Give each source its own folder with an obvious public/private split, group the source-agnostic pipeline, and let `run.ts` stop branching on the source.

### Target layout

```
src/
  index.ts                public API of the package
  types.ts                shared types (+ FileTarget, BearTarget)
  run.ts                  orchestration; no per-source branches
  target.ts               validation (still names the sources)
  state.ts
  pipeline/               source-agnostic: knows only `Note`
    sync.ts  notes.ts  note-sets.ts
  sources/
    types.ts              LoadedNotes, SourceAdapter<T>
    index.ts              registry `sources` + adapterFor(target)
    file/
      index.ts            PUBLIC: fileSource { load, scan }
      load.ts  scan.ts  walk.ts  note-id.ts      (private)
    bear/
      index.ts            PUBLIC: bearSource { load, scan }
      load.ts  scan.ts  bearcli.ts               (private)
tests/                    mirrors src/ (tests/pipeline, tests/sources/file, tests/sources/bear)
```

Public vs private: a source folder's `index.ts` exports one adapter (`load` and `scan` with the same shape for every source) and nothing else; every other file in the folder is private. ESLint (`no-restricted-imports`) forbids importing those private files from outside the folder. Tests may import private files of their own folder.

### Steps

11. Move the files with `git mv` into `pipeline/` and `sources/{file,bear}/` (renaming `load-file-notes` to `file/load`, `scan-bear` to `bear/scan`, `noteId`/`noteTitle` into `file/note-id.ts`, and so on), move the tests to mirror them, fix imports. No behavior change.
12. Add `sources/types.ts` (`LoadedNotes`, `SourceAdapter<T>`), `FileTarget`/`BearTarget` in `types.ts`, and the `file/index.ts` and `bear/index.ts` adapters, each with a test.
13. Add the registry `sources/index.ts` (`adapterFor`); `run.ts` uses it for `scanTarget` and `syncTarget`; update `run.test.ts`; test the registry.
14. Add the ESLint rule against deep imports into a source folder and confirm it fails on a deliberate violation.
15. Update the README (layout, "Adding a source": a folder with an adapter, one registry line, the `Source` value and `parseTarget`) and `CLAUDE.md`.
16. Run `pnpm format`, `pnpm lint`, `pnpm typecheck` and `pnpm coverage`; every workspace at or above 95%.

### Risks

- Correlating a target with its adapter in a union is not expressible in TypeScript without one cast; it is confined to `adapterFor` with a comment.
- `no-restricted-imports` only sees import strings, so it guards `src` outside `sources/`; tests are exempt on purpose.

### Extension 2: sources own their state and target parsing (steps 17-19)

`run.ts`, `state.ts` and `target.ts` still named the sources (`selectionOf`, `lastFolder`, `syncKey`, `parseTarget`). The adapter takes that over:

```ts
interface SourceAdapter<T extends SyncTarget> {
  load, scan,
  parse:    (input: Record<string, unknown>) => Promise<T>   // validate a raw target of this source
  key:      (target: T) => string                            // the state key of the last sync
  remember: (state: AppState, target: T) => void             // what the state keeps of a target
  restore:  (state: AppState) => Promise<T | null>           // the target to show again, if still valid
}
```

Behavior and the on-disk state format stay identical (`lastFolder` stays a top-level field, now owned by the file adapter; `LastSelection.folder` stays because it is part of the IPC contract).

17. Extend `SourceAdapter` with `parse`, `key`, `remember`, `restore`; implement them in `file/` (with `assertDirectory` moving to a private `file/folder.ts`) and `bear/`; tests per adapter, including the `syncKey` cases that move out of `state.test.ts`.
18. Registry: `adapterOf(source)`, `isSource`; `parseTarget`/`parseSource` dispatch through it; `state.ts` validates `lastSource` with `isSource` and drops `syncKey`; `run.ts` (`selectionOf`, `syncTarget`, `rememberFolder`) uses `restore`/`remember`/`key` with no source names; update those tests.
19. README ("Adding a source" lists the six members, state section) and `CLAUDE.md`; run format, lint, typecheck and `pnpm coverage`.
