import express from 'express';
import { CompetencyController } from './competency.controller.js';
import { authMiddleware, isAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createCompetencySchema, updateCompetencySchema } from './competency.validation.js';

const router = express.Router();
const competencyController = new CompetencyController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas públicas (autenticadas) - todos podem ver
router.get('/', (req, res, next) => competencyController.findAll(req, res, next));
router.get('/stats', (req, res, next) => competencyController.getStats(req, res, next));
router.get('/tipo/:tipo', (req, res, next) => competencyController.findByTipo(req, res, next));
router.get('/competencia-de/:competenciaDe', (req, res, next) => competencyController.findByCompetenciaDe(req, res, next));
router.get('/:id', (req, res, next) => competencyController.findById(req, res, next));

// Rotas de admin - criar, atualizar e deletar
router.post('/', isAdminMiddleware, validate(createCompetencySchema), (req, res, next) => competencyController.create(req, res, next));
router.put('/:id', isAdminMiddleware, validate(updateCompetencySchema), (req, res, next) => competencyController.update(req, res, next));
router.delete('/:id', isAdminMiddleware, (req, res, next) => competencyController.delete(req, res, next));

export default router;
