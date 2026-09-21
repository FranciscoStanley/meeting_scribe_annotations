# Security

Hardening para app **self-hosted** de transcrição.

## Camadas

1. Token de API (`API_ACCESS_TOKEN`) — opcional em local, obrigatório em produção  
2. Login UI (`APP_AUTH_EMAIL` / `APP_AUTH_PASSWORD`)  
3. Helmet + rate limit + ValidationPipe (`forbidNonWhitelisted`)  
4. WebSocket autenticado + `MAX_AUDIO_CHUNK_BYTES`  
5. Headers Next.js (CSP, frame deny, nosniff, Permissions-Policy)

## Variáveis essenciais

```env
API_ACCESS_TOKEN=troque-por-um-segredo-longo
APP_AUTH_EMAIL=admin@empresa.com
APP_AUTH_PASSWORD=senha-forte
SECURITY_REQUIRE_TOKEN=true
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=120
CORS_ORIGIN=https://seu-dominio
```

## Checklist — repositório público

- [ ] Nunca commitar `.env` / `.env.local`  
- [ ] Sem Client Secrets OAuth no histórico  
- [ ] `.env.template` só com placeholders  
- [ ] `*.db` ignorado  
- [ ] Screenshots sem dados pessoais reais  
- [ ] Produção com token + auth UI + HTTPS no proxy  

## Branch protegida

A branch `master` bloqueia **force push** e **exclusão**, exige **PR** e o check de CI `CI / test` antes do merge.

Ver: [`docs/security.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/security.md)
