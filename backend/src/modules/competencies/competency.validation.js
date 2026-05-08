import Joi from 'joi';

const createCompetencySchema = Joi.object({
  nome: Joi.string().min(3).max(100).required(),
  descricao: Joi.string().min(10).max(500).required(),
  tipo: Joi.string().valid('desempenho', 'comportamento', 'tecnica', 'lideranca').required(),
  competenciaDe: Joi.string().valid('gestor', 'colaborador', 'todos').required(),
  criterios: Joi.array().items(Joi.string().min(5).max(300)).min(1).max(10).required()
});

const updateCompetencySchema = Joi.object({
  nome: Joi.string().min(3).max(100).optional(),
  descricao: Joi.string().min(10).max(500).optional(),
  tipo: Joi.string().valid('desempenho', 'comportamento', 'tecnica', 'lideranca').optional(),
  competenciaDe: Joi.string().valid('gestor', 'colaborador', 'todos').optional(),
  criterios: Joi.array().items(Joi.string().min(5).max(300)).min(1).max(10).optional()
});

export {
  createCompetencySchema,
  updateCompetencySchema
};
