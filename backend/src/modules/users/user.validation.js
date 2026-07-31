import Joi from 'joi';

// ─── helpers reutilizáveis ────────────────────────────────────────────────────
const emailField = Joi.string()
  .email({ tlds: { allow: false } })
  .pattern(/\.edu\.br$/i)
  .required()
  .messages({
    'string.base':         'E-mail deve ser um texto.',
    'string.empty':        'E-mail é obrigatório.',
    'string.email':        'E-mail inválido. Verifique o formato (ex: nome@faculdade.edu.br).',
    'string.pattern.base': 'E-mail institucional obrigatório. Use seu e-mail com domínio .edu.br.',
    'any.required':        'E-mail é obrigatório.',
  });

const senhaField = Joi.string()
  .min(6)
  .required()
  .messages({
    'string.base':   'Senha deve ser um texto.',
    'string.empty':  'Senha é obrigatória.',
    'string.min':    'Senha muito curta. Use pelo menos 6 caracteres.',
    'any.required':  'Senha é obrigatória.',
  });

const raField = Joi.string()
  .min(5)
  .max(10)
  .required()
  .messages({
    'string.base':   'RA deve ser um texto.',
    'string.empty':  'RA é obrigatório.',
    'string.min':    'RA inválido. Deve ter entre 5 e 10 caracteres.',
    'string.max':    'RA inválido. Deve ter entre 5 e 10 caracteres.',
    'any.required':  'RA é obrigatório.',
  });

const nomeField = Joi.string()
  .min(3)
  .required()
  .messages({
    'string.base':   'Nome deve ser um texto.',
    'string.empty':  'Nome é obrigatório.',
    'string.min':    'Nome muito curto. Use pelo menos 3 caracteres.',
    'any.required':  'Nome é obrigatório.',
  });

// ─── Schemas ─────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  ra: raField,

  nome: nomeField,

  email: emailField,

  senha: senhaField,

  tipo: Joi.string()
    .valid('gestor', 'colaborador')
    .required()
    .messages({
      'string.base':    'Tipo deve ser um texto.',
      'string.empty':   'Tipo é obrigatório.',
      'any.only':       'Tipo inválido. Use "gestor" ou "colaborador".',
      'any.required':   'Tipo é obrigatório.',
    }),

  cargo: Joi.string()
    .min(2)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Cargo muito curto. Use pelo menos 2 caracteres.',
    }),

  departamento: Joi.string()
    .min(2)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Departamento muito curto. Use pelo menos 2 caracteres.',
    }),

  // gestorId é permitido e repassado ao service (não stripped)
  gestorId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'ID do gestor inválido.',
    }),

  foto: Joi.string()
    .optional()
    .allow('', null),
});

const loginSchema = Joi.object({
  email: emailField,
  senha: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória.',
      'any.required': 'Senha é obrigatória.',
    }),
});

// Schema para o admin editar qualquer usuário
const updateUserSchema = Joi.object({
  nome: Joi.string()
    .min(3)
    .optional()
    .messages({
      'string.empty': 'Nome não pode ficar vazio.',
      'string.min':   'Nome muito curto. Use pelo menos 3 caracteres.',
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/\.edu\.br$/i)
    .optional()
    .messages({
      'string.email':        'E-mail inválido.',
      'string.pattern.base': 'E-mail institucional obrigatório (domínio .edu.br).',
    }),

  cargo: Joi.string()
    .min(2)
    .optional()
    .allow('', null)
    .messages({
      'string.min': 'Cargo muito curto.',
    }),

  departamento: Joi.string()
    .min(2)
    .optional()
    .allow('', null)
    .messages({
      'string.min': 'Departamento muito curto.',
    }),

  tipo: Joi.string()
    .valid('gestor', 'colaborador')
    .optional()
    .messages({
      'any.only': 'Tipo inválido. Use "gestor" ou "colaborador".',
    }),

  gestorId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'ID do gestor inválido.',
    }),

  foto: Joi.string()
    .optional()
    .allow('', null),
}).min(1).messages({
  'object.min': 'Informe pelo menos um campo para atualizar.',
});

// Schema para atualização do próprio perfil (admin)
const updateProfileSchema = Joi.object({
  nome: Joi.string()
    .min(3)
    .optional()
    .messages({
      'string.empty': 'Nome não pode ficar vazio.',
      'string.min':   'Nome muito curto. Use pelo menos 3 caracteres.',
    }),

  cargo: Joi.string()
    .optional()
    .allow('', null),

  departamento: Joi.string()
    .optional()
    .allow('', null),

  foto: Joi.string()
    .optional()
    .allow('', null),
});

export {
  registerSchema,
  loginSchema,
  updateUserSchema,
  updateProfileSchema,
};
