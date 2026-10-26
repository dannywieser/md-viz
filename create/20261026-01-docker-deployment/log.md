# Create session: docker deployment

- **Slug:** 20261026-01-docker-deployment
- **Started:** 2026-10-26 08:00:13 MDT

---

### [2026-10-26 08:00:13] User
/create docker deployment

### [2026-10-26 08:00:20] Claude
Session started: `20261026-01-docker-deployment` (folder `create/20261026-01-docker-deployment/`). Asked the user what they want to create, with focused questions:
1. What should run in Docker: the cache service, the web app, both? (Electron stays native.)
2. Where will it run (homelab host, compose on a single machine, behind a reverse proxy)?
3. Persistence: where should the SQLite file live (volume/bind mount)?
4. Web app to cache connection: same origin via reverse proxy, or a configurable cache URL?
5. Images: multi-stage builds, any registry/CI publishing, or local `docker compose up` only?

### [2026-10-26 08:06:40] User
@"/Users/dgw/dev/dgwlab.net/"
1. both. do we need two containers?
2. homelab host with docker compose. I will also point you at my homelab config to setup a compose file with Caddy
3. for now, the data is ephemeral and doesn't need to be backed up, so I think it could live in the container, but let's discuss
4. same url, let's add a proxy
5. because I want to have a committed docker compose in my homelab config, we'll have to publish images. This is moving towards the idea that someone else could get the docker compose file, modify it for their needs and then pull the images.

### [2026-10-26 08:07:30] Claude
(Read the homelab repo: one folder per app with its own `docker-compose.yml`, shared external `edge` network, Caddy with one `<name>.dgwlab.net` block per app (route53 DNS-01 TLS), images from `ghcr.io/dannywieser/md-images:latest`, deploy = `docker compose pull && up -d --no-build`. md-viz web reads `VITE_CACHE_URL` at build time, cache reads `PORT`.)
Answers/discussion points:
- Containers: one or two. A: two (cache node image + web nginx static image), Caddy routes `/api*` (or similar) to cache and `/` to web, so Caddy is the proxy. B: one image where the cache also serves the built web app (needs static serving in the cache app), same origin by construction, one image to publish/pull. Recommended B for simplicity and for the "someone else pulls it" goal; A is cleaner separation.
- Same origin means the web app must default to a relative/`window.location.origin` cache URL instead of the baked `VITE_CACHE_URL`.
- Persistence: container-only means every `pull` + recreate empties the cache (Electron resyncs, so OK). A named volume is one line and costs nothing; suggested DB path via env var + volume, still no backups.
- Publishing: GHCR via GitHub Actions on push to main (latest + sha, maybe version tags). Questions: 1. host CPU arch (amd64/arm64, multi-arch?), 2. public image/repo? 3. one vs two containers, 4. the cache API has no auth and the Electron app on the Mac pushes to it: should the Caddy host be LAN/VPN only, or do we need auth? 5. hostname (e.g. `md.dgwlab.net`) and whether the compose file should live in md-viz as an example (`deploy/docker-compose.yml`) as well as in the homelab repo?

### [2026-10-26 08:15:10] User
1. A
2. amd. we can worry about multi-arch later
3. public is fine
4. yes, it's LAN only right now so no auth needed
5. md-viz.dgwlab.net is setup on route 53.  What I would want eventually is install instructions that do a wget on a base docker compose, which would then be modified to fit the needs of the install.

Caddy is the proxy in my case, but should we not have a baseline proxy in the example compose?

### [2026-10-26 08:16:00] Claude
Yes, with two containers the baseline compose needs something that puts web and cache on one origin. Proposal: the web image is nginx serving the static build and also proxying `/api/` to `cache:8787` (upstream overridable by env), so no third container. The example compose = `web` + `cache`, publishing one port; the user's Caddy just does `reverse_proxy md-viz-web:80` (like `retirement-web:80`) and owns TLS. Alternative: a separate proxy service in the compose (Caddy/nginx with a mounted config), more moving parts. Facts: cache routes today are `/health` and `/notes...` with no `/api` prefix, so the proxy strips `/api` (or the cache gains a prefix); the DB path is already `CACHE_DB` (default `apps/cache/data/cache.db`), the Node version is 24 (`.nvmrc`). Also: the web app's cache URL defaults to same origin `/api`; the Electron app keeps `CACHE_URL` (`https://md-viz.dgwlab.net/api`). Install story: example compose committed in md-viz (`deploy/docker-compose.yml`), fetched by `wget` from raw GitHub; images `ghcr.io/dannywieser/md-viz-web` and `md-viz-cache`, amd64 only for now. Asked to confirm.

### [2026-10-26 08:25:00] User
/create-plan

### [2026-10-26 08:26:00] Claude
Wrote `plan.md` (status `planned`): cache and web Dockerfiles, nginx in the web image proxying `/api/` to the cache (variable upstream + resolver so a recreated cache is re-resolved), web default URL `/api` plus a Vite dev proxy, `deploy/docker-compose.yml` + README, GHCR publish workflow (amd64, `latest` + sha), docs, local docker verification, optional homelab step at the end. Asked how to proceed: 1. implement everything, 2. step by step (pause after each numbered step), 3. file by file, 4. custom.

### [2026-10-26 08:30:00] User
1

### [2026-10-26 08:30:05] Decision
Implement everything (no pauses), logging each step.

### [2026-10-26 08:50:00] Claude
Steps 1-6 files written: web `main.tsx` default `/api`, `vite.config.ts` dev proxy (target `CACHE_URL` or localhost:8787, prefix stripped), `vite-env.d.ts` comment, `.claude/launch.json` gained a `cache` entry; step 1 verified in the Browser pane (`/api/health` and the app's `/api/notes` return 200 through the Vite proxy). Created `.dockerignore`, `apps/cache/Dockerfile`, `apps/web/Dockerfile`, `apps/web/nginx.conf.template`, `deploy/docker-compose.yml`, `deploy/README.md`, `.github/workflows/publish-images.yml`. Not yet verified: any `docker build` (Docker daemon is not running; Docker.app is installed). Docs (CLAUDE.md, README.md, apps/cache/README.md) still to do.

### [2026-10-26 09:20:00] Claude
Implementation done and verified locally. Deviations from plan: `pnpm deploy` needed `--legacy` (pnpm 10 refuses a plain deploy without `inject-workspace-packages`); `.claude/launch.json` gained a `cache` entry for the preview check; the Vite dev proxy target honours `CACHE_URL`. Verified with real Docker (arm64 host, so local images are arm64; the workflow builds amd64): cache image healthy, data survived container recreate with the volume; web image built; compose up on a test port gave `/api/health` 200 through nginx, SPA fallback 200, and recreating only `cache` recovered `/api/health` without restarting `web`. Docs updated: CLAUDE.md, README.md, apps/cache/README.md, deploy/README.md. Step 7 (no new unit tests: only an excluded entry file and config changed) and step 8 (format, lint, typecheck, coverage) done. Not done: step 9 (homelab repo, needs the user's OK), the workflow itself has not run on GitHub, GHCR packages must be made public after the first publish.

### [2026-10-26 09:30:00] User
Yes, prepare the homelab md-viz folder and Caddy block, uncommitted.

### [2026-10-26 09:31:00] Claude
In `/Users/dgw/dev/dgwlab.net` (uncommitted): added `md-viz/docker-compose.yml` (cache with `data` volume; web as `md-viz-web` on `default` + `edge`, `expose 80`, no published port), `md-viz/up.sh` (`pull` + `up -d --no-build`, like md-images), and a `md-viz.dgwlab.net` block in `caddy/site/Caddyfile` (`reverse_proxy md-viz-web:80`, same route53 TLS as the others). Compose validated with `docker compose config`.
