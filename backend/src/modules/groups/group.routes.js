import express from 'express';
import { GroupController } from './group.controller.js';
import { authMiddleware, isAdminMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const groupController = new GroupController();

router.use(authMiddleware);

// Colaboradores de um gestor: admin ou o próprio gestor podem consultar
router.get('/gestor/:gestorId/colaboradores', isGestorOrAdminMiddleware, (req, res, next) =>
  groupController.getColaboradores(req, res, next)
);

// Adicionar colaborador ao grupo do gestor (apenas admin)
router.post('/gestor/:gestorId/colaboradores', isAdminMiddleware, (req, res, next) =>
  groupController.addColaborador(req, res, next)
);

// Remover colaborador do grupo do gestor (apenas admin)
router.delete('/gestor/:gestorId/colaboradores/:colaboradorId', isAdminMiddleware, (req, res, next) =>
  groupController.removeColaborador(req, res, next)
);

// Redefinir grupo completo (admin only)
router.put('/gestor/:gestorId/colaboradores', isAdminMiddleware, (req, res, next) =>
  groupController.setColaboradores(req, res, next)
);

// Gestores de um colaborador
router.get('/colaborador/:colaboradorId/gestores', (req, res, next) =>
  groupController.getGestores(req, res, next)
);

export default router;
