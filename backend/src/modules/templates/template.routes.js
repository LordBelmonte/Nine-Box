import express from 'express';
import { TemplateController } from './template.controller.js';
import { isGestorOrAdminMiddleware } from '../../middlewares/auth.js';

const router = express.Router();
const templateController = new TemplateController();

router.use(isGestorOrAdminMiddleware);

router.get('/', (req, res, next) => templateController.findAll(req, res, next));
router.get('/:id', (req, res, next) => templateController.findById(req, res, next));
router.post('/', (req, res, next) => templateController.create(req, res, next));
router.put('/:id', (req, res, next) => templateController.update(req, res, next));
router.delete('/:id', (req, res, next) => templateController.delete(req, res, next));

export default router;
