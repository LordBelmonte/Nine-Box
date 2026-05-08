import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { NineBoxRepository } from '../ninebox/ninebox.repository.js';
import { CompetencyRepository } from '../competencies/competency.repository.js';

class ReportsService {
  constructor() {
    this.userRepository = new UserRepository();
    this.evaluationRepository = new EvaluationRepository();
    this.nineBoxRepository = new NineBoxRepository();
    this.competencyRepository = new CompetencyRepository();
  }

  async getDashboardStats(userTipo) {
    // Colaborador não pode ver dashboard geral
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver dashboard geral', 403);
    }

    // OTIMIZAÇÃO: Busca apenas estatísticas agregadas, não todos os registros
    // Isso evita queries N+1 e melhora performance significativamente
    const [users, evaluations, nineBoxStats, competencyStats] = await Promise.all([
      // Busca apenas primeiros 10 usuários para estatísticas básicas
      this.userRepository.findAll({ page: 1, limit: 10 }),
      // Busca apenas últimas 10 avaliações para lista
      this.evaluationRepository.findAll({ page: 1, limit: 10 }),
      // Usa agregação otimizada
      this.nineBoxRepository.getGridDistribution(),
      // Usa agregação otimizada
      this.competencyRepository.getStatsByTipo()
    ]);

    // Estatísticas de usuários (usa total da paginação)
    const userStats = {
      total: users.pagination.total,
      porTipo: users.users.reduce((acc, user) => {
        acc[user.tipo] = (acc[user.tipo] || 0) + 1;
        return acc;
      }, {})
    };

    // Estatísticas de avaliações (usa total da paginação)
    const evaluationStats = {
      total: evaluations.pagination.total,
      porTipo: evaluations.evaluations.reduce((acc, ev) => {
        acc[ev.tipoAvaliacao] = (acc[ev.tipoAvaliacao] || 0) + 1;
        return acc;
      }, {}),
      mediaGeral: evaluations.evaluations.length > 0
        ? evaluations.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / evaluations.evaluations.length
        : 0,
      lista: evaluations.evaluations // Últimas 10 avaliações
    };

    return {
      usuarios: userStats,
      avaliacoes: evaluationStats,
      nineBox: nineBoxStats,
      competencias: competencyStats,
      timestamp: new Date().toISOString()
    };
  }

  async getUserReport(userId, requestUserId, requestUserTipo) {
    // Colaborador só pode ver seu próprio relatório
    if (requestUserTipo === 'colaborador' && userId !== requestUserId) {
      throw new AppError('Sem permissão para ver este relatório', 403);
    }

    // Busca dados do usuário
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Busca avaliações recebidas
    const evaluationsReceived = await this.evaluationRepository.findByAvaliado(userId, { page: 1, limit: 1000 });

    // Busca avaliações feitas
    const evaluationsMade = await this.evaluationRepository.findByAvaliador(userId, { page: 1, limit: 1000 });

    // Busca avaliações Nine Box
    const nineBoxes = await this.nineBoxRepository.findByPessoa(userId);

    // Calcula estatísticas de avaliações recebidas
    const receivedStats = {
      total: evaluationsReceived.evaluations.length,
      mediaGeral: evaluationsReceived.evaluations.length > 0
        ? evaluationsReceived.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / evaluationsReceived.evaluations.length
        : 0,
      porTipo: evaluationsReceived.evaluations.reduce((acc, ev) => {
        acc[ev.tipoAvaliacao] = (acc[ev.tipoAvaliacao] || 0) + 1;
        return acc;
      }, {})
    };

    // Última avaliação Nine Box
    const latestNineBox = nineBoxes.length > 0 ? nineBoxes[0] : null;

    // Remove senha do usuário
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
    if (!gestor) {
      throw new AppError('Gestor não encontrado', 404);
    }

    const teamUsers = await this.userRepository.findAll({
      page: 1,
      limit: 1000,
      tipo: 'colaborador'
    });

    return {
      gestor,
      equipe: teamUsers.users,
      estatisticas: {
        totalColaboradores: teamUsers.pagination.total,
        departamento: gestor.departamento
      },
      timestamp: new Date().toISOString()
    };
  }

  async exportUserReport(userId, requestUserId, requestUserTipo) {
    const report = await this.getUserReport(userId, requestUserId, requestUserTipo);

    return {
      exportDate: new Date().toISOString(),
      data: report
    };
  }
}

export { ReportsService };
