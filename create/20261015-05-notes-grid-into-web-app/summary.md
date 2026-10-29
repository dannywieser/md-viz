# notes grid into web app

- **Slug:** 20261015-05-notes-grid-into-web-app
- **Started:** 2026.10.15 19:39
- **Completed:** 2026.10.15

## Overview

The web app's landing page now shows the `NoteGrid` component with 5000 random fake notes, replacing the hello-world card. The grid fills the available area and resizes with the window; the fake data is a placeholder until real notes are loaded.

## What was done

- `packages/ui`
  - `lib/use-element-size.ts` (new) replaces `use-element-width.ts`: tracks width and height via ResizeObserver.
  - `components/note-grid.tsx`: `height` is optional (fills the container when omitted); new `frame` and `inset` props let a wrapper such as a card hug the grid.
  - `lib/fake-notes.ts` (new): `makeFakeNotes(count)`, exported from `index.ts`.
  - Tests: `use-element-size`, `fake-notes`, extended `note-grid`.
- `apps/web`: `App.tsx` renders the grid inside a padded `Card` frame, centred under `AppHeader`; `App.test.tsx` updated.
- `apps/design`: `NoteGridDemo` passes `height={320}` explicitly to keep its look.

## Highlights

- Fill behaviour went into the component (it already measured width) rather than a wrapping box, so consumers don't repeat the measuring.
- Whole-pixel squares leave leftover space (about 65px vertically at 1024x768). A full-height card centred the grid with uneven gaps, so the card now shrinks to the grid and is centred instead. Alternatives rejected: top-aligning, fractional cells.
- `overflow-hidden` on the card was clipping its crop marks; removed.

## Deviations from the plan

- The card is not full height (user's choice after seeing the spacing).
- Added `frame`/`inset` props to `NoteGrid`, not in the plan.
- App root uses `h-screen` (a planned risk).

## Not done / follow-ups

- Replace fake notes with real data.
- The layout uses the container width but the svg adds 3px for the border; unchanged and not visible.

## Harvest

- `CLAUDE.md`: updated the project status line; added a convention on `NoteGrid` fill mode and `frame`/`inset`.
- `README.md`: updated the status line to mention the note grid landing page.
