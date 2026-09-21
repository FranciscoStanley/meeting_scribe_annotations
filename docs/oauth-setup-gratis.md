# Conectar Google e Outlook grátis (OAuth)

Fluxo igual aos apps do mercado: **Conectar → aceitar permissões → sync automático**.

Você precisa criar **uma vez** um app gratuito no Google Cloud e/ou Azure.  
Depois disso não paga nada nas cotas pessoais típicas de uso individual.

---

## Google Calendar / Gmail (Meet)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/) (conta Google gratuita).
2. Crie um projeto (ex.: `meeting-scribe`).
3. **APIs e serviços → Biblioteca** → ative **Google Calendar API**.
4. **APIs e serviços → Tela de consentimento OAuth**:
   - Tipo: **Externo**
   - Nome do app: Meeting Scribe
   - Seu e-mail de suporte
   - Em **Usuários de teste**, adicione o Gmail que vai usar
   - Escopos: `.../auth/calendar.readonly` e `email` (ou “continuar” e o app pede no login)
5. **Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**
   - URIs de redirecionamento autorizados:
     ```
     http://localhost:3001/api/v1/calendar/google/callback
     ```
6. Copie **ID do cliente** e **Segredo do cliente** para o `.env` na raiz:

```env
GOOGLE_CLIENT_ID=.....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-.....
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/calendar/google/callback
```

7. Reinicie o backend (`npm run dev` ou Docker).
8. Em **Calendários** → **Conectar Google** → aceite as permissões.

Em modo **Teste**, o Google permite até 100 usuários de teste sem verificação paga.

---

## Outlook / Microsoft Teams

1. Acesse [Azure Portal → Registros de aplicativo](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) (conta Microsoft gratuita).
2. **Novo registro**:
   - Nome: Meeting Scribe
   - Tipos de conta: **Contas pessoais da Microsoft e contas escolares/profissionais** (multilocatário + pessoal) — equivale a `MICROSOFT_TENANT=common`
   - URI de redirecionamento: plataforma **Web**
     ```
     http://localhost:3001/api/v1/calendar/microsoft/callback
     ```
3. Em **Certificados e segredos** → **Novo segredo do cliente** → copie o valor.
4. Em **Permissões de API** → Microsoft Graph → **Permissões delegadas**:
   - `Calendars.Read`
   - `User.Read`
   - `offline_access` (às vezes implícito no OAuth)
5. Copie o **ID do aplicativo (cliente)** e o segredo para o `.env`:

```env
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=xxxxx
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/v1/calendar/microsoft/callback
MICROSOFT_TENANT=common
```

6. Reinicie o backend.
7. Em **Calendários** → **Conectar Outlook / Teams** → aceite.

---

## Depois de conectado

- O job a cada minuto sincroniza eventos e alerta ~3 min antes (`MEETING_ALERT_MINUTES`).
- Você também pode clicar **Sincronizar agora**.
- Tokens ficam só no seu SQLite local — não vão para a nuvem de terceiros além de Google/Microsoft.

## Por que não dá para “zero config absoluto”?

Google e Microsoft **não permitem** que um app self-hosted use OAuth sem registrar um Client ID.  
Isso é grátis; o que alguns produtos cobram é a **assinatura do produto**, não a API de calendário em si.
