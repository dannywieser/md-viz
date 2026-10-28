# Plan: colorize grid blocks by tags

## Goal

Color the note grid blocks by the notes' tags, in the web app and the Electron app. Each tag gets a
color index when the notes are synced; the mapping is stored in the cache, so later syncs and both
apps use the same colors. A block with several tags is striped horizontally (first 3 tags);
untagged notes are a neutral grey. On top of that, both apps get a theme switcher: a theme replaces
the whole UI token set and provides 20+ note colors, so one tag keeps its color index across themes.
The work starts with a design exploration of the themes, and implementation begins once the user
has chosen from it.

## Scope

In:

- Design exploration `note-palettes` (themes, 20+ note colors each, striped blocks at small sizes).
- Themes starting from the mdm `palettes.ts` (dracula, gruvbox, nord, catppuccin, solarized, gotham,
  ocean, highContrast); Solarized stays the default. The exploration decides which ship.
- `NoteGrid`: several colors per note (horizontal stripes, first 3), neutral default, tooltip with
  title and all tags.
- Cache: tag-color mapping (storage, routes, spec, README).
- Sync package: assign indexes to new tags, keep known ones, push the mapping; `NoteRef` gets
  `tags`; the last sync in `state.json` keeps the tags and the tag-color mapping.
- Web dashboard and Electron status grids colored by tags.
- Theme switcher (`ThemeSelect`) in the header of both apps, persisted per app.
- Design board and guidelines updated.

Out:

- A legend, tag filtering or clicking a tag.
- Manual tag colors, recoloring a tag, freeing the index of unused tags.
- Sharing the theme choice between apps through the cache.
- A light/dark toggle in the apps (they follow the system, see risks).

## Technologies

- Existing stack only: TypeScript, React, Tailwind v4 CSS variables, Hono + zod-openapi, `node:sqlite`,
  hey-api generated client, vitest.
- Themes are TypeScript data in `packages/ui` applied at runtime as CSS variables on `<html>`
  (`applyTheme`), with Solarized still in `globals.css` as the no-flash default.
- No new dependencies.

## Repository structure

```
apps/design/src/explorations/note-palettes/   (new: index.ts, page, theme data, preview components)
apps/design/tests/explorations/note-palettes/
packages/ui/src/lib/themes.ts, apply-theme.ts, tag-stripes.ts   (new)
packages/ui/src/hooks/use-theme.ts                              (new)
packages/ui/src/components/theme-select.tsx                     (new)
apps/cache/src/{store,schemas,app,openapi}.ts, openapi.json, README.md   (tag colors)
packages/sync/src/pipeline/tag-colors.ts                        (new)
packages/sync/src/{types,state,run}.ts, pipeline/{notes,sync}.ts, README.md
apps/web/src/{hooks/use-dashboard.ts,components/*}, header
apps/electron/src/renderer/src/components/*, hooks/*, src/shared/ipc.ts
```

## Files

Exploration (design app):

- `apps/design/src/explorations/note-palettes/index.ts` - the `Exploration` (slug, title, description, lazy `Page`).
- `.../note-palettes-page.tsx` - the page: theme and mode pickers, one panel per theme.
- `.../candidate-themes.ts` - candidate themes: UI roles from the mdm file plus published accents and the derived 20-24 note colors.
- `.../theme-panel.tsx` - one theme: UI sample (header, card, button) and the note colors.
- `.../color-strip.tsx` - the numbered swatches of a theme's note colors.
- `.../striped-grid.tsx` - throwaway striped grid (1-3 stripes) at several cell sizes, to judge small squares.
- `apps/design/src/explorations/registry.ts` - one line to register it.

Implementation (after the user chooses):

- `packages/ui/src/lib/themes.ts` - the chosen themes: UI tokens and note colors per light/dark variant, `DEFAULT_THEME`.
- `packages/ui/src/lib/apply-theme.ts` - sets the tokens and `--note-N` on `<html>`, toggles `.dark`.
- `packages/ui/src/lib/tag-stripes.ts` - splits a cell into stripe heights (whole pixels) for 1-3 colors.
- `packages/ui/src/hooks/use-theme.ts` - current theme from `localStorage`, applies it, setter.
- `packages/ui/src/components/theme-select.tsx` - the switcher (`Select`).
- `packages/ui/src/components/note-grid.tsx` - `Note` gets `colors: number[]` and `tags: string[]`; stripes; tooltip with title and tags; `DEFAULT_NOTE_COLOR` becomes the neutral index.
- `packages/ui/src/lib/note-colors.ts`, `styles/globals.css` - `NOTE_COLORS` raised to the chosen count; `--note-N` and `.note-square` rules for all N; neutral entry.
- `packages/ui/src/index.ts` - exports.
- `apps/cache/src/store.ts`, `schemas.ts`, `app.ts`, `openapi.ts`, `openapi.json`, `README.md` - `tag_colors` table, `GET /tag-colors`, `PUT /tag-colors` (insert-only upsert of `{ tag, color }` rows).
- `packages/sync/src/pipeline/tag-colors.ts` - `assignTagColors(existing, tags)`: known tags keep their index, new tags take the next index in a far-apart order, wrapping around.
- `packages/sync/src/pipeline/notes.ts`, `sync.ts`, `run.ts` - read the mapping from the cache, assign, push it before the notes; nothing recorded when listing or pushing fails; `tags` in `NoteRef`; the result carries `tagColors`.
- `packages/sync/src/types.ts`, `state.ts`, `README.md` - `NoteRef.tags`, `LastSync.tagColors`; state files without them still load (tags `[]`, no colors).
- `apps/web/src/hooks/use-dashboard.ts`, `components/*`, `app.tsx` - fetch tag colors and tags, build `colors` and `tags` per note; switcher in `AppHeader`.
- `apps/electron/src/shared/ipc.ts`, renderer `components/status-grid.tsx`, `sync-grids.tsx`, `app.tsx` - colors from the last sync's tags and mapping; switcher in the header.
- `apps/design/src/sections/palette.tsx`, `guidelines.tsx`, `note-grid-demo.tsx` - show the chosen themes and striped blocks; record the decisions.
- `CLAUDE.md` - note the themes, tag colors and the cache routes.

## Steps

Phase 1: exploration (review it, then choose)

1. Candidate themes: port the 8 mdm themes' UI roles into `candidate-themes.ts`, add each theme's accent colors, and derive 20-24 note colors (about 8 hues x 2-3 tiers + neutrals) in an order where consecutive indexes are far apart. Include the neutral default.
2. Exploration page, panels, strip and striped-grid components; register it.
3. Tests for the exploration (one file per source file, under `tests/explorations/note-palettes/`).
4. **Pause:** the user reviews the exploration and chooses themes, color count, ordering and how light/dark behaves; log the decision and update this plan.

Phase 2: implementation

5. `packages/ui`: themes, `applyTheme`, `useTheme`, `ThemeSelect`, `tag-stripes`; tests.
6. `NoteGrid`: `colors`/`tags`, stripes, neutral default, tooltip with tags; CSS for all note colors; tests.
7. Cache: `tag_colors` table, routes, schemas, spec (`pnpm openapi`, `pnpm generate`), README; tests.
8. Sync package: `assignTagColors`, tags on `NoteRef`, push mapping, state and result changes, README; tests (including old state files).
9. Web app: tag colors and tags in the dashboard, theme switcher in the header; tests.
10. Electron: IPC types, status grids from the last sync, theme switcher; tests.
11. Design board: palette section, striped demo, guidelines; tests.
12. `CLAUDE.md` updated; `pnpm format`, `pnpm lint`, `pnpm typecheck`.
13. `pnpm coverage`: every workspace at or above 95% (lines, statements, branches, functions).

## Open questions / risks

Defaults chosen for questions that were not answered; correct them if wrong.

- One global tag-to-index table; known tags keep their index, new tags get the next one; unused tags keep theirs. Past the number of colors the indexes wrap, so two tags can share a color.
- The assignment is done in `packages/sync`; the cache only stores it and never interprets it.
- Theme choice is stored in `localStorage` in both apps (Electron's renderer keeps it in its `userData` too), not in `state.json` as first suggested; simpler, and the sync state stays about syncs. Say if you want `state.json`.
- The apps have no dark toggle today. Default: they follow `prefers-color-scheme`, and dark-only or light-only themes show their one variant. The exploration decides the rule.
- Switching the whole UI theme touches every token (and the hard shadow, dot grid and note stroke, currently hard-coded to Solarized values); some themes (ocean, highContrast) may need token tweaks to fit the lowercase, square-edged look.
- Stripes in squares of 3-4px: at most 3 stripes of whole pixels; the exploration shows whether that reads.
- Stripes add up to 2 more rects for multi-tag notes; stay within the "no per-item handlers" rule, and check performance with thousands of notes.
- A wider `fields` list in `GET /notes` (title and tags) makes the web request larger.
- The index order is fixed once chosen: reordering it later would change existing tag colors.
