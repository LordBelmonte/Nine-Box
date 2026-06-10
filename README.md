# Portal de Avaliação de Desempenho - ENIAC

Sistema de avaliação de desempenho com avaliações 180° e 360°, Nine Box e gestão de competências.

## Status

Backend conectado ao PostgreSQL. Sistema funcionando com dados reais.

## Como rodar após clonar do GitHub

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd nineboxfix
```

### 2. Configurar Backend

```bash
cd backend
```

#### 2.1 Instalar dependências

```bash
npm install
```

#### 2.2 Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações do PostgreSQL:

**Opção 1: PostgreSQL Local (Recomendado para desenvolvimento)**

```env
PORT=3000
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/ninebox"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ninebox"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

**Opção 2: Supabase (Se tiver conta)**

```env
PORT=3000
DIRECT_URL="postgresql://postgres:SUA_SENHA@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
DATABASE_URL="postgresql://postgres:SUA_SENHA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

**Para usar PostgreSQL Local:**

1. Instale PostgreSQL: https://www.postgresql.org/download/
2. Crie um banco de dados:
   ```bash
   # No Windows (psql):
   createdb ninebox
   
   # Ou usando pgAdmin:
   # Crie um banco de dados chamado "ninebox"
   ```

#### 2.3 Rodar migrations do Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### 2.4 Popular o banco com dados de teste

```bash
npm run prisma:seed
```

#### 2.5 Iniciar o backend

```bash
npm run dev
```

O backend rodará em http://localhost:3000

### 3. Configurar Frontend

O frontend é estático e não precisa de instalação. Basta abrir no navegador:

```bash
# Opção 1: Abrir diretamente no navegador
# Navegue para: frontend-ref/pages/login.html

# Opção 2: Usar um servidor estático (recomendado)
# Com Python 3:
cd frontend-ref
python -m http.server 5500

# Com Node.js (http-server):
npx http-server -p 5500
```

Acesse: http://localhost:5500/pages/login.html

### 4. Usuários de teste

- **Admin**: `admin@eniac.edu.br` / `admin123`
- **Gestor TI**: `joao@eniac.edu.br` / `senha123`
- **Gestor RH**: `maria@eniac.edu.br` / `senha123`
- **Colaboradores**: `ana@eniac.edu.br`, `pedro@eniac.edu.br`, `carla@eniac.edu.br`, `lucas@eniac.edu.br`, `beatriz@eniac.edu.br` / `senha123`

## Estrutura

```
nineboxfix/
├── backend/                    # API Node.js
│   ├── src/modules/           # Módulos (users, evaluations, etc)
│   ├── prisma/                # Schema e migrations
│   ├── scripts/               # Scripts auxiliares
│   ├── .env.example          # Exemplo de configuração
│   ├── server.js              # Entry point do servidor
│   └── package.json
│
├── frontend-ref/              # Interface
│   ├── pages/                 # Páginas HTML
│   ├── js/                    # Scripts
│   ├── css/                   # Estilos
│   ├── index.html             # Página inicial
│   └── perfil.html            # Página de perfil
│
├── CHANGELOG_MOCK_TO_REAL.md  # Histórico de mudanças
└── README.md                  # Este arquivo
```

## Documentação

### Histórico de Mudanças

- `CHANGELOG_MOCK_TO_REAL.md` - Histórico detalhado da migração de mock para dados reais

## Funcionalidades

- Avaliação 180° (Gestor → Colaborador)
- Avaliação 360° (Colaborador → Gestor)
- Nine Box (Performance x Potencial)
- Gestão de competências
- Relatórios e dashboard
- Upload de fotos de perfil
- Exportação de dados (CSV)

## Problemas comuns

**Servidor indisponível**
```bash
cd backend
npm run dev
```

**Usuário não encontrado**
```bash
cd backend
npm run prisma:seed
```

**Token inválido**
- Fazer logout e login de novo
- Limpar localStorage (F12 → Application → Local Storage)

**Erro de conexão com banco**
- Verifique se o PostgreSQL está rodando
- Verifique as credenciais no arquivo `.env`
- Verifique se o banco de dados existe

## Tech Stack

Backend: Node.js, Express, Prisma, PostgreSQL, JWT, Bcrypt
Frontend: HTML, CSS, JavaScript

## Licença

Projeto educacional - ENIAC

---

v1.0.0 | 2024
