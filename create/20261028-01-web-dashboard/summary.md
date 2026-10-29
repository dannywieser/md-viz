# Summary: web dashboard

- **Slug:** 20261028-01-web-dashboard
- **Started:** 2026.10.28
- **Completed:** 2026.10.28

## Overview

The web app's home page was a single grid of every cached note. It is now a dashboard of five independent, floating `NoteGrid`s: the four automatic note sets (created today, created last 30 days, modified today, modified last 30 days) and a grid of all notes. Everything comes from the existing cache API through the generated client; no cache changes. The layout is a plain CSS grid that fills the window with no page scroll, to be iterated on later.

## What was done

- `apps/web/src/lib/dashboard-sets.ts`: the four sets (names, labels, display order), `pickSource` (bear, else file) and `setsFor` (the sets the cache holds, so the file source simply has no created grids).
- `apps/web/src/hooks/use-dashboard.ts`: loads note titles and set summaries; `status` (pending / error / ready) and `retry`.
- `apps/web/src/components/`: `dashboard.tsx` (grid `2fr 2fr 1fr`, two rows: sets in the first two columns, all notes spanning both rows of the third; the page dots follow the all-notes grid), `set-grid.tsx` (loads one set, maps its ids to cached notes, own loader / error state), `all-notes-grid.tsx`. `cache-note-grid.tsx` removed.
- `apps/web/src/app.tsx`: renders `Dashboard`; `main` is now `px-4 py-6` so its side padding matches the header's `mx-4`.
- `packages/ui/src/components/note-grid.tsx`: the tooltip's edge clamp uses `documentElement.clientWidth` instead of `window.innerWidth`.
- Tests for every new or changed source file; `CLAUDE.md` updated; `origin/main` (PR #15) merged into the branch, with the `CLAUDE.md` and `create/README.md` conflicts resolved.

## Highlights

- Source selection is derived from the cache's sets (bear first) instead of a setting; a switcher can replace it later.
- Grids size independently on purpose (an experiment). Only the all-notes grid, which always holds the most notes, drives the dot lattice, so the dots line up with that grid only.
- Tooltip flicker at the right edge: the clamp used `innerWidth`, which includes a classic scrollbar, so a long tooltip overflowed the page, added a scrollbar, resized the grid and repeated. Fixed with a regression test (failed before, passes now). It could not be reproduced visually in the browser pane (overlay scrollbars), so it is verified by unit test only.
- Checked in the browser against the real Bear cache (4874 notes; sets of 1 / 193 / 2 / 583) at 1024x768 and 1440x900: no scroll, no console errors, header and grid area share the same side edges.

## Coverage

`pnpm coverage` exits 0; threshold 95% for statements, branches, functions and lines in every workspace.

| Workspace | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| apps/cache | 96.2 | 100 | 100 | 95.89 |
| apps/design | 99.56 | 100 | 98.27 | 99.54 |
| apps/electron | 100 | 100 | 100 | 100 |
| apps/web | 100 | 100 | 100 | 100 |
| packages/api-client | 100 | 100 | 100 | 100 |
| packages/sync | 100 | 97.59 | 100 | 100 |
| packages/ui | 99.62 | 99.35 | 100 | 100 |

## Deviations from the plan

- `SetGrid` has no lattice ref / cell props: the dots always follow the all-notes grid (it always has the most notes), so the plan's "grid with the most notes" collapsed to that one.
- Two fixes after the first implementation, at the user's request: the tooltip flicker (in `packages/ui`, outside the web app) and the header / body padding mismatch.
- `origin/main` was merged into the branch before completion because PR #15 conflicted in docs.

## Not done / follow-ups

- The all-notes grid is a full-height narrow column of very small cells, not the "smaller card" originally pictured; the layout is to be iterated on.
- No source switcher and no click-through yet.
- The tooltip flicker fix is not confirmed on a machine with classic (always visible) scrollbars.

## Harvest

- `CLAUDE.md`: intro and `apps/web` structure entry describe the dashboard (components, source choice, `main` padding matching the header); the lattice paragraph says the dashboard sizes its grids independently with only the all-notes grid setting the dots; the `NoteGrid` tooltip description records the `clientWidth` gotcha. `README.md`: nothing needed updating.
