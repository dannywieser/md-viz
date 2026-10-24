# Plan: tooltips flowing off screen

- **Slug:** 20261024-01-fix-tooltips-flowing-off-screen
- **Kind:** fix

## Symptom and repro
Hovering a note in the first or last column of a `NoteGrid` (web and Electron) with a title longer than the room beside the cell: the tooltip is centred on the cell, so part of it is cut off by the left or right edge of the window.
Repro: run `pnpm dev:all`, make a note with a long title (or use the demo folder), hover a cell in the first/last column, and the tooltip is clipped. Expected: it flows away from the near edge (left edge: extends right; right edge: extends left) and stays centred everywhere else.

## Root cause
Hypothesis, confirmed by reading the code: the single shared tooltip in `packages/ui/src/components/note-grid.tsx` is always placed at `cellX + cell/2` with `-translate-x-1/2`, with no knowledge of the viewport. Step 1 reproduces it in the browser before fixing.

## Fix approach
Option B from the session: measure the shared tooltip after it renders (`useLayoutEffect` on the active cell) and shift it horizontally just enough to sit inside the viewport (with a small margin). A cell near an edge gets a tooltip aligned to flow inward; a cell with room keeps the centred tooltip. The calculation is a pure function in `lib/`; the component only measures and applies the shift to the one tooltip element directly (no extra grid re-render, no per-item elements).
Alternative considered: choosing left/centre/right by column. Rejected, since the threshold depends on title length and where the grid sits in the window.

## Scope
In: horizontal placement of the tooltip. Out: vertical placement (top row), tooltip styling, wrapping/truncating long titles, any other component.

## Files
- `packages/ui/src/lib/tooltip-shift.ts` (new): pure `tooltipShift(left, width, viewportWidth, margin)` returning the px offset that keeps `[left, left + width]` inside the viewport.
- `packages/ui/src/components/note-grid.tsx`: ref on the tooltip; a layout effect that measures it and applies the shift.
- `packages/ui/tests/lib/tooltip-shift.test.ts` (new): unit tests for the pure function.
- `packages/ui/tests/components/note-grid.test.tsx`: regression tests for the shift (jsdom has no layout, so the tests stub `getBoundingClientRect` and `window.innerWidth`).
- `create/` session files and `CLAUDE.md` only if the `NoteGrid` description needs a line on tooltip placement.

## Steps
1. Reproduce in the web app via `preview_start`: hover an edge cell with a long title and note the clipping (screenshot/measured rect).
2. Regression test in `note-grid.test.tsx`: stub the tooltip rect to overflow the left edge (and another for the right edge) and expect the applied shift to be positive (negative); expect none when it fits. Confirm it fails for the right reason.
3. Add `tooltip-shift.ts` and its unit tests.
4. Wire the layout effect into `note-grid.tsx`.
5. Confirm the step 2 tests pass; re-check in the web app (and note the Electron renderer uses the same component).
6. Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, then `pnpm coverage` and bring every workspace to at least 95% (lines, statements, branches, functions).

## Regression risk
The tooltip, hover outline and one-handler design stay as they are; only a layout effect on the tooltip is added, so `Cells` stays memoised. Existing tooltip tests (shows one, follows the pointer, hides) must still pass. In jsdom the rect is all zeros, so the shift is 0 there. The Electron status grids and the web grid both use `NoteGrid`, so both are checked in step 5.

## Open questions / risks
- Margin from the window edge: proposing 8px.
- The viewport is used as the boundary; if the app ever scrolls inside a clipped container, this would need the container instead (not the case today: the page must not scroll).
