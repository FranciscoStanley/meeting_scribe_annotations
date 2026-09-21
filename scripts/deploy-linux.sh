#!/usr/bin/env bash
# Deploy Meeting Scribe em servidor Linux (Docker).
# Uso:
#   chmod +x scripts/deploy-linux.sh
#   cp .env.template .env   # edite NEXT_PUBLIC_* e CORS_ORIGIN com o IP/domínio
#   ./scripts/deploy-linux.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "[deploy] Criando .env a partir de .env.template"
  cp .env.template .env
  echo "[deploy] Edite .env (NEXT_PUBLIC_API_URL, CORS_ORIGIN) com o IP/domínio deste servidor e rode de novo."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy] Docker não encontrado. Instale Docker Engine + Compose plugin."
  exit 1
fi

echo "[deploy] Build + up (whisper, backend, frontend)…"
docker compose up --build -d

echo "[deploy] Status:"
docker compose ps

echo
echo "[deploy] Pronto."
echo "  Frontend: porta \${FRONTEND_PORT:-3000}"
echo "  Backend:  porta \${BACKEND_PORT:-3001}  →  /api/docs"
echo "  Whisper:  porta \${WHISPER_PORT:-8080}"
echo
echo "Abra o frontend no navegador e use Agendar reunião (horário + link)."
echo "Deixe a aba aberta para receber o pedido de participar/transcrever."
