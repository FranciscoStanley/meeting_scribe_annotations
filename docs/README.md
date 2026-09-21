# Docs — Meeting Scribe

| Artefato | Caminho | Quando atualizar |
|----------|---------|------------------|
| **Arquitetura + fluxogramas** | [architecture.md](architecture.md) | Ciclo de vida, camadas, UI, processos |
| Postman | [postman/meeting-scribe.postman_collection.json](postman/meeting-scribe.postman_collection.json) | Novo/alterado endpoint |
| Segurança | [security.md](security.md) | Token, headers, rate limit, WS auth |
| Realtime (SSE/WS) | [realtime.md](realtime.md) | Mudança em eventos Socket.IO ou SSE |
| Dev local (sem Docker) | [dev-local.md](dev-local.md) | Mudança em scripts/bootstrap/STT local |
| Deploy Linux | [deploy-linux.md](deploy-linux.md) | Mudança em Docker / portas / env pública |
| OAuth grátis | [oauth-setup-gratis.md](oauth-setup-gratis.md) | Mudança no fluxo Google/Microsoft |
| Screenshots UI | [screenshots/](screenshots/) | Mudança visual relevante no frontend |
| Shared README | [../packages/shared/README.md](../packages/shared/README.md) | Novos exports / regras no pacote |
| Swagger UI | http://localhost:3001/api/docs | Sempre que mudar controllers/DTOs |
| Env template | [../.env.template](../.env.template) | Nova variável de ambiente |
| Rules / skills | `.cursor/rules/` · `.cursor/skills/` | Processo, design, segurança, DoD |

### Visual / UI

| Artefato | Caminho |
|----------|---------|
| Rule design | `.cursor/rules/frontend-design-system.mdc` |
| Skill design | `.cursor/skills/frontend-design-system/SKILL.md` |
| Sidebar / BackLink | `frontend/src/components/sidebar.tsx`, `back-link.tsx` |
| MeetingScheduleForm | `frontend/src/components/meeting-schedule-form.tsx` |
| DateTimeField (portal) | `frontend/src/components/date-time-field.tsx` |
| ConfirmDialog + Toaster | `confirm-dialog.tsx`, `app-toaster.tsx` |
| Screenshots | [screenshots/](screenshots/) |

### Pacotes

| README | Pacote |
|--------|--------|
| [../README.md](../README.md) | Monorepo |
| [../frontend/README.md](../frontend/README.md) | Next.js |
| [../backend/README.md](../backend/README.md) | NestJS |
| [../packages/shared/README.md](../packages/shared/README.md) | Shared |
| [../desktop/README.md](../desktop/README.md) | Electron |

Com `npm run dev` no ar:

```powershell
# 1) Crie/use uma reunião LIVE e rode o seed de trechos demo
node scripts/seed-demo-transcript.cjs <meetingIdLive>

# 2) Capture (Playwright)
node scripts/capture-screenshots.cjs <meetingIdLive> <meetingIdScheduled?>
```

Gera `01`…`06` em [screenshots/](screenshots/). Atualize também o texto de “Interface e funcionalidades” no README raiz.
