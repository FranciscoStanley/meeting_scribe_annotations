# Local Development

Desenvolvimento **sem Docker** (recomendado para testar no PC).

## Subir

```powershell
copy .env.template .env
npm install
npm run dev
```

Linux:

```bash
cp .env.template .env
chmod +x scripts/dev-local.sh
./scripts/dev-local.sh
```

## O que o bootstrap faz

1. Cria `.env` a partir do template (se não existir)  
2. Espelha chaves para `backend/.env`, `frontend/.env.local`, `desktop/.env`  
3. Roda migrations Prisma  
4. Sobe backend + frontend  

## Testes

```bash
npm run test -w @meeting-scribe/shared
npm run test -w @meeting-scribe/backend
npm run test -w @meeting-scribe/frontend
```

## Whisper

- Padrão: `STT_PROVIDER=local` (modelo na 1ª transcrição)  
- Opcional Docker: `npm run dev:with-docker-stt` ou `STT_BASE_URL=http://localhost:8080/v1`

## Desktop (Teams Windows)

```powershell
npm run dev            # API + UI
npm run dev:desktop    # companion Electron
```

## Troubleshooting

| Sintoma | Ação |
|---------|------|
| API 401 | Token configurado — entre pelo `/login` com a chave |
| Calendário DateTimeField cortado | Use build atual (popover via portal) |
| Porta em uso | Liberar `3000` / `3001` |

Detalhes: [`docs/dev-local.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/dev-local.md)
