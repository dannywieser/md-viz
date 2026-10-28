# @md-viz/sync

Loads markdown notes from a source (a folder of `.md` files or the Bear app), pushes them to the note cache and remembers what it did. It is the whole "get my notes into the cache" workflow, with no UI: the Electron app drives it today and a CLI can drive it later.

- Node only (`node:fs`, `node:child_process`); no `electron`, no DOM.
- TypeScript source, no build step (like `@md-viz/ui` and `@md-viz/api-client`). A bundler that consumes it has to bundle it (`electron.vite.config.ts` does).
- Talks to the cache through the generated `@md-viz/api-client/cache` SDK. A script that runs the package directly needs `pnpm generate` once; the root scripts do it.
- Knows nothing about its caller: the cache URL and the state file path are always passed in, and progress comes back through callbacks. It never reads `CACHE_URL`.

## Entry points

| import               | what it is                                                   |
| -------------------- | ------------------------------------------------------------ |
| `@md-viz/sync`       | the functions below and every type                           |
| `@md-viz/sync/types` | the types only, with no Node imports; use it in browser code |

The renderer of the Electron app type-checks without Node types, so it must import `@md-viz/sync/types`, never the main entry.

## API

Every function that takes a `target` or `source` validates it first (the caller is usually an IPC boundary or a CLI argument parser), and throws `expected a source`, `expected an absolute folder path` or `not a directory` when it is wrong.

| function                                                   | does                                                                                          |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `scanTarget(target, onProgress?)`                          | counts the notes of a target without syncing; resolves to `ScanResult`                        |
| `syncTarget(target, { stateFile, cacheUrl, onProgress? })` | loads the target's notes, syncs them to the cache, records the sync; resolves to `SyncResult` |
| `selectSource(source, stateFile)`                          | remembers the selected source; resolves to its `LastSelection`                                |
| `loadLastSelection(stateFile)`                             | the `LastSelection` of the previous run                                                       |
| `rememberFolder(stateFile, folder)`                        | remembers a picked folder as the file source's folder                                         |
| `parseTarget(input)` / `parseSource(input)`                | the validation the functions above run on their input                                         |
| `DEFAULT_CACHE_URL`                                        | `http://localhost:8787`, for a caller that has no better value                                |

```ts
import { scanTarget, syncTarget } from '@md-viz/sync'

const target = { source: 'file', folder: '/Users/me/notes' }
const { count } = await scanTarget(target)
const result = await syncTarget(target, {
  stateFile: '/Users/me/.md-viz/state.json',
  cacheUrl: process.env.CACHE_URL ?? 'http://localhost:8787',
  onProgress: ({ synced, deleted, total }) => console.log(synced + deleted, '/', total),
})
console.log(`${result.synced} pushed, ${result.deleted} deleted, ${result.unchanged} unchanged`)
```

## Types

All of them are in `src/types.ts`.

| type            | shape and meaning                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Source`        | `'file' \| 'bear'`: where notes come from                                                                                            |
| `SyncTarget`    | `{ source: 'file'; folder: string } \| { source: 'bear' }`: what a scan or sync runs on; a file source needs its folder              |
| `ScanProgress`  | `{ dirs, mdFiles }`: directories visited and markdown files found so far                                                             |
| `ScanResult`    | `{ count }`: markdown files, or Bear notes that are neither trashed nor locked                                                       |
| `SyncProgress`  | `{ synced, deleted, total }`: notes pushed and deleted so far, and how many there will be in this sync                               |
| `TagColors`     | `Record<string, number>`: the colour index of each tag, into the UI's note palette                                                   |
| `NoteRef`       | `{ id, title, tags }`: a note named in a result, with its tags                                                                       |
| `SyncNotes`     | `{ updated, deleted, unchanged }`, each a `NoteRef[]`: what happened to each note; unreadable notes are in none of them              |
| `SyncResult`    | `{ scanned, synced, unchanged, deleted, failed, notes, tagColors }`: counts, the `SyncNotes` behind them and the colour of every tag |
| `LastSync`      | `{ syncedAt, notes, tagColors }`: the last completed sync of a target (`syncedAt` is an ISO timestamp)                               |
| `LastSelection` | `{ source, folder, lastSync }`: a source with the folder chosen for it (null for Bear, or when the folder is gone) and its last sync |

`Note` is the one internal shape the pipeline works with, so it is not part of the public API:

```ts
interface Note {
  id: string // the cache id, unique across sources
  source: Source
  title: string
  body: string
  tags: string[]
  created: string // ISO timestamp; '' when the source does not know
  modified: string // ISO timestamp
}
```

`noteToFields` turns it into the cache's string fields: `title`, `body`, `tags` (a JSON array string), `created`, `modified` and `source`.

## Workflow

`syncTarget` runs these stages in order. Everything is source-agnostic after stage 2.

1. **Validate** the target (`parseTarget`).
2. **Load** the notes with the source's loader, which returns `{ notes: Note[], failed: string[] }`. `failed` are the ids of notes that exist but could not be read.
   - File (`sources/file/load.ts`): walks the folder for `.md` files (dot-directories and `node_modules` are skipped, symlinks are not followed). The id is the first 16 hex characters of the SHA-256 of the path relative to the folder, the title is the file name without `.md`, `modified` is the mtime, there are no tags and `created` is empty. It fails when the folder cannot be read, so an unreadable folder cannot look empty and wipe its notes from the cache.
   - Bear (`sources/bear/load.ts`, `sources/bear/bearcli.ts`): runs Bear's own `bearcli list -l all --format json --fields all,content` (macOS only; `BEAR_CLI` overrides the path `/Applications/Bear.app/Contents/MacOS/bearcli`). The id is Bear's note id, tags lose the leading `#`, trashed and locked notes are skipped and archived ones are kept.
3. **List the cache** (`syncNotes` in `pipeline/sync.ts`): the cached notes whose `source` is this source, with their `synced` time, title and tags, and the colour the cache has for each tag. If this fails, nothing has been changed yet.
4. **Diff**: a note needs pushing when the cache has never seen it or its `modified` is newer than the cached `synced` (the cache stamps `synced` itself). Cached notes of this source that are neither loaded nor in `failed` are gone.
5. **Give the new tags a colour** (`pipeline/tag-colors.ts`): the tags of all loaded notes (changed or not) that have no colour in the cache each take the palette colour the fewest tags use so far, the lowest on a tie, in alphabetical order, and are added to the cache with `addTagColors` before any note is pushed. A tag that has a colour keeps it, so colours are the same on every sync and in every app; there are 24 hue colours (`TAG_COLOR_COUNT`, `HUE_COLORS` in `@md-viz/ui`) and past that colours are used again. The grey after them is for notes without tags and is never given to a tag.
6. **Push** the new and changed notes with `upsertNotes`, 200 per request, reporting progress after each batch.
7. **Delete** the gone notes, 20 requests at a time, reporting progress after each group.
8. **Replace the automatic sets** (`pipeline/note-sets.ts`) of the source, on every sync, even when no note changed, because they move with the clock: `<source>:created-today`, `<source>:modified-today`, `<source>:created-last-30-days` and `<source>:modified-last-30-days`. Today is the local calendar day and the last 30 days are a rolling 30 x 24 hours, both on the PC's clock. The file source has no `created` sets. A set with no members is still replaced.
9. **Record** the sync in the state file (`syncTarget` only, and only when stages 2-8 succeeded), with the tags of its notes and the colour of every tag, so a UI can draw the last sync without asking the cache.

Safety rules the stages keep:

- Notes in `failed` are neither pushed nor deleted.
- A failed load or a failed cache listing deletes nothing and records nothing.
- Cached notes with no `source` (or another source) are never deleted.
- Syncing one source never touches another source's notes or sets.
- Tag colours are added before notes are pushed, never changed, and a failed colour listing changes nothing.

## State file

A JSON file at the path the caller passes (Electron uses `state.json` in its `userData` folder). It is kept local on purpose and may become a history log in the cache DB. It is written through a temporary file and renamed, so a crash cannot leave it half-written; a missing or unreadable file reads as an empty state.

```jsonc
{
  "lastSource": "file", // the source selected when it was last used
  "lastFolder": "/Users/me/notes", // the folder last chosen for the file source
  "syncs": {
    // the last completed sync per key: "bear", or "file:<folder>"
    "file:/Users/me/notes": {
      "syncedAt": "2026-10-27T15:04:05.000Z",
      "notes": {
        "updated": [{ "id": "a1b2", "title": "plan", "tags": ["work", "q4"] }],
        "deleted": [],
        "unchanged": [],
      },
      "tagColors": { "work": 3, "q4": 11 },
    },
  },
}
```

`loadLastSelection` and `selectSource` turn it into a `LastSelection` through the source's `restore` and `key`: for files the folder is returned only if it still exists and the `lastSync` is the one stored under that folder's key; for Bear it is the one `bear` entry. A state file saved before tags were kept still reads: its notes get `tags: []` and its syncs `tagColors: {}`, and entries that are not readable are dropped. `lastFolder` is a top-level field for compatibility with saved files; the file source owns it (`remember` writes it, `restore` reads it).

## Sources: public and private

Each source has its own folder under `src/sources/`. Its `index.ts` is the only public file: it exports one `SourceAdapter` (`fileSource`, `bearSource`) with two functions of the same shape for every source, and everything else in the folder is private.

```ts
interface SourceAdapter<T extends SyncTarget> {
  load: (target: T) => Promise<LoadedNotes> // read the notes; fails if the source cannot be read at all
  scan: (target: T, onProgress?) => Promise<ScanResult> // count them, without reading them all
  parse: (input: Record<string, unknown>) => Promise<T> // validate a raw target that names this source
  key: (target: T) => string // the key of the target's last sync in the state file
  remember: (state: AppState, target: T) => void // what the state keeps to bring the target back
  restore: (state: AppState) => Promise<T | null> // the remembered target, if there is one and it is still valid
}
```

`src/sources/index.ts` is the registry: `sources` maps each `Source` to its adapter (a `Source` without an entry does not type-check) and `adapterOf(source)` / `adapterFor(target)` pick the adapter and `isSource` checks a name, so `run.ts`, `state.ts` and `target.ts` never name a source (`parseTarget` asks the named source to `parse` the rest of the input; `syncTarget` and `selectSource` use `key`, `remember` and `restore`). ESLint (`no-restricted-imports`) stops code outside a source folder from importing its private files; tests may import the files of their own folder.

## Adding a source

1. Add the value to `Source` in `types.ts`, and its target type (like `FileTarget`) to `SyncTarget`.
2. Create `src/sources/<name>/` with `load.ts` (returns `LoadedNotes`, filling as many `Note` fields as the source knows), `scan.ts` (the count), any other private helpers and an `index.ts` exporting the adapter (`load`, `scan`, `parse`, `key`, `remember`, `restore`).
3. Add the adapter to `sources` in `src/sources/index.ts`.
4. Add tests under `tests/sources/<name>/`, one file per source file.

`run.ts`, `state.ts`, `target.ts` and the pipeline need no change, except one thing: the automatic sets skip `created-*` for a source that cannot tell when a note was created, and that rule is still a source check in `pipeline/note-sets.ts`. A source that learns to read more (the file source will get tags and frontmatter) only fills more `Note` fields.

## Layout

```
src/
  index.ts              public API of the package
  types.ts              all shared types (no Node imports)
  run.ts                scanTarget, syncTarget, selectSource, loadLastSelection, rememberFolder
  target.ts             validation of targets, sources and folders
  state.ts              the state file (knows no source)
  pipeline/             source-agnostic: knows only `Note`
    sync.ts             syncNotes: the cache pipeline, DEFAULT_CACHE_URL
    notes.ts            Note, noteToFields
    note-sets.ts        buildNoteSets
  sources/
    types.ts            LoadedNotes, SourceAdapter
    index.ts            the registry: sources, adapterFor
    file/
      index.ts          PUBLIC: fileSource
      folder.ts         assertDirectory
      load.ts           reads the files as notes
      scan.ts           counts the markdown files
      walk.ts           markdown file walker
      note-id.ts        noteId, noteTitle
    bear/
      index.ts          PUBLIC: bearSource
      load.ts           reads the Bear notes
      scan.ts           counts the Bear notes
      bearcli.ts        runs bearcli
tests/                  one test file per source file, mirroring src/
```
