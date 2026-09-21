# Backend — Meeting Scribe

API NestJS com Clean Architecture.

```
backend/
├── Dockerfile              # multi-stage (deps → build → runner)
├── docker-entrypoint.sh    # prisma migrate + start
├── prisma/                 # Schema e migrations
├── src/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/     # Prisma, ICS/OAuth, Whisper local/remoto
│   ├── presentation/       # HTTP, WebSocket, SSE
│   └── modules/
└── package.json
```

## Subir

```powershell
# Via monorepo (env na raiz)
copy ..\.env.template ..\.env
npm run dev:backend

# Via Docker Compose (raiz)
docker compose up --build backend
```

- Porta: **3001**
- Health: `GET /health`
- Swagger: http://localhost:3001/api/docs
- Postman: `docs/postman/meeting-scribe.postman_collection.json`

## STT

| Modo | Config |
|------|--------|
| Local (default) | `STT_PROVIDER=local` no `.env` |
| Whisper Docker | `STT_BASE_URL=http://localhost:8080/v1` ou, no compose, `http://whisper:8000/v1` |

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/meetings` | Lista reuniões |
| POST | `/api/v1/meetings` | Cria reunião manual |
| POST | `/api/v1/meetings/sync-calendar` | Sync ICS/OAuth |
| GET | `/api/v1/meetings/:id/transcript` | Transcrição |
| GET/POST/DELETE | `/api/v1/calendar/feeds` | Feeds ICS |
| GET | `/api/v1/events/stream` | SSE alertas |
| WS | `/transcription` | Chunks de áudio |

Ao alterar APIs: atualizar Swagger, Postman, testes e este README (`keep-docs-in-sync`).
