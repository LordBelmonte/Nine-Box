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
    if (score >= 1 && score <= 1.5) {
      return 'BAIXO';
    } else if (score >= 1.6 && score <= 2.5) {
      return 'MÉDIO';
    } else if (score >= 2.6 && score <= 4) {
      return 'ALTO';
    }
    return 'INDEFINIDO';
  }

  // Calcula a categoria baseada em performance (X) e potential (Y)
  // Escala 1-4 com faixas: BAIXO (1-1.5), MÉDIO (1.6-2.5), ALTO (2.6-4)
  // ATENÇÃO: Usar NINEBOX-FONTE-UNICA-QUADRANTES.md como referência oficial
  calculateCategoria(performance, potential) {
    const xClass = this.classifyScore(performance);
    const yClass = this.classifyScore(potential);

    // Matriz (Y = Potencial | X = Desempenho) - Fonte Única
    const matriz = {
      'BAIXO-BAIXO': 'Q1 (Insuficiente)',
      'BAIXO-MÉDIO': 'Q2 (Questionável)',
      'BAIXO-ALTO': 'Q3 (Eficaz)',
      'MÉDIO-BAIXO': 'Q4 (Dilema)',
      'MÉDIO-MÉDIO': 'Q5 (Mantenedor)',
      'MÉDIO-ALTO': 'Q6 (Especialista)',
      'ALTO-BAIXO': 'Q7 (Forte Candidato)',
      'ALTO-MÉDIO': 'Q8 (Alto Desempenho)',
      'ALTO-ALTO': 'Q9 (Estrela)'
    };

    return matriz[`${yClass}-${xClass}`] || 'Indefinido';
  }

  // Retorna apenas o código do quadrante (Q1-Q9)
  getCodigoQuadrante(performance, potential) {
    const xClass = this.classifyScore(performance);
    const yClass = this.classifyScore(potential);
    const chave = `${yClass}-${xClass}`;
    
    const mapeamento = {
      'BAIXO-BAIXO': 'Q1',
      'BAIXO-MÉDIO': 'Q2',
      'BAIXO-ALTO': 'Q3',
      'MÉDIO-BAIXO': 'Q4',
      'MÉDIO-MÉDIO': 'Q5',
      'MÉDIO-ALTO': 'Q6',
      'ALTO-BAIXO': 'Q7',
      'ALTO-MÉDIO': 'Q8',
      'ALTO-ALTO': 'Q9'
    };

    return mapeamento[chave] || null;
  }

  // Calcula Performance (X) a partir das competências do tipo 'desempenho' e 'tecnica'
  async calculatePerformanceFromEvaluations(avaliadoId) {
    const evaluations = await this.evaluationRepository.findByAvaliado(avaliadoId, { page: 1, limit: 1000 });
    
    if (evaluations.evaluations.length === 0) {
      return null;
    }

    // Busca competências dos tipos 'desempenho' e 'tecnica'
    const desempenhoCompetencies = await this.competencyRepository.findByTipo('desempenho');
    const tecnicaCompetencies = await this.competencyRepository.findByTipo('tecnica');
    // Cria map de nome normalizado (lowercase) -> nome original
    const desempenhoNameMap = {};
    [...desempenhoCompetencies, ...tecnicaCompetencies].forEach(c => {
      desempenhoNameMap[c.nome.toLowerCase()] = c.nome;
    });

    // Extrai notas de competências de desempenho de todas as avaliações
    let allNotas = [];
    for (const evaluation of evaluations.evaluations) {
      if (evaluation.criterios) {
        for (const [competenciaNome, nota] of Object.entries(evaluation.criterios)) {
          // Compara usando lowercase para tolerant matching
          if (desempenhoNameMap[competenciaNome.toLowerCase()]) {
            allNotas.push(nota);
          }
        }
      }
    }

    if (allNotas.length === 0) {
      return null;
    }

    // Calcula média (escala 1-4, já está correta)
    const media = allNotas.reduce((a, b) => a + b, 0) / allNotas.length;
    const performance = media; // Já está na escala 1-4

    return parseFloat(performance.toFixed(2));
  }

  // Calcula Potential (Y) a partir das competências do tipo 'potencial', 'lideranca' ou 'comportamento'
  async calculatePotentialFromEvaluations(avaliadoId) {
    const evaluations = await this.evaluationRepository.findByAvaliado(avaliadoId, { page: 1, limit: 1000 });
    
    if (evaluations.evaluations.length === 0) {
      return null;
    }

    // Busca competências dos tipos 'potencial', 'lideranca' e 'comportamento'
    const potencialCompetencies = await this.competencyRepository.findByTipo('potencial');
    const liderancaCompetencies = await this.competencyRepository.findByTipo('lideranca');
    const comportamentoCompetencies = await this.competencyRepository.findByTipo('comportamento');
    // Cria map de nome normalizado (lowercase) -> nome original
    const potentialNameMap = {};
    [...potencialCompetencies, ...liderancaCompetencies, ...comportamentoCompetencies].forEach(c => {
      potentialNameMap[c.nome.toLowerCase()] = c.nome;
    });

    // Extrai notas de competências de potencial de todas as avaliações
    let allNotas = [];
    for (const evaluation of evaluations.evaluations) {
      if (evaluation.criterios) {
        for (const [competenciaNome, nota] of Object.entries(evaluation.criterios)) {
          // Compara usando lowercase para tolerant matching
          if (potentialNameMap[competenciaNome.toLowerCase()]) {
            allNotas.push(nota);
          }
        }
      }
    }

    if (allNotas.length === 0) {
      return null;
    }

    // Calcula média (escala 1-4, já está correta)
    const media = allNotas.reduce((a, b) => a + b, 0) / allNotas.length;
    const potential = media; // Já está na escala 1-4

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

  // Calcula Nine Box para todos os usuários (para admin)
  async calculateAllNineBoxes() {
    // Busca todos os usuários
    const users = await this.userRepository.findAll({ page: 1, limit: 1000 });
    const allUsers = users.users || [];

    console.log('[calculateAllNineBoxes] Total de usuários:', allUsers.length);

    if (!allUsers || allUsers.length === 0) {
      return {
        team: [],
        total: 0
      };
    }

    // Calcula Nine Box para cada usuário
    const allNineBoxes = await Promise.all(
      allUsers.map(async (user) => {
        const nineBox = await this.calculateNineBoxFromEvaluations(user.id);
        console.log(`[calculateAllNineBoxes] Usuário ${user.nome} (${user.tipo}):`, nineBox);
        return {
          ...nineBox,
          id: user.id,
          pessoa: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo: user.tipo,
            cargo: user.cargo,
            departamento: user.departamento,
            ra: user.ra,
            foto: user.foto
          }
        };
      })
    );

    // Filtra apenas usuários com dados válidos (performance e potential não null)
    const validNineBoxes = allNineBoxes.filter(nb => nb.performance !== null && nb.potential !== null);
    console.log('[calculateAllNineBoxes] NineBoxes válidos:', validNineBoxes.length, 'de', allNineBoxes.length);

    return {
      team: validNineBoxes,
      total: validNineBoxes.length
    };
  }

  // Calcula Nine Box para todo o time de um gestor
  async calculateTeamNineBox(gestorId) {
    // Busca todos os usuários (colaboradores e gestores) relacionados ao gestor
    const pessoas = await this.userRepository.findByGestorId(gestorId);

    // Busca também gestores que são subordinados a este gestor
    const gestoresSubordinados = await this.userRepository.findGestoresByGestorId(gestorId);

    // Combina as listas, removendo duplicatas
    const todasPessoas = [...pessoas];
    gestoresSubordinados.forEach(gestor => {
      if (!todasPessoas.some(p => p.id === gestor.id)) {
        todasPessoas.push(gestor);
      }
    });

    if (!todasPessoas || todasPessoas.length === 0) {
      return {
        gestorId,
        team: [],
        total: 0
      };
    }

    // Calcula Nine Box para cada pessoa (incluindo gestores)
    const teamNineBox = await Promise.all(
      todasPessoas.map(async (pessoa) => {
        const nineBox = await this.calculateNineBoxFromEvaluations(pessoa.id);
        return {
          ...nineBox,
          id: pessoa.id, // Use pessoa ID as ID for frontend compatibility
          pessoa: {
            id: pessoa.id,
            nome: pessoa.nome,
            email: pessoa.email,
            tipo: pessoa.tipo,
            cargo: pessoa.cargo,
            departamento: pessoa.departamento,
            ra: pessoa.ra,
            foto: pessoa.foto
          }
        };
      })
    );

    return {
      gestorId,
      team: teamNineBox,
      total: todasPessoas.length
    };
  }

  // ========== NOVOS MÉTODOS PARA RELATÓRIO MODAL ==========

  // Gera relatório individual para o modal
  async getReportIndividual(evaluationId, pessoaId, userId, userTipo) {
    // Verifica se a pessoa existe
    const pessoa = await this.userRepository.findById(pessoaId);
    if (!pessoa) {
      throw new AppError('Pessoa não encontrada. Verifique se o ID está correto.', 404);
    }

    // Colaborador só pode ver seu próprio relatório
    if (userTipo === 'colaborador' && pessoaId !== userId) {
      throw new AppError('Sem permissão para ver este relatório', 403);
    }

    // Calcula performance e potential a partir das avaliações
    const [performance, potential] = await Promise.all([
      this.calculatePerformanceFromEvaluations(pessoaId),
      this.calculatePotentialFromEvaluations(pessoaId)
    ]);

    if (performance === null || potential === null) {
      throw new AppError('Não há avaliações suficientes para gerar o relatório deste colaborador. Verifique se o colaborador possui avaliações respondidas.', 400);
    }

    // Busca competências avaliadas
    const competencias = [];
    const allEvaluations = await this.evaluationRepository.findByAvaliado(pessoaId, { page: 1, limit: 100 });
    
    // Determina o código da avaliação para exibição
    let evaluation = null;
    let avaliacaoCodigo = 'N/A';
    let empresa = pessoa.departamento || 'Empresa';
    
    // Se evaluationId for fornecido e não for 'all', tenta buscar a avaliação
    if (evaluationId && evaluationId !== 'all' && evaluationId !== 'null') {
      evaluation = await this.evaluationRepository.findById(evaluationId).catch(() => null);
      if (evaluation) {
        avaliacaoCodigo = evaluation.id.substring(0, 8).toUpperCase();
        empresa = evaluation.campaignId || empresa;
      } else {
        // Se não encontrou a avaliação, usa o ID fornecido como código
        avaliacaoCodigo = evaluationId.substring(0, 8).toUpperCase();
      }
    }
    
    // Buscar competências da avaliação mais recente se não encontrou a específica
    if (allEvaluations.evaluations.length > 0) {
      const avaliacao = evaluation 
        ? allEvaluations.evaluations.find(e => e.id === evaluationId) 
        : allEvaluations.evaluations[0];
      
      if (avaliacao && avaliacao.criterios) {
        for (const [nome, nota] of Object.entries(avaliacao.criterios)) {
          competencias.push({
            nome: nome,
            nota: nota
          });
        }
      }
      
      // Se não tem código ainda, usa o da avaliação encontrada
      if (!evaluation && allEvaluations.evaluations[0]) {
        avaliacaoCodigo = allEvaluations.evaluations[0].id.substring(0, 8).toUpperCase();
      }
    }

    const codigoQuadrante = this.getCodigoQuadrante(performance, potential);

    return {
      colaborador: {
        nome: pessoa.nome,
        empresa: pessoa.departamento || empresa,
        setor: pessoa.departamento || 'Não informado',
        cargo: pessoa.cargo || 'Não informado',
        statusAvaliacao: allEvaluations.evaluations.length > 0 ? 'Respondida' : 'Pendente'
      },
      notaDesempenho: parseFloat(performance.toFixed(2)),
      notaPotencial: parseFloat(potential.toFixed(2)),
      nivelDesempenho: this.classifyScore(performance),
      nivelPotencial: this.classifyScore(potential),
      codigoQuadrante: codigoQuadrante,
      competencias: competencias,
      avaliacao: {
        codigo: avaliacaoCodigo,
        empresa: empresa
      }
    };
  }

  // Gera relatório consolidado para o modal
  async getReportConsolidated(evaluationId, userId, userTipo) {
    // Sempre trata como consolidado geral — qualquer evaluationId que não seja
    // um ID de avaliação real é ignorado (ex: UUID de usuário, 'all', 'null', etc.)
    const isGeral = !evaluationId || evaluationId === 'all' || evaluationId === 'null';
    
    let evaluation = null;
    if (!isGeral) {
      // Tenta buscar a avaliação silenciosamente — se não existir, faz consolidado geral
      evaluation = await this.evaluationRepository.findById(evaluationId).catch(() => null);
      // Se não encontrou (pode ser UUID de usuário ou outro valor), trata como geral
    }

    // Busca todos os usuários
    const users = await this.userRepository.findAll({ page: 1, limit: 1000 });
    const allUsers = users.users || [];

    if (allUsers.length === 0) {
      throw new AppError('Nenhum usuário encontrado no sistema', 404);
    }

    // Calcula performance e potential para cada usuário
    let totalPerformance = 0;
    let totalPotential = 0;
    let count = 0;
    let competenciasAcumuladas = {};

    for (const user of allUsers) {
      const [performance, potential] = await Promise.all([
        this.calculatePerformanceFromEvaluations(user.id),
        this.calculatePotentialFromEvaluations(user.id)
      ]);

      if (performance !== null && potential !== null) {
        totalPerformance += performance;
        totalPotential += potential;
        count++;

        // Acumula notas das competências
        const userEvals = await this.evaluationRepository.findByAvaliado(user.id, { page: 1, limit: 1 });
        if (userEvals.evaluations.length > 0) {
          const criterios = userEvals.evaluations[0].criterios;
          if (criterios) {
            for (const [nome, nota] of Object.entries(criterios)) {
              if (!competenciasAcumuladas[nome]) {
                competenciasAcumuladas[nome] = { soma: 0, count: 0 };
              }
              competenciasAcumuladas[nome].soma += nota;
              competenciasAcumuladas[nome].count++;
            }
          }
        }
      }
    }

    if (count === 0) {
      throw new AppError('Não há avaliações suficientes para gerar relatório consolidado. Verifique se há avaliações respondidas.', 400);
    }

    // Calcula médias
    const notaDesempenhoMedia = totalPerformance / count;
    const notaPotencialMedia = totalPotential / count;

    // Calcula competências médias
    const competencias = [];
    for (const [nome, dados] of Object.entries(competenciasAcumuladas)) {
      competencias.push({
        nome: nome,
        notaMedia: parseFloat((dados.soma / dados.count).toFixed(2))
      });
    }

    // Determina quadrante predominante (simplificado: usa a média)
    const codigoQuadranteGeral = this.getCodigoQuadrante(notaDesempenhoMedia, notaPotencialMedia);

    // Busca gestor responsável (simplificado)
    const gestor = await this.userRepository.findById(userId);

    // Retorna dados da avaliação se disponível, ou dados gerais
    return {
      avaliacao: {
        codigo: evaluation?.id ? evaluation.id.substring(0, 8).toUpperCase() : 'GERAL',
        empresa: evaluation?.campaignId || 'Consolidado Geral',
        gestor: gestor?.nome || 'Não informado',
        totalColaboradores: allUsers.length,
        totalRespondidos: count,
        isGeral: isGeral
      },
      notaDesempenhoMedia: parseFloat(notaDesempenhoMedia.toFixed(2)),
      notaPotencialMedia: parseFloat(notaPotencialMedia.toFixed(2)),
      codigoQuadranteGeral: codigoQuadranteGeral,
      competencias: competencias
    };
  }

  // ========== FIM NOVOS MÉTODOS ==========

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
