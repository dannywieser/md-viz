# Implement note grid updates with grouping and sets

- **Slug:** 20261030-02-implement-note-grid-updates-with-grouping-and-sets
- **Started:** 2026.10.30 13:24
- **Completed:** 2026.10.30 15:44

## Overview

The uniform `NoteGrid` is replaced by the grid designed in the `note-grid-sets` exploration (iteration 8): one square per note, coloured by the note's set, with a bar across its top that shows the totals or the hovered note and its set, and a toggle between not grouped (the default) and grouped (the sets as outlined flowing shapes, the squares of smaller sets bigger). The Electron app now shows one such grid grouped by the cache's `sync` sets, the web app one grouped by the `tags` sets. For that to work every note had to be in one set per grouping, so the sync package was changed first. The work ran as four phases, each a stop for review.

## What was done

- **Phase 1, exclusive sets (`packages/sync`):** a note is in the set of its first tag's top level (none without tags); in the `sync` grouping it is in the first set it fits in the order `created-today`, `updated-today`, `created-last-30-days`, `updated-last-30-days`, `unchanged` (deleted notes only in `deleted-today` or `deleted-last-30-days`, and in none after 30 days). Tests and the two READMEs and `CLAUDE.md` follow.
- **Phase 2, the grid (`packages/ui`, `apps/design`):**
  - New `NoteGrid` (`sets`, `label`, `onCellChange`, `ref`), `NoteGridBar`, `NoteGridSquares` (memoised), `GroupToggle`; layout code in `lib/grid-layout/` (`grid-geometry`, `tile-layout`, `group-states`, `grid-model`), copied from the exploration, which is untouched.
  - Removed the stripes, tooltip, label card and the old layout helpers (`tag-stripes`, `tooltip-shift`, `layoutGrid`); `makeFakeNotes` became `makeFakeSets`.
  - Design viewer: the `/components/note-grid` page (size, set count, uneven sets, states), the lattice demo, guidelines text ("floating note grid", "set colors"); the `sync-layout` exploration draws its grids through a small `MockGrid`.
- **Phase 3, Electron:** `loadNoteSets` in `packages/sync`, a `sets` IPC channel, `useSets`, `SyncGrid`; the three-column grids and their layout helpers were removed. Window content width is now 992 px.
- **Phase 4, web:** `toGridSets` (`lib/grid-sets.ts`), `useDashboard` (tag sets, titles, one `getSet` per non-empty set), `TagGrid`; notes in no set are a last grey `untagged` set.
- **Docs:** `CLAUDE.md` (grid, set colours, lattice, Electron and web paragraphs) and `README.md`.

## Highlights

- Sets were not exclusive in the sync package (created-today sat inside created-last-30-days, notes in several tag sets); making them exclusive was the first decision, and the stripes for extra tags were dropped (colour by set only).
- The ungrouped order is by note id, as the cache lists notes, not the exploration's shuffle.
- The block hugs its squares (option 2 after the white margins at the sides were seen), with a transition on toggle. It is hidden for a single note.
- A real case (2 notes next to 4862) exposed two problems in the copied layout: the exact-fit search almost never succeeded for a huge set (a band of up to 8706 empty cells, or all squares one size), and `placeTiles` lost the strip under a full column of big squares. `fillTileLayout` now takes the largest unit per combination of sizes, scores it, trims the rows and verifies the placement (2 and 4862 gives sizes 16 and 1 with 16-54 empty cells).
- The grid is exactly as wide as its container when a square size divides the width (within a fifth of the biggest); 880 had few divisors, so the Electron content width was changed to 960 (window 992).
- Above 8 sets (`MAX_TILED_SETS`) the size search is skipped and every square is one size; the web app's 19 tag sets are in that case.

## Coverage

Run fresh with `pnpm coverage` (exit 0, every workspace ran, thresholds of 95% unchanged in all seven configs).

| Workspace | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| apps/cache | 97.72% | 100% | 100% | 97.46% |
| packages/api-client | 100% | 100% | 100% | 100% |
| packages/ui | 99.27% | 98.35% | 100% | 99.78% |
| apps/design | 98.36% | 98.34% | 98.82% | 98.47% |
| apps/web | 100% | 100% | 100% | 100% |
| packages/sync | 100% | 95.42% | 100% | 100% |
| apps/electron | 98.5% | 100% | 100% | 98.33% |

Threshold: 95% for statements, branches, functions and lines in every workspace.

## Deviations from the plan

- The package function is `loadNoteSets`, not `loadGridSets` (the package has no UI).
- Steps 1-2, 6-7 and 11-13 share commits; the plan's interim one-grey-set adapters were used between phases as planned.
- Added beyond the plan: the layout rework for very uneven sets, width-dividing square sizes, the window width change, the hidden toggle for one note and an "uneven sets" demo on the design page.
- The `sync-layout` exploration needed a `MockGrid` stand-in (it used the old `NoteGrid` API).

## Not done / follow-ups

- Sizes for more than 8 sets (e.g. the 19 tag sets): sizes that never increase with the set's count would cut the search from 4^n combinations to a few thousand; left for later.
- The web app has no fixed width, so a grid can still be a few px short of its cards for some counts (a stretch of under 3% would fix it).
- The Electron window itself was not launched and looked at; it was checked through its renderer in a browser with a stubbed `window.api`, tests and the data path against a real cache.
- `LastSync.notes` (updated / deleted / unchanged lists in `state.json`) is no longer shown; removing it is a separate change.
- The note-grid-sets exploration keeps its own copy of the layout code (duplicated on purpose).

## Harvest

- **`CLAUDE.md`:** already updated during the session: the `NoteGrid` convention (props, bar, states, layout, motion, width rule), set colours, the dot lattice paragraph, the Electron renderer, window and sync paragraphs (`loadNoteSets`, 992 px window and why), the web app paragraph and the sets convention (one set per note per grouping, the new `sync` order).
- **`README.md`:** the intro now describes the grids (web: coloured by tag set with a toggle; Electron: the sync sets as one grid) and the sync paragraph says a note is in only one set of a grouping.
- **`apps/cache/README.md`, `packages/sync/README.md`:** the grouping text (exclusive sets, new order), changed in Phase 1.
- **Design guidelines:** "floating note grid" now describes the bar; "tag colors" became "set colors".
