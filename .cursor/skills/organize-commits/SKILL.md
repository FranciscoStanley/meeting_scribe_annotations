---
name: organize-commits
description: >-
  Commits atômicos Meeting Scribe — uma alteração = um commit Conventional.
  Use ao commitar, dividir histórico, ou quando houver mudanças misturadas.
---

# Organize Commits — Meeting Scribe

**Autor:** Francisco Stanley Rodrigues Albuquerque  
**Rule:** `.cursor/rules/organize-commits.mdc`

## Regra de ouro

**Uma alteração lógica = um commit.** Nunca misturar:

| Não misturar no mesmo commit |
|------------------------------|
| `feat` / `fix` de código + `docs` |
| código + `test` (salvo se o teste for inseparável do fix mínimo) |
| deps (`build`) + feature |
| rule/skill Cursor + feature de produto |
| UI + backend API |

Se o trabalho gerou N intenções, faça **N commits** na ordem abaixo.

## Ordem obrigatória

1. `build` / deps  
2. `refactor` (pré-requisito)  
3. `feat` / `fix` / `perf`  
4. `test`  
5. `docs`  
6. `chore` / `ci` / Cursor rules-skills (`chore(cursor)` ou `docs(cursor)`)

## Workflow

1. `git status` · `git diff` · `git log -5 --oneline`
2. Montar plano (tabela: # | tipo | arquivos | mensagem)
3. Para cada linha do plano: `git add <só esses arquivos>` → `git commit -m "..."`  
4. Nunca `git add .` com working tree misturada  
5. Push **só** se o usuário pedir

## Formato

```
tipo(escopo): descrição imperativa curta
```

Tipos: `feat` · `fix` · `refactor` · `perf` · `docs` · `test` · `build` · `ci` · `chore` · `style`

## Exemplos (este repo)

| # | Commit |
|---|--------|
| 1 | `feat(shared): meetingRowActions por status` |
| 2 | `refactor(frontend): MeetingRowActions usa shared` |
| 3 | `test(shared): specs de ações da lista` |
| 4 | `docs: README da lista de reuniões` |
| 5 | `chore(cursor): rule organize-commits` |

## Checklist antes de cada `git commit`

- [ ] Diff staged = **uma** intenção  
- [ ] Mensagem no formato Conventional  
- [ ] Sem `.env` / secrets  
- [ ] Specs daquela alteração já existem ou vão no commit `test` seguinte  

## Integração

Após commits → [review-code](../../../../.cursor/skills/review-code/SKILL.md)  
DoD de feature → [keep-docs-in-sync](../keep-docs-in-sync/SKILL.md)
