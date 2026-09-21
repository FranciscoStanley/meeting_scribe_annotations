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

## Login da UI

A tela `/login` autentica o operador antes do workspace:

| Configuração no `.env` | Comportamento |
|------------------------|---------------|
| Sem `APP_AUTH_*` e sem `API_ACCESS_TOKEN` | Modo aberto local — “Entrar” cria sessão sem token |
| Só `API_ACCESS_TOKEN` | Senha do login = a chave de API |
| `APP_AUTH_EMAIL` + `APP_AUTH_PASSWORD` | E-mail/senha; devolve `API_ACCESS_TOKEN` (se houver) no cookie de sessão |

Cookies (Next.js): `ms_session` (httpOnly), `ms_access_token` (para SSE/WS), `ms_auth_email`.  
**Não** use `NEXT_PUBLIC_API_ACCESS_TOKEN` em repositório público / internet — o valor entra no bundle JS.

Endpoints: `GET /api/v1/auth/status`, `POST /api/v1/auth/login` (públicos, com throttle no login).

## Repositório público — checklist

Antes de tornar o GitHub público:

- [ ] `.env`, `backend/.env`, `frontend/.env.local`, `desktop/.env` **fora** do Git (gitignore)
- [ ] Sem Client Secrets OAuth, tokens ou senhas no histórico (`git log -p` / busca)
- [ ] `.env.template` só com placeholders vazios
- [ ] Banco `*.db` ignorado
- [ ] Prints em `docs/screenshots/` sem dados pessoais reais
- [ ] Em produção: `API_ACCESS_TOKEN` + `APP_AUTH_*` + `SECURITY_REQUIRE_TOKEN=true`

## Swagger

http://localhost:3001/api/docs — Authorize com Bearer ou api-key.

## Postman

Collection em `docs/postman/` — variável `apiKey` + header `X-API-Key`; pasta **Auth** para login.

## Checklist de deploy

- [ ] Token forte (≥ 32 chars aleatórios)  
- [ ] `APP_AUTH_EMAIL` / `APP_AUTH_PASSWORD` fortes  
- [ ] CORS só para o domínio do frontend  
- [ ] HTTPS no proxy  
- [ ] Não commitár `.env`  
- [ ] Rate limit adequado ao tráfego  

Rule/skill: `.cursor/rules/security-hardening.mdc` · `.cursor/skills/security-hardening/SKILL.md`
