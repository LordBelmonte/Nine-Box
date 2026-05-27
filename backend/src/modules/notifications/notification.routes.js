import express from 'express';
import { NotificationController } from './notification.controller.js';
import { isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const notificationController = new NotificationController();

router.use(isGestorOrAdminMiddleware);

router.post('/assign', (req, res, next) =>
  notificationController.notifyEvaluationAssigned(req, res, next)
);
router.post('/reminder', (req, res, next) =>
  notificationController.notifyEvaluationReminder(req, res, next)
);
router.post('/campaign/:campaignId/completed', (req, res, next) =>
  notificationController.notifyCampaignCompleted(req, res, next)
);
router.get('/queue', (req, res, next) =>
  notificationController.getNotificationQueue(req, res, next)
);
router.post('/campaign/:campaignId/batch', (req, res, next) =>
  notificationController.sendBatchNotifications(req, res, next)
);

export default router;
