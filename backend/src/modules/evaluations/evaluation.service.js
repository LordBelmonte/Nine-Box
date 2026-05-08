import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';

class EvaluationService {
  constructor(evaluationRepository) {
    this.evaluationRepository = evaluationRepository;
    this.userRepository = new UserRepository();
  }

  /**
   * Determinar tipo de avaliação baseado nos tipos de usuário
   */
  determinarTipoAvaliacao(avaliadorTipo, avaliadoTipo) {
    // Admin pode avaliar qualquer um (360°)
    if (avaliadorTipo === 'admin') {
      return 'avaliacao_360';
    }

    // Gestor avalia colaborador (180°)
    if (avaliadorTipo === 'gestor' && avaliadoTipo === 'colaborador') {
      return 'gestor_para_colaborador';
    }

    // Colaborador avalia gestor (360°)
    if (avaliadorTipo === 'colaborador' && avaliadoTipo === 'gestor') {
      return 'colaborador_para_gestor';
    }

    // Colaborador avalia colaborador (360° peer review)
    if (avaliadorTipo === 'colaborador' && avaliadoTipo === 'colaborador') {
      return 'avaliacao_360';
    }

    // Gestor avalia gestor (360° peer review)
    if (avaliadorTipo === 'gestor' && avaliadoTipo === 'gestor') {
      return 'avaliacao_360';
    }

    // Não permitido
    return null;
  }

  /**
   * Sanitizar avaliação (remover dados sensíveis para anonimato)
   */
  sanitizeEvaluation(evaluation, userTipo = null, userId = null) {
    const sanitized = { ...evaluation };
    
    // Adicionar flag indicando se a avaliação foi feita pelo usuário logado
    // (antes de remover o avaliadorId)
    if (userId) {
      sanitized.isMine = evaluation.avaliadorId === userId;
    }
    
    // Remover avaliadorId para manter anonimato (exceto para admin OU se for a própria avaliação)
    const isOwnEvaluation = userId && evaluation.avaliadorId === userId;
    if (userTipo !== 'admin' && evaluation.anonima && !isOwnEvaluation) {
      delete sanitized.avaliadorId;
      delete sanitized.avaliador; // Remover relação também
    }
    
    return sanitized;
  }

  async create(avaliadorId, avaliadorTipo, data) {
    // Verifica se o avaliado existe
    const avaliado = await this.userRepository.findById(data.avaliadoId);
    if (!avaliado) {
      throw new AppError('Usuário avaliado não encontrado', 404);
    }

    // Não pode avaliar a si mesmo (exceto admin)
    if (avaliadorId === data.avaliadoId && avaliadorTipo !== 'admin') {
      throw new AppError('Você não pode se autoavaliar', 403);
    }

    // Validar tipo de avaliação baseado nos tipos de usuário
    const tipoAvaliacao = this.determinarTipoAvaliacao(avaliadorTipo, avaliado.tipo);
    
    if (!tipoAvaliacao) {
      throw new AppError('Tipo de avaliação não permitido entre estes usuários', 403);
    }

    // Verificar se já existe avaliação deste avaliador para este avaliado
    const avaliacaoExistente = await this.evaluationRepository.findAll({
      page: 1,
      limit: 1,
      avaliadorId,
      avaliadoId: data.avaliadoId
    });

    if (avaliacaoExistente.evaluations.length > 0) {
      console.log(`[VALIDAÇÃO] Avaliador ${avaliadorId} já avaliou ${data.avaliadoId}`);
      throw new AppError('Você já avaliou esta pessoa. Edite a avaliação existente se necessário.', 400);
    }

    console.log(`[VALIDAÇÃO] Permitindo avaliação: Avaliador ${avaliadorId} → Avaliado ${data.avaliadoId}`);

    // Calcular média dos critérios (se houver)
    let media = null;
    if (data.criterios) {
      const criteriosArray = Object.values(data.criterios);
      media = parseFloat(
        (criteriosArray.reduce((a, b) => a + b, 0) / criteriosArray.length).toFixed(1)
      );
    }

    // Criar avaliação (anônima por padrão)
    const evaluation = await this.evaluationRepository.create({
      avaliadorId, // Salvo internamente
      avaliadoId: data.avaliadoId,
      tipoAvaliacao,
      criterios: data.criterios || null,
      media,
      comentario: data.comentario || null,
      anonima: data.anonima !== false // true por padrão
    });

    // Retornar sem avaliadorId (manter anonimato)
    return this.sanitizeEvaluation(evaluation, avaliadorTipo, avaliadorId);
  }

  async findById(id, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador' && 
        evaluation.avaliadoId !== userId && 
        evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para ver esta avaliação', 403);
    }

    return this.sanitizeEvaluation(evaluation, userTipo, userId);
  }

  async findAll(filters, userId, userTipo) {
    // Colaborador e Gestor veem TODAS as avaliações que fizeram OU receberam
    if (userTipo === 'colaborador' || userTipo === 'gestor') {
      // Busca avaliações que fez OU que recebeu (TODOS os tipos)
      const [avaliacoesFeitas, avaliacoesRecebidas] = await Promise.all([
        this.evaluationRepository.findByAvaliador(userId, filters),
        this.evaluationRepository.findByAvaliado(userId, filters)
      ]);

      // Combina TODAS as avaliações (sem filtrar por tipo)
      const todasAvaliacoes = [
        ...avaliacoesFeitas.evaluations,
        ...avaliacoesRecebidas.evaluations
      ];

      // Remove duplicatas
      const avaliacoesUnicas = todasAvaliacoes.filter((evaluation, index, self) =>
        index === self.findIndex(e => e.id === evaluation.id)
      );

      return {
        evaluations: avaliacoesUnicas.map(e => this.sanitizeEvaluation(e, userTipo, userId)),
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: avaliacoesUnicas.length,
          totalPages: Math.ceil(avaliacoesUnicas.length / (filters.limit || 10))
        }
      };
    }

    // Admin vê todos os tipos (não filtra por tipoAvaliacao)
    const result = await this.evaluationRepository.findAll(filters);
    return {
      evaluations: result.evaluations.map(e => this.sanitizeEvaluation(e, userTipo, userId)),
      pagination: result.pagination
    };
  }

  async findByAvaliado(avaliadoId, pagination, userId, userTipo) {
    // Verifica se o avaliado existe
    const avaliado = await this.userRepository.findById(avaliadoId);
    if (!avaliado) {
      throw new AppError('Avaliado não encontrado', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador' && avaliadoId !== userId) {
      throw new AppError('Sem permissão para ver estas avaliações', 403);
    }

    const result = await this.evaluationRepository.findByAvaliado(avaliadoId, pagination);
    return {
      evaluations: result.evaluations.map(e => this.sanitizeEvaluation(e, userTipo, userId)),
      pagination: result.pagination
    };
  }

  async findByAvaliador(avaliadorId, pagination, userId, userTipo) {
    // Colaborador só pode ver avaliações que fez
    if (userTipo === 'colaborador' && avaliadorId !== userId) {
      throw new AppError('Sem permissão para ver estas avaliações', 403);
    }

    const result = await this.evaluationRepository.findByAvaliador(avaliadorId, pagination);
    return {
      evaluations: result.evaluations.map(e => this.sanitizeEvaluation(e, userTipo, userId)),
      pagination: result.pagination
    };
  }

  async update(id, data, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    // Apenas o avaliador ou admin pode editar
    if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para editar esta avaliação', 403);
    }

    // Verificar limite de 24 horas (exceto para admin)
    if (userTipo !== 'admin') {
      const horasPassadas = (Date.now() - new Date(evaluation.createdAt).getTime()) / (1000 * 60 * 60);
      if (horasPassadas > 24) {
        throw new AppError('Avaliações só podem ser editadas nas primeiras 24 horas', 403);
      }
    }

    // Recalcular média se critérios foram alterados
    if (data.criterios) {
      const criteriosArray = Object.values(data.criterios);
      data.media = parseFloat(
        (criteriosArray.reduce((a, b) => a + b, 0) / criteriosArray.length).toFixed(1)
      );
    }

    const updated = await this.evaluationRepository.update(id, data);
    return this.sanitizeEvaluation(updated, userTipo, userId);
  }

  async delete(id, userId, userTipo) {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new AppError('Avaliação não encontrada', 404);
    }

    // Apenas o avaliador ou admin pode deletar
    if (userTipo !== 'admin' && evaluation.avaliadorId !== userId) {
      throw new AppError('Sem permissão para deletar esta avaliação', 403);
    }

    // Verificar limite de 24 horas (exceto para admin)
    if (userTipo !== 'admin') {
      const horasPassadas = (Date.now() - new Date(evaluation.createdAt).getTime()) / (1000 * 60 * 60);
      if (horasPassadas > 24) {
        throw new AppError('Avaliações só podem ser excluídas nas primeiras 24 horas', 403);
      }
    }

    await this.evaluationRepository.delete(id);
    return { message: 'Avaliação deletada com sucesso' };
  }

  async getStatsByAvaliado(avaliadoId, userId, userTipo) {
    // Verifica se o avaliado existe
    const avaliado = await this.userRepository.findById(avaliadoId);
    if (!avaliado) {
      throw new AppError('Avaliado não encontrado', 404);
    }

    // Colaborador só pode ver suas próprias estatísticas
    if (userTipo === 'colaborador' && avaliadoId !== userId) {
      throw new AppError('Sem permissão para ver estas estatísticas', 403);
    }

    return this.evaluationRepository.getStatsByAvaliado(avaliadoId);
  }
}

export { EvaluationService };
