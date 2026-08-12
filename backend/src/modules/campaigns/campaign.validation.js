import Joi from 'joi';

/**
 * Retorna a data de hoje à meia-noite (horário local).
 * Chamado por REQUEST para evitar o bug de data fixa no import.
 */
function hoje() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Schema de criação ───────────────────────────────────────────────────────

const createCampaignSchema = Joi.object({
  nome: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Nome da campanha é obrigatório.',
      'string.min':   'Nome deve ter pelo menos 3 caracteres.',
      'string.max':   'Nome não pode exceder 200 caracteres.',
      'any.required': 'Nome da campanha é obrigatório.',
    }),

  descricao: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('', null)
    .messages({ 'string.max': 'Descrição não pode exceder 1000 caracteres.' }),

  // dataInicio: calculado por request para não fixar a data do servidor
  dataInicio: Joi.date()
    .iso()
    .custom((value, helpers) => {
      const dataHoje = hoje();
      if (value < dataHoje) {
        return helpers.error('date.pastDate');
      }
      return value;
    })
    .required()
    .messages({
      'date.base':     'Data de início inválida.',
      'date.iso':      'Use formato ISO (YYYY-MM-DD).',
      'date.pastDate': 'Data de início não pode ser uma data passada.',
      'any.required':  'Data de início é obrigatória.',
    }),

  dataFim: Joi.date()
    .iso()
    .greater(Joi.ref('dataInicio'))
    .required()
    .messages({
      'date.base':    'Data de fim inválida.',
      'date.iso':     'Use formato ISO (YYYY-MM-DD).',
      'date.greater': 'Data de fim deve ser posterior à data de início.',
      'any.required': 'Data de fim é obrigatória.',
    }),

  tipoAlvo: Joi.string()
    .valid('colaborador', 'gestor', 'todos')
    .required()
    .messages({
      'any.only':     'Tipo de avaliado deve ser: colaborador, gestor ou todos.',
      'any.required': 'Tipo de avaliado é obrigatório.',
    }),

  competencyIds: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min':    'A campanha deve ter pelo menos 1 competência.',
      'array.max':    'A campanha pode ter no máximo 20 competências.',
      'any.required': 'Selecione pelo menos uma competência.',
    }),

  gestorIds: Joi.array()
    .items(Joi.string().uuid())
    .optional()
    .default([]),

  gestorColaboradores: Joi.object()
    .pattern(
      Joi.string().uuid(),
      Joi.array().items(Joi.string().uuid()).min(1)
    )
    .optional()
    .default({})
    .messages({
      'object.base': 'gestorColaboradores deve ser um objeto.',
      'array.min':   'Cada gestor deve ter pelo menos 1 colaborador.',
    }),
});

// ─── Schema de atualização ───────────────────────────────────────────────────

const updateCampaignSchema = Joi.object({
  nome: Joi.string().trim().min(3).max(200).optional()
    .messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres.',
      'string.max': 'Nome não pode exceder 200 caracteres.',
    }),

  descricao: Joi.string().trim().max(1000).optional().allow('', null),

  // Na edição, dataInicio pode ser data passada (campanha já criada).
  // Mantemos apenas validação de formato.
  dataInicio: Joi.date().iso().optional()
    .messages({
      'date.base': 'Data de início inválida.',
      'date.iso':  'Use formato ISO (YYYY-MM-DD).',
    }),

  dataFim: Joi.date()
    .iso()
    .when('dataInicio', {
      is: Joi.date().exist(),
      then: Joi.date().greater(Joi.ref('dataInicio')),
      otherwise: Joi.date().optional(),
    })
    .optional()
    .messages({
      'date.base':    'Data de fim inválida.',
      'date.iso':     'Use formato ISO (YYYY-MM-DD).',
      'date.greater': 'Data de fim deve ser posterior à data de início.',
    }),

  tipoAlvo: Joi.string().valid('colaborador', 'gestor', 'todos').optional(),

  competencyIds: Joi.array().items(Joi.string().uuid()).min(1).max(20).optional()
    .messages({
      'array.min': 'A campanha deve ter pelo menos 1 competência.',
      'array.max': 'A campanha pode ter no máximo 20 competências.',
    }),

  gestorIds: Joi.array().items(Joi.string().uuid()).optional(),

  gestorColaboradores: Joi.object()
    .pattern(
      Joi.string().uuid(),
      Joi.array().items(Joi.string().uuid())
    )
    .optional()
    .default({})
    .messages({ 'object.base': 'gestorColaboradores deve ser um objeto.' }),

}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar.' });

// ─── Schema de status ────────────────────────────────────────────────────────

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('ativa', 'finalizada')
    .required()
    .messages({
      'any.only':     'Status deve ser: ativa ou finalizada.',
      'any.required': 'Status é obrigatório.',
    }),
});

export { createCampaignSchema, updateCampaignSchema, updateStatusSchema };
