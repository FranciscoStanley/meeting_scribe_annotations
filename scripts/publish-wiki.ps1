# Publica docs/wiki para a GitHub Wiki do repositório.
# Pré-requisito: wiki habilitada e pelo menos a página Home criada uma vez no GitHub
# (Settings → Wikis, ou "Create the first page").
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root "docs\wiki"
$tmp = Join-Path $env:TEMP "meeting-scribe-wiki-publish"
$wikiRemote = "https://github.com/FranciscoStanley/meeting_scribe_annotations.wiki.git"

if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
git clone $wikiRemote $tmp
Copy-Item (Join-Path $src "*") $tmp -Force
Push-Location $tmp
git add .
git status --short
git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "docs(wiki): sincroniza documentação profissional" 2>$null
git push origin HEAD:master
if ($LASTEXITCODE -ne 0) { git push -u origin master }
Pop-Location
Write-Host "OK → https://github.com/FranciscoStanley/meeting_scribe_annotations/wiki"
