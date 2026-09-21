# Contributing

## Branch protegida (`master`)

- Sem **force push** e sem **exclusão** da branch  
- Merges via **Pull Request**  
- Check obrigatório: **CI / test** (GitHub Actions)

Fluxo sugerido:

```bash
git checkout -b feat/minha-mudanca
# ... commits atômicos ...
git push -u origin HEAD
gh pr create
```

## Commits

Formato Conventional Commits — **1 alteração lógica = 1 commit**.

Tipos: `feat` · `fix` · `refactor` · `test` · `docs` · `chore` · `build` · `ci` · `perf` · `style`

Ordem: deps → refactor → feat/fix → test → docs → chore/cursor  

**Push** só quando pedido; nunca `git add .` com mudanças misturadas.

## Definition of Done

Ao fechar uma feature:

1. Código + testes  
2. Swagger / Postman se houver HTTP  
3. README(s) / wiki se o fluxo mudou  
4. Commits semânticos atômicos  

Rules: `keep-docs-in-sync` · `organize-commits`

## CI

Workflow: `.github/workflows/ci.yml`

- `npm ci`  
- build shared  
- testes shared / backend / frontend  
- typecheck backend / frontend  
