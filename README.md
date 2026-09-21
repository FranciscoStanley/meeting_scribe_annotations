# Meeting Scribe

Transcrição em tempo real de reuniões (Meet / Teams) — **só rode o projeto**.

## Uso (zero config)

```powershell
cd C:\Users\Stanley\Downloads\AI_ANNOTATIONS
npm install
npm run dev
```

Isso automaticamente:

1. cria `.env` do backend/frontend/desktop  
2. aplica migrations do banco  
3. ativa **Whisper local** (baixa o modelo na 1ª execução)  
4. sobe backend (`3001`) + frontend (`3000`)

Abra http://localhost:3000 → **Nova reunião manual** → **Iniciar transcrição** → escolha a aba Meet/Teams com **compartilhar áudio**.

### Calendário (sem OAuth)

Em **Calendários**, cole o **endereço secreto iCal (ICS)** do Google/Outlook. O sistema detecta reuniões e avisa antes de começar.

### Teams desktop

```powershell
npm run dev:desktop
```

## Estrutura

```
backend/    NestJS + Whisper local + Prisma
frontend/   Next.js
desktop/    Electron (Teams Windows)
packages/shared/
```

## Opcional

| Recurso | Como |
|---------|------|
| Whisper via Docker (mais rápido) | `docker compose up -d whisper` e `STT_BASE_URL=http://localhost:8080/v1` |
| Google/Microsoft OAuth | preencher `GOOGLE_*` / `MICROSOFT_*` em `backend/.env` |

**Autor:** Francisco Stanley Rodrigues Albuquerque
