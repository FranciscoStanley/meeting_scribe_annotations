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
    ├── app/
    ├── components/   # shell, DateTimeField, MeetingRowActions, ui
    ├── hooks/
    └── lib/          # api, datetime (date-fns)
```

## Subir

```powershell
copy ..\.env.template ..\.env
npm run dev:frontend
```

- Porta: **3000**
- Swagger: **http://localhost:3001/api/docs** (redirect também em `/api/docs`)

### Formulários de agenda

- Calendário **react-day-picker** + horário (`DateTimeField`)
- Validação: `validateMeetingSchedule` em `@meeting-scribe/shared` (fim > início; sem início no passado)

### Captura / STT

1. Microfone (teste) ou áudio da aba Meet/Teams no Chrome  
2. WebM ~5s → Socket.IO `/transcription`  
3. Falantes com cor por ordem de aparição (`buildSpeakerColorMap`)

### Testes

```bash
npm run test -w @meeting-scribe/frontend
```

Ao mudar UI: seguir design system + regenerar `docs/screenshots/`. Arquitetura: [docs/architecture.md](../docs/architecture.md).
