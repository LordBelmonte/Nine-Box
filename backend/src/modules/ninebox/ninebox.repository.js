import { prisma } from '../../config/database.js';

class NineBoxRepository {
  async create(data) {
    return prisma.nineBox.create({
      data,
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            departamento: true,
            foto: true
          }
        }
      }
    });
  }

  async findById(id) {
    return prisma.nineBox.findUnique({
      where: { id },
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            departamento: true,
            foto: true
          }
        }
      }
    });
  }

  async findAll({ page = 1, limit = 10, categoria, pessoaId }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (categoria) where.categoria = categoria;
    if (pessoaId) where.pessoaId = pessoaId;

    const [nineBoxes, total] = await Promise.all([
      prisma.nineBox.findMany({
        where,
        skip,
        take: limit,
        include: {
          pessoa: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              cargo: true,
              departamento: true,
              foto: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.nineBox.count({ where })
    ]);

    return {
      nineBoxes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByPessoa(pessoaId) {
    return prisma.nineBox.findMany({
      where: { pessoaId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findLatestByPessoa(pessoaId) {
    return prisma.nineBox.findFirst({
      where: { pessoaId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id, data) {
    return prisma.nineBox.update({
      where: { id },
      data,
      include: {
        pessoa: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            departamento: true,
            foto: true
          }
        }
      }
    });
  }

  async delete(id) {
    return prisma.nineBox.delete({ where: { id } });
  }

  async getGridDistribution() {
    const nineBoxes = await prisma.nineBox.findMany({
      select: {
        categoria: true,
        performance: true,
        potential: true
      }
    });

    // Agrupa por categoria
    const distribution = nineBoxes.reduce((acc, nb) => {
      if (!acc[nb.categoria]) {
        acc[nb.categoria] = 0;
      }
      acc[nb.categoria]++;
      return acc;
    }, {});

    // Agrupa por coordenadas (performance, potential)
    const byCoordinates = nineBoxes.reduce((acc, nb) => {
      const key = `${nb.performance}-${nb.potential}`;
      if (!acc[key]) {
        acc[key] = {
          performance: nb.performance,
          potential: nb.potential,
          categoria: nb.categoria,
          count: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {});

    return {
      total: nineBoxes.length,
      porCategoria: distribution,
      porCoordenadas: Object.values(byCoordinates)
    };
  }

  async getStatsByTipo() {
    const nineBoxes = await prisma.nineBox.findMany({
      include: {
        pessoa: {
          select: {
            tipo: true
          }
        }
      }
    });

    const porTipo = nineBoxes.reduce((acc, nb) => {
      const tipo = nb.pessoa.tipo;
      if (!acc[tipo]) {
        acc[tipo] = {
          total: 0,
          categorias: {}
        };
      }
      acc[tipo].total++;
      if (!acc[tipo].categorias[nb.categoria]) {
        acc[tipo].categorias[nb.categoria] = 0;
      }
      acc[tipo].categorias[nb.categoria]++;
      return acc;
    }, {});

    return porTipo;
  }
}

export { NineBoxRepository };
