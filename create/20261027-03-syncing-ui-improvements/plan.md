# Plan: syncing UI improvements

## Goal

Make the Electron sync app tighter and its progress clearer. First explore the app's layout and loading states in the design app, choose a direction with the user, then implement it: a fixed, slightly shorter window with the three note grids fitted to its width and filling its height, a compact status card (source and last synced on one line), and a visible progress display (the `Loader`, counters and, where it earns its place, the note being synced).

## Scope

In:

- A design exploration `sync-layout` in `apps/design` of the whole sync app at the fixed window size: layout, status row, progress placement, `Loader`, "now syncing" note title, scan vs sync states, empty/error/finished states.
- Review with the user and choose a variant (a checkpoint, step 6).
- Implement the chosen variant in `apps/electron`: fixed window size, grids that fit the width and fill the height, compact status card, progress UI.
- Per-note progress in `packages/sync` only if the chosen design needs it (decided at the checkpoint).

Out:

- Cancel, retry or auto-sync controls; new sources; changes to the cache service or its API.
- Resizable or self-fitting windows (the window is fixed).
- Changes to theme tokens, unless the exploration shows one is needed (then discussed first).

## Technologies

Existing stack only: React 19, Tailwind v4, `@md-viz/ui` components (`Loader`, `Card`, `NoteGrid`, `StateBlock`), Vitest + Testing Library, electron-vite. The exploration lives in `apps/design` as the conventions require (own folder, lazy `Page`, one registry line, tests mirrored in `tests/explorations/sync-layout/`).

## Repository structure

```
apps/design/src/explorations/sync-layout/   new: the exploration (index.ts, page, mock app frame, variants, fake sync data)
apps/design/tests/explorations/sync-layout/ new: one test per source file
apps/design/src/explorations/registry.ts   one line added
apps/electron/src/main/index.ts            fixed window size
apps/electron/src/renderer/src/...         app.tsx, components/, hooks/, lib/sync-layout.ts (per the chosen variant)
apps/electron/tests/renderer/...           tests for changed files
packages/sync/src/pipeline/sync.ts         only if per-note progress is chosen (+ types, README, tests)
create/20261027-03-syncing-ui-improvements/ log.md, plan.md, summary.md
```

## Files

Exploration (step 1-5):

- `apps/design/src/explorations/sync-layout/index.ts` - the `Exploration` (slug `sync-layout`, lazy `Page`).
- `.../sync-layout.tsx` - the page: variants laid out for comparison, with a state switcher (idle, scanning, syncing, done, empty, error).
- `.../app-frame.tsx` - a mock of the fixed-size window (header + content) the variants render into.
- `.../variants.ts` - the variant definitions (names, notes on each).
- `.../fake-sync.ts` - fake data and progress states (counts, current note titles, grid contents).
- Further one-component-per-file components for status row, progress strip and grid area as needed.
- `apps/design/src/explorations/registry.ts` - register it.

Implementation (steps 7+, refined at the checkpoint):

- `apps/electron/src/main/index.ts` - new fixed `width`/`height`, `resizable: false` (or min = max).
- `apps/electron/src/renderer/src/lib/sync-layout.ts` - window-based layout constants; `GRID_HEIGHT` becomes derived from the window height.
- `.../components/sync-grids.tsx`, `status-grid.tsx` - grids fit the fixed width and fill the height; the dot lattice stays aligned.
- `.../components/folder-card.tsx` - compact status card; progress moved out or reshaped per the choice.
- `.../components/sync-progress.tsx` (new, if chosen) - `Loader`, counter, current note title.
- `.../app.tsx`, `hooks/use-sync.ts`, `hooks/use-scan.ts` - wiring.
- `packages/sync` - per-note progress (`SyncProgress` gains the current note title) only if chosen; update its README and `src/shared/ipc.ts` accordingly.
- Matching tests for every changed or new source file.

## Steps

1. Design exploration skeleton: `sync-layout` folder, `index.ts`, registry line, mock app frame at the fixed window size, fake data; test files for each.
2. Variants of the layout: compact status row (source and last synced on one line, count beside it) and grids fitted to the width and filling the height, compared with the current layout.
3. Progress variants: placement (in the status row, a strip under it, replacing the grids), `Loader` placement, counters, and a "now syncing" line with the current note title (batch vs per-note shown side by side).
4. State coverage: scanning, syncing, done, empty, error in each variant, switchable on the page.
5. Run format, lint, typecheck, coverage for `apps/design`; commit and push the exploration.
6. **Checkpoint:** the user reviews the exploration; together choose the layout, window size, progress design and whether the pipeline reports per note. Update this plan's implementation steps to match and log the decision.
7. Window and layout: fixed window size in main; grids fit the width and fill the height; lattice stays aligned; tests.
8. Compact status card per the chosen design; tests.
9. Progress UI (`Loader`, counters, note title) wired to `useScan`/`useSync`; tests.
10. If chosen: per-note progress in `packages/sync` (pipeline, types, IPC type, README), with tests.
11. Update `CLAUDE.md` (Electron renderer, window and layout notes) and the design guidelines if a decision changed.
12. Run `pnpm format`, `pnpm lint`, `pnpm typecheck` and `pnpm coverage`; bring every workspace to at least 95% (lines, statements, branches, functions); fix any shortfall.

## Open questions / risks

- The exact window size is decided in the exploration. Anything fixed must hold the three columns (today 272px wide plus gaps) and a sensible grid height; a smaller height means fewer rows of squares for big note sets.
- Fitting the grids to a fixed width changes `COLUMN_WIDTH` from a constant into something derived, and the "gap widened to a whole number of dot spacings" rule must keep working. The lattice is the main risk in step 7.
- Fixed-size windows on small displays or with OS scaling can clip content; the page must not scroll (dots do not move with it).
- Per-note progress adds many IPC events; throttle it like the scan progress (50 ms) if chosen.
- Steps 7-11 are provisional until the checkpoint.
