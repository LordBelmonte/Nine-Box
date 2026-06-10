import express from 'express';
import { EvaluationController } from './evaluation.controller.js';
import { DashboardController } from './evaluation.dashboard.controller.js';
import { authMiddleware, isGestorOrAdminMiddleware, isAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createEvaluationSchema, updateEvaluationSchema } from './evaluation.validation.js';

const router = express.Router();
const evaluationController = new EvaluationController();
const dashboardController = new DashboardController();

router.use(authMiddleware);

// Rotas de Dashboard
router.get('/dashboard/colaborador', (req, res, next) =>
  dashboardController.getColaboradorDashboard(req, res, next)
);
router.get('/dashboard/gestor', (req, res, next) =>
  dashboardController.getGestorDashboard(req, res, next)
);
router.get('/dashboard/admin', (req, res, next) =>
  dashboardController.getAdminDashboard(req, res, next)
);

// Rotas específicas antes das genéricas
router.get('/stats/avaliado/:avaliadoId', (req, res, next) =>
  evaluationController.getStatsByAvaliado(req, res, next)
);
router.get('/avaliado/:avaliadoId', (req, res, next) =>
  evaluationController.findByAvaliado(req, res, next)
);
router.get('/avaliador/:avaliadorId', (req, res, next) =>
  evaluationController.findByAvaliador(req, res, next)
);
router.get('/campanha/:campaignId', (req, res, next) =>
  evaluationController.findByCampaign(req, res, next)
);

router.get('/', isAdminMiddleware, (req, res, next) => evaluationController.findAll(req, res, next));
router.get('/:id', (req, res, next) => evaluationController.findById(req, res, next));

// Criar avaliação (resposta): gestor, admin e colaborador (dependendo do tipoAlvo da campanha)
router.post('/', validate(createEvaluationSchema), (req, res, next) =>
  evaluationController.create(req, res, next)
);
router.put('/:id', isGestorOrAdminMiddleware, validate(updateEvaluationSchema), (req, res, next) =>
  evaluationController.update(req, res, next)
);
router.delete('/:id', isGestorOrAdminMiddleware, (req, res, next) =>
  evaluationController.delete(req, res, next)
);

export default router;
