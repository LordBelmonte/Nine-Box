import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import { EvaluationRepository } from '../evaluations/evaluation.repository.js';
import { CompetencyRepository } from '../competencies/competency.repository.js';

class NineBoxService {
  constructor(nineBoxRepository) {
    this.nineBoxRepository = nineBoxRepository;
    this.userRepository = new UserRepository();
    this.evaluationRepository = new EvaluationRepository();
    this.competencyRepository = new CompetencyRepository();
  }

  // Classifica uma nota em BAIXO, MÉDIO ou ALTO
  classifyScore(score) {
    if (score >= 1.0 && score <= 2.5) {
      return 'BAIXO';
    } else if (score >= 2.6 && score <= 4.0) {
      return 'MÉDIO';
    } else if (score >= 4.1 && score <= 5.0) {
      return 'ALTO';
    }
    return 'INDEFINIDO';
  }

  // Calcula a categoria baseada em performance (X) e potential (Y)
  // Escala 1-5 com faixas: BAIXO (1.0-2.5), MÉDIO (2.6-4.0), ALTO (4.1-5.0)
  calculateCategoria(performance, potential) {
    const xClass = this.classifyScore(performance);
    const yClass = this.classifyScore(potential);

    // Matriz (Y = Potencial | X = Desempenho)
    const matriz = {
      'ALTO-BAIXO': 'Q4 (Dilema)',
      'ALTO-MÉDIO': 'Q7 (Forte Candidato)',
      'ALTO-ALTO': 'Q9 (Estrela)',
      'MÉDIO-BAIXO': 'Q2 (Questionável)',
      'MÉDIO-MÉDIO': 'Q5 (Mantenedor)',
      'MÉDIO-ALTO': 'Q8 (Alto Desempenho)',
      'BAIXO-BAIXO': 'Q1 (Insuficiente)',
      'BAIXO-MÉDIO': 'Q3 (Eficaz)',
      'BAIXO-ALTO': 'Q6 (Especialista)'
    };

    return matriz[`${yClass}-${xClass}`] || 'Indefinido';
  }

  // Calcula Performance (X) a partir das competências do tipo 'desempenho'
  async calculatePerformanceFromEvaluations(avaliadoId) {
    const evaluations = await this.evaluationRepository.findByAvaliado(avaliadoId, { page: 1, limit: 1000 });
    
    if (evaluations.evaluations.length === 0) {
      return null;
    }

    // Busca competências do tipo 'desempenho'
    const desempenhoCompetencies = await this.competencyRepository.findByTipo('desempenho');
    const desempenhoNames = desempenhoCompetencies.map(c => c.nome);

    // Extrai notas de competências de desempenho de todas as avaliações
    let allNotas = [];
    for (const evaluation of evaluations.evaluations) {
      if (evaluation.criterios) {
        for (const [competenciaNome, nota] of Object.entries(evaluation.criterios)) {
          if (desempenhoNames.includes(competenciaNome)) {
            allNotas.push(nota);
          }
        }
      }
    }

    if (allNotas.length === 0) {
      return null;
    }

    // Calcula média e converte para escala 1-5
    const media = allNotas.reduce((a, b) => a + b, 0) / allNotas.length;
    const performance = (media / 10) * 5; // Converte de escala 1-10 para 1-5

    return parseFloat(performance.toFixed(2));
  }

  // Calcula Potential (Y) a partir das competências do tipo 'lideranca' ou 'comportamento'
  async calculatePotentialFromEvaluations(avaliadoId) {
    const evaluations = await this.evaluationRepository.findByAvaliado(avaliadoId, { page: 1, limit: 1000 });
    
    if (evaluations.evaluations.length === 0) {
      return null;
    }

    // Busca competências dos tipos 'lideranca' e 'comportamento'
    const liderancaCompetencies = await this.competencyRepository.findByTipo('lideranca');
    const comportamentoCompetencies = await this.competencyRepository.findByTipo('comportamento');
    const potentialNames = [...liderancaCompetencies, ...comportamentoCompetencies].map(c => c.nome);

    // Extrai notas de competências de potencial de todas as avaliações
    let allNotas = [];
    for (const evaluation of evaluations.evaluations) {
      if (evaluation.criterios) {
        for (const [competenciaNome, nota] of Object.entries(evaluation.criterios)) {
          if (potentialNames.includes(competenciaNome)) {
            allNotas.push(nota);
          }
        }
      }
    }

    if (allNotas.length === 0) {
      return null;
    }

    // Calcula média e converte para escala 1-5
    const media = allNotas.reduce((a, b) => a + b, 0) / allNotas.length;
    const potential = (media / 10) * 5; // Converte de escala 1-10 para 1-5

    return parseFloat(potential.toFixed(2));
  }

  // Calcula Nine Box automaticamente a partir das avaliações de uma pessoa
  async calculateNineBoxFromEvaluations(avaliadoId) {
    const [performance, potential] = await Promise.all([
      this.calculatePerformanceFromEvaluations(avaliadoId),
      this.calculatePotentialFromEvaluations(avaliadoId)
    ]);

    if (performance === null || potential === null) {
      return {
        avaliadoId,
        performance: null,
        potential: null,
        categoria: 'Sem dados suficientes',
        message: 'Não há avaliações suficientes para calcular o Nine Box'
      };
    }

    const categoria = this.calculateCategoria(performance, potential);

    return {
      avaliadoId,
      performance,
      potential,
      categoria
    };
  }

  // Calcula Nine Box para todo o time de um gestor
  async calculateTeamNineBox(gestorId) {
    // Busca todos os colaboradores do gestor
    const colaboradores = await this.userRepository.findByGestorId(gestorId);

    if (!colaboradores || colaboradores.length === 0) {
      return {
        gestorId,
        team: [],
        total: 0
      };
    }

    // Calcula Nine Box para cada colaborador
    const teamNineBox = await Promise.all(
      colaboradores.map(async (colaborador) => {
        const nineBox = await this.calculateNineBoxFromEvaluations(colaborador.id);
        return {
          ...nineBox,
          id: colaborador.id, // Use pessoa ID as ID for frontend compatibility
          pessoa: {
            id: colaborador.id,
            nome: colaborador.nome,
            email: colaborador.email,
            tipo: colaborador.tipo,
            cargo: colaborador.cargo,
            departamento: colaborador.departamento,
            ra: colaborador.ra,
            foto: colaborador.foto
          }
        };
      })
    );

    return {
      gestorId,
      team: teamNineBox,
      total: colaboradores.length
    };
  }

  async create(data, userTipo) {
    // Apenas gestor e admin podem criar avaliações Nine Box
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para criar avaliações Nine Box', 403);
    }

    // Verifica se a pessoa existe
    const pessoa = await this.userRepository.findById(data.pessoaId);
    if (!pessoa) {
      throw new AppError('Pessoa não encontrada', 404);
    }

    // Verificar se já existe avaliação Nine Box para esta pessoa
    const avaliacaoExistente = await this.nineBoxRepository.findByPessoa(data.pessoaId);
    
    if (avaliacaoExistente.length > 0) {
      throw new AppError('Esta pessoa já possui uma avaliação Nine Box. Edite a avaliação existente se necessário.', 400);
    }

    // Calcula a categoria
    const categoria = this.calculateCategoria(data.performance, data.potential);

    // Cria a avaliação
    const nineBox = await this.nineBoxRepository.create({
      ...data,
      categoria
    });

    return nineBox;
  }

  async findById(id, userId, userTipo) {
    const nineBox = await this.nineBoxRepository.findById(id);
    if (!nineBox) {
      throw new AppError('Avaliação Nine Box não encontrada', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador' && nineBox.pessoaId !== userId) {
      throw new AppError('Sem permissão para ver esta avaliação', 403);
    }

    return nineBox;
  }

  async findAll(filters, userId, userTipo) {
    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador') {
      filters.pessoaId = userId;
    }

    return this.nineBoxRepository.findAll(filters);
  }

  async findByPessoa(pessoaId, userId, userTipo) {
    // Verifica se a pessoa existe
    const pessoa = await this.userRepository.findById(pessoaId);
    if (!pessoa) {
      throw new AppError('Pessoa não encontrada', 404);
    }

    // Colaborador só pode ver suas próprias avaliações
    if (userTipo === 'colaborador' && pessoaId !== userId) {
      throw new AppError('Sem permissão para ver estas avaliações', 403);
    }

    return this.nineBoxRepository.findByPessoa(pessoaId);
  }

  async findLatestByPessoa(pessoaId, userId, userTipo) {
    // Verifica se a pessoa existe
    const pessoa = await this.userRepository.findById(pessoaId);
    if (!pessoa) {
      throw new AppError('Pessoa não encontrada', 404);
    }

    // Colaborador só pode ver sua própria avaliação
    if (userTipo === 'colaborador' && pessoaId !== userId) {
      throw new AppError('Sem permissão para ver esta avaliação', 403);
    }

    const nineBox = await this.nineBoxRepository.findLatestByPessoa(pessoaId);
    if (!nineBox) {
      throw new AppError('Nenhuma avaliação Nine Box encontrada para esta pessoa', 404);
    }

    return nineBox;
  }

  async update(id, data, userTipo) {
    // Apenas gestor e admin podem atualizar
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para atualizar avaliações Nine Box', 403);
    }

    const nineBox = await this.nineBoxRepository.findById(id);
    if (!nineBox) {
      throw new AppError('Avaliação Nine Box não encontrada', 404);
    }

    // Recalcula categoria se performance ou potential mudaram
    if (data.performance || data.potential) {
      const performance = data.performance || nineBox.performance;
      const potential = data.potential || nineBox.potential;
      data.categoria = this.calculateCategoria(performance, potential);
    }

    return this.nineBoxRepository.update(id, data);
  }

  async delete(id, userId, userTipo) {
    const nineBox = await this.nineBoxRepository.findById(id);
    if (!nineBox) {
      throw new AppError('Avaliação Nine Box não encontrada', 404);
    }

    // Admin pode deletar sempre
    if (userTipo === 'admin') {
      await this.nineBoxRepository.delete(id);
      return { message: 'Avaliação Nine Box deletada com sucesso' };
    }

    // Gestor pode deletar dentro de 24 horas
    if (userTipo === 'gestor') {
      const now = new Date();
      const createdAt = new Date(nineBox.createdAt);
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        throw new AppError('Não é possível deletar avaliações Nine Box após 24 horas', 403);
      }

      await this.nineBoxRepository.delete(id);
      return { message: 'Avaliação Nine Box deletada com sucesso' };
    }

    // Colaborador não pode deletar
    throw new AppError('Sem permissão para deletar avaliações Nine Box', 403);
  }

  async getGridDistribution(userTipo) {
    // Colaborador não pode ver distribuição geral
    if (userTipo === 'colaborador') {
      throw new AppError('Sem permissão para ver distribuição do grid', 403);
    }

    return this.nineBoxRepository.getGridDistribution();
  }

  async getStatsByTipo(userTipo) {
    // Apenas admin pode ver estatísticas por tipo
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para ver estatísticas por tipo', 403);
    }

    return this.nineBoxRepository.getStatsByTipo();
  }
}

export { NineBoxService };
