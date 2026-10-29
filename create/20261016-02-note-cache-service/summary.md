# Summary: note cache service

- **Slug:** 20261016-02-note-cache-service
- **Started:** 2026.10.16
- **Completed:** 2026.10.16

## Overview

Added `apps/cache` (`@md-insights/cache`), a small HTTP service that stores notes as per-note string fields in SQLite and serves them back. It is meant to sit between the Electron app, which scans local notes and pushes them incrementally, and the web app, which reads a light listing for the grid and fetches a whole note on demand. This session built the service only, running locally; wiring the clients, Docker and homelab deployment are deferred.

## What was done

- **Service** (`apps/cache`): Hono on Node with `node:sqlite`, run directly with Node's TypeScript stripping (no build step).
  - `src/store.ts`: table `note_fields(note_id, field, value)`, transactional batch upsert, delete, list by fields, get one.
  - `src/app.ts`: routes, input validation, open CORS, 64 MB body limit.
  - `src/index.ts`: env config (`PORT` default 8787, `CACHE_DB` default `apps/cache/data/cache.db`), graceful shutdown.
- **API**: `PUT /notes` (batch upsert, merges fields), `GET /notes?fields=a,b` (array of `{ id, ...fields }` ordered by id, `fields` required), `GET /notes/:id` (all fields), `DELETE /notes/:id` (idempotent `204`), `GET /health`.
- **Tests**: 30 Vitest tests across the store and the HTTP layer (`app.request()`, no socket).
- **Docs**: `apps/cache/README.md` with a curl walkthrough, which was run end to end against a live server.
- **Repo**: root `dev:cache` script, `CLAUDE.md` and `README.md` updates, committed as `1f1864f`.

## Highlights

- The server stamps a reserved `synced` field (ISO 8601 UTC, one timestamp per batch) on every upsert and overwrites any client value. It is the one built-in field; everything else is free-form.
- Notes are stored as flat fields keyed `<id>/<field>` so new fields (the undecided grid colour) need no schema change. IDs are client-supplied and must not contain `/`.
- SQLite over Redis: a single file and no extra container, with easy prefix and field queries. The Electron app stays the source of truth, so the cache is rebuildable.
- A dedicated notes API was chosen over a generic entries API; generic entries (e.g. `totalnotes`) and sets (folder, tag, last-synced groupings holding note IDs) are layered on later.
- The bulk call loads light fields for every note at once instead of fetching on hover; bodies are only returned per note.
- List response changed from an object keyed by ID to an array, because the grid is index-based, JS objects reorder integer-like keys, and the server can control the order.
- `node:sqlite` is built in but experimental (prints a warning); it is isolated in `store.ts` with `better-sqlite3` as the fallback.

## Deviations from the plan

- `GET /notes` returns an array, not an object grouped by ID, and `synced` is server-stamped. Both changed after the plan was first discussed (and `plan.md` was updated for `synced`; the array change was made during implementation review).

## Not done / follow-ups

- Generate an OpenAPI spec (`@hono/zod-openapi` or `hono-openapi`), best done when sets and generic entries add routes.
- Sets and generic key/value entries.
- Docker, compose and homelab deployment; auth (needed before exposing on the network).
- Electron upload and web app fetch wiring; choosing the grid colour field.
- `app.ts` holds all routes and validation in one file; consider splitting once it grows.

## Harvest

- `CLAUDE.md`: updated during implementation (cache app in the intro, `pnpm dev:cache`, the Structure entry, and a convention on native TS stripping, `.ts` imports, the `synced` field and keeping `node:sqlite` inside `store.ts`). Nothing further needed.
- `README.md`: added the cache service to the intro, the getting-started commands, the commands table and the layout list.
