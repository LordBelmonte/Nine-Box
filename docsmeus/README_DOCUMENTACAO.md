# 📚 Documentação do Sistema de Avaliações 360°

## 🎯 Visão Geral

Este repositório contém a documentação completa para construir um **sistema de avaliações 360°** do zero, incluindo correções de bugs reais encontrados em produção.

---

## 🚀 Início Rápido

### Para Iniciantes (Construir do Zero)
1. Leia o **[INDICE_TUTORIAL_COMPLETO.md](./INDICE_TUTORIAL_COMPLETO.md)**
2. Comece pela **[PARTE1_SETUP_INICIAL.md](./PARTE1_SETUP_INICIAL.md)**
3. Siga em ordem até completar todas as partes

### Para Desenvolvedores (Corrigir Bugs)
1. Leia o **[RESUMO_CORRECOES.md](./RESUMO_CORRECOES.md)**
2. Aplique as correções do **[GUIA_BUGFIX_AVALIACOES.md](./GUIA_BUGFIX_AVALIACOES.md)**
3. Teste as mudanças

### Para Referência Rápida
Use os guias específicos:
- **[GUIA_COMPETENCIES.md](./GUIA_COMPETENCIES.md)** - Sistema de competências
- **[GUIA_EVALUATIONS.md](./GUIA_EVALUATIONS.md)** - Sistema de avaliações
- **[GUIA_NINEBOX.md](./GUIA_NINEBOX.md)** - Matriz nine-box
- **[GUIA_REPORTS.md](./GUIA_REPORTS.md)** - Relatórios

---

## 📖 Documentação Disponível

### 🎓 Tutorial Completo (Passo a Passo)

| Parte | Título | Status | Tempo | Dificuldade |
|-------|--------|--------|-------|-------------|
| 1 | Setup Inicial | ✅ | 15-20 min | ⭐ |
| 2 | Schema do Banco | ✅ | 20-30 min | ⭐⭐ |
| 3 | Estrutura Backend | ✅ | 30-40 min | ⭐⭐ |
| 4 | Módulo Users | 🚧 | 40-50 min | ⭐⭐⭐ |
| 5 | Módulo Evaluations | 🚧 | 50-60 min | ⭐⭐⭐ |
| 6 | Módulo Competencies | 🚧 | 30-40 min | ⭐⭐ |
| 7 | Módulo Nine-Box | 🚧 | 40-50 min | ⭐⭐⭐ |
| 8 | Módulo Reports | 🚧 | 30-40 min | ⭐⭐ |
| 9 | Correção de Bugs | ✅ | 20-30 min | ⭐⭐⭐ |
| 10 | Deploy | 🚧 | 40-50 min | ⭐⭐⭐ |

**Tempo total estimado:** 5-6 horas

---

### 🐛 Correções de Bugs

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **GUIA_BUGFIX_AVALIACOES.md** | Análise completa dos bugs e correções | Entender os problemas em detalhes |
| **RESUMO_CORRECOES.md** | Resumo executivo das correções | Referência rápida |

**Bugs corrigidos:**
1. ✅ Histórico de avaliações incompleto
2. ✅ Permissões de avaliação 360° (já estava correto)

---

### 📚 Guias de Referência

| Guia | Descrição | Quando Usar |
|------|-----------|-------------|
| **GUIA_COMPLETO.md** | Visão geral do sistema | Entender arquitetura |
| **GUIA_COMPETENCIES.md** | Sistema de competências | Implementar competências |
| **GUIA_EVALUATIONS.md** | Sistema de avaliações | Implementar avaliações |
| **GUIA_NINEBOX.md** | Matriz nine-box | Implementar nine-box |
| **GUIA_REPORTS.md** | Sistema de relatórios | Implementar relatórios |
| **GUIA_DEPLOY.md** | Deploy em produção | Fazer deploy |
| **GUIA_MOCK_TO_REAL.md** | Migração mock → real | Migrar dados |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE AVALIAÇÕES 360°                │
└─────────────────────────────────────────────────────────────┘

Frontend (HTML/CSS/JS)
    ↓
Backend (Express + Node.js)
    ├── Autenticação (JWT)
    ├── Módulo Users
    ├── Módulo Evaluations (180° e 360°)
    ├── Módulo Competencies
    ├── Módulo Nine-Box
    └── Módulo Reports
    ↓
Banco de Dados (PostgreSQL + Prisma ORM)
    ├── users
    ├── evaluations
    ├── competencies
    ├── nine_boxes
    └── reports
```

---

## 🎯 Funcionalidades Principais

### ✅ Autenticação e Autorização
- Login/Logout com JWT
- 3 tipos de usuário: Admin, Gestor, Colaborador
- Controle de acesso por rota (RBAC)

### ✅ Sistema de Avaliações
- **Avaliação 180°**: Gestor → Colaborador
- **Avaliação 360°**: Colaborador → Gestor, Colaborador → Colaborador, Gestor → Gestor
- Avaliações anônimas por padrão
- Critérios customizáveis
- Comentários opcionais

### ✅ Gestão de Competências
- CRUD completo
- Categorias (técnica, comportamental, liderança)
- Níveis de 1 a 5
- Ativação/desativação

### ✅ Matriz Nine-Box
- Avaliação de desempenho (1-3)
- Avaliação de potencial (1-3)
- 9 quadrantes automáticos
- Histórico de avaliações

### ✅ Relatórios
- Relatórios de avaliações
- Relatórios de competências
- Relatórios nine-box
- Exportação JSON

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** v18+ - Runtime JavaScript
- **Express** v5 - Framework web
- **Prisma** v6 - ORM
- **PostgreSQL** v14+ - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Joi** - Validação de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-origin requests

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização
- **JavaScript** - Lógica
- **Choices.js** - Select customizado

---

## 📊 Estrutura de Arquivos

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   ├── seed.js                # Dados iniciais
│   └── migrations/            # Migrações
├── src/
│   ├── config/
│   │   └── database.js        # Config Prisma
│   ├── middlewares/
│   │   ├── auth.js            # Autenticação
│   │   ├── errorHandler.js   # Erros
│   │   └── validate.js        # Validação
│   ├── modules/
│   │   ├── users/             # CRUD usuários
│   │   ├── evaluations/       # Avaliações
│   │   ├── competencies/      # Competências
│   │   ├── ninebox/           # Nine-box
│   │   └── reports/           # Relatórios
│   ├── utils/
│   │   └── errors.js          # Classes de erro
│   └── app.js                 # Config Express
├── server.js                  # Entry point
├── .env                       # Variáveis
└── package.json               # Dependências

docsmeus/
├── INDICE_TUTORIAL_COMPLETO.md    # Índice geral
├── PARTE1_SETUP_INICIAL.md        # Setup
├── PARTE2_SCHEMA_BANCO.md         # Banco
├── PARTE3_ESTRUTURA_BACKEND.md    # Backend
├── GUIA_BUGFIX_AVALIACOES.md      # Bugfix
├── RESUMO_CORRECOES.md            # Resumo
└── [outros guias...]              # Referências
```

---

## 🚀 Como Começar

### 1. Clone o Repositório
```bash
git clone <url-do-repo>
cd backend
```

### 2. Instale Dependências
```bash
npm install
```

### 3. Configure o Banco
```bash
# Edite o .env com suas credenciais
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Crie as tabelas
npm run prisma:migrate

# Popule com dados iniciais
npm run prisma:seed
```

### 4. Inicie o Servidor
```bash
npm run dev
```

### 5. Teste a API
```bash
curl http://localhost:3000/health
```

---

## 🧪 Testes

### Credenciais de Teste
```
Admin:
  Email: admin@empresa.com
  Senha: senha123

Gestor:
  Email: joao.silva@empresa.com
  Senha: senha123

Colaborador:
  Email: ana.costa@empresa.com
  Senha: senha123
```

### Endpoints Principais
```
POST   /api/auth/login           # Login
POST   /api/auth/register        # Registro
GET    /api/users                # Listar usuários
POST   /api/evaluations          # Criar avaliação
GET    /api/evaluations          # Listar avaliações
GET    /api/competencies         # Listar competências
POST   /api/ninebox              # Criar nine-box
GET    /api/reports              # Listar relatórios
```

---

## 🐛 Bugs Conhecidos e Correções

### ✅ Bug #1: Histórico Incompleto (CORRIGIDO)
**Problema:** Usuários não viam todas as avaliações no histórico.  
**Solução:** Removido filtro por tipo de avaliação no método `findAll()`.  
**Arquivo:** `backend/src/modules/evaluations/evaluation.service.js`

### ✅ Bug #2: Permissão 360° (JÁ ESTAVA CORRETO)
**Problema:** Colaboradores não conseguiam criar avaliações 360°.  
**Solução:** Lógica já estava correta, não foi necessária correção.

**Detalhes:** Veja `GUIA_BUGFIX_AVALIACOES.md`

---

## 📈 Roadmap

### ✅ Concluído
- [x] Setup inicial
- [x] Schema do banco
- [x] Estrutura backend
- [x] Correção de bugs

### 🚧 Em Desenvolvimento
- [ ] Módulo Users completo
- [ ] Módulo Evaluations completo
- [ ] Módulo Competencies completo
- [ ] Módulo Nine-Box completo
- [ ] Módulo Reports completo
- [ ] Guia de deploy

### 📋 Planejado
- [ ] Testes automatizados
- [ ] CI/CD
- [ ] Docker
- [ ] Documentação API (Swagger)
- [ ] Logs estruturados
- [ ] Monitoramento

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

## 📞 Suporte

- 📖 Documentação: Veja os guias em `docsmeus/`
- 🐛 Bugs: Abra uma issue no GitHub
- 💬 Dúvidas: Consulte o `INDICE_TUTORIAL_COMPLETO.md`

---

## 🎓 Recursos Adicionais

### Documentação Oficial
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [JWT](https://jwt.io/)

### Tutoriais Recomendados
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Design](https://restfulapi.net/)
- [SQL Tutorial](https://www.sqltutorial.org/)

---

## ⭐ Agradecimentos

Obrigado por usar esta documentação! Se foi útil, considere dar uma estrela ⭐

---

**Última atualização:** 2026-05-08  
**Versão:** 1.0  
**Autor:** Sistema de Documentação Automática  
**Status:** ✅ Documentação Ativa
