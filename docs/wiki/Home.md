# Meeting Scribe — Wiki

Documentação oficial do **Meeting Scribe**: transcrição corporativa em tempo real de reuniões **Microsoft Teams** e **Google Meet**.

**Autor:** Francisco Stanley Rodrigues Albuquerque  
**Repositório:** [FranciscoStanley/meeting_scribe_annotations](https://github.com/FranciscoStanley/meeting_scribe_annotations)

## O que é

Aplicação **self-hosted** (monorepo) que:

1. Agenda reuniões (horário + link)
2. Alerta perto do horário (SSE)
3. Captura áudio da aba ou microfone
4. Transcreve com Whisper (local ou Docker)
5. Exibe trechos coloridos por falante

## Comece por aqui

| Página | Conteúdo |
|--------|----------|
| [Getting Started](Getting-Started) | Setup em minutos |
| [Local Development](Local-Development) | Sem Docker, no seu PC |
| [Architecture](Architecture) | Monorepo, camadas e fluxos |
| [Authentication and Login](Authentication-and-Login) | Tela `/login`, tokens e sessão |
| [Security](Security) | Hardening e checklist de repo público |
| [Realtime](Realtime-SSE-and-WebSocket) | SSE e Socket.IO |
| [API and Postman](API-and-Postman) | HTTP, Swagger e collection |
| [OAuth Calendar](OAuth-Calendar) | Google / Microsoft grátis |
| [Deploy Linux](Deploy-Linux) | Docker no servidor |
| [Frontend UI](Frontend-UI) | Design system e telas |
| [Contributing](Contributing) | Commits, CI e branch protegida |

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15 · Tailwind · react-day-picker |
| Backend | NestJS · Prisma · SQLite |
| Desktop | Electron (Teams Windows) |
| Shared | Tipos TS, permissões, cores, schedule |
| STT | Whisper local (`@xenova/transformers`) ou Docker |

## Portas

| Serviço | Porta |
|---------|-------|
| Frontend | `3000` |
| Backend / Swagger | `3001` (`/api/docs`) |
| Whisper Docker | `8080` |

## Licença e uso

Projeto pensado para uso corporativo / self-hosted. **Não** versione secrets: copie `.env.template` → `.env` e mantenha o `.env` fora do Git.

## Para avaliadores (empresas)

O [README](https://github.com/FranciscoStanley/meeting_scribe_annotations#readme) apresenta o projeto como portfólio **fullstack sênior**: problema, arquitetura, segurança, prints (web + Swagger), ADRs e governança (CI, branch protection, PRs).

Licença MIT · [SECURITY.md](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/SECURITY.md) · [CONTRIBUTING](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/CONTRIBUTING.md)
