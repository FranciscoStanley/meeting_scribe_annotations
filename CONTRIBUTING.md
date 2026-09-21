# Contributing — Meeting Scribe

Obrigado por contribuir. Este repositório usa **Clean Architecture**, commits atômicos e docs sincronizados com o código.

## Branch protection

A branch `master` exige **Pull Request**. Force push e exclusão estão bloqueados.

```bash
git checkout -b feat/minha-mudanca
# ... trabalho ...
git push -u origin HEAD
gh pr create
```

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição imperativa
```

Tipos: `feat` · `fix` · `refactor` · `test` · `docs` · `chore` · `build` · `ci` · `perf` · `style`

**Uma alteração lógica = um commit.** Não misture feature + docs + deps no mesmo commit.

Ordem sugerida: deps → refactor → feat/fix → test → docs → chore.

## Definition of Done

1. Código + testes relevantes (`npm test` / testes do workspace)
2. Swagger + Postman se houver mudança HTTP
3. README / wiki / screenshots se o fluxo de UI mudou
4. Sem secrets no diff (`.env`, tokens, OAuth secrets)

## Desenvolvimento local

```powershell
copy .env.template .env
npm install
npm run dev
```

Ver [docs/dev-local.md](docs/dev-local.md) e a [Wiki](https://github.com/FranciscoStanley/meeting_scribe_annotations/wiki).

## Code review

PRs devem ser pequenos, com descrição do **porquê** e checklist de teste. Prefira PRs focados a monólitos.
