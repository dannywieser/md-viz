# Design exploration for background

- **Slug:** 20261022-03-design-exploration-for-background
- **Started:** 2026.10.22 19:11
- **Completed:** 2026.10.22 19:37:00

## Overview
The grid-paper page background competed with the note grid, which is now the focus of the app. We explored quieter backgrounds on a new `/background` route of the design app, chose dots that scale with the notes, applied the choice to the design system and made the web app's note grid sit on the dot lattice. Card corner marks were dropped everywhere.

## What was done
- **Design app:** `App.tsx` switches on the pathname; `Board.tsx` is the old board; `routes/Background.tsx` and `routes/background-variants.ts` show seven variants in light and dark, with one-card and several-card layouts, a densest-card cell slider and a strength slider; tests for the route and a board link.
- **UI package:** `bg-dots` utility and `--grid-dot` token replace `bg-grid` and the line tokens; `bg-dots` reads `--grid-origin-x/y`; `layoutGrid` gained `multipleOf`; `latticeSpacing` (exported); `NoteGrid` gained `cellStep` and `onCellChange`; `crop-marks` utility and its use on `Card` removed.
- **Web app:** `use-dot-lattice.ts` sets the page's `--grid-*` vars from the first note square; `CacheNoteGrid` uses a card without padding.
- **Docs:** guidelines list ("dot grid", cards), board grid section, `CLAUDE.md`, `README.md`.

## Highlights
- Rule: the card with the most notes has the smallest cell and sets the dot spacing; other cards use whole multiples of it, so cells and cards sit on the dots.
- Dot spacing is the cell, a whole multiple of it below 16px, or the cell divided evenly above 32px, so dots always land on cell corners.
- Dropping the card padding made the grid fill the card and tightened the look.
- Pathname switch instead of a router library, since there are two routes.

## Deviations from the plan
- Explorer swatches use fixed Solarized values (not tokens) so light and dark sit side by side, and mock cards are CSS squares because `NoteGrid` did not expose its cell.
- Went beyond the plan: `NoteGrid` cell reporting, web-app alignment, subdivision of large cells and removal of crop marks, all requested during the session.

## Not done / follow-ups
- `cellStep` is not used yet: the web app shows one card. Several note grids on one page are untested in the real apps.
- Not committed.
- The Electron app has no lattice alignment (it does not show a note grid yet).

## Harvest
- `CLAUDE.md`: dot grid and lattice convention (written during the session), crop marks removed, `apps/design` pathname routing and the `/background` route.
- `README.md`: theme line says dot grid background; mentions `/background` on the design board.
