# Summary: rebrand to md-viz

- **Slug:** 20261016-04-rebrand-to-md-viz
- **Started:** 2026.10.16
- **Completed:** 2026.10.16

## Overview

The project was renamed from md-insights to md-viz: the workspace package scope, every user-facing name, and the wordmark. The new wordmark was chosen from a temporary variants card on the design board.

## What was done

- **Rename:** `md-insights` -> `md-viz` in 44 tracked files outside `create/` and `demo/`: all package.json files and `@md-viz/*` imports, tsconfig and `components.json` aliases, page and window titles, `AppHeader` titles, aria-labels, the OpenAPI title (`openapi.json` regenerated), the design board's localStorage key, a test temp prefix, README, CLAUDE.md and the api-client README. `pnpm-lock.yaml` regenerated.
- **Glyphs** (`packages/ui/src/lib/pixel-glyphs.ts`): added `-`, `v`, `z`; removed the glyphs nothing uses any more (`n`, `s`, `g`, `h`, `t`, `|`) and the two-cell gap rule around the cursor bar.
- **Wordmark** (`packages/ui/src/components/wordmark.tsx`): `md-viz`, each cell drawn as a 2x2 block of small squares, `viz` in the primary color. `pixelFill` now takes the accent characters; `Logo` passes `.`.
- **Design board:** Logo section text and the "pixel logo" guideline updated (example `.md · md-viz`). The temporary `WordmarkVariants` card was added and then removed.
- **Tests:** wordmark and glyph tests updated for the new layout.

## Highlights

- The `.md` logo icon and the favicons stay as they are, so `favicon.test.ts` needed no change.
- The user's mockup (hatched, outlined blocks on a grid) was only an idea; the variants card included a hatched version and the user preferred variant f (subdivided blocks, `viz` accent, no dot).
- `create/` history and `demo/` were deliberately left untouched.

## Deviations from the plan

- Removed the unused glyphs (including `|`) once the variant was chosen; not in the plan.
- The plain `.md-viz` wordmark of step 4 was only a placeholder before the pick.

## Not done / follow-ups

- Nothing outstanding. The design board's saved theme resets once because the localStorage key changed.

## Harvest

- `CLAUDE.md`: the logo bullet now describes the icon (`.md` on a tile) and the wordmark (`md-viz`, 2x2 block cells, `viz` in the primary color); the rename was applied everywhere else by the sed.
- `README.md`: only the rename; nothing else needed updating.
