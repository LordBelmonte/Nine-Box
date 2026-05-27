# Script para ajustar caminhos para Windows no menu.html da raiz
$content = Get-Content .\menu.html -Raw
# Ajustar links internos para usar caminhos relativos corretos
$content = $content -replace 'href="paginas/novaAvaliacao/', 'href="paginas/novaAvaliacao/'
$content = $content -replace 'href="paginas/minhasAvaliacoes/', 'href="paginas/minhasAvaliacoes/'
$content = $content -replace 'href="paginas/modelos_avaliacao.html"', 'href="paginas/modelos_avaliacao.html"'
$content = $content -replace 'href="paginas/novo_avaliado.html"', 'href="paginas/novo_avaliado.html"'
$content = $content -replace 'href="paginas/consultar-contatos.html"', 'href="paginas/consultar-contatos.html"'
Set-Content .\menu.html -Value $content -NoNewline
Write-Host "Caminhos ajustados para Windows"
