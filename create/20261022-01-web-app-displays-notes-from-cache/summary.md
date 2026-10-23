# Summary: web app displays notes from cache

- **Slug:** 20261022-01-web-app-displays-notes-from-cache
- **Started:** 2026-10-22
- **Completed:** 2026-10-22

## Overview

The web app's landing page now shows the notes stored in the cache service instead of 5000 fake ones. Each cached note is one cell in `NoteGrid`; hovering shows the note's title. The web app only displays what is already in the cache (no scan or sync) and has no click behaviour yet.

## What was done

- `apps/web/src/CacheNoteGrid.tsx` (new): queries `listNotesOptions({ query: { fields: 'title' } })`, maps rows to grid notes (flat color 0, id as title fallback), renders `loading notes`, `could not load notes from the cache` or `no notes in the cache` in a card, otherwise the grid.
- `apps/web/src/App.tsx`: reduced to the header and page layout; renders `CacheNoteGrid`.
- `apps/web/tests/App.test.tsx`: rewritten (6 tests: header, loading, one cell per note and request URL, hover title with id fallback, empty, error).
- `CLAUDE.md`, `README.md`: replaced statements that the web app shows fake notes / only logs the result.

## Highlights

- One cell per note in the cache's order (by id), all one flat color; what color means is decided later.
- The whole list is fetched in one request (about 5000 notes expected), so no paging.
- Data loading was moved into a nested component so `App.tsx` stays layout only.
- `makeFakeNotes` stays in `@md-viz/ui` because the design viewer's demo uses it.

## Deviations from the plan

- Also updated the stale sentence in `CLAUDE.md` (and later `README.md`) as part of the harvest.
- Plan step 6 (checking in a browser with `pnpm dev:all` and the `demo/` notes) was not done.

## Not done / follow-ups

- Visual check in a browser against real cache data.
- Decide what a cell's color means; click behaviour; paging if the cache grows far beyond ~5000 notes.

## Harvest

- `CLAUDE.md`: the intro now says the web app shows the cached notes in the grid instead of only logging them.
- `README.md`: the status paragraph says the same (grid of cached notes, loaded through the generated client).
