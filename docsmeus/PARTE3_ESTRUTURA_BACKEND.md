# 🏗️ Parte 3: Estrutura do Backend

## 📋 O que vamos criar

Nesta parte, vamos implementar:
1. Configuração do Express
2. Middlewares (auth, validation, error handling)
3. Utilitários (classes de erro)
4. Estrutura modular

---

## 📁 Passo 1: Criar Estrutura de Pastas

```bash
# Criar todas as pastas de uma vez
mkdir -p src/config
mkdir -p src/middlewares
mkdir -p src/modules/users
mkdir -p src/modules/evaluations
mkdir -p src/modules/competencies
mkdir -p src/modules/ninebox
mkdir -p src/modules/reports
mkdir -p src/utils
```

**Estrutura final:**
```
src/
├── config/
│   └── database.js
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── modules/
│   ├── users/
│   ├── evaluations/
│   ├── competencies/
│   ├── ninebox/
│   └── reports/
├── utils/
│   └── errors.js
└── app.js
```

---

## 🛠️ Passo 2: Criar Utilitários

### Arquivo: `src/utils/errors.js`

```javascript
/**
 * Classe de erro customizada para erros de aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
```

**Por que usar classes de erro customizadas?**
- Padroniza tratamento de erros
- Diferencia erros operacionais de bugs
- Facilita logging e monitoramento

---

## 🗄️ Passo 3: Configurar Database

### Arquivo: `src/config/database.js`

```javascript
import { PrismaClient } from '@prisma/client';

// Criar instância única do Prisma (Singleton)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// Tratamento de erros de conexão
prisma.$connect()
  .then(() => {
    console.log('✅ Conectado ao banco de dados');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao banco:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Desconectado do banco de dados');
});

export { prisma };
```

**Explicação:**
- `PrismaClient()` - Cliente do Prisma
- `log` - Logs apenas em desenvolvimento
- `$connect()` - Conecta ao banco
- `beforeExit` - Desconecta gracefully

---

## 🔐 Passo 4: Criar Middleware de Autenticação

### Arquivo: `src/middlewares/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

/**
 * Middleware de autenticação JWT
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token não fornecido', 401);
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      throw new AppError('Token inválido', 401);
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      throw new AppError('Token mal formatado', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new AppError('Token inválido', 401);
      }

      // Adiciona dados do usuário na requisição
      req.user = decoded;
      return next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar se é admin
 */
const isAdminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return next(new AppError('Acesso negado. Apenas administradores', 403));
  }
  next();
};

/**
 * Middleware para verificar se é gestor ou admin
 */
const isGestorOrAdminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin' && req.user.tipo !== 'gestor') {
    return next(new AppError('Acesso negado. Apenas gestores ou administradores', 403));
  }
  next();
};

export {
  authMiddleware,
  isAdminMiddleware,
  isGestorOrAdminMiddleware
};
```

**Como funciona:**
1. Extrai token do header `Authorization: Bearer <token>`
2. Valida formato do token
3. Verifica assinatura JWT
4. Adiciona `req.user` com dados do usuário
5. Permite acesso à rota

---

## ✅ Passo 5: Criar Middleware de Validação

### Arquivo: `src/middlewares/validate.js`

```javascript
import { AppError } from '../utils/errors.js';

/**
 * Middleware de validação usando Joi
 * @param {Object} schema - Schema Joi para validação
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros
      stripUnknown: true // Remove campos não definidos no schema
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    // Substitui req.body pelos dados validados
    req.body = value;
    next();
  };
};

export { validate };
```

**Por que validar?**
- Previne dados inválidos no banco
- Melhora segurança
- Retorna erros claros para o frontend

---

## 🚨 Passo 6: Criar Middleware de Tratamento de Erros

### Arquivo: `src/middlewares/errorHandler.js`

```javascript
/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // Erros do Prisma
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Registro duplicado. Este valor já existe no banco de dados.';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Registro não encontrado.';
  }

  // Erros de validação JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Log do erro (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erro:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
  }

  // Resposta padronizada
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export { errorHandler };
```

**Códigos de erro Prisma:**
- `P2002` - Unique constraint violation (duplicado)
- `P2025` - Record not found (não encontrado)
- `P2003` - Foreign key constraint failed

---

## 🚀 Passo 7: Configurar Express

### Arquivo: `src/app.js`

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// Segurança HTTP
app.use(helmet());

// CORS (permitir requisições do frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Parse URL-encoded
app.use(express.urlencoded({ extended: true }));

// Log de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROTAS
// ============================================

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API (vamos adicionar depois)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/evaluations', evaluationRoutes);
// app.use('/api/competencies', competencyRoutes);
// app.use('/api/ninebox', nineboxRoutes);
// app.use('/api/reports', reportRoutes);

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de erro global
app.use(errorHandler);

export { app };
```

---

## 🎯 Passo 8: Criar Servidor

### Arquivo: `server.js` (raiz do projeto)

```javascript
import 'dotenv/config';
import { app } from './src/app.js';
import { prisma } from './src/config/database.js';

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recebido. Encerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('👋 Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT recebido. Encerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('👋 Servidor encerrado');
    process.exit(0);
  });
});
```

---

## 🧪 Passo 9: Testar o Servidor

```bash
# Iniciar servidor em modo desenvolvimento
npm run dev
```

**Saída esperada:**
```
✅ Conectado ao banco de dados
🚀 Servidor rodando na porta 3000
📍 http://localhost:3000
🏥 Health check: http://localhost:3000/health
```

### Testar Health Check

```bash
# Via curl
curl http://localhost:3000/health

# Via navegador
# Abra: http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "2026-05-08T10:30:00.000Z"
}
```

---

## ✅ Verificação

Neste ponto, você deve ter:

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          ✅
│   ├── middlewares/
│   │   ├── auth.js              ✅
│   │   ├── errorHandler.js      ✅
│   │   └── validate.js          ✅
│   ├── utils/
│   │   └── errors.js            ✅
│   └── app.js                   ✅
├── server.js                    ✅
└── .env                         ✅
```

**Servidor deve estar:**
- ✅ Rodando na porta 3000
- ✅ Conectado ao banco de dados
- ✅ Respondendo ao health check

---

## 🎯 Próximos Passos

Continue para **PARTE4_MODULO_USERS.md** para:
1. Criar sistema de autenticação (login/register)
2. Implementar CRUD de usuários
3. Criar rotas protegidas
4. Testar autenticação JWT

---

**Tempo estimado:** 30-40 minutos  
**Dificuldade:** ⭐⭐ Médio
