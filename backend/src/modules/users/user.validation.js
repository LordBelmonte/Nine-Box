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
