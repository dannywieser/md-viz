# Summary: automatic note cache sets

- **Slug:** 20261027-01-automatic-note-cache-sets
- **Started:** 2026-10-27 07:33:35 MDT
- **Completed:** 2026-10-27 07:56:20 MDT (PR: https://github.com/dannywieser/md-viz/pull/11)

## Overview

The cache now holds *sets*: named groups of note IDs. The Electron sync computes a fixed list of automatic sets from the notes it just loaded (using the PC clock) and replaces them in the cache on every sync. The cache stores them as given and serves them through read endpoints. Nothing displays them yet, and custom filter sets and scheduled sync come later.

## What was done

- **Cache** (`apps/cache`): `sets` and `set_notes` tables and set functions in `store.ts`; schemas and routes `PUT /sets/:id` (replace), `GET /sets`, `GET /sets/:id`, `DELETE /sets/:id`; deleting a note also removes it from every set; `openapi.json` and the generated client regenerated; README gets a Sets section and curl instructions.
- **Electron** (`apps/electron`): new `src/main/note-sets.ts` (`buildNoteSets`) and `syncNotes` pushes the source's sets after the notes and deletes, with a `now` option for tests.
- **Docs:** `CLAUDE.md`, root `README.md`.
- **Tests:** store and API tests for sets and note-delete cleanup; `note-sets.test.ts`; `sync.test.ts` (fake cache handles `/sets`, set pushes, unchanged-sync recompute, source scoping).

## Highlights

- Sets are computed during sync, not derived in the cache, so they are only as fresh as the last sync (the user plans a scheduled sync next).
- Per source: each sync replaces only its own source's sets (`bear:*`, `file:*`); every file folder shares the `file` sets.
- Four sets: `created-today`, `modified-today`, `created-last-30-days`, `modified-last-30-days`. The file source has no created date, so it gets only the two `modified` sets.
- Today is the PC's local calendar day; last 30 days is a rolling 30 x 24 hours. Notes with a missing or unparseable date are left out. Empty sets are still stored.
- Sets are pushed even when no note changed, since they move with the clock.

## Coverage

`pnpm coverage` exits 0; threshold 95% in every workspace (unchanged).

| workspace           | statements | branches | functions | lines |
| ------------------- | ---------- | -------- | --------- | ----- |
| apps/cache          | 96.2       | 100      | 100       | 95.89 |
| apps/design         | 99.39      | 100      | 98.9      | 99.35 |
| apps/electron       | 100        | 98.83    | 100       | 100   |
| apps/web            | 100        | 100      | 100       | 100   |
| packages/api-client | 100        | 100      | 100       | 100   |
| packages/ui         | 99.61      | 98.7     | 100       | 100   |

## Deviations from the plan

None.

## Not done / follow-ups

- A real sync from the Electron app was not run (the endpoints were checked with curl against a live cache).
- Displaying sets, custom filter sets and scheduled sync.
- If a set push fails after notes were pushed, the sync throws; the next sync fixes it.
- Syncing one file folder overwrites the `file` sets of another.

## Harvest

- `CLAUDE.md`: the cache bullet describes sets; the Electron sync bullet describes the automatic sets (done during implementation).
- `README.md`: mentions note sets in the project description and that a sync refreshes them.
