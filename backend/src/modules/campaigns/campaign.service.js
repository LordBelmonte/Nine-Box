import { AppError } from '../../utils/errors.js';
import { prisma } from '../../config/database.js';
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

    console.log('[CampaignService.create] payload:', {
      nome: data.nome,
      tipoAlvo: data.tipoAlvo,
      gestorIds: data.gestorIds,
      gestorColaboradores: data.gestorColaboradores
    });

    const tiposAlvo = ['colaborador', 'gestor', 'todos'];
    if (!tiposAlvo.includes(data.tipoAlvo)) {
      throw new AppError('tipoAlvo deve ser: colaborador, gestor ou todos', 400);
    }

    if (!data.gestorIds || data.gestorIds.length === 0) {
      throw new AppError('A campanha deve possuir pelo menos um gestor.', 400);
    }

    if (!data.gestorColaboradores) {
      console.error('[CampaignService.create] gestorColaboradores é null/undefined');
      throw new AppError('É obrigatório informar os colaboradores por gestor.', 400);
    }

    for (const gestorId of data.gestorIds) {
      const colaboradorIds = data.gestorColaboradores[gestorId];
      console.log('[CampaignService.create] validando gestorId:', gestorId, 'colaboradorIds:', colaboradorIds, 'isArray:', Array.isArray(colaboradorIds));

      if (!Array.isArray(colaboradorIds)) {
        console.error('[CampaignService.create] colaboradorIds não é um array para gestorId:', gestorId, 'tipo:', typeof colaboradorIds);
        throw new AppError(
          `Gestor ${gestorId} não possui colaboradores vinculados.`,
          400
        );
      }

      if (colaboradorIds.length === 0) {
        throw new AppError(
          `Gestor ${gestorId} deve possuir pelo menos um colaborador.`,
          400
        );
      }
    }

    const { competencyIds, gestorIds, gestorColaboradores, ...campaignData } = data;
    const uniqueGestorIds = [...new Set(gestorIds)];
    const campaign = await prisma.$transaction(async (tx) => {
      const createdCampaign = await this.campaignRepository.create({
        ...campaignData,
        gestorIds: uniqueGestorIds,
        gestorColaboradores
      }, tx);

      if (competencyIds && competencyIds.length > 0) {
        for (const competencyId of competencyIds) {
          await tx.campaignCompetency.create({
            data: { campaignId: createdCampaign.id, competencyId }
          });
        }
      }

      return createdCampaign;
    });

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

    // Valida vínculos gestor→colaborador quando gestorColaboradores é enviado no update.
    // Vale para todos os tipoAlvo — CampaignGestorColaborador é fonte de verdade universal.
    if (data.gestorColaboradores) {
      // Determina quais gestorIds devem ser validados:
      // se o update enviou gestorIds, usa esses; caso contrário usa os gestores já na campanha.
      const gestorIdsParaValidar =
        data.gestorIds && data.gestorIds.length > 0
          ? data.gestorIds
          : campaign.gestores.map(g => g.gestorId);

      for (const gestorId of gestorIdsParaValidar) {
        const colaboradorIds = data.gestorColaboradores[gestorId];

        if (!Array.isArray(colaboradorIds) || colaboradorIds.length === 0) {
          throw new AppError(
            `Gestor ${gestorId} deve possuir pelo menos um colaborador.`,
            400
          );
        }
      }
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
    const { competencyIds, criterios, gestorColaboradores, ...updateData } = data;
    return this.campaignRepository.update(id, { ...updateData, gestorColaboradores });
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
      // Busca campanhas ativas
      const campaigns = await this.campaignRepository.findAll({ status: 'ativa' });

      // Filtra campanhas onde o colaborador ainda não respondeu
      const campaignsPendentes = [];

      for (const campaign of campaigns.campaigns) {
        try {
          // Para tipoAlvo: gestor, colaborador avalia gestor
          if (campaign.tipoAlvo === 'gestor') {
            // Usa CampaignGestorColaborador como fonte de verdade
            const gestoresNaoAvaliados = await this.campaignRepository.getGestoresNaoAvaliados(campaign.id, userId);
            if (gestoresNaoAvaliados.length > 0) {
              campaignsPendentes.push(campaign);
            }
          }
          // Para tipoAlvo: todos, colaborador pode avaliar gestores que estão em CampaignGestorColaborador
          else if (campaign.tipoAlvo === 'todos') {
            // Usa CampaignGestorColaborador como fonte de verdade
            const gestoresNaoAvaliados = await this.campaignRepository.getGestoresNaoAvaliados(campaign.id, userId);
            if (gestoresNaoAvaliados.length > 0) {
              campaignsPendentes.push(campaign);
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

    try {
      // Busca campanhas ativas onde o gestor é responsável
      const campaigns = await this.campaignRepository.findActiveForGestor(userId);
      console.log('[CampaignService.getPendingCampaignsForGestor] userId:', userId, 'userTipo:', userTipo, 'activeCampaigns:', campaigns.length);

      // Filtra campanhas onde gestores devem responder avaliações.
      // Manter apenas campanhas com colaboradores atribuídos ou candidatos.
      const filteredCampaigns = campaigns.filter(c => c.tipoAlvo === 'colaborador' || c.tipoAlvo === 'todos');
      console.log('[CampaignService.getPendingCampaignsForGestor] filteredCampaigns:', filteredCampaigns.map(c => ({ id: c.id, tipoAlvo: c.tipoAlvo })));

      // Para cada campanha, verifica se o gestor ainda tem colaboradores para avaliar
      const campaignsPendentes = [];

      for (const campaign of filteredCampaigns) {
        try {
          // Busca colaboradores que o gestor deve avaliar nesta campanha
          const colaboradoresNaoAvaliados = await this.campaignRepository.getColaboradoresNaoAvaliados(campaign.id, userId);
          console.log('[CampaignService.getPendingCampaignsForGestor] campaignId:', campaign.id, 'colaboradoresNaoAvaliados:', colaboradoresNaoAvaliados.length);

          if (colaboradoresNaoAvaliados.length > 0) {
            campaignsPendentes.push(campaign);
          }
        } catch (error) {
          console.error(`Erro ao processar campanha ${campaign.id}:`, error);
          // Continue with next campaign
        }
      }

      console.log('[CampaignService.getPendingCampaignsForGestor] campaignsPendentes:', campaignsPendentes.length);
      return campaignsPendentes;
    } catch (error) {
      console.error('Erro em getPendingCampaignsForGestor:', error);
      throw error;
    }
  }

  async getGestoresNaoAvaliados(campaignId, colaboradorId, userId, userTipo) {
    // Gestor não tem acesso a este endpoint
    if (userTipo === 'gestor') {
      throw new AppError('Sem permissão', 403);
    }

    // Colaborador só pode ver seus próprios gestores pendentes
    if (userTipo === 'colaborador' && colaboradorId !== userId) {
      throw new AppError('Sem permissão para ver gestores de outro colaborador', 403);
    }

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    return this.campaignRepository.getGestoresNaoAvaliados(campaignId, colaboradorId);
  }

  async duplicate(id, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para duplicar campanhas', 403);
    }

    const original = await this.campaignRepository.findById(id);
    if (!original) {
      throw new AppError('Campanha não encontrada', 404);
    }

    // Monta payload idêntico ao create(), usando os dados da campanha original.
    // A cópia nasce em status 'planejamento' e com nome prefixado por "Cópia de".
    const gestorIds = original.gestores.map(g => g.gestorId);
    const gestorColaboradores = {};
    for (const g of original.gestores) {
      gestorColaboradores[g.gestorId] = g.colaboradoresAvaliaveis.map(c => c.colaboradorId);
    }
    const competencyIds = original.competencias.map(c => c.competencyId);

    const novaData = {
      nome:       `Cópia de ${original.nome}`,
      descricao:  original.descricao || undefined,
      dataInicio: original.dataInicio,
      dataFim:    original.dataFim,
      tipoAlvo:   original.tipoAlvo,
    };

    const { competencyIds: _c, gestorIds: _g, gestorColaboradores: _gc, ...campaignData } = { ...novaData };
    const uniqueGestorIds = [...new Set(gestorIds)];

    const novaCampanha = await prisma.$transaction(async (tx) => {
      const created = await this.campaignRepository.create({
        ...novaData,
        gestorIds: uniqueGestorIds,
        gestorColaboradores
      }, tx);

      for (const competencyId of competencyIds) {
        await tx.campaignCompetency.create({
          data: { campaignId: created.id, competencyId }
        });
      }

      return created;
    });

    return novaCampanha;
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
