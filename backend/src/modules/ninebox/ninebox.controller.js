import { NineBoxRepository } from './ninebox.repository.js';
import { NineBoxService } from './ninebox.service.js';

const nineBoxRepository = new NineBoxRepository();
const nineBoxService = new NineBoxService(nineBoxRepository);

class NineBoxController {
  async create(req, res, next) {
    try {
      const nineBox = await nineBoxService.create(req.body, req.user.tipo);
      return res.status(201).json({
        success: true,
        data: nineBox,
        message: 'Avaliação Nine Box criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const nineBox = await nineBoxService.findById(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: nineBox
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, categoria, pessoaId } = req.query;
      const result = await nineBoxService.findAll(
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          categoria,
          pessoaId
        },
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async findByPessoa(req, res, next) {
    try {
      const nineBoxes = await nineBoxService.findByPessoa(
        req.params.pessoaId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: nineBoxes
      });
    } catch (error) {
      next(error);
    }
  }

  async findLatestByPessoa(req, res, next) {
    try {
      const nineBox = await nineBoxService.findLatestByPessoa(
        req.params.pessoaId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: nineBox
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const nineBox = await nineBoxService.update(
        req.params.id,
        req.body,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: nineBox,
        message: 'Avaliação Nine Box atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await nineBoxService.delete(req.params.id, req.user.userId, req.user.tipo);
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getGridDistribution(req, res, next) {
    try {
      const distribution = await nineBoxService.getGridDistribution(req.user.tipo);
      return res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatsByTipo(req, res, next) {
    try {
      const stats = await nineBoxService.getStatsByTipo(req.user.tipo);
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateForPerson(req, res, next) {
    try {
      const { pessoaId } = req.params;
      const nineBox = await nineBoxService.calculateNineBoxFromEvaluations(pessoaId);
      return res.json({
        success: true,
        data: nineBox
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateForTeam(req, res, next) {
    try {
      const gestorId = req.user.userId;
      const teamNineBox = await nineBoxService.calculateTeamNineBox(gestorId);
      return res.json({
        success: true,
        data: teamNineBox
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateAll(req, res, next) {
    try {
      const allNineBoxes = await nineBoxService.calculateAllNineBoxes();
      return res.json({
        success: true,
        data: allNineBoxes
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== NOVOS ENDPOINTS PARA RELATÓRIO MODAL ==========

  async getReportIndividual(req, res, next) {
    try {
      const { evaluationId, pessoaId } = req.params;
      const report = await nineBoxService.getReportIndividual(
        evaluationId,
        pessoaId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportConsolidated(req, res, next) {
    try {
      const { evaluationId } = req.params;
      const report = await nineBoxService.getReportConsolidated(
        evaluationId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== FIM NOVOS ENDPOINTS ==========
}

export { NineBoxController };
