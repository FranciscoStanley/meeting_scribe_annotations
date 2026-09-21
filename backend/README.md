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
# Local sem Docker (raiz do monorepo)
copy ..\.env.template ..\.env
npm run dev            # API + UI
# ou só API:
npm run dev:backend

# Via Docker Compose (raiz)
docker compose up --build backend
```

Guia local: [docs/dev-local.md](../docs/dev-local.md) · Realtime: [docs/realtime.md](../docs/realtime.md)

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
| POST | `/api/v1/meetings` | Agenda (horário + **joinUrl** obrigatório) |
| POST | `/api/v1/meetings/sync-calendar` | Sync ICS/OAuth |
| GET | `/api/v1/meetings/:id/transcript` | Transcrição |
| GET | `/api/v1/meetings/:id` | Detalhe + `canModify` |
| PATCH | `/api/v1/meetings/:id` | Edita agenda **não iniciada** |
| DELETE | `/api/v1/meetings/:id` | Exclui agenda **não iniciada** |
| POST | `/api/v1/meetings/:id/start` | Marca LIVE |
| POST | `/api/v1/meetings/:id/complete` | Marca COMPLETED |
| GET/POST/DELETE | `/api/v1/calendar/feeds` | Feeds ICS |
| GET | `/api/v1/calendar/status` | OAuth + contas |
| GET | `/api/v1/events/stream` | SSE `meeting:starting` |
| WS | `/transcription` | Socket.IO áudio → STT |

## Alertas

- `MEETING_ALERT_MINUTES` (lead antes do início)
- `MEETING_ALERT_GRACE_MINUTES` (atraso do cron após o início)

## Testes

```bash
npm run test -w @meeting-scribe/backend
```

Cobre domínio (`shouldAlert`), use case de alertas e detector de plataforma.

Ao alterar APIs: atualizar Swagger, Postman, testes e este README (`keep-docs-in-sync`).
