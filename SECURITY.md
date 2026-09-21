# Security Policy

**Autor:** Francisco Stanley Rodrigues Albuquerque  
**Projeto:** Meeting Scribe

## Supported versions

| Version | Supported |
|---------|-----------|
| `0.1.x` (main / master) | Yes |

## Reporting a vulnerability

Não abra issue pública com exploits ou secrets.

Envie um e-mail / contato privado descrevendo:

1. Impacto e superfície (HTTP, WebSocket, UI, desktop)
2. Passos reproduzíveis (sem payloads destrutivos)
3. Ambiente (local / Docker / versão do commit)

Resposta esperada em até **7 dias úteis**. Correções críticas entram via PR com `fix(security):`.

## Hardening already in place

- API access token (`Bearer` / `X-API-Key`) + login UI
- Helmet, rate limit, ValidationPipe estrito
- CSP e headers de segurança no Next.js
- Limite de chunk de áudio no WebSocket
- Secrets apenas em `.env` (nunca no Git)

Documentação detalhada: [`docs/security.md`](docs/security.md) · Wiki: [Security](https://github.com/FranciscoStanley/meeting_scribe_annotations/wiki/Security)
