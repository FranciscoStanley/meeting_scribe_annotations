# Frontend — Meeting Scribe

Next.js (App Router) + Tailwind. Build Docker usa `output: 'standalone'`.

**Design:** corporativo claro (teal + surface). Rule/skill:
`.cursor/rules/frontend-design-system.mdc` ·
`.cursor/skills/frontend-design-system/SKILL.md`

```
frontend/
├── Dockerfile
├── public/
└── src/
    ├── app/            # rotas (home, meetings, sessions, settings)
    ├── components/     # Sidebar, forms, modal, toast, UI
    ├── hooks/          # alerts SSE, captura áudio
    └── lib/            # api, datetime (date-fns)
```

## Subir

```powershell
copy ..\.env.template ..\.env
npm run dev:frontend
```

- Porta: **3000**
- Swagger: **http://localhost:3001/api/docs** (redirect em `/api/docs`)

## Shell e navegação

| Item | Rota / ação |
|------|-------------|
| Home | `/` — lista de reuniões |
| Agenda | `/meetings/new` — agendar |
| Calendário | `/settings` — ICS / OAuth |
| API | Swagger externo (`NEXT_PUBLIC_API_URL/api/docs`) |
| Voltar | `BackLink` em visualizar, editar, agendar, captura, calendários |

## Formulários de agenda

- `MeetingScheduleForm` — seções Identidade / Horário / Link, preview de duração, detecção Teams/Meet
- `DateTimeField` — **react-day-picker** + horário; popover via **portal** no `body` (não corta no card)
- Validação: `validateMeetingSchedule` (`@meeting-scribe/shared`) — fim > início; sem início no passado

## Exclusão e feedback

- `ConfirmDialog` — confirmar exclusão (sem `window.confirm`)
- `AppToaster` — **react-toastify** (sucesso / erro)

## Captura / STT

1. Microfone (teste) ou áudio da aba Meet/Teams no Chrome  
2. WebM ~5s → Socket.IO `/transcription`  
3. Falantes com cor por ordem de aparição (`buildSpeakerColorMap`)  
4. Detalhe: sem botão de captura se `COMPLETED` / `CANCELLED`

## Testes

```bash
npm run test -w @meeting-scribe/frontend
```

Ao mudar UI: design system + `docs/screenshots/` se relevante. Arquitetura: [docs/architecture.md](../docs/architecture.md).
