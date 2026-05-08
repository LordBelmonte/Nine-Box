import Joi from 'joi';

export const createNineBoxSchema = Joi.object({
  pessoaId: Joi.string().uuid().required().messages({
    'string.empty': 'ID da pessoa é obrigatório',
    'string.uuid': 'ID da pessoa deve ser um UUID válido',
    'any.required': 'ID da pessoa é obrigatório'
  }),
  performance: Joi.number().integer().min(1).max(3).required().messages({
    'number.base': 'Performance deve ser um número',
    'number.min': 'Performance deve ser no mínimo 1 (Baixo)',
    'number.max': 'Performance deve ser no máximo 3 (Alto)',
    'any.required': 'Performance é obrigatória'
  }),
  potential: Joi.number().integer().min(1).max(3).required().messages({
    'number.base': 'Potential deve ser um número',
    'number.min': 'Potential deve ser no mínimo 1 (Baixo)',
    'number.max': 'Potential deve ser no máximo 3 (Alto)',
    'any.required': 'Potential é obrigatório'
  }),
  comentario: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Comentário deve ter no máximo 500 caracteres'
  })
});

export const updateNineBoxSchema = Joi.object({
  performance: Joi.number().integer().min(1).max(3).messages({
    'number.base': 'Performance deve ser um número',
    'number.min': 'Performance deve ser no mínimo 1 (Baixo)',
    'number.max': 'Performance deve ser no máximo 3 (Alto)'
  }),
  potential: Joi.number().integer().min(1).max(3).messages({
    'number.base': 'Potential deve ser um número',
    'number.min': 'Potential deve ser no mínimo 1 (Baixo)',
    'number.max': 'Potential deve ser no máximo 3 (Alto)'
  }),
  comentario: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Comentário deve ter no máximo 500 caracteres'
  })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});
