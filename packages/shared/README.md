# @meeting-scribe/shared

Tipos e regras compartilhadas entre backend, frontend e desktop.

**Autor:** Francisco Stanley Rodrigues Albuquerque

## Conteúdo

| Módulo | Função |
|--------|--------|
| Tipos DTO | `MeetingSummaryDto`, `TranscriptSegmentDto`, status, plataforma |
| `meetingCanModify` / `meetingCanCapture` | Permissões de UI e captura |
| `meetingRowActions` | Ações da lista (Editar / Excluir / Abrir) |
| `validateMeetingSchedule` / `assertMeetingSchedule` | Validação de início/fim |
| `speakerColor` / `buildSpeakerColorMap` | Cores por falante |
| `toTeamsDesktopJoinUrl` | Deep link Teams desktop |

## Testes

```bash
npm run test -w @meeting-scribe/shared
```

Specs: `meeting-schedule`, `meeting-permissions`, `speaker-color`, `teams-links`.
