import express from 'express';
import { ReportsController } from './reports.controller.js';
import { authMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const reportsController = new ReportsController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas autenticadas
router.get('/dashboard', isGestorOrAdminMiddleware, (req, res, next) => reportsController.getDashboardStats(req, res, next));
router.get('/user/:userId', (req, res, next) => reportsController.getUserReport(req, res, next));
router.get('/team/:gestorId', isGestorOrAdminMiddleware, (req, res, next) => reportsController.getTeamReport(req, res, next));
router.get('/export/:userId', (req, res, next) => reportsController.exportUserReport(req, res, next));

export default router;
