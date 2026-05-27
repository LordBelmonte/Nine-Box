import { AppError } from '../../utils/errors.js';
import { EvaluationRepository } from './evaluation.repository.js';
import { CampaignRepository } from '../campaigns/campaign.repository.js';
import { UserRepository } from '../users/user.repository.js';

class DashboardService {
  constructor() {
    this.evaluationRepository = new EvaluationRepository();
    this.campaignRepository = new CampaignRepository();
    this.userRepository = new UserRepository();
  }

  async getColaboradorDashboard(userId, userTipo) {
    if (userTipo !== 'colaborador') {
      throw new AppError('Apenas colaboradores podem acessar este dashboard', 403);
    }

    // Busca avaliações recebidas pelo colaborador
    const avaliacoesRecebidas = await this.evaluationRepository.findByAvaliado(userId, { page: 1, limit: 100 });
    
    // Busca avaliações feitas pelo colaborador (para gestores)
    const avaliacoesFeitas = await this.evaluationRepository.findByAvaliador(userId, { page: 1, limit: 100 });

    // Calcula estatísticas
    const totalRecebidas = avaliacoesRecebidas.evaluations.length;
    const totalFeitas = avaliacoesFeitas.evaluations.length;
    
    const mediaGeralRecebidas = totalRecebidas > 0
      ? avaliacoesRecebidas.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / totalRecebidas
      : 0;

    const mediaGeralFeitas = totalFeitas > 0
      ? avaliacoesFeitas.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / totalFeitas
      : 0;

    // Busca campanhas ativas que o colaborador pode participar (tipoAlvo: gestor)
    const campanhasAtivas = await this.campaignRepository.findAll({ status: 'ativa', tipoAlvo: 'gestor' });

    return {
      estatisticas: {
        totalAvaliacoesRecebidas: totalRecebidas,
        totalAvaliacoesFeitas: totalFeitas,
        mediaGeralRecebidas: parseFloat(mediaGeralRecebidas.toFixed(2)),
        mediaGeralFeitas: parseFloat(mediaGeralFeitas.toFixed(2))
      },
      avaliacoesRecebidas: avaliacoesRecebidas.evaluations,
      avaliacoesFeitas: avaliacoesFeitas.evaluations,
      campanhasDisponiveis: campanhasAtivas.campaigns || []
    };
  }

  async getGestorDashboard(userId, userTipo) {
    if (userTipo !== 'gestor') {
      throw new AppError('Apenas gestores podem acessar este dashboard', 403);
    }

    // Busca avaliações feitas pelo gestor (para colaboradores)
    const avaliacoesFeitas = await this.evaluationRepository.findByAvaliador(userId, { page: 1, limit: 100 });
    
    // Busca avaliações recebidas pelo gestor (de colaboradores)
    const avaliacoesRecebidas = await this.evaluationRepository.findByAvaliado(userId, { page: 1, limit: 100 });

    // Busca colaboradores do grupo do gestor
    const colaboradoresGrupo = await this.userRepository.findByGestorId(userId);

    // Calcula estatísticas
    const totalFeitas = avaliacoesFeitas.evaluations.length;
    const totalRecebidas = avaliacoesRecebidas.evaluations.length;
    
    const mediaGeralFeitas = totalFeitas > 0
      ? avaliacoesFeitas.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / totalFeitas
      : 0;

    const mediaGeralRecebidas = totalRecebidas > 0
      ? avaliacoesRecebidas.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / totalRecebidas
      : 0;

    // Busca campanhas ativas que o gestor é responsável
    const campanhasAtivas = await this.campaignRepository.findActiveForGestor(userId);

    return {
      estatisticas: {
        totalAvaliacoesFeitas: totalFeitas,
        totalAvaliacoesRecebidas: totalRecebidas,
        mediaGeralFeitas: parseFloat(mediaGeralFeitas.toFixed(2)),
        mediaGeralRecebidas: parseFloat(mediaGeralRecebidas.toFixed(2)),
        totalColaboradores: colaboradoresGrupo.length
      },
      avaliacoesFeitas: avaliacoesFeitas.evaluations,
      avaliacoesRecebidas: avaliacoesRecebidas.evaluations,
      colaboradores: colaboradoresGrupo,
      campanhasAtivas: campanhasAtivas
    };
  }

  async getAdminDashboard(userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem acessar este dashboard', 403);
    }

    // Estatísticas gerais do sistema
    const totalUsuarios = await this.userRepository.count();
    const totalCampanhas = await this.campaignRepository.count();
    const totalAvaliacoes = await this.evaluationRepository.count();

    return {
      estatisticas: {
        totalUsuarios,
        totalCampanhas,
        totalAvaliacoes
      }
    };
  }
}

export { DashboardService };
