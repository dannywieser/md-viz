# note grid sets exploration

- **Slug:** 20261029-01-note-grid-sets-exploration
- **Started:** 2026.10.29 07:50
- **Completed:** 2026.10.30 07:19

## Overview

A design exploration, in `apps/design` only, of how one grid can be the foundation of both the web and the Electron app: sets of notes drawn as groups on the dot lattice, grouped or not, with labels that do not need a header card. The live `NoteGrid`, the apps and the packages are untouched. The exploration went through eight iterations; the last one (iteration 8, built on the even share of iteration 7) is the chosen design and the input for implementing it in the live components in a new session.

## What was done

- `apps/design/src/explorations/note-grid-sets/` (new, with a test file per source file in `apps/design/tests/explorations/note-grid-sets/`), registered in `registry.ts` and served at `/explorations/note-grid-sets`. The page lists the iterations newest first (`iterations.ts`); all eight are kept.
- Iteration 1: sized blocks (three sizing rules, shelf packing on the lattice), grouped squares, colour by set / by tag with striping, label treatments (`block-shapes`, `pack-blocks`, `label-fit`, `sized-grid`, `grouped-grid`, `striped-set-grid`, sections).
- Iteration 2-3: a container of empty squares with the sets slotted in as square as possible (`slot-sets`, `container-grid`); outline always on and the set name as non-interfering text over groups wider than a threshold.
- Iteration 4: a white header bar flush on top of the grid that names the hovered set and note instead of a tooltip (`hover-bar`); 100 / 500 / 5000 notes in the same space (`scale-sets`).
- Iteration 5: a share of the space per set (notes ^ exponent: by notes, softened, even), squares in whole multiples of the smallest, full square blocks with filler, growth into free space (`scaled-slots`, `scaled-grid`).
- Iteration 6: sets as flowing bands, no filler, grid full (`flow-layout`, `flow-grid`).
- Iteration 7: flowing shapes with power-of-two square sizes, exact fill (`tile-layout`, `tile-grid`).
- Iteration 8 (final): a toggle in the header bar between grouped (iteration 7, even share, outlined) and not grouped (natural order, one size, coloured by set); animated per square up to 1000 notes, a single fade above; both states fill the same fixed frame; empty cells show gridlines (`natural-order`, `group-states`, `group-toggle`, `state-grid`, `fillTileLayout`, `fillGrid`).
- `CLAUDE.md`: the rule that explorations keep every iteration, and the harvest note below.

## Highlights

- Dot alignment: every square is a whole-px multiple of one unit and every group edge a multiple of the unit, so edges sit on lattice dots (checked in the viewer).
- "grouped squares" won over sized blocks early (iteration 2); the share-by-notes layouts show that equal squares leave nothing to grow, so the share is an exponent (by notes 1, softened 0.5, even 0).
- Exact fill with different square sizes needs nesting sizes: powers of two, a queue of free rectangles, sets with the biggest squares placed first.
- The grid must fill a fixed window in both states (iteration 8): the grouped layout picks, per unit, sizes whose area is exactly the cells that fit; with no exact fit the fewest cells stay empty (grouped covers 90-100% of the frame, not grouped 70-100%).
- Moving thousands of squares at once is too heavy: above 1000 notes (or with reduced motion) the grid fades instead.
- The set outline uses `--focus` (Solarized `--foreground` was too light).

## Coverage

Threshold 95% (lines, statements, branches, functions) per workspace; all thresholds still in place, `pnpm coverage` exited 0 with every workspace run.

| workspace | statements | branches | functions | lines |
|---|---|---|---|---|
| apps/cache | 96.7 | 100 | 100 | 96.4 |
| packages/api-client | 100 | 100 | 100 | 100 |
| packages/ui | 99.71 | 98.93 | 100 | 100 |
| apps/design | 98.34 | 98.31 | 98.8 | 98.45 |
| apps/web | 100 | 100 | 100 | 100 |
| packages/sync | 100 | 96.49 | 100 | 100 |
| apps/electron | 100 | 100 | 100 | 100 |

## Deviations from the plan

- The plan had one iteration; the user added seven more (2-8), each logged with its decision.
- Added files beyond the plan tree: `note-colors`, `container-sizes`, `hover-bar`, and the files for each later iteration.
- Iteration 8's frame fix replaced the first version, where each state sized its own grid.

## Not done / follow-ups

- Implementation in the live `NoteGrid` and both apps (a new session): the grouped / not grouped toggle in the header, fixed-frame fill, the layout functions (`fillTileLayout`, `fillGrid`) are in the exploration only.
- Clicking through, a source switcher, tag colour modes in the final design and labels were not carried into iteration 8.
- The 5000-note fade was measured only for the render pause (about 100-160ms); smoothness on a real display is unverified.
- Other themes were not viewed after the outline colour change.
- The pushes of the session commits were not confirmed from the script output (it prints nothing); the PR step below pushes again.

## Harvest

- `CLAUDE.md`: added that `note-grid-sets` (final: iteration 8) is the reference for the single grid with the grouped / not grouped toggle, and that its layout code lives in the exploration until it is implemented. `README.md`: nothing needed updating.
