import { AppError } from '../../utils/errors.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { CampaignRepository } from '../campaigns/campaign.repository.js';
import { UserRepository } from '../users/user.repository.js';

class ExportService {
  constructor() {
    this.evaluationRepository = new EvaluationRepository();
    this.campaignRepository = new CampaignRepository();
    this.userRepository = new UserRepository();
  }

  async exportEvaluationsToCSV(campaignId, userTipo) {
    if (userTipo !== 'admin' && userTipo !== 'gestor') {
      throw new AppError('Sem permissão para exportar avaliações', 403);
    }

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const evaluations = await this.evaluationRepository.findByCampaign(campaignId);

    // Gerar CSV
    const headers = ['Avaliador', 'Avaliado', 'Média', 'Comentário', 'Data'];
    const rows = evaluations.map(ev => [
      ev.avaliador?.nome || 'Anônimo',
      ev.avaliado?.nome || '',
      ev.media || 0,
      ev.comentario || '',
      ev.data || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return {
      filename: `avaliacoes_${campaign.nome}_${Date.now()}.csv`,
      content: csvContent,
      type: 'text/csv'
    };
  }

  async exportEvaluationsToJSON(campaignId, userTipo) {
    if (userTipo !== 'admin' && userTipo !== 'gestor') {
      throw new AppError('Sem permissão para exportar avaliações', 403);
    }

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const evaluations = await this.evaluationRepository.findByCampaign(campaignId);

    const jsonData = {
      campaign: {
        nome: campaign.nome,
        descricao: campaign.descricao,
        tipoAlvo: campaign.tipoAlvo,
        dataInicio: campaign.dataInicio,
        dataFim: campaign.dataFim
      },
      evaluations: evaluations.map(ev => ({
        avaliador: ev.avaliador?.nome || 'Anônimo',
        avaliado: ev.avaliado?.nome || '',
        media: ev.media || 0,
        criterios: ev.criterios,
        comentario: ev.comentario,
        data: ev.data,
        anonima: ev.anonima
      }))
    };

    return {
      filename: `avaliacoes_${campaign.nome}_${Date.now()}.json`,
      content: JSON.stringify(jsonData, null, 2),
      type: 'application/json'
    };
  }

  async exportDashboardStats(userTipo, userId) {
    if (userTipo !== 'admin' && userTipo !== 'gestor') {
      throw new AppError('Sem permissão para exportar estatísticas', 403);
    }

    let stats;

    if (userTipo === 'admin') {
      const totalUsuarios = await this.userRepository.count();
      const totalCampanhas = await this.campaignRepository.count();
      const totalAvaliacoes = await this.evaluationRepository.count();

      stats = {
        tipo: 'admin',
        totalUsuarios,
        totalCampanhas,
        totalAvaliacoes
      };
    } else {
      const avaliacoesFeitas = await this.evaluationRepository.findByAvaliador(userId, { page: 1, limit: 1000 });
      const avaliacoesRecebidas = await this.evaluationRepository.findByAvaliado(userId, { page: 1, limit: 1000 });

      stats = {
        tipo: 'gestor',
        totalAvaliacoesFeitas: avaliacoesFeitas.evaluations.length,
        totalAvaliacoesRecebidas: avaliacoesRecebidas.evaluations.length,
        mediaGeralFeitas: avaliacoesFeitas.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / (avaliacoesFeitas.evaluations.length || 1),
        mediaGeralRecebidas: avaliacoesRecebidas.evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / (avaliacoesRecebidas.evaluations.length || 1)
      };
    }

    return {
      filename: `dashboard_stats_${userTipo}_${Date.now()}.json`,
      content: JSON.stringify(stats, null, 2),
      type: 'application/json'
    };
  }
}

export { ExportService };
