# brand-aligned loader and error states

- **Slug:** 20261023-03-brand-aligned-loader-and-error-states
- **Started:** 2026-10-23 15:48:07 · **Completed:** 2026-10-23 16:13:58

## Overview

Loading, empty and error states were one plain `Message` card. They are now pixel-art components in `@md-viz/ui` that use the note grid palette: a well filling with squares (one of four fills picked at random per load), a palette-filled ghost, and a broken tile with a palette crack. The options were explored first in a design exploration (`/explorations/states`), the user picked, and the picks replaced the old states in the web app, the Electron app and the design viewer.

## What was done

- **Exploration** (`apps/design/src/explorations/states/`, registered in `registry.ts`): loader fills (rows, columns, scatter, drop) alone and in the grid block, a random loader with "load again", empty icons (box, ghost), error icons (broken tile, cracked .md, sad .md), text and retry-label pickers; icons for the ghost and tile coloured with the note palette. It now imports `Loader` and `loaderFills` from `@md-viz/ui`.
- **`packages/ui`**: `Loader`, `EmptyState`, `ErrorState` (`detail`, `onRetry`, `action`), `StateBlock`, `PixelIcon`, `lib/loader-fills.ts`, `lib/pixel-icons.ts`, `lib/note-colors.ts` (avoids an import cycle); `Message` removed; `NoteGrid`'s empty block shows `EmptyState`.
- **Apps**: web `CacheNoteGrid` (loader, error with retry via `refetch`); Electron `app.tsx` (error state, no retry); design `exploration-page`, `exploration-not-found`, board `components.tsx`.
- **Docs**: design guideline "loading, empty and error states", `CLAUDE.md`, `README.md`.
- **Tests**: one per new source file, updated tests for the changed ones; draft loader tests moved from design to ui.

## Highlights

- Loader is square-only (no tetrominoes), no visible text, SMIL animation with a static half-filled well under reduced motion. The same fill repeats for the whole load because it is picked once on mount.
- "falling in random rows" was read as random columns (seeded shuffle, so deterministic).
- Colour: loaders use the note palette, one colour per piece of 4 squares; ghost one colour per row; only the crack of the broken tile is coloured.
- The exploration's frames initially drew a second dot grid over the page's; removed.

## Coverage

Fresh `pnpm coverage` exit 0; all six workspaces ran; thresholds (95% in each config) unchanged.

| workspace | statements | branches | functions | lines |
| --- | --- | --- | --- | --- |
| apps/cache | 100% | 100% | 100% | 100% |
| packages/api-client | 100% | 100% | 100% | 100% |
| packages/ui | 99.57% | 98.49% | 100% | 100% |
| apps/design | 99.39% | 100% | 98.9% | 99.35% |
| apps/electron | 100% | 98.13% | 100% | 100% |
| apps/web | 100% | 100% | 100% | 100% |

## Deviations from the plan

- `ErrorState` got an `action` slot (for the not-found link); `Message` was removed outright.
- Loader fills moved into `@md-viz/ui` and the exploration reuses them, so its own draft loader files were deleted.
- Extra palette work on the loader/icons and a "drop" fill, requested during the session.
- Empty text and retry label were not chosen by the user; defaults used ("the notes went out for coffee", "try again").

## Not done / follow-ups

- Electron has no retry button on its error state.
- Empty state in the small Electron sync grids (deleted/unchanged) uses the generic coffee line; may want specific text.
- Nothing committed.

## Harvest

- `CLAUDE.md`: replaced the `Message` convention with the new state components and their rules; `NoteGrid` empty block now an `EmptyState`.
- `README.md`: the design viewer line pointed at `/background`; now describes `/explorations`.
- Design guidelines (`guidelines.tsx`): added the states guideline, updated the floating note grid wording.
