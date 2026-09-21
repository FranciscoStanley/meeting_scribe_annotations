# Architecture

Visão técnica do monorepo Meeting Scribe.

**Autor:** Francisco Stanley Rodrigues Albuquerque

## Pacotes

| Pasta | Papel |
|-------|--------|
| `frontend/` | Next.js — login, sidebar, agenda, captura, SSE |
| `backend/` | NestJS — domínio, use cases, cron, REST, WS, SSE |
| `desktop/` | Electron — companion Teams Windows |
| `packages/shared/` | Tipos, permissões, cores, validação de horário |
| `docs/` | Architecture, security, Postman, screenshots |

## Clean Architecture (backend)

```
presentation (HTTP / WS / SSE)
        ↓
application (use cases)
        ↓
domain (entities / ports)
        ↑
infrastructure (Prisma, STT, calendar, cron)
```

- Domínio **sem** dependência Nest  
- Use cases orquestram ports  
- Adapters em `infrastructure/`

## Ciclo de vida da agenda

```
SCHEDULED → AWAITING_JOIN (alerta SSE) → LIVE → COMPLETED
     ↘ horário vencido ↗                ↗
```

**Encerramento automático:** fim efetivo = `scheduledEnd` **ou** `scheduledStart + MEETING_DEFAULT_DURATION_MINUTES`.  
Se início e fim efetivo já passaram → `COMPLETED` (`ExpirePastMeetingsUseCase`), via cron e listagens.

## Fluxo principal

1. Usuário agenda (UI valida `validateMeetingSchedule`)
2. Cron processa alertas → SSE `meeting:starting`
3. Modal **Participar e transcrever**
4. Captura WebM ~5s → Socket.IO `/transcription`
5. Whisper → `transcript:segment` com cor por falante

## Documentação no repo

Espelho detalhado (com Mermaid): [`docs/architecture.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/architecture.md)
