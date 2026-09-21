---
name: frontend-design-system
description: >-
  Design system Meeting Scribe — visual corporativo, tipografia, componentes,
  anti-padrões de UI genérica. Use ao criar/alterar páginas ou componentes do frontend.
---

# Frontend Design System — Meeting Scribe

**Autor:** Francisco Stanley Rodrigues Albuquerque  
**Rule:** `.cursor/rules/frontend-design-system.mdc`

## Propósito do produto

Ferramenta **corporativa** de transcrição (Teams/Meet): confiança, clareza, foco na tarefa (agendar → alertar → capturar → ler).

## Identidade visual

| Token | Uso | Valor-base |
|-------|-----|------------|
| `surface` | Fundo da app | `#F3F5F7` |
| `panel` | Painéis / tabelas | `#FFFFFF` |
| `ink` | Texto principal | `#0E1625` |
| `muted` | Texto secundário | `#5A6A7A` |
| `hairline` | Bordas | `#E2E8EF` |
| `brand` | CTA / links ativos | `#0F766E` (teal) |
| `brand-soft` | Hover / chips leves | `#CCFBF1` |
| `live` | Sessão ao vivo | `#B45309` / fundo âmbar suave |
| `ok` | Sucesso | `#047857` |
| `danger` | Erro / encerrar | `#B91C1C` |

### Tipografia

- **Display / marca:** `Outfit` (next/font) — títulos e logotipo
- **Corpo / UI:** `Source Sans 3` — leitura longa e formulários
- Evitar Inter, Roboto, Arial, system-ui como face principal

### Atmosfera

- Fundo `surface` com gradiente radial teal diluído + leve vertical (`bg-atmosphere`)
- Sidebar com marca **MS**, item ativo com barra teal e ícone em chip
- Page headers com `eyebrow` opcional (categoria da tela)
- Sem ilustrações decorativas genéricas; o conteúdo da reunião é o âncora

## Anti-padrões (proibido neste projeto)

- Tema roxo / indigo “AI default”
- Dark mode como padrão (salvo pedido explícito)
- Glow neon, multi-shadow, `rounded-full` em clusters de pills
- Emojis na UI
- Cards em tudo; hero com badges flutuantes
- Cream + terracotta + serif jornal

## Padrões de layout

1. **Shell:** sidebar esquerda (Home, Agenda, Calendário, API, Sair) + conteúdo; no mobile, top bar com menu
2. **Login:** `/login` full-bleed — marca hero + formulário; sem sidebar; primeira impressão do produto
3. **Voltar:** `BackLink` em editar, visualizar, agendar, captura e calendários
4. **Page header:** `h1` (Outfit) + 1 linha de apoio + no máximo 1 CTA primária
5. **Listas:** tabela ou lista densa em `panel`, hover de linha, status com badge
6. **Formulários:** `MeetingScheduleForm`; datas com `DateTimeField` (portal no body — nunca cortar no card)
7. **Captura:** instruções em lista numerada curta; status de gravação discreto (ponto + texto)
8. **Transcrição:** cores por falante via `buildSpeakerColorMap` (ordem de aparição) + `TranscriptSegmentCard` (nome + borda esquerda). Não depender só do hash — colisões perto do brand teal confundem.

## Componentes canônicos

| Componente | Onde |
|------------|------|
| `AppShell` | chrome global (sem shell em `/login`) |
| `LoginForm` / página `/login` | entrada do workspace |
| `Sidebar` | navegação Home / Agenda / Calendário / API / Sair |
| `BackLink` | voltar em editar / visualizar / captura |
| `StatusBadge` | status de sessão |
| `PageHeader` | título + ação |
| `Panel` | superfície branca com borda |
| `MeetingAlertModal` | alerta SSE |
| `SpeakerLabel` | nomes na transcrição |
| `DateTimeField` | início/fim; popover via portal no `body` |
| `MeetingScheduleForm` | formulário sofisticado de agendar/editar |
| `ConfirmDialog` | confirmação destrutiva (ex.: excluir agenda) |
| `AppToaster` | feedback via react-toastify |
| `TranscriptSegmentCard` | trecho com cor do falante |

Botões:

- Primário: `ms-btn-primary`
- Secundário: `ms-btn-secondary`
- Perigo: `ms-btn-danger` / linha: `ms-btn-danger-ghost`
- Compacto (tabelas): `ms-btn-sm`
- Ações de linha: `MeetingRowActions` — Editar / Excluir / Abrir (rótulo único)

## Acessibilidade

- Contraste WCAG AA
- Foco visível no teclado
- Não depender só de cor para status (texto no badge)

## Checklist ao alterar UI

- [ ] Tokens do `tailwind.config` / `globals.css` respeitados
- [ ] Sem anti-padrões da lista
- [ ] Mobile: header e CTAs usáveis
- [ ] `docs/screenshots/` se a tela mudou de forma relevante
- [ ] README “Interface e funcionalidades” se o fluxo mudou

## Integração

Carregar esta skill em features de UI junto com [nextjs-frontend](../../../../.cursor/skills/nextjs-frontend/SKILL.md).  
Índice: [meeting-scribe-development](../meeting-scribe-development/SKILL.md).
