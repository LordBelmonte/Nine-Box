import Joi from 'joi';

export const createNineBoxSchema = Joi.object({
  pessoaId: Joi.string().uuid().required().messages({
    'string.empty': 'ID da pessoa é obrigatório',
    'string.uuid': 'ID da pessoa deve ser um UUID válido',
    'any.required': 'ID da pessoa é obrigatório'
  }),
  performance: Joi.number().min(1).max(5).required().messages({
    'number.base': 'Performance deve ser um número',
    'number.min': 'Performance deve ser no mínimo 1.0',
    'number.max': 'Performance deve ser no máximo 5.0',
    'any.required': 'Performance é obrigatória'
  }),
  potential: Joi.number().min(1).max(5).required().messages({
    'number.base': 'Potential deve ser um número',
    'number.min': 'Potential deve ser no mínimo 1.0',
    'number.max': 'Potential deve ser no máximo 5.0',
    'any.required': 'Potential é obrigatório'
  }),
  comentario: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Comentário deve ter no máximo 500 caracteres'
  })
});

export const updateNineBoxSchema = Joi.object({
  performance: Joi.number().min(1).max(5).messages({
    'number.base': 'Performance deve ser um número',
    'number.min': 'Performance deve ser no mínimo 1.0',
    'number.max': 'Performance deve ser no máximo 5.0'
  }),
  potential: Joi.number().min(1).max(5).messages({
    'number.base': 'Potential deve ser um número',
    'number.min': 'Potential deve ser no mínimo 1.0',
    'number.max': 'Potential deve ser no máximo 5.0'
  }),
  comentario: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Comentário deve ter no máximo 500 caracteres'
  })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});
