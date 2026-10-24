# Plan: support syncing notes from Bear

## Goal
Let the Electron app sync notes from Bear as well as from a folder. Both sources are loaders that return the same `Note[]`; one source-agnostic pipeline diffs them against the cache, pushes changes and deletes missing notes, scoped to that source. A new `Select` UI component picks the source (`file` / `bear`); the folder picker shows only for `file`.

## Scope
In:
- `Note` type (`id`, `source`, `title`, `body`, `tags`, `created`, `modified`) and two loaders: `loadFileNotes(root)` and `loadBearNotes()`.
- One pipeline `syncNotes(source, notes, options)` that never branches on source.
- Bear loader via `bearcli list -l all --format json --fields all,content`; drops `location: trash` and `locked: yes`. Bear note id is the cache id.
- Cache fields (all strings): `title`, `body`, `tags` (JSON array string), `created`, `modified`, `source` (`file`|`bear`). `synced` is still stamped by the cache.
- Deletions scoped by `source`; the pipeline lists cached notes with fields `synced,title,source`.
- Change detection for both sources: `modified` newer than cached `synced`.
- `Select` in `packages/ui` (shadcn, via radix-ui already a dependency), exported, shown on the design board, guideline noted if needed.
- Source choice in the Electron renderer; Bear count shown when Bear is selected (`bearcli list -l all` count minus trash/locked).
- `state.json` keeps the last source and a last sync per source (Bear has one key, files one per folder).
- `apps/cache/README.md` and `CLAUDE.md` updated for the new fields and the source split.

Out:
- Images/attachments, Bear write-back, tags/frontmatter/created for file notes (file loader gives `tags: []`, `modified` = mtime, `created` = empty string; a later change fills them without touching the pipeline).
- Cache migration (the cache is wiped), cache schema/OpenAPI changes (fields are free-form), the web app.
- Reading Bear's SQLite directly (kept as a fallback idea only).

## Technologies
TypeScript/Node; `node:child_process` `execFile` for `bearcli` (macOS only, `BEAR_CLI` env overrides the path `/Applications/Bear.app/Contents/MacOS/bearcli`); shadcn `Select` over `radix-ui` (already in `packages/ui`); the existing generated cache SDK; Vitest + Testing Library.

## Repository structure
```
apps/electron/src/
  shared/ipc.ts              (changed)
  main/
    notes.ts                 (new: Note type, noteToFields)
    load-file-notes.ts       (new)
    load-bear-notes.ts       (new)
    sync.ts                  (rewritten: syncNotes pipeline)
    scan.ts                  (kept: folder count)
    scan-bear.ts             (new: bear count)
    ipc.ts, state.ts         (changed)
  renderer/src/
    app.tsx                  (changed)
    components/source-select.tsx (new)
    components/folder-card.tsx   (changed -> shows source/folder)
    hooks/use-scan.ts, use-sync.ts (changed)
packages/ui/src/components/select.tsx (new)
apps/design/src/sections/components.tsx (changed)
```

## Files
- `packages/ui/src/components/select.tsx` - shadcn Select (added with the CLI), styled to the guidelines; export from `packages/ui/src/index.ts`; show on the design board.
- `apps/electron/src/shared/ipc.ts` - `Source = 'file' | 'bear'`; channels take a source (`scan`, `sync`); `LastSelection { source, folder, lastSync }`; `Api` updated.
- `apps/electron/src/main/notes.ts` - `Note` interface, `noteToFields(note)`, `fileNoteId(relativePath)` kept from today.
- `apps/electron/src/main/load-file-notes.ts` - walks the folder, reads each file, returns `Note[]` with `source: 'file'`; unreadable files are returned as a failed count.
- `apps/electron/src/main/load-bear-notes.ts` - runs `bearcli`, parses JSON, filters trash and locked, returns `Note[]` with `source: 'bear'`; a clear error when `bearcli` is missing or fails.
- `apps/electron/src/main/sync.ts` - `syncNotes(source, notes, options)`: list cached `synced,title,source`, diff by `modified` vs `synced`, upsert in batches, delete cached notes of that `source` that are not in `notes`; the existing "never delete if listing or loading failed" guard stays; returns `SyncResult`.
- `apps/electron/src/main/scan-bear.ts` - Bear note count (excluding trash and locked) via `bearcli`.
- `apps/electron/src/main/ipc.ts`, `state.ts` - handlers take a source; state holds `lastSource`, `lastFolder` and `syncs` keyed `file:<folder>` / `bear`.
- Renderer: `source-select.tsx` (uses `Select`), `app.tsx` (source state; folder button only for `file`; scans Bear on select), `folder-card.tsx` (shows "bear" instead of a path), hooks take the source.
- Docs: `CLAUDE.md` (Electron sync + state paragraphs), `apps/cache/README.md` (field list).

## Steps
1. Add `Select` to `packages/ui` with the shadcn CLI, export it, add it to the design board; test it (`packages/ui/tests/components/select.test.tsx`).
2. Define `Note`, `noteToFields` and the IPC types (`Source`, source-aware channels, `LastSelection`); test `notes.ts` and `shared/ipc`.
3. Write `load-file-notes.ts` (from today's walk/stat/read code) with tests, including unreadable files.
4. Write `load-bear-notes.ts` and `scan-bear.ts` with tests that mock `node:child_process` (trash/locked filtered, tags, bad JSON, missing CLI).
5. Rewrite `sync.ts` as the source-agnostic `syncNotes` and port the existing sync tests; add tests that a file sync does not delete Bear notes and the reverse.
6. Update `ipc.ts` and `state.ts` for sources and per-source state; tests for both.
7. Renderer: `source-select.tsx`, `app.tsx`, `folder-card.tsx`, hooks; tests per file, `app.test.tsx` only composition.
8. Update `CLAUDE.md` and `apps/cache/README.md`; run `pnpm format`, `pnpm lint`, `pnpm typecheck`.
9. Run `pnpm coverage` and bring every workspace to at least 95% (lines, statements, branches, functions).
10. Manual check with `pnpm dev:all`: sync the demo folder, sync Bear, confirm each deletes only its own source.

## Open questions / risks
- Naming: `@md-viz/ui` already exports a `Note` type for `NoteGrid`; the sync `Note` lives in Electron main, so there is no clash, but the names are close.
- Reading every file on each file sync (needed so both sources share one path) costs more than today's mtime-only check; fine at demo scale.
- `bearcli list` returns ~9 MB of JSON for 4.9k notes; `execFile` needs a large `maxBuffer`.
- Bear's `modified` is second-resolution UTC; `synced` is stamped on the cache, so clock skew is not a concern (same machine).
- `bearcli` exists only where Bear is installed; the Bear option errors cleanly elsewhere.
- Locked notes are skipped silently; the count shown excludes them.
