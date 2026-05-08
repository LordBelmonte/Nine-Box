import { prisma } from '../../config/database.js';

class EvaluationRepository {
  async create(data) {
    return prisma.evaluation.create({
      data,
      include: {
        avaliado: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            tipo: true,
            foto: true
          }
        }
        // avaliador NÃO incluído para manter anonimato
      }
    });
  }

  async findById(id) {
    return prisma.evaluation.findUnique({
      where: { id },
      include: {
        avaliado: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            tipo: true,
            foto: true
          }
        }
        // avaliador incluído apenas para controle interno
      }
    });
  }

  async findAll({ page = 1, limit = 10, tipoAvaliacao, avaliadoId, avaliadorId }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (tipoAvaliacao) where.tipoAvaliacao = tipoAvaliacao;
    if (avaliadoId) where.avaliadoId = avaliadoId;
    if (avaliadorId) where.avaliadorId = avaliadorId;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        include: {
          avaliado: {
            select: {
              id: true,
              ra: true,
              nome: true,
              email: true,
              tipo: true,
              foto: true
            }
          }
          // avaliador NÃO incluído para manter anonimato
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluation.count({ where })
    ]);

    return {
      evaluations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByAvaliado(avaliadoId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where: { avaliadoId },
        skip,
        take: limit,
        include: {
          avaliado: {
            select: {
              id: true,
              ra: true,
              nome: true,
              email: true,
              tipo: true,
              foto: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluation.count({ where: { avaliadoId } })
    ]);

    return {
      evaluations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByAvaliador(avaliadorId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where: { avaliadorId },
        skip,
        take: limit,
        include: {
          avaliado: {
            select: {
              id: true,
              ra: true,
              nome: true,
              email: true,
              tipo: true,
              foto: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluation.count({ where: { avaliadorId } })
    ]);

    return {
      evaluations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async update(id, data) {
    return prisma.evaluation.update({
      where: { id },
      data,
      include: {
        avaliado: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            tipo: true,
            foto: true
          }
        }
      }
    });
  }

  async delete(id) {
    return prisma.evaluation.delete({ where: { id } });
  }

  async getStatsByAvaliado(avaliadoId) {
    const evaluations = await prisma.evaluation.findMany({
      where: { avaliadoId },
      select: {
        media: true,
        tipoAvaliacao: true,
        data: true
      }
    });

    const total = evaluations.length;
    const mediaGeral = total > 0
      ? evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / total
      : 0;

    const porTipo = evaluations.reduce((acc, ev) => {
      if (!acc[ev.tipoAvaliacao]) {
        acc[ev.tipoAvaliacao] = { count: 0, mediaSum: 0 };
      }
      acc[ev.tipoAvaliacao].count++;
      acc[ev.tipoAvaliacao].mediaSum += ev.media || 0;
      return acc;
    }, {});

    const estatisticas = Object.entries(porTipo).map(([tipo, data]) => ({
      tipo,
      total: data.count,
      media: data.mediaSum / data.count
    }));

    return {
      total,
      mediaGeral: parseFloat(mediaGeral.toFixed(2)),
      estatisticas
    };
  }
}

export { EvaluationRepository };
