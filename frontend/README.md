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

### Captura / STT

1. **Testar com microfone** na tela de captura (mais fácil).
2. Ou **áudio da aba**: Chrome → aba Meet/Teams → marque *Compartilhar áudio da aba*.
3. A cada ~5s um WebM completo vai ao backend (`STT_PROVIDER=local`).

Na transcrição (ao vivo e salva), cada falante ganha uma **cor estável** pelo nome
(`lib/speaker-color.ts`).

Ao mudar fluxo de uso ou env: atualizar este README e `.env.template`.
