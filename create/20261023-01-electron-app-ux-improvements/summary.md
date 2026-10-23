# electron app UX improvements

- **Slug:** 20261023-01-electron-app-ux-improvements
- **Started:** 2026-10-23
- **Completed:** 2026-10-23
- **PR:** https://github.com/dannywieser/md-viz/pull/1 (branch `electron-ux-improvements`)

## Overview
The Electron app now remembers the last selected folder, reopens and scans it on launch, shows when it was last synced and shows the notes of that sync as three note grids (updated, deleted, unchanged). Along the way `NoteGrid` and `AppHeader` were reworked into floating components, recorded as design guidelines, and the Electron window got a title, a hidden title bar and an icon.

## What was done
- **Electron state:** `src/main/state.ts` keeps `state.json` in userData (last folder; per folder the completion time and id and title of each updated, deleted and unchanged note). `sync.ts` returns the per-note lists; `ipc.ts` and the preload save state on pick and sync and expose `loadLast`, which returns the saved folder only if it still exists.
- **Electron UI:** auto-select and scan on launch, "last synced" line, `SyncGrids.tsx` (three fixed-width columns), the sync summary line removed, `sync` title (`md-viz sync`), hidden title bar with the header as drag region, app icon (`resources/icon.png` from `scripts/make-icon.mjs`, set as dock and window icon).
- **`@md-viz/ui`:** `NoteGrid` is always a `bg-card shadow-hard` block floating on the page, with built-in `label`, `align`, `ref` and an empty state (`frame` and `inset` removed); `useDotLattice` moved here from `apps/web`; `AppHeader` floats (centered, margin, border, shadow, sticky).
- **`@md-viz/api-client`:** react-query helpers in their own entry (`@md-viz/api-client/cache/react-query`) to stop the `"use client"` warnings from Electron main (separate commit on main).
- **Web:** `CacheNoteGrid` uses the new `NoteGrid`; its no-notes message is the empty state.
- **Design board:** guidelines "floating header" and "floating note grid"; the note grid section shows the grid floating plus one / a few / many / empty states; the app header demo sits on the dots.
- **Tests:** state file, sync note lists, App launch flow and grids, NoteGrid label/empty/shadow/ref, `useDotLattice`, `AppHeader` classes.

## Highlights
- Last sync state is local JSON on purpose; it may become a history log in the DB.
- Failed (unreadable) files are not shown in any grid.
- Dot alignment: the biggest grid is the reference, the others use the dot spacing as `cellStep`, grids start at the column's top-left, columns are a fixed 272px and the gap is widened so the column pitch is a whole number of dot spacings. The page must not scroll (the dots do not move with it).
- A design basis was set during the session: the note grid always floats on the background, never on a card; the header floats too.
- In dev the Dock and menu bar name stay "Electron" (read from the Electron binary's plist); only packaging fixes it.

## Deviations from the plan
- State shape is `{ lastFolder, syncs }`, not `folders`.
- Scope grew: floating layout exploration, `NoteGrid` collapse, design board states, floating header, title bar and icon.
- Other grids use the dot spacing as `cellStep`, not the reference grid's cell.

## Not done / follow-ups
- Not checked in a running Electron window: title bar traffic light position and the dock icon.
- Grid coloring by status (deliberately later).
- Packaging: `productName`, `.icns` / `.ico` from the icon.
- Persisting every note's id and title could get large for 100k+ notes.
- A max width for the floating header on very wide windows.

## Harvest
- `CLAUDE.md`: intro mentions the status grids; the logo bullet says `AppHeader` floats; new bullet on the Electron window (hidden title bar, drag region, clearance, dev name gotcha). The state file, icon, `NoteGrid` and dot lattice notes were added during the session.
- `README.md`: Electron description and usage now mention reopening the last folder, the three note grids and where `state.json` lives.
