# Meeting Scribe

[![CI](https://github.com/FranciscoStanley/meeting_scribe_annotations/actions/workflows/ci.yml/badge.svg)](https://github.com/FranciscoStanley/meeting_scribe_annotations/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0F766E.svg)](LICENSE)
[![Node.js >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](.nvmrc)
[![Wiki](https://img.shields.io/badge/docs-Wiki-0F766E.svg)](https://github.com/FranciscoStanley/meeting_scribe_annotations/wiki)

**Transcrição corporativa em tempo real** de reuniões Microsoft Teams e Google Meet — monorepo fullstack (NestJS · Next.js · Electron · Whisper).

> Portfólio de engenharia de **Francisco Stanley Rodrigues Albuquerque**.  
> Pensado para demonstrar nível **fullstack sênior**: arquitetura limpa, segurança self-hosted, UX corporativa, realtime e disciplina de entrega (CI, PRs, docs).

---

## Por que existe

Equipes precisam de atas fiéis sem gravar a reunião em silo externo. Meeting Scribe é **self-hosted**: agenda o horário, alerta na hora certa, captura áudio no browser (ou companion Windows) e devolve trechos por falante — com controle de acesso e sem depender de SaaS de transcrição.

## O que entrega

| Capacidade | Detalhe |
|------------|---------|
| Agenda + alerta | Cron + SSE `meeting:starting` → modal **Participar e transcrever** |
| Captura | Áudio da aba (Meet/Teams no Chrome) ou microfone |
| STT | Whisper local (`@xenova/transformers`) ou Docker |
| Calendário | ICS e OAuth Google/Microsoft (cota gratuita) |
| Auth | Login UI + token de API (Helmet, throttle, CSP) |
| API | OpenAPI/Swagger + Postman versionados |

### Interface web

![Login](docs/screenshots/00-login.png)

![Lista de reuniões](docs/screenshots/01-reunioes.png)

![Agendar reunião](docs/screenshots/02-nova-reuniao.png)

![Calendários](docs/screenshots/03-calendarios.png)

![Transcrição por falante](docs/screenshots/04-transcricao.png)

![Captura ao vivo](docs/screenshots/05-captura-ao-vivo.png)

![Alerta de reunião](docs/screenshots/06-alerta-reuniao.png)

### API — Swagger (OpenAPI)

http://localhost:3001/api/docs · Authorize com Bearer ou `X-API-Key`.

![Swagger API](docs/screenshots/07-swagger-api.png)

![Swagger Authorize](docs/screenshots/08-swagger-authorize.png)

---

## Arquitetura

Visão em camadas do monorepo — o mesmo desenho aparece na [Wiki · Architecture](https://github.com/FranciscoStanley/meeting_scribe_annotations/wiki/Architecture) e em [`docs/architecture.md`](docs/architecture.md).

### Visão de contexto (C4 leve)

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

### Clean Architecture (backend)

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

### Fluxo ponta a ponta

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

### Ciclo de vida da agenda

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

| Pacote | Responsabilidade |
|--------|------------------|
| `frontend/` | UX corporativa, login, captura, SSE |
| `backend/` | Domínio, use cases, cron, REST, WS, SSE |
| `desktop/` | Companion Teams (Windows) |
| `packages/shared/` | Contratos e regras compartilhadas |

**Decisões:** shared evita drift UI/API · SSE para alerta leve · Socket.IO para áudio · Whisper local por default.  
ADRs: [`docs/decisions.md`](docs/decisions.md)

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Next.js 15, React 19, Tailwind, react-day-picker, react-toastify |
| Backend | NestJS, Prisma, SQLite, Helmet, Throttler, Schedule |
| Desktop | Electron |
| STT | Whisper local ou container |
| Qualidade | Vitest, TypeScript, Conventional Commits, branch protection, Wiki |

---

## Quick start

```powershell
copy .env.template .env
npm install
npm run dev
```

1. http://localhost:3000/login → **Entrar no workspace**  
2. Agendar reunião (horário + link)  
3. Na hora: **Participar e transcrever** · captura por aba ou mic  

| Serviço | URL |
|---------|-----|
| App | http://localhost:3000 |
| Swagger | http://localhost:3001/api/docs |
| Health | http://localhost:3001/health |

Guias: [dev local](docs/dev-local.md) · [deploy Linux](docs/deploy-linux.md) · [Wiki](https://github.com/FranciscoStanley/meeting_scribe_annotations/wiki)

---

## Segurança (resumo)

| Camada | Mecanismo |
|--------|-----------|
| UI | `/login` + cookies de sessão · middleware |
| API | `API_ACCESS_TOKEN` · Bearer / X-API-Key |
| Produção | `APP_AUTH_*` + `SECURITY_REQUIRE_TOKEN=true` |
| HTTP | Helmet · throttle · ValidationPipe |
| Frontend | CSP · frame-deny · nosniff |
| WS | Auth no handshake · limite de chunk |

Detalhes: [`docs/security.md`](docs/security.md) · política: [`SECURITY.md`](SECURITY.md)

**Repo público:** nunca commite `.env`. O `.gitignore` cobre secrets, bancos e chaves.

---

## Qualidade e engenharia

```bash
npm run test -w @meeting-scribe/shared
npm run test -w @meeting-scribe/backend
npm run test -w @meeting-scribe/frontend
npm run lint
```

- Commits **atômicos** (Conventional Commits) · 1 alteração = 1 commit  
- `master` **protegida** (sem force push; merge via PR)  
- DoD: código + testes + Swagger/Postman + README/wiki quando o contrato ou a UI mudam  
- Templates de Issue/PR · Code of Conduct · License MIT  

Contribuir: [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## O que este repositório demonstra (avaliação sênior)

1. **Fullstack de ponta a ponta** — UI, API, realtime, desktop, STT  
2. **Arquitetura** — Clean Architecture, monorepo, pacote compartilhado  
3. **Produto** — fluxos reais (agenda → alerta → captura → transcrição)  
4. **Segurança self-hosted** — auth em camadas, headers, limites, threat model documentado  
5. **DX e governança** — CI, proteção de branch, wiki, Postman/Swagger, skills/rules Cursor  
6. **UX corporativa** — design system próprio (não template genérico de IA)

---

## Estrutura

```
backend/           NestJS + Prisma + Whisper
frontend/          Next.js (login, sidebar, captura)
desktop/           Electron (Teams Windows)
packages/shared/   Contratos e regras compartilhadas
docs/              Architecture, security, Postman, screenshots, wiki/
.github/           CI, templates de Issue/PR
.env.template      Única fonte de env (copy → .env)
```

## Opcional

| Recurso | Como |
|---------|------|
| Whisper Docker | `npm run dev:with-docker-stt` ou `STT_BASE_URL=http://localhost:8080/v1` |
| OAuth calendário | `GOOGLE_*` / `MICROSOFT_*` — [guia grátis](docs/oauth-setup-gratis.md) |
| Desktop Teams | `npm run dev:desktop` |

---

**Autor:** [Francisco Stanley Rodrigues Albuquerque](https://github.com/FranciscoStanley)  
**Wiki:** [meeting_scribe_annotations/wiki](https://github.com/FranciscoStanley/meeting_scribe_annotations/wiki)  
**Licença:** [MIT](LICENSE)
