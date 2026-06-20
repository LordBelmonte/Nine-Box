# Guia de Debugging - Validação de Colaboradores

## Problema
- Erro: "É obrigatório informar os colaboradores por gestor" mesmo após selecionar colaboradores
- Sintoma: 5 requisições simultâneas ao clicar em "Salvar"
- Versão: Após última refatoração de Sets/Arrays

## Mudanças Implementadas

### Frontend (campanhas.html)
1. **Mudança de Storage**: `colaboradoresPorGestor` agora armazena **arrays** em vez de Sets
   - Antes: `colaboradoresPorGestor[gestorId] = new Set([...])`
   - Depois: `colaboradoresPorGestor[gestorId] = [...]` (array simples)

2. **Correção de Validação**: `renderColaboradoresPorGestor()` agora usa `.includes()` com arrays
   - Antes: Tentava usar `.includes()` em um Set (erro)
   - Depois: Valida `Array.isArray(colaboradoresSelecionadosIds)` e usa `.includes()`

3. **Lógica de Serialização**: `salvarCampanha()` 
   - Antes: `Array.from(colaboradoresPorGestor[gestorId] || [])`
   - Depois: `colaboradoresPorGestor[gestorId] || []` (já é array)

4. **Console Logs Adicionados**:
   ```javascript
   console.log('[salvarCampanha] chamada iniciada');
   console.log('[salvarCampanha] payload:', payload);
   console.log('[atualizarColaboradoresGestor] gestorId:', gestorId, 'selectedOptions:', selectedOptions);
   console.log('[abrirFormulario] colaboradoresPorGestor:', colaboradoresPorGestor);
   ```

### Backend (campaign.service.js)
1. **Console Logs para Debugging**:
   ```javascript
   console.log('[CampaignService.create] payload:', {...});
   console.log('[CampaignService.create] validando gestorId:', gestorId, 'colaboradorIds:', colaboradorIds, 'isArray:', Array.isArray(colaboradorIds));
   console.error('[CampaignService.create] colaboradorIds não é um array para gestorId:', gestorId, 'tipo:', typeof colaboradorIds);
   ```

### Backend (campaign.controller.js)
1. **Logs de Request**:
   ```javascript
   console.log('[CampaignController.create] req.body:', JSON.stringify(req.body, null, 2));
   console.log('[CampaignController.update] req.params.id:', req.params.id, 'req.body:', JSON.stringify(req.body, null, 2));
   ```

## Teste Step-by-Step

### 1️⃣ Verificar Payload no Frontend
- **Abra o DevTools** (F12) → Console
- Clique em "Nova Campanha"
- Selecione 1 competência
- Selecione 1 gestor
- Selecione colaboradores para esse gestor (use Ctrl para múltiplos)
- **Observe o console** - você deve ver:
  ```
  [salvarCampanha] chamada iniciada
  [salvarCampanha] payload: {
    nome: "...",
    descricao: "...",
    gestorColaboradores: {
      "gestor-id-123": ["colab-1", "colab-2"]  ← Deve ser ARRAY
    }
  }
  ```

### 2️⃣ Verificar Payload no Backend
- **Abra o terminal** onde o Node.js está rodando
- Observe após fazer a requisição:
  ```
  [CampaignController.create] req.body: {
    gestorColaboradores: {
      "gestor-id-123": ["colab-1", "colab-2"]  ← Deve ser ARRAY
    }
  }
  [CampaignService.create] payload: {
    gestorIds: ["gestor-id-123"],
    gestorColaboradores: { "gestor-id-123": ["colab-1", "colab-2"] }
  }
  [CampaignService.create] validando gestorId: gestor-id-123 colaboradorIds: ["colab-1", "colab-2"] isArray: true
  ```

### 3️⃣ Investigar Requisições Duplicadas
- **Abra DevTools** → Network tab
- **Limpe** a aba (clique no botão de lixo)
- Clique em "Salvar"
- **Conte as requisições** para `/api/campaigns`
  - ❌ Se aparecer 5: Problema no evento (provável listener duplicado)
  - ✅ Se aparecer 1: Ok, o browser pode estar mostrando preflight requests

### 4️⃣ Validar Fluxo de Seleção
- Na janela do formulário, experimente:
  1. Selecione um gestor (deve renderizar select de colaboradores)
  2. No select, selecione colaboradores (use Ctrl+Click)
  3. **Observe no console**: `[atualizarColaboradoresGestor] gestorId: ... selectedOptions: [...]`

## Possíveis Causas Identificadas

### 🔴 Cenário 1: Set não convertido para Array
- **Sintoma**: `colaboradorIds não é um array para gestorId`
- **Causa**: Algum lugar ainda está criando Sets em vez de arrays
- **Solução**: Procurar por `new Set()` em `renderColaboradoresPorGestor()` ou `abrirFormulario()`

### 🔴 Cenário 2: Listeners Duplicados
- **Sintoma**: 5 requisições ao clicar uma vez
- **Causa**: `addEventListener` chamado múltiplas vezes
- **Solução**: Remover e re-criar listeners a cada abertura do formulário

### 🔴 Cenário 3: Payload Não Sendo Serializado
- **Sintoma**: Backend recebe `gestorColaboradores: {}`
- **Causa**: `colaboradoresPorGestor` não é populado corretamente
- **Solução**: Verificar `atualizarColaboradoresGestor()` e `renderColaboradoresPorGestor()`

### 🔴 Cenário 4: Tipo de Alvo Não Permitindo Colaboradores
- **Sintoma**: Mensagem sobre colaboradores obrigatórios
- **Causa**: `tipoAlvo !== 'gestor'` mas vazio
- **Solução**: Frontend deve validar `tipoAlvo === 'colaborador'` ou `'todos'` antes de enviar

## Checklist de Validação

- [ ] Console frontend mostra `[salvarCampanha] payload` com arrays (não Sets)
- [ ] Backend recebe `gestorColaboradores` com arrays
- [ ] Backend loga `isArray: true` na validação
- [ ] Apenas 1 requisição POST aparece no Network (ignorar preflight)
- [ ] Nenhum erro de "colaboradorIds não é um array"
- [ ] Campaign criada/editada com sucesso

## Próximas Ações se Ainda Houver Erro

1. **Se ainda der erro de array**:
   - Procure por `new Set` em toda a função `renderColaboradoresPorGestor()`
   - Verifique se `abrirFormulario()` está criando Sets para colaboradores

2. **Se aparecerem 5 requisições**:
   - Procure por `addEventListener('click'` múltiplas vezes
   - Verifique se o submit do form está acionando além do onclick

3. **Se o payload chegar vazio**:
   - Adicione log em `atualizarColaboradoresGestor()` para verificar se está sendo chamado
   - Verifique se o select múltiplo tem `name="..."` atributo

4. **Se houver erro de tipo**:
   - Verifique se `tipoAlvo` está correto (deve ser 'colaborador', 'gestor' ou 'todos')
