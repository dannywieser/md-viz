# Summary: generated api client

- **Slug:** 20261016-03-generated-api-client
- **Started:** 2026.10.16
- **Completed:** 2026.10.16

## Overview

The note cache is now the single source of truth for its API contract. Its routes and validation are zod schemas (`@hono/zod-openapi`); a script emits a committed `openapi.json`; a new `packages/api-client` generates a typed fetch SDK, zod schemas that validate requests and responses, and TanStack Query helpers from that spec with hey-api. The web app uses the generated query hook (it logs the cache's note list for now). The point was to have this in place before adding more endpoints or APIs, so every future client starts with schema validation built in.

## What was done

- **apps/cache:** `src/schemas.ts` (zod schemas with OpenAPI component ids); `src/app.ts` rewritten with `OpenAPIHono` + `createRoute` (hand-written validators removed); `src/openapi.ts`, `scripts/generate-openapi.ts`, `pnpm openapi`; committed `openapi.json`; `tests/openapi.test.ts` (spec must not be stale); README section.
- **packages/api-client (new):** `openapi-ts.config.ts` (list of `{ name, spec }` APIs), gitignored `src/generated/<api>/`, hand-written `src/cache/index.ts` (`configureCacheClient`, re-exports), `tests/cache.test.ts` (6 tests with stubbed fetch), README.
- **apps/web:** dependencies, `QueryClientProvider`, `VITE_CACHE_URL` (default `http://localhost:8787`), `App.tsx` runs `useQuery(listNotesOptions(...))` and logs the result; tests wrap in a provider and stub fetch.
- **Repo wiring:** root `generate`, `openapi`, `dev:all` scripts; `build`/`typecheck`/`test`/`lint` run `generate` first; ignore entries for the generated dir; pnpm `catalog:` for `zod` and `@tanstack/react-query`.
- Ten commits, one per checkpoint.

## Highlights

- Output is built on demand and gitignored; an explicit `generate` script (chained in root scripts, since pnpm does not run pre-scripts by default).
- The package is `packages/api-client`, not cache-specific, so other APIs can live beside the cache client with one entry each.
- The scope grew mid-session from a hand-written spec plus contract test to zod validators in the server and a spec generated from Hono; the old hand-written-spec plan was replaced.
- Error message text from the server may change (zod wording); status codes and the `{ error }` shape stayed.
- Electron can use the same SDK functions (no React) later.

## Deviations from the plan

- `GET /notes` rows changed from `{ id, ...fields }` to `{ id, fields: {...} }`: the generated zod schema ignored `additionalProperties` and would have stripped every field from validated responses.
- Gave schemas `.meta({ id })` so the spec has named components and the client gets named types.
- Added `apps/cache/openapi.json` to `.prettierignore` (prettier reformatted it and broke the exact-bytes staleness test).
- Added a pnpm catalog (`zod`, then `@tanstack/react-query`) at the user's request; not in the plan.
- Ignore entries moved into step 4; `dev:all` added at the user's request; the web app logs the query result as a temporary proof (not in the original scope).
- hey-api generates `*Options`/`*Mutation` helpers, not `useX` hooks.

## Not done / follow-ups

- Show real cache notes in the web grid (the log is a placeholder).
- Wire Electron to the cache with the SDK.
- Move the other duplicated dependencies (react, vitest, jsdom, tailwindcss, `@types/*`, testing-library) into the catalog.
- Response validation on large `GET /notes` lists was not measured; make it switchable if it proves slow.
- The remaining hand check for an empty field list after splitting `?fields=` (`app.ts`) is not in the schema.

## Harvest

- **CLAUDE.md:** (during step 9) status line, commands (`dev:all`, `generate`, `openapi`), structure for `packages/api-client` and the new cache files, the one-way contract flow convention and the dependency catalog convention. At completion: added the gotchas that cost time (fixed-key response shapes because of the zod plugin and `additionalProperties`, base URL needed in tests, `openapi.json` prettier-ignored).
- **README.md:** (step 9) commands table, layout, getting started and status line.
- **apps/cache/README.md, packages/api-client/README.md:** (step 9) OpenAPI section; new package README.
