# deploy

Run md-viz from published images: the note cache service (`ghcr.io/dannywieser/md-viz-cache`) and the web app (`ghcr.io/dannywieser/md-viz-web`, nginx). The web container serves the app and proxies `/api/` to the cache, so the browser sees one origin and nothing else is needed in front of it. Images are `linux/amd64` for now.

## Install

```bash
mkdir md-viz && cd md-viz
wget https://raw.githubusercontent.com/dannywieser/md-viz/main/deploy/docker-compose.yml
docker compose up -d
```

The app is on http://localhost:8080. Edit the compose file first if you need to: the published port, the cache volume (remove it for a cache that starts empty after every recreate) or `CACHE_UPSTREAM` (`host:port` the web container proxies `/api` to).

Update with `docker compose pull && docker compose up -d`.

## Behind a reverse proxy

Point the proxy at the `web` container (port 80) and drop its `ports` entry. With Caddy on a shared Docker network:

```
md-viz.example.com {
    reverse_proxy md-viz-web:80
}
```

Give the `web` service a `container_name` (or use its network alias) that the proxy can reach, and add the shared network to it.

## Syncing notes

Point the Electron app at the cache through the same host: start it with `CACHE_URL=https://md-viz.example.com/api`.

The cache has no authentication and `/api` allows writes. Keep it on a trusted network (LAN or VPN).

## Images

`.github/workflows/publish-images.yml` builds both images on every push to `main` and pushes them with the tags `latest` and the commit SHA. After the first publish, set both packages to public in the GitHub package settings.

Build locally from the repo root:

```bash
docker build -f apps/cache/Dockerfile -t md-viz-cache .
docker build -f apps/web/Dockerfile -t md-viz-web .
```
