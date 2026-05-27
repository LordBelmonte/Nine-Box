import { PasswordResetService } from './password-reset.service.js';

const passwordResetService = new PasswordResetService();

class PasswordResetController {
  async requestReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await passwordResetService.requestReset(email);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, novaSenha } = req.body;
      const result = await passwordResetService.resetPassword(token, novaSenha);
      return res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async validateToken(req, res, next) {
    try {
      const { token } = req.params;
      const isValid = await passwordResetService.validateToken(token);
      return res.json({ success: true, valid: isValid });
    } catch (error) {
      next(error);
    }
  }
}

export { PasswordResetController };
