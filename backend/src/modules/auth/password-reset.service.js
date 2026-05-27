import { AppError } from '../../utils/errors.js';
import { UserRepository } from '../users/user.repository.js';
import crypto from 'crypto';

class PasswordResetService {
  constructor() {
    this.userRepository = new UserRepository();
    this.resetTokens = new Map(); // Em produção, usar Redis ou banco de dados
  }

  async requestReset(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Por segurança, não informamos se o email existe
      return { message: 'Se o email existir, você receberá instruções para redefinir sua senha.' };
    }

    // Gera token de reset (válido por 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    this.resetTokens.set(resetToken, {
      userId: user.id,
      expiresAt
    });

    // Em produção, enviar email com o token
    console.log(`Token de reset para ${email}: ${resetToken}`);
    console.log(`Link de reset: http://localhost:3000/reset-password?token=${resetToken}`);

    return { 
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      token: resetToken // Apenas para desenvolvimento
    };
  }

  async resetPassword(token, novaSenha) {
    const resetData = this.resetTokens.get(token);

    if (!resetData) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    if (new Date() > resetData.expiresAt) {
      this.resetTokens.delete(token);
      throw new AppError('Token expirado', 400);
    }

    // Valida a nova senha
    if (!novaSenha || novaSenha.length < 6) {
      throw new AppError('A senha deve ter pelo menos 6 caracteres', 400);
    }

    // Atualiza a senha do usuário
    await this.userRepository.update(resetData.userId, { senha: novaSenha });

    // Remove o token usado
    this.resetTokens.delete(token);

    return { message: 'Senha redefinida com sucesso' };
  }

  async validateToken(token) {
    const resetData = this.resetTokens.get(token);

    if (!resetData) {
      return false;
    }

    if (new Date() > resetData.expiresAt) {
      this.resetTokens.delete(token);
      return false;
    }

    return true;
  }
}

export { PasswordResetService };
