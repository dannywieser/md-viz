# Summary: docker deployment

- **Slug:** 20261026-01-docker-deployment
- **Started:** 2026-10-26
- **Completed:** 2026-10-26

## Overview

md-viz can now be deployed from published Docker images. The cache service and the web app are two images; the web image is nginx, which serves the static build and proxies `/api/` to the cache, so the browser sees one origin and the example compose needs no third container. The author's homelab puts Caddy in front at `md-viz.dgwlab.net`; anyone else can `wget` the example compose, edit it and pull the images.

## What was done

- **Images:** `apps/cache/Dockerfile` (Node 24 alpine, `node src/index.ts`, `CACHE_DB=/data/cache.db`, `/data` volume, non-root, healthcheck), `apps/web/Dockerfile` (build, then nginx), `apps/web/nginx.conf.template` (`/api/` proxy with the prefix stripped, variable upstream plus resolver, asset caching, SPA fallback), `.dockerignore`.
- **Web app:** cache base URL defaults to same-origin `/api` (`main.tsx`, `vite-env.d.ts`); `vite.config.ts` proxies `/api` to `CACHE_URL` (default `http://localhost:8787`) in dev; `.claude/launch.json` gained a `cache` entry.
- **Deploy:** `deploy/docker-compose.yml` (base file) and `deploy/README.md` (`wget` install, update, reverse proxy, Electron `CACHE_URL`, no-auth warning).
- **CI:** `.github/workflows/publish-images.yml` pushes `ghcr.io/dannywieser/md-viz-cache` and `md-viz-web` (amd64, `latest` + commit SHA) on push to `main`.
- **Homelab repo** (`/Users/dgw/dev/dgwlab.net`, uncommitted): `md-viz/docker-compose.yml`, `md-viz/up.sh` and a `md-viz.dgwlab.net` block in `caddy/site/Caddyfile`.
- **Docs:** `CLAUDE.md`, `README.md`, `apps/cache/README.md`. PR: https://github.com/dannywieser/md-viz/pull/9

## Highlights

- Two containers (not one) was chosen; the proxy lives in the web image so the baseline compose stays at two services and the homelab Caddy has a single upstream.
- A variable `proxy_pass` with a resolver (`NGINX_ENTRYPOINT_LOCAL_RESOLVERS`) keeps the proxy working when only the cache container is recreated; a static upstream would return 502 after `pull` + `up -d`. Verified by recreating only the cache.
- Data lives in a named volume; removing it gives the ephemeral setup the user first suggested.
- No auth: the cache is LAN/VPN only, noted in the docs.

## Coverage

Fresh `pnpm coverage` exited 0 with all six workspaces run; thresholds are still 95% in every config and no exclusion was added.

| workspace | statements | branches | functions | lines |
| --- | --- | --- | --- | --- |
| apps/cache | 100% | 100% | 100% | 100% |
| packages/api-client | 100% | 100% | 100% | 100% |
| packages/ui | 99.61% | 98.7% | 100% | 100% |
| apps/design | 99.39% | 100% | 98.9% | 99.35% |
| apps/electron | 100% | 98.78% | 100% | 100% |
| apps/web | 100% | 100% | 100% | 100% |

Threshold: 95% for statements, branches, functions and lines per workspace. No new unit tests: only an excluded entry file, config, Docker and CI files changed.

## Deviations from the plan

- `pnpm deploy` needed `--legacy` (pnpm 10 refuses a plain deploy without `inject-workspace-packages`).
- The Vite dev proxy target honours `CACHE_URL`, and `.claude/launch.json` got a `cache` entry for the preview check.
- Local verification ran on an arm64 host, so the local images were arm64; the workflow builds amd64.

## Not done / follow-ups

- The publish workflow has not run on GitHub yet; after the first publish both GHCR packages must be set to public by hand.
- The homelab changes are uncommitted; deploying means committing them, running `md-viz/up.sh` and reloading Caddy.
- Multi-arch images and version-tagged releases (out of scope for now).

## Harvest

- `CLAUDE.md`: added the Docker build commands, the `deploy/` directory, and a convention paragraph (images and publish workflow, `--legacy` deploy, nginx `/api` proxy and why it re-resolves, `/api` default and dev proxy, `.dockerignore` gotcha, no auth). Done during implementation.
- `README.md`: added a Docker section pointing at `deploy/README.md`. Done during implementation.
- `apps/cache/README.md`: documented the Docker env defaults. Done during implementation.
- Nothing further needed.
