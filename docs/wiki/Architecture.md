# Architecture

Visão técnica do monorepo Meeting Scribe — diagramas pensados para review de engenharia.

**Autor:** Francisco Stanley Rodrigues Albuquerque

## Visão de contexto

```mermaid
flowchart TB
  subgraph Actors[" "]
    U([Operador])
  end

  subgraph Clients["Clientes"]
    FE["Next.js :3000<br/>Login · Agenda · Captura"]
    Desk["Electron<br/>Companion Teams"]
  end

  subgraph Edge["Backend NestJS :3001"]
    API["REST + Swagger"]
    SSE["SSE · alertas"]
    WS["Socket.IO · /transcription"]
  end

  subgraph Data["Persistência & STT"]
    DB[("SQLite · Prisma")]
    STT["Whisper<br/>local ou :8080"]
  end

  subgraph SharedPkg["@meeting-scribe/shared"]
    Rules["Schedule · permissões · cores"]
  end

  U --> FE
  U --> Desk
  FE -->|"HTTPS · SSE · WS"| API
  FE --> SSE
  FE --> WS
  Desk --> API
  Desk --> WS
  API --> DB
  WS --> STT
  FE -.-> Rules
  API -.-> Rules
  Desk -.-> Rules
```

## Pacotes

| Pasta | Papel |
|-------|--------|
| `frontend/` | Next.js — login, sidebar, agenda, captura, SSE |
| `backend/` | NestJS — domínio, use cases, cron, REST, WS, SSE |
| `desktop/` | Electron — companion Teams Windows |
| `packages/shared/` | Tipos, permissões, cores, validação de horário |
| `docs/` | Architecture, security, Postman, screenshots |

## Clean Architecture (backend)

```mermaid
flowchart TB
  subgraph Presentation["presentation"]
    HTTP["Controllers HTTP"]
    Gateway["WS Gateway"]
    Stream["SSE stream"]
  end

  subgraph Application["application"]
    UC["Use cases<br/>alerts · expire · CRUD · login · STT"]
  end

  subgraph Domain["domain"]
    ENT["Entities · policies"]
    PORTS["Ports / interfaces"]
  end

  subgraph Infra["infrastructure"]
    PRISMA["Prisma"]
    WHISPER["Whisper adapter"]
    CAL["ICS / OAuth"]
    CRON["Schedulers"]
  end

  HTTP --> UC
  Gateway --> UC
  Stream --> UC
  UC --> ENT
  UC --> PORTS
  PRISMA -.implements.-> PORTS
  WHISPER -.implements.-> PORTS
  CAL -.implements.-> PORTS
  CRON --> UC
```

- Domínio **sem** dependência Nest  
- Use cases orquestram ports  
- Adapters em `infrastructure/`

## Fluxo ponta a ponta

```mermaid
sequenceDiagram
  autonumber
  actor U as Operador
  participant FE as Next.js
  participant API as NestJS
  participant Cron as Scheduler
  participant SSE as EventSource
  participant WS as Socket.IO
  participant STT as Whisper

  U->>FE: Login + agendar reunião
  FE->>FE: validateMeetingSchedule
  FE->>API: POST /meetings
  API-->>FE: SCHEDULED

  loop a cada minuto
    Cron->>API: ExpirePastMeetings
    Cron->>API: ProcessMeetingAlerts
  end
  API-->>SSE: meeting:starting
  SSE-->>FE: Modal Participar e transcrever

  U->>FE: Inicia captura (aba / mic)
  FE->>WS: session:start + audio:chunk (~5s)
  WS->>API: TranscribeAudioChunk
  API->>STT: áudio
  STT-->>API: texto + falante
  API-->>WS: transcript:segment
  WS-->>FE: trechos coloridos
```

## Ciclo de vida da agenda

```mermaid
stateDiagram-v2
  [*] --> SCHEDULED: criar / reagendar
  SCHEDULED --> AWAITING_JOIN: alerta SSE
  AWAITING_JOIN --> LIVE: start / captura
  SCHEDULED --> LIVE: start direto
  LIVE --> COMPLETED: complete
  SCHEDULED --> COMPLETED: horário vencido
  AWAITING_JOIN --> COMPLETED: horário vencido
  LIVE --> COMPLETED: horário vencido
  SCHEDULED --> CANCELLED: cancelar
  COMPLETED --> [*]
  CANCELLED --> [*]
```

**Encerramento automático:** fim efetivo = `scheduledEnd` **ou** `scheduledStart + MEETING_DEFAULT_DURATION_MINUTES`.  
Use case: `ExpirePastMeetingsUseCase` (cron + listagens).

## Mapa do monorepo

```mermaid
flowchart LR
  subgraph Repo["meeting-scribe"]
    FE[frontend]
    BE[backend]
    DESK[desktop]
    SH[packages/shared]
    DOC[docs]
  end
  FE --> SH
  BE --> SH
  DESK --> SH
  DOC -.-> FE
  DOC -.-> BE
```

## Documentação no repo

Espelho completo: [`docs/architecture.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/architecture.md)  
ADRs: [`docs/decisions.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/decisions.md)
