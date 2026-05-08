import { EvaluationRepository } from './evaluation.repository.js';
import { EvaluationService } from './evaluation.service.js';

const evaluationRepository = new EvaluationRepository();
const evaluationService = new EvaluationService(evaluationRepository);

class EvaluationController {
  async create(req, res, next) {
    try {
      const evaluation = await evaluationService.create(
        req.user.userId, 
        req.user.tipo, 
        req.body
      );
      return res.status(201).json({
        success: true,
        data: evaluation,
        message: 'Avaliação anônima criada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const evaluation = await evaluationService.findById(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, tipoAvaliacao, avaliadoId } = req.query;
      const result = await evaluationService.findAll(
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          tipoAvaliacao,
          avaliadoId
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

  async findByAvaliado(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await evaluationService.findByAvaliado(
        req.params.avaliadoId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10
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

  async findByAvaliador(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await evaluationService.findByAvaliador(
        req.params.avaliadorId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10
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

  async update(req, res, next) {
    try {
      const evaluation = await evaluationService.update(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: evaluation,
        message: 'Avaliação atualizada com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await evaluationService.delete(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatsByAvaliado(req, res, next) {
    try {
      const stats = await evaluationService.getStatsByAvaliado(
        req.params.avaliadoId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

export { EvaluationController };
