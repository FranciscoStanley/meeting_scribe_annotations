# Realtime — SSE e WebSocket

Contrato complementar ao Swagger HTTP (`/api/docs`).

## SSE — `GET /api/v1/events/stream`

Usado pelo frontend (e desktop) para o modal **Participar e transcrever**.

| Evento | Payload |
|--------|---------|
| `meeting:starting` | `sessionId`, `title`, `platform`, `joinUrl?`, `startsInMinutes` |
| `heartbeat` | `at` (ISO) a cada ~25s |

Janela do cron (`ProcessMeetingAlertsUseCase`):

- `MEETING_ALERT_MINUTES` — minutos **antes** do início (default `3`)
- `MEETING_ALERT_GRACE_MINUTES` — minutos **depois** do início ainda elegíveis (default `5`)

## WebSocket — Socket.IO namespace `/transcription`

URL: `{NEXT_PUBLIC_WS_URL}/transcription` (ex.: `http://localhost:3001/transcription`).

### Client → Server

| Evento | Body |
|--------|------|
| `session:start` | `{ sessionId }` — join room + marca LIVE |
| `session:subscribe` | `{ sessionId }` — só entra na room (UI) |
| `audio:chunk` | `{ sessionId, mimeType, data }` — `data` em base64 (WebM/Opus completo ~5s) |
| `session:complete` | `{ sessionId }` — marca COMPLETED |

Ack de `audio:chunk`: `{ ok: boolean, transcribed?: boolean }`.

### Server → Client

| Evento | Body |
|--------|------|
| `transcript:segment` | `{ id, speakerLabel, text, startedAt, confidence? }` |

Emitido na room `session:{sessionId}` (e também no socket do remetente).

## Captura (frontend)

1. Preferir **Testar com microfone** para validar STT.
2. Google Meet / Teams **web**: Chrome → aba da reunião → marcar **Compartilhar áudio da aba**.
3. App desktop Meet/Teams **não** fornece áudio via `getDisplayMedia`.

STT: `STT_PROVIDER=local` (Whisper embutido) ou `STT_BASE_URL` (Whisper Docker / API compatível).

## Cores de falantes

`speakerColor(label)` em `@meeting-scribe/shared` — cor estável por nome na UI.
