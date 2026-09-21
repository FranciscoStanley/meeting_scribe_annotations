# Frontend UI

Design system corporativo (teal + surface clara).

## Identidade

| Token | Uso |
|-------|-----|
| Brand teal `#0F766E` | CTAs, ativo, marca |
| Surface / panel | Fundos |
| Outfit | Títulos / marca |
| Source Sans 3 | Corpo |

**Evitar:** tema roxo “AI default”, dark mode padrão, glow, pills em massa, emojis.

## Shell

- Sidebar: Home · Agenda · Calendário · API · **Sair**  
- `/login` sem sidebar (primeira impressão)  
- `BackLink` em editar / visualizar / captura  
- `ConfirmDialog` + toastify (sem `window.confirm`)  
- `DateTimeField` com portal (não corta no card)  
- `MeetingScheduleForm` em seções

## Screenshots

No repositório: `docs/screenshots/` (`00-login` … `06-alerta`).

Regenerar:

```bash
node scripts/capture-screenshots.cjs <meetingIdLive> [meetingIdScheduled]
```

Skill: `.cursor/skills/frontend-design-system/SKILL.md`
