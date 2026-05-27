import { AppError } from '../../utils/errors.js';
import { prisma } from '../../config/database.js';

class AuditService {
  async logEvaluationChange(action, evaluationId, userId, userTipo, changes = {}) {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: 'evaluation',
          entityId: evaluationId,
          action,
          userId,
          userTipo,
          changes: JSON.stringify(changes),
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('[AUDIT] Erro ao registrar log:', error);
      // Não lançar erro para não interromper o fluxo principal
    }
  }

  async logCampaignChange(action, campaignId, userId, userTipo, changes = {}) {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: 'campaign',
          entityId: campaignId,
          action,
          userId,
          userTipo,
          changes: JSON.stringify(changes),
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('[AUDIT] Erro ao registrar log:', error);
    }
  }

  async logUserChange(action, targetUserId, userId, userTipo, changes = {}) {
    try {
      await prisma.auditLog.create({
        data: {
          entityType: 'user',
          entityId: targetUserId,
          action,
          userId,
          userTipo,
          changes: JSON.stringify(changes),
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('[AUDIT] Erro ao registrar log:', error);
    }
  }

  async getAuditLogs(filters, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem visualizar logs de auditoria', 403);
    }

    const { entityType, entityId, action, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;
    const where = {};

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        changes: JSON.parse(log.changes)
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async getEvaluationHistory(evaluationId, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem visualizar histórico de avaliações', 403);
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: 'evaluation',
        entityId: evaluationId
      },
      orderBy: { timestamp: 'asc' }
    });

    return logs.map(log => ({
      ...log,
      changes: JSON.parse(log.changes)
    }));
  }
}

export { AuditService };
