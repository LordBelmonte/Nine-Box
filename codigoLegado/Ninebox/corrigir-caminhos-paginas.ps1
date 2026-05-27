# Script para corrigir caminhos relativos na pasta paginas
Get-ChildItem -Path .\paginas -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'href="CSS/', 'href="../CSS/'
    $content = $content -replace 'src="ImagensMenu/', 'src="../ImagensMenu/'
    $content = $content -replace 'src="navbar.js"', 'src="../navbar.js"'
    Set-Content $_.FullName -Value $content -NoNewline
    Write-Host "Corrigido: $($_.FullName)"
}
Write-Host "Concluído!"
