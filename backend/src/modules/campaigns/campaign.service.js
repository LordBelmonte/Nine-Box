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

    // Normaliza datas para ISO-8601 completo (Prisma exige DateTime, não só Date)
    data.dataInicio = data.dataInicio ? new Date(data.dataInicio).toISOString() : data.dataInicio;
    data.dataFim    = data.dataFim    ? new Date(data.dataFim).toISOString()    : data.dataFim;

    // Segunda barreira — valida que dataInicio não está no passado
    this._validateDataInicio(data.dataInicio);
    this._validateDatas(data.dataInicio, data.dataFim);

    const tiposAlvo = ['colaborador', 'gestor', 'todos'];
    if (!tiposAlvo.includes(data.tipoAlvo)) {
      throw new AppError('tipoAlvo deve ser: colaborador, gestor ou todos', 400);
    }

    if (!data.gestorIds || data.gestorIds.length === 0) {
      throw new AppError('A campanha deve possuir pelo menos um gestor.', 400);
    }

    if (!data.gestorColaboradores) {
      throw new AppError('É obrigatório informar os colaboradores por gestor.', 400);
    }

    for (const gestorId of data.gestorIds) {
      const colaboradorIds = data.gestorColaboradores[gestorId];
      if (!Array.isArray(colaboradorIds)) {
        throw new AppError(`Gestor ${gestorId} não possui colaboradores vinculados.`, 400);
      }
      if (colaboradorIds.length === 0) {
        throw new AppError(`Gestor ${gestorId} deve possuir pelo menos um colaborador.`, 400);
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
        await tx.campaignCompetency.createMany({
          data: competencyIds.map(competencyId => ({
            campaignId: createdCampaign.id,
            competencyId
          }))
        });
      }

      return createdCampaign;
    }, { maxWait: 15000, timeout: 30000 });

    return campaign;
  }

  async findById(id, userId, userTipo) {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    if (userTipo === 'gestor') {
      const isResponsavel = campaign.gestores.some(g => g.gestorId === userId);
      if (!isResponsavel) {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
    }

    if (userTipo === 'colaborador') {
      if (campaign.status !== 'ativa') {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
      if (campaign.tipoAlvo !== 'gestor' && campaign.tipoAlvo !== 'todos') {
        throw new AppError('Sem permissão para ver esta campanha', 403);
      }
    }

    return campaign;
  }

  async findAll(filters, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para listar campanhas', 403);
    }
    if (userTipo === 'gestor') {
      filters.gestorId = userId;
    }
    return this.campaignRepository.findAll(filters);
  }

  async findActiveForGestor(gestorId, userId, userTipo) {
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão', 403);
    }
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

    if (data.gestorColaboradores) {
      const gestorIdsParaValidar =
        data.gestorIds && data.gestorIds.length > 0
          ? data.gestorIds
          : campaign.gestores.map(g => g.gestorId);

      for (const gestorId of gestorIdsParaValidar) {
        const colaboradorIds = data.gestorColaboradores[gestorId];
        if (!Array.isArray(colaboradorIds) || colaboradorIds.length === 0) {
          throw new AppError(`Gestor ${gestorId} deve possuir pelo menos um colaborador.`, 400);
        }
      }
    }

    if (data.competencyIds) {
      this._validateCompetencyIds(data.competencyIds);
      await this.campaignCompetencyRepository.deleteByCampaignId(id);
      // Bug fix 4: usar createMany em vez de create com array
      await this.campaignCompetencyRepository.createMany(
        data.competencyIds.map(competencyId => ({ campaignId: id, competencyId }))
      );
    }

    if (data.dataInicio || data.dataFim) {
      if (data.dataInicio) data.dataInicio = new Date(data.dataInicio).toISOString();
      if (data.dataFim)    data.dataFim    = new Date(data.dataFim).toISOString();
      const inicio = data.dataInicio || campaign.dataInicio;
      const fim    = data.dataFim    || campaign.dataFim;
      this._validateDatas(inicio, fim);
    }

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
      ativa:        ['finalizada'],
      finalizada:   []
    };

    if (!transicoes[campaign.status].includes(status)) {
      throw new AppError(`Não é possível mudar status de '${campaign.status}' para '${status}'`, 400);
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
    if (userTipo === 'colaborador') throw new AppError('Sem permissão', 403);

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError('Campanha não encontrada', 404);

    const targetGestorId = userTipo === 'gestor' ? userId : gestorId;
    return this.campaignRepository.getCampaignProgress(campaignId, targetGestorId);
  }

  async getResponsavelGestores(campaignId, userId, userTipo) {
    if (userTipo === 'colaborador') throw new AppError('Sem permissão', 403);

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError('Campanha não encontrada', 404);

    if (userTipo === 'gestor') {
      const isResponsavel = campaign.gestores.some(g => g.gestorId === userId);
      if (!isResponsavel) throw new AppError('Você não é responsável por esta campanha', 403);
    }

    return this.campaignRepository.getResponsavelGestores(campaignId);
  }

  async getColaboradoresNaoAvaliados(campaignId, gestorId, userId, userTipo) {
    if (userTipo === 'colaborador') throw new AppError('Sem permissão', 403);

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError('Campanha não encontrada', 404);

    // Gestor só pode ver colaboradores que NÃO avaliou — e apenas os seus
    if (userTipo === 'gestor' && gestorId !== userId) {
      throw new AppError('Sem permissão para ver colaboradores de outro gestor', 403);
    }

    return this.campaignRepository.getColaboradoresNaoAvaliados(campaignId, gestorId);
  }

  // ── Otimizados: 2 queries cada, sem N+1 ───────────────────────────────────

  async getPendingCampaignsForColaborador(userId, userTipo) {
    if (userTipo !== 'colaborador') {
      throw new AppError('Sem permissão para acessar esta funcionalidade', 403);
    }

    const campanhas = await prisma.evaluationCampaign.findMany({
      where: {
        status: 'ativa',
        tipoAlvo: { in: ['gestor', 'todos'] },
        gestores: {
          some: { colaboradoresAvaliaveis: { some: { colaboradorId: userId } } }
        }
      },
      include: {
        gestores: {
          where: { colaboradoresAvaliaveis: { some: { colaboradorId: userId } } },
          select: { gestorId: true }
        },
        _count: { select: { avaliacoes: true } }
      },
      orderBy: { dataFim: 'asc' }
    });

    if (!campanhas.length) return [];

    const campaignIds = campanhas.map(c => c.id);
    const avaliacoes = await prisma.evaluation.findMany({
      where: { campaignId: { in: campaignIds }, avaliadorId: userId },
      select: { campaignId: true, avaliadoId: true }
    });

    const feitas = {};
    for (const av of avaliacoes) {
      if (!feitas[av.campaignId]) feitas[av.campaignId] = new Set();
      feitas[av.campaignId].add(av.avaliadoId);
    }

    return campanhas.filter(c => {
      const gestorIds   = c.gestores.map(g => g.gestorId);
      const jaAvaliados = feitas[c.id] || new Set();
      return gestorIds.some(gId => !jaAvaliados.has(gId));
    });
  }

  async getPendingCampaignsForGestor(userId, userTipo) {
    if (userTipo !== 'gestor') {
      throw new AppError('Apenas gestores podem acessar esta funcionalidade', 403);
    }

    const campanhas = await prisma.evaluationCampaign.findMany({
      where: {
        status: 'ativa',
        tipoAlvo: { in: ['colaborador', 'todos'] },
        gestores: {
          some: {
            gestorId: userId,
            colaboradoresAvaliaveis: { some: {} }
          }
        }
      },
      include: {
        gestores: {
          where: { gestorId: userId },
          include: {
            colaboradoresAvaliaveis: { select: { colaboradorId: true } }
          }
        },
        _count: { select: { avaliacoes: true } }
      },
      orderBy: { dataFim: 'asc' }
    });

    if (!campanhas.length) return [];

    const campaignIds = campanhas.map(c => c.id);
    const avaliacoes = await prisma.evaluation.findMany({
      where: { campaignId: { in: campaignIds }, avaliadorId: userId },
      select: { campaignId: true, avaliadoId: true }
    });

    const feitas = {};
    for (const av of avaliacoes) {
      if (!feitas[av.campaignId]) feitas[av.campaignId] = new Set();
      feitas[av.campaignId].add(av.avaliadoId);
    }

    return campanhas.filter(c => {
      const cg = c.gestores[0];
      if (!cg) return false;
      const colaboradorIds = cg.colaboradoresAvaliaveis.map(ca => ca.colaboradorId);
      const jaAvaliados    = feitas[c.id] || new Set();
      return colaboradorIds.some(cId => !jaAvaliados.has(cId));
    });
  }

  async getGestoresNaoAvaliados(campaignId, colaboradorId, userId, userTipo) {
    if (userTipo === 'gestor') throw new AppError('Sem permissão', 403);

    if (userTipo === 'colaborador' && colaboradorId !== userId) {
      throw new AppError('Sem permissão para ver gestores de outro colaborador', 403);
    }

    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError('Campanha não encontrada', 404);

    return this.campaignRepository.getGestoresNaoAvaliados(campaignId, colaboradorId);
  }

  /**
   * Retorna as competências de uma campanha filtradas pelo tipo do avaliado.
   * Regra: competenciaDe deve ser igual ao tipo do avaliado OU 'todos'.
   */
  async getCompetenciasParaAvaliado(campaignId, avaliadoId, userId, userTipo) {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError('Campanha não encontrada', 404);

    const avaliado = await this.userRepository.findById(avaliadoId);
    if (!avaliado) throw new AppError('Avaliado não encontrado', 404);

    // Filtra as competências da campanha pelo tipo do avaliado (no backend, nunca no frontend)
    const tipoAvaliado = avaliado.tipo; // 'gestor' | 'colaborador'
    const competenciasFiltradas = (campaign.competencias || []).filter(cc => {
      const de = cc.competency?.competenciaDe;
      return de === tipoAvaliado || de === 'todos';
    });

    return competenciasFiltradas.map(cc => cc.competency);
  }

  async duplicate(id, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para duplicar campanhas', 403);
    }

    const original = await this.campaignRepository.findById(id);
    if (!original) throw new AppError('Campanha não encontrada', 404);

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

    const uniqueGestorIds = [...new Set(gestorIds)];

    return prisma.$transaction(async (tx) => {
      const created = await this.campaignRepository.create({
        ...novaData,
        gestorIds: uniqueGestorIds,
        gestorColaboradores
      }, tx);

      if (competencyIds.length > 0) {
        await tx.campaignCompetency.createMany({
          data: competencyIds.map(competencyId => ({
            campaignId: created.id,
            competencyId
          }))
        });
      }

      return created;
    }, { maxWait: 15000, timeout: 30000 });
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

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
    const fim    = new Date(dataFim);
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new AppError('Datas inválidas.', 400);
    }
    if (fim <= inicio) {
      throw new AppError('Data de fim deve ser posterior à data de início.', 400);
    }
  }

  _validateDataInicio(dataInicio) {
    const inicio = new Date(dataInicio);
    const hoje   = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (inicio < hoje) {
      throw new AppError('Data de início não pode ser uma data passada.', 400);
    }
  }
}

export { CampaignService };
