# Plan: design exploration for background

## Goal
The page background (grid paper, `bg-grid` on `body`) competes with the note grid, which is now the focus of the app. Explore quieter, less busy alternatives (mainly subdued dots, some scaling with the note-grid cell size) on a separate route of the design app, then pick one together and apply it to the design system.

## Scope
In:
- A `/background` route in `apps/design` (the board stays at `/`) with a link to it from the board.
- Candidate background variants, each previewed in light and dark with mock cards.
- Afterwards, with the user's decision: update the `bg-grid` utility / tokens in `packages/ui/src/styles/globals.css`, the board's grid section and the guidelines list.

Out:
- Animated or data-driven backgrounds.
- Changes to the note grid itself.
- A router dependency.
- Applying a variant to the apps before the decision is made.

## Technologies
- React + Tailwind v4 in `apps/design`, as is.
- Pathname switch in `App.tsx` (no router library): two routes do not justify one. Switch to a router if more exploration pages come.
- Variants are plain CSS (`radial-gradient` dots, `linear-gradient` lines) driven by CSS variables, scoped to the exploration page so `globals.css` is untouched until the decision.

## Repository structure
```
apps/design/src/
  App.tsx                      (modified: route switch, link)
  Board.tsx                    (new: current App body moved here)
  routes/Background.tsx        (new: exploration page)
  routes/background-variants.ts (new: variant definitions)
apps/design/tests/
  App.test.tsx                 (modified)
  Background.test.tsx          (new)
```
After the decision: `packages/ui/src/styles/globals.css`, `apps/design/src/sections/Grid.tsx`, `apps/design/src/sections/Guidelines.tsx`.

## Files
- `apps/design/src/App.tsx` - choose the page from `location.pathname` (`/background` or the board); keep header and theme toggle shared.
- `apps/design/src/Board.tsx` - the existing board sections, moved out of `App.tsx`, plus a link to `/background`.
- `apps/design/src/routes/background-variants.ts` - list of variants: name, description, CSS (`background-image`/`size`) using scoped variables.
- `apps/design/src/routes/Background.tsx` - for each variant a light and a dark swatch (scoped `.dark` wrapper) showing a mock page with (a) one grid card and (b) several cards of different sizes; a control for dot opacity/size optional.
- `apps/design/tests/*` - route switching and that every variant renders.

## Variants
1. dots at the 16px intersections
2. dots at intersections with a larger dot every 5th
3. sparser dots (32px)
4. current lines, much fainter
5. flat background (baseline)
6. dots whose spacing is derived from the note-grid cell size, so the page background scales with the notes
Plus the current `bg-grid` as the reference.

## Steps
1. Move the board into `Board.tsx`; add the pathname switch in `App.tsx` and the link; keep tests green.
2. Add `background-variants.ts` with the variant CSS, using scoped variables.
3. Build `Background.tsx`: variant swatches in light and dark, single-card and multi-card mock layouts.
4. Tests for routing and rendering of all variants; run `pnpm format`, `lint`, `typecheck`, `test`; view in the design viewer.
5. Review together and choose a variant (or tweak values).
6. Apply the decision: update `bg-grid` and tokens in `globals.css`, the `Grid` section, the guidelines list, and the "grid" mentions in `CLAUDE.md`; check the web and Electron apps. Run the full checks.

## Open questions / risks
- Routing and board link were not answered; assumed the pathname switch and a link on the board. Say if you want otherwise.
- Dot contrast must differ in light and dark; the dark mode minor line equals the card color, so a dot there needs checking against cards (see the `bg-grid` + `bg-background` convention in `CLAUDE.md`).
- Scaling with the note grid depends on how `NoteGrid` picks its cell size (it fills its container), so the background cannot know it in pure CSS; likely the page sets a shared `--grid-size` or the card exposes one. Verify in step 2.
- Vite dev server must serve `/background` (SPA fallback is default for `vite`; check `vite preview`).
