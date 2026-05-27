# Script para remover prefixo paginas/ de todos os links em todos os arquivos HTML
Get-ChildItem -Path .\paginas -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Remover prefixo paginas/ de todos os links href
    $content = $content -replace 'href="paginas/', 'href="'
    
    if ($content -ne $original) {
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Ajustado: $($_.FullName)"
    }
}
Write-Host "Concluído!"
