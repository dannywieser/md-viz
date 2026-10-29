# bugfix: focus border in notes grid

- **Slug:** 20261015-06-bugfix-focus-border-in-notes-grid
- **Started:** 2026.10.15 · **Completed:** 2026.10.15

## Overview
On an edge cell of the notes grid, the black hover outline merged with the black grid border into one thick line. The grid border is now gone and the hover outline is thicker (4px, black) and can extend past the grid edge, so it always reads as a distinct highlight.

## What was done
- `packages/ui/src/styles/globals.css`: removed `.note-border`; `.note-hover` stroke 2px -> 4px (still `#000`); updated comment.
- `packages/ui/src/components/note-grid.tsx`: removed the border rect; added `overflow-visible` to the svg so the outline is not clipped on edge cells.
- `packages/ui/tests/note-grid.test.tsx`: border test now asserts no border; new test for `overflow-visible`; sizing test renamed.
- `apps/web/src/App.tsx`: card padding `p-6` -> `p-4`, `CARD_INSET` 25 -> 17, to give the grid more room while leaving space for the outline.

## Highlights
- Fix options discussed: distinct colour, inset outline, or thicker outline escaping the border. User chose thicker and escaping, centred on the cell edge.
- Colours tried in the browser: black, theme blue (`--ring`), Solarized grey; blue and grey were too close to the pastel note colours. Dropping the grid border and keeping black won.
- Padding tried: 12px border on the card (misread), p-3, p-12, p-6, then settled on p-4.
- The create script made a malformed slug from the multi-line title; the folder, README, .current and log were fixed by hand.

## Deviations from the plan
The plan kept the grid border and changed only the outline width/overflow. In the end the border was removed, the outline stayed black, and the card padding changed. Keyboard focus was never in scope (cells are not focusable).

## Not done / follow-ups
- `.claude/skills/create/scripts/new-session.sh` should reject or flatten multi-line titles (not changed here).
- Hover outline stays black in dark mode on a dark card; not specifically reviewed.

## Harvest
- `CLAUDE.md`: extended the NoteGrid convention bullet with the borderless grid, the 4px overflowing hover outline and the padding it needs. `README.md` has no relevant content; no change.
