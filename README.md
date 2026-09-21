# Meeting Scribe

Transcrição em tempo real de reuniões (Meet / Teams) — **só rode o projeto**.

## Interface e funcionalidades

### Lista de reuniões

Dashboard com status (SCHEDULED / LIVE / COMPLETED), plataforma (Teams ou Meet) e quantidade de trechos. Cada sessão pode ser aberta para ver a transcrição completa.

![Lista de reuniões](docs/screenshots/01-reunioes.png)

### Alerta ao detectar reunião

Quando o calendário indica que uma reunião está para começar, o app pede para participar com transcrição — incluindo abrir no **Teams desktop** (`msteams://`).

![Alerta de reunião detectada](docs/screenshots/06-alerta-reuniao.png)

### Nova reunião manual

Crie uma sessão na hora (sem calendário): título, horário e link Meet/Teams opcional.

![Nova reunião manual](docs/screenshots/02-nova-reuniao.png)

### Calendários (ICS sem OAuth)

Cole o endereço secreto iCal do Google/Outlook. OAuth Google/Microsoft continua disponível se você preencher o `.env`.

![Configuração de calendários ICS](docs/screenshots/03-calendarios.png)

### Transcrição por falante

Trechos salvos com **nome do falante** (cada um com cor distinta), horário e texto — organizados por reunião.

![Transcrição com falantes](docs/screenshots/04-transcricao.png)

### Captura ao vivo

Compartilhe a **aba** do Meet/Teams com áudio; o sistema envia chunks ao backend e exibe a transcrição em tempo real.

![Captura ao vivo](docs/screenshots/05-captura-ao-vivo.png)

---

## Configuração de ambiente

```powershell
copy .env.template .env
```

Só isso. O `.env` fica na raiz (não vai pro Git).  
`npm run dev` / bootstrap gera `backend/.env`, `frontend/.env.local` e `desktop/.env` a partir dele.

OAuth e ICS são opcionais — deixe em branco no `.env` se não for usar.

## Uso local (sem Docker) — recomendado para testar

Guia: [docs/dev-local.md](docs/dev-local.md)

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

Isso automaticamente:

1. cria `.env` do backend/frontend/desktop  
2. aplica migrations do banco  
3. ativa **Whisper local** no Node (baixa o modelo na 1ª transcrição)  
4. sobe backend (`3001`) + frontend (`3000`) — **sem Docker**

Abra http://localhost:3000 → **Agendar reunião** (horário + link) → deixe a aba aberta → na hora **Participar e transcrever**.

Na captura: **Testar com microfone** ou áudio da aba Meet/Teams no Chrome. Protocolo: [docs/realtime.md](docs/realtime.md).

### Calendário (sem OAuth)

Em **Calendários**, cole o **endereço secreto iCal (ICS)** do Google/Outlook. O sistema detecta reuniões e avisa antes de começar.

### Google / Outlook automático (recomendado, gratuito)

Igual aos apps do mercado: você cria **uma vez** um Client ID gratuito (Google Cloud / Azure) — ver [`docs/oauth-setup-gratis.md`](docs/oauth-setup-gratis.md) — coloca no `.env`, e depois só:

1. **Calendários** → **Conectar Google** ou **Conectar Outlook / Teams**
2. Aceitar permissões na tela oficial
3. O sistema sincroniza Meet/Teams sozinho e alerta antes da reunião

Não há mensalidade: as APIs de calendário têm cota gratuita suficiente para uso pessoal.

### Teams desktop

```powershell
npm run dev:desktop
```

## Uso com Docker / servidor Linux

```bash
cp .env.template .env
# No servidor: edite NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL e CORS_ORIGIN com o IP/domínio
chmod +x scripts/deploy-linux.sh
./scripts/deploy-linux.sh
```

Guia completo: [docs/deploy-linux.md](docs/deploy-linux.md)

Fluxo: **Agendar reunião** (horário + link) → deixe a aba aberta → na hora o app pede **Participar e transcrever**.

Sobe **frontend** (`3000`), **backend** (`3001`) e **Whisper** (`8080`).

- App: http://localhost:3000 (ou IP do servidor)  
- API / Swagger: http://localhost:3001/api/docs  
- Postman: [docs/postman/meeting-scribe.postman_collection.json](docs/postman/meeting-scribe.postman_collection.json)

Dockerfiles multi-stage: `backend/Dockerfile` e `frontend/Dockerfile`.

## Estrutura

```
backend/           NestJS + Whisper + Prisma
frontend/          Next.js
desktop/           Electron (Teams Windows)
packages/shared/   Tipos + speakerColor + Teams links
docs/              Postman, realtime, deploy, OAuth, screenshots
.env.template      Fonte única de env
```

## Documentação e qualidade

Ao mudar código, a rule **`keep-docs-in-sync`** exige atualizar Swagger, Postman, testes e READMEs.  
Se a UI mudar de forma relevante, atualize também `docs/screenshots/` (`node scripts/capture-screenshots.cjs`).  
Commits semânticos atômicos; **push é manual**.

## Opcional

| Recurso | Como |
|---------|------|
| Whisper via Docker (mais rápido) | `npm run dev:with-docker-stt` ou `docker compose up -d whisper` + `STT_BASE_URL=http://localhost:8080/v1` |
| Google/Microsoft OAuth | preencher `GOOGLE_*` / `MICROSOFT_*` no `.env` da raiz |

**Autor:** Francisco Stanley Rodrigues Albuquerque
