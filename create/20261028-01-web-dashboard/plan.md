# Plan: web dashboard

## Goal

Replace the web app's single all-notes grid with a dashboard of five independent `NoteGrid`s: the automatic sets (created today, created last 30 days, modified today, modified last 30 days) and a smaller grid of all notes. Everything comes from the cache through the generated client. The first version is a plain CSS grid of floating blocks that scales to fit the window; we iterate on layout later.

## Scope

In:
- Five grids, each sized independently and floating on the page background (`NoteGrid` with `label`, no `height`, so it fills its cell).
- One source for now, chosen from the sets in the cache: `bear` if any `bear:*` set exists, else `file`. For `file` the created sets do not exist in the cache, so those grids are simply not shown.
- Hover tooltip with the note title (already built into `NoteGrid`). The all-notes grid is smaller than the others.
- Loading, error (with retry) and empty states using `Loader` / `ErrorState`.
- No page scroll; the grids scale to the window.

Out:
- Source switcher, click-through, routing, live refresh, new cache endpoints.
- Sharing one cell size across grids (independent sizing is the experiment).

## Technologies

React 19 + TanStack Query with the generated helpers (`listNotesOptions`, `listSetsOptions`, `getSetOptions` from `@md-viz/api-client/cache/react-query`), `NoteGrid` / `useGridLattice` / `StateBlock` etc. from `@md-viz/ui`, Tailwind for the CSS grid. No new dependencies.

## Repository structure

```
apps/web/src/
  app.tsx                      (modified)
  components/
    cache-note-grid.tsx        (removed, replaced by the dashboard)
    dashboard.tsx              (new)
    set-grid.tsx               (new)
    all-notes-grid.tsx         (new)
  hooks/
    use-dashboard.ts           (new)
  lib/
    dashboard-sets.ts          (new)
apps/web/tests/
  app.test.tsx                 (modified)
  components/dashboard.test.tsx, set-grid.test.tsx, all-notes-grid.test.tsx (new; cache-note-grid.test.tsx removed)
  hooks/use-dashboard.test.tsx (new)
  lib/dashboard-sets.test.ts   (new)
```

## Files

- `lib/dashboard-sets.ts` - the four set names in display order with their labels (`created today`, `created last 30 days`, ...), `pickSource(sets)` (bear preferred, else file, else none) and `setsFor(source, summaries)` (the defined sets present in the cache, with ids and counts). Labels are lowercase per the design guidelines.
- `hooks/use-dashboard.ts` - fetches `listNotes` (fields `title`) and `listSets` once, returns `{ notes, sets, source, status, retry }`; the note title lookup is built here.
- `components/set-grid.tsx` - one set: `getSetOptions({ path: { id } })`, maps the member ids to `Note`s through the title lookup (unknown ids skipped), renders a labelled `NoteGrid` (own loader / error state). Takes optional `gridRef` / `onCellChange`.
- `components/all-notes-grid.tsx` - the smaller labelled `NoteGrid` of all notes (`all notes`).
- `components/dashboard.tsx` - uses `useDashboard`, shows the page-level loader / error / empty state, otherwise a CSS grid (`min-h-0`, rows and columns `1fr`, fills `main`) with the set grids and the all-notes grid in the last cell. The grid with the most notes is the reference for the page's dot lattice (`useGridLattice`, `ref` + `onCellChange`); the others do not align (to be judged when we look at it).
- `app.tsx` - renders `Dashboard` instead of `CacheNoteGrid`.
- Tests: one file per source file as above (mock react-query / SDK hooks at the boundary; `NoteGrid` mocked in the component tests like the existing test).

## Steps

1. `lib/dashboard-sets.ts` with its unit tests (source choice, file source has no created sets, order, missing sets).
2. `hooks/use-dashboard.ts` with its unit tests (loading, error + retry, title lookup).
3. `components/set-grid.tsx` and `components/all-notes-grid.tsx` with their unit tests (labels, notes mapped to titles, loading / error states).
4. `components/dashboard.tsx` with its unit tests (states, which grids appear for bear / file, reference grid for the lattice); `app.tsx` and `app.test.tsx` updated; remove `cache-note-grid.tsx` and its test.
5. Run the web app against a populated cache (`pnpm dev:cache`, `pnpm dev`) and look at the layout in the browser; fix sizing issues (no scroll, grids fit).
6. Update `CLAUDE.md` (project intro and the web app description: dashboard instead of the single grid) and run `pnpm format`, `pnpm lint`, `pnpm typecheck`, then `pnpm coverage`, bringing every workspace to at least 95% (lines, statements, branches, functions).

## Open questions / risks

- Source choice is derived from the cache (bear preferred). A fixed setting or the switcher can replace it later.
- Only one grid can drive the dot lattice; with independent cell sizes the dots will match only that grid. Accepted for the experiment.
- Fetching each set separately is five requests at most; fine for a homelab, revisit if it matters.
- A note in a set but missing from the notes list (race during a sync) is skipped.
