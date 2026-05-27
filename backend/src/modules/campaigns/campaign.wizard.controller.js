import { CampaignWizardService } from './campaign.wizard.service.js';

const campaignWizardService = new CampaignWizardService();

class CampaignWizardController {
  async startWizard(req, res, next) {
    try {
      const result = await campaignWizardService.startWizard(req.body, req.user.tipo);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateWizardStep(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { step } = req.body;
      const result = await campaignWizardService.updateWizardStep(sessionId, step, req.body, req.user.tipo);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getWizardSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const result = await campaignWizardService.getWizardSession(sessionId, req.user.tipo);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async completeWizard(req, res, next) {
    try {
      const { sessionId } = req.params;
      const result = await campaignWizardService.completeWizard(sessionId, req.user.tipo);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async cancelWizard(req, res, next) {
    try {
      const { sessionId } = req.params;
      const result = await campaignWizardService.cancelWizard(sessionId, req.user.tipo);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export { CampaignWizardController };
