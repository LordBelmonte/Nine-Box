# Changelog: Migração Mock → Backend Real

**Data:** 05/05/2024  
**Versão:** 1.0.0  
**Status:** ✅ Concluído

---

## 📋 Resumo das Mudanças

O frontend foi migrado de dados mock (simulados) para o backend real com PostgreSQL.

---

## ✅ Arquivos Modificados

### 1. `frontend-ref/js/api.js`

**Mudança:**
```javascript
// ANTES:
const MOCK_MODE = true; // Mude para false quando o backend estiver pronto

// DEPOIS:
const MOCK_MODE = false; // Conectado ao backend real
```

**Impacto:**
- Todas as chamadas de API agora usam o backend real em `http://localhost:3000/api`
- Dados são persistidos no PostgreSQL
- Validações são feitas no servidor

---

### 2. `frontend-ref/js/auth.js`

**Mudança:**
```javascript
// ANTES:
const MOCK_MODE = true; // Mude para false quando o backend estiver pronto

// DEPOIS:
const MOCK_MODE = false; // Conectado ao backend real
```

**Impacto:**
- Login agora usa autenticação JWT real
- Tokens são gerados pelo backend
- Senhas são validadas com bcrypt

---

### 3. `frontend-ref/js/config.js`

**Status:** ✅ Já estava correto

```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api', // ✅ Correto
  TOKEN_KEY: 'portal_token',
  USER_KEY: 'portal_user',
  DARK_MODE_KEY: 'darkMode',
};
```

---

## 📄 Arquivos Criados

### 1. `docsmeus/GUIA_MOCK_TO_REAL.md`

**Conteúdo:**
- Documentação completa da migração
- Instruções para alternar entre mock e real
- Troubleshooting
- Usuários de teste
- Checklist de verificação

---

### 2. `CHANGELOG_MOCK_TO_REAL.md` (este arquivo)

**Conteúdo:**
- Resumo das mudanças
- Arquivos modificados
- Instruções de uso

---

## 📦 Arquivos Mantidos (Não Deletados)

### `frontend-ref/js/mockData.js`

**Motivo:** Mantido para referência futura

**Conteúdo:**
- Estrutura de dados de exemplo
- Útil para testes e desenvolvimento
- Pode ser usado para popular banco de dados de teste

**Status:** Não é mais usado pelo sistema em produção

---

## 🚀 Como Usar o Sistema Agora

### Pré-requisitos

1. **Backend rodando:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Banco de dados populado:**
   ```bash
   cd backend
   npm run prisma:seed
   ```

3. **Verificar health check:**
   ```bash
   curl http://localhost:3000/health
   ```

### Acessar o Frontend

1. Abrir `frontend-ref/pages/login.html` no navegador
2. Fazer login com um dos usuários de teste:
   - **Admin:** admin@eniac.edu.br / admin123
   - **Gestor:** joao.silva@eniac.edu.br / senha123
   - **Colaborador:** ana.costa@eniac.edu.br / senha123

---

## ✅ Checklist de Verificação

Antes de usar o sistema, verifique:

- [x] `MOCK_MODE = false` em `frontend-ref/js/api.js`
- [x] `MOCK_MODE = false` em `frontend-ref/js/auth.js`
- [x] `API_BASE_URL` correto em `frontend-ref/js/config.js`
- [ ] Backend rodando em `http://localhost:3000`
- [ ] PostgreSQL ativo
- [ ] Banco populado com seed
- [ ] Health check respondendo

---

## 🔄 Como Voltar para Mock (Se Necessário)

**⚠️ Apenas para desenvolvimento/testes**

1. Abrir `frontend-ref/js/api.js`
2. Mudar: `const MOCK_MODE = false;` → `const MOCK_MODE = true;`
3. Abrir `frontend-ref/js/auth.js`
4. Mudar: `const MOCK_MODE = false;` → `const MOCK_MODE = true;`

---

## 📊 Comparação: Mock vs Real

| Aspecto | Mock | Backend Real |
|---------|------|--------------|
| **Persistência** | localStorage (temporário) | PostgreSQL (permanente) |
| **Validações** | Frontend apenas | Frontend + Backend |
| **IDs** | Simulados (ex: "sys-admin-001") | UUIDs reais |
| **Performance** | Delays artificiais | Rápido e real |
| **Segurança** | Baixa (senhas em texto) | Alta (bcrypt + JWT) |
| **Escalabilidade** | Limitada | Ilimitada |

---

## 🐛 Problemas Conhecidos

### Nenhum problema conhecido no momento

Se encontrar algum problema:
1. Consultar [GUIA_MOCK_TO_REAL.md](./docsmeus/GUIA_MOCK_TO_REAL.md) → Seção Troubleshooting
2. Verificar logs do backend
3. Verificar console do navegador (F12)

---

## 📚 Documentação Relacionada

- [GUIA_MOCK_TO_REAL.md](./docsmeus/GUIA_MOCK_TO_REAL.md) - Guia completo da migração
- [GUIA_COMPLETO.md](./docsmeus/GUIA_COMPLETO.md) - Guia completo do sistema
- [backend/README.md](./backend/README.md) - Documentação do backend
- [GUIA_DEPLOY.md](./docsmeus/GUIA_DEPLOY.md) - Como fazer deploy

---

## 🎯 Próximos Passos

### Desenvolvimento
- [ ] Testar todas as funcionalidades
- [ ] Adicionar testes de integração
- [ ] Melhorar tratamento de erros

### Produção
- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar HTTPS
- [ ] Deploy do backend
- [ ] Deploy do frontend

---

## 👥 Usuários de Teste

Após rodar `npm run prisma:seed`:

### Administradores
- admin@eniac.edu.br / admin123
- patricia.almeida@eniac.edu.br / admin123

### Gestores
- joao.silva@eniac.edu.br / senha123
- maria.santos@eniac.edu.br / senha123
- roberto.ferreira@eniac.edu.br / senha123

### Colaboradores
- ana.costa@eniac.edu.br / senha123
- carlos.oliveira@eniac.edu.br / senha123
- bruno.martins@eniac.edu.br / senha123

**Mais usuários disponíveis em:** `backend/prisma/seed.js`

---

## 📞 Suporte

Em caso de dúvidas:
1. Consultar documentação
2. Verificar logs do backend
3. Verificar console do navegador
4. Revisar este changelog

---

**Migração realizada com sucesso! ✅**
