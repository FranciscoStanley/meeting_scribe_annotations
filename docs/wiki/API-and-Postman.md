# API and Postman

## Swagger

Com o backend no ar: http://localhost:3001/api/docs  

Authorize com **Bearer** ou **api-key** se `API_ACCESS_TOKEN` estiver setado.

## Endpoints principais

| Método | Rota | Notas |
|--------|------|-------|
| GET | `/health` | Público |
| GET/POST | `/api/v1/auth/status`, `/login` | Público (login com throttle) |
| GET/POST/PATCH/DELETE | `/api/v1/meetings` | CRUD + expire de agendas vencidas |
| POST | `/api/v1/meetings/:id/start\|complete` | Sessão LIVE / COMPLETED |
| GET | `/api/v1/events/stream` | SSE |
| WS | `/transcription` | Socket.IO |

## Postman

Collection versionada:

[`docs/postman/meeting-scribe.postman_collection.json`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/postman/meeting-scribe.postman_collection.json)

Variáveis:

- `baseUrl` → `http://localhost:3001`  
- `apiKey` → igual a `API_ACCESS_TOKEN` (vazio = API aberta em local)

Pastas: **Health**, **Auth**, **Meetings**, **Calendar**, **Events SSE**, **WebSocket docs**.

Ao mudar contratos HTTP: atualizar Swagger (`@Api*`), Postman e testes (rule `keep-docs-in-sync`).
