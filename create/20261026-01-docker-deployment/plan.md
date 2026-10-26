# Plan: docker deployment

## Goal

Run md-viz's cache service and web app as two published Docker images that anyone can start from one example `docker-compose.yml` (fetched with `wget`, edited, then `docker compose up`). The web image is nginx: it serves the static build and proxies `/api/` to the cache, so the web app and the API share one origin and the compose needs no third container. The author's homelab puts Caddy in front at `md-viz.dgwlab.net`.

## Scope

In:
- `Dockerfile` for the cache (Node 24, runs TypeScript directly) and for the web app (build, then nginx)
- nginx config with the `/api/` proxy (prefix stripped, upstream and resolver from env)
- web app: cache URL defaults to same-origin `/api`; the Vite dev server proxies `/api` to the cache so `pnpm dev` keeps working
- `deploy/docker-compose.yml` (example) and `deploy/README.md` (install instructions, Caddy snippet, Electron `CACHE_URL`)
- GitHub Actions workflow building and pushing both images to GHCR (amd64) on push to `main`
- docs: `CLAUDE.md`, `README.md`, `apps/cache/README.md`
- local verification with real `docker build` / `docker compose up`

Out:
- auth (LAN only), TLS in the compose (the user's own proxy owns it), backups
- multi-arch images, version-tagged releases (later)
- the Electron app and the design viewer (not deployed)
- changes to the homelab repo (`/Users/dgw/dev/dgwlab.net`) happen only in the last step, uncommitted, after the user agrees

## Technologies

- Docker, multi-stage builds. Cache: `node:24-alpine` (`node:sqlite` is built in; `node` runs `.ts` with type stripping, so no build step). Web: `node:24-alpine` build stage, `nginx:alpine` runtime.
- pnpm 10 (pinned via `packageManager`, enabled with corepack) in the build stages; `pnpm deploy --prod` gives the cache image only its own production deps.
- nginx official image templating: `/etc/nginx/templates/*.template` with `envsubst`, and `NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1` exposing `${NGINX_LOCAL_RESOLVERS}`. The proxy uses a variable upstream plus `resolver`, so nginx re-resolves `cache` and survives the cache container being recreated (a static `proxy_pass` pins the IP at start and returns 502 after `pull` + `up -d`).
- GitHub Actions: `docker/login-action`, `docker/metadata-action`, `docker/build-push-action`, GHCR with the built-in `GITHUB_TOKEN`.

## Repository structure

```
.dockerignore
.github/workflows/publish-images.yml
apps/cache/Dockerfile
apps/web/Dockerfile
apps/web/nginx.conf.template
apps/web/vite.config.ts            (dev proxy)
apps/web/src/main.tsx              (default base URL)
apps/web/src/vite-env.d.ts         (comment)
deploy/docker-compose.yml
deploy/README.md
```

## Files

- `.dockerignore` - keeps `node_modules`, `dist`, `coverage`, `.git`, `apps/cache/data`, `create`, `demo` out of the build context
- `apps/cache/Dockerfile` - build context is the repo root. Stage 1: corepack pnpm, copy manifests + lockfile + sources, `pnpm install --frozen-lockfile`, `pnpm deploy --filter @md-viz/cache --prod /out`. Stage 2: `node:24-alpine`, copy `/out`, `ENV PORT=8787 CACHE_DB=/data/cache.db`, `/data` owned by `node`, `USER node`, `VOLUME /data`, `HEALTHCHECK` (node fetch of `/health`), `CMD ["node", "src/index.ts"]`
- `apps/web/Dockerfile` - stage 1: install, `pnpm generate`, `pnpm --filter @md-viz/web build`. Stage 2: `nginx:alpine`, copy `dist` to `/usr/share/nginx/html`, copy the template, `ENV CACHE_UPSTREAM=cache:8787 NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1`, `HEALTHCHECK`
- `apps/web/nginx.conf.template` - `location /api/` rewrites to strip `/api`, `proxy_pass http://$cache_upstream` with `resolver ${NGINX_LOCAL_RESOLVERS}`; `location /` serves static files with `index.html` fallback; long cache for hashed `/assets/`, no-cache for `index.html`; `$` in nginx vars escaped for envsubst
- `apps/web/src/main.tsx` - `baseUrl: import.meta.env.VITE_CACHE_URL ?? '/api'`
- `apps/web/vite.config.ts` - `server.proxy['/api']` to `http://localhost:8787` with the prefix stripped, so dev is same-origin too
- `apps/web/src/vite-env.d.ts` - update the `VITE_CACHE_URL` comment (default `/api`)
- `deploy/docker-compose.yml` - services `cache` (image `ghcr.io/dannywieser/md-viz-cache:latest`, named volume `data:/data`, healthcheck) and `web` (image `ghcr.io/dannywieser/md-viz-web:latest`, `depends_on` cache healthy, `ports: "8080:80"`, `CACHE_UPSTREAM`), `restart: unless-stopped`, comments saying what to change (port, volume, upstream)
- `deploy/README.md` - `wget` of the raw compose, `docker compose up -d`, the volume (remove it for ephemeral data), updating (`pull` + `up -d`), putting a reverse proxy in front (Caddy example `reverse_proxy md-viz-web:80`), pointing the Electron app at it (`CACHE_URL=https://<host>/api`), no auth warning
- `.github/workflows/publish-images.yml` - on push to `main` (and manual dispatch): two jobs or a matrix building `apps/cache/Dockerfile` and `apps/web/Dockerfile` for `linux/amd64`, tags `latest` and the commit SHA, GHA layer cache, `permissions: contents: read, packages: write`
- `CLAUDE.md`, `README.md`, `apps/cache/README.md` - document the images, `deploy/`, the `/api` default and dev proxy

## Steps

1. Web app: default the cache base URL to `/api` in `main.tsx`, add the Vite dev proxy, update `vite-env.d.ts`. Run the dev stack (`pnpm dev:cache` + `pnpm dev`) and confirm the grid still loads through `/api`.
2. Add `.dockerignore` and `apps/cache/Dockerfile`; `docker build`, run it with a volume, `curl /health`, push a note, recreate the container and confirm the data survives.
3. Add `apps/web/nginx.conf.template` and `apps/web/Dockerfile`; `docker build`, then run both together by hand on a network.
4. Add `deploy/docker-compose.yml`; `docker compose up` locally with locally built images, check the page and `/api/health` through port 8080, recreate only `cache` and confirm `/api/health` recovers without restarting `web`.
5. Add `.github/workflows/publish-images.yml`; lint it by reading (no `act`), check the tags and permissions.
6. Write `deploy/README.md` and update `CLAUDE.md`, `README.md`, `apps/cache/README.md`.
7. Tests: no source file with logic changes (`main.tsx` is an excluded entry file, `vite.config.ts` is config, the rest is Docker/CI), so no new unit tests are needed. State this in the log. If `apps/web/tests` has anything asserting the old default URL, update it.
8. Run `pnpm format`, `pnpm lint`, `pnpm typecheck` and `pnpm coverage`; every workspace must stay at or above 95% (lines, statements, branches, functions).
9. Optional, only after the user agrees: prepare `md-viz/` in `/Users/dgw/dev/dgwlab.net` (compose with the `edge` network and no published port, `up.sh` like `md-images`) and a `md-viz.dgwlab.net` block in `caddy/site/Caddyfile`, uncommitted.

## Open questions / risks

- One-time manual step on GitHub: after the first publish, set both GHCR packages to public (and link them to the repo). The workflow cannot do this.
- `pnpm deploy` in pnpm 10 may require `inject-workspace-packages=true`; the cache has no workspace dependencies, so it should work as is. If it fails, fall back to `pnpm install --filter @md-viz/cache... --prod`.
- `node:sqlite` is experimental and prints a warning at start (expected, already the case in dev).
- The cache has no auth and `/api` exposes write routes; fine on a LAN, noted in `deploy/README.md`.
- The Docker build runs `pnpm generate` (hey-api); it needs the committed `apps/cache/openapi.json` only, no network.
- Image names are `md-viz-web` and `md-viz-cache`; say so if you want different names.
