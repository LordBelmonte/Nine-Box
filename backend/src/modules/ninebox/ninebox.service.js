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
  // Nova regra: escala 1–4 dividida em três faixas iguais
  // BAIXO: 1.00–2.33 | MÉDIO: 2.34–3.66 | ALTO: 3.67–4.00
  // Implementação: limites fechados à esquerda, limite superior < para evitar sobreposição
  classifyScore(score) {
    if (score === null || score === undefined || isNaN(score)) return 'INDEFINIDO';
    if (score < 1 || score > 4) return 'INDEFINIDO'; // fora da escala válida
    if (score < 2.34) return 'BAIXO';  // 1.00–2.33
    if (score < 3.67) return 'MÉDIO';  // 2.34–3.66
    return 'ALTO';                      // 3.67–4.00
  }

  // Calcula a categoria baseada em performance (X) e potential (Y)
  // Retorna null se algum dos scores for inválido (fora da faixa 1-4)
  //
  // MATRIZ OFICIAL (chave: ${POTENCIAL}-${PERFORMANCE}):
  //              PERF_BAIXO  PERF_MÉDIO  PERF_ALTO
  //  POT_BAIXO      B1          M1          A1
  //  POT_MÉDIO      B2          M2          A2
  //  POT_ALTO       B3          M3          A3
  calculateCategoria(performance, potential) {
    const perfClass = this.classifyScore(performance);
    const potClass  = this.classifyScore(potential);

    if (perfClass === 'INDEFINIDO' || potClass === 'INDEFINIDO') return null;

    // Chave: ${POTENCIAL}-${PERFORMANCE} (convenção interna do sistema)
    const matriz = {
      'BAIXO-BAIXO': 'B1', // pot=Baixo  perf=Baixo  → B1 Insuficiente
      'BAIXO-MÉDIO': 'M1', // pot=Baixo  perf=Médio  → M1 Questionável
      'BAIXO-ALTO':  'A1', // pot=Baixo  perf=Alto   → A1 Enigma
      'MÉDIO-BAIXO': 'B2', // pot=Médio  perf=Baixo  → B2 Eficaz
      'MÉDIO-MÉDIO': 'M2', // pot=Médio  perf=Médio  → M2 Mantenedor
      'MÉDIO-ALTO':  'A2', // pot=Médio  perf=Alto   → A2 Em crescimento
      'ALTO-BAIXO':  'B3', // pot=Alto   perf=Baixo  → B3 Comprometido
      'ALTO-MÉDIO':  'M3', // pot=Alto   perf=Médio  → M3 Forte Desempenho
      'ALTO-ALTO':   'A3', // pot=Alto   perf=Alto   → A3 Destaque
    };

    return matriz[`${potClass}-${perfClass}`] || null;
  }

  // Retorna o código do quadrante (B1-A3) — alias de calculateCategoria para compatibilidade
  getCodigoQuadrante(performance, potential) {
    return this.calculateCategoria(performance, potential);
  }

  // Converte código B1-A3 para nome oficial
  getNomeQuadrante(codigo) {
    const nomes = {
      B1: 'Insuficiente',    B2: 'Eficaz',          B3: 'Comprometido',
      M1: 'Questionável',    M2: 'Mantenedor',       M3: 'Forte Desempenho',
      A1: 'Enigma',          A2: 'Em crescimento',   A3: 'Destaque',
    };
    return nomes[codigo] || null;
  }

  // Compatibilidade: converte código Q1-Q9 legado para B1-A3 oficial
  normalizeCodigoQuadrante(codigo) {
    if (!codigo) return null;
    const legado = {
      'Q1': 'B1', 'Q2': 'M1', 'Q3': 'A1',
      'Q4': 'B2', 'Q5': 'M2', 'Q6': 'A2',
      'Q7': 'B3', 'Q8': 'M3', 'Q9': 'A3',
    };
    // Se já é B/M/A, retorna como está
    if (/^[BMA][123]$/.test(codigo)) return codigo;
    // Extrai código Q se vier no formato "Q1 (Insuficiente)" etc.
    const match = codigo.match(/^Q([1-9])/);
    if (match) return legado[`Q${match[1]}`] || null;
    return legado[codigo] || null;
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
        categoria: null,
        codigoQuadrante: null,
        nomeQuadrante: null,
        message: 'Não há avaliações suficientes para calcular o Nine Box'
      };
    }

    const categoria = this.calculateCategoria(performance, potential);

    // Se o cálculo retornou null (score fora da faixa 1-4), trata como sem dados
    if (!categoria) {
      return {
        avaliadoId,
        performance: null,
        potential: null,
        categoria: null,
        codigoQuadrante: null,
        nomeQuadrante: null,
        message: `Notas fora da faixa válida (1-4): performance=${performance}, potential=${potential}`
      };
    }

    return {
      avaliadoId,
      performance,
      potential,
      categoria,                          // código B1-A3
      codigoQuadrante: categoria,         // alias explícito
      nomeQuadrante: this.getNomeQuadrante(categoria),
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

    // Calcula performance e potential a partir das avaliações do avaliado
    const [performance, potential] = await Promise.all([
      this.calculatePerformanceFromEvaluations(pessoaId),
      this.calculatePotentialFromEvaluations(pessoaId)
    ]);

    if (performance === null || potential === null) {
      throw new AppError(
        'Não há avaliações suficientes para gerar o relatório deste colaborador. Verifique se o colaborador possui avaliações respondidas.',
        400
      );
    }

    // Busca avaliações recebidas pelo avaliado com detalhes de campanha
    const avaliacoesDetalhadas = await this.evaluationRepository.findByAvaliadoWithDetails(pessoaId, 100);

    // Calcula média de cada competência (critério) somando todas as avaliações recebidas
    const competenciasSoma     = {};
    const competenciasContagem = {};

    for (const ev of avaliacoesDetalhadas) {
      if (ev.criterios && typeof ev.criterios === 'object') {
        for (const [nome, nota] of Object.entries(ev.criterios)) {
          if (typeof nota === 'number') {
            competenciasSoma[nome]     = (competenciasSoma[nome]     || 0) + nota;
            competenciasContagem[nome] = (competenciasContagem[nome] || 0) + 1;
          }
        }
      }
    }

    const competencias = Object.entries(competenciasSoma).map(([nome, soma]) => ({
      nome,
      nota: parseFloat((soma / competenciasContagem[nome]).toFixed(2))
    }));

    // Monta detalhamento por avaliação (campanha + critérios + notas)
    // Garante que só retorna avaliações deste avaliado (segurança extra)
    const detalhamentoAvaliacoes = avaliacoesDetalhadas
      .filter(ev => ev.avaliadoId === pessoaId)
      .map(ev => ({
        id:       ev.id,
        campanha: ev.campaign?.nome || 'Sem campanha',
        data:     ev.createdAt || ev.data || null,
        media:    ev.media !== null && ev.media !== undefined
                    ? parseFloat(ev.media.toFixed(2))
                    : null,
        criterios: ev.criterios || {}
      }));

    // Determina informações da campanha mais recente para exibição
    const avaliacaoMaisRecente = avaliacoesDetalhadas[0] || null;
    const campanhaNome  = avaliacaoMaisRecente?.campaign?.nome  || 'N/A';
    const campanhaId    = avaliacaoMaisRecente?.campaign?.id    || 'N/A';
    const avaliacaoCodigo = avaliacaoMaisRecente
      ? avaliacaoMaisRecente.id.substring(0, 8).toUpperCase()
      : 'N/A';

    const codigoQuadrante = this.getCodigoQuadrante(performance, potential);

    return {
      colaborador: {
        nome:            pessoa.nome,
        cargo:           pessoa.cargo        || 'Não informado',
        departamento:    pessoa.departamento || 'Não informado',
        setor:           pessoa.departamento || 'Não informado',
        empresa:         pessoa.departamento || 'Empresa',
        ra:              pessoa.ra           || '',
        statusAvaliacao: avaliacoesDetalhadas.length > 0 ? 'Respondida' : 'Pendente',
        totalAvaliacoes: avaliacoesDetalhadas.length
      },
      notaDesempenho:  parseFloat(performance.toFixed(2)),
      notaPotencial:   parseFloat(potential.toFixed(2)),
      nivelDesempenho: this.classifyScore(performance),
      nivelPotencial:  this.classifyScore(potential),
      codigoQuadrante,
      nomeQuadrante:   this.getNomeQuadrante(codigoQuadrante),
      competencias,
      detalhamentoAvaliacoes,
      avaliacao: {
        codigo:   avaliacaoCodigo,
        campanha: campanhaNome,
        empresa:  campanhaNome
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
      notaPotencialMedia:  parseFloat(notaPotencialMedia.toFixed(2)),
      codigoQuadranteGeral,
      nomeQuadranteGeral: this.getNomeQuadrante(codigoQuadranteGeral),
      competencias
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
