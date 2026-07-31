import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/errors.js';

class UserService {
  constructor(userRepository) {
    this.repo = userRepository;
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  async register(data) {
    const { gestorId, foto, ...userData } = data;

    // Unicidade de email
    if (await this.repo.emailExists(userData.email)) {
      throw new AppError('E-mail já cadastrado. Use outro e-mail.', 400);
    }

    // Unicidade de RA
    if (await this.repo.raExists(userData.ra)) {
      throw new AppError('RA já cadastrado. Use outro RA.', 400);
    }

    // Hash da senha
    const senha = await bcrypt.hash(userData.senha, 10);

    // Foto: aceitar base64 ou null
    const fotoFinal = foto && foto.startsWith('data:image') ? foto : null;

    const user = await this.repo.create({
      ...userData,
      senha,
      foto: fotoFinal,
    });

    // Vínculo gestor → colaborador
    if (userData.tipo === 'colaborador' && gestorId) {
      // Verifica se o gestor existe
      const gestor = await this.repo.findById(gestorId);
      if (!gestor || gestor.tipo !== 'gestor') {
        throw new AppError('Gestor informado não encontrado ou inválido.', 400);
      }
      await this.repo.createGestorColaborador(gestorId, user.id);
    }

    const { senha: _, ...userSemSenha } = user;
    return userSemSenha;
  }

  async login(email, senha) {
    const user = await this.repo.findByEmail(email);
    if (!user) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    const isValid = await bcrypt.compare(senha, user.senha);
    if (!isValid) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, tipo: user.tipo, ra: user.ra },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    const { senha: _, ...userSemSenha } = user;
    return { user: userSemSenha, token };
  }

  // ─── Perfil (próprio admin) ────────────────────────────────────────────────

  async getProfile(userId) {
    const user = await this.repo.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    const { senha: _, ...userSemSenha } = user;
    return userSemSenha;
  }

  async updateProfile(userId, data) {
    const user = await this.repo.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    if (data.foto) {
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      if (!base64Regex.test(data.foto)) {
        throw new AppError('Formato de imagem inválido. Use PNG, JPG, GIF ou WebP.', 400);
      }
      const base64Length = data.foto.length - (data.foto.indexOf(',') + 1);
      const sizeInMB = (base64Length * 3) / 4 / (1024 * 1024);
      if (sizeInMB > 2) {
        throw new AppError('Imagem muito grande. Máximo 2MB.', 400);
      }
    }

    // Nunca permite alterar senha pelo updateProfile
    const { senha, ...safeData } = data;
    return this.repo.update(userId, safeData);
  }

  // ─── CRUD admin ────────────────────────────────────────────────────────────

  async findAll(filters) {
    const {
      page = 1,
      limit = 10,
      tipo,
      search,
      departamento,
      orderBy = 'nome',
      orderDir = 'asc',
      callerTipo,
    } = filters;

    // Gestor: não pode ver admins
    const excludeTipo = callerTipo === 'gestor' ? 'admin' : undefined;
    // Colaborador: só pode ver gestores
    const tipoFinal   = callerTipo === 'colaborador' ? 'gestor' : tipo;

    return this.repo.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      tipo:        tipoFinal,
      excludeTipo: !tipoFinal ? excludeTipo : undefined,
      search,
      departamento,
      orderBy,
      orderDir,
    });
  }

  async findById(id, requestUserId, requestUserTipo) {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    if (requestUserTipo === 'colaborador' && id !== requestUserId) {
      throw new AppError('Sem permissão para ver este usuário.', 403);
    }
    const { senha: _, ...userSemSenha } = user;
    return userSemSenha;
  }

  async findByRA(ra) {
    const user = await this.repo.findByRA(ra);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    const { senha: _, ...userSemSenha } = user;
    return userSemSenha;
  }

  // ─── Edição por ID (admin) ─────────────────────────────────────────────────

  async updateById(id, data) {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    if (user.tipo === 'admin') {
      throw new AppError('Não é permitido editar um administrador.', 403);
    }

    const { gestorId, senha, foto, ...fields } = data;

    // Verificar duplicidade de e-mail
    if (fields.email && fields.email !== user.email) {
      if (await this.repo.emailExistsExcept(fields.email, id)) {
        throw new AppError('E-mail já cadastrado para outro usuário.', 400);
      }
    }

    // Foto: validação básica
    let fotoFinal = undefined;
    if (foto !== undefined) {
      if (foto && !foto.startsWith('data:image') && foto !== '') {
        throw new AppError('Formato de imagem inválido.', 400);
      }
      fotoFinal = foto || null;
    }

    // Montar payload sem senha
    const payload = { ...fields };
    if (fotoFinal !== undefined) payload.foto = fotoFinal;

    const updated = await this.repo.update(id, payload);

    // Alterar gestor (para colaboradores)
    if (user.tipo === 'colaborador' && gestorId !== undefined) {
      if (gestorId) {
        const gestor = await this.repo.findById(gestorId);
        if (!gestor || gestor.tipo !== 'gestor') {
          throw new AppError('Gestor informado não encontrado ou inválido.', 400);
        }
        await this.repo.removeAllGestoresFromColaborador(id);
        await this.repo.createGestorColaborador(gestorId, id);
      } else {
        // gestorId vazio/null = remove vínculo
        await this.repo.removeAllGestoresFromColaborador(id);
      }
    }

    return updated;
  }

  // ─── Exclusão ─────────────────────────────────────────────────────────────

  async delete(id) {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    if (user.tipo === 'admin') {
      throw new AppError('Não é possível excluir um administrador.', 400);
    }
    await this.repo.delete(id);
    return { message: 'Usuário excluído com sucesso.' };
  }
}

export { UserService };
