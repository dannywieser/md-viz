# Plan: converge sets and tags into a single concept

## Goal

Sets become the one grouping concept. A set belongs to a source and a grouping (the facet: `tags` or `sync`), has an id and a colour, and the sync creates and fills the sets: one per tag, plus a fixed family of sync sets (created / updated / deleted / unchanged). Tag colours disappear (`/tag-colors`, `TagColors`). Deleting a note in the cache becomes a soft delete so the `sync` grouping can list deleted notes. This session builds the data side only: sets stored in the cache and filled by the sync. The grid UI that colours and groups by a facet comes later.

## Scope

In:

- Cache: sets keyed by `(source, grouping, id)` with a colour and a rank; soft-deleted notes; facet-aware note listing; `/tag-colors` removed; `openapi.json` and the generated client updated.
- Sync package: tag sets, sync sets, colour assignment per grouping, removal of the created/modified set code and of tag colours.
- Apps: only the edits needed to keep compiling and passing tests. Their set and tag-colour behaviour is knowingly reduced (see Steps 7 and 8).
- Docs: CLAUDE.md, `apps/cache/README.md`, `packages/sync/README.md`.

Out (decided in the discussion):

- Choosing which tag is primary (for now the order of the tags from the source decides; the first is primary, the rest are stripes).
- Switching facets, a second grid in the web app, the grouped / not grouped toggle in the apps.
- A `meta` grouping and any created/modified sets built by dates other than as defined below.
- Pruning deleted notes from the cache.
- Moving Electron off `state.json` (its last-sync grids keep working from it; the sync sets are only stored in the cache for later).
- Any change to `packages/ui` and the design viewer.

## Model

- **Set key:** `(source, grouping, id)`, three fields; `source` is `file` or `bear`, one cache holds both. Display form `bear:tags:daily`.
- **Set:** `color` (palette index, assigned by the sync, not interpreted by the cache), `rank` (integer, lower is more primary; the sync sets it), `updated` (ISO, stamped by the cache), and its note ids.
- **Groupings:**
  - `tags`: one set per top-level tag (`daily/10/28` is in set `daily`, as colours follow today). A note is in the set of each distinct top-level tag it has. The note's own `tags` field keeps the source's order, which gives primary and stripes later.
  - `sync` (ranks in this order, "today" before "last 30 days"): `created-today`, `created-last-30-days`, `updated-today`, `updated-last-30-days`, `deleted-today`, `deleted-last-30-days`, `unchanged`.
- **Windows:** "today" is the local calendar day of the machine running the sync; "last 30 days" is rolling from the moment of the sync.
- **Definitions:** `updated` = the `synced` stamp the cache already writes on each push; `created` = the note's `created` field (the file source has none, so it gets no created sets, as now); `deleted` = the new `deleted` stamp; `unchanged` = notes that are not deleted and have not been updated in the last 30 days.
- **Colours:** assigned by the sync, per `(source, grouping)`, with the existing strategy (the least-used of the 24 hues, lowest on a tie, alphabetical, kept once given). Each grouping uses the full palette on its own. The sync sets use the same strategy.
- **Soft delete:** `DELETE /notes/{id}` writes a `deleted` field (ISO time) instead of removing rows and no longer removes the note from sets. A push of a note with that id removes the `deleted` field (file ids can be reused). Nothing is pruned.
- **Facet-aware note listing:** `GET /notes` gets an optional `grouping` query. Only `grouping=sync` includes deleted notes (with their `deleted` field available); every other value, or none, excludes them. `GET /notes/{id}` hides deleted notes.

## Technologies

No new ones: Hono + zod-openapi + `node:sqlite` in the cache, the generated hey-api client, Vitest. A set id can contain `/` (nested tags), so set routes carry the key in the query string or body, never in the path.

## API (cache)

- `PUT /sets` body `{ source, grouping, id, color, rank, noteIds }`: replace one set, create it if needed.
- `GET /sets?source=&grouping=`: summaries (`source, grouping, id, color, rank, count, updated`), both filters optional, ordered by grouping, rank, id.
- `GET /set?source=&grouping=&id=`: one set with its note ids; 404 when unknown.
- `DELETE /set?source=&grouping=&id=`: remove a set; 204 even if unknown.
- `GET /notes?fields=&grouping=`, `DELETE /notes/{id}` as above.
- Removed: `GET`/`POST /tag-colors`, `PUT`/`GET`/`DELETE /sets/{id}`.

Because the schema changes, `sets`, `set_notes` and `tag_colors` are recreated: the store drops the old tables on open if they have the old shape (the cache only holds a derived copy, and the CLAUDE.md note already says to delete `apps/cache/data/` after such changes, so the plan documents that rather than migrating).

## Repository structure

```
apps/cache/src/{store,schemas,app}.ts          changed
apps/cache/{openapi.json,README.md}            regenerated / updated
packages/sync/src/pipeline/
  set-colors.ts        (was tag-colors.ts; now generic per grouping)
  tag-sets.ts          new: the tag sets of a source
  sync-sets.ts         new: the sync grouping
  note-sets.ts         deleted
  sync.ts, notes.ts?   changed
packages/sync/src/{types,index,run,state}.ts   changed
```

## Files

Cache:

- `apps/cache/src/store.ts`: new `sets` / `set_notes` tables keyed by source, grouping and id with `color` and `rank`; drop `tag_colors`; soft `deleteNote`; `listNotes(fields, includeDeleted)`; upsert clears `deleted`; `getNote` hides deleted.
- `apps/cache/src/schemas.ts`: set key, set body and summary schemas, `grouping` list query; remove tag colour schemas.
- `apps/cache/src/app.ts`: routes as listed above; tag-colour routes removed.
- `apps/cache/openapi.json`: rewritten by `pnpm openapi`.
- `apps/cache/README.md`: API and curl examples.
- `apps/cache/tests/{store,api,openapi}.test.ts`: updated and extended.

Sync:

- `packages/sync/src/pipeline/set-colors.ts`: `assignColors(existing, ids)` (the old `assignTagColors` generalised), `topLevelTag`, `COLOR_COUNT`.
- `packages/sync/src/pipeline/tag-sets.ts`: builds the `tags` sets of a source from its notes; sets of tags no note has any more are replaced with no notes (colour kept).
- `packages/sync/src/pipeline/sync-sets.ts`: builds the seven `sync` sets from the cached notes (`synced`, `created`, `deleted`, `source`) at `now`.
- `packages/sync/src/pipeline/sync.ts`: assigns colours per grouping from the cache's sets, pushes notes and soft-deletes as before, then lists the cache again with `grouping=sync` and replaces the tag sets and sync sets; no tag-colour calls.
- `packages/sync/src/pipeline/note-sets.ts` and its test: removed.
- `packages/sync/src/{types,index,run,state}.ts`: remove `TagColors` and `LastSync.tagColors`, export the new pieces; the state file format loses `tagColors` (old files still load).
- `packages/sync/README.md`: the model above.
- `packages/sync/tests/pipeline/{set-colors,tag-sets,sync-sets,sync}.test.ts`, `run.test.ts`, `state.test.ts`: one test file per source file.

Apps (only what is needed to compile and pass; tag colours and set grids are gone for now):

- `apps/web/src/hooks/use-dashboard.ts`, `components/dashboard.tsx`, `components/set-grid.tsx`, `lib/dashboard-sets.ts`, `lib/grid-note.ts` and their tests: the dashboard shows the all-notes grid only, notes in the default grey; the set grids and the `bear` / `file` source derivation from sets go.
- `apps/electron/src/shared/ipc.ts`, `renderer/src/{app.tsx,hooks/use-sync.ts,components/{status-grid,sync-grids}.tsx,lib/cells.ts}` and their tests: stop using `tagColors`; the three status grids stay on `LastSync.notes`, in the default grey.
- `CLAUDE.md`: update the structure, sets and tag-colour paragraphs.

## Steps

1. **Cache store:** new set schema, soft delete, facet-aware `listNotes`, `deleted` cleared on upsert, `tag_colors` removed; update `store.test.ts`.
2. **Cache API:** schemas and routes for the new set and note endpoints, remove `/tag-colors`; update `api.test.ts`; run `pnpm openapi`, then `pnpm generate`; update the README and `openapi.test.ts`.
3. **Sync colours and tag sets:** `set-colors.ts` (with test), `tag-sets.ts` (with test).
4. **Sync sets:** `sync-sets.ts` (with test), delete `note-sets.ts` and its test.
5. **Sync pipeline:** rewire `sync.ts` (colours per grouping, soft delete, final listing and set replacement), types, `index.ts`, `run.ts`, `state.ts`; tests for each.
6. **Sync docs:** `packages/sync/README.md`.
7. **Web app:** reduce the dashboard to the all-notes grid; update tests.
8. **Electron app:** drop `tagColors` from IPC and renderer; update tests.
9. **Docs:** CLAUDE.md sections that describe sets and tag colours.
10. **Quality gates:** `pnpm format`, `pnpm lint`, `pnpm typecheck`, then `pnpm coverage`; bring every workspace to at least 95% (lines, statements, branches, functions) without lowering any threshold.

Every new or changed source file has its own test file in `tests/`, mirroring `src/`.

## Open questions / risks

- **Tag set granularity.** The plan makes one set per top-level tag (as colours are today). One set per full tag (`daily/10/28`) is the alternative; changing it later is a small change in `tag-sets.ts`.
- **Created sets.** They use the note's `created` field, so the file source has none. If a "first synced" notion is wanted for files, the cache would need to stamp it.
- **Set ranks.** The tag sets all get rank 0 (ordering inside `tags` comes from the note's tag order); only the sync sets use ranks.
- **Existing cache data.** Old set tables are dropped on open; delete `apps/cache/data/` and sync again if anything looks off.
- **Both apps lose functionality** (tag colours, set grids) until the facet UI session; this is deliberate.
- The facet-aware listing hardcodes `sync` as the one grouping that shows deleted notes; if more groupings need it later this becomes a stored property of a grouping.
