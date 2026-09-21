# Meeting Scribe — Backend (NestJS) multi-stage
# Build context: monorepo root

FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

RUN npm ci -w @meeting-scribe/shared -w @meeting-scribe/backend --include-workspace-root

FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY packages/shared ./packages/shared
COPY backend ./backend

RUN npm run build -w @meeting-scribe/shared \
  && npm run prisma:generate -w @meeting-scribe/backend \
  && npm run build -w @meeting-scribe/backend

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nestjs

COPY --from=build --chown=nestjs:nodejs /app/package.json /app/package-lock.json ./
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/packages/shared ./packages/shared
COPY --from=build --chown=nestjs:nodejs /app/backend/package.json ./backend/package.json
COPY --from=build --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=build --chown=nestjs:nodejs /app/backend/prisma ./backend/prisma

COPY --chown=nestjs:nodejs backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh

RUN sed -i 's/\r$//' ./backend/docker-entrypoint.sh \
  && chmod +x ./backend/docker-entrypoint.sh \
  && mkdir -p /app/backend/prisma/data \
  && chown -R nestjs:nodejs /app/backend/prisma

USER nestjs
WORKDIR /app/backend

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
