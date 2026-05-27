import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';

class GroupService {
  constructor(groupRepository) {
    this.groupRepository = groupRepository;
    this.userRepository = new UserRepository();
  }

  async getColaboradores(gestorId, userId, userTipo) {
    // Gestor só pode ver o próprio grupo
    if (userTipo === 'gestor' && gestorId !== userId) {
      throw new AppError('Sem permissão para ver o grupo de outro gestor', 403);
    }
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão', 403);
    }

    await this._assertGestor(gestorId);
    return this.groupRepository.findColaboradoresByGestor(gestorId);
  }

  async getGestores(colaboradorId, userId, userTipo) {
    // Colaborador só pode ver os próprios gestores
    if (userTipo === 'colaborador' && colaboradorId !== userId) {
      throw new AppError('Sem permissão para ver gestores de outro colaborador', 403);
    }

    return this.groupRepository.findGestoresByColaborador(colaboradorId);
  }

  async addColaborador(gestorId, colaboradorId, userTipo) {
    if (userTipo !== 'admin' && userTipo !== 'gestor') {
      throw new AppError('Sem permissão', 403);
    }

    await this._assertGestor(gestorId);
    await this._assertColaborador(colaboradorId);

    const exists = await this.groupRepository.exists(gestorId, colaboradorId);
    if (exists) {
      throw new AppError('Colaborador já está no grupo deste gestor', 400);
    }

    return this.groupRepository.addColaborador(gestorId, colaboradorId);
  }

  async removeColaborador(gestorId, colaboradorId, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão', 403);
    }
    // Gestor só pode remover do próprio grupo
    if (userTipo === 'gestor' && gestorId !== userId) {
      throw new AppError('Sem permissão para alterar o grupo de outro gestor', 403);
    }

    const exists = await this.groupRepository.exists(gestorId, colaboradorId);
    if (!exists) {
      throw new AppError('Colaborador não está no grupo deste gestor', 404);
    }

    await this.groupRepository.removeColaborador(gestorId, colaboradorId);
    return { message: 'Colaborador removido do grupo com sucesso' };
  }

  async setColaboradores(gestorId, colaboradorIds, userId, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem redefinir o grupo completo', 403);
    }

    await this._assertGestor(gestorId);

    // Valida todos os colaboradores
    for (const id of colaboradorIds) {
      await this._assertColaborador(id);
    }

    return this.groupRepository.setColaboradores(gestorId, colaboradorIds);
  }

  // --- Helpers ---
  async _assertGestor(gestorId) {
    const user = await this.userRepository.findById(gestorId);
    if (!user) throw new AppError('Gestor não encontrado', 404);
    if (user.tipo !== 'gestor') throw new AppError('Usuário não é um gestor', 400);
  }

  async _assertColaborador(colaboradorId) {
    const user = await this.userRepository.findById(colaboradorId);
    if (!user) throw new AppError('Colaborador não encontrado', 404);
    if (user.tipo !== 'colaborador') throw new AppError('Usuário não é um colaborador', 400);
  }
}

export { GroupService };
