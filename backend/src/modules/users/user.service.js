import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../utils/errors.js';

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(data) {
    // Verifica email duplicado
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Verifica RA duplicado
    const raExists = await this.userRepository.raExists(data.ra);
    if (raExists) {
      throw new AppError('RA já cadastrado', 400);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    // Extrai gestorId se fornecido (não vai para tabela User)
    const { gestorId, ...userData } = data;

    // Cria usuário
    const user = await this.userRepository.create({
      ...userData,
      senha: hashedPassword
    });

    // Se for colaborador e gestorId foi fornecido, cria associação
    if (userData.tipo === 'colaborador' && gestorId) {
      await this.userRepository.addGestorColaborador(gestorId, user.id);
    }

    // Remove senha da resposta
    delete user.senha;

    return user;
  }

  async login(email, senha) {
    // Busca usuário
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Verifica senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    // Gera token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tipo: user.tipo,
        ra: user.ra
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove senha da resposta
    delete user.senha;

    return { user, token };
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    delete user.senha;
    return user;
  }

  async updateProfile(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Validar e processar foto se fornecida
    if (data.foto) {
      // Validar formato base64
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      if (!base64Regex.test(data.foto)) {
        throw new AppError('Formato de imagem inválido. Use PNG, JPG, GIF ou WebP.', 400);
      }

      // Validar tamanho (máximo 2MB)
      const base64Length = data.foto.length - (data.foto.indexOf(',') + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 2) {
        throw new AppError('Imagem muito grande. Máximo 2MB.', 400);
      }
    }

    const updated = await this.userRepository.update(userId, data);
    delete updated.senha;
    return updated;
  }

  async findAll(filters, userTipo) {
    console.log(`[USER SERVICE] findAll chamado - userTipo: ${userTipo}, filters:`, filters);
    
    // Colaborador pode listar apenas gestores (para avaliar)
    if (userTipo === 'colaborador') {
      filters.tipo = 'gestor';
      console.log(`[USER SERVICE] Colaborador - filtrando apenas gestores`);
    }
    
    // Gestor pode listar todos exceto admin
    if (userTipo === 'gestor' && !filters.tipo) {
      console.log(`[USER SERVICE] Gestor - listando todos exceto admin`);
    }

    const result = await this.userRepository.findAll(filters);
    
    // Filtrar admins para gestores (no service, não no repository)
    if (userTipo === 'gestor') {
      result.users = result.users.filter(u => u.tipo !== 'admin');
      result.pagination.total = result.users.length;
      result.pagination.totalPages = Math.ceil(result.users.length / (filters.limit || 10));
    }
    
    console.log(`[USER SERVICE] Retornando ${result.users.length} usuários`);
    return result;
  }

  async findById(id, requestUserId, requestUserTipo) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Colaborador só pode ver próprio perfil
    if (requestUserTipo === 'colaborador' && id !== requestUserId) {
      throw new AppError('Sem permissão para ver este usuário', 403);
    }

    delete user.senha;
    return user;
  }

  async findByRA(ra) {
    const user = await this.userRepository.findByRA(ra);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    delete user.senha;
    return user;
  }

  async delete(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.tipo === 'admin') {
      throw new AppError('Não é possível deletar admin', 400);
    }

    await this.userRepository.delete(id);
    return { message: 'Usuário deletado com sucesso' };
  }
}

export { UserService };
