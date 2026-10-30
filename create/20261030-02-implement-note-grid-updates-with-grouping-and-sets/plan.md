# Plan: note grid updates with grouping and sets

## Goal

Replace the uniform `NoteGrid` with the grid designed in the `note-grid-sets` exploration (iteration 8): one square per note, a header bar with a grouped / not grouped toggle, squares coloured by the note's set, flowing shapes when grouped. The Electron app shows one such grid grouped by the sync sets, the web app one grouped by the tag sets. Before that, the sync groupings are made exclusive (one set per note), which the grid relies on. Four phases, each a stop for review.

## Scope

In:

- **Phase 1, sync sets:** `tags` and `sync` give every note exactly one set (tags: the first note tag in the source's order, by its top-level tag; sync: first match in the order `created-today`, `updated-today`, `created-last-30-days`, `updated-last-30-days`, `unchanged`; deleted notes: `deleted-today`, then `deleted-last-30-days`).
- **Phase 2, grid:** new `NoteGrid` in `packages/ui` (copy of the exploration's layout code, not a move), design `/components/note-grid` page updated, old stripe and tooltip code removed.
- **Phase 3, Electron:** one grid, sync sets, replacing the three status grids and their column layout.
- **Phase 4, web:** one grid, tag sets, replacing the grey all-notes grid.

Out:

- Stripes (colour by set only), the facet UI (the facet is fixed per app), changes to the exploration (it keeps its own copy of the layout code), changing the cache API or its schema, remembering the toggle (it starts ungrouped every time).
- Cache data needs no migration: sets are replaced on every sync.

## Technologies

Nothing new. TypeScript, React 19, Vitest, the generated cache SDK and TanStack Query helpers (web), `@md-viz/sync` (Electron, via IPC), Tailwind tokens. The layout code is pure functions copied from the exploration.

## Design of the new grid

```ts
type GridNote = { id: string; title: string }
type GridSet = { id: string; name: string; color: number; notes: GridNote[] } // color: palette index

<NoteGrid sets={GridSet[]} label? ref? onCellChange? className? />
```

- `sets` order is the group order; notes of a set stay in the given order. Empty sets are dropped before layout (the layout divides by the count). A note that is in no set (untagged) goes into a trailing grey set (`DEFAULT_NOTE_COLOR`) built by the app's data layer, not by the grid.
- Not grouped (default): all notes the same size, in `naturalOrder` of the sets, coloured by set. Grouped: `fillTileLayout`, flowing outlined shapes, smaller sets get bigger squares. Both fill the same frame (the container's size, from `useElementSize`), so toggling never resizes the block. Squares move with a transition up to `MOTION_LIMIT` notes, otherwise a fade; reduced motion fades.
- The header bar replaces both the tooltip and the label card: idle it shows `label` (optional) and the totals, hovered it shows the set colour, set name and note title. The toggle is an icon button at its right end (`GroupToggle`).
- One pointer handler derives the hovered note from the current layout, `React.memo` on the square layer, as the conventions require.
- `onCellChange` and `ref` stay for the dot lattice; `onCellChange` reports the unit of the state currently shown.
- Removed props: `notes`, `height`, `align`, `cellStep`, `compactEmpty`, `emptySize`, `label` card behaviour (`label` now only feeds the bar). An empty `sets` array shows the block with `EmptyState` filling the frame.

## Repository structure (changes)

```
packages/sync/src/pipeline/   tag-sets.ts, sync-sets.ts           (exclusive membership)
packages/sync/src/            grid-sets.ts (new), index.ts        (Electron: sets with notes from the cache)
packages/ui/src/components/   note-grid.tsx (rewritten), note-grid-bar.tsx, group-toggle.tsx (new)
packages/ui/src/lib/          grid-layout files copied from the exploration (see Files), tag-stripes.ts and tooltip-shift.ts removed
packages/ui/src/hooks/        use-grid-lattice.ts (types only if needed)
apps/design/src/              component-pages/note-grid-page.tsx, sections/lattice-demo.tsx
apps/electron/src/            shared/ipc.ts, main/ipc.ts, preload, renderer: new grid component, hook, old status grids removed
apps/web/src/                 hooks/use-dashboard.ts, lib/grid-note.ts -> lib/grid-sets.ts, components/
```

## Files

Phase 1 (sync):

- `packages/sync/src/pipeline/tag-sets.ts` - a note belongs only to the set of its first tag's top level; `known` empty sets stay.
- `packages/sync/src/pipeline/sync-sets.ts` - first match wins in the new order; rank order updated to match; deleted and `unchanged` unchanged in meaning; file source still has no `created-` sets.
- `packages/sync/tests/pipeline/tag-sets.test.ts`, `sync-sets.test.ts`, `groupings.test.ts`, `sync.test.ts` - exclusivity cases (note with several tags, created and updated today, created 20 days ago and updated today, deleted, no tags).
- `packages/sync/README.md`, `apps/cache/README.md`, `CLAUDE.md` - the grouping text (the `sync` list in the new order, "exclusive").

Phase 2 (grid and design demo):

- `packages/ui/src/lib/grid-layout/` (new folder): `fill-grid.ts` (from `flow-layout.ts`), `tile-layout.ts` (`placeTiles`, `fillTileLayout`), `space-shares.ts` (from `scaled-slots.ts`), `natural-order.ts`, `group-states.ts` - only what grouped and natural layout need; the exploration's unused iterations are not copied. Copied, not imported, because explorations are never imported from shared code.
- `packages/ui/src/lib/note-colors.ts` - `colorVar` equivalent for set colours if missing.
- `packages/ui/src/components/note-grid.tsx` - rewritten (see design above). Keeps the agreed `Cells` memo exception only if still needed in the file; otherwise one component per file with `note-grid-squares.tsx`.
- `packages/ui/src/components/note-grid-bar.tsx`, `group-toggle.tsx` - header bar and toggle, one component per file.
- `packages/ui/src/index.ts` - exports `GridSet`, `GridNote`; drops `Note`.
- `packages/ui/src/lib/fake-notes.ts` - `makeFakeSets`.
- remove `packages/ui/src/lib/tag-stripes.ts`, `tooltip-shift.ts`, their tests, and the stripe/tooltip bits of the old grid tests; `tagColorIndexes` stays (the sync check test uses `topLevelTag`).
- `apps/design/src/component-pages/note-grid-page.tsx` - demos: size slider, set count, grouped / ungrouped, empty, one set, many sets; `sections/lattice-demo.tsx` and `source-excerpt.ts` follow the new API.
- tests: one per new source file in `packages/ui/tests/`, updated design page and lattice-demo tests.
- `apps/design/src/sections/guidelines.tsx` if a guideline mentions the tooltip or label card.

Phase 3 (Electron):

- `packages/sync/src/grid-sets.ts` - `loadGridSets(cacheUrl, source, grouping)`: `listSets`, then `getSet` per set and one `listNotes` (titles; `grouping=sync` includes deleted notes), returning `{ id, name, color, notes }[]` ordered by rank; exported from the package entry.
- `apps/electron/src/shared/ipc.ts` (channel `sets`, `Api.sets`), `src/main/ipc.ts`, `src/preload/index.ts` - forward it; main passes the cache URL.
- `renderer/src/hooks/use-sets.ts` - loads the sets of the current source after every sync and on open; errors go to `onError`.
- `renderer/src/components/sync-grid.tsx` - the single `NoteGrid`, filling the area under the card (replaces `sync-grids.tsx`, `status-grid.tsx`; `lib/cells.ts`, the column helpers in `lib/sync-layout.ts` and `COLUMN_WIDTH` / `COLUMN_GAP` in `shared/window-size.ts` go; the window size stays). `app.tsx` composes it; `SyncOverlay` still covers it while syncing.
- tests mirroring each, plus `app.test.tsx` composition, `packages/sync/tests/grid-sets.test.ts`.
- `CLAUDE.md` Electron paragraphs (three status grids, columns, lattice text) updated; the design explorations `sync-layout` / `states` stay as the record.

Phase 4 (web):

- `apps/web/src/lib/grid-sets.ts` (replaces `grid-note.ts`) - builds `GridSet[]` from the cache's `tags` sets plus a trailing grey `untagged` set for notes in no set.
- `apps/web/src/hooks/use-dashboard.ts` - `listSets({ grouping: 'tags' })`, `getSet` per set (`useQueries`) and `listNotes({ fields: 'title' })`; status pending / error / ready as today.
- `apps/web/src/components/all-notes-grid.tsx` becomes `tag-grid.tsx` (rename, kebab-case); `dashboard.tsx` composes it; `useGridLattice` unchanged.
- tests for each, `CLAUDE.md` web paragraphs updated.

## Steps

Phase 1 - exclusive sets

1. Tests first: exclusive tag sets and sync sets in the new order (failing).
2. `buildTagSets`, `buildSyncSets`; `groupings` / `sync` tests green.
3. Docs: both READMEs and `CLAUDE.md`.
4. `pnpm format`, `lint`, `typecheck`, coverage for `packages/sync`. **Stop for review.**

Phase 2 - new grid and design demo

5. Copy the layout functions into `packages/ui/src/lib/grid-layout/` with a test file each (the exploration's tests are the starting point).
6. `GroupToggle`, `NoteGridBar`, and the new `NoteGrid` (+ squares layer), `GridSet` types, exports, `makeFakeSets`; tests for each.
7. Remove the stripe, tooltip and old-prop code and their tests.
8. Update the design `note-grid` page, `lattice-demo`, `source-excerpt` and tests; check the page in the browser (toggle, hover bar, 5000 notes, themes).
9. Format, lint, typecheck, coverage for `packages/ui` and `apps/design`. **Stop for review.** (The apps do not build between 6 and 10; Phases 3 and 4 then fix them in turn, so the repo's `typecheck` fails until Phase 4 unless step 9a below is done.)
   - 9a. To keep every phase green, a thin interim adapter in each app maps its notes into one grey set; it is replaced in Phases 3 and 4.

Phase 3 - Electron

10. `loadGridSets` in the package with tests, then the IPC channel, preload and main handler with tests.
11. `use-sets` hook, `sync-grid` component, `app.tsx` composition; remove the three-column grids and layout helpers; update tests.
12. Run the app (`pnpm dev:all`, with the demo folder and a sync) and check ungrouped / grouped, colours, hover bar, overlay, theme change, fixed window.
13. Format, lint, typecheck, coverage for `packages/sync` and `apps/electron`; `CLAUDE.md`. **Stop for review.**

Phase 4 - web

14. `grid-sets` lib, `use-dashboard` with sets, tag grid component, dashboard; tests.
15. Run the web app against the cache with synced notes (tags grouping, untagged grey set, loading and error states, dots lattice).
16. Format, lint, typecheck; `CLAUDE.md`. **Stop for review.**

17. Final step: `pnpm coverage` and bring every workspace to at least 95% (lines, statements, branches, functions) without lowering a threshold.

## Open questions / risks

1. **Sets across sources (web), decided:** the cache can hold `bear` and `file` sets with the same id. Proposed: the set name is its id, prefixed with the source (`bear:daily`) only when both sources have sets; the set is keyed by source and id.
2. **N+1 requests (web):** the grid needs each set's note ids, so the web app makes one `getSet` per tag set. Fine for dozens of tags; if there are hundreds a cache endpoint that returns the note ids with the sets would be the fix (a separate change).
3. **Many sets:** the palette has 24 hues, so sets beyond 24 repeat colours (existing behaviour); tiny sets get big squares in grouped mode and a very large number of sets can make `fillTileLayout`'s search slow (`scaleCombos` is a product of candidates per set). The exploration tested up to 5000 notes but with few sets; Phase 2 must test tens of sets and, if needed, cap the search (e.g. fall back to the rounded sizes above a set-count limit).
4. **Duplicated layout code:** the exploration keeps its copy (you asked to leave it), so the functions exist twice; later the exploration could import from `@md-viz/ui`.
5. **Lattice dots:** the grouped and natural states have different units, so the page dots move when toggling; `onCellChange` reports the shown state's unit.
6. **Electron `state.json` / `LastSync.notes`** (updated / deleted / unchanged lists) is no longer shown; left in place, removing it is a separate change.
7. **Stale cache sets:** a database synced before Phase 1 has overlapping sets until the next sync replaces them; the grid takes a note's first set in rank order meanwhile.
