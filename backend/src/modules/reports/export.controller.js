import { ExportService } from './export.service.js';

const exportService = new ExportService();

class ExportController {
  async exportEvaluationsCSV(req, res, next) {
    try {
      const { campaignId } = req.params;
      const result = await exportService.exportEvaluationsToCSV(campaignId, req.user.tipo);
      
      res.setHeader('Content-Type', result.type);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.content);
    } catch (error) {
      next(error);
    }
  }

  async exportEvaluationsJSON(req, res, next) {
    try {
      const { campaignId } = req.params;
      const result = await exportService.exportEvaluationsToJSON(campaignId, req.user.tipo);
      
      res.setHeader('Content-Type', result.type);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.content);
    } catch (error) {
      next(error);
    }
  }

  async exportDashboardStats(req, res, next) {
    try {
      const result = await exportService.exportDashboardStats(req.user.tipo, req.user.userId);
      
      res.setHeader('Content-Type', result.type);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.content);
    } catch (error) {
      next(error);
    }
  }
}

export { ExportController };
