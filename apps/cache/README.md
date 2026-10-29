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

| request                       | does                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `PUT /notes`                  | upsert a batch: `{ "notes": [{ "id": "...", "fields": { "title": "..." } }] }`                                 |
| `GET /notes?fields=title,...` | an array of `{ "id", "fields": { ... } }` with only the requested fields, ordered by id (`fields` is required) |
| `GET /notes/:id`              | all fields of one note as `{ "fields": { ... } }`, `404` if unknown                                            |
| `DELETE /notes/:id`           | remove a note, `204` even if it did not exist                                                                  |
| `GET /health`                 | `{ "ok": true }`                                                                                               |

### Sets

A set is a named group of note IDs. The Electron sync computes the automatic sets of the source it just synced and replaces them on every sync (the cache does not derive them, so they are only as fresh as the last sync). Set ids are `<source>:<name>`: `created-today`, `modified-today`, `created-last-30-days` and `modified-last-30-days` for `bear`, and the two `modified` ones for `file` (a file has no created date). Today is the PC's local calendar day, the last 30 days a rolling 30 x 24 hours.

| request            | does                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `PUT /sets/:id`    | replace a set: `{ "noteIds": ["..."] }`, answers `{ "count": n }` |
| `GET /sets`        | an array of `{ "id", "count", "updated" }` ordered by id          |
| `GET /sets/:id`    | `{ "id", "updated", "noteIds": [...] }`, `404` if unknown         |
| `DELETE /sets/:id` | remove a set, `204` even if it did not exist                      |

`updated` is stamped by the service. Deleting a note also removes it from every set.

### Tag colors

Each tag gets a color: an index into the note palette that the apps draw squares with. The Electron sync gives tags that have none the next indexes and adds them, only for the top level of a nested tag (`daily` for `daily/10/28`); a tag that already has a color keeps it, so a tag looks the same on every sync and in every app. The cache only stores the indexes and does not interpret them (nor the tags: it takes whatever the caller sends); the palette (and so the actual color) is the app's theme.

| request            | does                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `GET /tag-colors`  | `{ "tags": [{ "tag", "color" }] }` ordered by tag                                                               |
| `POST /tag-colors` | add tags: `{ "tags": [{ "tag": "work", "color": 3 }] }`, answers `{ "added": n }`; existing tags are left alone |

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
curl -i $BASE/notes/def456   # 404

# 6. missing fields is rejected
curl -i "$BASE/notes"        # 400
```

### Look at the sets

The Electron app fills the sets on every sync (`pnpm dev:all`, choose a source, sync). To see them:

```bash
# every set with its count and when it was last replaced
curl $BASE/sets

# the note ids of one set
curl $BASE/sets/bear:modified-last-30-days

# resolve those ids to titles
curl "$BASE/notes?fields=title,created,modified"
```

Without the app you can fill a set by hand and watch it follow note deletes:

```bash
curl -X PUT $BASE/sets/bear:created-today -H 'content-type: application/json' \
  -d '{ "noteIds": ["abc123", "def456"] }'
curl $BASE/sets/bear:created-today

curl -X DELETE $BASE/notes/abc123
curl $BASE/sets/bear:created-today   # only def456 is left

curl -i -X DELETE $BASE/sets/bear:created-today   # 204
curl -i $BASE/sets/bear:created-today             # 404
```

### Look at the tag colors

The Electron app adds the colors of the tags it syncs. To see them, or add some by hand:

```bash
curl $BASE/tag-colors

curl -X POST $BASE/tag-colors -H 'content-type: application/json' \
  -d '{ "tags": [{ "tag": "work", "color": 3 }, { "tag": "home", "color": 7 }] }'

# a tag that has a color keeps it: this answers { "added": 0 }
curl -X POST $BASE/tag-colors -H 'content-type: application/json' \
  -d '{ "tags": [{ "tag": "work", "color": 9 }] }'
```

To start over, stop the service and delete `apps/cache/data/`.
