# syntax=docker/dockerfile:1.7
FROM node:24.20.0-bookworm-slim AS build
ARG GARMENT_CANVAS_BUILD_CODE_SHA=""
ARG GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256=""
ARG GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256=""
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN node scripts/write-build-identity.mjs /app/.garment-canvas-build-identity.json "$GARMENT_CANVAS_BUILD_CODE_SHA"
RUN --mount=type=secret,id=evaluation_release_registry,required=false \
  set -eu; \
  if [ -n "$GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256" ]; then \
    test -f /run/secrets/evaluation_release_registry; \
    export GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH=/run/secrets/evaluation_release_registry; \
  fi; \
  npm run build
RUN npm prune --omit=dev

FROM node:24.20.0-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/.garment-canvas-build-identity.json ./.garment-canvas-build-identity.json
# data/ 目录持久化项目/上传图片/蒙版与视频产物。视频（Seedance MP4）单文件 5–50MB
# 落 data/uploads/；按 D3 裁定有意不设保留期/容量上限/自动清理，磁盘监控属运维常规动作。
RUN mkdir -p /app/data \
  && chown -R root:root /app \
  && chmod -R a-w /app \
  && chown node:node /app/data \
  && chmod 0750 /app/data
USER node
EXPOSE 3002
CMD ["node", "dist-server/index.js"]
