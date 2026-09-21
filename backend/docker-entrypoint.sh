#!/bin/sh
set -e

echo "[backend] Applying Prisma migrations…"
npx prisma migrate deploy

echo "[backend] Starting NestJS on port ${PORT:-3001}…"
exec node dist/main.js
