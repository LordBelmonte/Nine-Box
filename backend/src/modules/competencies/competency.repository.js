import { prisma } from '../../config/database.js';

class CompetencyRepository {
  async create(data) {
    return prisma.competency.create({ data });
  }

  async findById(id) {
    return prisma.competency.findUnique({ where: { id } });
  }

  async findAll({ page = 1, limit = 10, tipo, competenciaDe, search }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (tipo) where.tipo = tipo;
    if (competenciaDe) where.competenciaDe = competenciaDe;
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [competencies, total] = await Promise.all([
      prisma.competency.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.competency.count({ where })
    ]);

    return {
      competencies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByTipo(tipo) {
    return prisma.competency.findMany({
      where: { tipo },
      orderBy: { nome: 'asc' }
    });
  }

  async findByCompetenciaDe(competenciaDe) {
    return prisma.competency.findMany({
      where: { competenciaDe },
      orderBy: { nome: 'asc' }
    });
  }

  async update(id, data) {
    return prisma.competency.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.competency.delete({ where: { id } });
  }

  async exists(nome) {
    const competency = await prisma.competency.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive'
        }
      }
    });
    return !!competency;
  }

  async count() {
    return prisma.competency.count();
  }

  async getStatsByTipo() {
    const competencies = await prisma.competency.findMany({
      select: {
        tipo: true,
        competenciaDe: true
      }
    });

    const porTipo = competencies.reduce((acc, comp) => {
      if (!acc[comp.tipo]) {
        acc[comp.tipo] = 0;
      }
      acc[comp.tipo]++;
      return acc;
    }, {});

    const porCompetenciaDe = competencies.reduce((acc, comp) => {
      if (!acc[comp.competenciaDe]) {
        acc[comp.competenciaDe] = 0;
      }
      acc[comp.competenciaDe]++;
      return acc;
    }, {});

    return {
      total: competencies.length,
      porTipo,
      porCompetenciaDe
    };
  }
}

export { CompetencyRepository };
