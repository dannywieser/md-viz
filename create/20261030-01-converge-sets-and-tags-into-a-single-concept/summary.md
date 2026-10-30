# Converge sets and tags into a single concept

- **Slug:** 20261030-01-converge-sets-and-tags-into-a-single-concept
- **Started:** 2026.10.30 07:22
- **Completed:** 2026.10.30 13:22

## Overview

Sets are now the one grouping concept in the cache. A set is identified by `(source, grouping, id)`, has a colour and a rank, and holds note ids. The sync creates a `tags` set per top-level tag and a fixed family of `sync` sets (created, updated and deleted for today and the last 30 days, plus unchanged), so the facet a grid will colour and group by is just a grouping. Tag colours are gone. The focus was the structure of the cache and the sync that fills it; the grid UI that uses it comes later.

## What was done

- **Cache** (`apps/cache`): sets keyed by source, grouping and id with colour and rank; `PUT /sets`, `GET /sets`, `GET`/`DELETE /set` (key in the query or body, since tag ids contain `/`); `/tag-colors` removed; a delete now stamps a `deleted` field instead of removing the note, and an upsert of the same id clears it; `GET /notes?grouping=sync` is the one listing that includes deleted notes; an old set layout is reset on open; `openapi.json`, the generated client, README and tests updated.
- **Sync** (`packages/sync`): `pipeline/groupings.ts` (the `GROUPINGS` list the pipeline loops over), `tag-sets.ts`, `sync-sets.ts`, `set-colors.ts` (the old tag colour assignment, generic per grouping); `note-sets.ts` and tag-colour handling removed; `sync.ts` builds every grouping from the cache after the push and deletes; `TagColors` removed from the types, the run and the state file; README and tests.
- **Apps:** the web dashboard is reduced to the all-notes grid (set grids removed); Electron drops `tagColors` from IPC and renderer and still draws its three grids from `state.json`. Both draw notes grey for now.
- **Docs:** `CLAUDE.md`, `README.md`, `apps/cache/README.md`, `packages/sync/README.md`.

## Highlights

- Sets keep the term "set"; the facet is a set's `grouping`, each grouping using the whole palette on its own and keeping the least-used-colour assignment.
- The `sync` grouping is richer than a snapshot of the last run: rolling windows from the sync time, the calendar day in machine time, and `unchanged` meaning "not updated in 30 days". Today's sets rank first so they are primary.
- Soft delete (a `deleted` field in `note_fields`) keeps deleted notes available to the `sync` sets; file ids can come back, so a push clears the mark.
- The sets are worked out from the cache after the push (not from the notes just loaded), so notes that could not be read keep their place.
- After review, the pipeline iterates a `GROUPINGS` const so adding a grouping is one entry and a builder.
- Verified end to end with the real cache service and a throwaway database (the demo notes have no tags, so tag sets rest on unit tests).

## Coverage

Threshold: 95% for statements, branches, functions and lines in every workspace (unchanged).

| Workspace           | Statements | Branches | Functions | Lines |
| ------------------- | ---------- | -------- | --------- | ----- |
| apps/cache          | 97.72      | 100      | 100       | 97.46 |
| packages/api-client | 100        | 100      | 100       | 100   |
| packages/ui         | 99.71      | 98.93    | 100       | 100   |
| apps/design         | 98.34      | 98.31    | 98.8      | 98.45 |
| apps/web            | 100        | 100      | 100       | 100   |
| packages/sync       | 100        | 95.41    | 100       | 100   |
| apps/electron       | 100        | 100      | 100       | 100   |

## Deviations from the plan

- Tag and sync sets are built from the cache listing after the push, not from the loaded notes (see Highlights).
- The `GROUPINGS` list was added after the plan, on review.

## Not done / follow-ups

- The grid UI: colouring and grouping by a facet, choosing the primary tag, facet switching and a second grid in the web app, the grouped toggle.
- Fewer requests to load a facet: `GET /set` is one request per set; an `include=noteIds` option on `GET /sets` (or a membership response) and a `source` filter on `GET /notes` would help.
- The cache hardcodes `sync` as the grouping that lists deleted notes; an explicit parameter or a stored grouping property would be cleaner.
- Deleted notes are never purged.
- Electron's last-sync grids still read `state.json`; moving them to the `sync` sets is open.

## Harvest

- `CLAUDE.md`: web dashboard, tag colour and cache paragraphs rewritten for sets with three-field keys, groupings, soft delete and the `GROUPINGS` list; the old tag-colour mapping removed; the package description updated.
- `README.md`: the intro and the sync paragraph no longer describe tag colours or the created/modified sets.
- `apps/cache/README.md` and `packages/sync/README.md`: the new API, groupings and flow.
