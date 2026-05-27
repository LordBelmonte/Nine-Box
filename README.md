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

```env
PORT=3000
DIRECT_URL="postgresql://usuario:senha@localhost:5432/nome_banco"
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_banco"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
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
│   ├── .env.example          # Exemplo de configuração
│   └── README.md
│
├── frontend-ref/              # Interface
│   ├── pages/                 # Páginas HTML
│   ├── js/                    # Scripts
│   └── css/                   # Estilos
│
└── docsmeus/                  # Docs
```

## Documentação

### Tutorial Completo (Passo a Passo)

1. `PARTE1_SETUP_INICIAL.md` - Instalar Node, PostgreSQL e criar projeto
2. `PARTE2_SCHEMA_BANCO.md` - Criar schema do banco e popular dados
3. `PARTE3_ESTRUTURA_BACKEND.md` - Configurar Express, middlewares e estrutura
4. `PARTE4_MODULOS_BACKEND.md` - Criar todos os módulos (users, evaluations, etc)

### Guias de Referência

- `GUIA_COMPLETO.md` - Visão geral do sistema
- `GUIA_MOCK_TO_REAL.md` - Migração mock → real
- `GUIA_DEPLOY.md` - Deploy em produção
- `GUIA_EVALUATIONS.md` - API de Avaliações
- `GUIA_NINEBOX.md` - API Nine Box
- `GUIA_COMPETENCIES.md` - API de Competências
- `GUIA_REPORTS.md` - API de Relatórios

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
