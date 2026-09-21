#!/usr/bin/env bash
# Sobe Meeting Scribe local (Node) — sem Docker.
# Uso: chmod +x scripts/dev-local.sh && ./scripts/dev-local.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "[dev-local] Node.js >= 20 é obrigatório."
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  echo "[dev-local] Node.js >= 20 necessário (atual: $(node -v))."
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.template .env
  echo "[dev-local] Criado .env a partir de .env.template"
fi

# Garante Whisper embutido (sem container)
if grep -q '^STT_BASE_URL=http' .env 2>/dev/null; then
  echo "[dev-local] Aviso: STT_BASE_URL aponta para remoto/Docker."
  echo "            Para 100% local, deixe STT_BASE_URL= vazio e STT_PROVIDER=local"
fi

if [[ ! -d node_modules ]]; then
  echo "[dev-local] Instalando dependências…"
  npm install
fi

echo "[dev-local] Backend :3001 + Frontend :3000 (Whisper local no Node)"
echo "            Abra http://localhost:3000"
exec npm run dev
