# Script para remover base href de todos os arquivos HTML
Get-ChildItem -Path . -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '<base href="http://127.0.0.1:5500/Ninebox/">', ''
    Set-Content $_.FullName -Value $content -NoNewline
    Write-Host "Removido base href: $($_.FullName)"
}
Write-Host "Concluído!"
