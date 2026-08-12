import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

const userRepository = new UserRepository();
const userService    = new UserService(userRepository);

class UserController {
  async register(req, res, next) {
    try {
      const user = await userService.register(req.body);
      return res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário cadastrado com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const result = await userService.login(email, senha);
      return res.json({
        success: true,
        data: result,
        message: 'Login realizado com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.userId);
      return res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.userId, req.body);
      return res.json({
        success: true,
        data: user,
        message: 'Perfil atualizado com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, tipo, search, departamento, orderBy, orderDir } = req.query;
      const result = await userService.findAll({
        page,
        limit,
        tipo,
        search,
        departamento,
        orderBy,
        orderDir,
        callerTipo: req.user.tipo,
      });
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const user = await userService.findById(
        req.params.id,
        req.user.userId,
        req.user.tipo
      );
      return res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async findByRA(req, res, next) {
    try {
      const user = await userService.findByRA(req.params.ra);
      return res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateById(req, res, next) {
    try {
      const user = await userService.updateById(req.params.id, req.body);
      return res.json({
        success: true,
        data: user,
        message: 'Usuário atualizado com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await userService.delete(req.params.id);
      return res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await userService.resetPassword(req.params.id, req.body.novaSenha);
      return res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

export { UserController };
