# 🚀 Parte 1: Setup Inicial do Backend

## 📋 Pré-requisitos

Antes de começar, instale:
- **Node.js** (v18 ou superior)
- **PostgreSQL** (v14 ou superior)
- **npm** ou **yarn**
- **Git**

---

## 🎯 Estrutura do Projeto

Vamos criar um backend com esta estrutura:

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.js                # Dados iniciais
│   └── migrations/            # Histórico de migrações
├── src/
│   ├── config/
│   │   └── database.js        # Configuração do Prisma
│   ├── middlewares/
│   │   ├── auth.js            # Autenticação JWT
│   │   ├── errorHandler.js   # Tratamento de erros
│   │   └── validate.js        # Validação de dados
│   ├── modules/
│   │   ├── users/             # Módulo de usuários
│   │   ├── evaluations/       # Módulo de avaliações
│   │   ├── competencies/      # Módulo de competências
│   │   ├── ninebox/           # Módulo nine-box
│   │   └── reports/           # Módulo de relatórios
│   ├── utils/
│   │   └── errors.js          # Classes de erro customizadas
│   └── app.js                 # Configuração do Express
├── server.js                  # Ponto de entrada
├── .env                       # Variáveis de ambiente
├── .gitignore                 # Arquivos ignorados pelo Git
└── package.json               # Dependências do projeto
```

---

## 📦 Passo 1: Criar o Projeto

```bash
# Criar pasta do projeto
mkdir backend
cd backend

# Inicializar projeto Node.js
npm init -y

# Configurar como módulo ES6
npm pkg set type="module"
```

---

## 📦 Passo 2: Instalar Dependências

### Dependências de Produção

```bash
npm install express@5.2.1
npm install @prisma/client@6.19.3
npm install bcryptjs@3.0.3
npm install jsonwebtoken@9.0.3
npm install joi@18.2.1
npm install cors@2.8.6
npm install helmet@8.1.0
npm install dotenv@17.4.2
```

**O que cada uma faz:**
- `express` - Framework web
- `@prisma/client` - ORM para banco de dados
- `bcryptjs` - Hash de senhas
- `jsonwebtoken` - Autenticação JWT
- `joi` - Validação de dados
- `cors` - Permitir requisições cross-origin
- `helmet` - Segurança HTTP
- `dotenv` - Variáveis de ambiente

### Dependências de Desenvolvimento

```bash
npm install -D prisma@6.19.3
npm install -D nodemon@3.1.14
```

**O que cada uma faz:**
- `prisma` - CLI do Prisma
- `nodemon` - Reinicia servidor automaticamente

---

## 📦 Passo 3: Configurar package.json

Edite o arquivo `package.json` e adicione os scripts:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@prisma/client": "6.19.3",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "helmet": "^8.1.0",
    "joi": "^18.2.1",
    "jsonwebtoken": "^9.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.14",
    "prisma": "6.19.3"
  }
}
```

---

## 🗄️ Passo 4: Configurar PostgreSQL

### Opção 1: PostgreSQL Local

```bash
# Criar banco de dados
psql -U postgres
CREATE DATABASE avaliacao_db;
\q
```

### Opção 2: PostgreSQL via Docker

```bash
docker run --name postgres-avaliacao \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=avaliacao_db \
  -p 5432:5432 \
  -d postgres:14
```

---

## 🔐 Passo 5: Criar arquivo .env

Crie o arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/avaliacao_db?schema=public"

# JWT
JWT_SECRET="seu-secret-super-seguro-aqui-mude-em-producao"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV="development"
```

**⚠️ IMPORTANTE:**
- Nunca commite o arquivo `.env` no Git!
- Em produção, use secrets managers (AWS Secrets, Azure Key Vault, etc.)
- Gere um JWT_SECRET forte: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 🚫 Passo 6: Criar .gitignore

Crie o arquivo `.gitignore`:

```gitignore
# Dependências
node_modules/

# Variáveis de ambiente
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# Sistema operacional
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build
dist/
build/
```

---

## 🗄️ Passo 7: Inicializar Prisma

```bash
# Inicializar Prisma
npx prisma init

# Isso cria:
# - prisma/schema.prisma
# - .env (se não existir)
```

---

## ✅ Verificação

Neste ponto, você deve ter:

```
backend/
├── node_modules/          ✅
├── prisma/
│   └── schema.prisma      ✅
├── .env                   ✅
├── .gitignore             ✅
└── package.json           ✅
```

---

## 🎯 Próximos Passos

Continue para **PARTE2_SCHEMA_BANCO.md** para:
1. Criar o schema do banco de dados
2. Definir os modelos (User, Evaluation, etc.)
3. Criar as migrações
4. Popular o banco com dados iniciais

---

**Tempo estimado:** 15-20 minutos  
**Dificuldade:** ⭐ Fácil
