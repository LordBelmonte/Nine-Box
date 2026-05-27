# Script para ajustar caminhos em todos os arquivos HTML do código legado para Windows
Get-ChildItem -Path . -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Ajustar caminhos relativos para funcionar no Windows
    # Se o arquivo está na pasta paginas, ajustar caminhos para voltar para raiz
    if ($_.DirectoryName -like '*\paginas*') {
        $content = $content -replace 'href="CSS/', 'href="../CSS/'
        $content = $content -replace 'src="ImagensMenu/', 'src="../ImagensMenu/'
        $content = $content -replace 'src="navbar.js"', 'src="../navbar.js"'
    }
    
    # Ajustar links internos
    $content = $content -replace 'href="paginas/menu.html"', 'href="../menu.html"'
    
    if ($content -ne $original) {
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Ajustado: $($_.FullName)"
    }
}
Write-Host "Concluído!"
