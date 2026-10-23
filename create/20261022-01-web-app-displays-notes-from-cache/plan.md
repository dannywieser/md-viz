# Plan: web app displays notes from cache

## Goal

Replace the fake notes in the web app's landing page with the notes stored in the cache service. Each cached note is one cell in `NoteGrid`; hovering a cell shows the note's title. Nothing is clickable, and the web app only displays what is already in the cache (no scan or sync).

## Scope

In:
- Load the full note list in one request (about 5000 notes) through the generated TanStack Query hook, asking only for the `title` field.
- Map each cached note to the grid's `Note` (`id`, `title`, one flat `color`), keeping the cache's order (by id).
- Loading, error and empty states in the page card.
- Update the web app tests.

Out:
- Meaning for color (decided later), click behaviour, paging, triggering scans or syncs, Electron wiring.
- Changes to the cache API, the OpenAPI spec or `NoteGrid`.
- `makeFakeNotes` stays in `@md-viz/ui` because the design viewer's demo uses it.

## Technologies

- Existing generated client `listNotesOptions` with `@tanstack/react-query` (the repo rule: never hand-write fetches).
- `NoteGrid` and `Card` from `@md-viz/ui`; Vitest + Testing Library for tests.

## Repository structure

One new component file in `apps/web/src`; two existing files change.

## Files

- `apps/web/src/CacheNoteGrid.tsx` (new) - owns the data loading: queries `title`, maps rows to grid notes and renders the loading, error and empty states or the grid.
- `apps/web/src/App.tsx` - drop the fake notes, the console logging and the query; keep only the page layout (header, `main`) and render `<CacheNoteGrid />`.
- `apps/web/tests/App.test.tsx` - replace the fake-grid tests with tests for the mapped grid, the title tooltip and the three states.

## Steps

1. Create `CacheNoteGrid.tsx` and call `useQuery(listNotesOptions({ query: { fields: 'title' } }))` and map `data` with `useMemo` to `{ id, title: fields.title ?? id, color: 0 }`. A missing title falls back to the id so the tooltip is never blank.
2. Render states, all lowercase and inside the existing `Card` frame style:
   - loading: an empty card (`loading notes`).
   - error: `could not load notes from the cache`.
   - empty: `no notes in the cache`.
   - otherwise the `NoteGrid` as today (`inset`, `frame`).
3. In `App.tsx`, remove `useEffect`, `useQuery`, `makeFakeNotes` and `FAKE_NOTE_COUNT` and render `<CacheNoteGrid />` inside `main`. `App` no longer touches the cache.
4. Rewrite the tests (through `App`, so the layout and the component are covered together): mock `fetch` with a few notes (and one without a title), assert one `.note-square` per note, the `N notes` label, the request URL (`/notes?fields=title`), the hover tooltip title (fire `pointerMove` on the svg), and the loading, error and empty states.
5. Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
6. Check in the browser with `pnpm dev:all` plus the `demo/` notes pushed to the cache, if practical.

## Open questions / risks

- jsdom has no layout, so the hover test depends on the mocked `clientWidth`/`clientHeight` and `getBoundingClientRect`; if that is awkward the tooltip check may rely on the existing `NoteGrid` tests in `packages/ui` instead.
- The cache's list has no paging; fine for ~5000 notes, revisit if it grows much larger.
- When the cache has no notes, `NoteGrid` itself would show "no notes"; the page handles the empty case before reaching it so the wording is "no notes in the cache".
