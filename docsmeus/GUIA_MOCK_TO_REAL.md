# Guia: Migração de Dados Mock para Backend Real

## 📋 Visão Geral

Este guia documenta a migração do frontend de dados mock (simulados) para o backend real.

**Status Atual:** ✅ **CONECTADO AO BACKEND REAL**

O sistema agora está configurado para usar o backend Node.js + PostgreSQL em vez de dados simulados em memória.

---

## 🔄 Antes vs Depois

### Antes (Mock Mode)
- ✗ Dados simulados em memória (JavaScript)
- ✗ localStorage para persistência temporária
- ✗ Sem necessidade de backend rodando
- ✗ Dados perdidos ao limpar o navegador
- ✗ Sem validações reais de negócio
- ✗ IDs simulados (ex: "sys-admin-001", "eval-001")

### Depois (Backend Real) ✅
- ✓ Dados reais armazenados no PostgreSQL
- ✓ API REST completa com validações
- ✓ Backend obrigatório (http://localhost:3000)
- ✓ Persistência permanente no banco de dados
- ✓ Validações de negócio no servidor
- ✓ UUIDs reais (ex: "550e8400-e29b-41d4-a716-446655440000")

---

## 🚀 Como Usar o Backend Real

### Pré-requisitos

1. **Backend rodando** em http://localhost:3000
2. **Banco de dados PostgreSQL** configurado
3. **Dados populados** com seed: `npm run prisma:seed`

### Verificar se Backend está Rodando

```bash
# Testar health check
curl http://localhost:3000/health

# Resposta esperada:
# {"status":"ok","timestamp":"2024-05-05T..."}
```

### Iniciar o Backend

```bash
cd backend
npm install
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

---

## 🔧 Alternar Entre Mock e Real (Desenvolvimento)

### Para usar MOCK (desenvolvimento sem backend):

**⚠️ Apenas para desenvolvimento/testes sem backend disponível**

1. Abrir `frontend-ref/js/api.js`
2. Mudar linha 12:
   ```javascript
   const MOCK_MODE = false; // ← Mudar para true
   ```

3. Abrir `frontend-ref/js/auth.js`
4. Mudar linha 12:
   ```javascript
   const MOCK_MODE = false; // ← Mudar para true
   ```

### Para usar BACKEND REAL (produção): ✅

**✅ Configuração atual do sistema**

1. Abrir `frontend-ref/js/api.js`
2. Confirmar linha 12:
   ```javascript
   const MOCK_MODE = false; // ✅ Correto
   ```

3. Abrir `frontend-ref/js/auth.js`
4. Confirmar linha 12:
   ```javascript
   const MOCK_MODE = false; // ✅ Correto
   ```

---

## ✅ Checklist de Verificação

Antes de usar o sistema, verifique:

- [ ] Backend rodando em http://localhost:3000
- [ ] Health check respondendo: `GET /health`
- [ ] Banco de dados PostgreSQL ativo
- [ ] Banco populado com seed: `npm run prisma:seed`
- [ ] `MOCK_MODE = false` em `api.js`
- [ ] `MOCK_MODE = false` em `auth.js`
- [ ] `API_BASE_URL` correto em `config.js`: `http://localhost:3000/api`

### Testar Funcionalidades

- [ ] Login funcionando com usuários reais
- [ ] Avaliações sendo salvas no banco
- [ ] Nine Box funcionando
- [ ] Competências carregando
- [ ] Relatórios exibindo dados reais
- [ ] Cadastro de novos usuários

---

## 🔐 Usuários de Teste (Backend Real)

Após rodar o seed (`npm run prisma:seed`), os seguintes usuários estarão disponíveis:

### Administradores

| Email | Senha | Nome | RA |
|-------|-------|------|-----|
| admin@eniac.edu.br | admin123 | Admin Sistema | 1234567 |
| patricia.almeida@eniac.edu.br | admin123 | Patricia Almeida | 1234568 |

### Gestores

| Email | Senha | Nome | Cargo |
|-------|-------|------|-------|
| joao.silva@eniac.edu.br | senha123 | João Silva | Gerente de TI |
| maria.santos@eniac.edu.br | senha123 | Maria Santos | Gerente de RH |
| roberto.ferreira@eniac.edu.br | senha123 | Roberto Ferreira | Coordenador de Desenvolvimento |
| fernanda.lima@eniac.edu.br | senha123 | Fernanda Lima | Gerente Comercial |

### Colaboradores

| Email | Senha | Nome | Cargo |
|-------|-------|------|-------|
| ana.costa@eniac.edu.br | senha123 | Ana Costa | Desenvolvedora Full Stack |
| carlos.oliveira@eniac.edu.br | senha123 | Carlos Oliveira | Analista de Sistemas |
| bruno.martins@eniac.edu.br | senha123 | Bruno Martins | Desenvolvedor Backend |
| camila.rodrigues@eniac.edu.br | senha123 | Camila Rodrigues | Desenvolvedora Frontend |

**Mais usuários disponíveis no arquivo:** `backend/prisma/seed.js`

---

## 🐛 Troubleshooting

### Erro: "Servidor indisponível"

**Causa:** Backend não está rodando ou URL incorreta

**Solução:**
```bash
# 1. Verificar se backend está rodando
curl http://localhost:3000/health

# 2. Se não estiver, iniciar o backend
cd backend
npm run dev

# 3. Verificar URL em frontend-ref/js/config.js
# Deve ser: API_BASE_URL: 'http://localhost:3000/api'
```

### Erro: "Token inválido" ou "Unauthorized"

**Causa:** Token JWT expirado ou inválido

**Solução:**
1. Fazer logout e login novamente
2. Verificar se `JWT_SECRET` está configurado no backend (.env)
3. Limpar localStorage do navegador (F12 → Application → Local Storage)

### Erro: "Usuário não encontrado"

**Causa:** Banco de dados vazio ou seed não executado

**Solução:**
```bash
cd backend

# Resetar banco e rodar seed
npm run prisma:migrate:reset

# Ou apenas rodar seed
npm run prisma:seed
```

### Erro: "CORS blocked" ou "Access-Control-Allow-Origin"

**Sintoma:** 
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://127.0.0.1:5500' 
has been blocked by CORS policy
```

**Causa:** O navegador está acessando de uma origem diferente (ex: `http://127.0.0.1:5500` em vez de `http://localhost:5500`)

**Solução:**

✅ **O backend já está configurado para aceitar múltiplas origens:**
- `http://localhost:5500`
- `http://127.0.0.1:5500`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

**Se o erro persistir:**
1. **Reiniciar o servidor backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Limpar cache do navegador:**
   - Chrome/Edge: `Ctrl+Shift+Delete` → Limpar cache
   - Ou tentar em modo anônimo/privado

3. **Verificar configuração CORS em `backend/src/app.js`:**
   ```javascript
   const allowedOrigins = [
     'http://localhost:5500',
     'http://127.0.0.1:5500',
     // ...
   ];
   ```

4. **Acessar sempre pela mesma URL:**
   - Use `http://localhost:5500` OU `http://127.0.0.1:5500`
   - Não misture as duas

### Erro: "Connection refused" ou "ECONNREFUSED"

**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
# Verificar status do PostgreSQL
# Windows:
services.msc → PostgreSQL

# Linux/Mac:
sudo systemctl status postgresql
# ou
brew services list
```

---

## 📝 Diferenças Importantes

### Estrutura de Resposta da API

**Mock:**
```javascript
{
  success: true,
  data: { user: {...} },
  message: "Sucesso"
}
```

**Backend Real:**
```javascript
{
  success: true,
  data: { user: {...} },
  message: "Sucesso"
}
```

✅ **Mesma estrutura!** Sem necessidade de mudanças no frontend.

### IDs

| Tipo | Mock | Backend Real |
|------|------|--------------|
| Usuários | `"sys-admin-001"` | `"550e8400-e29b-41d4-a716-446655440000"` |
| Avaliações | `"eval-001"` | `"7c9e6679-7425-40de-944b-e07fc1f90ae7"` |
| Competências | `"comp-001"` | `"3fa85f64-5717-4562-b3fc-2c963f66afa6"` |

**Impacto:** Nenhum! O frontend trata IDs como strings opacas.

### Datas

| Tipo | Formato |
|------|---------|
| Mock | ISO strings simuladas: `"2024-04-15T14:30:00.000Z"` |
| Backend Real | ISO strings do PostgreSQL: `"2024-05-05T21:15:32.123Z"` |

**Impacto:** Nenhum! Ambos são ISO 8601 válidos.

### Validações

| Aspecto | Mock | Backend Real |
|---------|------|--------------|
| Email único | ✓ Validado no frontend | ✓ Validado no backend + banco |
| RA único | ✓ Validado no frontend | ✓ Validado no backend + banco |
| Senha forte | ✗ Não validado | ✓ Mínimo 6 caracteres |
| Campos obrigatórios | ✓ Frontend apenas | ✓ Frontend + Backend |
| Tipos de dados | ✗ Não validado | ✓ Validado com Joi |

---

## 🎯 Próximos Passos

### Desenvolvimento

1. ✅ Testar todas as funcionalidades com backend real
2. ⏳ Remover código mock não utilizado (opcional)
3. ⏳ Adicionar testes de integração
4. ⏳ Implementar tratamento de erros mais robusto

### Produção

1. ⏳ Configurar variáveis de ambiente de produção
2. ⏳ Configurar HTTPS
3. ⏳ Deploy do backend (Heroku, AWS, etc.)
4. ⏳ Deploy do frontend (Vercel, Netlify, etc.)
5. ⏳ Configurar domínio personalizado

---

## 📚 Documentação Relacionada

- [GUIA_COMPLETO.md](./GUIA_COMPLETO.md) - Guia completo do sistema
- [GUIA_DEPLOY.md](./GUIA_DEPLOY.md) - Como fazer deploy
- [backend/README.md](../backend/README.md) - Documentação do backend
- [GUIA_EVALUATIONS.md](./GUIA_EVALUATIONS.md) - API de Avaliações
- [GUIA_NINEBOX.md](./GUIA_NINEBOX.md) - API Nine Box
- [GUIA_COMPETENCIES.md](./GUIA_COMPETENCIES.md) - API de Competências

---

## 🔍 Arquivos Modificados

### Arquivos Atualizados (Mock → Real)

1. **frontend-ref/js/api.js**
   - Linha 12: `MOCK_MODE = false`
   - Todas as chamadas agora usam backend real

2. **frontend-ref/js/auth.js**
   - Linha 12: `MOCK_MODE = false`
   - Login agora usa API real

3. **frontend-ref/js/config.js**
   - `API_BASE_URL: 'http://localhost:3000/api'` (já estava correto)

### Arquivos Mantidos (Referência)

- **frontend-ref/js/mockData.js** - Mantido para referência futura
  - Contém estrutura de dados de exemplo
  - Útil para testes e desenvolvimento
  - Não é mais usado pelo sistema

---

## 💡 Dicas

### Desenvolvimento Local

- Use **MOCK_MODE = true** quando o backend não estiver disponível
- Use **MOCK_MODE = false** para testar integração real
- Mantenha o backend rodando em um terminal separado

### Debug

```javascript
// Verificar modo atual no console do navegador
console.log('Mock Mode:', MOCK_MODE);

// Verificar token JWT
console.log('Token:', localStorage.getItem('portal_token'));

// Verificar usuário logado
console.log('User:', JSON.parse(localStorage.getItem('portal_user')));
```

### Performance

- Backend real é mais rápido que mock (sem delays artificiais)
- Dados são persistentes (não perdem ao recarregar)
- Validações são mais robustas

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verificar este guia primeiro
2. Consultar logs do backend: `backend/logs/`
3. Verificar console do navegador (F12)
4. Revisar documentação da API nos guias específicos

---

**Última atualização:** 05/05/2024  
**Versão:** 1.0.0  
**Status:** ✅ Produção
