# Segurança — Meeting Scribe

## Resumo

Camadas profissionais para um app **self-hosted** de transcrição:

1. **Token de API** opcional em local, obrigatório em produção  
2. **Helmet** + **rate limit** + validação estrita de DTOs  
3. **WebSocket** autenticado + limite de tamanho de áudio  
4. **Headers** de segurança no Next.js (CSP, frame deny, etc.)

## Configuração

No `.env` (raiz):

```env
API_ACCESS_TOKEN=troque-por-um-segredo-longo
NEXT_PUBLIC_API_ACCESS_TOKEN=troque-por-um-segredo-longo
SECURITY_REQUIRE_TOKEN=true
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=120
MAX_AUDIO_CHUNK_BYTES=2000000
MAX_JSON_BODY_BYTES=1000000
CORS_ORIGIN=http://localhost:3000
```

- **Local sem token:** deixe `API_ACCESS_TOKEN` vazio.  
- **Produção:** defina o token e `SECURITY_REQUIRE_TOKEN=true` (ou `NODE_ENV=production`).  
- `NEXT_PUBLIC_API_ACCESS_TOKEN` fica no JS do browser — use só em rede confiável; na internet pública prefira reverse proxy (Nginx Basic Auth / SSO) na frente da API.

## Como autenticar

| Canal | Como |
|-------|------|
| HTTP | `Authorization: Bearer <token>` ou `X-API-Key: <token>` |
| Socket.IO | `io(url, { auth: { token } })` |
| SSE (`EventSource`) | `?apiKey=<token>` na URL |

Rotas **públicas:** `GET /health`, OAuth `*/connect` e `*/callback`.

## Swagger

http://localhost:3001/api/docs — Authorize com Bearer ou api-key.

## Postman

Collection em `docs/postman/` — variável `apiKey` + header `X-API-Key`.

## Checklist de deploy

- [ ] Token forte (≥ 32 chars aleatórios)  
- [ ] CORS só para o domínio do frontend  
- [ ] HTTPS no proxy  
- [ ] Não commitár `.env`  
- [ ] Rate limit adequado ao tráfego  

Rule/skill: `.cursor/rules/security-hardening.mdc` · `.cursor/skills/security-hardening/SKILL.md`
