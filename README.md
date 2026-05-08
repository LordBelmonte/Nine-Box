# Portal de Avaliação de Desempenho - ENIAC

Sistema completo de avaliação de desempenho com avaliações 180° e 360°, Nine Box e gestão de competências.

## 🎯 Status do Projeto

✅ **Backend Real Conectado** - Sistema migrado de dados mock para PostgreSQL

## 📋 Visão Geral

Este projeto consiste em:

- **Frontend:** HTML, CSS e JavaScript puro (Vanilla JS)
- **Backend:** Node.js + Express + Prisma
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Tokens)

## 🚀 Quick Start

### 1. Iniciar o Backend

```bash
cd backend
npm install
npm run dev
```

Backend estará disponível em: **http://localhost:3000**

### 2. Popular o Banco de Dados

```bash
cd backend
npm run prisma:seed
```

### 3. Acessar o Frontend

Abrir no navegador: `frontend-ref/pages/login.html`

**Usuários de teste:**
- Admin: `admin@eniac.edu.br` / `admin123`
- Gestor: `joao.silva@eniac.edu.br` / `senha123`
- Colaborador: `ana.costa@eniac.edu.br` / `senha123`

## 📁 Estrutura do Projeto

```
myversion/
├── backend/                    # Backend Node.js + Express
│   ├── src/
│   │   ├── modules/           # Módulos da aplicação
│   │   │   ├── users/         # Usuários
│   │   │   ├── evaluations/   # Avaliações
│   │   │   ├── competencies/  # Competências
│   │   │   ├── ninebox/       # Nine Box
│   │   │   └── reports/       # Relatórios
│   │   ├── middlewares/       # Middlewares (auth, validate, etc.)
│   │   ├── config/            # Configurações
│   │   └── utils/             # Utilitários
│   ├── prisma/                # Schema e migrations
│   └── README.md              # Documentação do backend
│
├── frontend-ref/              # Frontend (HTML, CSS, JS)
│   ├── pages/                 # Páginas HTML
│   ├── js/                    # JavaScript
│   │   ├── api.js            # Cliente HTTP
│   │   ├── auth.js           # Autenticação
│   │   ├── config.js         # Configurações
│   │   └── mockData.js       # Dados mock (referência)
│   └── css/                   # Estilos
│
└── docsmeus/                  # Documentação
    ├── GUIA_COMPLETO.md       # Guia completo do sistema
    ├── GUIA_MOCK_TO_REAL.md   # Migração mock → real
    ├── GUIA_DEPLOY.md         # Deploy
    ├── GUIA_EVALUATIONS.md    # API de Avaliações
    ├── GUIA_NINEBOX.md        # API Nine Box
    ├── GUIA_COMPETENCIES.md   # API de Competências
    └── GUIA_REPORTS.md        # API de Relatórios
```

## 📚 Documentação

### Guias Principais

- **[GUIA_COMPLETO.md](docsmeus/GUIA_COMPLETO.md)** - Como fazer o projeto do zero
- **[GUIA_MOCK_TO_REAL.md](docsmeus/GUIA_MOCK_TO_REAL.md)** - Migração de mock para backend real
- **[GUIA_DEPLOY.md](docsmeus/GUIA_DEPLOY.md)** - Como fazer deploy

### Guias de API

- **[GUIA_EVALUATIONS.md](docsmeus/GUIA_EVALUATIONS.md)** - API de Avaliações
- **[GUIA_NINEBOX.md](docsmeus/GUIA_NINEBOX.md)** - API Nine Box
- **[GUIA_COMPETENCIES.md](docsmeus/GUIA_COMPETENCIES.md)** - API de Competências
- **[GUIA_REPORTS.md](docsmeus/GUIA_REPORTS.md)** - API de Relatórios

### Changelog

- **[CHANGELOG_MOCK_TO_REAL.md](CHANGELOG_MOCK_TO_REAL.md)** - Mudanças da migração
- **[RESUMO_MIGRACAO.txt](RESUMO_MIGRACAO.txt)** - Resumo visual da migração

## 🔧 Configuração

### Backend (.env)

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="seu_secret_aqui"
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

### Frontend (config.js)

```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  TOKEN_KEY: 'portal_token',
  USER_KEY: 'portal_user',
  DARK_MODE_KEY: 'darkMode',
};
```

## ✅ Funcionalidades

### Avaliações
- ✅ Avaliação 180° (Gestor → Colaborador)
- ✅ Avaliação 360° (Colaborador → Gestor)
- ✅ Avaliações anônimas
- ✅ Critérios personalizáveis
- ✅ Comentários opcionais

### Nine Box
- ✅ Matriz 3x3 (Performance x Potencial)
- ✅ Visualização gráfica
- ✅ Histórico de posições
- ✅ Distribuição por quadrante

### Competências
- ✅ Gestão de competências
- ✅ Tipos: Técnica, Comportamental, Liderança, Desempenho
- ✅ CRUD completo

### Relatórios
- ✅ Dashboard geral
- ✅ Relatórios por usuário
- ✅ Relatórios por equipe
- ✅ Exportação de dados

### Usuários
- ✅ Cadastro e autenticação
- ✅ Perfis: Admin, Gestor, Colaborador
- ✅ Gestão de permissões
- ✅ Perfil de usuário

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Senhas criptografadas (bcrypt)
- ✅ Validação de dados (Joi)
- ✅ Proteção CORS
- ✅ Helmet.js para headers de segurança
- ✅ Middleware de autenticação

## 🧪 Testes

### Verificar Health Check

```bash
curl http://localhost:3000/health
```

### Testar Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eniac.edu.br","senha":"admin123"}'
```

## 🐛 Troubleshooting

### Erro: "Servidor indisponível"

```bash
# Verificar se backend está rodando
curl http://localhost:3000/health

# Iniciar backend
cd backend
npm run dev
```

### Erro: "Usuário não encontrado"

```bash
# Popular banco de dados
cd backend
npm run prisma:seed
```

### Erro: "Token inválido"

- Fazer logout e login novamente
- Limpar localStorage do navegador (F12 → Application → Local Storage)

**Mais soluções:** [GUIA_MOCK_TO_REAL.md](docsmeus/GUIA_MOCK_TO_REAL.md) → Seção Troubleshooting

## 📊 Tecnologias

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Bcrypt
- Joi

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Fetch API

## 🎯 Próximos Passos

### Desenvolvimento
- [ ] Adicionar testes automatizados
- [ ] Implementar upload de fotos
- [ ] Adicionar notificações
- [ ] Melhorar UI/UX

### Produção
- [ ] Configurar HTTPS
- [ ] Deploy do backend
- [ ] Deploy do frontend
- [ ] Configurar domínio

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é privado e de uso educacional.

## 📞 Suporte

Em caso de dúvidas:
1. Consultar documentação em `docsmeus/`
2. Verificar logs do backend
3. Verificar console do navegador (F12)

---

**Desenvolvido para ENIAC** | Versão 1.0.0 | 2024
