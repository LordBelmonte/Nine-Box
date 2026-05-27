import express from 'express';
import { AuditController } from './audit.controller.js';
import { isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const auditController = new AuditController();

router.use(isGestorOrAdminMiddleware);

router.get('/', (req, res, next) =>
  auditController.getAuditLogs(req, res, next)
);
router.get('/evaluation/:evaluationId', (req, res, next) =>
  auditController.getEvaluationHistory(req, res, next)
);

export default router;
