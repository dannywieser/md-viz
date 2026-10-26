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

To start over, stop the service and delete `apps/cache/data/`.
