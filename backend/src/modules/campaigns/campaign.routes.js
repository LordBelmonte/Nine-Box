import express from 'express';
import { CampaignController } from './campaign.controller.js';
import { authMiddleware, isAdminMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createCampaignSchema, updateCampaignSchema, updateStatusSchema } from './campaign.validation.js';

const router = express.Router();
const campaignController = new CampaignController();

router.use(authMiddleware);

// Gestor vê campanhas ativas atribuídas a ele (próprio ou especificado pelo admin)
router.get('/ativas/gestor', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.findActiveForGestor(req, res, next)
);
router.get('/ativas/gestor/:gestorId', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.findActiveForGestor(req, res, next)
);

// Progresso de uma campanha para um gestor
router.get('/:id/progresso', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.getCampaignProgress(req, res, next)
);
router.get('/:id/progresso/:gestorId', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.getCampaignProgress(req, res, next)
);

// Listar gestores responsáveis por uma campanha
router.get('/:id/gestores', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.getResponsavelGestores(req, res, next)
);

// Listar colaboradores não avaliados ainda nesta campanha por um gestor
router.get('/:id/colaboradores-nao-avaliados/:gestorId', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.getColaboradoresNaoAvaliados(req, res, next)
);

// Listar campanhas pendentes para colaborador
router.get('/colaborador/pendentes', authMiddleware, (req, res, next) =>
  campaignController.getPendingCampaignsForColaborador(req, res, next)
);

// Listar campanhas pendentes para gestor
router.get('/gestor/pendentes', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.getPendingCampaignsForGestor(req, res, next)
);

// CRUD de campanhas
router.get('/', isGestorOrAdminMiddleware, (req, res, next) =>
  campaignController.findAll(req, res, next)
);
router.get('/:id', authMiddleware, (req, res, next) =>
  campaignController.findById(req, res, next)
);
router.post('/', isAdminMiddleware, validate(createCampaignSchema), (req, res, next) =>
  campaignController.create(req, res, next)
);
router.put('/:id', isAdminMiddleware, validate(updateCampaignSchema), (req, res, next) =>
  campaignController.update(req, res, next)
);
router.patch('/:id/status', isAdminMiddleware, validate(updateStatusSchema), (req, res, next) =>
  campaignController.updateStatus(req, res, next)
);
router.delete('/:id', isAdminMiddleware, (req, res, next) =>
  campaignController.delete(req, res, next)
);

export default router;
