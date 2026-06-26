import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { CampaignRepository } from '../campaigns/campaign.repository.js';
import { GroupRepository } from '../groups/group.repository.js';

class EvaluationService {
  constructor(evaluationRepository) {
    this.evaluationRepository = evaluationRepository;
    this.userRepository = new UserRepository();
    this.campaignRepository = new CampaignRepository();
    this.groupRepository = new GroupRepository();
  }

  async create(userId, userTipo, data) {
    const { campaignId, avaliadoId, criterios, comentario, anonima = true } = data;

    console.log('[DEBUG] create evaluation - userId:', userId, 'userTipo:', userTipo, 'data:', data);

    // Validação de negócio: campanha e relação entre avaliador/avaliado.
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError('Campanha não encontrada', 404);
    if (campaign.status !== 'ativa') {
      throw new AppError('Só é possível avaliar em campanhas ativas', 400);
    }

    console.log('[DEBUG] campaign.tipoAlvo:', campaign.tipoAlvo);

    // Verifica avaliado
    const avaliado = await this.userRepository.findById(avaliadoId);
    if (!avaliado) throw new AppError('Avaliado não encontrado', 404);

    console.log('[DEBUG] avaliado.tipo:', avaliado.tipo);

    // Valida tipo de usuário baseado no tipoAlvo da campanha
    if (campaign.tipoAlvo === 'colaborador') {
      // Campanha para avaliar colaboradores (gestor → colaborador)
      if (avaliado.tipo !== 'colaborador') {
        throw new AppError('Esta campanha é apenas para avaliar colaboradores', 400);
      }
      // Apenas gestor ou admin pode avaliar colaboradores
      if (userTipo !== 'gestor' && userTipo !== 'admin') {
        throw new AppError('Sem permissão para avaliar colaboradores', 403);
      }
      // Gestor só pode avaliar colaboradores do seu próprio grupo na campanha
      if (userTipo === 'gestor') {
        const todosColaboradoresPermitidos = await this.campaignRepository.getColaboradoresDoGestorNaCampanha(campaignId, userId);
        const permitido = todosColaboradoresPermitidos.some(c => c.id === avaliadoId);
        if (!permitido) {
          throw new AppError('Você não tem permissão para avaliar este colaborador nesta campanha', 403);
        }
      }
    } else if (campaign.tipoAlvo === 'gestor') {
      // Campanha para avaliar gestores (colaborador → gestor)
      if (avaliado.tipo !== 'gestor') {
        throw new AppError('Esta campanha é apenas para avaliar gestores', 400);
      }
      // Apenas colaborador ou admin pode avaliar gestores
      if (userTipo !== 'colaborador' && userTipo !== 'admin') {
        throw new AppError('Sem permissão para avaliar gestores', 403);
      }
      // Colaborador só pode avaliar gestores para os quais está explicitamente vinculado na campanha
      if (userTipo === 'colaborador') {
        const todosColaboradoresDoGestor = await this.campaignRepository.getColaboradoresDoGestorNaCampanha(campaignId, avaliadoId);
        const permitido = todosColaboradoresDoGestor.some(c => c.id === userId);
        if (!permitido) {
          throw new AppError('Você não tem permissão para avaliar este gestor nesta campanha', 403);
        }
      }
    } else if (campaign.tipoAlvo === 'todos') {
      // Campanha bidirecional
      if (userTipo === 'colaborador' && avaliado.tipo === 'gestor') {
        // Colaborador avaliando gestor: verifica CampaignGestorColaborador
        const todosColaboradoresDoGestor = await this.campaignRepository.getColaboradoresDoGestorNaCampanha(campaignId, avaliadoId);
        const permitido = todosColaboradoresDoGestor.some(c => c.id === userId);
        if (!permitido) {
          throw new AppError('Você não tem permissão para avaliar este gestor nesta campanha', 403);
        }
      }
      if (userTipo === 'gestor' && avaliado.tipo === 'colaborador') {
        // Gestor avaliando colaborador: verifica CampaignGestorColaborador (mesma lógica de tipoAlvo: colaborador)
        const todosColaboradoresPermitidos = await this.campaignRepository.getColaboradoresDoGestorNaCampanha(campaignId, userId);
        const permitido = todosColaboradoresPermitidos.some(c => c.id === avaliadoId);
        if (!permitido) {
          throw new AppError('Você não tem permissão para avaliar este colaborador nesta campanha', 403);
        }
      }
    }

    // Verifica se já avaliou esta pessoa nesta campanha
    const jaAvaliou = await this.evaluationRepository.findOne(campaignId, userId, avaliadoId);
    if (jaAvaliou) {
      throw new AppError('Você já avaliou esta pessoa nesta campanha', 400);
    }

    // Valida critérios contra os definidos na campanha
    // A campanha tem competências associadas através de campaign.competencias
    const criteriosCampanha = campaign.competencias || [];
    this._validateCriterios(criterios, criteriosCampanha);

    // Calcula média
    const notas = Object.values(criterios);
    const media = notas.reduce((a, b) => a + b, 0) / notas.length;

    return this.evaluationRepository.create({
      campaignId,
      avaliadorId: userId,
      avaliadoId,
      criterios,
      media: parseFloat(media.toFixed(2)),
      comentario: comentario || null,
      anonima
    });
  }

  async findById(id, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) throw new AppError('Avaliação não encontrada', 404);

    // Colaborador só pode ver avaliações onde é o avaliado
    if (userTipo === 'colaborador' && evaluation.avaliadoId !== userId) {
      throw new AppError('Sem permissão para ver esta avaliação', 403);
    }

    return this._sanitize(evaluation, userId, userTipo);
  }

  async findAll(filters, userId, userTipo) {
    // Regras de leitura: colaboradores e gestores podem consultar apenas seus próprios dados.
    // Se nenhum filtro for informado, retornamos avaliações próprias por padrão.
    if (userTipo === 'colaborador') {
      // Se não especificar filtro, mostra ambas as avaliações feitas e recebidas
      if (!filters.avaliadoId && !filters.avaliadorId) {
        const [feitas, recebidas] = await Promise.all([
          this.evaluationRepository.findAll({ ...filters, avaliadorId: userId }),
          this.evaluationRepository.findAll({ ...filters, avaliadoId: userId })
        ]);
        const todas = [...feitas.evaluations, ...recebidas.evaluations];
        return {
          evaluations: todas.map(e => this._sanitize(e, userId, userTipo)),
          pagination: feitas.pagination
        };
      }
    }

    // Gestor vê avaliações que fez (para colaboradores) e que recebeu (de colaboradores)
    if (userTipo === 'gestor') {
      if (!filters.avaliadoId && !filters.avaliadorId) {
        const [feitas, recebidas] = await Promise.all([
          this.evaluationRepository.findAll({ ...filters, avaliadorId: userId }),
          this.evaluationRepository.findAll({ ...filters, avaliadoId: userId })
        ]);
        const todas = [...feitas.evaluations, ...recebidas.evaluations];
        return {
          evaluations: todas.map(e => this._sanitize(e, userId, userTipo)),
          pagination: feitas.pagination
        };
      }
    }

    const result = await this.evaluationRepository.findAll(filters);
    result.evaluations = result.evaluations.map(e => this._sanitize(e, userId, userTipo));
    return result;
  }

  async findByAvaliado(avaliadoId, pagination, userId, userTipo) {
    // Leitura de avaliações recebidas:
    // - colaborador vê apenas as próprias avaliações recebidas.
    // - gestor vê apenas as próprias avaliações recebidas.
    if (userTipo === 'colaborador' && avaliadoId !== userId) {
      throw new AppError('Sem permissão', 403);
    }

    if (userTipo === 'gestor' && avaliadoId !== userId) {
      throw new AppError('Sem permissão', 403);
    }

    const result = await this.evaluationRepository.findByAvaliado(avaliadoId, pagination);
    result.evaluations = result.evaluations.map(e => this._sanitize(e, userId, userTipo));
    return result;
  }

  async findByAvaliador(avaliadorId, pagination, userId, userTipo) {
    // Leitura de avaliações feitas:
    // - colaborador vê apenas as avaliações que ele fez.
    // - gestor vê apenas as avaliações que ele fez.
    if (userTipo === 'colaborador' && avaliadorId !== userId) {
      throw new AppError('Sem permissão', 403);
    }

    if (userTipo === 'gestor' && avaliadorId !== userId) {
      throw new AppError('Sem permissão', 403);
    }

    const result = await this.evaluationRepository.findByAvaliador(avaliadorId, pagination);
    result.evaluations = result.evaluations.map(e => this._sanitize(e, userId, userTipo));
    return result;
  }

  async findByCampaign(campaignId, userId, userTipo) {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError('Campanha não encontrada', 404);

    if (campaign.tipoAlvo === 'colaborador') {
      // Campanha para avaliar colaboradores (gestor → colaborador)
      if (userTipo === 'colaborador') {
        throw new AppError('Sem permissão', 403);
      }
      if (userTipo === 'gestor') {
        // Gestor só vê as avaliações que ele fez nessa campanha
        const evaluations = await this.evaluationRepository.findByCampaignAndAvaliador(campaignId, userId);
        return evaluations.map(e => this._sanitize(e, userId, userTipo));
      }
    } else if (campaign.tipoAlvo === 'gestor') {
      // Campanha para avaliar gestores (colaborador → gestor)
      if (userTipo === 'gestor') {
        // O gestor avaliado pode ver as avaliações que recebeu nesta campanha.
        const evaluations = await this.evaluationRepository.findByCampaignAndAvaliado(campaignId, userId);
        return evaluations.map(e => this._sanitize(e, userId, userTipo));
      }
      if (userTipo === 'colaborador') {
        // Colaborador só vê as avaliações que ele fez nessa campanha
        const evaluations = await this.evaluationRepository.findByCampaignAndAvaliador(campaignId, userId);
        return evaluations.map(e => this._sanitize(e, userId, userTipo));
      }
    }

    // Admin vê todas
    const result = await this.evaluationRepository.findAll({ campaignId, page: 1, limit: 1000 });
    return result.evaluations;
  }

  async update(id, data, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) throw new AppError('Avaliação não encontrada', 404);

    // Só o avaliador ou admin pode editar
    if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para editar esta avaliação', 403);
    }

    // Campanha deve estar ativa
    if (evaluation.campaign.status !== 'ativa') {
      throw new AppError('Não é possível editar avaliações de campanhas não ativas', 400);
    }

    const updateData = {};

    if (data.criterios) {
      const campaign = await this.campaignRepository.findById(evaluation.campaignId);
      this._validateCriterios(data.criterios, campaign.criterios);
      const notas = Object.values(data.criterios);
      updateData.criterios = data.criterios;
      updateData.media = parseFloat((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2));
    }

    if (data.comentario !== undefined) {
      updateData.comentario = data.comentario;
    }

    return this.evaluationRepository.update(id, updateData);
  }

  async delete(id, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) throw new AppError('Avaliação não encontrada', 404);

    if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para deletar esta avaliação', 403);
    }

    await this.evaluationRepository.delete(id);
    return { message: 'Avaliação deletada com sucesso' };
  }

  async getStatsByAvaliado(avaliadoId, userId, userTipo) {
    if (userTipo === 'colaborador' && avaliadoId !== userId) {
      throw new AppError('Sem permissão', 403);
    }
    return this.evaluationRepository.getStatsByAvaliado(avaliadoId);
  }

  // --- Helpers ---

  _validateCriterios(criterios, criteriosCampanha) {
    // criteriosCampanha é um array de CampaignCompetency, que tem uma relação com Competency
    // Precisamos extrair os nomes das competências
    const nomesCampanha = criteriosCampanha.map(cc => cc.competency?.nome || cc.nome);
    const nomesEnviados = Object.keys(criterios);

    // Todos os critérios da campanha devem estar presentes
    for (const nome of nomesCampanha) {
      if (!(nome in criterios)) {
        throw new AppError(`Critério '${nome}' é obrigatório nesta campanha`, 400);
      }
    }

    // Não pode enviar critérios que não existem na campanha
    for (const nome of nomesEnviados) {
      if (!nomesCampanha.includes(nome)) {
        throw new AppError(`Critério '${nome}' não pertence a esta campanha`, 400);
      }
    }

    // Valida escala de cada critério (escala 1-4)
    for (const nome of nomesEnviados) {
      const nota = criterios[nome];
      if (nota < 1 || nota > 4) {
        throw new AppError(
          `Nota do critério '${nome}' deve ser entre 1 e 4`,
          400
        );
      }
    }
  }

  _sanitize(evaluation, userId, userTipo) {
    const result = { ...evaluation };

    // Admin vê o avaliador
    if (userTipo === 'admin') return result;

    // Outros não veem o avaliadorId se a avaliação for anônima
    if (result.anonima) {
      delete result.avaliadorId;
      delete result.avaliador;
    }

    return result;
  }
}

export { EvaluationService };
