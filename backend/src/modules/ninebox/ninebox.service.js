import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';

class NineBoxService {
  constructor(nineBoxRepository) {
    this.nineBoxRepository = nineBoxRepository;
    this.userRepository = new UserRepository();
  }

  // Calcula a categoria baseada em performance e potential
  calculateCategoria(performance, potential) {
    const categorias = {
      '1-1': 'Questão',
      '2-1': 'Trabalhador',
      '3-1': 'Âncora',
      '1-2': 'Dilema',
      '2-2': 'Núcleo',
      '3-2': 'Especialista',
      '1-3': 'Enigma',
      '2-3': 'Estrela',
      '3-3': 'Superstar'
    };

    return categorias[`${performance}-${potential}`] || 'Indefinido';
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
