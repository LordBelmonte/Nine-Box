import { CampaignRepository } from './campaign.repository.js';
import { CampaignService } from './campaign.service.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';

const campaignRepository = new CampaignRepository();
const evaluationRepository = new EvaluationRepository();
const campaignService = new CampaignService(campaignRepository, evaluationRepository);

class CampaignController {
  async create(req, res, next) {
    try {
      const campaign = await campaignService.create(req.body, req.user.tipo);
      return res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campanha criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await campaignService.findAll(
        { page: parseInt(page) || 1, limit: parseInt(limit) || 10, status },
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const campaign = await campaignService.findById(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: campaign });
    } catch (error) {
      next(error);
    }
  }

  async findActiveForGestor(req, res, next) {
    try {
      const gestorId = req.params.gestorId || req.user.userId;
      const campaigns = await campaignService.findActiveForGestor(
        gestorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: campaigns });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const campaign = await campaignService.update(
        req.params.id,
        req.body,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: campaign,
        message: 'Campanha atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const campaign = await campaignService.updateStatus(
        req.params.id,
        status,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: campaign,
        message: `Status da campanha atualizado para '${status}'`
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await campaignService.delete(req.params.id, req.user.tipo);
      return res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getCampaignProgress(req, res, next) {
    try {
      const gestorId = req.params.gestorId || req.user.userId;
      const progress = await campaignService.getCampaignProgress(
        req.params.id,
        gestorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async getResponsavelGestores(req, res, next) {
    try {
      const gestores = await campaignService.getResponsavelGestores(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: gestores });
    } catch (error) {
      next(error);
    }
  }

  async getColaboradoresNaoAvaliados(req, res, next) {
    try {
      const colaboradores = await campaignService.getColaboradoresNaoAvaliados(
        req.params.id,
        req.params.gestorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: colaboradores });
    } catch (error) {
      next(error);
    }
  }

  async getPendingCampaignsForColaborador(req, res, next) {
    try {
      const campaigns = await campaignService.getPendingCampaignsForColaborador(
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: campaigns });
    } catch (error) {
      next(error);
    }
  }

  async getPendingCampaignsForGestor(req, res, next) {
    try {
      const campaigns = await campaignService.getPendingCampaignsForGestor(
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: campaigns });
    } catch (error) {
      next(error);
    }
  }
}

export { CampaignController };
