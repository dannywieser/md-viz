# Plan: note grid sets exploration

## Goal

Explore, as a design exploration only, how one grid can be the foundation of both apps and switch between modes: sets drawn as sized squares (one block per set, sized by note count, kept on the background dot lattice), a grouped variant (every note still a square, clustered and coloured by set), and the colour modes (by set, by tag, both striped). Also explore labelling without the header card, with labels that are always visible once a block is big enough. The live `NoteGrid`, the apps and the packages do not change; the exploration builds its own throw-away grid from fixed, generic sample data.

## Scope

In:

- A new exploration `note-grid-sets` in `apps/design`, built from several iterations that stay on the page (newest on top).
- Iteration 1: sized squares (three sizing rules, lattice alignment), the grouped variant, colour by set / by tag with striping, and label treatments (inside the block, tab on the top edge, legend strip, threshold with hover).
- A mode switch on the page, so one grid can be flipped between the modes.
- Fixed, generic sample data: sets are customisable, so they are `set a`, `set b`, ... with different sizes, not today / last 30 days.
- A rule in `CLAUDE.md`: explorations keep every iteration, new sections go on top and the earlier ones move down.

Out:

- Any change to `NoteGrid`, `packages/ui`, `apps/web`, `apps/electron`, the cache or the sync.
- Real data, a source switcher, click-through, saving a chosen mode.
- A note in more than one set in the sized view (one set per note there; the colour-by-set mode may stripe up to three sets).

## Technologies

Same as the rest of `apps/design`: React, Tailwind tokens from `@md-viz/ui` (theme colours via `noteColors`, never hard-coded), SVG drawing with `shapeRendering="crispEdges"`, `useDotLattice` / `latticeSpacing` / `stripeHeights` / `tagColorIndexes` from `@md-viz/ui` where they fit. No new dependencies. Explorations may import `@md-viz/ui` and shared app code, never another exploration.

## Sizing maths (the core question)

The dots are a whole multiple of one cell (`latticeSpacing`), so any block whose side is a whole number of cells has its corners on dots. The exploration uses one cell for the whole grid and compares how a set of `n` notes becomes a block of cells:

- `round`: side = `round(sqrt(n))` (50 -> 7x7 = 49 cells, a little smaller than the count);
- `ceil`: side = `ceil(sqrt(n))` (50 -> 8x8 = 64 cells, a little bigger);
- `rectangle`: the near-square rectangle with at least `n` cells (50 -> 7x8 = 56, 12 -> 3x4).

Blocks are packed left to right in rows (shelf packing) on the cell lattice, largest first; the cell is the largest whole pixel size at which the packed blocks fit the width x height container (same idea as `layoutGrid`). Whole-px cells keep every block edge on a dot.

## Repository structure

```
apps/design/src/explorations/note-grid-sets/
  index.ts                      Exploration (slug, title, description, lazy Page)
  note-grid-sets-page.tsx       the page: renders the iterations, newest first
  iterations.ts                 the list of iterations (id, title, date, Component)
  iteration-section.tsx         wrapper for one iteration (heading, date, children)
  iteration-1.tsx               iteration 1: composes the four sections below
  sizing-section.tsx            three sizing rules side by side
  grouping-section.tsx          grouped variant
  colour-section.tsx            colour by set / by tag with the mode switch
  labels-section.tsx            the label treatments
  mode-switch.tsx               small segmented switch (buttons) used by the sections
  lattice-stage.tsx             a container with the bg-dots lattice set from its grid
  sized-grid.tsx                svg: one block per set, label modes
  grouped-grid.tsx              svg: every note as a square, clustered by set
  striped-set-grid.tsx          svg: every note as a square, coloured by set or tag, striped
  block-label.tsx               label text inside / on a tab of a block
  legend-strip.tsx              legend strip beside or below the grid
  grid-tooltip.tsx              the one shared tooltip
  sample-sets.ts                generic sample sets and notes (fixed)
  block-shapes.ts               size rules: round, ceil, rectangle
  pack-blocks.ts                shelf packing and the largest fitting cell
  label-fit.ts                  whether a label fits a block (threshold for always-visible)
apps/design/tests/explorations/note-grid-sets/   one test file per source file above
```

## Files

Create everything in the tree above. Modify:

- `apps/design/src/explorations/registry.ts`: add `noteGridSets` (one line plus the import).
- `CLAUDE.md`: in the design / explorations paragraph add the iteration rule (every iteration kept, new sections added on top, older ones moved down, never replaced), and mention `note-grid-sets`.
- `apps/design/tests/explorations/registry.test.ts`: only if it lists slugs explicitly.

## Steps

1. Add the `CLAUDE.md` rule about keeping every iteration of an exploration.
2. Pure logic with tests: `block-shapes.ts`, `pack-blocks.ts`, `label-fit.ts` (cases: 50 notes in all three rules, tiny sets (1, 2 notes), a huge set, nothing fits, whole-px cell, every block corner a multiple of the cell).
3. Sample data `sample-sets.ts` (generic sets, one set per note, tags per note, sets sized 1 to ~120) and its test (every note in exactly one set, fixed counts).
4. `sized-grid.tsx` with `lattice-stage.tsx`, `grid-tooltip.tsx`, `block-label.tsx`, `legend-strip.tsx` and their tests; the three sizing rules shown by `sizing-section.tsx`.
5. `grouped-grid.tsx` and `grouping-section.tsx` (notes ordered by set, same set = same colour, group outline) with tests.
6. `striped-set-grid.tsx`, `mode-switch.tsx` and `colour-section.tsx`: colour by set and by tag, striping with `stripeHeights`, a note in up to three sets in the by-set stripes; tests.
7. `labels-section.tsx`: inside-block text, tab on the top edge, legend strip, always visible above the `label-fit` threshold with hover for the rest, and no header card; tests.
8. `iteration-section.tsx`, `iteration-1.tsx`, `iterations.ts`, `note-grid-sets-page.tsx`, `index.ts`, registry entry; tests (iterations render newest first, the registry lists the exploration).
9. Look at it in the running design viewer (`pnpm dev:design`) in a few themes and window sizes; check dot alignment and fix problems.
10. Run `pnpm format`, `pnpm lint`, `pnpm typecheck` and `pnpm coverage`; bring every workspace to at least 95% (lines, statements, branches, functions) without lowering a threshold or widening an exclusion.

## Open questions / risks

- Shelf packing leaves gaps at the ends of rows; the exploration shows them as page background (dots). If it looks poor, a later iteration can try other packing (that is what the page structure is for).
- Sets of 1 to 3 notes get tiny blocks; labels there fall back to hover or the legend strip.
- One component per file means many small files; the section components stay presentational and the logic sits in the `.ts` files.
- The exploration's grid is separate from `NoteGrid` on purpose; conclusions would become a later change to the real component.
- The tooltip and pointer handling follow the convention (one handler deriving the item from the layout, one shared tooltip), even though sample data is small.
