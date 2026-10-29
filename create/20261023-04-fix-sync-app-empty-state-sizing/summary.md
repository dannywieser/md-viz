# Fix summary: sync app empty state sizing

- **Slug:** 20261023-04-fix-sync-app-empty-state-sizing
- **Started:** 2026.10.23 16:47:30
- **Completed:** 2026.10.23 17:04:17

## Symptom
In the Electron sync app an empty status grid's block was bigger than a populated one (e.g. the 18-note grid), and two empty grids both repeated "the notes went out for coffee". Later review also found the folder card and the app header wider than the three status blocks.

## Root cause
Computed from the code, not measured in the running app: `NoteGrid` rendered its empty block content-sized (`p-6`, 72x60 ghost, text; about 144 high) while a populated grid is `columns*cell+3` by `rows*cell+3` (267x135 for 18 notes). Introduced by the empty state in afbcdcb (#3). The folder card/header mismatch had the same shape: they were sized to the column or window, not to the right edge of the last (narrower) block.

## Fix
- `packages/ui/src/components/empty-state.tsx`: `compact` prop (small muted ghost, no text).
- `packages/ui/src/components/note-grid.tsx`: `compactEmpty` and `emptySize` props; the empty block has an explicit size (given, else the drawing area less the stroke room).
- `packages/ui/src/lib/note-grid-layout.ts`, `index.ts`: `gridBlockSize` and `STROKE_ROOM`, exported.
- `apps/electron/.../sync-grids.tsx`: empty grids copy the reference grid's block size; the row width (to the last block's right edge) is computed, `children` (the folder card) fill it, `onWidthChange` reports it.
- `apps/electron/.../status-grid.tsx`, `folder-card.tsx`, `app.tsx`: pass `compactEmpty`/`emptySize`, folder card inside `SyncGrids`, header width follows the grids.
- `apps/design`: compact empty state on the board (`components.tsx`) and in the `states` exploration.
- `CLAUDE.md`: compact state, empty block sizing, sync grid widths.

## How verified
Regression tests in `packages/ui/tests/components/note-grid.test.tsx` (empty block size, `emptySize`, `compactEmpty`) failed against the old source and pass now; `tests/lib/note-grid-layout.test.ts` (`gridBlockSize`: 267x135 for 18 notes), `sync-grids.test.tsx` (empty size, row width, `onWidthChange`), `app.test.tsx` (header and card width), `status-grid.test.tsx`, `empty-state.test.tsx`, `folder-card.test.tsx` and the design tests. Not verified by eye in the running Electron app.

## Highlights
- First sizing rule (fill the area, 269x157) was still 22px taller than the 18-note block; replaced by copying the reference grid's block (computed with `gridBlockSize`, no measuring).
- The last block is narrower than its 272px column, so card and header match the row to the block edge, not the column.
- Compact variant added at the user's request to avoid two identical empty messages.

## Coverage (threshold 95% each)
| workspace | statements | branches | functions | lines |
|---|---|---|---|---|
| apps/cache | 100 | 100 | 100 | 100 |
| packages/api-client | 100 | 100 | 100 | 100 |
| packages/ui | 99.57 | 98.6 | 100 | 100 |
| apps/design | 99.39 | 100 | 98.9 | 99.35 |
| apps/electron | 100 | 98.31 | 100 | 100 |
| apps/web | 100 | 100 | 100 | 100 |

`pnpm coverage` exits 0; thresholds unchanged.

## Deviations from the plan
Sizing changed twice after review (area fill -> reference block copy); folder card and header width added to scope; the real-app measurement in plan step 1 was not done.

## Not done / follow-ups
- Check the result by eye in the Electron app (two empty groups, narrow window).
- Automatic compact choice (measuring content) was left out on purpose.

## Harvest
- `CLAUDE.md`: updated during the session (state components, `NoteGrid` empty block, Electron sync grids widths). Nothing more needed; `README.md` unchanged.
