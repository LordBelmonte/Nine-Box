import express from 'express';
import { ReportsController } from './reports.controller.js';
import { authMiddleware, isAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const reportsController = new ReportsController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas autenticadas (apenas admin)
router.get('/dashboard', isAdminMiddleware, (req, res, next) => reportsController.getDashboardStats(req, res, next));
router.get('/user/:userId', isAdminMiddleware, (req, res, next) => reportsController.getUserReport(req, res, next));
router.get('/team/:gestorId', isAdminMiddleware, (req, res, next) => reportsController.getTeamReport(req, res, next));
router.get('/export/:userId', isAdminMiddleware, (req, res, next) => reportsController.exportUserReport(req, res, next));

export default router;
