# Backend — Meeting Scribe

API NestJS com Clean Architecture.

```
backend/
├── Dockerfile              # multi-stage (deps → build → runner)
├── docker-entrypoint.sh    # prisma migrate + start
├── prisma/                 # Schema e migrations
├── src/
│   ├── domain/             # entities, ports, schedule validation
│   ├── application/        # use cases (alerts, expire, CRUD…)
│   ├── infrastructure/     # Prisma, ICS/OAuth, Whisper, cron
│   ├── presentation/       # HTTP, WebSocket, SSE
│   └── modules/
└── package.json
```

## Subir

```powershell
copy ..\.env.template ..\.env
npm run dev            # API + UI
# ou só API:
npm run dev:backend
```

Guia local: [docs/dev-local.md](../docs/dev-local.md) · Realtime: [docs/realtime.md](../docs/realtime.md) · Segurança: [docs/security.md](../docs/security.md) · Arquitetura: [docs/architecture.md](../docs/architecture.md)

- Porta: **3001**
- Health: `GET /health` (público)
- Swagger: http://localhost:3001/api/docs (Authorize Bearer / X-API-Key se token ativo)
- Postman: `docs/postman/meeting-scribe.postman_collection.json`

## Segurança (resumo)

| Recurso | Config |
|---------|--------|
| API token | `API_ACCESS_TOKEN` + header Bearer / X-API-Key |
| Produção | `SECURITY_REQUIRE_TOKEN=true` ou `NODE_ENV=production` |
| Rate limit | `THROTTLE_LIMIT` / `THROTTLE_TTL_MS` |
| Áudio WS | `MAX_AUDIO_CHUNK_BYTES` |

## STT

| Modo | Config |
|------|--------|
| Local (default) | `STT_PROVIDER=local` no `.env` |
| Whisper Docker | `STT_BASE_URL=http://localhost:8080/v1` ou, no compose, `http://whisper:8000/v1` |

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/meetings` | Lista (encerra agendas vencidas antes) |
| POST | `/api/v1/meetings` | Agenda (`joinUrl`; fim > início) |
| POST | `/api/v1/meetings/sync-calendar` | Sync ICS/OAuth |
| GET | `/api/v1/meetings/:id/transcript` | Transcrição (+ expire se vencida) |
| GET | `/api/v1/meetings/:id` | Detalhe + `canModify` |
| PATCH | `/api/v1/meetings/:id` | Edita agenda **não iniciada** |
| DELETE | `/api/v1/meetings/:id` | Exclui agenda **não iniciada** |
| POST | `/api/v1/meetings/:id/start` | Marca LIVE |
| POST | `/api/v1/meetings/:id/complete` | Marca COMPLETED |
| GET/POST/DELETE | `/api/v1/calendar/feeds` | Feeds ICS |
| GET | `/api/v1/calendar/status` | OAuth + contas |
| GET | `/api/v1/events/stream` | SSE `meeting:starting` |
| WS | `/transcription` | Socket.IO áudio → STT |

## Alertas e encerramento

- `MEETING_ALERT_MINUTES` — lead antes do início  
- `MEETING_ALERT_GRACE_MINUTES` — atraso do cron após o início  
- `MEETING_DEFAULT_DURATION_MINUTES` — sem `scheduledEnd`, encerra N min após o início  
- Cron (1 min) + listagem/detalhe/transcrição: início e fim efetivo passados → `COMPLETED` (`ExpirePastMeetingsUseCase`)

Validação de horário: `assertMeetingSchedule` (shared) — fim posterior ao início.

## Testes

```bash
npm run test -w @meeting-scribe/backend
```

Cobre: `shouldAlert`, `shouldAutoComplete`, `ExpirePastMeetings`, `assertMeetingSchedule`, API access guard, platform detector.

Ao alterar APIs: Swagger, Postman, testes e este README (`keep-docs-in-sync`).
