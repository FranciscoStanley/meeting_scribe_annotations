# Getting Started

Guia rápido para rodar o Meeting Scribe.

## Pré-requisitos

- **Node.js ≥ 20**
- npm
- ~1–2 GB livres na 1ª transcrição (modelo Whisper tiny)

Docker é **opcional** (só necessário no deploy completo ou Whisper em container).

## 1. Clonar e configurar

```powershell
git clone https://github.com/FranciscoStanley/meeting_scribe_annotations.git
cd meeting_scribe_annotations
copy .env.template .env
npm install
```

Linux / macOS:

```bash
git clone https://github.com/FranciscoStanley/meeting_scribe_annotations.git
cd meeting_scribe_annotations
cp .env.template .env
npm install
```

## 2. Subir local

```powershell
npm run dev
```

Isso:

1. Gera `backend/.env`, `frontend/.env.local`, `desktop/.env`
2. Aplica migrations SQLite
3. Sobe API (`3001`) + UI (`3000`)
4. Usa Whisper embutido no Node

## 3. Abrir o app

1. http://localhost:3000/login → **Entrar no workspace** (modo local aberto)
2. **Agendar reunião** (título, horário, link Meet/Teams)
3. Deixe a aba aberta → no horário, **Participar e transcrever**
4. Capture áudio da aba (Chrome) ou microfone

## URLs úteis

| Recurso | URL |
|---------|-----|
| App | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Swagger | http://localhost:3001/api/docs |
| Health | http://localhost:3001/health |

## Próximos passos

- [Local Development](Local-Development) — detalhes e troubleshooting  
- [Authentication and Login](Authentication-and-Login) — proteger o workspace  
- [Security](Security) — produção e repo público  
- [OAuth Calendar](OAuth-Calendar) — sync Google / Outlook  
- [Deploy Linux](Deploy-Linux) — servidor com Docker  
