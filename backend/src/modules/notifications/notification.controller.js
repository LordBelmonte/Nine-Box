import { NotificationService } from './notification.service.js';

const notificationService = new NotificationService();

class NotificationController {
  async notifyEvaluationAssigned(req, res, next) {
    try {
      const { campaignId, avaliadoId } = req.body;
      const result = await notificationService.notifyEvaluationAssigned(campaignId, avaliadoId);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async notifyEvaluationReminder(req, res, next) {
    try {
      const { campaignId, avaliadoId } = req.body;
      const result = await notificationService.notifyEvaluationReminder(campaignId, avaliadoId);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async notifyCampaignCompleted(req, res, next) {
    try {
      const { campaignId } = req.params;
      const result = await notificationService.notifyCampaignCompleted(campaignId);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationQueue(req, res, next) {
    try {
      const result = await notificationService.getNotificationQueue();
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendBatchNotifications(req, res, next) {
    try {
      const { campaignId } = req.params;
      const result = await notificationService.sendBatchNotifications(campaignId);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export { NotificationController };
