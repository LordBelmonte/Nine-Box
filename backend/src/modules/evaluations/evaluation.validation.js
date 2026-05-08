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
