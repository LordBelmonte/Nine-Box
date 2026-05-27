import { DashboardService } from './evaluation.dashboard.service.js';

const dashboardService = new DashboardService();

class DashboardController {
  async getColaboradorDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getColaboradorDashboard(
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getGestorDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getGestorDashboard(
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getAdminDashboard(req.user.tipo);
      return res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }
}

export { DashboardController };
