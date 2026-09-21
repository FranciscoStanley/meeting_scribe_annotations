# OAuth Calendar

Conectar Google e Outlook **gratuitamente** para sync automático de Meet/Teams.

## Ideia

1. Cria **uma vez** Client ID (Google Cloud / Azure)  
2. Coloca no `.env`  
3. Em **Calendários** → Conectar → aceitar permissões  

Alternativa sem OAuth: colar URL secreta **ICS** na mesma tela.

## Google

1. Google Cloud Console → projeto  
2. Ativar **Google Calendar API**  
3. Tela de consentimento OAuth (externo + usuários de teste)  
4. Credencial Web → redirect:
   `http://localhost:3001/api/v1/calendar/google/callback`  
5. `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` no `.env`

## Microsoft

1. Azure Portal → App registration  
2. Redirect:
   `http://localhost:3001/api/v1/calendar/microsoft/callback`  
3. `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET`  
4. `MICROSOFT_TENANT=common` (pessoal + organizacional)

**Nunca** commite secrets. Só no `.env` local/servidor.

Guia passo a passo: [`docs/oauth-setup-gratis.md`](https://github.com/FranciscoStanley/meeting_scribe_annotations/blob/master/docs/oauth-setup-gratis.md)
