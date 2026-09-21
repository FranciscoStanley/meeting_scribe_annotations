# Authentication and Login

O Meeting Scribe separa **login da UI** do **token da API**.

## Tela `/login`

- Marca em destaque + formulário e-mail/senha (ou chave de API)
- Middleware Next.js exige cookie `ms_session`
- Botão **Sair** limpa a sessão

## Modos

| Configuração no `.env` | Comportamento |
|------------------------|---------------|
| Sem `APP_AUTH_*` e sem `API_ACCESS_TOKEN` | **Modo aberto** (dev) — Entrar cria sessão sem token |
| Só `API_ACCESS_TOKEN` | Senha do login = a chave de API |
| `APP_AUTH_EMAIL` + `APP_AUTH_PASSWORD` | Credenciais; devolve `API_ACCESS_TOKEN` (se houver) |

## Cookies (frontend)

| Cookie | Uso |
|--------|-----|
| `ms_session` | Gate do middleware (httpOnly) |
| `ms_access_token` | Token para SSE/WS e fetches (legível no client) |
| `ms_auth_email` | Exibição |

## Endpoints públicos

- `GET /api/v1/auth/status` — `{ openMode, credentialsConfigured, tokenConfigured }`
- `POST /api/v1/auth/login` — `{ email?, password }` → `{ accessToken, email, mode }`  
  Com throttle (anti força-bruta)

Após login bem-sucedido, a UI chama `POST /api/auth/session` (Next) para gravar cookies.

## API (após login)

| Canal | Como autenticar |
|-------|-----------------|
| HTTP | `Authorization: Bearer <token>` ou `X-API-Key` |
| Socket.IO | `auth: { token }` |
| SSE | `?apiKey=<token>` |

**Produção:** defina `APP_AUTH_*`, `API_ACCESS_TOKEN` e `SECURITY_REQUIRE_TOKEN=true`.  
**Evite** `NEXT_PUBLIC_API_ACCESS_TOKEN` em internet pública (entra no bundle JS).

Ver também: [Security](Security)
