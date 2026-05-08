# Portal de Avaliação de Desempenho - ENIAC

Sistema de avaliação de desempenho com avaliações 180° e 360°, Nine Box e gestão de competências.

## Status

Backend conectado ao PostgreSQL. Sistema funcionando com dados reais.

## O que é

Projeto com:
- Frontend: HTML, CSS e JavaScript
- Backend: Node.js + Express + Prisma
- Banco: PostgreSQL
- Auth: JWT

## Como rodar

### Backend

```bash
cd backend
npm install
npm run dev
```

Vai rodar em http://localhost:3000

### Popular o banco

```bash
cd backend
npm run prisma:seed
```

### Frontend

Abrir no navegador: `frontend-ref/pages/login.html`

Usuários de teste:
- Admin: `admin@eniac.edu.br` / `admin123`
- Gestor: `joao.silva@eniac.edu.br` / `senha123`
- Colaborador: `ana.costa@eniac.edu.br` / `senha123`

## Estrutura

```
myversion/
├── backend/                    # API Node.js
│   ├── src/modules/           # Módulos (users, evaluations, etc)
│   ├── prisma/                # Schema e migrations
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

## Configuração

### Backend (.env)

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="seu_secret"
JWT_EXPIRES_IN=30d
```

### Frontend (config.js)

```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  TOKEN_KEY: 'portal_token',
  USER_KEY: 'portal_user',
};
```

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

## Tech Stack

Backend: Node.js, Express, Prisma, PostgreSQL, JWT, Bcrypt
Frontend: HTML, CSS, JavaScript

## Licença

Projeto educacional - ENIAC

---

v1.0.0 | 2024
