import { prisma } from '../../config/database.js';

// Campos padrão retornados (nunca expõe senha)
const USER_SELECT = {
  id:           true,
  ra:           true,
  nome:         true,
  email:        true,
  tipo:         true,
  cargo:        true,
  departamento: true,
  foto:         true,
  createdAt:    true,
};

class UserRepository {
  // ─── Leitura ───────────────────────────────────────────────────────────────

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id:           true,
        ra:           true,
        nome:         true,
        email:        true,
        senha:        true, // necessário internamente para login/hash — service remove antes de retornar
        tipo:         true,
        cargo:        true,
        departamento: true,
        foto:         true,
        createdAt:    true,
        updatedAt:    true,
      }
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } }); // retorna senha para uso interno no login
  }

  async findByRA(ra) {
    return prisma.user.findUnique({
      where: { ra },
      select: { ...USER_SELECT, senha: false }
    });
  }

  /**
   * Lista usuários com filtros, paginação e ordenação no banco.
   * @param {object} opts
   */
  async findAll({
    page = 1,
    limit = 10,
    tipo,
    excludeTipo,
    search,
    departamento,
    orderBy = 'nome',
    orderDir = 'asc',
  }) {
    const skip = Math.max((page - 1) * limit, 0);

    const where = {};
    if (tipo)        where.tipo = tipo;
    if (excludeTipo) where.tipo = { not: excludeTipo };
    if (departamento) where.departamento = departamento;
    if (search) {
      where.OR = [
        { nome:  { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ra:    { contains: search, mode: 'insensitive' } },
      ];
    }

    // Campos válidos para ordenação no banco
    const VALID_ORDER = ['nome', 'ra', 'email', 'createdAt', 'tipo'];
    const field = VALID_ORDER.includes(orderBy) ? orderBy : 'nome';
    const dir   = orderDir === 'desc' ? 'desc' : 'asc';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: USER_SELECT,
        orderBy: { [field]: dir },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // ─── Criação ───────────────────────────────────────────────────────────────

  async create(data) {
    return prisma.user.create({ data });
  }

  // ─── Atualização ──────────────────────────────────────────────────────────

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  // ─── Exclusão ─────────────────────────────────────────────────────────────

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  }

  // ─── Verificações de unicidade ────────────────────────────────────────────

  async emailExists(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async raExists(ra) {
    const user = await prisma.user.findUnique({
      where: { ra },
      select: { id: true },
    });
    return !!user;
  }

  /** Verifica se email já existe para outro usuário (uso na edição) */
  async emailExistsExcept(email, excludeId) {
    const user = await prisma.user.findFirst({
      where: { email, NOT: { id: excludeId } },
      select: { id: true },
    });
    return !!user;
  }

  /** Verifica se RA já existe para outro usuário (uso na edição) */
  async raExistsExcept(ra, excludeId) {
    const user = await prisma.user.findFirst({
      where: { ra, NOT: { id: excludeId } },
      select: { id: true },
    });
    return !!user;
  }

  // ─── Grupos ────────────────────────────────────────────────────────────────

  /** Cria vínculo gestor ↔ colaborador */
  async createGestorColaborador(gestorId, colaboradorId) {
    return prisma.gestorColaborador.upsert({
      where: { gestorId_colaboradorId: { gestorId, colaboradorId } },
      update: {},
      create: { gestorId, colaboradorId },
    });
  }

  /** Remove todos os vínculos de gestor de um colaborador */
  async removeAllGestoresFromColaborador(colaboradorId) {
    return prisma.gestorColaborador.deleteMany({ where: { colaboradorId } });
  }

  /** Retorna os gestores de um colaborador */
  async findGestoresByColaboradorId(colaboradorId) {
    return prisma.gestorColaborador.findMany({
      where: { colaboradorId },
      include: {
        gestor: { select: USER_SELECT },
      },
    });
  }

  /** Conta usuários */
  async count() {
    return prisma.user.count();
  }
}

export { UserRepository };
