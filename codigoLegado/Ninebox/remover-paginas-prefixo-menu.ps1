# Script para remover prefixo paginas/ dos links no menu.html da raiz
$content = Get-Content .\menu.html -Raw
$content = $content -replace 'href="paginas/', 'href="'
Set-Content .\menu.html -Value $content -NoNewline
Write-Host "Prefixo paginas/ removido dos links no menu.html"
