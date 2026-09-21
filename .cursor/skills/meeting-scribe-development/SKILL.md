---
name: meeting-scribe-development
description: >-
  Orquestrador de desenvolvimento do Meeting Scribe — fluxo de features,
  comandos e índice de skills. Use ao implementar qualquer feature nova.
---

# Meeting Scribe — Development

**Autor:** Francisco Stanley Rodrigues Albuquerque

## Índice de Skills

| Skill | Quando carregar |
|-------|-----------------|
| `project-architecture` (rule) | Estrutura monorepo, pastas, portas |
| [clean-architecture](../../../../.cursor/skills/clean-architecture/SKILL.md) | Use cases, ports |
| [nestjs-services](../../../../.cursor/skills/nestjs-services/SKILL.md) | Backend NestJS |
| [nextjs-frontend](../../../../.cursor/skills/nextjs-frontend/SKILL.md) | Frontend Next.js |
| [organize-commits](../../../../.cursor/skills/organize-commits/SKILL.md) | Commits atômicos |
| [review-code](../../../../.cursor/skills/review-code/SKILL.md) | Review antes de push |

## Mapa do monorepo

| Pasta | Pacote | Stack |
|-------|--------|-------|
| `backend/` | `@meeting-scribe/backend` | NestJS + Prisma |
| `frontend/` | `@meeting-scribe/frontend` | Next.js |
| `desktop/` | `@meeting-scribe/desktop` | Electron |
| `packages/shared/` | `@meeting-scribe/shared` | Tipos TS |

## Fluxo ao implementar

```mermaid
flowchart TD
    A[1. Identificar pasta] --> B{backend / frontend / desktop?}
    B -->|API| C[clean-architecture + nestjs]
    B -->|UI| D[nextjs-frontend]
    B -->|Teams Windows| E[desktop Electron]
    C --> F[Testes + Swagger + README]
    D --> F
    E --> F
```

## Comandos

```bash
npm run dev                 # backend + frontend
npm run dev:backend
npm run dev:frontend
npm run dev:desktop
npm run db:migrate
npm run build
```
