# Frontend — Meeting Scribe

Next.js (App Router) + Tailwind. Build Docker usa `output: 'standalone'`.

```
frontend/
├── Dockerfile          # multi-stage
├── public/
└── src/
    ├── app/            # rotas
    ├── components/
    ├── hooks/          # SSE, captura de áudio
    └── lib/api.ts      # HTTP (SSR usa API_INTERNAL_URL no Docker)
```

## Subir

```powershell
copy ..\.env.template ..\.env
npm run dev:frontend

# Docker
docker compose up --build frontend
```

- Porta: **3000**
- Browser → `NEXT_PUBLIC_API_URL` (ex.: `http://localhost:3001`)
- SSR no container → `API_INTERNAL_URL` (ex.: `http://backend:3001`)

Env vem do `.env` na raiz (bootstrap gera `.env.local`).

Ao mudar fluxo de uso ou env: atualizar este README e `.env.template`.
