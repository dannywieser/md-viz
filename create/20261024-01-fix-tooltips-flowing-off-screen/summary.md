# Fix summary: tooltips flowing off screen

- **Slug:** 20261024-01-fix-tooltips-flowing-off-screen
- **Started:** 2026.10.24 16:37 · **Completed:** 2026.10.24

## Symptom
The `NoteGrid` tooltip is centred on the hovered cell, so for cells in the first or last column (web and Electron) part of it was cut off by the left or right window edge.

## Root cause
The shared tooltip was placed at `cellX + cell/2` with `-translate-x-1/2` and nothing checked the viewport (hypothesis from the code, not reproduced in a browser; see Deviations).

## Fix
- `packages/ui/src/lib/tooltip-shift.ts` (new): pure `tooltipShift(left, width, viewportWidth, margin)` returns the px offset that keeps the tooltip inside the viewport.
- `packages/ui/src/components/note-grid.tsx`: ref on the tooltip and a layout effect that measures it and sets `marginLeft` (8px margin). Near the left edge it flows right, near the right edge left, otherwise it stays centred. No extra elements or handlers per note.

## How verified
Three tests in `packages/ui/tests/components/note-grid.test.tsx` ("tooltip placement": left overflow, right overflow, fits) fail without the `note-grid.tsx` change and pass with it; `tests/lib/tooltip-shift.test.ts` covers the helper. The tooltip rect is stubbed because jsdom has no layout. Not checked by eye in a browser.

## Highlights
- Chose measuring the tooltip over a column-based rule: the threshold depends on title length and where the grid sits.
- Vertical placement (top row) and long-title wrapping were left out of scope.

## Coverage (`pnpm coverage`, threshold 95% everywhere, thresholds unchanged)
| workspace | statements | branches | functions | lines |
|---|---|---|---|---|
| apps/cache | 100 | 100 | 100 | 100 |
| apps/design | 99.39 | 100 | 98.9 | 99.35 |
| apps/electron | 100 | 98.78 | 100 | 100 |
| apps/web | 100 | 100 | 100 | 100 |
| packages/api-client | 100 | 100 | 100 | 100 |
| packages/ui | 99.61 | 98.7 | 100 | 100 |

(Workspaces that print "No files with missing coverage" are shown as 100.)

## Deviations from the plan
The browser repro (step 1) was not possible: the design board's short fake titles and centred grid never clip. The stubbed-rect tests stand in for it.

## Not done / follow-ups
- Top-row tooltips can still go above the window (out of scope).
- Not seen in a real browser/Electron with a long title at the edge.

## Harvest
- `CLAUDE.md`: added the tooltip placement rule to the `NoteGrid` description.
- `README.md`: nothing needed updating.
