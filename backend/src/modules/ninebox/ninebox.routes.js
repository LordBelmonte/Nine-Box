import express from 'express';
import { NineBoxController } from './ninebox.controller.js';
import { authMiddleware, isGestorOrAdminMiddleware, isAdminMiddleware } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createNineBoxSchema, updateNineBoxSchema } from './ninebox.validation.js';

const router = express.Router();
const nineBoxController = new NineBoxController();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas públicas (autenticadas)
// IMPORTANTE: Rotas específicas ANTES de rotas genéricas para evitar conflitos
router.get('/stats/distribution', isGestorOrAdminMiddleware, (req, res, next) => nineBoxController.getGridDistribution(req, res, next));
router.get('/stats/tipo', isAdminMiddleware, (req, res, next) => nineBoxController.getStatsByTipo(req, res, next));
router.get('/calculate/person/:pessoaId', isGestorOrAdminMiddleware, (req, res, next) => nineBoxController.calculateForPerson(req, res, next));
router.get('/calculate/team', isGestorOrAdminMiddleware, (req, res, next) => nineBoxController.calculateForTeam(req, res, next));
router.get('/pessoa/:pessoaId/latest', (req, res, next) => nineBoxController.findLatestByPessoa(req, res, next));
router.get('/pessoa/:pessoaId', (req, res, next) => nineBoxController.findByPessoa(req, res, next));
router.get('/', (req, res, next) => nineBoxController.findAll(req, res, next));
router.get('/:id', (req, res, next) => nineBoxController.findById(req, res, next));

// Rotas de gestor/admin
// OBSERVAÇÃO: Criação manual de Nine Box foi descontinuada
// O sistema agora calcula automaticamente a partir das avaliações
// router.post('/', isGestorOrAdminMiddleware, validate(createNineBoxSchema), (req, res, next) => nineBoxController.create(req, res, next));
router.put('/:id', isGestorOrAdminMiddleware, validate(updateNineBoxSchema), (req, res, next) => nineBoxController.update(req, res, next));

// Rotas de gestor/admin (gestor pode deletar dentro de 24h)
router.delete('/:id', isGestorOrAdminMiddleware, (req, res, next) => nineBoxController.delete(req, res, next));

export default router;
