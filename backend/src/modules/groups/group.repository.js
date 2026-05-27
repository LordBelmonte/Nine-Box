import { prisma } from '../../config/database.js';

class GroupRepository {
  // Lista colaboradores de um gestor
  async findColaboradoresByGestor(gestorId) {
    const rows = await prisma.gestorColaborador.findMany({
      where: { gestorId },
      include: {
        colaborador: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            cargo: true,
            departamento: true,
            foto: true,
            tipo: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    return rows.map(r => r.colaborador);
  }

  // Lista gestores de um colaborador
  async findGestoresByColaborador(colaboradorId) {
    const rows = await prisma.gestorColaborador.findMany({
      where: { colaboradorId },
      include: {
        gestor: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            cargo: true,
            departamento: true,
            foto: true,
            tipo: true
          }
        }
      }
    });
    return rows.map(r => r.gestor);
  }

  // Adiciona um colaborador ao grupo do gestor
  async addColaborador(gestorId, colaboradorId) {
    return prisma.gestorColaborador.create({
      data: { gestorId, colaboradorId },
      include: {
        colaborador: {
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            cargo: true,
            departamento: true,
            foto: true
          }
        }
      }
    });
  }

  // Remove um colaborador do grupo do gestor
  async removeColaborador(gestorId, colaboradorId) {
    return prisma.gestorColaborador.delete({
      where: { gestorId_colaboradorId: { gestorId, colaboradorId } }
    });
  }

  // Substitui todos os colaboradores do grupo de um gestor
  async setColaboradores(gestorId, colaboradorIds) {
    await prisma.gestorColaborador.deleteMany({ where: { gestorId } });
    if (colaboradorIds.length > 0) {
      await prisma.gestorColaborador.createMany({
        data: colaboradorIds.map(colaboradorId => ({ gestorId, colaboradorId }))
      });
    }
    return this.findColaboradoresByGestor(gestorId);
  }

  // Verifica se relacionamento existe
  async exists(gestorId, colaboradorId) {
    const row = await prisma.gestorColaborador.findUnique({
      where: { gestorId_colaboradorId: { gestorId, colaboradorId } }
    });
    return !!row;
  }
}

export { GroupRepository };
