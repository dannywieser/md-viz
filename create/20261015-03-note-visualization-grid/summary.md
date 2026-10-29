# note visualization grid

- **Slug:** 20261015-03-note-visualization-grid
- **Started:** 2026.10.15 18:34
- **Completed:** 2026.10.15 19:12:52

## Overview

A shared `NoteGrid` component in `packages/ui` that draws a set of notes as a grid of equal squares, shown on the design board with mock data. The session started as isometric pixel-art cubes and was changed to flat squares with gridlines after the user saw a pixel-art sprite as the reference. Square size is derived from the note count so every note is always shown: 5 notes give 5 large cells, 5000 give tiny ones. Filtering, not capping, is how subsets are meant to be built.

## What was done

- `packages/ui/src/lib/note-grid-layout.ts`: pure `layoutGrid` picking the largest whole-pixel cell that fits the count in a box; columns are capped at the note count.
- `packages/ui/src/lib/use-element-width.ts`: generic `useElementWidth` hook (ResizeObserver), extracted from the component.
- `packages/ui/src/components/note-grid.tsx`: the bare grid (no card, no header text), SVG with `crispEdges`, 1px gridlines, white placeholder squares completing the last row so the grid is always a rectangle, a 2px black border, a memoised cell layer, and one shared tooltip plus hover outline driven by a single pointer handler.
- `packages/ui/src/styles/globals.css`: `--note-0..9` colour tokens (Solarized accents at 55% mixed with `--note-mute`, base1 in light and base01 in dark), plus `.note-square`, `.note-placeholder`, `.note-border` and `.note-hover` rules.
- `packages/ui/src/index.ts`: exports `NoteGrid`, `NOTE_COLORS`, `Note`.
- `apps/design/src/sections/NoteGridDemo.tsx` and `App.tsx`: "note grid" section with seeded mock data, presets 5/50/500/5000 and a slider up to 20000; the grid is full width in its card.
- Tests: `note-grid-layout.test.ts`, `note-grid.test.tsx`, `use-element-width.test.tsx`; the design `App.test.tsx` expects the new section.

## Highlights

- Cubes were built first (isometric faces, flat-square fallback below 8px), then removed entirely when the user chose squares; no cube code remains.
- Size comes only from the count; all notes are the same size. A per-note size (e.g. linked-note count) and grouping into blocks are deferred.
- Hover: a per-note `<title>` was replaced by one shared tooltip with arithmetic hit-testing, because 5000 per-cell popovers would be heavy and `<title>` is slow, unstyled and adds a node per note. Memoising the cells keeps hover cheap at 5000; the user confirmed it feels fine.
- Colours were muted by mixing toward a base tone, still distinguishable in light and dark.
- The first `/create` call produced a malformed slug from a multi-line argument; the bad folders were removed and the session recreated with the title only.

## Deviations from the plan

- Isometric cubes, the flat/cube threshold, face shades and the 64px max cell were dropped (squares, always-on gridlines, optional cap).
- No separate dark colour variants (only the mute tone changes).
- Added the black border, placeholders, tooltip and the extracted hook, none of which were planned.
- No guideline entry on the design board (step 7); the user decided the component is enough.
- Step 6 ran informally as iterative review rather than a dedicated pass.

## Not done / follow-ups

- Touch input for the tooltip (pointer events only; not tested on touch).
- Dark mode was checked before the border and placeholders were added, not after.
- Centred versus edge-to-edge layout was not explored further; the grid is centred in the card.
- Per-note size attribute, grouping into blocks, click/selection and keyboard or list access for assistive tech.
- Nothing is committed.

## Harvest

- `CLAUDE.md`: added one convention: components drawing thousands of items use one pointer handler, one shared tooltip and a memoised item layer. This is a non-obvious performance decision future UI work should follow.
- `README.md`: no changes needed (no new commands, setup or layout changes).
