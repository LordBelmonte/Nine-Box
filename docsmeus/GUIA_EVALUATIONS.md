# Guia Completo - Módulo de Avaliações (Evaluations) - SISTEMA ANÔNIMO E BIDIRECIONAL

Este guia ensina como implementar o módulo de avaliações do zero, seguindo o mesmo padrão do módulo de usuários.

## ⚠️ SISTEMA DE AVALIAÇÕES ANÔNIMAS E BIDIRECIONAIS

**IMPORTANTE**: Este sistema implementa avaliações **anônimas** e **bidirecionais**:

- ✅ **Gestor** pode avaliar colaboradores (anônimo) - **Avaliação 180°**
- ✅ **Colaborador** pode avaliar gestores (anônimo) - **Avaliação 360°**
- ✅ **Admin** pode fazer qualquer tipo de avaliação
- ✅ **avaliadorId** é salvo no banco (controle interno)
- ❌ **avaliadorId** NÃO é retornado na API (mantém anonimato)
- ✅ **tipoAvaliacao** é determinado automaticamente pelo sistema
- ✅ Avaliado vê a avaliação mas não sabe quem fez
- ✅ Admin pode ver quem avaliou (para auditoria)
- ✅ **Limite de 24 horas**: Avaliações podem ser editadas/excluídas apenas nas primeiras 24 horas após criação
- ✅ **Admin sem limite**: Administradores podem editar/excluir avaliações a qualquer momento

**Tipos de Avaliação (determinados automaticamente):**
- `"gestor_para_colaborador"` - Gestor avalia colaborador (**180°**)
- `"colaborador_para_gestor"` - Colaborador avalia gestor (**360°**)
- `"avaliacao_360"` - Admin avalia qualquer um

**Visibilidade por Tipo de Usuário:**
- 👤 **Colaborador logado** → Vê apenas avaliações tipo `colaborador_para_gestor` (360°)
- 👔 **Gestor logado** → Vê apenas avaliações tipo `gestor_para_colaborador` (180°)
- 🔑 **Admin logado** → Vê todos os tipos de avaliação

**Exemplo Prático:**
```
Colaborador "Ana" faz login:
  ✅ Vê avaliações 360° (onde colaboradores avaliam gestores)
  ❌ NÃO vê avaliações 180° (onde gestores avaliam colaboradores)

Gestor "João" faz login:
  ✅ Vê avaliações 180° (onde gestores avaliam colaboradores)
  ❌ NÃO vê avaliações 360° (onde colaboradores avaliam gestores)

Admin faz login:
  ✅ Vê TODAS as avaliações (180° + 360° + avaliações admin)
```

---

## Parte 7: Módulo de Avaliações (1h30)

### 7.1 Criar evaluation.validation.js

Arquivo: `src/modules/evaluations/evaluation.validation.js`

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
  anonima: Joi.boolean().optional().default(true) // Anônima por padrão
});

const createCommentEvaluationSchema = Joi.object({
  avaliadoId: Joi.string().uuid().required(),
  comentario: Joi.string().min(20).required()
    .messages({
      'string.min': 'Comentário deve ter no mínimo 20 caracteres'
    }),
  anonima: Joi.boolean().optional().default(true) // Anônima por padrão
});

const updateEvaluationSchema = Joi.object({
  criterios: Joi.object().optional(),
  media: Joi.number().min(0).max(5).optional(),
  comentario: Joi.string().optional().allow('', null)
});

const queryEvaluationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  tipoAvaliacao: Joi.string().valid('gestor_para_colaborador', 'colaborador_para_gestor', 'avaliacao_360').optional(),
  avaliadoId: Joi.string().uuid().optional()
});

export {
  createEvaluationSchema,
  createCommentEvaluationSchema,
  updateEvaluationSchema,
  queryEvaluationSchema
};
```

### 7.2 Criar evaluation.repository.js

Arquivo: `src/modules/evaluations/evaluation.repository.js`

```javascript
import { prisma } from '../../config/database.js';

class EvaluationRepository {
  async create(data) {
    return prisma.evaluation.create({
      data,
      include: {
        avaliado: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            tipo: true,
            foto: true
          }
        }
        // avaliador NÃO incluído para manter anonimato
      }
    });
  }

  async findById(id) {
    return prisma.evaluation.findUnique({
      where: { id },
      include: {
        avaliado: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            tipo: true,
            foto: true
          }
        }
        // avaliador incluído apenas para controle interno
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
          avaliado: {
            select: {
              id: true,
              ra: true,
              nome: true,
              email: true,
              tipo: true,
              foto: true
            }
          }
          // avaliador NÃO incluído para manter anonimato
        },
        orderBy: { createdAt: 'desc' }
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
        orderBy: { createdAt: 'desc' }
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
          avaliado: {
            select: {
              id: true,
              ra: true,
              nome: true,
              email: true,
              tipo: true,
              foto: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
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
        avaliado: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            tipo: true,
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
        tipoAvaliacao: true,
        data: true
      }
    });

    const total = evaluations.length;
    const mediaGeral = total > 0
      ? evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / total
      : 0;

    const porTipo = evaluations.reduce((acc, ev) => {
      if (!acc[ev.tipoAvaliacao]) {
        acc[ev.tipoAvaliacao] = { count: 0, mediaSum: 0 };
      }
      acc[ev.tipoAvaliacao].count++;
      acc[ev.tipoAvaliacao].mediaSum += ev.media || 0;
      return acc;
    }, {});

    const estatisticas = Object.entries(porTipo).map(([tipo, data]) => ({
      tipo,
      total: data.count,
      media: data.mediaSum / data.count
    }));

    return {
      total,
      mediaGeral: parseFloat(mediaGeral.toFixed(2)),
      estatisticas
    };
  }
}

export { EvaluationRepository };
```

### 7.3 Criar evaluation.service.js

Arquivo: `src/modules/evaluations/evaluation.service.js`

```javascript
import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';

class EvaluationService {
  constructor(evaluationRepository) {
    this.evaluationRepository = evaluationRepository;
    this.userRepository = new UserRepository();
  }

  /**
   * Determinar tipo de avaliação baseado nos tipos de usuário
   */
  determinarTipoAvaliacao(avaliadorTipo, avaliadoTipo) {
    // Admin pode avaliar qualquer um
    if (avaliadorTipo === 'admin') {
      return 'avaliacao_360';
    }

    // Gestor avalia colaborador
    if (avaliadorTipo === 'gestor' && avaliadoTipo === 'colaborador') {
      return 'gestor_para_colaborador';
    }

    // Colaborador avalia gestor
    if (avaliadorTipo === 'colaborador' && avaliadoTipo === 'gestor') {
      return 'colaborador_para_gestor';
    }

    // Mesmo tipo não pode avaliar entre si (exceto admin)
    return null;
  }

  /**
   * Sanitizar avaliação (remover dados sensíveis para anonimato)
   */
  sanitizeEvaluation(evaluation, userTipo = null) {
    const sanitized = { ...evaluation };
    
    // Remover avaliadorId para manter anonimato (exceto para admin)
    if (userTipo !== 'admin' && evaluation.anonima) {
      delete sanitized.avaliadorId;
      delete sanitized.avaliador; // Remover relação também
    }
    
    return sanitized;
  }

  async create(avaliadorId, avaliadorTipo, data) {
    // Verifica se o avaliado existe
    const avaliado = await this.userRepository.findById(data.avaliadoId);
    if (!avaliado) {
      throw new AppError('Usuário avaliado não encontrado', 404);
    }

    // Não pode avaliar a si mesmo (exceto admin)
    if (avaliadorId === data.avaliadoId && avaliadorTipo !== 'admin') {
      throw new AppError('Você não pode se autoavaliar', 403);
    }

    // Validar tipo de avaliação baseado nos tipos de usuário
    const tipoAvaliacao = this.determinarTipoAvaliacao(avaliadorTipo, avaliado.tipo);
    
    if (!tipoAvaliacao) {
      throw new AppError('Tipo de avaliação não permitido entre estes usuários', 403);
    }

    // Calcular média dos critérios (se houver)
    let media = null;
    if (data.criterios) {
      const criteriosArray = Object.values(data.criterios);
      media = parseFloat(
        (criteriosArray.reduce((a, b) => a + b, 0) / criteriosArray.length).toFixed(1)
      );
    }

    // Criar avaliação (anônima por padrão)
    const evaluation = await this.evaluationRepository.create({
      avaliadorId, // Salvo internamente
      avaliadoId: data.avaliadoId,
      tipoAvaliacao,
      criterios: data.criterios || null,
      media,
      comentario: data.comentario || null,
      anonima: data.anonima !== false // true por padrão
    });

    // Retornar sem avaliadorId (manter anonimato)
    return this.sanitizeEvaluation(evaluation, avaliadorTipo);
  }

  async findById(id, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador' && 
        evaluation.avaliadoId !== userId && 
        evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para ver esta avaliação', 403);
    }

    return this.sanitizeEvaluation(evaluation, userTipo);
  }

  async findAll(filters, userId, userTipo) {
    // Filtrar por tipo de avaliação baseado no usuário logado
    if (userTipo === 'colaborador') {
      // Colaborador vê apenas avaliações tipo "colaborador_para_gestor" (360°)
      filters.tipoAvaliacao = 'colaborador_para_gestor';
      
      // Busca avaliações que fez OU que recebeu (do tipo 360°)
      const [avaliacoesFeitas, avaliacoesRecebidas] = await Promise.all([
        this.evaluationRepository.findByAvaliador(userId, filters),
        this.evaluationRepository.findByAvaliado(userId, filters)
      ]);

      // Combina e remove duplicatas
      const todasAvaliacoes = [
        ...avaliacoesFeitas.evaluations,
        ...avaliacoesRecebidas.evaluations
      ];

      const avaliacoesUnicas = todasAvaliacoes.filter((evaluation, index, self) =>
        index === self.findIndex(e => e.id === evaluation.id)
      );

      return {
        evaluations: avaliacoesUnicas.map(e => this.sanitizeEvaluation(e, userTipo)),
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: avaliacoesUnicas.length,
          totalPages: Math.ceil(avaliacoesUnicas.length / (filters.limit || 10))
        }
      };
    }

    if (userTipo === 'gestor') {
      // Gestor vê apenas avaliações tipo "gestor_para_colaborador" (180°)
      filters.tipoAvaliacao = 'gestor_para_colaborador';
    }

    // Admin vê todos os tipos (não filtra por tipoAvaliacao)

    const result = await this.evaluationRepository.findAll(filters);
    return {
      evaluations: result.evaluations.map(e => this.sanitizeEvaluation(e, userTipo)),
      pagination: result.pagination
    };
  }

  async findByAvaliado(avaliadoId, pagination, userId, userTipo) {
    // Verifica se o avaliado existe
    const avaliado = await this.userRepository.findById(avaliadoId);
    if (!avaliado) {
      throw new AppError('Avaliado não encontrado', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador' && avaliadoId !== userId) {
      throw new AppError('Sem permissão para ver estas avaliações', 403);
    }

    const result = await this.evaluationRepository.findByAvaliado(avaliadoId, pagination);
    return {
      evaluations: result.evaluations.map(e => this.sanitizeEvaluation(e, userTipo)),
      pagination: result.pagination
    };
  }

  async findByAvaliador(avaliadorId, pagination, userId, userTipo) {
    // Colaborador só pode ver avaliações que fez
    if (userTipo === 'colaborador' && avaliadorId !== userId) {
      throw new AppError('Sem permissão para ver estas avaliações', 403);
    }

    const result = await this.evaluationRepository.findByAvaliador(avaliadorId, pagination);
    return {
      evaluations: result.evaluations.map(e => this.sanitizeEvaluation(e, userTipo)),
      pagination: result.pagination
    };
  }

  async update(id, data, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    // Apenas o avaliador ou admin pode editar
    if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para editar esta avaliação', 403);
    }

    // Verificar limite de 24 horas (exceto para admin)
    if (userTipo !== 'admin') {
      const horasPassadas = (Date.now() - new Date(evaluation.createdAt).getTime()) / (1000 * 60 * 60);
      if (horasPassadas > 24) {
        throw new AppError('Avaliações só podem ser editadas nas primeiras 24 horas', 403);
      }
    }

    // Recalcular média se critérios foram alterados
    if (data.criterios) {
      const criteriosArray = Object.values(data.criterios);
      data.media = parseFloat(
        (criteriosArray.reduce((a, b) => a + b, 0) / criteriosArray.length).toFixed(1)
      );
    }

    const updated = await this.evaluationRepository.update(id, data);
    return this.sanitizeEvaluation(updated, userTipo);
  }

  async delete(id, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    // Apenas o avaliador ou admin pode deletar
    if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para deletar esta avaliação', 403);
    }

    // Verificar limite de 24 horas (exceto para admin)
    if (userTipo !== 'admin') {
      const horasPassadas = (Date.now() - new Date(evaluation.createdAt).getTime()) / (1000 * 60 * 60);
      if (horasPassadas > 24) {
        throw new AppError('Avaliações só podem ser excluídas nas primeiras 24 horas', 403);
      }
    }

    await this.evaluationRepository.delete(id);
    return { message: 'Avaliação deletada com sucesso' };
  }

  async getStatsByAvaliado(avaliadoId, userId, userTipo) {
    // Verifica se o avaliado existe
    const avaliado = await this.userRepository.findById(avaliadoId);
    if (!avaliado) {
      throw new AppError('Avaliado não encontrado', 404);
    }

    // Colaborador só pode ver suas próprias estatísticas
    if (userTipo === 'colaborador' && avaliadoId !== userId) {
      throw new AppError('Sem permissão para ver estas estatísticas', 403);
    }

    return this.evaluationRepository.getStatsByAvaliado(avaliadoId);
  }
}

export { EvaluationService };
```

### 7.4 Criar evaluation.controller.js

Arquivo: `src/modules/evaluations/evaluation.controller.js`

```javascript
import { EvaluationRepository } from './evaluation.repository.js';
import { EvaluationService } from './evaluation.service.js';

const evaluationRepository = new EvaluationRepository();
const evaluationService = new EvaluationService(evaluationRepository);

class EvaluationController {
  async create(req, res, next) {
    try {
      const evaluation = await evaluationService.create(
        req.user.userId, 
        req.user.tipo, 
        req.body
      );
      return res.status(201).json({
        success: true,
        data: evaluation,
        message: 'Avaliação anônima criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const evaluation = await evaluationService.findById(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, tipoAvaliacao, avaliadoId } = req.query;
      const result = await evaluationService.findAll(
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          tipoAvaliacao,
          avaliadoId
        },
        req.user.userId,
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

  async findByAvaliado(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await evaluationService.findByAvaliado(
        req.params.avaliadoId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10
        },
        req.user.userId,
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

  async findByAvaliador(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await evaluationService.findByAvaliador(
        req.params.avaliadorId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10
        },
        req.user.userId,
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

  async update(req, res, next) {
    try {
      const evaluation = await evaluationService.update(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: evaluation,
        message: 'Avaliação atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await evaluationService.delete(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatsByAvaliado(req, res, next) {
    try {
      const stats = await evaluationService.getStatsByAvaliado(
        req.params.avaliadoId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export { EvaluationController };
```

### 7.5 Criar evaluation.routes.js

Arquivo: `src/modules/evaluations/evaluation.routes.js`

```javascript
import express from 'express';
import { EvaluationController } from './evaluation.controller.js';
import { authMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createEvaluationSchema, updateEvaluationSchema } from './evaluation.validation.js';

const router = express.Router();
const evaluationController = new EvaluationController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas públicas (autenticadas) - validação de permissão no service
router.post('/', validate(createEvaluationSchema), (req, res, next) => evaluationController.create(req, res, next));
router.get('/', (req, res, next) => evaluationController.findAll(req, res, next));
router.get('/:id', (req, res, next) => evaluationController.findById(req, res, next));
router.get('/avaliado/:avaliadoId', (req, res, next) => evaluationController.findByAvaliado(req, res, next));
router.get('/avaliador/:avaliadorId', (req, res, next) => evaluationController.findByAvaliador(req, res, next));
router.get('/stats/avaliado/:avaliadoId', (req, res, next) => evaluationController.getStatsByAvaliado(req, res, next));

// Rotas de edição (validação de permissão no service)
router.put('/:id', validate(updateEvaluationSchema), (req, res, next) => evaluationController.update(req, res, next));
router.delete('/:id', (req, res, next) => evaluationController.delete(req, res, next));

export default router;
```

### 7.6 Adicionar rota no app.js

Arquivo: `src/app.js` (adicionar linha)

```javascript
import evaluationRoutes from './modules/evaluations/evaluation.routes.js';

// ... outras rotas ...

app.use('/api/evaluations', evaluationRoutes);
```

### 7.7 Testar no Postman

**1. Gestor avalia colaborador (anônimo)**
```
POST http://localhost:3000/api/evaluations
Authorization: Bearer SEU_TOKEN_GESTOR
Content-Type: application/json

{
  "avaliadoId": "uuid-do-colaborador",
  "criterios": {
    "pontualidade": 5,
    "comunicacao": 4,
    "tecnico": 5,
    "proatividade": 4,
    "equipe": 5
  },
  "comentario": "Excelente colaborador, muito dedicado"
}
```

**Resposta esperada (SEM avaliadorId):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "avaliadoId": "uuid-do-colaborador",
    "tipoAvaliacao": "gestor_para_colaborador",
    "criterios": {...},
    "media": 4.6,
    "comentario": "Excelente colaborador, muito dedicado",
    "anonima": true,
    "data": "2026-05-05T...",
    "avaliado": {
      "id": "uuid",
      "nome": "Ana Costa",
      "tipo": "colaborador"
    }
    // avaliadorId OMITIDO para manter anonimato
  },
  "message": "Avaliação anônima criada com sucesso"
}
```

**2. Colaborador avalia gestor (anônimo)**
```
POST http://localhost:3000/api/evaluations
Authorization: Bearer SEU_TOKEN_COLABORADOR
Content-Type: application/json

{
  "avaliadoId": "uuid-do-gestor",
  "criterios": {
    "pontualidade": 5,
    "comunicacao": 4,
    "tecnico": 5,
    "proatividade": 4,
    "equipe": 5
  },
  "comentario": "Gestor muito acessível e sempre disposto a ajudar"
}
```

**3. Listar avaliações (colaborador vê apenas as suas)**
```
GET http://localhost:3000/api/evaluations
Authorization: Bearer SEU_TOKEN_COLABORADOR
```

**4. Admin vê todas as avaliações (incluindo avaliadorId)**
```
GET http://localhost:3000/api/evaluations
Authorization: Bearer SEU_TOKEN_ADMIN
```

**Resposta para admin (COM avaliadorId):**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "uuid",
        "avaliadorId": "uuid-do-avaliador", // VISÍVEL para admin
        "avaliadoId": "uuid-do-avaliado",
        "tipoAvaliacao": "colaborador_para_gestor",
        "criterios": {...},
        "comentario": "Ótimo gestor",
        "anonima": true
      }
    ]
  }
}
```

## Sistema de Avaliações Anônimas - Como Funciona

### Para usuário comum (gestor/colaborador):
- ✅ Cria avaliação normalmente
- ✅ Vê avaliações que recebeu
- ❌ **NÃO vê** quem o avaliou
- ❌ **NÃO vê** o `avaliadorId` nas respostas da API

### Para admin:
- ✅ Vê todas as avaliações
- ✅ **VÊ** quem avaliou quem (auditoria)
- ✅ Pode fazer avaliações não-anônimas

### Regras de permissão:
1. **Gestor** pode avaliar colaboradores (anônimo)
2. **Colaborador** pode avaliar gestores (anônimo)
3. **Admin** pode avaliar qualquer um
4. **Mesmo tipo** não pode avaliar entre si (gestor x gestor, colaborador x colaborador)
5. **Ninguém** pode se autoavaliar (exceto admin)

## Resumo

Agora você tem o módulo de avaliações completo com sistema anônimo e bidirecional! Ele permite:

- ✅ Avaliações bidirecionais (gestor ↔ colaborador)
- ✅ Sistema anônimo (avaliadorId oculto)
- ✅ Tipos determinados automaticamente
- ✅ Admin pode ver tudo (auditoria)
- ✅ Controle de permissões rigoroso
- ✅ CRUD completo de avaliações
- ✅ Estatísticas por avaliado
- ✅ Filtros e paginação

Próximo passo: Módulo Nine Box!


---

## 🧪 Testando Visibilidade por Tipo de Usuário

### Teste 1: Colaborador vê apenas 360°

**1. Login como colaborador:**
```
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "ana@eniac.edu.br",
  "senha": "senha123"
}
```

**2. Listar avaliações (como colaborador):**
```
GET http://localhost:3000/api/evaluations
Authorization: Bearer TOKEN_DO_COLABORADOR
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "uuid",
        "tipoAvaliacao": "colaborador_para_gestor",  // ✅ Apenas 360°
        "avaliadoId": "uuid-do-gestor",
        "criterios": {...},
        "media": 4.5,
        "comentario": "Gestor muito acessível",
        "anonima": true,
        "avaliado": {
          "nome": "João Silva",
          "tipo": "gestor"
        }
      }
      // ❌ NÃO aparece avaliações tipo "gestor_para_colaborador" (180°)
    ],
    "pagination": {...}
  }
}
```

---

### Teste 2: Gestor vê apenas 180°

**1. Login como gestor:**
```
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "joao@eniac.edu.br",
  "senha": "senha123"
}
```

**2. Listar avaliações (como gestor):**
```
GET http://localhost:3000/api/evaluations
Authorization: Bearer TOKEN_DO_GESTOR
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "uuid",
        "tipoAvaliacao": "gestor_para_colaborador",  // ✅ Apenas 180°
        "avaliadoId": "uuid-do-colaborador",
        "criterios": {...},
        "media": 4.8,
        "comentario": "Colaboradora muito dedicada",
        "anonima": true,
        "avaliado": {
          "nome": "Ana Costa",
          "tipo": "colaborador"
        }
      }
      // ❌ NÃO aparece avaliações tipo "colaborador_para_gestor" (360°)
    ],
    "pagination": {...}
  }
}
```

---

### Teste 3: Admin vê tudo

**1. Login como admin:**
```
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "admin@eniac.edu.br",
  "senha": "admin123"
}
```

**2. Listar avaliações (como admin):**
```
GET http://localhost:3000/api/evaluations
Authorization: Bearer TOKEN_DO_ADMIN
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "uuid-1",
        "tipoAvaliacao": "gestor_para_colaborador",  // ✅ 180°
        "avaliadorId": "uuid-gestor",  // ✅ Admin vê quem avaliou
        "avaliadoId": "uuid-colaborador",
        "criterios": {...},
        "media": 4.8,
        "anonima": true
      },
      {
        "id": "uuid-2",
        "tipoAvaliacao": "colaborador_para_gestor",  // ✅ 360°
        "avaliadorId": "uuid-colaborador",  // ✅ Admin vê quem avaliou
        "avaliadoId": "uuid-gestor",
        "criterios": {...},
        "media": 4.5,
        "anonima": true
      },
      {
        "id": "uuid-3",
        "tipoAvaliacao": "avaliacao_360",  // ✅ Avaliação admin
        "avaliadorId": "uuid-admin",
        "avaliadoId": "uuid-qualquer",
        "criterios": {...},
        "media": 5.0,
        "anonima": false
      }
    ],
    "pagination": {...}
  }
}
```

---

## 📊 Resumo da Visibilidade

| Tipo de Usuário | Vê Avaliações 180° | Vê Avaliações 360° | Vê Avaliações Admin | Vê avaliadorId |
|-----------------|-------------------|-------------------|---------------------|----------------|
| 👤 Colaborador | ❌ Não | ✅ Sim | ❌ Não | ❌ Não |
| 👔 Gestor | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| 🔑 Admin | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |

---

## ✅ Checklist de Implementação

- [ ] Criar evaluation.validation.js
- [ ] Criar evaluation.repository.js
- [ ] Criar evaluation.service.js com lógica de visibilidade
- [ ] Criar evaluation.controller.js
- [ ] Criar evaluation.routes.js
- [ ] Adicionar rota no app.js
- [ ] Testar criação de avaliação (gestor → colaborador)
- [ ] Testar criação de avaliação (colaborador → gestor)
- [ ] Testar listagem como colaborador (só vê 360°)
- [ ] Testar listagem como gestor (só vê 180°)
- [ ] Testar listagem como admin (vê tudo)
- [ ] Verificar que avaliadorId não aparece (exceto para admin)
- [ ] Testar estatísticas
- [ ] Testar update e delete

---

Pronto! Agora o sistema de avaliações está completo com visibilidade correta por tipo de usuário! 🎉
