import express from 'express';
import { CampaignWizardController } from './campaign.wizard.controller.js';
import { isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const campaignWizardController = new CampaignWizardController();

router.use(isGestorOrAdminMiddleware);

router.post('/start', (req, res, next) =>
  campaignWizardController.startWizard(req, res, next)
);
router.put('/:sessionId/step', (req, res, next) =>
  campaignWizardController.updateWizardStep(req, res, next)
);
router.get('/:sessionId', (req, res, next) =>
  campaignWizardController.getWizardSession(req, res, next)
);
router.post('/:sessionId/complete', (req, res, next) =>
  campaignWizardController.completeWizard(req, res, next)
);
router.delete('/:sessionId', (req, res, next) =>
  campaignWizardController.cancelWizard(req, res, next)
);

export default router;
