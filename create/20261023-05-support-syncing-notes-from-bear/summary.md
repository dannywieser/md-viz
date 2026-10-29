# Summary: support syncing notes from Bear

- **Slug:** 20261023-05-support-syncing-notes-from-bear
- **Started:** 2026.10.23 19:01
- **Completed:** 2026.10.23 19:59
- **PR:** [dannywieser/md-viz#7](https://github.com/dannywieser/md-viz/pull/7)

## Overview
The Electron app can now sync notes from Bear as well as from a folder. A new themed `Select` in the header picks the source (`file` / `bear`); the folder button only shows for `file`, and the Bear note count shows as soon as Bear is chosen. Both sources are loaders returning the same `Note[]`, and one source-agnostic pipeline pushes them to the cache, so the file source can gain tags and frontmatter later without a second code path.

## What was done
- **Select (`packages/ui`)**: shadcn `Select` (`select.tsx`, exported, shown on the design board, tested), restyled to the theme: 2px orange border, no shadow, same 36px height as a button, thick black focus ring; popup with black 2px border and hard shadow. New "inputs and focus" guideline. `eslint.config.js` lets `select.tsx` hold several components like `card.tsx`.
- **Note model (`apps/electron/src/main`)**: `notes.ts` (`Note`: id, source, title, body, tags, created, modified; `noteToFields`, tags as a JSON array string).
- **Loaders**: `load-file-notes.ts` (folder walk, mtime as `modified`, readdir guard) and `load-bear-notes.ts` + `bearcli.ts` (Bear's own CLI, trashed and locked skipped, archived kept, `#` stripped from tags), `scan-bear.ts` for the count. Both return `{ notes, failed: string[] }`.
- **Pipeline**: `sync.ts` is now `syncNotes(source, loaded, options)`: diffs `modified` vs the cached `synced`, upserts in batches of 200, deletes only cached notes of the same `source`, never touches notes that failed to read or have no `source`.
- **IPC and state**: `shared/ipc.ts` (`Source`, `SyncTarget`, `LastSelection`, `scan`/`sync`/`selectSource`/`loadLast`, `ScanResult.count`), validated targets in `ipc.ts`, `state.ts` keeps `lastSource` and a last sync per `syncKey` (`bear`, `file:<folder>`), preload follows.
- **Renderer**: `source-select.tsx`, `FolderCard` takes a target, `useScan`/`useSync` work on a target, `App` opens a saved selection (Bear is scanned at once).
- **Docs**: `CLAUDE.md`, `README.md`, `apps/cache/README.md`.

## Highlights
- `bearcli list -l all --format json --fields all,content` returns the whole library (4,845 notes) in about 2 seconds, so the CLI replaced the direct SQLite read that was first proposed (stable interface, locked notes and tags handled by Bear).
- One path for every source was a stated requirement: loaders only produce `Note[]`; the pipeline never branches on source.
- `LoadedNotes.failed` became a list of ids (not a count) so a note that could not be read is neither pushed nor deleted from the cache.
- A real run against the library caught a bug the mocked tests could not: the Bear count omitted `location`, so the trash filter did nothing (4,874 vs 4,845). Fixed and noted in `listBearRows`.
- Select styling went through three rounds with the user: heavy border and shadow, then an offset orange focus ring, then the final flat orange border with the black focus ring and button height.
- The PR was cut from the fix branch; when that fix was squash-merged, the merge with `main` conflicted on identical content and was resolved by taking this branch's side (trees were byte-identical).

## Coverage
Fresh `pnpm coverage` run, exit 0, threshold 95% (configs untouched).

| workspace | tests | statements | branches | functions | lines |
|---|---|---|---|---|---|
| apps/cache | 34 | 100% | 100% | 100% | 100% |
| apps/design | 82 | 99.39% | 100% | 98.9% | 99.35% |
| apps/electron | 137 | 100% | 98.78% | 100% | 100% |
| apps/web | 12 | 100% | 100% | 100% | 100% |
| packages/api-client | 6 | 100% | 100% | 100% | 100% |
| packages/ui | 112 | 99.59% | 98.66% | 100% | 100% |

## Deviations from the plan
- Extra file `bearcli.ts` (shared by the Bear loader and count).
- `LoadedNotes.failed` is `string[]`, not a number (see Highlights).
- The `Api`/channel change and a minimal renderer adaptation moved into step 6 so typecheck stayed green; the select UI stayed in step 7.
- `ScanResult.mdCount` renamed `count`; new "inputs and focus" design guideline; `eslint.config.js` and `tests/setup.ts` (jsdom polyfills for the radix select) changed.
- A file that fails to `stat` now counts as failed (it used to be skipped silently).
- The manual check (step 10) was an isolated end-to-end against a throwaway cache with the real loaders, not a click-through of the Electron window.

## Not done / follow-ups
- Click-through of the Electron app (select in the draggable header, scan and sync progress) and the select in dark mode are unchecked.
- The cache must be wiped before the first sync (no migration; notes without `source` are ignored).
- File source: tags, frontmatter and created dates (the loader leaves them empty).
- Contrast: highlighted-item text (4.27) and dark option text (4.11) are slightly under 4.5; a theme-level fix of the primary pair would cover buttons too.
- Buttons still use a black focus ring only; fine now that the select matches them.

## Harvest
- `CLAUDE.md`: intro line, Electron renderer, Electron sync (loaders and pipeline), Electron state, `apps/cache` field list, and a pointer from the shadcn bullet to the "inputs and focus" guideline.
- `README.md`: the Electron app description and usage paragraph now cover the Bear source and per-source deletions.
- `apps/cache/README.md`: lists the fields the sync writes and what `source` scopes.
- `apps/design/src/sections/guidelines.tsx`: "inputs and focus" guideline.
