import { prisma } from '../../config/database.js';

// Campos públicos do avaliado (sem senha)
const avaliadoSelect = {
  id: true,
  ra: true,
  nome: true,
  email: true,
  tipo: true,
  cargo: true,
  departamento: true,
  foto: true
};

// Include padrão para avaliações (sem avaliador para manter anonimato)
const defaultInclude = {
  avaliado: { select: avaliadoSelect },
  campaign: {
    select: { id: true, nome: true, tipoAlvo: true, status: true }
  }
};

class EvaluationRepository {
  async create(data) {
    return prisma.evaluation.create({
      data,
      include: defaultInclude
    });
  }

  async findById(id) {
    return prisma.evaluation.findUnique({
      where: { id },
      include: {
        ...defaultInclude,
        // avaliador incluído apenas para controle interno (service decide se expõe)
        avaliador: { select: avaliadoSelect }
      }
    });
  }

  async findAll({ page = 1, limit = 10, campaignId, avaliadoId, avaliadorId }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (campaignId) where.campaignId = campaignId;
    if (avaliadoId) where.avaliadoId = avaliadoId;
    if (avaliadorId) where.avaliadorId = avaliadorId;

    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: limit,
        include: defaultInclude,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluation.count({ where })
    ]);

    return {
      evaluations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async findByAvaliado(avaliadoId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where: { avaliadoId },
        skip,
        take: limit,
        include: defaultInclude,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluation.count({ where: { avaliadoId } })
    ]);
    return {
      evaluations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async findByAvaliador(avaliadorId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const [evaluations, total] = await Promise.all([
      prisma.evaluation.findMany({
        where: { avaliadorId },
        skip,
        take: limit,
        include: defaultInclude,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluation.count({ where: { avaliadorId } })
    ]);
    return {
      evaluations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async findByCampaignAndAvaliador(campaignId, avaliadorId) {
    return prisma.evaluation.findMany({
      where: { campaignId, avaliadorId },
      include: defaultInclude,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(campaignId, avaliadorId, avaliadoId) {
    return prisma.evaluation.findUnique({
      where: { campaignId_avaliadorId_avaliadoId: { campaignId, avaliadorId, avaliadoId } }
    });
  }

  async update(id, data) {
    return prisma.evaluation.update({
      where: { id },
      data,
      include: defaultInclude
    });
  }

  async delete(id) {
    return prisma.evaluation.delete({ where: { id } });
  }

  async getStatsByAvaliado(avaliadoId) {
    const evaluations = await prisma.evaluation.findMany({
      where: { avaliadoId },
      select: { media: true, campaignId: true, data: true, criterios: true }
    });

    const total = evaluations.length;
    const mediaGeral = total > 0
      ? evaluations.reduce((sum, ev) => sum + (ev.media || 0), 0) / total
      : 0;

    return {
      total,
      mediaGeral: parseFloat(mediaGeral.toFixed(2))
    };
  }

  async count() {
    return prisma.evaluation.count();
  }
}

export { EvaluationRepository };
