# Docs — Meeting Scribe

| Artefato | Caminho | Quando atualizar |
|----------|---------|------------------|
| Postman | [postman/meeting-scribe.postman_collection.json](postman/meeting-scribe.postman_collection.json) | Novo/alterado endpoint |
| OAuth grátis | [oauth-setup-gratis.md](oauth-setup-gratis.md) | Mudança no fluxo Google/Microsoft |
| Screenshots UI | [screenshots/](screenshots/) | Mudança visual relevante no frontend |
| Swagger UI | http://localhost:3001/api/docs | Sempre que mudar controllers/DTOs |
| Env template | [../.env.template](../.env.template) | Nova variável de ambiente |
| Rule | `.cursor/rules/keep-docs-in-sync.mdc` | Processo de documentação |

### Regenerar prints

```powershell
npm run dev:backend
npm run dev:frontend
node scripts/capture-screenshots.cjs <meetingIdLive> <meetingIdScheduled>
```

Processo obrigatório: skill `.cursor/skills/keep-docs-in-sync/SKILL.md`.
