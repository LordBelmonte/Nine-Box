# Parte 3: Estrutura do Backend

Agora vamos montar a estrutura base do backend. Vamos criar os middlewares, configurar o Express e preparar tudo para receber os módulos.

## Passo 1: Criar Estrutura de Pastas

Dentro da pasta `backend`, crie a estrutura de pastas:

```bash
mkdir -p src/config
mkdir -p src/middlewares
mkdir -p src/modules/users
mkdir -p src/modules/evaluations
mkdir -p src/modules/competencies
mkdir -p src/modules/ninebox
mkdir -p src/modules/reports
mkdir -p src/utils
```

A estrutura final fica assim:

```
backend/
├── src/
│   ├── config/          # Configurações (banco de dados)
│   ├── middlewares/     # Middlewares (auth, validação, erros)
│   ├── modules/         # Módulos da aplicação
│   │   ├── users/
│   │   ├── evaluations/
│   │   ├── competencies/
│   │   ├── ninebox/
│   │   └── reports/
│   ├── utils/           # Utilitários (classes de erro)
│   └── app.js           # Configuração do Express
├── server.js            # Arquivo principal
└── .env                 # Variáveis de ambiente
```

## Passo 2: Criar Classe de Erro Customizada

Crie o arquivo `src/utils/errors.js`:

```javascript
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

Essa classe serve para criar erros personalizados que o sistema consegue identificar e tratar de forma adequada. O `isOperational` indica que é um erro esperado (como "usuário não encontrado"), não um bug do código.

## Passo 3: Configurar Conexão com Banco

Crie o arquivo `src/config/database.js`:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

prisma.$connect()
  .then(() => {
    console.log('Conectado ao banco de dados');
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco:', error);
    process.exit(1);
  });

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Desconectado do banco de dados');
});

export { prisma };
```

O Prisma Client é a ferramenta que usamos para conversar com o banco. Aqui criamos uma instância única que será usada em todo o sistema. Em desenvolvimento, ele mostra as queries SQL que executa, o que ajuda a debugar.

## Passo 4: Criar Middleware de Autenticação

Crie o arquivo `src/middlewares/auth.js`:

```javascript
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

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

      req.user = decoded;
      return next();
    });
  } catch (error) {
    next(error);
  }
};

const isAdminMiddleware = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return next(new AppError('Acesso negado. Apenas administradores', 403));
  }
  next();
};

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

O middleware de autenticação funciona assim:
1. Pega o token do header `Authorization: Bearer <token>`
2. Valida se o formato está correto
3. Verifica se o token é válido usando a chave secreta
4. Adiciona os dados do usuário em `req.user` para usar nas rotas
5. Se algo der errado, retorna erro 401 (não autorizado)

Os outros dois middlewares verificam o tipo de usuário. Use `isAdminMiddleware` em rotas que só admin pode acessar, e `isGestorOrAdminMiddleware` em rotas que gestor e admin podem acessar.

## Passo 5: Criar Middleware de Validação

Crie o arquivo `src/middlewares/validate.js`:

```javascript
import { AppError } from '../utils/errors.js';

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    req.body = value;
    next();
  };
};

export { validate };
```

Esse middleware usa o Joi para validar os dados que chegam nas requisições. O `abortEarly: false` faz ele retornar todos os erros de uma vez, não só o primeiro. O `stripUnknown: true` remove campos que não estão no schema, evitando que dados extras entrem no banco.

## Passo 6: Criar Middleware de Tratamento de Erros

Crie o arquivo `src/middlewares/errorHandler.js`:

```javascript
const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // Erros do Prisma - Unique constraint
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Registro duplicado. Este valor já existe no banco de dados.';
  }

  // Erros do Prisma - Record not found
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

  // Log do erro em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Erro:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export { errorHandler };
```

Esse middleware captura todos os erros da aplicação e transforma em respostas padronizadas. Ele identifica erros comuns do Prisma (como tentar criar um registro duplicado) e do JWT (token inválido ou expirado) e retorna mensagens claras para o frontend.

## Passo 7: Configurar Express

Crie o arquivo `src/app.js`:

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Segurança HTTP
app.use(helmet());

// CORS - permitir requisições do frontend
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON (aumentado para 10MB por causa das fotos em base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Rotas da API (vamos adicionar depois)
// app.use('/api/users', userRoutes);
// app.use('/api/evaluations', evaluationRoutes);
// app.use('/api/competencies', competencyRoutes);
// app.use('/api/ninebox', nineBoxRoutes);
// app.use('/api/reports', reportsRoutes);

// Middleware de erro (sempre por último)
app.use(errorHandler);

export default app;
```

Aqui configuramos o Express com:
- `helmet()` - adiciona headers de segurança
- `cors()` - permite que o frontend faça requisições
- `express.json()` - faz parse de JSON no body (limite de 10MB para fotos)
- `health check` - rota para verificar se a API está funcionando
- `errorHandler` - captura todos os erros

## Passo 8: Criar Servidor

Crie o arquivo `server.js` na raiz do projeto:

```javascript
import 'dotenv/config';
import app from './src/app.js';
import { prisma } from './src/config/database.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown - desliga o servidor de forma limpa
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recebido. Encerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
```

O graceful shutdown garante que quando você parar o servidor (Ctrl+C), ele vai fechar as conexões com o banco antes de desligar completamente.

## Passo 9: Testar o Servidor

Inicie o servidor:

```bash
npm run dev
```

Você deve ver:

```
Conectado ao banco de dados
Servidor rodando na porta 3000
http://localhost:3000
Health check: http://localhost:3000/health
```

Teste o health check abrindo no navegador: `http://localhost:3000/health`

Deve retornar:

```json
{
  "status": "ok",
  "timestamp": "2026-05-08T10:30:00.000Z"
}
```

## Verificação

Neste ponto você deve ter:

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── utils/
│   │   └── errors.js
│   └── app.js
├── server.js
└── .env
```

E o servidor deve estar:
- Rodando na porta 3000
- Conectado ao banco de dados
- Respondendo ao health check

Próximo passo: criar os módulos da aplicação (users, evaluations, competencies, ninebox, reports).
