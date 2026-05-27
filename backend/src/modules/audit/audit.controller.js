import { AuditService } from './audit.service.js';

const auditService = new AuditService();

class AuditController {
  async getAuditLogs(req, res, next) {
    try {
      const result = await auditService.getAuditLogs(req.query, req.user.tipo);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getEvaluationHistory(req, res, next) {
    try {
      const { evaluationId } = req.params;
      const result = await auditService.getEvaluationHistory(evaluationId, req.user.tipo);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export { AuditController };
