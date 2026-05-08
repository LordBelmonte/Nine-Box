# Parte 1: Setup Inicial do Backend

## O que você precisa ter instalado

- Node.js (v18 ou mais novo)
- PostgreSQL (v14 ou mais novo)
- npm ou yarn
- Git

## Estrutura que vamos criar

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   ├── seed.js                # Dados iniciais
│   └── migrations/            # Histórico de mudanças no banco
├── src/
│   ├── config/
│   │   └── database.js        # Config do Prisma
│   ├── middlewares/
│   │   ├── auth.js            # JWT
│   │   ├── errorHandler.js   # Erros
│   │   └── validate.js        # Validações
│   ├── modules/
│   │   ├── users/             # Usuários
│   │   ├── evaluations/       # Avaliações
│   │   ├── competencies/      # Competências
│   │   ├── ninebox/           # Nine Box
│   │   └── reports/           # Relatórios
│   ├── utils/
│   │   └── errors.js          # Erros customizados
│   └── app.js                 # Config do Express
├── server.js                  # Arquivo principal
├── .env                       # Variáveis de ambiente
├── .gitignore                 
└── package.json               
```

## Passo 1: Criar o projeto

```bash
mkdir backend
cd backend
npm init -y
npm pkg set type="module"
```

## Passo 2: Instalar pacotes

```bash
# Produção
npm install express@5.2.1
npm install @prisma/client@6.19.3
npm install bcryptjs@3.0.3
npm install jsonwebtoken@9.0.3
npm install joi@18.2.1
npm install cors@2.8.6
npm install helmet@8.1.0
npm install dotenv@17.4.2

# Desenvolvimento
npm install -D prisma@6.19.3
npm install -D nodemon@3.1.14
```

O que cada um faz:
- `express` - Framework web
- `@prisma/client` - ORM (conversa com o banco)
- `bcryptjs` - Criptografa senhas
- `jsonwebtoken` - Autenticação
- `joi` - Valida dados
- `cors` - Permite requisições de outros domínios
- `helmet` - Segurança
- `dotenv` - Variáveis de ambiente
- `prisma` - CLI do Prisma
- `nodemon` - Reinicia o servidor automaticamente

## Passo 3: Configurar scripts

Edite `package.json` e adicione os scripts:

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

## Passo 4: Configurar PostgreSQL

### Opção 1: Local

```bash
psql -U postgres
CREATE DATABASE avaliacao_db;
\q
```

### Opção 2: Docker

```bash
docker run --name postgres-avaliacao \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=avaliacao_db \
  -p 5432:5432 \
  -d postgres:14
```

## Passo 5: Criar .env

Crie o arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/avaliacao_db?schema=public"
JWT_SECRET="seu-secret-super-seguro-mude-em-producao"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

**Importante:**
- Nunca suba o `.env` pro Git
- Em produção, use um secret manager
- Gere um JWT_SECRET forte: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Passo 6: Criar .gitignore

```gitignore
node_modules/
.env
.env.local
.env.*.local
logs/
*.log
.DS_Store
Thumbs.db
.vscode/
.idea/
dist/
build/
```

## Passo 7: Inicializar Prisma

```bash
npx prisma init
```

Isso cria `prisma/schema.prisma` e `.env` (se não existir).

## Verificação

Você deve ter:

```
backend/
├── node_modules/          ✓
├── prisma/
│   └── schema.prisma      ✓
├── .env                   ✓
├── .gitignore             ✓
└── package.json           ✓
```

## Próximo passo

Continue na **PARTE2_SCHEMA_BANCO.md** para criar o schema do banco.

Tempo: ~15 minutos
