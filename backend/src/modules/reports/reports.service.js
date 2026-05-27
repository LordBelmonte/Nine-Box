import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { NineBoxRepository } from '../ninebox/ninebox.repository.js';
import { CompetencyRepository } from '../competencies/competency.repository.js';
import { CampaignRepository } from '../campaigns/campaign.repository.js';
import { GroupRepository } from '../groups/group.repository.js';

class ReportsService {
  constructor() {
    this.userRepository = new UserRepository();
    this.evaluationRepository = new EvaluationRepository();
    this.nineBoxRepository = new NineBoxRepository();
    this.competencyRepository = new CompetencyRepository();
    this.campaignRepository = new CampaignRepository();
    this.groupRepository = new GroupRepository();
  }

  async getDashboardStats(userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver dashboard geral', 403);
    }

    const [gestores, colaboradores, evaluations, nineBoxStats, competencyStats, campaigns] = await Promise.all([
      this.userRepository.findAll({ page: 1, limit: 1, tipo: 'gestor' }),
      this.userRepository.findAll({ page: 1, limit: 1, tipo: 'colaborador' }),
      this.evaluationRepository.findAll({ page: 1, limit: 10 }),
      this.nineBoxRepository.getGridDistribution(),
      this.competencyRepository.getStatsByTipo(),
      this.campaignRepository.findAll({ page: 1, limit: 100, status: 'ativa' })
    ]);

    const userStats = {
      total: gestores.pagination.total + colaboradores.pagination.total,
      porTipo: {
        gestor: gestores.pagination.total,
        colaborador: colaboradores.pagination.total
      }
    };

    const evaluationStats = {
      total: evaluations.pagination.total,
      mediaGeral: evaluations.evaluations.length > 0
        ? evaluations.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / evaluations.evaluations.length
        : 0,
      lista: evaluations.evaluations
    };

    return {
      usuarios: userStats,
      avaliacoes: evaluationStats,
      nineBox: nineBoxStats,
      competencias: competencyStats,
      campanhasAtivas: campaigns.pagination.total,
      timestamp: new Date().toISOString()
    };
  }

  async getUserReport(userId, requestUserId, requestUserTipo) {
    if (requestUserTipo === 'colaborador' && userId !== requestUserId) {
      throw new AppError('Sem permissão para ver este relatório', 403);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const evaluationsReceived = await this.evaluationRepository.findByAvaliado(userId, { page: 1, limit: 1000 });
    const evaluationsMade = await this.evaluationRepository.findByAvaliador(userId, { page: 1, limit: 1000 });
    const nineBoxes = await this.nineBoxRepository.findByPessoa(userId);

    const receivedStats = {
      total: evaluationsReceived.evaluations.length,
      mediaGeral: evaluationsReceived.evaluations.length > 0
        ? evaluationsReceived.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / evaluationsReceived.evaluations.length
        : 0
    };

    const latestNineBox = nineBoxes.length > 0 ? nineBoxes[0] : null;
    delete user.senha;

    return {
      usuario: user,
      avaliacoesRecebidas: {
        ...receivedStats,
        lista: evaluationsReceived.evaluations
      },
      avaliacoesFeitas: {
        total: evaluationsMade.evaluations.length,
        lista: evaluationsMade.evaluations
      },
      nineBox: {
        total: nineBoxes.length,
        ultima: latestNineBox,
        historico: nineBoxes
      },
      timestamp: new Date().toISOString()
    };
  }

  async getTeamReport(gestorId, requestUserId, requestUserTipo) {
    if (requestUserTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver relatório de equipe', 403);
    }
    if (requestUserTipo === 'gestor' && gestorId !== requestUserId) {
      throw new AppError('Gestor só pode ver a própria equipe', 403);
    }

    const gestor = await this.userRepository.findById(gestorId);
    if (!gestor) throw new AppError('Gestor não encontrado', 404);

    // Usa o grupo real do gestor
    const colaboradores = await this.groupRepository.findColaboradoresByGestor(gestorId);

    // Campanhas ativas do gestor
    const campanhasAtivas = await this.campaignRepository.findActiveForGestor(gestorId);

    return {
      gestor,
      equipe: colaboradores,
      campanhasAtivas,
      estatisticas: {
        totalColaboradores: colaboradores.length,
        departamento: gestor.departamento
      },
      timestamp: new Date().toISOString()
    };
  }

  async exportUserReport(userId, requestUserId, requestUserTipo) {
    const report = await this.getUserReport(userId, requestUserId, requestUserTipo);
    return { exportDate: new Date().toISOString(), data: report };
  }
}

export { ReportsService };
