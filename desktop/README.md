# Desktop — Meeting Scribe

Companion **Electron** para capturar áudio do **Microsoft Teams** (app Windows) e enviar chunks ao backend via Socket.IO.

**Autor:** Francisco Stanley Rodrigues Albuquerque

## Subir

```powershell
copy ..\.env.template ..\.env
npm run dev            # backend + frontend
npm run dev:desktop    # companion
```

Requer o **backend** em execução (`3001`).

## Env

Gerado a partir do `.env` da raiz pelo bootstrap:

| Variável | Uso |
|----------|-----|
| `MEETING_SCRIBE_API_URL` | Base HTTP da API |
| `API_ACCESS_TOKEN` / espelho | Auth se token estiver ativo (mesmo modelo do frontend) |

Ver [docs/security.md](../docs/security.md) e [docs/realtime.md](../docs/realtime.md).

## Papel no monorepo

- Não substitui o frontend web (alertas SSE, agenda, calendário)
- Complementa captura quando a reunião está no **app Teams**, não na aba do Chrome
- Deep links: `@meeting-scribe/shared` → `toTeamsDesktopJoinUrl`

Arquitetura: [docs/architecture.md](../docs/architecture.md).
