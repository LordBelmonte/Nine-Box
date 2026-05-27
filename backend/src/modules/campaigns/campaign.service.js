import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { CampaignCompetencyRepository } from './campaignCompetency.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { GroupRepository } from '../groups/group.repository.js';

class CampaignService {
  constructor(campaignRepository, evaluationRepository) {
    this.campaignRepository = campaignRepository;
    this.evaluationRepository = evaluationRepository || new EvaluationRepository();
    this.userRepository = new UserRepository();
    this.campaignCompetencyRepository = new CampaignCompetencyRepository();
    this.groupRepository = new GroupRepository();
  }

  async create(data, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para criar campanhas de avaliação', 403);
    }

    this._validateCompetencyIds(data.competencyIds);
    this._validateDatas(data.dataInicio, data.dataFim);

    // Valida gestores se fornecidos
    if (data.gestorIds && data.gestorIds.length > 0) {
      await this._validateGestores(data.gestorIds);
    }

    const tiposAlvo = ['colaborador', 'gestor', 'todos'];
    if (!tiposAlvo.includes(data.tipoAlvo)) {
      throw new AppError('tipoAlvo deve ser: colaborador, gestor ou todos', 400);
    }

    // Cria a campanha sem competencyIds e criterios
    const { competencyIds, gestorIds, ...campaignData } = data;
    const campaign = await this.campaignRepository.create(campaignData);

    // Associa as competências à campanha
    if (competencyIds && competencyIds.length > 0) {
      for (const competencyId of competencyIds) {
        await this.campaignCompetencyRepository.create({
          campaignId: campaign.id,
          competencyId
        });
      }
    }

    return campaign;
  }

  async findById(id, userId, userTipo) {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Gestor só pode ver campanhas onde é responsável
    if (userTipo === 'gestor') {
      const isResponsavel = campaign.gestores.some(g => g.gestorId === userId);
      if (!isResponsavel) {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
    }

    // Colaborador só pode ver campanhas ativas onde pode participar
    if (userTipo === 'colaborador') {
      if (campaign.status !== 'ativa') {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
      // Colaborador pode ver campanhas tipoAlvo: gestor (para avaliar gestor)
      if (campaign.tipoAlvo !== 'gestor') {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
    }

    return campaign;
  }

  async findAll(filters, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para listar campanhas', 403);
    }

    // Gestor só vê suas próprias campanhas
    if (userTipo === 'gestor') {
      filters.gestorId = userId;
    }

    return this.campaignRepository.findAll(filters);
  }

  async findActiveForGestor(gestorId, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão', 403);
    }

    // Gestor só pode ver as próprias campanhas ativas
    const targetId = userTipo === 'gestor' ? userId : gestorId;
    return this.campaignRepository.findActiveForGestor(targetId);
  }

  async update(id, data, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para editar campanhas', 403);
    }

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    if (campaign.status === 'finalizada') {
      throw new AppError('Não é possível editar uma campanha finalizada', 400);
    }

    if (data.competencyIds) {
      this._validateCompetencyIds(data.competencyIds);
      // Remove associações antigas
      await this.campaignCompetencyRepository.deleteByCampaignId(id);
      // Adiciona novas associações
      for (const competencyId of data.competencyIds) {
        await this.campaignCompetencyRepository.create({
          campaignId: id,
          competencyId
        });
      }
    }

    if (data.dataInicio || data.dataFim) {
      const inicio = data.dataInicio || campaign.dataInicio;
      const fim = data.dataFim || campaign.dataFim;
      this._validateDatas(inicio, fim);
    }

    // Remove competencyIds e criterios antes de atualizar
    const { competencyIds, criterios, ...updateData } = data;
    return this.campaignRepository.update(id, updateData);
  }

  async updateStatus(id, status, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para alterar o status de campanhas', 403);
    }

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const transicoes = {
      planejamento: ['ativa'],
      ativa: ['finalizada'],
      finalizada: []
    };

    if (!transicoes[campaign.status].includes(status)) {
      throw new AppError(
        `Não é possível mudar status de '${campaign.status}' para '${status}'`,
        400
      );
    }

    return this.campaignRepository.update(id, { status });
  }

  async delete(id, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para deletar campanhas', 403);
    }

    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    if (campaign.status === 'ativa') {
      throw new AppError('Não é possível deletar uma campanha ativa. Finalize-a primeiro.', 400);
    }

    await this.campaignRepository.delete(id);
    return { message: 'Campanha deletada com sucesso' };
  }

  async getCampaignProgress(campaignId, gestorId, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão', 403);
    }

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const targetGestorId = userTipo === 'gestor' ? userId : gestorId;
    return this.campaignRepository.getCampaignProgress(campaignId, targetGestorId);
  }

  async getResponsavelGestores(campaignId, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão', 403);
    }

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Gestor só pode ver se é responsável por essa campanha
    if (userTipo === 'gestor') {
      const isResponsavel = campaign.gestores.some(g => g.gestorId === userId);
      if (!isResponsavel) {
        throw new AppError('Você não é responsável por esta campanha', 403);
      }
    }

    return this.campaignRepository.getResponsavelGestores(campaignId);
  }

  async getColaboradoresNaoAvaliados(campaignId, gestorId, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão', 403);
    }

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Gestor só pode ver colaboradores que não avaliou
    if (userTipo === 'gestor' && gestorId !== userId) {
      throw new AppError('Sem permissão para ver colaboradores de outro gestor', 403);
    }

    return this.campaignRepository.getColaboradoresNaoAvaliados(campaignId, gestorId);
  }

  async getPendingCampaignsForColaborador(userId, userTipo) {
    if (userTipo !== 'colaborador') {
      throw new AppError('Sem permissão para acessar esta funcionalidade', 403);
    }

    try {
      // Busca campanhas ativas onde o colaborador pode ser avaliado (tipoAlvo: colaborador)
      // E campanhas onde o colaborador deve avaliar gestores (tipoAlvo: gestor)
      const campaigns = await this.campaignRepository.findAll({ status: 'ativa' });

      // Filtra campanhas onde o colaborador ainda não respondeu
      const campaignsPendentes = [];

      for (const campaign of campaigns.campaigns) {
        try {
          // Verifica se o colaborador já respondeu a esta campanha como avaliador
          const avaliacoesFeitas = await this.evaluationRepository.findByCampaignAndAvaliador(campaign.id, userId);

          if (avaliacoesFeitas.length === 0) {
            // Para campanhas tipoAlvo: gestor, colaborador deve avaliar seu gestor
            // Para campanhas tipoAlvo: colaborador, colaborador é avaliado pelo gestor
            if (campaign.tipoAlvo === 'gestor') {
              // Verifica se o colaborador é subordinado de pelo menos um dos gestores responsáveis pela campanha
              const gestoresResponsaveis = campaign.gestores || [];
              let isSubordinadoDeAlgumGestor = false;
              
              for (const g of gestoresResponsaveis) {
                const isSubordinado = await this.groupRepository.exists(g.gestorId, userId);
                if (isSubordinado) {
                  isSubordinadoDeAlgumGestor = true;
                  break;
                }
              }
              
              if (isSubordinadoDeAlgumGestor) {
                campaignsPendentes.push(campaign);
              }
            } else if (campaign.tipoAlvo === 'todos') {
              // Para campanhas tipoAlvo: todos, colaborador pode avaliar gestores que são seus responsáveis
              const gestoresResponsaveis = campaign.gestores || [];
              let isSubordinadoDeAlgumGestor = false;
              
              for (const g of gestoresResponsaveis) {
                const isSubordinado = await this.groupRepository.exists(g.gestorId, userId);
                if (isSubordinado) {
                  isSubordinadoDeAlgumGestor = true;
                  break;
                }
              }
              
              if (isSubordinadoDeAlgumGestor) {
                campaignsPendentes.push(campaign);
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao processar campanha ${campaign.id}:`, error);
          // Continue with next campaign
        }
      }

      return campaignsPendentes;
    } catch (error) {
      console.error('Erro em getPendingCampaignsForColaborador:', error);
      throw error;
    }
  }

  async getPendingCampaignsForGestor(userId, userTipo) {
    if (userTipo !== 'gestor') {
      throw new AppError('Apenas gestores podem acessar esta funcionalidade', 403);
    }

    // Busca campanhas ativas onde o gestor é responsável
    const campaigns = await this.campaignRepository.findActiveForGestor(userId);

    return campaigns;
  }

  // --- Helpers privados ---

  _validateCompetencyIds(competencyIds) {
    if (!Array.isArray(competencyIds) || competencyIds.length === 0) {
      throw new AppError('A campanha deve ter pelo menos 1 competência', 400);
    }
    if (competencyIds.length > 20) {
      throw new AppError('A campanha pode ter no máximo 20 competências', 400);
    }
  }

  _validateDatas(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new AppError('Datas inválidas', 400);
    }
    if (fim <= inicio) {
      throw new AppError('Data de fim deve ser posterior à data de início', 400);
    }
  }

  async _validateGestores(gestorIds) {
    for (const gestorId of gestorIds) {
      const user = await this.userRepository.findById(gestorId);
      if (!user) {
        throw new AppError(`Gestor com id '${gestorId}' não encontrado`, 404);
      }
      if (user.tipo !== 'gestor') {
        throw new AppError(`Usuário '${user.nome}' não é um gestor`, 400);
      }
    }
  }
}

export { CampaignService };
