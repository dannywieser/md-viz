# Build context is the repo root: docker build -f apps/cache/Dockerfile .
FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/cache ./apps/cache
RUN pnpm install --frozen-lockfile --filter @md-viz/cache... \
  && pnpm --filter @md-viz/cache deploy --legacy --prod /out

FROM node:24-alpine
ENV NODE_ENV=production PORT=8787 CACHE_DB=/data/cache.db
WORKDIR /app
COPY --from=build /out ./
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "src/index.ts"]
