import express from 'express';
import { EvaluationController } from './evaluation.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createEvaluationSchema, updateEvaluationSchema } from './evaluation.validation.js';

const router = express.Router();
const evaluationController = new EvaluationController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas públicas (autenticadas) - validação de permissão no service
// IMPORTANTE: Rotas específicas ANTES de rotas genéricas para evitar conflitos
router.get('/stats/avaliado/:avaliadoId', (req, res, next) => evaluationController.getStatsByAvaliado(req, res, next));
router.get('/avaliado/:avaliadoId', (req, res, next) => evaluationController.findByAvaliado(req, res, next));
router.get('/avaliador/:avaliadorId', (req, res, next) => evaluationController.findByAvaliador(req, res, next));
router.get('/', (req, res, next) => evaluationController.findAll(req, res, next));
router.get('/:id', (req, res, next) => evaluationController.findById(req, res, next));
router.post('/', validate(createEvaluationSchema), (req, res, next) => evaluationController.create(req, res, next));

// Rotas de edição (validação de permissão no service)
router.put('/:id', validate(updateEvaluationSchema), (req, res, next) => evaluationController.update(req, res, next));
router.delete('/:id', (req, res, next) => evaluationController.delete(req, res, next));

export default router;
