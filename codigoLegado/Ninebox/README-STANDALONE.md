# Código Legado Ninebox - Versão Independente

Este README descreve como rodar o código legado Ninebox sem depender do novo sistema.

## O que foi feito

1. **Backend standalone criado**: `server-standalone.js` - Servidor Node.js/Express que roda na porta 3001
2. **Atualização de portas**: Todos os arquivos HTML foram atualizados de `localhost:3000` para `localhost:3001`
3. **Package.json**: `package-standalone.json` com dependências necessárias

## Como rodar

### 1. Instalar dependências

```bash
cd codigoLegado/Ninebox
npm install --package-lock-only
npm install express cors
```

Ou usando o package-standalone.json:

```bash
npm install --save-dev --package-lock-only
cp package-standalone.json package.json
npm install
```

### 2. Iniciar o servidor

```bash
node server-standalone.js
```

O servidor irá rodar em `http://localhost:3001`

### 3. Acessar o código legado

O servidor standalone agora serve os arquivos estáticos automaticamente. Acesse:

```
http://localhost:3001/index.html
```

Ou diretamente:

```
http://localhost:3001
```

**Nota:** Os erros de CSP (Content Security Policy) bloqueando Google Fonts são causados pelo antivírus Kaspersky e não pelo código. Para resolver, desative a proteção CSP do Kaspersky ou use um navegador diferente.

## Funcionalidades do Backend Standalone

O backend standalone fornece os seguintes endpoints:

- **Login**: `/login`, `/loginUsuario`
- **Token**: `/verificaToken`
- **Avaliações**: `/listarAvaliacoes`, `/listarAvaliacoesGestor`, `/adicionarAvaliacao`, `/avaliacoes/:id`
- **Avaliados**: `/avaliado` (GET, POST), `/editarAvaliado/:cpf`
- **Gestores**: `/gestor` (GET, POST)
- **Competências**: `/competencias`, `/salvar_competencia`, `/competenciaPoridAvaliacao`, `/competenciaPoridAvaliacaoGestor`
- **Descrições**: `/descricaoPoridAvaliacao`, `/descricaoPoridAvaliacaoGestor`
- **Respostas**: `/salvarResposta`, `/salvarRespostaGestor`
- **Avaliados por avaliação**: `/avaliadosPoridAvaliacaoGestor`

## Dados Mock

O backend usa dados mock realistas para simular um sistema funcionando:

### Usuários (Login)
- **Admin**: admin@admin.com / admin123
- **Colaborador**: CPF 12345678900 / senha 123456 (João Silva)
- **Gestor**: CPF 09876543211 / senha 123456 (Maria Santos)
- **Colaborador**: CPF 11122233344 / senha 123456 (Pedro Oliveira)
- **Gestor**: CPF 55566677788 / senha 123456 (Ana Costa)

### Avaliações
- Avaliação de Desempenho 2024 (ativa)
- Avaliação de Competências Técnicas (planejamento)
- Avaliação 180 Graus (finalizada)

### Avaliados
- João Silva (Desenvolvedor TI)
- Pedro Oliveira (Analista de Sistemas TI)
- Carla Mendes (Gerente de Projetos Operações)
- Ricardo Alves (Analista Financeiro)

### Gestores
- Maria Santos (Gerente de TI)
- Ana Costa (Gerente de Operações)

### Competências
- Comunicação (comportamental)
- Trabalho em Equipe (comportamental)
- Programação em JavaScript (técnica)
- Gestão de Projetos (técnica)
- Liderança (comportamental)

### Respostas
- Respostas de avaliação já preenchidas para demonstração

Os dados são carregados do arquivo `mock-data.js` e podem ser modificados conforme necessário.

## Diferenças do Novo Sistema

- **Porta**: 3001 (vs 3000 do novo sistema)
- **Backend**: Express.js standalone (vs backend completo do novo sistema)
- **Banco de dados**: Arrays em memória (vs PostgreSQL do novo sistema)
- **Autenticação**: Mock simples (vs JWT completo do novo sistema)

## Notas

- O código legado agora é completamente independente do novo sistema
- Você pode rodar ambos os sistemas simultaneamente (novo em 3000, legado em 3001)
- Para reverter as mudanças, execute o script `reverter-porta.ps1` (se criado) ou manualmente substitua `localhost:3001` por `localhost:3000`
