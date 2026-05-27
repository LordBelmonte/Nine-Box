import express from 'express';
import { ExportController } from './export.controller.js';
import { isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const exportController = new ExportController();

router.use(isGestorOrAdminMiddleware);

router.get('/evaluations/:campaignId/csv', (req, res, next) =>
  exportController.exportEvaluationsCSV(req, res, next)
);
router.get('/evaluations/:campaignId/json', (req, res, next) =>
  exportController.exportEvaluationsJSON(req, res, next)
);
router.get('/dashboard/stats', (req, res, next) =>
  exportController.exportDashboardStats(req, res, next)
);

export default router;
