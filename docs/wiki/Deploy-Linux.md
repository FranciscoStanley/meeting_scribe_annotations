# Deploy Linux

Hospeda **API + UI + Whisper** com Docker Compose.

## Requisitos

- Linux com Docker Engine + Compose  
- Portas: `3000`, `3001`, `8080` (ou ajuste no `.env`)

## Passos

```bash
git clone https://github.com/FranciscoStanley/meeting_scribe_annotations.git
cd meeting_scribe_annotations
cp .env.template .env
```

Edite no `.env` (obrigatório):

```env
CORS_ORIGIN=http://SEU_IP_OU_DOMINIO:3000
NEXT_PUBLIC_API_URL=http://SEU_IP_OU_DOMINIO:3001
NEXT_PUBLIC_WS_URL=http://SEU_IP_OU_DOMINIO:3001
API_ACCESS_TOKEN=segredo-forte
APP_AUTH_EMAIL=admin@empresa.com
APP_AUTH_PASSWORD=senha-forte
SECURITY_REQUIRE_TOKEN=true
```

```bash
chmod +x scripts/deploy-linux.sh
./scripts/deploy-linux.sh
```

> `NEXT_PUBLIC_*` entram no **build** do frontend. Mudou IP/domínio → rebuild.

## Captura de áudio

Roda no **navegador do cliente** (ou companion Windows), apontando para este servidor — não no container.

Guia completo: [`docs/deploy-linux.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/deploy-linux.md)
