$content = Get-Content consultar.html -Raw
$oldLine = '    </li>
    <li class="navbar-item"><a href="relatorios.html"'
$newLine = '    </li>
    <li class="navbar-item" data-role="admin"><a href="grupos.html" class="navbar-link"><i class="fa-solid fa-users"></i><span>Grupos</span></a></li>
    <li class="navbar-item"><a href="relatorios.html"'
$content = $content -replace [regex]::Escape($oldLine), $newLine
Set-Content consultar.html -Value $content -NoNewline
