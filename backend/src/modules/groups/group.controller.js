import { GroupRepository } from './group.repository.js';
import { GroupService } from './group.service.js';

const groupRepository = new GroupRepository();
const groupService = new GroupService(groupRepository);

class GroupController {
  async getColaboradores(req, res, next) {
    try {
      const gestorId = req.params.gestorId;
      const colaboradores = await groupService.getColaboradores(
        gestorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: colaboradores });
    } catch (error) {
      next(error);
    }
  }

  async getGestores(req, res, next) {
    try {
      const colaboradorId = req.params.colaboradorId;
      const gestores = await groupService.getGestores(
        colaboradorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: gestores });
    } catch (error) {
      next(error);
    }
  }

  async addColaborador(req, res, next) {
    try {
      const { gestorId } = req.params;
      const { colaboradorId } = req.body;
      const result = await groupService.addColaborador(
        gestorId,
        colaboradorId,
        req.user.tipo
      );
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Colaborador adicionado ao grupo com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeColaborador(req, res, next) {
    try {
      const { gestorId, colaboradorId } = req.params;
      const result = await groupService.removeColaborador(
        gestorId,
        colaboradorId,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async setColaboradores(req, res, next) {
    try {
      const { gestorId } = req.params;
      const { colaboradorIds } = req.body;
      const colaboradores = await groupService.setColaboradores(
        gestorId,
        colaboradorIds,
        req.user.userId,
        req.user.tipo
      );
      return res.json({
        success: true,
        data: colaboradores,
        message: 'Grupo atualizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export { GroupController };
