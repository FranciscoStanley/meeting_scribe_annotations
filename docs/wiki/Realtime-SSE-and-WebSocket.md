# Realtime SSE and WebSocket

Contrato complementar ao Swagger HTTP.

## SSE — alertas

`GET /api/v1/events/stream`

| Evento | Payload |
|--------|---------|
| `meeting:starting` | `sessionId`, `title`, `platform`, `joinUrl?`, `startsInMinutes` |
| `heartbeat` | `at` (ISO) ~25s |

Janela do cron:

- `MEETING_ALERT_MINUTES` — minutos **antes** do início (default `3`)
- `MEETING_ALERT_GRACE_MINUTES` — atraso após o início (default `5`)

Auth: `?apiKey=` quando `API_ACCESS_TOKEN` estiver definido.

## WebSocket — transcrição

Namespace Socket.IO: `/transcription`  
URL: `{NEXT_PUBLIC_WS_URL}/transcription`

### Client → Server

| Evento | Body |
|--------|------|
| `session:start` | `{ sessionId }` |
| `session:subscribe` | `{ sessionId }` |
| `audio:chunk` | `{ sessionId, mimeType, data }` (base64 WebM ~5s) |
| `session:complete` | `{ sessionId }` |

### Server → Client

| Evento | Body |
|--------|------|
| `transcript:segment` | `{ id, speakerLabel, text, startedAt, confidence? }` |

Auth: `io(url, { auth: { token } })`  
Limite: `MAX_AUDIO_CHUNK_BYTES`

Detalhes: [`docs/realtime.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/realtime.md)
