import Joi from 'joi';

const createCampaignSchema = Joi.object({
  nome: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Nome da campanha é obrigatório',
      'string.min': 'Nome da campanha deve ter pelo menos 3 caracteres',
      'string.max': 'Nome da campanha não pode exceder 200 caracteres'
    }),
  descricao: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Descrição não pode exceder 1000 caracteres'
    }),
  dataInicio: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Data de início deve ser válida',
      'date.iso': 'Use formato ISO (YYYY-MM-DD)'
    }),
  dataFim: Joi.date()
    .iso()
    .greater(Joi.ref('dataInicio'))
    .required()
    .messages({
      'date.base': 'Data de fim deve ser válida',
      'date.iso': 'Use formato ISO (YYYY-MM-DD)',
      'date.greater': 'Data de fim deve ser depois da data de início'
    }),
  tipoAlvo: Joi.string()
    .valid('colaborador', 'gestor', 'todos')
    .required()
    .messages({
      'any.only': 'tipoAlvo deve ser: colaborador, gestor ou todos'
    }),
  competencyIds: Joi.array()
    .items(Joi.string().uuid({ version: 'uuidv4' }))
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'Campanha deve ter pelo menos 1 competência',
      'array.max': 'Campanha não pode ter mais de 20 competências',
      'string.guid': 'IDs de competências devem ser UUIDs válidos'
    }),
  gestorIds: Joi.array()
    .items(Joi.string().uuid({ version: 'uuidv4' }))
    .optional()
    .default([])
    .messages({
      'string.guid': 'IDs de gestores devem ser UUIDs válidos'
    })
  ,
  gestorColaboradores: Joi.object()
    .pattern(
      Joi.string().uuid({ version: 'uuidv4' }),
      Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).min(1)
    )
    .optional()
    .default({})
    .messages({
      'object.base': 'gestorColaboradores deve ser um objeto',
      'string.guid': 'IDs devem ser UUIDs válidos',
      'array.min': 'Cada gestor deve possuir pelo menos 1 colaborador'
    })
});

const updateCampaignSchema = Joi.object({
  nome: Joi.string().trim().min(3).max(150).optional(),
  descricao: Joi.string().trim().max(500).optional().allow('', null),
  dataInicio: Joi.date().iso().optional(),
  dataFim: Joi.date().iso().optional(),
  tipoAlvo: Joi.string().valid('colaborador', 'gestor', 'todos').optional(),
  competencyIds: Joi.array().items(Joi.string().uuid()).min(1).max(20).optional(),
  gestorIds: Joi.array().items(Joi.string().uuid()).optional()
  ,
  gestorColaboradores: Joi.object()
    .pattern(
      Joi.string().uuid(),
      Joi.array().items(Joi.string().uuid())
    )
    .optional()
    .default({})
    .messages({
      'object.base': 'gestorColaboradores deve ser um objeto',
      'string.guid': 'IDs devem ser UUIDs válidos'
    })
}).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('ativa', 'finalizada').required()
});

export { createCampaignSchema, updateCampaignSchema, updateStatusSchema };
