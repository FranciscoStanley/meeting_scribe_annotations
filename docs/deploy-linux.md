# Deploy no servidor Linux (Docker)

O Meeting Scribe no Linux hospeda **API + UI + Whisper**.  
Você agenda **horário + link**; perto do horário a UI pede **participar e transcrever**.  
A captura de áudio ocorre no **navegador do PC** (ou companion Windows), apontando para este servidor.

## Requisitos

- Linux com Docker Engine + plugin Compose
- Portas livres: `3000` (web), `3001` (API), `8080` (Whisper) — ou altere no `.env`

## 1. Subir o código

```bash
git clone <seu-repo> meeting-scribe
cd meeting-scribe
cp .env.template .env
```

## 2. Ajustar `.env` (obrigatório em servidor)

Troque `SEU_IP_OU_DOMINIO` pelo IP público ou domínio:

```env
CORS_ORIGIN=http://SEU_IP_OU_DOMINIO:3000
NEXT_PUBLIC_API_URL=http://SEU_IP_OU_DOMINIO:3001
NEXT_PUBLIC_WS_URL=http://SEU_IP_OU_DOMINIO:3001
API_INTERNAL_URL=http://backend:3001
MEETING_ALERT_MINUTES=3
MEETING_ALERT_GRACE_MINUTES=5
```

> `NEXT_PUBLIC_*` entram no **build** do frontend. Se mudar IP/domínio, rode o deploy de novo (`--build`).

## 3. Build e sobe

```bash
chmod +x scripts/deploy-linux.sh
./scripts/deploy-linux.sh
```

Ou:

```bash
docker compose up --build -d
```

## 4. Uso

1. Abra `http://SEU_IP_OU_DOMINIO:3000`
2. **Agendar reunião** → título, início/fim, link Teams/Meet
3. Deixe a aba aberta no horário
4. Modal **Participar e transcrever** → abre a reunião + tela de captura
5. Compartilhe o **áudio da aba** do Meet/Teams

## HTTPS (recomendado)

Coloque Nginx/Caddy na frente com TLS e aponte `CORS_ORIGIN` / `NEXT_PUBLIC_*` para `https://…`.

## Local (dev)

```bash
cp .env.template .env
npm install
npm run dev
```

Mesmo fluxo de agendar → alerta → participar/transcrever.
