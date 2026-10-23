# Plan: electron app UX improvements

## Goal
The Electron app remembers the last folder and opens with it selected and scanned. For the selected folder it shows when the last sync completed, and it shows the notes of that sync in three `NoteGrid`s: updated, deleted and unchanged. The last sync's state is kept locally in a JSON file (it may become a history log in the DB later).

## Scope
In:
- Persist last folder, and per folder the completion time plus the id and title of every updated, deleted and unchanged note of the last sync.
- On launch: load the saved folder, select and scan it; if it no longer exists, fall back to the no-selection state.
- Show "last synced <time>" for the selected folder.
- Three grids (updated / deleted / unchanged) with counts, from the persisted last sync, shown after a sync and on relaunch.

Out:
- Coloring of the grids by status (later), a DB history log, per-source scoping in the cache.
- Failed (unreadable) files are not shown in any grid; they are still counted in the sync summary line.

## Technologies
- Existing stack only: Electron main (node `fs`), React renderer, `NoteGrid` from `@md-viz/ui`, Vitest. The state file is plain JSON in `app.getPath('userData')`; no new dependencies.

## Repository structure
```
apps/electron/
  src/main/state.ts          (new)
  src/main/sync.ts           (changed)
  src/main/ipc.ts            (changed)
  src/main/index.ts          (unchanged, or passes userData path via ipc.ts)
  src/shared/ipc.ts          (changed)
  src/preload/index.ts       (changed)
  src/renderer/src/App.tsx   (changed)
  src/renderer/src/SyncGrids.tsx (new)
  tests/main/state.test.ts   (new)
  tests/main/sync.test.ts    (changed)
  tests/renderer/App.test.tsx (changed)
CLAUDE.md                    (changed: describe the state file)
```

## Files
- `src/shared/ipc.ts`: add `NoteRef { id, title }`; `SyncResult` gains `notes: { updated, deleted, unchanged: NoteRef[] }` (counts stay); new `LastSync { folder, syncedAt (ISO string), notes }`; new channel `loadLast` and `Api.loadLast: () => Promise<{ folder: string; lastSync: LastSync | null } | null>`.
- `src/main/state.ts`: `readState(file)` / `writeState(file, state)` for `{ lastFolder, folders: { [path]: { syncedAt, notes } } }`; tolerant of a missing or corrupt file (returns empty state); write via temp file + rename.
- `src/main/sync.ts`: list cached notes with `fields: 'synced,title'` so deleted notes have titles; collect `NoteRef`s for updated (only the notes actually pushed, so failed files stay out), deleted and unchanged; return them in the result.
- `src/main/ipc.ts`: state file path from `app.getPath('userData')`; `pickFolder` saves `lastFolder`; `syncFolder` saves the result with `syncedAt = now` on completion; `loadLast` returns the saved folder only if it is still an existing directory, else null (and clears it).
- `src/preload/index.ts`: forward `loadLast`.
- `src/renderer/src/App.tsx`: on mount call `loadLast`, then reuse the choose-folder flow's scan; show last sync time; render `SyncGrids` from the sync result or the persisted last sync.
- `src/renderer/src/SyncGrids.tsx`: three titled cards, each with count and a `NoteGrid` (all notes color 0 for now, fixed height), lowercase text per the design guidelines.
- Tests: state read/write/corrupt file; sync returns correct note lists and omits failed files; App auto-selects and scans the saved folder, falls back when `loadLast` returns null, shows last sync time and three grids.
- `CLAUDE.md`: note the state file and `loadLast` in the Electron section.

## Steps
1. Shared types in `ipc.ts` (`NoteRef`, `notes` on `SyncResult`, `LastSync`, `loadLast`).
2. `sync.ts` returns per-note lists; update `sync.test.ts`.
3. `state.ts` with tests.
4. Wire `ipc.ts` and the preload: save on pick and on sync completion, `loadLast`.
5. Renderer: auto-select and scan on launch, last sync time.
6. `SyncGrids` and render it; update `App.test.tsx`.
7. `CLAUDE.md`, then `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`; run the app to check it by eye.

## Open questions / risks
- Large folders: persisting every note's id and title is fine for thousands of notes (a few hundred KB), but worth watching if folders reach 100k+.
- Cache `title` is read back from the cache for deleted notes; a note with no title falls back to its id.
- The `unchanged` list now needs titles for local notes (derived from the path, as the sync already does).
- Notes in the grids are not clickable or hoverable beyond `NoteGrid`'s built-in title tooltip.
