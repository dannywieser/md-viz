# cache

A small HTTP service that stores notes as per-note string fields (SQLite) and serves them back for the web app. The Electron app pushes notes to it incrementally.

## Run

From the repo root:

```bash
pnpm dev:cache
```

| env        | default                    | meaning                                      |
| ---------- | -------------------------- | -------------------------------------------- |
| `PORT`     | `8787`                     | listen port                                  |
| `CACHE_DB` | `apps/cache/data/cache.db` | SQLite file (`:memory:` for a throwaway run) |

In Docker the image sets `CACHE_DB=/data/cache.db` (a volume) and `PORT=8787`; see [../../deploy/README.md](../../deploy/README.md).

Node prints an `ExperimentalWarning` for `node:sqlite` on start; that is expected.

## API

A note is an `id` (chosen by the client) plus string fields such as `title` and `body`. IDs and field names are non-empty and must not contain `/`.

The fields are free-form; the cache does not interpret them. The Electron app writes `title`, `body`, `tags` (a JSON array string), `created` and `modified` (ISO 8601), and `source` (`file` or `bear`, which scopes what a sync may delete). Notes from Bear use Bear's note id as their id, notes from a folder a hash of their relative path.

| request                       | does                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PUT /notes`                  | upsert a batch: `{ "notes": [{ "id": "...", "fields": { "title": "..." } }] }`                                                                                     |
| `GET /notes?fields=title,...` | an array of `{ "id", "fields": { ... } }` with only the requested fields, ordered by id (`fields` is required); deleted notes are left out unless `&grouping=sync` |
| `GET /notes/:id`              | all fields of one note as `{ "fields": { ... } }`, `404` if unknown or deleted                                                                                     |
| `DELETE /notes/:id`           | mark a note deleted (it stays in the cache), `204` even if it did not exist                                                                                        |
| `GET /health`                 | `{ "ok": true }`                                                                                                                                                   |

A delete stamps a `deleted` field (ISO 8601) on the note instead of removing it; the note is then left out of normal retrieval. The `sync` grouping (see below) is the one facet that lists deleted notes, so it can show what was deleted when. Nothing is purged. A `PUT` of the same id clears the mark again (file ids are not unique, so an id can come back).

### Sets

A set is a named group of note IDs, identified by three fields: `source` (`bear` or `file`, one cache can hold both), `grouping` (the facet it belongs to) and `id` (its name within the grouping, free text: a tag can contain `/` and `:`). Display form: `bear:tags:daily`. A set also has a `color` (an index into the note palette) and a `rank` (its order within the grouping, lower first); the cache stores both and interprets neither. The Electron sync fills the sets of the source it just synced and replaces them on every sync, so they are only as fresh as the last sync:

- grouping `tags`: one set per top-level tag (`daily` for `daily/10/28`) holding the notes whose first tag has it as its top level: a note is in one set only, the set of its first tag in the source's order (the order of its `tags` field), and a note without tags is in none. A tag that is no note's first tag any more keeps an empty set, so its colour is kept.
- grouping `sync`, ranked in this order: `created-today`, `updated-today`, `created-last-30-days`, `updated-last-30-days`, `deleted-today`, `deleted-last-30-days`, `unchanged`. A note is in exactly one of them, the first it fits in this order (a deleted note only in a deleted set, and in none when it was deleted over 30 days ago). Today is the PC's local calendar day, the last 30 days a rolling 30 x 24 hours at the time of the sync; updated is the note's `synced` stamp, created its `created` field (a file has none), deleted its `deleted` stamp, and unchanged is every note not deleted that fits none of the others.

Colours are given per source and grouping with the whole palette each: a new set gets the least-used colour of its grouping and keeps it.

| request                             | does                                                                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUT /sets`                         | replace a set: `{ "source", "grouping", "id", "color", "rank", "noteIds": [...] }`, answers `{ "count": n }`                                       |
| `GET /sets?source=&grouping=`       | an array of `{ "source", "grouping", "id", "color", "rank", "count", "updated" }`, both filters optional, ordered by source, grouping, rank and id |
| `GET /set?source=&grouping=&id=`    | the same plus `"noteIds": [...]`, `404` if unknown                                                                                                 |
| `DELETE /set?source=&grouping=&id=` | remove a set, `204` even if it did not exist                                                                                                       |

`updated` is stamped by the service. A deleted note stays in its sets until the sync replaces them.

`PUT` only writes the fields it names; other stored fields of that note are kept. The service stamps `synced` (ISO 8601 UTC time of the upsert) on every upserted note and overwrites any `synced` the client sends. Errors are `{ "error": "..." }` with `400` for bad input.

## OpenAPI spec

The routes and their validation are zod schemas (`src/schemas.ts`, `src/app.ts`, `@hono/zod-openapi`). `openapi.json` is generated from them and committed; after changing a route run:

```bash
pnpm openapi
```

A test fails when the committed spec differs from the routes. `packages/api-client` generates its client from this file (see its README).

## Try it with curl

Start the service in one terminal (`pnpm dev:cache`), then in another:

```bash
BASE=http://localhost:8787

# 1. push two garden notes
curl -X PUT $BASE/notes -H 'content-type: application/json' -d '{
  "notes": [
    { "id": "abc123", "fields": { "title": "plan", "body": "raised beds along the south fence" } },
    { "id": "def456", "fields": { "title": "plants", "body": "tomatoes, beans, basil" } }
  ]
}'

# 2. list titles and sync times (what the grid loads, no bodies)
curl "$BASE/notes?fields=title,synced"

# 3. fetch one whole note
curl $BASE/notes/abc123

# 4. change only a title; the body is kept and synced is refreshed
curl -X PUT $BASE/notes -H 'content-type: application/json' -d '{
  "notes": [{ "id": "abc123", "fields": { "title": "garden plan" } }]
}'
curl $BASE/notes/abc123

# 5. delete a note
curl -i -X DELETE $BASE/notes/def456
curl -i $BASE/notes/def456   # 404 (the note is marked deleted, not removed)
curl "$BASE/notes?fields=title,deleted&grouping=sync"   # still listed, with deleted

# 6. missing fields is rejected
curl -i "$BASE/notes"        # 400
```

### Look at the sets

The Electron app fills the sets on every sync (`pnpm dev:all`, choose a source, sync). To see them:

```bash
# every set with its colour, rank and count
curl $BASE/sets

# only the sync grouping of Bear
curl "$BASE/sets?source=bear&grouping=sync"

# the note ids of one set (an id with a slash is URL-encoded)
curl "$BASE/set?source=bear&grouping=sync&id=updated-today"

# resolve ids to titles; the sync grouping also lists deleted notes
curl "$BASE/notes?fields=title,synced,deleted&grouping=sync"
```

Without the app you can fill a set by hand:

```bash
curl -X PUT $BASE/sets -H 'content-type: application/json' \
  -d '{ "source": "bear", "grouping": "tags", "id": "work/q4", "color": 3, "rank": 0, "noteIds": ["abc123", "def456"] }'
curl "$BASE/set?source=bear&grouping=tags&id=work%2Fq4"

curl -i -X DELETE "$BASE/set?source=bear&grouping=tags&id=work%2Fq4"   # 204
curl -i "$BASE/set?source=bear&grouping=tags&id=work%2Fq4"             # 404
```

To start over, stop the service and delete `apps/cache/data/`. An older database with the previous set layout is reset on open (its sets and tag colours are dropped; the next sync rebuilds the sets).
