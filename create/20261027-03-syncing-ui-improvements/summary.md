# syncing UI improvements

- **Slug:** 20261027-03-syncing-ui-improvements
- **Started:** 2026-10-27
- **Completed:** 2026-10-27

## Overview

The Electron sync app wasted space (a window wider and taller than its content, a tall status card) and showed progress as one line of text. We first built a design exploration (`sync-layout`) of the window and its progress states, chose a direction with the user, then implemented it: a fixed, tighter window, grids of one column width that fill the height, a one-line status card and a progress overlay with the loader.

## What was done

- **Design exploration** (`apps/design/src/explorations/sync-layout/`, tests mirrored): the app in a fixed window with state switcher (never, scanning, syncing, done, empty, error) and a progress slider, comparing today's window with the solid and overlay progress variants. Earlier rounds also compared progress in the status row and in a strip; those were dropped (see commit `ca0b8f1`).
- **Electron window** (`apps/electron/src/main/index.ts`, `src/shared/window-size.ts`): fixed 912x520 content size, not resizable, maximizable or fullscreenable; just wide enough for three 272px columns.
- **Status grids** (`sync-grids.tsx`, `status-grid.tsx`, `lib/sync-layout.ts`): always shown, empty before a sync; columns of one width; grids of more than 12 notes fill the height, grids of 12 or fewer keep 160px (6 deleted notes stay 3 wide, 2 tall); `columnPitch` keeps the lattice alignment inside the fixed window; the last block is pinned right so its edge meets the card's.
- **Status card** (`folder-card.tsx`): source and last synced on one line, count at the end; progress text moved out.
- **Progress** (`sync-overlay.tsx`, `app.tsx`): while scanning or syncing, a semi-opaque overlay over the grids with the loader, a line, a progress bar (when the total is known) and the counts the pipeline reports; an error replaces the grids.
- **Shared UI** (`packages/ui`): new `ProgressBar`; `NoteGrid` gained `align="end"`.
- Docs: `CLAUDE.md` and `README.md` (see Harvest).

## Highlights

- Progress detail: per-note titles were explored, then dropped ("batching is fine"), so the sync logic and `packages/sync` are unchanged; the overlay shows only what the pipeline already reports.
- Fixed columns with a fixed window conflict with the old rule of widening the gap to land on the dot lattice, so the gap is now only ever narrowed (down to 16px); if no whole spacing fits, columns are off the dots.
- A block is only as wide as its squares, so the last block ended short of the card; pinning it right fixes the edge at the price of that column being off the dots by the leftover width.
- The design mock first had unequal spacing above and below the status card (24px vs 16px); both are 16px.

## Coverage

Fresh `pnpm coverage` (exit 0), threshold 95% in every workspace, thresholds and exclusions unchanged.

| Workspace | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| apps/cache | 96.2% | 100% | 100% | 95.89% |
| apps/design | 99.56% | 100% | 98.27% | 99.54% |
| apps/electron | 100% | 100% | 100% | 100% |
| apps/web | 100% | 100% | 100% | 100% |
| packages/api-client | 100% | 100% | 100% | 100% |
| packages/sync | 100% | 97.59% | 100% | 100% |
| packages/ui | 99.62% | 99.35% | 100% | 100% |

Two earlier coverage runs failed with test timeouts and vitest worker start timeouts while the machine was heavily loaded (load average about 15, dev servers running); they passed unchanged once rerun.

## Deviations from the plan

- Steps 1-5 were built in one pass, then revised twice after review (overlay, fixed columns, counts only); steps 7-12 were committed together because the app only compiles with all of them.
- Step 10 (per-note progress in `packages/sync`) was dropped.
- The header and card no longer follow the grid row width (`onWidthChange` removed); the fixed window makes them full width.

## Not done / follow-ups

- The Electron app was not run by Claude; the user checked the layout themselves, and further tweaks may follow.
- The right-hand column is off the dot lattice by the leftover width (see Highlights).
- Very large deleted sets (hundreds of notes) get small squares only if they exceed 12 notes and so fill the height; the 12-note threshold is a guess.

## Harvest

- `CLAUDE.md`: the lattice, `NoteGrid` (`align="end"`, no `emptySize` in the sync app) and Electron renderer/window notes now describe the fixed window, fixed columns, `gridHeight`, `columnPitch`, one-line card and `SyncOverlay`; `ProgressBar` noted as shared UI.
- `README.md`: the design explorations list mentions the sync app layout.
