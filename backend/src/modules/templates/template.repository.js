import { prisma } from '../../config/database.js';

class TemplateRepository {
  async create(data) {
    return prisma.evaluationTemplate.create({
      data
    });
  }

  async findById(id) {
    return prisma.evaluationTemplate.findUnique({
      where: { id }
    });
  }

  async findAll(filters = {}) {
    const { tipo, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    const where = {};

    if (tipo) {
      where.tipo = tipo;
    }

    const [templates, total] = await Promise.all([
      prisma.evaluationTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluationTemplate.count({ where })
    ]);

    return {
      templates,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async update(id, data) {
    return prisma.evaluationTemplate.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.evaluationTemplate.delete({
      where: { id }
    });
  }
}

export { TemplateRepository };
