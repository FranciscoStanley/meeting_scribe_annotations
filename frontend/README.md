# Frontend — Meeting Scribe

Next.js (App Router) + Tailwind. Build Docker usa `output: 'standalone'`.

```
frontend/
├── Dockerfile          # multi-stage
├── public/
└── src/
    ├── app/            # rotas (agendar, captura, transcrição)
    ├── components/     # alerta, speaker label, shell
    ├── hooks/          # SSE, captura de áudio (aba/mic)
    └── lib/            # api.ts, speaker-color (reexport shared)
```

## Subir

```powershell
copy ..\.env.template ..\.env
npm run dev:frontend

# Docker
docker compose up --build frontend
```

- Porta: **3000**
- Browser → `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` (ex.: `http://localhost:3001`)
- SSR no container → `API_INTERNAL_URL` (ex.: `http://backend:3001`)

Env vem do `.env` na raiz (bootstrap gera `.env.local`).

### Captura / STT

1. **Testar com microfone** na tela de captura (valida Whisper sem Meet).
2. Ou **áudio da aba**: Chrome → aba Meet/Teams → *Compartilhar áudio da aba*.
3. A cada ~5s um WebM completo vai ao backend via Socket.IO `/transcription`.

Protocolo: [docs/realtime.md](../docs/realtime.md).

### Falantes

Cor estável por nome: `speakerColor` em `@meeting-scribe/shared` (UI em `SpeakerLabel`).

Ao mudar fluxo de uso ou env: atualizar este README, `.env.template` e Postman/Swagger se houver contrato.
