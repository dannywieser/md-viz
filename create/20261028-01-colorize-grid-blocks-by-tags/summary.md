# Summary: colorize grid blocks by tags

- **Slug:** 20261028-01-colorize-grid-blocks-by-tags
- **Started:** 2026-10-28 07:20
- **Completed:** 2026-10-29

## Overview

The note grids in the web app and the Electron app now color their squares by the notes' tags. Each top-level tag gets a color index when notes are synced; the cache stores the mapping so a tag keeps its color on every sync and in both apps. A note with several tags is striped horizontally (first three), an untagged note is a neutral grey, and the tooltip lists the full tags. On top of that, both apps got a theme switcher: nine themes, each one fixed look for the whole UI with 25 note colors, so switching themes recolors the grids without touching the cache.

## What was done

- **Design exploration** (`apps/design`, `/explorations/note-palettes`): candidate themes (started from the mdm palettes), 25 note colors per theme (8 hues x 3 strengths + a neutral grey, ordered so neighbours differ), striped grids at 3-12px squares with hover. It settled the nine themes (solarized light, gruvbox dark, nord dark/light, catppuccin mocha/latte, dracula, gotham, ocean), and rules checked by tests: focus color at least 3:1 against page and card and clearly apart from the primary, shadow at least 2:1 against the page.
- **`packages/ui`**: `themes.ts`, `apply-theme.ts`, `note-palette.ts`, `note-colors.ts` (25 colors, neutral default), `note-tags.ts` (`topLevelTag`, `tagColorIndexes`), `tag-stripes.ts`, `use-theme.ts` (localStorage), `ThemeSelect`; `NoteGrid` takes `colors` and `tags`, draws stripes inside the gridlines and lists tags in the tooltip; new tokens `--focus` (focus ring, hover outline, select popup border), `--shadow-color`, `--note-stroke`; loaders and icons cycle the 8 full hues.
- **`apps/cache`**: table `tag_colors`, `GET /tag-colors`, `POST /tag-colors` (adds tags that have no color, keeps the rest), spec and client regenerated, README.
- **`packages/sync`**: `assignTagColors` (least-used of the 24 hue colors, alphabetical, wraps), colors assigned before notes are pushed, `NoteRef.tags`, `LastSync.tagColors` in `state.json` (old files still load), Bear loader keeps only the deepest nested tag, README.
- **`apps/web`**: dashboard colors notes through the cache's tag colors, theme switcher in the header.
- **`apps/electron`**: status grids colored from the last sync's tags and saved tag colors, theme switcher in the header.
- **Design board**: themes section, focus/shadow/note-color swatches, guidelines "themes" and "tag colors" (and updates to "cards" and "inputs and focus").
- **Docs**: `CLAUDE.md`, `README.md`, cache and sync READMEs.

## Highlights

- **Themes are one fixed look, not light/dark**: system light/dark matching was dropped after the exploration (several themes only work in one mode); every theme is its own entry, and the user pruned the list (solarized dark, gruvbox light, ocean light and high contrast were dropped).
- **Colors are indexes, palettes are themes**: the cache stores `tag -> index`; the theme decides the color, so a theme switch never needs a re-sync.
- **Hard-coded black became tokens** (focus, shadow, hover outline, popup border): black was invisible on dark themes (gotham first).
- **Top-level tags only**: `daily/10/28` is colored as `daily`. This exposed that Bear lists every level of a nested tag; the loader now keeps the deepest one.
- **Environment finding**: while the Claude app's browser pane held the design page open, test runs stalled for minutes (app renderer at 160% CPU); with the pane closed the suites run in seconds.

## Coverage

`pnpm coverage` run fresh at completion (exit 0, all seven workspaces ran, 95% thresholds unchanged in every vitest config):

| workspace          | tests | statements | branches | functions | lines  |
| ------------------ | ----- | ---------- | -------- | --------- | ------ |
| apps/cache         | 61    | 96.7%      | 100%     | 100%      | 96.4%  |
| apps/design        | 176   | 99.67%     | 100%     | 98.64%    | 99.65% |
| apps/electron      | 100   | 100%       | 100%     | 100%      | 100%   |
| apps/web           | 44    | 100%       | 100%     | 100%      | 100%   |
| packages/api-client | 6    | 100%       | 100%     | 100%      | 100%   |
| packages/sync      | 144   | 100%       | 96.49%   | 100%      | 100%   |
| packages/ui        | 170   | 99.7%      | 98.87%   | 100%      | 100%   |

## Deviations from the plan

- `POST /tag-colors` instead of `PUT` (it only adds, never overwrites).
- The theme choice is in `localStorage` in both apps, not `state.json` for Electron.
- No light/dark at all (the plan had the apps follow the system setting).
- The exploration page became a flat list of themes without a mode switcher, with hover on the striped grids (added during review).
- Added after the plan: `--focus`, `--shadow-color` and `--note-stroke` tokens, the top-level-tag rule and the Bear deepest-tag fix.

## Not done / follow-ups

- **Not seen running**: ports 8787 and 5175 were taken by the user's own dev servers, so the web and Electron changes are verified by tests only. The Electron header with the theme select was only computed (about 889px of 880px on non-mac, slightly tight).
- **The cache needs clearing**: notes already cached keep their old tags (and nested-tag colors) until they change; stop the cache, delete `apps/cache/data/` and sync again.
- Tag colors are not configurable yet (the user plans a configurable option later); unused tags keep their index; past 24 top-level tags colors are reused.
- Ocean's orange and violet are mixes of its colors; nord has only seven hues.
- A Bear note that has both `#garden` and `#garden/beds` as separate tags shows only `garden/beds` (Bear reports them the same way).
- Faint spots left alone: stripes in 3-4px squares are hard to tell apart; the design viewer has no theme switcher of its own (it keeps its light/dark toggle).

## Harvest

- **`CLAUDE.md`** (earlier in the session and now): themes and tokens (including `--focus` and `--shadow-color`), tag colors and the cache routes, the top-level-tag rule, Bear's nested tags and the need to clear the cache after changing how tags are read.
- **`README.md`**: intro (colored grids, switcher, tag colors), what `state.json` keeps, the cache-clearing note, the shared UI package paragraph (themes).
