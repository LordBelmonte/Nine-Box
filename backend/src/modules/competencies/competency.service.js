import { AppError } from '../../utils/errors.js';

class CompetencyService {
  constructor(competencyRepository) {
    this.competencyRepository = competencyRepository;
  }

  async create(data, userTipo) {
    // Apenas admin pode criar competências
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para criar competências', 403);
    }

    // Verifica se já existe competência com esse nome
    const exists = await this.competencyRepository.exists(data.nome);
    if (exists) {
      throw new AppError('Já existe uma competência com este nome', 400);
    }

    // Valida número de critérios
    if (data.criterios.length < 1 || data.criterios.length > 10) {
      throw new AppError('A competência deve ter entre 1 e 10 critérios', 400);
    }

    // Valida descrições textuais se fornecidas
    if (data.ideal && typeof data.ideal !== 'string') {
      throw new AppError('Descrição ideal deve ser texto', 400);
    }
    if (data.bom && typeof data.bom !== 'string') {
      throw new AppError('Descrição bom deve ser texto', 400);
    }
    if (data.mediano && typeof data.mediano !== 'string') {
      throw new AppError('Descrição mediano deve ser texto', 400);
    }
    if (data.a_melhorar && typeof data.a_melhorar !== 'string') {
      throw new AppError('Descrição a_melhorar deve ser texto', 400);
    }

    const competency = await this.competencyRepository.create(data);
    return competency;
  }

  async findById(id) {
    const competency = await this.competencyRepository.findById(id);
    if (!competency) {
      throw new AppError('Competência não encontrada', 404);
    }
    return competency;
  }

  async findAll(filters) {
    return this.competencyRepository.findAll(filters);
  }

  async findByTipo(tipo) {
    const validTipos = ['desempenho', 'comportamento', 'tecnica', 'lideranca'];
    if (!validTipos.includes(tipo)) {
      throw new AppError('Tipo de competência inválido', 400);
    }
    return this.competencyRepository.findByTipo(tipo);
  }

  async findByCompetenciaDe(competenciaDe) {
    const validCompetenciaDe = ['gestor', 'colaborador', 'todos'];
    if (!validCompetenciaDe.includes(competenciaDe)) {
      throw new AppError('CompetenciaDe inválido', 400);
    }
    return this.competencyRepository.findByCompetenciaDe(competenciaDe);
  }

  async update(id, data, userTipo) {
    // Apenas admin pode atualizar competências
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para atualizar competências', 403);
    }

    const competency = await this.competencyRepository.findById(id);
    if (!competency) {
      throw new AppError('Competência não encontrada', 404);
    }

    // Se está mudando o nome, verifica se não existe outro com esse nome
    if (data.nome && data.nome !== competency.nome) {
      const exists = await this.competencyRepository.exists(data.nome);
      if (exists) {
        throw new AppError('Já existe uma competência com este nome', 400);
      }
    }

    // Valida número de critérios se estiver atualizando
    if (data.criterios && (data.criterios.length < 1 || data.criterios.length > 10)) {
      throw new AppError('A competência deve ter entre 1 e 10 critérios', 400);
    }

    // Valida descrições textuais se fornecidas
    if (data.ideal && typeof data.ideal !== 'string') {
      throw new AppError('Descrição ideal deve ser texto', 400);
    }
    if (data.bom && typeof data.bom !== 'string') {
      throw new AppError('Descrição bom deve ser texto', 400);
    }
    if (data.mediano && typeof data.mediano !== 'string') {
      throw new AppError('Descrição mediano deve ser texto', 400);
    }
    if (data.a_melhorar && typeof data.a_melhorar !== 'string') {
      throw new AppError('Descrição a_melhorar deve ser texto', 400);
    }

    return this.competencyRepository.update(id, data);
  }

  async delete(id, userTipo) {
    // Apenas admin pode deletar competências
    if (userTipo !== 'admin') {
      throw new AppError('Sem permissão para deletar competências', 403);
    }

    const competency = await this.competencyRepository.findById(id);
    if (!competency) {
      throw new AppError('Competência não encontrada', 404);
    }

    await this.competencyRepository.delete(id);
    return { message: 'Competência deletada com sucesso' };
  }

  async getStats() {
    return this.competencyRepository.getStatsByTipo();
  }
}

export { CompetencyService };
