import { prisma } from '../../config/database.js';

class UserRepository {
  async create(data) {
    return prisma.user.create({ data });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByRA(ra) {
    return prisma.user.findUnique({ where: { ra } });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findAll({ page = 1, limit = 10, tipo, search, departamento }) {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (tipo) where.tipo = tipo;
    if (departamento) where.departamento = departamento;
    if (search) {
      where.nome = {
        contains: search,
        mode: 'insensitive'
      };
    }

    console.log('[USER REPOSITORY] Query params:', { page, limit, skip, where });

    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: skip >= 0 ? skip : 0,
          take: limit > 0 ? limit : 10,
          select: {
            id: true,
            ra: true,
            nome: true,
            email: true,
            tipo: true,
            cargo: true,
            departamento: true,
            foto: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      console.log(`[USER REPOSITORY] Query executada - Retornando ${users.length} de ${total} usuários`);
      
      // Debug: mostrar primeiros usuários
      if (users.length > 0) {
        console.log('[USER REPOSITORY] Primeiro usuário:', users[0].nome, users[0].tipo);
      }

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[USER REPOSITORY] Erro na query:', error);
      throw error;
    }
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        cargo: true,
        departamento: true,
        foto: true
      }
    });
  }

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  }

  async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user;
  }

  async raExists(ra) {
    const user = await prisma.user.findUnique({
      where: { ra },
      select: { id: true }
    });
    return !!user;
  }

  async findByGestorId(gestorId) {
    return prisma.user.findMany({
      where: {
        gruposComoColaborador: {
          some: {
            gestorId
          }
        }
      },
      select: {
        id: true,
        ra: true,
        nome: true,
        email: true,
        tipo: true,
        cargo: true,
        departamento: true,
        foto: true
      }
    });
  }

  async count() {
    return prisma.user.count();
  }

  async addGestorColaborador(gestorId, colaboradorId) {
    return prisma.gestorColaborador.create({
      data: {
        gestorId,
        colaboradorId
      }
    });
  }
}

export { UserRepository };
