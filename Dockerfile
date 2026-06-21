FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm ci

COPY . .
RUN npm run prisma:generate -w @infra/backend
RUN npm run build

FROM node:22-slim AS runner
ENV PRISMA_HIDE_UPDATE_MESSAGE=true
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl curl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/apps/backend/dist apps/backend/dist
COPY --from=builder /app/apps/frontend/dist apps/frontend/dist

# Expose the maintenance CLI as a bare `cli` command (docker compose exec -it infra-billing cli).
# npm won't link the workspace bin during `npm ci` (dist isn't built yet), so symlink it here.
RUN chmod +x apps/backend/dist/bin/cli.js \
  && ln -s /app/apps/backend/dist/bin/cli.js /usr/local/bin/cli

COPY apps/backend/prisma apps/backend/prisma
COPY apps/backend/prisma.config.ts apps/backend/prisma.config.ts

COPY docker-entrypoint.sh ./

ARG APP_VERSION=dev
ARG BUILD_TIME
ARG GIT_COMMIT
ENV APP_VERSION=$APP_VERSION \
    BUILD_TIME=$BUILD_TIME \
    GIT_COMMIT=$GIT_COMMIT

LABEL org.opencontainers.image.title="infra-billing" \
      org.opencontainers.image.description="Self-hosted infra billing panel" \
      org.opencontainers.image.version=$APP_VERSION \
      org.opencontainers.image.revision=$GIT_COMMIT

ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
CMD ["node", "apps/backend/dist/main.js"]
