import { prisma } from '../../config/database.js';

class CampaignRepository {
  async create(data) {
    const { gestorIds, gestorColaboradores, ...campaignData } = data;

    return prisma.evaluationCampaign.create({
      data: {
        ...campaignData,
        gestores: gestorIds && gestorIds.length > 0
          ? {
              create: gestorIds.map(gestorId => ({
                gestorId,
                colaboradoresAvaliaveis: gestorColaboradores && gestorColaboradores[gestorId]
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

    // Se gestorIds fornecido, substitui os gestores
    if (gestorIds !== undefined) {
      await prisma.campaignGestor.deleteMany({ where: { campaignId: id } });
      if (gestorIds.length > 0) {
        await prisma.campaignGestor.createMany({
          data: gestorIds.map(gestorId => ({ campaignId: id, gestorId }))
        });
      }
    }

    // Se gestorColaboradores fornecido, atualiza os colaboradores avaliáveis por gestor
    if (gestorColaboradores !== undefined) {
      // Deleta todos os colaboradores avaliáveis existentes
      await prisma.campaignGestorColaborador.deleteMany({
        where: {
          campaignGestor: {
            campaignId: id
          }
        }
      });

      // Adiciona os novos colaboradores avaliáveis por gestor
      for (const [gestorId, colaboradorIds] of Object.entries(gestorColaboradores)) {
        if (colaboradorIds && colaboradorIds.length > 0) {
          // Encontra o CampaignGestor correspondente
          const campaignGestor = await prisma.campaignGestor.findFirst({
            where: {
              campaignId: id,
              gestorId
            }
          });

          if (campaignGestor) {
            await prisma.campaignGestorColaborador.createMany({
              data: colaboradorIds.map(colaboradorId => ({
                campaignGestorId: campaignGestor.id,
                colaboradorId
              }))
            });
          }
        }
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

    // Usa apenas os colaboradores definidos explicitamente pelo admin para este gestor nesta campanha
    let colaboradorIds = [];
    if (campaignGestor) {
      colaboradorIds = campaignGestor.colaboradoresAvaliaveis.map(c => c.colaboradorId);
    }

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
