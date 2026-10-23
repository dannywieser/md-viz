# Plan: sync app empty state sizing (fix)

## Symptom and repro
- Expected: in the Electron sync grids, an empty group's block is the same size as a populated grid's block (e.g. the 18-note one).
- Actual: the empty block is slightly larger (about 144 high vs 135, and wider than the 267 of the 18-note grid), and two empty blocks repeat "the notes went out for coffee".
- Repro: `pnpm dev:electron` (or `dev:all`), pick `demo/`, sync, then change nothing and sync again so `updated` and `deleted` are empty and `unchanged` holds 18 notes (2 of 3 empty). Measure the `[data-slot="empty-state"]` parent against the grid's block.

## Root cause
Computed, not measured in the running app: `NoteGrid` renders `block(<EmptyState />)` for `notes: []`. The block is sized by its content (`p-6`, 72x60 ghost, `gap-4`, text line), not by the drawing area. A populated grid is `columns*cell + 3` by `rows*cell + 3` (267x135 for 18 notes in 269x157). Introduced by commit afbcdcb (#3). Step 1 of the plan confirms it by measuring.

## Fix approach
Decided in the session log:
1. `EmptyState` gets a `compact` prop: smaller, muted ghost, no text, little padding.
2. `NoteGrid` gets an explicit prop `compactEmpty` that renders the compact state; the sync app's `StatusGrid` sets it. The web app keeps the full state.
3. In `NoteGrid` the empty block fills the drawing area less the stroke room (`width`/`height` already computed there: 269x157 in the sync app), with its content centred, instead of being content-sized. This applies to the full state too, so no empty block is ever bigger than its container.
Alternative rejected: automatic compact choice by measuring content against the area (more machinery).

## Scope
In: `EmptyState` compact variant, `NoteGrid` empty block sizing and prop, `StatusGrid` setting it, the `states` design exploration showing the compact option, tests.
Out: `Loader`/`ErrorState` sizing, changing the ghost bitmap, automatic variant choice, the web app's empty state.

## Files
- `packages/ui/src/components/empty-state.tsx` - `compact` prop (small `PixelIcon` cell, muted via opacity, no text, minimal padding)
- `packages/ui/src/components/note-grid.tsx` - `compactEmpty` prop; empty block sized to the drawing area, content centred
- `apps/electron/src/renderer/src/components/status-grid.tsx` - pass `compactEmpty`
- `apps/design/src/explorations/states/*` - show the compact empty state among the options (extend the existing options/frames; no new exploration)
- `CLAUDE.md` - mention the compact empty state and that an empty `NoteGrid` fills its area (state-components bullet and `NoteGrid` bullet)
- Tests: `packages/ui/tests/components/empty-state.test.tsx`, `packages/ui/tests/components/note-grid.test.tsx`, `apps/electron/tests/renderer/components/status-grid.test.tsx`, and the matching `apps/design/tests/explorations/states/` file(s)

## Steps
1. Regression tests that fail first: in `note-grid.test.tsx`, with a mocked container size (as the other tests do), the empty block's width and height equal the area less 3px; with `compactEmpty` it shows the compact state (no text). In `status-grid.test.tsx`, `NoteGrid` receives `compactEmpty`. Also measure the real app once to confirm the root cause (browser/Electron pane) and note the numbers in the log.
2. Add `compact` to `EmptyState`; add `compactEmpty` and the filled empty block to `NoteGrid`; set the prop in `StatusGrid`.
3. Run the new tests; they pass.
4. Unit tests for the other changed files: `empty-state.test.tsx` (compact shows the icon, no text, smaller than the default) and the design exploration test for the compact option.
5. Update the `states` exploration and `CLAUDE.md`; run `pnpm format`, `pnpm lint`, `pnpm typecheck`.
6. Run `pnpm coverage`; bring every workspace to at least 95% (lines, statements, branches, functions). Check the result in the running Electron app (2/3 empty).

## Regression risk
- Web app's single empty grid (full state) now fills its container instead of being content-sized: still centred, check visually.
- `useGridLattice` is driven by the biggest grid and ignores empty grids (`notes.length > 0`), so the dot lattice is unaffected; `onCellChange` is not called for empty grids.
- The existing `note-grid` empty test (shadowed block, lowercase text, label card) must keep passing; the label card still hangs above the block.
- Design board and `states` exploration tests; checked by `pnpm test`.

## Open questions / risks
- Exact muting (opacity value) and compact ghost cell size (probably 3-4px per cell, 36-48 px wide): picked by eye in the design exploration.
- Before the container is measured (`width` 0) the empty block has no size yet; it falls back to content size for that first frame.

## Revision (2026-10-23, after review)
Decision 3(a) (fill the area, 269x157) left the empty block 22px taller than the 18-note grid (267x135). Changed to option 1: `NoteGrid` takes `emptySize`; `SyncGrids` computes the reference grid's block with the new `gridBlockSize` (`@md-viz/ui`) and passes it through `StatusGrid`. With no notes anywhere the empty blocks still fill the area. Files also touched: `packages/ui/src/lib/note-grid-layout.ts`, `packages/ui/src/index.ts`, `sync-grids.tsx`, and their tests.
