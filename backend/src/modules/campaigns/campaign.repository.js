import { prisma } from '../../config/database.js';

class CampaignRepository {
  async create(data) {
    const { gestorIds, ...campaignData } = data;

    return prisma.evaluationCampaign.create({
      data: {
        ...campaignData,
        gestores: gestorIds && gestorIds.length > 0
          ? {
              create: gestorIds.map(gestorId => ({ gestorId }))
            }
          : undefined
      },
      include: {
        gestores: {
          include: {
            gestor: {
              select: { id: true, nome: true, email: true, cargo: true, departamento: true }
            }
          }
        }
      }
    });
  }

  async findById(id) {
    return prisma.evaluationCampaign.findUnique({
      where: { id },
      include: {
        gestores: {
          include: {
            gestor: {
              select: { id: true, nome: true, email: true, cargo: true, departamento: true }
            }
          }
        },
        competencias: {
          include: {
            competency: true
          }
        },
        _count: { select: { avaliacoes: true } }
      }
    });
  }

  async findAll({ page = 1, limit = 10, status, gestorId }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;

    // Se gestorId fornecido, filtra campanhas onde esse gestor é responsável
    if (gestorId) {
      where.gestores = { some: { gestorId } };
    }

    const [campaigns, total] = await Promise.all([
      prisma.evaluationCampaign.findMany({
        where,
        skip,
        take: limit,
        include: {
          gestores: {
            include: {
              gestor: {
                select: { id: true, nome: true, email: true, cargo: true, departamento: true }
              }
            }
          },
          _count: { select: { avaliacoes: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.evaluationCampaign.count({ where })
    ]);

    return {
      campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async update(id, data) {
    const { gestorIds, ...campaignData } = data;

    // Se gestorIds fornecido, substitui os gestores
    if (gestorIds !== undefined) {
      await prisma.campaignGestor.deleteMany({ where: { campaignId: id } });
      if (gestorIds.length > 0) {
        await prisma.campaignGestor.createMany({
          data: gestorIds.map(gestorId => ({ campaignId: id, gestorId }))
        });
      }
    }

    return prisma.evaluationCampaign.update({
      where: { id },
      data: campaignData,
      include: {
        gestores: {
          include: {
            gestor: {
              select: { id: true, nome: true, email: true, cargo: true, departamento: true }
            }
          }
        },
        competencias: {
          include: {
            competency: true
          }
        },
        _count: { select: { avaliacoes: true } }
      }
    });
  }

  async delete(id) {
    return prisma.evaluationCampaign.delete({ where: { id } });
  }

  async addGestor(campaignId, gestorId) {
    return prisma.campaignGestor.create({
      data: { campaignId, gestorId }
    });
  }

  async removeGestor(campaignId, gestorId) {
    return prisma.campaignGestor.delete({
      where: { campaignId_gestorId: { campaignId, gestorId } }
    });
  }

  // Retorna campanhas ativas para um gestor específico
  async findActiveForGestor(gestorId) {
    return prisma.evaluationCampaign.findMany({
      where: {
        status: 'ativa',
        gestores: { some: { gestorId } }
      },
      include: {
        _count: { select: { avaliacoes: true } }
      },
      orderBy: { dataFim: 'asc' }
    });
  }

  // Retorna progresso de uma campanha: quantos colaboradores já foram avaliados pelo gestor
  async getCampaignProgress(campaignId, gestorId) {
    // Colaboradores do grupo do gestor
    const grupo = await prisma.gestorColaborador.findMany({
      where: { gestorId },
      select: { colaboradorId: true }
    });
    const colaboradorIds = grupo.map(g => g.colaboradorId);

    // Avaliações já feitas pelo gestor nessa campanha
    const avaliacoes = await prisma.evaluation.findMany({
      where: {
        campaignId,
        avaliadorId: gestorId,
        avaliadoId: { in: colaboradorIds }
      },
      select: { avaliadoId: true }
    });

    return {
      totalColaboradores: colaboradorIds.length,
      avaliados: avaliacoes.length,
      pendentes: colaboradorIds.length - avaliacoes.length
    };
  }

  async getResponsavelGestores(campaignId) {
    return prisma.campaignGestor.findMany({
      where: { campaignId },
      include: {
        gestor: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
            departamento: true
          }
        }
      }
    });
  }

  async getColaboradoresNaoAvaliados(campaignId, gestorId) {
    // Todos os colaboradores do grupo do gestor
    const grupoColaboradores = await prisma.gestorColaborador.findMany({
      where: { gestorId },
      select: { colaboradorId: true }
    });

    const colaboradorIds = grupoColaboradores.map(g => g.colaboradorId);

    // Colaboradores que NÃO foram avaliados por este gestor nesta campanha
    const naoAvaliados = await prisma.user.findMany({
      where: {
        id: { in: colaboradorIds },
        avaliacoesRecebidas: {
          none: {
            campaignId,
            avaliadorId: gestorId
          }
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        departamento: true
      }
    });

    return naoAvaliados;
  }

  async count() {
    return prisma.evaluationCampaign.count();
  }
}

export { CampaignRepository };
