import { TemplateRepository } from './template.repository.js';
import { TemplateService } from './template.service.js';

const templateRepository = new TemplateRepository();
const templateService = new TemplateService(templateRepository);

class TemplateController {
  async create(req, res, next) {
    try {
      const template = await templateService.create(
        req.body,
        req.user.tipo
      );
      return res.status(201).json({
        success: true,
        data: template,
        message: 'Modelo de avaliação criado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const template = await templateService.findById(
        req.params.id,
        req.user.tipo
      );
      return res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { tipo, page, limit } = req.query;
      const result = await templateService.findAll(
        { tipo, page: parseInt(page) || 1, limit: parseInt(limit) || 10 },
        req.user.tipo
      );
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const template = await templateService.update(
        req.params.id,
        req.body,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: template,
        message: 'Modelo de avaliação atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await templateService.delete(
        req.params.id,
        req.user.tipo
      );
      return res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

export { TemplateController };
