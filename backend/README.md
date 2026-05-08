# Backend - Sistema de Gestão de Pessoas com Avaliações

Backend completo do sistema de gestão de pessoas com avaliações anônimas e bidirecionais (180° e 360°).

## 🚀 Tecnologias

- **Node.js** + **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **Joi** - Validação de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

## 🔧 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
DIRECT_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="seu_secret_super_seguro_aqui"
JWT_EXPIRES_IN=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

3. **Gerar Prisma Client:**
```bash
npm run prisma:generate
```

4. **Rodar migrations:**
```bash
npm run prisma:migrate
```

5. **Popular banco com dados de exemplo:**
```bash
npm run prisma:seed
```

## 🎯 Executar

### Desenvolvimento (com hot reload):
```bash
npm run dev
```

### Produção:
```bash
npm start
```

O servidor estará rodando em: `http://localhost:3000`

## 📊 Usuários de Teste

Após rodar o seed, você terá os seguintes usuários:

| Email | Senha | Tipo |
|-------|-------|------|
| admin@eniac.edu.br | admin123 | Admin |
| joao@eniac.edu.br | senha123 | Gestor |
| maria@eniac.edu.br | senha123 | Gestor |
| ana@eniac.edu.br | senha123 | Colaborador |
| pedro@eniac.edu.br | senha123 | Colaborador |
| carla@eniac.edu.br | senha123 | Colaborador |
| lucas@eniac.edu.br | senha123 | Colaborador |
| juliana@eniac.edu.br | senha123 | Colaborador |

## 📚 Estrutura do Projeto

```
backend/
├── prisma/
│   ├── migrations/          # Migrations do banco
│   ├── schema.prisma        # Schema do Prisma
│   └── seed.js             # Dados de exemplo
├── src/
│   ├── config/
│   │   └── database.js     # Configuração do Prisma
│   ├── middlewares/
│   │   ├── auth.js         # Autenticação JWT
│   │   ├── errorHandler.js # Tratamento de erros
│   │   └── validate.js     # Validação com Joi
│   ├── modules/
│   │   ├── users/          # Módulo de usuários
│   │   ├── evaluations/    # Módulo de avaliações
│   │   ├── competencies/   # Módulo de competências
│   │   ├── ninebox/        # Módulo Nine Box
│   │   └── reports/        # Módulo de relatórios
│   ├── utils/
│   │   └── errors.js       # Classe de erros customizados
│   └── app.js              # Configuração do Express
├── server.js               # Entrada da aplicação
├── .env                    # Variáveis de ambiente
└── package.json
```

## 🔐 Autenticação

Todas as rotas (exceto `/api/users/login`) requerem autenticação via JWT.

**Header de autenticação:**
```
Authorization: Bearer SEU_TOKEN_JWT
```

## 📡 Endpoints Principais

### Users
- `POST /api/users/login` - Login
- `POST /api/users/register` - Cadastrar usuário (admin)
- `GET /api/users/profile` - Ver perfil
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users` - Listar usuários (gestor/admin)
- `GET /api/users/:id` - Buscar por ID
- `GET /api/users/ra/:ra` - Buscar por RA
- `DELETE /api/users/:id` - Deletar (admin)

### Evaluations (Sistema Anônimo)
- `POST /api/evaluations` - Criar avaliação anônima
- `GET /api/evaluations` - Listar avaliações (filtrado por tipo)
- `GET /api/evaluations/:id` - Buscar por ID
- `GET /api/evaluations/avaliado/:avaliadoId` - Por avaliado
- `GET /api/evaluations/avaliador/:avaliadorId` - Por avaliador
- `GET /api/evaluations/stats/avaliado/:avaliadoId` - Estatísticas
- `PUT /api/evaluations/:id` - Atualizar (24h limit)
- `DELETE /api/evaluations/:id` - Deletar (24h limit)

### Competencies
- `POST /api/competencies` - Criar (admin)
- `GET /api/competencies` - Listar
- `GET /api/competencies/:id` - Buscar por ID
- `GET /api/competencies/tipo/:tipo` - Por tipo
- `GET /api/competencies/competencia-de/:competenciaDe` - Por competenciaDe
- `GET /api/competencies/stats` - Estatísticas
- `PUT /api/competencies/:id` - Atualizar (admin)
- `DELETE /api/competencies/:id` - Deletar (admin)

### Nine Box
- `POST /api/evaluations/nine-box` - Criar (gestor/admin)
- `GET /api/evaluations/nine-box` - Listar
- `GET /api/evaluations/nine-box/:id` - Buscar por ID
- `GET /api/evaluations/nine-box/pessoa/:pessoaId` - Por pessoa
- `GET /api/evaluations/nine-box/pessoa/:pessoaId/latest` - Última avaliação
- `GET /api/evaluations/nine-box/stats/distribution` - Distribuição
- `GET /api/evaluations/nine-box/stats/tipo` - Por tipo (admin)
- `PUT /api/evaluations/nine-box/:id` - Atualizar (gestor/admin)
- `DELETE /api/evaluations/nine-box/:id` - Deletar (admin)

### Reports
- `GET /api/reports/dashboard` - Dashboard geral (gestor/admin)
- `GET /api/reports/user/:userId` - Relatório de usuário
- `GET /api/reports/team/:gestorId` - Relatório de equipe
- `GET /api/reports/export/:userId` - Exportar dados

## 🔒 Sistema de Avaliações Anônimas

### Características:
- ✅ **Avaliações bidirecionais**: Gestor ↔ Colaborador
- ✅ **Sistema anônimo**: `avaliadorId` salvo mas NÃO retornado
- ✅ **Tipos automáticos**: Sistema determina o tipo baseado nos usuários
- ✅ **Limite de 24h**: Editar/deletar apenas nas primeiras 24h (exceto admin)
- ✅ **Admin vê tudo**: Incluindo `avaliadorId` para auditoria

### Tipos de Avaliação:
- `gestor_para_colaborador` - Avaliação 180°
- `colaborador_para_gestor` - Avaliação 360°
- `avaliacao_360` - Admin avalia qualquer um

### Visibilidade por Tipo:
| Tipo | Vê 180° | Vê 360° | Vê Admin | Vê avaliadorId |
|------|---------|---------|----------|----------------|
| Colaborador | ❌ | ✅ | ❌ | ❌ |
| Gestor | ✅ | ❌ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Prisma
npm run prisma:generate    # Gerar Prisma Client
npm run prisma:migrate     # Rodar migrations
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:seed        # Popular banco
```

## 📝 Padrão de Arquitetura

Cada módulo segue o padrão:

```
module/
├── module.validation.js   # Validações com Joi
├── module.repository.js   # Queries do Prisma
├── module.service.js      # Lógica de negócio
├── module.controller.js   # Handlers HTTP
└── module.routes.js       # Definição de rotas
```

## 🔍 Health Check

```bash
GET http://localhost:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2026-05-05T21:30:00.000Z"
}
```

## 📖 Documentação Completa

Consulte os guias em `/docsmeus`:
- `GUIA_COMPLETO.md` - Guia completo do projeto
- `GUIA_EVALUATIONS.md` - Sistema de avaliações
- `GUIA_COMPETENCIES.md` - Competências
- `GUIA_NINEBOX.md` - Nine Box
- `GUIA_REPORTS.md` - Relatórios

## 🐛 Troubleshooting

### Erro de conexão com banco:
Verifique se o PostgreSQL está rodando e se as credenciais no `.env` estão corretas.

### Erro "P2021 - Table does not exist":
Rode as migrations:
```bash
npm run prisma:migrate
```

### Erro "Token inválido":
Faça login novamente para obter um novo token JWT.

## 📄 Licença

Este projeto é parte do sistema de Gestão de Pessoas com Avaliações.
