# Build context is the repo root: docker build -f apps/web/Dockerfile .
FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY apps/cache/package.json apps/cache/openapi.json ./apps/cache/
COPY apps/web ./apps/web
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @md-viz/web... \
  && pnpm --filter @md-viz/api-client generate \
  && pnpm --filter @md-viz/web build

FROM nginx:alpine
ENV CACHE_UPSTREAM=cache:8787 NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
