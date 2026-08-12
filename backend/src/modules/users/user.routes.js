import express from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware, isAdminMiddleware, isGestorOrAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { registerSchema, loginSchema, updateProfileSchema, updateUserSchema, resetPasswordSchema } from './user.validation.js';

const router = express.Router();
const ctrl   = new UserController();

// ─── Rotas públicas ───────────────────────────────────────────────────────────
router.post('/login', validate(loginSchema), (req, res, next) => ctrl.login(req, res, next));

// ─── Autenticação obrigatória para todas as rotas abaixo ─────────────────────
router.use(authMiddleware);

// Perfil do próprio usuário logado (apenas admin acessa pelo painel)
router.get('/profile',  isAdminMiddleware, (req, res, next) => ctrl.getProfile(req, res, next));
router.put('/profile',  isAdminMiddleware, validate(updateProfileSchema), (req, res, next) => ctrl.updateProfile(req, res, next));

// Busca por RA
router.get('/ra/:ra', isAdminMiddleware, (req, res, next) => ctrl.findByRA(req, res, next));

// Listagem — admin vê tudo; gestor e colaborador filtrados no service
router.get('/', isGestorOrAdminMiddleware, (req, res, next) => ctrl.findAll(req, res, next));

// Cadastro (apenas admin)
router.post('/register', isAdminMiddleware, validate(registerSchema), (req, res, next) => ctrl.register(req, res, next));

// Obter por ID — colocado após /profile e /ra/:ra para evitar conflito de rota
router.get('/:id', isAdminMiddleware, (req, res, next) => ctrl.findById(req, res, next));

// Editar por ID — apenas admin (ETAPA 2.1)
router.put('/:id', isAdminMiddleware, validate(updateUserSchema), (req, res, next) => ctrl.updateById(req, res, next));

// Redefinir senha de um usuário — apenas admin
router.put('/:id/password', isAdminMiddleware, validate(resetPasswordSchema), (req, res, next) => ctrl.resetPassword(req, res, next));

// Excluir por ID — apenas admin
router.delete('/:id', isAdminMiddleware, (req, res, next) => ctrl.delete(req, res, next));

export default router;
