import { prisma } from '../../config/database.js';

class CampaignRepository {
  constructor() {}

  async create(data, tx = prisma) {
    const { gestorIds, gestorColaboradores, ...campaignData } = data;
    console.log('[CampaignRepository.create] gestorIds:', gestorIds, 'gestorColaboradores:', gestorColaboradores);

    const createdCampaign = await tx.evaluationCampaign.create({
      data: {
        ...campaignData,
        gestores: gestorIds && gestorIds.length > 0
          ? {
              create: gestorIds.map(gestorId => ({
                gestorId,
                colaboradoresAvaliaveis: gestorColaboradores && Array.isArray(gestorColaboradores[gestorId]) && gestorColaboradores[gestorId].length > 0
                  ? {
                      create: gestorColaboradores[gestorId].map(colaboradorId => ({ colaboradorId }))
                    }
                  : undefined
              }))
            }
          : undefined
      },
      include: {
        gestores: {
          include: {
            gestor: {
              select: { id: true, nome: true, email: true, cargo: true, departamento: true }
            },
            colaboradoresAvaliaveis: {
              include: {
                colaborador: {
                  select: { id: true, nome: true, email: true, cargo: true, departamento: true }
                }
              }
            }
          }
        }
      }
    });

    console.log('[CampaignRepository.create] created campaignId:', createdCampaign.id);
    return createdCampaign;
  }

  async findById(id) {
    return prisma.evaluationCampaign.findUnique({
      where: { id },
      include: {
        gestores: {
          include: {
            gestor: {
              select: { id: true, nome: true, email: true, cargo: true, departamento: true }
            },
            colaboradoresAvaliaveis: {
              include: {
                colaborador: {
                  select: { id: true, nome: true, email: true, cargo: true, departamento: true }
                }
              }
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
    const { gestorIds, gestorColaboradores, ...campaignData } = data;
    console.log('[CampaignRepository.update] campaignId:', id, 'gestorIds:', gestorIds, 'gestorColaboradores:', gestorColaboradores);

    const currentCampaignGestores = await prisma.campaignGestor.findMany({
      where: { campaignId: id }
    });
    const currentGestorIds = currentCampaignGestores.map(g => g.gestorId);

    let removedGestorIds = [];
    let addedGestorIds = [];
    let newGestorIds = [];

    if (gestorIds !== undefined) {
      newGestorIds = [...new Set(gestorIds)];
      removedGestorIds = currentGestorIds.filter(currentId => !newGestorIds.includes(currentId));
      addedGestorIds = newGestorIds.filter(newId => !currentGestorIds.includes(newId));

      if (removedGestorIds.length > 0) {
        const removedCampaignGestorIds = currentCampaignGestores
          .filter(g => removedGestorIds.includes(g.gestorId))
          .map(g => g.id);

        await prisma.campaignGestorColaborador.deleteMany({
          where: { campaignGestorId: { in: removedCampaignGestorIds } }
        });
        await prisma.campaignGestor.deleteMany({
          where: {
            campaignId: id,
            gestorId: { in: removedGestorIds }
          }
        });
      }

      if (addedGestorIds.length > 0) {
        await prisma.campaignGestor.createMany({
          data: addedGestorIds.map(gestorId => ({ campaignId: id, gestorId }))
        });
      }
    }

    if (gestorColaboradores !== undefined) {
      for (const [gestorId, colaboradorIds] of Object.entries(gestorColaboradores)) {
        const campaignGestor = await prisma.campaignGestor.upsert({
          where: { campaignId_gestorId: { campaignId: id, gestorId } },
          update: {},
          create: { campaignId: id, gestorId }
        });

        const currentCollaborators = await prisma.campaignGestorColaborador.findMany({
          where: { campaignGestorId: campaignGestor.id },
          select: { colaboradorId: true }
        });
        const currentColaboradorIds = currentCollaborators.map(c => c.colaboradorId);
        const newColaboradorIds = Array.isArray(colaboradorIds) ? [...new Set(colaboradorIds)] : [];

        const removedColaboradorIds = currentColaboradorIds.filter(id => !newColaboradorIds.includes(id));
        const addedColaboradorIds = newColaboradorIds.filter(id => !currentColaboradorIds.includes(id));

        if (removedColaboradorIds.length > 0) {
          await prisma.campaignGestorColaborador.deleteMany({
            where: {
              campaignGestorId: campaignGestor.id,
              colaboradorId: { in: removedColaboradorIds }
            }
          });
        }

        if (addedColaboradorIds.length > 0) {
          await prisma.campaignGestorColaborador.createMany({
            data: addedColaboradorIds.map(colaboradorId => ({
              campaignGestorId: campaignGestor.id,
              colaboradorId
            }))
          });
        }
      }
    }

    const updatedCampaign = await prisma.evaluationCampaign.update({
      where: { id },
      data: campaignData,
      include: {
        gestores: {
          include: {
            gestor: {
              select: { id: true, nome: true, email: true, cargo: true, departamento: true }
            },
            colaboradoresAvaliaveis: {
              include: {
                colaborador: {
                  select: { id: true, nome: true, email: true, cargo: true, departamento: true }
                }
              }
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

    console.log('[CampaignRepository.update] campaignId:', id, 'removedGestorIds:', removedGestorIds, 'addedGestorIds:', addedGestorIds, 'currentGestorCount:', currentGestorIds.length, 'newGestorCount:', newGestorIds.length);
    return updatedCampaign;
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
    const where = {
      status: 'ativa',
      gestores: { some: { gestorId } }
    };
    console.log('[CampaignRepository.findActiveForGestor] filters:', where);
    const campaigns = await prisma.evaluationCampaign.findMany({
      where,
      include: {
        _count: { select: { avaliacoes: true } }
      },
      orderBy: { dataFim: 'asc' }
    });
    console.log('[CampaignRepository.findActiveForGestor] campaignCount:', campaigns.length);
    return campaigns;
  }

  // Retorna progresso de uma campanha: quantos colaboradores já foram avaliados pelo gestor
  async getCampaignProgress(campaignId, gestorId) {
    // Encontra o CampaignGestor correspondente
    const campaignGestor = await prisma.campaignGestor.findFirst({
      where: {
        campaignId,
        gestorId
      },
      include: {
        colaboradoresAvaliaveis: {
          select: { colaboradorId: true }
        }
      }
    });

    // Usa apenas os colaboradores definidos explicitamente pelo admin para este gestor nesta campanha
    let colaboradorIds = [];
    if (campaignGestor) {
      colaboradorIds = campaignGestor.colaboradoresAvaliaveis.map(c => c.colaboradorId);
    }

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

  // Retorna todos os colaboradores que o admin definiu para o gestor avaliar nesta campanha (avaliados ou não)
  async getColaboradoresDoGestorNaCampanha(campaignId, gestorId) {
    const campaignGestor = await prisma.campaignGestor.findFirst({
      where: { campaignId, gestorId },
      include: {
        colaboradoresAvaliaveis: {
          include: {
            colaborador: {
              select: { id: true, nome: true, email: true, cargo: true, departamento: true }
            }
          }
        }
      }
    });

    if (!campaignGestor) return [];
    return campaignGestor.colaboradoresAvaliaveis.map(c => c.colaborador);
  }

  async getColaboradoresNaoAvaliados(campaignId, gestorId) {
    // Encontra o CampaignGestor correspondente
    const campaignGestor = await prisma.campaignGestor.findFirst({
      where: {
        campaignId,
        gestorId
      },
      include: {
        colaboradoresAvaliaveis: {
          select: { colaboradorId: true }
        }
      }
    });

    // Usa apenas os colaboradores definidos explicitamente para este gestor nesta campanha.
    // Sem fallback: se não há vínculo explícito nesta campanha, não há colaboradores pendentes
    // para este gestor — alinhado com getCampaignProgress() que segue a mesma regra estrita.
    let colaboradorIds = [];
    if (campaignGestor && campaignGestor.colaboradoresAvaliaveis.length > 0) {
      colaboradorIds = campaignGestor.colaboradoresAvaliaveis.map(c => c.colaboradorId);
    }

    if (colaboradorIds.length === 0) {
      return [];
    }

    const where = {
      id: { in: colaboradorIds },
      avaliacoesRecebidas: {
        none: {
          campaignId,
          avaliadorId: gestorId
        }
      }
    };
    console.log('[CampaignRepository.getColaboradoresNaoAvaliados] campaignId:', campaignId, 'gestorId:', gestorId, 'colaboradorIds:', colaboradorIds);
    const naoAvaliados = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        departamento: true
      }
    });

    console.log('[CampaignRepository.getColaboradoresNaoAvaliados] campaignId:', campaignId, 'gestorId:', gestorId, 'resultCount:', naoAvaliados.length);
    return naoAvaliados;
  }

  async count() {
    return prisma.evaluationCampaign.count();
  }
}

export { CampaignRepository };
