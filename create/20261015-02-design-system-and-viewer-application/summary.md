# design system and viewer application

- **Slug:** 20261015-02-design-system-and-viewer-application
- **Started:** 2026.10.15 07:35
- **Completed:** 2026.10.15 08:25

## Overview

Introduced a shared design system in `packages/ui` (Solarized light/dark, Space Mono, square edges, grid paper background, card and header treatments) and a second standalone app, `apps/design`, that serves as a design-board viewer for the theme tokens, components and written design guidelines. The viewer exists to make exploring the theme fast; it is display only and `apps/web` inherits the theme.

## What was done

**`apps/design` (new, `@md-insights/design`, port 5174, `pnpm dev:design`)**
- Single design-board page with sections: guidelines, color (Solarized palette and semantic roles), typography, spacing, grid, components (button variants/sizes, app header, card)
- Every section sits on its own card; light/dark toggle persisted in localStorage, defaulting to the system scheme
- Tests: sections render, lowercase-text guideline enforced, theme toggle, system scheme default

**`packages/ui`**
- `globals.css`: Solarized tokens mapped to shadcn roles, raw `--sol-*` palette exposed as `sol-*` colors, Space Mono (self-hosted `@fontsource/space-mono` 400/700), all radius tokens 0, `--shadow-hard`, `crop-marks` and `bg-grid` utilities, grid tokens, orange primary, deeper destructive red
- `button.tsx`: black 3px focus ring (base3 in dark), destructive overrides and dark opacity removed
- `card.tsx`: hard shadow plus crop marks instead of `shadow-sm`; pure white in light, base02 in dark
- `app-header.tsx` (new `AppHeader`, tested): sticky white/base02 bar with title and actions slot

**`apps/web`**: uses `AppHeader`, text lowercased, test updated

**Repo**: root `dev:design` script, `.claude/launch.json` entry, `CLAUDE.md` and `README.md` updates

## Highlights

- Theme lives in `packages/ui`; the viewer never holds tokens. Components stay stock shadcn: square edges come from zeroing the radius tokens, not editing classes.
- Lowercase text only is real lowercase source text plus a test, not a CSS transform, so violations stay visible and the rule travels to other apps.
- Dark-mode card background kept at base02: a pure black card would swallow the black shadow.
- Section tests were deliberately skipped (presentational, churn during exploration); only the whole board and the toggle are tested.
- Grid is 16px with major lines every 5th. Dark minor line color equals the card color, which caused a preview bug fixed by giving previews `bg-background`.
- The orange primary and deeper destructive red were tried as experiments and kept.

## Deviations from the plan

- Radius section dropped from the board (user decision); a guidelines section, grid section, app header and per-section cards were added.
- Theme toggle is a text button rather than an icon.
- A silent `sed` failure broke a command chain while writing `globals.css`; caught and rewritten.

## Not done / follow-ups

- Contrast checks for muted text on the light theme and white-on-orange were not formally measured.
- The dark minor grid lines are very faint; revisit if needed.
- No lowercase test for `apps/web` (placeholder content only).
- No new components were added; more are expected as the exploration continues.

## Harvest

- `CLAUDE.md`: added a convention pointing to the design board guidelines (lowercase, square edges, cards, grid) and that tokens change only in `packages/ui`, plus the gotcha that `bg-grid` on a card needs `bg-background`.
- `README.md`: bootstrap line now mentions the design viewer, getting started lists both dev servers and ports, and the shared UI section describes the real theme and the viewer's role.
