# Script para verificar e corrigir todos os caminhos em arquivos HTML
Get-ChildItem -Path . -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Se o arquivo está na raiz, não usar ../ para CSS e ImagensMenu
    if ($_.DirectoryName -eq (Get-Location).Path) {
        $content = $content -replace 'href="../CSS/', 'href="CSS/'
        $content = $content -replace 'src="../ImagensMenu/', 'src="ImagensMenu/'
        $content = $content -replace 'src="../navbar.js"', 'src="navbar.js"'
    }
    # Se o arquivo está em paginas, usar ../ para voltar para raiz
    elseif ($_.DirectoryName -like '*\paginas*') {
        $content = $content -replace 'href="CSS/', 'href="../CSS/'
        $content = $content -replace 'src="ImagensMenu/', 'src="../ImagensMenu/'
        $content = $content -replace 'src="navbar.js"', 'src="../navbar.js"'
    }
    
    # Remover prefixo paginas/ duplicado em links
    $content = $content -replace 'href="paginas/paginas/', 'href="paginas/'
    
    if ($content -ne $original) {
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Corrigido: $($_.FullName)"
    }
}
Write-Host "Verificação concluída!"
