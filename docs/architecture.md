# Arquitetura técnica — Meeting Scribe

**Autor:** Francisco Stanley Rodrigues Albuquerque  
**Versão do documento:** 1.2 · monorepo NestJS + Next.js + Electron

## 1. Visão geral

Meeting Scribe agenda reuniões (Teams/Meet), alerta perto do horário, captura áudio no browser/desktop e transcreve via Whisper (local ou Docker). Persistência em SQLite (Prisma).

```mermaid
flowchart LR
  subgraph Clients
    FE[Next.js :3000]
    Desk[Electron Desktop]
  end
  subgraph Server
    API[NestJS :3001]
    DB[(SQLite Prisma)]
    STT[Whisper local / :8080]
  end
  FE -->|HTTP + SSE + Socket.IO| API
  Desk -->|HTTP + Socket.IO| API
  API --> DB
  API --> STT
```

| Pacote | Papel |
|--------|--------|
| `frontend/` | UI corporativa (sidebar), captura aba/mic, SSE alertas, toasts/modais |
| `backend/` | Domínio, use cases, cron (alerta + expire), REST, WS, SSE |
| `desktop/` | Companion Teams Windows |
| `packages/shared/` | Tipos, permissões, cores, validação de horário |

Docs de referência: [security.md](security.md) · [realtime.md](realtime.md) · Postman em `docs/postman/`.

## 2. Clean Architecture (backend)

```mermaid
flowchart TB
  P[presentation — HTTP / WS / SSE] --> A[application — use cases]
  A --> D[domain — entities / ports]
  I[infrastructure — Prisma / STT / calendar / cron] -.implements.-> D
  I --> A
```

Regras: domínio sem Nest; use cases orquestram ports; adapters em infrastructure.

## 3. Ciclo de vida da agenda

### 3.1 Status

```mermaid
stateDiagram-v2
  [*] --> SCHEDULED: criar / reagendar
  SCHEDULED --> AWAITING_JOIN: alerta SSE (cron)
  AWAITING_JOIN --> LIVE: start / captura
  SCHEDULED --> LIVE: start direto
  LIVE --> COMPLETED: complete manual
  SCHEDULED --> COMPLETED: horário vencido
  AWAITING_JOIN --> COMPLETED: horário vencido
  LIVE --> COMPLETED: horário vencido
  SCHEDULED --> CANCELLED: cancelar
  COMPLETED --> [*]
  CANCELLED --> [*]
```

### 3.2 Encerramento automático por data

Fim efetivo = `scheduledEnd` **ou** `scheduledStart + MEETING_DEFAULT_DURATION_MINUTES`.

Se **início e fim efetivo** já passaram → `COMPLETED` (`ExpirePastMeetingsUseCase`).

Disparado por: cron (1 min), `GET /meetings`, detalhe e transcrição.

### 3.3 Validação de horários

| Camada | Regra |
|--------|--------|
| Shared `validateMeetingSchedule` | Início válido; fim > início; opcional rejeitar passado |
| Formulários (DateTimeField) | `rejectPastStart: true` + calendário `react-day-picker` |
| API create/update | `assertMeetingSchedule` (fim > início; passado permitido p/ sync calendário) |

## 4. Fluxos de processo

### 4.1 Agendar e alertar

```mermaid
sequenceDiagram
  actor U as Usuário
  participant FE as Frontend
  participant API as NestJS
  participant Cron as Scheduler
  participant SSE as EventSource

  U->>FE: Agendar (título, início, fim?, link)
  FE->>FE: validateMeetingSchedule
  FE->>API: POST /api/v1/meetings
  API->>API: assertMeetingSchedule + save SCHEDULED
  loop a cada minuto
    Cron->>API: ExpirePastMeetings
    Cron->>API: Sync calendar
    Cron->>API: ProcessMeetingAlerts
  end
  Cron-->>SSE: meeting:starting
  SSE-->>FE: Modal Participar e transcrever
```

### 4.2 Captura e transcrição

```mermaid
sequenceDiagram
  actor U as Usuário
  participant FE as Frontend
  participant WS as Socket.IO /transcription
  participant API as NestJS
  participant STT as Whisper

  U->>FE: Iniciar captura (aba / mic)
  FE->>WS: auth.token + session:start
  loop chunks ~5s
    FE->>WS: audio:chunk base64
    WS->>API: TranscribeAudioChunk
    API->>STT: áudio
    STT-->>API: texto + speaker
    API-->>WS: transcript:segment
    WS-->>FE: lista colorida por falante
  end
  U->>FE: Encerrar
  FE->>WS: session:complete
  API->>API: status COMPLETED
```

### 4.3 Lista e UI de ações

```mermaid
flowchart TD
  A[GET /meetings] --> B[ExpirePastMeetings]
  B --> C[Lista com status atualizado]
  C --> D{Status}
  D -->|SCHEDULED / AWAITING| E[Editar · Excluir · Abrir]
  D -->|LIVE / COMPLETED| F[Abrir primário]
  D -->|COMPLETED / CANCELLED| G[Sem botão de captura no detalhe]
```

## 5. Frontend — UI e formulários

### 5.1 Shell

- `Sidebar`: Home · Agenda · Calendário · API (Swagger)
- `BackLink` em editar / visualizar / agendar / captura / calendários
- `ConfirmDialog` + `react-toastify` para exclusão e feedback

### 5.2 Datas

- Lib: **react-day-picker** + **date-fns** (`pt-BR`)
- `DateTimeField`: calendário + horário; popover via **portal** no `document.body` (evita corte por `overflow`)
- `MeetingScheduleForm`: seções Identidade / Horário / Link + duração
- Validação: `validateMeetingSchedule` (shared)

### 5.3 Transcrição

- Cores: `buildSpeakerColorMap` (ordem de aparição)
- Sem botão de captura se `meetingCanCapture` for false (`COMPLETED` / `CANCELLED`)

## 6. Segurança (resumo)

Ver [security.md](security.md). Token opcional em local; obrigatório em produção. Helmet, throttle, CSP no Next, auth no WS.

## 7. Portas e artefatos

| Serviço | Porta |
|---------|-------|
| Frontend | 3000 |
| Backend / Swagger | 3001 (`/api/docs`) |
| Whisper Docker | 8080 |

| Doc | Conteúdo |
|-----|----------|
| Este arquivo | Arquitetura + fluxogramas |
| [realtime.md](realtime.md) | SSE / Socket.IO |
| [security.md](security.md) | Hardening |
| Postman | `docs/postman/` |

## 8. Testes relevantes

| Pacote | Specs |
|--------|--------|
| `packages/shared` | `meeting-schedule`, `meeting-permissions`, `speaker-color`, `teams-links` |
| `backend` | entity auto-complete / shouldAlert, ExpirePastMeetings, schedule assert, API guard |
| `frontend` | `datetime.spec.ts` (Vitest) |

```bash
npm run test -w @meeting-scribe/shared
npm run test -w @meeting-scribe/backend
npm run test -w @meeting-scribe/frontend
```
