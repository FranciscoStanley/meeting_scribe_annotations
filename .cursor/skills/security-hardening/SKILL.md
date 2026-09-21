---
name: security-hardening
description: >-
  Segurança Meeting Scribe — API access token, Helmet, rate limit, CSP,
  WebSocket auth e limites de payload. Use ao implementar endpoints, WS ou deploy.
---

# Security Hardening — Meeting Scribe

**Autor:** Francisco Stanley Rodrigues Albuquerque  
**Rule:** `.cursor/rules/security-hardening.mdc`

## Modelo

| Ambiente | `API_ACCESS_TOKEN` | Comportamento |
|----------|--------------------|---------------|
| Dev local | vazio | API/WS abertos; UI ainda passa por `/login` (sessão) |
| LAN / servidor | valor forte | Exige Bearer / X-API-Key / `auth.token` no Socket.IO |
| Produção | obrigatório | `SECURITY_REQUIRE_TOKEN=true` ou `NODE_ENV=production` falha o boot sem token |

Login UI opcional: `APP_AUTH_EMAIL` + `APP_AUTH_PASSWORD`. Sem isso, com token: senha = token. Sem ambos: modo aberto.

## Backend (NestJS)

- `SecurityModule`: `ApiAccessGuard` + `ThrottlerGuard` como `APP_GUARD`
- `@Public()` em `/health` e rotas OAuth connect/callback
- `helmet` em `main.ts` (CSP do Swagger desligado; CSP no Next)
- CORS: lista via `CORS_ORIGIN` (vírgula para múltiplos)
- Pipe: `whitelist` + `forbidNonWhitelisted`
- Limites: `MAX_JSON_BODY_BYTES`, `MAX_AUDIO_CHUNK_BYTES`
- Comparação de token com `timingSafeEqual`

## Frontend (Next.js)

- Headers: `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, CSP
- `/login` + middleware de sessão (`ms_session`); token em cookie (não preferir `NEXT_PUBLIC_*`)
- `resolveApiAccessToken()` lê cookie → env
- Socket.IO: `auth: { token }`
- EventSource: `?apiKey=` (limitação do browser)

## Checklist

- [ ] Não logar tokens / secrets
- [ ] Novos endpoints protegidos (ou `@Public()` justificado)
- [ ] Postman com header `X-API-Key`
- [ ] Swagger Bearer / api-key
- [ ] Testes do extractor/guard
- [ ] `docs/security.md` atualizado

## Referências

- `docs/security.md`
- `backend/src/infrastructure/security/api-access.guard.ts`
- `backend/src/modules/security.module.ts`
