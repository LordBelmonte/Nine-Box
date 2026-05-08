import { CompetencyRepository } from './competency.repository.js';
import { CompetencyService } from './competency.service.js';

const competencyRepository = new CompetencyRepository();
const competencyService = new CompetencyService(competencyRepository);

class CompetencyController {
  async create(req, res, next) {
    try {
      const competency = await competencyService.create(req.body, req.user.tipo);
      return res.status(201).json({
        success: true,
        data: competency,
        message: 'Competência criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const competency = await competencyService.findById(req.params.id);
      return res.json({
        success: true,
        data: competency
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, tipo, competenciaDe, search } = req.query;
      const result = await competencyService.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        tipo,
        competenciaDe,
        search
      });
      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async findByTipo(req, res, next) {
    try {
      const competencies = await competencyService.findByTipo(req.params.tipo);
      return res.json({
        success: true,
        data: competencies
      });
    } catch (error) {
      next(error);
    }
  }

  async findByCompetenciaDe(req, res, next) {
    try {
      const competencies = await competencyService.findByCompetenciaDe(req.params.competenciaDe);
      return res.json({
        success: true,
        data: competencies
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const competency = await competencyService.update(
        req.params.id,
        req.body,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: competency,
        message: 'Competência atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await competencyService.delete(req.params.id, req.user.tipo);
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await competencyService.getStats();
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export { CompetencyController };
