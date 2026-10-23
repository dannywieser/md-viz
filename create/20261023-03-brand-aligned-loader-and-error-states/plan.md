# Plan: brand-aligned loader and error states

## Goal
Replace the plain `Message` card used for loading, empty and error states with pixel-art states that fit the brand. Loading is a box filling with squares (aria label only, no visible text). Empty and error are a pixel-art icon plus whimsical lowercase text; error has an optional retry button. First explore options in a design-viewer exploration, then pick one, promote it to `@md-viz/ui` and swap it in everywhere.

## Scope
In:
- Exploration `states` in `apps/design`: 2-3 loader variants, 2 empty icons x text options, 3 error icons x text options, each alone and in context (inside the `NoteGrid` block's spot over the dot-grid page).
- After the user picks: new components in `packages/ui`, replacing `Message` for loading/empty/error in web, Electron and the design viewer; design guidelines and components section updated.
Out:
- Colour-coding of notes, new retry logic in apps that have none, animation libraries, the cache service.
- Text, icons and animation are squares only (no tetrominoes, no gradients).

## Technologies
- React + Tailwind v4 + `@md-viz/ui` tokens (no new dependencies).
- Pixel art from bitmap rows like `pixel-glyphs.ts`, drawn as SVG `rect`s.
- CSS keyframes with `steps()`/animation-delay for the fill; respect `prefers-reduced-motion` (static, half-filled box).
- Vitest + Testing Library (conventions in `CLAUDE.md`).

## Repository structure
```
apps/design/src/explorations/states/        (new, exploration only)
  index.ts  states.tsx  state-frame.tsx  loader-variants.ts  icon-options.ts  text-options.ts
apps/design/tests/explorations/states/      (mirrors it)
packages/ui/src/lib/pixel-icons.ts          (new, after pick)
packages/ui/src/components/pixel-icon.tsx   (new)
packages/ui/src/components/loader.tsx       (new)
packages/ui/src/components/empty-state.tsx  (new)
packages/ui/src/components/error-state.tsx  (new)
```

## Files
Phase A (exploration; the exploration may only import `@md-viz/ui` and shared design app code, so its draft loader and icons live in its own folder):
- `apps/design/src/explorations/states/index.ts` - the `Exploration` entry (slug `states`, lazy page).
- `.../registry.ts` - modified: add `states`.
- `.../states/states.tsx` - page: sections for loading, empty, error, each with the options and in-context views.
- `.../states/state-frame.tsx` - labelled frame showing one option alone or on the dot-grid page beside a `NoteGrid`-sized block.
- `.../states/loader-variants.tsx`-style data (`loader-variants.ts`) - fill orders (row by row, column by column, scattered) as pure functions returning each square's delay.
- `.../states/icon-options.ts` - bitmap rows: empty box, ghost; broken tile, cracked `.md`, sad `.md`.
- `.../states/text-options.ts` - whimsical lowercase lines for empty and error, and retry labels.
- `.../states/pixel-loader.tsx`, `.../states/pixel-art.tsx` - draft renderers (one component per file).
- Tests under `apps/design/tests/explorations/states/` for each source file.

Phase B (after the user chooses; exact file list finalised then):
- `packages/ui/src/lib/pixel-icons.ts`, `components/pixel-icon.tsx`, `loader.tsx`, `empty-state.tsx`, `error-state.tsx` + exports in `src/index.ts` + tests in `packages/ui/tests/`.
- `apps/web/src/components/cache-note-grid.tsx` - loader, empty (zero notes), error with retry (`refetch`).
- `apps/electron/src/renderer/src/app.tsx` (and its tests) - error state; retry only where there is an action to repeat.
- `apps/design/src/explorations/exploration-page.tsx`, `exploration-not-found.tsx`, `sections/components.tsx` - use the new components.
- `apps/design/src/sections/guidelines.tsx` - add a guideline for loader/empty/error; `CLAUDE.md` - update the `Message` bullet; remove `Message` if nothing uses it (decide then).
- Corresponding test updates.

## Steps
1. Draft the pixel icons, fill orders and text options as data (`icon-options.ts`, `loader-variants.ts`, `text-options.ts`) with tests.
2. Draft renderers: `pixel-art.tsx` and `pixel-loader.tsx` (aria-label only, `role="status"`, reduced-motion safe) with tests.
3. Build `state-frame.tsx` and `states.tsx` with alone and in-context views, plus `index.ts`; register in `registry.ts`; tests for each (and update the registry/index tests).
4. Run the design viewer (`pnpm dev:design`), check `/explorations/states` in light and dark, iterate with the user. **Pause: user picks loader, empty icon/text, error icon/text, retry label.**
5. Promote the chosen options to `packages/ui` (`pixel-icons.ts`, `pixel-icon.tsx`, `loader.tsx`, `empty-state.tsx`, `error-state.tsx`), export them, with a unit test per file.
6. Replace existing states in web (`cache-note-grid.tsx`; add the empty state and retry via `refetch`) and update its test.
7. Replace in Electron (`app.tsx` error) and in design (`exploration-page`, `exploration-not-found`, `components.tsx`); update tests.
8. Update the design board guideline, `CLAUDE.md`; remove `Message` if now unused.
9. Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, then `pnpm coverage` and bring every workspace to at least 95% (lines, statements, branches, functions).

## Open questions / risks
- Loop vs hold when the box is full: assumed loop; revisit in the exploration.
- Exploration must not be imported by app code, so phase B re-implements the chosen draft in `packages/ui` rather than importing it (the exploration can later import the real components).
- Electron has no retry for scan/sync errors beyond pressing the existing buttons; plan: no retry button there unless it is cheap.
- Whether `Message` stays for other one-line text (e.g. design viewer "loading…") is decided in step 8.
- Pixel icon legibility at small sizes; icons are likely ~12x12 cells.
