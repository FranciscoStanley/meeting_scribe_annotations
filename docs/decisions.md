# Architecture Decision Records (resumo)

Decisões relevantes do Meeting Scribe — úteis para review de engenharia.

**Autor:** Francisco Stanley Rodrigues Albuquerque

## ADR-001 — Clean Architecture no backend NestJS

**Contexto:** API com calendário, STT, cron e WebSocket cresceria rápido se misturada em controllers.  
**Decisão:** Camadas `domain` → `application` (use cases) → `infrastructure` / `presentation`.  
**Consequência:** Use cases e entidades unit-testáveis; Nest fica na borda.

## ADR-002 — Pacote `@meeting-scribe/shared`

**Contexto:** Regras de permissão e cores de falante não podem divergir entre UI e API.  
**Decisão:** Pacote TS compartilhado no monorepo (schedule, permissions, speaker colors, Teams links).  
**Consequência:** Build do shared é pré-requisito; contratos únicos.

## ADR-003 — SSE para alerta + Socket.IO para áudio

**Contexto:** Alerta de reunião é unidirecional e leve; áudio precisa de canal full-duplex com rooms.  
**Decisão:** SSE (`meeting:starting`) + Socket.IO namespace `/transcription`.  
**Consequência:** Auth do EventSource via query `apiKey`; WS via `auth.token`.

## ADR-004 — Whisper local como default

**Contexto:** Avaliadores e devs precisam rodar sem GPU/cloud.  
**Decisão:** `STT_PROVIDER=local` com `@xenova/transformers`; Docker Whisper opcional.  
**Consequência:** Primeira transcrição baixa o modelo; latência maior, setup zero.

## ADR-005 — Login UI + token de API

**Contexto:** Self-hosted precisa de gate na UI sem OAuth obrigatório.  
**Decisão:** `/login` com `APP_AUTH_*` ou senha = `API_ACCESS_TOKEN`; sessão em cookies Next.  
**Consequência:** Modo aberto em local; produção exige token + credenciais.

## ADR-006 — SQLite + Prisma

**Contexto:** Portfólio e demos locais sem Postgres.  
**Decisão:** SQLite via Prisma; migrations versionadas.  
**Consequência:** Simples de clonar; para escala multi-usuário, trocar o adapter de persistência.
