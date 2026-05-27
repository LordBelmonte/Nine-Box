import { AppError } from '../../utils/errors.js';

class TemplateService {
  constructor(templateRepository) {
    this.templateRepository = templateRepository;
  }

  async create(data, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem criar modelos de avaliação', 403);
    }

    const tiposValidos = ['auto', 'gestor', '180'];
    if (!tiposValidos.includes(data.tipo)) {
      throw new AppError('Tipo deve ser: auto, gestor ou 180', 400);
    }

    if (!data.nome || data.nome.trim() === '') {
      throw new AppError('Nome é obrigatório', 400);
    }

    if (!data.criterios || !Array.isArray(data.criterios) || data.criterios.length === 0) {
      throw new AppError('Criterios são obrigatórios', 400);
    }

    return this.templateRepository.create(data);
  }

  async findById(id, userTipo) {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new AppError('Modelo não encontrado', 404);
    }
    return template;
  }

  async findAll(filters, userTipo) {
    return this.templateRepository.findAll(filters);
  }

  async update(id, data, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem editar modelos de avaliação', 403);
    }

    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new AppError('Modelo não encontrado', 404);
    }

    if (data.tipo) {
      const tiposValidos = ['auto', 'gestor', '180'];
      if (!tiposValidos.includes(data.tipo)) {
        throw new AppError('Tipo deve ser: auto, gestor ou 180', 400);
      }
    }

    return this.templateRepository.update(id, data);
  }

  async delete(id, userTipo) {
    if (userTipo !== 'admin') {
      throw new AppError('Apenas admins podem deletar modelos de avaliação', 403);
    }

    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new AppError('Modelo não encontrado', 404);
    }

    await this.templateRepository.delete(id);
    return { message: 'Modelo deletado com sucesso' };
  }
}

export { TemplateService };
