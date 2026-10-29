# Design board cleanup and optimize

- **Slug:** 20261029-01-design-board-cleanup-and-optimize
- **Started:** 2026.10.29 06:50
- **Completed:** 2026.10.29 07:45

## Overview

The design viewer was one long board of nine stacked sections, with its own light/dark toggle and a dotted page background. It is now a routed app: a top nav links separate pages, every page can be viewed in all nine themes through the shared theme picker, and the components have a page each behind a side nav. Along the way the theme picker became a compact pixel swatch, and the grid page now shows how a note grid snaps to the background dots, using the real code.

## What was done

- **Routing and layout (`apps/design`)**: `react-router` 8.5.1 replaces the hand-written `route.ts`. New `nav.tsx` (top nav plus `ThemeSelect`), `page-layout.tsx`, `not-found.tsx`, `exploration-route.tsx`; `/` redirects to `/guidelines`. `theme.ts`, `board.tsx` and the dark toggle are gone. Pages use the full width and the page background is plain; demos that need the dots sit in a `DemoBox`.
- **Pages**: guidelines, logo, colors (palette plus every theme at once), typography, spacing, grid, components, explorations. The "cards" guideline was removed.
- **Components section** (`src/component-pages/`): registry, side nav layout, route, and one page per shared component with richer demos: theme-select, button, select, card, app-header, loader, empty-state, error-state, state-block, progress-bar, note-grid (the old demo). Adding one is a page plus a registry line.
- **Theme picker (`packages/ui`)**: `ThemeSelect` is always compact now: a new `ThemeSwatch` (3x3 pixel square of the eight hues around the neutral grey) when closed, swatch and name in the list, names never wrap. Electron and the design header lost their fixed widths.
- **Grid page**: preset note counts give a cell in each snapping case (under 16px, 16 to 32px, over 32px); a real `NoteGrid` on a full-width dotted box is lined up by the real hook; a readout shows cell, dot spacing and rule; a "code" section shows the real `latticeSpacing` and `useDotLattice` source (through `?raw` imports) with the running line highlighted. `useDotLattice` takes an optional target element so a demo can set its own lattice instead of the page's.
- **Docs**: `CLAUDE.md` updated (design app, themes, dot lattice, test setup).

## Highlights

- The page split, react-router and "one page per component" were decided in the discussion before any code; the plan held.
- Two bugs found by looking in the browser: the swatch centre was the theme background (near-black on dark themes; now the neutral grey), and the floating header's margin collapsed through the page wrapper, adding a phantom scrollbar (`flow-root`).
- The explanation text on the grid page was reworked line by line with the user; an earlier example (70px cell to 35px) was wrong and was corrected (70 gives 23.3px).
- The `?raw` imports keep the shown code from drifting from the source, at the cost of a relative import across packages in the design app.

## Coverage

Fresh `pnpm coverage`, all seven workspaces ran and exited 0; thresholds are still 95% in every config.

| workspace | statements | branches | functions | lines |
| --- | --- | --- | --- | --- |
| apps/cache | 96.7% | 100% | 100% | 96.4% |
| apps/design | 99.44% | 98.2% | 98.36% | 99.4% |
| apps/electron | 100% | 100% | 100% | 100% |
| apps/web | 100% | 100% | 100% | 100% |
| packages/api-client | 100% | 100% | 100% | 100% |
| packages/sync | 100% | 96.49% | 100% | 100% |
| packages/ui | 99.71% | 98.93% | 100% | 100% |

## Deviations from the plan

- Steps 1 to 6 were committed together: the app only compiles once the routes, pages and registry exist.
- `/components` redirects with an inline `Navigate` in `app.tsx`; there is no `components-redirect.tsx`.
- `packages/ui` was in scope after all, at the user's request: `ThemeSelect`/`ThemeSwatch` and the `useDotLattice` target.
- Items added during the session: compact theme picker, the grid snapping demo, removal of the "cards" guideline.

## Not done / follow-ups

- The default-text and custom-text empty state demos still use full-width blocks (the user said they are fine).
- The `.dark` tokens in `globals.css` are now unused by any app and could be removed.
- Only the design viewer was checked in a browser; the web and Electron apps share the new `ThemeSelect` but were covered by tests only.

## Harvest

- **CLAUDE.md**: rewrote the `apps/design` entry (router, pages, component pages, no dark toggle, `DemoBox`); dropped "cards with a hard shadow" from the design decisions line; themes line now describes the always-compact `ThemeSelect` and says `.dark` is unused; dot-lattice entry covers the new target argument and the grid page; source layout mentions `component-pages/`; testing line notes the jsdom stubs a `Select` test needs.
- **README.md**: nothing needed updating.
