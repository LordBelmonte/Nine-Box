# Script para atualizar localhost:3000 para localhost:3001 em todos os arquivos HTML
Get-ChildItem -Path . -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'localhost:3000', 'localhost:3001'
    Set-Content $_.FullName -Value $content -NoNewline
    Write-Host "Atualizado: $($_.FullName)"
}
Write-Host "Concluído!"
