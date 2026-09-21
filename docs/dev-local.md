# Desenvolvimento local (sem Docker)

Para testar no PC ou num Linux **sem** Docker Engine. O Whisper roda embutido no Node (`@xenova/transformers`).

## Requisitos

- Node.js **>= 20**
- npm (vem com o Node)
- ~1–2 GB livres na 1ª execução (download do modelo Whisper tiny)

Docker **não** é necessário.

## Subir

### Windows (PowerShell)

```powershell
copy .env.template .env
npm install
npm run dev
```

### Linux / macOS

```bash
cp .env.template .env
chmod +x scripts/dev-local.sh
./scripts/dev-local.sh
# ou: npm install && npm run dev
```

Isso:

1. gera `backend/.env`, `frontend/.env.local` e `desktop/.env`
2. aplica migrations SQLite (`backend/prisma/dev.db`)
3. sobe API (`3001`) + UI (`3000`)
4. usa `STT_PROVIDER=local` (modelo na 1ª transcrição)

## URLs

| Serviço | URL |
|---------|-----|
| App | http://localhost:3000 |
| Swagger | http://localhost:3001/api/docs |

## Fluxo de teste

1. Abra http://localhost:3000 → **Agendar reunião**
2. Informe título, horário e link Meet/Teams
3. Deixe a aba aberta
4. Perto do horário → modal **Participar e transcrever**
5. Compartilhe a aba da reunião **com áudio**

## Scripts úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` / `npm run dev:local` | Local sem Docker |
| `npm run dev:backend` | Só API |
| `npm run dev:frontend` | Só UI |
| `npm run dev:desktop` | Companion Electron (Windows) |
| `npm run dev:with-docker-stt` | Apps em Node + Whisper opcional via Docker |
| `npm run docker:up` | Stack completa em containers |

## STT

No `.env` da raiz (padrão para local):

```env
STT_PROVIDER=local
STT_LOCAL_MODEL=Xenova/whisper-tiny
STT_BASE_URL=
```

Não rode `npm run bootstrap:with-docker-stt` se quiser ficar sem Docker — ele sobe o serviço Whisper se o Docker estiver instalado.

## Problemas comuns

- **Porta em uso**: encerre outro processo em `3000`/`3001` ou altere `PORT` / porta do Next.
- **1ª transcrição lenta**: o modelo Whisper está baixando; depois fica em cache.
- **SSR do frontend não acha a API**: `API_INTERNAL_URL=http://localhost:3001` no `.env`.
