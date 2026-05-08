# Parte 4: Módulos do Backend

Agora vamos criar os módulos da aplicação. Cada módulo segue o mesmo padrão: Repository, Service, Controller, Routes e Validation.

## Arquitetura em Camadas

Cada módulo tem 5 arquivos:

1. **Repository** - conversa com o banco de dados (Prisma)
2. **Service** - lógica de negócio (validações, regras)
3. **Controller** - recebe requisições e retorna respostas
4. **Routes** - define as rotas da API
5. **Validation** - schemas de validação (Joi)

Exemplo de fluxo:
```
Cliente → Routes → Controller → Service → Repository → Banco
                                                    ↓
Cliente ← Routes ← Controller ← Service ← Repository
```

## Módulo 1: Users (Usuários)

### 1.1 Repository

Crie `src/modules/users/user.repository.js`:

```javascript
import { prisma } from '../../config/database.js';

class UserRepository {
  async create(data) {
    return prisma.user.create({ data });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByRA(ra) {
    return prisma.user.findUnique({ where: { ra } });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findAll({ page = 1, limit = 10, tipo, search, departamento }) {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (tipo) where.tipo = tipo;
    if (departamento) where.departamento = departamento;
    if (search) {
      where.nome = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          ra: true,
          nome: true,
          email: true,
          tipo: true,
          cargo: true,
          departamento: true,
          foto: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        cargo: true,
        departamento: true,
        foto: true
      }
    });
  }

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  }

  async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user;
  }

  async raExists(ra) {
    const user = await prisma.user.findUnique({
      where: { ra },
      select: { id: true }
    });
    return !!user;
  }
}

export { UserRepository };
```

### 1.2 Service

Crie `src/modules/users/user.service.js`:

```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/errors.js';

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(data) {
    // Verifica email duplicado
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Verifica RA duplicado
    const raExists = await this.userRepository.raExists(data.ra);
    if (raExists) {
      throw new AppError('RA já cadastrado', 400);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    // Cria usuário
    const user = await this.userRepository.create({
      ...data,
      senha: hashedPassword
    });

    // Remove senha da resposta
    delete user.senha;

    return user;
  }

  async login(email, senha) {
    // Busca usuário
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Verifica senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Gera token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tipo: user.tipo,
        ra: user.ra
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove senha da resposta
    delete user.senha;

    return { user, token };
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    delete user.senha;
    return user;
  }

  async updateProfile(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Validar foto se fornecida
    if (data.foto) {
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      if (!base64Regex.test(data.foto)) {
        throw new AppError('Formato de imagem inválido. Use PNG, JPG, GIF ou WebP.', 400);
      }

      // Validar tamanho (máximo 2MB)
      const base64Length = data.foto.length - (data.foto.indexOf(',') + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 2) {
        throw new AppError('Imagem muito grande. Máximo 2MB.', 400);
      }
    }

    const updated = await this.userRepository.update(userId, data);
    delete updated.senha;
    return updated;
  }

  async findAll(filters, userTipo) {
    // Colaborador pode listar apenas gestores (para avaliar)
    if (userTipo === 'colaborador') {
      filters.tipo = 'gestor';
    }

    const result = await this.userRepository.findAll(filters);
    
    // Filtrar admins para gestores
    if (userTipo === 'gestor') {
      result.users = result.users.filter(u => u.tipo !== 'admin');
      result.pagination.total = result.users.length;
      result.pagination.totalPages = Math.ceil(result.users.length / (filters.limit || 10));
    }
    
    return result;
  }

  async findById(id, requestUserId, requestUserTipo) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Colaborador só pode ver próprio perfil
    if (requestUserTipo === 'colaborador' && id !== requestUserId) {
      throw new AppError('Sem permissão para ver este usuário', 403);
    }

    delete user.senha;
    return user;
  }

  async findByRA(ra) {
    const user = await this.userRepository.findByRA(ra);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    delete user.senha;
    return user;
  }

  async delete(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.tipo === 'admin') {
      throw new AppError('Não é possível deletar admin', 400);
    }

    await this.userRepository.delete(id);
    return { message: 'Usuário deletado com sucesso' };
  }
}

export { UserService };
```

### 1.3 Controller

Crie `src/modules/users/user.controller.js`:

```javascript
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

class UserController {
  async register(req, res, next) {
    try {
      const user = await userService.register(req.body);
      return res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário cadastrado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const result = await userService.login(email, senha);
      return res.json({
        success: true,
        data: result,
        message: 'Login realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.userId);
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.userId, req.body);
      return res.json({
        success: true,
        data: user,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, tipo, search, departamento } = req.query;
      
      const result = await userService.findAll(
        { 
          page: parseInt(page) || 1, 
          limit: parseInt(limit) || 10, 
          tipo,
          search,
          departamento
        },
        req.user.tipo
      );
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const user = await userService.findById(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async findByRA(req, res, next) {
    try {
      const user = await userService.findByRA(req.params.ra);
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await userService.delete(req.params.id);
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
```

### 1.4 Validation

Crie `src/modules/users/user.validation.js`:

```javascript
import Joi from 'joi';

const registerSchema = Joi.object({
  ra: Joi.string()
    .min(5)
    .max(10)
    .required()
    .messages({
      'string.min': 'RA deve ter entre 5 e 10 caracteres',
      'string.max': 'RA deve ter entre 5 e 10 caracteres',
      'any.required': 'RA é obrigatório'
    }),
  nome: Joi.string().min(3).required(),
  email: Joi.string().email().pattern(/\.edu\.br$/i).required().messages({
    'string.pattern.base': 'Use um e-mail institucional (ex: nome@faculdade.edu.br)',
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string().min(6).required(),
  tipo: Joi.string().valid('admin', 'gestor', 'colaborador').required(),
  cargo: Joi.string().optional(),
  departamento: Joi.string().optional(),
  foto: Joi.string().uri().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().pattern(/\.edu\.br$/i).required().messages({
    'string.pattern.base': 'Use um e-mail institucional (ex: nome@faculdade.edu.br)',
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  nome: Joi.string().min(3).optional(),
  cargo: Joi.string().optional(),
  departamento: Joi.string().optional(),
  foto: Joi.string().uri().optional()
});

export {
  registerSchema,
  loginSchema,
  updateProfileSchema
};
```

### 1.5 Routes

Crie `src/modules/users/user.routes.js`:

```javascript
import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware, isAdminMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from './user.validation.js';

const router = Router();
const userController = new UserController();

// Rotas públicas
router.post('/register', validate(registerSchema), (req, res, next) => userController.register(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => userController.login(req, res, next));

// Rotas protegidas
router.get('/profile', authMiddleware, (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', authMiddleware, validate(updateProfileSchema), (req, res, next) => userController.updateProfile(req, res, next));

// Rotas de listagem (gestor e admin)
router.get('/', authMiddleware, isGestorOrAdminMiddleware, (req, res, next) => userController.findAll(req, res, next));
router.get('/:id', authMiddleware, (req, res, next) => userController.findById(req, res, next));
router.get('/ra/:ra', authMiddleware, (req, res, next) => userController.findByRA(req, res, next));

// Rotas de admin
router.delete('/:id', authMiddleware, isAdminMiddleware, (req, res, next) => userController.delete(req, res, next));

export default router;
```

## Módulo 2: Evaluations (Avaliações)

Os outros módulos seguem a mesma estrutura. Vou mostrar apenas os pontos principais.

### Estrutura de Evaluations

```
src/modules/evaluations/
├── evaluation.repository.js  # CRUD de avaliações
├── evaluation.service.js     # Lógica: anonimato, permissões
├── evaluation.controller.js  # Endpoints da API
├── evaluation.routes.js      # Rotas
└── evaluation.validation.js  # Validação Joi
```

**Principais funcionalidades:**
- Criar avaliação anônima (180° ou 360°)
- Listar avaliações (com filtros)
- Ver estatísticas por avaliado
- Atualizar/deletar (apenas admin)

**Regras de negócio:**
- Avaliações são anônimas (não mostram quem avaliou)
- Colaborador avalia gestor (360°)
- Gestor avalia colaborador (180°)
- Critérios: pontualidade, comunicação, técnico, proatividade, equipe

## Módulo 3: Competencies (Competências)

### Estrutura de Competencies

```
src/modules/competencies/
├── competency.repository.js
├── competency.service.js
├── competency.controller.js
├── competency.routes.js
└── competency.validation.js
```

**Principais funcionalidades:**
- CRUD de competências
- Filtrar por tipo (tecnica, comportamental, lideranca)
- Filtrar por competenciaDe (gestor, colaborador)
- Estatísticas de competências

**Tipos de competência:**
- `tecnica` - habilidades técnicas
- `comportamental` - soft skills
- `lideranca` - competências de liderança

**Competência de:**
- `gestor` - competências esperadas de gestores
- `colaborador` - competências esperadas de colaboradores

## Módulo 4: NineBox (Nine Box)

### Estrutura de NineBox

```
src/modules/ninebox/
├── ninebox.repository.js
├── ninebox.service.js
├── ninebox.controller.js
├── ninebox.routes.js
└── ninebox.validation.js
```

**Principais funcionalidades:**
- Criar avaliação Nine Box
- Calcular categoria automaticamente (performance + potencial)
- Ver distribuição no grid
- Histórico de avaliações por pessoa

**Categorias Nine Box:**
- `enigma` - Alto potencial, Baixa performance
- `estrela` - Alto potencial, Média performance
- `superstar` - Alto potencial, Alta performance
- `dilema` - Médio potencial, Baixa performance
- `nucleo` - Médio potencial, Média performance
- `especialista` - Médio potencial, Alta performance
- `questao` - Baixo potencial, Baixa performance
- `trabalhador` - Baixo potencial, Média performance
- `ancora` - Baixo potencial, Alta performance

**Cálculo da categoria:**
```javascript
// Performance: baixo (1), medio (2), alto (3)
// Potencial: baixo (1), medio (2), alto (3)

const categorias = {
  '1-1': 'questao',
  '1-2': 'trabalhador',
  '1-3': 'ancora',
  '2-1': 'dilema',
  '2-2': 'nucleo',
  '2-3': 'especialista',
  '3-1': 'enigma',
  '3-2': 'estrela',
  '3-3': 'superstar'
};
```

## Módulo 5: Reports (Relatórios)

### Estrutura de Reports

```
src/modules/reports/
├── reports.service.js
├── reports.controller.js
└── reports.routes.js
```

**Principais funcionalidades:**
- Dashboard geral (estatísticas do sistema)
- Relatório de usuário (avaliações recebidas/feitas)
- Relatório de equipe (para gestores)
- Exportar dados

**Dashboard retorna:**
- Total de usuários (por tipo)
- Total de avaliações (por tipo)
- Total de avaliações Nine Box
- Média geral das avaliações
- Últimas avaliações

**Relatório de usuário retorna:**
- Dados do usuário
- Avaliações recebidas (total, média, lista)
- Avaliações feitas (total, lista)
- Média por critério
- Última avaliação Nine Box

## Conectar Rotas no App

Agora edite `src/app.js` e adicione as rotas:

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';

// Importar rotas
import userRoutes from './modules/users/user.routes.js';
import evaluationRoutes from './modules/evaluations/evaluation.routes.js';
import competencyRoutes from './modules/competencies/competency.routes.js';
import nineBoxRoutes from './modules/ninebox/ninebox.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

const app = express();

// Middlewares
app.use(helmet());

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/ninebox', nineBoxRoutes);
app.use('/api/reports', reportsRoutes);

// Error handler (sempre por último)
app.use(errorHandler);

export default app;
```

## Testar a API

Reinicie o servidor:

```bash
npm run dev
```

Teste as rotas:

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "ra": "12345",
    "nome": "João Silva",
    "email": "joao@faculdade.edu.br",
    "senha": "123456",
    "tipo": "colaborador",
    "cargo": "Desenvolvedor",
    "departamento": "TI"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@faculdade.edu.br",
    "senha": "123456"
  }'

# Ver perfil (precisa do token)
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Verificação Final

Estrutura completa:

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── modules/
│   │   ├── users/
│   │   │   ├── user.repository.js
│   │   │   ├── user.service.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.routes.js
│   │   │   └── user.validation.js
│   │   ├── evaluations/
│   │   ├── competencies/
│   │   ├── ninebox/
│   │   └── reports/
│   ├── utils/
│   │   └── errors.js
│   └── app.js
├── server.js
├── .env
└── package.json
```

Pronto! O backend está completo com todos os módulos funcionando.


## Módulo 2: Evaluations (Avaliações) - COMPLETO

Agora vamos criar o módulo de avaliações. Este é o mais complexo porque lida com anonimato e permissões.

### 2.1 Repository

Crie `src/modules/evaluations/evaluation.repository.js`:

```javascript
import { prisma } from '../../config/database.js';

class EvaluationRepository {
  async create(data) {
    return prisma.evaluation.create({
      data,
      include: {
        avaliador: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true
          }
        },
        avaliado: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      }
    });
  }

  async findById(id) {
    return prisma.evaluation.findUnique({
      where: { id },
      include: {
        avaliador: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true
          }
        },
        avaliado: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      }
    });
  }

  async findAll({ page = 1, limit = 10, tipoAvaliacao, avaliadoId, avaliadorId }) {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (tipoAvaliacao) where.tipoAvaliacao = tipoAvaliacao;
    if (avaliadoId) where.avaliadoId = avaliadoId;
    if (avaliadorId) where.avaliadorId = avaliadorId;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        include: {
          avaliador: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true
            }
          },
          avaliado: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true,
              foto: true
            }
          }
        },
        orderBy: { data: 'desc' }
      }),
      prisma.evaluation.count({ where })
    ]);

    return {
      evaluations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByAvaliado(avaliadoId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where: { avaliadoId },
        skip,
        take: limit,
        include: {
          avaliador: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true
            }
          },
          avaliado: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true,
              foto: true
            }
          }
        },
        orderBy: { data: 'desc' }
      }),
      prisma.evaluation.count({ where: { avaliadoId } })
    ]);

    return {
      evaluations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByAvaliador(avaliadorId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where: { avaliadorId },
        skip,
        take: limit,
        include: {
          avaliador: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true
            }
          },
          avaliado: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true,
              foto: true
            }
          }
        },
        orderBy: { data: 'desc' }
      }),
      prisma.evaluation.count({ where: { avaliadorId } })
    ]);

    return {
      evaluations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, data) {
    return prisma.evaluation.update({
      where: { id },
      data,
      include: {
        avaliador: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true
          }
        },
        avaliado: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      }
    });
  }

  async delete(id) {
    return prisma.evaluation.delete({ where: { id } });
  }

  async getStatsByAvaliado(avaliadoId) {
    const evaluations = await prisma.evaluation.findMany({
      where: { avaliadoId },
      select: {
        media: true,
        criterios: true,
        tipoAvaliacao: true,
        data: true
      }
    });

    const total = evaluations.length;
    const mediaGeral = total > 0
      ? evaluations.reduce((acc, e) => acc + (e.media || 0), 0) / total
      : 0;

    return {
      total,
      mediaGeral: parseFloat(mediaGeral.toFixed(1)),
      porTipo: {
        gestor_para_colaborador: evaluations.filter(e => e.tipoAvaliacao === 'gestor_para_colaborador').length,
        colaborador_para_gestor: evaluations.filter(e => e.tipoAvaliacao === 'colaborador_para_gestor').length,
        avaliacao_360: evaluations.filter(e => e.tipoAvaliacao === 'avaliacao_360').length
      }
    };
  }
}

export { EvaluationRepository };
```

### 2.2 Service

O service já foi mostrado nos arquivos lidos. Principais pontos:

- **Anonimato**: Remove `avaliadorId` das respostas (exceto para admin)
- **Permissões**: Valida quem pode avaliar quem
- **Tipos de avaliação**: Determina automaticamente (180° ou 360°)
- **Edição**: Apenas nas primeiras 24 horas

### 2.3 Controller

Já foi mostrado anteriormente. Segue o mesmo padrão do UserController.

### 2.4 Validation

Crie `src/modules/evaluations/evaluation.validation.js`:

```javascript
import Joi from 'joi';

const createEvaluationSchema = Joi.object({
  avaliadoId: Joi.string().uuid().required(),
  criterios: Joi.object({
    pontualidade: Joi.number().min(1).max(5).required(),
    comunicacao: Joi.number().min(1).max(5).required(),
    tecnico: Joi.number().min(1).max(5).required(),
    proatividade: Joi.number().min(1).max(5).required(),
    equipe: Joi.number().min(1).max(5).required()
  }).required(),
  comentario: Joi.string().optional().allow('', null),
  anonima: Joi.boolean().optional().default(true)
});

const updateEvaluationSchema = Joi.object({
  criterios: Joi.object().optional(),
  media: Joi.number().min(0).max(5).optional(),
  comentario: Joi.string().optional().allow('', null)
});

export {
  createEvaluationSchema,
  updateEvaluationSchema
};
```

### 2.5 Routes

Já foi mostrado. Pontos importantes:

- Rotas específicas ANTES de rotas genéricas (`/stats/avaliado/:id` antes de `/:id`)
- Todas precisam de autenticação
- Permissões validadas no service

## Módulo 3: Competencies (Competências) - COMPLETO

### 3.1 Repository

Crie `src/modules/competencies/competency.repository.js`:

```javascript
import { prisma } from '../../config/database.js';

class CompetencyRepository {
  async create(data) {
    return prisma.competency.create({ data });
  }

  async findById(id) {
    return prisma.competency.findUnique({ where: { id } });
  }

  async findAll({ page = 1, limit = 10, tipo, competenciaDe, search }) {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (tipo) where.tipo = tipo;
    if (competenciaDe) where.competenciaDe = competenciaDe;
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [competencies, total] = await Promise.all([
      prisma.competency.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.competency.count({ where })
    ]);

    return {
      competencies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByTipo(tipo) {
    return prisma.competency.findMany({
      where: { tipo },
      orderBy: { nome: 'asc' }
    });
  }

  async findByCompetenciaDe(competenciaDe) {
    return prisma.competency.findMany({
      where: { competenciaDe },
      orderBy: { nome: 'asc' }
    });
  }

  async update(id, data) {
    return prisma.competency.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.competency.delete({ where: { id } });
  }

  async exists(nome) {
    const competency = await prisma.competency.findUnique({
      where: { nome },
      select: { id: true }
    });
    return !!competency;
  }

  async getStatsByTipo() {
    const competencies = await prisma.competency.findMany({
      select: { tipo: true }
    });

    const stats = {
      total: competencies.length,
      porTipo: {}
    };

    competencies.forEach(c => {
      stats.porTipo[c.tipo] = (stats.porTipo[c.tipo] || 0) + 1;
    });

    return stats;
  }
}

export { CompetencyRepository };
```

### 3.2 Service

Já foi mostrado. Principais regras:

- Apenas admin pode criar/editar/deletar
- Todos podem visualizar
- Nome único
- Entre 1 e 10 critérios

### 3.3 Controller

Crie `src/modules/competencies/competency.controller.js` (mesmo padrão dos outros).

### 3.4 Validation

Crie `src/modules/competencies/competency.validation.js`:

```javascript
import Joi from 'joi';

const createCompetencySchema = Joi.object({
  nome: Joi.string().min(3).max(100).required(),
  descricao: Joi.string().min(10).max(500).required(),
  tipo: Joi.string().valid('tecnica', 'comportamental', 'lideranca').required(),
  competenciaDe: Joi.string().valid('gestor', 'colaborador', 'todos').required(),
  criterios: Joi.array().items(Joi.string()).min(1).max(10).required()
});

const updateCompetencySchema = Joi.object({
  nome: Joi.string().min(3).max(100).optional(),
  descricao: Joi.string().min(10).max(500).optional(),
  tipo: Joi.string().valid('tecnica', 'comportamental', 'lideranca').optional(),
  competenciaDe: Joi.string().valid('gestor', 'colaborador', 'todos').optional(),
  criterios: Joi.array().items(Joi.string()).min(1).max(10).optional()
});

export {
  createCompetencySchema,
  updateCompetencySchema
};
```

### 3.5 Routes

Já foi mostrado. Estrutura:

- GET (todos podem ver)
- POST/PUT/DELETE (apenas admin)

## Módulo 4: NineBox - COMPLETO

### 4.1 Repository

Crie `src/modules/ninebox/ninebox.repository.js`:

```javascript
import { prisma } from '../../config/database.js';

class NineBoxRepository {
  async create(data) {
    return prisma.nineBox.create({
      data,
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      }
    });
  }

  async findById(id) {
    return prisma.nineBox.findUnique({
      where: { id },
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      }
    });
  }

  async findAll({ page = 1, limit = 10, categoria, pessoaId }) {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (categoria) where.categoria = categoria;
    if (pessoaId) where.pessoaId = pessoaId;

    const [nineBoxes, total] = await Promise.all([
      prisma.nineBox.findMany({
        where,
        skip,
        take: limit,
        include: {
          pessoa: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true,
              foto: true
            }
          }
        },
        orderBy: { data: 'desc' }
      }),
      prisma.nineBox.count({ where })
    ]);

    return {
      nineBoxes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByPessoa(pessoaId) {
    return prisma.nineBox.findMany({
      where: { pessoaId },
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      },
      orderBy: { data: 'desc' }
    });
  }

  async findLatestByPessoa(pessoaId) {
    return prisma.nineBox.findFirst({
      where: { pessoaId },
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      },
      orderBy: { data: 'desc' }
    });
  }

  async update(id, data) {
    return prisma.nineBox.update({
      where: { id },
      data,
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      }
    });
  }

  async delete(id) {
    return prisma.nineBox.delete({ where: { id } });
  }

  async getGridDistribution() {
    const nineBoxes = await prisma.nineBox.findMany({
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            foto: true
          }
        }
      },
      orderBy: { data: 'desc' }
    });

    // Pegar apenas a última avaliação de cada pessoa
    const latestByPerson = {};
    nineBoxes.forEach(nb => {
      if (!latestByPerson[nb.pessoaId]) {
        latestByPerson[nb.pessoaId] = nb;
      }
    });

    const distribution = {};
    Object.values(latestByPerson).forEach(nb => {
      const key = `${nb.performance}-${nb.potential}`;
      if (!distribution[key]) {
        distribution[key] = {
          categoria: nb.categoria,
          performance: nb.performance,
          potential: nb.potential,
          pessoas: []
        };
      }
      distribution[key].pessoas.push(nb.pessoa);
    });

    return distribution;
  }

  async getStatsByTipo() {
    const nineBoxes = await prisma.nineBox.findMany({
      include: {
        pessoa: {
          select: { tipo: true }
        }
      }
    });

    const stats = {
      total: nineBoxes.length,
      porTipoUsuario: {}
    };

    nineBoxes.forEach(nb => {
      const tipo = nb.pessoa.tipo;
      stats.porTipoUsuario[tipo] = (stats.porTipoUsuario[tipo] || 0) + 1;
    });

    return stats;
  }
}

export { NineBoxRepository };
```

### 4.2 Service

Já foi mostrado. Principais funcionalidades:

- **Cálculo automático de categoria** baseado em performance e potencial
- **9 categorias**: Questão, Trabalhador, Âncora, Dilema, Núcleo, Especialista, Enigma, Estrela, Superstar
- **Permissões**: Apenas gestor e admin podem criar/editar
- **Histórico**: Mantém todas as avaliações de uma pessoa

### 4.3 Controller, Validation e Routes

Seguem o mesmo padrão dos outros módulos.

Validation:

```javascript
import Joi from 'joi';

const createNineBoxSchema = Joi.object({
  pessoaId: Joi.string().uuid().required(),
  performance: Joi.number().integer().min(1).max(3).required(),
  potential: Joi.number().integer().min(1).max(3).required(),
  comentario: Joi.string().optional().allow('', null)
});

const updateNineBoxSchema = Joi.object({
  performance: Joi.number().integer().min(1).max(3).optional(),
  potential: Joi.number().integer().min(1).max(3).optional(),
  comentario: Joi.string().optional().allow('', null)
});

export {
  createNineBoxSchema,
  updateNineBoxSchema
};
```

## Módulo 5: Reports (Relatórios) - COMPLETO

Este módulo não tem repository próprio, usa os repositories dos outros módulos.

### 5.1 Service

Crie `src/modules/reports/reports.service.js`:

```javascript
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/errors.js';

class ReportsService {
  async getDashboardStats(userTipo) {
    // Colaborador não pode ver dashboard geral
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver dashboard geral', 403);
    }

    const [usuarios, avaliacoes, nineBox, competencias] = await Promise.all([
      prisma.user.groupBy({
        by: ['tipo'],
        _count: true
      }),
      prisma.evaluation.findMany({
        select: {
          tipoAvaliacao: true,
          media: true,
          data: true,
          avaliado: {
            select: {
              nome: true,
              foto: true
            }
          }
        },
        orderBy: { data: 'desc' },
        take: 10
      }),
      prisma.nineBox.count(),
      prisma.competency.count()
    ]);

    const usuariosStats = {
      total: usuarios.reduce((acc, u) => acc + u._count, 0),
      porTipo: {}
    };
    usuarios.forEach(u => {
      usuariosStats.porTipo[u.tipo] = u._count;
    });

    const avaliacoesStats = {
      total: avaliacoes.length,
      mediaGeral: avaliacoes.length > 0
        ? avaliacoes.reduce((acc, a) => acc + (a.media || 0), 0) / avaliacoes.length
        : 0,
      porTipo: {},
      lista: avaliacoes
    };

    avaliacoes.forEach(a => {
      avaliacoesStats.porTipo[a.tipoAvaliacao] = 
        (avaliacoesStats.porTipo[a.tipoAvaliacao] || 0) + 1;
    });

    return {
      usuarios: usuariosStats,
      avaliacoes: avaliacoesStats,
      nineBox: { total: nineBox },
      competencias: { total: competencias },
      timestamp: new Date().toISOString()
    };
  }

  async getUserReport(userId, requestUserId, requestUserTipo) {
    // Colaborador só pode ver próprio relatório
    if (requestUserTipo === 'colaborador' && userId !== requestUserId) {
      throw new AppError('Sem permissão para ver este relatório', 403);
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        cargo: true,
        departamento: true,
        foto: true
      }
    });

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const [avaliacoesRecebidas, avaliacoesFeitas, nineBox] = await Promise.all([
      prisma.evaluation.findMany({
        where: { avaliadoId: userId },
        select: {
          id: true,
          tipoAvaliacao: true,
          criterios: true,
          media: true,
          comentario: true,
          data: true
        },
        orderBy: { data: 'desc' }
      }),
      prisma.evaluation.findMany({
        where: { avaliadorId: userId },
        select: {
          id: true,
          tipoAvaliacao: true,
          media: true,
          data: true,
          avaliado: {
            select: {
              nome: true,
              foto: true
            }
          }
        },
        orderBy: { data: 'desc' }
      }),
      prisma.nineBox.findFirst({
        where: { pessoaId: userId },
        orderBy: { data: 'desc' }
      })
    ]);

    const mediaGeral = avaliacoesRecebidas.length > 0
      ? avaliacoesRecebidas.reduce((acc, a) => acc + (a.media || 0), 0) / avaliacoesRecebidas.length
      : 0;

    return {
      usuario,
      avaliacoesRecebidas: {
        total: avaliacoesRecebidas.length,
        mediaGeral: parseFloat(mediaGeral.toFixed(1)),
        lista: avaliacoesRecebidas
      },
      avaliacoesFeitas: {
        total: avaliacoesFeitas.length,
        lista: avaliacoesFeitas
      },
      nineBox,
      timestamp: new Date().toISOString()
    };
  }

  async getTeamReport(gestorId, requestUserId, requestUserTipo) {
    // Apenas gestor pode ver relatório de equipe (da própria equipe)
    if (requestUserTipo === 'gestor' && gestorId !== requestUserId) {
      throw new AppError('Sem permissão para ver este relatório', 403);
    }

    // Admin pode ver qualquer equipe
    if (requestUserTipo !== 'admin' && requestUserTipo !== 'gestor') {
      throw new AppError('Sem permissão para ver relatórios de equipe', 403);
    }

    // Buscar colaboradores do mesmo departamento do gestor
    const gestor = await prisma.user.findUnique({
      where: { id: gestorId },
      select: { departamento: true }
    });

    if (!gestor) {
      throw new AppError('Gestor não encontrado', 404);
    }

    const equipe = await prisma.user.findMany({
      where: {
        departamento: gestor.departamento,
        tipo: 'colaborador'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        foto: true
      }
    });

    return {
      gestor: { id: gestorId },
      equipe,
      timestamp: new Date().toISOString()
    };
  }

  async exportUserReport(userId, requestUserId, requestUserTipo) {
    const report = await this.getUserReport(userId, requestUserId, requestUserTipo);
    return report;
  }
}

export { ReportsService };
```

### 5.2 Controller e Routes

Seguem o padrão dos outros módulos. Controller já foi mostrado anteriormente.

Routes:

```javascript
import express from 'express';
import { ReportsController } from './reports.controller.js';
import { authMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const reportsController = new ReportsController();

router.use(authMiddleware);

router.get('/dashboard', isGestorOrAdminMiddleware, (req, res, next) => 
  reportsController.getDashboardStats(req, res, next));

router.get('/user/:userId', (req, res, next) => 
  reportsController.getUserReport(req, res, next));

router.get('/team/:gestorId', isGestorOrAdminMiddleware, (req, res, next) => 
  reportsController.getTeamReport(req, res, next));

router.get('/export/user/:userId', (req, res, next) => 
  reportsController.exportUserReport(req, res, next));

export default router;
```

## Resumo Final

Agora você tem todos os 5 módulos completos:

1. **Users** - Autenticação, perfil, CRUD
2. **Evaluations** - Avaliações 180° e 360° com anonimato
3. **Competencies** - Gestão de competências
4. **NineBox** - Matriz 3x3 de performance x potencial
5. **Reports** - Dashboard e relatórios

Cada módulo segue o padrão:
- **Repository** - acesso ao banco
- **Service** - lógica de negócio
- **Controller** - endpoints
- **Validation** - schemas Joi
- **Routes** - definição de rotas

Reinicie o servidor e teste:

```bash
npm run dev
```

Teste as rotas principais:

```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eniac.edu.br","senha":"admin123"}'

# Dashboard (use o token do login)
curl http://localhost:3000/api/reports/dashboard \
  -H "Authorization: Bearer SEU_TOKEN"

# Criar avaliação
curl -X POST http://localhost:3000/api/evaluations \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "avaliadoId":"ID_DO_USUARIO",
    "criterios":{
      "pontualidade":5,
      "comunicacao":4,
      "tecnico":5,
      "proatividade":4,
      "equipe":5
    },
    "comentario":"Ótimo trabalho"
  }'
```

Pronto! Backend completo funcionando.
